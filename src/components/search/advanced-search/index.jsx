"use client";
import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import GeneLollipop from "@/components/gene-lollipop";
import { getGeneList } from "@/configs/request";
import { FixedSizeList } from "react-window";
import { debounce } from "lodash";
import { clinicConfig } from "@/configs/mutation";
import { useRouter, usePathname } from "next/navigation";
import EmptyLoading from "@/components/empty-loading";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined, ApartmentOutlined, BranchesOutlined } from "@ant-design/icons";
import styles from "./style.module.scss";
import {
  Card,
  Collapse,
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
  Upload,
  Segmented,
  Slider,
  message,
} from "antd";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const RELOAD_ICON = "/images/reload.svg";
const SEARCH_SRC = "/images/search.svg";
const LEFT_SQUARE_SRC = "/images/left-square.svg";
const RIGHT_SQUARE_SRC = "/images/right-square.svg";
const IMPORT_SRC = "/images/import.svg";
const DRIVER_COLORS = ["rgb(239, 207, 210)", "rgb(205, 205, 205)"];
const DEFAULT_LEFT_PANEL_WIDTH = "25%";
const DEFAULT_RIGHT_PANEL_WIDTH = "75%";
const AdvancedSearch = () => {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [driverList, setDriverList] = useState(["driver", "not-driver"]);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [params, setParams] = useState({});
  const [current, setCurrent] = useState(1);
  const [geneList, setGeneList] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [sliderValue, setSliderValue] = useState([0, 1]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [clinicList, setClinicList] = useState({
    gender: [],
    age: [],
    race: [],
    stage: [],
    viralStatus: [],
  });
  const geneRef = useRef(null);
  const listRef = useRef(null);
  const paramsRef = useRef(null);
  const { t } = useTranslation();
  const router = useRouter();
  const uploadProps = {
    name: "file",
    accept: ".txt",
    showUploadList: false,
    action: "",
    headers: {
      authorization: "authorization-text",
    },
    beforeUpload: (file) => {
      const isTxt = file.type === "text/plain" ||
                file.name.toLowerCase().endsWith(".txt");

      if (!isTxt) {
        message.error("只能上传 txt 格式的文件!");
        return Upload.LIST_IGNORE;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target.result;
        console.log("file content:", content);
      };
      reader.onerror = () => {
        message.error("read faild");
      };
      reader.readAsText(file, "UTF-8");
      return false;
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const getSelectedDriverList = () => {
    return geneList?.filter((item) => !!geneRef.current.find((gene) => gene.gene === item)?.isDriverGene);
  };

  const getSelectedNoneDriverList = () => {
    return geneList?.filter((item) => !geneRef.current.find((gene) => gene.gene === item)?.isDriverGene);
  };

  const onCheckAllChange = e => {
    const _geneList = e.target.checked ? [...getSelectedNoneDriverList(), ...getDriverList()] : getSelectedNoneDriverList();
    setGeneList(_geneList);
    paramsRef.current = {
      ...paramsRef.current,
      geneList: getGeneListWithIsDeriverGene(_geneList),
    };

  };
  const geneCollapseContent = () => {
    return <Card className={styles.searchCard}
      variant="borderless" title={renderSearchInput()}>

      <EmptyLoading loading={fetchLoading} hasData={!!geneRef.current?.length}>
        <Checkbox.Group style={{ width: "100%" }} value={geneList}>
          <FixedSizeList
            ref={listRef}
            height={386}
            itemCount={geneRef.current?.length ?? 0}
            itemSize={30}
            width="100%"
            onScroll={handleScroll}
          >
            {virtualRow}
          </FixedSizeList>
          {/* {<Flex style={{ width: "100%", height: "20px" }} align='center' justify='center'><Spin indicator={<LoadingOutlined spin />} spinning={loadMoreLoading} /></Flex>} */}

        </Checkbox.Group>

      </EmptyLoading>
      <div style={{ borderTop: "1px solid #f0f0f0", padding: "2px 0" }}>{t("mutation:select-count")}: {geneList?.length || 0}</div>
      <Checkbox className={styles.checkAllDriver} checked={isAllDriverChecked()}
        indeterminate={existDriverChecked()}
        onChange={onCheckAllChange} style={{ marginBottom: 6 }}>
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
        style={{ width: "100%", maxHeight: 74, overflowY: "auto", overflowX: "hidden", borderRadius: "4px", border: "1px solid #d9d9d9" }}
      />
    </Card>;
  };

  const driverCollapseTitle = () => {
    return <Flex justify={"space-between"} align={"center"}>
      <Typography.Paragraph
        ellipsis={{
          rows: 1,
          expandable: false,
        }}
        style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{t("mutation:filter.driver")}</Typography.Paragraph>

      <Tooltip placement="bottom" title={t("common:reset-selection")}>
        <Button color="default" onClick={(event) => {
          handleDriverReload(event);
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
    </Flex>;
  };

  const driverCollapseContent = () => {
    return <Card className={styles.searchCard}
      variant="borderless">
      <Checkbox.Group style={{ display: "block" }} value={driverList} onChange={onDriverChange}>
        <Row>
          <Col xs={20} sm={20} md={20} lg={20}>
            <Checkbox
              value={"driver"}
              disabled={getGeneCount("driver") == 0}
              label={t("mutation:driver.driver")}>{t("mutation:driver.driver")}</Checkbox>

          </Col>
          <Col xs={4} sm={4} md={4} lg={4}>
            <Typography.Paragraph
              style={{
                textAlign: "right",
                margin: 0,
              }}>{getGeneCount("driver")}</Typography.Paragraph>
          </Col>
        </Row>
        <Row>
          <Col xs={20} sm={20} md={20} lg={20}>
            <Checkbox
              disabled={getGeneCount("not-driver") == 0}
              value={"not-driver"}
              label={t("mutation:driver.not-driver")}>{t("mutation:driver.not-driver")}</Checkbox>

          </Col>
          <Col xs={4} sm={4} md={4} lg={4}>
            <Typography.Paragraph
              style={{
                textAlign: "right",
                margin: 0,
              }}>{getGeneCount("not-driver")}</Typography.Paragraph>
          </Col>
        </Row>
      </Checkbox.Group>
    </Card>;
  };

  const clinicCollapseTitle = () => {
    return <Flex justify={"space-between"} align={"center"}>
      <Typography.Paragraph
        ellipsis={{
          rows: 1,
          expandable: false,
        }}
        style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{t("mutation:filter.clinic")}</Typography.Paragraph>

      <Tooltip placement="bottom" title={t("common:reset-selection")}>
        <Button color="default" onClick={(event) => {
          handleClinicReload(event);
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
    </Flex>;
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

    paramsRef.current = {
      ...paramsRef.current,
      geneList: getGeneListWithIsDeriverGene(_geneList),
    };
  };

  const onClinicChange = (value, parent) => {
    // if (value?.length === 0) {
    //     messageApi.open({
    //         type: 'warning',
    //         content: "You have no selected selection, you will get all samples",
    //         duration: 2,
    //         maxCount: 3
    //     });
    // }

    setClinicList({
      ...clinicList,
      [parent]: value,
    });
    paramsRef.current = {
      ...paramsRef.current,
      [parent]: value,
    };
  };

  const onDriverChange = (value) => {
    if (value.length === 0) {
      return;
    }
    setDriverList(value);
    if (value.length == 1) {
      if (value[0] == "driver") {
        paramsRef.current = {
          ...paramsRef.current,
          geneList: getGeneListWithIsDeriverGene(getSelectedDriverList()),
        };
      } else {
        paramsRef.current = {
          ...paramsRef.current,
          geneList: getGeneListWithIsDeriverGene(getSelectedNoneDriverList()),
        };
      }
    } else {
      paramsRef.current = {
        ...paramsRef.current,
        geneList: getGeneListWithIsDeriverGene(geneList),
      };
    }
  };

  const virtualRow = ({ index, style }) => (
    <List.Item style={style}>{<Checkbox
      value={geneRef.current?.[index].gene}
      onChange={onGeneSelection}>{geneRef.current?.[index].gene}</Checkbox>}</List.Item>
  );

  const onPreventMouseDown = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    const option = geneRef.current.find(opt => opt.gene === value);
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

  const renderSearchInput = () => {
    return showSearchInput ? <Input size={"middle"} allowClear onChange={fuzzySearch} placeholder={t("common:search")} /> : "";
  };

  const getGeneCount = (value) => {
    const driverCount = getSelectedDriverList()?.length ?? 0;
    if (value === "driver") {
      return driverCount;
    }
    return ((geneList?.length ?? 0) - driverCount);
  };

  const isAllDriverChecked = () => {
    return getDriverList()?.every(item => geneList?.includes(item));
  };

  const existDriverChecked = () => {
    return getDriverList()?.some(item => geneList?.includes(item)) && geneList?.length < getDriverList().length;
  };

  const clinicCollapseContent = () => {
    return <Card className={styles.clinicCard} style={{ height: "auto", overflowY: "scroll", overflowX: "hidden" }}
      variant="borderless">
      <Row key={"clinicContent"}>
        {
          clinicConfig?.map((item, index) => {
            return <Col xs={12} md={12} lg={12} key={item.key}>
              <Timeline
                items={[{
                  dot: <Image src={`/images/${item.key == "stage" ? "tnm-stage-v8" : item.key}.svg`} width={15} height={15} alt={item.key}></Image>,
                  children: <Checkbox.Group value={clinicList[item.key]} onChange={(value) => { onClinicChange(value, item.key); }} key={index}>
                    <Row key={item.key}>
                      <Typography.Title
                        level={5}
                        style={{ fontSize: "14px" }}>{t(`mutation:sample.${item.key}`)}</Typography.Title>
                      {
                        item.children?.map((child) => {
                          return (
                            <Col xs={24} sm={24} md={24} lg={24}
                              key={child.key}>

                              <Checkbox value={child.key}
                                label={child.title}><Typography.Paragraph style={{ margin: 0 }} ellipsis={{
                                  rows: 1,
                                  expandable: false,
                                }}>{t(`mutation:sample.${child.key}`)}</Typography.Paragraph></Checkbox>
                            </Col>
                          );
                        })
                      }
                    </Row>
                  </Checkbox.Group>,
                }]}></Timeline></Col>;
          })
        }
      </Row>
    </Card>;
  };
  useEffect(() => {
    setFetchLoading(true);
    getGeneList(DEFAULT_PAGE, DEFAULT_PAGE_SIZE, "").then((results) => {
      geneRef.current = results?.records ?? [];
      const driverList = getDriverList();
      const _params = {
        ...paramsRef.current,
        ...clinicList,
        sampleType: "bySample",
        geneList: getGeneListWithIsDeriverGene(driverList),
      };
      setGeneList(driverList);
      setParams(_params);
      paramsRef.current = _params;

      //     dispatch({ type: 'driver_landscape_filter_conditions', payload: {
      //     ...params,
      //     geneList: _params?.geneList.map((gene) => {
      //         return {
      //             gene,
      //             isDriver: geneRef.current.find((item) => item.gene == gene)?.isDriver
      //         }
      //     }),
      // } });
      setFetchLoading(false);
    });

  }, []);

  const getGeneListWithIsDeriverGene = (list) => {
    return list.map((gene) => {
      return {
        gene,
        isDriverGene: !!geneRef.current.find((item) => item.gene == gene)?.isDriverGene,
      };
    });
  };

  const getDriverList = () => {
    return geneRef.current?.filter((item) => !!item.isDriverGene).map((item) => item.gene);
  };

  const handleSearch = (event) => {
    event.stopPropagation();
    setShowSearchInput(!showSearchInput);
  };

  const handleImport = (event) => {
    event.stopPropagation();
  };

  const fuzzySearch = (e) => {
    setFilterValue(e.target.value);
    handleSearchGene(e.target.value);
  };

  const handleGeneReload = (event) => {
    event.stopPropagation();
    const driverList = getDriverList();
    setGeneList(driverList);
    paramsRef.current = {
      ...paramsRef.current,
      geneList: getGeneListWithIsDeriverGene(driverList),
    };
  };
  const handleDNAReload = (event) => {
    event.stopPropagation();
    setSliderValue([0, 1]);
  };

  const handleDriverReload = (event) => {
    event.stopPropagation();
    setDriverList(["driver", "not-driver"]);
  };
  const geneCollapseTitle = () => {
    return <Flex justify={"space-between"} align={"center"}>
      <Typography.Paragraph
        ellipsis={{
          rows: 1,
          expandable: false,
        }}
        style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{t("mutation:filter.gene")}</Typography.Paragraph>
      <Space>
        <Tooltip placement="bottom" title={"Import"}>
          <Upload {...uploadProps} onClick={(event) => {
            handleImport(event);
          }}>
            <Button color="default" variant="text"
              style={{ color: "#fff", padding: 0 }}>
              <Image
                src={IMPORT_SRC}
                alt="import"
                width={18}
                height={18}
              />
            </Button>
          </Upload>
        </Tooltip>
        <Tooltip placement="bottom" title={"Search"}>
          <Button color="default" onClick={(event) => {
            handleSearch(event);
          }} variant="text"
          style={{ color: "#fff", padding: 0 }}>
            <Image
              src={SEARCH_SRC}
              alt="search"
              width={18}
              height={18}
            />
          </Button>
        </Tooltip>
        <Tooltip placement="bottom" title={t("common:reset-selection")}>
          <Button color="default" onClick={(event) => {
            handleGeneReload(event);
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
  const DNACollapseTitle = () => {
    return <Flex justify={"space-between"} align={"center"}>
      <Typography.Paragraph
        ellipsis={{
          rows: 1,
          expandable: false,
        }}
        style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{t("mutation:filter.DNA_ITH")}</Typography.Paragraph>
      <Space>
        <Tooltip placement="bottom" title={t("common:reset-selection")}>
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

  const DNACollapseContent = () => {
    return <Slider value={sliderValue} onChange={setSliderValue} tooltip={{
      placement: "top",
      open: true,
      getPopupContainer: (triggerNode) => triggerNode,
      align: {
        offset: [0, -10],
      },
    }} style={{ margin: "50px 20px 20px 20px" }} min={0} max={1} step={0.01} range={{ draggableTrack: true }} defaultValue={[0, 1]} />;
  };

  const loadMoreGene = useCallback(
    debounce(() => {
      if (loadMoreLoading) return;
      setLoadMoreLoading(true);
      getGeneList(current + 1, DEFAULT_PAGE_SIZE, filterValue)
        .then(newData => {
          geneRef.current = [...geneRef.current, ...newData.records];
          setCurrent(p => p + 1);
        })
        .finally(() => {
          setLoadMoreLoading(false);
        });
    }, 300),
    [current, filterValue],
  );

  const handleSearchGene = debounce((_filterValue) => {
    if (loadMoreLoading) return;
    setLoadMoreLoading(true);
    getGeneList(1, DEFAULT_PAGE_SIZE, _filterValue)
      .then(newData => {
        geneRef.current = newData.records;
        setCurrent(1);
      })
      .finally(() => {
        setLoadMoreLoading(false);
      });
  }, 300);


  const handleScroll = ({ scrollOffset, scrollDirection, scrollUpdateWasRequested }) => {
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

  const onSearch = (value) => {
    router.push(`/search?query=${!!value ? value : "TP53,CNNTB1,AXIN1"}`);
  };
  return (
    <>
      <div className={styles.searchCard}>
        <Flex align="center" justify="space-between" style={{ width: "50%" }}>
          <Input.Search
            // loading
            className={styles.hccSearch}
            placeholder={t("home:search.placeholder")}
            enterButton
            value={searchQuery}
            size="large"
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            onSearch={onSearch}
          />
          <Button size="large" style={{ marginLeft: "10px", lineHeight: "40px", borderColor: "rgb(10, 186, 181)", backgroundColor: "rgb(10, 186, 181)" }}>Advanced Search</Button>
        </Flex>
      </div>
      <Row className={styles.searchCard}>
        <Col xs={12} md={12} lg={12} className={styles.chart} >
          <Collapse
            defaultActiveKey={"gene"}
            className={styles.searchCollapse}
            expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
            items={[{
              key: "gene",
              label: geneCollapseTitle(),
              children: geneCollapseContent(),
            }]}>
          </Collapse></Col>
        <Col xs={12} md={12} lg={12} className={styles.chart} >
          <Collapse
            defaultActiveKey={"clinic"}
            className={styles.searchCollapse}
            expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
            items={[{
              key: "clinic",
              label: clinicCollapseTitle(),
              children: clinicCollapseContent(),

            }]}>
          </Collapse>
        </Col>
      </Row>
      {/* <Row className={styles.searchCard}>
                <Col xs={12} md={12} lg={12} className={styles.chart} >
                    <Collapse
                        defaultActiveKey={"driver"}
                        className={styles.searchCollapse}
                        expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
                        items={[{
                            key: "driver",
                            label: driverCollapseTitle(),
                            children: driverCollapseContent()

                        }]}>
                    </Collapse></Col>
                <Col xs={12} md={12} lg={12} className={styles.chart} >
                    <Collapse
                        defaultActiveKey={"HNA_ITH"}
                        className={styles.searchCollapse}
                        expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
                        items={[{
                            key: "HNA_ITH",
                            label: DNACollapseTitle(),
                            children: DNACollapseContent()
                        }]}>
                    </Collapse>
                </Col>
            </Row> */}


      <div className={styles.searchCard}>
        <GeneLollipop></GeneLollipop>

      </div>
    </>

  );
};
export default AdvancedSearch;
