"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BiomarkersClinical from "@/components/biomarkers/clinical";
import Pathways from "@/components/expression/pathways";
import {
  Collapse,
  Radio,
  Tooltip,
  Button,
  Flex,
  Splitter,
  Typography,
  Segmented,
  message,
} from "antd";
import { useTranslation } from "react-i18next";


const Biomarkers = () => {
  const { t } = useTranslation();
  const [dataType, setDataType] = useState("planet");
  const [mutationTypeTab, setMutationTypeTab] = useState("subtype");
  const [applyLoading, setApplyLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [params, setParams] = useState({});

  const pathname = usePathname();


  return (
    <>                    {
      // pathname.split("/")[2] == "clinical" &&  <BiomarkersClinical></BiomarkersClinical>
      "Biomarkers"
    }</>
  );
};

export default Biomarkers;