"use client";
import React, { useRef, useEffect, useState } from 'react';
import { getITHList, getPatientList } from "@/configs/request";
import VerticalTree from "@/components/vertical-tree"
import { getFullPhylogenetic, getFullMutations } from "@/configs/request";
import {
    Row,
    Col,
    Typography,
    Flex
} from 'antd';
import { useTranslation } from "react-i18next";
import EmptyLoading from "@/components/empty-loading";
import TreeDialog from "@/components/tree-dialog";
import generateGradientColors from "@/utils/ith-color";

const geneColorMap = ["#FF6B35", "#E1B12C", "#00CC99", "#9B59B6", "#007F50", "#FF9AA2", "#2D5D7B", "#6B8E23", "#FF5252", "#4CAF50", "#FF4081", "#3F51B5", "#FF9800", "#607D8B", "#E91E63", "#2196F3", "#4CAF50", "#795548", "#6C757D", "#2E5A88"];

const TimingAnalysis = ({ range = [0, 1], conditions }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [treeList, setTreeList] = useState(null);
    const rangePatientListRef = useRef(null);
    const currentPatientRef = useRef(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        setLoading(true);
        if (!conditions?.geneList) return;

        const fetchData = async (finialSampleList) => {
            let [ITHList, patientList] = await Promise.all([getITHList(), getPatientList()]);
            if (!ITHList || !patientList) return;
            const colors = generateGradientColors(100);
            let _patientList = ITHList?.map((item) => {
                const currentPatient = patientList.find((patient) => patient.patientId == item.publicationId);
                return {
                    ...currentPatient,
                    itemStyle: { color: colors[Math.round(item.ith?.toFixed(2) * 100) - 1] },
                    currentValue: item.ith?.toFixed(2)
                }
            })
            _patientList = _patientList?.sort((a, b) => a.currentValue - b.currentValue);
            rangePatientListRef.current = getPatientListByRange(_patientList);
            const treeWorker = new Worker('/workers/full-tree.js');
            getFullPhylogenetic().then((results) => {
                const treeList = rangePatientListRef.current.filter((item) => finialSampleList?.some((patient) => patient == item.patientId)).map((item) => {
                    const geneData = results?.filter((sample) => sample?.sampleId?.includes(`${item.patientId}_`))
                    return {
                        ...item,
                        geneData: geneData,
                    }
                })
                treeWorker.postMessage({ treeData: treeList });
                treeWorker.onmessage = ({ data: { treeList } }) => {
                    setTreeList(treeList);
                    setLoading(false);
                };
            });
        }
        const sampleWorker = new Worker('/workers/calculate.js');
        try {
            Promise.all([getFullMutations()]).then((results) => {
                sampleWorker.postMessage({ key: "filterGene", data: { originalMutations: results[0], conditions } });
                sampleWorker.onmessage = (event) => {
                    const result = event.data;
                    fetchData(result.finialSampleList);
                };
            });
        } catch (error) {

        }
        return () => {
            sampleWorker.terminate();
        };
    }, [range, conditions]);


    const getPatientListByRange = (_patientList) => {
        return _patientList?.filter((item) => {
            return item.currentValue >= range[0] && item.currentValue <= range[1];
        })
    }

    const handleClick = (patientId) => {
        currentPatientRef.current = rangePatientListRef.current.find((item) => item.patientId == patientId)
        setModalOpen(true)
    }

    return (
        <>
            <EmptyLoading loading={loading} hasData={!!treeList?.length}>
            <Row style={{ width: "100%" }}>
                {
                    treeList?.map((item, index) => {
                        return <Col key={index} xs={12} sm={12} md={12} lg={12}>
                            <EmptyLoading hasData={!!treeList?.length} loading={loading}>
                                <div style={{ margin: "10px", height: "350px", padding: "10px", boxShadow: "0 0 10px rgba(0, 0, 0, .05)", border: "1px solid #f0f0f0", borderRadius: "12px" }}>
                                    <Typography.Paragraph style={{ margin: 0, textAlign: "left" }}>
                                        {"Patient: "} <span style={{ fontWeight: "bold" }}>{item.patientId}</span>  {"ITH:"} <span style={{ fontWeight: "bold" }}> {item.currentValue}</span>
                                    </Typography.Paragraph>
                                    <Flex style={{ height: "300px" }}>
                                        <VerticalTree
                                            handleClick={() => {handleClick(item.patientId)}}
                                            color={item.itemStyle?.color}
                                            showTooltip={false}
                                            data={item.tree}
                                            geneList={conditions?.geneList}
                                        />
                                    </Flex>
                                </div>
                            </EmptyLoading>
                        </Col>
                    })
                }
            </Row>
        </EmptyLoading>
        <TreeDialog geneList={conditions?.geneList} treeData={currentPatientRef.current} modalOpen={modalOpen} onclose={() => { setModalOpen(false) }} />
        </>
    )
}

export default TimingAnalysis;