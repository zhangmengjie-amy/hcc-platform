'use client';
import React, { useRef, useEffect, useImperativeHandle, useState, useCallback, forwardRef } from 'react';
import { usePDF } from 'react-to-pdf';
import { getGeneList, getValidGeneList } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined, ApartmentOutlined, BranchesOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import EmptyLoading from "@/components/empty-loading";
import {
    Card,
    Collapse,
    Radio,
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
    message
} from 'antd';
import { useTranslation } from "react-i18next";
import Image from 'next/image';
import { clinicConfig } from '@/configs/mutation';
import { FixedSizeList } from 'react-window';
import styles from "./style.module.scss";
const RELOAD_ICON = "/images/reload.svg";
const SEARCH_SRC = "/images/search.svg";
const IMPORT_SRC = "/images/import.svg";
const DRIVER_COLORS = ["rgb(239, 207, 210)", "rgb(205, 205, 205)"];
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const DEGCondition = forwardRef(({ onITHChange, handleInitChange, showITH = true, showGeneList = true, showClinical = true }, ref) => {
    const { t } = useTranslation();
    const [driverList, setDriverList] = useState(["driver", "not-driver"]);
    const [sliderValue, setSliderValue] = useState([0, 1]);
    const [showSearchInput, setShowSearchInput] = useState(false);
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
    const geneRef = useRef(null);
    const listRef = useRef(null);
    const searchResultRef = useRef(null);
    const paramsRef = useRef(null);

    useImperativeHandle(ref, () => ({
        getParams: () => {
            return paramsRef.current;
        }
    }));

    useEffect(() => {

    }, []);

    return (
        <div className={styles.DEGCondition}>
             <Card title="Analysis" variant="borderless" style={{ width: 300 }}>
                <Radio.Group value={1} onChange={(e) => {}}>
                    <Radio value={1}>N/T</Radio>
                    <Radio value={2}>HBV</Radio>
                    <Radio value={3}>HCV</Radio>
                    <Radio value={4}>Age</Radio>
                    <Radio value={5}>Race</Radio>
                    <Radio value={6}>Race</Radio>
                    <Radio value={7}>Race</Radio>
                </Radio.Group>
            </Card>
        </div>
    );
})

export default DEGCondition