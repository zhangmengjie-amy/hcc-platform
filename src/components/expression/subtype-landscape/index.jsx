"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { getGeneList } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ConditionSelection from "@/components/clinical-selection";
import RightPanel from "@/components/expression/subtype-landscape/right-panel";
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
  const [params, setParams] = useState({});
  const [leftPanelSize, setLeftPanelSize] = useState(DEFAULT_LEFT_PANEL_WIDTH);
  const [rightPanelSize, setRightPanelSize] = useState(DEFAULT_RIGHT_PANEL_WIDTH);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [geneList, setGeneList] = useState([]);
  const conditionSelectionRef = useRef(null);
  const [clinicList, setClinicList] = useState({
    gender: [],
    age: [],
    race: [],
    stage: [],
    viralStatus: [],
  });
  const geneRef = useRef(null);
  const paramsRef = useRef(null);
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
        isDriverGene: !!geneRef.current.find((item) => item.gene == gene)?.isDriverGene,
      };
    });
  };

  const getDriverList = () => {
    return geneRef.current?.filter((item) => !!item.isDriverGene).map((item) => item.gene);
  };

  const handleApply = useCallback(() => {
    setParams(conditionSelectionRef.current?.getParams());
  }, []);

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

  const rightPanelFullScreen = () => {
    if (leftPanelSize == "0") {
      setLeftPanelSize(DEFAULT_LEFT_PANEL_WIDTH);
      setRightPanelSize(DEFAULT_RIGHT_PANEL_WIDTH);
    } else {
      setLeftPanelSize("100%");
      setRightPanelSize("0");
    }
  };

  useEffect(() => {
    setParams({});
  }, [mutationTypeTab]);

    
  const dataTypeCollapseTitle = () => {
    return <Flex justify={"space-between"} align={"center"}>
      <Typography.Paragraph
        ellipsis={{
          rows: 1,
          expandable: false,
        }}
        style={{ margin: 0, color: "#fff", fontWeight: "500" }}>Filter By Cohort</Typography.Paragraph>

      <Tooltip placement="bottom" title={t("common:reset-selection")}>
        <Button color="default" onClick={(event) => {
          handleDriverReload(event);
        }} variant="text"
        style={{ color: "#fff", padding: 0 }}>
          <Image
            src={RELOAD_ICON}
            alt="reload"
            width={16}
            height={16}
            tooltip={t("common:reload")}
          />
        </Button>
      </Tooltip>
    </Flex>;
  };

  const onDataTypeChange = (e) => {
    setDataType(e.target.value);
  };

  const dataTypeCollapseContent = () => {
    return <div className={styles.searchCard}
      variant="borderless">
      <Radio.Group
        value={dataType}
        onChange={onDataTypeChange}
        options={[
          { value: "planet", label: "PLANET" },
          { value: "dt", label: "DT" },
          { value: "all", label: "All" },
        ]}
      />
    </div>;
  };

  return (
    <>
      {contextHolder}
      <Splitter className={styles.mutationSplitter} lazy onResize={onPanelChange}>
        <Panel className={styles.searchPanel} size={leftPanelSize} min={"20%"} max="50%">
          <Flex justify="space-between" align="center" style={{ paddingLeft: "10px", height: "40px" }}>
            <Button color="default" size="middle" disabled={!geneList?.length} icon={applyLoading ? <LoadingOutlined /> : <AppstoreOutlined />} loading={applyLoading} onClick={handleApply} type="primary">
              {t("common:apply")}
            </Button>
                        
            <Button color="default" variant="text"
              onClick={leftPanelFullScreen}
              style={{ color: "#fff", padding: 0 }}>
              <Image
                src={LEFT_SQUARE_SRC}
                alt="import"
                width={30}
                height={30}
              />
            </Button>
          </Flex>
          <Collapse
            defaultActiveKey={"dataType"}
            className={styles.searchCollapse}
            expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
            items={[{
              key: "dataType",
              label: dataTypeCollapseTitle(),
              children: dataTypeCollapseContent(),

            }]}>
          </Collapse>
          {
            pathname.split("/")[2] == "subtype" && <ConditionSelection ref={conditionSelectionRef} handleInitChange={handleApply} showDriverGeneList={false} showITH={false} showGeneList={false} ></ConditionSelection>
          }
        </Panel>
        <Panel size={rightPanelSize} min={"50%"} max="80%">
          <Flex justify="space-between" align="center" style={{ height: "40px", paddingRight: 10 }}>
            <Flex align="center">
              <Button color="default" variant="text"
                style={{ color: "#fff", padding: 0, marginRight: 5 }}
                onClick={rightPanelFullScreen}>
                <Image
                  src={RIGHT_SQUARE_SRC}
                  alt="import"
                  width={30}
                  height={30}
                />
              </Button>

              <Segmented
                options={[{ label: <Link href="/expression/subtype">{"Subtype landscape and tree"}</Link> , value: "subtype" },
                  { label: <Link href="/expression/pathways">{"Customized DEGs and pathways"}</Link>, value: "pathways" },
                ]}
                value={ pathname.split("/")[2]}
              />
            </Flex>
          </Flex>
          <RightPanel dataType={dataType} conditions={params}></RightPanel>

        </Panel>
      </Splitter>
    </>
  );
};

export default Expression;