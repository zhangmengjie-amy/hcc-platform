"use client";
import React, { useEffect, useState, useCallback } from 'react';
import EChartsReact from "echarts-for-react";
import {
    Empty
} from 'antd';
import { set } from 'lodash';

const SUBTYPE_COLOR = {
    "Classic": "rgb(79, 151, 121)",
    "Hybrid": "rgb(72, 128, 187)",
    "Proliferation": "rgb(150, 91, 164)",
    "Wnt": "rgb(167, 134, 56)",
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
        console.log("_option", _option)
        setOption(_option);
    }, [data, currentPatientId]);
    const filterPatients = (data) => {
        return data?.filter((item) => !!item.subtypes);
    }
    const getBottomSeries = (data) => {
        const seriesData = [];
        data.forEach((item, yIndex) => {
            item.subtypes?.forEach((item, xIndex) => {
                seriesData.push({
                    value: [yIndex, xIndex, 1],
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
                bottom: "20",
                left: "20",
                right: "20",

            },
            xAxis: {
                type: 'category',
                data: data.map((item) => {
                    return item.patientId
                }),
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

    }, []);

    return (
        hasData ? <EChartsReact style={{ width: "100%", height: "360px" }} key={JSON.stringify(option)} option={option} onEvents={{ click: handleClick }} opts={{ renderer: 'svg' }}></EChartsReact> :
            <Empty style={{ width: '100%', padding: "20px" }}></Empty>
    )
}

export default ColumnChart;