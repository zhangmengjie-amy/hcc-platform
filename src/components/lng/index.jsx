"use client";
import React from "react";
import { Button, Tooltip } from "antd";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

const Language = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const handleClick = () => {
    const newLang = language === "en" ? "zh" : "en";
    setLanguage(newLang);
  };

  const showLanguage = () => {
    return language === "zh" ? "中" : "en";
  };

  return (
    <Tooltip placement="bottom" title={t("common:changeLanguage")}>
      <Button 
        type="text" 
        onClick={handleClick}
        style={{ color: "#fff", fontWeight: "bold" }}
      >
        {showLanguage()}
        <Image
          src="/images/globe.svg"
          alt="globe"
          width={25}
          height={25}
        />
      </Button>
    </Tooltip>
  );
};
export default Language;
