"use client";
import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { getGeneList } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ConditionSelection from "@/components/clinical-selection";
import SplitBar from "@/components/split-bar";

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
import CohortMulti from "@/components/condition-selector/cohort-multi";
import FilterCohort from "@/components/condition-selector/filter-cohort";
import BiomarkersGene from "@/components/condition-selector/biomarkers-gene";
import Image from "next/image";
const { Panel } = Splitter;

const LEFT_SQUARE_SRC = "/images/left-square.svg";
const RIGHT_SQUARE_SRC = "/images/right-square.svg";
const DEFAULT_LEFT_PANEL_WIDTH = "25%";
const DEFAULT_RIGHT_PANEL_WIDTH = "75%";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const RELOAD_ICON = "/images/reload.svg";

const LeftContent = () => {
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
  const [selectedClinical, setSelectedClinical] = useState([]);
  const [selectedClassify, setSelectedClassify] = useState("all");
  const [selectedTechnology, setSelectedTechnology] = useState("all");

  const onFilterCohortSelection = useCallback((result) => {
    setSelectedClinical(result.selectedClinical),
    setSelectedClassify(result.selectedClassify),
    setSelectedTechnology(result.selectedTechnology)
  }, []);

  const onCohortSelection = useCallback((result) => {
      console.log(result)
  }, []);

  const onGeneSelection = useCallback((result) => {
    console.log(result)
  }, [])

  return (
    <>
      {<FilterCohort onChange={onFilterCohortSelection}></FilterCohort>}
      {<CohortMulti selectedClassify={selectedClassify}
        selectedClinical={selectedClinical}
        selectedTechnology={selectedTechnology} onChange={onCohortSelection} ></CohortMulti>}
      {<BiomarkersGene onChange={onGeneSelection}></BiomarkersGene>}
    </>
  );
};

export default LeftContent;