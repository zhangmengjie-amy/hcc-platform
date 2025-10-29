"use client";
import React, { useState, useMemo } from 'react';
import { Layout, Flex, Row, Col, Card, Menu, FloatButton, Button, Input, Typography } from 'antd';
import styles from "./style.module.scss";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import classnames from 'classnames';
import { useTranslation } from "react-i18next";
const { Title, Paragraph } = Typography;
const Home = () => {
    const { t } = useTranslation();
    const router = useRouter();
    // const [searchText, setSearchText] = useState('');
    const [seletedSingleModal, setSelectedSingleModal] = useState("mutation");

    const onSearch = (value) => {
        router.push(`/search?query=${!!value ? value : "TP53,CNNTB1,AXIN1"}`);
    }
    const dataStaticList = [{
        icon: "/images/total-patients.svg",
        title: 12345,
        key: "patient",
        textColor: "#2a5ca1",
        text: t("home:totalPatients")
    }, {
        icon: "/images/samples-analyzed.svg",
        title: 12345,
        key: "sample",
        textColor: "#a3584c",
        text: t("home:samplesAnalyzed")
    }, {
        icon: "/images/identified-mutations.svg",
        title: 12345,
        key: "gene-mutation",
        textColor: "#729863",
        text: t("home:identifiedMutations")
    }, {
        icon: "/images/published-papers.svg",
        title: 12345,
        key: "papers",
        textColor: "#476eaa",
        text: t("home:publishedPapers")
    }];

    const researchHighlight = [{
        image: "/images/body.png",
        title: 'Mutation Signatures in HCC',
        text: 'Identifying novel mutation patterns in hepatocellular carcinoma patients.',
        width: 1024,
        height: 768
    }, {
        image: "/images/cell.jpg",
        title: 'Immune Microenvironment',
        text: 'Characterizing the immune landscape of liver cancer progression.',
        width: 800,
        height: 549
    }, {
        image: "/images/gene.png",
        title: 'Clinical Outcomes',
        text: 'Analyzing treatment responses and survival patterns.',
        width: 406,
        height: 405
    }]
    const researchOverviewList = [{
        image: "/images/advanced-analysis.svg",
        textColor: "rgb(204,91,126)",
        bgColor: "rgb(255, 235, 242)",
        title: t("home:researchOverview.list.advancedAnalysis.title"),
        text: t("home:researchOverview.list.advancedAnalysis.description")
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
    }]

    const items = [
        { key: 'mutation', label: 'Genome', bg: "/images/mutation-bg.png" },
        { key: 'expression/subtype', label: 'Transcriptome', bg: "/images/expression-bg.png" },
        { key: 'immune', label: 'Immune' },
        { key: 'clinical', label: 'Clinical' },
    ];

    const handleAdvanceSearch = () => {
        router.push(`/search/advanced`);
    }


    const singleModalContent = useMemo(() => {
        if (seletedSingleModal == "mutation") {
            return <>
                <Image src={"/images/mutation-list1.png"} width={400} height={240} alt="water-fall"></Image></>
        } else {
            return <><Image src={"/images/subtype.jpg"} width={250} height={200} alt="subtype"></Image></>
        }
    }, [seletedSingleModal])

    return (
        <Layout style={{ background: "#fff" }} className={styles.homeContainer}>
            <Row justify="center" className={styles.main}>
                <Col xs={24} sm={24} md={12} lg={12}>
                    <Flex vertical className={styles.colFlex}>
                        <div><Typography.Title ellipsis={{
                            rows: 1,
                            expandable: false
                        }}
                            style={{ marginBottom: 0, fontSize: "54px", color: "rgb(10, 186, 181)", fontWeight: "bold" }}>
                            <span style={{ fontWeight: "bold", marginRight: "20px", display: "inline-block", fontSize: "54px", color: "rgb(237, 108, 116)" }}>HCC</span><span>{"Data Platform"}</span>
                        </Typography.Title></div>
                        <Typography.Paragraph ellipsis={{
                            rows: 1,
                            expandable: false
                        }}
                            style={{ marginTop: "20px", fontSize: "18px", marginBottom: 0, color: "rgba(182, 55, 106)" }}>
                            {"Comprehensive Analysis of Hepatocellular Carcinoma"}
                        </Typography.Paragraph>
                        <Typography.Paragraph
                            style={{ marginTop: "20px", fontSize: "16px", marginBottom: 0, color: "#555" }}>
                            {t("home:banner.description")}
                        </Typography.Paragraph>

                        <Flex align="center" justify='space-between' style={{ marginTop: "20px" }}>
                            <Input.Search
                                // loading
                                className={styles.hccSearch}
                                placeholder={t("home:search.placeholder")}
                                enterButton
                                size="large"
                                onSearch={onSearch}
                            />
                            <Button size='large' onClick={handleAdvanceSearch} style={{ marginLeft: "10px", lineHeight: "40px", borderColor: "rgb(10, 186, 181)", backgroundColor: "rgb(10, 186, 181)" }}>Advanced Search</Button>
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
                <Title className={styles.subTitle} level={3} style={{marginLeft: 15}}>Single Modal</Title></Col>
                {
                    items.map((item, index) => {
                        return <Col key={index} xs={12} sm={12} md={6} lg={6}>
                            <Link href={`/${item.key}`} onClick={() => { setSelectedSingleModal(item.key) }}>
                            <Flex vertical align={"center"} className={classnames(styles.colFlex, { [item.key]: true })} style={{
                                backgroundImage: `url('/images/${item.key?.split("/")?.[0]}-bg.png')`,
                                backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundOrigin: "content-box"
                            }}>
                                <Title className={styles.singleModalTitle} level={2}
                                >
                                    <span className={styles.capital}>{item.label?.slice(0, 1)}</span><span className={styles.remaining}>{item.label?.slice(1, item.label.length)}</span>
                                </Title>
                            </Flex></Link>
                            
                        </Col>
                    })
                }
            </Row>
            <Row justify="center" className={styles.overview}>
                <Col xs={8} sm={8} md={8} lg={8}>
                    <Title className={styles.subTitle} level={3}>Data Static</Title>
                    <Row gutter={[20, 10]} style={{margin: 0}} className={styles.dataStaticList}>
                        {
                            dataStaticList.map((item) => {
                                return <Col key={item.key} className={styles.colFlex} span={12} style={{
                                    width: 'calc(50%)',  height: "100px", backgroundImage: `url('/images/${item.key}-bg.png')`,
                                    backgroundSize: "cover", backgroundPosition: "bottom right", backgroundRepeat: "no-repeat", backgroundOrigin: "content-box"
                                }}>
                                    <Typography.Paragraph level={5} style={{ marginTop: "10px", color: item.textColor }}>{item.text}</Typography.Paragraph>
                                    <Title level={3} style={{ marginTop: "20px", color: item.textColor }}>{item.title}</Title>
                                </Col>
                            })
                        }

                    </Row>
                </Col>
                <Col xs={16} sm={16} md={16} lg={16}>
                    <Title className={styles.subTitle} level={3} style={{marginLeft: 10}}>Search Overview</Title>
                    <Row justify="center" className={styles.researchHighlight}>
                                        
                        {
                            researchOverviewList.map((item, index) => {
                                return <Col key={index} xs={24} sm={24} md={8} lg={8} >
                                    <Flex vertical align={"center"} className={styles.colFlex} >
                                        <Card
                                            style={{ height: "210px", paddingTop: 15, backgroundColor: item.bgColor }}
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
                                                expandable: false
                                            }}>
                                                {item.title}
                                            </Title>
                                            <Paragraph align={"left"} className={styles.description} ellipsis={{
                                                rows: 2,
                                                expandable: false
                                            }} style={{
                                                marginBottom: 0,
                                                marginTop: 20,
                                                color: "rgb(20, 40, 80)",
                                            }}>{item.text}</Paragraph>

                                        </Card>
                                    </Flex>
                                </Col>
                            })
                        }
                    </Row>
                </Col>
            </Row>


        </Layout>
    );
}
export default Home;
