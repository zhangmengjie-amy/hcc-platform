"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Row, Col } from 'antd';
import { getFullMutations, getFullClinical } from "@/configs/request";
import ClinicChart from './clinicChart';
import GeneChart from './geneChart';
import MutationChart from './mutationChart';
import SampleChart from "./sampleChart";
import ChartsLegend from "./chartsLegend";
import { sample } from 'lodash';

const DriverLandscape = ({ handleApplyLoading, conditions }) => {
    const [sampleMutations, setSampleMutations] = useState(null);
    const [genesCategories, setGenesCategories] = useState(null);
    const [genesMutations, setGenesMutations] = useState(null);
    const [sampleGenesMutations, setSampleGenesMutations] = useState(null);
    const [sampleCategories, setSampleCategories] = useState(null);
    const [height, setHeight] = useState(0);
    const [clinicList, setClinicList] = useState(null);
    const [finialGeneList, setFinialGeneList] = useState(null);
    const fullMutationsRef = useRef(null);
    const fullClinicalRef = useRef(null);
    useEffect(() => {
        if (!conditions?.geneList) return;
        handleApplyLoading?.(true);
        const sampleWorker = new Worker('/workers/calculate.js');
        try {

            Promise.all([getFullMutations()]).then((results) => {
                fullMutationsRef.current = results[0];
                sampleWorker.postMessage({ key: "driverLandscape", data: { originalMutations: fullMutationsRef.current, conditions } });
                sampleWorker.onmessage = (event) => {
                    const result = event.data;
                    setSampleMutations(result.sampleMutations);
                    setGenesCategories(result.genesCategories);
                    setGenesMutations(result.genesMutations);
                    setSampleGenesMutations(result.sampleGenesMutations);
                    setFinialGeneList(result.finialGeneList);
                    setClinicList(result.clinicList);
                    setSampleCategories(result.sampleCategories);
                    setHeight(result.finialGeneList.length * 10 + 30);
                };
                handleApplyLoading?.(false);
            });
        } catch (error) {

        }
        return () => {
            sampleWorker.terminate();
        };
    }, [conditions]);

    return (
        <Row style={{ width: "100%", padding: "15px" }}>
            <Row style={{ width: "100%" }}>
                <Col xs={21} md={21}>
                    <MutationChart sampleMutations={sampleMutations} sampleCategories={sampleCategories}></MutationChart>
                </Col>
            </Row>

            <Row style={{ width: '100%' }}>
                <Col xs={21} md={21}>
                    <SampleChart sampleType={conditions.sampleType} sampleGenesMutations={sampleGenesMutations} finialGeneList={finialGeneList} sampleCategories={sampleCategories} height={height}></SampleChart>
                </Col>
                <Col xs={3} md={3}>
                    <GeneChart genesMutations={genesMutations} finialGeneList={finialGeneList} height={height}></GeneChart>
                </Col>
            </Row>
            <Row style={{ width: '100%' }}>
                <Col xs={21} md={21}>
                    <ClinicChart clinicList={clinicList}></ClinicChart>
                </Col>
            </Row>
            <ChartsLegend></ChartsLegend>
        </Row>
    );
}
export default DriverLandscape;
