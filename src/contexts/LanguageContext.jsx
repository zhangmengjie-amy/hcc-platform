"use client";
import React, { createContext, useEffect, useContext, useState, useCallback } from "react";
import i18n from "@/utils/i18n";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState("en"); // 默认英文

  // 1. 只在客户端初始化
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const savedLang = localStorage.getItem("i18nextLocalLng");
    
    // 如果有保存的中文，就用中文
    if (savedLang === "zh") {
      setLanguageState("zh");
      i18n?.changeLanguage("zh");
    }
    // 其他情况（英文、空、无效值）都用英文
    // else 不需要处理，因为默认就是英文
  }, []); // 只在 mount 时执行一次

  // 2. 语言切换函数
  const setLanguage = useCallback((newLanguage) => {
    if (newLanguage !== "en" && newLanguage !== "zh") return;
    
    // 更新状态
    setLanguageState(newLanguage);
    
    // 更新 i18n
    i18n?.changeLanguage(newLanguage);
    
    // 保存到 localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("i18nextLocalLng", newLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};