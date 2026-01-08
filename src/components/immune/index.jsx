"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { getGeneList, getImmuneSubtypes } from "@/configs/request";
import {
  CaretRightOutlined,
  LoadingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ClinicalCondition from "@/components/clinical-selection";
import CohortCondition from "@/components/cohort-condition";
import Immune1 from "./immune1";
import Immune2 from "./immune2";
import {
  Collapse,
  Radio,
  Tooltip,
  Button,
  Flex,
  Splitter,
  Typography,
  Segmented,
  message,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "./style.module.scss";
const { Panel } = Splitter;
const LEFT_SQUARE_SRC = "/images/left-square.svg";
const RIGHT_SQUARE_SRC = "/images/right-square.svg";
const DEFAULT_LEFT_PANEL_WIDTH = "25%";
const DEFAULT_RIGHT_PANEL_WIDTH = "75%";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const RELOAD_ICON = "/images/reload.svg";

const Expression = () => {
  const { t } = useTranslation();
  const [dataType, setDataType] = useState("planet");
  const [mutationTypeTab, setMutationTypeTab] = useState("subtype");
  const [applyLoading, setApplyLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [immuneType, setImmuneType] = useState("immune1");
  const [params, setParams] = useState({});
  const [leftPanelSize, setLeftPanelSize] = useState(DEFAULT_LEFT_PANEL_WIDTH);
  const [rightPanelSize, setRightPanelSize] = useState(
    DEFAULT_RIGHT_PANEL_WIDTH,
  );
  const [fetchLoading, setFetchLoading] = useState(true);
  const [geneList, setGeneList] = useState([]);
  const clinicalConditionRef = useRef(null);
  const [clinicList, setClinicList] = useState({
    gender: [],
    age: [],
    race: [],
    stage: [],
    viralStatus: [],
  });
  const geneRef = useRef(null);
  const paramsRef = useRef(null);
  const cohortConditionRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    setFetchLoading(true);
    getGeneList(DEFAULT_PAGE, DEFAULT_PAGE_SIZE, "").then((results) => {
      geneRef.current = results?.records ?? [];
      const driverList = getDriverList();
      const _params = {
        ...paramsRef.current,
        ...clinicList,
        geneList: getGeneListWithIsDeriverGene(driverList),
      };
      setGeneList(driverList);
      setParams(_params);
      paramsRef.current = _params;
      setFetchLoading(false);
    });
  }, []);

  const getGeneListWithIsDeriverGene = (list) => {
    return list.map((gene) => {
      return {
        gene,
        isDriverGene: !!geneRef.current.find((item) => item.gene == gene)
          ?.isDriverGene,
      };
    });
  };

  const getDriverList = () => {
    return geneRef.current
      ?.filter((item) => !!item.isDriverGene)
      .map((item) => item.gene);
  };

  const handleApply = useCallback(() => {
    if (immuneType == "immune1") {
      setParams(clinicalConditionRef.current?.getParams());
    } else {
      console.log("2222222222222222222222222");
      setParams(cohortConditionRef.current?.getParams());
    }
  }, [immuneType]);

  const onPanelChange = (sizes) => {
    setLeftPanelSize(sizes[0]);
    setRightPanelSize(sizes[1]);
  };

  const leftPanelFullScreen = () => {
    if (rightPanelSize == "0") {
      setLeftPanelSize(DEFAULT_LEFT_PANEL_WIDTH);
      setRightPanelSize(DEFAULT_RIGHT_PANEL_WIDTH);
    } else {
      setLeftPanelSize("0");
      setRightPanelSize("100%");
    }
  };

  useEffect(() => {
    setParams({});
  }, [mutationTypeTab]);

  return (
    <>
      {contextHolder}
      <Splitter
        className={styles.mutationSplitter}
        lazy
        onResize={onPanelChange}
      >
        <Panel
          className={styles.searchPanel}
          size={leftPanelSize}
          min={"20%"}
          max="50%"
        >
          <Flex
            justify="space-between"
            align="center"
            style={{ paddingLeft: "10px", height: "40px" }}
          >
            <Button
              color="default"
              size="middle"
              icon={applyLoading ? <LoadingOutlined /> : <AppstoreOutlined />}
              loading={applyLoading}
              onClick={handleApply}
              type="primary">
              {t("common:apply")}
            </Button>

            <Button
              color="default"
              variant="text"
              onClick={leftPanelFullScreen}
              style={{ color: "#fff", padding: 0 }}
            >
              <Image
                src={LEFT_SQUARE_SRC}
                alt="import"
                width={30}
                height={30}
              />
            </Button>
          </Flex>
          {
            immuneType === "immune1" ? (
              <ClinicalCondition
                ref={clinicalConditionRef}
                handleInitChange={handleApply}
                showDriverGeneList={false}
                showITH={false}
                showGeneList={false}
              ></ClinicalCondition>
            ) : <CohortCondition module={"IMMUNE"} ref={cohortConditionRef}></CohortCondition>
          }
        </Panel>
        <Panel size={rightPanelSize} min={"50%"} max="80%">
          <Segmented
            onChange={setImmuneType}
            options={[
              { value: "immune1", label: "Immune1" },
              { value: "immune2", label: "immune2" },
            ]}
            value={immuneType}
          />
          {
            immuneType === "immune2" ? <Immune2 conditions={params}></Immune2> :<Immune1 conditions={params}></Immune1>
          }
        </Panel>
      </Splitter>
    </>
  );
};

export default Expression;
