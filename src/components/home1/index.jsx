"use client";
import React from "react";
import { Layout, FloatButton } from "antd";
import HomeContent from "@/components/modules/home/content";
import HomeBanner from "@/components/modules/home/banner";

const Home = () => {

  return (
    <Layout style={{ backgroundColor: "#fff" }}>
      <HomeBanner></HomeBanner>
      <HomeContent></HomeContent>
    </Layout>
  );
};
export default Home;
