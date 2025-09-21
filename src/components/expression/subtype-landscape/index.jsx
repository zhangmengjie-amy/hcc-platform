"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { getExpressionpatientListRef } from "@/configs/request";
import { Flex, Row, Col, Empty, Spin } from 'antd';
import { getITHList, getPatientList, getLiverSamples } from "@/configs/request";
import { getFullPhylogenetic } from "@/configs/request";
import HorizontalTree from "@/components/horizontal-tree/index";
import LiverSampleChart from '@/components/liver-sample';
import EChartsReact from "echarts-for-react";
import SunburstChart from '@/components/expression/subtype-landscape/sunburst';
import ColumnChart from '@/components/expression/subtype-landscape/column';
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
    "lee": {
        "SURVIVAL_UP": "rgb(94, 171, 214)",
        "SURVIVAL_DN": "rgb(255, 180, 180)"
    },
    "hoshida": {
        "S1": "rgb(250, 227, 198)",
        "S2": "rgb(250, 164, 189)",
        "S3": "rgb(245, 100, 169)"
    },
    "boyault": {
        "G2": "rgba(241, 90, 209, 1)",
        "G3": "rgb(61, 194, 236)",
        "G4": "rgb(100, 226, 183)",
        "G5": "rgba(217, 106, 37, 1)",
        "G6": "rgb(252, 199, 55)"
    },
    "chiang": {
        "INTERFERON": "rgb(251, 243, 193)",
        "UNANNOTATED": "rgb(220, 139, 224)",
        "POLYSOMY7": "rgb(213, 11, 139)",
        "PROLIFERATION": "rgb(207, 255, 226)",
        "CTNNB1": "rgb(244, 99, 30)"
    },
    "subtype": {
        "C1": "rgb(79, 151, 121)",
        "C2": "rgb(72, 128, 187)",
        "C3": "rgb(150, 91, 164)",
        "C4": "rgb(167, 134, 56)",
        "C5": "rgb(238, 188, 57)",
        "C6": "rgb(218, 85, 76)",
    }
}

const mockFields = ['lee', 'hoshida', 'boyault', 'chiang', 'subtype'];


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

const STAGE_TRANS = {
    "I": "I",
    "II": "II",
    "IA": "I",
    "IB": "I",
    "Ib": "I",
    "IIA": "II",
    "IIB": "II",
    "IIIA": "III",
    "IIIB": "III",
    "III A": "III",
}


