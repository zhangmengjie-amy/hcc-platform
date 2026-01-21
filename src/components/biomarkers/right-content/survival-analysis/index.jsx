"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Select, Alert, Empty, Tag, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const Biomarkers1 = ({ pollingResults }) => {
  const [selectedCohort, setSelectedCohort] = useState(null);

  // 处理轮询结果，展开 result 数组并处理状态
  const { successItems, failedItems, allItems } = useMemo(() => {
    if (!pollingResults || !Array.isArray(pollingResults)) {
      return { successItems: [], failedItems: [], allItems: [] };
    }

    const success = [];
    const failed = [];
    const all = [];

    pollingResults.forEach((cohortResult) => {
      // 检查 cohortResult.result 是否存在且是数组
      if (cohortResult.result && Array.isArray(cohortResult.result)) {
        cohortResult.result.forEach((item) => {
          const itemWithCohortInfo = {
            ...item,
            cohortId: cohortResult.cohortId,
            cohortName:
              cohortResult.cohortName ||
              item.cohortName ||
              `${cohortResult.cohortId}`,
            taskId: cohortResult.taskId,
            // 确保 xmlContent 存在
            xmlContent: item.xmlContent || null,
            // 确保 status 是字符串且统一处理
            status: item.status ? item.status.toLowerCase() : "unknown",
          };

          // 根据 status 判断成功/失败
          if (
            item.status === "SUCCESS" ||
            item.status === "success" ||
            item.xmlContent
          ) {
            success.push(itemWithCohortInfo);
          } else {
            failed.push(itemWithCohortInfo);
          }

          all.push(itemWithCohortInfo);
        });
      } else {
        // 如果没有 result 数组，直接使用 cohortResult
        const item = {
          cohortId: cohortResult.cohortId,
          cohortName:
            cohortResult.cohortName || `${cohortResult.cohortId}`,
          taskId: cohortResult.taskId,
          xmlContent: null,
          status: "failed",
          errorMessage: "任务无返回结果",
        };
        failed.push(item);
        all.push(item);
      }
    });

    return { successItems: success, failedItems: failed, allItems: all };
  }, [pollingResults]);

  // 首次自动选择第一个成功的cohort
  useEffect(() => {
    if (successItems.length > 0) {
      // 根据 cohortId 分组，选择第一个cohort
      const firstCohortId = successItems[0].cohortId;
      setSelectedCohort(firstCohortId);
    }
  }, [successItems]);


  // 获取唯一的cohort列表（基于 cohortId）
  const uniqueCohorts = useMemo(() => {
    const cohortMap = new Map();

    allItems.forEach((item) => {
      if (!cohortMap.has(item.cohortId)) {
        cohortMap.set(item.cohortId, {
          cohortId: item.cohortId,
          cohortName: item.cohortName,
          status: item.status,
          errorMessage: item.errorMessage,
          hasSuccess: successItems.some(
            (successItem) => successItem.cohortId === item.cohortId,
          ),
          hasFailed: failedItems.some(
            (failedItem) => failedItem.cohortId === item.cohortId,
          ),
        });
      }
    });

    return Array.from(cohortMap.values());
  }, [allItems, successItems, failedItems]);

  // 构建下拉框选项
  const selectOptions = useMemo(() => {
    const options = [];

    uniqueCohorts.forEach((cohort) => {
      if (cohort.hasSuccess) {
        // 成功的cohort
        options.push({
          value: cohort.cohortId,
          label: (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: 14 }}
                />
                <span>{cohort.cohortName}</span>
              </div>
              <Tag color="success" style={{ fontSize: 11 }}>
                成功
              </Tag>
            </div>
          ),
          disabled: false,
        });
      }
    });

    return options;
  }, [uniqueCohorts, failedItems]);

  // 获取当前选中的cohort的所有items
  const selectedCohortItems = useMemo(() => {
    if (!selectedCohort) return [];
    return allItems.filter((item) => item.cohortId === selectedCohort);
  }, [selectedCohort, allItems]);

  // 获取当前选中的cohort的成功items（用于显示）
  const selectedCohortSuccessItems = useMemo(() => {
    if (!selectedCohort) return [];
    return selectedCohortItems.filter(
      (item) =>
        item.status === "SUCCESS" ||
        item.status === "success" ||
        item.xmlContent,
    );
  }, [selectedCohortItems]);

  // 渲染选中的内容
  const renderContent = () => {
    if (!selectedCohort) {
      return (
        <Empty
          description="请选择一个cohort查看结果"
          style={{ marginTop: 60 }}
        />
      );
    }

    // 检查选中的cohort是否有成功的结果
    const selectedCohortInfo = uniqueCohorts.find(
      (c) => c.cohortId === selectedCohort,
    );
    if (!selectedCohortInfo?.hasSuccess) {
      // 失败的cohort
      const failedItem = failedItems.find(
        (item) => item.cohortId === selectedCohort,
      );
      const errorMessage =
        failedItem?.errorMessage ||
        selectedCohortInfo?.errorMessage ||
        "任务执行失败";

      return (
        <Alert
          message={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              <span>
                {selectedCohortInfo?.cohortName || `${selectedCohort}`}{" "}
                任务执行失败
              </span>
            </div>
          }
          description={errorMessage}
          type="error"
          showIcon={false}
          style={{
            margin: "40px auto",
            maxWidth: 600,
            padding: "20px",
          }}
        />
      );
    }

    // 成功的cohort，显示所有成功的结果
    if (selectedCohortSuccessItems.length === 0) {
      return (
        <Alert
          message={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CloseCircleOutlined style={{ color: "#faad14" }} />
              <span>
                {selectedCohortInfo?.cohortName || `${selectedCohort}`}{" "}
                暂无可用数据
              </span>
            </div>
          }
          description="该cohort没有返回有效数据"
          type="warning"
          showIcon={false}
          style={{
            margin: "40px auto",
            maxWidth: 600,
            padding: "20px",
          }}
        />
      );
    }

    // 渲染成功的结果
    return (
      <div style={{ marginTop: 20 }}>

        {/* 显示所有成功的结果 */}
        {selectedCohortSuccessItems.map((item, index) => (
          <div key={index} style={{ marginBottom: 24 }}>
            {item.xmlContent ? (
              <div
                style={{
                  textAlign: "center",
                  maxWidth: "100%",
                  overflow: "auto",
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                  minHeight: "400px",
                }}
                dangerouslySetInnerHTML={{ __html: item.xmlContent }}
              />
            ) : (
              <Alert
                message="XML内容为空"
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // 如果没有任务结果
  if (!pollingResults || pollingResults.length === 0) {
    return <Empty description="暂无任务结果" style={{ marginTop: 100 }} />;
  }

  return (
    <div style={{ paddingTop: 20 }}>
      {/* 下拉选择器 */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {selectedCohortSuccessItems[0]?.taskType && (
            <div style={{ fontWeight: 500, fontSize: 16 }}>
              Type: {selectedCohortSuccessItems[0].taskType}
            </div>
          )}

          <Select
            style={{ width: "100%", maxWidth: 500 }}
            placeholder="请选择cohort"
            value={selectedCohort}
            onChange={setSelectedCohort}
            options={selectOptions}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          />
        </div>
      </div>

      {/* 显示选中的内容 */}
      {renderContent()}
    </div>
  );
};

export default Biomarkers1;
