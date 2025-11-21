import React, { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const GoBarChart = ({
  data = [],
  width = '100%',
  height = '600px',
  loadingText = '加载中...',
  errorText = '加载失败',
  title = 'GO 富集分析堆叠柱状图',
  showLegend = true
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
  const { bpData, ccData, allDescriptions } = useMemo(() => {
    if (!chartData?.length) {
      return { bpData: [], ccData: [], allDescriptions: [] };
    }

    const bpData = [];
    const ccData = [];
    const allDescriptions = chartData.map(item => item.Description).reverse();

    // 为每个描述创建对应的 BP 和 CC 数据
    allDescriptions.forEach(description => {
      const bpItem = chartData.find(item => 
        item.Description === description && item.ONTOLOGY === 'BP'
      );
      const ccItem = chartData.find(item => 
        item.Description === description && item.ONTOLOGY === 'CC'
      );

      bpData.push(bpItem ? bpItem.Count : 0); // 使用ID
      ccData.push(ccItem ? ccItem.Count : 0);
    });

    return { bpData, ccData, allDescriptions };
  }, [chartData]);

  // 配置项
  const option = useMemo(() => {
    if (!chartData?.length) return {};

    return {
      grid: {
        left: '5%',
        right: '3%',
        bottom: '10%',
        top: '15%',
        containLabel: false
      },
      title: {
        text: title,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        },
        // formatter: (params) => {
        //   let result = `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px;">
        //     ${params[0].name}
        //   </div>`;
          
        //   params.forEach(param => {
        //     if (param.value > 0) {
        //       result += `
        //         <div style="line-height: 1.4; margin-bottom: 4px;">
        //           <span style="color: ${param.color}; font-weight: bold;">${param.seriesName}:</span> ${param.value}<br/>
        //         </div>
        //       `;
        //     }
        //   });
          
        //   const total = params.reduce((sum, param) => sum + param.value, 0);
        //   result += `<div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #eee; font-weight: bold;">
        //     总计: ${total}
        //   </div>`;
          
        //   return result;
        // }
      },
      legend: showLegend ? {
        data: ['BP', 'CC'],
        top: 40,
        textStyle: {
          fontSize: 12,
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 10,
        icon: 'rect'
      } : { show: false },
      xAxis: {
        name: '基因数量 (Count)',
        nameLocation: 'center',
        nameGap: 25,
        nameTextStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          color: "#666"
        },
        type: 'value',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisLabel: {
          fontSize: 10,
          color: "#666"
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#e0e0e0'
          }
        }
      },
      yAxis: {
        name: 'GO 功能描述',
        nameLocation: 'end',
        nameGap: 20,
        nameTextStyle: {
          align: 'center',
          lineHeight: 16,
          fontWeight: 'bold',
          color: "#666"
        },
        type: 'category',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#e0e0e0'
          },
          alignWithLabel: true
        },
        axisLabel: {
          overflow: 'truncate',
          ellipsis: '...',
          fontSize: 10,
          margin: 8,
          align: 'left',
          color: "#000",
          // 关键设置：让标签显示在坐标系内部
          inside: true, // 标签显示在坐标系内侧
          // 添加背景色提高可读性
          // backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: [2, 4, 2, 4],
          borderRadius: 2,
          // 调整位置
          verticalAlign: 'middle',
          // 限制宽度

          formatter: function(value) {
            if (value.length > 200) {
              return value.substring(0, 200) + '...';
            }
            return value;
          }
        },
        // 关键：减小y轴占用的空间
        boundaryGap: [0.1, 0.1], // 调整边界间隔
        // 调整网格位置，为标签腾出空间
        offset: 0,
        z: 10,
        data: allDescriptions,
        tooltip: {
          show: true,
          formatter: function(params) {
            return params.value;
          }
        }
      },
      series: [
        {
            name: 'BP',
            type: 'bar',
            stack: 'total',
            data: bpData,
            itemStyle: {
            color: '#ff4d4f',
            opacity: 0.8
            },
            emphasis: {
            itemStyle: {
                opacity: 1,
                shadowBlur: 10,
                shadowColor: 'rgba(255, 77, 79, 0.5)'
            }
            },
            label: {
            show: true,
            position: "left",
            formatter: (params) => {
                // 只在数值足够大时显示，避免小数值重叠
                return params.value > 0 ? params.value : '';
            },
            fontSize: 9,
            color: '#000',  
            fontWeight: 'bold'
            }
        },
        {
            name: 'CC',
            type: 'bar',
            stack: 'total',
            data: ccData,
            itemStyle: {
            color: '#1890ff',
            opacity: 0.8
            },
            emphasis: {
            itemStyle: {
                opacity: 1,
                shadowBlur: 10,
                shadowColor: 'rgba(24, 144, 255, 0.5)'
            }
            },
            label: {
            show: true,
            position: "left",
            formatter: (params) => {
                // 只在数值足够大时显示
                return params.value > 0 ? params.value : '';
            },
            fontSize: 9,
            color: '#000',
            fontWeight: 'bold',
            }
        }
      ]
    };
  }, [chartData, bpData, ccData, allDescriptions, title, showLegend]);

  // 加载状态
  if (loading) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #ddd',
          borderRadius: '4px',
          color: '#999'
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #ff4d4f',
          borderRadius: '4px',
          color: '#ff4d4f'
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #ddd',
          borderRadius: '4px',
          color: '#999'
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
        renderer: 'svg',
        useDirtyRect: true
      }}
    />
  );
};

export default GoBarChart;