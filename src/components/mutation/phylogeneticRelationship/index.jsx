"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getITHList, getPatientList } from "@/configs/request";
import ReactECharts from 'echarts-for-react';
import { Modal } from 'antd';
import Image from 'next/image';
import { Flex, Typography, Button } from 'antd';
import styles from "./style.module.scss";
import TreeChart from "@/components/mutation/phylogeneticRelationship/TreeChart"
import TreeList from '@/components/mutation/phylogeneticRelationship/TreeList';
import EmptyLoading from "@/components/emptyLoading";

const VISIBLE_TREE_LENGTH = 6;
const TREE_WIDTH = 120;
const TREE_CONTAINER_WIDTH = VISIBLE_TREE_LENGTH * TREE_WIDTH;
const PIE_CHART_WIDTH = 600;
const BAR_CHART_WIDTH = PIE_CHART_WIDTH / 2;
const BAR_CHART_HEIGHT = PIE_CHART_WIDTH * 0.3;
const BAR_AXIS = ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'];
const BAR_CATEGORIES = ['0~0.1', '0.1~0.2', '0.2~0.3', '0.3~0.4', '0.4~0.5', '0.5~0.6', '0.6~0.7', '0.7~0.8', '0.8~0.9', '0.9~1.0'];

const baseColors = [
    { r: 94, g: 79, b: 162 },    // #5E4FA2
    { r: 170, g: 55, b: 236 },    // #AA37EC
    { r: 132, g: 116, b: 197 },   // #8474C5
    { r: 47, g: 155, b: 200 },   // #2F9BC8
    { r: 102, g: 194, b: 165 },  // #66C2A5
    { r: 171, g: 221, b: 164 },  // #ABDDA4
    { r: 252, g: 212, b: 103 },  // #FCD467
    { r: 253, g: 174, b: 97 },   // #FDAE61
    { r: 244, g: 109, b: 67 },   // #F46D43
    { r: 158, g: 1, b: 66 }      // #9E0142
];

