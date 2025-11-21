"use client";
import React, { useState, useCallback } from "react";
import { Flex,Popover , Alert, Checkbox, Button, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
export default function Login() {

  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");


  const handleLogin = useCallback(() => {
    const userRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!username) {
      setUserNameError("Email can not be empty.");
      return;
    }
    if (!userRegex.test(username)) {
      setUserNameError("Please enter a valid email address.");
      return;
    }
    setUserNameError(""); // Clear any previous errors after successful validation
    if (!password) {
      setPasswordError("Password can not be empty.");
      return;
    }

    const passwordRegex = /^\d{6}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError("Password must be 6 digits.");
      return;
    }

    // Placeholder for actual login logic
    setPasswordError(""); // Clear any previous errors after successful validation
    router.push("/home");
    localStorage.setItem("isLoggedIn", "true");
  }, [username, password, router]);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  return (
    <Flex style={{ width: "100vw", height: "100vh", backgroundColor: "rgb(240,242,245)" }}>
      <Flex vertical justify="center" align="center" flex={1}>
        <div style={{ borderRadius: 20, backgroundColor: "#cce7ee", backgroundRepeat: "no-repeat", backgroundImage: "url('/images/login-left.png')", width: "100%", height: "100%", backgroundSize: "contain", backgroundPosition: "center" }}>
        </div>
      </Flex>
      <Flex vertical justify="center" align="center" flex={1.5} style={{ paddingBottom: 30, backgroundColor: "rgb(240,242,245)" }}>
        {
          !isRegisterMode && <Flex vertical justify="space-between" align="center" >
            <Typography.Title level={1} style={{ letterSpacing: 2, marginBottom: 60 }}>Welcome to HCC!</Typography.Title>
            <Flex vertical justify="center" align="center" style={{ width: "350px" }}>
              <Popover open={!!userNameError} content={userNameError} trigger="focus" placement="top">
                <Input status={userNameError ? "error" : "normal"} value={username} style={{ marginBottom: 16 }} onChange={(e) => setUsername(e.target.value)} placeholder="Email" size="large" />
              </Popover>
              <Popover open={!!passwordError} content={passwordError} trigger="focus" placement="top">
                <Input.Password status={passwordError ? "error" : "normal"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6-digit password" size="large" />
              </Popover>
              <Flex align="center" justify="space-between" style={{ width: "100%", marginBottom: 36, marginTop: 5 }}>
                <Checkbox>Remember me</Checkbox>
                <Button type="link">Forgot Password?</Button>
              </Flex>
              <Button onClick={handleLogin} type="primary" size="large" style={{ width: "100%" }}>Login</Button>
            </Flex>
            <Typography.Paragraph style={{ marginTop: 60 }}>Don't have an account yet? <Button type="link" onClick={() => { setIsRegisterMode(true); }}>Sign Up</Button></Typography.Paragraph>
          </Flex>
        }
        {
          isRegisterMode && (
            <Flex vertical justify="space-between" align="center" >
              <Typography.Title level={1} style={{ letterSpacing: 2, width: "100%", marginBottom: 0, textAlign: "left" }}>Let's started!</Typography.Title>
              <Typography.Paragraph style={{ marginBottom: 45, width: "100%", textAlign: "left", color: "#999" }}>Welcome to hcc platform, let's create your account</Typography.Paragraph>
              <Flex vertical justify="center" align="center" style={{ width: "350px", borderTop: "1px solid #d9d9d9", paddingTop: 45 }}>
                <Input placeholder="Name" size="large" style={{ marginBottom: 16 }} />
                <Input.Password placeholder="Password" size="large" style={{ marginBottom: 16 }} />
                <Input.Password placeholder="Confirm Password" size="large" />
                <Button type="primary" size="large" style={{ width: "100%", marginTop: 60 }}>Sign Up</Button>
                <Typography.Paragraph style={{ marginTop: 60 }}>Already have an account?<Button type="link" onClick={() => { setIsRegisterMode(false); }}>Login In</Button></Typography.Paragraph>
              </Flex>
            </Flex>
          )
        }
      </Flex>
    </Flex>
  );
}