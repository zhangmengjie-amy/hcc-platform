"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { usePDF } from 'react-to-pdf';
import { getGeneList } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined, ApartmentOutlined, BranchesOutlined } from '@ant-design/icons';
import { FixedSizeList } from 'react-window';
import { debounce } from 'lodash';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import DEGCondition from '@/components/deg-condition';
import ConditionSelection from '@/components/condition-selection';
import EmptyLoading from "@/components/empty-loading";
import ExportPdfButton from '@/components/export-pdf';
import SubtypeLandscape from '@/components/expression/subtype-landscape'
import Pathways from '@/components/expression/pathways'
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
    message
} from 'antd';
import DriverLandscape from "@/components/mutation/driverLandscape";
import PhylogeneticRelationship from "@/components/mutation/phylogeneticRelationship";
import { useTranslation } from "react-i18next";
import Image from 'next/image';
import styles from "./style.module.scss";
const { Panel } = Splitter;
const LEFT_SQUARE_SRC = "/images/left-square.svg";
const RIGHT_SQUARE_SRC = "/images/right-square.svg";
const DEFAULT_LEFT_PANEL_WIDTH = "25%";
const DEFAULT_RIGHT_PANEL_WIDTH = "75%";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const RELOAD_ICON = "/images/reload.svg";

const Expression = () => {
    const { t } = useTranslation();
        const [dataTypeList, setDataTypeList] = useState(["planet"]);
    const [dataType, setDataType] = useState("planet");
    const [treeType, setTreeType] = useState("overview");
    const [mutationTypeTab, setMutationTypeTab] = useState("subtype");
    const [sampleType, setSampleType] = useState("bySample");
    const [applyLoading, setApplyLoading] = useState(false);
    const [sliderValue, setSliderValue] = useState([0, 1]);
    const [messageApi, contextHolder] = message.useMessage();
    const [params, setParams] = useState({});
    const [leftPanelSize, setLeftPanelSize] = useState(DEFAULT_LEFT_PANEL_WIDTH);
    const [rightPanelSize, setRightPanelSize] = useState(DEFAULT_RIGHT_PANEL_WIDTH);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [geneList, setGeneList] = useState([]);
    const conditionSelectionRef = useRef(null);
    const [clinicList, setClinicList] = useState({
        gender: [],
        age: [],
        race: [],
        stage: [],
        viralStatus: []
    });
    const geneRef = useRef(null);
    const paramsRef = useRef(null);
    const pathname = usePathname();

    useEffect(() => {
        setFetchLoading(true);
        getGeneList(DEFAULT_PAGE, DEFAULT_PAGE_SIZE, "").then((results) => {
            geneRef.current = results?.records ?? [];
            const driverList = getDriverList();
            const _params = {
                ...paramsRef.current,
                ...clinicList,
                geneList: getGeneListWithIsDeriverGene(driverList)
            }
            setGeneList(driverList);
            setParams(_params);
            paramsRef.current = _params;
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

    const handleApply = useCallback(() => {
        setParams(conditionSelectionRef.current?.getParams());
    }, []);

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

    useEffect(() => {
        setParams({});
    }, [mutationTypeTab])

    
        const dataTypeCollapseTitle = () => {
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

    
    const onDataTypeListChange = (value) => {
        if (!value?.length) return;
        setDataTypeList(value);
    }

    const dataTypeCollapseContent = () => {
        return <div className={styles.searchCard}
            variant="borderless">
            <Checkbox.Group style={{ display: 'block' }} value={dataTypeList} onChange={onDataTypeListChange}>
                <Row>
                    <Col xs={20} sm={20} md={20} lg={20}>
                        <Checkbox
                            value={"planet"}
                            label={"PLANET"}>{"PLANET"}</Checkbox>

                    </Col>
                </Row>
                <Row>
                    <Col xs={20} sm={20} md={20} lg={20}>
                        <Checkbox
                            value={"dt"}
                            label={"DT"}>{"DT"}</Checkbox>

                    </Col>
                </Row>
            </Checkbox.Group>
        </div>
    }

    console.log("dataType--------------", dataTypeList)

    return (
        <>
            {contextHolder}
            <Splitter className={styles.mutationSplitter} lazy onResize={onPanelChange}>
                <Panel className={styles.searchPanel} size={leftPanelSize} min={"20%"} max="50%">
                    <Flex justify='space-between' align='center' style={{ paddingLeft: "10px", height: "40px" }}>
                        <Button color="default" size="middle" disabled={!geneList?.length} icon={applyLoading ? <LoadingOutlined /> : <AppstoreOutlined />} loading={applyLoading} onClick={handleApply} type="primary"
                            style={{ color: "#fff", background: geneList?.length ? "rgb(237, 108, 116)" : "gray" }}>
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
                    <Collapse
                        defaultActiveKey={"dataType"}
                        className={styles.searchCollapse}
                        expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
                        items={[{
                            key: "dataType",
                            label: dataTypeCollapseTitle(),
                            children: dataTypeCollapseContent()

                        }]}>
                    </Collapse>
                    {
                        pathname.split("/")[2] == "subtype" && <ConditionSelection ref={conditionSelectionRef} handleInitChange={handleApply} showDriverGeneList={false} showITH={false} showGeneList={false} ></ConditionSelection>
                    }
                    {
                        pathname.split("/")[2] == "pathways" && <DEGCondition></DEGCondition>
                    }
                </Panel>
                <Panel size={rightPanelSize} min={"50%"} max="80%">
                    <Flex justify='space-between' align='center' style={{ height: "40px", paddingRight: 10 }}>
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
                                options={[{ label: <Link href="/expression/subtype">{'Subtype landscape and tree'}</Link> , value: "subtype" },
                                    { label: <Link href="/expression/pathways">{"Customized DEGs and pathways"}</Link>, value: 'pathways' },
                                    { label: <Link href="/expression/biomarkers">{"Biomarkers"}</Link>, value: 'biomarkers' }
                                ]}
                                value={ pathname.split("/")[2]}
                            />
                        </Flex>
                    </Flex>
                    {
                        pathname.split("/")[2] == "subtype" &&  <SubtypeLandscape dataType={dataTypeList} conditions={params}></SubtypeLandscape>
                    }
                    {
                        pathname.split("/")[2] == "pathways" &&  <Pathways conditions={params}></Pathways>
                    }
                </Panel>
            </Splitter>
        </>
    )
}

export default Expression;