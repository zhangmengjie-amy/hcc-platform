"use client";
import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { Row, Col, Alert } from 'antd';
import { getFullMutations, getDTMutations } from "@/configs/request";
import ClinicChart from './clinicChart';
import GeneChart from './geneChart';
import MutationChart from './mutationChart';
import SampleChart from "./sampleChart";
import ChartsLegend from "./chartsLegend";

const DriverLandscape = forwardRef(({ dataType = "planet", handleApplyLoading, sampleType = "bySample", conditions }, ref) => {
    const [sampleMutations, setSampleMutations] = useState(null);
    const [genesMutations, setGenesMutations] = useState(null);
    const [sampleGenesMutations, setSampleGenesMutations] = useState(null);
    const [sampleCategories, setSampleCategories] = useState(null);
    const [height, setHeight] = useState(0);
    const [loading, setLoading] = useState(true);
    const [clinicList, setClinicList] = useState(null);
    const [finialGeneList, setFinialGeneList] = useState(null);
    const fullMutationsRef = useRef(null);


    useEffect(() => {
        if (!conditions?.geneList) return;
        if (fullMutationsRef.current) {
            buildMutation()
        } else {
            getFullMutations(null).then((results) => {
                fullMutationsRef.current = results;
                buildMutation();
            }
            )
        }

    }, [conditions, sampleType, dataType]);

    const buildMutation = () => {
        handleApplyLoading?.(false);
        setLoading(false);
        const sampleWorker = new Worker('/workers/calculate.js');
        try {
            console.log(dataType?.toUpperCase())
            let fullMutations = fullMutationsRef.current;
            if (dataType !== "all") fullMutations = fullMutationsRef.current.filter((item) => item.type === dataType?.toUpperCase());
            
            sampleWorker.postMessage({ key: "driverLandscape", data: { sampleType, originalMutations: fullMutations, conditions } });
            sampleWorker.onmessage = (event) => {
                const result = event.data;
                setSampleMutations(result.sampleMutations);
                setGenesMutations(result.genesMutations);
                setSampleGenesMutations(result.sampleGenesMutations);
                setFinialGeneList(result.finialGeneList);
                setClinicList(result.clinicList);
                setSampleCategories(result.sampleCategories);
                setHeight(result.finialGeneList.length * 8 + 30);
            };
            handleApplyLoading?.(false);
            setLoading(false);
        } catch (error) {
            console.log("error")
        }
        return () => {
            sampleWorker.terminate();
        };
    }

    return (
        <div ref={ref} style={{ margin: "0 10px" }}>
            <Alert message={<><span>Oncoprint plot is an efficient way displaying the driver status across samples and patients. In this page, you will be able to sub-select samples and drivers based on the criterion shown on the left. </span> <span>Please Refer to <a href="https://jokergoo.github.io/ComplexHeatmap-reference/book/oncoprint.html">OncoPrint</a></span></>} type="info" />
            <Row style={{ width: "100%" }}>
                <Col xs={21} sm={21} md={21} lg={21} xl={21}>
                    <MutationChart sampleMutations={sampleMutations} sampleCategories={sampleCategories} finialGeneList={finialGeneList}></MutationChart>
                </Col>
            </Row>

            <Row style={{ width: '100%' }}>
                <Col xs={21} sm={21} md={21} lg={21} xl={21}>
                    <SampleChart sampleType={sampleType} sampleGenesMutations={sampleGenesMutations} finialGeneList={finialGeneList} sampleCategories={sampleCategories} height={height}></SampleChart>
                </Col>
                <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                    <GeneChart genesMutations={genesMutations} finialGeneList={finialGeneList} height={height}></GeneChart>
                </Col>
            </Row>
            <Row style={{ width: '100%' }}>
                <Col xs={21} sm={21} md={21} lg={21} xl={21}>
                    <ClinicChart clinicList={clinicList}></ClinicChart>
                </Col>
            </Row>
            <ChartsLegend></ChartsLegend>
        </div>
    );
})
export default DriverLandscape;
