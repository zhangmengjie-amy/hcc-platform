"use client";
import React, { useEffect, useState, useRef } from 'react';
import { getPatientSubtypeList } from "@/configs/request";
import EChartsReact from "echarts-for-react";

const SUBTYPE_COLOR = {
    "C1": "rgb(79, 151, 121)",
    "C2": "rgb(72, 128, 187)",
    "C3": "rgb(150, 91, 164)",
    "C4": "rgb(167, 134, 56)",
    "C5": "rgb(238, 188, 57)",
    "C6": "rgb(218, 85, 76)",
}

const MIXED_GROUP = ["C1,C2", "C1,C3", "C1,C4", "C1,C5", "C1,C6", "C2,C3", "C2,C4", "C2,C5", "C2,C6","C3,C4","C3,C5", "C3,C6", "C4,C5","C4,C6", "C5,C6",
    "C1,C2,C3", "C1,C2,C4", "C1,C2,C5", "C1,C2,C6", "C1,C3,C4", "C1,C3,C5", "C1,C3,C6", "C1,C4,C5", "C1,C4,C6", "C1,C5,C6"]

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
const spaceValue = 1;
const Expression = () => {

    const [option, setOption] = useState({});

    useEffect(() => {
        getPatientSubtypeList().then((results) => {
            const _option = buildOption(results);
            setOption(_option);
        });
    }, []);

    const sortPatients = (patientList) => {
        let sortedPatientList = [];
        const purePatientList = [];
        const mixedPatientList = [];

        // MIXED_GROUP.forEach((group) => {
        //     const subtypeGroup =  new Set(item.samples.map((item) => item.subtype));
        //     if (subtypeGroup > 1 && ) {

        //     }
        //     const patientWithGroupSubtype = patientList.filter((item) => new Set(item.samples.map((item) => item.subtype)).size > 1 && item.samples[0].subtype == subtype).sort((a, b) => b.stage.length - a.stage.length);
        // })

        patientList?.forEach((patient) => {
            const subtypes = new Set(patient.samples.sort((a, b) => parseFloat(a.subtype) < parseFloat(b.subtype)).map((item) => item.subtype));
        
            if (subtypes.size > 1) {
                    console.log(Array.from(subtypes).sort((a, b) => {
                        console.log(a.match(/\d+/g)[0] > b.match(/\d+/g)[0])
                        return a.match(/\d+/g)[0] > b.match(/\d+/g)[0]
                    }));
                mixedPatientList.push(patient);
            }
        })



        Object.keys(SUBTYPE_COLOR).forEach((subtype) => {
            const patientWithSameSubtype = patientList.filter((item) => new Set(item.samples.map((item) => item.subtype)).size == 1 && item.samples[0].subtype == subtype).sort((a, b) => b.stage.length - a.stage.length);
            purePatientList.push(...patientWithSameSubtype);
        })
        sortedPatientList = [...mixedPatientList, ...purePatientList];
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
                    name: PURE_MIXED,
                    title: "RNA Mixed or Pure",
                    itemStyle: {
                        borderWidth: 0,
                        color: MIXED_PURE_BG[PURE_MIXED]
                    },
                    children: [{
                        title: "Stage",
                        name: patient.stage,
                        value: defaultValue,
                        itemStyle: {
                            color: STAGE_COLOR[patient.stage]
                        },
                        children: [{
                            value: defaultValue,
                            title: "RNA Mixed or Pure",
                            name: PURE_MIXED,
                            itemStyle: {
                                borderWidth: 0,
                                color: MIXED_PURE_BG[PURE_MIXED]
                            },
                            children: [{
                                value: defaultValue,
                                title: "RNA Mixed or Pure",
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
            const color = SUBTYPE_COLOR[subtype];
            children.push({
                name: subtype ?? "",
                title: "Subtype",
                value: defaultValue,
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
        let initialSubtype = null;
        let totalPureType = 1;
        sortedPatient.forEach((patient, index) => {
            const isPure = new Set(patient.samples.map((item) => item.subtype)).size == 1;
            const result = buildChildren(maxSampleLength, patient, isPure ? "PURE" : "MIXED");
            if (isPure) {
                if (initialSubtype && initialSubtype !== patient.samples[0].subtype) {
                    totalPureType += 1;
                    pureChildren.push({
                        value: spaceValue,
                        itemStyle: {
                            borderWidth: 0,
                            color: MIXED_PURE_BG["PURE"],
                        },
                        children: [],
                    });

                }
                initialSubtype = patient.samples[0].subtype;
                pureChildren.push(...result);

            } else {
                mixedChildren.push(...result)
            }
        })
        const realPureLength = pureChildren.filter((item) => !!item.children.length)?.length;
        const mixedLength = mixedChildren?.length;
        const totalLength = realPureLength + mixedLength;
        const realPurePercent = (realPureLength / totalLength * 100).toFixed(0);
        const mixedPercent = (mixedLength / totalLength * 100).toFixed(0);
        data = [{
            title: "Percentage",
            name: `Pure patients (${realPurePercent}%)`,
            value: pureChildren?.length,
            itemStyle: {
                borderWidth: 0,
                color: MIXED_PURE_BG["PURE"],
            },
            label: {
                rotate: 'tangential',
                verticalAlign: 'top',
                padding: [80, 0],
                fontSize: 16,
                color: '#666',
                textShadowBlur: 5,
                textShadowColor: MIXED_PURE["PURE"],
                hideOverlap: false
            },
            children: pureChildren,
        }, {
            title: "Percentage",
            name: `Mixed patients (${mixedPercent}%)`,
            value: mixedChildren?.length,
            itemStyle: {
                color: MIXED_PURE_BG["MIXED"]
            },
            label: {
                rotate: 'tangential',
                verticalAlign: 'bottom',
                padding: [70, 0],
                fontSize: 16,
                color: '#666',
                textShadowBlur: 5,
                textShadowColor: MIXED_PURE["MIXED"],
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
                borderWidth: 1.5, borderColor: "#ccc",
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

        const startAngle = 180 + (pureChildren?.length / (pureChildren?.length + mixedChildren?.length) * 360 - mixedChildren?.length / (pureChildren?.length + mixedChildren?.length) * 360) / 4;
        return {
            tooltip: {
                enabled: true,
                formatter: (event) => {
                    if (!event?.data?.name) return null;
                    return `<div>
                    <div style="color: #000">${event?.data?.title}</div>
                    <div> ${event?.marker}<span>${event?.data?.name}</span></div>
                    </div>`
                }
            },

            series: {
                nodeClick: false,
                startAngle: startAngle,

                type: 'sunburst',
                sort: undefined,
                emphasis: {  // 禁用hover高亮
                    disabled: true  // 完全禁用强调状态
                },
                data: data,
                levels: levels,
            }
        };
    }

    return (
        <EChartsReact option={option} style={{ height: 500 }} opts={{ renderer: 'svg' }}></EChartsReact>
    )
}

export default Expression;