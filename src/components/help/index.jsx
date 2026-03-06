
/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
"use client";
import React, { useEffect, useRef } from "react";
import { Typography, Anchor } from "antd";
import styles from "./style.module.scss";
import CountUp from "react-countup";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;
const { Link } = Anchor;

const Help = () => {
  const { t } = useTranslation();

  // 创建 ref 映射，用于滚动定位
  const sectionRefs = {
    userManual: useRef(null),
    introduction: useRef(null),
    genomeLayer: useRef(null),
    driverLandscape: useRef(null),
    phylogeneticRelationship: useRef(null),
    timingAnalysis: useRef(null),
    transcriptomeLayer: useRef(null),
    transcriptomicHeterogeneity: useRef(null),
    differentialExpressionAnalysis: useRef(null),
    microenvironmentLayer: useRef(null),
    microenvironmentSpatialHeterogeneity: useRef(null),
    microenvironmentDeconvolution: useRef(null),
    biomarkerLayer: useRef(null),
    survivalAnalysis: useRef(null),
    multiModalJointAnalysis: useRef(null),
    references: useRef(null),
  };

  // 导航项配置
  const navItems = [
    { key: "userManual", title: "User Manual", level: 1 },
    { key: "introduction", title: "Introduction Page", level: 2 },
    { key: "genomeLayer", title: "The genome layer", level: 2 },
    { key: "driverLandscape", title: "Driver Landscape", level: 3 },
    { key: "phylogeneticRelationship", title: "Phylogenetic Relationship", level: 3 },
    { key: "timingAnalysis", title: "Timing Analysis", level: 3 },
    { key: "transcriptomeLayer", title: "The transcriptome layer", level: 2 },
    { key: "transcriptomicHeterogeneity", title: "Transcriptomic Heterogeneity", level: 3 },
    { key: "differentialExpressionAnalysis", title: "Differential Expression Analysis", level: 3 },
    { key: "microenvironmentLayer", title: "The microenvironment layer", level: 2 },
    { key: "microenvironmentSpatialHeterogeneity", title: "Microenvironment Spatial Heterogeneity", level: 3 },
    { key: "microenvironmentDeconvolution", title: "Microenvironment Deconvolution", level: 3 },
    { key: "biomarkerLayer", title: "The biomarker layer", level: 2 },
    { key: "survivalAnalysis", title: "Survival Analysis", level: 3 },
    { key: "multiModalJointAnalysis", title: "Multi-modal Joint Analysis", level: 3 },
    { key: "references", title: "References", level: 2 },
  ];

  return (
    <div className={styles.helpWrapper}>
      {/* 左侧导航 - 固定定位 */}
      <div className={styles.sideNav}>
        <div className={styles.navContent}>
          <Anchor
            affix={false}
            offsetTop={65} 
          >
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`#${item.key}`}
                title={
                  <span 
                    title={item.title}
                    className={`${styles.navLink} ${styles[`level${item.level}`]}`}
                  >
                    {item.title}
                  </span>
                }
              />
            ))}
          </Anchor>
        </div>
      </div>

      {/* 右侧内容 */}
      <div className={styles.mainContent}>
        {/* User Manual */}
        <div ref={sectionRefs.userManual} id="userManual" className={styles.section}>
          <Title
            style={{
              fontSize: "48px",
              color: "#476EAE",
              fontWeight: "bold",
              marginTop: 0,
            }}
          >
            User Manual
          </Title>
          <Paragraph style={{ fontSize: "20px" }}>
            Welcome to the LIGOR database! This page will help to guide you through
            the website and help you through the analytical steps.
          </Paragraph>
        </div>

        {/* Introduction Page */}
        <div ref={sectionRefs.introduction} id="introduction" className={styles.section}>
          <Title style={{ fontSize: "30px", color: "#476EAE", fontWeight: "bold" }}>
            Introduction Page
          </Title>
          <Paragraph style={{ fontSize: "20px" }}>
            At the introduction page, you are provided with two different options to
            explore the database...
          </Paragraph>
          <div className={styles.imgContainer}>
            <img src={"/images/help-01.png"} alt="help-01" />
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
            users can directly access the corresponding module.
          </Typography.Paragraph>
          <div className={styles.imgContainer}>
            <img src={"/images/help-02.png"} alt="help-02" />
          </div>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            Below the research module region, at the bottom of the introduction
            page, you can find statistics of the data hosted at LIGOR, as well as a
            summary of the core features of the website.
          </Typography.Paragraph>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            At the very bottom of the page, you can find a link to the GitHub
            repository associated with the website, along with an email address for
            contacting the developers.
          </Typography.Paragraph>
          <div className={styles.imgContainer}>
            <img src={"/images/help-03.png"} alt="help-03" />
          </div>
        </div>

        {/* The genome layer */}
        <div ref={sectionRefs.genomeLayer} id="genomeLayer" className={styles.section}>
          <Typography.Title
            style={{ fontSize: "30px", color: "#476EAE", fontWeight: "bold" }}
          >
            The genome layer
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            In the genome layer, we designed three modules including driver
            landscape, phylogenetic relationship as well as the timing analysis. We
            will walk you through all the modules in this section.
          </Typography.Paragraph>
        </div>

        {/* Driver Landscape */}
        <div ref={sectionRefs.driverLandscape} id="driverLandscape" className={styles.section}>
          <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
            Driver Landscape
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            To explore the driver landscape of the HCC cohorts (i.e., the PLANET or
            DT cohort), the Driver Landscape module allows users to generate an
            oncoprint plot across all patients for a set of driver genes specified
            by the user. An oncoprint plot is an efficient way to display the
            mutation status of driver genes across samples and patients. On this
            page, users can select specific cohorts (e.g., the PLANET cohort, the DT
            cohort, or both) and choose driver genes based on the criteria shown on
            the left panel. By default, a list of 62 driver genes(Kaya et al., 2022)
            is pre-selected. However, users may select any gene of interest. At the
            bottom left of the page, users can further sub-select the patient cohort
            by filtering clinical variables such as patient age. On the right side
            of the page, the oncoprint plot displays the driver landscape of the
            selected patients. As multiple samples were collected from each patient,
            users can either sort samples individually (default setting) or group
            samples by patient (i.e., multiple samples from the same patient are
            plotted together).
          </Typography.Paragraph>
          <div className={styles.imgContainer}>
            <img src={"/images/help-04.png"} alt="help-04" />
          </div>
        </div>

        {/* Phylogenetic Relationship */}
        <div ref={sectionRefs.phylogeneticRelationship} id="phylogeneticRelationship" className={styles.section}>
          <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
            Phylogenetic Relationship
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
            <img src={"/images/help-05.png"} alt="help-05" />
          </div>
        </div>

        {/* Timing Analysis */}
        <div ref={sectionRefs.timingAnalysis} id="timingAnalysis" className={styles.section}>
          <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
            Timing Analysis
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
            <img src={"/images/help-06.png"} alt="help-06" />
          </div>
        </div>

        {/* The transcriptome layer */}
        <div ref={sectionRefs.transcriptomeLayer} id="transcriptomeLayer" className={styles.section}>
          <Typography.Title
            style={{ fontSize: "30px", color: "#476EAE", fontWeight: "bold" }}
          >
            The transcriptome layer
          </Typography.Title>
        </div>

        {/* Transcriptomic Heterogeneity */}
        <div ref={sectionRefs.transcriptomicHeterogeneity} id="transcriptomicHeterogeneity" className={styles.section}>
          <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
            Transcriptomic Heterogeneity
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            One striking feature of HCC is its exceptionally high degree of
            transcriptomic heterogeneity. This module displays transcriptomic
            subtypes both within and between patients. For example, when selecting
            the PLANET cohort, a circos plot presents each patient as a stacked bar,
            with the outer tick indicating the selected patients. The phylogenetic
            tree shown on the right includes five tip labels representing the
            transcriptomic subtypes of the samples. The final subtype corresponds to
            the transcriptomic classification reported in Chen et al (Chen et al.,
            2024). The bottom-right panel illustrates the spatial locations of the
            sampled sectors. Users can navigate through different patients by
            clicking on different patients from the circos plot. If the DT cohort is
            selected, patient samples are displayed as vertical stacked bars rather
            than a circos plot. The final subtype corresponds to the transcriptomic
            classification described in Liu et al (Liu et al., 2024). Similar to the
            genome layer, users can filter patients based on the clinical
            information using the panel located at the bottom left.
          </Typography.Paragraph>
          <div className={styles.imgContainer}>
            <img src={"/images/help-07.png"} alt="help-07" />
          </div>
        </div>

        {/* Differential Expression Analysis */}
        <div ref={sectionRefs.differentialExpressionAnalysis} id="differentialExpressionAnalysis" className={styles.section}>
          <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
            Differential Expression Analysis
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
            <img src={"/images/help-08.png"} alt="help-08" />
          </div>
        </div>

        {/* The microenvironment layer */}
        <div ref={sectionRefs.microenvironmentLayer} id="microenvironmentLayer" className={styles.section}>
          <Typography.Title
            style={{ fontSize: "30px", color: "#476EAE", fontWeight: "bold" }}
          >
            The microenvironment layer
          </Typography.Title>
        </div>

        {/* Microenvironment Spatial Heterogeneity */}
        <div ref={sectionRefs.microenvironmentSpatialHeterogeneity} id="microenvironmentSpatialHeterogeneity" className={styles.section}>
          <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
            Microenvironment Spatial Heterogeneity
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            Similar to the transcriptomic heterogeneity module, this module
            illustrates microenvironmental spatial heterogeneity in multi-regional
            cohorts. For example, when the PLANET cohort is selected, the
            microenvironmental subtypes of all samples are displayed for all
            patients in a circos plot format. The phylogenetic tree and sampling
            locations of the selected patient (indicated by a tick on the outer
            ring) are shown on the right and bottom panels, respectively. The
            microenvironmental subtypes are based on the classifier developed by the
            TCGA consortium(Thorsson et al., 2018). Users can choose different
            patients by clicking on the circos plot. Similar to the transcriptomic
            heterogeneity module, the DT cohort can be shown similarly.
          </Typography.Paragraph>
          <div className={styles.imgContainer}>
            <img src={"/images/help-09.png"} alt="help-09" />
          </div>
        </div>

        {/* Microenvironment Deconvolution */}
        <div ref={sectionRefs.microenvironmentDeconvolution} id="microenvironmentDeconvolution" className={styles.section}>
          <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
            Microenvironment Deconvolution
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            The tumor microenvironment (TME) exhibits substantial heterogeneity in
            immune and stromal cell composition. By integrating seven widely used
            deconvolution methods—CIBERSORT, TIMER, xCell, MCPcounter, ESTIMATE,
            EPIC, and quanTIseq—this module allows users to select their cohort and
            method of interest. Based on the selected deconvolution output, patients
            are stratified into TME subtypes. For each subtype, marker genes and the
            activity levels of cancer hallmark pathways are provided. In addition,
            users can download the raw deconvolution results for customized
            downstream analyses and further subgrouping according to their specific
            research needs.
          </Typography.Paragraph>
          <div className={styles.imgContainer}>
            <img src={"/images/help-010.png"} alt="help-010" />
          </div>
        </div>

        {/* The biomarker layer */}
        <div ref={sectionRefs.biomarkerLayer} id="biomarkerLayer" className={styles.section}>
          <Typography.Title
            style={{ fontSize: "30px", color: "#476EAE", fontWeight: "bold" }}
          >
            The biomarker layer
          </Typography.Title>
        </div>

        {/* Survival Analysis */}
        <div ref={sectionRefs.survivalAnalysis} id="survivalAnalysis" className={styles.section}>
          <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
            Survival Analysis
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            The survival analysis module enables users to evaluate the
            stratification ability of a given biomarker, whether it is a single gene
            or a gene signature (get set). Users can first filter (top left) and
            select (left panel) the cohort of interest. For biomarkers, users may
            choose from a set of pre-curated HCC-related markers, including
            single-gene biomarkers (e.g., AFP) and multi-gene signatures (e.g., the
            Gajewski 13-gene inflammatory signature). The module compares the
            expression levels of the selected biomarker across different clinical
            stages. A corresponding Kaplan–Meier (KM) survival plot is generated for
            the chosen biomarker within the selected cohort. When multiple cohorts
            are selected, users can navigate between results using the m enu at the
            top right to view each cohort individually.
          </Typography.Paragraph>
          <div className={styles.imgContainer}>
            <img src={"/images/help-011.png"} alt="help-011" />
          </div>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            If you select “Custom Gene List”, you must upload .txt file with the
            right format.
          </Typography.Paragraph>
          <div className={styles.imgContainer}>
            <img src={"/images/help-012.png"} alt="help-012" />
          </div>
        </div>

        {/* Multi-modal Joint Analysis */}
        <div ref={sectionRefs.multiModalJointAnalysis} id="multiModalJointAnalysis" className={styles.section}>
          <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
            Multi-modal Joint Analysis
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            Leveraging multi-modal data, LIGOR provides an integrated platform that
            jointly visualizes the spatial locations and genetic relationships of
            tumor sectors alongside their transcriptomic and immune subtypes, as
            well as biomarker expression levels. This enables the comprehensive
            display and cross-modal integration of multi-omic features across
            patient cohorts.
          </Typography.Paragraph>
          <div className={styles.imgContainer}>
            <img src={"/images/help-013.png"} alt="help-013" />
          </div>
        </div>

        {/* References */}
        <div ref={sectionRefs.references} id="references" className={styles.section}>
          <Typography.Title style={{ fontSize: "24px", fontWeight: "bold" }}>
            References
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            Chen J, Kaya N A, Zhang Y, Kendarsari R I, Sekar K, Chong S L, Seshachalam V P, Ling W H, Phua C Z J, & Lai H. A multimodal atlas of hepatocellular carcinoma reveals convergent evolutionary paths and ‘bad apple’effect on clinical trajectory[J]. Journal of Hepatology, 2024, 81: 667-678.
          </Typography.Paragraph>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            Kaya N A, Chen J, Lai H, Yang H, Ma L, Liu X, Alvarez J S, Liu J, Hillmer A M, & Tai D. Genome instability is associated with ethnic differences between Asians and Europeans in hepatocellular carcinoma[J]. Theranostics, 2022, 12: 4703.
          </Typography.Paragraph>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            Liu X, Zhang K, Kaya N A, Jia Z, Wu D, Chen T, Liu Z, Zhu S, Hillmer A M, & Wuestefeld T. Tumor phylogeography reveals block-shaped spatial heterogeneity and the mode of evolution in Hepatocellular Carcinoma[J]. Nature Communications, 2024, 15: 3169.
          </Typography.Paragraph>
          <Typography.Paragraph style={{ fontSize: "20px" }}>
            Thorsson V, Gibbs D L, Brown S D, Wolf D, Bortone D S, Yang T-H O, Porta-Pardo E, Gao G F, Plaisier C L, & Eddy J A. The immune landscape of cancer[J]. Immunity, 2018, 48: 812-830. e814.
          </Typography.Paragraph>
        </div>
      </div>
    </div>
  );
};

export default Help;