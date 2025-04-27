import 'antd/dist/reset.css';
import React from 'react';
import {AntdRegistry} from '@ant-design/nextjs-registry';
import {LanguageProvider} from '@/contexts/LanguageContext';
import HCCFooter from "@/components/footer";
import HCCHeader from "@/components/header";
import {cookies} from 'next/headers';
import "./globals.css";

export default function RootLayout({children}) {
    const serverCookie = cookies().get('i18next')?.value;
    return (
        <html>
        <body>
        <LanguageProvider lng={serverCookie}>
            <AntdRegistry>
                <HCCHeader></HCCHeader>
                {children}
                <HCCFooter></HCCFooter>
            </AntdRegistry>
        </LanguageProvider>
        </body>
        </html>
    );
}
