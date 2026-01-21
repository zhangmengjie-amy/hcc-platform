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
import ClinicalSelector from "@/components/condition-selector/clinical-selector";

const ImmuneSubtypeCondition = forwardRef(({}, ref) => {
  const { t } = useTranslation();
  const paramsRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getParams: () => {
      return paramsRef.current;
    },
  }));

  const onSelection = useCallback((result) => {
    paramsRef.current = {
      ...paramsRef.current,
      ...result,
    };
  }, []);

  return (
    <>
      <CohortType onChange={onSelection} onReady={onSelection}></CohortType>
      <ClinicalSelector onChange={onSelection} onReady={onSelection}></ClinicalSelector>
    </>
  );
});

export default ImmuneSubtypeCondition;
