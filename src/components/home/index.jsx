"use client";
import React from 'react';
import {Layout} from 'antd';
import HomeContent from "@/components/home/content";
import HomeBanner from "@/components/home/banner";

const Home = () => {
    return (
        <Layout style={{backgroundColor: "#fff"}}>
            <HomeBanner></HomeBanner>
            <HomeContent></HomeContent>
        </Layout>
    );
}
export default Home;
