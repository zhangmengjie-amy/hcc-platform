/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

"use client";
import React, {
  useState,
  useMemo,
} from "react";
import SplitBar from "@/components/common/split-bar";
import Overall from "@/components/modules/clinical/overall";
import ClinicalConditions from "@/components/common/condition-selector/clinical-selector";
import CohortType from "@/components/common/condition-selector/dt-planet";
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
