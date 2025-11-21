import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const VolcanoPlot = ({
  data = [],
  width = "100%",
  height = "600px",
  title = "Volcano Plot of Differential Gene Expression",
  showLegend = true,
}) => {
  // 计算显著性阈值线
  const significanceThreshold = -Math.log10(0.05);

  // 颜色配置
  const COLOR_MAP = {
    "UP Significant": "#E82867",
    "DOWN Significant": "#1890ff",
    "Not Significant": "#BEBEBE",
  };

  // 使用 useMemo 优化数据处理
  const seriesData = useMemo(() => {
    return data?.map(item => ({
      name: item.gene_name,
      value: [item.logFC, item["log10_adj.P.Val"]],
      itemStyle: {
        color: COLOR_MAP[item.Significance] || COLOR_MAP["Not Significant"],
      },
      significance: item.Significance,
      adjPVal: item["adj.P.Val"],
      logFC: item.logFC,
    })) || [];
  }, [data]);

  // 使用 useMemo 优化配置项
  const option = useMemo(() => ({
    title: {
      text: title,
      left: "center",
      top: 10,
      textStyle: {
        color: "#333",
        fontSize: 12,
        fontWeight: "bold",
      },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#ddd",
      borderWidth: 1,
      textStyle: {
        color: "#333",
      },
      formatter: (params) => {
        const { name, data } = params;
        return `
          <div style="font-weight: bold; margin-bottom: 8px;">${name}</div>
          <div>logFC: ${data.logFC.toFixed(4)}</div>
          <div>-log10(adj.P.Val): ${data.value[1].toFixed(4)}</div>
          <div>adj.P.Val: ${data.adjPVal.toExponential(4)}</div>
          <div style="color: ${data.itemStyle.color}; font-weight: bold;">
            显著性: ${data.significance}
          </div>
        `;
      },
    },
    legend: true ? {
      orient: "horizontal",
      left: "right",
      data: Object.keys(COLOR_MAP),
      top: 40,
      textStyle: {
        fontSize: 10,
      },
      itemWidth: 12,
      itemHeight: 12,
    } : undefined,
    xAxis: {
      name: "log₂FC",
      nameLocation: "center",
      nameGap: 25,
      nameTextStyle: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#666",
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#e0e0e0",
        },
      },
      axisTick: {
        show: false,
        length: 10,
        lineStyle: {
          color: "#e0e0e0", // 改成和 gridLine 一样的颜色
        },
      },
      axisLabel: {
        show: true,
        fontSize: 10,
        color: "#666",
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "solid",
          color: "#e0e0e0",
        },
      },
    },
    yAxis: {
      name: "-log₁₀(adj.P.Val)",
      nameLocation: "center",
      nameGap: 30,
      nameTextStyle: {
        fontSize: 11,
        fontWeight: "bold",
        color: "#666",
      },
      position: "left",
      axisLine: {
        show: true,
        lineStyle: {
          color: "#e0e0e0",
        },
      },
      axisTick: {
        show: true,
        length: 10,
        lineStyle: {
          color: "#e0e0e0", // 改成和 gridLine 一样的颜色
        },
      },
      axisLabel: {
        show: true,
        fontSize: 10,
        color: "#666",
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "solid",
          color: "#e0e0e0",
        },
      },
    },
    series: [
      // 主数据系列
      {
        type: "scatter",
        data: seriesData,
        symbolSize: (val) => {
          // 根据 p 值调整点的大小
          const pValue = Math.pow(10, -val[1]);
          const baseSize = 4;
          const maxSize = 8;
          return baseSize + (1 - Math.min(pValue * 100, 1)) * (maxSize - baseSize);
        },
        emphasis: {
          focus: "series",
          scale: true,
          itemStyle: {
            shadowBlur: 15,
            shadowColor: "rgba(0, 0, 0, 0.8)",
            borderWidth: 2,
            borderColor: "#fff",
          },
        },
        blur: {
          itemStyle: {
            opacity: 0.7,
          },
        },
        select: {
          itemStyle: {
            borderColor: "#000",
            borderWidth: 2,
          },
        },
      },
      // 参考线系列
      ...[-1, 1].map(xValue => ({
        type: "line",
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: {
            type: "dashed",
            color: "#208FA9",
            width: 1.5,
          },
          data: [{ xAxis: xValue }],
          emphasis: { disabled: true },
        },
      })),
      // 显著性阈值线
      {
        type: "line",
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: {
            type: "dashed",
            color: "#208FA9",
            width: 1.5,
          },
          data: [{ yAxis: significanceThreshold }],
          emphasis: { disabled: true },
          label: {
            formatter: `p=-log10(0.05)`,
            position: "insideStartTop", // 或者 'insideEndTop'
            verticalAlign: "bottom",
            distance: 5, // 微调距离
          },
        },
      },
    ],
    grid: {
      left: "5%",
      right: "3%",
      bottom: "5%",
      top: "10%",
      containLabel: true,
    },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: 0,
        filterMode: "empty",
      },
      {
        type: "inside",
        yAxisIndex: 0,
        filterMode: "empty",
      },
    ],
  }), [data, seriesData, title, showLegend, significanceThreshold]);

  // 空数据状态
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed #ddd",
          borderRadius: "4px",
          color: "#999",
          fontSize: "14px",
        }}
      >
        暂无数据
      </div>
    );
  }

  return (
    <ReactECharts
      echarts={echarts}
      option={option}
      style={{ width, height }}
      opts={{
        renderer: "svg",
        useDirtyRect: true, // 开启脏矩形渲染优化性能
      }}
      onEvents={{
        rendered: () => console.log("Volcano plot rendered"),
        click: (params) => {
          if (params.componentType === "series") {
            console.log("Gene clicked:", params.name);
          }
        },
      }}
    />
  );
};

export default VolcanoPlot;