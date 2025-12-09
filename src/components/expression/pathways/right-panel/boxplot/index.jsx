import React, { useMemo, useRef, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const BoxPlotWithConnectors = ({
  data = [],
  width = "100%",
  height = "600px",
  title = "箱线图 - 带连接线",
  showLegend = true,
}) => {
  const chartRef = useRef(null);
  
  // 示例数据结构
  const defaultData = [
    {
      name: "Group A",
      data: [650, 650, 650, 650, 650, 700, 750, 750, 750, 800, 800, 850],
      median: 750,
      q1: 700,
      q3: 800,
      min: 650,
      max: 850,
    },
    {
      name: "Group B",
      data: [700, 700, 700, 700, 700, 750, 750, 800, 800, 800, 850, 850],
      median: 775,
      q1: 725,
      q3: 825,
      min: 700,
      max: 850,
    },
    {
      name: "Group C",
      data: [750, 750, 750, 800, 800, 800, 850, 850, 900, 900, 950, 950],
      median: 850,
      q1: 800,
      q3: 900,
      min: 750,
      max: 950,
    },
  ];

  const chartData = data.length > 0 ? data : defaultData;
  
  // 计算两两之间的p值（这里用模拟数据）
  const calculateConnections = useMemo(() => {
    const connections = [];
    for (let i = 0; i < chartData.length - 1; i++) {
      for (let j = i + 1; j < chartData.length; j++) {
        // 这里可以计算实际的统计值，比如p值、均值差等
        const pValue = Math.random().toFixed(4); // 模拟p值
        const meanDiff = (chartData[j].median - chartData[i].median).toFixed(2);
        
        connections.push({
          from: i,
          to: j,
          pValue: pValue,
          meanDiff: meanDiff,
          // 连接线位置（使用中位数）
          fromValue: chartData[i].median,
          toValue: chartData[j].median,
          // 显示文本
          label: `p=${pValue}\nΔ=${meanDiff}`,
        });
      }
    }
    return connections;
  }, [chartData]);

  const option = useMemo(() => ({
    title: {
      text: title,
      left: "center",
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        if (params.seriesType === "custom") {
          const conn = params.data;
          return `
            <div><strong>${chartData[conn.from].name} ↔ ${chartData[conn.to].name}</strong></div>
            <div>p值: ${conn.pValue}</div>
            <div>均值差: ${conn.meanDiff}</div>
          `;
        }
        return `${params.seriesName}<br/>${params.name}: ${params.value}`;
      },
    },
    legend: showLegend ? {
      data: ["数据分布", "异常值"],
      top: 40,
    } : { show: false },
    xAxis: {
      type: "category",
      data: chartData.map(item => item.name),
      axisLabel: {
        interval: 0,
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: "#999",
        },
      },
    },
    yAxis: {
      type: "value",
      name: "数值",
      nameTextStyle: {
        fontSize: 12,
        padding: [0, 0, 0, 10],
      },
      axisLine: {
        lineStyle: {
          color: "#999",
        },
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#e0e0e0",
        },
      },
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "15%",
      top: showLegend ? "20%" : "15%",
      containLabel: true,
    },
    // 关键：自定义系列绘制连接线
    series: [
      // 1. 箱线图系列
      {
        name: "箱线图",
        type: "boxplot",
        data: chartData.map((item, index) => [
          index, // x轴位置
          item.min,
          item.q1,
          item.median,
          item.q3,
          item.max,
        ]),
        itemStyle: {
          color: "#1890ff",
          borderColor: "#1890ff",
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            borderColor: "#ff4d4f",
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        boxWidth: "40%", // 控制箱子的宽度
      },
      // 2. 散点图显示异常值（可选）
      {
        name: "异常值",
        type: "scatter",
        data: chartData.flatMap((item, xIndex) => 
          item.data
            .filter(val => val < item.min || val > item.max)
            .map(val => [xIndex, val]),
        ),
        symbolSize: 8,
        itemStyle: {
          color: "#ff4d4f",
        },
      },
      // 3. 自定义系列绘制连接线和标签
      {
        name: "统计连接",
        type: "custom",
        renderItem: (params, api) => {
          const connections = calculateConnections;
          const groupHeight = 100; // 连接线绘制区域的高度
          
          const children = [];
          
          connections.forEach((conn, connIndex) => {
            const xFrom = api.coord([conn.from, 0])[0];
            const xTo = api.coord([conn.to, 0])[0];
            
            // 计算连接线的y位置（在箱线图上方）
            const baseY = api.coord([0, api.getHeight()])[1];
            const yLevel = baseY - 50 - (connIndex % 3) * 30; // 分层显示
            
            // 1. 绘制连接线
            children.push({
              type: "line",
              shape: {
                x1: xFrom,
                y1: yLevel,
                x2: xTo,
                y2: yLevel,
              },
              style: {
                stroke: conn.pValue < 0.05 ? "#ff4d4f" : "#52c41a", // 显著用红色，不显著用绿色
                lineWidth: 2,
                lineDash: conn.pValue < 0.05 ? null : [5, 5], // 不显著的用虚线
              },
            });
            
            // 2. 绘制端点
            children.push({
              type: "circle",
              shape: {
                cx: xFrom,
                cy: yLevel,
                r: 4,
              },
              style: {
                fill: conn.pValue < 0.05 ? "#ff4d4f" : "#52c41a",
              },
            });
            
            children.push({
              type: "circle",
              shape: {
                cx: xTo,
                cy: yLevel,
                r: 4,
              },
              style: {
                fill: conn.pValue < 0.05 ? "#ff4d4f" : "#52c41a",
              },
            });
            
            // 3. 绘制标签（显示p值和均值差）
            const midX = (xFrom + xTo) / 2;
            children.push({
              type: "text",
              style: {
                text: conn.label,
                x: midX,
                y: yLevel - 10,
                fill: "#333",
                fontSize: 10,
                fontWeight: "bold",
                textAlign: "center",
                textVerticalAlign: "middle",
              },
            });
            
            // 4. 绘制连接线到箱线图的垂直线
            children.push({
              type: "line",
              shape: {
                x1: xFrom,
                y1: yLevel,
                x2: xFrom,
                y2: api.coord([conn.from, conn.fromValue])[1] + 20, // 连接到箱线图
              },
              style: {
                stroke: "#999",
                lineWidth: 1,
                lineDash: [2, 2],
                opacity: 0.6,
              },
            });
            
            children.push({
              type: "line",
              shape: {
                x1: xTo,
                y1: yLevel,
                x2: xTo,
                y2: api.coord([conn.to, conn.toValue])[1] + 20,
              },
              style: {
                stroke: "#999",
                lineWidth: 1,
                lineDash: [2, 2],
                opacity: 0.6,
              },
            });
          });
          
          return {
            type: "group",
            children: children,
            silent: true, // 不响应鼠标事件
          };
        },
        data: calculateConnections,
        z: 10, // 确保在最上层
      },
    ],
  }), [chartData, calculateConnections, title, showLegend]);

  return (
    <ReactECharts
      ref={chartRef}
      echarts={echarts}
      option={option}
      style={{ width, height }}
      opts={{
        renderer: "canvas",
      }}
    />
  );
};

export default BoxPlotWithConnectors;