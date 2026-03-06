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
              The Zhai Lab, located at the Institute of Zoology, Chinese Academy
              of Sciences, is broadly interested in the research of molecular
              evolution, population genetics, and somatic cell evolution, with a
              particular focus on the genomic and transcriptomic dynamics of
              cancer. Some of our recent works are on the spatial phylogeography
              of hepatocellular carcinoma (HCC), the "PLANET" prospective cohort
              study, and the modeling of intra-tumor heterogeneity (ITH) across
              multi-omics layers. The common theme of these works aims at
              deciphering the evolutionary trajectories of tumors to identify
              prognostic "evolutionary signatures," thereby bridging the gap
              between basic evolutionary theory and clinical precision medicine.
              For more information, please visit:
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
              The Zoological Scientific Data Center, a joint initiative led by
              the Institute of Zoology at the Chinese Academy of Sciences, is
              broadly interested in the integration of zoological scientific
              data, the application of artificial intelligence, and the
              advancement of data-driven research paradigms. Some of our recent
              works focus on constructing authoritative data resources—including
              the Catalogue of Life China and biological maps—and developing
              intelligent wildlife monitoring systems currently deployed across
              more than 10 provinces. The common theme of these works aims at
              building a comprehensive data ecosystem that promotes the
              automation of biodiversity monitoring and serves national
              strategic demands. For more information.
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
