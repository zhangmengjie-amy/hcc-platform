"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getGeneList, getFullMutations, getFullClinical } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, DownloadOutlined, AppstoreOutlined, ApartmentOutlined, BranchesOutlined } from '@ant-design/icons';
import { FixedSizeList } from 'react-window';
import { debounce } from 'lodash';
import EmptyLoading from "@/components/emptyLoading";
import ExportPdfButton from '@/components/exportPdf';
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
    Empty,
    Upload,
    Segmented,
    Skeleton,
    message
} from 'antd';
import DriverLandscape from "@/components/mutation/driverLandscape";
import PhylogeneticRelationship from "@/components/mutation/phylogeneticRelationship";
import { useTranslation } from "react-i18next";
import { mutationTypeColorConfig, clinicColorConfig } from "@/configs/mutation";
import { useDispatch } from 'react-redux';
import Image from 'next/image';
import styles from "./style.module.scss";
import { clinicConfig } from '@/configs/mutation';
const { Panel } = Splitter;
const RELOAD_ICON = "/images/reload.svg";
const SEARCH_SRC = "/images/search.svg";
const IMPORT_SRC = "/images/import.svg";
const LEFT_SQUARE_SRC = "/images/left-square.svg";
const RIGHT_SQUARE_SRC = "/images/right-square.svg";
const EXPORT_PDF = "/images/export.svg";
const DRIVER_COLORS = ["rgb(210, 235, 227)", "rgb(205, 205, 205)"];
const DEFAULT_LEFT_PANEL_WIDTH = "25%";
const DEFAULT_RIGHT_PANEL_WIDTH = "75%";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_IS_DRIVER_GENE = true;



