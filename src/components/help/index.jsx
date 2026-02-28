"use client";
import React, { useEffect } from "react";
import { Layout, Flex, Row, Col, Card, Button, Typography } from "antd";
import styles from "./style.module.scss";
import Image from "next/image";
import CountUp from "react-countup";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;
const Home = () => {
  const { t } = useTranslation();

  const dataStaticList = [
    {
      icon: "/images/total-patients.svg",
      title: <CountUp start={0} end={6068} separator="," />,
      key: "patient",
      textColor: "#2a5ca1",
      bgColor: "#e6f1ff",
      text: t("home:dataStaticList.totalPatients"),
    },
    {
      icon: "/images/samples-analyzed.svg",
      title: <CountUp start={0} end={8294} separator="," />,
      key: "sample",
      textColor: "#a3584c",
      bgColor: "#fae3e3",
      text: t("home:dataStaticList.samplesAnalyzed"),
    },
    {
      icon: "/images/identified-mutations.svg",
      title: <CountUp start={0} end={45} separator="," />,
      key: "cohorts",
      textColor: "#729863",
      bgColor: "#e8f7e2",
      text: t("home:dataStaticList.totalCohorts"),
    },
    {
      icon: "/images/published-papers.svg",
      title: t("home:dataStaticList.multiSectors"),
      key: "data-type",
      textColor: "#476eaa",
      bgColor: "#dee9f7",
      text: t("home:dataStaticList.dataType"),
    },
  ];

  const researchOverviewList = [
    {
      image: "/images/geospatial-analysis.svg",
      textColor: "rgb(204,91,126)",
      bgColor: "rgb(255, 235, 242)",
      title: t("home:researchOverview.list.geospatialAnalysis.title"),
      text: t("home:researchOverview.list.geospatialAnalysis.description"),
    },
    {
      image: "/images/data-integration.svg",
      textColor: "rgb(99,83,160)",
      bgColor: "rgb(236, 236, 255)",
      title: t("home:researchOverview.list.temporalAnalysis.title"),
      text: t("home:researchOverview.list.temporalAnalysis.description"),
    },
    {
      image: "/images/mutation-mapping.svg",
      textColor: "rgb(63,122,128)",
      bgColor: "rgb(226, 247, 252)",
      title: t("home:researchOverview.list.customAnalysis.title"),
      text: t("home:researchOverview.list.customAnalysis.description"),
    },
  ];

  const items = [
    {
      key: "mutation",
      path: "driver-landscape",
      title: t("home:models.driverLandscape.title"),
      textColor: "rgb(63,122,128)",
      bgColor: "rgb(226, 247, 252)",
      url: "/images/driver-landscape.png",
      description: t("home:models.driverLandscape.description"),
    },
    {
      key: "mutation",
      path: "timing-analysis",
      title: t("home:models.timingAnalysis.title"),
      textColor: "rgb(63,122,128)",
      bgColor: "rgb(226, 247, 252)",
      url: "/images/timing-analysis.png",
      description: t("home:models.timingAnalysis.description"),
    },
    {
      key: "transcriptome",
      path: "differential-expression-analysis",
      title: t("home:models.differentialExpressionAnalysis.title"),
      textColor: "#7b1fa2",
      bgColor: "#f3eafa",
      url: "/images/differential-expression-analysis.png",
      description: t("home:models.differentialExpressionAnalysis.description"),
    },
    {
      key: "transcriptome",
      path: "transcriptomic-heterogeneity",
      title: t("home:models.transcriptomicHeterogeneity.title"),
      textColor: "#7b1fa2",
      bgColor: "#f3eafa",
      url: "/images/transcriptomic-heterogeneity.png",
      description: t("home:models.transcriptomicHeterogeneity.description"),
    },
    {
      key: "immune",
      path: "microenvironment-deconvolution",
      title: t("home:models.microenvironmentDeconvolution.title"),
      textColor: "#2e7d32",
      bgColor: "#e8f7f0",
      url: "/images/microenvironment-deconvolution.png",
      description: t("home:models.microenvironmentDeconvolution.description"),
    },
    {
      key: "immune",
      path: "microenvironment-spatial-heterogeneity",
      title: t("home:models.microenvironmentSpatialHeterogeneity.title"),
      textColor: "#2e7d32",
      bgColor: "#e8f7f0",
      url: "/images/microenvironment-spatial-heterogeneity.png",
      description: t(
        "home:models.microenvironmentSpatialHeterogeneity.description",
      ),
    },
    {
      key: "biomarkers",
      path: "survival-analysis",
      title: t("home:models.survivalAnalysis.title"),
      textColor: "#c2185b",
      bgColor: "#fdeaea",
      url: "/images/survival-analysis.png",
      description: t("home:models.survivalAnalysis.description"),
    },
    {
      key: "biomarkers",
      path: "multi-modal-joint-analysis",
      title: t("home:models.multiModalJointAnalysis.title"),
      textColor: "#c2185b",
      bgColor: "#fdeaea",
      url: "/images/multi-modal-joint-analysis.png",
      description: t("home:models.multiModalJointAnalysis.description"),
    },
  ];

  return (
    <Layout style={{ background: "#fff" }} className={styles.helpContainer}>
      <Typography.Title
        align="center"
        style={{
          fontSize: "48px",
          color: "#476EAE",
          fontWeight: "bold",
        }}
      >
        User Manual
      </Typography.Title>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        Welcome to LIGOR database! This page will help to guide you through the
        website and help you through the analytical steps.
      </Typography.Paragraph>
      <Typography.Title
        style={{ fontSize: "30px", color: "#476EAE", fontWeight: "bold" }}
      >
        The introduction page
      </Typography.Title>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        At the introduction page, you are provided with two different options to
        explore the database. The first approach is through the dropdown menu in
        the header region of the website. For example, by clicking on buttons
        such as “Multi-modal,” “Biomarkers,” and their subsequent menu options,
        you can navigate through the different analytical modules of the
        database.
      </Typography.Paragraph>
      <div className={styles.imgContainer}>
        <img src={"/images/help-1.png"}></img>
      </div>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        The other, more direct option is to click on the individual research
        modules displayed under the banner area. For example, there are eight
        research modules, including “Driver Landscape,” “Timing Analysis,”
        “Differential Expression Analysis,” “Transcriptomic Heterogeneity,”
        “Microenvironmental Deconvolution,” “Microenvironmental Spatial
        Heterogeneity,” “Survival Analysis,” and “Multi-modal Joint Analysis.”
        These modules are color-coded according to four layers of omic
        information, ranging from genome and transcriptome to immune features
        and biomarkers. By clicking the “Explore” button within each module,
        users can directly access the corresponding section.
      </Typography.Paragraph>
      <div className={styles.imgContainer}>
        <img src={"/images/help-2.png"}></img>
      </div>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        Below the research module region, at the bottom of the introduction
        page, you can find statistics on the data hosted at LIGOR, as well as a
        summary of the core features of the website.
      </Typography.Paragraph>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        At the very bottom of the page, you can find a link to the GitHub
        repository associated with the website, along with an email address for
        contacting the developers.
      </Typography.Paragraph>
      <div className={styles.imgContainer}>
        <img src={"/images/help-3.png"}></img>
      </div>
      <Typography.Title
        style={{ fontSize: "30px", color: "#476EAE", fontWeight: "bold" }}
      >
        The genome layer
      </Typography.Title>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        In the genome layer, we designed three modules including driver
        landscape, phylogenetic relationship as well as timing analysis. We will
        walk you through all the modules in this section.
      </Typography.Paragraph>
      <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
        The Driver Landscape
      </Typography.Title>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        To explore the driver landscape of the HCC cohorts (i.e., the PLANet or
        Ditan cohort), the Driver Landscape module allows users to generate an
        oncoprint plot across all patients for a set of driver genes specified
        by the user. An oncoprint plot is an efficient way to display the
        mutation status of driver genes across samples and patients. On this
        page, users can select specific cohorts (e.g., the PLANet cohort, the
        Ditan cohort, or both) and choose driver genes based on the criteria
        shown on the left panel. By default, a list of 62 driver genes from Kaya
        et al. (PMID xxx) is pre-selected. However, users may select any gene of
        interest. At the bottom left of the page, users can further subset the
        patient cohort by filtering clinical variables such as patient age. On
        the right side of the page, the oncoprint plot displays the driver
        landscape of the selected patients. As multiple samples were collected
        from each patient, users can either sort samples individually (default
        setting) or group samples by patient (i.e., multiple samples from the
        same patient are plotted together).
      </Typography.Paragraph>
      <div className={styles.imgContainer}>
        <img src={"/images/help-4.png"}></img>
      </div>
      <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
        The phylogenetic tree
      </Typography.Title>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        Phylogenetic tree is an efficient way displaying the genetic
        relationship of different sectors. In this page, you will be able to
        sub-select patients based on the criterion shown on the left. The
        rainbow displays the overall distribution of intra-tumor heterogeneity
        (ITH) across all tumors. By sub-selecting the patient cohort (left) or
        click on the individual bars from the rainbow, we can navigate through
        the cohort or zoom in individual patient. If you want to look at
        individual phylogeny in detail, please click on the detail button on the
        top right.
      </Typography.Paragraph>
      <div className={styles.imgContainer}>
        <img src={"/images/help-5.png"}></img>
      </div>
      <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
        Timing analysis
      </Typography.Title>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        Driver mutations identified in a patient may arise at different stages
        of the tumor’s evolutionary history. Early driver events are typically
        present in all samples and are therefore mapped to the trunk of the
        phylogenetic tree. Mutations are assigned to branches of the phylogeny
        based on the principle of parsimony, enabling the inference of their
        relative timing. Users can click on the tree and hover over individual
        branches to view the corresponding protein-coding gene mutations. Users
        can browse across all patients to examine and compare the evolutionary
        timing of driver events.
      </Typography.Paragraph>
      <div className={styles.imgContainer}>
        <img src={"/images/help-6.png"}></img>
      </div>
      <Typography.Title
        style={{ fontSize: "30px", color: "#476EAE", fontWeight: "bold" }}
      >
        The transcriptome layer
      </Typography.Title>
      <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
        Transcriptomic heterogeneity
      </Typography.Title>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        One striking feature of HCC is its exceptionally high degree of
        transcriptomic heterogeneity. This module displays transcriptomic
        subtypes both within and between patients. For example, when selecting
        the PLANet cohort, a circos plot presents each patient as a stacked bar,
        with the outer ticks indicating the selected patients. The phylogenetic
        tree shown on the right includes five tip labels representing the
        transcriptomic subtypes of the samples. The final subtype corresponds to
        the transcriptomic classification reported in Chen et al. (PMID xx). The
        bottom-right panel illustrates the spatial locations of the sampled
        sectors. Users can navigate through different patients by clicking on
        different patients from the circos plot. If the Ditan cohort is
        selected, patient samples are displayed as vertical stacked bars rather
        than a circos plot. The final subtype corresponds to the transcriptomic
        classification described in Liu et al. (PMID xx). Similar to the genome
        layer, users can filter patients based on clinical information using the
        panel located at the bottom left.
      </Typography.Paragraph>
      <div className={styles.imgContainer}>
        <img src={"/images/help-7.png"}></img>
      </div>
      <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
        Differential expression analysis
      </Typography.Title>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        Leveraging a large collection of HCC cohorts with transcriptomic data,
        this module provides a powerful gateway for performing differential
        expression analysis across patients. First, users can filter and select
        any number of cohorts from the 45 available datasets. Subsequently, in
        the bottom-left panel, users can choose a grouping criterion—such as
        tumor stage, sample type (normal vs. tumor), or viral status—to divide
        the dataset into two groups (i.e., “First Group” and “Second Group”).
        This enables users to perform differentially expressed gene (DEG)
        analysis, along with the corresponding pathway enrichment analysis for
        each comparison. In addition, users may select from a list of curated
        gene sets or upload a user-defined gene set. The module will then
        automatically stratify samples into two groups based on the expression
        level of the selected gene set, allowing the same downstream DEG and
        enrichment analyses to be conducted.
      </Typography.Paragraph>
      <div className={styles.imgContainer}>
        <img src={"/images/help-8.png"}></img>
      </div>
      <Typography.Title
        style={{ fontSize: "30px", color: "#476EAE", fontWeight: "bold" }}
      >
        The microenvironment layer
      </Typography.Title>
      <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
        Microenvironment spatial heterogeneity
      </Typography.Title>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        Similar to the transcriptomic heterogeneity module, this module illustrates microenvironmental spatial heterogeneity in multi-regional cohorts. For example, when the PLANet cohort is selected, the microenvironmental subtypes of all samples are displayed for all patients in a circos plot format. The phylogenetic tree and sampling locations of the selected patient (indicated by a tick on the outer ring) are shown on the right and bottom panels, respectively. The microenvironmental subtypes are based on the TCGA pan-cancer tumor microenvironment (TME) classifier (PMID xx). Users can choose different patients by clicking on the circos plot. Similar to the transcriptomic heterogeneity module, the Ditan cohort is shown similarly. 
      </Typography.Paragraph>
      <div className={styles.imgContainer}>
        <img src={"/images/help-9.png"}></img>
      </div>
      <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
        Microenvironment deconvolution 
      </Typography.Title>
      <Typography.Paragraph style={{ fontSize: "20px" }}>
        The tumor microenvironment (TME) exhibits substantial heterogeneity in immune and stromal cell composition. By integrating seven widely used deconvolution methods—CIBERSORT, TIMER, xCell, MCPcounter, ESTIMATE, EPIC, and quanTIseq—this module allows users to select their cohort and method of interest. Based on the selected deconvolution output, patients are stratified into TME subtypes. For each subtype, marker genes and the activity levels of cancer hallmark pathways are provided. In addition, users can download the raw deconvolution results for customized downstream analyses and further subgrouping according to their specific research needs.
      </Typography.Paragraph>
      <div className={styles.imgContainer}>
        <img src={"/images/help-10.png"}></img>
      </div>
    </Layout>
  );
};
export default Home;
