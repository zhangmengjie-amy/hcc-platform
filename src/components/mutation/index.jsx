"use client";
import React, { useRef, useEffect, useState } from 'react';
import { getGene } from "@/configs/request";
import { CaretRightOutlined } from '@ant-design/icons';
import { FixedSizeList } from 'react-window';
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
    Flex,
    Input,
    Splitter,
    Typography,
    Select,
    Timeline,
    Empty
} from 'antd';
import DriverLandscape from "@/components/mutation/driverLandscape";
import { useTranslation } from "react-i18next";
import Image from 'next/image';
import styles from "./style.module.scss";
import { clinicConfig } from '@/configs/mutation';


const { Panel } = Splitter;
const RELOAD_ICON = "/images/reload.svg";
const SEARCH_SRC = "/images/search.svg";
const DRIVER_COLORS = ["cyan", 'lime'];
const THEME_COLOR = "#1677ff";
const Mutation = () => {
    const { t } = useTranslation();
    const [driverList, setDriverList] = useState(["driver", "not-driver"]);
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [geneList, setGeneList] = useState([]);
    const [clinicList, setClinicList] = useState({});
    const [geneParams, setGeneParams] = useState([]);
    const [geneFilterList, setGeneFilterList] = useState([]);
    const [filterValue, setFilterValue] = useState("");
    const geneRef = useRef(null);
    useEffect(() => {
        const fetchData = async () => {
            const _geneData = await getGene();
            geneRef.current = _geneData;
            setGeneList(getDriverList());
        };
        fetchData();
    }, []);

    const getDriverList = () => {
        return geneRef.current?.filter((item) => !!item.is_driver_gene).map((item) => item.gene);
    }

    const handleSearch = (event) => {
        event.stopPropagation();
        setShowSearchInput(!showSearchInput);
    }

    const fuzzySearch = (e) => {
        setFilterValue(e.target.value);
        const pattern = e.target.value.split('').join('.*?');
        const regex = new RegExp(pattern, 'i');
        setGeneFilterList(geneRef.current.filter(item => regex.test(item.gene)))
    }

    const handleGeneReload = (event) => {
        event.stopPropagation();
        setGeneList(getDriverList())
    }

    const handleDriverReload = (event) => {
        event.stopPropagation();
        setDriverList(["driver", "not-driver"]);
    }

    const handleClinicReload = (event) => {
        event.stopPropagation();
        setClinicList({})

    }

    const renderSearchInput = () => {
        return showSearchInput ? <Input size={"middle"} allowClear onChange={fuzzySearch} placeholder={t("common:search")} /> : ""
    }

    const getSelectedDriverList = () => {
        return geneList.filter((item) => !!geneRef.current.find((gene) => gene.gene === item)?.is_driver_gene)
    }

    const getSelectedNotDriverList = () => {
        return geneList.filter((item) => !geneRef.current.find((gene) => gene.gene === item)?.is_driver_gene)
    }

    const onCheckAllChange = e => {
        setGeneList(e.target.checked ? [...getSelectedNotDriverList(), ...getDriverList()] : getSelectedNotDriverList());
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
    }

    const onClinicChange = (value, parent) => {
        clinicList[parent] = value;
        if (!value.length) delete clinicList[parent];
        setClinicList({ ...clinicList });
    }

    useEffect(() => {
        let gene_params = geneList;
        if (!driverList.length || !geneList.length) return;
        if (driverList.length === 1) {
            switch (driverList[0]) {
                case 'driver':
                    gene_params = getSelectedDriverList();
                    break;
                case 'not-driver':
                    gene_params = getSelectedNotDriverList();
                    break;
                default:
            }
        }
        setGeneParams(gene_params);

    }, [geneList?.length, driverList])


    const onDriverChange = (value) => {
        if (value.length === 0) {
            return;
        }
        setDriverList(value);
    }

    const virtualRow = ({ index, style }) => (
        <List.Item style={style}>{<Checkbox
            value={filterValue ? geneFilterList?.[index].gene : geneRef.current?.[index].gene}
            onChange={onGeneSelection}>{filterValue ? geneFilterList?.[index].gene : geneRef.current?.[index].gene}</Checkbox>}</List.Item>
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
                color={option?.is_driver_gene ? DRIVER_COLORS[0] : DRIVER_COLORS[1]}
                closable={closable}
                onClose={onClose}
            >
                {label}
            </Tag>
        );
    };

    const getGeneCount = (value) => {
        const driverCount = getSelectedDriverList()?.length;
        if (value === "driver") {
            return driverCount
        }
        return geneList.length - driverCount
    }

    const isAllDriverChecked = () => {
        return getDriverList()?.every(item => geneList.includes(item));
    }

    const existDriverChecked = () => {
        return getDriverList()?.some(item => geneList.includes(item)) && geneList.length < getDriverList().length
    }

    const geneCollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                style={{ margin: 0, color: "#fff" }}>{t("mutation:filter.gene")}</Typography.Paragraph>
            <Space>
                <Button
                    color="default" variant="link"
                    onClick={onPreventMouseDown}
                    style={{ padding: 0, margin: 0, color: "#fff", fontWeight: "bold" }}>
                    {t("mutation:select-count")} {geneList?.length || 0}
                </Button>
                <Tooltip placement="bottom" title={"Search"} color={THEME_COLOR}>
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
                <Tooltip placement="bottom" title={t("common:reset-selection")} color={THEME_COLOR}>
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


    const geneCollapseContent = () => {
        return <Card className={styles.searchCard}
            variant="borderless" title={renderSearchInput()}>

            <Checkbox.Group style={{ width: '100%' }} value={geneList}>
                {
                    filterValue && geneFilterList?.length === 0 ? <Empty style={{ width: '100%', marginBottom: 20 }}></Empty> : <FixedSizeList
                        height={300}
                        itemCount={filterValue ? geneFilterList?.length ?? 0 : geneRef.current?.length ?? 0}
                        itemSize={30}
                        width="100%"
                    >
                        {virtualRow}
                    </FixedSizeList>
                }

            </Checkbox.Group>
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
                style={{ width: '100%', maxHeight: 100, overflowY: "auto", overflowX: "hidden", borderRadius: "4px", border: "1px solid #d9d9d9" }}
            />
        </Card>
    }

    const driverCollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                style={{ margin: 0, color: "#fff" }}>{t("mutation:filter.driver")}</Typography.Paragraph>

            <Tooltip placement="bottom" title={t("common:reset-selection")} color={THEME_COLOR}>
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
                style={{ margin: 0, color: "#fff" }}>{t("mutation:filter.clinic")}</Typography.Paragraph>

            <Tooltip placement="bottom" title={t("common:reset-selection")} color={THEME_COLOR}>
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
        return <Card className={styles.clinicCard}
            variant="borderless">
            <Timeline
                items={
                    clinicConfig?.map((item, index) => {
                        return {
                            dot: <Image src={`/images/${item.key}.svg`} width={15} height={15} alt={item.key}></Image>,
                            children: <Checkbox.Group value={clinicList[item.key]} onChange={(value) => { onClinicChange(value, item.key) }} key={index}>
                                <Row key={item.key}>
                                    <Typography.Title
                                        level={5}
                                        style={{ fontSize: "14px" }}>{t(`mutation:sample.${item.key}`)}</Typography.Title>
                                    {
                                        item.children?.map((child, index) => {
                                            return (
                                                <Col xs={24} sm={24} md={24} lg={24}
                                                    key={child.key}>

                                                    <Checkbox value={child.key}
                                                        label={child.title}>{t(`mutation:sample.${child.key}`)}</Checkbox>
                                                </Col>
                                            )
                                        })
                                    }
                                </Row>
                            </Checkbox.Group>
                        }
                    })

                }></Timeline>
        </Card>
    }
    return (
        <Splitter className={styles.mutationSplitter}>
            <Panel collapsible className={styles.searchPanel} defaultSize={"30%"} min={"20%"} max="50%">

                <Collapse
                    defaultActiveKey={"gene"}
                    className={styles.searchCollapse}
                    size="small"
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    items={[{
                        key: "gene",
                        label: geneCollapseTitle(),
                        children: geneCollapseContent()

                    }]}>
                </Collapse>
                <Collapse
                    defaultActiveKey={"driver"}
                    className={styles.searchCollapse}
                    size="small"
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    items={[{
                        key: "driver",
                        label: driverCollapseTitle(),
                        children: driverCollapseContent()

                    }]}>
                </Collapse>
                <Collapse
                    defaultActiveKey={"clinic"}
                    className={styles.searchCollapse}
                    size="small"
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    items={[{
                        key: "clinic",
                        label: clinicCollapseTitle(),
                        children: clinicCollapseContent()

                    }]}>
                </Collapse>
            </Panel>
            <Panel collapsible defaultSize={"70%"} min={"50%"} max="80%">
                <DriverLandscape geneList={geneParams} clinicList={clinicList}></DriverLandscape>
            </Panel>
        </Splitter>
    )
}

export default Mutation;