"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Button, Segmented, message, Row, Col, Flex, Typography } from "antd";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import styles from "./style.module.scss";

const About = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const menu = searchParams.get("menu"); // 获取menu参数

  return (
    <div style={{ background: "#f8f9fa", padding: "20px 40px" }}>
      <Typography.Title level={2} className={styles.title}>
        {t("common:about.laboratoryIntroduction")}
      </Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={12}>
          <Flex vertical className={styles.aboutContent}>
            <Typography.Title level={3} className={styles.aboutTitle}>
              Zhai Lab
            </Typography.Title>
            <p>
              The Zhai Lab at the Institute of Zoology, Chinese Academy of Sciences, applies evolutionary and genomic approaches to study the evolution of somatic cells, particularly in cancer. The lab focuses on intra-tumor heterogeneity (ITH), a central hallmark of cancer, and aims to characterize its spatial and temporal patterns within tumors. By integrating evolutionary theory with modern omics technologies, the group investigates how forces such as mutation and selection shape tumor heterogeneity and evolution. Ultimately, the lab seeks to translate evolutionary principles into clinical insights to improve patient stratification and treatment, bridging fundamental evolutionary biology and precision medicine. For more information, please visit:
            </p>
            <p>
              <a href="https://zhailab.cn/" target="https://zhailab.cn/">
                https://zhailab.cn/
              </a>
            </p>
          </Flex>
        </Col>
        <Col xs={12}>
          <Flex vertical className={styles.aboutContent}>
            <Typography.Title level={3} className={styles.aboutTitle}>
              Scientific Data Center
            </Typography.Title>
            <p>
              The Zoological Scientific Data Center, a joint initiative led by the Institute of Zoology at the Chinese Academy of Sciences, is broadly interested in the integration of zoological scientific data, the application of artificial intelligence, and the advancement of data-driven research paradigms. Some of our recent works focus on constructing authoritative data resources—including the Catalogue of Life China and biological maps—and developing intelligent wildlife monitoring systems currently deployed across more than 10 provinces. The common theme of these works aims at building a comprehensive data ecosystem that promotes the automation of biodiversity monitoring and serves national strategic demands.
            </p>
          </Flex>
        </Col>
      </Row>
      <Typography.Title level={2} className={styles.title}>
        {t("common:about.relatedDatabases")}
      </Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={6}>
          <a
            href="https://portal.gdc.cancer.gov/"
            target="https://portal.gdc.cancer.gov/"
          >
            <Flex vertical className={styles.databaseContent}>
              <Typography.Title level={4} className={styles.databaseTitle}>
                TCGA
              </Typography.Title>
              <p>The Cancer Genome Atlas</p>
            </Flex>
          </a>
        </Col>
        <Col xs={6}>
          <a href="https://dcc.icgc.org/" target="https://dcc.icgc.org/">
            <Flex vertical className={styles.databaseContent}>
              <Typography.Title level={4} className={styles.databaseTitle}>
                ICGC
              </Typography.Title>
              <p>Intl. Cancer Genome Consortium</p>
            </Flex>
          </a>
        </Col>
        <Col xs={6}>
          <a
            href="https://www.ncbi.nlm.nih.gov/geo/"
            target="https://www.ncbi.nlm.nih.gov/geo/"
          >
            <Flex vertical className={styles.databaseContent}>
              <Typography.Title level={4} className={styles.databaseTitle}>
                GEO
              </Typography.Title>
              <p>Gene Expression Omnibus</p>
            </Flex>
          </a>
        </Col>
        <Col xs={6}>
          <a href="https://ngdc.cncb.ac.cn/" target="https://ngdc.cncb.ac.cn/">
            <Flex vertical className={styles.databaseContent}>
              <Typography.Title level={4} className={styles.databaseTitle}>
                NGDC
              </Typography.Title>
              <p>National Genomics Data Center</p>
            </Flex>
          </a>
        </Col>
      </Row>
    </div>
  );
};

export default About;
