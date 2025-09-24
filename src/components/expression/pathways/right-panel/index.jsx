"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getExpressionSubtypeList } from "@/configs/request";
import { getITHList, getCohortList } from "@/configs/request";
import { getFullPhylogenetic } from "@/configs/request";
import HorizontalTree from "@/components/horizontal-tree/index";
import EChartsReact from "echarts-for-react";
import {
    Collapse,
    Radio,
    Tooltip,
    Button,
    Flex,
    Tag ,
    Splitter,
    Typography,
    Segmented,
    message
} from 'antd';
const SUBTYPE_COLOR = {
    "C1": "rgb(79, 151, 121)",
    "C2": "rgb(72, 128, 187)",
    "C3": "rgb(150, 91, 164)",
    "C4": "rgb(167, 134, 56)",
    "C5": "rgb(238, 188, 57)",
    "C6": "rgb(218, 85, 76)",
}

const SOURCE_COLOR = {
    "Tissue": "rgb(218, 85, 76)",
    "Cell lines": "rgb(238, 188, 57)"
}

const TECH_COLOR = {
    "micro-array": "rgb(79, 151, 121)",
    "Sequence": "rgb(150, 91, 164)"
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

    const cohortListRef = useRef(null)
    useEffect(() => {
        getCohortList().then((data) => {
        cohortListRef.current = data;
        })
    }, [])


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
      { left: '10%', right: '50%', top: '20px', bottom: '20px' }, // 左侧区域
      { left: '60%', right: '0%', top: '20px', bottom: '20px' }, // 右侧区域
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
      { left: '5%', right: '55%', top: '20px', bottom: '20px' }, // 左侧
      { left: '55%', right: '5%', top: '20px', bottom: '20px' }, // 右侧
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
        <div style={{padding: 20}}>{
            cohortListRef.current?.slice(0, 2).map((item) => {
                return <Flex vertical style={{marginBottom: "20px"}}>
                    <Flex style={{marginBottom: "20px"}}>
                        <Typography.Title level={5} style={{marginBottom: 0, marginRight: "20px"}}>{item.cohort}</Typography.Title><Tag color={SOURCE_COLOR[item.source]}>{item.source}</Tag>
                        <Tag color={TECH_COLOR[item.tech]}>{item.tech}</Tag>
                    </Flex>
                     <Flex style={{ height: "500px" }}>
            <Flex flex="1" style={{border: "1px solid #f5f5f5", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "15px", borderRadius: "12px"}}>
                <EChartsReact option={scatter} style={{ width: "100%", height: "100%" }}  opts={{ renderer: 'svg' }}></EChartsReact>
            </Flex>
            <Flex flex="1" style={{border: "1px solid #f5f5f5", marginLeft: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "15px", borderRadius: "12px"}}>
                 <EChartsReact option={bubbleOption} style={{ width: "100%", height: "100%" }}   opts={{ renderer: 'svg' }}></EChartsReact>
            </Flex>
        </Flex>
                </Flex>
            })
        }
           
      

        </div>

    )
}

export default Pathways;