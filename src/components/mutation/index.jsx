"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { usePDF } from 'react-to-pdf';
import { getGeneList } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined, ApartmentOutlined, BranchesOutlined } from '@ant-design/icons';
import { FixedSizeList } from 'react-window';
import { debounce } from 'lodash';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TimingAnalysis from "@/components/mutation/timing-analysis";
import ConditionSelection from '@/components/condition-selection';
import ExportPdfButton from '@/components/export-pdf';
import {
    Collapse,
    Row,
    Col,
    Tooltip,
    Checkbox,
    Button,
    Flex,
    Splitter,
    Typography,
    Segmented,
    message,
    Radio
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
const RELOAD_ICON = "/images/reload.svg";
const Mutation = () => {
    const { t } = useTranslation();
    const [treeType, setTreeType] = useState("overview");
    const [dataType, setDataType] = useState("planet");
    const [mutationTypeTab, setMutationTypeTab] = useState("driverLandscape");
    const [sampleType, setSampleType] = useState("bySample");
    const [applyLoading, setApplyLoading] = useState(false);
    const [sliderValue, setSliderValue] = useState([0, 1]);
    const [messageApi, contextHolder] = message.useMessage();
    const [params, setParams] = useState({});
    const [leftPanelSize, setLeftPanelSize] = useState(DEFAULT_LEFT_PANEL_WIDTH);
    const [rightPanelSize, setRightPanelSize] = useState(DEFAULT_RIGHT_PANEL_WIDTH);
    const driverLandscapeRef = useRef(null);
    const conditionSelectionRef = useRef(null);

    const handleApply = useCallback(() => {
        setParams(conditionSelectionRef.current?.getParams());
    }, []);

    const handleApplyLoading = (loading) => {
        setApplyLoading(loading);
    }

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

    const onSampleTypeChange = useCallback((value) => {
        setSampleType(value);
    }, [])

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

    const dataTypeCollapseContent = () => {
        return <div className={styles.searchCard}
            variant="borderless">
                <Radio.Group
            value={dataType}
            onChange={onDataTypeChange}
            options={[
            { value: "planet", label: 'PLANET' },
            { value: "dt", label: 'DT' },
            { value: "all", label: 'All' },
            ]}
  />

        </div>
    }

    const onDataTypeChange = (e) => {
        setDataType(e.target.value);
    }

    return (
        <>
            {contextHolder}
            <Splitter className={styles.mutationSplitter} lazy onResize={onPanelChange}>
                <Panel className={styles.searchPanel} size={leftPanelSize} min={"20%"} max="50%">
                    <Flex justify='space-between' align='center' style={{ paddingLeft: "10px", height: "40px" }}>
                        <Button color="default" size="middle" disabled={applyLoading} icon={applyLoading ? <LoadingOutlined /> : <AppstoreOutlined />} loading={applyLoading} onClick={handleApply} type="primary"
                            style={{ color: "#fff", background: !applyLoading ? "rgb(237, 108, 116)" : "gray" }}>
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
                    <ConditionSelection ref={conditionSelectionRef} handleInitChange={handleApply} onITHChange={setSliderValue} showITH={mutationTypeTab !== "driverLandscape"}></ConditionSelection>
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
                                options={[
                                    { label: 'Driver Landscape', value: "driverLandscape" },
                                    { value: "phylogeneticRelationship", label: 'Phylogenetic Relationship' },
                                    { value: 'timingAnalysis', label: "Timing Analysis" },
                                ]}
                                value={mutationTypeTab}
                                onChange={value => setMutationTypeTab(value)}
                            />
                        </Flex>
                        
                        {
                            mutationTypeTab === "phylogeneticRelationship" && <Segmented
                                onChange={setTreeType}
                                options={[{ value: "overview", label: "Overview" }, { value: "detail", label: "Detail" }]}
                                value={treeType}
                            />
                        }
                        {
                            mutationTypeTab === "driverLandscape" && <Segmented
                                onChange={onSampleTypeChange}
                                options={[{ value: "bySample", label: "By Sample" }, { value: "byPatient", label: "By Patients" }]}
                                value={sampleType}
                            />
                        }
                        {/* <Button loading={loading} onClick={exportToPDF}>111</Button> */}
                        <ExportPdfButton document={driverLandscapeRef.current}></ExportPdfButton>
                    </Flex>
                    {
                        mutationTypeTab === "driverLandscape" && <DriverLandscape dataType={dataType} ref={driverLandscapeRef} handleApplyLoading={handleApplyLoading} conditions={params} sampleType={sampleType}></DriverLandscape>
                    }
                    {
                        mutationTypeTab === "phylogeneticRelationship" && <PhylogeneticRelationship  dataType={dataType}  range={sliderValue} conditions={params} treeType={treeType}></PhylogeneticRelationship>
                    }
                    {
                        mutationTypeTab === "timingAnalysis" && <TimingAnalysis dataType={dataType} range={sliderValue} conditions={params}></TimingAnalysis>
                    }
                </Panel>
            </Splitter>
        </>
    )
}

export default Mutation;