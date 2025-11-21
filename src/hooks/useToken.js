// hooks/useToken.js
import { useCookies } from "react-cookie";

// 在 React 组件中使用这个 Hook
export const useToken = () => {
  const [cookies] = useCookies(["token"]);
  return cookies.token;
};

// 对于非 React 组件的工具函数，使用这个辅助函数
export const getTokenFromCookie = () => {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "token") return value;
  }
  return null;
};