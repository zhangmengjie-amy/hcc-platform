"use client";
import React from 'react';
import {Layout, Row, Col, Typography, Divider} from 'antd';
import styles from "./style.module.scss";
import {useTranslation} from "react-i18next";

const {Footer} = Layout;
const {Title, Paragraph} = Typography;

const HCCFooter = () => {
    const {t} = useTranslation();
    return (
        <Footer className={styles.HCCFooter}>
            <Row>
                <Col sm={12} md={6} lg={6} style={{padding: "0 20px"}}>
                    <Title style={{color: "#fff"}} level={5}>{t("home:footer.aboutHccPlatform.title")}</Title>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        {t("home:footer.aboutHccPlatform.description")}
                    </Paragraph>
                </Col>
                <Col sm={12} md={6} lg={6} style={{padding: "0 20px"}}>
                    <Title style={{color: "#fff"}}
                           level={5}>{t("home:footer.quickLinks.title")}</Title>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        Documentation
                    </Paragraph>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        Research Data
                    </Paragraph>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        Publications
                    </Paragraph>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>Team</Paragraph>

                </Col>
                <Col sm={12} md={6} lg={6} style={{padding: "0 20px"}}>
                    <Title style={{color: "#fff"}} level={5}>{t("home:footer.resources.title")}</Title>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        API Access
                    </Paragraph>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        Data Download
                    </Paragraph>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        Analysis Tools
                    </Paragraph>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        Support
                    </Paragraph>
                </Col>
                <Col sm={12} md={6} lg={6} style={{padding: "0 20px"}}>
                    <Title style={{color: "#fff"}} level={5}>{t("home:footer.contact.title")}</Title>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        Email: contact@hcc-platform.org
                    </Paragraph>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        Tel: +1 (555) 123-4567
                    </Paragraph>
                    <Paragraph style={{color: "#fff", fontWeight: "lighter"}}>
                        Location: Research Center
                    </Paragraph>
                </Col>
            </Row>
            <Row>
                <Divider style={{backgroundColor: "rgb(53, 81, 102)"}}/>
            </Row>
            <Row>
                <Col xs={24} sm={24} md={24} lg={24}
                     style={{
                         textAlign: "center",
                         color: "rgb(154, 168,179)"
                     }}>© {new Date().getFullYear()} {t("home:footer.copyright")}</Col>
            </Row>
        </Footer>
    );
}
export default HCCFooter;
