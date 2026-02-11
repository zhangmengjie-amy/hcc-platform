import React, { useMemo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Button, Dropdown, Flex } from "antd";
import { DownloadOutlined, DownOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const VolcanoPlot = ({
  data = [],
  width = "100%",
  height = "600px",
  title = "Volcano Plot of Differential Gene Expression",
}) => {
  // 计算显著性阈值线
  const { t } = useTranslation();
  const chartRef = useRef(null);
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

    data?.forEach((item) => {
      const point = {
        name: item.geneName,
        value: [item.logFC, item["log10AdjPVal"]],
        itemStyle: {
          color: COLOR_MAP[item.significance] || COLOR_MAP["Not Significant"],
        },
        significance: item.significance ?? "Not Significant",
        logFC: item.logFC,
      };

      all.push(point);

      // 只对显著性的点标记需要显示标签
      if (
        item.significance === "UP Significant" ||
        item.significance === "DOWN Significant"
      ) {
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
  const option = useMemo(
    () => ({
      animation: false,
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
          data: allData.filter(
            (item) => item.significance === "Not Significant",
          ),
          symbolSize: 4,
          itemStyle: {
            color: COLOR_MAP["Not Significant"],
          },
        },
        // 2. UP Significant 系列（带标签）
        {
          type: "scatter",
          name: "UP Significant",
          data: significantData.filter(
            (item) => item.significance === "UP Significant",
          ),
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
          },
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
          data: significantData.filter(
            (item) => item.significance === "DOWN Significant",
          ),
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
          blur: {
            label: {
              show: false,
            },
          },
          z: 5,
        },
        // 4. 参考线系列
        ...[-1, 1].map((xValue) => ({
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
    }),
    [data, allData, significantData, title, significanceThreshold],
  );

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
      link.download = `${data?.title || "volcano"}.${type}`;
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
        onEvents={{
          rendered: () => {},
          click: (params) => {
            if (params.componentType === "series") {
              console.log("Gene clicked:", params.name);
            }
          },
        }}
      />
    </div>
  );
};

export default VolcanoPlot;
