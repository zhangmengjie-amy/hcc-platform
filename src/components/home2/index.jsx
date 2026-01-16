"use client";
import React, { useState, useMemo } from "react";
import { Layout, Flex, Row, Col, Card, Menu, FloatButton, Button, Input, Typography } from "antd";
import styles from "./style.module.scss";
import Image from "next/image";
import CountUp from "react-countup";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import HomeContent from "@/components/home/content";
import HomeBanner from "@/components/home/banner";
const { Title, Paragraph } = Typography;
const Home = () => {
  const { t } = useTranslation();
  const [seletedSingleModal, setSelectedSingleModal] = useState("mutation");
  const dataStaticList = [{
    icon: "/images/total-patients.svg",
    title: 12345,
    key: "patient",
    textColor: "#2a5ca1",
    text: t("home:totalPatients"),
  }, {
    icon: "/images/samples-analyzed.svg",
    title: 12345,
    key: "sample",
    textColor: "#a3584c",
    text: t("home:samplesAnalyzed"),
  }, {
    icon: "/images/identified-mutations.svg",
    title: 12345,
    key: "gene-mutation",
    textColor: "#729863",
    text: t("home:identifiedMutations"),
  }, {
    icon: "/images/published-papers.svg",
    title: 12345,
    key: "papers",
    textColor: "#476eaa",
    text: t("home:publishedPapers"),
  }];

  const researchOverviewList = [{
    image: "/images/advanced-analysis.svg",
    textColor: "rgb(204,91,126)",
    bgColor: "rgb(255, 235, 242)",
    title: t("home:researchOverview.list.advancedAnalysis.title"),
    text: t("home:researchOverview.list.advancedAnalysis.description"),
  }, {
    image: "/images/data-integration.svg",
    textColor: "rgb(99,83,160)",
    bgColor: "rgb(236, 236, 255)",
    title: t("home:researchOverview.list.dataIntegration.title"),
    text: t("home:researchOverview.list.dataIntegration.description"),
  }, {
    image: "/images/mutation-mapping.svg",
    textColor: "rgb(63,122,128)",
    bgColor: "rgb(226, 247, 252)",
    title: t("home:researchOverview.list.mutationMapping.title"),
    text: t("home:researchOverview.list.mutationMapping.description"),
  }];

  const items = [
    { key: "mutation", label: "Mutation", bg: "/images/mutation-bg.png" },
    { key: "expression", label: "Expression", bg: "/images/expression-bg.png" },
    { key: "immune", label: "Immune" },
    { key: "clinical", label: "Clinical" },
  ];


  const singleModalContent = useMemo(() => {
    if (seletedSingleModal == "mutation") {
      return <>
        <Image src={"/images/mutation-list1.png"} width={400} height={240} alt="water-fall"></Image></>;
    } else {
      return <><Image src={"/images/subtype.jpg"} width={250} height={200} alt="subtype"></Image></>;
    }
  }, [seletedSingleModal]);

  return (
    <Layout style={{ background: "#fff" }} className={styles.homeContainer}>
      <Row justify="center" className={styles.main}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Flex vertical className={styles.colFlex}>
            <div><Typography.Title ellipsis={{
              rows: 1,
              expandable: false,
            }}
            style={{ marginBottom: 0, fontSize: "54px", color: "rgb(10, 186, 181)", fontWeight: "bold" }}>
              <span style={{ fontWeight: "bold", marginRight: "20px", display: "inline-block", fontSize: "54px", color: "#fff" }}>HCC</span><span>{"Data Platform"}</span>
            </Typography.Title></div>
            <Typography.Paragraph ellipsis={{
              rows: 1,
              expandable: false,
            }}
            style={{ marginTop: "20px", fontSize: "18px", marginBottom: 0, color: "rgba(182, 55, 106)" }}>
              {"Comprehensive Analysis of Hepatocellular Carcinoma"}
            </Typography.Paragraph>
            <Typography.Paragraph
              style={{ marginTop: "15px", marginBottom: 0, color: "#555" }}>
              {t("home:banner.description")}
            </Typography.Paragraph>

            <Flex align="center" justify="space-between" style={{ marginTop: "35px" }}>
              <Input.Search
                // loading
                className={styles.hccSearch}
                placeholder={t("home:search.placeholder")}
                enterButton
                size="large"
                // onSearch={onSearch}
              />
              <Button size="large" style={{ marginLeft: "20px" }}>Go To Multi Modal</Button>
            </Flex>

            {/* <Image src={"/images/water-fall.jpg"} width={350} height={200} alt="water-fall"></Image>
                        <Image src={"/images/rainbow.jpg"} width={350} height={200} alt='rainbow'></Image> */}
          </Flex>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} >
          <div className={styles.bannerImage}>
          </div>
        </Col>
      </Row>


      <Row justify="center" className={styles.singleModalList}>
        <Col xs={24} sm={24} md={24} lg={24}>
          <Title className={styles.subTitle} level={3} style={{ marginLeft: 15 }}>Single Modal</Title></Col>
        {
          items.map((item, index) => {
            return <Col key={index} xs={12} sm={12} md={6} lg={6}>
              <Flex vertical onClick={() => { setSelectedSingleModal(item.key); }} align={"center"} className={classnames(styles.colFlex, { isSingleModalActive: seletedSingleModal === item.key, [item.key]: true })} style={{
                backgroundImage: `url('/images/${item.key}-bg.png')`,
                backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundOrigin: "content-box",
              }}>
                <Title className={styles.singleModalTitle} level={2}
                >
                  <span className={styles.capital}>{item.label?.slice(0, 1)}</span><span className={styles.remaining}>{item.label?.slice(1, item.label.length)}</span>
                </Title>
              </Flex>
            </Col>;
          })
        }
      </Row>
      <Row className={styles.singleModal}>
        <Col className={styles.colFlex}>
          {singleModalContent}
        </Col>
      </Row>
      <Row justify="center" className={styles.overview}>
        <Col xs={8} sm={8} md={8} lg={8}>
          <Title className={styles.subTitle} level={3}>Data Static</Title>
          <Row gutter={[20, 10]} style={{ margin: 0 }} className={styles.dataStaticList}>
            {
              dataStaticList.map((item) => {
                return <Col key={item.key} className={styles.colFlex} span={12} style={{
                  width: "calc(50%)",  height: "100px", backgroundImage: `url('/images/${item.key}-bg.png')`,
                  backgroundSize: "cover", backgroundPosition: "bottom right", backgroundRepeat: "no-repeat", backgroundOrigin: "content-box",
                }}>
                  <Typography.Paragraph level={5} style={{ marginTop: "10px", color: item.textColor }}>{item.text}</Typography.Paragraph>
                  <Title level={3} style={{ marginTop: "20px", color: item.textColor }}>{item.title}</Title>
                </Col>;
              })
            }

          </Row>


        </Col>
        <Col xs={16} sm={16} md={16} lg={16}>
          <Title className={styles.subTitle} level={3} style={{ marginLeft: 10 }}>Search Overview</Title>
          <Row justify="center" className={styles.researchHighlight}>
                                        
            {
              researchOverviewList.map((item, index) => {
                return <Col key={index} xs={24} sm={24} md={8} lg={8} >
                  <Flex vertical align={"center"} className={styles.colFlex} >
                    <Card
                      style={{ height: "230px", paddingTop: 15, backgroundColor: item.bgColor }}
                      cover={
                        <Image
                          alt="example"
                          src={item.image}
                          width={60}
                          height={60}
                        />
                      }
                    >
                      <Title level={4} align={"center"} style={{ color: item.textColor }} ellipsis={{
                        rows: 1,
                        expandable: false,
                      }}>
                        {item.title}
                      </Title>
                      <Paragraph align={"left"} className={styles.description} ellipsis={{
                        rows: 2,
                        expandable: false,
                      }} style={{
                        marginBottom: 0,
                        marginTop: 20,
                        color: "rgb(20, 40, 80)",
                      }}>{item.text}</Paragraph>

                    </Card>
                  </Flex>
                </Col>;
              })
            }
          </Row>
        </Col>
      </Row>


    </Layout>
  );
};
export default Home;
