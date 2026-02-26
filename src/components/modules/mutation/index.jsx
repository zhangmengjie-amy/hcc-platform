"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import { LoadingOutlined, AppstoreOutlined } from "@ant-design/icons";
import SplitBar from "@/components/common/split-bar";
import TimingAnalysis from "@/components/modules/mutation/right-content/timing-analysis";
import DriverLandscape from "@/components/modules/mutation/right-content/driver-landscape";
import PhylogeneticRelationship from "@/components/modules/mutation/right-content/phylogenetic-relationship";
import { Button, Segmented, message } from "antd";
import { useTranslation } from "react-i18next";
import ExportPdfButton from "@/components/export-pdf";
import ConditionSelection from "@/components/modules/mutation/left-content";

const Mutation = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const menu = searchParams.get("menu"); // 获取menu参数
  const [treeType, setTreeType] = useState("overview");
  const [contentType, setContentType] = useState(menu ?? "driver-landscape");
  const [applyLoading, setApplyLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [conditions, setConditions] = useState(null);
  const [dataType, setDataType] = useState(null);
  const [sampleType, setSampleType] = useState("sortedBySample");
  const [range, setRange] = useState([0, 1]);
  const driverLandscapeRef = useRef(null);
  const phylogeneticRelationshipRef = useRef(null);

  const conditionsRef = useRef(null);

  const handleApply = useCallback(() => {
    const params = conditionsRef.current?.getParams();
    setDataType(params?.selectedCohortType?.toLowerCase() ?? "planet");
    setConditions({
      geneList: params.geneList,
      ...params.clinicalConditions,
    });
  }, [contentType]);

  const handleOnReady = useCallback(
    async (params) => {
      setDataType(params?.selectedCohortType?.toLowerCase() ?? "planet");
      setConditions({
        geneList: params.geneList,
        ...params.clinicalConditions,
      });
    },
    [contentType],
  );

  const onSampleTypeChange = useCallback((value) => {
    setSampleType(value);
  }, []);

  const handleComplete = useCallback(() => {
    setApplyLoading(false);
  }, []);

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
  }, [applyLoading, contentType, t]);

  const handleContentTypeChange = useCallback((value) => {
    setContentType(value);
    setApplyLoading(true);
  }, []);

  const getDocument = () => {
    if (contentType === "driver-landscape") return driverLandscapeRef.current;
    if (contentType === "phylogenetic-relationship") return phylogeneticRelationshipRef.current;
  };

  console.log("driverLandscapeRef?.current", driverLandscapeRef?.current);

  const rightAction = useMemo(() => {
    return (
      <>
        <Segmented
          size="large"
          onChange={handleContentTypeChange}
          options={[
            {
              value: "driver-landscape",
              label: t("common:tabs.driverLandscape"),
            },
            {
              value: "phylogenetic-relationship",
              label: t("common:tabs.phylogeneticRelationship"),
            },
            {
              value: "timing-analysis",
              label: t("common:tabs.timingAnalysis"),
            },
          ]}
          value={contentType}
        />
        {(contentType == "driver-landscape") && (
          <>
            <Segmented
              size="large"
              onChange={onSampleTypeChange}
              options={[
                {
                  value: "sortedBySample",
                  label: t("common:tabs.sortedBySample"),
                },
                {
                  value: "sortedByPatient",
                  label: t("common:tabs.sortedByPatient"),
                },
              ]}
              value={sampleType}
              style={{ marginLeft: "20px" }}
            />
            {/* <ExportPdfButton getDocument={getDocument}></ExportPdfButton> */}
          </>
        )}
        {contentType == "phylogenetic-relationship" && (
          <Segmented
            size="large"
            onChange={setTreeType}
            options={[
              { value: "overview", label: t("common:tabs.overview") },
              { value: "detail", label: t("common:tabs.detail") },
            ]}
            value={treeType}
            style={{ marginLeft: "20px" }}
          />
        )}
      </>
    );
  }, [contentType, treeType, sampleType, t]);

  const rightContent = useMemo(() => {
    return (
      <>
        {contentType === "driver-landscape" && (
          <DriverLandscape
            ref={driverLandscapeRef} 
            conditions={conditions}
            dataType={dataType}
            sampleType={sampleType}
            handleComplete={handleComplete}
          ></DriverLandscape>
        )}
        {contentType === "phylogenetic-relationship" && (
          <PhylogeneticRelationship
            ref={phylogeneticRelationshipRef}
            conditions={conditions}
            dataType={dataType}
            treeType={treeType}
            range={range}
            handleComplete={handleComplete}
          ></PhylogeneticRelationship>
        )}
        {contentType === "timing-analysis" && (
          <TimingAnalysis
            conditions={conditions}
            dataType={dataType}
            range={range}
            handleComplete={handleComplete}
          ></TimingAnalysis>
        )}
      </>
    );
  }, [conditions, range, contentType, dataType, treeType, sampleType]);

  const leftContent = useMemo(() => {
    return (
      <ConditionSelection
        ref={conditionsRef}
        handleOnReady={handleOnReady}
        handleITH={contentType != "driver-landscape" ? setRange : null}
      ></ConditionSelection>
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
        leftContent={leftContent}
        rightContent={rightContent}
      ></SplitBar>
    </>
  );
};

export default Mutation;
