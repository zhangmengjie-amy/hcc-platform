"use client";
import React from 'react';
import {Row, Col} from 'antd';
import {useSearchParams} from 'next/navigation';
import {Layout, Flex, Typography, Input, Card, Carousel} from 'antd';
import styles from "./style.module.scss"
import Image from "next/image";

const {Title, Paragraph} = Typography;
const Search = ({searchText = "TP53"}) => {
    return (
        <Row justify={"center"} className={styles.searchContent}>
            <Col xs={22} md={22} lg={22}>
                <Col xs={24} md={24} lg={24} className={styles.searchCard}>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Image src={"/images/identified-mutations.svg"}
                               alt={"gene"} width={35}
                               height={40}>
                        </Image>
                        <Title level={3} style={{marginBottom: 0, marginLeft: "10px"}}>{searchText}</Title>
                    </div>
                </Col>
                <Row justify={"center"} align={"center"}>
                    <Col xs={24} md={24} lg={24} className={styles.chart} >
                        <Flex className={styles.colFlex}>chart</Flex>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}
export default Search;
