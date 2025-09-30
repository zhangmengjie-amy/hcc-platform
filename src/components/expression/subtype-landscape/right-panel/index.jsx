"use client";
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Flex, Row, Col, Empty, Spin } from 'antd';
import { getPatientList } from "@/configs/request";
import { getFullPhylogenetic } from "@/configs/request";
import HorizontalTree from "@/components/horizontal-tree/index";
import LiverSampleChart from '@/components/liver-sample';
import Image from 'next/image';
import SunburstChart from '@/components/expression/subtype-landscape/right-panel/sunburst';
import ColumnChart from '@/components/expression/subtype-landscape/right-panel/column';
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
const RightPanel = ({ conditions, dataType = "planet" }) => {
    const [planetTreeLoading, setPlanetTreeLoading] = useState(false);
    const [dtTreeLoading, setDtTreeLoading] = useState(false);
    const [planetTreeList, setPlanetTreeList] = useState(null);
    const [planetSampleGeneData, setPlanetSampleGeneData] = useState(null);
    const [dtTreeList, setDtTreeList] = useState(null);
    const [dtSampleGeneData, setDtSampleGeneData] = useState(null);
    const [currentPlanetPatientId, setCurrentPlanetPatientId] = useState(null);
    const [currentDtPatientId, setCurrentDtPatientId] = useState(null);
    const [planetHeatmap, setPlanetHeatmap] = useState(null);
    const [dtHeatmap, setDtHeatmap] = useState(null);
    const [currentLiverSamples, setCurrentLiverSamples] = useState(null);
    const patientListRef = useRef(null);
    const [filterdPatientList, setFilterdPatientList] = useState([]);
    const geneListRef = useRef(null);
    useEffect(() => {
        conditions["stage"] = Array.from(new Set(conditions["stage"]?.map((item) => STAGE_TRANS[item])));
        const { geneList, ...clinicList } = conditions;
        const filteredData = filterSampleByConditions(patientListRef.current, clinicList, geneList) ?? [];
        setFilterdPatientList(filteredData);
    }, [conditions]);

    useEffect(() => {
        if (patientListRef.current?.length && geneListRef.current?.length) {
            setCurrentPlanetPatientId(filterdPatientList?.filter((item) => item.type === "PLANET")[0]?.patientId);
            setCurrentDtPatientId(filterdPatientList?.filter((item) => item.type === "DT")[0]?.patientId);
        };
    }, [dataType, filterdPatientList]);


    useEffect(() => {
        setDtTreeLoading(true);
        setPlanetTreeLoading(true);
        Promise.all([getPatientList(null), getFullPhylogenetic(null)]).then((results) => {
            const [patientList, geneList] = results;
            geneListRef.current = geneList;
            patientListRef.current = patientList?.filter((item) => !!item.subtypes?.length).map((item) => {
                return {
                    ...item,
                    stage: STAGE_TRANS[item.stage]
                }
            });
            setFilterdPatientList(patientListRef.current);
            setCurrentPlanetPatientId(patientListRef.current?.filter((item) => item.type === "PLANET")[0]?.patientId);
            setCurrentDtPatientId(patientListRef.current?.filter((item) => item.type === "DT")[0]?.patientId);
            setDtTreeLoading(false);
            setPlanetTreeLoading(false);
        })
    }, []);


    const buildDtTreeData = (dtPatientId, dataType) => {
        if (!geneListRef.current || dtPatientList?.length == 0) return;
        const treeWorker = new Worker('/workers/tree.js');
        if (dataType == "all" || dataType == "dt") {
            if (!dtPatientId) {
                dtPatientId = dtPatientList?.[0]?.patientId;
            }
            const newick = dtPatientList?.find((item) => item.patientId === dtPatientId)?.newick;
            if (!newick) return;
            const geneData = geneListRef.current?.filter((item) => item)?.filter((item) => item?.sampleId?.includes(`${dtPatientId}_`))
            treeWorker.postMessage({ newick: newick, geneData });
            treeWorker.onmessage = ({ data }) => {
                setDtTreeList(data.treeList);
                setDtSampleGeneData(data.sampleGeneData);
                setDtTreeLoading(false);
            };
        }
    }

    const buildPlanetTreeData = (planetPatientId, dataType) => {
        if (!geneListRef.current || planetPatientList?.length == 0) return;
        const treeWorker = new Worker('/workers/tree.js');
        if (dataType == "all" || dataType == "planet") {
            if (!planetPatientId) {
                planetPatientId = planetPatientList?.[0]?.patientId;
            }
            const newick = planetPatientList?.find((item) => item.patientId === planetPatientId)?.newick;
            if (!newick) return;
            const geneData = geneListRef.current?.filter((item) => item)?.filter((item) => item?.sampleId?.includes(`${planetPatientId}_`))
            treeWorker.postMessage({ newick: newick, geneData });
            treeWorker.onmessage = ({ data }) => {
                setPlanetTreeList(data.treeList);
                setPlanetSampleGeneData(data.sampleGeneData);
            };
        }
    }

    useEffect(() => {
        buildDtHeatMap(currentDtPatientId, dataType);
        buildDtTreeData(currentDtPatientId, dataType);
    }, [currentDtPatientId, filterdPatientList, dataType]);

    useEffect(() => {
        buildLiverSamples(currentPlanetPatientId, dataType);
        buildPlanetHeatMap(currentPlanetPatientId, dataType);
        buildPlanetTreeData(currentPlanetPatientId, dataType);
    }, [currentPlanetPatientId, filterdPatientList, dataType]);

    function formatLabel(str) {
        return str?.replace(/.*_/, '') ?? str;
    }

    const buildLiverSamples = (planetPatientId, dataType) => {
        if (dataType == "all" || dataType == "planet") {
            if (!planetPatientId) {
                planetPatientId = planetPatientList?.[0]?.patientId;
            }
            const currentLiver = planetPatientList?.find((item) => item.patientId === planetPatientId)?.tumors.map((tumor) => {
                return {
                    ...tumor,
                    patientId: planetPatientId
                }
            });
            setCurrentLiverSamples(currentLiver);
        }
    }

    const buildDtHeatMap = (dtPatientId, dataType) => {
        if (dataType == "all" || dataType == "dt") {
            if (!dtPatientId) {
                dtPatientId = dtPatientList?.[0]?.patientId;
            }
            let subtypes = dtPatientList?.find((subtypeItem) => subtypeItem.patientId == dtPatientId)?.subtypes ?? [];
            const _heatmap = buildSubtypes(subtypes);
            setDtHeatmap(_heatmap);
        }
    }

    const buildPlanetHeatMap = (planetPatientId, dataType) => {
        console.log("planetPatientList", planetPatientList, planetPatientId, dataType)
        if (dataType == "all" || dataType == "planet") {
            if (!planetPatientId) {
                planetPatientId = planetPatientList?.[0]?.patientId;
            }
            let subtypes = planetPatientList?.find((subtypeItem) => subtypeItem.patientId == planetPatientId)?.subtypes ?? [];
            const _heatmap = buildSubtypes(subtypes);
            setPlanetHeatmap(_heatmap);
        }
    }

    const buildSubtypes = (subtypes) => {

        if (subtypes.length) {
            const _heatmap = {};
            subtypes.forEach((sample) => {
                _heatmap[formatLabel(sample.id)] = {
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
            return _heatmap

        }
    }

    const dtPatientList = useMemo(() => {
        if (dataType == "planet") return [];
        return filterdPatientList?.filter((item) => item.type === "DT")
    }, [filterdPatientList, dataType])

    const planetPatientList = useMemo(() => {
        if (dataType == "dt") return [];
        return filterdPatientList?.filter((item) => item.type === "PLANET")
    }, [filterdPatientList, dataType])

    console.log("currentLiverSamples", currentLiverSamples)

    return (
        <>
            {
                (dataType == "all" || dataType == "planet") && <Row>
                    <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                        <Flex vertical align='center' style={{ border: "1px solid #f5f5f5", height: "700px", padding: "20px 0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                            {
                                planetTreeLoading ? <Flex align='center' justify='center' style={{ width: "100%", height: "360px" }}>
                                    <Spin spinning={true} ></Spin>
                                </Flex> : <SunburstChart data={planetPatientList} patientId={currentPlanetPatientId} handleItemClick={setCurrentPlanetPatientId}></SunburstChart>
                            }
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
                                {!planetTreeLoading ?
                                    (planetTreeList && currentPlanetPatientId) ? <HorizontalTree adaptive alignLabel={true} heatmapFields={mockFields} heatmapData={planetHeatmap} data={planetTreeList} sampleGeneData={planetSampleGeneData} color={"rgb(106, 194, 165)"}></HorizontalTree> : <Flex style={{ height: "100%" }} align='center' justify='center'><Empty style={{ width: '100%', padding: "20px" }}></Empty> </Flex>
                                    : <Flex align='center' justify='center' style={{ width: "100%", height: "100%" }}>
                                        <Spin spinning={true} ></Spin>
                                    </Flex>}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={24} sm={24} md={24} style={{ display: "flex", border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>

                                {
                                    planetTreeLoading ?
                                        <Flex align='center' justify='center' style={{ width: "100%", height: "100%" }}><Spin spinning={true} ></Spin></Flex>
                                        : currentLiverSamples ? <><Flex flex="1" align='center'>
                                            {
                                                currentLiverSamples?.[0] ? <LiverSampleChart data={currentLiverSamples?.[0]}></LiverSampleChart> : <Flex style={{ height: "360px" }} align='center' justify='center'><Empty style={{ width: '100%', padding: "20px" }}></Empty> </Flex>

                                            }
                                        </Flex>
                                            {
                                                currentLiverSamples?.[1] && <Flex flex="1" align='center'>
                                                    {
                                                        currentLiverSamples?.[1] ? <LiverSampleChart data={currentLiverSamples?.[1]}></LiverSampleChart> : <Flex style={{ height: "360px" }} align='center' justify='center'><Empty style={{ width: '100%', padding: "20px" }}></Empty> </Flex>
                                                    }
                                                </Flex>
                                            }</> : <Flex align='center' justify='center' style={{ width: "100%", height: "100%" }}><Empty style={{ width: '100%', padding: "20px" }}></Empty></Flex>

                                }

                            </Col>
                        </Row>
                    </Col>
                </Row>
            }
            {
                (dataType == "all" || dataType == "dt") && <Row>
                    <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                        <Flex vertical align='center' style={{ border: "1px solid #f5f5f5", height: "800px", padding: "20px 0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                            <ColumnChart patientId={currentDtPatientId} data={dtPatientList} handleItemClick={setCurrentDtPatientId}></ColumnChart>
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
                            <Col xs={24} sm={24} md={24} style={{ width: "100%", padding: "10px", height: "460px", border: "1px solid #f5f5f5", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                                {!dtTreeLoading ?
                                    (dtTreeList && currentDtPatientId) ? <HorizontalTree adaptive alignLabel={true} heatmapFields={mockFields} heatmapData={dtHeatmap} data={dtTreeList} sampleGeneData={dtSampleGeneData} color={"rgb(106, 194, 165)"}></HorizontalTree> : <Flex style={{ height: "100%" }} align='center' justify='center'><Empty style={{ width: '100%', padding: "20px" }}></Empty> </Flex>
                                    : <Flex align='center' justify='center' style={{ width: "100%", height: "100%" }}>
                                        <Spin spinning={true} ></Spin>
                                    </Flex>}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={24} sm={24} md={24} style={{ width: "100%", padding: "10px", height: "320px", border: "1px solid #f5f5f5", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                                <Flex flex={1} align='center' justify='center'>
                                    {
                                        currentDtPatientId ? <Image src={`/images/DNA_${currentDtPatientId}.svg`} width={310} height={310} alt='DT-Tumor'></Image> : <Flex style={{ width: "100%", height: "100%" }}><Empty style={{ width: '100%', padding: "20px" }}></Empty></Flex>
                                    }
                                </Flex>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            }
        </>
    )
}

export default RightPanel;