'use client';
import React, { useRef, useEffect, useImperativeHandle, useState, useCallback, forwardRef } from 'react';
import { usePDF } from 'react-to-pdf';
import { getGeneList, getValidGeneList } from "@/configs/request";
import { CaretRightOutlined, LoadingOutlined, AppstoreOutlined, ApartmentOutlined, BranchesOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
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

const TECH_COLOR = {
    "micro-array": "rgb(79, 151, 121)",
    "Sequence": "rgb(150, 91, 164)"
}
const RELOAD_ICON = "/images/reload.svg";
const DEGCondition = forwardRef(({ onITHChange, handleInitChange, showITH = true, showGeneList = true, showClinical = true }, ref) => {
    const { t } = useTranslation();
    const paramsRef = useRef(null);
    const cohortListRef = useRef(null)
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
            title: 'Tech',
            dataIndex: 'tech',
            render: text => <Tag color={TECH_COLOR[text]}>{text}</Tag>
        },
        {
            title: 'Source',
            dataIndex: 'source',
            render: text => <Tag color={SOURCE_COLOR[text]}>{text}</Tag>
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
                    <Typography.Paragraph>Tech</Typography.Paragraph>
                    <Checkbox value="sequence">Sequence</Checkbox>
                    <Checkbox value="micro">micro-array</Checkbox>

                </Flex>
                <Flex vertical flex={1} style={{ marginLeft: "15px", border: "1px solid #f5f5f5", boxShadow: "0 4px 12px #f5f5f5", padding: "15px", borderRadius: "12px" }}>
                    <Typography.Paragraph>Source</Typography.Paragraph>
                    <Checkbox value="sequence">Tissue</Checkbox>
                    <Checkbox value="micro">Cell lines</Checkbox>
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
                    <Radio.Group value={1} onChange={(e) => { }}>
                        <Radio value={1}>N/T</Radio>
                        <br />
                        <Radio value={2}>HBV</Radio>
                        <br />
                        <Radio value={3}>HCV</Radio>
                        <br />
                        <Radio value={4}>Age</Radio>
                        <br />
                        <Radio value={5}>Stage</Radio>
                        <br />
                        <Radio value={4}>Gene</Radio>

                    </Radio.Group>

                </Flex>
                <Flex vertical flex={1} style={{ marginLeft: "15px", border: "1px solid #f5f5f5", boxShadow: "0 4px 12px #f5f5f5", padding: "15px", borderRadius: "12px" }}>
                    <Typography.Paragraph>Source</Typography.Paragraph>
                    <Checkbox value="sequence">Tissue</Checkbox>
                    <Checkbox value="micro">Cell lines</Checkbox>
                </Flex>
            </Flex>
        </div>
    }

    const tableCollapseContent = () => {
        return <div className={styles.searchCard}
            variant="borderless">
            {cohortListRef.current && <Table
                pagination={false}
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
                defaultActiveKey={"analysis"}
                className={styles.searchCollapse}
                expandIcon={({ isActive }) => <CaretRightOutlined style={{ fontSize: 14 }} rotate={isActive ? 90 : 0} />}
                items={[{
                    key: "analysis",
                    label: analysisCollapseTitle(),
                    children: analysisCollapseContent()
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

        </div>
    );
})

export default DEGCondition