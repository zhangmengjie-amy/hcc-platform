"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getExpressionpatientListRef } from "@/configs/request";
import { Flex, Row, Col } from 'antd';
import { getITHList, getPatientList, getLiverSamples } from "@/configs/request";
import { getFullPhylogenetic } from "@/configs/request";
import HorizontalTree from "@/components/horizontal-tree/index";
import LiverSampleChart from '@/components/liver-sample';
import EChartsReact from "echarts-for-react";
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
        let newick = null;
        let patientId = null;
        const { geneList, ...clinicList } = conditions;
        const filteredData = filterSampleByConditions(patientListRef.current, clinicList, geneList) ?? [];
        filteredListRef.current = filteredData;

        console.log("filteredData", clinicList);
        console.log("patientListRef.current", patientListRef.current);
        const _option = buildOption(filteredData);
        patientId = filteredData?.[0]?.patientId;
        buildHeatMap(patientId);
        setOption(_option);
        newick = filteredData?.find((item) => item.patientId == patientId)?.newick;
        if (newick) {
            buildTreeData(newick, patientId);
        }
    }, [conditions]);

    useEffect(() => {
        let newick = null;
        let patientId = null;
        getPatientList().then((data) => {
            const _option = buildOption(data);
            setOption(_option);
            patientId = data?.[0]?.patientId;
            patientListRef.current = data;
            filteredListRef.current = data;
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
            patientId = filteredListRef.current?.[0]?.patientId;
        }
        newick = filteredListRef.current?.find((item) => item.patientId == currentPatientId)?.newick;
        if (newick && patientId) {
            buildHeatMap(patientId);
            buildTreeData(newick, patientId);
        }
        console.log("liverSamplesRef.current", liverSamplesRef.current)
        const currentLiver = liverSamplesRef.current?.filter((item) => item.patientId === patientId);
        console.log("currentLiver", currentLiver, patientId)
        setCurrentLiverSamples(currentLiver);
    }, [currentPatientId]);

    const buildHeatMap = (patientId) => {
        console.log(patientId, filteredListRef.current)
        let samples = filteredListRef.current?.find((subtypeItem) => subtypeItem.patientId == patientId)?.samples ?? [];
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
            console.log("_mockHeatmap", _mockHeatmap)
            setMockHeatmap(_mockHeatmap);
        }
    }

    const sortedPatientById = (patientList) => {
        return patientList?.sort((a, b) => a.patientId.split("_")[1] - b.patientId.split("_")[1])
    }

    const sortPatients = (_patientList) => {
        let patientList = sortedPatientById(_patientList);
        let sortedPatientList = [];
        const purePatientList = [];
        const mixedPatientList = [];
        let patientWithGroupSubtype = patientList
            .filter((item) => new Set(item.samples?.map((s) => s.subtype)).size > 1)
            .map((item) => ({
                ...item,
                samples: item.samples.sort((a, b) => a.subtype.localeCompare(b.subtype))
            }));


        MIXED_GROUP.forEach((group) => {
            const patient = patientWithGroupSubtype.filter((item) => {
                return Array.from(new Set(item.samples.map((sample) => sample.subtype))).join(",") == group
            }).sort((a, b) => a.stage.length - b.stage.length);
            mixedPatientList.push(...patient);
        })
        let patientWithSingleSubtype = patientList.filter((item) => new Set(item.samples?.map((item) => item.subtype)).size == 1)
        Object.keys(SUBTYPE_COLOR).forEach((subtype) => {
            const patientWithSameSubtype = patientWithSingleSubtype.filter((item) => item.samples[0].subtype == subtype).sort((a, b) => a.stage.length - b.stage.length);
            purePatientList.push(...patientWithSameSubtype);
        })
        sortedPatientList = [...purePatientList, ...mixedPatientList];
        return sortedPatientList;
    }
    function getLevelCount(data) {
        let maxLevel = 0;

        function traverse(node, currentLevel) {
            if (currentLevel > maxLevel) {
                maxLevel = currentLevel;
            }
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => traverse(child, currentLevel + 1));
            }
        }

        data.forEach(root => traverse(root, 1));
        return maxLevel;
    }

    const filterPatients = (_patientList) => {
        return _patientList?.filter((item) => !!item.samples);
    }

    const buildChildren = (sampleLength, patient, PURE_MIXED) => {
        let children = [];
        if (sampleLength == 0) return [
            {
                value: defaultValue,
                name: "",
                itemStyle: {
                    borderWidth: 0,
                    color: MIXED_PURE_BG[PURE_MIXED]
                },
                children: [{
                    name: patient.stage,
                    value: defaultValue,
                    custom: {
                        theme: "Stage",
                        patientId: patient.patientId,
                        sampleLength: patient.samples.length,
                        PURE_MIXED: PURE_MIXED
                    },
                    itemStyle: {
                        color: STAGE_COLOR[patient.stage]
                    },
                    children: [{
                        value: defaultValue,
                        name: "",
                        itemStyle: {
                            borderWidth: 0,
                            color: MIXED_PURE_BG[PURE_MIXED]
                        },
                        children: [{
                            value: defaultValue,
                            custom: {
                                theme: "RNA Mixed or Pure",
                                patientId: patient.patientId,
                                sampleId: patient.sampleId,
                                sampleLength: patient.samples.length,
                                stage: patient.stage
                            },
                            name: PURE_MIXED,
                            itemStyle: {
                                borderWidth: 0,
                                color: MIXED_PURE[PURE_MIXED]
                            },
                        }]
                    }]
                }]
            }
        ];
        const subtype = patient.samples[sampleLength - 1]?.subtype;
        const sampleId = patient.samples[sampleLength - 1]?.id;
        const color = SUBTYPE_COLOR[subtype];
        children.push({
            name: subtype ?? "",
            value: defaultValue,
            custom: {
                theme: "Subtype",
                patientId: patient.patientId,
                sampleId,
                stage: patient.stage,
                PURE_MIXED: PURE_MIXED
            },
            itemStyle: {
                borderWidth: color ? 1 : 0,
                color: color ?? MIXED_PURE_BG[PURE_MIXED]
            },
            children: buildChildren(sampleLength - 1, patient, PURE_MIXED)
        })
        return children
    }


    const buildOption = (patientList) => {
        const filterdPatient = filterPatients(patientList);
        const sortedPatient = sortPatients(filterdPatient);
        let data = [];
        const maxSampleLength = Math.max(...sortedPatient.map(patient => patient.samples?.length))


        let pureChildren = [];
        let mixedChildren = [];
        let initialPureSubtype = null;
        let initialMixedSubtype = null;
        let pureTotalSpace = 0;
        let mixedTotalSpace = 0;
        sortedPatient.forEach((patient, index) => {
            const isPure = new Set(patient.samples.map((item) => item.subtype)).size == 1;

            const result = buildChildren(maxSampleLength, patient, isPure ? "Pure" : "Mixed");
            if (isPure) {
                if (!initialPureSubtype) {
                    pureChildren.push({
                        value: defaultValue,
                        name: "Pure",
                        custom: {
                            theme: "RNA Mixed or Pure",
                            PURE_MIXED: "Pure"
                        },
                        itemStyle: {
                            borderWidth: 0,
                            color: MIXED_PURE_BG["Pure"],
                        },
                        children: [],
                    });
                } else {
                    if (initialPureSubtype !== patient.samples[0].subtype) {
                        pureTotalSpace += 1;
                        pureChildren.push({
                            value: spaceValue,
                            name: "",
                            itemStyle: {
                                borderWidth: 0,
                                color: MIXED_PURE_BG["Pure"],
                            },
                            children: [],
                        });
                    }
                }

                initialPureSubtype = patient.samples[0].subtype;
                pureChildren.push(...result);
                if (new Set(sortedPatient[index + 1]?.samples.map((item) => item.subtype)).size > 1) {
                    pureChildren.push({
                        value: defaultValue,
                        name: "Pure",
                        custom: {
                            theme: "RNA Mixed or Pure",
                            PURE_MIXED: "Pure"
                        },
                        itemStyle: {
                            borderWidth: 0,
                            color: MIXED_PURE_BG["Pure"],
                        },
                        children: [],
                    });
                }

            } else {
                const currentMixedSubtype = Array.from(new Set(patient.samples.map((sample) => sample.subtype))).join(",");
                if (initialMixedSubtype && initialMixedSubtype !== currentMixedSubtype) {
                    mixedTotalSpace += 1;
                    mixedChildren.push({
                        value: spaceValue,
                        name: "",
                        itemStyle: {
                            borderWidth: 0,
                            color: MIXED_PURE_BG["Mixed"],
                        },
                        children: [],
                    });
                }
                initialMixedSubtype = currentMixedSubtype;
                mixedChildren.push(...result)
            }
        })
        const realPureLength = pureChildren.filter((item) => item.value == 1)?.length;
        const realMixedLength = mixedChildren.filter((item) => item.value == 1)?.length;
        const totalLength = realPureLength + realMixedLength;
        const realPurePercent = (realPureLength / totalLength * 100).toFixed(0);
        const realMixedPercent = (realMixedLength / totalLength * 100).toFixed(0);

        const totalPureLength = realPureLength + pureTotalSpace * spaceValue;
        const totalMixedLength = realMixedLength + mixedTotalSpace * spaceValue;
        data = [{
            name: "",
            value: totalPureLength,
            itemStyle: {
                borderWidth: 0,
                color: MIXED_PURE_BG["Pure"],
            },
            label: {
                formatter: () => {
                    return `Pure patients (${realPurePercent}%)`
                },
                rotate: 'tangential',
                verticalAlign: 'top',
                padding: [100, 0],
                fontSize: 12,
                color: '#000',
                hideOverlap: false
            },
            children: pureChildren,
        }, {
            name: "",
            value: totalMixedLength,
            itemStyle: {
                color: MIXED_PURE_BG["Mixed"]
            },
            label: {
                formatter: () => {
                    return `Mixed patients (${realMixedPercent}%)`
                },
                rotate: 'tangential',
                verticalAlign: 'bottom',
                padding: [90, 0],
                fontSize: 12,
                color: '#000',
                hideOverlap: false
            },
            children: mixedChildren,
        }]

        const levelCount = getLevelCount(data);
        const firstLevelRatio = 0.35;
        const remainingRatio = 1 - firstLevelRatio;

        // 创建层级配置
        const levels = [{}, {
            r0: '0%',
            r: 100 + '%',
            label: {
                show: true,
            },
            itemStyle: {
                borderWidth: 1.5,
                borderColor: "#ccc",
                color: MIXED_PURE_BG["MIXED"]
            },
        }];

        // 为剩余层级创建配置
        for (let i = 1; i < levelCount; i++) {
            const start = firstLevelRatio + (i - 1) * (remainingRatio / (levelCount - 1));
            const end = firstLevelRatio + i * (remainingRatio / (levelCount - 1));
            levels.push({
                r0: (start * 100) + '%',
                r: (end * 100) + '%',
                label: {
                    align: 'right',
                    rotate: 'radial',
                    show: false
                }
            });
        }

        const startAngle = 180 + ((totalPureLength) / (totalPureLength + totalMixedLength) * 360 - (totalMixedLength) / (totalPureLength + totalMixedLength) * 360) / 4;
        return {
            grid: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                containLabel: true
            },
            legend: {
                show: false
            },
            hoverLayerThreshold: 0,  // 禁用全局hover层
            tooltip: {
                formatter: (event) => {
                    if (!event?.data?.name) return null;
                    return `<div>
                    ${event?.data?.custom?.patientId ? `<div style="color: #000"><span>Patient ID: </span><span style="color: #666">${event?.data?.custom?.patientId}</span></div>` : ""}
                    ${event?.data?.custom?.sampleLength ? `<div style="color: #000"><span>Sample Counts: </span><span style="color: #666">${event?.data?.custom?.sampleLength}</span></div>` : ""} 
                    ${event?.data?.custom?.sampleId ? `<div style="color: #000"><span>Sample ID: </span><span style="color: #666">${event?.data?.custom?.sampleId}</span></div>` : ""} 
                    <div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${event.color}"></span>${event?.data?.custom?.theme}: <span style="color: #666">${event?.data?.name}</span></div>
                    ${event?.data?.custom?.stage ? `<div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${STAGE_COLOR[event?.data?.custom?.stage]}"></span><span>Stage: </span><span style="color: #666">${event?.data?.custom?.stage}</span></div>` : ""}
                    ${event?.data?.custom?.PURE_MIXED ? `<div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${MIXED_PURE[event?.data?.custom?.PURE_MIXED]}"></span><span>RNA Mixed or Pure: </span><span style="color: #666">${event?.data?.custom?.PURE_MIXED}</span></div>` : ""} 
                    </div>`
                }
            },
            animationEasing: 'elasticOut',

            series: {
                nodeClick: false,
                startAngle: startAngle,
                type: 'sunburst',
                sort: undefined,

                data: data,
                levels: levels,
                emphasis: {
                    disabled: true
                },
            }
        };
    }

    const handleClick = useCallback((params) => {
        if (!params.data?.custom?.patientId) return;
        setCurrentPatientId(params.data?.custom?.patientId)
    }, []);


    return (
        <>
            <Row>
                <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                    <Flex align='center' style={{ border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 0  10px rgb(0, 0, 0, .05)", borderRadius: "12px" }}>
                        <EChartsReact style={{ width: "100%", height: "320px" }} option={option} onEvents={{ click: handleClick }} opts={{ renderer: 'svg' }}></EChartsReact>
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
                    <Flex align='center' style={{ border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 0  10px rgb(0, 0, 0, .05)", borderRadius: "12px" }}>
                        <HorizontalTree adaptive alignLabel={true} heatmapFields={mockFields} heatmapData={mockHeatmap} data={treeList} sampleMutations={sampleMutations} color={"rgb(106, 194, 165)"}></HorizontalTree>
                    </Flex>
                </Col>
            </Row>
            <Row >
                <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                    <Flex align='center' style={{ border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 0  10px rgb(0, 0, 0, .05)", borderRadius: "12px" }}>
                        <LiverSampleChart data={currentLiverSamples?.[0]}></LiverSampleChart>
                    </Flex>
                </Col>
                <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
                    <Flex align='center' style={{ border: "1px solid #f5f5f5", height: "340px", boxShadow: "0 0  10px rgb(0, 0, 0, .05)", borderRadius: "12px" }}>
                        <LiverSampleChart data={currentLiverSamples?.[1]}></LiverSampleChart>
                    </Flex>
                </Col>
            </Row>
        </>
    )
}

export default SubtypeLandscape;