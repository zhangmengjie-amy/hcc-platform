"use client";
import React, { useEffect, useState, useCallback } from "react";
import EChartsReact from "echarts-for-react";
import {
  Empty,
  Flex,
} from "antd";
import { set } from "lodash";

const SUBTYPE_COLOR = {
  "C1": "rgb(79, 151, 121)",
  "C2": "rgb(72, 128, 187)",
  "C3": "rgb(150, 91, 164)",
  "C4": "rgb(167, 134, 56)",
  "C5": "rgb(238, 188, 57)",
  "C6": "rgb(218, 85, 76)",
};

const MIXED_GROUP = ["C1,C2", "C1,C3", "C1,C4", "C1,C5", "C1,C6", "C2,C3", "C2,C4", "C2,C5", "C2,C6", "C3,C4", "C3,C5", "C3,C6", "C4,C5", "C4,C6", "C5,C6",
  "C1,C2,C3", "C1,C2,C4", "C1,C2,C5", "C1,C2,C6", "C1,C3,C4", "C1,C3,C5", "C1,C3,C6", "C1,C4,C5", "C1,C4,C6", "C1,C5,C6", "C2,C3,C4", "C2,C3,C5", "C2,C3,C6", "C2,C4,C6", "C3,C4,C5", "C3,C4,C6", "C2,C4,C5", "C2,C5,C6", "C3,C5,C6", "C4,C5,C6",
  "C1,C2,C3,C4", "C1,C2,C3,C5", "C1,C2,C3,C6", "C1,C2,C4,C5", "C1,C2,C4,C6", "C1,C2,C5,C6", "C1,C3,C4,C5", "C1,C3,C4,C6", "C2,C3,C4,C5", "C1,C3,C5,C6", "C1,C4,C5,C6",
  "C2,C3,C4,C6", "C2,C3,C5,C6", "C2,C4,C5,C6", "C3,C4,C5,C6",
  "C1,C2,C3,C4,C5", "C1,C2,C3,C4,C6", "C2,C3,C4,C5,C6", "C1,C3,C4,C5,C6", "C1,C2,C3,C5,C6", "C1,C2,C4,C5,C6",
  "C1,C2,C3,C4,C5,C6",
];

const MIXED_PURE = {
  "Pure": "rgb(106, 194, 165)",
  "Mixed": "rgb(158, 153, 197)",
};

const MIXED_PURE_BG = {
  "Pure": "rgb(239, 249, 247)",
  "Mixed": "rgb(247, 240, 247)",
};

const STAGE_COLOR = {
  "I": "rgb(250, 213, 120)",
  "II": "rgb(245, 138, 66)",
  "III": "rgb(224, 36, 40)",
};

