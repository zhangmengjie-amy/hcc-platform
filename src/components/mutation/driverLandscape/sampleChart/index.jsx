"use client";
import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from "react-i18next";
import EmptyLoading from "@/components/emptyLoading";
import { mutationTypeColorConfig } from "@/configs/mutation";

const SampleChart = ({ sampleGenesMutations, finialGeneList, sampleCategories, sampleType, height }) => {
    const [leftChartOption, setLeftChartOption] = useState({});
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);

const getPatientGroups = () => sampleCategories.reduce((groups, id, i) => {
    const patientId = id.split('_').slice(0, 2).join('_');
    if (patientId !== (groups[groups.length - 1]?.patientId)) {
        if (groups.length) groups[groups.length - 1].end = i - 1;
        groups.push({
            patientId,
            start: i,
            end: sampleCategories.length - 1,
            color: groups.length % 2 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(225,240,250,0.7)'
        });
    }
    return groups;
}, []);

    const buildLeftChartOption = () => {
        setLoading(true);
        if (!sampleGenesMutations) return;
        let series = [];

        for (let index = 0; index < sampleGenesMutations?.maxMutationTypeNumber; index++) {
            series.push({
                type: 'heatmap',
                yAxisIndex: 1,
                markArea: {
                    silent: true,
                    itemStyle: {
                        borderWidth: 0
                    },
                    data: sampleType === "byPatient" ? getPatientGroups().map(group => {
                        return [{
                            xAxis: group.start,
                            itemStyle: {
                                color: group.color
                            }
                        }, {
                            xAxis: group.end,
                            itemStyle: {
                                color: group.color
                            }
                        }];
                    }) : []
                },
                data: sampleGenesMutations?.series.filter((item) => item.custom.seriesIndex === index).map((item) => {
                    return {
                        ...item,
                        itemStyle: {
                            borderWidth: 0,
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
            grid: { top: 1, bottom: 0, left: 40, right: 60, containLabel: false },
            animation: false,
            xAxis: {
                show: false,
                type: 'category',
                data: sampleCategories,
                splitArea: {
                    show: false
                },
                axisLabel: {
                    interval: 0,
                },
            },
            yAxis: [{
                show: true,
                splitArea: {
                    show: sampleType == "bySample"
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
                    show: sampleType == "bySample"
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

    return (
            <EmptyLoading loading={loading} showEmpty={false} hasData={!!sampleGenesMutations?.series?.length}>
                <ReactECharts ref={chartRef}
                    option={leftChartOption}
                    style={{ width: '100%', height: height }} opts={{ renderer: 'svg' }}>
                </ReactECharts>
            </EmptyLoading>
    );
}
export default SampleChart;
