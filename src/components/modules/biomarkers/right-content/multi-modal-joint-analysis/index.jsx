/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Flex, Row, Col, Empty, Spin, Dropdown, Space, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import {
  getPatientList,
  getBiomarkersScore,
  getFullPhylogenetic,
} from "@/configs/request";

import HorizontalTree from "@/components/common/tree/horizontal-tree/index";
import PlanetLiverSampleChart from "@/components/common/tumor/planet-liver-sample";
import DtLiverSampleChart from "@/components/common/tumor/dt-liver-sample";
import SunburstChart from "@/components/modules/biomarkers/right-content/multi-modal-joint-analysis/sunburst";
import ColumnChart from "@/components/modules/biomarkers/right-content/multi-modal-joint-analysis/column";
import filterSampleByConditions from "@/utils/filter-patient";
import { useTranslation } from "react-i18next";
import styles from "./style.module.scss";

const PLANET_SUBTYPE_COLOR = {
  C1: "rgb(79, 151, 121)",
  C2: "rgb(72, 128, 187)",
  C3: "rgb(150, 91, 164)",
  C4: "rgb(167, 134, 56)",
  C5: "rgb(238, 188, 57)",
  C6: "rgb(218, 85, 76)",
};

const IMMUNE_COLOR = {
  "Wound healing": "rgb(251, 154, 153)",
  "IFN-g dominant": "rgb(253, 191, 111)",
  Inflammatory: "rgb(178, 223, 138)",
  "Lymphocyte depleted": "rgb(31, 120, 180)",
  "TGF-b dominant": "rgb(202, 178, 214)",
};

const PLANET_LEE_COLOR = {
  SURVIVAL_UP: "#FC8D62",
  SURVIVAL_DN: "#66C2A5",
};

const PLANET_HOSHIDA_COLOR = {
  S1: "#377EB8",
  S2: "#FFFF33",
  S3: "#E41A1C",
};

const PLANET_BOYAULT_COLOR = {
  G12: "#FF7F00",
  G3: "#A1D99B",
  G56: "#FB9A99",
};

const DT_SUBTYPE_COLOR = {
  Classic: "rgba(225, 229, 144, 1)",
  Hybrid: "rgba(90, 155, 219, 1)",
  Proliferation: "rgba(232, 139, 173, 1)",
  Wnt: "rgba(235, 162, 127, 1)",
};

const PLANET_CHIANG_COLOR = {
  INTERFERON: "#FFBEAED4",
  UNANNOTATED: "black",
  POLYSOMY7: "#5C8374",
  PROLIFERATION: "#FF1E90FF",
  CTNNB1: "#A6CEE3",
};

