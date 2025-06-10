"use client";
import React, { useEffect, useState } from 'react';

import ReactECharts from 'echarts-for-react';
import EmptyLoading from "@/components/emptyLoading";

const GeneChart = ({ genesMutations, finialGeneList, height }) => {

    const [rightChartOption, setRightChartOption] = useState({});
    const [loading, setLoading] = useState(true);
    useEffect(() => {
    setLoading(true);
        if (!genesMutations || !finialGeneList) return;
        const option = buildRightChartOption();
        setRightChartOption(option);
        setLoading(false);
    }, [genesMutations, finialGeneList])

    const buildRightChartOption = () => {
        const rightChartOption = {
            grid: {
                left: 10,
                right: 20,
                top: 20,
                bottom: 0,
                containLabel: false
            },
            animation: false,
            tooltip: {
                show: true,
                trigger: "axis",
                extraCssText: 'min-width: 240px;',

            },
            xAxis: {
                type: 'value',
                position: 'top',
                splitLine: {
                    show: false,
                },
                axisLabel: {
                    color: "#000",
                    fontSize: 8,
                    formatter: function (value, index) {
                        return index % 2 === 0 ? value : ''; // 每隔一个显示一个
                    }
                },
                axisLine: { show: true },
                axisTick: { show: true },
            },
            yAxis: {
                show: false,
                type: 'category',
                data: finialGeneList.map((item) => item.gene),
                axisLabel: {
                    color: "#000",
                    interval: 0,
                    align: "left",
                    fontSize: 8,
                },
                axisLine: { show: false },  // 隐藏轴线
                axisTick: { show: false },   // 隐藏刻度
                splitLine: {
                    show: false,
                },
            },
            series: genesMutations
        };
        return rightChartOption
    }

    return (
        <EmptyLoading loading={loading} showEmpty={true} hasData={!!genesMutations?.length}>
            <ReactECharts option={rightChartOption} opts={{ renderer: 'svg' }}
                style={{ width: '100%', height: height, marginTop: "-20px" }}>
            </ReactECharts>
        </EmptyLoading>
    );
}
export default GeneChart;
