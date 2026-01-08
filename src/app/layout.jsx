import "antd/dist/reset.css";
import "./globals.css";
import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import ReduxProvider from "@/contexts/ReduxProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConfigProvider } from "antd";
export default function RootLayout({ children }) {
  return (
    <html lang="en" translate="no">
      <body>
        <AuthProvider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#476EAE",
                  colorLink: "#476EAE",
                },
                components: {
                  Layout: {
                    headerPadding: "0 20px",
                    headerHeight: 50,
                    fontSize: 22,
                    headerBg: "#476EAE", // 直接修改 Header 背景色
                    // 直接修改 Header 背景色 // 浅蓝绿 'rgb(129, 216, 208)' // 香槟金 #E0BFB8 // #F5F5F5浅灰 // #E0F7FA薄荷绿 // 蓝绿色 #008B8B
                    footerBg: "#476EAE",
                  },
                  Menu: {
                    darkItemBg: "#476EAE",
                    itemColor: "#fff",
                    fontSize: 20,
                    itemPaddingInline: 20,
                    activeBarHeight: "4px",
                    itemHoverBg: "#476EAE",
                    itemSelectedBg: "#476EAE",
                    itemSelectedColor: "#fff",
                    itemHoverColor: "#fff",
                    itemColor: "#fff",
                    itemActiveBg: "#476EAE",
                    darkPopupBg: "#476EAE",
                  },
                  Collapse: {
                    headerPadding: "0px 10px",
                    headerBg: "#476EAE",
                  },
                  Checkbox: {
                    colorPrimary: "#E53935",
                    colorPrimaryHover: "rgba(229, 57, 53, .3)",
                    colorBgContainer: "#fff",
                  },
                  Splitter: {
                    colorFill: "#d9d9d9",
                    controlItemBgHover: "#d9d9d9",
                    controlItemBgActive: "#d9d9d9",
                    controlItemBgActiveHover: "#d9d9d9",
                  },
                  Input: {
                    hoverBorderColor: "#476EAE",
                  },
                  Tooltip: {
                    colorBg: "#476EAE",
                    
                  },
                  Button: {
                    colorPrimary: "#E53935", // 主按钮背景色
                    colorPrimaryHover: "#D32F2F", // 主按钮悬停背景色（建议比默认深一点）
                    colorPrimaryActive: "#C62828", // 主按钮激活背景色

                    // 文字颜色（通常是白色）
                    colorTextLightSolid: "#fff",

                    // 默认按钮（default 类型）
                    defaultBg: "#fff", // 默认按钮背景
                    defaultColor: "#E53935", // 默认按钮文字颜色
                    defaultBorderColor: "#E53935", // 默认按钮边框颜色

                    // 悬停和激活状态
                    defaultHoverColor: "#D32F2F", // 默认按钮悬停文字颜色
                    defaultHoverBorderColor: "#D32F2F", // 默认按钮悬停边框颜色
                    defaultActiveColor: "#C62828", // 默认按钮激活文字颜色
                    defaultActiveBorderColor: "#C62828",
                    fontSizeLG: 18,
                    lineWidth: 1, // 边框宽度
                  },
                  Divider: {
                    margin: 10,
                    marginLG: 10,
                  },
                  Slider: {
                    trackBg: "#476EAE",
                  },
                  Popover: {
                    colorBgElevated: "#fff",
                    colorText: "#000",
                  },
                  Segmented: {
                    fontSize: 16,
                    trackPadding: 3,
                    trackBg: "#476EAE",
                    itemColor: "#fff",
                    itemHoverColor: "#000",
                    itemSelectedColor: "#000",
                  },
                },
              }}
            >
              <LanguageProvider lng={"en"}>
                <ReduxProvider>{children}</ReduxProvider>
              </LanguageProvider>
            </ConfigProvider>
          </AntdRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
