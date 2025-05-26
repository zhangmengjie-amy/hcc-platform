// utils/request.ts
import axios from 'axios';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// 创建 Axios 实例
const request = axios.create({
  baseURL: apiUrl, // 设置 baseURL 为项目的根目录
  timeout: 20000, // 请求超时设置
  headers: {
    'Content-Type': 'application/json',
  }
});

// 封装 GET 请求
export const get = async (url) => {
  try {
    const response = await request.get(url);
    return response.data; // 返回数据
  } catch (error) {
    console.error(`Error fetching data from GET request: ${url}`, error);
  }
};

// 封装 POST 请求
export const post = async (url, data) => {
  try {
    const response = await request.post(url, JSON.stringify(data));
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from POST request: ${url}`, error);
  }
};

// 封装 PUT 请求
export const put = async (url, data) => {
  try {
    const response = await request.put(url, data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from PUT request: ${url}`, error);
  }
};

// 封装 DELETE 请求
export const del = async (url) => {
  try {
    const response = await request.delete(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from DELETE request: ${url}`, error);

  }
};
