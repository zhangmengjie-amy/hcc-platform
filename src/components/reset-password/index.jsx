"use client";
import React, { useEffect, useState } from "react";
import { login, active, getCaptcha } from "@/configs/request";
import {
  Flex,
  Popover,
  Checkbox,
  Button,
  Input,
  Typography,
  message,
  Select,
  Row,
  Col,
  Form,
} from "antd";



const ResetPassword = ({ searchParams }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [success, setSuccess] = useState(false);
  const fetchActive = async () => {
    // setLoading(true);
    try {
      const data = await active({
        token: searchParams?.token,
      });

      if (data?.code == 200) {
        setSuccess(true);
      }
      
    } catch (error) {

      console.error("激活失败:", error);
    } finally {

    }
  };
  useEffect(() => {
    // fetchActive();
  }, []);

  return <>
    {contextHolder}
    激活成功

  
  </>;
};

export default ResetPassword;
