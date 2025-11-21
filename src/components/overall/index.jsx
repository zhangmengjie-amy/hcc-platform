"use client";
import React, { useEffect, useRef, useState, forwardRef } from "react";
import { Row, Col, Flex } from "antd";
import { clinicCountConfig } from "@/configs/mutation";
import { getFullMutations } from "@/configs/request";
import EmptyLoading from "@/components/empty-loading";
import Chart from "./chart";

const Overall = forwardRef(({ conditions, handleApplyLoading }, ref) => {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const fullMutationsRef = useRef(null);
  const [countConfig, setCountConfig] = useState(null);
  useEffect(() => {
    if (!conditions?.geneList) return;
    handleApplyLoading?.(true);
    setLoading(true);
    const sampleWorker = new Worker("/workers/calculate.js");
    try {
      Promise.all([getFullMutations()]).then((results) => {
        fullMutationsRef.current = results[0];
        sampleWorker.postMessage({ key: "overall", data: { originalMutations: fullMutationsRef.current, conditions } });
        sampleWorker.onmessage = (event) => {
          const result = event.data;
          const _countConfig = {
            age: {},
            gender: {},
            viralStatus: {},
            race: {},
            stage: {},
          };
          if (result.clinicList.length == 0) {
            setHasData(false);
            setCountConfig(_countConfig);
            return;
          }
          Object.keys(_countConfig).forEach((item) => {
            Object.keys(clinicCountConfig[item]).forEach((key) => {
              let count = 0;
              if (item == "age") {
                if (key == "<20") {
                  count = result.clinicList.filter(c => c[item].value < 20).length;
                } else if (key == "20-39") {
                  count = result.clinicList.filter(c => c[item].value >=20 && c[item].value <=39).length;
                } else if (key == "40-59") {
                  count = result.clinicList.filter(c => c[item].value >=40 && c[item].value <=59).length;
                } else if (key == "60-79") {
                  count = result.clinicList.filter(c => c[item].value >=60 && c[item].value <=79).length;
                } else if (key == ">=80") {
                  count = result.clinicList.filter(c => c[item].value >=80).length;
                }
              } else if (item == "viralStatus") {
                if (key == "hbv-single-positive") {
                  count = result.clinicList.filter(c => c["hbv"].value == "positive" && c["hcv"].value == "negative").length;
                } else if (key == "hcv-single-positive") {
                  count = result.clinicList.filter(c => c["hcv"].value == "positive" && c["hbv"].value == "negative").length;
                } else if (key == "double-positive") {
                  count = result.clinicList.filter(c => c["hcv"].value == "positive" && c["hbv"].value == "positive").length;
                } else if (key == "double-negative") {
                  count = result.clinicList.filter(c => c["hcv"].value == "negative" && c["hbv"].value == "negative").length;
                }
              } else {
                count = result.clinicList.filter(c => c[item].value == key).length;
              }

              _countConfig[item][key] = {
                count,
                color: clinicCountConfig[item][key],
              };
            });
          });
          setHasData(true);
          setCountConfig(_countConfig);
        };
        handleApplyLoading?.(false);
        setLoading(false);
      });
    } catch (error) {
    
    }
    return () => {
      sampleWorker.terminate();
    };
  }, [conditions]);

  return (

    <Row ref={ref} style={{ width: "100%" }}>
      <Row style={{ width: "100%" }}>
        {
          countConfig && Object.keys(countConfig)?.map((item, index) => {
            return <Col key={index} xs={8} sm={8} md={8} lg={8} xl={8}>
              <div style={{ margin: "10px", padding: "10px", border: "1px solid #f0f0f0", borderRadius: "12px" }}>
                {
                  <EmptyLoading loading={false} hasData={hasData}>
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