const LEGEND = [{
    name: "<=0.1",
    color: "#5E4FA2"
}, {
    name: "0.1-0.2",
    color: "#AA37EC"
}, {
    name: "0.2-0.3",
    color: "#8474C5"
}, {
    name: "0.3-0.4",
    color: "#2F9BC8"
}, {
    name: "0.4-0.5",
    color: "#ABDDA4"
}, {
    name: "0.5-0.6",
    color: "#FCD467"
}, {
    name: "0.6-0.7",
    color: "#FDAE61"
}, {
    name: "0.7-0.8",
    color: "#FDAE61"
}, {
    name: "0.8-0.9",
    color: "#F46D43"
}, {
    name: ">0.9",
    color: "#9E0142"
}]
const PhylogeneticRelationship = ({ range = [0, 1], treeType = "overview" }) => {
    const [pieChartOption, setPieChartOption] = useState();
    const [columnOption, setColumnOption] = useState();
    const [loading, setLoading] = useState(true);
    const [rangeList, setRangeList] = useState([]);
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const [activeBar, setActiveBar] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const patientListRef = useRef(null);
    const currentPatientRef = useRef(null);
    const rangePatientListRef = useRef(null);

    useEffect(() => {
        setLoading(true)
        const fetchData = async () => {
            let [ITHList, patientList] = await Promise.all([getITHList(), getPatientList()]);
            if (!ITHList || !patientList) return;
            let _patientList = ITHList?.map((item) => {
                const currentPatient = patientList.find((patient) => patient.patientId == item.publicationId);
                return {
                    ...currentPatient,
                    currentValue: item.ith?.toFixed(2)
                }
            })
            _patientList = _patientList?.sort((a, b) => a.currentValue - b.currentValue);
            patientListRef.current = _patientList;
            patientListRef.current = buildAllPatientsData();
            rangePatientListRef.current = getPatientListByRange();
            setRangeList(rangePatientListRef.current);
            buildPieChart();
            buildBarChart();
        }
        fetchData();
        setLoading(false);
    }, []);

    const getPatientListByRange = () => {
        return patientListRef.current?.filter((item) => {
            return item.ITH >= range[0] && item.ITH <= range[1];
        })
    }

    const getPatientListByActiveBar = () => {
        const [min, max] = activeBar.split("~");
        return rangePatientListRef.current.filter((item) => {
            return item.ITH > min && item.ITH <= max
        })
    }


    useEffect(() => {
        if (!range?.length) return;
        rangePatientListRef.current = getPatientListByRange();
        const barEchartsInstance = barChartRef.current?.getEchartsInstance();
        barEchartsInstance?.setOption({
            series: [{
                data: getBarSeriesData(),
            }]
        });
        if (activeBar && activeBar !== "all") {
            rangePatientListRef.current = getPatientListByActiveBar()
        }
        barEchartsInstance?.setOption({
            title: {
                text: `Total: ${rangePatientListRef.current?.length ?? 0}`,
            }
        });
        const pieEchartsInstance = pieChartRef.current?.getEchartsInstance();
        pieEchartsInstance?.setOption({
            series: [{
                data: buildPieSeriesData()
            }]
        });
        setRangeList(rangePatientListRef.current);
    }, [range, activeBar])

    function generateGradientColors(totalSteps) {
        const colors = [];
        const segments = baseColors.length - 1;
        const stepsPerSegment = Math.floor(totalSteps / segments);

        for (let i = 0; i < segments; i++) {
            const start = baseColors[i];
            const end = baseColors[i + 1];

            // 当前分段的步数（最后一个分段补齐剩余步数）
            const steps = (i === segments - 1)
                ? totalSteps - (stepsPerSegment * (segments - 1))
                : stepsPerSegment;

            for (let j = 0; j < steps; j++) {
                const ratio = j / steps;
                const r = Math.round(start.r + (end.r - start.r) * ratio);
                const g = Math.round(start.g + (end.g - start.g) * ratio);
                const b = Math.round(start.b + (end.b - start.b) * ratio);
                colors.push(`rgb(${r},${g},${b})`);
            }
        }
        return colors;
    }

    const buildPieChart = () => {
        const _pieChartOption = {
            grid: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                containLabel: false
            },
            responsive: true,
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    const color = params.color;
                    return `
                    <div style="padding:5px">
                        <span style="display:inline-block;
                                    width:12px;
                                    height:12px;
                                    background:${color};
                                    margin-right:8px;
                                    border-radius:2px">
                        </span><span >${params.name}</span> <span style="font-weight:bold">${params?.data?.ITH}<span>
                    </div>
                `;
                }
            },
            series: [
                {
                    emphasis: {
                        scale: 0,
                    },
                    name: '',
                    type: 'pie',
                    radius: ['60%', '100%'], // 外径已设为100%
                    startAngle: 180,
                    endAngle: 0,
                    data: buildPieSeriesData(),
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false
                    },
                    itemStyle: {
                        borderRadius: 8, // 增大圆角
                        borderColor: '#fff',
                        borderWidth: 0
                    }
                }
            ],
        };

        setPieChartOption(_pieChartOption);
    }

    const getBarData = () => {
        return BAR_CATEGORIES.map((item) => {
            const [minValue, maxValue] = item.split("~");
            const filteredPatients = getAreaPatientData(minValue, maxValue)
            return filteredPatients?.length ?? 0
        });
    }

    const getBarSeriesData = () => {
        const barData = getBarData();
        return generateGradientColors(barData.length
        ).map((color, index) => ({
            name: BAR_CATEGORIES[index],
            value: barData[index],
            itemStyle: { color, borderRadius: [5, 5, 0, 0], borderWidth: BAR_CATEGORIES[index] === activeBar ? 3 : 0, borderColor: "rgb(29, 86, 126)" },
        }))
    }

    const buildBarChart = () => {
        const _columnOption = {
            grid: {
                top: 20,
                right: 0,
                bottom: 0,
                left: 0,
                containLabel: true
            },
            title: {
                text: `Total: ${rangePatientListRef.current?.length ?? 0}`,
                left: 'center',
                top: "0",
                textStyle: {
                    fontSize: "14px",
                    color: "#000"
                }
            },
            responsive: true,
            tooltip: {
                trigger: 'item',
            },
            xAxis: {
                show: true,
                type: 'category',
                data: BAR_AXIS,
                axisLabel: {
                    interval: 0,
                    fontSize: 8,
                    color: "#666",
                    align: "right",
                    padding: [0, 8, 0, 0] // 左内边距10px
                },
                axisLine: {
                    lineStyle: {
                        color: '#CCCCCC' // 浅灰色轴线
                    }
                },
                axisTick: { show: false },
            },
            yAxis: {
                axisLabel: {
                    width: 0,
                    show: false,
                },
                show: false,
                type: 'value'
            },
            series: [
                {
                    data: getBarSeriesData(),
                    type: 'bar',
                    barWidth: '100%',  // 柱子宽度设为100%
                    barGap: '0%',
                }
            ]
        };

        setColumnOption(_columnOption);
    }

    function calculateFanLayout(numElements = 1) {
        const centerPosition = { rotate: 0, translate: "0px, -20px" };
        if (numElements === 1) {
            return [{ rotate: 0, translate: "300px, -20px" }];
        }
        else if (numElements === 2) {
            return [{ rotate: -30, translate: "100px, 80px" },
            { rotate: 30, translate: "-100px, 80px" },]
        } else if (numElements === 3) {
            return [{ rotate: -40, translate: "0px, 90px" }, centerPosition, { rotate: 40, translate: "0px, 90px" }]
        } else if (numElements === 4) {
            return [{ rotate: -55, translate: "-135px, 60px" },
            { rotate: -20, translate: "-30px, -20px" },
            { rotate: 20, translate: "30px, -20px" },
            { rotate: 55, translate: "135px, 60px" },]
        } else if (numElements === 5) {
            return [{ rotate: -55, translate: "-135px, 60px" },
            { rotate: -30, translate: "-30px, 0px" },
                centerPosition,
            { rotate: 30, translate: "30px, 0px" },
            { rotate: 55, translate: "135px, 60px" },]
        } else {
            return [
                { rotate: -80, translate: "-300px, -20px" },
                { rotate: -50, translate: "-160px, -10px" },
                { rotate: -15, translate: "-50px, -20px" },
                { rotate: 15, translate: "50px, -20px" },
                { rotate: 50, translate: "160px, -10px" },
                { rotate: 80, translate: "300px, -20px" }
            ]
        }
    }

    function getSamplesFromNewick(newick) {
        const regex = /([^(),:]+):\d+(\.\d+)?/g;
        const samples = [];
        let match;
        while ((match = regex.exec(newick)) !== null) {
            samples.push(match[1]);
        }
        return samples.length;
    }

    const getVisibleTreeList = () => {
        if (!rangePatientListRef.current?.length) return;
        const patientLength = rangePatientListRef.current.length;
        let result = [];

        if (patientLength >= VISIBLE_TREE_LENGTH) {
            const patientsWithSamples = rangePatientListRef.current.map(item => ({
                ...item,
                sampleLength: getSamplesFromNewick(item.newick)
            }));

            // 计算如何尽量均匀分成 6 份
            const baseChunkSize = Math.floor(patientLength / VISIBLE_TREE_LENGTH);
            const remainder = patientLength % VISIBLE_TREE_LENGTH;

            let start = 0;
            for (let i = 0; i < VISIBLE_TREE_LENGTH; i++) {
                // 前 `remainder` 个 chunk 多 1 个元素
                const end = start + baseChunkSize + (i < remainder ? 1 : 0);
                const chunk = patientsWithSamples.slice(start, end);
                start = end;

                // 取当前 chunk 中 sampleLength 最大的元素
                if (chunk.length > 0) {
                    const maxInChunk = chunk.reduce((max, current) =>
                        (current.sampleLength > max.sampleLength ? current : max), chunk[0]);
                    result.push(maxInChunk);
                }
                // 如果 chunk 为空（理论上不会发生，因为 patientLength >= 6）
                else {
                    // 可以取前一个 chunk 的最后一个元素，或者随机补一个
                    // 这里简单处理：取前一个元素（仅当 i > 0）
                    if (i > 0 && result.length > 0) {
                        result.push(result[result.length - 1]);
                    } else {
                        // 如果第一个 chunk 就为空（理论上不可能），取第一个元素
                        result.push(patientsWithSamples[0]);
                    }
                }
            }
        } else {
            result = rangePatientListRef.current;
        }

        return result.sort((a, b) => a.ITH - b.ITH);
    };

    const getVisibleTreeListWithStyle = useMemo(() => {
        const result = getVisibleTreeList();
        return result?.map((item, index) => {
            console.log(item)
            return {
                ...item,
                image: `/images/${item?.patientId}.svg`,
                transform: `rotate(${calculateFanLayout(result?.length)[index].rotate}deg) translate(${calculateFanLayout(result?.length)[index].translate})`
            }
        })
    }, [rangePatientListRef.current])

    const buildAllPatientsData = () => {
        const colors = generateGradientColors(100);
        return patientListRef.current?.map((item) => {
            return {
                ITH: item.currentValue,
                newick: item.newick,
                samples: item.samples,
                name: item.patientId,
                patientId: item.patientId,
                itemStyle: { color: colors[Math.round(item.currentValue * 100) - 1] },
            }
        })
    }

    const buildPieSeriesData = () => {
        return rangePatientListRef.current.map((item) => {
            return {
                ...item,
                value: 1,
            }
        })
    }

    const getAreaPatientData = (minValue, maxValue) => {
        return rangePatientListRef.current?.filter((patient) => patient.ITH > minValue && patient.ITH <= maxValue);
    }

    const onBarEvents = useMemo(() => ({
        "click": function (params) {
            const [rangeMin, rangeMax] = range;
            rangePatientListRef.current = rangePatientListRef.current = patientListRef.current.filter((item) => {
                return item.ITH > rangeMin && item.ITH <= rangeMax
            })
            if (activeBar !== params.name) {
                const [min, max] = params.name.split("~");
                rangePatientListRef.current = rangePatientListRef.current.filter((item) => {
                    return item.ITH > min && item.ITH <= max
                })
                setActiveBar(params.name);
            } else {
                setActiveBar("all");
            }
        },
    }), [activeBar]);

    const viewTree = (data) => {
        currentPatientRef.current = data;
        setModalOpen(true);
    }

    const onPieEvents = useMemo(() => ({
        "click": function (params) {
            viewTree(params.data)
        },
    }), []);

    const renderModalTitle = useMemo(() => {
        return <Flex align='center'><Image src={"/images/patient.svg"} width={30} height={30} alt='patient'></Image><Typography.Paragraph style={{ margin: 0, marginLeft: "10px", fontSize: "24px" }}>
            {currentPatientRef.current?.patientId}
        </Typography.Paragraph>
            <Flex align='center'>
                <span style={{ marginLeft: "30px" }}>ITH: </span> <span style={{ display: "inline-block", width: "16px", height: "16px", marginLeft: "10px", backgroundColor: currentPatientRef.current?.itemStyle?.color }}></span><span style={{ marginLeft: "5px" }}>{currentPatientRef.current?.ITH}</span>
            </Flex>
        </Flex>
    })

    return (
        <>
            <EmptyLoading loading={loading} showEmpty={true} hasData={!!pieChartOption}>

                <div style={{ position: "relative", marginTop: treeType == "overview" ? "150px" : "-70px", transform: `scale(${treeType == "overview" ? 1 : 0.7})`, transition: "all ease .3s" }}>
                    <ReactECharts ref={pieChartRef} option={pieChartOption} opts={{ renderer: 'svg' }}
                        lazyUpdate={true}
                        onEvents={onPieEvents}
                        style={{ height: PIE_CHART_WIDTH, width: PIE_CHART_WIDTH, margin: "0 auto" }}>
                    </ReactECharts>
                    <ReactECharts ref={barChartRef} option={columnOption} opts={{ renderer: 'svg' }}
                        lazyUpdate={true}
                        onEvents={onBarEvents}
                        style={{ height: BAR_CHART_HEIGHT, width: BAR_CHART_WIDTH, position: "absolute", left: "50%", marginLeft: -BAR_CHART_WIDTH / 2, bottom: "285px" }}>
                    </ReactECharts>
                    {
                        treeType == "overview" && <Flex style={{ width: TREE_CONTAINER_WIDTH, margin: "0 auto", justifyContent: "space-between", position: "absolute", top: "-120px", left: "50%", marginLeft: "-360px" }}>
                            {
                                getVisibleTreeListWithStyle?.map((item, index) => {
                                    return <Flex onClick={() => { viewTree(item) }} className={rangeList?.length > 6 && index != getVisibleTreeListWithStyle.length - 1 ? styles.ellipse : null} key={item.patientId} vertical align="center" style={{ width: "120px", height: "120px", transform: item.transform }}>
                                        <Typography.Paragraph style={{ margin: 0, textAlign: "center" }}>
                                            {item.patientId}
                                        </Typography.Paragraph>
                                        {/* {
                              patientListRef.current && <iframe width={"180"} height={"180"} src={`/html/tree01.html?newick=${patientListRef.current?.[0]?.newick}`} frameborder="0"></iframe>
                            } */}
                                        <Image src={item.image} width="100" height="100" alt='tree'></Image>
                                    </Flex>
                                })
                            }

                        </Flex>
                    }

                    <Flex align='center' justify="center" style={{ position: "absolute", width: "100%", bottom: 240, margin: "0 auto" }}>
                        <Flex>
                            {
                                LEGEND.map((item) => {
                                    return <Flex key={item.name} align='center'>
                                        <span style={{ marginLeft: 8, backgroundColor: item.color, borderRadius: 3, width: 12, height: 12, display: "inline-block" }}></span><span style={{ marginLeft: 3, color: "#666" }}>{item.name}</span>
                                    </Flex>
                                })
                            }
                        </Flex>
                    </Flex>
                </div>
                {
                    treeType === "detail" && <TreeList list={rangeList} treeType={treeType} viewTree={viewTree}></TreeList>
                }
            </EmptyLoading>
            {
                <TreeChart treeData={currentPatientRef.current} modalOpen={modalOpen} onclose={() => { setModalOpen(false) }} />
            }</>
    );
}
export default PhylogeneticRelationship;
