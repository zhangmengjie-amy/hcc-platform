"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Flex, Row, Col, Empty, Spin, Dropdown, Space, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { getPatientList } from "@/configs/request";
import { getFullPhylogenetic } from "@/configs/request";
import HorizontalTree from "@/components/common/tree/horizontal-tree/index";
import PlanetLiverSampleChart from "@/components/common/tumor/planet-liver-sample";
import DtLiverSampleChart from "@/components/common/tumor/dt-liver-sample";
import SunburstChart from "@/components/modules/transcriptome/right-content/transcriptomic-heterogeneity/sunburst";
import ColumnChart from "@/components/modules/transcriptome/right-content/transcriptomic-heterogeneity/column";
import filterSampleByConditions from "@/utils/filter-patient";
import { useTranslation } from "react-i18next";

const PLANET_SUBTYPE_COLOR = {
  C1: "rgb(79, 151, 121)",
  C2: "rgb(72, 128, 187)",
  C3: "rgb(150, 91, 164)",
  C4: "rgb(167, 134, 56)",
  C5: "rgb(238, 188, 57)",
  C6: "rgb(218, 85, 76)",
};

const LEE_COLOR = {
  SURVIVAL_UP: "#FC8D62",
  SURVIVAL_DN: "#66C2A5",
};

const HOSHIDA_COLOR = {
  S1: "#377EB8",
  S2: "#FFFF33",
  S3: "#E41A1C",
};

const BOYAULT_COLOR = {
  G2: "#BF3131",
  G3: "#A1D99B",
  G4: "#A367B1",
  G5: "#A9A9A9",
};

const DT_SUBTYPE_COLOR = {
  Classic: "rgba(225, 229, 144, 1)",
  Hybrid: "rgba(90, 155, 219, 1)",
  Proliferation: "rgba(232, 139, 173, 1)",
  Wnt: "rgba(235, 162, 127, 1)",
};

const CHIANG_COLOR = {
  INTERFERON: "#FFBEAED4",
  UNANNOTATED: "black",
  POLYSOMY7: "#5C8374",
  PROLIFERATION: "#FF1E90FF",
  CTNNB1: "#A6CEE3",
};

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
    label: "Subtype",
  },
];

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
const RightPanel = ({
  conditions,
  handleComplete,
  dataType = "PLANET",
  dnaOrRna = "RNA",
}) => {
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
  const [currentPlanetLiverSamples, setCurrentPlanetLiverSamples] =
    useState(null);
  const { t } = useTranslation();
  const [currentDtLiverSamples, setCurrentDtLiverSamples] = useState(null);
  const patientListRef = useRef(null);
  const [filterdPatientList, setFilterdPatientList] = useState([]);
  const geneListRef = useRef(null);

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
  ];

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
        handleComplete(true);
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
        handleComplete(true);
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
        handleComplete(true);
      };
    }
  };

  useEffect(() => {
    buildDtHeatMap(currentDtPatientId, dataType);
    buildDtTreeData(currentDtPatientId, dataType);
  }, [currentDtPatientId, filterdPatientList, dataType]);

  useEffect(() => {
    buildDtLiverSamples(currentDtPatientId, dataType, selectedDtSubtype);
  }, [currentDtPatientId, filterdPatientList, dataType, selectedDtSubtype]);

  useEffect(() => {
    buildPlanetHeatMap(currentPlanetPatientId, dataType);
    buildPlanetTreeData(currentPlanetPatientId, dataType);
  }, [currentPlanetPatientId, filterdPatientList, dataType]);

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
                  HEATMAP_COLORS[selectedSubType]?.[
                    subtypesValue?.[selectedSubType]
                  ] ?? "#f0f0f0",
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
                  HEATMAP_COLORS[selectedSubType]?.[
                    subtypesValue?.[selectedSubType]
                  ] ?? "#f0f0f0",
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
    if (dataType == "ALL" || dataType == "PLANET") {
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
                ></SunburstChart>
              )}
              <Flex style={{ marginTop: "30px" }}>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.pureOrMixed")}
                  </Flex>
                  {Object.keys(MIXED_PURE).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: MIXED_PURE[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:clinical.stage")}
                  </Flex>
                  {Object.keys(STAGE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: STAGE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.subtype")}
                  </Flex>
                  {Object.keys(PLANET_SUBTYPE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: PLANET_SUBTYPE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:sample")}
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
              </Flex>
              <Flex style={{ marginTop: "30px" }}>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    Lee
                  </Flex>
                  {Object.keys(LEE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: LEE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.hoshida")}
                  </Flex>
                  {Object.keys(HOSHIDA_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: HOSHIDA_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.boyault")}
                  </Flex>
                  {Object.keys(BOYAULT_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: BOYAULT_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.chiang")}
                  </Flex>
                  {Object.keys(CHIANG_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: CHIANG_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
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
                            ></Empty>
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
              ></ColumnChart>
              <Flex style={{ marginTop: "30px" }}>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.pureOrMixed")}
                  </Flex>
                  {Object.keys(MIXED_PURE).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: MIXED_PURE[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:clinical.stage")}
                  </Flex>
                  {Object.keys(STAGE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: STAGE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.subtype")}
                  </Flex>
                  {Object.keys(DT_SUBTYPE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: DT_SUBTYPE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:sample")}
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
              </Flex>
              <Flex style={{ marginTop: "30px" }}>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.lee")}
                  </Flex>
                  {Object.keys(LEE_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: LEE_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.hoshida")}
                  </Flex>
                  {Object.keys(HOSHIDA_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: HOSHIDA_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.boyault")}
                  </Flex>
                  {Object.keys(BOYAULT_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: BOYAULT_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
                      </Flex>
                    );
                  })}
                </Flex>
                <Flex vertical style={{ marginLeft: "10px" }}>
                  <Flex align="center" style={{ marginBottom: "10px" }}>
                    {t("common:subtype.chiang")}
                  </Flex>
                  {Object.keys(CHIANG_COLOR).map((item) => {
                    return (
                      <Flex key={item} align="center">
                        <span
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "12px",
                            marginRight: "5px",
                            backgroundColor: CHIANG_COLOR[item],
                          }}
                        ></span>
                        <span style={{ fontSize: 12 }}>{item}</span>
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
                        {t("common:selected")}:{" "}
                      </span>
                      {t(`common:subtype.${selectedDtSubtype}`)}
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

export default RightPanel;
