"use client";
import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { getGeneList } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SplitBar from "@/components/split-bar";
import LeftContent from "@/components/biomarkers/left-content";
import RightContent from "@/components/biomarkers/right-content";
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
const { Panel } = Splitter;
const LEFT_SQUARE_SRC = "/images/left-square.svg";
const RIGHT_SQUARE_SRC = "/images/right-square.svg";
const DEFAULT_LEFT_PANEL_WIDTH = "25%";
const DEFAULT_RIGHT_PANEL_WIDTH = "75%";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const RELOAD_ICON = "/images/reload.svg";

const Biomarkers = () => {
  const { t } = useTranslation();
  const [contentType, setContentType] = useState("clinical");
  const [dataType, setDataType] = useState("planet");
  const [mutationTypeTab, setMutationTypeTab] = useState("subtype");
  const [applyLoading, setApplyLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [params, setParams] = useState({});
  const [fetchLoading, setFetchLoading] = useState(true);
  const [geneList, setGeneList] = useState([]);
  const geneRef = useRef(null);
  const paramsRef = useRef(null);

  const handleApply = useCallback(() => {
    setParams(conditionSelectionRef.current?.getParams());
  }, []);

  const leftAction = useMemo(() => {
    return  <Button color="default" size="middle" disabled={!geneList?.length} icon={applyLoading ? <LoadingOutlined /> : <AppstoreOutlined />} loading={applyLoading} onClick={handleApply} type="primary"
      style={{ color: "#fff", background: geneList?.length ? "rgb(237, 108, 116)" : "gray" }}>
      {t("common:apply")}
    </Button>;
  }, []);

  const rightAction = useMemo(() => {
    return <Segmented
      onChange={setContentType}
      options={[
        { value: "clinical", label: "clinical" },
        { value: "biomarker2", label: "biomarker2" },
      ]}
      value={contentType}
    />;
  }, [contentType]);

  return (
    <>
      {contextHolder}
      <SplitBar
        leftAction={leftAction}
        rightAction={rightAction}
        leftContent={<><LeftContent></LeftContent></>}
        rightContent={<><RightContent></RightContent></>}>
      </SplitBar>
    </>
  );
};

export default Biomarkers;