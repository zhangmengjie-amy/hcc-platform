"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getExpressionSubtypeList } from "@/configs/request";
import { Flex } from 'antd';
import { getITHList, getPatientList } from "@/configs/request";
import { getFullPhylogenetic } from "@/configs/request";
import HorizontalTree from "@/components/horizontal-tree/index";
import EChartsReact from "echarts-for-react";

const SUBTYPE_COLOR = {
    "C1": "rgb(79, 151, 121)",
    "C2": "rgb(72, 128, 187)",
    "C3": "rgb(150, 91, 164)",
    "C4": "rgb(167, 134, 56)",
    "C5": "rgb(238, 188, 57)",
    "C6": "rgb(218, 85, 76)",
}

const HEATMAP_COLORS = {
    "Lee_2004": {
        "SURVIVAL_UP": "rgb(94, 171, 214)",
        "SURVIVAL_DN": "rgb(255, 180, 180)"
    },
    "Hoshida_2009": {
        "S1": "rgb(250, 227, 198)",
        "S2": "rgb(250, 164, 189)",
        "S3": "rgb(245, 100, 169)"
    },
    "Boyault_2007": {
        "G3": "rgb(61, 194, 236)",
        "G12": "rgb(100, 226, 183)",
        "G56": "rgb(252, 199, 55)"
    },
    "Chiang_2008": {
        "INTERFERON": "rgb(251, 243, 193)",
        "UNANNOTATED": "rgb(220, 139, 224)",
        "POLYSOMY7": "rgb(213, 11, 139)",
        "PROLIFERATION": "rgb(207, 255, 226)",
        "CTNNB1": "rgb(244, 99, 30)"
    },
    "Subtype": {
        "C1": "rgb(79, 151, 121)",
        "C2": "rgb(72, 128, 187)",
        "C3": "rgb(150, 91, 164)",
        "C4": "rgb(167, 134, 56)",
        "C5": "rgb(238, 188, 57)",
        "C6": "rgb(218, 85, 76)",
    }
}

const mockFields = ['Lee_2004', 'Hoshida_2009', 'Boyault_2007', 'Chiang_2008', 'Subtype'];


const MIXED_GROUP = ["C1,C2", "C1,C3", "C1,C4", "C1,C5", "C1,C6", "C2,C3", "C2,C4", "C2,C5", "C2,C6", "C3,C4", "C3,C5", "C3,C6", "C4,C5", "C4,C6", "C5,C6",
    "C1,C2,C3", "C1,C2,C4", "C1,C2,C5", "C1,C2,C6", "C1,C3,C4", "C1,C3,C5", "C1,C3,C6", "C1,C4,C5", "C1,C4,C6", "C1,C5,C6", "C2,C3,C4", "C2,C3,C5", "C2,C3,C6", "C2,C4,C6", "C3,C4,C5", "C3,C4,C6", "C2,C4,C5", "C2,C5,C6", "C3,C5,C6", "C4,C5,C6",
    "C1,C2,C3,C4", "C1,C2,C3,C5", "C1,C2,C3,C6", "C1,C2,C4,C5", "C1,C2,C4,C6", "C1,C2,C5,C6", "C1,C3,C4,C5", "C1,C3,C4,C6", "C2,C3,C4,C5", "C1,C3,C5,C6", "C1,C4,C5,C6",
    "C2,C3,C4,C6", "C2,C3,C5,C6", "C2,C4,C5,C6", "C3,C4,C5,C6",
    "C1,C2,C3,C4,C5", "C1,C2,C3,C4,C6", "C2,C3,C4,C5,C6", "C1,C3,C4,C5,C6", "C1,C2,C3,C5,C6", "C1,C2,C4,C5,C6",
    "C1,C2,C3,C4,C5,C6"
]

const MIXED_PURE = {
    "Pure": "rgb(106, 194, 165)",
    "Mixed": "rgb(158, 153, 197)",
}

const MIXED_PURE_BG = {
    "Pure": "rgb(239, 249, 247)",
    "Mixed": "rgb(247, 240, 247)",
}

const STAGE_COLOR = {
    "I": "rgb(250, 213, 120)",
    "II": "rgb(245, 138, 66)",
    "III": "rgb(224, 36, 40)",
}

