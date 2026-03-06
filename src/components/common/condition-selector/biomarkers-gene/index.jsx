/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
"use client";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from "react";
import {
  getBiomarkersGeneList,
  getBiomarkersSingleGene,
} from "@/configs/request";
import GeneUpload from "@/components/common/condition-selector/gene-upload";
import { CaretRightOutlined, LinkOutlined } from "@ant-design/icons";

import {
  Collapse,
  Radio,
  Tag,
  Tooltip,
  Button,
  Spin,
  Flex,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "../style.module.scss";

const RELOAD_ICON = "/images/reload.svg";
const GENE_SET_COLOR = {
  "Broad spectrum of tumor Biomarkers": "purple",
  "Classic HCC Biomarkers": "green",
  "Immune Biomarkers": "blue",
};
const BiomarkersGene = forwardRef(({ onChange, onReady }, ref) => {
  const { t } = useTranslation();
  const paramsRef = useRef(null);
  const [singleGeneList, setSingleGeneList] = useState([]);
  const [geneList, setGeneList] = useState([]);
  const [selectedGeneType, setSelectedGeneType] = useState("singleGene");
  const [selectedCustomizedGeneList, setSelectedCustomizedGeneList] = useState([]);
  const [selectedSingleGene, setSelectedSingleGene] = useState("");
  const [selectedGeneSet, setSelectedGeneSet] = useState("");
  const [loading, setLoading] = useState(true);

  const handleDriverReload = (event) => {
    event.stopPropagation();
  };

  useImperativeHandle(ref, () => ({
    getParams: () => {
      return paramsRef.current;
    },
  }));

  useEffect(() => {
    setLoading(true);
    Promise.all([getBiomarkersSingleGene(), getBiomarkersGeneList()])
      .then((results) => {
        const [singleGeneListResult, geneListResult] = results;
        setSingleGeneList(singleGeneListResult?.data);
        setSelectedSingleGene(singleGeneListResult?.data[0]?.geneName);
        setGeneList(geneListResult?.data);
        setSelectedGeneSet(geneListResult?.data[0]?.geneListName);

        onReady({
          selectedGeneType: "singleGene",
          selectedSingleGene: singleGeneListResult?.data[0]?.geneName,
          selectedGeneSet: geneListResult?.data[0]?.geneListName,
          selectedCustomizedGeneList: [],
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    onChange({
      selectedGeneType,
      selectedSingleGene,
      selectedGeneSet,
      selectedCustomizedGeneList,
    });
  }, [
    selectedGeneType,
    selectedSingleGene,
    selectedGeneSet,
    selectedCustomizedGeneList,
  ]);

  const biomarkersCollapseTitle = () => {
    return (
      <Flex justify={"space-between"} align={"center"}>
        <Typography.Title
          level={5}
          ellipsis={{
            rows: 1,
            expandable: false,
          }}
          style={{ margin: 0, color: "#fff", fontWeight: "500" }}
        >
          {t("common:filter.biomarkerMethod")}
        </Typography.Title>

        {/* <Tooltip placement="bottom" title={t("common:resetSelection")}>
          <Button
            color="default"
            onClick={(event) => {
              handleDriverReload(event);
            }}
            variant="text"
            style={{ color: "#fff", padding: 0 }}
          >
            <Image
              src={RELOAD_ICON}
              alt="reload"
              width={16}
              height={16}
              tooltip={t("common:reload")}
            />
          </Button>
        </Tooltip> */}
      </Flex>
    );
  };

  const biomarkersCollapseContent = () => {
    return (
      <div className={styles.searchCard} variant="borderless">
        <Flex vertical>
          <Flex
            vertical
            flex={1}
            style={{
              border: "1px solid #f5f5f5",
              boxShadow: "0 4px 12px #f5f5f5",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <Typography.Title level={5}>{t("common:filter.geneType")}</Typography.Title>
            <Radio.Group
              onChange={(e) => {
                setSelectedGeneType(e.target.value);
              }}
              value={selectedGeneType}
            >
              <Flex vertical>
                <Radio value="singleGene">{t("common:filter.singleGene")}</Radio>
                <Radio value="geneLists">{t("common:filter.geneLists")}</Radio>
                <Radio value="customized">{t("common:filter.customGeneList")}</Radio>
              </Flex>
            </Radio.Group>
          </Flex>
          {loading ? (
            <Flex
              vertical
              align="center"
              justify="center"
              flex={3}
              style={{
                marginTop: "15px",
                border: "1px solid #f5f5f5",
                boxShadow: "0 4px 12px #f5f5f5",
                padding: "15px",
                borderRadius: "12px",
              }}
            >
              <Spin></Spin>
            </Flex>
          ) : (
            <>
              {selectedGeneType == "singleGene" && (
                <Flex
                  vertical
                  style={{
                    marginTop: "15px",
                    border: "1px solid #f5f5f5",
                    boxShadow: "0 4px 12px #f5f5f5",
                    padding: "15px",
                    borderRadius: "12px",
                  }}
                >
                  <Typography.Title level={5}>{t("common:filter.singleGene")}</Typography.Title>
                  <Radio.Group
                    onChange={(e) => {
                      setSelectedSingleGene(e.target.value);
                    }}
                    value={selectedSingleGene}
                  >
                    <Flex vertical>
                      {singleGeneList?.map((item) => {
                        return (
                          <div style={{ marginBottom: "5px" }} key={item.geneName}>
                            <Radio value={item.geneName}>
                              {item.geneName}
                            </Radio>
                            <Tag style={{ float: "right" }} color={GENE_SET_COLOR[item.label]}>{item.label}</Tag>
                          </div>
                        );
                      })}
                    </Flex>
                  </Radio.Group>
                </Flex>
              )}
              {selectedGeneType == "geneLists" && (
                <Flex
                  vertical
                  style={{
                    marginTop: "15px",
                    border: "1px solid #f5f5f5",
                    boxShadow: "0 4px 12px #f5f5f5",
                    padding: "15px",
                    borderRadius: "12px",
                  }}
                >
                  <Typography.Title level={5}>{t("common:filter.geneLists")}</Typography.Title>
                  <Radio.Group
                    onChange={(e) => {
                      setSelectedGeneSet(e.target.value);
                    }}
                    value={selectedGeneSet}
                  >
                    <Flex vertical>
                      {geneList?.map((item) => {
                        return (
                          <div style={{ marginBottom: "5px" }} key={item.geneListName}>
                            <Radio value={item.geneListName}>
                              {item.geneListName}
                            </Radio>
                            <Tooltip
                              title={`https://doi.org/${item.doi}`}
                              placement="top"
                              
                            >
                              <Tag style={{ float: "right" }}>
                                <a
                                  href={`https://doi.org/${item.doi}`}
                                  target="_blank"
                                >
                                  <LinkOutlined />
                                </a>
                              </Tag>
                            </Tooltip>
                          </div>
                        );
                      })}
                    </Flex>
                  </Radio.Group>
                </Flex>
              )}
              {selectedGeneType == "customized" && (
                <Flex
                  vertical
                  style={{
                    marginTop: "15px",
                    border: "1px solid #f5f5f5",
                    boxShadow: "0 4px 12px #f5f5f5",
                    padding: "15px",
                    borderRadius: "12px",
                  }}
                >
                  <Typography.Title level={5}>{t("common:filter.customGeneList")}</Typography.Title>
                  <GeneUpload
                    onChange={setSelectedCustomizedGeneList}
                  ></GeneUpload>
                </Flex>
              )}
            </>
          )}
        </Flex>
      </div>
    );
  };

  return (
    <div className={styles.condition}>
      <Collapse
        defaultActiveKey={"biomarkers"}
        className={styles.searchCollapse}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: 14 }}
            rotate={isActive ? 90 : 0}
          />
        )}
        items={[
          {
            key: "biomarkers",
            label: biomarkersCollapseTitle(),
            children: biomarkersCollapseContent(),
          },
        ]}
      ></Collapse>
    </div>
  );
});

export default BiomarkersGene;
