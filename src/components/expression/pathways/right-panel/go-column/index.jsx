import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const GoBarChart = ({
  data = [],
  width = "100%",
  height = "600px",
  loadingText = "加载中...",
  errorText = "加载失败",
  title = "GO 富集分析堆叠柱状图",
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
  const { bpData, ccData, allDescriptions, allGeneRatios, bpWithDescription, ccWithDescription } = useMemo(() => {
    if (!chartData?.length) {
      return { 
        bpData: [], 
        ccData: [], 
        allDescriptions: [], 
        allGeneRatios: [],
        bpWithDescription: [],
        ccWithDescription: [],
      };
    }

    const bpData = [];
    const ccData = [];
    const allDescriptions = chartData.map(item => item.Description).reverse();
    const allGeneRatios = [];
    const bpWithDescription = [];
    const ccWithDescription = [];

    // 为每个描述创建对应的 BP 和 CC 数据
    allDescriptions.forEach(description => {
      const bpItem = chartData.find(item => 
        item.Description === description && item.ONTOLOGY === "BP",
      );
      const ccItem = chartData.find(item => 
        item.Description === description && item.ONTOLOGY === "CC",
      );

      const bpValue = bpItem ? bpItem.Count : 0;
      const ccValue = ccItem ? ccItem.Count : 0;
      
      bpData.push(bpValue);
      ccData.push(ccValue);
      
      // 存储带描述的BP数据（用于在柱子上显示描述）
      bpWithDescription.push({
        value: bpValue,
        description: description,
      });
      
      // 存储带描述的CC数据
      ccWithDescription.push({
        value: ccValue,
        description: description,
      });
      
      // 获取 GeneRatio 值（优先使用 BP 的 GeneRatio，如果没有则使用 CC 的）
      const ratioItem = bpItem || ccItem;
      allGeneRatios.push(ratioItem ? ratioItem.GeneRatio : "0");
    });

    return { bpData, ccData, allDescriptions, allGeneRatios, bpWithDescription, ccWithDescription };
  }, [chartData]);

  // 配置项
  const option = useMemo(() => {
    if (!chartData?.length) return {};

    return {
      grid: {
        left: "5%",
        right: "3%",
        bottom: "10%",
        top: "15%",
        containLabel: false,
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
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#ddd",
        borderWidth: 1,
        textStyle: {
          color: "#333",
        },
        formatter: (params) => {
          let result = `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px;">
            ${params[0].name}
          </div>`;
          
          params.forEach(param => {
            if (param.value > 0) {
              const dataItem = chartData.find(item => 
                item.Description === params[0].name && 
                item.ONTOLOGY === param.seriesName,
              );
              const geneRatio = dataItem ? dataItem.GeneRatio : "0";
              
              result += `
                <div style="line-height: 1.4; margin-bottom: 4px;">
                  <span style="color: ${param.color}; font-weight: bold;">${param.seriesName}:</span><br/>
                  基因数量: ${param.value}<br/>
                  GeneRatio: ${geneRatio}
                </div>
              `;
            }
          });
          
          const totalCount = params.reduce((sum, param) => sum + param.value, 0);
          
          // 计算总的 GeneRatio（使用当前项对应的 GeneRatio）
          const currentData = chartData.find(item => 
            item.Description === params[0].name,
          );
          const totalGeneRatio = currentData ? currentData.GeneRatio : "0";
          
          result += `<div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #eee; font-weight: bold;">
            总计基因数: ${totalCount}<br/>
            总 GeneRatio: ${totalGeneRatio}
          </div>`;
          
          return result;
        },
      },
      legend: showLegend ? {
        data: ["BP", "CC"],
        top: 40,
        textStyle: {
          fontSize: 12,
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 10,
        icon: "rect",
      } : { show: false },
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
        name: "GeneRatio",
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
          fontSize: 10,
          color: "#000",
          fontWeight: "bold",
          // 直接显示 GeneRatio
          formatter: function(value, index) {
            // 从 allGeneRatios 数组中获取对应的 GeneRatio
            const geneRatio = allGeneRatios[index] || "0";
            return geneRatio;
          },
        },
        boundaryGap: [0.1, 0.1],
        offset: 0,
        z: 10,
        data: allDescriptions, // 这里仍然存储 descriptions 用于内部映射
      },
      series: [
        {
          name: "BP",
          type: "bar",
          stack: "total",
          data: bpWithDescription, // 使用带描述的数据
          itemStyle: {
            color: "#ff4d4f",
            opacity: 0.8,
          },
          emphasis: {
            itemStyle: {
              opacity: 1,
              shadowBlur: 10,
              shadowColor: "rgba(255, 77, 79, 0.5)",
            },
          },
          // 在柱子上显示 description
          label: {
            show: true,
            position: "insideLeft", // 在柱子内部左侧显示
            verticalAlign: "middle", // 垂直居中
            align: "left",
            color: "#000", // 白色文字
            fontSize: 12,
            fontWeight: "bold",
            // textShadowColor: "rgba(255, 255, 255, 0.5)",
            // textShadowBlur: 2,
            textShadowOffsetX: 1,
            textShadowOffsetY: 1,
            // 显示 description
            formatter: function(params) {
              if (params.data.value > 0) {
                const description = params.data.description;
                // 限制显示长度，避免文字溢出
                if (description.length > 100) {
                  return description.substring(0, 100) + "...";
                }
                return description;
              }
              return "";
            },
          },
        },
        {
          name: "CC",
          type: "bar",
          stack: "total",
          data: ccWithDescription, // 使用带描述的数据
          itemStyle: {
            color: "#1890ff",
            opacity: 0.8,
          },
          emphasis: {
            itemStyle: {
              opacity: 1,
              shadowBlur: 10,
              shadowColor: "rgba(24, 144, 255, 0.5)",
            },
          },
          // 在柱子上显示 description
          label: {
            show: true,
            position: "insideLeft", // 在柱子内部左侧显示
            verticalAlign: "middle",
            align: "left",
            color: "#000", // 白色文字
            fontSize: 12,
            fontWeight: "bold",
            // textShadowColor: "rgba(0, 0, 0, 0.5)",
            // textShadowBlur: 2,
            textShadowOffsetX: 1,
            textShadowOffsetY: 1,
            // 显示 description
            formatter: function(params) {
              if (params.data.value > 0) {
                const description = params.data.description;
                // 限制显示长度，避免文字溢出
                if (description.length > 100) {
                  return description.substring(0, 100) + "...";
                }
                return description;
              }
              return "";
            },
          },
        },
      ],
    };
  }, [chartData, bpWithDescription, ccWithDescription, allGeneRatios, title, showLegend]);

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

export default GoBarChart;