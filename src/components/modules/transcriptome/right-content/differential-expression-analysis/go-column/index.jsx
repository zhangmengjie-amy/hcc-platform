import React, { useState, useEffect, useMemo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { useTranslation } from "react-i18next";
import { Button, Dropdown, Flex } from "antd";
import { DownloadOutlined, DownOutlined } from "@ant-design/icons";

const GoBarChart = ({
  data = [],
  width = "100%",
  height = "800px",
  loadingText = "加载中...",
  errorText = "加载失败",
  title = "",
  showLegend = true,
}) => {
  const [chartData, setChartData] = useState(data);
  const [loading, setLoading] = useState(!data?.length);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const chartRef = useRef(null);

  // 如果有外部传入的 data，直接使用
  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
      setLoading(false);
    }
  }, [data]);

  // 使用 useMemo 优化数据处理
  const { ontologies, allIds, allDescriptions, allGeneRatios, seriesData } =
    useMemo(() => {
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
      const uniqueOntologies = [
        ...new Set(chartData.map((item) => item.ontology).filter(Boolean)),
      ];

      // 获取所有唯一的ID（按description分组，实际上应该是按description获取对应的id）
      const uniqueDescriptions = [
        ...new Set(chartData.map((item) => item.description).filter(Boolean)),
      ];

      // 获取每个description对应的id和geneRatio
      const descriptionMap = {};
      chartData.forEach((item) => {
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
      uniqueOntologies.forEach((ontology) => {
        seriesData[ontology] = uniqueDescriptions.map((description) => {
          const item = chartData.find(
            (d) => d.description === description && d.ontology === ontology,
          );
          return {
            value: item ? (item.count ?? 0) : 0,
            description: description,
            id: descriptionMap[description]?.id || "",
            geneRatio: descriptionMap[description]?.geneRatio || "",
          };
        });
      });

      return {
        ontologies: uniqueOntologies,
        allIds: uniqueDescriptions.map(
          (desc) => descriptionMap[desc]?.id || "",
        ),
        allDescriptions: uniqueDescriptions,
        allGeneRatios: uniqueDescriptions.map(
          (desc) => descriptionMap[desc]?.geneRatio || "",
        ),
        seriesData,
      };
    }, [chartData]);

  // 为不同ontology分配颜色
  const getColorForOntology = (ontology) => {
    const colorMap = {
      BP: "#ff4d4f",
      CC: "#1890ff",
      MF: "#52c41a",
      HPO: "#faad14",
      KEGG: "#722ed1",
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
        top: "10%",
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

          let result = `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            ${description}
          </div>`;

          params.forEach((param) => {
            if (param.value > 0) {
              const ontology = param.seriesName;
              const dataItem = chartData.find(
                (item) =>
                  item.description === description &&
                  item.ontology === ontology,
              );

              if (dataItem) {
                result += `
                  <div style="line-height: 1.4; margin-bottom: 4px;">
                    Ontology: <span style="color: ${param.color}; font-weight: bold;">${ontology}</span><br/>
                    ID: <span style="font-weight: bold;">${id}</span><br/>
                    Gene Count: <span style="font-weight: bold;">${param.value}</span><br/>
                  </div>
                `;
              }
            }
          });

          return result;
        },
      },
      legend: showLegend
        ? {
          data: ontologies,
          top: 40,
          textStyle: {
            fontSize: 14,
          },
          itemWidth: 12,
          itemHeight: 12,
          icon: "rect",
        }
        : { show: false },
      xAxis: {
        name: `${t("common:geneCount")} (Count)`,
        nameLocation: "middle",
        nameGap: "25",
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
          formatter: function (value, index) {
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
      series: ontologies.map((ontology) => ({
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
          formatter: function (params) {
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
  }, [
    chartData,
    ontologies,
    seriesData,
    allDescriptions,
    allIds,
    title,
    showLegend,
  ]);

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
        {t("common:noData")}
      </div>
    );
  }

  const handleExport = (type) => {
    if (!chartRef.current) return;

    try {
      const echartsInstance = chartRef.current.getEchartsInstance();

      // 构建导出配置
      const exportConfig = {
        type,
        pixelRatio: 2,
        excludeComponents: ["toolbox"],
      };

      // 只为JPG格式设置白色背景
      if (type === "jpg") {
        exportConfig.backgroundColor = "#ffffff";
      }

      // 获取数据URL
      const dataUrl = echartsInstance.getDataURL(exportConfig);

      // 创建下载链接
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${data?.title || "GO Column"}.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {/* <Dropdown
        menu={{
          items: [
            {
              key: "png",
              label: "PNG",
              onClick: () => handleExport("png"),
            },
            {
              key: "jpg",
              label: "JPG",
              onClick: () => handleExport("jpg"),
            },
            {
              key: "svg",
              label: "SVG",
              onClick: () => handleExport("svg"),
            },
          ],
        }}
      >
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          style={{ marginRight: "20px" }}
        >
          {t("common:export")} <DownOutlined />
        </Button>
      </Dropdown> */}
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ width, height }}
        opts={{
          renderer: "svg",
          useDirtyRect: true,
        }}
      />
    </div>
  );
};

export default GoBarChart;
