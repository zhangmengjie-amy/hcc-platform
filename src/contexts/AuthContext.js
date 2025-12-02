// lib/auth-context.js
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [cookies, setCookie, removeCookie] = useCookies(["token", "username", "userData"]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (token, userData) => {
    setCookie("token", token, { 
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    
    // 保存username到单独的cookie
    setCookie("username", userData?.username || "", {
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeCookie("token", { path: "/" });
    removeCookie("username", { path: "/" });
    removeCookie("userData", { path: "/" });
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      window.location.href = "/home";
    }
  };

  // 从cookie初始化用户状态
  useEffect(() => {
    if (cookies.token) {
      setIsAuthenticated(true);
      try {
        // 优先从userData cookie获取完整用户信息
        if (cookies.username) {
          setUser({
            username: cookies.username,
          });
        } 
      } catch (error) {
        console.error("User data parsing error:", error);
        // 如果解析失败，至少设置一个基本的用户对象
        setUser({
          username: cookies.username || "",
        });
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [cookies.token, cookies.userData, cookies.username]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      token: cookies.token,
    }}>
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