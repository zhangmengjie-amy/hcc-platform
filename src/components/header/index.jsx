"use client";
import React, { useMemo } from "react";
import { Layout, Menu, Flex, Typography, Button, Tag, Dropdown, Avatar, message } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./style.module.scss";
import { useTranslation } from "react-i18next";
import Language from "@/components/lng";
import { useAuth } from "@/contexts/AuthContext"; // 导入认证上下文
import { LogoutOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";

const HCCHeader = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth(); // 使用认证上下文

  // 处理退出登录
  const handleLogout = () => {
    logout();
    message.success("已退出登录");
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人资料",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "设置",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      label: <Link href="/home">{t("home:header.home")}</Link>,
      key: "/home",
    },
    {
      label: t("home:header.single-modal"),
      key: "/single-modal",
      children: [
        { 
          key: "/mutation", 
          label: <Link href="/mutation">{t("home:header.mutation")}</Link>, 
        },
        { 
          key: "/expression/subtype", 
          label: <Link href="/expression/subtype">{t("home:header.expression")}</Link>, 
        },
        { 
          key: "/immune", 
          label: <Link href="/immune">{t("home:header.immune")}</Link>, 
        },
        { 
          key: "/clinical", 
          label: <Link href="/clinical">{t("home:header.clinical")}</Link>, 
        },
      ],
    },
    {
      label: <Link href="/biomarkers">{t("home:header.biomarkers")}</Link>,
      key: "/biomarkers",
    },
    {
      label: <Link href="/help">{t("home:header.help")}</Link>,
      key: "/help",
    },
    {
      label: <Link href="/about">{t("home:header.about")}</Link>,
      key: "/about",
    },
  ];

  const selectedKeys = useMemo(() => {
    if (pathname === "/") return "/home";
    if (pathname?.startsWith("/expression")) return "/single-modal";
    return pathname;
  }, [pathname]);

  return (
    <Layout.Header className={styles.hccHeader}>
      <Flex align="center">
        <Typography.Title level={2} style={{ marginBottom: 0, color: "rgb(10, 186, 181)" }}>
          HCC
        </Typography.Title>
        
        <Menu 
          className={styles.hccMenu} 
          mode="horizontal"
          triggerSubMenuAction="hover"
          items={menuItems}
          selectedKeys={[selectedKeys]}
          style={{ flex: 1, justifyContent: "center" }}
        />
        
        <Tag color="orange">Internal beta</Tag>
        <Language />
        
        {/* 根据登录状态显示不同的按钮 */}
        {isAuthenticated ? (
          <Flex align="center" gap={8}>
            {/* 方案A：简单显示退出按钮 */}
            <Button onClick={handleLogout}>
              退出登录
            </Button>
          </Flex>
        ) : (
          <Button>
            <Link href="/login">登录</Link>
          </Button>
        )}
      </Flex>
    </Layout.Header>
  );
};

export default HCCHeader;