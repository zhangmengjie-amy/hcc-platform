"use client";
import React from "react";
import { Layout, Row, Col, Typography, Flex } from "antd";
import styles from "./style.module.scss";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const { Footer } = Layout;
const { Title, Paragraph } = Typography;

const HCCFooter = () => {
  const { t } = useTranslation();
  return (
    <Footer
      className={styles.HCCFooter}
      style={{ padding: "20px 0px 0px 0px" }}
    >
      <Row className={styles.footerContent} style={{ padding: "0 50px 10px" }}>
        <Col sm={12} md={6} lg={6} style={{ padding: "0 20px" }}>
          <Title style={{ color: "#fff" }} level={5}>
            {t("home:footer.aboutHccPlatform.title")}
          </Title>
          <Paragraph style={{ color: "#fff", fontWeight: "lighter" }}>
            {t("home:footer.aboutHccPlatform.description")}
          </Paragraph>
        </Col>
        <Col sm={12} md={6} lg={6} style={{ padding: "0 20px" }}>
          {/* <Title style={{ color: "#fff" }}
            level={5}>{t("home:footer.quickLinks.title")}</Title>
          <Paragraph style={{ color: "#fff", fontWeight: "lighter" }}>
                        Documentation
          </Paragraph>
          <Paragraph style={{ color: "#fff", fontWeight: "lighter" }}>
                        Research Data
          </Paragraph>
          <Paragraph style={{ color: "#fff", fontWeight: "lighter" }}>
                        Publications
          </Paragraph>
          <Paragraph style={{ color: "#fff", fontWeight: "lighter" }}>Team</Paragraph> */}
        </Col>
        <Col sm={12} md={8} lg={8} style={{ padding: "0 20px" }}>
          <Title style={{ color: "#fff" }} level={5}>
            {t("home:footer.contact.title")}
          </Title>
          <Paragraph style={{ color: "#fff", fontWeight: "lighter", marginBottom: 5 }}>
            {t("home:footer.contact.description")}
          </Paragraph>
          <Paragraph style={{ color: "#fff", fontWeight: "lighter", marginBottom: 5 }}>
            {t("home:footer.contact.email")}: epg@ioz.ac.cn
          </Paragraph>
          <Paragraph style={{ color: "#fff", fontWeight: "lighter", marginBottom: 5 }}>
            {t("home:footer.contact.github")}: https://github.com/Zhailab2026/LIGOR
          </Paragraph>
        </Col>
      </Row>
      <Row style={{ borderTop: "1px solid #ccc", padding: "15px 0" }}>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={24}
          style={{
            textAlign: "center",
            color: "#fff",
            marginBottom: "10px",
          }}
        >
          Copyright © 2018-{new Date().getFullYear()} <a style={{ color: "#fff" }} href="https://www.ioz.ac.cn/" target="https://www.ioz.ac.cn/"> {t("home:footer.contact.ioz")} </a>
          {t("home:footer.copyright")}
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={24}
          style={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <Flex align="center">
            <Image src="/images/gongan.png" alt="Logo" width={20} height={20} />
            <a
              style={{ color: "#fff" }}
              target="https://bszs.conac.cn/sitename?method=show&id=0897A47506BF7A55E053022819AC98DD"
              href="https://bszs.conac.cn/sitename?method=show&id=0897A47506BF7A55E053022819AC98DD"
            >
              {t("home:footer.contact.security")}
            </a>
           
          </Flex>
          <Flex style={{ marginLeft: "20px" }} align="center">
            <Image
              src="/images/shiyedanwei.png"
              alt="Logo"
              width={20}
              height={20}
            />
            <a
              style={{ color: "#fff" }}
              target="https://beian.mps.gov.cn/#/query/webSearch"
              href="https://beian.mps.gov.cn/#/query/webSearch"
            >
              {t("home:footer.contact.icp")}
            </a>
          </Flex>
        </Col>
      </Row>
    </Footer>
  );
};
export default HCCFooter;
