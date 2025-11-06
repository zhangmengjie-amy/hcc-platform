"use client";
import React, { useEffect, useRef } from 'react';
import { getCohortList, getVolcanoPlot } from "@/configs/request";

import VolcanoPlot from '@/components/expression/pathways/right-panel/volcano-plot';
import EChartsReact from "echarts-for-react";
import {
  Flex,
  Tag,
  Typography,
} from 'antd';
import GoBubbleChart from './go-bubble';

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

  const cohortListRef = useRef(null);
  const [loading, setLoading] = React.useState(true);
  const [volcanoData, setVolcanoData] = React.useState(null);
  const [goBubbleData, setGoBubbleData] = React.useState(null);
  const [error, setError] = React.useState(null); 

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // 使用 Promise.all 并行请求
        const [cohortData, volcanoData] = await Promise.all([
          getCohortList(),
          getVolcanoPlot()
        ]);

        // 设置数据
        cohortListRef.current = cohortData;
        setVolcanoData(volcanoData?.deg_results || []);
        setGoBubbleData(volcanoData?.["go.res"] || []);

      } catch (err) {
        setError(err);
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div style={{ padding: 20 }}>{
      cohortListRef.current?.slice(0, 1).map((item, index) => {
        return <Flex key={index} vertical style={{ marginBottom: "20px" }}>
          <Flex style={{ marginBottom: "20px" }}>
            <Typography.Title level={5} style={{ marginBottom: 0, marginRight: "20px" }}>{item.cohort}</Typography.Title>
            <Tag color={LEVEL_COLOR[item.level]}>{item.level}</Tag>
            <Tag color={SOURCE_COLOR[item.source]}>{item.source}</Tag>
            <Tag color={TECH_COLOR[item.tech]}>{item.tech}</Tag>
          </Flex>
          <Flex flex="1" style={{ border: "1px solid #f5f5f5", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "15px", borderRadius: "12px" }}>
            <VolcanoPlot data={volcanoData}></VolcanoPlot>
          </Flex>
          <Flex flex="1" style={{ border: "1px solid #f5f5f5", marginTop: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "15px", borderRadius: "12px" }}>
            <GoBubbleChart data={goBubbleData}></GoBubbleChart>
          </Flex>
        </Flex>
      })
    }
    </div>
  )
}

export default Pathways;