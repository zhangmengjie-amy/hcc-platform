"use client";
import React from 'react';
import {Row, Col} from 'antd';
import LeftSide from "@/components/leftSider";
import styles from "./style.module.scss";
import Link from 'next/link';
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
} from '@ant-design/icons';
import {useTranslation} from "react-i18next";

const Layout = ({children}) => {
    const {t} = useTranslation();
    const items = [{
        icon: <DesktopOutlined/>,
        label: <Link href="/mutation/driver-landscape">{t("mutation:menu.driverLandscape")}</Link>,
        key: "/mutation/driver-landscape",
    }, {
        icon: <FileOutlined/>,
        label: <Link href="/mutation/phylogenetic-relationship">{t("mutation:menu.phylogeneticRelationship")}</Link>,
        key: "/mutation/phylogenetic-relationship",
    }, {
        icon: <PieChartOutlined/>,
        label: <Link href="/mutation/evolutionary-trajectory">{t("mutation:menu.evolutionaryTrajectory")}</Link>,
        key: "/mutation/evolutionary-trajectory",
    }]
    return (
        <Row className={styles.HCCMutation}>
            <div style={{width: "240px"}}>
                <LeftSide title={"Mutation"} items={items}></LeftSide>
            </div>

            <div style={{width: "calc(100% - 240px)"}}>
                {children}
            </div>
        </Row>
    );
}
export default Layout;
