"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { usePDF } from 'react-to-pdf';
import { getGeneList, getValidGeneList } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined, ApartmentOutlined, BranchesOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import ConditionSelection from '@/components/condition-selection';
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
    Alert,
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
import Overall from '@/components/overall';
import styles from "./style.module.scss";
import { clinicConfig } from '@/configs/mutation';
const { Panel } = Splitter;
const RELOAD_ICON = "/images/reload.svg";
const SEARCH_SRC = "/images/search.svg";
const LEFT_SQUARE_SRC = "/images/left-square.svg";
const RIGHT_SQUARE_SRC = "/images/right-square.svg";
const IMPORT_SRC = "/images/import.svg";
const DRIVER_COLORS = ["rgb(239, 207, 210)", "rgb(205, 205, 205)"];
const DEFAULT_LEFT_PANEL_WIDTH = "25%";
const DEFAULT_RIGHT_PANEL_WIDTH = "75%";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;


const Clinical = () => {
    const { t } = useTranslation();
    const [treeType, setTreeType] = useState("overview");
    const [driverList, setDriverList] = useState(["driver", "not-driver"]);
    const [mutationTypeTab, setMutationTypeTab] = useState("driverLandscape");
    const [sampleType, setSampleType] = useState("bySample");
    const [applyLoading, setApplyLoading] = useState(false);
    const [sliderValue, setSliderValue] = useState([0, 1]);
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
    const [loading, setLoading] = useState(false)
    const conditionSelectionRef = useRef(null);
    const [clinicList, setClinicList] = useState({
        gender: [],
        age: [],
        race: [],
        tnmStageV8: [],
        viralStatus: []
    });
    const geneRef = useRef(null);
    const paramsRef = useRef(null);
    const overAllRef = useRef(null);
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
    const handleDNAReload = (event) => {
        event.stopPropagation();
        setSliderValue([0, 1])
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
       setParams(conditionSelectionRef.current.getParams());
       overAllRef.current?.setApplyLoading();
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

    const handleApplyLoading = (loading) => {
        setApplyLoading(loading);
    }

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
                 <ConditionSelection ref={conditionSelectionRef} showClinical showITH={false} showGeneList={false}></ConditionSelection>

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
                        </Flex>
                        
                    </Flex>
                    <Alert style={{margin: "0 10px"}} message="In this genomic modal, you will be able to explore the driver status (“Driver Landscape”) as well as Phylogenetic Relationship of the PLANet and Ditan cohort. 
"></Alert>
                    <Overall conditions={params} handleApplyLoading={handleApplyLoading}></Overall>
                </Panel>
            </Splitter>
        </>
    )
}

export default Clinical;