"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getExpressionpatientListRef } from "@/configs/request";
import { Flex, Row, Col, Empty } from 'antd';
import { getITHList, getPatientList, getLiverSamples } from "@/configs/request";
import { getFullPhylogenetic } from "@/configs/request";
import HorizontalTree from "@/components/horizontal-tree/index";
import LiverSampleChart from '@/components/liver-sample';
import EChartsReact from "echarts-for-react";
import SunburstChart from '@/components/sunburst';
import filterSampleByConditions from "@/utils/filter-patient";

const SUBTYPE_COLOR = {
    "C1": "rgb(79, 151, 121)",
    "C2": "rgb(72, 128, 187)",
    "C3": "rgb(150, 91, 164)",
    "C4": "rgb(167, 134, 56)",
    "C5": "rgb(238, 188, 57)",
    "C6": "rgb(218, 85, 76)",
}

const HEATMAP_COLORS = {
    "Lee_2004": {
        "SURVIVAL_UP": "rgb(94, 171, 214)",
        "SURVIVAL_DN": "rgb(255, 180, 180)"
    },
    "Hoshida_2009": {
        "S1": "rgb(250, 227, 198)",
        "S2": "rgb(250, 164, 189)",
        "S3": "rgb(245, 100, 169)"
    },
    "Boyault_2007": {
        "G3": "rgb(61, 194, 236)",
        "G12": "rgb(100, 226, 183)",
        "G56": "rgb(252, 199, 55)"
    },
    "Chiang_2008": {
        "INTERFERON": "rgb(251, 243, 193)",
        "UNANNOTATED": "rgb(220, 139, 224)",
        "POLYSOMY7": "rgb(213, 11, 139)",
        "PROLIFERATION": "rgb(207, 255, 226)",
        "CTNNB1": "rgb(244, 99, 30)"
    },
    "Subtype": {
        "C1": "rgb(79, 151, 121)",
        "C2": "rgb(72, 128, 187)",
        "C3": "rgb(150, 91, 164)",
        "C4": "rgb(167, 134, 56)",
        "C5": "rgb(238, 188, 57)",
        "C6": "rgb(218, 85, 76)",
    }
}

const mockFields = ['Lee_2004', 'Hoshida_2009', 'Boyault_2007', 'Chiang_2008', 'Subtype'];


const MIXED_GROUP = ["C1,C2", "C1,C3", "C1,C4", "C1,C5", "C1,C6", "C2,C3", "C2,C4", "C2,C5", "C2,C6", "C3,C4", "C3,C5", "C3,C6", "C4,C5", "C4,C6", "C5,C6",
    "C1,C2,C3", "C1,C2,C4", "C1,C2,C5", "C1,C2,C6", "C1,C3,C4", "C1,C3,C5", "C1,C3,C6", "C1,C4,C5", "C1,C4,C6", "C1,C5,C6", "C2,C3,C4", "C2,C3,C5", "C2,C3,C6", "C2,C4,C6", "C3,C4,C5", "C3,C4,C6", "C2,C4,C5", "C2,C5,C6", "C3,C5,C6", "C4,C5,C6",
    "C1,C2,C3,C4", "C1,C2,C3,C5", "C1,C2,C3,C6", "C1,C2,C4,C5", "C1,C2,C4,C6", "C1,C2,C5,C6", "C1,C3,C4,C5", "C1,C3,C4,C6", "C2,C3,C4,C5", "C1,C3,C5,C6", "C1,C4,C5,C6",
    "C2,C3,C4,C6", "C2,C3,C5,C6", "C2,C4,C5,C6", "C3,C4,C5,C6",
    "C1,C2,C3,C4,C5", "C1,C2,C3,C4,C6", "C2,C3,C4,C5,C6", "C1,C3,C4,C5,C6", "C1,C2,C3,C5,C6", "C1,C2,C4,C5,C6",
    "C1,C2,C3,C4,C5,C6"
]

const MIXED_PURE = {
    "Pure": "rgb(106, 194, 165)",
    "Mixed": "rgb(158, 153, 197)",
}

const MIXED_PURE_BG = {
    "Pure": "rgb(239, 249, 247)",
    "Mixed": "rgb(247, 240, 247)",
}

const STAGE_COLOR = {
    "I": "rgb(250, 213, 120)",
    "II": "rgb(245, 138, 66)",
    "III": "rgb(224, 36, 40)",
}

