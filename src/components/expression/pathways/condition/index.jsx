'use client';
import React, { useRef, useEffect, useImperativeHandle, useState, useCallback, forwardRef } from 'react';
import { usePDF } from 'react-to-pdf';
import { getGeneList, getValidGeneList } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined, ApartmentOutlined, BranchesOutlined } from '@ant-design/icons';
import { debounce, set } from 'lodash';
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
    Upload,
    Slider,
    message
} from 'antd';
import { useTranslation } from "react-i18next";
import Image from 'next/image';
import { getITHList, getCohortList } from "@/configs/request";
import styles from "./style.module.scss";
const SOURCE_COLOR = {
    "Tissue": "rgb(218, 85, 76)",
    "Cell lines": "rgb(238, 188, 57)"
}

const LEVEL_COLOR = {
    "Intra": "rgba(172, 233, 153, 1)",
    "Inter": "rgba(86, 213, 235, 1)"
}

const TECH_COLOR = {
    "micro-array": "rgb(79, 151, 121)",
    "Sequence": "rgba(216, 136, 136, 1)"
}
const RELOAD_ICON = "/images/reload.svg";
const DEGCondition = forwardRef(({ onITHChange, handleInitChange, showITH = true, showGeneList = true, showClinical = true }, ref) => {
    const { t } = useTranslation();
    const paramsRef = useRef(null);
    const [selectedTech, setSelectedTech] = useState([]);
    const [selectedSource, setSelectedSource] = useState(["tissue", "cell-lines"]);
    const [groupBy, setGroupBy] = useState("n/t");
    const [geneType, setGeneType] = useState("custom");
    const cohortListRef = useRef(null);
    useEffect(() => {
        getCohortList().then((data) => {
            cohortListRef.current = data;
        })
    }, [])
    const columns = [
        {
            title: 'Cohort',
            dataIndex: 'cohort',
            render: text => <a>{text}</a>,
        },
        {
            title: 'Level',
            dataIndex: 'level',
            render: text => <Tag style={{display: "block", textAlign: "center"}} color={LEVEL_COLOR[text]}>{text}</Tag>
        },
        {
            title: 'Tech',
            dataIndex: 'tech',
            render: text => <Tag style={{display: "block", textAlign: "center"}} color={TECH_COLOR[text]}>{text}</Tag>
        },
        {
            title: 'Source',
            dataIndex: 'source',
            render: text => <Tag style={{display: "block", textAlign: "center"}} color={SOURCE_COLOR[text]}>{text}</Tag>
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
    ];
    useImperativeHandle(ref, () => ({
        getParams: () => {
            return paramsRef.current;
        }
    }));

    useEffect(() => {

    }, []);

    const cohortCollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: false
                }}
                style={{ margin: 0, color: "#fff", fontWeight: "500" }}>Filter Cohort</Typography.Paragraph>

            <Tooltip placement="bottom" title={t("common:reset-selection")}>
                <Button color="default" onClick={(event) => {
                    handleDriverReload(event)
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
        </Flex>
    }

    const analysisCollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: false
                }}
                style={{ margin: 0, color: "#fff", fontWeight: "500" }}>Group</Typography.Paragraph>

            <Tooltip placement="bottom" title={t("common:reset-selection")}>
                <Button color="default" onClick={(event) => {
                    handleDriverReload(event)
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
        </Flex>
    }

    const tableCollapseTitle = () => {
        return <Flex justify={"space-between"} align={"center"}>
            <Typography.Paragraph
                ellipsis={{
                    rows: 1,
                    expandable: false
                }}
                style={{ margin: 0, color: "#fff", fontWeight: "500" }}>Cohort List</Typography.Paragraph>

            <Tooltip placement="bottom" title={t("common:reset-selection")}>
                <Button color="default" onClick={(event) => {
                    handleDriverReload(event)
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
        </Flex>
    }

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };


    const cohortCollapseContent = () => {
        return <div className={styles.searchCard}
            variant="borderless">
            <Flex>

                <Flex vertical flex={1} style={{ border: "1px solid #f5f5f5", boxShadow: "0 4px 12px #f5f5f5", padding: "15px", borderRadius: "12px" }}>
                    {/* <Typography.Paragraph>Tech</Typography.Paragraph> */}
                    <Checkbox.Group onChange={setSelectedTech} value={selectedTech}>
                        <Flex vertical>
                            <Checkbox value="n/t">N/T</Checkbox>
                            <Checkbox value="hbv">HBV</Checkbox>
                            <Checkbox value="hcv">HCV</Checkbox>
                            <Checkbox value="age">Age</Checkbox>
                            <Checkbox value="stage">Stage</Checkbox>
                            <Checkbox value="gene">Gene</Checkbox>
                        </Flex>
                        <Flex vertical>
                            <Checkbox value="sequence">Sequence</Checkbox>
                            <Checkbox value="micro-array">Micro Array</Checkbox>
                        </Flex>
                    </Checkbox.Group>
                </Flex>
                <Flex vertical flex={1} style={{ marginLeft: "15px", border: "1px solid #f5f5f5", boxShadow: "0 4px 12px #f5f5f5", padding: "15px", borderRadius: "12px" }}>
                    <Typography.Paragraph>Source</Typography.Paragraph>
                    <Checkbox.Group onChange={setSelectedSource} value={selectedSource}>
                        <Flex vertical>
                            <Checkbox value="tissue">Tissue</Checkbox>
                            <Checkbox value="cell-lines">Cell lines</Checkbox>
                        </Flex>
                    </Checkbox.Group>
                </Flex>
            </Flex>
        </div>
    }

    const analysisCollapseContent = () => {
        return <div className={styles.searchCard}
            variant="borderless">
            <Flex>
                <Flex vertical flex={1} style={{ border: "1px solid #f5f5f5", boxShadow: "0 4px 12px #f5f5f5", padding: "15px", borderRadius: "12px" }}>
                    <Typography.Paragraph>Group By</Typography.Paragraph>
                    <Radio.Group value={groupBy} onChange={(e) => { setGroupBy(e.target.value); }}>
                        <Flex vertical>
                            <Radio value={"n/t"}>N/T</Radio>

                            <Radio value={"hbv"}>HBV</Radio>

                            <Radio value={"hcv"}>HCV</Radio>

                            <Radio value={"age"}>Age</Radio>

                            <Radio value={"stage"}>Stage</Radio>

                            <Radio value={"gene"}>Gene</Radio>
                        </Flex>


                    </Radio.Group>

                </Flex>
                <Flex vertical flex={1} style={{ marginLeft: "15px", border: "1px solid #f5f5f5", boxShadow: "0 4px 12px #f5f5f5", padding: "15px", borderRadius: "12px" }}>
                    {
                        groupBy == "n/t" && <Checkbox.Group value={['normal', 'tumor']}>
                            <Flex vertical>
                                <Flex vertical style={{ marginBottom: "10px" }}>
                                    <Typography.Paragraph style={{ marginBottom: 0 }}>First Group</Typography.Paragraph>
                                    <Checkbox value="normal" disabled>Normal</Checkbox>
                                </Flex>
                                <Flex vertical>
                                    <Typography.Paragraph style={{ marginBottom: 0 }}>Second Group</Typography.Paragraph>
                                    <Checkbox value="tumor" disabled>Tumor</Checkbox>
                                </Flex>
                            </Flex>
                        </Checkbox.Group>
                    }
                    {
                        (groupBy == "hbv" || groupBy == "hcv") && <Checkbox.Group value={['positive', 'negative']}>
                            <Flex vertical>
                                <Flex vertical style={{ marginBottom: "10px" }}>
                                    <Typography.Paragraph style={{ marginBottom: 0 }}>First Group</Typography.Paragraph>
                                    <Checkbox value="positive" disabled>Positive</Checkbox>
                                </Flex>
                                <Flex vertical>
                                    <Typography.Paragraph style={{ marginBottom: 0 }}>Second Group</Typography.Paragraph>
                                    <Checkbox value="negative" disabled>Negative</Checkbox>
                                </Flex>
                            </Flex>
                        </Checkbox.Group>
                    }
                    {
                        groupBy == "age" && <Checkbox.Group value={['positive', 'negative']}>
                   
                                <Flex vertical flex={1} style={{ marginBottom: "10px" }}>
                                    <Typography.Paragraph style={{ marginBottom: 0 }}>First Group</Typography.Paragraph>
                                    <Checkbox value="<20">{"<20"}</Checkbox>
                                    <Checkbox value="<=40">{"<40"}</Checkbox>
                                    <Checkbox value="<=60">{"<60"}</Checkbox>
                                    <Checkbox value="<=80">{"<80"}</Checkbox>
                                    <Checkbox value=">80">{">80"}</Checkbox>
                                </Flex>
                                <Flex vertical flex={1}>
                                    <Typography.Paragraph style={{ marginBottom: 0 }}>Second Group</Typography.Paragraph>
                                    <Checkbox value="<20">{"<20"}</Checkbox>
                                    <Checkbox value="<=40">{"<40"}</Checkbox>
                                    <Checkbox value="<=60">{"<60"}</Checkbox>
                                    <Checkbox value="<=80">{"<80"}</Checkbox>
                                    <Checkbox value=">80">{">80"}</Checkbox>
                                </Flex>
                        </Checkbox.Group>
                    }
                    {
                        groupBy == "stage" &&
                        <Flex >
                            <Flex vertical style={{ marginBottom: "10px" }} flex={1}>
                                <Typography.Paragraph style={{ marginBottom: 0 }}>First Group</Typography.Paragraph>
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
                                <Typography.Paragraph style={{ marginBottom: 0 }}>Second Group</Typography.Paragraph>
                                <Checkbox.Group value={[]}>
                                    <Flex vertical>
                                        <Checkbox value="I" >I</Checkbox>
                                        <Checkbox value="II" >II</Checkbox>
                                        <Checkbox value="III" >III</Checkbox>
                                        <Checkbox value="IV" >IV</Checkbox>
                                    </Flex>
                                </Checkbox.Group>
                            </Flex>
                        </Flex>
                    }
                    {
                        groupBy == "gene" &&
                        <Flex >
                            <Flex vertical style={{ marginBottom: "10px" }} flex={1}>
                                <Typography.Paragraph >Gene Type</Typography.Paragraph>
                                <Radio.Group value={geneType} onChange={(e) => { setGeneType(e.target.value); }}>
                                <Flex vertical>
                                    <Radio value={"custom"}>Custom</Radio>
                                    <Radio value={"fixed"}>Fixed Gene</Radio>
                                </Flex>
                                </Radio.Group>
                            </Flex>
                            <Flex vertical flex={1}>
                                <Typography.Paragraph >Gene</Typography.Paragraph>
                                <Radio.Group value={"TP53"}>
                                    {
                                        geneType == "custom" ? <Flex vertical>
                                        <Radio value="TP53" >TP53</Radio>
                                        <Radio value="CNNTB1" >CNNTB1</Radio>
                                        <Radio value="APC" >APC</Radio>
                                        <Radio value="DOCK2" >DOCK2</Radio>
                                    </Flex> : <Typography.Paragraph style={{ marginBottom: 0 }}>TP53</Typography.Paragraph>
                                    }
                                    
                                </Radio.Group>
                            </Flex>
                        </Flex>
                    }
                </Flex>
            </Flex>
        </div>
    }

    const tableCollapseContent = () => {
        return <div className={styles.searchCard}
            variant="borderless">
            {cohortListRef.current && <Table
                rowKey="cohort"  // 或者使用函数
                pagination={false}
                size="small"
                rowSelection={{ type: "checkbox", ...rowSelection }}
                columns={columns}
                dataSource={cohortListRef.current}
            />}
        </div>
    }

    return (
        <div className={styles.DEGCondition}>
            <Collapse
                defaultActiveKey={"cohort"}
                className={styles.searchCollapse}
                expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
                items={[{
                    key: "cohort",
                    label: cohortCollapseTitle(),
                    children: cohortCollapseContent()
                }]}>
            </Collapse>
            <Collapse
                defaultActiveKey={"table"}
                className={styles.searchCollapse}
                expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
                items={[{
                    key: "table",
                    label: tableCollapseTitle(),
                    children: tableCollapseContent()
                }]}>
            </Collapse>
            <Collapse
                defaultActiveKey={"analysis"}
                className={styles.searchCollapse}
                expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
                items={[{
                    key: "analysis",
                    label: analysisCollapseTitle(),
                    children: analysisCollapseContent()
                }]}>
            </Collapse>
        </div>
    );
})

export default DEGCondition