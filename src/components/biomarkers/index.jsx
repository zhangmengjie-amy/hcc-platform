"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { getBiomarkersResultByTaskId, getBiomarkersTaskIds, getGeneList } from "@/configs/request";
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
import ClinicalContent from "./right-content/clinical";
import ClinicalCondition from "./left-content/clinical"
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
  const [contentType, setContentType] = useState("clinical");
  const [applyLoading, setApplyLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [pollingData, setPollingData] = useState(null);
  const [pollingResultData, setPollingResultData] = useState(null);
  const clinicalConditionRef = useRef(null);

  const handleApply = useCallback(async () => {
    const params = clinicalConditionRef.current?.getParams();
    applyMethod(params);

  }, [applyLoading]);

  const applyMethod = async (params) => {
    setApplyLoading(true);
    if (!params.selectedRows) return;
    if (!params.selectedRows?.length) {
      messageApi.open({
        type: "warning",
        content: "请至少选择一个cohort",
      });
      return;
    } else if (params.selectedGeneType === "customized") {
      if (!params.selectedCustomizedGeneList?.length) {
        messageApi.open({
          type: "warning",
          content: "请上传自定义基因txt",
        });
      }
      return;
    }
    setApplyLoading(false);
    const taskIds = await fetchTaskIds(params);
    setTaskIdsWithCohort(taskIds?.data);
  };

  const handleOnReady = useCallback(async (params) => {
    applyMethod(params);
  }, []);

  useEffect(() => {
    if (!taskIdsWithCohort) return;
    setPollingData({
        taskIds: taskIdsWithCohort,
        cohortInfo: clinicalConditionRef.current?.getParams()?.selectedRows?.reduce((acc, row) => {
          acc[row.number] = { name: row.name || `Cohort ${row.number}` };
          return acc;
        }, {})
      });
    
  }, [taskIdsWithCohort]);

  const fetchTaskIds = async (params) => {
    const requestParamsArray = generateRequestParams(params);
    return await getBiomarkersTaskIds(requestParamsArray);
  };

  const fetchBiomarkersData = async (taskIds) => {
    try {
      if (Object.values(taskIds)) {
        const dataWithMetadata = Object.values(taskIds.data).map(async (taskId) => ( await getBiomarkersResultByTaskId(taskId)));
        const results = await Promise.all(dataWithMetadata);    
        return results;
      } else {
        return [];
      }
    } catch (error) {
      console.error("批量请求失败:", error);
      throw error;
    }
  };

  // 根据 params 生成请求参数数组
  const generateRequestParams = (params) => {
    const {
      selectedGeneType,
      selectedSingleGene,
      selectedGeneSet,
      selectedCustomizedGeneList,
      selectedRows,
    } = params;

    // 验证必要参数
    if (
      !selectedRows ||
      !Array.isArray(selectedRows) ||
      selectedRows.length === 0
    ) {
      return [];
    }

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
      console.warn(`未知的 taskType: ${selectedGeneType}`);
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
  }, []);

   const handlePollingComplete = useCallback((results) => {
    console.log("All polling results:", results);
    // 这里可以将结果传递给 RightContent 组件
    setPollingResultData(results);
  }, []);

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
            {
              contentType === "clinical" ? 
              <ClinicalCondition ref={clinicalConditionRef} handleOnReady={handleOnReady}></ClinicalCondition>
              : null
            }
          </>
        }
        rightContent={
          <>
            <PollingManager 
                pollingData={pollingData} 
                onComplete={handlePollingComplete}
            />
          {
            
            contentType === "clinical" ? <>

              <ClinicalContent pollingResults={pollingResultData}></ClinicalContent>
            </> : <Biomarkers2Content>

            </Biomarkers2Content>
          }
          </>
        }
      ></SplitBar>
    </>
  );
};

export default Biomarkers;
