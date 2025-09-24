"use client";
import React, { useEffect, useState, useCallback } from 'react';
import EChartsReact from "echarts-for-react";
import {
    Empty,
    Flex
} from 'antd';
import { set } from 'lodash';

const SUBTYPE_COLOR = {
    "Classic": "rgba(225, 229, 144, 1)",
    "Hybrid": "rgba(90, 155, 219, 1)",
    "Proliferation": "rgba(232, 139, 173, 1)",
    "Wnt": "rgba(235, 162, 127, 1)",
}

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
const spaceValue = 0.2;
const spaceValue_lg = 0.2;
const ColumnChart = ({ data, handleItemClick }) => {
    const [option, setOption] = useState({});
    const [hasData, setHasData] = useState(false);

    const [currentPatientId, setCurrentPatientId] = useState(null);

    useEffect(() => {
        if (!data) return;
        const _option = buildOption(data);
        setOption(_option);
    }, [data, currentPatientId]);
    const filterPatients = (data) => {
        return data?.filter((item) => !!item.subtypes);
    }
    const getBottomSeries = (data) => {
        const seriesData = [];
        const pureList = data.filter((item) => new Set(item.subtypes.map((item) => item.subtype)).size == 1);
        const mixedList = data.filter((item) => new Set(item.subtypes.map((item) => item.subtype)).size > 1);
        [...pureList, ...mixedList].forEach((patient, yIndex) => {
            const isPure = new Set(patient.subtypes.map((item) => item.subtype)).size == 1;
            patient.subtypes?.forEach((item, xIndex) => {
                if (xIndex == 0) {
                    seriesData.push({
                    value: [yIndex, 0, 1],
                    custom: {
                        patientId: patient.patientId
                    },
                    itemStyle: {
                        color: MIXED_PURE[isPure ? "Pure" : "Mixed"],
                        borderWidth: 2, // 设置边框宽度
                        borderColor: '#fff', // 设置边框颜色
                    }
                 });
                seriesData.push({
                    value: [yIndex, 1, 1],
                    custom: {
                        patientId: patient.patientId
                    },
                    itemStyle: {
                        color: STAGE_COLOR[patient.stage],
                        borderWidth: 2, // 设置边框宽度
                        borderColor: '#fff', // 设置边框颜色
                    }
                 });
                }
                seriesData.push({
                    value: [yIndex, xIndex + 2, 1],
                    custom: {
                        patientId: patient.patientId
                    },
                    itemStyle: {
                        color: SUBTYPE_COLOR[item.subtype],
                        borderWidth: 2, // 设置边框宽度
                        borderColor: '#fff', // 设置边框颜色

                    }
                });
            })
        });
        return seriesData;

    }
    
        console.log("data", data)
    const buildOption = (data) => {
        const filterdPatient = filterPatients(data);
        setHasData(!!filterdPatient?.length)
        const seriesData = getBottomSeries(data);

        return {
            tooltip: {
                position: 'top'
            },
            grid: {
                top: '20',
                bottom: "40",
                left: "20",
                right: "20",

            },
            xAxis: {
                type: 'category',
                data: data.map((item) => {
                    return item.patientId
                }),
                axisLabel: {
                    textStyle: {
                        fontSize: 10, // 调整字体大小
                        color: '#666' // 字体颜色
                    },
                    rotate: 0, // 倾斜45度
                    interval: 0, // 显示所有标签
                    margin: 10 // 标签与坐标轴的间距
                },
                splitArea: {
                    show: true
                }
            },
            visualMap: {
                show: false,
            },
            yAxis: {
                type: 'category',
                data: [],
                show: false,
                splitArea: {
                    show: true
                }
            },

            series: [
                {
                    name: 'Punch Card',
                    type: 'heatmap',
                    data: seriesData,
                    label: {
                        show: false
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        }
    }

    const handleClick = useCallback((params) => {
        if (!params.data?.custom?.patientId) return;
        setCurrentPatientId(params.data?.custom?.patientId);
        handleItemClick?.(params.data?.custom?.patientId);
    }, []);

    return (
        hasData ? <EChartsReact style={{ width: "100%", height: "400px" }} key={JSON.stringify(option)} option={option} onEvents={{ click: handleClick }} opts={{ renderer: 'svg' }}></EChartsReact> :
            <Flex style={{height: "400px"}} align='center' justify='center'><Empty style={{ width: '100%', padding: "20px"}}></Empty> </Flex>
    )
}

export default ColumnChart;