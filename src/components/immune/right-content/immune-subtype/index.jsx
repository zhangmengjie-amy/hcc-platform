"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Flex, Row, Col, Empty, Spin, Dropdown, Space, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { getPatientList, getBiomarkersScore, getFullPhylogenetic } from "@/configs/request";

import HorizontalTree from "@/components/horizontal-tree/index";
import PlanetLiverSampleChart from "@/components/planet-liver-sample";
import DtLiverSampleChart from "@/components/dt-liver-sample";
import SunburstChart from "./sunburst";
import ColumnChart from "./column";
import filterSampleByConditions from "@/utils/filter-patient";

const PLANET_SUBTYPE_COLOR = {
  "Wound healing": "rgb(251, 154, 153)",
  "IFN-g dominant": "rgb(253, 191, 111)",
  "Inflammatory": "rgb(178, 223, 138)",
  "Lymphocyte depleted": "rgb(31, 120, 180)",
  "TGF-b dominant": "rgb(202, 178, 214)",
};

const DT_SUBTYPE_COLOR = {
  "Wound healing": "rgb(251, 154, 153)",
  "IFN-g dominant": "rgb(253, 191, 111)",
  "Inflammatory": "rgb(178, 223, 138)",
  "Lymphocyte depleted": "rgb(31, 120, 180)",
  "TGF-b dominant": "rgb(202, 178, 214)",
};


const HEATMAP_COLORS = {
  subtype: {
    "Wound healing": "rgb(251, 154, 153)",
    "IFN-g dominant": "rgb(253, 191, 111)",
    "Inflammatory": "rgb(178, 223, 138)",
    "Lymphocyte depleted": "rgb(31, 120, 180)",
    "TGF-b dominant": "rgb(202, 178, 214)",
  },
};

const mockFields = ["subtype"];

