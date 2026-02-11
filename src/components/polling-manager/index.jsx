import React, { useState, useEffect, useRef, useCallback } from "react";
import { Flex, Progress, Alert, List, Tag } from "antd";
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { t } from "i18next";

const POLLING_INTERVAL = 3000;
const MAX_POLLING_TIME = 300000; // 5分钟

const PollingManager = ({ pollingData, onComplete, apiMethod }) => {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({
    total: 0,
    success: 0,
    failed: 0,
    running: 0,
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const pollingRef = useRef(null);
  const isPollingRef = useRef(false);
  
  // 新增：用于标识当前是否在初始化
  const isInitializingRef = useRef(false);

  // 使用 useRef 存储 tasks 的最新值
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // 初始化任务 - 关键修改：完全清理旧任务
  useEffect(() => {
    if (!pollingData?.taskIds) return;

    const taskIds = pollingData.taskIds;
    const cohortInfo = pollingData.cohortInfo || {};

    if (typeof taskIds !== "object" || taskIds === null) return;

    const taskEntries = Object.entries(taskIds);
    if (taskEntries.length === 0) return;

    // 停止所有现有的轮询
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    isPollingRef.current = false;
    
    // 设置初始化标志
    isInitializingRef.current = true;

    const newTasks = taskEntries.map(([cohortId, taskId]) => ({
      taskId: String(taskId),
      cohortId,
      cohortName: cohortInfo[cohortId]?.name || `Cohort ${cohortId}`,
      status: "running",
      result: null,
      message: `${t("common:startPolling")}...`,
      startTime: Date.now(),
      lastCheckTime: Date.now(),
    }));

    setTasks(newTasks);
    updateStatus(newTasks);
    setIsExpanded(true);
    
    // 等待一小段时间确保状态更新完成
    setTimeout(() => {
      isInitializingRef.current = false;
      startPolling();
    }, 10);

    // 清理函数：只清理定时器，不重置状态
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [pollingData]); // 只依赖 pollingData

  // 检查是否有正在运行的任务
  const hasRunningTasks = useCallback((taskList) => {
    return taskList.some((task) => task.status === "running");
  }, []);

  // 更新统计
  const updateStatus = useCallback((taskList) => {
    const status = {
      total: taskList.length,
      success: taskList.filter((t) => t.status === "success").length,
      failed: taskList.filter((t) => t.status === "failed").length,
      running: taskList.filter((t) => t.status === "running").length,
    };
    setStatus(status);
    return status;
  }, []);

  // 检查是否完成
  const checkAllCompleted = useCallback((taskList) => {
    return taskList.every((task) => task.status !== "running");
  }, []);

  // 轮询单个任务
  const pollSingleTask = useCallback(async (task) => {
    try {
      const response = await apiMethod(task.taskId);

      const updatedTask = {
        ...task,
        lastCheckTime: Date.now(),
      };

      if (response.code === 202) {
        updatedTask.status = "running";
        updatedTask.message = t("common:taskInProgress");
      } else if (response.code === 200) {
        updatedTask.status = "success";
        updatedTask.result = response.data;
        updatedTask.message = t("common:taskCompleted");
      } else {
        updatedTask.status = "failed";
        updatedTask.message = response.message || t("common:taskFailed");
      }

      return updatedTask;
    } catch (error) {
      return {
        ...task,
        lastCheckTime: Date.now(),
        status: "failed",
        message: "请求失败",
      };
    }
  }, [apiMethod, t]);

  // 批量轮询
  const pollTasks = useCallback(async () => {
    if (!isPollingRef.current) return;

    const currentTasks = [...tasksRef.current];
    if (currentTasks.length === 0) {
      stopPolling();
      return;
    }

    const runningTasks = currentTasks.filter((t) => t.status === "running");
    if (runningTasks.length === 0) {
      stopPolling();
      const allCompleted = checkAllCompleted(currentTasks);
      if (allCompleted) {
        const finalResults = currentTasks
          .filter((t) => t.status === "success")
          .map((t) => ({
            cohortId: t.cohortId,
            cohortName: t.cohortName,
            result: t.result,
            taskId: t.taskId,
          }));
        setIsExpanded(false);
        onComplete?.(finalResults);
      }
      return;
    }

    // 检查超时
    const now = Date.now();
    const timeoutTasks = runningTasks.filter(
      (t) => now - t.startTime > MAX_POLLING_TIME,
    );

    const updatedTasks = currentTasks.map((task) => {
      if (timeoutTasks.some((t) => t.taskId === task.taskId)) {
        return {
          ...task,
          status: "failed",
          message: t("common:taskTimeout"),
          lastCheckTime: now,
        };
      }
      return task;
    });

    const activeTasks = updatedTasks.filter((t) => t.status === "running");
    if (activeTasks.length === 0) {
      setTasks(updatedTasks);
      updateStatus(updatedTasks);
      return;
    }

    try {
      const pollingPromises = activeTasks.map((task) => pollSingleTask(task));
      const results = await Promise.allSettled(pollingPromises);

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const updatedTask = result.value;
          const taskIndex = updatedTasks.findIndex(
            (t) => t.taskId === activeTasks[index].taskId,
          );
          if (taskIndex !== -1) {
            updatedTasks[taskIndex] = updatedTask;
          }
        } else {
          const taskIndex = updatedTasks.findIndex(
            (t) => t.taskId === activeTasks[index].taskId,
          );
          if (taskIndex !== -1) {
            updatedTasks[taskIndex] = {
              ...activeTasks[index],
              status: "failed",
              message: "轮询异常",
              lastCheckTime: now,
            };
          }
        }
      });

      setTasks(updatedTasks);
      const newStatus = updateStatus(updatedTasks);

      if (checkAllCompleted(updatedTasks)) {
        stopPolling();
        const finalResults = updatedTasks
          .filter((t) => t.status === "success")
          .map((t) => ({
            cohortId: t.cohortId,
            cohortName: t.cohortName,
            result: t.result,
            taskId: t.taskId,
          }));
        setIsExpanded(false);
        onComplete?.(finalResults);
      }
    } catch (error) {
      // 静默处理错误
    }
  }, [pollSingleTask, updateStatus, checkAllCompleted, onComplete, t]);

  // 开始轮询
  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;

    isPollingRef.current = true;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    pollingRef.current = setInterval(() => {
      pollTasks();
    }, POLLING_INTERVAL);

    // 立即执行第一次轮询
    setTimeout(() => {
      pollTasks();
    }, 100);
  }, [pollTasks]);

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  // 处理点击展开/收起
  const handleToggleExpand = () => {
    const currentTasks = tasksRef.current;
    const hasRunning = hasRunningTasks(currentTasks);
    
    if (hasRunning) {
      setIsExpanded(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // 渲染状态图标
  const renderStatusIcon = (status) => {
    const icons = {
      running: <SyncOutlined spin style={{ color: "#1890ff" }} />,
      success: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      failed: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    };
    return icons[status] || null;
  };

  // 检查当前是否有正在运行的任务
  const hasRunning = hasRunningTasks(tasks);
  const allCompleted = checkAllCompleted(tasks);

  // 如果没有轮询数据
  if (!pollingData) {
    return null;
  }

  // 修改：只有在初始化且没有任务时才显示初始化消息
  const shouldShowInitializing = tasks.length === 0 && isInitializingRef.current;

  return (
    <div
      style={{
        background: "#fafafa",
        borderRadius: 8,
        marginTop: 10,
        overflow: "hidden",
        border: "1px solid #d9d9d9",
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: isExpanded ? "1px solid #d9d9d9" : "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: hasRunning ? "default" : "pointer",
          backgroundColor: "#fff",
          userSelect: "none",
        }}
        onClick={handleToggleExpand}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UpOutlined
            style={{
              color: "#666",
              transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.3s ease",
              opacity: hasRunning ? 0.5 : 1,
            }}
          />
          <span style={{ fontWeight: 500 }}>
            {t("common:taskStatus:title")}
            {allCompleted && status.failed === 0 && `(${t("common:taskStatus:success")})`}
            {allCompleted && status.failed > 0 && `(${t("common:taskStatus:someFailed")})`}
            {hasRunning && `${t("common:taskStatus:running")}`}
          </span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <Flex align="center">
            <span
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginRight: "5px",
                color: "#1890ff",
              }}
            >
              {status.total}
            </span>
            <span style={{ fontSize: 14, color: "#666" }}>{t("common:total")}</span>
          </Flex>
          <Flex align="center">
            <span
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginRight: "5px",
                color: "#52c41a",
              }}
            >
              {status.success}
            </span>
            <span style={{ fontSize: 14, color: "#666" }}>{t("common:taskStatus:success")}</span>
          </Flex>
          <Flex align="center">
            <span
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginRight: "5px",
                color: "#ff4d4f",
              }}
            >
              {status.failed}
            </span>
            <span style={{ fontSize: 14, color: "#666" }}>{t("common:taskStatus:failed")}</span>
          </Flex>
          <Flex align="center">
            <span
              style={{
                fontSize: 16,
                fontWeight: "bold",
                marginRight: "5px",
                color: "#faad14",
              }}
            >
              {status.running}
            </span>
            <span style={{ fontSize: 14, color: "#666" }}>{t("common:taskStatus:running")}</span>
          </Flex>
        </div>
      </div>

      {/* 展开的内容 */}
      <div
        style={{
          maxHeight: (isExpanded || hasRunning) ? "500px" : "0",
          overflow: "hidden",
          transition: "max-height 0.3s ease-in-out",
        }}
      >
        <div style={{ padding: "10px 16px" }}>
          <Progress
            percent={
              status.total > 0
                ? Math.round(
                  ((status.success + status.failed) / status.total) * 100,
                )
                : 0
            }
            success={{
              percent:
                status.total > 0
                  ? Math.round((status.success / status.total) * 100)
                  : 0,
            }}
            status={status.running > 0 ? "active" : "normal"}
          />

          {shouldShowInitializing ? (
            <Alert
              message={t("common:initializingTask")}
              type="info"
              showIcon
              description={t("common:pleaseWaitForTaskDataLoading")}
            />
          ) : (
            <List
              size="small"
              dataSource={tasks}
              renderItem={(task) => (
                <List.Item>
                  <div style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        {renderStatusIcon(task.status)}
                        <span
                          style={{
                            marginLeft: 8,
                            marginRight: 8,
                            fontWeight: 500,
                          }}
                        >
                          {task.cohortName}
                        </span>
                        <Tag
                          color={
                            task.status === "success"
                              ? "success"
                              : task.status === "failed"
                                ? "error"
                                : "processing"
                          }
                        >
                          { task.status === "running"
                            ? t("common:taskStatus:running")
                            : task.status === "success"
                              ? t("common:taskStatus:success")
                              : t("common:taskStatus:failed") }
                        </Tag>
                      </div>
                    </div>
                    {task.message && (
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: task.status === "failed" ? "#ff4d4f" : "#666",
                          marginLeft: 24,
                        }}
                      >
                        {task.message}
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PollingManager;