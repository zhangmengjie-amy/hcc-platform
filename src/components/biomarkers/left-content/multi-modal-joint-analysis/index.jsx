"use client";
import React, {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

import { useTranslation } from "react-i18next";
import BiomarkersGene from "@/components/condition-selector/biomarkers-gene";
import DTPlanet from "@/components/condition-selector/dt-planet";
import ClinicalSelector from "@/components/condition-selector/clinical-selector";

const MultiModalJointAnalysisCondition = forwardRef(( { handleOnReady }, ref) => {
  const { t } = useTranslation();
  const paramsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getParams: () => {
      return paramsRef.current;
    },
  }));

  const onSelection = useCallback((result) => {
    paramsRef.current = {
      ...paramsRef.current,
      ...result,
    };
  }, []);


  const onReady = (result) => {
    onSelection(result);
    handleOnReady?.(paramsRef.current);
  };

  return (
    <>
      <DTPlanet onChange={onSelection} onReady={onReady}></DTPlanet>
      <ClinicalSelector onChange={onSelection}></ClinicalSelector>
      <BiomarkersGene onChange={onSelection} onReady={onReady}></BiomarkersGene>
    </>
  );
});

export default MultiModalJointAnalysisCondition;
