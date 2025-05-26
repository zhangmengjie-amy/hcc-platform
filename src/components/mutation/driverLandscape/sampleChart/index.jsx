"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from "react-i18next";
import EmptyLoading from "@/components/emptyLoading";
import { LoadingOutlined, FlagOutlined } from '@ant-design/icons';
import Image from 'next/image';
import {
    Spin,
    Skeleton,
    Space,
    Empty
} from 'antd';
import { mutationTypeColorConfig, clinicColorConfig } from "@/configs/mutation";


const SampleChart = ({ sampleGenesMutations, finialGeneList, sampleCategories, sampleType, height }) => {
    const { t } = useTranslation();

    const [leftChartOption, setLeftChartOption] = useState({});
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);
    const clinicRef = useRef(null);
    const geneRef = useRef(null);
    const sampleRef = useRef(null);
    const buildLeftChartOption = () => {
        if (!sampleGenesMutations) return;
        let series = [];
        for (let index = 0; index < sampleGenesMutations?.maxMutationTypeNumber; index++) {
            series.push({
                type: 'heatmap',
                yAxisIndex: 1,
                markArea: {
                    data: []
                },

                data: sampleGenesMutations?.series.filter((item) => item.custom.seriesIndex === index).map((item) => {
                    return {
                        ...item,
                        itemStyle: {
                            color: index === 0 ? item.itemStyle.color : "#FF00FF"
                        },
                    }
                })
            })
            // else {
            //     series.push({
            //         type: 'custom',
            //         universalTransition: true,
            //         data: sampleGenesMutations?.series.filter((item) => item.custom.seriesIndex === index),
            //         renderItem: function (params, api) {
            //             const cellWidth = api.size([1, 1])[0];
            //             const cellHeight = api.size([1, 1])[1] * ((1 - params.seriesIndex * 0.4));
            //             const coord = api.coord([api.value(0), api.value(1)]);
            //             return {
            //                 type: 'rect',
            //                 shape: {
            //                     x: coord[0] ,
            //                     y: coord[1] ,
            //                     width: cellWidth,
            //                     height: cellHeight
            //                 },
            //                 style: {
            //                     fill: api.visual('color'),
            //                     lineWidth: 0
            //                 },
            //                 emphasis: {
            //                     style: {
            //                         shadowBlur: 10,
            //                         shadowColor: 'rgba(0, 0, 0, 0.5)'
            //                     }
            //                 }
            //             };
            //         },

            //     })
            // }

        }
        const leftChartOption = {
            grid: { top: 20, bottom: 0, left: 40, right: 60, containLabel: false },
            animation: false,
            xAxis: {
                type: 'category',
                data: sampleCategories,
                show: false,
                splitArea: {
                    show: true
                }
            },
            yAxis: [{
                show: true,
                splitArea: {
                    show: true
                },
                type: 'category',
                position: "left",
                data: finialGeneList.map((item) => item.percentage),
                axisLabel: {
                    color: "#000",
                    align: "right",
                    fontSize: 8,
                    interval: 0
                },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: {
                    show: false,
                },
            }, {
                type: 'category',
                position: "right",
                splitArea: {
                    show: true
                },
                data: finialGeneList.map((item) => item.gene),
                axisLabel: {
                    color: "#000",
                    align: "left",
                    fontSize: 8,
                    interval: 0,
                    formatter: function (value) {
                        if (value?.length > 10) {
                            return value.substring(0, 10) + "...";
                        }
                        return value;
                    }
                },

                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: {
                    show: false,
                },
            }],
            tooltip: {
                formatter: function (params) {
                    const { sampleId = "", gene = "", isDriver = "", mutationTypesCounts = null, clinic } = params.data?.custom ?? {};
                    const { gender = "", race = "", age = "", hbv = "", hcv = "", tnmStageV8 = "" } = clinic ?? {}
                    const [x, y, value] = params.data?.value;
                    let tooltipContent = `Gene: ${gene} ${isDriver ? "Is Driver Gene" : "Not Driver Gene"}<br>`;
                    tooltipContent += `Sample: ${sampleType == "bySample" ? sampleId : (sampleId?.split('_').slice(0, 2).join('_'))}<br>`;
                    tooltipContent += `<span style="display: inline-block; background-color:${age.color};width: 10px;height: 10px;margin-right: 5px"></span>Age: ${age.value}<br>`;
                    tooltipContent += `<span style="display: inline-block; background-color:${gender.color};width: 10px;height: 10px;margin-right: 5px"></span>Gender: ${gender.value}<br>`;
                    tooltipContent += `<span style="display: inline-block; background-color:${race.color};width: 10px;height: 10px;margin-right: 5px"></span>Race: ${race.value}<br>`;
                    tooltipContent += `<span style="display: inline-block; background-color:${tnmStageV8.color};width: 10px;height: 10px;margin-right: 5px"></span>Stage: ${tnmStageV8.value}<br>`;
                    tooltipContent += `<span style="display: inline-block; background-color:${hbv.color};width: 10px;height: 10px;margin-right: 5px"></span>HBV: ${hbv.value}<br>`;
                    tooltipContent += `<span style="display: inline-block; background-color:${hcv.color};width: 10px;height: 10px;margin-right: 5px"></span>HCV: ${hcv.value}<br>`;
                    tooltipContent += `Mutation Total: ${value}<br>`;
                    for (const type in mutationTypesCounts) {
                        tooltipContent += `<span style="display: inline-block; background-color:${mutationTypeColorConfig[type]};width: 10px;height: 10px;margin-right: 5px"></span>${type}: ${mutationTypesCounts[type]}<br>`;
                    }

                    return tooltipContent;
                }
            },

            visualMap: {
                show: false,
            },
            series: series,

        };
        return leftChartOption
    }
    useEffect(() => {
        setLoading(true);
        if (!sampleGenesMutations || !finialGeneList || !sampleCategories || !sampleType) return;
        const option = buildLeftChartOption();
        setLeftChartOption(option);
        setLoading(false);
    }, [sampleGenesMutations, finialGeneList, sampleCategories, sampleType])

    const onEvents = {
        'mouseover': (params) => {
            const { custom: { sampleId, gene } } = params.data;

            const patientId = sampleId?.split('_').slice(0, 2).join('_') + "_";
            const startSampleIndex = sampleCategories.findIndex((item) => item.includes(patientId))
            const endSampleIndex = sampleCategories.findLastIndex((item) => item.includes(patientId))

            chartRef.current?.getEchartsInstance().setOption({
                series: [{
                    markArea: {
                        silent: true,
                        emphasis: {
                            enabled: true
                        },
                        animation: true,
                        label: {
                            padding: 5,
                        },
                        itemStyle: {
                            shadowBlur: 5,
                            shadowColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'rgba(210, 235, 227, .8)'
                        },
                        data: [[
                            {
                                name: "Patient Id: " + sampleId?.split('_').slice(0, 2).join('_'),
                                xAxis: sampleCategories[startSampleIndex],
                                yAxis: finialGeneList[0].gene
                            },
                            {
                                xAxis: sampleCategories[endSampleIndex],
                                yAxis: finialGeneList[finialGeneList.length - 1]?.gene
                            }
                        ]]
                    }
                }]
            });
        },
        'mouseout': () => {
            chartRef.current?.getEchartsInstance().setOption({
                series: [{
                    markArea: {
                        data: []
                    }
                }]
            });
        }
    }

    return (
        <EmptyLoading loading={loading} hasData={!!sampleGenesMutations?.series?.length}>
            <ReactECharts ref={chartRef} onEvents={sampleType === "byPatient" ? onEvents : null} option={leftChartOption}
                style={{ width: '100%', height: height }} opts={{ renderer: 'svg' }}>
            </ReactECharts>
        </EmptyLoading>

    );
}
export default SampleChart;
