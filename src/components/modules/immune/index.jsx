"use client";
import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  LoadingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import SplitBar from "@/components/common/split-bar";
import ImmuneSubtypeCondition from "./left-content/immune-subtype";
import MicroenvironmentDeconvolutionCondition from "./left-content/microenvironment-deconvolution";
import ImmuneSubtypeContent from "./right-content/immune-subtype";
import MicroenvironmentDeconvolutionContent from "./right-content/microenvironment-deconvolution";
import {
  Button,
  Segmented,
  message,
} from "antd";
import { useTranslation } from "react-i18next";

const Biomarkers = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const menu = searchParams.get("menu"); // 获取menu参数
  const [contentType, setContentType] = useState(menu ?? "immune-subtype");
  const [applyLoading, setApplyLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [immuneSubtypeConditions, setImmuneSubtypeConditions] = useState(null);
  const [microenvironmentDeconvolutionCondition, setMicroenvironmentDeconvolutionCondition] = useState(null);
  const ImmuneSubtypeConditionRef = useRef(null);

  const microenvironmentDeconvolutionConditionRef = useRef(null);

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
      const params = microenvironmentDeconvolutionConditionRef.current?.getParams();
      const requestParamsArray = {
        method: params.selectedMethod,
        numbers: params.selectedRows?.map((item) => item?.number),
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
      const params = microenvironmentDeconvolutionConditionRef.current?.getParams();
      const requestParamsArray = {
        method: params.selectedMethod,
        numbers: params.selectedRows?.map((item) => item?.number),
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
            ) : <MicroenvironmentDeconvolutionCondition ref={microenvironmentDeconvolutionConditionRef} handleOnReady={handleOnReady}></MicroenvironmentDeconvolutionCondition>}
          </>
        }
        rightContent={
          <>
            {contentType === "immune-subtype" ? (
              <>
                <ImmuneSubtypeContent conditions={immuneSubtypeConditions?.clinicalConditions} dataType={immuneSubtypeConditions?.selectedCohortType} onComplete={handleComplete}>
                </ImmuneSubtypeContent>
              </>
            ) : (
              <MicroenvironmentDeconvolutionContent conditions={microenvironmentDeconvolutionCondition}></MicroenvironmentDeconvolutionContent>
            )}
          </>
        }
      ></SplitBar>
    </>
  );
};

export default Biomarkers;
