'use client';
import React, { useRef, useMemo, useEffect, useImperativeHandle, useState, useCallback, forwardRef } from 'react';
import { usePDF } from 'react-to-pdf';
import { getGeneList, getValidGeneList, getClinicalConfig } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined, ApartmentOutlined, BranchesOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import EmptyLoading from "@/components/empty-loading";
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
    Slider,
    message,
    Radio
} from 'antd';
import { useTranslation } from "react-i18next";
import Image from 'next/image';
import { FixedSizeList } from 'react-window';
import styles from "./style.module.scss";
const RELOAD_ICON = "/images/reload.svg";
const IMPORT_SRC = "/images/import.svg";
const DRIVER_COLORS = ["rgb(239, 207, 210)", "rgb(205, 205, 205)"];
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const ConditionSelection = forwardRef(({ onITHChange, handleInitChange, showITH = true, showGeneList = true, showClinical = true }, ref) => {
    const { t } = useTranslation();
    const [driverList, setDriverList] = useState("driver");
    const [sliderValue, setSliderValue] = useState([0, 1]);
    const [filterValue, setFilterValue] = useState("");
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [current, setCurrent] = useState(1);
    const [geneList, setGeneList] = useState([]);
    const [clinicList, setClinicList] = useState({
        gender: [],
        age: [],
        race: [],
        stage: [],
        viralStatus: []
    });
    const filteredRef = useRef(null);
    const geneRef = useRef(null);
    const listRef = useRef(null);
    const clinicalConfigRef = useRef(null);
    const paramsRef = useRef(null);

    useImperativeHandle(ref, () => ({
        getParams: () => {
            return paramsRef.current;
        }
    }));

    useEffect(() => {
        setFetchLoading(true);
        Promise.all([getClinicalConfig(), getGeneList(DEFAULT_PAGE, DEFAULT_PAGE_SIZE, "")]).then((results) => {
            const [clinicConfig, geneData] = results;
            clinicalConfigRef.current = clinicConfig;
            geneRef.current = geneData?.records ?? [];
            filteredRef.current = geneData?.records ?? [];
            const driverList = getDriverList();
            const _params = {
                ...paramsRef.current,
                ...clinicList,
                geneList: getGeneListWithIsDeriverGene(driverList)
            }
            setGeneList(driverList);
            paramsRef.current = _params;
            handleInitChange?.(paramsRef.current);
            setFetchLoading(false);
        })
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
    const handleDNAReload = (event) => {
        event.stopPropagation();
        setSliderValue([0, 1]);
    }

    const handleDriverReload = (event) => {
        event.stopPropagation();
        setDriverList(["driver", "not-driver"]);
    }

    const handleClinicReload = (event) => {
        event.stopPropagation();
        setClinicList({
            gender: [],
            age: [],
            race: [],
            stage: [],
            viralStatus: []
        });
        paramsRef.current = {
            ...paramsRef.current,
            gender: [],
            age: [],
            race: [],
            stage: [],
            viralStatus: []
        };
    }

    const renderSearchInput = () => {
        return <Input size={"middle"} style={{ marginBottom: 10 }} allowClear onChange={fuzzySearch} placeholder={t("common:search")} />
    }

    const getSelectedDriverList = () => {
        return geneList?.filter((item) => !!geneRef.current.find((gene) => gene.gene === item)?.isDriverGene)
    }

    const getSelectedNoneDriverList = () => {
        return geneList?.filter((item) => !geneRef.current.find((gene) => gene.gene === item)?.isDriverGene)
    }

    const onCheckAllChange = e => {
        const _geneList = e.target.checked ? [...getSelectedNoneDriverList(), ...getDriverList()] : getSelectedNoneDriverList();
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
            [parent]: value
        });
        paramsRef.current = {
            ...paramsRef.current,
            [parent]: value
        }
    }

    const onDriverChange = (e) => {
        const { value } = e.target;

        setDriverList(value);

        if (value == "driver") {
            paramsRef.current = {
                ...paramsRef.current,
                geneList: getGeneListWithIsDeriverGene(getSelectedDriverList())
            }
        } else if (value == "not-driver") {
            paramsRef.current = {
                ...paramsRef.current,
                geneList: getGeneListWithIsDeriverGene(getSelectedNoneDriverList())
            }
        } else {
            paramsRef.current = {
                ...paramsRef.current,
                geneList: getGeneListWithIsDeriverGene(geneList)
            }
        }
    }

    const virtualRow = (({ index, style }) => (
        <List.Item style={style}>{<Checkbox
            value={filteredRef.current?.[index]?.gene}
            onChange={onGeneSelection}>{filteredRef.current?.[index]?.gene}</Checkbox>}</List.Item>
    ));

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
        } else if (value === "not-driver") {
            return ((geneList?.length ?? 0) - driverCount)
        }

        return geneList?.length

    }

    const isAllDriverChecked = () => {
        return getDriverList()?.every(item => geneList?.includes(item));
    }

    const existDriverChecked = () => {
        return getDriverList()?.some(item => geneList?.includes(item)) && geneList?.length < getDriverList().length
    }

    const checkGeneList = (data) => {
        if (!data?.length) return;
        const _geneList = Array.from(new Set(geneList.concat(data)));
        setGeneList(_geneList);
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
                const content = e.target.result?.split('\r\n');
                getValidGeneList(content).then((validGeneList) => {
                    if (!validGeneList?.length) {
                        message.error(`File upload failed.`);
                    } else {
                        checkGeneList(validGeneList);
                    }

                });
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

    const geneCollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: false
                }}
                style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{t("mutation:filter.gene")}</Typography.Paragraph>
            <Space>
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

    const DNACollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: false
                }}
                style={{ margin: 0, color: "#fff", fontWeight: "500" }}>{t("mutation:filter.DNA_ITH")}</Typography.Paragraph>
            <Space>
                <Tooltip placement="bottom" title={t("common:reset-selection")}>
                    <Button color="default" onClick={(event) => {
                        handleDNAReload(event)
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

    const handleITHChange = (value) => {
        onITHChange(value);
        setSliderValue(value);
    }

    const DNACollapseContent = () => {
        return <Slider value={sliderValue} onChange={handleITHChange} tooltip={{
            placement: 'top',
            open: true,
            getPopupContainer: (triggerNode) => triggerNode,
            align: {
                offset: [0, -10],
            },
        }} style={{ margin: "50px 20px 0" }} min={0} max={1} step={0.01} range={{ draggableTrack: true }} defaultValue={[0, 1]} />
    }

    const loadMoreGene = useCallback(
        debounce(() => {
            if (loadMoreLoading) return;
            setLoadMoreLoading(true);
            getGeneList(current + 1, DEFAULT_PAGE_SIZE, filterValue ?? "")
                .then(newData => {
                    filteredRef.current = [...filteredRef.current, ...newData.records];
                    // filteredRef.current = geneRef.current;
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
                filteredRef.current = newData.records;
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


    const geneCollapseContent = () => {
        return <div className={styles.searchCard}
            variant="borderless">
            {renderSearchInput()}
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
                style={{ width: '100%', maxHeight: 74, overflowY: "auto", overflowX: "hidden", borderRadius: "4px", border: "1px solid #d9d9d9" }}
            />
        </div>
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
        return <div className={styles.searchCard}
            variant="borderless">
            <Radio.Group style={{ display: 'block' }} value={driverList} onChange={onDriverChange}>
                <Row>
                    <Col xs={20} sm={20} md={20} lg={20}>
                        <Radio
                            value={"driver"}
                            label={t("mutation:driver.driver")}>{t("mutation:driver.driver")}</Radio>

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
                        <Radio
                            value={"not-driver"}
                            label={t("mutation:driver.not-driver")}>{t("mutation:driver.not-driver")}</Radio>

                    </Col>
                    <Col xs={4} sm={4} md={4} lg={4}>
                        <Typography.Paragraph
                            style={{
                                textAlign: "right",
                                margin: 0
                            }}>{getGeneCount("not-driver")}</Typography.Paragraph>
                    </Col>
                </Row>
                <Row>
                    <Col xs={20} sm={20} md={20} lg={20}>
                        <Radio
                            value={"all"}
                            label={"All"}>{"All"}</Radio>

                    </Col>
                    <Col xs={4} sm={4} md={4} lg={4}>
                        <Typography.Paragraph
                            style={{
                                textAlign: "right",
                                margin: 0
                            }}>{getGeneCount("all")}</Typography.Paragraph>
                    </Col>
                </Row>
            </Radio.Group>
        </div>
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

    const clinicCollapseContent = () => {
        return <div className={styles.clinicCard} style={{ height: 240, overflowY: "scroll", overflowX: "hidden" }}
            variant="borderless">
            <Row key={"clinicContent"}>
                {
                    clinicalConfigRef.current && ['age', 'stage', 'hbv', 'hcv', 'race', 'gender']?.map((item, index) => {
                        return <Col xs={12} md={12} lg={12} key={item}>
                            <Timeline
                                items={[{
                                    dot: <Image src={`/images/${item == "stage" ? "tnm-stage-v8" : item}.svg`} width={15} height={15} alt={item}></Image>,
                                    children: <Checkbox.Group value={clinicList[item]} onChange={(value) => { onClinicChange(value, item) }} key={index}>
                                        <Row key={item.key}>
                                            <Typography.Title
                                                level={5}
                                                style={{ fontSize: "14px" }}>{t(`mutation:sample.${item}`)}</Typography.Title>
                                            {
                                                clinicalConfigRef.current[item]?.map((child) => {
                                                    return (
                                                        <Col xs={24} sm={24} md={24} lg={24}
                                                            key={child}>

                                                            <Checkbox value={child}
                                                                label={child.title}><Typography.Paragraph style={{ margin: 0 }} ellipsis={{
                                                                    rows: 1,
                                                                    expandable: false
                                                                }}>{t(`mutation:sample.${child}`)}</Typography.Paragraph></Checkbox>
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
        </div>
    }
    return (
        <div className={styles.conditionSelection}>
            {
                showITH &&
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
            }
            {
                showGeneList && <>
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
                    </Collapse></>
            }
            {
                showClinical &&
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
            }

        </div>
    );
})

export default ConditionSelection