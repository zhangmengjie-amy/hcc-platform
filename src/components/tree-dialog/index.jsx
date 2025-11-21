import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import VerticalTree from "@/components/vertical-tree";
import { Modal, Typography, Flex, Button, Spin, Empty } from "antd";
import styles from "./style.module.scss";
import DtLiverSampleChart from "@/components/dt-liver-sample";
import PlanetLiverSampleChart from "@/components/planet-liver-sample";
import { useTranslation } from "react-i18next";
import { getFullPhylogenetic } from "@/configs/request";
const TreeChart = ({ treeData, modalOpen, geneList, onclose, dataType, dnaOrRna = "DNA", baseline = "left", showTumor = false }) => {

  const [treeList, setTreeList] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [sampleGeneData, setSampleGeneData] = useState(null);
  const [currentPlanetLiverSamples, setCurrentPlanetLiverSamples] = useState(null);
  const [currentDtLiverSamples, setCurrentDtLiverSamples] = useState(null);
  const { t } = useTranslation();
  useEffect(() => {
    if (!treeData?.newick || !dataType) return;
    buildPlanetLiverSamples(treeData.patientId);
    buildDtLiverSamples(treeData.patientId);
    const treeWorker = new Worker("/workers/tree.js");
    getFullPhylogenetic(dataType).then((results) => {
      const geneData = results?.filter((item) => item?.sampleId?.includes(`${treeData.patientId}_`));

      treeWorker.postMessage({ newick: treeData?.newick, geneData });
      treeWorker.onmessage = ({ data }) => {
        setTreeList(data.treeList);
        setClinic(data.clinic);
        setSampleGeneData(data.sampleGeneData);
      };
    });

  }, [treeData?.newick, dataType]);

  const buildDtLiverSamples = (dtPatientId) => {
    if (treeData.type == "DT") {
      const currentLiver = treeData?.dt_tumors?.[0]?.[dnaOrRna].map((tumor) => {
        return {
          ...tumor,
          samples: tumor.samples.map((sample) => {
            return {
              ...sample,
              color: "#E95D65",
            };
          }),
          patientId: dtPatientId,
        };
      });
      setCurrentDtLiverSamples(currentLiver);
    }
  };

  const buildPlanetLiverSamples = (planetPatientId) => {
    if (treeData.type == "PLANET") {
      const currentLiver = treeData?.planet_tumors?.[0]?.[dnaOrRna].map((tumor) => {
        return {
          ...tumor,
          samples: tumor.samples.map((sample) => {
            return {
              ...sample,
              color: "#E95D65",
            };
          }),
          patientId: planetPatientId,
        };
      });
      console.log("currentLiver", currentLiver);
      setCurrentPlanetLiverSamples(currentLiver);
    }
  };

  const renderModalTitle = useMemo(() => {
    return <Flex vertical style={{ height: "80px" }}><Flex align="center"><Image src={"/images/patient.svg"} width={30} height={30} alt="patient"></Image><Typography.Paragraph style={{ margin: 0, marginLeft: "10px", fontSize: "24px" }}>
      {treeData?.patientId}
    </Typography.Paragraph>
    <Flex align="baseline"> <span style={{ display: "inline-block", width: "18px", height: "18px", marginLeft: "5px", backgroundColor: treeData?.itemStyle?.color }}></span><span style={{ marginLeft: "5px", fontSize: "24px" }}>{treeData?.ITH}</span></Flex>
    </Flex>
    <Flex >
      {
        clinic && Object.keys(clinic)?.map((item) => {
          return <Flex align="center" key={item}><span style={{ marginLeft: "10px", fontSize: "14px" }}>{t(`mutation:sample.${item}`)}:</span><span style={{ display: "inline-block", marginLeft: "5px", width: "12px", height: "12px", borderRadius: "6px", backgroundColor: `${clinic?.[item]?.color}` }}></span><span style={{ marginLeft: "5px", fontSize: "12px", color: "#666" }}>{clinic?.[item]?.value}</span></Flex>;
        })
      }</Flex></Flex>;
  });

  return (
    <Modal
      title={renderModalTitle}
      className={styles.fullModal}
      centered
      open={modalOpen}
      onCancel={onclose}
      footer={[
        <Button key="cancel" onClick={onclose}>
                    Cancel
        </Button>,
      ]}
      width="90vw"
    >
      <Flex style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }} >
        <Flex style={{ width: "calc(100% - 400px)", height: "100%", borderRight: "1px solid #f0f0f0", paddingRight: "10px" }} align="center" justify="center">
          {
            treeList ? <VerticalTree
              geneList={geneList}
              baseline={baseline}
              color={treeData?.itemStyle?.color}
              data={treeList}
              sampleGeneData={sampleGeneData}
            /> : <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}>
              <Spin spinning={true} ></Spin>
            </Flex>
          }
        </Flex>
        <Flex style={{ height: "100%", width: "400px", paddingLeft: "10px", alignItems: "center" }} direction="column">
          {
            treeData.type === "DT" && (currentDtLiverSamples?.[0] ? <DtLiverSampleChart data={currentDtLiverSamples?.[0]}></DtLiverSampleChart> : <Flex style={{ height: "360px" }} align="center" justify="center"><Empty style={{ width: "100%", padding: "20px" }}></Empty> </Flex>)
          }
          {
            treeData.type == "PLANET" && (currentPlanetLiverSamples?.length ? <Flex style={{ width: "100%", height: "100%", flexDirection: "column" }} direction="column"><Flex flex="1" align="center">
              {
                currentPlanetLiverSamples?.[0] ? <PlanetLiverSampleChart data={currentPlanetLiverSamples?.[0]}></PlanetLiverSampleChart> : <Flex style={{ height: "360px" }} align="center" justify="center"><Empty style={{ width: "100%", padding: "20px" }}></Empty> </Flex>

              }
            </Flex>
            {
              currentPlanetLiverSamples?.[1] && <Flex flex="1" align="center" height="100%">
                {
                  currentPlanetLiverSamples?.[1] ? <PlanetLiverSampleChart data={currentPlanetLiverSamples?.[1]}></PlanetLiverSampleChart> : <Flex style={{ height: "360px" }} align="center" justify="center"><Empty style={{ width: "100%", padding: "20px" }}></Empty> </Flex>
                }
              </Flex>
            }</Flex> : <Flex align="center" justify="center" style={{ width: "100%", height: "100%" }}><Empty style={{ width: "100%", padding: "20px" }}></Empty></Flex>)
          }
        </Flex>
      </Flex>
    </Modal>
  );
};

export default TreeChart;
