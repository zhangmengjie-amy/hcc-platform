"use client";
import React, { forwardRef, useState, useEffect } from 'react';
import { PieChartOutlined, BarChartOutlined } from '@ant-design/icons';
import { Row, Col, Flex, Segmented, Grid } from 'antd';
import { useTranslation } from "react-i18next";
import ReactECharts from 'echarts-for-react';
import { color, symbol } from 'd3';


const Chart = forwardRef(({ option, title }, ref) => {
    const [chartOption, setChartOption] = useState(null);
    const [chartType, setChartType] = useState('pie');
    const { t } = useTranslation();
    useEffect(() => {
        if (!Object.keys(option).length) return;
        if (chartType === 'column') {
            const _chartOption = {
                grid: {
                    left: "15%",
                    right: "15%",
                    top: "20%",
                    bottom: "10%"
                },
                xAxis: {
                    show: true,

                    type: 'category',
                    data: Object.keys(option).map(key => key),
                    axisTick: { // Hide y-axis ticks
                        show: false,

                    },

                },
                yAxis: {
                    show: true,
                    type: 'value',
                    splitNumber: 4,

                    axisLine: {
                        lineStyle: {
                            color: '#999',
                            width: 1
                        }
                    }
                },
                legend: {
                    show: false,

                },
                series: [
                    {
                        data: Object.keys(option).map(key => ({ value: option[key].count, name: t(`mutation:sample.${key}`) })),
                        type: 'bar',
                        itemStyle: { // Add itemStyle for individual bar styling
                            color: (params) => {
                                return Object.keys(option).map(key => option[key].color)[params.dataIndex]; // Cycle through colors
                            }
                        }
                    }
                ]
            }
            setChartOption(_chartOption);
            return;
        }
        const _chartOption = {
            title: {
                text: t(`mutation:sample.${title}`),
                left: 'left',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                show: true,
                type: 'scroll',
                symbol: 'rect', // This remains as 'rect'
                itemWidth: 15,  // Set the width
                itemHeight: 15, // Set the height to the same value as width
                orient: 'horizontal',
                left: 'center',
                top: 'bottom',
                pageButtonItemGap: 5,
                pageButtonPosition: 'end',
                selectedMode: false
            },
            yAxis: {
                show: false
            },
            xAxis: {
                show: false
            },
            series: [
                {
                    name:  t(`mutation:sample.${title}`),
                    type: 'pie',
                    label: {
                        show: false,
                    },
                    color: Object.keys(option).map(key => option[key].color),
                    radius: '80%',
                    data: Object.keys(option).map(key => ({ value: option[key].count, name:  t(`mutation:sample.${key}`), })),
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        show: false // 禁用hover时的标签
                    }
                }
            ]
        }
        setChartOption(_chartOption);

    }, [option, chartType, title]);

    return (
        <>
            {
                chartOption && <div style={{ width: '100%', position: 'relative' }}>
                    <ReactECharts option={chartOption} opts={{ renderer: 'svg' }}
                        lazyUpdate={true}
                        style={{ height: "300px", width: '100%' }}>
                    </ReactECharts>
                    <Segmented
                        style={{ position: 'absolute', top: 0, right: 0 }}
                        vertical
                        onChange={(value) => {
                            setChartType(value);
                        }}
                        options={[
                            { value: 'pie', icon: <PieChartOutlined /> },
                            { value: 'column', icon: <BarChartOutlined /> },
                        ]}
                    />
                </div>
            }
        </>

    );
})
export default Chart;
