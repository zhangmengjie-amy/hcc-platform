"use client";
import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useRef,
  useMemo,
  useImperativeHandle,
} from "react";
import { CaretRightOutlined } from "@ant-design/icons";

import {
  Collapse,
  Radio,
  Tooltip,
  Checkbox,
  Button,
  Flex,
  Segmented,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import {
  getGeneList,
  getValidGeneList,
  getGeneSetList,
} from "@/configs/request";
import GeneSetUpload from "@/components/condition-selector/gene-upload";
import styles from "../style.module.scss";
import { FixedSizeList } from "react-window";

const RELOAD_ICON = "/images/reload.svg";

const DEGGroupBy = forwardRef(({ onChange, onReady }, ref) => {
  const { t } = useTranslation();
  const [method, setMethod] = useState("cibersort");
  const [groupBy, setGroupBy] = useState("NT");
  const [firstGroup, setFirstGroup] = useState(["Tumor"]);
  const [secondGroup, setSecondGroup] = useState(["Normal"]);
  const [geneType, setGeneType] = useState("pathway");
  const [selectedGeneSet, setSelectedGeneSet] = useState(null);
  const [fixedGeneType, setFixedGeneType] = useState("H");
  const [validatedGenesFromChild, setValidatedGenesFromChild] = useState([]);
  const geneSetlistRef = useRef(null);
  
  const geneSetList = useMemo(() => {
    let geneSetArray = [];
    if (fixedGeneType == "H") {
      geneSetArray = geneSetlistRef.current?.filter((item) => item.gsCat === "H");
    } else {
      geneSetArray = geneSetlistRef.current?.filter((item) => item.gsCat === "C2");
    }
    if (!selectedGeneSet) {
      setSelectedGeneSet(geneSetArray?.[0]?.gsName ?? null);
    }

    return geneSetArray;
  }, [fixedGeneType, groupBy, selectedGeneSet]);

  useEffect(() => {
    if (groupBy === "NT") {
      setFirstGroup(["Tumor"]);
      setSecondGroup(["Normal"]);
    }
    if (groupBy === "HBV" || groupBy === "HCV") {
      setFirstGroup(["Positive"]);
      setSecondGroup(["Negative"]);
    }
    if (groupBy === "Age") {
      setFirstGroup(["<20", "20-40", "40-60"]);
      setSecondGroup(["60-80", ">=80"]);
    }
    if (groupBy === "Stage") {
      setFirstGroup(["I", "II"]);
      setSecondGroup(["III", "IV"]);
    }
  }, [groupBy]);

  useEffect(() => {
    let geneList = validatedGenesFromChild;
    let geneSet = selectedGeneSet;
    let _firstGroup = firstGroup;
    let _secondGroup = secondGroup;
    const _geneType = geneType;
    const _groupBy = groupBy;

    if (groupBy === "Gene") {
      if (_geneType === "custom") {
        geneSet = null;
      } else if (_geneType === "pathway") {
        geneList = null;
      }
      _firstGroup = null;
      _secondGroup = null;
    }

    onChange({
      geneList,
      geneSet,
      secondGroup: _secondGroup,
      firstGroup: _firstGroup,
      geneType: _geneType,
      groupBy: _groupBy,
    });

  }, [
    groupBy,
    firstGroup,
    secondGroup,
    geneType,
    selectedGeneSet,
    validatedGenesFromChild,
  ]);

  const virtualRow = useCallback(
    ({ index, style }) => {
      const item = geneSetList[index];

      return (
        <div style={style}>
          <Radio
            value={item.gsName}
            style={{
              width: "100%",
              padding: "6px 12px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.gsName}
          </Radio>
        </div>
      );
    },
    [geneSetList],
  );

  useEffect(() => {
    getGeneSetList().then((data) => {
      geneSetlistRef.current = data;
    });
  }, []);

  const handleGenesValidated = (genes) => {
    setValidatedGenesFromChild(genes);
  };

  const analysisCollapseTitle = () => {
    return (
      <Flex justify={"space-between"} align={"center"}>
        <Typography.Paragraph
          ellipsis={{
            rows: 1,
            expandable: false,
          }}
          style={{ margin: 0, color: "#fff", fontWeight: "500" }}
        >
          {t("common:filter.group")}
        </Typography.Paragraph>

        <Tooltip placement="bottom" title={t("common:reset-selection")}>
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
        </Tooltip>
      </Flex>
    );
  };

  const analysisCollapseContent = () => {
    return (
      <div className={styles.searchCard} variant="borderless">
        <Flex>
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
            <Typography.Paragraph>Group By</Typography.Paragraph>
            <Radio.Group
              value={groupBy}
              onChange={(e) => {
                setGroupBy(e.target.value);
              }}
            >
              <Flex>
                <Flex vertical flex={1}>
                  <Radio value={"NT"}>N/T</Radio>
                  <Radio value={"HBV"}>HBV</Radio>
                  <Radio value={"HCV"}>HCV</Radio>
                  <Radio value={"Age"}>Age</Radio>
                  <Radio value={"Stage"}>Stage</Radio>
                </Flex>
                <Flex vertical flex={1}>
                  <Radio value={"Gene"}>Gene</Radio>
                </Flex>
              </Flex>
            </Radio.Group>
          </Flex>
          <Flex
            vertical
            flex={1}
            style={{
              marginLeft: "15px",
              border: "1px solid #f5f5f5",
              boxShadow: "0 4px 12px #f5f5f5",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            {groupBy == "NT" && (
              <Checkbox.Group value={["Tumor", "Normal"]}>
                <Flex vertical>
                  <Flex vertical style={{ marginBottom: "10px" }}>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      First Group
                    </Typography.Paragraph>
                    <Checkbox value="Tumor" disabled>
                      Tumor
                    </Checkbox>
                  </Flex>
                  <Flex vertical>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      Second Group
                    </Typography.Paragraph>

                    <Checkbox value="Normal" disabled>
                      Normal
                    </Checkbox>
                  </Flex>
                </Flex>
              </Checkbox.Group>
            )}
            {(groupBy == "HBV" || groupBy == "HCV") && (
              <Checkbox.Group value={["positive", "negative"]}>
                <Flex vertical>
                  <Flex vertical style={{ marginBottom: "10px" }}>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      First Group
                    </Typography.Paragraph>
                    <Checkbox value="positive" disabled>
                      Positive
                    </Checkbox>
                  </Flex>
                  <Flex vertical>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      Second Group
                    </Typography.Paragraph>
                    <Checkbox value="negative" disabled>
                      Negative
                    </Checkbox>
                  </Flex>
                </Flex>
              </Checkbox.Group>
            )}
            {groupBy == "Age" && (
              <Flex>
                <Flex vertical flex={1}>
                  <Typography.Paragraph style={{ marginBottom: "10px" }}>
                    First Group
                  </Typography.Paragraph>
                  <Checkbox.Group value={firstGroup} onChange={setFirstGroup}>
                    <Flex vertical>
                      <Checkbox value="<20">{"<20"}</Checkbox>
                      <Checkbox value="20-40">{"20-40"}</Checkbox>
                      <Checkbox value="40-60">{"<60"}</Checkbox>
                      <Checkbox value="60-80">{"<80"}</Checkbox>
                      <Checkbox value=">=80">{">=80"}</Checkbox>
                    </Flex>
                  </Checkbox.Group>
                </Flex>
                <Flex vertical flex={1}>
                  <Typography.Paragraph style={{ marginBottom: "10px" }}>
                    Second Group
                  </Typography.Paragraph>
                  <Checkbox.Group value={secondGroup} onChange={setSecondGroup}>
                    <Flex vertical>
                      <Checkbox value="<20">{"<20"}</Checkbox>
                      <Checkbox value="20-40">{"20-40"}</Checkbox>
                      <Checkbox value="40-60">{"<60"}</Checkbox>
                      <Checkbox value="60-80">{"<80"}</Checkbox>
                      <Checkbox value=">=80">{">=80"}</Checkbox>
                    </Flex>
                  </Checkbox.Group>
                </Flex>
              </Flex>
            )}
            {groupBy == "Stage" && (
              <Flex>
                <Flex vertical style={{ marginBottom: "10px" }} flex={1}>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    First Group
                  </Typography.Paragraph>
                  <Checkbox.Group value={firstGroup} onChange={setFirstGroup}>
                    <Flex vertical>
                      <Checkbox value="I">I</Checkbox>
                      <Checkbox value="II">II</Checkbox>
                      <Checkbox value="III">III</Checkbox>
                      <Checkbox value="IV">IV</Checkbox>
                    </Flex>
                  </Checkbox.Group>
                </Flex>
                <Flex vertical flex={1}>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    Second Group
                  </Typography.Paragraph>
                  <Checkbox.Group value={secondGroup} onChange={setSecondGroup}>
                    <Flex vertical>
                      <Checkbox value="I">I</Checkbox>
                      <Checkbox value="II">II</Checkbox>
                      <Checkbox value="III">III</Checkbox>
                      <Checkbox value="IV">IV</Checkbox>
                    </Flex>
                  </Checkbox.Group>
                </Flex>
              </Flex>
            )}
            {groupBy == "Gene" && (
              <Flex vertical>
                <Flex vertical style={{ marginBottom: "10px" }} flex={1}>
                  <Typography.Paragraph>Gene Type</Typography.Paragraph>
                  <Radio.Group
                    value={geneType}
                    onChange={(e) => {
                      setGeneType(e.target.value);
                    }}
                  >
                    <Flex vertical>
                      <Radio value={"pathway"}>Pathway</Radio>
                      <Radio value={"custom"}>Custom</Radio>
                    </Flex>
                  </Radio.Group>
                </Flex>
              </Flex>
            )}
          </Flex>
        </Flex>
        {groupBy == "Gene" && (
          <Flex
            vertical
            flex={1}
            style={{
              marginTop: "15px",
              border: "1px solid #f5f5f5",
              boxShadow: "0 4px 12px #f5f5f5",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <Flex vertical flex={1}>
              <Radio.Group
                value={selectedGeneSet}
                onChange={(e) => {
                  setSelectedGeneSet(e.target.value);
                }}
              >
                {geneType == "pathway" ? (
                  <>
                    <Segmented
                      options={[
                        { label: "H", value: "H" },
                        { label: "C2", value: "C2" },
                      ]}
                      value={fixedGeneType}
                      onChange={setFixedGeneType}
                    />
                    <FixedSizeList
                      height={270}
                      itemCount={geneSetList?.length ?? 0}
                      itemSize={30}
                      width="100%"
                      style={{ marginTop: "5px" }}
                    >
                      {virtualRow}
                    </FixedSizeList>
                  </>
                ) : (
                  <Flex vertical align="center">
                    <div className="App" style={{ padding: 20 }}>
                      <GeneSetUpload onGenesValidated={handleGenesValidated} />
                      <div
                        style={{
                          marginTop: 20,
                          borderTop: "1px dashed #ccc",
                          paddingTop: 20,
                        }}
                      >
                        <Typography.Title level={4}>基因列表:</Typography.Title>
                        {validatedGenesFromChild.length > 0 ? (
                          <Space size={[0, 8]} wrap>
                            {validatedGenesFromChild.map((gene, index) => (
                              <Tag key={index} color="blue">
                                {gene}
                              </Tag>
                            ))}
                          </Space>
                        ) : (
                          <Typography.Text type="secondary">
                            暂无合法基因列表，请上传并验证文件。
                          </Typography.Text>
                        )}
                      </div>
                    </div>
                  </Flex>
                )}
              </Radio.Group>
            </Flex>
          </Flex>
        )}
      </div>
    );
  };

  return (
    <div className={styles.condition}>
      <Collapse
        defaultActiveKey={"groupBy"}
        className={styles.searchCollapse}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: 14 }}
            rotate={isActive ? 90 : 0}
          />
        )}
        items={[
          {
            key: "groupBy",
            label: analysisCollapseTitle(),
            children: analysisCollapseContent(),
          },
        ]}
      ></Collapse>
    </div>
  );
});

export default DEGGroupBy;
