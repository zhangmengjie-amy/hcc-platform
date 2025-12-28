"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { getXML } from "@/configs/request";
import {
  CaretRightOutlined,
  LoadingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
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
  const [xmlLink, setXMLLink] = useState(null);

  useEffect(() => {
    const fetchXML = async() => {
      try {
        // 调用后端接口获取CSV数据
        const response = await getXML();

        if (response) {
          setXMLLink(response);
        }
       
      } catch (error) {
        console.error("下载失败:", error);
        // message.error("下载失败");
      }
    }
    fetchXML();
  }, [])
  return (
 <div 
      className="svg-container"
      dangerouslySetInnerHTML={{ __html: xmlLink }}
    />
  );
};

export default RightContent;
