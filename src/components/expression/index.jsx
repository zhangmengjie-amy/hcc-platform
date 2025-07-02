"use client";
import React, { useEffect, useState, useRef } from 'react';
import { getPatientSubtypeList } from "@/configs/request";
import { Flex } from 'antd';
import EChartsReact from "echarts-for-react";

const SUBTYPE_COLOR = {
    "C1": "rgb(79, 151, 121)",
    "C2": "rgb(72, 128, 187)",
    "C3": "rgb(150, 91, 164)",
    "C4": "rgb(167, 134, 56)",
    "C5": "rgb(238, 188, 57)",
    "C6": "rgb(218, 85, 76)",
}


const MIXED_GROUP = ["C1,C2", "C1,C3", "C1,C4", "C1,C5", "C1,C6", "C2,C3", "C2,C4", "C2,C5", "C2,C6", "C3,C4", "C3,C5", "C3,C6", "C4,C5", "C4,C6", "C5,C6",
    "C1,C2,C3", "C1,C2,C4", "C1,C2,C5", "C1,C2,C6", "C1,C3,C4", "C1,C3,C5", "C1,C3,C6", "C1,C4,C5", "C1,C4,C6", "C1,C5,C6", "C2,C3,C4", "C2,C3,C5", "C2,C3,C6", "C2,C4,C6", "C3,C4,C5", "C3,C4,C6", "C2,C4,C5", "C2,C5,C6", "C3,C5,C6", "C4,C5,C6",
    "C1,C2,C3,C4", "C1,C2,C3,C5", "C1,C2,C3,C6", "C1,C2,C4,C5", "C1,C2,C4,C6", "C1,C2,C5,C6", "C1,C3,C4,C5", "C1,C3,C4,C6", "C2,C3,C4,C5", "C1,C3,C5,C6", "C1,C4,C5,C6",
    "C2,C3,C4,C6", "C2,C3,C5,C6", "C2,C4,C5,C6", "C3,C4,C5,C6",
    "C1,C2,C3,C4,C5", "C1,C2,C3,C4,C6", "C2,C3,C4,C5,C6", "C1,C3,C4,C5,C6", "C1,C2,C3,C5,C6", "C1,C2,C4,C5,C6",
    "C1,C2,C3,C4,C5,C6"
]

const MIXED_PURE = {
    "PURE": "rgb(106, 194, 165)",
    "MIXED": "rgb(158, 153, 197)",
}

const MIXED_PURE_BG = {
    "PURE": "rgb(239, 249, 247)",
    "MIXED": "rgb(247, 240, 247)",
}

const STAGE_COLOR = {
    "I": "rgb(250, 213, 120)",
    "II": "rgb(245, 138, 66)",
    "III": "rgb(224, 36, 40)",
}

const defaultValue = 1;
const spaceValue = 0.5;
const Expression = () => {
    const [option, setOption] = useState({});
    useEffect(() => {
        getPatientSubtypeList().then((results) => {
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
            .filter((item) => new Set(item.samples.map((s) => s.subtype)).size > 1)
            .map((item) => ({
                ...item,
                samples: item.samples.sort((a, b) => a.subtype.localeCompare(b.subtype))
            }));


        MIXED_GROUP.forEach((group) => {
            const patient = patientWithGroupSubtype.filter((item) => {
                return Array.from(new Set(item.samples.map((sample) => sample.subtype))).join(",") == group
            }).sort((a, b) => b.stage.length - a.stage.length);
            mixedPatientList.push(...patient);
        })
        let patientWithSingleSubtype = patientList.filter((item) => new Set(item.samples.map((item) => item.subtype)).size == 1)
        Object.keys(SUBTYPE_COLOR).forEach((subtype) => {
            const patientWithSameSubtype = patientWithSingleSubtype.filter((item) => item.samples[0].subtype == subtype).sort((a, b) => b.stage.length - a.stage.length);
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
                name: subtype ?? "",
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

            const result = buildChildren(maxSampleLength, patient, isPure ? "PURE" : "MIXED");
            if (isPure) {
                if (initialPureSubtype !== patient.samples[0].subtype) {
                    pureTotalSpace += 1;
                    pureChildren.push({
                        value: spaceValue,
                        name: "",
                        itemStyle: {
                            borderWidth: 0,
                            color: MIXED_PURE_BG["PURE"],
                        },
                        children: [],
                    });
                }
                initialPureSubtype = patient.samples[0].subtype;
                pureChildren.push(...result);
                if (new Set(sortedPatient[index + 1]?.samples.map((item) => item.subtype)).size > 1) {
                    pureTotalSpace += 1;
                    pureChildren.push({
                        value: spaceValue,
                        name: "",
                        itemStyle: {
                            borderWidth: 0,
                            color: MIXED_PURE_BG["PURE"],
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
                            color: MIXED_PURE_BG["MIXED"],
                        },
                        children: [],
                    });
                }
                initialMixedSubtype = currentMixedSubtype;
                mixedChildren.push(...result)
            }
        })
        const realPureLength = pureChildren.filter((item) => !!item.children.length)?.length;
        const realMixedLength = mixedChildren.filter((item) => !!item.children.length)?.length;
        const totalLength = realPureLength + realMixedLength;
        const realPurePercent = (realPureLength / totalLength * 100).toFixed(0);
        const realMixedPercent = (realMixedLength / totalLength * 100).toFixed(0);

        const totalPureLength = realPureLength + pureTotalSpace * spaceValue;
        const totalMixedLength = realMixedLength + mixedTotalSpace * spaceValue;
        data = [{
            name: "",
            value: totalPureLength,
            itemStyle: {
                color: MIXED_PURE_BG["PURE"],
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
                color: MIXED_PURE_BG["MIXED"]
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
                borderWidth: 1, borderColor: "#ccc",
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
                    ${event?.data?.custom?.patientId ? `<div style="color: #000"><span>Patient Id: </span><span style="color: #666">${event?.data?.custom?.patientId}</span></div>` : ""}
                    ${event?.data?.custom?.sampleLength ? `<div style="color: #000"><span>Sample Length: </span><span style="color: #666">${event?.data?.custom?.sampleLength}</span></div>` : ""} 
                    ${event?.data?.custom?.sampleId ? `<div style="color: #000"><span>Sample Id: </span><span style="color: #666">${event?.data?.custom?.sampleId}</span></div>` : ""} 
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
        <div style={{ position: "relative", height: "100vh", padding: 20, backgroundColor: "rgb(210, 235, 227)" }}>
            <EChartsReact option={option} style={{ margin: "0 auto", width: 600, height: 600 }} opts={{ renderer: 'svg' }}></EChartsReact>
            <Flex style={{ padding: "20px", position: "absolute", right: 100, top: 0 }}>
                <Flex vertical >
                    <Flex style={{ marginBottom: "10px" }}>Mixed or Pure</Flex>
                    {
                        Object.keys(MIXED_PURE).map((item) => {
                            return <Flex key={item} align='center'><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: MIXED_PURE[item] }}></span><span>{item}</span></Flex>
                        })
                    }
                </Flex>
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

            </Flex>
        </div>
    )
}

export default Expression;