"use client";
import React from 'react';
import i18n from 'i18next';
import { Layout, Affix, Menu, Flex, Typography, Button } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from "./style.module.scss";
import { useTranslation } from 'react-i18next';
import Language from "@/components/lng"


const HCCHeader = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const items = [
        {
            label: <Link href="/home">{t('home:header.home')}</Link>,
            key: '/home',
            //  icon: <Image
            //     src="/images/home.svg"
            //     alt="home"
            //     width={16}
            //     height={16} />,
        },
        {
            label: t('home:header.single-modal'),
            key: '/single-modal',
            children: [
                { key: '/mutation', label: <Link href="/mutation">{t('home:header.mutation')}</Link> },
                { key: '/expression', label: <Link href="/expression">{t('home:header.expression')}</Link> },
                { key: '/immune', label: <Link href="/immune">{t('home:header.immune')}</Link> },
                { key: '/clinical', label: <Link href="/clinical">{t('home:header.clinical')}</Link> },
            ],
            //  icon: <Image
            //     src="/images/single-modal.svg"
            //     alt="single-modal"
            //     width={16}
            //     height={16} />,
        },
        {
            label: <Link href="/multi-modal">{t('home:header.multi-modal')}</Link>,
            key: '/multi-modal',
            //  icon: <Image
            //     src="/images/multi-modal.svg"
            //     alt="multi-modal"
            //     width={16}
            //     height={16} />,
        },
        {
            label: <Link href="/help">{t('home:header.help')}</Link>,
            key: '/help',
            //  icon: <Image
            //     src="/images/help.svg"
            //     alt="help"
            //     width={16}
            //     height={16} />,
        },
        {
            label: <Link href="/about">{t('home:header.about')}</Link>,
            key: '/about',
            //  icon: <Image
            //     src="/images/about.svg"
            //     alt="about"
            //     width={18}
            //     height={18} />,
        },
    ];

    return (
        <Layout.Header className={styles.hccHeader}>
            <Flex align={"center"}>
                <Typography.Title level={2} style={{ marginBottom: 0, color: "rgb(10, 186, 181)" }}>HCC</Typography.Title>
                <Menu className={styles.hccMenu} mode="horizontal"
                    triggerSubMenuAction={"hover"}
                    items={items}
                    defaultSelectedKeys={"/home"}
                    selectedKeys={pathname == "/" ? "/home" : pathname}
                    style={{
                        flex: 1,
                        justifyContent: "center"
                    }}
                />
                <Language></Language>
                <Button><Link href={"/login"}>登录</Link></Button>
                <></>
            </Flex>
        </Layout.Header>
    );
}
export default HCCHeader;
