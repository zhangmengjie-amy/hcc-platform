"use client";
import React, { useMemo } from "react";
import {
  Layout,
  Menu,
  Flex,
  Typography,
  Button,
  Tag,
  Dropdown,
  Avatar,
  message,
  Affix,
} from "antd";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./style.module.scss";
import { useTranslation } from "react-i18next";
import Language from "@/components/common/lng";
import { useAuth } from "@/contexts/AuthContext"; // 导入认证上下文
import {
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  DownOutlined,
} from "@ant-design/icons";

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
      label: t("home:header.multi-modal"),
      key: "/single-modal",
      children: [
        {
          key: "/mutation",
          label: <Link href="/mutation">{t("home:header.mutation")}</Link>,
        },
        {
          key: "/transcriptome",
          label: (
            <Link href="/transcriptome">
              {t("home:header.transcriptome")}
            </Link>
          ),
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
    <Affix>
      <Layout.Header className={styles.hccHeader}>
        <Image src="/images/logo.png" alt="Logo" width={100} height={30}>
        </Image>
        <Menu
          theme="dark"
          className={styles.hccMenu}
          mode="horizontal"
          triggerSubMenuAction="hover"
          items={menuItems}
          selectedKeys={[selectedKeys]}
          style={{ flex: 1, minWidth: 0 }}
        />

        {/* <Tag color="orange">Internal beta</Tag> */}
        <Language />

        {/* 根据登录状态显示不同的内容 */}
        {isAuthenticated ? (
          <></>
          // <Flex align="center" gap={8}>
          //   {/* 显示用户名下拉菜单 */}
          //   <Dropdown
          //     menu={{
          //       items: userMenuItems,
          //     }}
          //     placement="bottomRight"
          //   >
          //     <Flex
          //       align="center"
          //       gap={4}
          //       style={{
          //         cursor: "pointer",
          //         borderRadius: 6,
          //         transition: "all 0.3s",
          //         ":hover": {
          //           backgroundColor: "rgba(0, 0, 0, 0.04)",
          //         },
          //       }}
          //     >
          //       {/* 显示用户头像 */}
          //       <Avatar
          //         size="small"
          //         icon={<UserOutlined />}
          //         style={{
          //           backgroundColor: "#1890ff",
          //           fontSize: 12,
          //         }}
          //       />
          //       {/* 显示用户名，优先显示 realName，其次是 username，最后是 email */}
          //       <span
          //         style={{
          //           fontSize: 14,
          //           fontWeight: 500,
          //           color: "#262626",
          //         }}
          //       >
          //         {user.username ?? "用户"}
          //       </span>
          //       <DownOutlined style={{ fontSize: 12, color: "#8c8c8c" }} />
          //     </Flex>
          //   </Dropdown>
          // </Flex>
        ) : (
          // <Button type="primary">
          //   <Link href="/login">登录/注册</Link>
          // </Button>
          <></>
        )}
      </Layout.Header>
    </Affix>
  );
};

export default HCCHeader;
