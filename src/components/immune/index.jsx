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
import Immune1Condition from "./left-content/immune1";
import Immune2Condition from "./left-content/immune2";
import Immune1Content from "./right-content/immune1";
import Immune2Content from "./right-content/immune2";
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
  const [contentType, setContentType] = useState("immune1");
  const [applyLoading, setApplyLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [pollingData, setPollingData] = useState(null);
  const [pollingResultData, setPollingResultData] = useState(null);
  const [immune2Conditions, setImmune2Conditions] = useState(null);
  const immune1ConditionRef = useRef(null);

  const immune2ConditionRef = useRef(null);

  const handleApply = useCallback(() => {
    if (contentType === "immune1") {
      const params = immune1ConditionRef.current?.getParams();

    }
    if (contentType === "immune2") {
      const params = immune2ConditionRef.current?.getParams();
      setImmune2Conditions(params);
    }
  }, [contentType]);


  const handleOnReady = useCallback(async (params) => {
    if (contentType === "immune1") {

    }
    if (contentType === "immune2") {

      setImmune2Conditions(params);
    }
  }, [contentType]);

  
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
          { value: "immune1", label: "immune1" },
          { value: "immune2", label: "immune2" },
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
            {contentType === "immune1" ? (
              <Immune1Condition
                ref={immune1ConditionRef}
                handleOnReady={handleOnReady}
              ></Immune1Condition>
            ) : <Immune2Condition ref={immune2ConditionRef} handleOnReady={handleOnReady}></Immune2Condition>}
          </>
        }
        rightContent={
          <>
            
            {contentType === "immune1" ? (
              <>
                <Immune1Content
                ></Immune1Content>
              </>
            ) : (
              <Immune2Content></Immune2Content>
            )}
          </>
        }
      ></SplitBar>
    </>
  );
};

export default Biomarkers;
