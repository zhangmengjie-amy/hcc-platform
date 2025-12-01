// components/LoginContent.jsx
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
  captchaImage,
  fetchCaptcha,
  refreshCaptcha,
  onLogin,
  onSwitchToRegister,
  onForgotPassword,
}) => {
  const [loginForm] = Form.useForm();
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaImageState, setCaptchaImageState] = useState("");

  // 初始化验证码
  useEffect(() => {
    const initCaptcha = async () => {
      try {
        const data = await fetchCaptcha();
        setCaptchaKey(data.captchaKey);
        setCaptchaImageState(data.imageBase64);
      } catch (error) {
        console.error("获取验证码失败:", error);
      }
    };
    initCaptcha();
  }, [fetchCaptcha]);

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
        onFinish={(values) => onLogin(values, captchaKey)}
        layout="vertical"
        style={{ width: "100%" }}
        disabled={loading}
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
                    onClick={async () => {
                      const data = await refreshCaptcha();
                      setCaptchaKey(data.captchaKey);
                      setCaptchaImageState(data.imageBase64);
                    }}
                  />
                  <Button
                    type="link"
                    size="small"
                    onClick={async () => {
                      const data = await refreshCaptcha();
                      setCaptchaKey(data.captchaKey);
                      setCaptchaImageState(data.imageBase64);
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
              onChange={(e) => setRememberMe(e.target.checked)}
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