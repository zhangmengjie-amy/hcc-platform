"use client";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  forwardRef,
  useMemo,
} from "react";
import { usePDF } from "react-to-pdf";
import {
  getGeneList,
  getValidGeneList,
  getGeneSetList,
} from "@/configs/request";
import {
  CaretRightOutlined,
  LinkOutlined,
  UploadOutlined,
  ApartmentOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import GeneSetUpload from "./gene-set-upload";
import { debounce, set } from "lodash";
import EmptyLoading from "@/components/empty-loading";
import {
  Card,
  Collapse,
  Radio,
  Table,
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
  Slider,
  message,
  Upload,
  Segmented,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { getCohortList } from "@/configs/request";
import { FixedSizeList } from "react-window";
import styles from "./style.module.scss";
import { use } from "react";
const CLASSIFY_COLOR = {
  Tissue: "purple",
  Celllines: "green",
};

const LEVEL_COLOR = {
  Intra: "cyan",
  Inter: "blue",
  "Inter+Intra": "lime",
};

const TECHNOLOGY_COLOR = {
  "Micro array": "orange",
  Sequencing: "magenta",
};
const RELOAD_ICON = "/images/reload.svg";
const CohortCondition = forwardRef(({ module = "DEG" }, ref) => {
  const { t } = useTranslation();
  const paramsRef = useRef(null);
  const [selectedClinical, setSelectedClinical] = useState([]);
  const [selectedClassify, setSelectedClassify] = useState("");
  const [selectedTechnology, setSelectedTechnology] = useState([]);
  const [queryType, setQueryType] = useState("NT");
  const [method, setMethod] = useState("");
  const [fixedGeneType, setFixedGeneType] = useState("h");
  const [geneType, setGeneType] = useState("custom");
  const cohortListRef = useRef(null);
  const [selectedGeneSet, setSelectedGeneSet] = useState("");
  const [cohortList, setCohortList] = useState([]);
  const [firstGroup, setFirstGroup] = useState([]);
  const [secondGroup, setSecondGroup] = useState([]);
  const [selectedCohortKeys, setSelectedCohortKeys] = useState([]);
  const geneSetlistRef = useRef(null);
  const [validatedGenesFromChild, setValidatedGenesFromChild] = useState([]);

  // 这个函数将作为 prop 传递给 GeneUpload
  const handleGenesValidated = (genes) => {
    console.log("父组件收到合法的基因列表:", genes);
    setValidatedGenesFromChild(genes);
  };

  const handleDriverReload = () => {};

  useEffect(() => {
    getCohortList().then((data) => {
      cohortListRef.current = data;
      setCohortList(data);
    });

    getGeneSetList().then((data) => {
      geneSetlistRef.current = data;
    });
  }, []);

  useEffect(() => {
    const filteredCohort = cohortListRef.current?.filter((item) => {
      const matchClinical =
        selectedClinical.length == 0 ||
        selectedClinical.every((clinical) => {
          return item[clinical] === "Yes";
        });
      const matchClassify =
        selectedClassify == "" ||
        selectedClassify == "all" ||
        selectedClassify == item.classify;
      const matchTechnology =
        selectedTechnology == "" ||
        selectedTechnology == "all" ||
        selectedTechnology == item.techonology;
      return matchClassify && matchTechnology && matchClinical;
    });

    setCohortList(filteredCohort);
  }, [selectedClassify, selectedClinical, selectedTechnology]);

  const geneSetList = useMemo(() => {
    if (fixedGeneType === "h") {
      return geneSetlistRef.current?.filter((item) => item.gsCat === "H");
    } else {
      return geneSetlistRef.current?.filter((item) => item.gsCat === "C2");
    }
  }, [fixedGeneType]);
  const columns = [
    {
      title: "Cohort",
      dataIndex: "number",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Level",
      dataIndex: "level",
      render: (text) => (
        <Tag
          style={{ display: "block", textAlign: "center" }}
          color={LEVEL_COLOR[text]}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Technology",
      dataIndex: "techonology",
      render: (text) => (
        <Tag
          style={{ display: "block", textAlign: "center" }}
          color={TECHNOLOGY_COLOR[text]}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Classify",
      dataIndex: "classify",
      render: (text) => (
        <Tag
          style={{ display: "block", textAlign: "center" }}
          color={CLASSIFY_COLOR[text]}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "DOI",
      dataIndex: "doi",
      render: (text) => (
        <Tooltip
          title={`https://doi.org/${text}`}
          placement="top"
        >
          <Tag>
            <a href={`https://doi.org/${text}`} target="_blank">
              <LinkOutlined />
            </a>
          </Tag>
        </Tooltip>
      ),
    },
  ];
  useImperativeHandle(ref, () => ({
    getParams: () => {
      return paramsRef.current;
    },
  }));

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

  const cohortCollapseTitle = () => {
    return (
      <Flex justify={"space-between"} align={"center"}>
        <Typography.Paragraph
          ellipsis={{
            rows: 1,
            expandable: false,
          }}
          style={{ margin: 0, color: "#fff", fontWeight: "500" }}
        >
          Filter Cohort
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
          Group
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

  const methodCollapseTitle = () => {
    return (
      <Flex justify={"space-between"} align={"center"}>
        <Typography.Paragraph
          ellipsis={{
            rows: 1,
            expandable: false,
          }}
          style={{ margin: 0, color: "#fff", fontWeight: "500" }}
        >
          Method
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

  const tableCollapseTitle = () => {
    return (
      <Flex justify={"space-between"} align={"center"}>
        <Typography.Paragraph
          ellipsis={{
            rows: 1,
            expandable: false,
          }}
          style={{ margin: 0, color: "#fff", fontWeight: "500" }}
        >
          Cohort List
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

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows,
      );
      setSelectedCohortKeys(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User", // Column configuration not to be checked
      name: record.name,
    }),
  };

  useEffect(() => {
    const numbers = selectedCohortKeys;
    let geneList = validatedGenesFromChild;
    let geneSet = selectedGeneSet;
    let _firstGroup = firstGroup;
    let _secondGroup = secondGroup;
    let _geneType = geneType;
    const _queryType = queryType;

    if (queryType !== "gene") {
      geneList = null;
      geneSet = null;
      _geneType = null;
      if (queryType === "NT") {
        _firstGroup = ["Normal"];
        _secondGroup = ["Tumor"];
      } else if (queryType === "HBV" || queryType === "HCV") {
        _firstGroup = ["positive"];
        _secondGroup = ["negative"];
      } else if (queryType === "Age") {
        if (!firstGroup) {

        }

      }
    } else {
      if (geneType === "custom") {
        geneSet = null;
      } else if (geneType === "pathway") {
        geneList = null;
      }
      _firstGroup = null;
      _secondGroup = null;
    }

    if (module === "DEG") {
      paramsRef.current = {
        numbers,
        geneList,
        geneSet,
        secondGroup: _secondGroup,
        firstGroup: _firstGroup,
        geneType: _geneType,
        queryType: _queryType,
      };
    } else {
      paramsRef.current = {
        numbers,
        method,
      };
    }
  }, [
    selectedCohortKeys,
    queryType,
    firstGroup,
    secondGroup,
    geneType,
    selectedGeneSet,
    validatedGenesFromChild,
    method,
  ]);

  useEffect(() => {
    if (firstGroup && secondGroup) {
      if (queryType === "NT") {
        setFirstGroup("Tumor");
        setSecondGroup("Normal");
      }
      if (queryType === "HBV" || queryType === "HCV") {
        setFirstGroup("Positive");
        setSecondGroup("Negative");
      }
      if (queryType === "Age") {
        setFirstGroup(["<20", "20-40", "40-60"]);
        setSecondGroup(["60-80", ">=80"]);
      }
      if (queryType === "Stage") {
        setFirstGroup(["I", "II"]);
        setSecondGroup(["III", "IV"]);
      }
    }

  }, [queryType]);

  const cohortCollapseContent = () => {
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
            <Typography.Paragraph>Clinical</Typography.Paragraph>
            <Checkbox.Group
              onChange={setSelectedClinical}
              value={selectedClinical}
            >
              <Flex vertical>
                <Checkbox value="nt">N/T</Checkbox>
                <Checkbox value="hbv">HBV</Checkbox>
                <Checkbox value="hcv">HCV</Checkbox>
                <Checkbox value="age">Age</Checkbox>
                <Checkbox value="race">Race</Checkbox>
                <Checkbox value="stage">Stage</Checkbox>
                <Checkbox value="gene">Gene</Checkbox>
              </Flex>
            </Checkbox.Group>
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
            <Typography.Paragraph>Classify</Typography.Paragraph>
            <Radio.Group
              onChange={(e) => {
                setSelectedClassify(e.target.value);
              }}
              value={selectedClassify}
            >
              <Flex vertical>
                <Radio value="Tissue">Tissue</Radio>
                <Radio value="Celllines">Celllines</Radio>
                <Radio value="all">All</Radio>
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
            <Typography.Paragraph>Technology</Typography.Paragraph>
            <Radio.Group
              onChange={(e) => {
                setSelectedTechnology(e.target.value);
              }}
              value={selectedTechnology}
            >
              <Flex vertical>
                <Radio value="Sequencing">Sequence</Radio>
                <Radio value="Micro array">Micro Array</Radio>
                <Radio value="all">All</Radio>
              </Flex>
            </Radio.Group>
          </Flex>
        </Flex>
      </div>
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
              value={queryType}
              onChange={(e) => {
                setQueryType(e.target.value);
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
            {queryType == "NT" && (
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
            {(queryType == "HBV" || queryType == "HCV") && (
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
            {queryType == "Age" && (
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
            {queryType == "Stage" && (
              <Flex>
                <Flex vertical style={{ marginBottom: "10px" }} flex={1}>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    First Group
                  </Typography.Paragraph>
                  <Checkbox.Group value={firstGroup} onChange={setFirstGroup}>
                    <Flex vertical>
                      <Checkbox value="I">II</Checkbox>
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
            {queryType == "gene" && (
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
                      <Radio value={"custom"}>Custom</Radio>
                      <Radio value={"pathway"}>Pathway</Radio>
                    </Flex>
                  </Radio.Group>
                </Flex>
              </Flex>
            )}
          </Flex>
        </Flex>
        {queryType == "gene" && (
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
                        { label: "H", value: "h" },
                        { label: "C2", value: "c2" },
                      ]}
                      value={fixedGeneType}
                      onChange={setFixedGeneType}
                    />
                    <FixedSizeList
                      height={260}
                      itemCount={geneSetList?.length ?? 0}
                      itemSize={30}
                      width="100%"
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

  const methodCollapseContent = () => {
    return (
      <div className={styles.searchCard} variant="borderless">
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
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
            }}
          >
            <Flex vertical flex={1}>
              <Radio value={"cibersort"}>cibersort</Radio>
              <Radio value={"epic"}>epic</Radio>
              <Radio value={"estimate"}>estimate</Radio>
              <Radio value={"mcpcounter"}>mcpcounter</Radio>
              <Radio value={"quantiseq"}>quantiseq</Radio>
              <Radio value={"timer"}>timer</Radio>
              <Radio value={"xcell"}>xcell</Radio>
            </Flex>
          </Radio.Group>
        </Flex>
      </div>
    );
  };

  const tableCollapseContent = () => {
    return (
      <div className={styles.searchCard} variant="borderless">
        {
          <Table
            rowKey="number" // 或者使用函数
            pagination={{ size: 10 }}
            size="small"
            rowSelection={{ type: "checkbox", ...rowSelection }}
            columns={columns}
            dataSource={cohortList}
          />
        }
      </div>
    );
  };

  return (
    <div className={styles.cohortCondition}>
      <Collapse
        defaultActiveKey={"cohort"}
        className={styles.searchCollapse}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: 14 }}
            rotate={isActive ? 90 : 0}
          />
        )}
        items={[
          {
            key: "cohort",
            label: cohortCollapseTitle(),
            children: cohortCollapseContent(),
          },
        ]}
      ></Collapse>
      <Collapse
        defaultActiveKey={"table"}
        className={styles.searchCollapse}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: 14 }}
            rotate={isActive ? 90 : 0}
          />
        )}
        items={[
          {
            key: "table",
            label: tableCollapseTitle(),
            children: tableCollapseContent(),
          },
        ]}
      ></Collapse>
      {module == "DEG" && (
        <Collapse
          defaultActiveKey={"analysis"}
          className={styles.searchCollapse}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              style={{ fontSize: 14 }}
              rotate={isActive ? 90 : 0}
            />
          )}
          items={[
            {
              key: "analysis",
              label: analysisCollapseTitle(),
              children: analysisCollapseContent(),
            },
          ]}
        ></Collapse>
      )}
      {module == "IMMUNE" && (
        <Collapse
          defaultActiveKey={"method"}
          className={styles.searchCollapse}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              style={{ fontSize: 14 }}
              rotate={isActive ? 90 : 0}
            />
          )}
          items={[
            {
              key: "method",
              label: methodCollapseTitle(),
              children: methodCollapseContent(),
            },
          ]}
        ></Collapse>
      )}
    </div>
  );
});

export default CohortCondition;
