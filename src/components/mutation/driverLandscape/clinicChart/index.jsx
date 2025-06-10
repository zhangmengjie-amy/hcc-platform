"use client";
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from "react-i18next";
import EmptyLoading from "@/components/emptyLoading";
import { clinicConfig } from "@/configs/mutation";
const ClinicChart = ({ clinicList }) => {
    const { t } = useTranslation();
    const [bottomChartOption, setBottomChartOption] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (!clinicList) return;
        const option = buildBottomChartOption();
        setBottomChartOption(option);
        setLoading(false)
    }, [clinicList])

    const getBottomSeries = () => {
        const seriesData = [];
        clinicConfig.forEach((item, yIndex) => {
            clinicList?.forEach((series, xIndex) => {
                let color = series[item.key].color ?? "transparent";
                let categoryValue = series[item.key].value;
                seriesData.push({
                    value: [xIndex, yIndex, 0],
                    category: item.key,
                    categoryValue: categoryValue,
                    itemStyle: {
                        color,
                    }
                });
            })
        });
        return seriesData;
    }
    const buildBottomChartOption = () => {
        const bottomChartOption = {
            grid: {
                left: 40,
                right: 60,
                top: 0,
                bottom: 0,
                containLabel: false
            },
            animation: false,
            yAxis: {
                type: 'category',
                show: true,
                position: "right",
                data: clinicConfig.map((item) => t(`mutation:sample.${item.key}`)),
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    show: true,
                    color: '#000',
                    fontSize: 8,
                    verticalAlign: "middle"
                },
                axisLine: { show: false },  // 隐藏轴线
                axisTick: { show: false },   // 隐藏刻度
            },
            xAxis: {
                type: 'category',
                position: 'right',
                data: clinicList?.map((item) => item.sampleId),
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    show: false,
                    color: '#000',
                    fontSize: 8,
                    verticalAlign: "middle"
                },
                splitLine: {
                    show: false,
                },
            },
            tooltip: {
                show: true,
                trigger: "axis",
                formatter: function (params) {
                    // params 是数组，包含当前坐标位置所有系列的数据
                    let result = `<div style="font-weight:bold">${params[0].axisValue}</div>`;
                    params.reverse().forEach(item => {
                        result += `
          <div><span style="display: inline-block; background-color:${item.color};width: 10px;height: 10px"></span><span>
            ${t(`mutation:sample.${item.data?.category}`)}: ${item.data?.categoryValue}
          </span></div>
        `;
                    });
                    return result;
                }

            },
            visualMap: {
                show: false,
            },
            series: [{
                type: 'heatmap',
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgb(29, 86, 126)'
                    }
                },
                data: getBottomSeries(),
            }]
        }
        return bottomChartOption
    }
    return (
        <EmptyLoading loading={loading} showEmpty={true} hasData={!!clinicList?.length}>
            <ReactECharts option={bottomChartOption} opts={{ renderer: 'svg' }}
                lazyUpdate={true}
                style={{ height: "80px", width: '100%' }}>
            </ReactECharts>
        </EmptyLoading>

    );
}
export default ClinicChart;
