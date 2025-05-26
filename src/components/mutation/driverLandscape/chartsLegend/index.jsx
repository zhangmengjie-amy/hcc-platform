"use client";
import React from 'react';
import { useTranslation } from "react-i18next";
import { Row, Col, Typography, Divider } from 'antd';
import { mutationTypeColorConfig, clinicColorConfig } from "@/configs/mutation";
import styles from "./style.module.scss";

const ChartsLegend = () => {
    const { t } = useTranslation();

    return (
        <Row style={{ width: '100%' }} algin={"center"} justify={"center"}>
            <Row style={{ width: '100%' }} algin={"center"} justify={"center"}>
                <Row style={{ width: '100%' }} algin={"center"} justify={"center"}>
                    <Col sm={18} md={18} lg={18}>
                        <Divider variant="dashed" style={{ fontSize: "14px", fontWeight: "normal", borderColor: 'rgb(210, 235, 227)' }} dashed>
                            {(t(`mutation:type.alterations`))}
                        </Divider></Col>
                </Row>
                <Col sm={6} md={6} lg={6}>
                    {

                        Object.keys(mutationTypeColorConfig).slice(0, 3).map((config) => {
                            return <Typography.Paragraph key={config} className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: mutationTypeColorConfig[config] }}></span>{t(`mutation:type.${config}`)}
                            </Typography.Paragraph>
                        })
                    }
                </Col>
                <Col sm={6} md={6} lg={6}>
                    {
                        Object.keys(mutationTypeColorConfig).slice(3, 6).map((config) => {
                            return <Typography.Paragraph key={config} className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: mutationTypeColorConfig[config] }}></span>{t(`mutation:type.${config}`)}
                            </Typography.Paragraph>
                        })
                    }
                </Col>
            </Row>
            <Row style={{ width: '100%' }} algin={"center"} justify={"center"}>
                <Col sm={6} md={6} lg={6}>
                    <Divider orientation="left" orientationMargin="0" variant="dashed" style={{ fontSize: "14px", fontWeight: "normal", borderColor: 'rgb(210, 235, 227)' }} dashed>
                        {(t(`mutation:sample.gender`))}
                    </Divider>
                    {
                        Object.keys(clinicColorConfig["gender"]).map((item) => {
                            return <Typography.Paragraph key={item} className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: clinicColorConfig["gender"][item] }}></span>{(t(`mutation:sample.${item}`))}
                            </Typography.Paragraph>
                        })
                    }
                </Col>
                <Col sm={6} md={6} lg={6}>
                    <Divider orientation="left" orientationMargin="0" variant="dashed" style={{ fontSize: "14px", fontWeight: "normal", borderColor: 'rgb(210, 235, 227)' }} dashed>
                        {(t(`mutation:sample.hbv`))}
                    </Divider>

                    {
                        Object.keys(clinicColorConfig["hbv"]).map((item) => {
                            return <Typography.Paragraph key={item} className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: clinicColorConfig["hbv"][item] }}></span>{(t(`mutation:sample.${item}`))}
                            </Typography.Paragraph>
                        })
                    }
                </Col>
                <Col sm={6} md={6} lg={6}>
                    <Divider orientation="left" orientationMargin="0" variant="dashed" style={{ fontSize: "14px", fontWeight: "normal", borderColor: 'rgb(210, 235, 227)' }} dashed>
                        {(t(`mutation:sample.hcv`))}
                    </Divider>

                    {
                        Object.keys(clinicColorConfig["hcv"]).map((item) => {
                            return <Typography.Paragraph key={item} className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: clinicColorConfig["hcv"][item] }}></span>{(t(`mutation:sample.${item}`))}
                            </Typography.Paragraph>
                        })
                    }
                </Col>
            </Row>

            <Row style={{ width: '100%' }} algin={"center"} justify={"center"}>
                <Col sm={5} md={5} lg={5}>
                    <Divider orientation="left" orientationMargin="0" variant="dashed" style={{ fontSize: "14px", fontWeight: "normal", borderColor: 'rgb(210, 235, 227)' }} dashed>
                        {(t(`mutation:sample.age`))}
                    </Divider>

                    {
                        Object.keys(clinicColorConfig["age"]).map((item) => {
                            return <Typography.Paragraph key={item} className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: clinicColorConfig["age"][item] }}></span>{(t(`mutation:sample.${item}`))}
                            </Typography.Paragraph>
                        })
                    }
                </Col>
                <Col sm={8} md={8} lg={8}>
                    <Row style={{ width: '100%' }} algin={"center"} justify={"center"}>
                        <Divider orientation="left" orientationMargin="0" variant="dashed" style={{ fontSize: "14px", fontWeight: "normal", borderColor: 'rgb(210, 235, 227)' }} dashed>
                            {(t(`mutation:sample.race`))}
                        </Divider>
                    </Row>
                    <Row style={{ width: '100%' }} algin={"center"}>
                        <Col sm={12} md={12} lg={12}>
                            {
                                Object.keys(clinicColorConfig["race"]).slice(0, 6).map((item) => {
                                    return <Typography.Paragraph key={item} className={styles.legendName}>
                                        <span className={styles.colorBlock}
                                            style={{ backgroundColor: clinicColorConfig["race"][item] }}></span>{(t(`mutation:sample.${item}`))}
                                    </Typography.Paragraph>
                                })
                            }</Col>
                        <Col sm={12} md={12} lg={12}>
                            {
                                Object.keys(clinicColorConfig["race"]).slice(6, 12).map((item) => {
                                    return <Typography.Paragraph key={item} className={styles.legendName}>
                                        <span className={styles.colorBlock}
                                            style={{ backgroundColor: clinicColorConfig["race"][item] }}></span>{(t(`mutation:sample.${item}`))}
                                    </Typography.Paragraph>
                                })
                            }</Col>
                    </Row>
                </Col>
                <Col sm={5} md={5} lg={5}>
                    <Divider orientation="left" orientationMargin="0" variant="dashed" style={{ fontSize: "14px", fontWeight: "normal", borderColor: 'rgb(210, 235, 227)' }} dashed>
                        {(t(`mutation:sample.tnmStageV8`))}
                    </Divider>
                    {
                        Object.keys(clinicColorConfig["tnmStageV8"]).map((item) => {
                            return <Typography.Paragraph key={item} className={styles.legendName}>
                                <span className={styles.colorBlock}
                                    style={{ backgroundColor: clinicColorConfig["tnmStageV8"][item] }}></span>{(t(`mutation:sample.${item}`))}
                            </Typography.Paragraph>
                        })
                    }
                </Col>
            </Row>
        </Row>
    );
}
export default ChartsLegend;
