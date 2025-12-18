"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  getCohortList,
  getDEGTaskIds,
  getDEGResultList,
} from "@/configs/request";
import VolcanoPlot from "@/components/expression/pathways/right-panel/volcano-plot";
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
  const [loading, setLoading] = React.useState(false);
  const [taskList, setTaskList] = useState(null);
  const [cohortDataMap, setCohortDataMap] = useState({});
  const [selectedCohort, setSelectedCohort] = React.useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [detailErrors, setDetailErrors] = useState({}); // 存储每个 cohort 的详细错误信息

  useEffect(() => {
    if (!conditions) return;
    
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
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [conditions]);

  useEffect(() => {
    if (!taskList || !cohortListRef.current) return;

    const fetchCohortResults = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const errors = {};

        const cohortPromises = Object.entries(taskList).map(
          async ([cohortKey, taskId]) => {
            try {
              const result = await getDEGResultList(taskId);
              
              const cohortInfo = cohortListRef.current?.find(
                (cohort) => cohort.cohort === cohortKey.replace("cohort", ""),
              );

              // 检查 API 响应状态 - 使用接口返回的 message
              if (result?.code !== 200) {
                const errorMsg = result?.message || `Cohort ${cohortKey} 数据获取失败`;
                errors[cohortKey] = errorMsg; // 存储接口返回的错误信息
                return {
                  cohortKey,
                  data: null,
                  error: errorMsg,
                };
              }

              // 检查是否有有效数据
              const hasVolcanoData = result?.data?.deg_results && result.data.deg_results.length > 0;
              const hasGoData = result?.data?.["go.res"] && result.data["go.res"].length > 0;
              
              if (!hasVolcanoData && !hasGoData) {
                const errorMsg = result?.message || `Cohort ${cohortKey} 暂无可用数据`;
                errors[cohortKey] = errorMsg; // 存储数据为空的信息
              }

              return {
                cohortKey,
                data: {
                  taskId,
                  volcanoData: result?.data?.deg_results || [],
                  goBubbleData: result?.data?.["go.res"] || [],
                  cohortInfo: cohortInfo || {
                    cohort: cohortKey.replace("cohort", ""),
                  },
                },
                error: hasVolcanoData || hasGoData ? null : errors[cohortKey],
              };
            } catch (err) {
              console.error(`Failed to fetch data for ${cohortKey}:`, err);
              const errorMsg = err?.response?.data?.message || err?.message || `Cohort ${cohortKey} 请求失败`;
              errors[cohortKey] = errorMsg; // 存储错误信息
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
        const successCount = results.filter(r => r.data).length;
        const totalCount = results.length;
        
        if (successCount === 0 && totalCount > 0) {
          // 所有 cohort 都失败了，设置整体错误信息
          const allErrorMessages = Object.values(errors).join("；");
          setFetchError(`所有 cohort 数据加载失败，请检查网络或稍后重试`);
        } else if (Object.keys(errors).length > 0) {
          // 部分失败，显示警告
          const errorCount = Object.keys(errors).length;
          message.warning(`${errorCount} 个 cohort 数据加载异常`);
        }

      } catch (err) {
        console.error("Failed to fetch cohort results:", err);
        const errorMsg = err?.message || "加载详细数据失败";
        setFetchError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchCohortResults();
  }, [taskList]);

  // 处理 dropdown 切换
  const handleCohortChange = (key) => {
    setSelectedCohort(key);
  };

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
    const errorCohorts = Object.entries(detailErrors).filter(([_, error]) => error);
    
    if (errorCohorts.length === 0) return null;

    return (
      <Collapse 
        size="small" 
        style={{ marginTop: 10, marginBottom: 20 }}
        items={[{
          key: "error-details",
          label: `查看详细错误信息 (${errorCohorts.length} 个 cohort 异常)`,
          children: (
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {errorCohorts.map(([cohortKey, errorMsg]) => (
                <div key={cohortKey} style={{ marginBottom: 8 }}>
                  <Typography.Text strong>
                    Cohort {cohortKey.replace("cohort", "")}：
                  </Typography.Text>
                  <Typography.Text type="danger">
                    {errorMsg}
                  </Typography.Text>
                </div>
              ))}
            </div>
          ),
        }]}
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
                {/* 在"所有 cohort 数据加载失败"下方显示详细错误信息 */}
                {fetchError.includes("所有 cohort 数据加载失败") && (
                  <div style={{ marginTop: 16 }}>
                    <Typography.Text strong>详细错误信息：</Typography.Text>
                    <div style={{ marginTop: 8, padding: 12, backgroundColor: "#fff2f0", borderRadius: 6 }}>
                      {Object.entries(detailErrors).map(([cohortKey, errorMsg]) => (
                        <div key={cohortKey} style={{ marginBottom: 8 }}>
                          <Typography.Text strong>
                            Cohort {cohortKey.replace("cohort", "")}：
                          </Typography.Text>
                          <Typography.Text type="danger">
                            {errorMsg}
                          </Typography.Text>
                        </div>
                      ))}
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
                  onClick={() => window.location.reload()}
                >
                  刷新页面
                </Button>
                <Button 
                  size="small"
                  onClick={() => {
                    setFetchError(null);
                    setDetailErrors({});
                  }}
                >
                  忽略错误
                </Button>
              </Space>
            }
          />
          {/* 对于非全部失败的情况，显示折叠面板 */}
          {!fetchError.includes("所有 cohort 数据加载失败") && renderErrorDetails()}
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
            description={`${Object.keys(detailErrors).length} 个 cohort 数据加载失败`}
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

  if (loading && !hasAnyData) {
    return (
      <Flex align="center" justify="center" style={{ height: "500px" }}>
        <Spin size="large" tip="加载中..." />
      </Flex>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* 错误提示 */}
      {renderErrorAlert()}

      { hasAnyData && (
        <Flex vertical style={{ marginBottom: "20px" }}>
          <Flex style={{ marginBottom: "20px", justifyContent: "space-between" }}>
            <Space>
              {currentCohortData?.cohortInfo?.cohort ? (
                <>
                  <Typography.Title
                    level={5}
                    style={{ marginBottom: 0, marginRight: "20px" }}
                  >
                    {currentCohortData.cohortInfo.cohort}
                  </Typography.Title>
                  {currentCohortData.cohortInfo.level && (
                    <Tag color={LEVEL_COLOR[currentCohortData.cohortInfo.level]}>
                      {currentCohortData.cohortInfo.level}
                    </Tag>
                  )}
                  {currentCohortData.cohortInfo.classify && (
                    <Tag
                      color={CLASSIFY_COLOR[currentCohortData.cohortInfo.classify]}
                    >
                      {currentCohortData.cohortInfo.classify}
                    </Tag>
                  )}
                  {currentCohortData.cohortInfo.techonology && (
                    <Tag
                      color={
                        TECHNOLOGY_COLOR[currentCohortData.cohortInfo.techonology]
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
                  <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}>
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
                  <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}>
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
      )}
    </div>
  );
};

export default Pathways;