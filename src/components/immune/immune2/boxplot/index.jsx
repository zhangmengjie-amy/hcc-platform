import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Row, Col, Card, Typography } from "antd";

const { Title } = Typography;

const BoxplotChart = ({ data, height = 600 }) => {
  const boxplotData = useMemo(() => {
    if (!data || !data.Heatmap_Body || data.Heatmap_Body.length === 0) {
      return null;
    }

    // 1. 按terms_order排序
    const sortedTerms = [...data.terms_order_name].sort(
      (a, b) => a.terms_order - b.terms_order,
    );

    // 2. 获取所有唯一的TMEcluster
    const uniqueClusters = [
      ...new Set(data.sampleid_order_name.map((item) => item.TMEcluster)),
    ];

    // 3. 构建数据结构：每个term在不同cluster下的原始value数组
    const termClusterData = {};

    // 初始化数据结构
    sortedTerms.forEach((term) => {
      termClusterData[term.terms] = {};
      uniqueClusters.forEach((cluster) => {
        termClusterData[term.terms][cluster] = [];
      });
    });

    // 填充原始数据
    data.Heatmap_Body.forEach((item) => {
      const term = item.terms;
      const cluster = item.TMEcluster;
      const value = parseFloat(item.value);

      if (
        termClusterData[term] &&
        termClusterData[term][cluster] !== undefined
      ) {
        termClusterData[term][cluster].push(value);
      }
    });

    // 构建每个term的统计信息
    const termStats = sortedTerms.map((term) => {
      const termName = term.terms;
      const clusterData = uniqueClusters.map((cluster) => {
        const values = termClusterData[termName][cluster] || [];

        if (values.length === 0) {
          return {
            cluster,
            values: [],
            outliers: [],
            stats: {
              min: 0,
              q1: 0,
              median: 0,
              q3: 0,
              max: 0,
              iqr: 0,
              lowerWhisker: 0,
              upperWhisker: 0,
              count: 0,
            },
          };
        }

        // 排序并计算统计值
        const sortedValues = [...values].sort((a, b) => a - b);
        const q1 = calculatePercentile(sortedValues, 25);
        const median = calculatePercentile(sortedValues, 50);
        const q3 = calculatePercentile(sortedValues, 75);
        const iqr = q3 - q1;

        // 计算须线范围（正常值范围）
        const lowerWhisker = q1 - 1.5 * iqr;
        const upperWhisker = q3 + 1.5 * iqr;

        // 找出异常值（超出须线范围的点）
        const outliers = [];
        const normalValues = [];

        sortedValues.forEach((value) => {
          if (value < lowerWhisker || value > upperWhisker) {
            outliers.push(value);
          } else {
            normalValues.push(value);
          }
        });

        // 计算min和max（基于正常值）
        const min =
          normalValues.length > 0 ? Math.min(...normalValues) : lowerWhisker;
        const max =
          normalValues.length > 0 ? Math.max(...normalValues) : upperWhisker;

        return {
          cluster,
          values: normalValues, // 正常值
          outliers: outliers, // 异常值
          stats: {
            min,
            q1,
            median,
            q3,
            max,
            iqr,
            lowerWhisker,
            upperWhisker,
            count: values.length,
            outlierCount: outliers.length,
          },
        };
      });

      return {
        term: termName,
        clusterData,
      };
    });

    // 辅助函数：计算百分位数
    function calculatePercentile(sortedArr, percentile) {
      if (sortedArr.length === 0) return 0;
      const index = (percentile / 100) * (sortedArr.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);

      if (lower === upper) {
        return sortedArr[lower];
      }

      const weight = index - lower;
      return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
    }

    return {
      termStats,
      uniqueClusters,
      sortedTerms,
    };
  }, [data]);

  // 生成单个term的箱体图option
  const getTermOption = (termData, termName) => {
    const { clusterData } = termData;

    // 准备箱体图数据
    const boxplotSeriesData = [];
    const outlierSeriesData = [];
    const categories = [];

    clusterData.forEach((item, index) => {
      const cluster = item.cluster;
      const stats = item.stats;

      categories.push(cluster);

      if (stats.count > 0) {
        // 箱体图数据：[min, Q1, median, Q3, max]
        boxplotSeriesData.push([
          stats.min,
          stats.q1,
          stats.median,
          stats.q3,
          stats.max,
        ]);

        // 异常值数据
        item.outliers.forEach((outlier) => {
          outlierSeriesData.push([index, outlier]);
        });
      } else {
        boxplotSeriesData.push([0, 0, 0, 0, 0]);
      }
    });

    return {
      backgroundColor: "#EBEBEB", // 灰色背景色
      title: {
        top: 10,
        text: termName,
        left: "center",
        textStyle: {
          fontSize: 12,
          fontWeight: "bold",
          color: "#333",
        },
      },
      tooltip: {
        trigger: "item",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#ddd",
        borderWidth: 1,
        textStyle: {
          color: "#333",
        },
        formatter: function (params) {
          if (params.seriesType === "scatter") {
            const cluster = categories[params.value[0]];
            const value = params.value[1];
            return `
              <div style="font-weight: bold; margin-bottom: 5px;">${cluster} - Outlier</div>
              <div style="margin: 2px 0;">Value: ${formatValue(value)}</div>
            `;
          } else if (params.seriesType === "boxplot") {
            const index = params.dataIndex;
            const cluster = categories[index];
            const stats = clusterData[index].stats;

            if (stats.count === 0) {
              return `<div style="font-weight: bold;">${cluster}</div><div>No data</div>`;
            }

            return `
              <div style="font-weight: bold; margin-bottom: 5px;">${cluster}</div>
              <div style="margin: 2px 0;">Min: ${formatValue(stats.min)}</div>
              <div style="margin: 2px 0;">Q1: ${formatValue(stats.q1)}</div>
              <div style="margin: 2px 0; font-weight: bold;">Median: ${formatValue(stats.median)}</div>
              <div style="margin: 2px 0;">Q3: ${formatValue(stats.q3)}</div>
              <div style="margin: 2px 0;">Max: ${formatValue(stats.max)}</div>
              <div style="margin: 2px 0;">IQR: ${formatValue(stats.iqr)}</div>
              <div style="margin: 2px 0;">Total: ${stats.count}</div>
              <div style="margin: 2px 0; color: #ee6666;">Outliers: ${stats.outlierCount}</div>
            `;
          }
          return "";
        },
      },
      grid: {
        left: 10,
        right: 10,
        bottom: 10,
        top: 50,
        backgroundColor: "#fff", // 图表区域白色背景
        borderColor: "#ddd",
        borderWidth: 1,
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowBlur: 4,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: categories,
        axisLabel: {
          fontSize: 10,
          color: "#333",
          fontWeight: "bold",
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          lineStyle: {
            color: "#fff", // 白色刻度线
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#fff", // 白色坐标轴线
          },
        },
        splitLine: {
          show: true, // 显示横坐标网格线
          lineStyle: {
            color: "#fff", // 白色网格线
            width: 1,
            type: "solid",
          },
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          fontSize: 10,
          color: "#333",
          formatter: formatValue,
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: "#fff", // 白色刻度线
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: "#fff", // 白色坐标轴线
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "solid", // 实线
            color: "#fff", // 白色网格线
            width: 1,
          },
        },
        scale: true,
      },
      series: [
        {
          name: "Boxplot",
          type: "boxplot",
          data: boxplotSeriesData,
          // 箱体图配置
          itemStyle: {
            // 箱体颜色
            color: "#F8766D",
            // 箱体边框
            borderColor: "#333",
            borderWidth: 2,
          },
          // 中位线配置
          lineStyle: {
            color: "#333",
            width: 2,
          },
          // 确保显示所有元素
          showAllSymbol: true,
        },
        // 异常值散点图
        {
          name: "Outliers",
          type: "scatter",
          data: outlierSeriesData,
          symbolSize: 6,
          itemStyle: {
            color: function (params) {
              const clusterIndex = params.value[0];
              const colors = ["#F8766D", "#00BA38", "#619CFF"];
              return colors[clusterIndex] || "#000";
            },
            borderColor: "#333",
            borderWidth: 1,
          },
        },
      ],
    };
  };

  // 辅助函数：格式化数值显示
  function formatValue(value) {
    if (value === 0) return "0";
    const absValue = Math.abs(value);
    if (absValue < 0.001 || absValue >= 1000) {
      return value.toExponential(2);
    }
    if (absValue < 0.01) {
      return value.toFixed(6);
    }
    if (absValue < 0.1) {
      return value.toFixed(5);
    }
    if (absValue < 1) {
      return value.toFixed(4);
    }
    if (absValue < 10) {
      return value.toFixed(3);
    }
    if (absValue < 100) {
      return value.toFixed(2);
    }
    return value.toFixed(1);
  }

  if (!boxplotData) {
    return (
      <Card
        style={{
          height: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>No data available for boxplot</div>
      </Card>
    );
  }

  const { termStats } = boxplotData;

  return (
    <Card
      style={{
        borderRadius: 4,
        border: "1px solid #e8e8e8",
      }}
      bodyStyle={{
        padding: 5,
        height: "100%",
      }}
    >
      <Row gutter={[10, 10]}>
        {termStats.map((item, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card
              style={{
                height: 300,
                borderRadius: 8,
              }}
              bodyStyle={{ padding: 0, height: "100%" }}
            >
              <div style={{ height: "100%" }}>
                <div style={{ height: "100%" }}>
                  <ReactECharts
                    option={getTermOption(item, item.term)}
                    style={{ width: "100%", height: "100%" }}
                    notMerge={true}
                    lazyUpdate={true}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default BoxplotChart;
