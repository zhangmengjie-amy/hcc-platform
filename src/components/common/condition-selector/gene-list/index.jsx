"use client";
import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useCallback,
} from "react";
import { getGeneList, getValidGeneList } from "@/configs/request";
import { FixedSizeList } from "react-window";
import { debounce } from "lodash";
import EmptyLoading from "@/components/empty-loading";
import { CaretRightOutlined } from "@ant-design/icons";
import {
  Collapse,
  Radio,
  Tag,
  Tooltip,
  Button,
  Flex,
  Typography,
  Space,
  Upload,
  Input,
  Checkbox,
  Select,
  Row,
  Col,
  List,
  message,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "../style.module.scss";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const GENE_SET_COLOR = {
  "Broad spectrum of tumor Biomarkers": "purple",
  "Classic HCC Biomarkers": "green",
  "Immune Biomarkers": "blue",
};
const RELOAD_ICON = "/images/reload.svg";
const IMPORT_SRC = "/images/import.svg";
const DRIVER_COLORS = ["rgb(239, 207, 210)", "rgb(205, 205, 205)"];
const GeneList = forwardRef(({ onChange, onReady }, ref) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [filteredList, setFilteredList] = useState([]);
  const [geneList, setGeneList] = useState([]);
  const [driverList, setDriverList] = useState("driver");
  const [filterValue, setFilterValue] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const listRef = useRef(null);
  const geneRef = useRef(null);
  const filteredRef = useRef(null);

  const handleDriverReload = () => {};

  const loadMoreGene = useCallback(
    debounce(() => {
      if (loadMoreLoading) return;
      setLoadMoreLoading(true);
      getGeneList(current + 1, DEFAULT_PAGE_SIZE, filterValue ?? "")
        .then((newData) => {
          if (newData?.data?.records.length === 0) {
            return;
          }
          filteredRef.current = [
            ...filteredRef.current,
            ...newData?.data?.records,
          ];
          setFilteredList(filteredRef.current);
          setCurrent((p) => p + 1);
        })
        .finally(() => {
          setLoadMoreLoading(false);
        });
    }, 300),
    [current, filterValue],
  );

  const handleGeneReload = (event) => {
    event.stopPropagation();
    const driverList = getDriverList();
    setGeneList(driverList);
  };

  const getDriverList = () => {
    return geneRef.current
      ?.filter((item) => !!item.isDriverGene)
      .map((item) => item.gene);
  };

  const handleImport = (event) => {
    event.stopPropagation();
  };

  useEffect(() => {
    setFetchLoading(true);
    getGeneList(DEFAULT_PAGE, DEFAULT_PAGE_SIZE, "").then((results) => {
      geneRef.current = results?.data?.records ?? [];
      filteredRef.current = results?.data?.records ?? [];
      setFilteredList(filteredRef.current);
      const driverList = getDriverList();

      onReady?.({
        geneList: getGeneListWithIsDeriverGene(driverList),
      });
      setGeneList(driverList);
      setFetchLoading(false);
    });
  }, []);

  const handleScroll = ({
    scrollOffset,
    scrollDirection,
    scrollUpdateWasRequested,
  }) => {
    if (scrollUpdateWasRequested || scrollDirection === "backward") return;
    const list = listRef.current;
    if (!list) return;

    const { props } = list;
    const totalHeight = props.itemCount * props.itemSize;
    const scrollBottom = scrollOffset + props.height;
    if (totalHeight - scrollBottom < 100) {
      loadMoreGene();
    }
  };

  const geneCollapseContent = () => {
    return (
      <div className={styles.searchCard} variant="borderless">
        {renderSearchInput()}
        <EmptyLoading loading={fetchLoading} hasData={!!filteredList?.length}>
          <Checkbox.Group style={{ width: "100%" }} value={geneList}>
            <FixedSizeList
              ref={listRef}
              height={
                30 * filteredList?.length < 260
                  ? 30 * filteredList?.length
                  : 260
              }
              itemCount={filteredList?.length ?? 0}
              itemSize={30}
              width="100%"
              onScroll={handleScroll}
            >
              {virtualRow}
            </FixedSizeList>
          </Checkbox.Group>
        </EmptyLoading>
        <div
          style={{ paddingTop: "5px", borderTop: "1px solid #d9d9d9" }}
        ></div>
        <Checkbox
          className={styles.checkAllDriver}
          checked={isAllDriverChecked()}
          indeterminate={existDriverChecked()}
          onChange={onCheckAllChange}
          style={{ marginBottom: 6 }}
        >
          {t("mutation:driver.check-all-driver")}
        </Checkbox>
        <Select
          maxTagCount={null}
          mode="multiple"
          size={"small"}
          suffixIcon={null}
          placeholder={t("mutation:selection-placeholder")}
          open={false}
          showSearch={false}
          value={geneList}
          tagRender={tagRender}
          onChange={setGeneList}
          style={{
            width: "100%",
            maxHeight: 74,
            overflowY: "auto",
            overflowX: "hidden",
            borderRadius: "4px",
            border: "1px solid #d9d9d9",
          }}
        />
      </div>
    );
  };

  const driverCollapseTitle = () => {
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
          {t("common:filter.filterByDriver")}
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

  const driverCollapseContent = () => {
    return (
      <div className={styles.searchCard} variant="borderless">
        <Radio.Group
          style={{ display: "block" }}
          value={driverList}
          onChange={onDriverChange}
        >
          <Row>
            <Col xs={20} sm={20} md={20} lg={20}>
              <Radio value={"driver"} label={t("mutation:driver.driver")}>
                {t("mutation:driver.driver")}
              </Radio>
            </Col>
            <Col xs={4} sm={4} md={4} lg={4}>
              <Typography.Paragraph
                style={{
                  textAlign: "right",
                  margin: 0,
                }}
              >
                {getGeneCount("driver")}
              </Typography.Paragraph>
            </Col>
          </Row>
          <Row>
            <Col xs={20} sm={20} md={20} lg={20}>
              <Radio
                value={"not-driver"}
                label={t("mutation:driver.not-driver")}
              >
                {t("mutation:driver.not-driver")}
              </Radio>
            </Col>
            <Col xs={4} sm={4} md={4} lg={4}>
              <Typography.Paragraph
                style={{
                  textAlign: "right",
                  margin: 0,
                }}
              >
                {getGeneCount("not-driver")}
              </Typography.Paragraph>
            </Col>
          </Row>
          <Row>
            <Col xs={20} sm={20} md={20} lg={20}>
              <Radio value={"all"} label={"All"}>
                {t("common:all")}
              </Radio>
            </Col>
            <Col xs={4} sm={4} md={4} lg={4}>
              <Typography.Paragraph
                style={{
                  textAlign: "right",
                  margin: 0,
                }}
              >
                {getGeneCount("all")}
              </Typography.Paragraph>
            </Col>
          </Row>
        </Radio.Group>
      </div>
    );
  };

  const handleSearchGene = debounce((_filterValue) => {
    if (loadMoreLoading) return;
    setLoadMoreLoading(true);
    getGeneList(1, DEFAULT_PAGE_SIZE, _filterValue)
      .then((newData) => {
        filteredRef.current = newData?.data?.records;
        setFilteredList(filteredRef.current);
        setCurrent(1);
      })
      .finally(() => {
        setLoadMoreLoading(false);
      });
  }, 300);

  const fuzzySearch = (e) => {
    setFilterValue(e.target.value);
    handleSearchGene(e.target.value);
  };

  const renderSearchInput = () => {
    return (
      <Input
        size={"middle"}
        style={{ marginBottom: 10 }}
        allowClear
        onChange={fuzzySearch}
        placeholder={t("common:search")}
      />
    );
  };

  const getSelectedDriverList = () => {
    return geneList?.filter(
      (item) =>
        !!geneRef.current?.find((gene) => gene.gene === item)?.isDriverGene,
    );
  };

  const getSelectedNoneDriverList = () => {
    return geneList?.filter(
      (item) =>
        !geneRef.current?.find((gene) => gene.gene === item)?.isDriverGene,
    );
  };

  const onCheckAllChange = (e) => {
    const _geneList = e.target.checked
      ? [...getSelectedNoneDriverList(), ...getDriverList()]
      : getSelectedNoneDriverList();
    setGeneList(_geneList);
  };

  const onGeneSelection = (e) => {
    let _geneList = [];
    if (e.target.checked) {
      _geneList = [...geneList, e.target.value];
    } else {
      const index = geneList.findIndex((item) => item == e.target.value);
      _geneList = [...geneList];
      _geneList.splice(index, 1);
    }
    setGeneList(_geneList);
  };

  const getGeneListWithIsDeriverGene = (list) => {
    return list.map((gene) => {
      return {
        gene,
        isDriverGene: !!geneRef.current.find((item) => item.gene == gene)
          ?.isDriverGene,
      };
    });
  };

  useEffect(() => {
    let finalGeneList = [];
    if (driverList == "driver") {
      finalGeneList = getGeneListWithIsDeriverGene(getSelectedDriverList());
    } else if (driverList == "not-driver") {
      finalGeneList = getGeneListWithIsDeriverGene(getSelectedNoneDriverList());
    } else {
      finalGeneList = getGeneListWithIsDeriverGene(geneList);
    }

    onChange({
      geneList: finalGeneList,
    });
  }, [geneList, driverList]);

  const onDriverChange = useCallback((e) => {
    const { value } = e.target;
    setDriverList(value);
  }, []);

  const virtualRow = ({ index, style }) => {
    return filteredList?.[index] ? (
      <List.Item style={style}>
        {
          <Checkbox
            value={filteredList?.[index]?.gene}
            onChange={onGeneSelection}
          >
            {filteredList?.[index]?.gene}
          </Checkbox>
        }
      </List.Item>
    ) : null;
  };

  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const option = geneRef.current.find((opt) => opt.gene === value);
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        color={!!option?.isDriverGene ? DRIVER_COLORS[0] : DRIVER_COLORS[1]}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 4 }}
      >
        {label}
      </Tag>
    );
  };

  const getGeneCount = (value) => {
    const driverCount = getSelectedDriverList()?.length ?? 0;
    if (value === "driver") {
      return driverCount;
    } else if (value === "not-driver") {
      return (geneList?.length ?? 0) - driverCount;
    }

    return geneList?.length;
  };

  const isAllDriverChecked = () => {
    return getDriverList()?.every((item) => geneList?.includes(item));
  };

  const existDriverChecked = () => {
    return (
      getDriverList()?.some((item) => geneList?.includes(item)) &&
      geneList?.length < getDriverList().length
    );
  };

  const checkGeneList = (data) => {
    if (!data?.length) return;
    const _geneList = Array.from(new Set(geneList.concat(data)));
    setGeneList(_geneList);
  };

  const uploadProps = {
    name: "file",
    accept: ".txt",
    showUploadList: false,
    action: "",
    headers: {
      authorization: "authorization-text",
    },
    beforeUpload: (file) => {
      const isTxt =
        file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

      if (!isTxt) {
        messageApi.open({
          type: "error",
          content: "Only txt files are allowed!",
        });
        return Upload.LIST_IGNORE;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target.result?.split("\r\n");
        getValidGeneList(content).then((validGeneList) => {
          if (!validGeneList?.data.length) {
            messageApi.open({
              type: "error",
              content: `File upload failed.`,
            });
          } else {
            messageApi.open({
              type: "success",
              content: `File uploaded successfully.`,
            });
            checkGeneList(validGeneList?.data?.map((item) => item.gene));
          }
        });
      };
      reader.onerror = () => {
        messageApi.open({
          type: "error",
          content: `File upload failed.`,
        });
      };
      reader.readAsText(file, "UTF-8");
      return false;
    },
  };

  const geneCollapseTitle = () => {
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
          {t("common:filter.filterByGene")}
        </Typography.Title>
        <Space>
          <Typography.Title
            level={5}
            ellipsis={{
              rows: 1,
              expandable: false,
            }}
            style={{ margin: 0, color: "#fff", fontWeight: "500" }}
          >
            {t("common:selectedCount")}: {geneList?.length || 0}
          </Typography.Title>
          <Tooltip placement="bottom" title={"Import"}>
            <Upload
              {...uploadProps}
              onClick={(event) => {
                handleImport(event);
              }}
            >
              <Button
                color="default"
                variant="text"
                style={{ color: "#fff", padding: 0 }}
              >
                <Image src={IMPORT_SRC} alt="import" width={18} height={18} />
              </Button>
            </Upload>
          </Tooltip>
          <Tooltip placement="bottom" title={t("common:resetSelection")}>
            <Button
              color="default"
              onClick={(event) => {
                handleGeneReload(event);
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
        </Space>
      </Flex>
    );
  };

  return (
    <>
      {contextHolder}
      <div className={styles.condition}>
        <Collapse
          defaultActiveKey={"gene"}
          className={styles.searchCollapse}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              style={{ fontSize: 14 }}
              rotate={isActive ? 90 : 0}
            />
          )}
          items={[
            {
              key: "gene",
              label: geneCollapseTitle(),
              children: geneCollapseContent(),
            },
          ]}
        ></Collapse>
        <Collapse
          defaultActiveKey={"driver"}
          className={styles.searchCollapse}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              style={{ fontSize: 14 }}
              rotate={isActive ? 90 : 0}
            />
          )}
          items={[
            {
              key: "driver",
              label: driverCollapseTitle(),
              children: driverCollapseContent(),
            },
          ]}
        ></Collapse>
      </div>
    </>
  );
});

export default GeneList;
