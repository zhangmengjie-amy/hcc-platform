/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
"use client";
import React from "react";
import { Layout } from "antd";
import HomeContent from "./content";
import HomeBanner from "./banner";

const Home = () => {

  return (
    <Layout style={{ backgroundColor: "#fff" }}>
      <HomeBanner></HomeBanner>
      <HomeContent></HomeContent>
    </Layout>
  );
};
export default Home;
