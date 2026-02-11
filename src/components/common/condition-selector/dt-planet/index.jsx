"use client";
import React, {
  useEffect,
  useState,
  forwardRef,
} from "react";
import { CaretRightOutlined } from "@ant-design/icons";

import { Collapse, Radio, Tooltip, Button, Flex, Typography } from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "../style.module.scss";

const RELOAD_ICON = "/images/reload.svg";
const INIT_COHORT_TYPE = "PLANET";
const CohortType = forwardRef(({ onChange, onReady }, ref) => {
  const { t } = useTranslation();
  const [cohortType, setCohortType] = useState(INIT_COHORT_TYPE);
  const handleReload = (event) => {
    event.stopPropagation();
    setCohortType(INIT_COHORT_TYPE);
    if (onChange) {
      onChange({
        selectedCohortType: INIT_COHORT_TYPE,
      });
    }
  };

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

        <Tooltip placement="bottom" title={t("common:resetSelection")}>
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
              <Radio value={"ALL"}>{t("common:all")}</Radio>
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
