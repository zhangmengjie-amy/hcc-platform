import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Card } from "antd";

const HeatmapChart = ({ data, height = 600 }) => {
  const chartData = useMemo(() => {
    if (!data || !data.Heatmap_Body || data.Heatmap_Body.length === 0) {
      return null;
    }

    // 1. 按terms_order排序纵坐标
    const sortedTerms = [...data.terms_order_name].sort(
      (a, b) => a.terms_order - b.terms_order,
    );

    // 2. 获取所有唯一的TMEcluster并排序
    const uniqueClusters = [
      ...new Set(data.sampleid_order_name.map((item) => item.TMEcluster)),
    ];

    // 3. 为每个TMEcluster创建独立的数据集
    const clusterData = {};
    const clusterSamples = {};
    const clusterSampleIds = {};

    // 初始化每个cluster的数据结构
    uniqueClusters.forEach((cluster) => {
      clusterData[cluster] = [];
      clusterSamples[cluster] = [];
    });

    // 4. 按TMEcluster分组样本数据
    uniqueClusters.forEach((cluster) => {
      // 获取该cluster的所有样本，按sampleid_order排序
      const samples = data.sampleid_order_name
        .filter((item) => item.TMEcluster === cluster)
        .sort((a, b) => a.sampleid_order - b.sampleid_order);

      clusterSamples[cluster] = samples;
      clusterSampleIds[cluster] = samples.map((s) => s.sampleid_order);
    });

    // 5. 为每个cluster构建热图数据
    uniqueClusters.forEach((cluster) => {
      const sampleIds = clusterSampleIds[cluster];

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
            clusterData[cluster].push([
              sampleIndex, // 该cluster内的x索引
              termIndex, // 全局的y索引
              parseFloat(point.value),
            ]);
          } else {
            // 如果没有数据，填充0
            clusterData[cluster].push([sampleIndex, termIndex, 0]);
          }
        });
      });
    });

    // 6. 计算全局数据范围

    const absMax = 3; // 至少3

    return {
      termNames: sortedTerms.map((term) => term.terms),
      clusterData,
      clusterSamples,
      uniqueClusters,
      absMax,
      totalTerms: sortedTerms.length,
    };
  }, [data]);

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

    const { termNames, clusterData, clusterSamples, uniqueClusters, absMax } =
      chartData;

    // 1. 计算每个cluster的宽度和位置
    const clusterConfigs = {};
    let currentXOffset = 0;

    uniqueClusters.forEach((cluster, clusterIndex) => {
      const sampleCount = clusterSamples[cluster].length;
      const width = sampleCount; // 每个样本占1个单位宽度

      clusterConfigs[cluster] = {
        xOffset: currentXOffset,
        width,
        sampleCount,
        clusterIndex,
      };

      currentXOffset += width + 5; // +1是为了cluster之间的间隔
    });

    // 2. 构建所有series数据（每个cluster一个独立的系列）
    const series = [];

    uniqueClusters.forEach((cluster) => {
      const config = clusterConfigs[cluster];
      const clusterXOffset = config.xOffset;

      // 转换该cluster的数据，调整x坐标加上偏移量
      const clusterSeriesData = clusterData[cluster].map(([x, y, value]) => {
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
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 5,
            shadowColor: "rgba(0, 0, 0, 0.3)",
          },
        },
      });
    });

    // 5. 构建x轴数据（不显示标签，但需要正确的位置）
    const totalSamples = Object.values(clusterSamples).reduce(
      (sum, samples) => sum + samples.length,
      0,
    );

    const xAxisData = Array(totalSamples + uniqueClusters.length - 1).fill(""); // 全部为空字符串，不显示标签

    // 6. 构建完整的echarts配置
    const option = {
      title: {
        text: data.title || "Heatmap",
        left: "center",
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      tooltip: {
        position: "top",
        formatter: function (params) {
          const value = params.value[2];
          const x = params.value[0];
          const y = params.value[1];
          const term = termNames[y];

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
              sampleIndexInCluster = x - config.xOffset;
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
        top: 60, // 为标题和cluster标题留空间
        bottom: 20,
        left: 120, // 为纵坐标标签留空间
        right: 80, // 为visualMap留空间
      },
      xAxis: {
        type: "category",
        data: xAxisData,
        axisLabel: {
          show: false, // 不显示横坐标标签
          fontSize: 12,
          color: "#333",
          fontWeight: "bold",
          formatter: function (value, index) {
            // 在每个cluster的第一个位置显示cluster名称
            for (const cluster of uniqueClusters) {
              const config = clusterConfigs[cluster];
              if (index === config.xOffset) {
                return cluster; // 返回TME1, TME2, TME3
              }
            }
            return ""; // 其他位置不显示
          },
        },
        axisTick: {
          show: false, // 不显示刻度
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
      },
      yAxis: {
        type: "category",
        data: termNames,
        axisLabel: {
          fontSize: 11,
          color: "#333",
          width: 100, // 固定宽度
          overflow: "truncate", // 超出截断
          ellipsis: "...", // 显示省略号
          interval: 0, // 显示所有标签
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
          lineStyle: {
            type: "dashed",
            color: "#eee",
          },
        },
      },
      visualMap: {
        min: -absMax,
        max: absMax,
        calculable: true,
        orient: "vertical",
        left: "right",
        top: "middle",
        itemWidth: 15,
        itemHeight: 200,
        inRange: {
          color: [
            "navy", // 深蓝 (-3)
            "#ffffff", // 白色 (0)
            "firebrick", // 红色 (+3)
          ],
        },
        textStyle: {
          color: "#666",
          fontSize: 11,
        },
      },
      series: series,
    };

    return option;
  };

  if (!data) {
    return (
      <Card
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>No data available</div>
      </Card>
    );
  }

  return (
    <Card
      style={{
        height,
        borderRadius: 4,
        border: "1px solid #e8e8e8",
      }}
      bodyStyle={{
        padding: 16,
        height: "100%",
      }}
    >
      <ReactECharts
        option={getOption()}
        style={{ width: "100%", height: "100%" }}
        notMerge={true}
        lazyUpdate={true}
        opts={{ renderer: "svg" }}
      />
    </Card>
  );
};

export default HeatmapChart;
