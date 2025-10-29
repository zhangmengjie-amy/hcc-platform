"use client";
import React, { useEffect, useRef } from 'react';
import { getCohortList } from "@/configs/request";
import EChartsReact from "echarts-for-react";
import {
  Flex,
  Tag,
  Typography,
} from 'antd';

const SOURCE_COLOR = {
    "Tissue": "rgb(218, 85, 76)",
    "Cell lines": "rgb(238, 188, 57)"
}

const LEVEL_COLOR = {
    "Intra": "rgba(172, 233, 153, 1)",
    "Inter": "rgba(86, 213, 235, 1)"
}

const TECH_COLOR = {
    "micro-array": "rgb(79, 151, 121)",
    "Sequence": "rgba(216, 136, 136, 1)"
}

const Pathways = () => {

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
    <div style={{ padding: 20 }}>{
      cohortListRef.current?.slice(0, 2).map((item, index) => {
        return <Flex key={index} vertical style={{ marginBottom: "20px" }}>
          <Flex style={{ marginBottom: "20px" }}>
            <Typography.Title level={5} style={{ marginBottom: 0, marginRight: "20px" }}>{item.cohort}</Typography.Title><Tag color={LEVEL_COLOR[item.level]}>{item.level}</Tag><Tag color={SOURCE_COLOR[item.source]}>{item.source}</Tag>
            <Tag color={TECH_COLOR[item.tech]}>{item.tech}</Tag>
          </Flex>
          <Flex style={{ height: "500px" }}>
            <Flex flex="1" style={{ border: "1px solid #f5f5f5", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "15px", borderRadius: "12px" }}>
              <EChartsReact option={scatter} style={{ width: "100%", height: "100%" }} opts={{ renderer: 'svg' }}></EChartsReact>
            </Flex>
            <Flex flex="1" style={{ border: "1px solid #f5f5f5", marginLeft: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "15px", borderRadius: "12px" }}>
              <EChartsReact option={bubbleOption} style={{ width: "100%", height: "100%" }} opts={{ renderer: 'svg' }}></EChartsReact>
            </Flex>
          </Flex>
        </Flex>
      })
    }
    </div>
  )
}

export default Pathways;