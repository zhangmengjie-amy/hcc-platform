"use client";
import React, {useEffect, useRef, useState} from 'react';
import {Row, Col} from 'antd';
import {getGene} from "@/configs/request";
import generageClinicData from '@/utils/generageClinicData';
import ReactECharts from 'echarts-for-react';
import {useTranslation} from "react-i18next";
import {Layout, Flex, Typography, Input, Card, Carousel, Button} from 'antd';
import styles from "./style.module.scss";

const {Paragraph} = Typography;
const DriverLandscape = () => {
    const {t} = useTranslation();
    const [topChartOption, setTopChartOption] = useState({});
    const [bottomChartOption, setBottomChartOption] = useState({});
    const [leftChartOption, setLeftChartOption] = useState({});
    const [rightChartOption, setRightChartOption] = useState({});
    const geneData = useRef(null);
    const clinicData = useRef(null);
    useEffect(() => {
        const clinicSeries = ["gender", "age", "race", "HCV", "HBV", "stage"];
        const mutationTypeColorConfig = [{
            type: 'missense',
            color: "rgb(114, 158, 206)"
        },
            {
                type: 'stopCodon',
                color: "rgb(255, 158, 74)"
            },
            {
                type: 'spliceSite',
                color: "rgb(103, 191, 92)"
            },
            {
                type: 'frameShiftIndel',
                color: "rgb(237, 102, 93)"
            }, {
                type: 'transtationStartSite',
                color: "rgb(173, 139, 201)"
            }, {
                type: 'inFrameIndel',
                color: "rgb(168, 120, 110)"
            }]
        const fetchData = async () => {
            geneData.current = await getGene();
            clinicData.current = generageClinicData();
        };


        fetchData().then(() => {
            console.log(geneData.current);
            console.log(clinicData.current);
            const buildTopChartOption = () => {
                const topChartSeries = mutationTypeColorConfig.map((configItem, index) => {
                    return {
                        name: t(`mutation:type.${configItem.type}`),
                        type: 'bar',
                        stack: true,
                        color: configItem.color,
                        data: clinicData.current.slice(0, 450).map((clinicItem) => {
                            const typeItem = clinicItem.mutationCountList.find((countItem) => countItem.type == configItem.type)
                            if (configItem.type === "inFrameIndel" || configItem.type == "transtationStartSite") { // TODO
                                return 0
                            }
                            return typeItem.count
                        })
                    }
                });
                const _topChartOption = {
                    grid: {
                        left: 25,
                        right: "16.667%",
                        top: 10,
                        bottom: 10,
                        containLabel: false
                    },
                    tooltip: {
                        show: true,
                        trigger: "axis",
                        position: function (point, params, dom, rect, size) {
                            return [point[0], point[1] + 30]; // 向下偏移20px
                        }
                    },
                    legend: {
                        show: false
                    },
                    xAxis: {
                        type: 'category',
                        show: false,
                        boundaryGap: false,
                        data: clinicData.current.map((item) => item.sample),
                        splitLine: {
                            show: false,
                        },
                    },
                    yAxis: {
                        type: 'value',
                        splitLine: {
                            show: false,
                        },
                        axisLine: {show: true},  // 隐藏轴线
                        axisTick: {show: true},   // 隐藏刻度
                        axisLabel: {
                            color: "#000",
                            fontSize: 8
                        },
                    },
                    series: topChartSeries,
                }
                return _topChartOption
            }
            const buildBottomChartOption = () => {
                const seriesList = {
                    stage: {
                        early: 'rgb(255,255,240)',
                        late: 'rgb(253,174,107)'
                    },
                    HBV: {
                        negative: 'rgb(255,255,224)',
                        positive: 'rgb(110,123,139)'
                    },
                    HCV: {
                        negative: 'rgb(255,255,224)',
                        positive: 'rgb(110,123,139)'
                    },
                    race: {
                        ASIAN: 'rgb(255,247,243)',
                        CAUCASIAN: 'rgb(247,104,161)'
                    },
                    age: ['rgb(224,243,291)', 'rgb(168,221,181)', 'rgb(67,162,202)'],
                    gender:
                        {
                            female: 'rgb(255,228,225)',
                            male:
                                'rgb(108,166,205)'
                        }
                }
                const symbolSize = [1, 10];
                const seriesData = [];
                clinicSeries.forEach((item, yIndex) => {
                    clinicData.current.forEach((series, xIndex) => {
                        let color = seriesList[item][series[item]] ?? '#fff';
                        if (item === 'age') {
                            if (series[item] < 58) {
                                color = seriesList[item][0]
                            } else if (series[item] < 88) {
                                color = seriesList[item][1]
                            } else {
                                color = seriesList[item][2]
                            }
                        }
                        seriesData.push({
                            value: [xIndex, yIndex],
                            category: item,
                            categoryValue: series[item],
                            itemStyle: {
                                color
                            }
                        });
                    })
                });
                const bottomChartOption = {
                    grid: {
                        left: 35,
                        right: "16.667%",
                        top: 0,
                        bottom: 10,
                        containLabel: false
                    },
                    yAxis: {
                        type: 'category',
                        show: true,
                        position: "right",
                        data: clinicSeries.map((item) => t(`mutation:sample.${item}`)),
                        splitLine: {
                            show: false,
                        },
                        axisLabel: {
                            show: true,
                            color: '#000',
                            fontSize: 8,
                            verticalAlign: "middle"
                        },
                        axisLine: {show: false},  // 隐藏轴线
                        axisTick: {show: false},   // 隐藏刻度
                    },
                    xAxis: {
                        type: 'category',
                        position: 'right',
                        data: clinicData.current.map((item) => item.sample),
                        axisLine: {show: false},
                        axisTick: {show: false},
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
            ${t(`mutation:sample.${item.data.category}`)}: ${item.data.categoryValue}
          </span></div>
        `;
                            });
                            return result;
                        }

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
                if (i < 25) return mutationTypeColorConfig[0].color;
                else if (i < 50) return mutationTypeColorConfig[1].color;
                else if (i < 100) return mutationTypeColorConfig[2].color;
                else if (i < 110) return mutationTypeColorConfig[3].color;
                else return "#fff"
            }

            function generateShowerScatterData() {
                const totalRows = 62;
                const maxPoints = 450;
                const data = [];

                // 生成HSL色轮颜色 (62色)
                const colorPool = mutationTypeColorConfig.map((item) => item.color)

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
                            {start: 6, width: 30 + row * 1.5, density: 0.08},
                            {start: 140, width: 40 + row * 2, density: 0.06},
                            {start: 300, width: 60 + row * 3, density: 0.06}
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
                        symbolSize: [2, 6],
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
                        data: geneData.current.mutation.percentage.map((value) => `${(value * 100).toFixed(0)}%`),
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
                    tooltip: {
                        show: false,
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
                        extraCssText: 'min-width: 230px;'
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
                        data: geneData.current?.geneList,
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
                    series: geneData.current?.mutation?.detail.map((item) => {
                        const series = mutationTypeColorConfig.find((_series) => _series.type == item.type);
                        return {
                            ...item,
                            color: series.color,
                            name: t(`mutation:type.${item.type}`),
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
                                  style={{width: '100%', height: "490px"}}>

                    </ReactECharts>
                </Col>
                <Col xs={4} md={4}>
                    <ReactECharts option={rightChartOption}
                                  style={{width: '100%', height: "500px"}}>

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
            <Row style={{width: '100%'}} algin={"center"} justify={"center"}>
                <Col sm={6} md={6}>
                    <Paragraph style={{textAlign: "center", margin: 0}}>Alterations</Paragraph>
                    <Row>
                        <Col sm={11} md={11}>

                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                      style={{backgroundColor: "rgb(237, 102, 93)"}}></span>{t("mutation:type.frameShiftIndel")}
                            </Paragraph>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                      style={{backgroundColor: "rgb(114, 158, 206)"}}></span>{t("mutation:type.missense")}
                            </Paragraph>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                      style={{backgroundColor: "rgb(168, 120, 110)"}}></span>{t("mutation:type.inFrameIndel")}
                            </Paragraph>
                        </Col>
                        <Col sm={13} md={13}>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                      style={{backgroundColor: "rgb(255, 158, 74)"}}></span>{t("mutation:type.stopCodon")}
                            </Paragraph>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                      style={{backgroundColor: "rgb(103, 191, 92)"}}></span>{t("mutation:type.spliceSite")}
                            </Paragraph>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                      style={{backgroundColor: "rgb(173, 139, 201)"}}></span>{t("mutation:type.transtationStartSite")}
                            </Paragraph>

                        </Col>
                    </Row>
                </Col>
                <Col sm={2} md={2}>
                    <Paragraph style={{margin: 0}}>Stage</Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(255,255,240)'}}></span>Early
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(253,174,107)'}}></span>Late
                    </Paragraph>
                </Col>
                <Col sm={2} md={2}>
                    <Paragraph style={{margin: 0}}>HBV</Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(255,255,224)'}}></span>HBV-
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(110,123,139)'}}></span>HBV+
                    </Paragraph>
                </Col>
                <Col sm={2} md={2}>
                    <Paragraph style={{margin: 0}}>HCV</Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(255,255,224)'}}></span>HCV-
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(110,123,139)'}}></span>HCV+
                    </Paragraph>
                </Col>
                <Col sm={2} md={2}>
                    <Paragraph style={{margin: 0}}>Race</Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(255,247,243)'}}></span>ASIAN
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(247,104,161)'}}></span>CAUCASIAN
                    </Paragraph>
                </Col>
                <Col sm={2} md={2}>
                    <Paragraph style={{margin: 0}}>Age</Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(224,243,291)'}}>

                        </span>
                        &lt;=58
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(168,221,181)'}}>

                        </span>58-88
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                              style={{backgroundColor: 'rgb(67,162,202)'}}>
                        </span>
                        &gt;=88
                    </Paragraph>
                </Col>
                <Col sm={2} md={2}>
                    <Paragraph style={{margin: 0}}>Gender</Paragraph>
                    <Paragraph className={styles.legendName}><span className={styles.colorBlock}
                                                                   style={{backgroundColor: 'rgb(255,228,225)'}}></span>Female
                    </Paragraph>
                    <Paragraph className={styles.legendName}><span className={styles.colorBlock}
                                                                   style={{backgroundColor: 'rgb(108,166,205)'}}></span>Male
                    </Paragraph>
                </Col>
            </Row>
        </Row>


    );
}
export default DriverLandscape;