const defaultValue = 1;
const spaceValue = 0.5;
const SubtypeLandscape = ({ conditions, dataType = ["planet"] }) => {
    const [option, setOption] = useState({});
    const [loading, setLoading] = useState(false);
    const [treeList, setTreeList] = useState(null);
    const [sampleGeneData, setSampleGeneData] = useState(null);
    const [currentPatientId, setCurrentPatientId] = useState(null);
    const [mockHeatmap, setMockHeatmap] = useState(null);
    const [patientList, setPatientList] = useState([]);
    const [currentLiverSamples, setCurrentLiverSamples] = useState(null);
    const patientListRef = useRef(null);
    useEffect(() => {
        const { geneList, ...clinicList } = conditions;
        const filteredData = filterSampleByConditions(patientListRef.current, clinicList, geneList) ?? [];
        setPatientList(filteredData);
    }, [conditions]);

    useEffect(() => {
        getPatientList(dataType.length == 2 ? null : dataType[0]).then((data) => {
            patientListRef.current = data?.filter((item) => !!item.subtypes?.length).map((item) => {
                return {
                    ...item,
                    stage: STAGE_TRANS[item.stage]
                }
            });
            let patientId = patientListRef.current?.[0]?.patientId;
            setPatientList(patientListRef.current);
            setCurrentPatientId(patientId);
        })

    }, [dataType]);

    const buildTreeData = (newick, patientId) => {
        setLoading(true)
        const treeWorker = new Worker('/workers/tree.js');
        getFullPhylogenetic(dataType.length == 2 ? null : dataType[0]).then((results) => {
            const geneData = results?.filter((item) => item?.sampleId?.includes(`${patientId}_`))
            treeWorker.postMessage({ newick: newick, geneData });
            treeWorker.onmessage = ({ data }) => {
                setTreeList(data.treeList);
                setSampleGeneData(data.sampleGeneData);
                setLoading(false);
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
        const currentLiver = patientList?.find((item) => item.patientId === patientId)?.tumors.map((tumor) => {
            return {
                ...tumor,
                patientId: patientId
            }
        });
        setCurrentLiverSamples(currentLiver);
    }, [currentPatientId, patientList, dataType]);

    function formatLabel(str) {
        return str?.replace(/.*_/, '') ?? str;
    }
    const buildHeatMap = (patientId) => {
        let subtypes = patientList?.find((subtypeItem) => subtypeItem.patientId == patientId)?.subtypes ?? [];
        if (subtypes.length) {
            const _mockHeatmap = {};
            subtypes.forEach((sample) => {
                _mockHeatmap[formatLabel(sample.id)] = {
                    "boyault": {
                        color: HEATMAP_COLORS["boyault"][sample.boyault],
                        value: sample.boyault
                    },
                    "chiang": {
                        color: HEATMAP_COLORS["chiang"][sample.chiang],
                        value: sample.chiang
                    },
                    "hoshida": {
                        color: HEATMAP_COLORS["hoshida"][sample.hoshida],
                        value: sample.hoshida
                    },
                    "lee": {
                        color: HEATMAP_COLORS["lee"][sample.lee],
                        value: sample.lee
                    },
                    "subtype": {
                        color: HEATMAP_COLORS["subtype"][sample.subtype],
                        value: sample.subtype
                    }

                }
            })
            setMockHeatmap(_mockHeatmap);
        }
    }

    const renderDtColumns = useMemo(() => {
        return dataType.map((item) => {
            if (item == "planet") {
                return <SunburstChart data={patientList.filter((item) => item.type === "PLANET")} handleItemClick={setCurrentPatientId}></SunburstChart>
            } else {
                return <ColumnChart data={patientList.filter((item) => item.type === "DT")} handleItemClick={setCurrentPatientId}></ColumnChart>
            }
        })
    }, [dataType, patientList])
    return (
        <>
            <Row>
                <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                    <Flex vertical align='center' style={{ border: "1px solid #f5f5f5", height: `${dataType?.length > 1 ? "1000px" : "700px"}`, padding: "20px 0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                        {renderDtColumns}
                        <Flex style={{ marginTop: "30px" }}><Flex vertical style={{ marginLeft: "10px" }}>
                            <Flex align='center' style={{ marginBottom: "10px" }}>Pure or Mixed</Flex>
                            {
                                Object.keys(MIXED_PURE).map((item) => {
                                    return <Flex key={item} align='center'><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: MIXED_PURE[item] }}></span><span>{item}</span></Flex>
                                })
                            }
                        </Flex>
                            <Flex vertical style={{ marginLeft: "10px" }}>
                                <Flex align='center' style={{ marginBottom: "10px" }}>Stage</Flex>
                                {
                                    Object.keys(STAGE_COLOR).map((item) => {
                                        return <Flex key={item} align='center'><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: STAGE_COLOR[item] }}></span><span>{item}</span></Flex>
                                    })
                                }
                            </Flex>

                            <Flex vertical style={{ marginLeft: "10px" }}>
                                <Flex align='center' style={{ marginBottom: "10px" }}>Subtype</Flex>
                                {
                                    Object.keys(SUBTYPE_COLOR).map((item) => {
                                        return <Flex key={item} align='center'><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: SUBTYPE_COLOR[item] }}></span><span>{item}</span></Flex>
                                    })
                                }
                            </Flex>
                            <Flex vertical style={{ marginLeft: "10px" }}>
                                <Flex align='center' style={{ marginBottom: "10px" }}>Samples</Flex>
                                {
                                    [...Array(7)].map((_, i) => {
                                        const tStage = `T${i + 1}`;

                                        return (
                                            <Flex key={tStage} align='center'>
                                                <svg width="20" height="16" style={{ marginRight: "5px", transform: `scale(${1 / (i * 0.05 + 1)})` }} >
                                                    <polygon points="0,0 5,16 15,16 20,0" style={{ fill: "#fff", strokeWidth: 1, stroke: "#000" }} />
                                                </svg>
                                                <span>{tStage}</span>
                                            </Flex>
                                        );
                                    })
                                }
                            </Flex>
                        </Flex>
                    </Flex>

                </Col>
                <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                    <Row style={{ marginBottom: "20px" }}>
                        <Col xs={24} sm={24} md={24} style={{ width: "100%", padding: "10px", height: "340px", border: "1px solid #f5f5f5", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                            {currentPatientId}
                            {!loading ? 
                                treeList ? <HorizontalTree adaptive alignLabel={true} heatmapFields={mockFields} heatmapData={mockHeatmap} data={treeList} sampleGeneData={sampleGeneData} color={"rgb(106, 194, 165)"}></HorizontalTree> : <Empty style={{ width: '100%', padding: "20px" }} />
                             : <Flex align='center' justify='center' style={{ width: "100%", height: "100%" }}>
                                <Spin spinning={true} ></Spin>
                            </Flex>}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={24} sm={24} md={24} style={{ display: "flex" }}>
                            <Flex flex="1" align='center' style={{ border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                                {
                                    currentLiverSamples?.[0] ? <LiverSampleChart data={currentLiverSamples?.[0]}></LiverSampleChart> : <Empty style={{ width: '100%', padding: "20px" }} />

                                }
                            </Flex>
                            {
                                currentLiverSamples?.[1] && <Flex flex="1" align='center' style={{ border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                                    {
                                        currentLiverSamples?.[1] ? <LiverSampleChart data={currentLiverSamples?.[1]}></LiverSampleChart> : <Empty style={{ width: '100%', padding: "20px" }} />
                                    }
                                </Flex>
                            }
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

export default SubtypeLandscape;