const defaultValue = 1;
const spaceValue = 0.5;
const Pathways = () => {
    const [option, setOption] = useState({});
    const [treeList, setTreeList] = useState(null);
    const [sampleMutations, setSampleMutations] = useState(null);
    const [currentPatientId, setCurrentPatientId] = useState(null);
    const [mockHeatmap, setMockHeatmap] = useState(null);
    const patientListRef = useRef(null);
    const subtypeList = useRef(null);
    useEffect(() => {
        let newick = null;
        let patientId = null;
        getExpressionSubtypeList().then((results) => {
            const _option = buildOption(results);
            subtypeList.current = [...results];
            patientId = subtypeList.current?.[0]?.publicationId;
            buildHeatMap(patientId);
            setOption(_option);
        });
        getPatientList().then((data) => {
            patientListRef.current = data;
            newick = patientListRef.current?.find((item) => item.patientId == patientId)?.newick;
            if (newick) {
                buildTreeData(newick, patientId);
            }
        })
    }, []);

    const buildTreeData = (newick, patientId) => {
        const treeWorker = new Worker('/workers/tree.js');
        getFullPhylogenetic().then((results) => {
            const geneData = results?.filter((item) => item?.sampleId?.includes(`${patientId}_`))
            treeWorker.postMessage({ newick: newick, geneData });
            treeWorker.onmessage = ({ data }) => {
                setTreeList(data.treeList);
                setSampleMutations(data.sampleMutations);
            };
        });
    }

    useEffect(() => {
        let newick = null;
        let patientId = currentPatientId;
        if (!currentPatientId) {
            patientId = subtypeList.current?.[0]?.publicationId;
        }
        newick = patientListRef.current?.find((item) => item.patientId == currentPatientId)?.newick;
        if (newick && patientId) {
            buildHeatMap(patientId);
            buildTreeData(newick, patientId);
        }
    }, [currentPatientId]);

    const buildHeatMap = (patientId) => {
        let samples = subtypeList.current?.find((subtypeItem) => subtypeItem.publicationId == patientId)?.samples ?? [];
        if (samples.length) {
            const _mockHeatmap = {};
            samples.forEach((sample) => {
                _mockHeatmap[sample.id] = {
                    "Boyault_2007": {
                        color: HEATMAP_COLORS["Boyault_2007"][sample.Boyault_2007],
                        value: sample.Boyault_2007
                    },
                    "Chiang_2008": {
                        color: HEATMAP_COLORS["Chiang_2008"][sample.Chiang_2008],
                        value: sample.Chiang_2008
                    },
                    "Hoshida_2009": {
                        color: HEATMAP_COLORS["Hoshida_2009"][sample.Hoshida_2009],
                        value: sample.Hoshida_2009
                    },
                    "Lee_2004": {
                        color: HEATMAP_COLORS["Lee_2004"][sample.Lee_2004],
                        value: sample.Lee_2004
                    },
                    "Subtype": {
                        color: HEATMAP_COLORS["Subtype"][sample.subtype],
                        value: sample.subtype
                    }

                }
            })

            setMockHeatmap(_mockHeatmap);
        }

    }

    const sortedPatientById = (patientList) => {
        return patientList.sort((a, b) => a.publicationId.split("_")[1] - b.publicationId.split("_")[1])
    }

    const sortPatients = (_patientList) => {
        let patientList = sortedPatientById(_patientList);
        let sortedPatientList = [];
        const purePatientList = [];
        const mixedPatientList = [];
        let patientWithGroupSubtype = patientList
            .filter((item) => new Set(item.samples.map((s) => s.subtype)).size > 1)
            .map((item) => ({
                ...item,
                samples: item.samples.sort((a, b) => a.subtype.localeCompare(b.subtype))
            }));


        MIXED_GROUP.forEach((group) => {
            const patient = patientWithGroupSubtype.filter((item) => {
                return Array.from(new Set(item.samples.map((sample) => sample.subtype))).join(",") == group
            }).sort((a, b) => a.stage.length - b.stage.length);
            mixedPatientList.push(...patient);
        })
        let patientWithSingleSubtype = patientList.filter((item) => new Set(item.samples.map((item) => item.subtype)).size == 1)
        Object.keys(SUBTYPE_COLOR).forEach((subtype) => {
            const patientWithSameSubtype = patientWithSingleSubtype.filter((item) => item.samples[0].subtype == subtype).sort((a, b) => a.stage.length - b.stage.length);
            purePatientList.push(...patientWithSameSubtype);
        })
        sortedPatientList = [...purePatientList, ...mixedPatientList];
        return sortedPatientList;
    }
    function getLevelCount(data) {
        let maxLevel = 0;

        function traverse(node, currentLevel) {
            if (currentLevel > maxLevel) {
                maxLevel = currentLevel;
            }
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => traverse(child, currentLevel + 1));
            }
        }

        data.forEach(root => traverse(root, 1));
        return maxLevel;
    }


    const buildOption = (patientList) => {

        const sortedPatient = sortPatients(patientList);
        let data = [];
        const maxSampleLength = Math.max(...sortedPatient.map(patient => patient.samples?.length))
        const buildChildren = (sampleLength, patient, PURE_MIXED) => {
            let children = [];
            if (sampleLength == 0) return [
                {
                    value: defaultValue,
                    name: "",
                    itemStyle: {
                        borderWidth: 0,
                        color: MIXED_PURE_BG[PURE_MIXED]
                    },
                    children: [{
                        name: patient.stage,
                        value: defaultValue,
                        custom: {
                            theme: "Stage",
                            patientId: patient.publicationId,
                            sampleLength: patient.samples.length,
                            PURE_MIXED: PURE_MIXED
                        },
                        itemStyle: {
                            color: STAGE_COLOR[patient.stage]
                        },
                        children: [{
                            value: defaultValue,
                            name: "",
                            itemStyle: {
                                borderWidth: 0,
                                color: MIXED_PURE_BG[PURE_MIXED]
                            },
                            children: [{
                                value: defaultValue,
                                custom: {
                                    theme: "RNA Mixed or Pure",
                                    patientId: patient.publicationId,
                                    sampleId: patient.sampleId,
                                    sampleLength: patient.samples.length,
                                    stage: patient.stage
                                },
                                name: PURE_MIXED,
                                itemStyle: {
                                    borderWidth: 0,
                                    color: MIXED_PURE[PURE_MIXED]
                                },
                            }]
                        }]
                    }]
                }
            ];
            const subtype = patient.samples[sampleLength - 1]?.subtype;
            const sampleId = patient.samples[sampleLength - 1]?.id;
            const color = SUBTYPE_COLOR[subtype];
            children.push({
                name: subtype ?? "",
                value: defaultValue,
                custom: {
                    theme: "Subtype",
                    patientId: patient.publicationId,
                    sampleId,
                    stage: patient.stage,
                    PURE_MIXED: PURE_MIXED
                },
                itemStyle: {
                    borderWidth: color ? 1 : 0,
                    color: color ?? MIXED_PURE_BG[PURE_MIXED]
                },
                children: buildChildren(sampleLength - 1, patient, PURE_MIXED)
            })
            return children
        }

        let pureChildren = [];
        let mixedChildren = [];
        let initialPureSubtype = null;
        let initialMixedSubtype = null;
        let pureTotalSpace = 0;
        let mixedTotalSpace = 0;
        sortedPatient.forEach((patient, index) => {
            const isPure = new Set(patient.samples.map((item) => item.subtype)).size == 1;

            const result = buildChildren(maxSampleLength, patient, isPure ? "Pure" : "Mixed");
            if (isPure) {
                if (!initialPureSubtype) {
                    pureChildren.push({
                        value: defaultValue,
                        name: "Pure",
                        custom: {
                            theme: "RNA Mixed or Pure",
                            PURE_MIXED: "Pure"
                        },
                        itemStyle: {
                            borderWidth: 0,
                            color: MIXED_PURE_BG["Pure"],
                        },
                        children: [],
                    });
                } else {
                    if (initialPureSubtype !== patient.samples[0].subtype) {
                        pureTotalSpace += 1;
                        pureChildren.push({
                            value: spaceValue,
                            name: "",
                            itemStyle: {
                                borderWidth: 0,
                                color: MIXED_PURE_BG["Pure"],
                            },
                            children: [],
                        });
                    }
                }

                initialPureSubtype = patient.samples[0].subtype;
                pureChildren.push(...result);
                if (new Set(sortedPatient[index + 1]?.samples.map((item) => item.subtype)).size > 1) {
                    pureChildren.push({
                        value: defaultValue,
                        name: "Pure",
                        custom: {
                            theme: "RNA Mixed or Pure",
                            PURE_MIXED: "Pure"
                        },
                        itemStyle: {
                            borderWidth: 0,
                            color: MIXED_PURE_BG["Pure"],
                        },
                        children: [],
                    });
                }

            } else {
                const currentMixedSubtype = Array.from(new Set(patient.samples.map((sample) => sample.subtype))).join(",");
                if (initialMixedSubtype && initialMixedSubtype !== currentMixedSubtype) {
                    mixedTotalSpace += 1;
                    mixedChildren.push({
                        value: spaceValue,
                        name: "",
                        itemStyle: {
                            borderWidth: 0,
                            color: MIXED_PURE_BG["Mixed"],
                        },
                        children: [],
                    });
                }
                initialMixedSubtype = currentMixedSubtype;
                mixedChildren.push(...result)
            }
        })
        const realPureLength = pureChildren.filter((item) => item.value == 1)?.length;
        const realMixedLength = mixedChildren.filter((item) => item.value == 1)?.length;
        const totalLength = realPureLength + realMixedLength;
        const realPurePercent = (realPureLength / totalLength * 100).toFixed(0);
        const realMixedPercent = (realMixedLength / totalLength * 100).toFixed(0);

        const totalPureLength = realPureLength + pureTotalSpace * spaceValue;
        const totalMixedLength = realMixedLength + mixedTotalSpace * spaceValue;
        data = [{
            name: "",
            value: totalPureLength,
            itemStyle: {
                borderWidth: 0,
                color: MIXED_PURE_BG["Pure"],
            },
            label: {
                formatter: () => {
                    return `Pure patients (${realPurePercent}%)`
                },
                rotate: 'tangential',
                verticalAlign: 'top',
                padding: [90, 0],
                fontSize: 16,
                color: '#000',
                hideOverlap: false
            },
            children: pureChildren,
        }, {
            name: "",
            value: totalMixedLength,
            itemStyle: {
                color: MIXED_PURE_BG["Mixed"]
            },
            label: {
                formatter: () => {
                    return `Mixed patients (${realMixedPercent}%)`
                },
                rotate: 'tangential',
                verticalAlign: 'bottom',
                padding: [80, 0],
                fontSize: 16,
                color: '#000',
                hideOverlap: false
            },
            children: mixedChildren,
        }]

        const levelCount = getLevelCount(data);
        const firstLevelRatio = 0.35;
        const remainingRatio = 1 - firstLevelRatio;

        // 创建层级配置
        const levels = [{}, {
            r0: '0%',
            r: 100 + '%',
            label: {
                show: true,
            },
            itemStyle: {
                borderWidth: 1.5,
                borderColor: "#ccc",
                color: MIXED_PURE_BG["MIXED"]
            },
        }];

        // 为剩余层级创建配置
        for (let i = 1; i < levelCount; i++) {
            const start = firstLevelRatio + (i - 1) * (remainingRatio / (levelCount - 1));
            const end = firstLevelRatio + i * (remainingRatio / (levelCount - 1));
            levels.push({
                r0: (start * 100) + '%',
                r: (end * 100) + '%',
                label: {
                    align: 'right',
                    rotate: 'radial',
                    show: false
                }
            });
        }

        const startAngle = 180 + ((totalPureLength) / (totalPureLength + totalMixedLength) * 360 - (totalMixedLength) / (totalPureLength + totalMixedLength) * 360) / 4;
        return {
            grid: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            },
            hoverLayerThreshold: 0,  // 禁用全局hover层
            tooltip: {
                formatter: (event) => {
                    if (!event?.data?.name) return null;
                    return `<div>
                    ${event?.data?.custom?.patientId ? `<div style="color: #000"><span>Patient ID: </span><span style="color: #666">${event?.data?.custom?.patientId}</span></div>` : ""}
                    ${event?.data?.custom?.sampleLength ? `<div style="color: #000"><span>Sample Counts: </span><span style="color: #666">${event?.data?.custom?.sampleLength}</span></div>` : ""} 
                    ${event?.data?.custom?.sampleId ? `<div style="color: #000"><span>Sample ID: </span><span style="color: #666">${event?.data?.custom?.sampleId}</span></div>` : ""} 
                    <div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${event.color}"></span>${event?.data?.custom?.theme}: <span style="color: #666">${event?.data?.name}</span></div>
                    ${event?.data?.custom?.stage ? `<div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${STAGE_COLOR[event?.data?.custom?.stage]}"></span><span>Stage: </span><span style="color: #666">${event?.data?.custom?.stage}</span></div>` : ""}
                    ${event?.data?.custom?.PURE_MIXED ? `<div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${MIXED_PURE[event?.data?.custom?.PURE_MIXED]}"></span><span>RNA Mixed or Pure: </span><span style="color: #666">${event?.data?.custom?.PURE_MIXED}</span></div>` : ""} 
                    </div>`
                }
            },
            animationEasing: 'elasticOut',

            series: {
                nodeClick: false,
                startAngle: startAngle,
                type: 'sunburst',
                sort: undefined,

                data: data,
                levels: levels,
                emphasis: {
                    disabled: true
                },
            }
        };
    }

    const handleClick = useCallback((params) => {
        if (!params.data?.custom?.patientId) return;
        setCurrentPatientId(params.data?.custom?.patientId)
    }, []);

    const config = {
    container: {
      width: 30,  // 容器宽度30cm
      height: 30  // 容器高度20cm
    },
    bigCircle: {
      diameter: 30, // 大圆直径15cm
      center: [15, 10], // 圆心坐标 [x, y]（单位cm）
      borderWidth: 0.2 // 边框宽度0.2cm
    },
    smallCircles: [
      { center: [10, 8], diameter: 3, name: 'A' },
      { center: [15, 6], diameter: 4, name: 'B' },
      { center: [20, 8], diameter: 2.5, name: 'C' },
      { center: [15, 12], diameter: 5, name: 'D' }
    ]
  };

  // 将物理尺寸转换为图表坐标（厘米 -> 百分比）
  const convertToChartCoordinates = () => {
    // 大圆参数转换
    const bigCircle = {
      cx: (config.bigCircle.center[0] / config.container.width) * 100,
      cy: (config.bigCircle.center[1] / config.container.height) * 100,
      r: (config.bigCircle.diameter / 2 / config.container.width) * 100,
      borderWidth: (config.bigCircle.borderWidth / config.container.width) * 100
    };

    // 小圆参数转换
    const smallCircles = config.smallCircles.map(circle => ({
      x: (circle.center[0] / config.container.width) * 100,
      y: (circle.center[1] / config.container.height) * 100,
      r: (circle.diameter / 2 / config.container.width) * 100,
      name: circle.name
    }));

    return { bigCircle, smallCircles };
  };

  const { bigCircle, smallCircles } = convertToChartCoordinates();

  const circleOption = {
    grid: {
        containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'X轴',
      min:0,
      max: 100
    },
    yAxis: {
      type: 'value',
      name: 'Y轴',
            min:0,
            max: 100
    },
    series: [{
      type: 'scatter',
      symbolSize: function (data, event) {
        // 用第三个值控制气泡大小（需按比例缩放）

        if (event.dataIndex == 0) {
             return Math.sqrt(data[2]) * 40;
        } else {
            return Math.sqrt(data[2]) * 10;
        }
       
      },
      data: [
        [50, 50, 100],
        [50, 20, 10],  // [x, y, sizeValue]
        [50, 30, 10],
        [50, 40, 10],
        [50, 60, 10]
      ],
      itemStyle: {
        color: function(params) {
          // 可添加颜色映射
          const colors = ['#8ab7e9','#d48265','#d48265','#d48265'];
          return colors[params.dataIndex % colors.length];
        },
      },
      emphasis: {
        itemStyle: false,
        scale: false  // 悬停时放大
      }
    }]
  };

   const leftData = [
    [10, 20],
    [15, 30],
    [20, 40],
    [25, 50],
    [30, 60],
  ];

  // 右侧对称数据（x 坐标取反）
  const rightData = leftData.map(([x, y]) => [100 - x, y]);

  const scatter = {
    // 用 grid 分割画布
    grid: [
      { left: '0%', right: '50%', top: '10%', bottom: '10%' }, // 左侧区域
      { left: '50%', right: '0%', top: '10%', bottom: '10%' }, // 右侧区域
    ],
    xAxis: [
      // 左侧 X 轴
      {
        gridIndex: 0,
        type: 'value',
        min: 0,
        max: 50,
        axisLabel: { show: true },
      },
      // 右侧 X 轴（反向）
      {
        gridIndex: 1,
        type: 'value',
        min: 50,
        max: 100,
        inverse: true, // 反向坐标轴
        axisLabel: { show: true },
      },
    ],
    yAxis: [
      // 左侧 Y 轴
      {
        gridIndex: 0,
        type: 'value',
        min: 0,
        max: 100,
      },
      // 右侧 Y 轴（与左侧相同）
      {
        gridIndex: 1,
        type: 'value',
        min: 0,
        max: 100,
      },
    ],
    series: [
      // 左侧散点图
      {
        type: 'scatter',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: leftData,
        symbolSize: 10,
        itemStyle: { color: '#1890ff' },
      },
      // 右侧对称散点图
      {
        type: 'scatter',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: rightData,
        symbolSize: 10,
        itemStyle: { color: '#ff4d4f' },
      },
    ],
  };


const bubbleLeftData = [
    [20, 30, 15], // [x, y, size]
    [30, 50, 25],
    [40, 20, 10],
    [10, 70, 30],
  ];

  // 右侧对称数据：x = (对称轴 * 2) - x
  const symmetryAxisX = 50; // 对称轴 x=50
  const bubbleRightData = bubbleLeftData.map(([x, y, size]) => [symmetryAxisX * 2 - x, y, size]);

  const bubbleOption = {
    // 用 grid 分割左右区域
    grid: [
      { left: '5%', right: '55%', top: '10%', bottom: '10%' }, // 左侧
      { left: '55%', right: '5%', top: '10%', bottom: '10%' }, // 右侧
    ],
    xAxis: [
      // 左侧 X 轴 (0~50)
      { gridIndex: 0, min: 0, max: 50, axisLine: { show: true } },
      // 右侧 X 轴 (50~100)，反向显示
      { gridIndex: 1, min: 50, max: 100, inverse: true, axisLine: { show: true } },
    ],
    yAxis: [
      // 左侧 Y 轴
      { gridIndex: 0, min: 0, max: 100 },
      // 右侧 Y 轴（与左侧一致）
      { gridIndex: 1, min: 0, max: 100 },
    ],
    series: [
      // 左侧气泡图
      {
        type: 'scatter',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: bubbleLeftData,
        symbolSize: (data) => data[2] * 2, // 控制气泡大小
        itemStyle: { color: '#1890ff', opacity: 0.7 },
        emphasis: { scale: 1.2 }, // 悬停放大
        label: { show: true, formatter: 'L-{@[2]}' }, // 显示大小
      },
      // 右侧对称气泡图
      {
        type: 'scatter',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: bubbleRightData,
        symbolSize: (data) => data[2] * 2, // 大小与左侧一致
        itemStyle: { color: '#ff4d4f', opacity: 0.7 },
        emphasis: { scale: 1.2 },
        label: { show: true, formatter: 'R-{@[2]}' },
      },
    ],
  };
    return (
        <>
            <div style={{ position: "relative", height: "80vh", padding: 20, display: "flex", justifyContent: "space-between" }}>
            <Flex flex="1">
                <EChartsReact option={scatter} style={{ width: 500, height: 500 }} onEvents={{ click: handleClick }} opts={{ renderer: 'svg' }}></EChartsReact>
            </Flex>
            <Flex flex="1">
                 <EChartsReact option={bubbleOption} style={{ width: 500, height: 500 }} onEvents={{ click: handleClick }} opts={{ renderer: 'svg' }}></EChartsReact>
            </Flex>
        </div>
      

        </>

    )
}

export default Pathways;