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
                            colorPrimary: 'rgb(10, 186, 181)',
                            colorLink: 'rgb(10, 186, 181)',
                        }, components: {
                            Layout: {
                                headerPadding: "0 50px",
                                headerHeight: 40,
                                headerBg: 'linear-gradient(to right, rgb(239, 207, 210),   rgb(129, 216, 208) 50%,rgb(10, 186, 181))', // 直接修改 Header 背景色
                                 // 直接修改 Header 背景色 // 浅蓝绿 'rgb(129, 216, 208)' // 香槟金 #E0BFB8 // #F5F5F5浅灰 // #E0F7FA薄荷绿 // 蓝绿色 #008B8B
                            },
                            Menu: {
                                itemBg: "transparent",
                                itemColor: "#fff",
                                activeBarHeight: "4px",
                                itemHoverBg: "rgb(237, 108, 116)",
                                itemSelectedBg: "rgb(237, 108, 116)",
                                itemSelectedColor: "#fff",
                                itemHoverColor: "#fff",
                                itemActiveBg: "rgb(237, 108, 116)",
                                popupBg: "rgb(239, 207, 210)"
                            },
                            Collapse: {
                                headerPadding: "0px 10px",
                                headerBg: "rgb(10, 186, 181)"
                            },
                            Checkbox: {
                                colorPrimary: "rgb(237, 108, 116)",
                                colorPrimaryHover: "rgb(239, 207, 210)",
                                colorBgContainer: "#fff",
                            },
                            Splitter: {
                                colorFill: "#d9d9d9",
                                controlItemBgHover: "#d9d9d9",
                                controlItemBgActive: "#d9d9d9",
                                controlItemBgActiveHover: "#d9d9d9"
                            },
                            Input: {
                                hoverBorderColor: "rgb(10, 186, 181)",
                            },
                            Button: {
                                colorBgContainer: "rgb(237, 108, 116)",
                                colorBgSolidHover: "rgb(237, 108, 116)",
                                colorText: "#fff",
                                defaultHoverColor: "#fff",
                                defaultActiveColor: "#fff",
                                defaultHoverBorderColor: "rgb(237, 108, 116)",
                                defaultActiveBorderColor: "rgb(237, 108, 116)",
                            },
                            Divider: {
                                margin: 10,
                                marginLG: 10
                            },
                            Popover: {
                            colorBgElevated: "#F5F5F5",
                            colorText: "#000"
                            },
                            Segmented: {
                                trackPadding: 0,
                                trackBg: "rgb(239, 207, 210)",
                                itemColor: "rgb(182, 55, 106)",
                                itemSelectedBg: "rgb(237, 108, 116)",
                                itemSelectedColor: "#fff",
                                itemActiveBg: "rgb(239, 207, 210)",
                                itemHoverColor: "rgb(182, 55, 106)",
                                itemHoverBg: "rgb(239, 207, 210)"
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
