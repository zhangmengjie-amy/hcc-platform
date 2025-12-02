"use client";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  forwardRef,
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
import { getITHList, getCohortList } from "@/configs/request";
import { FixedSizeList } from "react-window";
import styles from "./style.module.scss";
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
const DEGCondition = forwardRef(
  (
    {
      onITHChange,
      handleInitChange,
      showITH = true,
      showGeneList = true,
      showClinical = true,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const paramsRef = useRef(null);
    const [selectedClinical, setSelectedClinical] = useState([]);
    const [selectedClassify, setSelectedClassify] = useState("");
    const [selectedTechnology, setSelectedTechnology] = useState([]);
    const [groupBy, setGroupBy] = useState("nt");
    const [fixedGeneType, setFixedGeneType] = useState("h");
    const [geneType, setGeneType] = useState("custom");
    const cohortListRef = useRef(null);
    const [geneSetList, setGeneSetList] = useState([]);
    const [cohortList, setCohortList] = useState([]);
    const geneSetlistRef = useRef(null);
    useEffect(() => {
      getCohortList().then((data) => {
        cohortListRef.current = data;
        setCohortList(data);
      });

      getGeneSetList().then((data) => {
        setGeneSetList(data);
        console.log(" geneSetList", data);
      });
    }, []);

    useEffect(() => {
      const filteredCohort = cohortListRef.current?.filter((item) => {
        const matchClinical =
          selectedClinical.length == 0 ||
          selectedClinical.every((clinical) => {
            return item[clinical] === "true";
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
    const columns = [
      {
        title: "Cohort",
        dataIndex: "cohort",
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
            color={"rgb(10, 186, 181)"}
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

    const virtualRow = useCallback(({ index, style }) => {
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
    }, [geneSetList]);

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
      },
      getCheckboxProps: (record) => ({
        disabled: record.name === "Disabled User", // Column configuration not to be checked
        name: record.name,
      }),
    };

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
                value={groupBy}
                onChange={(e) => {
                  setGroupBy(e.target.value);
                }}
              >
                <Flex vertical>
                  <Radio value={"nt"}>N/T</Radio>

                  <Radio value={"hbv"}>HBV</Radio>

                  <Radio value={"hcv"}>HCV</Radio>

                  <Radio value={"age"}>Age</Radio>

                  <Radio value={"race"}>Race</Radio>

                  <Radio value={"stage"}>Stage</Radio>
                </Flex>
                <Flex vertical>
                  <Radio value={"gene"}>Gene</Radio>
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
              {groupBy == "nt" && (
                <Checkbox.Group value={["normal", "tumor"]}>
                  <Flex vertical>
                    <Flex vertical style={{ marginBottom: "10px" }}>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        First Group
                      </Typography.Paragraph>
                      <Checkbox value="normal" disabled>
                        Normal
                      </Checkbox>
                    </Flex>
                    <Flex vertical>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        Second Group
                      </Typography.Paragraph>
                      <Checkbox value="tumor" disabled>
                        Tumor
                      </Checkbox>
                    </Flex>
                  </Flex>
                </Checkbox.Group>
              )}
              {(groupBy == "hbv" || groupBy == "hcv") && (
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
              {groupBy == "age" && (
                <Checkbox.Group value={["positive", "negative"]}>
                  <Flex vertical flex={1} style={{ marginBottom: "10px" }}>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      First Group
                    </Typography.Paragraph>
                    <Checkbox value="<20">{"<20"}</Checkbox>
                    <Checkbox value="<=40">{"<40"}</Checkbox>
                    <Checkbox value="<=60">{"<60"}</Checkbox>
                    <Checkbox value="<=80">{"<80"}</Checkbox>
                    <Checkbox value=">80">{">80"}</Checkbox>
                  </Flex>
                  <Flex vertical flex={1}>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      Second Group
                    </Typography.Paragraph>
                    <Checkbox value="<20">{"<20"}</Checkbox>
                    <Checkbox value="<=40">{"<40"}</Checkbox>
                    <Checkbox value="<=60">{"<60"}</Checkbox>
                    <Checkbox value="<=80">{"<80"}</Checkbox>
                    <Checkbox value=">80">{">80"}</Checkbox>
                  </Flex>
                </Checkbox.Group>
              )}
              {groupBy == "race" && (
                <Checkbox.Group value={["positive", "negative"]}>
                  <Flex vertical flex={1} style={{ marginBottom: "10px" }}>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      First Group
                    </Typography.Paragraph>
                    <Checkbox value="Asian">{"Asian"}</Checkbox>
                    <Checkbox value="Caucasian">{"Caucasian"}</Checkbox>
                    <Checkbox value="Cambodia">{"Cambodia"}</Checkbox>
                    <Checkbox value="Chinese">{"Chinese"}</Checkbox>
                    <Checkbox value="Filipino">{"Filipino"}</Checkbox>
                    <Checkbox value="Indian">{"Indian"}</Checkbox>
                    <Checkbox value="Indonesian">{"Indonesian"}</Checkbox>
                    <Checkbox value="Malay">{"Malay"}</Checkbox>
                    <Checkbox value="Sikh">{"Sikh"}</Checkbox>
                    <Checkbox value="Thai">{"Thai"}</Checkbox>
                    <Checkbox value="Vietnamese">{"Vietnamese"}</Checkbox>
                    <Checkbox value="Others">{"Others"}</Checkbox>
                  </Flex>
                  <Flex vertical flex={1}>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      Second Group
                    </Typography.Paragraph>
                    <Checkbox value="Asian">{"Asian"}</Checkbox>
                    <Checkbox value="Caucasian">{"Caucasian"}</Checkbox>
                    <Checkbox value="Cambodia">{"Cambodia"}</Checkbox>
                    <Checkbox value="Chinese">{"Chinese"}</Checkbox>
                    <Checkbox value="Filipino">{"Filipino"}</Checkbox>
                    <Checkbox value="Indian">{"Indian"}</Checkbox>
                    <Checkbox value="Indonesian">{"Indonesian"}</Checkbox>
                    <Checkbox value="Malay">{"Malay"}</Checkbox>
                    <Checkbox value="Sikh">{"Sikh"}</Checkbox>
                    <Checkbox value="Thai">{"Thai"}</Checkbox>
                    <Checkbox value="Vietnamese">{"Vietnamese"}</Checkbox>
                    <Checkbox value="Others">{"Others"}</Checkbox>
                  </Flex>
                </Checkbox.Group>
              )}
              {groupBy == "stage" && (
                <Flex>
                  <Flex vertical style={{ marginBottom: "10px" }} flex={1}>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      First Group
                    </Typography.Paragraph>
                    <Checkbox.Group value={[]}>
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
                    <Checkbox.Group value={[]}>
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
              {groupBy == "gene" && (
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
                        <Radio value={"fixed"}>Fixed Gene</Radio>
                      </Flex>
                    </Radio.Group>
                  </Flex>
                </Flex>
              )}
            </Flex>
          </Flex>
          {groupBy == "gene" && (
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
                <Space>
                  <Typography.Paragraph>Gene List</Typography.Paragraph>
                </Space>

                <Space>
                  <Radio.Group value={"TP53"}>
                    {geneType == "fixed" ? (
                      <>
                        <Space style={{ marginBottom: 10 }}>
                          <Segmented
                            options={[
                              { label: "H", value: "h" },
                              { label: "C2", value: "c2" },
                            ]}
                            value={fixedGeneType}
                            onChange={setFixedGeneType}
                          />
                        </Space>

                         
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
                        <Upload
                          name="file"
                          action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                        >
                          <Button icon={<UploadOutlined />}>
                            Click to Upload
                          </Button>
                        </Upload>
                      </Flex>
                    )}
                  </Radio.Group>
                </Space>
              </Flex>
            </Flex>
          )}
        </div>
      );
    };

    const tableCollapseContent = () => {
      return (
        <div className={styles.searchCard} variant="borderless">
          {
            <Table
              rowKey="cohort" // 或者使用函数
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
      <div className={styles.DEGCondition}>
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
      </div>
    );
  },
);

export default DEGCondition;
