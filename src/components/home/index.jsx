"use client";
import React, { useEffect } from "react";
import {
  Layout,
  Flex,
  Row,
  Col,
  Card,
  Button,
  Typography,
} from "antd";
import styles from "./style.module.scss";
import Image from "next/image";
import { useTranslation } from "react-i18next";
const { Title, Paragraph } = Typography;
const Home = () => {
  const { t } = useTranslation();

  const dataStaticList = [
    {
      icon: "/images/total-patients.svg",
      title: "6,068",
      key: "patient",
      textColor: "#2a5ca1",
      text: t("home:dataStaticList.totalPatients"),
    },
    {
      icon: "/images/samples-analyzed.svg",
      title: "8,284",
      key: "sample",
      textColor: "#a3584c",
      text: t("home:dataStaticList.samplesAnalyzed"),
    },
    {
      icon: "/images/identified-mutations.svg",
      title: 45,
      key: "cohorts",
      textColor: "#729863",
      text: t("home:dataStaticList.totalCohorts"),
    },
    {
      icon: "/images/published-papers.svg",
      title: "Multi-sectors",
      key: "data-type",
      textColor: "#476eaa",
      text: t("home:dataStaticList.dataType"),
    },
  ];

  const researchOverviewList = [
    {
      image: "/images/geospatial-analysis.svg",
      textColor: "rgb(204,91,126)",
      bgColor: "rgb(255, 235, 242)",
      title: t("home:researchOverview.list.geospatialAnalysis.title"),
      text: t("home:researchOverview.list.geospatialAnalysis.description"),
    },
    {
      image: "/images/data-integration.svg",
      textColor: "rgb(99,83,160)",
      bgColor: "rgb(236, 236, 255)",
      title: t("home:researchOverview.list.temporalAnalysis.title"),
      text: t("home:researchOverview.list.temporalAnalysis.description"),
    },
    {
      image: "/images/mutation-mapping.svg",
      textColor: "rgb(63,122,128)",
      bgColor: "rgb(226, 247, 252)",
      title: t("home:researchOverview.list.customAnalysis.title"),
      text: t("home:researchOverview.list.customAnalysis.description"),
    },
  ];

  const items = [
    {
      key: "mutation",
      path: "driver-landscape",
      title: t("home:models.driverLandscape.title"),
      textColor: "rgb(63,122,128)",
      bgColor: "rgb(226, 247, 252)",
      url: "/images/driver-landscape.png",
      description: t("home:models.driverLandscape.description"),
    },
    {
      key: "mutation",
      path: "timing-analysis",
      title: t("home:models.timingAnalysis.title"),
      textColor: "rgb(63,122,128)",
      bgColor: "rgb(226, 247, 252)",
      url: "/images/timing-analysis.png",
      description: t("home:models.timingAnalysis.description"),
    },
    {
      key: "transcriptome",
      path: "differential-expression-analysis",
      title: t("home:models.differentialExpressionAnalysis.title"),
      textColor: "#7b1fa2",
      bgColor: "#f3eafa",
      url: "/images/differential-expression-analysis.png",
      description:
        "Differential gene expression analysis discovers differentially expressed genes (DEGs) between different subgroups (e.g. grouping by clinical information or molecular features) of samples.",
    },
    {
      key: "transcriptome",
      path: "transcriptomic-heterogeneity",
      title: t("home:models.transcriptomicHeterogeneity.title"),
      textColor: "#7b1fa2",
      bgColor: "#f3eafa",
      url: "/images/transcriptomic-heterogeneity.png",
      description: t("home:models.transcriptomicHeterogeneity.description"),
    },
    {
      key: "immune",
      path: "microenvironment-deconvolution",
      title: t("home:models.microenvironmentDeconvolution.title"),
      textColor: "#2e7d32",
      bgColor: "#e8f7f0",
      url: "/images/microenvironment-deconvolution.png",
      description: t("home:models.microenvironmentDeconvolution.description"),
    },
    {
      key: "immune",
      path: "immune-subtype",
      title: t("home:models.microenvironmentSpatialHeterogeneity.title"),
      textColor: "#2e7d32",
      bgColor: "#e8f7f0",
      url: "/images/microenvironment-spatial-heterogeneity.png",
      description: t("home:models.microenvironmentSpatialHeterogeneity.description"),
    },
    {
      key: "biomarkers",
      path: "survival-analysis",
      title: t("home:models.survivalAnalysis.title"),
      textColor: "#c2185b",
      bgColor: "#fdeaea",
      url: "/images/survival-analysis.png",
      description: t("home:models.survivalAnalysis.description"),
    },
    {
      key: "biomarkers",
      path: "multi-modal-joint-analysis",
      title: t("home:models.multiModalJointAnalysis.title"),
      textColor: "#c2185b",
      bgColor: "#fdeaea",
      url: "/images/multi-modal-joint-analysis.png",
      description: t("home:models.multiModalJointAnalysis.description"),
    },
  ];

  return (
    <Layout style={{ background: "#fff" }} className={styles.homeContainer}>
      <Row justify="center" className={styles.main}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Flex vertical className={styles.colFlex}>
            <div>
              <Typography.Title
                ellipsis={{
                  rows: 1,
                  expandable: false,
                }}
                style={{
                  marginBottom: 0,
                  fontSize: "54px",
                  color: "rgb(10, 186, 181)",
                  fontWeight: "bold",
                }}
              >
                <span>{t("home:banner.title")}!</span>
              </Typography.Title>
            </div>
            <Typography.Paragraph
              style={{
                marginTop: "20px",
                fontSize: "18px",
                marginBottom: 0,
                color: "#555",
              }}
            >
              {t("home:banner.description")}
            </Typography.Paragraph>

            {/* <Flex align="center" justify="space-between" style={{ marginTop: "20px" }}>
              <Input.Search
                // loading
                className={styles.hccSearch}
                placeholder={t("home:search.placeholder")}
                enterButton
                size="large"
                onSearch={onSearch}
              />
              <Button size="large" onClick={handleAdvanceSearch} style={{ marginLeft: "10px", lineHeight: "40px", borderColor: "rgb(10, 186, 181)", backgroundColor: "rgb(10, 186, 181)" }}>Advanced Search</Button>
            </Flex> */}

            {/* <Image src={"/images/water-fall.jpg"} width={350} height={200} alt="water-fall"></Image>
                        <Image src={"/images/rainbow.jpg"} width={350} height={200} alt='rainbow'></Image> */}
          </Flex>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <div className={styles.bannerImage}></div>
        </Col>
      </Row>

      <Row justify="center" className={styles.singleModalList} gutter={[20, 20]}>
        <Col xs={24} sm={24} md={24} lg={24}>
          <Title
            className={styles.subTitle}
            level={3}
            style={{ marginLeft: 15 }}
          >
            {t("home:models.title")}
          </Title>
        </Col>
        {items.map((item, index) => {
          return (
            <Col key={index} xs={12} sm={12} md={6} lg={6}>
              <Flex
                className={styles.moduleCard}
                vertical
                style={{
                  width: "100%",
                  height: "100%",
                  padding: "10px 10px 20px",
                  borderRadius: "12px",
                  backgroundColor: item.bgColor,
                }}
              >
                <div style={{ height: "200px", borderRadius: "12px", marginBottom: "20px", backgroundColor: "#fff", backgroundImage: `url('${item.url}')`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}></div>
                <Title
                  level={4}
                  align={"center"}
                  style={{ color: item.textColor }}
                  ellipsis={{
                    rows: 2,
                    expandable: false,
                  }}
                >
                  {item.title}
                </Title>
                <Paragraph
                  align={"left"}
                  className={styles.description}
                  ellipsis={{
                    rows: 5,
                    expandable: false,
                  }}
                  style={{
                    marginBottom: 0,
                    marginTop: 20,
                    padding: "0px 10px", 
                    color: "rgb(20, 40, 80)",
                  }}
                >
                  {item.description}
                </Paragraph>
                <Flex justify="flex-end" style={{ marginTop: "auto" }}>
                  <a href={`/${item.key}?menu=${item.path}`} target={`/${item.key}?menu=${item.path}`}>
                    <Button color="#fff" style={{ border: "none", color: `${item.textColor}`, background: "#fff", marginTop: "10px" }}>
                      {t("common:explore")}
                    </Button>
                  </a>
                </Flex>
              </Flex>
            </Col>
          );
        })}
      </Row>
      <Row justify="center" className={styles.overview} gutter={[10, 10]}>
        <Col xs={24} sm={24} md={8} lg={8}>
          <Title className={styles.subTitle} level={3}>
            Data Static
          </Title>
          <Row
            gutter={[15, 15]}
            style={{ margin: 0 }}
            className={styles.dataStaticList}
          >
            {dataStaticList.map((item) => {
              return (
                <Col
                  key={item.key}
                  xs={12} sm={12} md={12} lg={12}
                  style={{
                    height: 112,
                    backgroundImage: `url('/images/${item.key}-bg.png')`,
                    backgroundSize: "cover",
                    backgroundPosition: "bottom right",
                    backgroundRepeat: "no-repeat",
                    backgroundOrigin: "content-box",
                  }}
                >
                  <Typography.Paragraph
                    level={5}
                    style={{ margin: "15px", color: item.textColor }}
                  >
                    {item.text}
                  </Typography.Paragraph>
                  <Title
                    level={3}
                    style={{ margin: "10px", color: item.textColor }}
                  >
                    {item.title}
                  </Title>
                </Col>
              );
            })}
          </Row>
        </Col>
        <Col xs={24} sm={24} md={16} lg={16}>
          <Title
            className={styles.subTitle}
            level={3}
            style={{ marginLeft: 10 }}
          >
            Core Features
          </Title>
          <Row
            gutter={[15, 15]}
            justify="center"
            className={styles.researchHighlight}
          >
            {researchOverviewList.map((item, index) => {
              return (
                <Col key={index} xs={24} sm={24} md={8} lg={8}>
                  <Flex vertical align={"center"} className={styles.colFlex}>
                    <Card
                      style={{
                        width: "100%",
                        paddingTop: 15,
                        backgroundColor: item.bgColor,
                      }}
                      cover={
                        <Image
                          alt="example"
                          src={item.image}
                          width={60}
                          height={60}
                        />
                      }
                    >
                      <Title
                        level={4}
                        align={"center"}
                        style={{ color: item.textColor }}
                        ellipsis={{
                          rows: 1,
                          expandable: false,
                        }}
                      >
                        {item.title}
                      </Title>
                      <Paragraph
                        align={"left"}
                        className={styles.description}
                        ellipsis={{
                          rows: 3,
                          expandable: false,
                        }}
                        style={{
                          marginBottom: 0,
                          marginTop: 20,
                          color: "rgb(20, 40, 80)",
                        }}
                      >
                        {item.text}
                      </Paragraph>
                    </Card>
                  </Flex>
                </Col>
              );
            })}
          </Row>
        </Col>
      </Row>
    </Layout>
  );
};
export default Home;
