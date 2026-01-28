"use client";
import React, {
  useState,
  useMemo,
} from "react";
import SplitBar from "@/components/split-bar";
import Overall from "@/components/overall";
import ClinicalConditions from "@/components/condition-selector/clinical-selector";
import CohortType from "@/components/condition-selector/dt-planet";
import {
  Alert,
} from "antd";
import { useTranslation } from "react-i18next";

const Biomarkers = () => {
  const { t } = useTranslation();
  const [selectedCohortType, setSelectedCohortType] = useState("PLANET");
  const [clinicalConditions, setClinicalConditions] = useState(null);

  const handleCohortType = (value) => {
    setSelectedCohortType(value?.selectedCohortType ?? "PLANET");
  };

  const handleClinicalChange = (value) => {
    setClinicalConditions(value?.clinicalConditions);
  };

  const leftContent = useMemo(() => {
    return (
      <>
        <CohortType onChange={handleCohortType}></CohortType>
        <ClinicalConditions onChange={handleClinicalChange}></ClinicalConditions>
      </>
    );
  }, []);

  const rightContent = useMemo(() => {
    return (
      <>
        <Alert
          message="In this genomic modal, you will be able to explore the driver status (“Driver Landscape”) as well as Phylogenetic Relationship of the PLANet and Ditan cohort."
        ></Alert>
        <Overall conditions={clinicalConditions} selectedCohortType={selectedCohortType}></Overall>
      </>
    );
  }, [clinicalConditions, selectedCohortType]);

  return (
    <>
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
