"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import EChartsReact from "echarts-for-react";
import { Empty, Flex, Button, Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import { DownloadOutlined, DownOutlined } from "@ant-design/icons";

const SUBTYPE_COLOR = {
  Classic: "rgba(225, 229, 144, 1)",
  Hybrid: "rgba(90, 155, 219, 1)",
  Proliferation: "rgba(232, 139, 173, 1)",
  Wnt: "rgba(235, 162, 127, 1)",
};

const MIXED_PURE = {
  Pure: "rgb(106, 194, 165)",
  Mixed: "rgb(158, 153, 197)",
};

const STAGE_COLOR = {
  I: "rgb(250, 213, 120)",
  II: "rgb(245, 138, 66)",
  III: "rgb(224, 36, 40)",
};

const ColumnChart = ({ data, patientId, handleItemClick }) => {
  const [option, setOption] = useState({});
  const [hasData, setHasData] = useState(false);
  const chartRef = useRef(null);
  const { t } = useTranslation();
  const [currentPatientId, setCurrentPatientId] = useState(null);

  useEffect(() => {
    if (!data) return;
    const _option = buildOption(data);
    setOption(_option);
  }, [data, currentPatientId]);
  const filterPatients = (data) => {
    return data?.filter((item) => !!item.subtypes);
  };

  const sortData = (data) => {
    const pureList = data.filter(
      (item) => new Set(item.subtypes.map((item) => item.subtype)).size == 1,
    );
    const mixedList = data.filter(
      (item) => new Set(item.subtypes.map((item) => item.subtype)).size > 1,
    );
    return [...pureList, ...mixedList];
  };
  const getBottomSeries = (data) => {
    const seriesData = [];
    sortData(data).forEach((patient, yIndex) => {
      const isPure =
        new Set(patient.subtypes.map((item) => item.subtype)).size == 1;
      patient.subtypes?.forEach((item, xIndex) => {
        if (xIndex == 0) {
          seriesData.push({
            value: [yIndex, 0, 1],
            custom: {
              patientId: patient.patientId,
              PURE_MIXED: isPure ? "Pure" : "Mixed",
              sampleId: item.sampleId,
              stage: patient.stage,
              subtype: item.subtype,
            },
            itemStyle: {
              color: MIXED_PURE[isPure ? "Pure" : "Mixed"],
              borderWidth: 2, // 设置边框宽度
              borderColor: "#fff", // 设置边框颜色
            },
          });
          seriesData.push({
            value: [yIndex, 1, 1],
            custom: {
              patientId: patient.patientId,
              PURE_MIXED: isPure ? "Pure" : "Mixed",
              sampleId: item.sampleId,
              stage: patient.stage,
              subtype: item.subtype,
            },
            itemStyle: {
              color: STAGE_COLOR[patient.stage],
              borderWidth: 2, // 设置边框宽度
              borderColor: "#fff", // 设置边框颜色
            },
          });
        }
        seriesData.push({
          value: [yIndex, xIndex + 2, 1],
          custom: {
            patientId: patient.patientId,
            PURE_MIXED: isPure ? "Pure" : "Mixed",
            sampleId: item.sampleId,
            stage: patient.stage,
            subtype: item.subtype,
          },
          itemStyle: {
            color: SUBTYPE_COLOR[item.subtype],
            borderWidth: 2, // 设置边框宽度
            borderColor: "#fff", // 设置边框颜色
          },
        });
      });
    });
    return seriesData;
  };

  const buildOption = (data) => {
    const filterdPatient = filterPatients(data);
    setHasData(!!filterdPatient?.length);
    const seriesData = getBottomSeries(data);

    return {
      tooltip: {
        position: "top",
      },
      grid: {
        top: "20",
        bottom: "40",
        left: "20",
        right: "20",
      },
      xAxis: {
        type: "category",
        data: sortData(data).map((item) => {
          return item.patientId;
        }),
        axisTick: {
          show: false,
        },
        axisLabel: {
          textStyle: {
            fontSize: 10, // 调整字体大小
            color: "#666", // 字体颜色
          },
          formatter: function (value, index) {
            // 根据索引获取对应的柱子id
            var currentId = sortData(data)[index]?.patientId;
            if (currentId === patientId) {
              return `{highlight|${value}}`;
            } else {
              return value;
            }
          },
          rich: {
            highlight: {
              color: "#ff6b35",
              fontWeight: "bold",
            },
          },
          rotate: 45, // 倾斜45度
          interval: 0, // 显示所有标签
          margin: 10, // 标签与坐标轴的间距
        },
      },
      visualMap: {
        show: false,
      },
      tooltip: {
        formatter: (event) => {
          return `<div>
                    ${event?.data?.custom?.patientId ? `<div style="color: #000"><span>Patient ID: </span><span style="color: #666">${event?.data?.custom?.patientId}</span></div>` : ""}
                     <div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${event.color}"></span>Subtype: <span style="color: #666">${event?.data?.custom?.subtype}</span></div>
                    ${event?.data?.custom?.sampleId ? `<div style="color: #000"><span>Sample ID: </span><span style="color: #666">${event?.data?.custom?.sampleId}</span></div>` : ""} 
                    ${event?.data?.custom?.stage ? `<div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${STAGE_COLOR[event?.data?.custom?.stage]}"></span><span>Stage: </span><span style="color: #666">${event?.data?.custom?.stage}</span></div>` : ""}
                    ${event?.data?.custom?.PURE_MIXED ? `<div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${MIXED_PURE[event?.data?.custom?.PURE_MIXED]}"></span><span>RNA Mixed or Pure: </span><span style="color: #666">${event?.data?.custom?.PURE_MIXED}</span></div>` : ""} 
                    </div>`;
        },
      },
      yAxis: {
        type: "category",
        data: [],
        show: false,
        splitArea: {
          show: true,
        },
      },

      series: [
        {
          name: "Punch Card",
          type: "heatmap",
          data: seriesData,
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  };

  const handleClick = useCallback((params) => {
    if (!params.data?.custom?.patientId) return;
    setCurrentPatientId(params.data?.custom?.patientId);
    handleItemClick?.(params.data?.custom?.patientId);
  }, []);

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
      link.download = `${data?.title || "Transcriptomic Column"}.${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return hasData ? (
    <>
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
            style={{ marginLeft: "20px" }}
          >
            {t("common:export")} <DownOutlined />
          </Button>
        </Dropdown> */}
        <EChartsReact
          ref={chartRef}
          style={{ width: "100%", height: "400px" }}
          key={JSON.stringify(option)}
          option={option}
          onEvents={{ click: handleClick }}
          opts={{ renderer: "svg" }}
        ></EChartsReact>
      </div>
    </>
  ) : (
    <Flex style={{ height: "400px" }} align="center" justify="center">
      <Empty style={{ width: "100%", padding: "20px" }}></Empty>{" "}
    </Flex>
  );
};

export default ColumnChart;
