"use client";
import React, { useRef, useEffect, useState } from 'react';
import { getITHList, getNewick, getPatientList} from "@/configs/request";
import VerticalTree from "@/components/vertical-tree"
import { getFullPhylogenetic, getFullMutations } from "@/configs/request";
import {
    Row,
    Col,
    Typography,
    Flex
} from 'antd';
import distinctColors from '@/utils/colors';
import { useTranslation } from "react-i18next";
import EmptyLoading from "@/components/empty-loading";
import TreeDialog from "@/components/tree-dialog";
import generateGradientColors from "@/utils/ith-color";


const TimingAnalysis = ({ range = [0, 1], dataType=["planet"], conditions }) => {
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
            let [ITHList] = await Promise.all([getPatientList(dataType.length == 2 ? null : dataType[0])]);
            if (!ITHList) return;
            const colors = generateGradientColors(100);
            let _patientList = ITHList?.filter((item) => !!item.newick)?.map((item) => {
               return {
                    ...item,
                    itemStyle: { color: colors[item.ith == 0 ? 0 : (Math.round((Number(item.ith)?.toFixed(2) ?? 1) * 100) - 1)] },
                    ith: (Number(item.ith))?.toFixed(2) ?? 1
                }
            })
            _patientList = _patientList?.sort((a, b) => a.ith - b.ith);
            rangePatientListRef.current = getPatientListByRange(_patientList);
            const treeWorker = new Worker('/workers/full-tree.js');
            getFullPhylogenetic(dataType.length == 2 ? null : dataType[0]).then((results) => {
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
            Promise.all([getFullMutations(dataType.length == 2 ? null : dataType[0])]).then((results) => {
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
    }, [range, conditions, dataType]);


    const getPatientListByRange = (_patientList) => {
        return _patientList?.filter((item) => {
            return item.ith >= range[0] && item.ith <= range[1];
        })
    }

    const handleClick = (patientId) => {
        currentPatientRef.current = rangePatientListRef.current.find((item) => item.patientId == patientId)
        setModalOpen(true)
    }

    return (
        <>
            <EmptyLoading loading={loading} showEmpty={true} hasData={!!treeList?.length}>
            <Row style={{ width: "100%" }}>
                {
                    treeList?.map((item, index) => {
                        return <Col key={index} xs={12} sm={12} md={12} lg={12} style={{cursor:"pointer"}}>
                            <EmptyLoading hasData={!!treeList?.length} loading={loading}>
                                <div style={{ margin: "10px", height: "350px", padding: "10px", boxShadow: "0 0 10px rgba(0, 0, 0, .05)", border: "1px solid #f0f0f0", borderRadius: "12px" }}>
                                    <Typography.Paragraph style={{ margin: 0, textAlign: "left" }}>
                                        {"Patient: "} <span style={{ fontWeight: "bold" }}>{item.patientId}</span>  {"ITH:"} <span style={{ fontWeight: "bold" }}> {item.ith}</span>
                                    </Typography.Paragraph>
                                    <Flex style={{ height: "300px" }}>
                                        <VerticalTree
                                            circleRadius={6} 
                                            handleClick={() => {handleClick(item.patientId)}}
                                            color={item.itemStyle?.color}
                                            showTooltip={false}
                                            data={item.tree}
                                            baseline="left" 
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
        {
            modalOpen && <TreeDialog geneList={conditions?.geneList} dataType={dataType} treeData={currentPatientRef.current} modalOpen={modalOpen} onclose={() => { setModalOpen(false) }} />
        }
        
        </>
    )
}

export default TimingAnalysis;