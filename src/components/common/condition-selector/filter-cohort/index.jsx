"use client";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  forwardRef,
  useMemo,
} from "react";
import {
  CaretRightOutlined,
} from "@ant-design/icons";


import {
  Collapse,
  Radio,
  Tooltip,
  Checkbox,
  Button,
  Flex,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "../style.module.scss";

const RELOAD_ICON = "/images/reload.svg";
const FilterCohort = forwardRef(({ onChange }, ref) => {
  const { t } = useTranslation();
  const paramsRef = useRef(null);
  const [selectedClinical, setSelectedClinical] = useState([]);
  const [selectedClassify, setSelectedClassify] = useState("all");
  const [selectedTechnology, setSelectedTechnology] = useState("all");

  const handleDriverReload = () => {};

  useImperativeHandle(ref, () => ({
    getParams: () => {
      return paramsRef.current;
    },
  }));

  useEffect(() => {
    onChange({
      selectedClassify,
      selectedClinical,
      selectedTechnology,
    });

  }, [selectedClassify, selectedClinical, selectedTechnology]);

  const cohortCollapseTitle = () => {
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
          {t("common:filter.filterCohort")}
        </Typography.Title>

        <Tooltip placement="bottom" title={t("common:resetSelection")}>
          <Button
            color="default"
            onClick={(event) => {
              handleDriverReload(event);
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

  const cohortCollapseContent = () => {
    return (
      <div className={styles.searchCard} variant="borderless">
        <Flex>
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
            <Typography.Title level={5}>{t("common:clinical.title")}</Typography.Title>
            <Checkbox.Group
              onChange={setSelectedClinical}
              value={selectedClinical}
            >
              <Flex vertical>
                <Checkbox value="nt">{t("common:clinical.nt")}</Checkbox>
                <Checkbox value="hbv">{t("common:clinical.hbv")}</Checkbox>
                <Checkbox value="hcv">{t("common:clinical.hcv")}</Checkbox>
                <Checkbox value="age">{t("common:clinical.age")}</Checkbox>
                <Checkbox value="race">{t("common:clinical.race")}</Checkbox>
                <Checkbox value="stage">{t("common:clinical.stage")}</Checkbox>
                <Checkbox value="gene">{t("common:gene")}</Checkbox>
              </Flex>
            </Checkbox.Group>
          </Flex>
          <Flex
            vertical
            flex={1}
            style={{
              marginLeft: "15px",
              border: "1px solid #f5f5f5",
              boxShadow: "0 4px 12px #f5f5f5",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <Typography.Title level={5}>{t("common:classify")}</Typography.Title>
            <Radio.Group
              onChange={(e) => {
                setSelectedClassify(e.target.value);
              }}
              value={selectedClassify}
            >
              <Flex vertical>
                <Radio value="Tissue">{t("common:tissue")}</Radio>
                <Radio value="Celllines">{t("common:celllines")}</Radio>
                <Radio value="all">{t("common:all")}</Radio>
              </Flex>
            </Radio.Group>
          </Flex>
          <Flex
            vertical
            flex={1}
            style={{
              marginLeft: "15px",
              border: "1px solid #f5f5f5",
              boxShadow: "0 4px 12px #f5f5f5",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <Typography.Title level={5}>{t("common:technology")}</Typography.Title>
            <Radio.Group
              onChange={(e) => {
                setSelectedTechnology(e.target.value);
              }}
              value={selectedTechnology}
            >
              <Flex vertical>
                <Radio value="Sequencing">{t("common:sequence")}</Radio>
                <Radio value="Micro array">{t("common:microarray")}</Radio>
                <Radio value="all">{t("common:all")}</Radio>
              </Flex>
            </Radio.Group>
          </Flex>
        </Flex>
      </div>
    );
  };

  
  return (
    <div className={styles.condition}>
      <Collapse
        defaultActiveKey={"cohort"}
        className={styles.searchCollapse}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: 14 }}
            rotate={isActive ? 90 : 0}
          />
        )}
        items={[
          {
            key: "cohort",
            label: cohortCollapseTitle(),
            children: cohortCollapseContent(),
          },
        ]}
      ></Collapse>
    </div>
  );
});

export default FilterCohort;
