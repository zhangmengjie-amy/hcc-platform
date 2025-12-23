// utils/api.js
import axios from "axios";
import { getTokenFromCookie } from "@/hooks/useToken";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// 创建 Axios 实例
const request = axios.create({
  baseURL: apiUrl, // 设置 baseURL 为项目的根目录
  // timeout: 20000, // 请求超时设置
  headers: {
    "Content-Type": "application/json",
  },
});

// 封装 GET 请求
export const get = async (url, config = {}) => {
  try {
    const response = await request.get(url, config = {});
    return response.data; // 返回数据
  } catch (error) {
    console.error(`Error fetching data from GET request: ${url}`, error);
  }
};

// 封装 POST 请求
export const post = async (url, data, config = {}) => {
  try {
    const response = await request.post(url, JSON.stringify(data), config = {});
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from POST request: ${url}`, error);
  }
};

// 封装 PUT 请求
export const put = async (url, data, config = {}) => {
  try {
    const response = await request.put(url, data, config = {});
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from PUT request: ${url}`, error);
  }
};

// 封装 DELETE 请求
export const del = async (url, config = {}) => {
  try {
    const response = await request.delete(url, config = {});
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from DELETE request: ${url}`, error);

  }
};

// 请求拦截器 - 自动添加 token
request.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 处理认证错误
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // 401 未授权，跳转到登录页
      if (status === 401) {
        document.cookie = "token=; max-age=0; path=/";
        
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  },
);
