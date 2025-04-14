"use client";
import React from 'react';
import i18n from 'i18next';
import {Layout, Menu, Flex, Typography} from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter, usePathname} from 'next/navigation';
import styles from "./style.module.scss";
import {useLanguage} from '@/contexts/LanguageContext'
import {useTranslation} from 'react-i18next';
import {getCookies, setCookie} from 'cookies-next';

const {Header} = Layout;
const {Title} = Typography;


const HCCHeader = () => {
    const {t} = useTranslation();
    const {language, setLanguage} = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const handleLanguage = () => {
        const newLanguage = language === "zh" ? "en" : "zh";
        setLanguage(newLanguage);
    }

    const showLanguage = () => {
        return i18n?.language === "zh" ? "中" : "en"
    }
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
            label: <Link href="/mutation/driver-landscape">{t('home:header.mutation')}</Link>,
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
    const getPathName = () => {
        if (pathname.split('/')[1] === "mutation") {
            return "/mutation"
        }
        if (pathname === "/") {
            return "/home"
        }
        return pathname
    }

    return (
        <Header className={styles.hccHeader} style={{backgroundColor: "rgb(20, 40, 80)"}}>
            <Flex align={"center"}>
                <Title level={2} style={{marginBottom: 0, color: "#fff"}}>HCC</Title>
                <Menu className={styles.hccMenu} mode="horizontal"
                      triggerSubMenuAction={"click"}
                      items={items}
                      theme={"dark"}
                      defaultSelectedKeys={"/home"}
                      selectedKeys={getPathName()}
                      style={{
                          marginLeft: "20px",
                          backgroundColor: "transparent",
                          flex: 1,
                          minWidth: 0
                      }}
                />
                <span style={{marginBottom: 0, color: "#fff"}}>{showLanguage()}</span>
                <Image
                    onClick={handleLanguage}
                    className={styles.globe}
                    src="/images/globe.svg"
                    alt="globe"
                    width={25}
                    height={25}
                />
            </Flex>
        </Header>
    );
}
export default HCCHeader;
