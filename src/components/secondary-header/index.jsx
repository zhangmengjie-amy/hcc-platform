"use client";
import React from 'react';
import i18n from 'i18next';
import { Layout, Affix, Menu, Flex, Typography, Tab } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from "./style.module.scss";
import { useTranslation } from 'react-i18next';
import Language from "@/components/lng";


const HCCSecondaryHeader = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const items = [
        {
            label: <Link href="/home">{t('home:header.home')}</Link>,
            key: '/home',
            icon: <Image
                src="/images/home.svg"
                alt="home"
                width={16}
                height={16} />,
        },
        {
            label: <Link href="/single-modal/mutation">{t('home:header.mutation')}</Link>,
            key: '/single-modal/mutation',
            icon: <Image
                src="/images/mutation.svg"
                alt="mutation"
                width={14}
                height={14} />,
        },
        {
            label: <Link href="/single-modal/expression">{t('home:header.expression')}</Link>,
            icon: <Image
                src="/images/expression.svg"
                alt="expression"
                width={14}
                height={14} />,
            key: '/single-modal/expression',

        },
        {
            label: <Link href="/single-modal/immune">{t('home:header.immune')}</Link>,
            key: '/single-modal/immune',
            icon: <Image
                src="/images/immune.svg"
                alt="immune"
                width={16}
                height={16} />,
        },
        {
            label: <Link href="/single-modal/clinical">{t('home:header.clinical')}</Link>,
            key: '/single-modal/clinical',
            icon: <Image
                src="/images/clinical.svg"
                alt="clinical"
                width={16}
                height={16} />,
        },
         {
            label: <Link href="/help">{t('home:header.help')}</Link>,
            key: '/help',
             icon: <Image
                src="/images/help.svg"
                alt="help"
                width={16}
                height={16} />,
        },
        {
            label: <Link href="/about">{t('home:header.about')}</Link>,
            key: '/about',
             icon: <Image
                src="/images/about.svg"
                alt="about"
                width={16}
                height={16} />,
        },
    ];

    return (
        <Layout.Header className={styles.hccHeader}>
            <Flex align={"center"}>
                <Typography.Title level={2} style={{ marginBottom: 0, color: "#fff" }}>HCC</Typography.Title>
                <Menu className={styles.hccMenu} mode="horizontal"
                    triggerSubMenuAction={"click"}
                    items={items}
                    theme={"dark"}
                    defaultSelectedKeys={"/single-modal/mutation"}
                    selectedKeys={pathname == "/single-modal" ? "/single-modal/mutation" : pathname}
                    style={{
                        marginLeft: "20px",
                        backgroundColor: "transparent",
                        flex: 1,
                        minWidth: 0
                    }}
                />
                <Language></Language>
            </Flex>
        </Layout.Header>
    );
}
export default HCCSecondaryHeader;
