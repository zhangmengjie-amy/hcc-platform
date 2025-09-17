"use client";
import React, { useEffect, useState, useRef } from 'react';
import { getImmuneSubtypeList } from "@/configs/request";
import { Flex } from 'antd';
import EChartsReact from "echarts-for-react";

const SUBTYPE_COLOR = {
    "C4": "rgb(31, 120, 180)",
    "C2": "rgb(253, 191, 111)",
    "C3": "rgb(178, 223, 138)",
    "C1": "rgb(251, 154, 153)",
    "C6": "rgb(202, 178, 214)",
}

const SUBTYPE_NAME = {
    "C1": "Wound healing",
    "C2": "IFN-g dominant",
    "C3": "Inflammatory",
    "C4": "Lymphocyte depleted",
    "C6": "TGF-b dominant"
}


const MIXED_GROUP = [
    "C1",
    "C2",
    "C3",
    "C4",
    "C6",
    "C1,C2",
    "C1,C3",
    "C1,C4",
    "C1,C6",
    "C2,C3",
    "C2,C4",
    "C2,C6",
    "C3,C4",
    "C3,C6",
    "C4,C6",
    "C1,C2,C3",
    "C1,C2,C4",
    "C1,C2,C6",
    "C1,C3,C4",
    "C1,C3,C6",
    "C1,C4,C6",
    "C2,C3,C4",
    "C2,C3,C6",
    "C2,C4,C6",
    "C3,C4,C6",
    "C1,C2,C3,C4",
    "C1,C2,C3,C6",
    "C1,C2,C4,C6",
    "C1,C3,C4,C6",
    "C2,C3,C4,C6",
    "C1,C2,C3,C4,C6"
];

const MIXED_PURE = {
    "Pure": "rgb(132, 202, 192)",
    "Mixed": "rgb(204, 121, 167)",
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
const Immune = () => {
    const [option, setOption] = useState({});
    useEffect(() => {
        getImmuneSubtypeList().then((results) => {
            const _option = buildOption(results);
            setOption(_option);
        });
    }, []);

    const sortedPatientById = (patientList) => {
        return patientList.sort((a, b) => a.publicationId.split("_")[1] - b.publicationId.split("_")[1])
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
                samples: item.samples?.sort((a, b) => a.subtype.localeCompare(b.subtype))
            }));


        MIXED_GROUP.forEach((group) => {
            const patient = patientWithGroupSubtype.filter((item) => {
                return Array.from(new Set(item.samples.map((sample) => sample.subtype))).join(",") == group
            }).sort((a, b) => a.stage.length - b.stage.length);
            mixedPatientList.push(...patient);
        })
        let patientWithSingleSubtype = patientList.filter((item) => new Set(item.samples.map((item) => item.subtype)).size == 1)
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


    const buildOption = (patientList) => {

        const sortedPatient = sortPatients(patientList);
        let data = [];
        const maxSampleLength = Math.max(...sortedPatient.map(patient => patient.samples?.length))
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
                            patientId: patient.publicationId,
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
                                    patientId: patient.publicationId,
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
                name: SUBTYPE_NAME[subtype] ?? "",
                value: defaultValue,
                custom: {
                    theme: "Subtype",
                    patientId: patient.publicationId,
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
                        isNull: true,
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
                            isNull: true,
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
                        isNull: true,
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
                        isNull: true,
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
        const realPureLength = pureChildren.filter((item) => !item.isNull)?.length;
        const realMixedLength = mixedChildren.filter((item) => !item.isNull)?.length;
        const totalLength = realPureLength + realMixedLength;
        const realPurePercent = (realPureLength / totalLength * 100).toFixed(2);
        const realMixedPercent = (realMixedLength / totalLength * 100).toFixed(2);

        const totalPureLength = realPureLength + pureTotalSpace * spaceValue + 2;
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
                fontSize: 16,
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
                padding: [100, 0],
                fontSize: 16,
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
                emphasis: {
                    disabled: true
                },
                data: data,
                levels: levels,
            }
        };
    }

    return (
        <div style={{ position: "relative", height: "100vh", padding: 20, display: "flex", justifyContent: "center", backgroundColor: "rgb(210, 235, 227)" }}>
            <EChartsReact option={option} style={{ width: 600, height: 600 }} opts={{ renderer: 'svg' }}></EChartsReact>
            <Flex style={{ padding: "20px"}}>
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
                            return <Flex key={item} align='center'><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: SUBTYPE_COLOR[item] }}></span><span>{SUBTYPE_NAME[item]}</span></Flex>
                        })
                    }
                </Flex>

            </Flex>
        </div>
    )
}

export default Immune;