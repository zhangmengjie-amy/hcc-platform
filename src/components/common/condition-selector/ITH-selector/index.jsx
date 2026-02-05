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

import { Collapse, Tooltip, Button, Flex, Typography, Space, Slider  } from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "../style.module.scss";

const RELOAD_ICON = "/images/reload.svg";
const CohortType = forwardRef(({ onChange, onReady }, ref) => {
  const { t } = useTranslation();
  const [sliderValue, setSliderValue] = useState([0, 1]);

  useEffect(() => {
    onReady && onReady([0, 1]);
  }, []);

  const handleDNAReload = (event) => {
    event.stopPropagation();
    setSliderValue([0, 1]);
    onChange?.([0, 1]);
  };

  const DNACollapseTitle = () => {
    return <Flex justify={"space-between"} align={"center"}>
      <Typography.Title
        level={5}
        ellipsis={{
          rows: 1,
          expandable: false,
        }}
        style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{t("common:filter.filterByITH")}</Typography.Title>
      <Space>
        <Tooltip placement="bottom" title={t("common:resetSelection")}>
          <Button color="default" onClick={(event) => {
            handleDNAReload(event);
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
      </Space>
    </Flex>;
  };

  const handleITHChange = (value) => {
    setSliderValue(value);
    onChange?.(value);
  };

  const DNACollapseContent = () => {
    return <Slider value={sliderValue} onChange={handleITHChange} tooltip={{
      placement: "top",
      open: true,
      getPopupContainer: (triggerNode) => triggerNode,
      align: {
        offset: [0, -10],
      },
    }} style={{ margin: "50px 20px 0" }} min={0} max={1} step={0.01} range={{ draggableTrack: true }} defaultValue={[0, 1]} />;
  };

  return (
    <div className={styles.condition}>
      <Collapse
        defaultActiveKey={"HNA_ITH"}
        className={styles.searchCollapse}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: 14 }}
            rotate={isActive ? 90 : 0}
          />
        )}
        items={[
          {
            key: "HNA_ITH",
            label: DNACollapseTitle(),
            children: DNACollapseContent(),
          },
        ]}
      ></Collapse>
    </div>
  );
});

export default CohortType;
