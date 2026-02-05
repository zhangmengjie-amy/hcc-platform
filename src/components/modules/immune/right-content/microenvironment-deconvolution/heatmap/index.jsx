import React, { useMemo, useCallback, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Card, Button, Dropdown, Menu, Typography } from "antd";
import { DownloadOutlined, DownOutlined } from "@ant-design/icons";
import { download } from "@/configs/request";
import { t } from "i18next";

const HeatmapChart = ({ params, data, cellSize = 10, heightPadding = 150 }) => {
  const chartRef = useRef(null);

  const { chartData, dynamicHeight, clusterColors, clusterValues } =
    useMemo(() => {
      if (!data || !data.Heatmap_Body || data.Heatmap_Body.length === 0) {
        return {
          chartData: null,
          dynamicHeight: 400,
          clusterColors: {},
          clusterValues: {},
        };
      }

      // 1. 按terms_order排序纵坐标
      const sortedTerms = [...data.terms_order_name].sort(
        (a, b) => a.terms_order - b.terms_order,
      );

      // 2. 获取所有唯一的TMEcluster并按照数字排序（TME1, TME2, TME3...）
      const uniqueClusters = [
        ...new Set(data.sampleid_order_name.map((item) => item.TMEcluster)),
      ].sort((a, b) => {
        // 提取数字部分进行排序
        const numA = parseInt(a.replace(/\D/g, "")) || 0;
        const numB = parseInt(b.replace(/\D/g, "")) || 0;
        return numA - numB;
      });

      // 3. 为每个cluster分配不同的颜色和数值
      const colorPalette = [
        "#FF6B6B", // 红色 - TME1
        "#4ECDC4", // 青色 - TME2
        "#FFD166", // 黄色 - TME3
        "#06D6A0", // 绿色
        "#118AB2", // 蓝色
        "#073B4C", // 深蓝色
        "#EF476F", // 粉色
        "#FF9A00", // 橙色
        "#7209B7", // 紫色
        "#3A86FF", // 亮蓝色
      ];

      const clusterColors = {};
      const clusterValues = {}; // 为每个cluster分配一个数值，用于visualMap映射
      uniqueClusters.forEach((cluster, index) => {
        clusterColors[cluster] = colorPalette[index % colorPalette.length];
        clusterValues[cluster] = index + 1; // 从1开始，TME1=1, TME2=2, TME3=3
      });

      // 4. 按照cluster分组，并按照sampleid_order排序
      const clusterSamples = {};
      const clusterData = {};

      // 初始化数据结构
      uniqueClusters.forEach((cluster) => {
        clusterSamples[cluster] = [];
        clusterData[cluster] = [];
      });

      // 5. 按cluster分组并排序
      uniqueClusters.forEach((cluster) => {
        // 获取该cluster的所有样本，按sampleid_order从小到大排序
        const samples = data.sampleid_order_name
          .filter((item) => item.TMEcluster === cluster)
          .sort((a, b) => a.sampleid_order - b.sampleid_order);

        clusterSamples[cluster] = samples;
      });

      // 6. 为每个cluster构建热图数据
      uniqueClusters.forEach((cluster) => {
        const samples = clusterSamples[cluster];
        const sampleIds = samples.map((s) => s.sampleid_order);

        sortedTerms.forEach((term, termIndex) => {
          const termName = term.terms;

          sampleIds.forEach((sampleId, sampleIndex) => {
            // 查找对应的数据点
            const point = data.Heatmap_Body.find(
              (item) =>
                item.terms === termName &&
                item.sampleid_order === sampleId &&
                item.TMEcluster === cluster,
            );

            if (point) {
              // y+1：为cluster行留出位置，热图数据从第二行开始
              clusterData[cluster].push([
                sampleIndex, // 该cluster内的x索引
                termIndex + 1, // 全局的y索引，+1为cluster行留位置
                parseFloat(point.value),
              ]);
            } else {
              // 如果没有数据，填充0
              clusterData[cluster].push([sampleIndex, termIndex + 1, 0]);
            }
          });
        });
      });

      // 7. 计算动态高度：基于cellSize和术语数量 + 1行cluster条
      const totalTerms = sortedTerms.length;
      const dynamicHeight = (totalTerms + 1) * cellSize + heightPadding; // +1 为新增的cluster行

      return {
        chartData: {
          termNames: sortedTerms.map((term) => term.terms),
          clusterData,
          clusterSamples,
          uniqueClusters,
          clusterValues,
          absMax: 3, // 至少3
          totalTerms: sortedTerms.length,
        },
        dynamicHeight,
        clusterColors,
        clusterValues,
      };
    }, [data, cellSize, heightPadding]);

  // 使用ECharts的getDataURL方法实现导出
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
      link.download = `${data?.title || "heatmap"}.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const exportMenu = (
    <Menu onClick={({ key }) => handleExport(key)}>
      <Menu.Item key="png">PNG</Menu.Item>
      <Menu.Item key="jpg">JPG</Menu.Item>
      <Menu.Item key="svg">SVG</Menu.Item>
    </Menu>
  );

  const getOption = () => {
    if (!chartData) {
      return {
        title: {
          text: data?.title || "Heatmap",
          left: "center",
        },
        xAxis: {},
        yAxis: {},
        series: [],
      };
    }

    const {
      termNames,
      clusterData,
      clusterSamples,
      uniqueClusters,
      clusterValues,
      absMax,
    } = chartData;

    // 1. 计算每个cluster的宽度和位置（保持cluster排序）
    const clusterConfigs = {};
    let currentXOffset = 0;

    uniqueClusters.forEach((cluster) => {
      const sampleCount = clusterSamples[cluster].length;
      const width = sampleCount; // 每个样本占1个单位宽度

      clusterConfigs[cluster] = {
        xOffset: currentXOffset,
        width,
        sampleCount,
        clusterValue: clusterValues[cluster], // cluster的数值（1,2,3...）
      };

      // cluster之间的间隔
      currentXOffset += width + 1;
    });

    // 2. 构建所有series数据
    const series = [];

    // 2.1 创建cluster颜色条的数据（第一行，y=0）
    const clusterBarData = [];
    uniqueClusters.forEach((cluster) => {
      const config = clusterConfigs[cluster];
      const clusterXOffset = config.xOffset;
      const sampleCount = config.sampleCount;

      // 为cluster的每个样本创建颜色数据，放在第一行（y=0）
      for (let i = 0; i < sampleCount; i++) {
        // 第一行，y坐标为0，值为cluster的数值
        clusterBarData.push([i + clusterXOffset, 0, config.clusterValue]);
      }
    });

    // 2.2 添加cluster颜色条系列
    series.push({
      name: "cluster_bar",
      type: "heatmap",
      data: clusterBarData,
      label: {
        show: false,
      },
      itemStyle: {
        borderColor: "#fff",
        borderWidth: 0,
      },
      // 设置较小的层叠顺序
      z: 1,
      // 设置tooltip不显示
      silent: true,
    });

    // 2.3 添加热图数据（从第二行开始，y>=1）
    uniqueClusters.forEach((cluster) => {
      const config = clusterConfigs[cluster];
      const clusterXOffset = config.xOffset;
      const dataPoints = clusterData[cluster];

      // 转换该cluster的数据，y从1开始（第二行）
      const clusterSeriesData = dataPoints.map(([x, y, value]) => {
        return [x + clusterXOffset, y, value];
      });

      // 添加该cluster的热图系列
      series.push({
        name: cluster,
        type: "heatmap",
        data: clusterSeriesData,
        label: {
          show: false,
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 0,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 5,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
        },
        // 设置较高的层叠顺序，确保在上层
        z: 2,
      });
    });

    // 3. 构建x轴数据
    const totalSamples = Object.values(clusterSamples).reduce(
      (sum, samples) => sum + samples.length,
      0,
    );

    const xAxisData = Array(totalSamples + uniqueClusters.length - 1).fill("");

    // 4. 构建y轴数据，第一行是cluster条，后面是terms
    const yAxisData = ["Cluster", ...termNames];

    // 5. 为cluster颜色条创建独立的visualMap
    const clusterColorRange = uniqueClusters.map(
      (cluster) => clusterColors[cluster],
    );

    // 6. 构建完整的echarts配置
    const option = {
      title: {
        text: "",
        left: "center",
        top: 0,
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      // 添加图例（legend）显示cluster颜色
      legend: {
        show: true,
        type: "scroll",
        orient: "horizontal",
        top: 0,
        right: 30,
        itemWidth: 20,
        itemHeight: 10,
        textStyle: {
          fontSize: 12,
          color: "#000",
          alignItems: "right",
          margin: 0,
        },
        formatter: function (name) {
          // 只显示cluster的图例，不显示cluster_bar
          if (name === "cluster_bar") {
            return "";
          }
          return name;
        },
        data: uniqueClusters.map((cluster) => ({
          name: cluster,
          itemStyle: {
            color: clusterColors[cluster],
          },
          // 设置图例项不可点击（因为热图数据已经按cluster分开了）
          inactiveColor: clusterColors[cluster],
          icon: "rect",
        })),
      },
      tooltip: {
        position: "top",
        formatter: function (params) {
          // 如果是cluster颜色条，不显示tooltip
          if (params.seriesName === "cluster_bar") {
            return "";
          }

          const value = params.value[2];
          const x = params.value[0];
          const y = params.value[1]; // y从1开始（第一行是cluster）

          // 检查y索引是否有效（y=0是cluster行，y>=1是数据行）
          if (y < 1 || y - 1 >= termNames.length) {
            return "";
          }

          const term = termNames[y - 1]; // y-1 获取对应的术语

          // 确定属于哪个cluster
          let currentCluster = "";
          let sampleIndexInCluster = 0;

          for (const cluster of uniqueClusters) {
            const config = clusterConfigs[cluster];
            if (
              x >= config.xOffset &&
              x < config.xOffset + config.sampleCount
            ) {
              currentCluster = cluster;
              sampleIndexInCluster = Math.floor(x - config.xOffset);
              break;
            }
          }

          // 获取样本ID
          const sampleId =
            clusterSamples[currentCluster]?.[sampleIndexInCluster]
              ?.sampleid_order || "";

          const color = value >= 0 ? "#d73027" : "#313695";
          return `
            <div style="font-weight: bold; color: ${color}">${term}</div>
            <div>Cluster: ${currentCluster}</div>
            <div>Sample: S${sampleId}</div>
            <div>Value: ${Number(value).toFixed(4)}</div>
          `;
        },
      },
      grid: {
        top: 30, // 为标题、toolbox和图例留空间
        bottom: 10, // 增加底部空间
        left: 10, // 为纵坐标标签留空间
        right: 30, // 为visualMap留空间
        containLabel: true, // 确保标签包含在grid内
      },
      xAxis: {
        type: "category",
        data: xAxisData,
        axisLabel: {
          show: false, // 显示横坐标标签
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#ccc",
          },
        },
        splitLine: {
          show: false,
        },
        boundaryGap: true,
      },
      yAxis: {
        type: "category",
        data: yAxisData,
        inverse: true,
        axisLabel: {
          fontSize: 10,
          color: "#333",
          width: 100,
          overflow: "truncate",
          ellipsis: "...",
          interval: 0,
          formatter: function (value, index) {
            // 第一行显示"Cluster"
            if (index === 0) return "Cluster";
            return termNames[index - 1];
          },
        },
      },
      visualMap: [
        // 热图的visualMap（显示在右侧）
        {
          min: -absMax,
          max: absMax,
          orient: "vertical",
          left: "right",
          top: "center",
          itemWidth: 15,
          itemHeight: 150,
          inRange: {
            color: [
              "navy", // 深蓝 (-3)
              "#f9e9cd",
              "firebrick", // 红色 (+3)
            ],
          },
          hoverLink: true,
          calculable: false,
          text: [`+${absMax}`, `-${absMax}`],
          textStyle: {
            color: "#666",
            fontSize: 11,
            fontWeight: "bold",
            backgroundColor: "#fff",
            padding: [2, 4],
            borderRadius: 3,
          },
          textAlign: "left",
          textVerticalAlign: "top",
          textGap: 5,
          padding: [5, 0],
          formatter: function (value) {
            if (Math.abs(value - absMax) < 0.01) {
              return `+${absMax}`;
            }
            if (Math.abs(value - -absMax) < 0.01) {
              return `-${absMax}`;
            }
            return value.toFixed(2);
          },
          // 只应用于热图系列（排除cluster_bar）
          seriesIndex: series.slice(1).map((s, i) => i + 1), // 从第二个series开始都是热图
        },
        // cluster颜色条的visualMap（隐藏）
        {
          show: false, // 不显示这个visualMap
          min: 1,
          max: uniqueClusters.length,
          calculable: false,
          inRange: {
            color: clusterColorRange,
          },
          // 只应用于cluster_bar系列（第一个series）
          seriesIndex: [0],
        },
      ],
      series: series,
    };

    return option;
  };

  if (!data) {
    return (
      <Card
        style={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>No data available</div>
      </Card>
    );
  }

  // utils/downloadUtils.ts
  const downloadBase64CSV = (base64String, filename = "data.csv") => {
    try {
      // Base64解码
      const binaryString = window.atob(base64String);

      // 转换为Blob
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "text/csv;charset=utf-8;" });

      // 创建下载链接
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = filename;
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error("Base64解码失败:", error);
      return false;
    }
  };

  const downloadCSV = useCallback(async () => {
    try {
      // 调用后端接口获取CSV数据
      const response = await download(params);

      if (response.code == 200) {
        downloadBase64CSV(response?.data?.csvContent, response?.data?.fileName);
      }
    } catch (error) {
      console.error("下载失败:", error);
      // message.error("下载失败");
    }
  }, [params]);

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
          minHeight: dynamicHeight,
        },
      }}
    >
      {/* 使用自定义导出按钮 */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Typography.Title
          level={3}
          style={{ textAlign: "center", marginBottom: 0 }}
        >
          {data.title ?? "Heatmap"}
        </Typography.Title>
        <div style={{ position: "absolute", top: 0, right: 30 }}>
          <Dropdown
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
            <Button type="primary" icon={<DownloadOutlined />}>
              导出 <DownOutlined />
            </Button>
          </Dropdown>
          <Button type="primary" onClick={downloadCSV} style={{ marginLeft: 10 }}>
            {t("common:downloadCSV")}
          </Button>
        </div>
      </div>

      <ReactECharts
        ref={chartRef}
        option={getOption()}
        style={{ width: "100%", height: dynamicHeight }}
        notMerge
        lazyUpdate
        opts={{ renderer: "svg" }}
      />
    </Card>
  );
};

export default HeatmapChart;
