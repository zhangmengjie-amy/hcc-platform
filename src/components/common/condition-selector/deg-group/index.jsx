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
  getGeneSetList,
} from "@/configs/request";
import GeneSetUpload from "@/components/common/condition-selector/gene-upload";
import styles from "../style.module.scss";
import { FixedSizeList } from "react-window";

const RELOAD_ICON = "/images/reload.svg";

const DEGGroupBy = forwardRef(({ onChange, onReady }, ref) => {
  const { t } = useTranslation();
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
      geneSetlistRef.current = data?.data;
    });
  }, []);

  const handleGenesValidated = (genes) => {
    setValidatedGenesFromChild(genes);
  };

  const analysisCollapseTitle = () => {
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
          {t("common:filter.grouping")}
        </Typography.Title>

        <Tooltip placement="bottom" title={t("common:resetSelection")}>
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
            <Radio.Group
              value={groupBy}
              onChange={(e) => {
                setGroupBy(e.target.value);
              }}
            >
              <Flex>
                <Flex vertical flex={1}>
                  <Radio value={"NT"}>{t("common:clinical.nt")}</Radio>
                  <Radio value={"HBV"}>{t("common:clinical.hbv")}</Radio>
                  <Radio value={"HCV"}>{t("common:clinical.hcv")}</Radio>
                  <Radio value={"Age"}>{t("common:clinical.age")}</Radio>
                  <Radio value={"Stage"}>{t("common:clinical.stage")}</Radio>
                </Flex>
                <Flex vertical flex={1}>
                  <Radio value={"Gene"}>{t("common:gene")}</Radio>
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
                      {t("common:filter.firstGroup")}
                    </Typography.Paragraph>
                    <Checkbox value="Tumor" disabled>
                      {t("common:filter.tumor")}
                    </Checkbox>
                  </Flex>
                  <Flex vertical>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      {t("common:filter.secondGroup")}
                    </Typography.Paragraph>

                    <Checkbox value="Normal" disabled>
                      {t("common:filter.normal")}
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
                      {t("common:filter.firstGroup")}
                    </Typography.Paragraph>
                    <Checkbox value="positive" disabled>
                      {t("common:clinical.positive")}
                    </Checkbox>
                  </Flex>
                  <Flex vertical>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      {t("common:filter.secondGroup")}
                    </Typography.Paragraph>
                    <Checkbox value="negative" disabled>
                      {t("common:clinical.negative")}
                    </Checkbox>
                  </Flex>
                </Flex>
              </Checkbox.Group>
            )}
            {groupBy == "Age" && (
              <Flex>
                <Flex vertical flex={1}>
                  <Typography.Paragraph style={{ marginBottom: "10px" }}>
                    {t("common:filter.firstGroup")}
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
                    {t("common:filter.secondGroup")}
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
                    {t("common:filter.firstGroup")}
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
                    {t("common:filter.secondGroup")}
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
                  <Typography.Paragraph>{t("common:filter.geneType")}</Typography.Paragraph>
                  <Radio.Group
                    value={geneType}
                    onChange={(e) => {
                      setGeneType(e.target.value);
                    }}
                  >
                    <Flex vertical>
                      <Radio value={"pathway"}>{t("common:filter.pathway")}</Radio>
                      <Radio value={"custom"}>{t("common:filter.customGeneList")}</Radio>
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
                  <GeneSetUpload onChange={handleGenesValidated} />
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