const HEATMAP_COLORS = {
  lee: {
    SURVIVAL_UP: "#FC8D62",
    SURVIVAL_DN: "#66C2A5",
  },
  hoshida: {
    S1: "#377EB8",
    S2: "#FFFF33",
    S3: "#E41A1C",
  },
  boyault: {
    G2: "#BF3131",
    G3: "#A1D99B",
    G4: "#A367B1",
    G5: "#A9A9A9",
    G6: "rgb(252, 199, 55)",
    G12: "#FF7F00",
    G56: "#FB9A99",
  },
  chiang: {
    INTERFERON: "#FFBEAED4",
    UNANNOTATED: "black",
    POLYSOMY7: "#5C8374",
    PROLIFERATION: "#FF1E90FF",
    CTNNB1: "#A6CEE3",
  },
  subtype: {
    C1: "rgb(79, 151, 121)",
    C2: "rgb(72, 128, 187)",
    C3: "rgb(150, 91, 164)",
    C4: "rgb(167, 134, 56)",
    C5: "rgb(238, 188, 57)",
    C6: "rgb(218, 85, 76)",
    Classic: "rgba(225, 229, 144, 1)",
    Hybrid: "rgba(90, 155, 219, 1)",
    Proliferation: "rgba(232, 139, 173, 1)",
    Wnt: "rgba(235, 162, 127, 1)",
  },
  immuneSubtype: {
    "Wound healing": "rgb(251, 154, 153)",
    "IFN-g dominant": "rgb(253, 191, 111)",
    "Inflammatory": "rgb(178, 223, 138)",
    "Lymphocyte depleted": "rgb(31, 120, 180)",
    "TGF-b dominant": "rgb(202, 178, 214)",
  },
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

const STAGE_TRANS = {
  I: "I",
  II: "II",
  IA: "I",
  IB: "I",
  Ib: "I",
  IIA: "II",
  IIB: "II",
  IIIA: "III",
  IIIB: "III",
  "III A": "III",
};
const MultiModalJointAnalysisContent = ({
  biomarkers,
  conditions,
  dataType = "PLANET",
  onComplete,
  dnaOrRna = "RNA",
}) => {
  const { t } = useTranslation();
  const [planetTreeLoading, setPlanetTreeLoading] = useState(false);
  const [dtTreeLoading, setDtTreeLoading] = useState(false);
  const [planetTreeList, setPlanetTreeList] = useState(null);
  const [selectedDtSubtype, setSelectedDtSubtype] = useState("subtype");
  const [selectedPlanetSubtype, setSelectedPlanetSubtype] = useState("subtype");
  const [planetSampleGeneData, setPlanetSampleGeneData] = useState(null);
  const [dtTreeList, setDtTreeList] = useState(null);
  const [dtSampleGeneData, setDtSampleGeneData] = useState(null);
  const [currentPlanetPatientId, setCurrentPlanetPatientId] = useState(null);
  const [currentDtPatientId, setCurrentDtPatientId] = useState(null);
  const [planetHeatmap, setPlanetHeatmap] = useState(null);
  const [dtHeatmap, setDtHeatmap] = useState(null);
  const [biomarkerScoreData, setBiomarkerScoreData] = useState(null);
  const [currentPlanetLiverSamples, setCurrentPlanetLiverSamples] =
    useState(null);
  const [currentDtLiverSamples, setCurrentDtLiverSamples] = useState(null);
  const patientListRef = useRef(null);
  const [filterdPatientList, setFilterdPatientList] = useState([]);
  const geneListRef = useRef(null);
  const [biomarkersRange, setBiomarkersRange] = useState(null);

  useEffect(() => {
    if (!conditions) return;
    conditions["stage"] = Array.from(
      new Set(conditions["stage"]?.map((item) => STAGE_TRANS[item])),
    );
    const { geneList, ...clinicList } = conditions;
    const filteredData =
      filterSampleByConditions(patientListRef.current, clinicList, geneList) ??
      [];

    setFilterdPatientList(filteredData);
  }, [conditions]);

  const mockFields = [
    {
      key: "lee",
      label: t("common:subtype.lee"),
    },
    {
      key: "hoshida",
      label: t("common:subtype.hoshida"),
    },
    {
      key: "boyault",
      label: t("common:subtype.boyault"),
    },
    {
      key: "chiang",
      label: t("common:subtype.chiang"),
    },
    {
      key: "subtype",
      label: t("common:subtype.subtype"),
    },
    {
      key: "immune",
      label: t("common:subtype.immuneSubtype"),
    },
    {
      key: "biomarker",
      label: t("common:subtype.biomarker"),
    },
  ];

  const SUBTYPE_DROPDOWN_ITEMS = [
    {
      key: "lee",
      label: "Lee",
    },
    {
      key: "hoshida",
      label: "Hoshida",
    },
    {
      key: "boyault",
      label: "Boyault",
    },
    {
      key: "chiang",
      label: "Chiang",
    },
    {
      key: "subtype",
      label: t("common:subtype.subtype"),
    },
    {
      key: "immuneSubtype",
      label: t("common:subtype.immuneSubtype"),
    },
    {
      key: "biomarker",
      label: t("common:subtype.biomarker"),
    },
  ];

  useEffect(() => {
    if (!biomarkers?.cohortName || !biomarkers?.taskType) return;
    const applyBiomarkersScore = async () => {
      let result = [];
      if (biomarkers.cohortName !== "all") {
        const response = await getBiomarkersScore(biomarkers);
        result = response?.data;
        const geneScores = result?.map((item) => item?.geneScore) ?? [];
        const min = Math.min(...geneScores);
        const max = Math.max(...geneScores);
        const avg =
          geneScores.reduce((sum, score) => sum + score, 0) / geneScores.length;
        setBiomarkersRange({
          min: min.toFixed(2),
          max: max.toFixed(2),
          avg: avg.toFixed(2),
        });
        const dataWithColor = result?.reduce((acc, item) => {
          acc[item?.sampleId] = {
            score: item.geneScore,
            color: getColorForScoreWithAvg(item.geneScore, min, max, avg),
          };
          return acc;
        }, {});
        setBiomarkerScoreData(dataWithColor);
      } else {
        const allResponse = await Promise.all([
          getBiomarkersScore({ ...biomarkers, cohortName: "cohort1" }),
          getBiomarkersScore({ ...biomarkers, cohortName: "cohort2" }),
        ]).then((values) => values);
        const scoreResponse1 = getBiomarkersScoreColor(
          allResponse[0]?.data ?? [],
        );
        const scoreResponse2 = getBiomarkersScoreColor(
          allResponse[1]?.data ?? [],
        );
        setBiomarkerScoreData({ ...scoreResponse1, ...scoreResponse2 });
      }
    };

    applyBiomarkersScore();
  }, [biomarkers]);

  const getBiomarkersScoreColor = (result) => {
    const geneScores = result?.map((item) => item?.geneScore) ?? [];
    const min = Math.min(...geneScores);
    const max = Math.max(...geneScores);
    const avg =
      geneScores.reduce((sum, score) => sum + score, 0) / geneScores.length;
    const dataWithColor = result?.reduce((acc, item) => {
      acc[item.sampleId] = {
        score: item.geneScore,
        color: getColorForScoreWithAvg(item.geneScore, min, max, avg),
      };
      return acc;
    }, {});
    return dataWithColor;
  };

  // 或者更简单的线性渐变方式

  function getColorForScoreWithAvg(score, minVal, maxVal, avgVal) {
    // 计算相对位置
    let normalized;
    let r, g, b;

    // 目标颜色
    const blueColor = "#313695"; // RGB: 49, 54, 149
    const whiteColor = "#f9e9cd"; // RGB: 255, 255, 255
    const redColor = "#d73027"; // RGB: 215, 48, 39

    // 解析目标颜色
    const parseHexColor = (hex) => {
      hex = hex.replace("#", "");
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
      };
    };

    const blueRGB = parseHexColor(blueColor); // 深蓝色
    const whiteRGB = parseHexColor(whiteColor); // 白色
    const redRGB = parseHexColor(redColor); // 深红色

    if (score <= avgVal) {
      // 在深蓝色到白色之间
      normalized = (score - minVal) / (avgVal - minVal);
      normalized = Math.max(0, Math.min(1, normalized)); // 确保在0-1范围内

      // 从蓝色渐变到白色
      r = Math.round(blueRGB.r + (whiteRGB.r - blueRGB.r) * normalized);
      g = Math.round(blueRGB.g + (whiteRGB.g - blueRGB.g) * normalized);
      b = Math.round(blueRGB.b + (whiteRGB.b - blueRGB.b) * normalized);
    } else {
      // 在白色到深红色之间
      normalized = (score - avgVal) / (maxVal - avgVal);
      normalized = Math.max(0, Math.min(1, normalized)); // 确保在0-1范围内

      // 从白色渐变到红色
      r = Math.round(whiteRGB.r + (redRGB.r - whiteRGB.r) * normalized);
      g = Math.round(whiteRGB.g + (redRGB.g - whiteRGB.g) * normalized);
      b = Math.round(whiteRGB.b + (redRGB.b - whiteRGB.b) * normalized);
    }

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  useEffect(() => {
    if (patientListRef.current?.length && geneListRef.current?.length) {
      setCurrentPlanetPatientId(
        filterdPatientList?.filter((item) => item.type === "PLANET")[0]
          ?.patientId,
      );
      setCurrentDtPatientId(
        filterdPatientList?.filter((item) => item.type === "DT")[0]?.patientId,
      );
    }
  }, [dataType, filterdPatientList]);

  useEffect(() => {
    setDtTreeLoading(true);
    setPlanetTreeLoading(true);
    Promise.all([getPatientList(null), getFullPhylogenetic(null)]).then(
      (results) => {
        const [patientList, geneList] = results;

        geneListRef.current = geneList?.data ?? [];
        patientListRef.current = patientList?.data
          ?.filter((item) => !!item.subtypes?.length)
          .map((item) => {
            return {
              ...item,
              stage: STAGE_TRANS[item.stage],
            };
          });
        setFilterdPatientList(patientListRef.current);
        setCurrentPlanetPatientId(
          patientListRef.current?.filter((item) => item.type === "PLANET")[0]
            ?.patientId,
        );
        setCurrentDtPatientId(
          patientListRef.current?.filter((item) => item.type === "DT")[0]
            ?.patientId,
        );
        setDtTreeLoading(false);
        setPlanetTreeLoading(false);
      },
    );
  }, []);

  const buildDtTreeData = (dtPatientId, dataType) => {
    if (!geneListRef.current || dtPatientList?.length == 0) return;
    const treeWorker = new Worker("/workers/tree.js");
    if (dataType == "ALL" || dataType == "DT") {
      if (!dtPatientId) {
        dtPatientId = dtPatientList?.[0]?.patientId;
      }
      const newick = dtPatientList?.find(
        (item) => item.patientId === dtPatientId,
      )?.newick;
      if (!newick) return;
      const geneData = geneListRef.current
        ?.filter((item) => item)
        ?.filter((item) => item?.sampleId?.includes(`${dtPatientId}_`));
      treeWorker.postMessage({ newick: newick, geneData });
      treeWorker.onmessage = ({ data }) => {
        setDtTreeList(data.treeList);
        setDtSampleGeneData(data.sampleGeneData);
        setDtTreeLoading(false);
        onComplete(true);
      };
    }
  };

  const buildPlanetTreeData = (planetPatientId, dataType) => {
    if (!geneListRef.current || planetPatientList?.length == 0) return;
    const treeWorker = new Worker("/workers/tree.js");
    if (dataType == "ALL" || dataType == "PLANET") {
      if (!planetPatientId) {
        planetPatientId = planetPatientList?.[0]?.patientId;
      }
      const newick = planetPatientList?.find(
        (item) => item.patientId === planetPatientId,
      )?.newick;
      if (!newick) return;
      const geneData = geneListRef.current
        ?.filter((item) => item)
        ?.filter((item) => item?.sampleId?.includes(`${planetPatientId}_`));
      treeWorker.postMessage({ newick: newick, geneData });
      treeWorker.onmessage = ({ data }) => {
        setPlanetTreeList(data.treeList);
        setPlanetSampleGeneData(data.sampleGeneData);
        onComplete(true);
      };
    }
  };

  useEffect(() => {
    buildDtHeatMap(currentDtPatientId, dataType);
    buildDtTreeData(currentDtPatientId, dataType);
  }, [currentDtPatientId, filterdPatientList, dataType, biomarkerScoreData, biomarkerScoreData]);

  useEffect(() => {
    buildDtLiverSamples(currentDtPatientId, dataType, selectedDtSubtype);
  }, [
    currentDtPatientId,
    filterdPatientList,
    dataType,
    selectedDtSubtype,
  ]);

  useEffect(() => {
    buildPlanetHeatMap(currentPlanetPatientId, dataType);
    buildPlanetTreeData(currentPlanetPatientId, dataType);
  }, [currentPlanetPatientId, filterdPatientList, dataType, biomarkerScoreData]);

  useEffect(() => {
    buildPlanetLiverSamples(
      currentPlanetPatientId,
      dataType,
      selectedPlanetSubtype,
    );
  }, [
    currentPlanetPatientId,
    filterdPatientList,
    dataType,
    selectedPlanetSubtype,
  ]);

  function formatLabel(str) {
    return str?.replace(/.*_/, "") ?? str;
  }

  const buildDtLiverSamples = (dtPatientId, dataType, selectedSubType) => {
    if (dataType == "ALL" || dataType == "DT") {
      if (!dtPatientId) {
        dtPatientId = dtPatientList?.[0]?.patientId;
      }
      const currentPatient = dtPatientList?.find(
        (item) => item.patientId === dtPatientId,
      );
      const currentLiver = currentPatient?.dt_tumors?.[0]?.[dnaOrRna].map(
        (tumor) => {
          return {
            ...tumor,
            samples: tumor.samples.map((sample) => {
              const subtypesValue = currentPatient.subtypes?.find(
                (sub) => sub.id == sample.sample_id,
              );
              return {
                ...sample,
                color:
                  selectedSubType === "biomarker"
                    ? (biomarkerScoreData?.[sample.sample_id]?.color ??
                      "#f0f0f0")
                    : (HEATMAP_COLORS[selectedSubType]?.[
                      subtypesValue?.[selectedSubType]
                    ] ?? "#f0f0f0"),
              };
            }),
            patientId: dtPatientId,
          };
        },
      );
      setCurrentDtLiverSamples(currentLiver);
    }
  };

  const buildPlanetLiverSamples = (
    planetPatientId,
    dataType,
    selectedSubType,
  ) => {
    if (dataType == "ALL" || dataType == "PLANET") {
      if (!planetPatientId) {
        planetPatientId = planetPatientList?.[0]?.patientId;
      }
      const currentPatient = planetPatientList?.find(
        (item) => item.patientId === planetPatientId,
      );
      const currentLiver = currentPatient?.planet_tumors[0][dnaOrRna].map(
        (tumor) => {
          return {
            ...tumor,
            samples: tumor.samples.map((sample) => {
              const subtypesValue = currentPatient.subtypes?.find(
                (sub) => sub.id == sample.sample_id,
              );
              return {
                ...sample,
                color:
                  selectedSubType === "biomarker"
                    ? (biomarkerScoreData?.[sample.sample_id]?.color ??
                      "#f0f0f0")
                    : (HEATMAP_COLORS[selectedSubType]?.[
                      subtypesValue?.[selectedSubType]
                    ] ?? "#f0f0f0"),
              };
            }),
            patientId: planetPatientId,
          };
        },
      );
      setCurrentPlanetLiverSamples(currentLiver);
    }
  };

  const buildDtHeatMap = (dtPatientId, dataType) => {
    if (dataType == "ALL" || dataType == "DT") {
      if (!dtPatientId) {
        dtPatientId = dtPatientList?.[0]?.patientId;
      }
      const subtypes =
        dtPatientList?.find(
          (subtypeItem) => subtypeItem.patientId == dtPatientId,
        )?.subtypes ?? [];
      const _heatmap = buildSubtypes(subtypes);
      setDtHeatmap(_heatmap);
    }
  };

  const buildPlanetHeatMap = (planetPatientId, dataType) => {
    if (dataType == "all" || dataType == "PLANET") {
      if (!planetPatientId) {
        planetPatientId = planetPatientList?.[0]?.patientId;
      }
      const subtypes =
        planetPatientList?.find(
          (subtypeItem) => subtypeItem.patientId == planetPatientId,
        )?.subtypes ?? [];
      const _heatmap = buildSubtypes(subtypes);
      setPlanetHeatmap(_heatmap);
    }
  };

  const buildSubtypes = (subtypes) => {
    if (subtypes.length) {
      const _heatmap = {};

      subtypes.forEach((sample) => {
        _heatmap[formatLabel(sample?.id)] = {
          boyault: {
            color: HEATMAP_COLORS["boyault"][sample.boyault] ?? "#f0f0f0",
            value: sample.boyault,
          },
          chiang: {
            color: HEATMAP_COLORS["chiang"][sample.chiang] ?? "#f0f0f0",
            value: sample.chiang,
          },
          hoshida: {
            color: HEATMAP_COLORS["hoshida"][sample.hoshida] ?? "#f0f0f0",
            value: sample.hoshida,
          },
          lee: {
            color: HEATMAP_COLORS["lee"][sample.lee] ?? "#f0f0f0",
            value: sample.lee,
          },
          subtype: {
            color: HEATMAP_COLORS["subtype"][sample.subtype] ?? "#f0f0f0",
            value: sample.subtype,
          },
          biomarker: {
            color: biomarkerScoreData?.[sample.id]?.color ?? "#f0f0f0",
            value: biomarkerScoreData?.[sample.id]?.score ?? null,
          },
          immune: {
            color: HEATMAP_COLORS["immuneSubtype"][sample.immuneSubtype] ?? "#f0f0f0",
            value: sample.immuneSubtype,
          },
        };
      });
      return _heatmap;
    }
  };

  const dtPatientList = useMemo(() => {
    if (dataType == "PLANET") return [];
    return filterdPatientList?.filter((item) => item.type === "DT");
  }, [filterdPatientList, dataType]);

  const planetPatientList = useMemo(() => {
    if (dataType == "DT") return [];
    return filterdPatientList?.filter((item) => item.type === "PLANET");
  }, [filterdPatientList, dataType]);

  return (
    <>
      {(dataType == "ALL" || dataType == "PLANET") && (
        <Row>
          <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
            <Flex
              vertical
              align="center"
              style={{
                border: "1px solid #f5f5f5",
                height: "100%",
                padding: "20px 0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderRadius: "12px",
              }}
            >
              {planetTreeLoading ? (
                <Flex
                  align="center"
                  justify="center"
                  style={{ width: "100%", height: "360px" }}
                >
                  <Spin spinning={true}></Spin>
                </Flex>
              ) : (
                <SunburstChart
                  data={planetPatientList}
                  patientId={currentPlanetPatientId}
                  handleItemClick={setCurrentPlanetPatientId}
                  biomarkerColorMap={biomarkerScoreData}
                ></SunburstChart>
              )}
              <Flex style={{ marginTop: "30px" }}>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.pureOrMixed")}
                  </Flex>
                  {Object.keys(MIXED_PURE).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: MIXED_PURE[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.stage")}
                  </Flex>
                  {Object.keys(STAGE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: STAGE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.immuneSubtype")}
                  </Flex>
                  {Object.keys(IMMUNE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: IMMUNE_COLOR[item],
                          }}
                        ></span>{" "}
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:samples")}
                  </Flex>
                  {[...Array(7)].map((_, i) => {
                    const tStage = `T${i + 1}`;

                    return (
                      <Flex key={tStage} align="center">
                        <svg
                          width="20"
                          height="16"
                          style={{
                            marginRight: "5px",
                            transform: `scale(${1 / (i * 0.05 + 1)})`,
                          }}
                        >
                          <polygon
                            points="0,0 5,16 15,16 20,0"
                            style={{
                              fill: "#fff",
                              strokeWidth: 1,
                              stroke: "#000",
                            }}
                          />
                        </svg>
                        <span>{tStage}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.biomarker")}
                  </Flex>
                  <div className={styles.gradientBar}>
                    <div className={styles.labels}>
                      <div className={styles.label}>
                        {biomarkersRange?.max || ""}
                      </div>
                      <div className={styles.label}>
                        {biomarkersRange?.avg || ""}
                      </div>
                      <div className={styles.label}>
                        {biomarkersRange?.min || ""}
                      </div>
                    </div>
                  </div>
                </Flex>
              </Flex>
              <Flex style={{ marginTop: "30px" }}>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.subtype")}
                  </Flex>
                  {Object.keys(PLANET_SUBTYPE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_SUBTYPE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    Lee
                  </Flex>
                  {Object.keys(PLANET_LEE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_LEE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.hoshida")}
                  </Flex>
                  {Object.keys(PLANET_HOSHIDA_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_HOSHIDA_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.boyault")}
                  </Flex>
                  {Object.keys(PLANET_BOYAULT_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_BOYAULT_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.chiang")}
                  </Flex>
                  {Object.keys(PLANET_CHIANG_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_CHIANG_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
              </Flex>
            </Flex>
          </Col>
          <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
            <Row style={{ marginBottom: "20px" }}>
              <Col
                xs={24}
                sm={24}
                md={24}
                style={{
                  width: "100%",
                  padding: "10px",
                  height: "400px",
                  border: "1px solid #f5f5f5",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                }}
              >
                {!planetTreeLoading ? (
                  planetTreeList && currentPlanetPatientId ? (
                    <HorizontalTree
                      key={currentPlanetPatientId}
                      adaptive
                      alignLabel={true}
                      heatmapFields={mockFields}
                      heatmapData={planetHeatmap}
                      data={planetTreeList}
                      sampleGeneData={planetSampleGeneData}
                      color={"rgb(106, 194, 165)"}
                    ></HorizontalTree>
                  ) : (
                    <Flex
                      style={{ height: "100%" }}
                      align="center"
                      justify="center"
                    >
                      <Empty
                        style={{ width: "100%", padding: "20px" }}
                      ></Empty>{" "}
                    </Flex>
                  )
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Spin spinning={true}></Spin>
                  </Flex>
                )}
              </Col>
            </Row>
            <Row>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={24}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Dropdown
                  menu={{
                    items: SUBTYPE_DROPDOWN_ITEMS,
                    selectable: true,
                    onClick: (e) => {
                      setSelectedPlanetSubtype(e.key);
                    },
                    defaultSelectedKeys: ["subtype"],
                  }}
                >
                  <Typography.Link>
                    <Space>
                      <span style={{ color: "#000" }}>
                        {t("common:selected")}:{" "}
                      </span>
                      {t(`common:subtype.${selectedPlanetSubtype}`)}
                      <DownOutlined />
                    </Space>
                  </Typography.Link>
                </Dropdown>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={24}
                style={{
                  display: "flex",
                  border: "1px solid #f5f5f5",
                  height: "340px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                }}
              >
                {planetTreeLoading ? (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Spin spinning={true}></Spin>
                  </Flex>
                ) : currentPlanetLiverSamples ? (
                  <>
                    <Flex flex="1" align="center">
                      {currentPlanetLiverSamples?.[0] ? (
                        <PlanetLiverSampleChart
                          data={currentPlanetLiverSamples?.[0]}
                        ></PlanetLiverSampleChart>
                      ) : (
                        <Flex
                          style={{ height: "360px" }}
                          align="center"
                          justify="center"
                        >
                          <Empty
                            style={{ width: "100%", padding: "20px" }}
                          ></Empty>{" "}
                        </Flex>
                      )}
                    </Flex>
                    {currentPlanetLiverSamples?.[1] && (
                      <Flex flex="1" align="center">
                        {currentPlanetLiverSamples?.[1] ? (
                          <PlanetLiverSampleChart
                            data={currentPlanetLiverSamples?.[1]}
                          ></PlanetLiverSampleChart>
                        ) : (
                          <Flex
                            style={{ height: "360px" }}
                            align="center"
                            justify="center"
                          >
                            <Empty
                              style={{ width: "100%", padding: "20px" }}
                            ></Empty>{" "}
                          </Flex>
                        )}
                      </Flex>
                    )}
                  </>
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Empty style={{ width: "100%", padding: "20px" }}></Empty>
                  </Flex>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      )}
      {(dataType == "ALL" || dataType == "DT") && (
        <Row>
          <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
            <Flex
              vertical
              align="center"
              style={{
                border: "1px solid #f5f5f5",
                height: "100%",
                padding: "20px 0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                borderRadius: "12px",
              }}
            >
              <ColumnChart
                patientId={currentDtPatientId}
                data={dtPatientList}
                handleItemClick={setCurrentDtPatientId}
                biomarkerColorMap={biomarkerScoreData}
              ></ColumnChart>
              <Flex style={{ marginTop: "30px" }}>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.pureOrMixed")}
                  </Flex>
                  {Object.keys(MIXED_PURE).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: MIXED_PURE[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.stage")}
                  </Flex>
                  {Object.keys(STAGE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: STAGE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.immuneSubtype")}
                  </Flex>
                  {Object.keys(IMMUNE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: IMMUNE_COLOR[item],
                          }}
                        ></span>{" "}
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:samples")}
                  </Flex>
                  {[...Array(7)].map((_, i) => {
                    const tStage = `T${i + 1}`;

                    return (
                      <Flex key={tStage} align="center">
                        <svg
                          width="20"
                          height="16"
                          style={{
                            marginRight: "5px",
                            transform: `scale(${1 / (i * 0.05 + 1)})`,
                          }}
                        >
                          <polygon
                            points="0,0 5,16 15,16 20,0"
                            style={{
                              fill: "#fff",
                              strokeWidth: 1,
                              stroke: "#000",
                            }}
                          />
                        </svg>
                        <span>{tStage}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.biomarker")}
                  </Flex>
                  <div className={styles.gradientBar}>
                    <div className={styles.labels}>
                      <div className={styles.label}>
                        {biomarkersRange?.max || ""}
                      </div>
                      <div className={styles.label}>
                        {biomarkersRange?.avg || ""}
                      </div>
                      <div className={styles.label}>
                        {biomarkersRange?.min || ""}
                      </div>
                    </div>
                  </div>
                </Flex>
              </Flex>
              <Flex style={{ marginTop: "30px" }}>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.subtype")}
                  </Flex>
                  {Object.keys(PLANET_SUBTYPE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_SUBTYPE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    Lee
                  </Flex>
                  {Object.keys(PLANET_LEE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_LEE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.hoshida")}
                  </Flex>
                  {Object.keys(PLANET_HOSHIDA_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_HOSHIDA_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.boyault")}
                  </Flex>
                  {Object.keys(PLANET_BOYAULT_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_BOYAULT_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex
                    align="center"
                    style={{ marginBottom: "10px", fontSize: "12px" }}
                  >
                    {t("common:subtype.chiang")}
                  </Flex>
                  {Object.keys(PLANET_CHIANG_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "15px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_CHIANG_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: "12px" }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
              </Flex>
            </Flex>
          </Col>
          <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
            <Row style={{ marginBottom: "20px" }}>
              <Col
                xs={24}
                sm={24}
                md={24}
                style={{
                  width: "100%",
                  padding: "10px",
                  height: "460px",
                  border: "1px solid #f5f5f5",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                }}
              >
                {!dtTreeLoading ? (
                  dtTreeList && currentDtPatientId ? (
                    <HorizontalTree
                      adaptive
                      key={currentDtPatientId}
                      alignLabel={true}
                      heatmapFields={mockFields}
                      heatmapData={dtHeatmap}
                      data={dtTreeList}
                      sampleGeneData={dtSampleGeneData}
                      color={"rgb(106, 194, 165)"}
                    ></HorizontalTree>
                  ) : (
                    <Flex
                      style={{ height: "100%" }}
                      align="center"
                      justify="center"
                    >
                      <Empty
                        style={{ width: "100%", padding: "20px" }}
                      ></Empty>{" "}
                    </Flex>
                  )
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Spin spinning={true}></Spin>
                  </Flex>
                )}
              </Col>
            </Row>
            <Row>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={24}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Dropdown
                  menu={{
                    items: SUBTYPE_DROPDOWN_ITEMS,
                    selectable: true,
                    onClick: (e) => {
                      setSelectedDtSubtype(e.key);
                    },
                    defaultSelectedKeys: ["subtype"],
                  }}
                >
                  <Typography.Link>
                    <Space>
                      <span style={{ color: "#000" }}>
                        {t("common:selected")}:
                      </span>
                      {selectedDtSubtype}
                      <DownOutlined />
                    </Space>
                  </Typography.Link>
                </Dropdown>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={24}
                style={{
                  display: "flex",
                  border: "1px solid #f5f5f5",
                  height: "340px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                }}
              >
                {dtTreeLoading ? (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Spin spinning={true}></Spin>
                  </Flex>
                ) : currentDtLiverSamples ? (
                  <>
                    <Flex flex="1" align="center">
                      {currentDtLiverSamples?.[0] ? (
                        <DtLiverSampleChart
                          data={currentDtLiverSamples?.[0]}
                        ></DtLiverSampleChart>
                      ) : (
                        <Flex
                          style={{ height: "360px" }}
                          align="center"
                          justify="center"
                        >
                          <Empty
                            style={{ width: "100%", padding: "20px" }}
                          ></Empty>{" "}
                        </Flex>
                      )}
                    </Flex>
                    {currentDtLiverSamples?.[1] && (
                      <Flex flex="1" align="center">
                        {currentDtLiverSamples?.[1] ? (
                          <DtLiverSampleChart
                            data={currentDtLiverSamples?.[1]}
                          ></DtLiverSampleChart>
                        ) : (
                          <Flex
                            style={{ height: "360px" }}
                            align="center"
                            justify="center"
                          >
                            <Empty
                              style={{ width: "100%", padding: "20px" }}
                            ></Empty>{" "}
                          </Flex>
                        )}
                      </Flex>
                    )}
                  </>
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Empty style={{ width: "100%", padding: "20px" }}></Empty>
                  </Flex>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </>
  );
};

export default MultiModalJointAnalysisContent;
