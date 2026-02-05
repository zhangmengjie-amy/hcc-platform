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
