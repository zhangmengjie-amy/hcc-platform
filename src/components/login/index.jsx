"use client";
import React, { useState } from "react";
import {
  Row,
  Col,
  message,
} from "antd";
import { useAuth } from "@/contexts/AuthContext";
import { login, register, getCaptcha, refreshCaptcha } from "@/configs/request";
import LoginContent from "@/components/login/login-content";
import RegisterContent from "@/components/login/register-content";

function LoginForm({ searchParams }) {
  const { login: authLogin } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 登录处理
  const handleLogin = async (values, captchaKey) => {
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("loginEmail", values.email);
        localStorage.setItem("loginPassword", values.password);
      }

      const result = await login({
        email: values.email,
        password: values.password,
        captcha: values.captcha,
        captchaKey: captchaKey,
      });

      if (result?.code == 200) {
        if (result?.data?.token) {
          authLogin(result.data.token, result.data.user);
          messageApi.open({
            type: "success",
            content: "Login successful!",
          });

          const redirectUrl = searchParams?.redirect || "/home";
          window.location.href = redirectUrl;
        }
      } else {
        messageApi.open({
          type: "error",
          content: result?.message,
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // 注册处理
  const handleRegister = async (values, captchaKey) => {
    setLoading(true);

    try {
      const params = {
        userType: values.userType,
        username: values.username,
        email: values.email,
        password: values.password,
        captchaKey: captchaKey,
        captcha: values.captcha,
        agreeToTerms: values.agreeToTerms,
        researchField: values.researchField,
        organization: values.organization,
        realName: values.realName,
      };

      const result = await register(params);

      if (result?.success == 200) {
        messageApi.open({
          type: "success",
          content: result.message ?? "Registration successful! Please login.",
        });
        setIsRegisterMode(false);
      } else {
        messageApi.open({
          type: "error",
          content: result?.message ?? "注册失败！",
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // 忘记密码
  const handleForgotPassword = () => {
    window.location.href = "/reset-password";
  };

  return (
    <>
      {contextHolder}
      <Row
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgb(240,242,245)",
        }}
      >
        <Col md={6} xs={0} lg={12}>
          <div
            style={{
              borderRadius: 20,
              backgroundColor: "#cce7ee",
              backgroundRepeat: "no-repeat",
              backgroundImage: "url('/images/login-left.png')",
              width: "100%",
              height: "100%",
              backgroundSize: "contain",
              backgroundPosition: "center",
            }}
          />
        </Col>

        {/* 右侧表单区域 */}
        <Col
          md={18}
          xs={24}
          lg={12}
          style={{
            backgroundColor: "rgb(240,242,245)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!isRegisterMode ? (
            <LoginContent
              loading={loading}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              fetchCaptcha={getCaptcha}
              refreshCaptcha={refreshCaptcha}
              onLogin={handleLogin}
              onSwitchToRegister={() => setIsRegisterMode(true)}
              onForgotPassword={handleForgotPassword}
            />
          ) : (
            <RegisterContent
              loading={loading}
              fetchCaptcha={getCaptcha}
              refreshCaptcha={refreshCaptcha}
              onRegister={handleRegister}
              onSwitchToLogin={() => setIsRegisterMode(false)}
            />
          )}
        </Col>
      </Row>
    </>
  );
}

// 导出包装后的组件
export default function Login() {
  return <LoginForm />;
}