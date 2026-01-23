import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const GoBarChart = ({
  data = [],
  width = "100%",
  height = "800px",
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
  const { ontologies, allIds, allDescriptions, allGeneRatios, seriesData } = useMemo(() => {
    if (!chartData?.length) {
      return { 
        ontologies: [], 
        allIds: [], 
        allDescriptions: [], 
        allGeneRatios: [],
        seriesData: {},
      };
    }

    // 获取所有唯一的ontology种类
    const uniqueOntologies = [...new Set(chartData.map(item => item.ontology).filter(Boolean))];
    
    // 获取所有唯一的ID（按description分组，实际上应该是按description获取对应的id）
    const uniqueDescriptions = [...new Set(chartData.map(item => item.description).filter(Boolean))];
    
    // 获取每个description对应的id和geneRatio
    const descriptionMap = {};
    chartData.forEach(item => {
      if (!descriptionMap[item.description]) {
        descriptionMap[item.description] = {
          id: item.id || "",
          geneRatio: item.id || "", // 假设id就是geneRatio
          description: item.description,
        };
      }
    });

    // 为每个ontology创建数据系列
    const seriesData = {};
    uniqueOntologies.forEach(ontology => {
      seriesData[ontology] = uniqueDescriptions.map(description => {
        const item = chartData.find(d => 
          d.description === description && d.ontology === ontology,
        );
        return {
          value: item ? item.count ?? 0 : 0,
          description: description,
          id: descriptionMap[description]?.id || "",
          geneRatio: descriptionMap[description]?.geneRatio || "",
        };
      });
    });

    return {
      ontologies: uniqueOntologies,
      allIds: uniqueDescriptions.map(desc => descriptionMap[desc]?.id || ""),
      allDescriptions: uniqueDescriptions,
      allGeneRatios: uniqueDescriptions.map(desc => descriptionMap[desc]?.geneRatio || ""),
      seriesData,
    };
  }, [chartData]);

  // 为不同ontology分配颜色
  const getColorForOntology = (ontology) => {
    const colorMap = {
      "BP": "#ff4d4f",
      "CC": "#1890ff",
      "MF": "#52c41a",
      "HPO": "#faad14",
      "KEGG": "#722ed1",
    };
    return colorMap[ontology] || "#13c2c2";
  };

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
          const index = params[0].dataIndex;
          const description = allDescriptions[index] || "";
          const id = allIds[index] || "";
          
          let result = `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px;">
            ${description} (${id})
          </div>`;
          
          params.forEach(param => {
            if (param.value > 0) {
              const ontology = param.seriesName;
              const dataItem = chartData.find(item => 
                item.description === description && 
                item.ontology === ontology,
              );
              
              if (dataItem) {
                result += `
                  <div style="line-height: 1.4; margin-bottom: 4px;">
                    <span style="color: ${param.color}; font-weight: bold;">${ontology}:</span><br/>
                    基因数量: ${param.value}<br/>
                    P值: ${dataItem.pvalue || "N/A"}<br/>
                    富集倍数: ${dataItem.fold_enrichment || "N/A"}
                  </div>
                `;
              }
            }
          });
          
          const totalCount = params.reduce((sum, param) => sum + param.value, 0);
          
          result += `<div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #eee; font-weight: bold;">
            总计基因数: ${totalCount}
          </div>`;
          
          return result;
        },
      },
      legend: showLegend ? {
        data: ontologies,
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
        nameTextStyle: {
          fontSize: 10,
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
        name: "",
        nameLocation: "end",
        nameTextStyle: {
          align: "center",
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
          // 显示ID
          formatter: function(value, index) {
            const id = allIds[index] || "";
            return id;
          },
          interval: 0,
        },
        boundaryGap: [0.1, 0.1],
        offset: 0,
        z: 10,
        data: allDescriptions, // 内部仍然使用descriptions进行映射
      },
      series: ontologies.map(ontology => ({
        name: ontology,
        type: "bar",
        stack: "total",
        data: seriesData[ontology] || [],
        itemStyle: {
          color: getColorForOntology(ontology),
          opacity: 0.8,
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 10,
            shadowColor: `rgba(${parseInt(getColorForOntology(ontology).slice(1, 3), 16)}, ${parseInt(getColorForOntology(ontology).slice(3, 5), 16)}, ${parseInt(getColorForOntology(ontology).slice(5, 7), 16)}, 0.5)`,
          },
        },
        label: {
          show: true,
          position: "insideLeft",
          verticalAlign: "middle",
          align: "left",
          color: "#000",
          fontSize: 10,
          formatter: function(params) {
            if (params.data.value > 0) {
              const description = params.data.description;
              // 限制显示长度，避免文字溢出
              if (description.length > 50) {
                return description.substring(0, 50) + "...";
              }
              return description;
            }
            return "";
          },
        },
      })),
    };
  }, [chartData, ontologies, seriesData, allDescriptions, allIds, title, showLegend]);

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