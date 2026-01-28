import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const VolcanoPlot = ({
  data = [],
  width = "100%",
  height = "600px",
  title = "Volcano Plot of Differential Gene Expression",
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
  const { allData, significantData } = useMemo(() => {
    const all = [];
    const significant = [];
    
    data?.forEach(item => {
      const point = {
        name: item.geneName,
        value: [item.logFC, item["log10AdjPVal"]],
        itemStyle: {
          color: COLOR_MAP[item.significance] || COLOR_MAP["Not Significant"],
        },
        significance: item.significance ?? "Not Significant",
        adjPVal: item["adj.P.Val"],
        logFC: item.logFC,
      };
      
      all.push(point);
      
      // 只对显著性的点标记需要显示标签
      if (item.significance === "UP Significant" || item.significance === "DOWN Significant") {
        significant.push({
          ...point,
          // 为标签添加特殊标记
          label: {
            show: true,
            formatter: item.geneName,
          },
        });
      }
    });
    
    return { allData: all, significantData: significant };
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
          <div>adj.P.Val: ${data.adjPVal}</div>
          <div style="color: ${data.itemStyle.color}; font-weight: bold;">
            显著性: ${data.significance}
          </div>
        `;
      },
    },
    legend: {
      orient: "horizontal",
      left: "right",
      data: Object.keys(COLOR_MAP),
      top: 40,
      textStyle: {
        fontSize: 10,
      },
      itemWidth: 12,
      itemHeight: 12,
    },
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
          color: "#e0e0e0",
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
          color: "#e0e0e0",
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
    labelLayout: {
      // 隐藏重叠的标签
      hideOverlap: true,
      // 或者移动重叠的标签
      moveOverlap: "shiftY", // 'shiftX' | 'shiftY'
      // 或者按优先级显示
      draggable: true, // 允许拖动标签
    },
    series: [
      // 1. 非显著性点系列
      {
        type: "scatter",
        name: "Not Significant",
        data: allData.filter(item => item.significance === "Not Significant"),
        // symbolSize: (val) => {
        //   const pValue = Math.pow(10, -val[1]);
        //   const baseSize = 2;
        //   const maxSize = 4;
        //   return baseSize + (1 - Math.min(pValue * 100, 1)) * (maxSize - baseSize);
        // },
        symbolSize: 4,
        itemStyle: {
          color: COLOR_MAP["Not Significant"],
        },
        // emphasis: {
        //   focus: "series",
        //   scale: true,
        //   itemStyle: {
        //     shadowBlur: 15,
        //     shadowColor: "rgba(0, 0, 0, 0.8)",
        //     borderWidth: 2,
        //     borderColor: "#fff",
        //   },
        // },
      },
      // 2. UP Significant 系列（带标签）
      {
        type: "scatter",
        name: "UP Significant",
        data: significantData.filter(item => item.significance === "UP Significant"),
        // symbolSize: (val) => {
        //   const pValue = Math.pow(10, -val[1]);
        //   const baseSize = 6;
        //   const maxSize = 10;
        //   return baseSize + (1 - Math.min(pValue * 100, 1)) * (maxSize - baseSize);
        // },
        symbolSize: 4,
        itemStyle: {
          color: COLOR_MAP["UP Significant"],
        },
        label: {
          show: true,
          position: "top",
          distance: 8,
          fontSize: 9,
          fontWeight: "bold",
          color: "#E82867",
          allowOverlap: false,
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderColor: "#E82867",
          borderWidth: 1,
          borderRadius: 3,
          padding: [2, 4],
          formatter: (params) => {
            const name = params.data.name;
            // 限制显示长度
            if (name.length > 15) {
              return name.substring(0, 15) + "...";
            }
            return name;
          },
          // 标签避让配置
          hideOverlap: true,
          align: "center",
          verticalAlign: "bottom",
        },
        labelLayout: {
          hideOverlap: true, // 隐藏重叠的标签
          // 或者使用移动策略
          // moveOverlap: 'shiftY',
          // 可以设置标签显示条件
          // dy: -10, // Y方向偏移
        },
        // emphasis: {
        //   focus: "series",
        //   scale: true,
        //   itemStyle: {
        //     shadowBlur: 15,
        //     shadowColor: "rgba(0, 0, 0, 0.8)",
        //     borderWidth: 2,
        //     borderColor: "#fff",
        //   },
        //   label: {
        //     show: true,
        //     fontSize: 10,
        //     backgroundColor: "rgba(255, 255, 255, 0.95)",
        //   },
        // },
        blur: {
          label: {
            show: true,
          },
        },
        z: 5,
      },
      // 3. DOWN Significant 系列（带标签）
      {
        type: "scatter",
        name: "DOWN Significant",
        data: significantData.filter(item => item.significance === "DOWN Significant"),
        // symbolSize: (val) => {
        //   const pValue = Math.pow(10, -val[1]);
        //   const baseSize = 6;
        //   const maxSize = 10;
        //   return baseSize + (1 - Math.min(pValue * 100, 1)) * (maxSize - baseSize);
        // },
        symbolSize: 4,
        itemStyle: {
          color: COLOR_MAP["DOWN Significant"],
        },
        labelLayout: {
          hideOverlap: true, // 隐藏重叠的标签
        },
        label: {
          show: true,
          position: "top",
          distance: 8,
          fontSize: 9,
          fontWeight: "bold",
          color: "#1890ff",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderColor: "#1890ff",
          borderWidth: 1,
          borderRadius: 3,
          padding: [2, 4],
          formatter: (params) => {
            const name = params.data.name;
            // 限制显示长度
            if (name.length > 15) {
              return name.substring(0, 15) + "...";
            }
            return name;
          },
          // 标签避让配置
          hideOverlap: true,
          align: "center",
          verticalAlign: "bottom",
          // width: 100,
          hideOverlap: true,
        },
        // emphasis: {
        //   focus: "series",
        //   scale: true,
        //   itemStyle: {
        //     shadowBlur: 15,
        //     shadowColor: "rgba(0, 0, 0, 0.8)",
        //     borderWidth: 2,
        //     borderColor: "#fff",
        //   },
        //   label: {
        //     show: true,
        //     fontSize: 10,
        //     backgroundColor: "rgba(255, 255, 255, 0.95)",
        //   },
        // },
        blur: {
          label: {
            show: true,
          },
        },
        z: 5,
      },
      // 4. 参考线系列
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
      // 5. 显著性阈值线
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
            position: "insideStartTop",
            verticalAlign: "bottom",
            distance: 5,
          },
        },
      },
    ],
    grid: {
      left: "5%",
      right: "3%",
      bottom: "5%",
      top: "15%",
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
  }), [data, allData, significantData, title, significanceThreshold]);

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
        useDirtyRect: true,
      }}
      onEvents={{
        rendered: () => {},
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