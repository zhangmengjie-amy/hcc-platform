"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Skeleton } from 'antd';
import { getGene, getSample, getClinic } from "@/configs/request";
import { DotChartOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from "react-i18next";
import { mutationTypeColorConfig, clinicConfig, clinicColorConfig, gerGene, } from "@/configs/mutation";
import { Typography } from 'antd';
import styles from "./style.module.scss";
import dynamic from 'next/dynamic';

const { Paragraph } = Typography;
const DriverLandscape = ({ geneList, clinicList }) => {
    const { t } = useTranslation();

    const ECharts = dynamic(() => import('echarts'), { ssr: false });
    const [topChartOption, setTopChartOption] = useState({});
    const [bottomChartOption, setBottomChartOption] = useState({});
    const [leftChartOption, setLeftChartOption] = useState({});
    const [rightChartOption, setRightChartOption] = useState({});
    const clinicRef = useRef(null);
    const geneRef = useRef(null);
    const sampleRef = useRef(null);
    const rightChartRef = useRef(null);
    const leftChartRef = useRef(null);
    const topChartRef = useRef(null);
    const bottomChartRef = useRef(null);
    const symbolSize = [1, 10];

    const getFilteredGene = () => {
        return geneRef.current.filter((item) => geneList.includes(item.gene));
    }
    const getFilteredClinic = () => {
        if (Object.keys(clinicList)?.length == 1 && Object.keys(clinicList)[0] === "gender") {
            return clinicRef.current.filter((item) => item["gender"] === "Female")
        }
        return clinicRef.current;
    }

    useEffect(() => {
        if (!geneList?.length) return;
        const fetchData = async () => {
            if (geneRef.current && clinicRef.current && sampleRef.current) {
                updateRightChart();
                updateLeftChart();
                updateBottomChart();
                updateTopChart();
            } else {
                const [gene, clinic, sample] = await Promise.all([
                    await getGene(),
                    await getClinic(),
                    await getSample()
                ]);
                geneRef.current = gene;
                clinicRef.current = clinic;
                sampleRef.current = sample;
                const _rightChart = buildRightChartOption();
                setRightChartOption(_rightChart);
                const _leftChart = buildLeftChartOption();
                setLeftChartOption(_leftChart);
                const _topChart = buildTopChartOption();
                setTopChartOption(_topChart);
                const _bottomChart = buildBottomChartOption();
                setBottomChartOption(_bottomChart);
            }
        };
        fetchData();
    }, [geneList?.length, clinicList, t]);


    const getRightSeries = () => {
        return Object.keys(mutationTypeColorConfig)?.map((config) => {
            return {
                data: getFilteredGene()?.map((item) => item[config]),
                color: mutationTypeColorConfig[config],
                name: t(`mutation:type.${config}`),
                type: 'bar',
                stack: true,
            }
        })
    }

    const updateRightChart = () => {
        if (rightChartRef.current) {
            const instance = rightChartRef.current.getEchartsInstance();
            instance?.setOption?.({
                yAxis: {
                    data: getFilteredGene()?.map((item) => item.gene),
                },
                series: getRightSeries()
            }, {
                replaceMerge: ['series'],
                notMerge: false
            });
        }
    };

    const updateTopChart = () => {
        if (topChartRef.current) {
            const instance = topChartRef.current.getEchartsInstance();
            instance.setOption({
                xAxis: {
                    data: getFilteredClinic()?.map((item) => item.sample_id),
                },
                series: getTopSeries()
            }, {
                replaceMerge: ['series'], // 只替换series
                notMerge: false
            });
        }
    };

    const updateBottomChart = () => {
        if (bottomChartRef.current) {
            const instance = bottomChartRef.current.getEchartsInstance();
            instance.setOption({
                yAxis: {
                    data: clinicConfig.map((item) => t(`mutation:sample.${item.key}`)),
                },
                xAxis: {
                    data: getFilteredClinic()?.map((item) => item.sample_id),
                },
                series: [{
                    type: 'scatter',
                    symbol: 'rect',
                    symbolSize,
                    data: getBottomSeries(),
                }]
            }, {
                replaceMerge: ['series'],
                notMerge: false
            });
        }
    };

    const updateLeftChart = () => {
        if (leftChartRef.current) {
            const instance = leftChartRef.current.getEchartsInstance();
            instance.setOption({
                yAxis: {
                    data: getFilteredGene()?.map((item) => `${((item.total_count / getFilteredClinic()?.length) * 100).toFixed(2)} %`),
                },
                series: generateMutationScatter()
            }, {
                replaceMerge: ['series'],
                notMerge: false
            });
        }
    };

    const getTopSeries = () => {
        return Object.keys(mutationTypeColorConfig).map((configItem) => {
            return {
                name: t(`mutation:type.${configItem}`),
                type: 'bar',
                stack: true,
                color: mutationTypeColorConfig[configItem],
                data: getFilteredClinic()?.map((clinicItem) => {
                    return clinicItem[configItem]
                })
            }
        })
    }

    const buildTopChartOption = () => {
        const _topChartOption = {
            grid: {
                left: 30,
                right: "16.667%",
                top: 10,
                bottom: 10,
                containLabel: false
            },
            animation: false,
            tooltip: {
                show: true,
                trigger: "axis",
                position: function (point) {
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
                data: getFilteredClinic()?.map((item) => item.sample_id),
                splitLine: {
                    show: false,
                },
            },
            yAxis: {
                type: 'value',
                splitNumber: 2,
                splitLine: {
                    show: false,
                },
                axisLine: { show: true },  // 隐藏轴线
                axisTick: { show: true },   // 隐藏刻度
                axisLabel: {
                    color: "#000",
                    fontSize: 8
                },
            },
            series: getTopSeries(),
        }
        return _topChartOption
    }

    const getBottomSeries = () => {
        const seriesData = [];
        clinicConfig.forEach((item, yIndex) => {
            getFilteredClinic()?.forEach((series, xIndex) => {
                let color = clinicColorConfig[item.key][series[item.key]?.toLowerCase()] ?? "transparent";
                let categoryValue = series[item.key];
                if (item.key === "hcv") {
                    color = series["viral_status"] === "C" || series["viral_status"] === "B/C" ? clinicColorConfig["hbv"]["positive"] : clinicColorConfig["hbv"]["negative"]
                    categoryValue = series["viral_status"] === "C" || series["viral_status"] === "B/C" ? "Positive" : "Negative"
                } else if (item.key === "hbv") {
                    color = series["viral_status"] === "B" || series["viral_status"] === "B/C" ? clinicColorConfig["hbv"]["positive"] : clinicColorConfig["hbv"]["negative"]
                    categoryValue = series["viral_status"] === "B" || series["viral_status"] === "B/C" ? "Positive" : "Negative"
                }

                seriesData.push({
                    value: [xIndex, yIndex],
                    category: item.key,
                    categoryValue: categoryValue,
                    itemStyle: {
                        color
                    }
                });
            })
        });
        return seriesData;
    }
    const buildBottomChartOption = () => {

        const bottomChartOption = {
            grid: {
                left: 35,
                right: "16.667%",
                top: 0,
                bottom: 10,
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
                data: getFilteredClinic()?.map((item) => item.sample_id),
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
                    params.forEach(item => {
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
                data: getBottomSeries(),
            }]
        }
        return bottomChartOption
    }

    const generateMutationScatter = () => {

        let data = []

        for (let g_index = 0; g_index < getFilteredGene()?.length; g_index++) {
            let rowData = [];
            for (let c_index = 0; c_index < getFilteredClinic()?.length; c_index++) {
                const currentSample = getFilteredClinic()?.[c_index].sample_id;
                const currentGene = getFilteredGene()?.[g_index]?.gene;
                const currentMutationType = sampleRef.current?.find((item) => item.sample_id == currentSample && item.gene == currentGene)?.mutation_type;
                if (mutationTypeColorConfig[currentMutationType]) {
                    rowData.push({
                        x: c_index + 1,
                        y: g_index,
                        value: [c_index + 1, g_index],
                        category: currentMutationType,
                        categoryValue: currentSample,
                        currentGene: currentGene,
                        itemStyle: {
                            color: mutationTypeColorConfig[currentMutationType] ?? "#fff"
                        }
                    });
                }

            }
            if (rowData.length) {
                data.push({
                    type: 'scatter',
                    symbol: 'rect',
                    large: true,
                    symbolSize: [2, 6],
                    data: rowData,
                });
            }
        }
        return data
    }


    const buildLeftChartOption = () => {
        const leftChartOption = {
            grid: { top: 15, bottom: 0, left: 0, right: 0, containLabel: true },
            xAxis: {
                type: 'value',
                show: false
            },
            animation: false,
            yAxis: {
                inverse: true,
                type: 'category',
                data: getFilteredGene()?.map((item) => `${((item.total_count / getFilteredClinic()?.length) * 100).toFixed(2)}%`),
                axisLabel: {
                    color: "#000",
                    interval: 0,
                    align: "right",
                    fontSize: 8,
                    padding: [0, 0, 0, -20],
                    width: 40, // 固定宽度
                    overflow: 'truncate', // 超出部分截断
                    ellipsis: '...', // 使用省略号
                },
                axisLine: { show: false },  // 隐藏轴线
                axisTick: { show: false },   // 隐藏刻度
                splitLine: {
                    show: false,
                },
            },
            tooltip: {
                show: true,
                trigger: "axis",
                formatter: function (params) {
                    let result = `<div style="font-weight:bold">${params[0].axisValue}</div>`;
                    params.forEach(item => {
                        result += `
          <div><span style="display: inline-block; background-color:${item.color};width: 10px;height: 10px"></span><span>
           ${item.data.categoryValue}: ${t(`mutation:type.${item.data.category}`)}
          </span></div>
        `;
                    });
                    return result;
                }

            },

            series: generateMutationScatter()
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
            animation: false,
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
                splitNumber: 2,
                axisLine: { show: true },
                axisTick: { show: true },
            },
            yAxis: {
                inverse: true,
                type: 'category',
                data: getFilteredGene()?.map((item) => item.gene),
                axisLabel: {
                    color: "#000",
                    interval: 0,
                    align: "left",
                    fontSize: 8,
                    padding: [0, 0, 0, -32],
                    width: 30, // 固定宽度
                    overflow: 'truncate', // 超出部分截断
                    ellipsis: '...', // 使用省略号
                },

                axisLine: { show: false },  // 隐藏轴线
                axisTick: { show: false },   // 隐藏刻度
                splitLine: {
                    show: false,
                },
            },
            series: getRightSeries()
        };
        return rightChartOption
    }

    return (
        <Row style={{ width: "100%" }}>
            <Row style={{ width: "100%" }}>
                <Col xs={24} md={24}>
                <ReactECharts style={{ height: "60px", width: "100%" }} ref={topChartRef}
                            option={topChartOption}></ReactECharts>

                </Col>
            </Row>

            <Row style={{ width: '100%' }}>
                <Col xs={20} md={20}>
                    {
                        !Object.keys(leftChartOption).length ? <Skeleton.Image  active={true} style={{ width: "800px", height: "600px" }}>
                           
                        </Skeleton.Image > : <ReactECharts option={leftChartOption} ref={leftChartRef}

                            style={{ width: '100%', height: "510px" }}>

                        </ReactECharts>
                    }

                </Col>
                <Col xs={4} md={4}>
                <ReactECharts option={rightChartOption} ref={rightChartRef}
                            style={{ width: '100%', height: "500px" }}>
                        </ReactECharts>

                </Col>
            </Row>
            <Row style={{ width: '100%' }}>
                <Col xs={24} md={24}>
                <ReactECharts option={bottomChartOption} ref={bottomChartRef}
                            lazyUpdate={true}
                            style={{ height: "60px", width: '100%' }}>
                        </ReactECharts>

                </Col>
            </Row>
            <Row style={{ width: '100%' }} algin={"center"} justify={"center"}>
                <Col sm={8} md={8}>
                    <Paragraph style={{ textAlign: "center", margin: 0 }}>Alterations</Paragraph>
                    <Row>
                        <Col sm={11} md={11}>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: "rgb(237, 102, 93)" }}></span>{t("mutation:type.frameShiftIndel")}
                            </Paragraph>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: "rgb(114, 158, 206)" }}></span>{t("mutation:type.missense")}
                            </Paragraph>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: "rgb(168, 120, 110)" }}></span>{t("mutation:type.inFrameIndel")}
                            </Paragraph>
                        </Col>
                        <Col sm={13} md={13}>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: "rgb(255, 158, 74)" }}></span>{t("mutation:type.stopCodon")}
                            </Paragraph>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: "rgb(103, 191, 92)" }}></span>{t("mutation:type.spliceSite")}
                            </Paragraph>
                            <Paragraph className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: "rgb(173, 139, 201)" }}></span>{t("mutation:type.transtationStartSite")}
                            </Paragraph>
                        </Col>
                    </Row>
                </Col>
                <Col sm={2} md={2}>
                    <Paragraph style={{ margin: 0 }}>HBV</Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: 'rgb(255,255,224)' }}></span>HBV-
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: 'rgb(110,123,139)' }}></span>HBV+
                    </Paragraph>
                </Col>
                <Col sm={2} md={2}>
                    <Paragraph style={{ margin: 0 }}>HCV</Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: 'rgb(255,255,224)' }}></span>HCV-
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: 'rgb(110,123,139)' }}></span>HCV+
                    </Paragraph>
                </Col>
                <Col sm={3} md={3}>
                    <Paragraph style={{ margin: 0 }}>Race</Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: 'rgb(255,247,243)' }}></span>ASIAN
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: 'rgb(247,104,161)' }}></span>CAUCASIAN
                    </Paragraph>
                    {/* <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: '#B5D3E7' }}></span>CAMBODIA
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: '#F8C3CD' }}></span>CHINESE
                    </Paragraph>

                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: '#A2C4C9' }}></span>FILIPINO
                    </Paragraph>

                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: '#D2B4DE' }}></span>INDIAN
                    </Paragraph>

                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: '#F9CB9C' }}></span>INDONESIAN
                    </Paragraph>

                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: '#A4C2A5' }}></span>MALAY
                    </Paragraph>

                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: '#FAC898' }}></span>SIKH
                    </Paragraph>

                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: '#C9DAF8' }}></span>THAI
                    </Paragraph>
                    <Paragraph className={styles.legendName}>
                        <span className={styles.colorBlock}
                            style={{ backgroundColor: '#D5A6BD' }}></span>VIETNAMESE
                    </Paragraph> */}

                </Col>
                <Col sm={2} md={2}>
                    <Paragraph style={{ margin: 0 }}>Gender</Paragraph>
                    <Paragraph className={styles.legendName}><span className={styles.colorBlock}
                        style={{ backgroundColor: 'rgb(255,228,225)' }}></span>Female
                    </Paragraph>
                    <Paragraph className={styles.legendName}><span className={styles.colorBlock}
                        style={{ backgroundColor: 'rgb(108,166,205)' }}></span>Male
                    </Paragraph>
                </Col>
            </Row>
        </Row>


    );
}
export default DriverLandscape;