const MIXED_GROUP = [
  "C1,C2",
  "C1,C3",
  "C1,C4",
  "C1,C5",
  "C1,C6",
  "C2,C3",
  "C2,C4",
  "C2,C5",
  "C2,C6",
  "C3,C4",
  "C3,C5",
  "C3,C6",
  "C4,C5",
  "C4,C6",
  "C5,C6",
  "C1,C2,C3",
  "C1,C2,C4",
  "C1,C2,C5",
  "C1,C2,C6",
  "C1,C3,C4",
  "C1,C3,C5",
  "C1,C3,C6",
  "C1,C4,C5",
  "C1,C4,C6",
  "C1,C5,C6",
  "C2,C3,C4",
  "C2,C3,C5",
  "C2,C3,C6",
  "C2,C4,C6",
  "C3,C4,C5",
  "C3,C4,C6",
  "C2,C4,C5",
  "C2,C5,C6",
  "C3,C5,C6",
  "C4,C5,C6",
  "C1,C2,C3,C4",
  "C1,C2,C3,C5",
  "C1,C2,C3,C6",
  "C1,C2,C4,C5",
  "C1,C2,C4,C6",
  "C1,C2,C5,C6",
  "C1,C3,C4,C5",
  "C1,C3,C4,C6",
  "C2,C3,C4,C5",
  "C1,C3,C5,C6",
  "C1,C4,C5,C6",
  "C2,C3,C4,C6",
  "C2,C3,C5,C6",
  "C2,C4,C5,C6",
  "C3,C4,C5,C6",
  "C1,C2,C3,C4,C5",
  "C1,C2,C3,C4,C6",
  "C2,C3,C4,C5,C6",
  "C1,C3,C4,C5,C6",
  "C1,C2,C3,C5,C6",
  "C1,C2,C4,C5,C6",
  "C1,C2,C3,C4,C5,C6",
];

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
const RightPanel = ({ biomarkers, conditions, dataType = "PLANET", onComplete, dnaOrRna = "DNA" }) => {
  const [planetTreeLoading, setPlanetTreeLoading] = useState(false);
  const [dtTreeLoading, setDtTreeLoading] = useState(false);
  const [planetTreeList, setPlanetTreeList] = useState(null);
  const [planetSampleGeneData, setPlanetSampleGeneData] = useState(null);
  const [dtTreeList, setDtTreeList] = useState(null);
  const [dtSampleGeneData, setDtSampleGeneData] = useState(null);
  const [currentPlanetPatientId, setCurrentPlanetPatientId] = useState(null);
  const [currentDtPatientId, setCurrentDtPatientId] = useState(null);
  const [planetHeatmap, setPlanetHeatmap] = useState(null);
  const [dtHeatmap, setDtHeatmap] = useState(null);
  const [biomarkerScoreData, setBiomarkerScoreData] = useState(null);
  const [currentPlanetLiverSamples, setCurrentPlanetLiverSamples] = useState(null);
  const [currentDtLiverSamples, setCurrentDtLiverSamples] = useState(null);
  const patientListRef = useRef(null);
  const [filterdPatientList, setFilterdPatientList] = useState([]);
  const geneListRef = useRef(null);

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

        geneListRef.current = geneList;
        patientListRef.current = patientList
          ?.filter((item) => !!item.subtypes?.length)
          .map((item) => {
            return {
              ...item,
              stage: STAGE_TRANS[item.stage],
              subtypes: item.subtypes?.filter((i) => !!i.immuneSubtype),
            };
          }).filter((item) => item.subtypes?.length);
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
  }, [currentDtPatientId, filterdPatientList, dataType]);

  useEffect(() => {
    buildDtLiverSamples(currentDtPatientId, dataType);
  }, [currentDtPatientId, filterdPatientList, dataType]);

  useEffect(() => {
    buildPlanetHeatMap(currentPlanetPatientId, dataType);
    buildPlanetTreeData(currentPlanetPatientId, dataType);
  }, [currentPlanetPatientId, filterdPatientList, dataType]);

  useEffect(() => {
    buildPlanetLiverSamples(
      currentPlanetPatientId,
      dataType,
    );
  }, [
    currentPlanetPatientId,
    filterdPatientList,
    dataType,
  ]);

  function formatLabel(str) {
    return str?.replace(/.*_/, "") ?? str;
  }

  const buildDtLiverSamples = (dtPatientId, dataType) => {
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
                  HEATMAP_COLORS["subtype"]?.[
                    subtypesValue?.["immuneSubtype"]
                  ] ?? "#f0f0f0",
              };
            }),
            patientId: dtPatientId,
          };
        },
      );
      console.log(" currentLiver dt:", currentLiver);
      setCurrentDtLiverSamples(currentLiver);
    }
  };

  const buildPlanetLiverSamples = (
    planetPatientId,
    dataType,
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
                  HEATMAP_COLORS["subtype"]?.[
                    subtypesValue?.["immuneSubtype"]
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
          subtype: {
            color: HEATMAP_COLORS["subtype"][sample.immuneSubtype] ?? "#f0f0f0",
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
      {
        (dataType == "ALL" || dataType == "PLANET") && <Row>
          <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
            <Flex vertical align="center" style={{ border: "1px solid #f5f5f5", height: "100%", padding: "20px 0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
              {
                planetTreeLoading ? <Flex align="center" justify="center" style={{ width: "100%", height: "400px" }}>
                  <Spin spinning={true} ></Spin>
                </Flex> : <SunburstChart data={planetPatientList} patientId={currentPlanetPatientId} handleItemClick={setCurrentPlanetPatientId}></SunburstChart>
              }
              <Flex style={{ marginTop: "30px" }}><Flex vertical style={{ marginLeft: "10px" }}>
                <Flex align="center" style={{ marginBottom: "10px" }}>Pure or Mixed</Flex>
                {
                  Object.keys(MIXED_PURE).map((item) => {
                    return <Flex key={item} align="center"><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: MIXED_PURE[item] }}></span><span>{item}</span></Flex>;
                  })
                }
              </Flex>
              <Flex vertical style={{ marginLeft: "10px" }}>
                <Flex align="center" style={{ marginBottom: "10px" }}>Stage</Flex>
                {
                  Object.keys(STAGE_COLOR).map((item) => {
                    return <Flex key={item} align="center"><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: STAGE_COLOR[item] }}></span><span>{item}</span></Flex>;
                  })
                }
              </Flex>
              <Flex vertical style={{ marginLeft: "10px" }}>
                <Flex align="center" style={{ marginBottom: "10px" }}>Subtype</Flex>
                {
                  Object.keys(PLANET_SUBTYPE_COLOR).map((item) => {
                    return <Flex key={item} align="center"><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: PLANET_SUBTYPE_COLOR[item] }}></span><span>{item}</span></Flex>;
                  })
                }
              </Flex>
              <Flex vertical style={{ marginLeft: "10px" }}>
                <Flex align="center" style={{ marginBottom: "10px" }}>Samples</Flex>
                {
                  [...Array(7)].map((_, i) => {
                    const tStage = `T${i + 1}`;

                    return (
                      <Flex key={tStage} align="center">
                        <svg width="20" height="16" style={{ marginRight: "5px", transform: `scale(${1 / (i * 0.05 + 1)})` }} >
                          <polygon points="0,0 5,16 15,16 20,0" style={{ fill: "#fff", strokeWidth: 1, stroke: "#000" }} />
                        </svg>
                        <span>{tStage}</span>
                      </Flex>
                    );
                  })
                }
              </Flex>
              </Flex>
            </Flex>
          </Col>
          <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
            <Row style={{ marginBottom: "20px" }}>
              <Col xs={24} sm={24} md={24} style={{ width: "100%", padding: "10px", height: "400px", border: "1px solid #f5f5f5", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                {!planetTreeLoading ?
                  (planetTreeList && currentPlanetPatientId) ? <HorizontalTree key={currentPlanetPatientId} adaptive alignLabel={true} heatmapFields={mockFields} heatmapData={planetHeatmap} data={planetTreeList} sampleGeneData={planetSampleGeneData} color={"rgb(106, 194, 165)"}></HorizontalTree> : <Flex style={{ height: "100%" }} align="center" justify="center"><Empty style={{ width: "100%", padding: "20px" }}></Empty> </Flex>
                  : <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}>
                    <Spin spinning={true} ></Spin>
                  </Flex>}
              </Col>
            </Row>
            <Row>

              <Col xs={24} sm={24} md={24} style={{ display: "flex", border: "1px solid #f5f5f5", height: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                {
                  planetTreeLoading ?
                    <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}><Spin spinning={true} ></Spin></Flex>
                    : currentPlanetLiverSamples ? <><Flex flex="1" align="center">
                      {
                        currentPlanetLiverSamples?.[0] ? <PlanetLiverSampleChart data={currentPlanetLiverSamples?.[0]}></PlanetLiverSampleChart> : <Flex flex={1} style={{ height: "400px" }} align="center" justify="center"><Empty style={{ width: "100%", padding: "20px" }}></Empty> </Flex>

                      }
                    </Flex>
                    {
                      currentPlanetLiverSamples?.[1] && <Flex flex="1" align="center">
                        {
                          currentPlanetLiverSamples?.[1] ? <PlanetLiverSampleChart data={currentPlanetLiverSamples?.[1]}></PlanetLiverSampleChart> : <Flex flex={1} style={{ height: "400px" }} align="center" justify="center"><Empty style={{ width: "100%", padding: "20px" }}></Empty> </Flex>
                        }
                      </Flex>
                    }</> : <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}><Empty style={{ width: "100%", padding: "20px" }}></Empty></Flex>
                }

              </Col>
            </Row>
          </Col>
        </Row>
      }
      {
        (dataType == "ALL" || dataType == "DT") && <Row>
          <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
            <Flex vertical align="center" style={{ border: "1px solid #f5f5f5", height: "100%", padding: "20px 0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
              <ColumnChart patientId={currentDtPatientId} data={dtPatientList} handleItemClick={setCurrentDtPatientId}></ColumnChart>
              <Flex style={{ marginTop: "30px" }}><Flex vertical style={{ marginLeft: "10px" }}>
                <Flex align="center" style={{ marginBottom: "10px" }}>Pure or Mixed</Flex>
                {
                  Object.keys(MIXED_PURE).map((item) => {
                    return <Flex key={item} align="center"><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: MIXED_PURE[item] }}></span><span>{item}</span></Flex>;
                  })
                }
              </Flex>
              <Flex vertical style={{ marginLeft: "10px" }}>
                <Flex align="center" style={{ marginBottom: "10px" }}>Stage</Flex>
                {
                  Object.keys(STAGE_COLOR).map((item) => {
                    return <Flex key={item} align="center"><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: STAGE_COLOR[item] }}></span><span>{item}</span></Flex>;
                  })
                }
              </Flex>
              <Flex vertical style={{ marginLeft: "10px" }}>
                <Flex align="center" style={{ marginBottom: "10px" }}>Subtype</Flex>
                {
                  Object.keys(DT_SUBTYPE_COLOR).map((item) => {
                    return <Flex key={item} align="center"><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: DT_SUBTYPE_COLOR[item] }}></span><span>{item}</span></Flex>;
                  })
                }
              </Flex>
              <Flex vertical style={{ marginLeft: "10px" }}>
                <Flex align="center" style={{ marginBottom: "10px" }}>Samples</Flex>
                {
                  [...Array(7)].map((_, i) => {
                    const tStage = `T${i + 1}`;
                    return (
                      <Flex key={tStage} align="center">
                        <svg width="20" height="16" style={{ marginRight: "5px", transform: `scale(${1 / (i * 0.05 + 1)})` }} >
                          <polygon points="0,0 5,16 15,16 20,0" style={{ fill: "#fff", strokeWidth: 1, stroke: "#000" }} />
                        </svg>
                        <span>{tStage}</span>
                      </Flex>
                    );
                  })
                }
              </Flex>
              </Flex>
            </Flex>
          </Col>
          <Col xs={12} sm={12} md={12} style={{ padding: "10px" }}>
            <Row style={{ marginBottom: "20px" }}>
              <Col xs={24} sm={24} md={24} style={{ width: "100%", padding: "10px", height: "460px", border: "1px solid #f5f5f5", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                {!dtTreeLoading ?
                  (dtTreeList && currentDtPatientId) ? <HorizontalTree key={currentDtPatientId} adaptive alignLabel={true} heatmapFields={mockFields} heatmapData={dtHeatmap} data={dtTreeList} sampleGeneData={dtSampleGeneData} color={"rgb(106, 194, 165)"}></HorizontalTree> : <Flex style={{ height: "100%" }} align="center" justify="center"><Empty style={{ width: "100%", padding: "20px" }}></Empty> </Flex>
                  : <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}>
                    <Spin spinning={true} ></Spin>
                  </Flex>}
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} style={{ display: "flex", border: "1px solid #f5f5f5", height: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "12px" }}>
                {
                  dtTreeLoading ?
                    <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}><Spin spinning={true} ></Spin></Flex>
                    : currentDtLiverSamples ? <><Flex flex="1" align="center">
                      {
                        currentDtLiverSamples?.[0] ? <DtLiverSampleChart data={currentDtLiverSamples?.[0]}></DtLiverSampleChart> : <Flex style={{ height: "400px" }} align="center" justify="center"><Empty style={{ width: "100%", padding: "20px" }}></Empty> </Flex>
                      }
                    </Flex>
                    {
                      currentDtLiverSamples?.[1] && <Flex flex="1" align="center">
                        {
                          currentDtLiverSamples?.[1] ? <DtLiverSampleChart data={currentDtLiverSamples?.[1]}></DtLiverSampleChart> : <Flex style={{ height: "400px" }} align="center" justify="center"><Empty style={{ width: "100%", padding: "20px" }}></Empty> </Flex>
                        }
                      </Flex>
                    }</> : <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}><Empty style={{ width: "100%", padding: "20px" }}></Empty></Flex>
                }
              </Col>
            </Row>
          </Col>
        </Row>
      }
    </>
  );
};

export default RightPanel;
