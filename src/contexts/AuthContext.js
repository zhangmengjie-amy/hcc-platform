// lib/auth-context.js
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (token, userData) => {
    setCookie("token", token, { 
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
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      window.location.href = "/home";
    }
  };

  useEffect(() => {
    if (cookies.token) {
      setIsAuthenticated(true);
      try {
        const userData = JSON.parse(atob(cookies.token.split(".")[1]));
        setUser(userData);
      } catch (error) {
        console.error("Token parsing error:", error);
        logout();
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [cookies.token]);

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