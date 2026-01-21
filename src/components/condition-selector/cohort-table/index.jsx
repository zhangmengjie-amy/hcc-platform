"use client";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from "react";
import {
  CaretRightOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import {
  Collapse,
  Table,
  Tag,
  Tooltip,
  Button,
  Spin,
  Flex,
  message,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { getCohortList } from "@/configs/request";
import styles from "../style.module.scss";
const CLASSIFY_COLOR = {
  "Tissue": "purple",
  "Celllines": "green",
};

const LEVEL_COLOR = {
  "Intra": "cyan",
  "Inter": "blue",
  "Inter+Intra": "lime",
};

const TECHNOLOGY_COLOR = {
  "Micro array": "orange",
  "Sequencing": "magenta",
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
    const [messageApi, contextHolder] = message.useMessage();
    const { t } = useTranslation();
    const paramsRef = useRef(null);
    const cohortListRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [cohortList, setCohortList] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    useEffect(() => {
      setLoading(true);
      getCohortList().then((data) => {
        cohortListRef.current = data;
        setCohortList(data);
        setLoading(false);
        setSelectedRowKeys([data?.[0]?.number, data?.[1]?.number]);
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
        render: (text) => text,
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

    const handleReload = () => {
      
    };

    const tableCollapseTitle = () => {
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
            Cohort List
          </Typography.Title>
          <Typography.Paragraph
            ellipsis={{
              rows: 1,
              expandable: false,
            }}
            style={{ margin: 0, color: "#fff", fontWeight: "500" }}
          >
            至多选择5个
          </Typography.Paragraph>
          <Typography.Paragraph
            ellipsis={{
              rows: 1,
              expandable: false,
            }}
            style={{ margin: 0, color: "#fff", fontWeight: "500" }}
          >
            已选择 { selectedRowKeys.length ?? 0 }个  
          </Typography.Paragraph>
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

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        if (selectedRows?.length > 10) {
          messageApi.open({
            type: "warning",
            content: "最多选择10条",
          });
          return;
        }
        setSelectedRowKeys(selectedRowKeys);
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
                defaultSelectedRowKeys: selectedRowKeys,
                selectedRowKeys: selectedRowKeys,
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
      <>
        { contextHolder }
        <div className={styles.condition}>
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
      </>
    );
  },
);

export default CohortSelection;
