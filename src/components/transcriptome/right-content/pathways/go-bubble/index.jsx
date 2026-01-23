import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const GoBubbleChart = ({
  data = [],
  width = "100%",
  height = "600px",
  loadingText = "加载中...",
  errorText = "加载失败",
  title = "GO 富集分析气泡图",
  showLegend = true,
}) => {
  const [chartData, setChartData] = useState(data);
  const [loading, setLoading] = useState(!data?.length);
  const [error, setError] = useState(null);

  // 如果有外部传入的 data，直接使用
  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
      setLoading(false);
    }
  }, [data]);

  // 使用 useMemo 优化数据处理
  const { bpData, ccData, countRange, allDescriptions } = useMemo(() => {
    if (!chartData?.length) {
      return { bpData: [], ccData: [], countRange: { min: 0, max: 1 }, allDescriptions };
    }

    const bpData = [];
    const ccData = [];
    const counts = chartData.map(d => d.Count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    chartData.forEach(item => {
      const bubbleData = {
        name: item.Description,
        value: [item.Count, item.Description, item["log10AdjPVal"]],
        Count: item.Count,
        log10_padjust: item["log10AdjPVal"],
        pvalue: item.pvalue,
        p_adjust: item["p.adjust"],
        RichFactor: item.RichFactor,
        FoldEnrichment: item.FoldEnrichment,
        GeneRatio: item.GeneRatio,
        geneID: item.geneID,
        ONTOLOGY: item.ONTOLOGY,
      };

      if (item.ONTOLOGY === "BP") {
        bpData.push(bubbleData);
      } else if (item.ONTOLOGY === "CC") {
        ccData.push(bubbleData);
      }
    });
    const allDescriptions = chartData.map(item => item.Description).reverse();

    // 为每个描述创建对应的 BP 和 CC 数据
    allDescriptions.forEach(description => {
      const bpItem = chartData.find(item => 
        item.Description === description && item.ONTOLOGY === "BP",
      );
      const ccItem = chartData.find(item => 
        item.Description === description && item.ONTOLOGY === "CC",
      );

      bpData.push(bpItem ? bpItem.Count : 0);
      ccData.push(ccItem ? ccItem.Count : 0);
    });
    return { 
      bpData, 
      ccData,
      allDescriptions,
      countRange: { min: minCount, max: maxCount },
    };
  }, [chartData]);

  // 计算气泡大小
  const calculateSymbolSize = useMemo(() => {
    const { min, max } = countRange;
    const sizeRange = { min: 5, max: 20 };
    
    return (count) => {
      if (max === min) return (sizeRange.min + sizeRange.max) / 2;
      const normalized = (count - min) / (max - min);
      return sizeRange.min + normalized * (sizeRange.max - sizeRange.min);
    };
  }, [countRange]);

  // 配置项
  const option = useMemo(() => {
    if (!chartData?.length) return {};

    return {
      grid: {
        left: "5%",
        right: "10%",
        bottom: "5%",
        top: "15%",
        containLabel: true,
      },
      title: {
        text: title,
        left: "center",
        top: 10,
        textStyle: {
          fontSize: 14,
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
          const data = params.data;
          return `
            <div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              ${data.name}
            </div>
            <div style="line-height: 1.4;">
              <span style="color: #666;">ONTOLOGY:</span> ${data.ONTOLOGY}<br/>
              <span style="color: #666;">Count:</span> <strong>${data.Count}</strong><br/>
              <span style="color: #666;">RichFactor:</span> ${data.RichFactor.toFixed(4)}<br/>
              <span style="color: #666;">FoldEnrichment:</span> ${data.FoldEnrichment.toFixed(2)}<br/>
              <span style="color: #666;">p值:</span> ${data.pvalue.toExponential(2)}<br/>
              <span style="color: #666;">p_adjust:</span> ${data.p_adjust.toExponential(2)}<br/>
              <span style="color: #666;">geneID:</span> ${data.geneID.replace(/\//g, ", ")}
            </div>
          `;
        },
      },
      legend: {
        data: [
          { name: "BP", itemStyle: { color: "#ff4d4f" } },
          { name: "CC", itemStyle: { color: "#1890ff" } },
        ],
        top: 40,
        textStyle: {
          fontSize: 12,
        },
        // 关键配置：使用方形图标
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 10,
        icon: "rect", // 设置为方形
      },
      xAxis: {
        name: "基因数量 (Count)",
        nameLocation: "center",
        nameGap: 25,
        nameTextStyle: {
          fontSize: 11,
          fontWeight: "bold",
          color: "#666",
        },
        type: "value",
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e0e0e0",
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#e0e0e0",
          },
        },
        axisLabel: {
          fontSize: 10,
          color: "#666",
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "#e0e0e0",
          },
        },
      },
      yAxis: {
        name: "GO 功能描述",
        nameLocation: "end",
        nameGap: 20,
        nameTextStyle: {
          align: "center",
          lineHeight: 16,
          fontWeight: "bold",
          color: "#666",
        },
        type: "category",
        axisLine: {
          show: true,
          lineStyle: {
            color: "#e0e0e0",
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#e0e0e0",
          },
          alignWithLabel: true,
        },
        axisLabel: {
          width: 180,
          overflow: "truncate",
          ellipsis: "...",
          fontSize: 10,
          margin: 8,
          align: "right",
          color: "#666",
          // 添加 tooltip 配置
          show: true,
          formatter: function(value) {
            // 返回截断的文本用于显示
            if (value.length > 25) {
              return value.substring(0, 25) + "...";
            }
            return value;
          },
        },
        data: allDescriptions,
        // 添加 tooltip 配置
        tooltip: {
          show: true,
          formatter: function(params) {
            // 返回完整的文本
            return params.value;
          },
        },
      },
      series: [
        {
          name: "BP",
          type: "scatter",
          data: bpData,
          symbolSize: (data) => calculateSymbolSize(data[0]),
          itemStyle: {
            color: "#ff4d4f",
            opacity: 0.8,
          },
          emphasis: {
            focus: "series",
            scale: true,
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(255, 77, 79, 0.5)",
              borderWidth: 2,
              borderColor: "#fff",
            },
          },
        },
        {
          name: "CC",
          type: "scatter",
          data: ccData,
          symbolSize: (data) => calculateSymbolSize(data[0]),
          itemStyle: {
            color: "#1890ff",
            opacity: 0.8,
          },
          emphasis: {
            focus: "series",
            scale: true,
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(24, 144, 255, 0.5)",
              borderWidth: 2,
              borderColor: "#fff",
            },
          },
        },
      ],
      visualMap: {
        type: "continuous",
        dimension: 0,
        min: countRange.min,
        max: countRange.max,
        calculable: true,
        orient: "vertical",
        right: "20px",
        top: "center",
        itemWidth: 10,
        itemHeight: 120,
        inRange: {
          color: ["#440255", "#289B87", "#7AD151", "#FDE725"],
        },
        text: ["高", "低"],
        textStyle: {
          fontSize: 10,
        },
        formatter: (value) => `${Math.round(value)}`,
      },
    };
  }, [chartData, bpData, ccData, countRange, calculateSymbolSize, title, showLegend]);

  // 加载状态
  if (loading) {
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
        }}
      >
        {loadingText}
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed #ff4d4f",
          borderRadius: "4px",
          color: "#ff4d4f",
        }}
      >
        {errorText}: {error.message}
      </div>
    );
  }

  // 空数据状态
  if (!chartData?.length) {
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
    />
  );
};

export default GoBubbleChart;