"use client";
import React, { useState, useEffect, useRef } from 'react';
import { getPatientList } from "@/configs/request";
import ReactECharts from 'echarts-for-react';
import Image from 'next/image';
import { Flex, Typography } from 'antd';
import { useTranslation } from "react-i18next";
import EmptyLoading from "@/components/emptyLoading";

const colorStops = {
    start: { r: 44, g: 114, b: 185 },   // 蓝色
    middle: { r: 250, g: 200, b: 88 },  // 橙色
    end: { r: 234, g: 36, b: 42 }       // 红色
};
const RainbowChart = () => {
    const [rainbowOption, setRainbowOption] = useState();
    const [columnOption, setColumnOption] = useState();
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0.1);
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const [activeBar, setActiveBar] = useState(null);
    const [patientList, setPatientList] = useState([]);
    const [barCategories, setBarCategories] = useState(['0~0.1', '0.1~0.2', '0.2~0.3', '0.3~0.4', '0.4~0.5', '0.5~0.6', '0.6~0.7', '0.7~0.8', '0.8~0.9', '0.9~1.0'])
    const patientListRef = useRef(null);
    function generateGradientColors(start, middle, end, steps) {
        const colors = [];
        const halfSteps = Math.floor(steps / 2);

        // 第一阶段：start -> middle
        for (let i = 0; i <= halfSteps; i++) {
            const ratio = i / halfSteps;
            const r = Math.round(start.r + (middle.r - start.r) * ratio);
            const g = Math.round(start.g + (middle.g - start.g) * ratio);
            const b = Math.round(start.b + (middle.b - start.b) * ratio);
            colors.push(`rgb(${r},${g},${b})`);
        }

        // 第二阶段：middle -> end
        for (let i = 1; i <= steps - halfSteps; i++) {
            const ratio = i / (steps - halfSteps);
            const r = Math.round(middle.r + (end.r - middle.r) * ratio);
            const g = Math.round(middle.g + (end.g - middle.g) * ratio);
            const b = Math.round(middle.b + (end.b - middle.b) * ratio);
            colors.push(`rgb(${r},${g},${b})`);
        }

        return colors;
    }

    const buildPieChart = (_patientList) => {
        const _rainbowOption = {
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
            },
            // graphic: [
            //     {
            //         type: 'group',
            //         left: 'center',
            //         bottom: 'middle',
            //         z: 100,
            //         children: [...barData.map((value, index) => {
            //             // 关键修改1：使最大值的柱状图高度等于环形图内部可用高度
            //             const maxDataValue = Math.max(...barData);
            //             const scaleFactor = 210 / maxDataValue; // 增加到200使柱状图更高
            //             const scaledHeight = value * scaleFactor;

            //             // 关键修改2：调整基准高度和位置
            //             const baseHeight = 210; // 增加到200
            //             const yPos = baseHeight - scaledHeight;

            //             return {
            //                 type: 'rect',
            //                 shape: {
            //                     x: (index * 35) - 70,
            //                     y: yPos,
            //                     width: 35, // 增加柱状图宽度
            //                     height: scaledHeight
            //                 },
            //                 style: {
            //                     fill: generateGradientColors(
            //                         colorStops.start,
            //                         colorStops.middle,
            //                         colorStops.end,
            //                         barData.length
            //                     )[index]
            //                 },
            //             };
            //         }), ...barCategories.map((label, index) => ({
            //             type: 'text',
            //             left: (index * 35) - 70,
            //             top: 210,
            //             style: {
            //                 text: label,
            //                 fill: '#666',
            //                 fontSize: 14, // 增大字体
            //                 textAlign: 'center'
            //             }
            //         }))]
            //     }
            // ],
            series: [
                {
                    name: '',
                    type: 'pie',
                    radius: ['60%', '100%'], // 外径已设为100%
                    startAngle: 180,
                    endAngle: 0,
                    data: getPieSeriesData(_patientList),
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

        setRainbowOption(_rainbowOption);
    }

    const getBarData = () => {
        return barCategories.map((item) => {
            const [minValue, maxValue] = item.split("~");
            const filteredPatients = patientListRef.current.filter((patient) => patient.value > minValue && patient.value <= maxValue);
            return filteredPatients.length
        });
    }

    const getPieSeriesData = (_patientList) => {
        return generateGradientColors(
            colorStops.start,
            colorStops.middle,
            colorStops.end,
            _patientList?.length
        ).map((color, index) => ({
            value: _patientList[index]?.value,
            name: _patientList[index]?.patientId,
            itemStyle: { color },
        }))
    }

    const getBarSeriesData = () => {
        const barData = getBarData();
        return generateGradientColors(
            colorStops.start,
            colorStops.middle,
            colorStops.end,
            barData.length
        ).map((color, index) => ({
            value: barData[index],
            itemStyle: { color, borderRadius: [5, 5, 0, 0], borderWidth: barCategories[index] === activeBar ? 3 : 0, borderColor: "#000" },
        }))
    }

    const buildBarChart = () => {
        const _columnOption = {
            grid: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                containLabel: false
            },
            tooltip: {
                trigger: 'item',
            },
            xAxis: {
                show: true,
                type: 'category',
                data: barCategories,
                axisTick: { show: false },

            },
            yAxis: {
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
    useEffect(() => {
        setLoading(true)
        const fetchData = async () => {
            const _patientList = await getPatientList();
            patientListRef.current = _patientList;
            setPatientList(_patientList);
            buildPieChart(_patientList);
            buildBarChart();
        }
        fetchData();
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!activeBar) return;
        const barEchartsInstance = barChartRef.current?.getEchartsInstance();
        const barData = getBarData();
        barEchartsInstance?.setOption({
            series: [{
                animation: false,
                data: generateGradientColors(
                    colorStops.start,
                    colorStops.middle,
                    colorStops.end,
                    barData.length
                ).map((color, index) => ({
                    value: barData[index],
                    itemStyle: { color, borderRadius: [5, 5, 0, 0], borderWidth: barCategories[index] === activeBar ? 3 : 0, borderColor: "#000" },
                })),
                type: 'bar',
                barWidth: '100%',  // 柱子宽度设为100%
                barGap: '0%',
            }]
        });

        const pieEchartsInstance = pieChartRef.current?.getEchartsInstance();

        pieEchartsInstance?.setOption({
            series: [{
                data: generateGradientColors(
                    colorStops.start,
                    colorStops.middle,
                    colorStops.end,
                    patientList?.length
                ).map((color, index) => ({
                    value: patientList[index]?.value,
                    name: patientList[index]?.patientId,
                    itemStyle: { color },
                })),
            }]
        });


    }, [activeBar])

    const onBarEvents = {
        "click": function (params) {
            const [minValue, maxValue] = params.name?.split("~");
            if (activeBar !== params.name) {
                const filteredPatients = patientListRef.current.filter((patient) => patient.value > minValue && patient.value <= maxValue);
                setActiveBar(params.name);
                setPatientList(filteredPatients);
            } else {
                setActiveBar(null);
                setPatientList(patientListRef.current);
            }

        }
    }

    return (
        <EmptyLoading loading={loading} showEmpty={true} hasData={!!rainbowOption}>

            <div style={{ marginTop: "250px" }}>
                <ReactECharts ref={pieChartRef} option={rainbowOption} opts={{ renderer: 'svg' }}
                    lazyUpdate={true}
                    style={{ height: "680px", width: '680px', margin: "0 auto", position: "relative" }}>
                </ReactECharts>
                <ReactECharts ref={barChartRef} option={columnOption} opts={{ renderer: 'svg' }}
                    lazyUpdate={true} onEvents={onBarEvents}
                    style={{ height: "180px", width: '300px', position: "absolute", left: "50%", marginLeft: "-150px", bottom: "340px" }}>
                </ReactECharts>
                <Flex style={{ width: "1000px", margin: "0 auto", position: "absolute", top: "-200px", left: "50%", marginLeft: "-500px" }}>
                    <Flex vertical align="center" style={{ width: "180px", height: "180px", transform: "translate(-40px, 360px) rotate(-75deg)" }}>
                        <Typography.Paragraph style={{ margin: 0, textAlign: "center" }}>
                            ITH_100
                        </Typography.Paragraph>
                        <Image src="/images/Phylogenetic_tree_02.png" width="180" height="180" alt='tree'></Image>
                    </Flex>
                    <Flex style={{ fontSize: "36px", transform: "translate(-70px, 260px) rotate(-55deg)" }}>
                        ...
                    </Flex>
                    <Flex vertical align="center" style={{ width: "180px", height: "180px", transform: "translate(-110px, 100px) rotate(-35deg)" }}>
                        <Typography.Paragraph style={{ margin: 0, textAlign: "center" }}>
                            ITH_100
                        </Typography.Paragraph>
                        <Image src="/images/Phylogenetic_tree_02.png" width="180" height="180" alt='tree'></Image>
                    </Flex>
                    <Flex style={{ fontSize: "36px", transform: "translate(-40px, 70px) rotate(-20deg)" }}>
                        ...
                    </Flex>
                    <Flex vertical align="center" style={{ width: "180px", height: "180px", transform: "translate(0, -15px) rotate(0deg)" }}>
                        <Typography.Paragraph style={{ margin: 0, textAlign: "center" }}>
                            ITH_100
                        </Typography.Paragraph>
                        <Image src="/images/Phylogenetic_tree_02.png" width="180" height="180" alt='tree'></Image>
                    </Flex>
                    <Flex style={{ fontSize: "36px", transform: "translate(40px, 70px) rotate(20deg)" }}>
                        ...
                    </Flex>
                    <Flex vertical align="center" style={{ width: "180px", height: "180px", transform: "translate(110px, 100px) rotate(35deg)" }}>
                        <Typography.Paragraph style={{ margin: 0, textAlign: "center" }}>
                            ITH_100
                        </Typography.Paragraph>
                        <Image src="/images/Phylogenetic_tree_02.png" width="180" height="180" alt='tree'></Image>
                    </Flex>
                    <Flex style={{ fontSize: "36px", transform: "translate(70px, 260px) rotate(55deg)" }}>
                        ...
                    </Flex>
                    <Flex vertical align="center" style={{ width: "180px", height: "180px", transform: "translate(40px, 360px) rotate(75deg)" }}>
                        <Typography.Paragraph style={{ margin: 0, textAlign: "center" }}>
                            ITH_100
                        </Typography.Paragraph>
                        <Image src="/images/Phylogenetic_tree_02.png" width="180" height="180" alt='tree'></Image>
                    </Flex>
                </Flex>
            </div>

        </EmptyLoading>
    );
}
export default RainbowChart;
