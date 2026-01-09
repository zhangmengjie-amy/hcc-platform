"use client";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  forwardRef,
} from "react";
import { CaretRightOutlined } from "@ant-design/icons";

import { Collapse, Radio, Tooltip, Button, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { getCohortList } from "@/configs/request";
import { FixedSizeList } from "react-window";
import styles from "../style.module.scss";
import { use } from "react";

const RELOAD_ICON = "/images/reload.svg";
const DEGMethod = forwardRef(({ onChange, onReady }, ref) => {
  const { t } = useTranslation();
  const [method, setMethod] = useState("cibersort");
  const handleReload = () => {};
  const methodCollapseTitle = () => {
    return (
      <Flex justify={"space-between"} align={"center"}>
        <Typography.Title
          level={5}
          ellipsis={{
            rows: 1,
            expandable: false,
          }}
          style={{ margin: 0, color: "#fff", fontWeight: "500" }}
        >
          Method
        </Typography.Title>

        <Tooltip placement="bottom" title={t("common:reset-selection")}>
          <Button
            color="default"
            onClick={(event) => {
              handleReload(event);
            }}
            variant="text"
            style={{ color: "#fff", padding: 0 }}
          >
            <Image
              src={RELOAD_ICON}
              alt="reload"
              width={16}
              height={16}
              tooltip={t("common:reload")}
            />
          </Button>
        </Tooltip>
      </Flex>
    );
  };

  const onSelection = useCallback((e) => {
    setMethod(e.target.value);
    onChange({
      selectedMethod: e.target.value,
    });
  }, []);

  useEffect(() => {
    onReady &&
      onReady({
        selectedMethod: method,
      });
  }, []);

  const methodCollapseContent = () => {
    return (
      <div className={styles.searchCard} variant="borderless">
        <Flex
          vertical
          flex={1}
          style={{
            border: "1px solid #f5f5f5",
            boxShadow: "0 4px 12px #f5f5f5",
            padding: "15px",
            borderRadius: "12px",
          }}
        >
          <Radio.Group
            value={method}
            onChange={onSelection}
          >
            <Flex vertical flex={1}>
              <Radio value={"cibersort"}>cibersort</Radio>
              <Radio value={"epic"}>epic</Radio>
              <Radio value={"estimate"}>estimate</Radio>
              <Radio value={"mcpcounter"}>mcpcounter</Radio>
              <Radio value={"quantiseq"}>quantiseq</Radio>
              <Radio value={"timer"}>timer</Radio>
              <Radio value={"xcell"}>xcell</Radio>
            </Flex>
          </Radio.Group>
        </Flex>
      </div>
    );
  };

  return (
    <div className={styles.condition}>
      <Collapse
        defaultActiveKey={"method"}
        className={styles.searchCollapse}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: 14 }}
            rotate={isActive ? 90 : 0}
          />
        )}
        items={[
          {
            key: "method",
            label: methodCollapseTitle(),
            children: methodCollapseContent(),
          },
        ]}
      ></Collapse>
    </div>
  );
});

export default DEGMethod;