const defaultValue = 1;
const spaceValue = 0.2;
const SunburstChart = ({ data, patientId, handleItemClick, biomarkerMode = true, biomarkerColorMap }) => {
  const [option, setOption] = useState({});
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!data) return;
    const _option = buildOption();
    setOption(_option);
  }, [data, patientId, biomarkerColorMap]);

  const sortedPatientById = (patientList) => {
    return patientList?.sort((a, b) => a.patientId.split("_")[1] - b.patientId.split("_")[1]);
  };

  const sortPatients = (_patientList) => {
    const patientList = sortedPatientById(_patientList);
    let sortedPatientList = [];
    const purePatientList = [];
    const mixedPatientList = [];
    const patientWithGroupSubtype = patientList
      .filter((item) => new Set(item.subtypes?.map((s) => s.subtype)).size > 1)
      .map((item) => ({
        ...item,
        subtypes: item.subtypes.sort((a, b) => a.subtype?.localeCompare(b.subtype)),
      }));


    MIXED_GROUP.forEach((group) => {
      const patient = patientWithGroupSubtype.filter((item) => {
        return Array.from(new Set(item.subtypes.map((sample) => sample.subtype))).join(",") == group;
      }).sort((a, b) => a.stage.length - b.stage.length);
      mixedPatientList.push(...patient);
    });
    const patientWithSingleSubtype = patientList.filter((item) => new Set(item.subtypes?.map((item) => item.subtype)).size == 1);
    Object.keys(SUBTYPE_COLOR).forEach((subtype) => {
      const patientWithSameSubtype = patientWithSingleSubtype.filter((item) => item.subtypes[0].subtype == subtype).sort((a, b) => a.stage.length - b.stage.length);
      purePatientList.push(...patientWithSameSubtype);
    });
    sortedPatientList = [...purePatientList, ...mixedPatientList];
    return sortedPatientList;
  };
  function getLevelCount(data) {
    let maxLevel = 0;

    function traverse(node, currentLevel) {
      if (currentLevel > maxLevel) {
        maxLevel = currentLevel;
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child, currentLevel + 1));
      }
    }

    data.forEach(root => traverse(root, 1));
    return maxLevel;
  }

  const filterPatients = (_patientList) => {
    return _patientList?.filter((item) => !!item.subtypes);
  };

  const buildChildren = (sampleLength, patient, PURE_MIXED) => {
    const children = [];
    if (sampleLength == 0) return [
      {
        value: defaultValue,
        name: "",
        itemStyle: {
          borderWidth: 0,
          color: MIXED_PURE_BG[PURE_MIXED],
        },
        children: [{
          name: patient.stage,
          value: defaultValue,
          custom: {
            theme: "Stage",
            patientId: patient.patientId,
            sampleLength: patient.subtypes.length,
            PURE_MIXED: PURE_MIXED,
          },
          itemStyle: {
            color: STAGE_COLOR[patient.stage],
          },
          children: [{
            value: defaultValue,
            name: "",
            itemStyle: {
              borderWidth: 0,
              color: MIXED_PURE_BG[PURE_MIXED],
            },
            children: [{
              value: defaultValue,
              custom: {
                theme: "RNA Mixed or Pure",
                patientId: patient.patientId,
                sampleId: patient.sampleId,
                sampleLength: patient.subtypes.length,
                stage: patient.stage,
              },
              children: [{
                value: 1,
                itemStyle: {
                  borderWidth: 0,
                  color: (patientId ?? data[0]?.patientId) == patient.patientId ? "rgb(49, 96, 148)" : MIXED_PURE_BG[PURE_MIXED],
                },
              }],
              name: PURE_MIXED,
              itemStyle: {
                borderWidth: 0,
                color: MIXED_PURE[PURE_MIXED],
              },
                           
            }],
          }],
        }],
      },
    ];
    const subtype = patient.subtypes[sampleLength - 1]?.subtype;
    const sampleId = patient.subtypes[sampleLength - 1]?.id;
    const color = SUBTYPE_COLOR[subtype];
    children.push({
      name: subtype ?? "",
      value: defaultValue,
      custom: {
        theme: "Subtype",
        patientId: patient.patientId,
        sampleId,
        stage: patient.stage,
        PURE_MIXED: PURE_MIXED,
      },
      itemStyle: {
        borderWidth: color ? 1 : 0,
        color: biomarkerMode ? (biomarkerColorMap?.[sampleId]?.color ?? MIXED_PURE_BG[PURE_MIXED]) : (color ?? MIXED_PURE_BG[PURE_MIXED]),
      },
      children: buildChildren(sampleLength - 1, patient, PURE_MIXED),
    });
    return children;
  };

  const buildOption = () => {
    const filterdPatient = filterPatients(data);
    setHasData(!!filterdPatient?.length);
    const sortedPatient = sortPatients(filterdPatient);
    let seriesData = [];
    const maxSampleLength = Math.max(...sortedPatient.map(patient => patient.subtypes?.length));


    const pureChildren = [];
    const mixedChildren = [];
    let initialPureSubtype = null;
    let initialMixedSubtype = null;
    let pureTotalSpace = 0;
    let mixedTotalSpace = 0;
    const mixedPatientsLength = sortedPatient.filter((item) => {
      return new Set(item.subtypes.map((item) => item.subtype)).size > 1;
    })?.length;
    const purePatientsLength = sortedPatient.filter((item) => {
      return new Set(item.subtypes.map((item) => item.subtype)).size == 1;
    })?.length;
    sortedPatient.forEach((patient, index) => {
      const isPure = new Set(patient.subtypes.map((item) => item.subtype)).size == 1;
      const result = buildChildren(maxSampleLength, patient, isPure ? "Pure" : "Mixed");
      if (isPure) {
        if (!initialPureSubtype && !!mixedPatientsLength) {
          pureChildren.push({
            value: defaultValue,
            name: "Pure",
            custom: {
              theme: "RNA Mixed or Pure",
              PURE_MIXED: "Pure",
            },
            itemStyle: {
              borderWidth: 0,
              color: MIXED_PURE_BG["Pure"],
            },
            children: [],
          });
        }
        if (initialPureSubtype !== patient.subtypes[0].subtype && mixedPatientsLength) {
          pureTotalSpace += 1;
          pureChildren.push({
            value: spaceValue,
            name: "",
            itemStyle: {
              borderWidth: 0,
              color: MIXED_PURE_BG["Pure"],
            },
            children: [],
          });
        }

        initialPureSubtype = patient.subtypes[0].subtype;
        pureChildren.push(...result);
        if (new Set(sortedPatient[index + 1]?.subtypes.map((item) => item.subtype)).size > 1) {
          pureChildren.push({
            value: defaultValue,
            name: "Pure",
            custom: {
              theme: "RNA Mixed or Pure",
              PURE_MIXED: "Pure",
            },
            itemStyle: {
              borderWidth: 0,
              color: MIXED_PURE_BG["Pure"],
            },
            children: [],
          });
        }

      } else {
        const currentMixedSubtype = Array.from(new Set(patient.subtypes.map((sample) => sample.subtype))).join(",");
        if (initialMixedSubtype && initialMixedSubtype !== currentMixedSubtype && !!purePatientsLength) {
          mixedTotalSpace += 1;
          mixedChildren.push({
            value: spaceValue,
            name: "",
            itemStyle: {
              borderWidth: 0,
              color: MIXED_PURE_BG["Mixed"],
            },
            children: [],
          });
        }
        initialMixedSubtype = currentMixedSubtype;
        mixedChildren.push(...result);
      }
    });
    const realPureLength = pureChildren.filter((item) => item.value == 1)?.length;
    const realMixedLength = mixedChildren.filter((item) => item.value == 1)?.length;
    const totalLength = realPureLength + realMixedLength;
    const realPurePercent = (realPureLength / totalLength * 100).toFixed(0);
    const realMixedPercent = (realMixedLength / totalLength * 100).toFixed(0);

    const totalPureLength = realPureLength + pureTotalSpace * spaceValue;
    const totalMixedLength = realMixedLength + mixedTotalSpace * spaceValue;

    seriesData = [{
      name: "",
      value: totalPureLength,
      itemStyle: {
        borderWidth: 0,
        color: MIXED_PURE_BG["Pure"],
      },
      label: {
        formatter: () => {
          return `${realPurePercent}%\n\nPure patients`;
        },
        rotate: "tangential",
        verticalAlign: "top",
        padding: [!mixedPatientsLength ? -15 : 20, 0],
        fontSize: 14,
        color: "#000",
        hideOverlap: false,
      },
      children: pureChildren,
    }, {
      name: "",
      value: totalMixedLength,
      itemStyle: {
        color: MIXED_PURE_BG["Mixed"],
      },
      label: {
        formatter: () => {
          return `Mixed patients\n\n${realMixedPercent}%`;
        },
        rotate: "tangential",
        verticalAlign: "bottom",
        padding: [!purePatientsLength ? -20 : 20, 0],
        fontSize: 14,
        color: "#000",
        hideOverlap: false,
      },
      children: mixedChildren,
    }];

    const levelCount = getLevelCount(seriesData);
    const firstLevelRatio = 0.45;
    const remainingRatio = 1 - firstLevelRatio;

    // 创建层级配置
    const levels = [{}, {
      r0: "0%",
      r: 95 + "%",
      label: {
        show: true,
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: "#ccc",
        color: MIXED_PURE_BG["MIXED"],
      },
    }];

    // 为剩余层级创建配置
    for (let i = 1; i < levelCount; i++) {
      const start = firstLevelRatio + (i - 1) * (remainingRatio / (levelCount - 1));
      const end = firstLevelRatio + i * (remainingRatio / (levelCount - 1));
      levels.push({
        r0: (start * 100) + "%",
        r: (end * 100) + "%",
        label: {
          align: "right",
          rotate: "radial",
          show: false,
        },
      });
    }

    const startAngle = 180 + ((totalPureLength) / (totalPureLength + totalMixedLength) * 360 - (totalMixedLength) / (totalPureLength + totalMixedLength) * 360) / 4;
    return {
      grid: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        containLabel: true,
      },
      legend: {
        show: false,
      },
      tooltip: {
        formatter: (event) => {
          if (!event?.data?.name) return null;
          return `<div>
                    ${event?.data?.custom?.patientId ? `<div style="color: #000"><span>Patient ID: </span><span style="color: #666">${event?.data?.custom?.patientId}</span></div>` : ""}
                    ${event?.data?.custom?.sampleLength ? `<div style="color: #000"><span>Sample Counts: </span><span style="color: #666">${event?.data?.custom?.sampleLength}</span></div>` : ""} 
                    ${event?.data?.custom?.sampleId ? `<div style="color: #000"><span>Sample ID: </span><span style="color: #666">${event?.data?.custom?.sampleId}</span></div>` : ""} 
                    <div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${event.color}"></span>${event?.data?.custom?.theme}: <span style="color: #666">${event?.data?.name}</span></div>
                    ${event?.data?.custom?.stage ? `<div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${STAGE_COLOR[event?.data?.custom?.stage]}"></span><span>Stage: </span><span style="color: #666">${event?.data?.custom?.stage}</span></div>` : ""}
                    ${event?.data?.custom?.PURE_MIXED ? `<div style="color: #000"><span style="margin-right: 5px; display: inline-block; width: 10px; height: 10px; background-color: ${MIXED_PURE[event?.data?.custom?.PURE_MIXED]}"></span><span>RNA Mixed or Pure: </span><span style="color: #666">${event?.data?.custom?.PURE_MIXED}</span></div>` : ""} 
                    </div>`;
        },
      },
      // animationEasing: 'elasticOut',
      animation: false,
      series: {
        nodeClick: false,
        startAngle: startAngle,
        type: "sunburst",
        sort: undefined,
        data: seriesData,
        levels: levels,
        emphasis: {
          disabled: true,
        },
      },
    };
  };

  const handleClick = useCallback((params) => {
    if (!params.data?.custom?.patientId) return;
    handleItemClick?.(params.data?.custom?.patientId);
  }, []);

  return (
    hasData ?  <EChartsReact style={{ width: "100%", height: "360px" }} key={JSON.stringify(option)} option={option} onEvents={{ click: handleClick }} opts={{ renderer: "svg" }}></EChartsReact> : 
      <Flex style={{ height: "360px" }} align="center" justify="center"><Empty style={{ width: "100%", padding: "20px" }}></Empty> </Flex>
  );
};

export default SunburstChart;