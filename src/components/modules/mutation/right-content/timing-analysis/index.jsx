"use client";
import React, { useRef, useEffect, useState } from "react";
import { getPatientList } from "@/configs/request";
import VerticalTree from "@/components/common/tree/vertical-tree";
import { getFullPhylogenetic, getFullMutations } from "@/configs/request";
import {
  Row,
  Col,
  Typography,
  Flex,
  Pagination,
} from "antd";
import distinctColors from "@/utils/colors";
import { useTranslation } from "react-i18next";
import EmptyLoading from "@/components/empty-loading";
import TreeDialog from "@/components/tree-dialog";
import generateGradientColors from "@/utils/ith-color";


const TimingAnalysis = ({ range = [0, 1], dataType = "planet", conditions, handleComplete }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [treeList, setTreeList] = useState(null);
  const rangePatientListRef = useRef(null);
  const currentPatientRef = useRef(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(6);
  const [modalOpen, setModalOpen] = useState(false);
  const patientListRef = useRef(null);
  const fullMutationsRef = useRef(null);
  const fullPhylogeneticRef = useRef(null);

  useEffect(() => {
    if (!conditions?.geneList) return;
    if (!patientListRef.current || !fullMutationsRef.current) {
      Promise.all([getFullMutations(null), getPatientList(null), getFullPhylogenetic(null)]).then((results) => {
        const [originalMutations, patientList, fullPhylogenetic] = results;
        patientListRef.current = patientList?.data ?? [];
        fullMutationsRef.current = originalMutations?.data ?? [];
        fullPhylogeneticRef.current = fullPhylogenetic?.data ?? [];
        let _fullMutations = fullMutationsRef.current;
        let _patientList = patientListRef.current;
        if (dataType !== "all") {
          _patientList = patientListRef.current?.filter((item) => item.type === dataType?.toUpperCase());
          _fullMutations = fullMutationsRef.current?.filter((item) => item.type === dataType?.toUpperCase());
        }
        buildCharts(_fullMutations, _patientList, fullPhylogeneticRef.current);
      });
    } else {
      let _fullMutations = fullMutationsRef.current;
      let _patientList = patientListRef.current;
      if (dataType !== "all") {
        _patientList = patientListRef.current?.filter((item) => item.type === dataType?.toUpperCase());
        _fullMutations = fullMutationsRef.current.filter((item) => item.type === dataType?.toUpperCase());
      }
      buildCharts(_fullMutations, _patientList, fullPhylogeneticRef.current);
    }

    setStart(0);
    setEnd(6);
  }, [conditions, dataType, range]);

  const buildCharts = (fullMutations, patientList, fullPhylogenetic) => {
    const sampleWorker = new Worker("/workers/calculate.js");
    sampleWorker.postMessage({ key: "filterGene", data: { originalMutations: fullMutations, conditions } });
    sampleWorker.onmessage = (event) => {
      const result = event.data;
      const colors = generateGradientColors(100);
      let _patientList = patientList?.filter((item) => !!item.newick)?.map((item) => {
        return {
          ...item,
          itemStyle: { color: colors[item.ith == 0 ? 0 : (Math.round((Number(item.ith)?.toFixed(2) ?? 1) * 100) - 1)] },
          ith: (Number(item.ith))?.toFixed(2) ?? 1,
        };
      });
      _patientList = _patientList?.sort((a, b) => a.ith - b.ith);
      rangePatientListRef.current = getPatientListByRange(_patientList);

      const treeList = rangePatientListRef.current?.filter((item) => result.finialSampleList?.some((patient) => patient == item.patientId)).map((item) => {
        const geneData = fullPhylogenetic?.filter((sample) => sample?.sampleId?.includes(`${item.patientId}_`));
        return {
          ...item,
          geneData: geneData,
        };
      });
      const treeWorker = new Worker("/workers/full-tree.js");
      treeWorker.postMessage({ treeData: treeList });
      treeWorker.onmessage = ({ data: { treeList } }) => {
        setTreeList(treeList);
        setLoading(false);
        handleComplete?.(true);
      };
    };
    return () => {
      sampleWorker.terminate();
      treeWorker.terminate();
    };
  };

  const getPatientListByRange = (_patientList) => {
    return _patientList?.filter((item) => {
      return item.ith >= range[0] && item.ith <= range[1];
    });
  };

  const handleClick = (patientId) => {
    currentPatientRef.current = rangePatientListRef.current.find((item) => item.patientId == patientId);
    setModalOpen(true);
  };

  const onPageSizeChange = (page, pageSize) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setStart(start);
    setEnd(end);
  };

  return (
    <>
      <EmptyLoading loading={loading} showEmpty={true} hasData={!!treeList?.length}>
        <Row style={{ width: "100%" }}>
          {
            treeList?.slice(start, end)?.map((item) => {
              return <Col key={item?.patientId} xs={12} sm={12} md={12} lg={12} style={{ cursor: "pointer" }}>
                <EmptyLoading hasData={!!treeList?.length} loading={loading}>
                  <div style={{ margin: "10px", height: "350px", padding: "10px", boxShadow: "0 0 10px rgba(0, 0, 0, .05)", border: "1px solid #f0f0f0", borderRadius: "12px" }}>
                    <Typography.Paragraph style={{ margin: 0, textAlign: "left" }}>
                      {t("common:patientId")}: <span style={{ fontWeight: "bold" }}>{item.patientId}</span>  {t("common:ITH")}: <span style={{ fontWeight: "bold" }}> {item.ith}</span>
                    </Typography.Paragraph>
                    <Flex style={{ height: "300px" }}>
                      <VerticalTree
                        circleRadius={6}
                        handleClick={() => { handleClick(item.patientId); }}
                        color={item.itemStyle?.color}
                        showTooltip={false}
                        data={item.tree}
                        baseline="left"
                        geneList={conditions?.geneList}
                      />
                    </Flex>
                  </div>
                </EmptyLoading>
              </Col>;
            })
          }
        </Row>
        <Flex justify="flex-end" style={{ margin: "20px 0" }}> <Pagination
          total={treeList?.length}
          showTotal={(total) => `${t("common:patientCount")}:${total}`}
          defaultPageSize={6}
          onChange={onPageSizeChange}
          defaultCurrent={1}
          pageSizeOptions={[6, 10, 20, 50, 100]}
        />
        </Flex>
      </EmptyLoading>
      {
        modalOpen && <TreeDialog showTumor geneList={conditions?.geneList} dataType={dataType} treeData={currentPatientRef.current} modalOpen={modalOpen} onclose={() => { setModalOpen(false); }} />
      }

    </>
  );
};

export default TimingAnalysis;