"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  getBiomarkersResultByTaskId,
  getBiomarkersTaskIds,
  getGeneList,
} from "@/configs/request";
import {
  CaretRightOutlined,
  LoadingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBiomarkers } from "@/configs/request";
import SplitBar from "@/components/split-bar";
import PollingManager from "@/components/polling-manager";
import Biomarkers1Content from "./right-content/biomarkers1";
import Biomarkers1Condition from "./left-content/biomarkers1";
import Biomarkers2Condition from "./left-content/biomarkers2";
import Biomarkers2Content from "./right-content/biomarkers2";
import {
  Collapse,
  Radio,
  Tooltip,
  Button,
  Flex,
  Splitter,
  Typography,
  Segmented,
  message,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
const { Panel } = Splitter;
const LEFT_SQUARE_SRC = "/images/left-square.svg";
const RIGHT_SQUARE_SRC = "/images/right-square.svg";
const DEFAULT_LEFT_PANEL_WIDTH = "25%";
const DEFAULT_RIGHT_PANEL_WIDTH = "75%";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const RELOAD_ICON = "/images/reload.svg";

const Biomarkers = () => {
  const { t } = useTranslation();
  const [taskIdsWithCohort, setTaskIdsWithCohort] = useState(null);
  const [contentType, setContentType] = useState("biomarkers1");
  const [applyLoading, setApplyLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [pollingData, setPollingData] = useState(null);
  const [pollingResultData, setPollingResultData] = useState(null);
  const [biomarkers2Conditions, setBiomarkers2Conditions] = useState(null);
  const biomarkers1ConditionRef = useRef(null);

  const biomarkers2ConditionRef = useRef(null);

  const handleApply = useCallback(() => {
    if (contentType === "biomarkers1") {
      const params = biomarkers1ConditionRef.current?.getParams();
      applyMethod(params);
    }
    if (contentType === "biomarkers2") {
      const params = biomarkers2ConditionRef.current?.getParams();
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
      setBiomarkers2Conditions(requestParamsArray);
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
    if (contentType === "biomarkers1") {
      applyMethod(params);
    }
    if (contentType === "biomarkers2") {
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
      setBiomarkers2Conditions(requestParamsArray);
    }
  }, [contentType]);

  useEffect(() => {
    if (!taskIdsWithCohort) return;
    setPollingData({
      taskIds: taskIdsWithCohort,
      cohortInfo: biomarkers1ConditionRef.current
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
      numbers: selectedRows.map((item) => item.number), // 从 selectedRows 的 number 字段获取
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

  const rightAction = useMemo(() => {
    return (
      <Segmented
        size="large"
        onChange={handleContentTypeChange}
        options={[
          { value: "biomarkers1", label: "biomarkers1" },
          { value: "biomarkers2", label: "biomarkers2" },
        ]}
        value={contentType}
      />
    );
  }, [contentType]);

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
            {contentType === "biomarkers1" ? (
              <Biomarkers1Condition
                ref={biomarkers1ConditionRef}
                handleOnReady={handleOnReady}
              ></Biomarkers1Condition>
            ) : <Biomarkers2Condition ref={biomarkers2ConditionRef} handleOnReady={handleOnReady}></Biomarkers2Condition>}
          </>
        }
        rightContent={
          <>
            
            {contentType === "biomarkers1" ? (
              <>
                <PollingManager
                  pollingData={pollingData}
                  onComplete={handlePollingComplete}
                />
                <Biomarkers1Content
                  pollingResults={pollingResultData}
                ></Biomarkers1Content>
              </>
            ) : (
              <Biomarkers2Content biomarkers={biomarkers2Conditions?.biomarkers} conditions={biomarkers2Conditions?.clinicalConditions} dataType={biomarkers2Conditions?.selectedCohortType} onComplete={handleBiomarker2Complete}></Biomarkers2Content>
            )}
          </>
        }
      ></SplitBar>
    </>
  );
};

export default Biomarkers;
