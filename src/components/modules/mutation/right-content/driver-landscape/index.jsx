/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
"use client";
import React, { useEffect, useRef, useState, forwardRef } from "react";
import { Row, Col, Alert } from "antd";
import { getFullMutations } from "@/configs/request";
import ClinicChart from "./clinic-chart";
import GeneChart from "./gene-chart";
import MutationChart from "./mutation-chart";
import SampleChart from "./sample-chart";
import ChartsLegend from "./charts-legend";
import { useTranslation } from "react-i18next";

const DriverLandscape = forwardRef(({ dataType = "PLANET", handleComplete, sampleType = "sortedBySample", conditions }, ref) => {
  const [sampleMutations, setSampleMutations] = useState(null);
  const [genesMutations, setGenesMutations] = useState(null);
  const [sampleGenesMutations, setSampleGenesMutations] = useState(null);
  const [sampleCategories, setSampleCategories] = useState(null);
  const [height, setHeight] = useState(0);
  const [clinicList, setClinicList] = useState(null);
  const [finialGeneList, setFinialGeneList] = useState(null);
  const fullMutationsRef = useRef(null);
  const { t } = useTranslation();


  useEffect(() => {
    if (!conditions?.geneList) return;
    if (fullMutationsRef.current) {
      buildMutation();
    } else {
      getFullMutations(null).then((results) => {
        fullMutationsRef.current = results?.data ?? [];
        buildMutation();
      },
      );
    }

  }, [conditions, sampleType, dataType]);

  const buildMutation = () => {
    handleComplete?.(true);
    const sampleWorker = new Worker("/workers/calculate.js");
    try {

      let fullMutations = fullMutationsRef.current;
      if (dataType !== "all") fullMutations = fullMutationsRef.current.filter((item) => item.type === dataType?.toUpperCase());
            
      sampleWorker.postMessage({ key: "driverLandscape", data: { sampleType, originalMutations: fullMutations, conditions } });
      sampleWorker.onmessage = (event) => {
        const result = event.data;
        result.sampleMutations?.length && setSampleMutations(result.sampleMutations);
        result.genesMutations?.length && setGenesMutations(result.genesMutations);
        Object.keys(result.sampleGenesMutations)?.length && setSampleGenesMutations(result.sampleGenesMutations);
        result.finialGeneList?.length && setFinialGeneList(result.finialGeneList);
        result.clinicList?.length && setClinicList(result.clinicList);
        result.sampleCategories?.length && setSampleCategories(result.sampleCategories);
        setHeight(result.finialGeneList.length * 8 + 30);
      };
      handleComplete?.(true);
    } catch (error) {
      console.log("error");
    }
    return () => {
      sampleWorker.terminate();
    };
  };

  return (
    <div ref={ref}>
      <Row style={{ width: "100%" }}>
        <Col xs={21} sm={21} md={21} lg={21} xl={21}>
          <MutationChart sampleMutations={sampleMutations} sampleCategories={sampleCategories} finialGeneList={finialGeneList}></MutationChart>
        </Col>
      </Row>

      <Row style={{ width: "100%" }}>
        <Col xs={21} sm={21} md={21} lg={21} xl={21}>
          <SampleChart sampleType={sampleType} sampleGenesMutations={sampleGenesMutations} finialGeneList={finialGeneList} sampleCategories={sampleCategories} height={height}></SampleChart>
        </Col>
        <Col xs={3} sm={3} md={3} lg={3} xl={3}>
          <GeneChart genesMutations={genesMutations} finialGeneList={finialGeneList} height={height}></GeneChart>
        </Col>
      </Row>
      <Row style={{ width: "100%" }}>
        <Col xs={21} sm={21} md={21} lg={21} xl={21}>
          <ClinicChart clinicList={clinicList} finialGeneList={finialGeneList}></ClinicChart>
        </Col>
      </Row>
      <ChartsLegend></ChartsLegend>
    </div>
  );
});
export default DriverLandscape;
