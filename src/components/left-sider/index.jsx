"use client";
import React, {useState} from 'react';
import {Menu, Typography, Layout} from 'antd';
import styles from "./style.module.scss"
import {usePathname} from 'next/navigation';

const {Sider} = Layout;
const LeftSide = ({items}) => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className={styles.leftSide}>
            <Sider collapsible trigger={null} collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
                <div className="demo-logo-vertical" />
                <Menu className={styles.hccMenu} theme="light" selectedKeys={pathname} mode="inline" items={items} />
            </Sider>

        </div>

    );
}
export default LeftSide;
