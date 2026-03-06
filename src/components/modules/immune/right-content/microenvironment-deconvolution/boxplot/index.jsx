/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Row, Col, Card, Typography } from "antd";

const { Title } = Typography;

const BoxplotChart = ({ data, height = 600 }) => {
  // 定义每个cluster的颜色和显示顺序
  const clusterOrder = ["TME1", "TME2", "TME3", "TME4"];
  const clusterColors = {
    "TME1": "#FF6B6B",  // 红色
    "TME2": "#4ECDC4",  // 绿色
    "TME3": "#FFD166",  // 蓝色
    "TME4": "#06D6A0",  // 黄色
    "TME5": "#118AB2",
    "TME6": "#073B4C",
    "TME7": "#EF476F",
    "TME8": "#FF9A00",
    "TME9": "#7209B7",
    "TME10": "#3A86FF",

  };
  
  // 如果没有具体的TME名称，使用默认颜色
  const defaultColors = [
    "#FF6B6B", // 红色 - TME1
    "#4ECDC4", // 青色 - TME2
    "#FFD166", // 黄色 - TME3
    "#7209B7", // 绿色
    "#118AB2", // 蓝色
    "#073B4C", // 深蓝色
    "#EF476F", // 粉色
    "#FF9A00", // 橙色
    "#06D6A0", // 紫色
    "#3A86FF", // 亮蓝色
  ];

  const boxplotData = useMemo(() => {
    if (!data || !data.Heatmap_Body || data.Heatmap_Body.length === 0) {
      return null;
    }

    // 1. 按terms_order排序
    const sortedTerms = [...data.terms_order_name].sort(
      (a, b) => a.terms_order - b.terms_order,
    );

    // 2. 获取所有唯一的TMEcluster并按照指定顺序排序
    const rawClusters = [...new Set(data.sampleid_order_name.map((item) => item.TMEcluster))];
    
    // 按照 clusterOrder 的顺序排序，确保 TME1, TME2, TME3, TME4 的顺序
    const uniqueClusters = clusterOrder.filter(cluster => rawClusters.includes(cluster));
    
    // 添加其他不在预定义顺序中的cluster
    rawClusters.forEach(cluster => {
      if (!uniqueClusters.includes(cluster)) {
        uniqueClusters.push(cluster);
      }
    });

    // 为每个cluster分配颜色
    const clusterColorMap = {};
    uniqueClusters.forEach((cluster, index) => {
      clusterColorMap[cluster] = clusterColors[cluster] || defaultColors[index % defaultColors.length];
    });

    // 3. 构建数据结构：每个term在不同cluster下的原始value数组
    const termClusterData = {};

    // 初始化数据结构
    sortedTerms.forEach((term) => {
      termClusterData[term.terms] = {};
      uniqueClusters.forEach((cluster) => {
        termClusterData[term.terms][cluster] = [];
      });
    });

    // 填充原始数据
    data.Heatmap_Body.forEach((item) => {
      const term = item.terms;
      const cluster = item.TMEcluster;
      const value = parseFloat(item.value);

      if (
        termClusterData[term] &&
        termClusterData[term][cluster] !== undefined
      ) {
        termClusterData[term][cluster].push(value);
      }
    });

    // 构建每个term的统计信息
    const termStats = sortedTerms.map((term) => {
      const termName = term.terms;
      const clusterData = uniqueClusters.map((cluster) => {
        const values = termClusterData[termName][cluster] || [];
        const color = clusterColorMap[cluster];

        if (values.length === 0) {
          return {
            cluster,
            color,
            values: [],
            outliers: [],
            stats: {
              min: 0,
              q1: 0,
              median: 0,
              q3: 0,
              max: 0,
              iqr: 0,
              lowerWhisker: 0,
              upperWhisker: 0,
              count: 0,
            },
          };
        }

        // 排序并计算统计值
        const sortedValues = [...values].sort((a, b) => a - b);
        const q1 = calculatePercentile(sortedValues, 25);
        const median = calculatePercentile(sortedValues, 50);
        const q3 = calculatePercentile(sortedValues, 75);
        const iqr = q3 - q1;

        // 计算须线范围（正常值范围）
        const lowerWhisker = q1 - 1.5 * iqr;
        const upperWhisker = q3 + 1.5 * iqr;

        // 找出异常值（超出须线范围的点）
        const outliers = [];
        const normalValues = [];

        sortedValues.forEach((value) => {
          if (value < lowerWhisker || value > upperWhisker) {
            outliers.push(value);
          } else {
            normalValues.push(value);
          }
        });

        // 计算min和max（基于正常值）
        const min =
          normalValues.length > 0 ? Math.min(...normalValues) : lowerWhisker;
        const max =
          normalValues.length > 0 ? Math.max(...normalValues) : upperWhisker;

        return {
          cluster,
          color,
          values: normalValues, // 正常值
          outliers: outliers, // 异常值
          stats: {
            min,
            q1,
            median,
            q3,
            max,
            iqr,
            lowerWhisker,
            upperWhisker,
            count: values.length,
            outlierCount: outliers.length,
          },
        };
      });

      return {
        term: termName,
        clusterData,
        clusterColorMap,
      };
    });

    // 辅助函数：计算百分位数
    function calculatePercentile(sortedArr, percentile) {
      if (sortedArr.length === 0) return 0;
      const index = (percentile / 100) * (sortedArr.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);

      if (lower === upper) {
        return sortedArr[lower];
      }

      const weight = index - lower;
      return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
    }

    return {
      termStats,
      uniqueClusters,
      sortedTerms,
      clusterColorMap,
    };
  }, [data]);

  // 生成单个term的箱体图option
  const getTermOption = (termData, termName) => {
    const { clusterData, clusterColorMap } = termData;

    // 准备箱体图数据
    const boxplotSeriesData = [];
    const outlierSeriesData = [];
    const categories = [];

    clusterData.forEach((item, index) => {
      const cluster = item.cluster;
      const stats = item.stats;
      const color = item.color || clusterColorMap[cluster];

      categories.push(cluster);

      if (stats.count > 0) {
        // 箱体图数据：[min, Q1, median, Q3, max]
        boxplotSeriesData.push({
          value: [stats.min, stats.q1, stats.median, stats.q3, stats.max],
          itemStyle: {
            color: color,
            borderColor: "#333",
            borderWidth: 2,
          },
        });

        // 异常值数据
        item.outliers.forEach((outlier) => {
          outlierSeriesData.push({
            name: cluster,
            value: [index, outlier],
            itemStyle: {
              color: color,
              borderColor: "#333",
              borderWidth: 1,
            },
          });
        });
      } else {
        boxplotSeriesData.push({
          value: [0, 0, 0, 0, 0],
          itemStyle: {
            color: "#e0e0e0", // 灰色表示无数据
            borderColor: "#ccc",
            borderWidth: 1,
          },
        });
      }
    });

    return {
      backgroundColor: "#EBEBEB", // 灰色背景色
      title: {
        top: 10,
        text: termName,
        left: "center",
        textStyle: {
          fontSize: 12,
          fontWeight: "bold",
          color: "#333",
        },
      },
      tooltip: {
        trigger: "item",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#ddd",
        borderWidth: 1,
        textStyle: {
          color: "#333",
        },
        formatter: function (params) {
          if (params.seriesType === "scatter") {
            const cluster = params.data.name || categories[params.value[0]];
            const value = params.value[1];
            return `
              <div style="font-weight: bold; margin-bottom: 5px; color: ${params.color}">${cluster} - Outlier</div>
              <div style="margin: 2px 0;">Value: ${formatValue(value)}</div>
            `;
          } else if (params.seriesType === "boxplot") {
            const index = params.dataIndex;
            const cluster = categories[index];
            const stats = clusterData[index].stats;
            const color = clusterData[index].color;

            if (stats.count === 0) {
              return `<div style="font-weight: bold;">${cluster}</div><div>No data</div>`;
            }

            return `
              <div style="font-weight: bold; margin-bottom: 5px; color: ${color}">${cluster}</div>
              <div style="margin: 2px 0;">Min: ${formatValue(stats.min)}</div>
              <div style="margin: 2px 0;">Q1: ${formatValue(stats.q1)}</div>
              <div style="margin: 2px 0; font-weight: bold;">Median: ${formatValue(stats.median)}</div>
              <div style="margin: 2px 0;">Q3: ${formatValue(stats.q3)}</div>
              <div style="margin: 2px 0;">Max: ${formatValue(stats.max)}</div>
              <div style="margin: 2px 0;">IQR: ${formatValue(stats.iqr)}</div>
              <div style="margin: 2px 0;">Total: ${stats.count}</div>
              <div style="margin: 2px 0; color: #ee6666;">Outliers: ${stats.outlierCount}</div>
            `;
          }
          return "";
        },
      },
      grid: {
        left: 10,
        right: 10,
        bottom: 10,
        top: 50,
        backgroundColor: "#fff", // 图表区域白色背景
        borderColor: "#ddd",
        borderWidth: 1,
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowBlur: 4,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: {
          fontSize: 10,
          fontWeight: "bold",
          color: function (value, index) {
            // 直接返回对应cluster的颜色
            const color = clusterData[index]?.color || "#333";
            return color;
          },
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          lineStyle: {
            color: "#fff",
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#fff",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#fff",
            width: 1,
            type: "solid",
          },
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          fontSize: 10,
          color: "#333",
          formatter: formatValue,
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#fff",
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#fff",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "solid",
            color: "#fff",
            width: 1,
          },
        },
        scale: true,
      },
      series: [
        {
          name: "Boxplot",
          type: "boxplot",
          data: boxplotSeriesData,
          // 中位线配置
          lineStyle: {
            color: "#333",
            width: 2,
          },
          // 确保显示所有元素
          showAllSymbol: true,
        },
        // 异常值散点图
        {
          name: "Outliers",
          type: "scatter",
          data: outlierSeriesData,
          symbolSize: function (value) {
            return 6;
          },
          itemStyle: {
            color: function (params) {
              // 返回对应cluster的颜色
              const clusterIndex = categories.indexOf(params.data.name);
              return clusterData[clusterIndex]?.color || "#000";
            },
            borderColor: "#333",
            borderWidth: 1,
          },
        },
      ],
    };
  };

  // 辅助函数：格式化数值显示
  function formatValue(value) {
    if (value === 0) return "0";
    const absValue = Math.abs(value);
    if (absValue < 0.001 || absValue >= 1000) {
      return value.toExponential(2);
    }
    if (absValue < 0.01) {
      return value.toFixed(6);
    }
    if (absValue < 0.1) {
      return value.toFixed(5);
    }
    if (absValue < 1) {
      return value.toFixed(4);
    }
    if (absValue < 10) {
      return value.toFixed(3);
    }
    if (absValue < 100) {
      return value.toFixed(2);
    }
    return value.toFixed(1);
  }

  if (!boxplotData) {
    return (
      <Card
        style={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>No data available for boxplot</div>
      </Card>
    );
  }

  const { termStats } = boxplotData;

  return (
    <Card
      style={{
        borderRadius: 4,
        border: "1px solid #e8e8e8",
      }}
      styles={{
        body: {
          padding: 5,
          height: "100%",
        },
      }}
    >
      <Row gutter={[10, 10]}>
        {termStats.map((item, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              style={{
                height: 300,
                borderRadius: 8,
              }}
              styles={{ body: { padding: 0, height: "100%" } }}
            >
              <div style={{ height: "100%" }}>
                <div style={{ height: "100%" }}>
                  <ReactECharts
                    option={getTermOption(item, item.term)}
                    style={{ width: "100%", height: "100%" }}
                    notMerge={true}
                    lazyUpdate={true}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default BoxplotChart;