const Mutation = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [driverList, setDriverList] = useState(["driver", "not-driver"]);
    const [mutationTypeTab, setMutationTypeTab] = useState("driverLandscape");
    const [sampleType, setSampleType] = useState("bySample");
    const [applyLoading, setApplyLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [params, setParams] = useState({});
    const [leftPanelSize, setLeftPanelSize] = useState(DEFAULT_LEFT_PANEL_WIDTH);
    const [rightPanelSize, setRightPanelSize] = useState(DEFAULT_RIGHT_PANEL_WIDTH);
    const [filterValue, setFilterValue] = useState("");
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [current, setCurrent] = useState(1);
    const [geneList, setGeneList] = useState([]);

    const [clinicList, setClinicList] = useState({
        gender: [],
        age: [],
        race: [],
        tnmStageV8: [],
        viralStatus: []
    });
    const geneRef = useRef(null);
    const listRef = useRef(null);
    const paramsRef = useRef(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        setFetchLoading(true);
        getGeneList(DEFAULT_PAGE, DEFAULT_PAGE_SIZE, "").then((results) => {
            geneRef.current = results?.records ?? [];
            const driverList = getDriverList();
            const _params = {
                ...paramsRef.current,
                ...clinicList,
                sampleType: "bySample",
                geneList: getGeneListWithIsDeriverGene(driverList)
            }
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
                isDriverGene: !!geneRef.current.find((item) => item.gene == gene)?.isDriverGene
            }
        })
    }

    const getDriverList = () => {
        return geneRef.current?.filter((item) => !!item.isDriverGene).map((item) => item.gene);
    }

    const handleSearch = (event) => {
        event.stopPropagation();
        setShowSearchInput(!showSearchInput);
    }

    const handleImport = (event) => {
        event.stopPropagation();
    }

    const fuzzySearch = (e) => {
        setFilterValue(e.target.value)
        handleSearchGene(e.target.value)
    }

    const handleGeneReload = (event) => {
        event.stopPropagation();
        const driverList = getDriverList();
        setGeneList(driverList);
        paramsRef.current = {
            ...paramsRef.current,
            geneList: getGeneListWithIsDeriverGene(driverList)
        };
    }

    const handleDriverReload = (event) => {
        event.stopPropagation();
        setDriverList(["driver", "not-driver"]);
    }

    const handleMutationTypeReload = () => {
        event.stopPropagation();
    }

    const handleClinicReload = (event) => {
        event.stopPropagation();
        setClinicList({
            gender: [],
            age: [],
            race: [],
            tnmStageV8: [],
            viralStatus: []
        });
        paramsRef.current = {
            ...paramsRef.current,
            gender: [],
            age: [],
            race: [],
            tnmStageV8: [],
            viralStatus: []
        };
    }



    const handleApply = useCallback(() => {
        console.log(paramsRef.current)
        setParams(paramsRef.current);
        // dispatch({ type: 'driver_landscape_filter_conditions', payload: {
        //     ...params,
        //     geneList: params?.geneList.map((gene) => {
        //         return {
        //             gene,
        //             isDriver: geneRef.current.find((item) => item.gene == gene)?.isDriver
        //         }
        //     }),
        // } });
    }, [params]);

    const handleApplyLoading = (loading) => {
        setApplyLoading(loading);
    }

    const renderSearchInput = () => {
        return showSearchInput ? <Input size={"middle"} allowClear onChange={fuzzySearch} placeholder={t("common:search")} /> : ""
    }

    const getSelectedDriverList = () => {
        return geneList?.filter((item) => !!geneRef.current.find((gene) => gene.gene === item)?.isDriverGene)
    }

    const getSelectedNotDriverList = () => {
        return geneList?.filter((item) => !geneRef.current.find((gene) => gene.gene === item)?.isDriverGene)
    }

    const onCheckAllChange = e => {
        const _geneList = e.target.checked ? [...getSelectedNotDriverList(), ...getDriverList()] : getSelectedNotDriverList();
        setGeneList(_geneList);
        paramsRef.current = {
            ...paramsRef.current,
            geneList: getGeneListWithIsDeriverGene(_geneList)
        };

    };

    const onGeneSelection = (e) => {
        let _geneList = [];
        if (e.target.checked) {
            _geneList = [...geneList, e.target.value];

        } else {
            const index = geneList.findIndex((item) => item == e.target.value);
            _geneList = [...geneList]
            _geneList.splice(index, 1);

        }
        setGeneList(_geneList);

        paramsRef.current = {
            ...paramsRef.current,
            geneList: getGeneListWithIsDeriverGene(_geneList)
        };
    }

    const onClinicChange = (value, parent) => {
        if (value?.length === 0) {
            messageApi.open({
                type: 'warning',
                content: "You have no selected selection, you will get all samples",
                duration: 2,
                maxCount: 3
            });
        }

        setClinicList({
            ...clinicList,
            [parent]: value
        });
        paramsRef.current = {
            ...paramsRef.current,
            [parent]: value
        }
    }

    const onDriverChange = (value) => {
        if (value.length === 0) {
            return;
        }
        setDriverList(value);
        console.log(value, geneList, getSelectedDriverList())
        if (value.length == 1) {
            if (value[0] == "driver") {
                paramsRef.current = {
                    ...paramsRef.current,
                    geneList: getGeneListWithIsDeriverGene(getSelectedDriverList())
                }
            } else {
                paramsRef.current = {
                    ...paramsRef.current,
                    geneList: getGeneListWithIsDeriverGene(getSelectedNotDriverList())
                }
            }
        } else {
            paramsRef.current = {
                ...paramsRef.current,
                geneList: getGeneListWithIsDeriverGene(geneList)
            }
        }
    }

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

    const getGeneCount = (value) => {
        const driverCount = getSelectedDriverList()?.length ?? 0;
        if (value === "driver") {
            return driverCount
        }
        return ((geneList?.length ?? 0) - driverCount)
    }

    const isAllDriverChecked = () => {
        return getDriverList()?.every(item => geneList?.includes(item));
    }

    const existDriverChecked = () => {
        return getDriverList()?.some(item => geneList?.includes(item)) && geneList?.length < getDriverList().length
    }

    const uploadProps = {
        name: 'file',
        accept: ".txt",
        showUploadList: false,
        action: '',
        headers: {
            authorization: 'authorization-text',
        },
        beforeUpload: (file) => {
            const isTxt = file.type === 'text/plain' ||
                file.name.toLowerCase().endsWith('.txt');

            if (!isTxt) {
                message.error('只能上传 txt 格式的文件!');
                return Upload.LIST_IGNORE;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target.result;
                console.log('file content:', content);
            };
            reader.onerror = () => {
                message.error('read faild');
            };
            reader.readAsText(file, 'UTF-8');
            return false;
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const onPanelChange = (sizes) => {
        setLeftPanelSize(sizes[0])
        setRightPanelSize(sizes[1])
    }

    const leftPanelFullScreen = () => {
        if (rightPanelSize == "0") {
            setLeftPanelSize(DEFAULT_LEFT_PANEL_WIDTH)
            setRightPanelSize(DEFAULT_RIGHT_PANEL_WIDTH);

        } else {
            setLeftPanelSize("0")
            setRightPanelSize("100%")
        }

    }

    const rightPanelFullScreen = () => {
        if (leftPanelSize == "0") {
            setLeftPanelSize(DEFAULT_LEFT_PANEL_WIDTH);
            setRightPanelSize(DEFAULT_RIGHT_PANEL_WIDTH);

        } else {
            setLeftPanelSize("100%");
            setRightPanelSize("0");

        }
    }

    const geneCollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: false
                }}
                style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{t("mutation:filter.gene")}</Typography.Paragraph>
            <Space>
                <Button
                    color="default" variant="link"
                    onClick={onPreventMouseDown}
                    style={{ padding: 0, margin: 0, color: "#fff", fontWeight: "bold" }}>
                    {t("mutation:select-count")} {geneList?.length || 0}
                </Button>
                <Tooltip placement="bottom" title={"Import"}>
                    <Upload {...uploadProps} onClick={(event) => {
                        handleImport(event)
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
                        handleSearch(event)
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
                        handleGeneReload(event)
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
        </Flex>
    }

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
        [current, filterValue]
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
    }, 300)


    const handleScroll = ({ scrollOffset, scrollDirection, scrollUpdateWasRequested }) => {
        if (scrollUpdateWasRequested || scrollDirection === "backward") return;
        const list = listRef.current;
        if (!list) return;

        const { props } = list;
        const totalHeight = props.itemCount * props.itemSize;
        const scrollBottom = scrollOffset + props.height;
        if (totalHeight - scrollBottom < 100) {
            loadMoreGene()
        }
    };

    const onSampleTypeChange = useCallback((value) => {
        setSampleType(value);
        paramsRef.current = {
            ...paramsRef.current,
            sampleType: value,
        }
        setParams(paramsRef.current)
    }, [])

    const geneCollapseContent = () => {
        return <Card className={styles.searchCard}
            variant="borderless" title={renderSearchInput()}>

            <EmptyLoading loading={fetchLoading} hasData={!!geneRef.current?.length}>
                <Checkbox.Group style={{ width: '100%' }} value={geneList}>
                    <FixedSizeList
                        ref={listRef}
                        height={260}
                        itemCount={geneRef.current?.length ?? 0}
                        itemSize={30}
                        width="100%"
                        onScroll={handleScroll}
                    >
                        {virtualRow}
                    </FixedSizeList>
                    {<Flex style={{ width: "100%", height: "20px" }} align='center' justify='center'><Spin indicator={<LoadingOutlined spin />} spinning={loadMoreLoading} /></Flex>}

                </Checkbox.Group>
            </EmptyLoading>

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
                style={{ width: '100%', maxHeight: 74, overflowY: "auto", overflowX: "hidden", borderRadius: "4px", border: "1px solid #d9d9d9" }}
            />
        </Card>
    }

    const driverCollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: false
                }}
                style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{t("mutation:filter.driver")}</Typography.Paragraph>

            <Tooltip placement="bottom" title={t("common:reset-selection")}>
                <Button color="default" onClick={(event) => {
                    handleDriverReload(event)
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
        </Flex>
    }

    const driverCollapseContent = () => {
        return <Card className={styles.searchCard}
            variant="borderless">
            <Checkbox.Group style={{ display: 'block' }} value={driverList} onChange={onDriverChange}>
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
                                margin: 0
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
                                margin: 0
                            }}>{getGeneCount("not-driver")}</Typography.Paragraph>
                    </Col>
                </Row>
            </Checkbox.Group>
        </Card>
    }



    const clinicCollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: false
                }}
                style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{t("mutation:filter.clinic")}</Typography.Paragraph>

            <Tooltip placement="bottom" title={t("common:reset-selection")}>
                <Button color="default" onClick={(event) => {
                    handleClinicReload(event)
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
        </Flex>
    }

    const mutationTypeCollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: false
                }}
                style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{"Filter By Mutation Type"}</Typography.Paragraph>

            <Tooltip placement="bottom" title={t("common:reset-selection")}>
                <Button color="default" onClick={(event) => {
                    handleMutationTypeReload(event)
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
        </Flex>
    }


    const clinicCollapseContent = () => {
        return <Card className={styles.clinicCard} style={{ height: 240, overflowY: "scroll", overflowX: "hidden" }}
            variant="borderless">
            <Row key={"clinicContent"}>
                {
                    clinicConfig?.map((item, index) => {
                        return <Col xs={12} md={12} lg={12} key={item.key}>
                            <Timeline
                                items={[{
                                    dot: <Image src={`/images/${item.key}.svg`} width={15} height={15} alt={item.key}></Image>,
                                    children: <Checkbox.Group value={clinicList[item.key]} onChange={(value) => { onClinicChange(value, item.key) }} key={index}>
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
                                                                    expandable: false
                                                                }}>{t(`mutation:sample.${child.key}`)}</Typography.Paragraph></Checkbox>
                                                        </Col>
                                                    )
                                                })
                                            }
                                        </Row>
                                    </Checkbox.Group>
                                }]}></Timeline></Col>
                    })
                }
            </Row>
        </Card>
    }

    return (
        <>
            {contextHolder}
            <Splitter className={styles.mutationSplitter} lazy onResize={onPanelChange}>
                <Panel className={styles.searchPanel} size={leftPanelSize} min={"30%"} max="50%">
                    <Affix offsetTop={65}>
                        <Flex justify='space-between' align='center' style={{ boxShadow: "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px", padding: "10px 0 10px 15px", background: "rgb(210, 235, 227)" }}>
                            <Button color="default" disabled={!geneList?.length} icon={applyLoading ? <LoadingOutlined /> : <AppstoreOutlined />} loading={applyLoading} onClick={handleApply} type="primary" size="large"
                                style={{ color: "#fff", background: geneList?.length ? "rgb(212, 110, 64)" : "gray" }}>
                                {t("common:apply")}
                            </Button>
                            <Button color="default" variant="text"
                                onClick={leftPanelFullScreen}
                                style={{ color: "#fff", padding: 0 }}>
                                <Image
                                    src={LEFT_SQUARE_SRC}
                                    alt="import"
                                    width={30}
                                    height={30}
                                />
                            </Button>
                        </Flex>
                    </Affix>
                    <Collapse
                        defaultActiveKey={"gene"}
                        className={styles.searchCollapse}
                        expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
                        items={[{
                            key: "gene",
                            label: geneCollapseTitle(),
                            children: geneCollapseContent()
                        }]}>
                    </Collapse>
                    <Collapse
                        defaultActiveKey={"driver"}
                        className={styles.searchCollapse}
                        expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
                        items={[{
                            key: "driver",
                            label: driverCollapseTitle(),
                            children: driverCollapseContent()

                        }]}>
                    </Collapse>
                    <Collapse
                        defaultActiveKey={"clinic"}
                        className={styles.searchCollapse}
                        expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
                        items={[{
                            key: "clinic",
                            label: clinicCollapseTitle(),
                            children: clinicCollapseContent()

                        }]}>
                    </Collapse>
                </Panel>
                <Panel size={rightPanelSize} min={"50%"} max="70%">
                    <Affix offsetTop={65}>
                        <Flex justify='space-between' align='center' style={{ boxShadow: "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px", height: "60px", paddingRight: 15, background: "rgb(210, 235, 227)" }}>
                            <Flex align='center'>
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

                                <Segmented
                                    options={[{ label: 'Driver Landscape', value: "driverLandscape", icon: <ApartmentOutlined /> }, { value: "phylogeneticRelationship", label: 'Phylogenetic Relationship', icon: <BranchesOutlined /> }]}
                                    value={mutationTypeTab}
                                    onChange={value => setMutationTypeTab(value)}
                                />
                            </Flex>

                            {
                                mutationTypeTab === "driverLandscape" && <Segmented
                                    onChange={onSampleTypeChange}
                                    options={[{ value: "bySample", label: "By Sample" }, { value: "byPatient", label: "By Patients" }]}
                                    value={sampleType}
                                />
                            }
                            <ExportPdfButton url={`pdf-export/driver-landscape/${encodeURIComponent(JSON.stringify(params))}`}></ExportPdfButton>
                        </Flex>
                    </Affix>
                    {
                        mutationTypeTab === "driverLandscape" && <DriverLandscape handleApplyLoading={handleApplyLoading} conditions={params}></DriverLandscape>
                    }
                    {
                        mutationTypeTab === "phylogeneticRelationship" && <PhylogeneticRelationship></PhylogeneticRelationship>
                    }
                </Panel>
            </Splitter>
        </>
    )
}

export default Mutation;