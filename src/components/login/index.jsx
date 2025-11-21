// components/Login.jsx
"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  Flex,
  Popover,
  Checkbox,
  Button,
  Input,
  Typography,
  message,
} from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/configs/request";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const validateForm = () => {
    let isValid = true;

    // 邮箱验证
    const userRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!username) {
      setUserNameError("Email can not be empty.");
      isValid = false;
    } else if (!userRegex.test(username)) {
      setUserNameError("Please enter a valid email address.");
      isValid = false;
    } else {
      setUserNameError("");
    }

    // 密码验证
    if (!password) {
      setPasswordError("Password can not be empty.");
      isValid = false;
    } else if (!/^\d{6}$/.test(password)) {
      setPasswordError("Password must be 6 digits.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    // 注册模式下的确认密码验证
    if (isRegisterMode) {
      if (!confirmPassword) {
        setConfirmPasswordError("Please confirm your password.");
        isValid = false;
      } else if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
        isValid = false;
      } else {
        setConfirmPasswordError("");
      }
    }

    return isValid;
  };

  useEffect(() => {
    validateForm();
  }, [password, username]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 调用登录 API
      const result = await login({
        username,
        password,
      });
      if (result?.data.token) {
        // 使用 auth context 保存 token 到 cookie
        authLogin(result.data.token, result.data.user);
        message.success("Login successful!");

        // 跳转到目标页面或首页

        const redirectUrl = searchParams.get("redirect") || "/home";
        router.push(redirectUrl);
      }
    } catch (error) {
      message.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }, [username, password, authLogin, router, searchParams]);

  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 这里调用注册 API（您需要实现注册接口）
      // const result = await register({ email: username, password, confirmPassword });

      // 模拟注册成功
      message.success("Registration successful! (Demo)");

      // 模拟返回的 token 和用户数据
      const mockToken = btoa(
        JSON.stringify({
          email: username,
          userId: Math.random().toString(36).substr(2, 9),
          exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        }),
      );

      authLogin(mockToken, { email: username });
      router.push("/home");
    } catch (error) {
      message.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }, [username, password, confirmPassword, authLogin, router]);

  return (
    <Flex
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgb(240,242,245)",
      }}
    >
      {/* 左侧图片区域 */}
      <Flex vertical justify="center" align="center" flex={1}>
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
      </Flex>

      {/* 右侧表单区域 */}
      <Flex
        vertical
        justify="center"
        align="center"
        flex={1.5}
        style={{ paddingBottom: 30, backgroundColor: "rgb(240,242,245)" }}
      >
        {!isRegisterMode ? (
          // 登录表单
          <Flex vertical justify="space-between" align="center">
            <Typography.Title
              level={1}
              style={{ letterSpacing: 2, marginBottom: 60 }}
            >
              Welcome to HCC!
            </Typography.Title>
            <Flex
              vertical
              justify="center"
              align="center"
              style={{ width: "350px" }}
            >
              <Popover
                open={!!userNameError}
                content={userNameError}
                trigger="focus"
                placement="left"
              >
                <Input
                  status={userNameError ? "error" : ""}
                  value={username}
                  style={{ marginBottom: 16 }}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Email"
                  size="large"
                />
              </Popover>
              <Popover
                open={!!passwordError}
                content={passwordError}
                trigger="focus"
                placement="left"
              >
                <Input.Password
                  status={passwordError ? "error" : ""}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6-digit password"
                  size="large"
                />
              </Popover>
              <Flex
                align="center"
                justify="space-between"
                style={{ width: "100%", marginBottom: 36, marginTop: 5 }}
              >
                <Checkbox>Remember me</Checkbox>
                <Button type="link">Forgot Password?</Button>
              </Flex>
              <Button
                onClick={handleLogin}
                type="primary"
                size="large"
                style={{ width: "100%" }}
                loading={loading}
              >
                Login
              </Button>
            </Flex>
            <Typography.Paragraph style={{ marginTop: 60 }}>
              Don"t have an account yet?
              <Button type="link" onClick={() => setIsRegisterMode(true)}>
                Sign Up
              </Button>
            </Typography.Paragraph>
          </Flex>
        ) : (
          // 注册表单
          <Flex vertical justify="space-between" align="center">
            <Typography.Title
              level={1}
              style={{
                letterSpacing: 2,
                width: "100%",
                marginBottom: 0,
                textAlign: "left",
              }}
            >
              Let"s get started!
            </Typography.Title>
            <Typography.Paragraph
              style={{
                marginBottom: 45,
                width: "100%",
                textAlign: "left",
                color: "#999",
              }}
            >
              Welcome to HCC platform, let"s create your account
            </Typography.Paragraph>
            <Flex
              vertical
              justify="center"
              align="center"
              style={{
                width: "350px",
                borderTop: "1px solid #d9d9d9",
                paddingTop: 45,
              }}
            >
              <Input
                placeholder="Email"
                size="large"
                style={{ marginBottom: 16 }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Popover
                open={!!passwordError}
                content={passwordError}
                trigger="focus"
                placement="top"
              >
                <Input.Password
                  placeholder="Password"
                  size="large"
                  style={{ marginBottom: 16 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Popover>
              <Popover
                open={!!confirmPasswordError}
                content={confirmPasswordError}
                trigger="focus"
                placement="top"
              >
                <Input.Password
                  placeholder="Confirm Password"
                  size="large"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Popover>
              <Button
                type="primary"
                size="large"
                style={{ width: "100%", marginTop: 60 }}
                onClick={handleRegister}
                loading={loading}
              >
                Sign Up
              </Button>
              <Typography.Paragraph style={{ marginTop: 60 }}>
                Already have an account?
                <Button type="link" onClick={() => setIsRegisterMode(false)}>
                  Login
                </Button>
              </Typography.Paragraph>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
