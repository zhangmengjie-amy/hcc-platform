"use client";
import React from 'react';
import {AntdRegistry} from '@ant-design/nextjs-registry';
import {LanguageProvider} from '@/contexts/LanguageContext';
import HCCFooter from "@/components/footer";
import HCCHeader from "@/components/header";
import {Affix} from 'antd';
import "./globals.css";

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body>
        <LanguageProvider>
            <AntdRegistry>
                <Affix offsetTop={1}>
                    <HCCHeader></HCCHeader>
                </Affix>
                {children}
                <HCCFooter></HCCFooter>
            </AntdRegistry>
        </LanguageProvider>
        </body>
        </html>
    );
}
