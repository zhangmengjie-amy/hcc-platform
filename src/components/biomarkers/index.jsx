"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { getBiomarkersResultByTaskId, getBiomarkersTaskIds } from "@/configs/request";
import {
  LoadingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import SplitBar from "@/components/split-bar";
import LeftContent from "@/components/biomarkers/left-content";
import RightContent from "@/components/biomarkers/right-content";
import {
  Button,
  Segmented,
  message,
  Spin,
} from "antd";
import { useTranslation } from "react-i18next";

// 定义结果类型
const TaskResult = {
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

const Biomarkers = () => {
  const { t } = useTranslation();
  const [taskIdsWithCohort, setTaskIdsWithCohort] = useState(null);
  const [contentType, setContentType] = useState("clinical");
  const [applyLoading, setApplyLoading] = useState(false);
  const [pollingIntervals, setPollingIntervals] = useState({});
  const [resultsData, setResultsData] = useState([]);
  const [fetchingResults, setFetchingResults] = useState(false);
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const leftContentRef = useRef(null);
  
  // 使用 ref 存储 selectedRows 以避免依赖循环
  const selectedRowsRef = useRef([]);
  // 存储所有任务的完成状态
  const completedTasksRef = useRef(new Set());

  const handleApply = useCallback(async () => {
    setApplyLoading(true);
    // 重置之前的结果和状态
    setResultsData([]);
    setTaskIdsWithCohort(null);
    setAllTasksCompleted(false);
    completedTasksRef.current.clear();
    
    const params = leftContentRef.current?.getParams();
    if (!params.selectedRows?.length) {
      messageApi.open({
        type: "warning",
        content: "请至少选择一个cohort",
      });
      setApplyLoading(false);
      return;
    } else if (params.selectedGeneType === "customized") {
      if (!params.selectedCustomizedGeneList?.length) {
        messageApi.open({
          type: "warning",
          content: "请上传自定义基因txt",
        });
        setApplyLoading(false);
        return;
      }
    }

    try {
      const requestParamsArray = generateRequestParams(params);
      const taskIds = await getBiomarkersTaskIds(requestParamsArray);
      // 存储 selectedRows 到 ref
      selectedRowsRef.current = params.selectedRows;
      setTaskIdsWithCohort(taskIds);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "请求失败，请重试",
      });
    } finally {
      setApplyLoading(false);
    }
  }, [messageApi]);

  // 轮询获取任务结果
  const pollTaskResult = useCallback(async (taskId, cohortInfo, maxRetries = 30) => {
    let retries = 0;
    
    const poll = async () => {
      try {
        // 更新结果状态为处理中
        setResultsData(prev => {
          const newResults = [...prev];
          const existingIndex = newResults.findIndex(r => r.taskId === taskId);
          
          if (existingIndex >= 0) {
            newResults[existingIndex] = {
              ...newResults[existingIndex],
              status: TaskResult.PROCESSING,
              retries,
              lastUpdate: new Date().toISOString()
            };
          } else {
            newResults.push({
              taskId,
              cohort: cohortInfo?.cohort || cohortInfo?.number || '未知队列',
              cohortInfo: cohortInfo,
              status: TaskResult.PROCESSING,
              retries,
              data: null,
              error: null,
              lastUpdate: new Date().toISOString()
            });
          }
          return newResults;
        });
        
        const result = await getBiomarkersResultByTaskId("11111");
        
        // 检查接口返回状态码
        if (result?.code === 202) {
          // 202: 处理中，继续轮询
          retries++;
          
          if (retries >= maxRetries) {
            console.warn(`任务 ${taskId} 轮询超过最大次数（${maxRetries}）`);
            
            setResultsData(prev => {
              const newResults = [...prev];
              const index = newResults.findIndex(r => r.taskId === taskId);
              if (index >= 0) {
                newResults[index] = {
                  ...newResults[index],
                  status: TaskResult.ERROR,
                  error: "任务处理超时，超过最大重试次数",
                  retries,
                  lastUpdate: new Date().toISOString()
                };
              }
              return newResults;
            });
            
            messageApi.warning(`队列 ${cohortInfo?.cohort || cohortInfo?.number} 处理超时`);
            completedTasksRef.current.add(taskId);
            checkAllTasksCompleted();
            return { code: 408, message: "请求超时" };
          }
          
          // 3秒后再次轮询
          return new Promise((resolve) => {
            const timerId = setTimeout(async () => {
              const nextResult = await poll();
              resolve(nextResult);
            }, 3000);
            
            setPollingIntervals(prev => ({
              ...prev,
              [taskId]: timerId
            }));
          });
        } 
        else if (result?.code === 200) {
          // 200: 成功
          setResultsData(prev => {
            const newResults = [...prev];
            const index = newResults.findIndex(r => r.taskId === taskId);
            if (index >= 0) {
              newResults[index] = {
                ...newResults[index],
                status: TaskResult.SUCCESS,
                data: result.data,
                xmlContent: result.data?.xmlContent,
                cohort: result.data?.cohort || cohortInfo?.cohort,
                retries,
                lastUpdate: new Date().toISOString()
              };
            }
            return newResults;
          });
          
          messageApi.success(`队列 ${cohortInfo?.cohort || cohortInfo?.number} 处理成功`);
          completedTasksRef.current.add(taskId);
          checkAllTasksCompleted();
          return result;
        } 
        else {
          // 其他状态码：400, 404, 500 等错误
          const errorMsg = result?.message || `请求失败，状态码: ${result?.code}`;
          
          setResultsData(prev => {
            const newResults = [...prev];
            const index = newResults.findIndex(r => r.taskId === taskId);
            if (index >= 0) {
              newResults[index] = {
                ...newResults[index],
                status: TaskResult.ERROR,
                error: errorMsg,
                data: result,
                retries,
                lastUpdate: new Date().toISOString()
              };
            } else {
              newResults.push({
                taskId,
                cohort: cohortInfo?.cohort || cohortInfo?.number || '未知队列',
                cohortInfo: cohortInfo,
                status: TaskResult.ERROR,
                error: errorMsg,
                data: result,
                retries: 0,
                lastUpdate: new Date().toISOString()
              });
            }
            return newResults;
          });
          
          messageApi.error(`队列 ${cohortInfo?.cohort || cohortInfo?.number} 处理失败: ${errorMsg}`);
          completedTasksRef.current.add(taskId);
          checkAllTasksCompleted();
          return result;
        }
      } catch (error) {
        console.error(`轮询任务 ${taskId} 失败:`, error);
        
        setResultsData(prev => {
          const newResults = [...prev];
          const index = newResults.findIndex(r => r.taskId === taskId);
          if (index >= 0) {
            newResults[index] = {
              ...newResults[index],
              status: TaskResult.ERROR,
              error: error.message || "网络请求失败",
              retries,
              lastUpdate: new Date().toISOString()
            };
          } else {
            newResults.push({
              taskId,
              cohort: cohortInfo?.cohort || cohortInfo?.number || '未知队列',
              cohortInfo: cohortInfo,
              status: TaskResult.ERROR,
              error: error.message || "网络请求失败",
              data: null,
              retries: 0,
              lastUpdate: new Date().toISOString()
            });
          }
          return newResults;
        });
        
        messageApi.error(`队列 ${cohortInfo?.cohort || cohortInfo?.number} 请求异常`);
        completedTasksRef.current.add(taskId);
        checkAllTasksCompleted();
        
        return { error: true, message: error.message };
      }
    };
    
    return await poll();
  }, [messageApi]);

  // 检查所有任务是否完成
  const checkAllTasksCompleted = useCallback(() => {
    if (!taskIdsWithCohort || !taskIdsWithCohort.data) return;
    
    const totalTasks = Object.keys(taskIdsWithCohort.data).length;
    const completedTasks = completedTasksRef.current.size;
    
    if (completedTasks === totalTasks) {
      setAllTasksCompleted(true);
      setFetchingResults(false);
      
      // 统计结果
      const successCount = resultsData.filter(r => r.status === TaskResult.SUCCESS).length;
      const errorCount = resultsData.filter(r => r.status === TaskResult.ERROR).length;
      
      if (successCount === totalTasks) {
        messageApi.success("所有队列处理成功！");
      } else if (errorCount === totalTasks) {
        messageApi.error("所有队列处理失败！");
      } else {
        messageApi.info(`处理完成：成功 ${successCount} 个，失败 ${errorCount} 个`);
      }
    }
  }, [taskIdsWithCohort, resultsData, messageApi]);

  // 批量轮询所有任务
  const pollTaskResultRef = useRef(pollTaskResult);
  useEffect(() => {
    pollTaskResultRef.current = pollTaskResult;
  }, [pollTaskResult]);

  // 处理任务ID的回调函数
  const processTaskIds = useCallback(async (taskIds) => {
    if (!taskIds || !taskIds.data) {
      console.warn("没有任务ID可处理");
      return [];
    }

    setFetchingResults(true);
    setAllTasksCompleted(false);
    completedTasksRef.current.clear();
    
    try {
      // 获取所有任务ID和对应的队列信息
      const tasks = [];
      const selectedRows = selectedRowsRef.current || [];
      
      Object.entries(taskIds.data).forEach(([cohortKey, taskId]) => {
        const cohortInfo = selectedRows.find(row => row.number === cohortKey) || 
                         selectedRows.find(row => row.cohort === cohortKey) || 
                         { number: cohortKey };
        
        tasks.push({
          taskId,
          cohortInfo
        });
      });
      
      console.log("开始轮询任务:", tasks);
      
      // 为每个任务启动轮询
      const results = await Promise.allSettled(
        tasks.map(({ taskId, cohortInfo }) => 
          pollTaskResultRef.current(taskId, cohortInfo)
        )
      );
      
      // 处理 Promise.allSettled 的结果
      const settledResults = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          const { taskId, cohortInfo } = tasks[index];
          return {
            code: 500,
            message: `任务执行异常: ${result.reason?.message || '未知错误'}`,
            taskId,
            cohort: cohortInfo?.cohort
          };
        }
      });
      
      console.log("所有任务轮询完成:", settledResults);
      return settledResults;
    } catch (error) {
      console.error("批量请求失败:", error);
      messageApi.error("批量请求失败");
      throw error;
    }
  }, [messageApi]);

  // 主 useEffect
  useEffect(() => {
    if (!taskIdsWithCohort) return;
    
    console.log("开始处理任务ID:", taskIdsWithCohort);
    
    let isMounted = true;
    
    const fetchResult = async () => {
      try {
        const results = await processTaskIds(taskIdsWithCohort);
        
        if (isMounted) {
          console.log("API返回结果:", results);
          
          // 统计各种状态码的数量
          const statusCounts = {};
          results.forEach(result => {
            const code = result?.code || 'unknown';
            statusCounts[code] = (statusCounts[code] || 0) + 1;
          });
          
          console.log("状态码统计:", statusCounts);
        }
      } catch (error) {
        if (isMounted) {
          console.error("获取结果失败:", error);
          messageApi.error("获取结果失败");
        }
      }
    };
    
    fetchResult();
    
    return () => {
      isMounted = false;
    };
  }, [taskIdsWithCohort, messageApi, processTaskIds]);

  // 清理轮询定时器
  useEffect(() => {
    return () => {
      Object.values(pollingIntervals).forEach(timerId => {
        clearTimeout(timerId);
      });
    };
  }, [pollingIntervals]);

  // 根据 params 生成请求参数数组
  const generateRequestParams = useCallback((params) => {
    const {
      selectedGeneType,
      selectedSingleGene,
      selectedGeneSet,
      selectedCustomizedGeneList,
      selectedRows,
    } = params;

    if (
      !selectedRows ||
      !Array.isArray(selectedRows) ||
      selectedRows.length === 0
    ) {
      return [];
    }

    const baseParams = {
      numbers: selectedRows.map((item) => item.number),
      taskType: selectedGeneType,
    };

    switch (selectedGeneType) {
      case "customized":
        return {
          ...baseParams,
          biomarkerName: null,
          customizedGenes: selectedCustomizedGeneList || [],
        };

      case "singleGene":
        return {
          ...baseParams,
          biomarkerName: selectedSingleGene || "",
          customizedGenes: [],
        };

      case "geneList":
        return {
          ...baseParams,
          biomarkerName: selectedGeneSet || "",
          customizedGenes: [],
        };

      default:
        console.warn(`未知的 taskType: ${selectedGeneType}`);
        return {
          ...baseParams,
          biomarkerName: null,
          customizedGenes: [],
        };
    }
  }, []);

  // 使用 useMemo 缓存计算结果
  const processingCount = useMemo(() => 
    resultsData.filter(r => r.status === TaskResult.PROCESSING).length, 
    [resultsData]
  );
  
  const successCount = useMemo(() => 
    resultsData.filter(r => r.status === TaskResult.SUCCESS).length, 
    [resultsData]
  );
  
  const errorCount = useMemo(() => 
    resultsData.filter(r => r.status === TaskResult.ERROR).length, 
    [resultsData]
  );

  // 判断是否显示处理状态
  const showProcessingStatus = useMemo(() => {
    return fetchingResults || processingCount > 0 || !allTasksCompleted;
  }, [fetchingResults, processingCount, allTasksCompleted]);

  const leftAction = useMemo(() => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {showProcessingStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Spin size="small" />
            <span style={{ fontSize: '12px', color: '#666' }}>
              处理中: {processingCount} | 成功: {successCount} | 失败: {errorCount}
            </span>
          </div>
        )}
        <Button
          color="default"
          size="large"
          icon={applyLoading ? <LoadingOutlined /> : <AppstoreOutlined />}
          loading={applyLoading}
          onClick={handleApply}
          type="primary"
          disabled={fetchingResults && processingCount > 0}
        >
          {t("common:apply")}
        </Button>
      </div>
    );
  }, [applyLoading, t, handleApply, showProcessingStatus, processingCount, successCount, errorCount, fetchingResults]);

  const rightAction = useMemo(() => {
    return (
      <Segmented
        size="large"
        onChange={setContentType}
        options={[
          { value: "clinical", label: "clinical" },
          { value: "biomarker2", label: "biomarker2" },
        ]}
        value={contentType}
      />
    );
  }, [contentType]);

  // 简化的处理状态显示
  const renderProcessingStatus = () => {
    if (!showProcessingStatus) {
      return null;
    }
    
    return (
      <div style={{ 
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        minWidth: '350px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>
            {allTasksCompleted ? '处理完成' : '正在处理队列数据'}
          </h4>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            {allTasksCompleted ? '所有任务已处理完成' : '请稍候，数据正在处理中...'}
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {successCount}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>成功</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {processingCount}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>处理中</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                {errorCount}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>失败</div>
            </div>
          </div>
          
          {/* 显示错误队列详情 */}
          {errorCount > 0 && (
            <div style={{ 
              marginTop: '12px', 
              textAlign: 'left',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>失败队列:</p>
              {resultsData
                .filter(r => r.status === TaskResult.ERROR)
                .map((result, index) => (
                  <div key={index} style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#fff2f0',
                    marginBottom: '4px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    <strong>{result.cohort}</strong>: {result.error || '未知错误'}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {contextHolder}
      {renderProcessingStatus()}
      <SplitBar
        initialLeftWidth={"35%"}
        initialRightWidth={"65%"}
        leftAction={leftAction}
        rightAction={rightAction}
        leftContent={
          <>
            <LeftContent ref={leftContentRef}></LeftContent>
          </>
        }
        rightContent={
          <>
            {showProcessingStatus ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                padding: '40px'
              }}>
                <Spin size="large" />
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <p>正在处理队列数据...</p>
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                    成功: {successCount} | 处理中: {processingCount} | 失败: {errorCount}
                  </p>
                </div>
              </div>
            ) : (
              <RightContent 
                resultsData={resultsData.filter(r => r.status === TaskResult.SUCCESS)}
                contentType={contentType}
                allResults={resultsData}
              />
            )}
          </>
        }
      ></SplitBar>
    </>
  );
};

export default Biomarkers;