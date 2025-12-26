"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined } from "@ant-design/icons";
import { usePathname } from "next/navigation";
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

const Split = ({ leftContent, rightContent, leftAction, rightAction }) => {
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

    

  const onDataTypeChange = (e) => {
    setDataType(e.target.value);
  };


  return (
    <>
      {contextHolder}
      <Splitter className={styles.mutationSplitter} lazy onResize={onPanelChange}>
        <Panel className={styles.searchPanel} size={leftPanelSize} min={"20%"} max="50%">
          <Flex justify="space-between" align="center" style={{ paddingLeft: "10px", height: "40px" }}>
            {leftAction}
                        
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
          {leftContent}
        </Panel>
        <Panel size={rightPanelSize} min={"20%"} max="80%">
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
              {rightAction}
            </Flex>
          </Flex>
          {rightContent}
        </Panel>
      </Splitter>
    </>
  );
};

export default Split;