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
import { select } from "d3-selection";

const RELOAD_ICON = "/images/reload.svg";
const INIT_COHORT_TYPE = "PLANET";
const CohortType = forwardRef(({ onChange, onReady }, ref) => {
  const { t } = useTranslation();
  const [cohortType, setCohortType] = useState(INIT_COHORT_TYPE);
  const handleReload = () => {};

  useEffect(() => {
    onReady && onReady({
      selectedCohortType: INIT_COHORT_TYPE,
    });
  }, []);

  const handleCohortTypeChange = (e) => {
    setCohortType(e.target.value);
    if (onChange) {
      onChange({
        selectedCohortType: e.target.value,
      });
    }
  };

  const cohortTypeCollapseTitle = () => {
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
          {t("common:filter.cohortType")}
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

  const cohortTypeCollapseContent = () => {
    return (
      <div className={styles.searchCard} variant="borderless">
        <Flex
          vertical
          flex={1}
        >
          <Radio.Group
            value={cohortType}
            onChange={handleCohortTypeChange}
          >
            <Flex flex={1}>
              <Radio value={"PLANET"}>PLANET</Radio>
              <Radio value={"DT"}>DT</Radio>
              <Radio value={"ALL"}>ALL</Radio>
            </Flex>
          </Radio.Group>
        </Flex>
      </div>
    );
  };

  return (
    <div className={styles.condition}>
      <Collapse
        defaultActiveKey={"cohortType"}
        className={styles.searchCollapse}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        items={[
          {
            key: "cohortType",
            label: cohortTypeCollapseTitle(),
            children: cohortTypeCollapseContent(),
          },
        ]}
      ></Collapse>
    </div>
  );
});

export default CohortType;
