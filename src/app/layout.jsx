import 'antd/dist/reset.css';
import "./globals.css";
import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ReduxProvider from '@/contexts/ReduxProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ConfigProvider } from 'antd';
export default function RootLayout({ children }) {

    return (
        <html lang="en" translate="no">
            <body>
                <AntdRegistry>
                    <ConfigProvider theme={{
                        token: {
                            colorDark: "rgb(42, 114, 165)",
                            colorPrimary: 'rgb(42, 114, 165)',      // 主色
                            colorLink: '#ff4d4f',         // 链接色
                            colorPrimaryHover: '#ff7875', // 悬停色
                        }, components: {
                            Layout: {
                                headerBg: 'rgb(29, 86, 126)', // 直接修改 Header 背景色
                                headerColor: '#fff',  // 修改文字颜色（可选）
                                headerPadding: "0px 20px",
                                footerBg: 'rgb(29, 86, 126)', // 直接修改 Header 背景色
                            },
                            Collapse: {
                                headerPadding: "2px 10px"
                            },
                            Checkbox: {
                                colorPrimary: "rgb(212, 110, 64)",
                                colorPrimaryHover: "rgb(212, 110, 64, .8)",
                                colorBgContainer: "#fff",

                            },
                            Splitter: {
                                colorFill: "rgb(210, 235, 227)",
                                colorText: "rgb(42, 114, 165)",
                                controlItemBgHover: "rgb(210, 235, 227)"
                            },
                            Input: {
                                hoverBorderColor: "rgb(212, 110, 64)"
                            },
                            Button: {
                                colorBgContainer: "rgb(212, 110, 64)",
                                colorBgSolidHover: "rgb(212, 110, 64)",
                                defaultColor: "#fff",
                                defaultHoverColor: "#fff"
                            },
                            Divider: {
                                margin: 10,
                                marginLG: 10
                            },
                            Popover: {
                            colorBgElevated: "rgba(210, 235, 227)",
                            colorText: "#000"
                            },
                            Segmented: {
                                // trackBg: "#fff",
                                // trackPadding: 4,
                                // itemColor: "rgb(29, 86, 126)",
                                // itemSelectedBg: "rgb(29, 86, 126)",
                                // itemSelectedColor: "#fff",
                                // controlHeight: 40,
                                // itemActiveBg: "rgb(29, 86, 126)",
                                // itemHoverColor: "#fff",
                                // itemHoverBg: "rgb(42, 114, 165)",
                                trackBg: "#fff",
                                trackPadding: 2,
                                itemColor: "#000",
                                itemSelectedBg: "rgb(210, 235, 227)",
                                itemSelectedColor: "#000",
                                controlHeight: 35,
                                itemActiveBg: "#fff",
                                itemHoverColor: "#000",
                                itemHoverBg: "#fff"
                            }
                        },
                    }}>
                        <LanguageProvider lng={"en"}>
                            <ReduxProvider>
                                {children}
                            </ReduxProvider>
                        </LanguageProvider>
                    </ConfigProvider>
                </AntdRegistry>

            </body>
        </html>
    );
}
