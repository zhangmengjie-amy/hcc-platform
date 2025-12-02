"use client";
import React, { useEffect, useRef } from "react";
import { getCohortList, getVolcanoPlot } from "@/configs/request";

import VolcanoPlot from "@/components/expression/pathways/right-panel/volcano-plot";
import EChartsReact from "echarts-for-react";
import { Flex, Tag, Typography, Dropdown, Space, Button } from "antd";
import GoBubbleChart from "./go-bubble";
import GoBarChart from "./go-column";

const CLASSIFY_COLOR = {
  Tissue: "purple",
  Celllines: "green",
};

const LEVEL_COLOR = {
  Intra: "cyan",
  Inter: "blue",
  "Inter+Intra": "lime",
};

const TECHNOLOGY_COLOR = {
  "Micro array": "orange",
  Sequencing: "magenta",
};

const Pathways = () => {
  const cohortListRef = useRef(null);
  const [loading, setLoading] = React.useState(true);
  const [volcanoData, setVolcanoData] = React.useState(null);
  const [selectedCohort, setSelectedCohort] = React.useState("DT");
  const [goBubbleData, setGoBubbleData] = React.useState(null);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 使用 Promise.all 并行请求
        const [cohortData, volcanoData] = await Promise.all([
          getCohortList(),
          getVolcanoPlot(),
        ]);

        // 设置数据
        cohortListRef.current = cohortData;
        setVolcanoData(volcanoData?.deg_results || []);
        setGoBubbleData(volcanoData?.["go.res"] || []);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  console.log("cohortListRef.current", cohortListRef.current);

  return (
    <div style={{ padding: 20 }}>
      {cohortListRef.current?.slice(0, 1).map((item, index) => {
        return (
          <Flex key={index} vertical style={{ marginBottom: "20px" }}>
            <Flex style={{ marginBottom: "20px", justifyContent: "space-between" }}>
              <Space>
                <Typography.Title
                  level={5}
                  style={{ marginBottom: 0, marginRight: "20px" }}
                >
                  {item.cohort}
                </Typography.Title>
                <Tag color={LEVEL_COLOR[item.level]}>{item.level}</Tag>
                <Tag color={CLASSIFY_COLOR[item.classify]}>{item.classify}</Tag>
                <Tag color={TECHNOLOGY_COLOR[item.techonology]}>
                  {item.techonology}
                </Tag>
              </Space>
              
              <Dropdown
              
                menu={{
                  items: cohortListRef.current
                    ?.map((item) => {
                      return {
                        label: item.cohort,
                        key: item.cohort,
                      };
                    })
                    ?.slice(0, 2),
                  selectable: true,
                  onClick: (e) => {
                    setSelectedCohort(e.key);
                  },
                  defaultSelectedKeys: [cohortListRef.current?.[0]?.cohort],
                }}
              >
                <Space>Selected: <Button>{selectedCohort}</Button></Space>
              </Dropdown>
            </Flex>
            <Flex
              flex="1"
              style={{
                border: "1px solid #f5f5f5",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "15px",
                borderRadius: "12px",
              }}
            >
              <VolcanoPlot data={volcanoData}></VolcanoPlot>
            </Flex>
            <Flex
              flex="1"
              style={{
                border: "1px solid #f5f5f5",
                marginTop: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "15px",
                borderRadius: "12px",
              }}
            >
              <GoBarChart data={goBubbleData}></GoBarChart>
            </Flex>
          </Flex>
        );
      })}
    </div>
  );
};

export default Pathways;
