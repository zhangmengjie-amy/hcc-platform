/**
 * 作者: 张梦洁
 * UI设计: 张梦洁
 * 创建时间: 2025年4月10号
 * 最后修改时间: 2026年3月3号
 */

"use client";
import React, { useState, useEffect } from "react";
import {
  Flex,
  Checkbox,
  Button,
  Input,
  Typography,
  Form,
} from "antd";

const LoginContent = ({ 
  loading,
  rememberMe,
  setRememberMe,
  fetchCaptcha,
  refreshCaptcha,
  onLogin,
  onSwitchToRegister,
  onForgotPassword,
}) => {
  const [loginForm] = Form.useForm();
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaImageState, setCaptchaImageState] = useState("");

  // 初始化验证码和记住密码功能
  useEffect(() => {
    const initCaptcha = async () => {
      try {
        const result = await fetchCaptcha();
        setCaptchaKey(result?.data?.captchaKey);
        setCaptchaImageState(result?.data?.imageBase64);
      } catch (error) {
        console.error("获取验证码失败:", error);
      }
    };
    
    // 初始化记住密码功能
    const initRememberMe = () => {
      // 从localStorage读取记住的账号信息
      const savedRememberMe = localStorage.getItem("rememberMe") === "true";
      const savedEmail = localStorage.getItem("loginEmail") || "";
      const savedPassword = localStorage.getItem("loginPassword") || "";
      
      if (savedRememberMe && savedEmail) {
        setRememberMe(true);
        // 设置表单初始值
        loginForm.setFieldsValue({
          email: savedEmail,
          password: savedPassword,
        });
      } else if (savedEmail) {
        // 即使没有记住密码，也填充邮箱
        loginForm.setFieldsValue({
          email: savedEmail,
        });
      }
    };

    initCaptcha();
    initRememberMe();
  }, [fetchCaptcha, loginForm, setRememberMe]);

  // 处理登录表单提交
  const handleLoginSubmit = async (values) => {
    // 处理记住密码功能
    if (rememberMe) {
      // 如果勾选了记住我，保存邮箱和密码
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("loginEmail", values.email);
      localStorage.setItem("loginPassword", values.password);
    } else {
      // 如果取消记住我，清除密码但保留邮箱
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("loginPassword");
      // 仍然保存邮箱以便下次自动填充
      localStorage.setItem("loginEmail", values.email);
    }
    
    const data = await onLogin(values, captchaKey);
    if (!data.success) {
      const result = await refreshCaptcha();
      setCaptchaKey(result?.data?.captchaKey);
      setCaptchaImageState(result?.data?.imageBase64);
    }

  };

  // 处理记住我复选框变化
  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    
    // 如果取消记住我，立即清除保存的密码
    if (!checked) {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("loginPassword");
      
      // 但保留当前输入的邮箱
      const currentEmail = loginForm.getFieldValue("email");
      if (currentEmail) {
        localStorage.setItem("loginEmail", currentEmail);
      }
    }
  };

  // 邮箱输入框失去焦点时保存邮箱
  const handleEmailBlur = (e) => {
    const email = e.target.value;
    if (email) {
      localStorage.setItem("loginEmail", email);
    }
  };

  // 密码输入框获取焦点时，尝试填充保存的密码
  const handlePasswordFocus = () => {
    if (rememberMe) {
      const email = loginForm.getFieldValue("email");
      const savedEmail = localStorage.getItem("loginEmail");
      const savedPassword = localStorage.getItem("loginPassword");
      
      // 如果邮箱匹配且有保存的密码，自动填充
      if (email && savedEmail === email && savedPassword) {
        setTimeout(() => {
          loginForm.setFieldsValue({ password: savedPassword });
        }, 50);
      }
    }
  };

  return (
    <Flex
      vertical
      justify="space-between"
      align="center"
      style={{ width: "100%", maxWidth: 400 }}
    >
      <Typography.Title
        level={1}
        style={{ letterSpacing: 2, marginBottom: 20 }}
      >
        Welcome to HCC!
      </Typography.Title>

      <Form
        form={loginForm}
        onFinish={handleLoginSubmit}
        layout="vertical"
        style={{ width: "100%" }}
        disabled={loading}
        autoComplete="on"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Email can not be empty." },
            { type: "email", message: "Please enter a valid email address." },
          ]}
        >
          <Input
            placeholder="请输入邮箱"
            size="large"
            style={{ width: "100%" }}
            autoComplete="email"
            onBlur={handleEmailBlur}
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Password can not be empty." },
            { pattern: /^\d{6}$/, message: "Password must be 6 digits." },
          ]}
        >
          <Input.Password
            placeholder="请输入6位数字密码"
            size="large"
            style={{ width: "100%" }}
            autoComplete="current-password"
            onFocus={handlePasswordFocus}
          />
        </Form.Item>

        {captchaImageState && (
          <Form.Item
            name="captcha"
            rules={[{ required: true, message: "Please enter captcha" }]}
          >
            <div>
              <Flex gap={8} align="center">
                <Input
                  placeholder="请输入验证码"
                  maxLength={4}
                  style={{ flex: 1 }}
                  size="large"
                  autoComplete="off"
                />
                <Flex align="center" gap={8}>
                  <img
                    style={{
                      width: 100,
                      height: 40,
                      border: "1px solid #d9d9d9",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                    src={`data:image/png;base64,${captchaImageState}`}
                    alt="验证码"
                  />
                  <Button
                    type="link"
                    size="small"
                    onClick={async () => {
                      const result = await refreshCaptcha();
                      setCaptchaKey(result?.data?.captchaKey);
                      setCaptchaImageState(result?.data?.imageBase64);
                    }}
                    style={{ padding: 0, fontSize: 12, height: "auto" }}
                  >
                    看不清？换一张
                  </Button>
                </Flex>
              </Flex>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                请输入图中的字符，不区分大小写
              </div>
            </div>
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: 5 }}>
          <Flex
            align="center"
            justify="space-between"
            style={{ width: "100%", marginBottom: 16 }}
          >
            <Checkbox
              onChange={handleRememberMeChange}
              checked={rememberMe}
            >
              记住我
            </Checkbox>
            <Button
              type="link"
              style={{ padding: 0 }}
              onClick={onForgotPassword}
            >
              忘记密码?
            </Button>
          </Flex>
        </Form.Item>

        <Form.Item style={{ marginBottom: 5 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: "100%" }}
            loading={loading}
          >
            登录
          </Button>
        </Form.Item>
      </Form>

      <Typography.Paragraph
        style={{ marginTop: 20, textAlign: "center" }}
      >
        还没有账号?
        <Button
          type="link"
          onClick={onSwitchToRegister}
          style={{ paddingLeft: 4 }}
        >
          注册
        </Button>
      </Typography.Paragraph>
    </Flex>
  );
};

export default LoginContent;