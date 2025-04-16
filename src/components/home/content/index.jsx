"use client";
import React, {useState} from 'react';
import {Layout, Flex, Typography, Input, Card, Carousel, Button} from 'antd';
import {Col, Row} from 'antd';
import Image from 'next/image';
import * as echarts from "echarts";
import ReactECharts from 'echarts-for-react';
import {useTranslation} from "react-i18next";
import {useRouter, usePathname} from 'next/navigation';
import CountUp from 'react-countup';

const {Content} = Layout;
const {Title, Paragraph} = Typography;
import styles from "./style.module.scss";

const {Search} = Input;
const HomeContent = () => {
    const {t} = useTranslation();
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");
    const dataStaticList = [{
        icon: "/images/total-patients.svg",
        title: 12345,
        text: t("home:totalPatients")
    }, {
        icon: "/images/samples-analyzed.svg",
        title: 12345,
        text: t("home:samplesAnalyzed")
    }, {
        icon: "/images/identified-mutations.svg",
        title: 12345,
        text: t("home:identifiedMutations")
    }, {
        icon: "/images/published-papers.svg",
        title: 12345,
        text: t("home:publishedPapers")
    }];
    const researchOverviewList = [{
        icon: "/images/advanced-analysis.svg",
        title: t("home:researchOverview.list.advancedAnalysis.title"),
        text: t("home:researchOverview.list.advancedAnalysis.description")
    }, {
        icon: "/images/data-integration.svg",
        title: t("home:researchOverview.list.dataIntegration.title"),
        text: t("home:researchOverview.list.dataIntegration.description"),
    }, {
        icon: "/images/mutation-mapping.svg",
        title: t("home:researchOverview.list.mutationMapping.title"),
        text: t("home:researchOverview.list.mutationMapping.description"),
    }]
    const distributionList = [{
        type: "column",
        option: {
            grid: {
                top: '10%',
                bottom: '10%',
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                axisLine: {
                    show: false,
                },
                axisTick: {show: false},
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#f0f0f0',
                        width: 1,
                        type: 'solid'
                    }
                },
                type: 'category',
                data: ['TP53', 'CTNNB1', 'APOB', 'ARID1A', 'ALB', 'OTHERS']
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    lineStyle: {
                        color: '#f0f0f0'
                    }
                },
            },
            itemStyle: {
                borderRadius: 6,
                borderColor: '#fff',
                borderWidth: 2,
                color: "rgb(59, 130, 246)"
            },
            series: [
                {

                    data: [200, 160, 140, 100, 90, 50],
                    type: 'bar',
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {offset: 0, color: 'rgb(235, 242, 255)'},
                        {offset: 0.5, color: 'rgb(96, 165, 250)'},
                        {offset: 1, color: 'rgb(0, 136, 254)'}
                    ])
                }
            ]
        }

    }, {
        type: "pie",
        option: {
            tooltip: {
                trigger: 'axis'
            },
            label: {
                show: true,
                formatter: params => `${params.name}: ${params.percent.toFixed(0)}%`
            },
            series: [
                {
                    name: 'GENE',
                    type: 'pie',
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    data: [
                        {value: 200, name: 'TP53'},
                        {value: 160, name: 'CTNNB1'},
                        {value: 140, name: 'APOB'},
                        {value: 100, name: 'ARID1A'},
                        {value: 90, name: 'ALB'},
                        {value: 50, name: 'OTHERS'}
                    ]
                }
            ]
        }
    }]
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
    const onSearch = () => {
        router.push("/search?text=TP53");
    }
    return (
        <Content className={styles.hccContent}
                 style={{background: "linear-gradient(to top, rgb(235, 242, 255), #ffffff)"}}>
            <Row justify={"center"}>
                <Col xs={22} sm={22} md={22} lg={22}>
                    <Row justify="center">
                        <Col xs={24} sm={12} md={12} lg={12}>
                            <Search
                                // loading
                                className={styles.hccSearch}
                                placeholder={t("home:search.placeholder")}
                                enterButton
                                size="large"
                                onSearch={onSearch}
                            />
                        </Col>
                    </Row>

                    <Row justify="center" className={styles.dataStaticList}>
                        {
                            dataStaticList.map((item, index) => {
                                return <Col key={index} xs={12} sm={12} md={6} lg={6}>
                                    <Flex vertical align={"center"} className={styles.colFlex}>
                                        <Image src={item.icon} alt={"total-patients"} width={35}
                                               height={40}>
                                        </Image>
                                        <Title level={3}
                                               style={{
                                                   color: "rgb(20, 40, 80)",
                                                   marginTop: "15px"
                                               }}>
                                            <CountUp start={0} end={item.title} separator=","/>
                                        </Title>
                                        <Paragraph ellipsis={{
                                            rows: 1,
                                            expandable: false
                                        }} style={{marginBottom: 0, color: "rgb(20, 40, 80)"}}>
                                            {item.text}
                                        </Paragraph>
                                    </Flex>
                                </Col>
                            })
                        }
                    </Row>
                    <Title level={2} style={{color: "rgb(20, 40, 80)", textAlign: "center", marginTop: "50px"}}>
                        {t("home:researchOverview.title")}
                    </Title>
                    <Row justify="center" className={styles.researchOverviewList}>
                        {
                            researchOverviewList.map((item, index) => {
                                return <Col key={index} xs={24} sm={24} md={8} lg={8}>
                                    <Flex vertical align={"center"} className={styles.colFlex}>
                                        <Image src={item.icon} alt={"total-patients"} width={45}
                                               height={40}>
                                        </Image>
                                        <Title level={4}
                                               style={{
                                                   color: "rgb(20, 40, 80)",
                                                   marginTop: "15px"
                                               }}>{item.title}</Title>
                                        <Paragraph ellipsis={{
                                            rows: 2,
                                            expandable: true
                                        }} style={{
                                            textAlign: "center",
                                            marginBottom: 0,
                                            color: "rgb(20, 40, 80)"
                                        }}>{item.text}</Paragraph>
                                    </Flex>
                                </Col>
                            })
                        }
                    </Row>
                    <Title level={2} style={{color: "rgb(20, 40, 80)", textAlign: "center", marginTop: "50px"}}>
                        {t("home:commonGeneMutationsDistribution.title")}
                    </Title>
                    <Row justify="center" className={styles.distributionList}>
                        {
                            distributionList.map((item, index) => {
                                return <Col key={index} xs={24} sm={24} md={12} lg={12}>
                                    <Flex vertical align={"center"} className={styles.colFlex}>
                                        <ReactECharts option={item.option} style={{width: '100%'}}></ReactECharts>
                                    </Flex>
                                </Col>
                            })
                        }
                    </Row>
                    <Title level={2} style={{color: "rgb(20, 40, 80)", textAlign: "center", marginTop: "50px"}}>
                        {t("home:latestResearchHighlights.title")}
                    </Title>

                    <Carousel infinite={false}>
                        <Content> <Row justify="center" className={styles.researchHighlight}>
                            {
                                researchHighlight.map((item, index) => {
                                    return <Col key={index} xs={24} sm={24} md={8} lg={8}>
                                        <Flex vertical align={"center"} className={styles.colFlex}>
                                            <Card
                                                style={{width: '100%'}}
                                                cover={
                                                    <Image
                                                        alt="example"
                                                        src={item.image}
                                                        width={item.width}
                                                        height={item.height}
                                                    />
                                                }
                                            >
                                                <Title level={5}>
                                                    {item.title}
                                                </Title>
                                                <Paragraph className={styles.description} ellipsis={{
                                                    rows: 2,
                                                    expandable: false
                                                }} style={{
                                                    textAlign: "left",
                                                    marginBottom: 0,
                                                    color: "rgb(20, 40, 80)"
                                                }}>{item.text}</Paragraph>
                                                <Title level={5} ellipsis={{
                                                    rows: 1,
                                                    expandable: false
                                                }} style={{
                                                    textAlign: "left",
                                                    marginBottom: 0,
                                                    marginTop: 10,
                                                    color: "rgb(20, 40, 80)"
                                                }}>{t("common:learnMore")}</Title>
                                            </Card>
                                        </Flex>
                                    </Col>
                                })
                            }
                        </Row></Content>
                    </Carousel>
                </Col>
            </Row>
        </Content>
    );
}
export default HomeContent;
