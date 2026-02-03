"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Select, Alert, Empty, Tag, Flex } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const SurvivalAnalysisContent = ({ pollingResults }) => {
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
          };

          // 根据 code 判断成功/失败 - 使用 code == 200 判断
          const isSuccess = item.code === 200 || item.code === "200";
          // 如果有xmlContent也认为是成功的
          const hasContent = item.xmlContent;

          if (isSuccess || hasContent) {
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
          cohortName: cohortResult.cohortName || `${cohortResult.cohortId}`,
          taskId: cohortResult.taskId,
          xmlContent: null,
          code: cohortResult.code || 500,
          message: cohortResult.message || "任务无返回结果",
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
      const firstCohortId = successItems[0].cohortId;
      setSelectedCohort(firstCohortId);
    } else if (allItems.length > 0) {
      // 如果没有成功的，选择第一个cohort
      const firstCohortId = allItems[0].cohortId;
      setSelectedCohort(firstCohortId);
    }
  }, [successItems, allItems]);

  // 获取唯一的cohort列表
  const uniqueCohorts = useMemo(() => {
    const cohortMap = new Map();

    allItems.forEach((item) => {
      if (!cohortMap.has(item.cohortId)) {
        const hasSuccess = successItems.some(
          (successItem) => successItem.cohortId === item.cohortId,
        );
        const hasFailed = failedItems.some(
          (failedItem) => failedItem.cohortId === item.cohortId,
        );

        cohortMap.set(item.cohortId, {
          cohortId: item.cohortId,
          cohortName: item.cohortName,
          message: item.message,
          code: item.code,
          hasSuccess: hasSuccess,
          hasFailed: hasFailed,
        });
      }
    });

    return Array.from(cohortMap.values());
  }, [allItems, successItems, failedItems]);

  // 构建Select选项
  const selectOptions = useMemo(() => {
    return uniqueCohorts.map((cohort) => {
      const hasSuccess = cohort.hasSuccess;
      const errorMessage = cohort.message;

      return {
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
              {hasSuccess ? (
                <CheckCircleOutlined
                  style={{ color: "#52c41a", fontSize: 14 }}
                />
              ) : (
                <CloseCircleOutlined
                  style={{ color: "#ff4d4f", fontSize: 14 }}
                />
              )}
              <span>{cohort.cohortName}</span>
            </div>
            <Tag
              color={hasSuccess ? "success" : "error"}
              style={{ fontSize: 11 }}
            >
              {hasSuccess ? "成功" : "失败"}
            </Tag>
          </div>
        ),
        disabled: !cohort.hasSuccess,
      };
    });
  }, [uniqueCohorts]);

  // 获取当前选中的cohort数据
  const currentCohortData = useMemo(() => {
    if (!selectedCohort) return null;

    const cohortInfo = uniqueCohorts.find((c) => c.cohortId === selectedCohort);
    const successItemsForCohort = successItems.filter(
      (item) => item.cohortId === selectedCohort,
    );

    if (successItemsForCohort.length === 0) {
      // 如果没有成功的项目，尝试获取该cohort的所有项目
      const allItemsForCohort = allItems.filter(
        (item) => item.cohortId === selectedCohort,
      );
      if (allItemsForCohort.length > 0) {
        // 合并数据
        const allXmlContent = [];

        allItemsForCohort.forEach((item) => {
          if (item.xmlContent) {
            allXmlContent.push(item.xmlContent);
          }
        });

        return {
          cohortName: cohortInfo?.cohortName,
          xmlContentList: allXmlContent,
          error:
            allXmlContent.length === 0
              ? cohortInfo?.message || "该 cohort 暂无可用数据"
              : null,
        };
      }

      return {
        cohortName: cohortInfo?.cohortName,
        xmlContentList: [],
        error: cohortInfo?.message || "该 cohort 暂无可用数据",
      };
    }

    // 合并该cohort的所有成功数据
    const allXmlContent = [];

    successItemsForCohort.forEach((item) => {
      if (item.xmlContent) {
        allXmlContent.push(item.xmlContent);
      }
    });

    return {
      cohortName: cohortInfo?.cohortName,
      xmlContentList: allXmlContent,
      error:
        allXmlContent.length === 0
          ? cohortInfo?.message || "该 cohort 暂无可用数据"
          : null,
    };
  }, [selectedCohort, successItems, allItems, uniqueCohorts]);

  // 获取当前选中的cohort的成功items
  const selectedCohortSuccessItems = useMemo(() => {
    if (!selectedCohort) return [];
    return successItems.filter((item) => item.cohortId === selectedCohort);
  }, [selectedCohort, successItems]);

  // 检查是否有任何可用的数据
  const hasAnyData = useMemo(() => {
    if (successItems.length > 0) return true;

    // 检查是否至少有一个cohort有数据
    for (const cohort of uniqueCohorts) {
      const itemsForCohort = allItems.filter(
        (item) => item.cohortId === cohort.cohortId,
      );
      for (const item of itemsForCohort) {
        if (item.xmlContent) {
          return true;
        }
      }
    }
    return false;
  }, [successItems, allItems, uniqueCohorts]);

  // 渲染主要内容
  const renderContent = () => {
    if (!currentCohortData) {
      return (
        <Empty
          description="请选择一个cohort查看结果"
          style={{ marginTop: 60 }}
        />
      );
    }

    // 显示当前cohort的错误信息
    if (currentCohortData.error) {
      return (
        <Alert
          message="当前 Cohort 数据异常"
          description={currentCohortData.error}
          type="warning"
          showIcon
          style={{ margin: "40px auto", maxWidth: 600, padding: "20px" }}
        />
      );
    }

    // 渲染XML内容
    if (currentCohortData.xmlContentList.length === 0) {
      return (
        <Alert
          message={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CloseCircleOutlined style={{ color: "#faad14" }} />
              <span>
                {currentCohortData.cohortName || `${selectedCohort}`}{" "}
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

    // 渲染所有XML内容
    return (
      <div style={{ marginTop: 20 }}>
        {currentCohortData.xmlContentList.map((xmlContent, index) => (
          <div key={index} style={{ marginBottom: 24 }}>
            {xmlContent ? (
              <div
                style={{
                  textAlign: "center",
                  maxWidth: "100%",
                  overflow: "auto",
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                  minHeight: "400px",
                }}
                dangerouslySetInnerHTML={{ __html: xmlContent }}
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
    return (
      <Empty
        description="暂无任务结果"
        style={{ marginTop: 100 }}
        styles={{ iamge: { height: 80 } }}
      />
    );
  }

  // 如果没有数据
  if (!hasAnyData) {
    return (
      <Alert
        message="暂无数据"
        description="请检查筛选条件或稍后重试"
        type="warning"
        showIcon
        style={{ margin: 20 }}
      />
    );
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
          {/* 如果有taskType，显示taskType */}
          {selectedCohortSuccessItems[0]?.taskType && (
            <div style={{ fontWeight: 500, fontSize: 16 }}>
              Type: {selectedCohortSuccessItems[0].taskType}
            </div>
          )}

          {/* Select下拉框 */}
          <Select
            style={{ width: "100%", maxWidth: 500, marginLeft: "auto" }}
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

export default SurvivalAnalysisContent;
