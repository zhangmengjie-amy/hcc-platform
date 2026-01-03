"use client";
import React, { useRef, useMemo, useEffect, useImperativeHandle, useState, useCallback, forwardRef } from "react";
import { usePDF } from "react-to-pdf";
import { getGeneList, getValidGeneList, getClinicalConfig } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined, ApartmentOutlined, BranchesOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
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
  Radio,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { FixedSizeList } from "react-window";
import styles from "./style.module.scss";
const RELOAD_ICON = "/images/reload.svg";
const IMPORT_SRC = "/images/import.svg";
const DRIVER_COLORS = ["rgb(239, 207, 210)", "rgb(205, 205, 205)"];
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const ConditionSelection = forwardRef(({ }, ref) => {
  const { t } = useTranslation();
  const [driverList, setDriverList] = useState("driver");
  const [sliderValue, setSliderValue] = useState([0, 1]);
  const [filterValue, setFilterValue] = useState("");
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [filteredList, setFilteredList] = useState([]);
  const [current, setCurrent] = useState(1);
  const [geneList, setGeneList] = useState([]);
  const [clinicList, setClinicList] = useState({
    gender: [],
    age: [],
    race: [],
    stage: [],
    viralStatus: [],
  });
  const filteredRef = useRef(null);
  const clinicalConfigRef = useRef(null);
  const paramsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getParams: () => {
      return paramsRef.current;
    },
  }));

  useEffect(() => {
    setFetchLoading(true);
    getClinicalConfig().then((results) => {
      clinicalConfigRef.current = results;
      paramsRef.current = _params;
      setFetchLoading(false);
    });
  }, []);

  const handleClinicReload = (event) => {
    event.stopPropagation();
    setClinicList({
      gender: [],
      age: [],
      race: [],
      stage: [],
      viralStatus: [],
    });
    paramsRef.current = {
      ...paramsRef.current,
      gender: [],
      age: [],
      race: [],
      stage: [],
      viralStatus: [],
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
  const handleSearchGene = debounce((_filterValue) => {
    if (loadMoreLoading) return;
    setLoadMoreLoading(true);
    getGeneList(1, DEFAULT_PAGE_SIZE, _filterValue)
      .then(newData => {
        filteredRef.current = newData.records;
        setFilteredList(filteredRef.current);
        setCurrent(1);
      })
      .finally(() => {
        setLoadMoreLoading(false);
      });
  }, 300);

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

  const clinicCollapseContent = () => {
    return <div className={styles.clinicCard} style={{ height: 240, overflowY: "scroll", overflowX: "hidden" }}
      variant="borderless">
      <Row key={"clinicContent"}>
        {
          clinicalConfigRef.current && ["age", "stage", "hbv", "hcv", "race", "gender"]?.map((item, index) => {
            return <Col xs={12} md={12} lg={12} key={item}>
              <Timeline
                items={[{
                  dot: <Image src={`/images/${item == "stage" ? "tnm-stage-v8" : item}.svg`} width={15} height={15} alt={item}></Image>,
                  children: <Checkbox.Group value={clinicList[item]} onChange={(value) => { onClinicChange(value, item); }} key={index}>
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
                                  expandable: false,
                                }}>{t(`mutation:sample.${child}`)}</Typography.Paragraph></Checkbox>
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
    </div>;
  };
  return (
    <div className={styles.conditionSelection}>
      {
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
      }

    </div>
  );
});

export default ConditionSelection;