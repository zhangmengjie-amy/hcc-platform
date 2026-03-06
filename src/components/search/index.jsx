/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

"use client";
import React, { useState } from "react";
import { Row, Col } from "antd";
import { useSearchParams } from "next/navigation";
import GeneLollipop from "@/components/gene-lollipop";
import { Layout, Flex, Typography, Input, Button, Carousel } from "antd";
import styles from "./style.module.scss";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";

const { Title, Paragraph } = Typography;
const Search = () => {

  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") ?? "") ;
  const router = useRouter();
  const { t } = useTranslation();
  const handleAdvanceSearch = () => {
    router.push(`/search/advanced`);
  };

  return (
    <Row justify={"center"} className={styles.searchContent}>
      <Col xs={23} md={23} lg={23}>
        <Col xs={24} md={24} lg={24} className={styles.searchCard}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Image src={"/images/identified-mutations.svg"}
              alt={"gene"} width={35}
              height={40}>
            </Image>
            <Title level={3} style={{ marginBottom: 0, marginLeft: "10px" }}>{searchQuery}</Title>
          </div>
          <Flex align="center" justify="space-between" style={{ marginTop: "20px", width: "50%" }}>
            <Input.Search
              // loading
              className={styles.hccSearch}
              placeholder={t("home:search.placeholder")}
              enterButton
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              size="large"
              //    onSearch={onSearch}
            />
            <Button size="large" onClick={handleAdvanceSearch} style={{ marginLeft: "10px", lineHeight: "40px", borderColor: "rgb(10, 186, 181)", backgroundColor: "rgb(10, 186, 181)" }}>Advanced Search</Button>
          </Flex>
        </Col>

        <Row justify={"center"} align={"center"}>
          <Col xs={24} md={24} lg={24} className={styles.chart} >
            <Flex vertical className={styles.colFlex}>
              {
                searchQuery.split(",").map((gene, index) => (
                  <GeneLollipop gene={gene} key={index}></GeneLollipop>
                ))
              }
            </Flex>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
export default Search;
