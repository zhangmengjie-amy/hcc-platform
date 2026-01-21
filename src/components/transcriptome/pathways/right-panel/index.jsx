"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  getCohortList,
  getDEGTaskIds,
  getDEGResultByTaskId,
} from "@/configs/request";
import VolcanoPlot from "@/components/transcriptome/pathways/right-panel/volcano-plot";
import {
  Flex,
  Spin,
  Tag,
  Typography,
  Dropdown,
  Space,
  Button,
  message,
  Alert,
  Collapse,
} from "antd";
import GoBubbleChart from "./go-bubble";
import GoBarChart from "./go-column";

const CLASSIFY_COLOR = {
  Tissue: "purple",
  Celllines: "green",
};

const LEVEL_COLOR = {
  Intra: "cyan",
  Inter: "blue",
  "Inter+Intra": "lime",
};

const TECHNOLOGY_COLOR = {
  "Micro array": "orange",
  Sequencing: "magenta",
};

const Pathways = ({ conditions }) => {
  const cohortListRef = useRef(null);
  const pollingRef = useRef(null); // 轮询定时器引用
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false); // 单独的状态用于刷新按钮
  const [taskList, setTaskList] = useState(null);
  const [cohortDataMap, setCohortDataMap] = useState({});
  const [selectedCohort, setSelectedCohort] = React.useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [detailErrors, setDetailErrors] = useState({}); // 存储每个 cohort 的详细错误信息
  const [pollingCount, setPollingCount] = useState(0); // 轮询次数计数器

  // 清理轮询定时器
  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // 启动轮询
  const startPolling = useCallback(() => {
    clearPolling(); // 先清理现有的轮询
    
    console.log("启动轮询，10秒后重试...");
    pollingRef.current = setInterval(async () => {
      try {
        const currentCount = pollingCount + 1;
        setPollingCount(currentCount);
        console.log(`第 ${currentCount} 次轮询尝试...`);
        await fetchCohortResults(true); // 静默刷新
      } catch (error) {
        console.error("轮询失败:", error);
        // 失败后继续等待下次轮询
      }
    }, 10000); // 10秒轮询一次
  }, [pollingCount]);

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      setDetailErrors({});

      const [cohortData, volcanoData] = await Promise.all([
        getCohortList(),
        getDEGTaskIds(conditions),
      ]);

      cohortListRef.current = cohortData;
      setTaskList(volcanoData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      const errorMsg = err?.message || "加载数据失败，请稍后重试";
      setFetchError(errorMsg);
      // 如果初始加载失败，启动轮询
      startPolling();
    } finally {
      setLoading(false);
    }
  };

  const fetchCohortResults = async (silent = false) => {
    // silent 参数用于区分是轮询调用还是手动调用
    if (!silent) {
      setRefreshing(true);
    }

    try {
      const errors = {};

      const cohortPromises = Object.entries(taskList).map(
        async ([cohortKey, taskId]) => {
          try {
            const result = await getDEGResultByTaskId(taskId);

            const cohortInfo = cohortListRef.current?.find(
              (cohort) => cohort.number === cohortKey,
            );

            // 检查 API 响应状态 - 使用接口返回的 message
            if (result?.code !== 200) {
              const errorMsg =
                result?.message || `Cohort ${cohortKey} 数据获取失败`;
              errors[cohortKey] = errorMsg;
              return {
                cohortKey,
                data: null,
                error: errorMsg,
              };
            }

            // 检查是否有有效数据
            const hasVolcanoData =
              result?.data[0]?.DEGResults && result.data[0].DEGResults.length > 0;
            const hasGoData =
              result?.data[0]?.["GORes"] && result.data[0]["GORes"].length > 0;

            if (!hasVolcanoData && !hasGoData) {
              const errorMsg =
                result?.message || `Cohort ${cohortKey} 暂无可用数据`;
              errors[cohortKey] = errorMsg;
            }

            return {
              cohortKey,
              data: {
                taskId,
                volcanoData: result?.data[0]?.DEGResults || [],
                goBubbleData: result?.data[0]?.["GORes"] || [],
                cohortInfo: cohortInfo || {
                  cohort: cohortKey.replace("cohort", ""),
                },
              },
              error: hasVolcanoData || hasGoData ? null : errors[cohortKey],
            };
          } catch (err) {
            console.error(`Failed to fetch data for ${cohortKey}:`, err);
            const errorMsg =
              err?.response?.data?.message ||
              err?.message ||
              `Cohort ${cohortKey} 请求失败`;
            errors[cohortKey] = errorMsg;
            return {
              cohortKey,
              data: null,
              error: errorMsg,
            };
          }
        },
      );

      const results = await Promise.all(cohortPromises);

      // 存储所有错误信息
      setDetailErrors(errors);

      // 转换为映射对象
      const newCohortDataMap = {};
      results.forEach(({ cohortKey, data, error }) => {
        if (data) {
          newCohortDataMap[cohortKey] = { ...data, error };
        }
      });

      setCohortDataMap(newCohortDataMap);

      // 设置默认选中的 cohort
      if (!selectedCohort && results.length > 0) {
        const firstAvailableCohort = results.find((r) => r.data)?.cohortKey;
        if (firstAvailableCohort) {
          setSelectedCohort(firstAvailableCohort);
        }
      }

      // 检查是否所有请求都失败了
      const successCount = results.filter((r) => r.data).length;
      const totalCount = results.length;

      if (successCount === 0 && totalCount > 0) {
        // 所有 cohort 都失败了
        const allErrorMessages = Object.values(errors).join("；");
        setFetchError(`所有 cohort 数据加载失败，正在自动重试...`);
        
        // 如果轮询未启动，启动轮询
        if (!pollingRef.current) {
          startPolling();
        }
      } else {
        // 至少有一个成功，清理错误状态
        setFetchError(null);
        
        // 如果有成功的数据，停止轮询
        if (successCount > 0) {
          clearPolling();
          setPollingCount(0); // 重置轮询计数器
          if (!silent) {
            message.success("数据已更新");
          }
        }
        
        // 部分失败，显示警告
        const errorCount = Object.keys(errors).length;
        if (errorCount > 0 && !silent) {
          message.warning(`${errorCount} 个 cohort 数据加载异常`);
        }
      }

      return { successCount, totalCount };
    } catch (err) {
      console.error("Failed to fetch cohort results:", err);
      const errorMsg = err?.message || "加载详细数据失败";
      setFetchError(errorMsg);
      
      // 如果轮询未启动，启动轮询
      if (!pollingRef.current) {
        startPolling();
      }
      
      throw err;
    } finally {
      if (!silent) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (!conditions) return;
    fetchAllData();
  }, [conditions]);

  useEffect(() => {
    if (!taskList || !cohortListRef.current) return;
    fetchCohortResults();
  }, [taskList]);

  // 处理 dropdown 切换
  const handleCohortChange = (key) => {
    setSelectedCohort(key);
  };

  // 获取最新状态按钮点击处理
  const handleRefresh = useCallback(async () => {
    if (!taskList) return;
    try {
      await fetchCohortResults();
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  }, [taskList]);

  // 获取当前选中的 cohort 数据
  const currentCohortData = selectedCohort
    ? cohortDataMap[selectedCohort]
    : null;

  // 构建 dropdown 的 items
  const dropdownItems = Object.keys(taskList || {}).map((cohortKey) => {
    const hasError = detailErrors[cohortKey];
    const hasData = cohortDataMap[cohortKey];
    const cohortNumber = cohortKey.replace("cohort", "");

    return {
      key: cohortKey,
      label: (
        <Space direction="vertical" size={0} style={{ width: "100%" }}>
          <span>Cohort {cohortNumber}</span>
          {hasError && !hasData && (
            <Typography.Text type="danger" style={{ fontSize: "12px" }}>
              {detailErrors[cohortKey]}
            </Typography.Text>
          )}
          {hasError && hasData && (
            <Typography.Text type="warning" style={{ fontSize: "12px" }}>
              {detailErrors[cohortKey]}
            </Typography.Text>
          )}
        </Space>
      ),
      disabled: !cohortDataMap[cohortKey] && !detailErrors[cohortKey],
    };
  });

  // 渲染错误详情面板
  const renderErrorDetails = () => {
    const errorCohorts = Object.entries(detailErrors).filter(
      ([_, error]) => error,
    );

    if (errorCohorts.length === 0) return null;

    return (
      <Collapse
        size="small"
        style={{ marginTop: 10, marginBottom: 20 }}
        items={[
          {
            key: "error-details",
            label: `查看详细错误信息 (${errorCohorts.length} 个 cohort 异常)`,
            children: (
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {errorCohorts.map(([cohortKey, errorMsg]) => (
                  <div key={cohortKey} style={{ marginBottom: 8 }}>
                    <Typography.Text strong>
                      {cohortKey}：
                    </Typography.Text>
                    <Typography.Text type="danger">{errorMsg}</Typography.Text>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />
    );
  };

  // 渲染主要错误提示
  const renderErrorAlert = () => {
    if (fetchError) {
      return (
        <>
          <Alert
            message="数据加载失败"
            description={
              <div>
                <div style={{ marginBottom: 8 }}>{fetchError}</div>
                <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
                  {pollingCount > 0 && `已尝试 ${pollingCount} 次，10秒后自动重试...`}
                </div>
                {/* 在"所有 cohort 数据加载失败"下方显示详细错误信息 */}
                {fetchError.includes("所有 cohort 数据加载失败") && (
                  <div style={{ marginTop: 16 }}>
                    <Typography.Text strong>详细错误信息：</Typography.Text>
                    <div
                      style={{
                        marginTop: 8,
                        padding: 12,
                        backgroundColor: "#fff2f0",
                        borderRadius: 6,
                      }}
                    >
                      {Object.entries(detailErrors).map(
                        ([cohortKey, errorMsg]) => (
                          <div key={cohortKey} style={{ marginBottom: 8 }}>
                            <Typography.Text strong>
                              {cohortKey}：
                            </Typography.Text>
                            <Typography.Text type="danger">
                              {errorMsg}
                            </Typography.Text>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
            action={
              <Space>
                <Button 
                  size="small" 
                  type="primary" 
                  onClick={handleRefresh}
                  loading={refreshing}
                >
                  立即重试
                </Button>
              </Space>
            }
          />
          {/* 对于非全部失败的情况，显示折叠面板 */}
          {!fetchError.includes("所有 cohort 数据加载失败") &&
            renderErrorDetails()}
        </>
      );
    }

    // 显示当前 cohort 的错误
    if (currentCohortData?.error) {
      return (
        <Alert
          message="当前 Cohort 数据异常"
          description={currentCohortData.error}
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
      );
    }

    // 如果没有整体错误但有部分错误，显示警告
    const hasPartialErrors = Object.keys(detailErrors).length > 0;
    if (hasPartialErrors && !fetchError) {
      return (
        <>
          <Alert
            message="部分数据加载异常"
            description={`${
              Object.keys(detailErrors).length
            } 个 cohort 数据加载失败`}
            type="warning"
            showIcon
            style={{ marginBottom: 20 }}
          />
          {renderErrorDetails()}
        </>
      );
    }

    return null;
  };

  // 检查是否有任何可用的数据
  const hasAnyData = Object.keys(cohortDataMap).length > 0;

  // 如果正在加载且没有任何数据，显示加载状态
  if (loading && !hasAnyData) {
    return (
      <Flex align="center" justify="center" style={{ height: "500px" }}>
        <Spin size="large" tip="加载中..." />
      </Flex>
    );
  }

  // 如果有整体错误，就不显示"暂无数据"的警告
  const shouldShowNoDataAlert = !fetchError && !hasAnyData;

  return (
    <div style={{ padding: 20 }}>
      {/* 错误提示 */}
      {renderErrorAlert()}

      {hasAnyData ? (
        <Flex vertical style={{ marginBottom: "20px" }}>
          <Flex
            style={{ marginBottom: "20px", justifyContent: "space-between" }}
          >
            <Space>
              {currentCohortData?.cohortInfo?.number ? (
                <>
                  <Typography.Title
                    level={5}
                    style={{ marginBottom: 0, marginRight: "20px" }}
                  >
                    {currentCohortData.cohortInfo.number}
                  </Typography.Title>
                  {currentCohortData.cohortInfo.level && (
                    <Tag
                      color={LEVEL_COLOR[currentCohortData.cohortInfo.level]}
                    >
                      {currentCohortData.cohortInfo.level}
                    </Tag>
                  )}
                  {currentCohortData.cohortInfo.classify && (
                    <Tag
                      color={
                        CLASSIFY_COLOR[currentCohortData.cohortInfo.classify]
                      }
                    >
                      {currentCohortData.cohortInfo.classify}
                    </Tag>
                  )}
                  {currentCohortData.cohortInfo.techonology && (
                    <Tag
                      color={
                        TECHNOLOGY_COLOR[
                          currentCohortData.cohortInfo.techonology
                        ]
                      }
                    >
                      {currentCohortData.cohortInfo.techonology}
                    </Tag>
                  )}
                </>
              ) : (
                <Typography.Text type="warning">
                  Cohort 信息加载中...
                </Typography.Text>
              )}
            </Space>

            <Dropdown
              menu={{
                items: dropdownItems,
                selectable: true,
                onClick: (e) => handleCohortChange(e.key),
                selectedKeys: selectedCohort ? [selectedCohort] : [],
              }}
            >
              <Button type="primary">
                <Space>
                  切换 Cohort
                  <Typography.Text style={{ color: "white" }}>
                    {selectedCohort
                      ? selectedCohort.replace("cohort", "Cohort ")
                      : "选择"}
                  </Typography.Text>
                </Space>
              </Button>
            </Dropdown>
          </Flex>

          {/* 图表区域 */}
          {currentCohortData ? (
            <>
              <Flex
                flex="1"
                style={{
                  border: "1px solid #f5f5f5",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "15px",
                  borderRadius: "12px",
                  minHeight: "400px",
                }}
              >
                {currentCohortData.volcanoData?.length > 0 ? (
                  <VolcanoPlot data={currentCohortData.volcanoData} />
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Typography.Text type="secondary">
                      暂无火山图数据
                    </Typography.Text>
                  </Flex>
                )}
              </Flex>

              <Flex
                flex="1"
                style={{
                  border: "1px solid #f5f5f5",
                  marginTop: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "15px",
                  borderRadius: "12px",
                  minHeight: "400px",
                }}
              >
                {currentCohortData.goBubbleData?.length > 0 ? (
                  <GoBarChart data={currentCohortData.goBubbleData} />
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Typography.Text type="secondary">
                      暂无GO分析数据
                    </Typography.Text>
                  </Flex>
                )}
              </Flex>
            </>
          ) : (
            <Flex align="center" justify="center" style={{ height: "500px" }}>
              <Typography.Text type="warning">
                请选择一个可用的 cohort
              </Typography.Text>
            </Flex>
          )}
        </Flex>
      ) : shouldShowNoDataAlert ? (
        <Alert
          message="暂无数据"
          description="请检查筛选条件或稍后重试"
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />
      ) : null}
    </div>
  );
};

export default Pathways;