"use client";
import React from 'react';
import i18n from 'i18next';
import {Layout, Affix, Menu, Flex, Typography} from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter, usePathname} from 'next/navigation';
import styles from "./style.module.scss";
import {useTranslation} from 'react-i18next';
import Language from "@/components/lng"


const HCCHeader = () => {
    const {t} = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const items = [
        {
            label: <Link href="/home">{t('home:header.home')}</Link>,
            key: '/home',
            icon: <Image
                src="/images/home.svg"
                alt="home"
                width={15}
                height={15}/>,
        },
        {
            label: <Link href="/mutation">{t('home:header.mutation')}</Link>,
            key: '/mutation',
            icon: <Image
                src="/images/mutation.svg"
                alt="mutation"
                width={15}
                height={15}/>,
        },
        {
            label: <Link href="/expression">{t('home:header.expression')}</Link>,
            icon: <Image
                src="/images/expression.svg"
                alt="expression"
                width={15}
                height={15}/>,
            key: '/expression',

        },
        {
            label: <Link href="/immune">{t('home:header.immune')}</Link>,
            key: '/immune',
            icon: <Image
                src="/images/immune.svg"
                alt="immune"
                width={15}
                height={15}/>,
        },
        {
            label: <Link href="/clinical">{t('home:header.clinical')}</Link>,
            key: '/clinical',
            icon: <Image
                src="/images/clinical.svg"
                alt="clinical"
                width={18}
                height={18}/>,
        },
    ];

    return (
        <Affix offsetTop={1}>
            <Layout.Header className={styles.hccHeader} style={{backgroundColor: "rgb(20, 40, 80)"}}>
                <Flex align={"center"}>
                    <Typography.Title level={2} style={{marginBottom: 0, color: "#fff"}}>HCC</Typography.Title>
                    <Menu className={styles.hccMenu} mode="horizontal"
                          triggerSubMenuAction={"click"}
                          items={items}
                          theme={"dark"}
                          defaultSelectedKeys={"/home"}
                          selectedKeys={pathname == "/" ? "/home" : pathname}
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
        </Affix>

    );
}
export default HCCHeader;
