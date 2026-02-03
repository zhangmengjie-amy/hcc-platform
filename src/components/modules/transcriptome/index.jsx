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
  getDEGResultByTaskId,
  getDEGTaskIds,
} from "@/configs/request";
import {
  LoadingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import SplitBar from "@/components/common/split-bar";
import PollingManager from "@/components/polling-manager";
import SubtypeLandscapeCondition from "./left-content/subtype-landscape";
import PathwaysCondition from "./left-content/pathways";
import SubtypeLandscapeContent from "./right-content/subtype-landscape";
import PathwaysContent from "./right-content/pathways";
import {
  Button,
  Segmented,
  message,
} from "antd";
import { useTranslation } from "react-i18next";

const Transcriptome = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const menu = searchParams.get("menu"); // 获取menu参数
  const [taskIdsWithCohort, setTaskIdsWithCohort] = useState(null);
  const [contentType, setContentType] = useState(menu ?? "transcriptomic-heterogeneity");
  const [applyLoading, setApplyLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [pollingData, setPollingData] = useState(null);
  const [pollingResultData, setPollingResultData] = useState(null);
  const [survivalAnalysisCondition, setSurvivalAnalysisCondition] = useState(null);
  const [cohortList, setCohortList] = useState([]);
  const survivalAnalysisConditionRef = useRef(null);

  const MultiModalJointAnalysisConditionRef = useRef(null);

  const handleApply = useCallback(async () => {
    if (contentType === "transcriptomic-heterogeneity") {
      const params = survivalAnalysisConditionRef.current?.getParams();
      setSurvivalAnalysisCondition(params);
    }
    if (contentType === "differential-expression-analysis") {
      const params = MultiModalJointAnalysisConditionRef.current?.getParams();
      if (!params.selectedRows) return;
      if (!params.selectedRows?.length) {
        messageApi.open({
          type: "warning",
          content: "请至少选择一个cohort",
        });
        return;
      }
      if (params.groupBy == "Gene") {
        if (params.geneType == "custom") {
          if (params.geneList?.length == 0) {
            messageApi.open({
              type: "warning",
              content: "请上传自定义基因txt",
            });
            return;
          }
        }
      } else {
        if (!params.firstGroup?.length || !params.secondGroup?.length) {
          messageApi.open({
            type: "warning",
            content: "分组不可以为空",
          });
          return;
        }
      }
      const requestParamsArray = {
        queryType: params.groupBy,
        firstGroup: params.firstGroup,
        secondGroup: params.secondGroup,
        geneType: params.geneType,
        geneList: params.geneList,
        geneSet: params.geneSet,
        numbers: params.selectedRows?.map((item) => item?.number),
      };
     
      applyMethod(requestParamsArray, params.selectedRows);
    }
  }, [contentType]);

  const applyMethod = async (params, selectedRows) => {
    try {
      const taskIds = await getDEGTaskIds(params);
      setTaskIdsWithCohort(taskIds?.data);
      setCohortList(selectedRows);
    } catch (error) {
      messageApi.open({
        type: "warning",
        content: error,
      });
    }
  };

  const handleOnReady = useCallback(async (params) => {
    if (contentType === "transcriptomic-heterogeneity") {
      setSurvivalAnalysisCondition(params);
    }
    if (contentType === "differential-expression-analysis") {
      if (!params.selectedRows) return;
      if (!params.selectedRows?.length) {
        messageApi.open({
          type: "warning",
          content: "请至少选择一个cohort",
        });
        return;
      }
      if (params.groupBy == "Gene") {
        if (params.geneType == "custom") {
          if (params.geneList?.length == 0) {
            messageApi.open({
              type: "warning",
              content: "请上传自定义基因txt",
            });
            return;
          }
        }
      } else {
        if (!params.firstGroup?.length || !params.secondGroup?.length) {
          messageApi.open({
            type: "warning",
            content: "分组不可以为空",
          });
          return;
        }
      }
      const requestParamsArray = {
        queryType: params.groupBy,
        firstGroup: params.firstGroup,
        secondGroup: params.secondGroup,
        geneType: params.geneType,
        geneList: params.geneList,
        geneSet: params.geneSet,
        numbers: params.selectedRows?.map((item) => item?.number),
      };
      applyMethod(requestParamsArray, params.selectedRows);
    }
  }, [contentType]);

  useEffect(() => {
    console.log("taskIdsWithCohort", taskIdsWithCohort, "cohortList", cohortList);
    if (!taskIdsWithCohort || !cohortList) return;

    setPollingData({
      taskIds: taskIdsWithCohort,
      cohortInfo: cohortList?.reduce((acc, row) => {
        acc[row.number] = { name: row.name || `Cohort ${row.number}` };
        return acc;
      }, {}),
    });
  }, [taskIdsWithCohort, cohortList]);
  
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
          { value: "transcriptomic-heterogeneity", label: "Subtype Landscape and Tree" },
          { value: "differential-expression-analysis", label: "Customized DEGs and pathways" },
        ]}
        value={contentType}
      />
    );
  }, [contentType]);

  const handleSubtypeLandscapeComplete = useCallback(() => {
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
            {contentType === "transcriptomic-heterogeneity" ? (
              <SubtypeLandscapeCondition
                ref={survivalAnalysisConditionRef}
                handleOnReady={handleOnReady}
              ></SubtypeLandscapeCondition>
            ) : <PathwaysCondition ref={MultiModalJointAnalysisConditionRef} handleOnReady={handleOnReady}></PathwaysCondition>}
          </>
        }
        rightContent={
          <>
            {contentType === "transcriptomic-heterogeneity" ? (
              <>
                <SubtypeLandscapeContent conditions={survivalAnalysisCondition?.clinicalConditions} dataType={survivalAnalysisCondition?.selectedCohortType} handleComplete={handleSubtypeLandscapeComplete}></SubtypeLandscapeContent>
              </>
            ) : (
              <>
                <PollingManager
                  apiMethod={getDEGResultByTaskId}
                  pollingData={pollingData}
                  onComplete={handlePollingComplete}
                />
                <PathwaysContent pollingResults={pollingResultData} cohortList={cohortList}></PathwaysContent>
              </>
            )}
          </>
        }
      ></SplitBar>
    </>
  );
};

export default Transcriptome;
