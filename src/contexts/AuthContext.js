/**
 * 作者: 张梦洁
 * UI设计: 张梦洁
 * 创建时间: 2025年4月10号
 * 最后修改时间: 2026年3月3号
 */
"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState(null);

  const setCookie = (name, value, days = 7) => {
    if (typeof document === "undefined") return;

    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = days * 24 * 60 * 60;

    // 获取当前域名
    const hostname = window.location.hostname;
    let domain = undefined;

    // 生产环境设置顶级域名（处理子域名）
    if (isProduction && hostname.includes(".")) {
      // 如果是 yourdomain.com 或 www.yourdomain.com
      const domainParts = hostname.split(".");
      if (domainParts.length >= 2) {
        // 获取主域名：.yourdomain.com
        domain = `.${domainParts.slice(-2).join(".")}`;
      }
    }

    let cookieString = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; sameSite=lax`;

    // 生产环境必须 secure
    if (isProduction) {
      cookieString += "; secure";
    }

    // 设置 domain（生产环境需要）
    if (domain && isProduction) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  };

  const removeCookie = (name) => {
    if (typeof document === "undefined") return;

    const isProduction = process.env.NODE_ENV === "production";
    const hostname = window.location.hostname;
    let domain = undefined;

    if (isProduction && hostname.includes(".")) {
      const domainParts = hostname.split(".");
      if (domainParts.length >= 2) {
        domain = `.${domainParts.slice(-2).join(".")}`;
      }
    }

    let cookieString = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    if (domain && isProduction) {
      cookieString += `; domain=${domain}`;
    }

    document.cookie = cookieString;
  };

  const getCookie = (name) => {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=");
      if (cookieName && cookieName.trim() === name) {
        return decodeURIComponent(cookieValue || "");
      }
    }
    return null;
  };

  // === 认证方法 ===
  const login = (token, userData) => {
    console.log("Login called:", {
      hasToken: !!token,
      username: userData?.username,
      env: process.env.NODE_ENV,
    });

    // 设置 Cookie
    setCookie("token", token);
    setCookie("username", userData?.username || "");

    // 同时存到 localStorage 作为备份
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }
    }

    // 更新状态
    setToken(token);
    setUser(userData || { username: "用户" });
    setIsAuthenticated(true);

    // 验证 Cookie
    setTimeout(() => {
      const savedToken = getCookie("token");
      console.log(
        "Cookie verification:",
        savedToken ? "✅ Set successfully" : "❌ Failed",
      );
    }, 100);
  };

  const logout = () => {
    console.log("Logout called");

    // 清除所有存储
    removeCookie("token");
    removeCookie("username");

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("loginEmail");
      localStorage.removeItem("loginPassword");
    }

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);

    // 重定向
    window.location.href = "/home";
  };

  // === 初始化：从多个来源读取状态 ===
  useEffect(() => {
    const initializeAuth = () => {

      // 1. 优先从 Cookie 读取（支持服务器端渲染）
      const tokenFromCookie = getCookie("token");
      const usernameFromCookie = getCookie("username");

      // 2. 从 localStorage 读取（客户端备份）
      const tokenFromStorage = localStorage.getItem("token");
      const userFromStorage = localStorage.getItem("user");

      const finalToken = tokenFromCookie || tokenFromStorage;
      let finalUser = null;

      if (usernameFromCookie) {
        finalUser = { username: usernameFromCookie };
      } else if (userFromStorage) {
        try {
          finalUser = JSON.parse(userFromStorage);
        } catch {
          finalUser = { username: "用户" };
        }
      }

      if (finalToken) {
        setToken(finalToken);
        setUser(finalUser);
        setIsAuthenticated(true);
        console.log("Auth initialized: ✅ Authenticated");
      } else {
        console.log("Auth initialized: ❌ Not authenticated");
      }

      setIsInitialized(true);
    };

    // 确保在客户端执行
    if (typeof document !== "undefined") {
      initializeAuth();
    }
  }, []);

  // === 提供调试函数 ===
  const debugAuth = () => {
    console.log("=== Auth Debug ===");
    console.log("All cookies:", document.cookie);
    console.log("Token from cookie:", getCookie("token"));
    console.log("Token from localStorage:", localStorage.getItem("token"));
    console.log("Auth state:", {
      isAuthenticated,
      user,
      token,
      env: process.env.NODE_ENV,
      hostname: window.location?.hostname,
      protocol: window.location?.protocol,
    });
  };

  // 等待初始化完成
  if (!isInitialized) {
    return <div style={{ display: "none" }} />; // 静默加载
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        token,
        debugAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