const defaultValue = 1;
const spaceValue = 0.5;
const SubtypeLandscape = ({ conditions }) => {
    const [option, setOption] = useState({});
    const [treeList, setTreeList] = useState(null);
    const [sampleMutations, setSampleMutations] = useState(null);
    const [currentPatientId, setCurrentPatientId] = useState(null);
    const [mockHeatmap, setMockHeatmap] = useState(null);
    const [patientList, setPatientList] = useState([]);
    const [currentLiverSamples, setCurrentLiverSamples] = useState(null);
    const patientListRef = useRef(null);
    const filteredListRef = useRef(null);
    const liverSamplesRef = useRef(null);
    useEffect(() => {
        const { geneList, ...clinicList } = conditions;
        const filteredData = filterSampleByConditions(patientListRef.current, clinicList, geneList) ?? [];
        setPatientList(filteredData);
    }, [conditions]);

    useEffect(() => {
         getPatientList().then((data) => {
            let patientId = data?.[0]?.patientId;
            patientListRef.current = data;
            setPatientList(data);
            setCurrentPatientId(patientId);
        })

        getLiverSamples().then((data) => {
            liverSamplesRef.current = data;
        })

    }, []);

    const buildTreeData = (newick, patientId) => {
        const treeWorker = new Worker('/workers/tree.js');
        getFullPhylogenetic().then((results) => {
            const geneData = results?.filter((item) => item?.sampleId?.includes(`${patientId}_`))
            treeWorker.postMessage({ newick: newick, geneData });
            treeWorker.onmessage = ({ data }) => {
                setTreeList(data.treeList);
                setSampleMutations(data.sampleMutations);
            };
        });
    }

    useEffect(() => {
        let newick = null;
        let patientId = currentPatientId;
        if (!currentPatientId) {
            patientId = patientList?.[0]?.patientId;
        }
        newick = patientList?.find((item) => item.patientId == currentPatientId)?.newick;
        if (newick && patientId) {
            buildHeatMap(patientId);
            buildTreeData(newick, patientId);
        }
        const currentLiver = liverSamplesRef.current?.filter((item) => item.patientId === patientId);
        setCurrentLiverSamples(currentLiver);
    }, [currentPatientId, patientList]);

    const buildHeatMap = (patientId) => {
        let samples = patientList?.find((subtypeItem) => subtypeItem.patientId == patientId)?.samples ?? [];
        if (samples.length) {
            const _mockHeatmap = {};
            samples.forEach((sample) => {
                _mockHeatmap[sample.id] = {
                    "Boyault_2007": {
                        color: HEATMAP_COLORS["Boyault_2007"][sample.Boyault_2007],
                        value: sample.Boyault_2007
                    },
                    "Chiang_2008": {
                        color: HEATMAP_COLORS["Chiang_2008"][sample.Chiang_2008],
                        value: sample.Chiang_2008
                    },
                    "Hoshida_2009": {
                        color: HEATMAP_COLORS["Hoshida_2009"][sample.Hoshida_2009],
                        value: sample.Hoshida_2009
                    },
                    "Lee_2004": {
                        color: HEATMAP_COLORS["Lee_2004"][sample.Lee_2004],
                        value: sample.Lee_2004
                    },
                    "Subtype": {
                        color: HEATMAP_COLORS["Subtype"][sample.subtype],
                        value: sample.subtype
                    }

                }
            })
            setMockHeatmap(_mockHeatmap);
        }
    }
    return (
        <>
            <Row>
                <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                    <Flex align='center' style={{ border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                        <SunburstChart data={patientList} handleItemClick={setCurrentPatientId}></SunburstChart>
                        {/* <EChartsReact style={{ width: "100%", height: "320px" }} option={option} onEvents={{ click: handleClick }} opts={{ renderer: 'svg' }}></EChartsReact> */}
                    </Flex>

                    {/* <Flex>
                    <Flex vertical style={{ marginLeft: "10px" }}>
                        <Flex style={{ marginBottom: "10px" }}>Stage</Flex>
                        {
                            Object.keys(STAGE_COLOR).map((item) => {
                                return <Flex key={item} align='center'><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: STAGE_COLOR[item] }}></span><span>{item}</span></Flex>
                            })
                        }
                    </Flex>

                    <Flex vertical style={{ marginLeft: "10px" }}>
                        <Flex style={{ marginBottom: "10px" }}>Subtype</Flex>
                        {
                            Object.keys(SUBTYPE_COLOR).map((item) => {
                                return <Flex key={item} align='center'><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: SUBTYPE_COLOR[item] }}></span><span>{item}</span></Flex>
                            })
                        }
                    </Flex>
                </Flex> */}
                </Col>
                <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                    <Flex align='center' style={{ border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                        <HorizontalTree adaptive alignLabel={true} heatmapFields={mockFields} heatmapData={mockHeatmap} data={treeList} sampleMutations={sampleMutations} color={"rgb(106, 194, 165)"}></HorizontalTree>
                    </Flex>
                </Col>
            </Row>
            <Row >
                <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                    <Flex align='center' style={{ border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                        <LiverSampleChart data={currentLiverSamples?.[0]}></LiverSampleChart>
                    </Flex>
                </Col>
                <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                    <Flex align='center' style={{ border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                       {
                        currentLiverSamples?.[1] ? <LiverSampleChart data={currentLiverSamples?.[1]}></LiverSampleChart> :  <Empty style={{ width: '100%', padding: "20px" }}>
                                        </Empty>
                       }
                       
                    </Flex>
                </Col>
            </Row>
        </>
    )
}

export default SubtypeLandscape;