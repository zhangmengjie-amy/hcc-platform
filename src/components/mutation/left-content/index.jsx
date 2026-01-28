"use client";
import React, {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

import { useTranslation } from "react-i18next";
import DTPlanet from "@/components/condition-selector/dt-planet";
import GeneList from "@/components/condition-selector/gene-list";
import ITHSelector from "@/components/condition-selector/ITH-selector";
import ClinicalSelector from "@/components/condition-selector/clinical-selector";


const Conditions = forwardRef(( { handleOnReady, handleITH }, ref) => {
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
    paramsRef.current = {
      ...paramsRef.current,
      ...result,
    };
    handleOnReady(paramsRef.current);
  };

  return (
    <>
      <DTPlanet onChange={onSelection} onReady={onReady}></DTPlanet>
      {handleITH && <ITHSelector onChange={handleITH} onReady={handleITH}></ITHSelector>}
      <GeneList onChange={onSelection} onReady={onReady}></GeneList>
      <ClinicalSelector onChange={onSelection} onReady={onReady}></ClinicalSelector>
    </>
  );
});

export default Conditions;
