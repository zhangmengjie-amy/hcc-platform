"use client";
import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  LoadingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import SplitBar from "@/components/split-bar";
import ImmuneSubtypeCondition from "./left-content/immune-subtype";
import Immune2Condition from "./left-content/microenvironment-deconvolution";
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
  const [contentType, setContentType] = useState("immune-subtype");
  const [applyLoading, setApplyLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [immuneSubtypeConditions, setImmuneSubtypeConditions] = useState(null);
  const [microenvironmentDeconvolutionCondition, setMicroenvironmentDeconvolutionCondition] = useState(null);
  const ImmuneSubtypeConditionRef = useRef(null);

  const immune2ConditionRef = useRef(null);

  const handleApply = useCallback(() => {
    if (contentType === "immune-subtype") {
      const params = ImmuneSubtypeConditionRef.current?.getParams();
      const requestParamsArray = {
        clinicalConditions: params.clinicalConditions,
        selectedCohortType: params.selectedCohortType,
      };
      setImmuneSubtypeConditions(requestParamsArray);
    }
    if (contentType === "microenvironment-deconvolution") {
      const params = immune2ConditionRef.current?.getParams();
      const requestParamsArray = {
        method: params.selectedMethod,
        numbers: params.selectedRows?.map((item) => item.number),
      };
      setMicroenvironmentDeconvolutionCondition(requestParamsArray);
    }
  }, [contentType]);


  const handleOnReady = useCallback(async (params) => {
    if (contentType === "immune-subtype") {
      const params = ImmuneSubtypeConditionRef.current?.getParams();
      const requestParamsArray = {
        clinicalConditions: params.clinicalConditions,
        selectedCohortType: params.selectedCohortType,
      };
      setImmuneSubtypeConditions(requestParamsArray);
    }

    if (contentType === "microenvironment-deconvolution") {
      const params = immune2ConditionRef.current?.getParams();
      const requestParamsArray = {
        method: params.selectedMethod,
        numbers: params.selectedRows?.map((item) => item.number),
      };
      setMicroenvironmentDeconvolutionCondition(requestParamsArray);
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

  const handleContentTypeChange = useCallback((value) => {
    setContentType(value);
  }, []);

  const rightAction = useMemo(() => {
    return (
      <Segmented
        size="large"
        onChange={handleContentTypeChange}
        options={[
          { value: "immune-subtype", label: "Immune subtype" },
          { value: "microenvironment-deconvolution", label: "Microenvironment deconvolution" },
        ]}
        value={contentType}
      />
    );
  }, [contentType]);

  const handleComplete = useCallback(() => {
    setApplyLoading(false);
  }, []);

  return (
    <>
      {contextHolder}
      <SplitBar
        initialLeftWidth={"30%"}
        initialRightWidth={"70%"}
        leftAction={leftAction}
        rightAction={rightAction}
        leftContent={
          <>
            {contentType === "immune-subtype" ? (
              <ImmuneSubtypeCondition
                ref={ImmuneSubtypeConditionRef}
                handleOnReady={handleOnReady}
              ></ImmuneSubtypeCondition>
            ) : <Immune2Condition ref={immune2ConditionRef} handleOnReady={handleOnReady}></Immune2Condition>}
          </>
        }
        rightContent={
          <>
            
            {contentType === "immune-subtype" ? (
              <>
                <Immune1Content conditions={immuneSubtypeConditions?.clinicalConditions} dataType={immuneSubtypeConditions?.selectedCohortType} onComplete={handleComplete}>
                </Immune1Content>
              </>
            ) : (
              <Immune2Content conditions={microenvironmentDeconvolutionCondition}></Immune2Content>
            )}
          </>
        }
      ></SplitBar>
    </>
  );
};

export default Biomarkers;
