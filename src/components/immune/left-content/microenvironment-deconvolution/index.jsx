"use client";
import React, {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
} from "react";

import { useTranslation } from "react-i18next";
import CohortSelection from "@/components/condition-selector/cohort-table";
import FilterCohort from "@/components/condition-selector/filter-cohort";
import BiomarkersGene from "@/components/condition-selector/biomarkers-gene";
import DEGMethod from "@/components/condition-selector/deg-method";

const MicroenvironmentDeconvolutionCondition = forwardRef(( { handleOnReady }, ref) => {
  const { t } = useTranslation();
  const paramsRef = useRef(null);
  const [selectedClinical, setSelectedClinical] = useState([]);
  const [selectedClassify, setSelectedClassify] = useState("all");
  const [selectedTechnology, setSelectedTechnology] = useState("all");

  useImperativeHandle(ref, () => ({
    getParams: () => {
      return paramsRef.current;
    },
  }));

  const onFilterCohortSelection = useCallback((result) => {
    setSelectedClinical(result.selectedClinical),
    setSelectedClassify(result.selectedClassify),
    setSelectedTechnology(result.selectedTechnology);
  }, []);

  const onSelection = useCallback((result) => {
    paramsRef.current = {
      ...paramsRef.current,
      ...result,
    };
  }, []);


  const onReady = (result) => {
    paramsRef.current = {
      ...paramsRef.current,
      ...result,
    };
    handleOnReady(paramsRef.current);
  };

  return (
    <>
      {<FilterCohort onChange={onFilterCohortSelection}></FilterCohort>}
      {
        <CohortSelection
          selectedClassify={selectedClassify}
          selectedClinical={selectedClinical}
          selectedTechnology={selectedTechnology}
          onChange={onSelection}
          onReady={onReady}
          selectionType="radio"
        ></CohortSelection>
      }
      {<DEGMethod onChange={onSelection} onReady={onReady}></DEGMethod>}
    </>
  );
});

export default MicroenvironmentDeconvolutionCondition;