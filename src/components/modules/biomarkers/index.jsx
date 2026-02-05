"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  getBiomarkersTaskIds,
} from "@/configs/request";
import {
  LoadingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { getBiomarkersResultByTaskId } from "@/configs/request";
import SplitBar from "@/components/common/split-bar";
import PollingManager from "@/components/polling-manager";
import SurvivalAnalysisContent from "./right-content/survival-analysis";
import SurvivalAnalysisCondition from "./left-content/survival-analysis";
import MultiModalJointAnalysisCondition from "./left-content/multi-modal-joint-analysis";
import MultiModalJointAnalysisContent from "./right-content/multi-modal-joint-analysis";
import {
  Button,
  Segmented,
  message,
  Flex,
} from "antd";
import { useTranslation } from "react-i18next";

const Biomarkers = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const menu = searchParams.get("menu"); // 获取menu参数
  const [taskIdsWithCohort, setTaskIdsWithCohort] = useState(null);
  const [contentType, setContentType] = useState(menu ?? "survival-analysis");
  const [applyLoading, setApplyLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [pollingData, setPollingData] = useState(null);
  const [pollingResultData, setPollingResultData] = useState(null);
  const [multiModalJointAnalysisConditions, setMultiModalJointAnalysisConditions] = useState(null);
  const survivalAnalysisConditionRef = useRef(null);

  const MultiModalJointAnalysisConditionRef = useRef(null);

  const handleApply = useCallback(() => {
    if (contentType === "survival-analysis") {
      const params = survivalAnalysisConditionRef.current?.getParams();
      applyMethod(params);
    }
    if (contentType === "multi-modal-joint-analysis") {
      const params = MultiModalJointAnalysisConditionRef.current?.getParams();
      const requestParamsArray = {
        clinicalConditions: params.clinicalConditions,
        selectedCohortType: params.selectedCohortType,
        biomarkers: generateBiomarkers2RequestParams(params),
      };
      if (params.selectedGeneType === "customized") {
        if (!params.selectedCustomizedGeneList?.length) {
          messageApi.open({
            type: "warning",
            content: "请上传自定义基因txt",
          });
          return;
        }
      }
      setMultiModalJointAnalysisConditions(requestParamsArray);
    }
  }, [contentType]);

  const applyMethod = async (params) => {
    if (!params.selectedRows) return;
    if (!params.selectedRows?.length) {
      messageApi.open({
        type: "warning",
        content: "请至少选择一个cohort",
      });
      return;
    }
    if (params.selectedGeneType === "customized") {
      if (!params.selectedCustomizedGeneList?.length) {
        messageApi.open({
          type: "warning",
          content: "请上传自定义基因txt",
        });
        return;
      }
    }
    const taskIds = await fetchTaskIds(params);
    setTaskIdsWithCohort(taskIds?.data);
  };

  const handleOnReady = useCallback(async (params) => {
    if (contentType === "survival-analysis") {
      applyMethod(params);
    }
    if (contentType === "multi-modal-joint-analysis") {
      const requestParamsArray = {
        clinicalConditions: params.clinicalConditions,
        selectedCohortType: params.selectedCohortType,
        biomarkers: generateBiomarkers2RequestParams(params),
      };
      if (params.selectedGeneType === "customized") {
        if (!params.selectedCustomizedGeneList?.length) {
          messageApi.open({
            type: "warning",
            content: "请上传自定义基因txt",
          });
          return;
        }
      }
      setMultiModalJointAnalysisConditions(requestParamsArray);
    }
  }, [contentType]);

  useEffect(() => {
    if (!taskIdsWithCohort) return;
    setPollingData({
      taskIds: taskIdsWithCohort,
      cohortInfo: survivalAnalysisConditionRef.current
        ?.getParams()
        ?.selectedRows?.reduce((acc, row) => {
          acc[row.number] = { name: row.name || `Cohort ${row.number}` };
          return acc;
        }, {}),
    });
  }, [taskIdsWithCohort]);

  const fetchTaskIds = async (params) => {
    const requestParamsArray = generateBiomarkers1RequestParams(params);
    return await getBiomarkersTaskIds(requestParamsArray);
  };

  // 根据 params 生成请求参数数组
  const generateBiomarkers1RequestParams = (params) => {
    const {
      selectedGeneType,
      selectedSingleGene,
      selectedGeneSet,
      selectedCustomizedGeneList,
      selectedRows,
    } = params;

    // 根据 taskType 生成参数
    const baseParams = {
      numbers: selectedRows?.map((item) => item?.number), // 从 selectedRows 的 number 字段获取
      taskType: selectedGeneType, // 直接使用 selectedGeneType
    };

    // 根据 taskType 填充不同的参数
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

    case "geneLists":
      return {
        ...baseParams,
        biomarkerName: selectedGeneSet || "",
        customizedGenes: [],
      };

    default:
      return {
        ...baseParams,
        biomarkerName: null,
        customizedGenes: [],
      };
    }
  };
  
  const generateBiomarkers2RequestParams = (params) => {
    const {
      selectedGeneType,
      selectedSingleGene,
      selectedGeneSet,
      selectedCustomizedGeneList,
      selectedCohortType,
    } = params;

    const baseParams = {
      cohortName: selectedCohortType == "PLANET" ? "cohort2" : (selectedCohortType == "DT") ? "cohort1" : "all",
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

    case "geneLists":
      return {
        ...baseParams,
        biomarkerName: selectedGeneSet || "",
        customizedGenes: [],
      };

    default:
      return {
        ...baseParams,
        biomarkerName: null,
        customizedGenes: [],
      };
    }
  };
  
  const leftAction = useMemo(() => {
    return (
      <Button
        color="default"
        size="large"
        icon={applyLoading ? <LoadingOutlined /> : <AppstoreOutlined />}
        loading={applyLoading}
        onClick={handleApply}
        type="primary"
      >
        {t("common:apply")}
      </Button>
    );
  }, [applyLoading, contentType]);

  const handlePollingComplete = useCallback((results) => {
    setPollingResultData(results);
    setApplyLoading(false);
  }, []);

  const handleContentTypeChange = useCallback((value) => {
    setContentType(value);
    setApplyLoading(true);
  }, []);

  const downloadCSV = () => {
    console.log("download CSV");
  };

  const rightAction = useMemo(() => {
    return (
      <Flex justify="space-between" align="center" style={{ marginLeft: "auto" }}>
        <Segmented
          size="large"
          onChange={handleContentTypeChange}
          options={[
            { value: "survival-analysis", label: t("common:tabs.survivalAnalysis") },
            { value: "multi-modal-joint-analysis", label: t("common:tabs.multiModalJointAnalysis") },
          ]}
          value={contentType}
        />
        <Button onClick={downloadCSV} style={{ marginLeft: 10 }}>
          下载CSV
        </Button>
      </Flex>
    );
  }, [contentType, t]);

  const handleBiomarker2Complete = useCallback(() => {
    setApplyLoading(false);
  }, []);

  return (
    <>
      {contextHolder}
      <SplitBar
        initialLeftWidth={"40%"}
        initialRightWidth={"60%"}
        leftAction={leftAction}
        rightAction={rightAction}
        leftContent={
          <>
            {contentType === "survival-analysis" ? (
              <SurvivalAnalysisCondition
                ref={survivalAnalysisConditionRef}
                handleOnReady={handleOnReady}
              ></SurvivalAnalysisCondition>
            ) : <MultiModalJointAnalysisCondition ref={MultiModalJointAnalysisConditionRef} handleOnReady={handleOnReady}></MultiModalJointAnalysisCondition>}
          </>
        }
        rightContent={
          <>
            
            {contentType === "survival-analysis" ? (
              <>
                <PollingManager
                  pollingData={pollingData}
                  onComplete={handlePollingComplete}
                  apiMethod={getBiomarkersResultByTaskId}
                />
                <SurvivalAnalysisContent
                  pollingResults={pollingResultData}
                ></SurvivalAnalysisContent>
              </>
            ) : (
              <MultiModalJointAnalysisContent biomarkers={multiModalJointAnalysisConditions?.biomarkers} conditions={multiModalJointAnalysisConditions?.clinicalConditions} dataType={multiModalJointAnalysisConditions?.selectedCohortType} onComplete={handleBiomarker2Complete}></MultiModalJointAnalysisContent>
            )}
          </>
        }
      ></SplitBar>
    </>
  );
};

export default Biomarkers;
