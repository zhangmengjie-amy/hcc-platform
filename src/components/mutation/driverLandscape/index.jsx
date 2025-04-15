"use client";
import React, {useEffect, useRef, useState} from 'react';
import {Row, Col} from 'antd';
import {getGene} from "@/configs/request";
import generageClinicData from '@/utils/generageClinicData';
import ReactECharts from 'echarts-for-react';

const DriverLandscape = () => {
    const [topChartOption, setTopChartOption] = useState({});
    const [bottomChartOption, setBottomChartOption] = useState({});
    const [leftChartOption, setLeftChartOption] = useState({});
    const [rightChartOption, setRightChartOption] = useState({});
    const geneData = useRef(null);
    const clinicData = useRef(null);
    useEffect(() => {

        const commonSeries = [{
            name: 'Missense',
            color: "rgb(114, 158, 206)",
            data: [240, 380, 50, 20, 20, 15, 10, 40, 35, 25, 20, 20, 20, 20, 15, 20, 10, 5, 8, 8, 7, 5, 5, 5, 5, 5, 5, 5, 5, 4, 0, 0, 0, 2, 0, 0, 6, 0, 0, 5, 0, 0, 3, 3, 0, 0, 0, 1, 0, 1, 0, 2, 0, 1, 0, 0, 0, 0, 2, 1, 0, 0]
        },
            {
                name: 'Stop Codon',
                color: "rgb(255, 158, 74)",
                data: [40, 0, 20, 5, 0, 20, 20, 0, 2, 0, 2, 2, 2, 2, 0, 0, 0, 2, 2, 0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 3, 5, 0, 3, 1, 0, 6, 0, 0, 5, 0, 0, 0, 0, 0, 3, 0, 0, 1, 1, 2, 0, 0, 0, 2, 2, 1, 0, 0, 0, 1, 0, 1]
            },
            {
                name: 'Splice Site',
                color: "rgb(103, 191, 92)",
                data: [60, 0, 0, 5, 5, 0, 5, 0, 0, 5, 2, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 6, 0, 0, 5, 0, 2, 0, 0, 3, 0, 1, 1, 0, 1, 0, 2, 0, 0, 1, 2, 0, 0, 0, 1, 0]
            },
            {
                name: 'Frame Shift Indel',
                color: "rgb(237, 102, 93)",
                data: [50, 5, 30, 50, 50, 30, 20, 5, 5, 10, 10, 5, 5, 5, 5, 0, 5, 5, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 2, 5, 2, 3, 6, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 3, 0, 1, 0, 2, 1, 1, 0, 0, 0, 0, 2, 0, 0, 1, 1]
            }]
        const fetchData = async () => {
            geneData.current = await getGene();
            clinicData.current = generageClinicData();
        };


        fetchData().then(() => {

            const buildTopChartOption = () => {
                const generateData = () => {
                    const data = [];
                    for (let i = 0; i < 450; i++) {
                        data.push((Math.random()).toFixed(0));
                    }
                    return data;
                };


                const topChartSeries = commonSeries.map((item, index) => ({
                    name: item.name,
                    type: 'bar',
                    stack: true,
                    data: generateData(),
                }));

                const _topChartOption = {
                    grid: {
                        left: 25,
                        right: "16.667%",
                        top: 5,
                        bottom: 10,
                        containLabel: false
                    },
                    tooltip: {
                        show: true,
                        trigger: "item",
                        position: "bottom"
                    },
                    legend: {
                        show: false
                    },
                    xAxis: {
                        type: 'category',
                        show: false,
                        boundaryGap: false,
                        data: Array.from({length: 500}, (_, i) => i + 1),
                        splitLine: {
                            show: false,
                        },
                    },
                    yAxis: {
                        type: 'value',
                        min: 0,
                        max: 5,
                        splitLine: {
                            show: false,
                        },
                        axisLine: {show: true},  // 隐藏轴线
                        axisTick: {show: true},   // 隐藏刻度
                        axisLabel: {
                            color: "#000",
                            fontSize: 10
                        },
                    },
                    series: topChartSeries,
                    color: commonSeries.map((item) => item.color) // 定制颜色
                }
                return _topChartOption
            }
            const buildBottomChartOption = () => {
                const seriesList = [{
                    name: "Stage",
                    colors: ['rgb(255,255,240)', 'rgb(253,174,107)'],
                }, {
                    name: "HBV",
                    colors: ['rgb(255,255,224)', 'rgb(110,123,139)']
                }, {
                    name: "HCV",
                    colors: ['rgb(255,255,224)', 'rgb(110,123,139)']
                }, {
                    name: "Race",
                    colors: ['rgb(255,247,243)', 'rgb(247,104,161)']
                }, {
                    name: "Age",
                    colors: ['rgb(224,243,291)', 'rgb(168,221,181)', 'rgb(67,162,202)']
                }, {
                    name: "Gender",
                    colors: ['rgb(255,228,225)', 'rgb(108,166,205)']
                }]
                const dotsPerRow = 500;
                const symbolSize = [1, 10];
                const seriesData = [];
                seriesList.forEach((item, yIndex) => {
                    for (let x = 0; x < dotsPerRow; x++) {
                        seriesData.push({
                            value: [x, yIndex],
                            itemStyle: {
                                color: item.colors[item.colors.length === 3 ? (Math.random() < 0.2 ? 0 : (Math.random() < 0.6 ? 1 : 2)) : (Math.random() < 0.5 ? 0 : 1)]
                            }
                        });
                    }
                });
                const bottomChartOption = {
                    grid: {
                        left: 35,
                        right: "16.667%",
                        top: 0,
                        bottom: 10,
                        containLabel: false
                    },
                    tooltip: {
                        show: true,
                        trigger: "item",
                    },
                    xAxis: {
                        show: false,
                        max: dotsPerRow - 1,
                        splitLine: {
                            show: false,
                        },
                        axisLabel: {
                            color: '#000',
                            fontSize: 8,
                            verticalAlign: "middle"
                        },
                        axisLine: {show: false},  // 隐藏轴线
                        axisTick: {show: false},   // 隐藏刻度
                    },
                    yAxis: {
                        type: 'category',
                        position: 'right',
                        data: seriesList.map((item) => item.name),
                        inverse: true,
                        axisLine: {show: false},
                        axisTick: {show: false},
                        axisLabel: {
                            color: '#000',
                            fontSize: 8,
                            verticalAlign: "middle"
                        },
                        splitLine: {
                            show: false,
                        },
                    },
                    series: [{
                        type: 'scatter',
                        symbol: 'rect',
                        symbolSize,
                        data: seriesData,
                    }]
                }
                return bottomChartOption
            }

            const getColor = (i) => {
                if (i < 25) return commonSeries[0].color;
                else if (i < 50) return commonSeries[1].color;
                else if (i < 100) return commonSeries[2].color;
                else if (i < 110) return commonSeries[3].color;
                else return "#fff"
            }

            function generateShowerScatterData() {
                const totalRows = 62;
                const maxPoints = 450;
                const data = [];

                // 生成HSL色轮颜色 (62色)
                const colorPool = commonSeries.map((item) => item.color)

                // 生成每一行数据
                for (let row = 0; row < totalRows; row++) {
                    const rowData = [];

                    if (row === 0) {
                        // 第一行：连续150个点，6色循环
                        for (let i = 0; i < 150; i++) {
                            rowData.push({
                                x: i + 1,
                                y: row,
                                value: [i + 1, row],
                                itemStyle: {
                                    color: getColor(i)
                                }
                            });
                        }
                    } else {
                        // 其他行：3个散点区域
                        const segmentParams = [
                            {start: 6, width: 50 + row * 1.5, density: 0.1},
                            {start: 100, width: 50 + row * 2, density: 0.2},
                            {start: 230, width: 60 + row * 3, density: 0.3}
                        ];

                        segmentParams.forEach((param, segIdx) => {
                            const pointCount = Math.floor(param.width * param.density);
                            const segColor = colorPool[(row + segIdx) % colorPool.length];

                            for (let i = 0; i < pointCount; i++) {
                                const x = param.start + Math.random() * param.width;
                                if (x >= maxPoints) continue;

                                rowData.push({
                                    x: x,
                                    y: row,
                                    value: [x, row],
                                    itemStyle: {
                                        color: segColor,
                                    },

                                    segment: segIdx
                                });
                            }
                        });
                    }

                    data.push({
                        type: 'scatter',
                        symbol: 'rect',
                        symbolSize: [4, 5],
                        data: rowData,
                    });
                }

                return data;
            }

            const buildLeftChartOption = () => {
                const rows = generateShowerScatterData();
                const leftChartOption = {
                    grid: {top: 5, bottom: 0, left: 0, right: 0, containLabel: true},
                    xAxis: {
                        type: 'value',
                        max: 500,
                        interval: 0,
                        show: false
                    },
                    yAxis: {
                        inverse: true,
                        type: 'category',
                        data: ['29%', '28%', '9%', '9%', '9%', '7%', '7%', '5%', '4%', '4%', '4%', '4%', '4%', '4%', '3%', '3%', '3%', '3%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '2%', '1%', '2%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%', '1%'],
                        axisLabel: {
                            color: "#000",
                            interval: 0,
                            align: "left",
                            fontSize: 8,
                            padding: [0, 0, 0, -10]
                        },
                        axisLine: {show: false},  // 隐藏轴线
                        axisTick: {show: false},   // 隐藏刻度
                        splitLine: {
                            show: false,
                        },
                    },

                    series: rows
                };
                return leftChartOption
            }
            const buildRightChartOption = () => {
                const rightChartOption = {
                    grid: {
                        left: 10,
                        right: 12,
                        top: 0,
                        bottom: 10,
                        containLabel: true
                    },
                    tooltip: {
                        show: true,
                        trigger: "axis",
                    },
                    xAxis: {
                        type: 'value',
                        position: 'top',
                        splitLine: {
                            show: false,
                        },
                        axisLabel: {
                            color: "#000",
                            fontSize: 8
                        },
                        axisLine: {show: true},
                        axisTick: {show: true},
                    },
                    yAxis: {
                        inverse: true,
                        type: 'category',
                        data: ['TP53', 'CTNNB1', 'APOB', 'ARID1A', 'ALB', 'ARID2', 'AXIN1', 'COL11A1', 'RPS6KA3', 'NFE2L2', 'KMT2D', 'RB1', 'TSC2', 'DOCK2', 'ACVR2A', 'KEAP1', 'SETD2', 'SRCAP', 'APC', 'BAP1', 'PIK3CA', 'NCOR1', 'CDKN2A', 'TNRC6B', 'HNF1A', 'SF3B1', 'VAV3', 'BRD7', 'PTEN', 'KMT2B', 'PBRM1', 'TF', 'NEFH', 'IL6ST', 'TSC1', 'DYRK1A', 'EEF1A1', 'ATRX', 'ARID1B', 'CDKN1A', 'HNF4A', 'PTPN3', 'CYP2E1', 'RPL22', 'KCNN3', 'ERRFI1', 'HNRNPA2B1', 'SLC30A1', 'FRG1', 'TLE1', 'GSE1', 'KDM6A', 'ADH1B', 'IDH1', 'SELPLG', 'HP', 'CRIP3', 'KRAS', 'ZFP36LE', 'CELF1', 'PHF10', 'RAPGEF2'],
                        axisLabel: {
                            color: "#000",
                            interval: 0,
                            align: "left",
                            fontSize: 8,
                            padding: [0, 0, 0, -48]
                        },
                        axisLine: {show: false},  // 隐藏轴线
                        axisTick: {show: false},   // 隐藏刻度
                        splitLine: {
                            show: false,
                        },
                    },
                    series: commonSeries.map((item) => {
                        return {
                            ...item,
                            type: 'bar',
                            stack: true,
                        }
                    })
                };
                return rightChartOption
            }
            setBottomChartOption(buildBottomChartOption());
            setTopChartOption(buildTopChartOption());
            setRightChartOption(buildRightChartOption());
            setLeftChartOption(buildLeftChartOption())
        });
    }, []);

    return (
        <Row style={{width: "100%"}}>
            <Row style={{width: "100%"}}>
                <Col xs={24} md={24}>
                    <ReactECharts style={{height: "60px", width: "100%"}} option={topChartOption}></ReactECharts>
                </Col>
            </Row>

            <Row style={{width: '100%'}}>
                <Col xs={20} md={20}>
                    <ReactECharts option={leftChartOption}
                                  style={{width: '100%', height: "480px"}}>

                    </ReactECharts>
                </Col>
                <Col xs={4} md={4}>
                    <ReactECharts option={rightChartOption}
                                  style={{width: '100%', height: "490px"}}>

                    </ReactECharts>
                </Col>
            </Row>
            <Row style={{width: '100%'}}>
                <Col xs={24} md={24}>
                    <ReactECharts option={bottomChartOption}
                                  style={{height: "80px", width: '100%'}}>
                    </ReactECharts>
                </Col>
            </Row>
        </Row>


    );
}
export default DriverLandscape;
