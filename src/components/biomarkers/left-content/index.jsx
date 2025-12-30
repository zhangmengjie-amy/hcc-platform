"use client";
import React, {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

import { useTranslation } from "react-i18next";
import CohortSelection from "@/components/condition-selector/cohort-selection";
import FilterCohort from "@/components/condition-selector/filter-cohort";
import BiomarkersGene from "@/components/condition-selector/biomarkers-gene";

const LeftContent = forwardRef(( {}, ref) => {
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

  const onCohortSelection = useCallback((result) => {
    paramsRef.current = {
      ...paramsRef.current,
      ...result,
    };
  }, []);

  const onGeneSelection = useCallback((result) => {
    paramsRef.current = {
      ...paramsRef.current,
      ...result,
    };
  }, []);

  return (
    <>
      {<FilterCohort onChange={onFilterCohortSelection}></FilterCohort>}
      {
        <CohortSelection
          selectedClassify={selectedClassify}
          selectedClinical={selectedClinical}
          selectedTechnology={selectedTechnology}
          onChange={onCohortSelection}
        ></CohortSelection>
      }
      {<BiomarkersGene onChange={onGeneSelection}></BiomarkersGene>}
    </>
  );
});

export default LeftContent;
