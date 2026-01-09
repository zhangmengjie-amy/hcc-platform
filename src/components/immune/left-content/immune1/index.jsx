"use client";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
import CohortType from "@/components/condition-selector/dt-planet";
import ClinicalSelector from "@/components/condition-selector/clinical";

const Immune1Condition = forwardRef(({}, ref) => {
  const { t } = useTranslation();
  const paramsRef = useRef();

  useImperativeHandle(ref, () => ({
    getParams: () => {
      return paramsRef.current;
    },
  }));

  const onSelection = (result) => {
    paramsRef.current = {
      ...paramsRef.current,
      ...result,
    };
  };

  return (
    <>
      <CohortType onChange={onSelection} onReady={onSelection}></CohortType>
      <ClinicalSelector onChange={onSelection}></ClinicalSelector>
    </>
  );
});

export default Immune1Condition;
