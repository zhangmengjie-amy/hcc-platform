"use client";
import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from "react-i18next";
import EmptyLoading from "@/components/emptyLoading";
const MutationChart = ({ sampleMutations, sampleCategories }) => {

    const [topChartOption, setTopChartOption] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (!sampleCategories || !sampleMutations) return;
        const option = buildTopChartOption();
        setTopChartOption(option);
        setLoading(false)
    }, [sampleMutations, sampleCategories])

    const buildTopChartOption = () => {
        const _topChartOption = {
            grid: {
                left: 40,
                right: 60,
                top: 8,
                bottom: 0,
                containLabel: false
            },
            animation: false,
            tooltip: {
                show: true,
                trigger: "axis",
                position: function (point) {
                    return [point[0] - 20, point[1] + 20];
                }
            },
            legend: {
                show: false
            },
            xAxis: {
                type: 'category',
                show: false,
                data: sampleCategories,
                splitLine: {
                    show: false,
                },
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: false,
                },

                axisLine: { show: true },  // 隐藏轴线
                axisTick: { show: true },   // 隐藏刻度
                axisLabel: {
                    color: "#000",
                    fontSize: 8,
                    verticalAlign: 'bottom',
                    formatter: function (value, index) {
                        return index % 2 === 0 ? value : ''; // 每隔一个显示一个
                    },
                },
            },
            series: sampleMutations,
        }
        return _topChartOption
    }
    return (
        <EmptyLoading loading={loading} showEmpty={true} hasData={!!sampleCategories?.length}>
            <ReactECharts style={{ height: "60px", width: "100%" }} opts={{ renderer: 'svg' }}
                option={topChartOption}>

            </ReactECharts>
        </EmptyLoading>
    );
}
export default MutationChart;
