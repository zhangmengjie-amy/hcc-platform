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

const Split = ({ leftContent, rightContent, leftAction, rightAction, initialLeftWidth = DEFAULT_LEFT_PANEL_WIDTH, initialRightWidth = DEFAULT_RIGHT_PANEL_WIDTH }) => {
  const { t } = useTranslation();
  const [leftPanelSize, setLeftPanelSize] = useState(initialLeftWidth);
  const [rightPanelSize, setRightPanelSize] = useState(initialRightWidth);

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

  return (
    <>
      <Splitter className={styles.hccSlitter} lazy onResize={onPanelChange}>
        <Panel className={styles.panel} size={leftPanelSize} min={"20%"} max="50%">
          <div style={{ margin: "10px" }}>
            <Flex justify="space-between" align="center">
              <>{leftAction}</> 
              <Button color="default" variant="text"
                onClick={leftPanelFullScreen}
                style={{ color: "#fff", padding: 0, marginLeft: "auto" }}>
                <Image
                  src={LEFT_SQUARE_SRC}
                  alt="import"
                  width={30}
                  height={30}
                />
              </Button>
            </Flex>
            {leftContent}
          </div>
        </Panel>
        <Panel className={styles.panel} size={rightPanelSize} min={"20%"} max="80%">
          <div style={{ margin: "10px" }}>
            <Flex justify="space-between" align="center">
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
          </div>
        </Panel>
      </Splitter>
    </>
  );
};

export default Split;