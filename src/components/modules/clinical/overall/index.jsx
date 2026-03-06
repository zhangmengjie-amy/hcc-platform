/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

"use client";
import React, { useEffect, useRef, useState, forwardRef } from "react";
import { Row, Col } from "antd";
import { clinicCountConfig } from "@/configs/mutation";
import { getPatientList } from "@/configs/request";
import EmptyLoading from "@/components/empty-loading";
import Chart from "./chart";

const Overall = forwardRef(({ conditions, selectedCohortType }, ref) => {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const [countConfig, setCountConfig] = useState(null);
  const [filteredPatientList, setFilteredPatientList] = useState(null);
  const patientListRef = useRef(null);
  useEffect(() => {
    setLoading(true);
    try {
      getPatientList(null).then((result) => {
        patientListRef.current = result?.data;
        const _countConfig = {
          age: {},
          gender: {},
          viralStatus: {},
          race: {},
          stage: {},
        };
        if (!result?.data?.length) {
          setHasData(false);
          setCountConfig(_countConfig);
          return;
        }
        const countResult = formatPatient(_countConfig, result?.data);
        setHasData(true);
        setCountConfig(countResult);
        setLoading(false);
      });
    } catch (error) {
    }
  }, []);

  useEffect(() => {
    const _countConfig = {
      age: {},
      gender: {},
      viralStatus: {},
      race: {},
      stage: {},
    };
    if (!filteredPatientList?.length) {
      setHasData(false);
      setCountConfig(_countConfig);
      return;
    }
    const countResult = formatPatient(_countConfig, filteredPatientList);
    setHasData(true);
    setCountConfig(countResult);

  }, [filteredPatientList]);

  const formatPatient = (_countConfig, _patientList) => {
    Object.keys(_countConfig).forEach((item) => {
      Object.keys(clinicCountConfig[item]).forEach((key) => {
        let count = 0;
        if (item == "age") {
          if (key == "<20") {
            count = _patientList?.filter((c) => c[item] < 20).length;
          } else if (key == "20-39") {
            count = _patientList?.filter((c) => c[item] >= 20 && c[item] <= 39).length;
          } else if (key == "40-59") {
            count = _patientList?.filter((c) => c[item] >= 40 && c[item] <= 59).length;
          } else if (key == "60-79") {
            count = _patientList?.filter((c) => c[item] >= 60 && c[item] <= 79).length;
          } else if (key == ">=80") {
            count = _patientList?.filter((c) => c[item] >= 80).length;
          }
        } else if (item == "viralStatus") {
          if (key == "hbv-single-positive") {
            count = _patientList?.filter(
              (c) => c["hbv"] == "positive" && c["hcv"] == "negative",
            ).length;
          } else if (key == "hcv-single-positive") {
            count = _patientList?.filter(
              (c) => c["hcv"] == "positive" && c["hbv"] == "negative",
            ).length;
          } else if (key == "double-positive") {
            count = _patientList?.filter(
              (c) => c["hcv"] == "positive" && c["hbv"] == "positive",
            ).length;
          } else if (key == "double-negative") {
            count = _patientList?.filter(
              (c) => c["hcv"] == "negative" && c["hbv"] == "negative",
            ).length;
          }
        } else {
          count = _patientList?.filter((c) => c[item] == key).length;
        }
        _countConfig[item][key] = {
          count,
          color: clinicCountConfig[item][key],
        };
      });
    });
    return _countConfig;
  };

  useEffect(() => {

    const _filteredPatientList = patientListRef.current?.filter((item) => (selectedCohortType == "ALL") || (item.type == selectedCohortType)).filter((clinic) => {
      if (!conditions) return true;
      return Object.keys(conditions).every((condition) => {
        if (!conditions?.[condition]?.length) return true;
        let realValue = clinic[condition];
        if (condition === "age") {
          if (clinic["age"] < 20) {
            realValue = "<20";
          } else if (clinic["age"] >= 20 && clinic["age"] <= 39) {
            realValue = "20-39";
          } else if (clinic["age"] >= 40 && clinic["age"] <= 59) {
            realValue = "40-59";
          } else if (clinic["age"] >= 60 && clinic["age"] <= 79) {
            realValue = "60-79";
          } else {
            realValue = ">=80";
          }
        }
        return conditions[condition]?.includes(realValue);
      });
    });
    setFilteredPatientList(_filteredPatientList);

  }, [conditions, selectedCohortType]);

  return (

    <Row ref={ref} style={{ width: "100%" }}>
      <Row style={{ width: "100%" }}>
        {
          countConfig && Object.keys(countConfig)?.map((item, index) => {
            return <Col key={index} xs={8} sm={8} md={8} lg={8} xl={8}>
              <div style={{ margin: "10px", padding: "10px", border: "1px solid #f0f0f0", borderRadius: "12px" }}>
                {
                  <EmptyLoading loading={loading} hasData={hasData}>
                    <Chart title={item} option={countConfig[item]}></Chart>
                  </EmptyLoading>
                }
              </div>
            </Col>;
          })
        }
      </Row>
    </Row>
  );
});
export default Overall;
