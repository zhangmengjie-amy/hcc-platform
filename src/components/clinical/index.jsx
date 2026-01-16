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
import Overall from "@/components/overall";
import ClinicalConditions from "@/components/condition-selector/clinical";
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
  Alert,
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
  const [conditions, setConditions] = useState(null);
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

  const leftContent = useMemo(() => {
    return (
      <ClinicalConditions>

      </ClinicalConditions>
    );
  }, [contentType]);

  const rightContent = useMemo(() => {
    return (
      <>
        <Alert
          style={{ margin: "0 10px" }}
          message="In this genomic modal, you will be able to explore the driver status (“Driver Landscape”) as well as Phylogenetic Relationship of the PLANet and Ditan cohort."
        ></Alert>
        <Overall conditions={conditions}></Overall>
      </>
    );
  }, [contentType]);

  return (
    <>
      {contextHolder}
      <SplitBar
        initialLeftWidth={"40%"}
        initialRightWidth={"60%"}
        leftAction={null}
        rightAction={null}
        leftContent={leftContent}
        rightContent={rightContent}
      ></SplitBar>
    </>
  );
};

export default Biomarkers;
