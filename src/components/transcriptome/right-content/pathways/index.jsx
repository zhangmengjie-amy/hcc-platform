"use client";
import React, { useState, useEffect, useMemo } from "react";
import VolcanoPlot from "@/components/transcriptome/right-content/pathways/volcano-plot";
import {
  Flex,
  Spin,
  Tag,
  Typography,
  Select,
  Alert,
  Empty,
  Button,
} from "antd";
import GoBarChart from "@/components/transcriptome/right-content/pathways/go-column";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

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

const Pathways = ({ pollingResults, cohortList = [] }) => {
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
            cohortName: cohortResult.cohortName || item.cohortName || `${cohortResult.cohortId}`,
            taskId: cohortResult.taskId,
          };

          // 根据数据内容判断成功/失败
          const hasVolcanoData = item.DEGResults && Array.isArray(item.DEGResults) && item.DEGResults.length > 0;
          const hasGoData = item.GORes && Array.isArray(item.GORes) && item.GORes.length > 0;
          const hasData = hasVolcanoData || hasGoData;
          
          // 如果有数据，或者 code 为 200，都认为是成功的
          if (hasData || item.code === 200 || item.code === "200") {
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
          DEGResults: [],
          GORes: [],
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
        
        // 从cohortList中查找对应的cohort信息
        const cohortInfo = cohortList.find(cohort => 
          cohort.number === item.cohortId || 
          cohort.cohort === item.cohortId,
        );
        
        cohortMap.set(item.cohortId, {
          cohortId: item.cohortId,
          cohortName: item.cohortName,
          message: item.message,
          code: item.code,
          hasSuccess: hasSuccess,
          hasFailed: hasFailed,
          cohortInfo: cohortInfo || {
            number: item.cohortName,
            level: item.level || (cohortInfo?.level),
            classify: item.classify || (cohortInfo?.classify),
            // 注意：这里使用techonology，因为您的数据中是techonology
            technology: item.technology || (cohortInfo?.techonology),
          },
        });
      }
    });

    return Array.from(cohortMap.values());
  }, [allItems, successItems, failedItems, cohortList]);

  // 构建Select选项
  const selectOptions = useMemo(() => {
    return uniqueCohorts.map((cohort) => {
      const hasSuccess = cohort.hasSuccess;

      return {
        value: cohort.cohortId,
        label: (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {hasSuccess ? (
                <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 14 }} />
              ) : (
                <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 14 }} />
              )}
              <span>{cohort.cohortName}</span>
            </div>
            <Tag color={hasSuccess ? "success" : "error"} style={{ fontSize: 11 }}>
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
    
    const cohortInfo = uniqueCohorts.find(c => c.cohortId === selectedCohort);
    const successItemsForCohort = successItems.filter(item => item.cohortId === selectedCohort);
    
    // 从cohortList中查找详细的cohort信息
    const detailedCohortInfo = cohortList.find(cohort => 
      cohort.number === selectedCohort || 
      cohort.cohort === selectedCohort,
    );
    
    if (successItemsForCohort.length === 0) {
      // 如果没有成功的项目，尝试获取该cohort的所有项目
      const allItemsForCohort = allItems.filter(item => item.cohortId === selectedCohort);
      if (allItemsForCohort.length > 0) {
        // 合并数据
        let allVolcanoData = [];
        let allGoData = [];
        
        allItemsForCohort.forEach(item => {
          if (item.DEGResults && Array.isArray(item.DEGResults)) {
            allVolcanoData = [...allVolcanoData, ...item.DEGResults];
          }
          if (item.GORes && Array.isArray(item.GORes)) {
            allGoData = [...allGoData, ...item.GORes];
          }
        });

        return {
          cohortInfo: detailedCohortInfo || cohortInfo?.cohortInfo || { number: cohortInfo?.cohortName },
          volcanoData: allVolcanoData,
          goBubbleData: allGoData,
          error: allVolcanoData.length === 0 && allGoData.length === 0 ? 
            (cohortInfo?.message || "该 cohort 暂无可用数据") : null,
        };
      }
      
      return {
        cohortInfo: detailedCohortInfo || cohortInfo?.cohortInfo || { number: cohortInfo?.cohortName },
        volcanoData: [],
        goBubbleData: [],
        error: cohortInfo?.message || "该 cohort 暂无可用数据",
      };
    }

    // 合并该cohort的所有成功数据
    let allVolcanoData = [];
    let allGoData = [];
    
    successItemsForCohort.forEach(item => {
      if (item.DEGResults && Array.isArray(item.DEGResults)) {
        allVolcanoData = [...allVolcanoData, ...item.DEGResults];
      }
      if (item.GORes && Array.isArray(item.GORes)) {
        allGoData = [...allGoData, ...item.GORes];
      }
    });

    return {
      cohortInfo: detailedCohortInfo || cohortInfo?.cohortInfo || { number: cohortInfo?.cohortName },
      volcanoData: allVolcanoData,
      goBubbleData: allGoData,
      error: allVolcanoData.length === 0 && allGoData.length === 0 ? 
        (cohortInfo?.message || "该 cohort 暂无可用数据") : null,
    };
  }, [selectedCohort, successItems, allItems, uniqueCohorts, cohortList]);


  // 检查是否有任何可用的数据
  const hasAnyData = useMemo(() => {
    if (successItems.length > 0) return true;
    
    // 检查是否至少有一个cohort有数据
    for (const cohort of uniqueCohorts) {
      const itemsForCohort = allItems.filter(item => item.cohortId === cohort.cohortId);
      for (const item of itemsForCohort) {
        const hasVolcanoData = item.DEGResults && Array.isArray(item.DEGResults) && item.DEGResults.length > 0;
        const hasGoData = item.GORes && Array.isArray(item.GORes) && item.GORes.length > 0;
        if (hasVolcanoData || hasGoData) {
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

    // 渲染图表
    return (
      <>
        {/* 图表区域 */}
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
    );
  };

  // 如果没有任务结果
  if (!pollingResults || pollingResults.length === 0) {
    return (
      <Empty 
        description="暂无任务结果" 
        style={{ marginTop: 100 }} 
        styles={{ image: { height: 80 } }}
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

  const downloadCSV = () => {
    console.log("download CSV");
  };

  return (
    <div style={{ paddingTop: 20 }}>
      {/* 下拉选择器和Tag信息行 */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {/* 显示Tag信息 - 从cohortList中获取 */}
          {currentCohortData?.cohortInfo && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {currentCohortData.cohortInfo.techonology && (
                <Tag color={TECHNOLOGY_COLOR[currentCohortData.cohortInfo.techonology]}>
                  {currentCohortData.cohortInfo.techonology}
                </Tag>
              )}
              {currentCohortData.cohortInfo.level && (
                <Tag color={LEVEL_COLOR[currentCohortData.cohortInfo.level]}>
                  {currentCohortData.cohortInfo.level}
                </Tag>
              )}
              {currentCohortData.cohortInfo.classify && (
                <Tag color={CLASSIFY_COLOR[currentCohortData.cohortInfo.classify]}>
                  {currentCohortData.cohortInfo.classify}
                </Tag>
              )}
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
          <Button onClick={downloadCSV} style={{ marginLeft: 10 }}>
            下载CSV
          </Button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default Pathways;