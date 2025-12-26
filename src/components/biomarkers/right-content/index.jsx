"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { getGeneList } from "@/configs/request";
import {
  CaretRightOutlined,
  LoadingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { download } from "@/configs/request";
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
import Image from "next/image";
const { Panel } = Splitter;
const LEFT_SQUARE_SRC = "/images/left-square.svg";
const RIGHT_SQUARE_SRC = "/images/right-square.svg";
const DEFAULT_LEFT_PANEL_WIDTH = "25%";
const DEFAULT_RIGHT_PANEL_WIDTH = "75%";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const RELOAD_ICON = "/images/reload.svg";

const RightContent = () => {
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

  const downLoadCSV = (data, filename = "data.csv") => {
    // 创建Blob对象
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });

    // 创建下载链接
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 释放URL对象
    URL.revokeObjectURL(url);
  };

  const downloadCSV = async () => {
    try {
      // 调用后端接口获取CSV数据
      const response = await download({
        cohort: "cohort1",
        tmeGroupBy: "cibersort",
        method: "cibersort",
      });


      // 获取文本数据


      // 下载文件
      downLoadCSV(response, "analysis.csv");
    } catch (error) {
      console.error("下载失败:", error);
      // message.error("下载失败");
    }
  };

  return (
    <>
      <Button onClick={downloadCSV}>下载</Button>
    </>
  );
};

export default RightContent;
