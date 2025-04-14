"use client";
import React from 'react';
import {Flex, Typography} from 'antd';
import Image from 'next/image';
const {Title, Paragraph} = Typography;
import styles from "./style.module.scss";
import {useTranslation} from "react-i18next";
const HomeBanner = () => {

    const {t} = useTranslation();
    return (
        <div className={styles.banner}>
            <Flex align={"center"} className={styles.bannerImage}>
                <Image
                    src={"/images/home-banner.png"}
                    alt={"banner"}
                    width={1024}
                    height={1024}>
                </Image>
            </Flex>
            <div className={styles.bannerText}>
                <Title ellipsis level={1}
                       style={{
                           fontSize: "48px",
                           marginBottom: 0,
                           color: "rgb(20, 40, 80)"
                       }}>
                    {t("home:banner.title")}
                </Title>
                <Paragraph ellipsis={{
                    rows: 1,
                    expandable: true  // 可选，显示"展开"按钮
                }} style={{fontSize: "18px", marginTop: 50, color: "rgb(20, 40, 80)"}}>
                    {t("home:banner.subTitle")}
                </Paragraph>
                <Paragraph ellipsis={{
                    rows: 2,
                    expandable: true  // 可选，显示"展开"按钮
                }} style={{marginTop: 20, color: "rgb(20, 40, 80)"}}> {t("home:banner.description")}</Paragraph>
            </div>
        </div>
    );
}
export default HomeBanner;
