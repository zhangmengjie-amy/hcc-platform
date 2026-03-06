
/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
"use client";
import React, {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

import { useTranslation } from "react-i18next";
import CohortSelection from "@/components/common/condition-selector/cohort-table";
import FilterCohort from "@/components/common/condition-selector/filter-cohort";
import BiomarkersGene from "@/components/common/condition-selector/biomarkers-gene";

const SurvivalAnalysisCondition = forwardRef(( { handleOnReady }, ref) => {
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
          type="biomarkers_module1"
          selectedClassify={selectedClassify}
          selectedClinical={selectedClinical}
          selectedTechnology={selectedTechnology}
          onChange={onSelection}
          onReady={onReady}
        ></CohortSelection>
      }
      {<BiomarkersGene onChange={onSelection} onReady={onReady}></BiomarkersGene>}
    </>
  );
});

export default SurvivalAnalysisCondition;
