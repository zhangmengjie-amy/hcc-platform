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
import { usePDF } from "react-to-pdf";
import {
  getGeneList,
  getValidGeneList,
  getGeneSetList,
} from "@/configs/request";
import {
  CaretRightOutlined,
  LinkOutlined,
  UploadOutlined,
  ApartmentOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import {
  Card,
  Collapse,
  Radio,
  Table,
  Row,
  Col,
  Tag,
  Tooltip,
  Space,
  List,
  Checkbox,
  Button,
  Affix,
  Spin,
  Flex,
  Input,
  Splitter,
  Typography,
  Select,
  Timeline,
  Slider,
  message,
  Upload,
  Segmented,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { getCohortList } from "@/configs/request";
import styles from "../style.module.scss";
import { use } from "react";
const CLASSIFY_COLOR = {
  Tissue: "purple",
  Celllines: "green",
};

const LEVEL_COLOR = {
  Intra: "cyan",
  Inter: "blue",
  "Inter+Intra": "lime",
};

const TECHNOLOGY_COLOR = {
  "Micro array": "orange",
  Sequencing: "magenta",
};
const RELOAD_ICON = "/images/reload.svg";
const CohortSelection = forwardRef(
  (
    {
      selectionType = "checkbox",
      onChange,
      onReady,
      selectedClinical = null,
      selectedClassify = null,
      selectedTechnology = null,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const paramsRef = useRef(null);
    const cohortListRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [cohortList, setCohortList] = useState([]);

    useEffect(() => {
      setLoading(true);
      getCohortList().then((data) => {
        cohortListRef.current = data;
        setCohortList(data);
        setLoading(false);
        onReady({ selectedRows: [data?.[0], data?.[1]] });
      });
    }, []);

    useEffect(() => {
      const filteredCohort = cohortListRef.current?.filter((item) => {
        const matchClinical =
          selectedClinical?.length == 0 ||
          selectedClinical?.every((clinical) => {
            return item[clinical] === "Yes";
          });
        const matchClassify =
          !selectedClassify ||
          selectedClassify == "all" ||
          selectedClassify == item.classify;
        const matchTechnology =
          !selectedTechnology ||
          selectedTechnology == "all" ||
          selectedTechnology == item.techonology;
        return matchClassify && matchTechnology && matchClinical;
      });

      setCohortList(filteredCohort);
    }, [selectedClassify, selectedClinical, selectedTechnology]);

    const columns = [
      {
        title: "Cohort",
        dataIndex: "number",
        render: (text) => <a style={{ fontSize: "16px" }}>{text}</a>,
      },
      {
        title: "Level",
        dataIndex: "level",
        render: (text) => (
          <Tag
            style={{ display: "block", textAlign: "center" }}
            color={LEVEL_COLOR[text]}
          >
            {text}
          </Tag>
        ),
      },
      {
        title: "Technology",
        dataIndex: "techonology",
        render: (text) => (
          <Tag
            style={{ display: "block", textAlign: "center" }}
            color={TECHNOLOGY_COLOR[text]}
          >
            {text}
          </Tag>
        ),
      },
      {
        title: "Classify",
        dataIndex: "classify",
        render: (text) => (
          <Tag
            style={{ display: "block", textAlign: "center" }}
            color={CLASSIFY_COLOR[text]}
          >
            {text}
          </Tag>
        ),
      },
      {
        title: "DOI",
        dataIndex: "doi",
        render: (text) => (
          <Tooltip title={`https://doi.org/${text}`} placement="top">
            <Tag>
              <a href={`https://doi.org/${text}`} target="_blank">
                <LinkOutlined />
              </a>
            </Tag>
          </Tooltip>
        ),
      },
    ];
    useImperativeHandle(ref, () => ({
      getParams: () => {
        return paramsRef.current;
      },
    }));

    const tableCollapseTitle = () => {
      return (
        <Flex justify={"space-between"} align={"center"}>
          <Typography.Paragraph
            ellipsis={{
              rows: 1,
              expandable: false,
            }}
            style={{ margin: 0, color: "#fff", fontWeight: "500" }}
          >
            Cohort List
          </Typography.Paragraph>
          <Typography.Paragraph
            ellipsis={{
              rows: 1,
              expandable: false,
            }}
            style={{ margin: 0, color: "#fff", fontWeight: "500" }}
          >
            至多选择10个
          </Typography.Paragraph>
          {/* <Tooltip placement="bottom" title={t("common:reset-selection")}>
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
          </Tooltip> */}
        </Flex>
      );
    };

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        if (selectedRows?.length > 10) return;
        onChange({ selectedRows });
      },
      getCheckboxProps: (record) => ({
        disabled: false,
        name: record.name,
      }),
    };

    const tableCollapseContent = () => {
      return (
        <div className={styles.searchCard} variant="borderless">
          {loading ? (
            <Flex align="center" justify="center">
              <Spin></Spin>
            </Flex>
          ) : (
            <Table
              rowKey="number" // 或者使用函数
              pagination={{ size: 10 }}
              size="small"
              loading={loading}
              rowSelection={{
                type: selectionType,
                defaultSelectedRowKeys: [cohortList?.[0]?.number, cohortList?.[1]?.number,],
                ...rowSelection,
              }}
              columns={columns}
              dataSource={cohortList}
            />
          )}
        </div>
      );
    };

    return (
      <div className={styles.cohortCondition}>
        <Collapse
          defaultActiveKey={"table"}
          className={styles.searchCollapse}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              style={{ fontSize: 14 }}
              rotate={isActive ? 90 : 0}
            />
          )}
          items={[
            {
              key: "table",
              label: tableCollapseTitle(),
              children: tableCollapseContent(),
            },
          ]}
        ></Collapse>
      </div>
    );
  },
);

export default CohortSelection;
