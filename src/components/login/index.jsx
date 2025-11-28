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
  Select,
  Row,
  Col,
  Form,
} from "antd";
import { useAuth } from "@/contexts/AuthContext";
import { login, register, getCaptcha } from "@/configs/request";

function LoginForm({ searchParams }) {
  const { login: authLogin } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerEmailError, setRegisterEmailError] = useState("");
  const [registerPasswordError, setRegisterPasswordError] = useState("");
  const [registerConfirmPasswordError, setRegisterConfirmPasswordError] =
    useState("");
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 验证码相关状态
  const [loginCaptchaCode, setLoginCaptchaCode] = useState("");
  const [loginCaptchaKey, setLoginCaptchaKey] = useState("");
  const [loginCaptchaImage, setLoginCaptchaImage] = useState("");

  const [userName, setUserName] = useState("");
  const [userNameError, setUserNameError] = useState("");
  const [registerCaptchaCode, setRegisterCaptchaCode] = useState("");
  const [registerCaptchaKey, setRegisterCaptchaKey] = useState("");
  const [registerCaptchaImage, setRegisterCaptchaImage] = useState("");

  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [userType, setUserType] = useState("");

  const [organization, setOrganization] = useState("");
  const [realName, setRealName] = useState("");
  const [researchField, setResearchField] = useState("");

  const validateLoginForm = () => {
    let isValid = true;
    const userRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!loginCaptchaCode) {
      isValid = false;
    }

    if (!loginEmail) {
      setLoginEmailError("Email can not be empty.");
      isValid = false;
    } else if (!userRegex.test(loginEmail)) {
      setLoginEmailError("Please enter a valid email address.");
      isValid = false;
    } else {
      setLoginEmailError("");
    }

    if (!loginPassword) {
      setLoginPasswordError("Password can not be empty.");
      isValid = false;
    } else if (!/^\d{6}$/.test(loginPassword)) {
      setLoginPasswordError("Password must be 6 digits.");
      isValid = false;
    } else {
      setLoginPasswordError("");
    }

    return isValid;
  };

  useEffect(() => {
    if (!loginPassword && !loginEmail) return;
    validateLoginForm();
  }, [loginPassword, loginEmail, loginCaptchaCode]);

  useEffect(() => {
    if (
      !registerCaptchaCode &&
      !agreeToTerms &&
      !userType &&
      !userName &&
      !registerEmail &&
      !registerPassword &&
      !registerConfirmPassword
    )
      return;
    validateRegisterForm();
  }, [agreeToTerms, userType, userName, registerCaptchaCode, registerEmail, registerPassword, registerConfirmPassword]);

  useEffect(() => {
    const checkedRememberMe = localStorage.getItem("rememberMe");
    const cachedLoginEmail = localStorage.getItem("loginEmail");
    const cachedPassword = localStorage.getItem("loginPassword");
    if (checkedRememberMe && cachedLoginEmail && cachedPassword) {
      setRememberMe(true);
      setLoginEmail(cachedLoginEmail ?? "");
      setLoginPassword(cachedPassword ?? "");
    }
    fetchLoginCaptcha();
    fetchRegisterCaptcha();
  }, []);

  const handleLogin = useCallback(async () => {
    if (!validateLoginForm()) return;

    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("loginEmail", loginEmail);
        localStorage.setItem("loginPassword", loginPassword);
      }

      const result = await login({
        email: loginEmail,
        password: loginPassword,
        captcha: loginCaptchaCode,
        captchaKey: loginCaptchaKey,
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
  }, [
    loginEmail,
    loginPassword,
    rememberMe,
    loginCaptchaCode,
    loginCaptchaKey,
  ]);

  const handleRegister = useCallback(async () => {
    if (!validateRegisterForm()) return;
    setLoading(true);

    try {
      const params = {
        userType: userType,
        username: userName,
        email: registerEmail,
        password: registerPassword,
        captchaKey: registerCaptchaKey,
        captcha: registerCaptchaCode,
        agreeToTerms: agreeToTerms,
        researchField: researchField,
        organization: organization,
        realName: realName,
      };
      if (realName) {
        params.realName = realName;
      }
      if (organization) {
        params.organization = organization;
      }
      if (researchField) {
        params.researchField = researchField;
      }
      const result = await register(params);

      if (result?.success == 200) {
        messageApi.open({
          type: "success",
          content: result.message ?? "Registration successful! Please login.",
        });
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
  }, [
    userName,
    userType,
    agreeToTerms,
    registerEmail,
    registerPassword,
    registerConfirmPassword,
    registerCaptchaCode,
    registerCaptchaKey,
    organization,
    researchField,
    realName,
  ]);

  const validateRegisterForm = () => {
    const userRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let isValid = true;

    if (!userName) {
      setUserNameError("User name can not be empty.");
      isValid = false;
    } else {
      setUserNameError("");
    }

    if (!agreeToTerms) {
      isValid = false;
    }

    if (!userType) {
      isValid = false;
    }

    if (!registerCaptchaCode) {
      isValid = false;
    }

    if (!registerEmail) {
      setRegisterEmailError("Email can not be empty.");
      isValid = false;
    } else if (!userRegex.test(registerEmail)) {
      console.log("11111111111");
      setRegisterEmailError("Please enter a valid email address.");
      isValid = false;
    } else {
      setRegisterEmailError("");
    }

    if (!registerPassword) {
      setRegisterPasswordError("Please input your password.");
      isValid = false;
    } else if (!/^\d{6}$/.test(registerPassword)) {
      setRegisterPasswordError("Password must be 6 digits.");
      isValid = false;
    } else {
      setRegisterPasswordError("");
    }

    if (!registerConfirmPassword) {
      setRegisterConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (registerPassword !== registerConfirmPassword) {
      setRegisterConfirmPasswordError("Passwords do not match.");
      isValid = false;
    } else {
      setRegisterConfirmPasswordError("");
    }
    return isValid;
  };

  // 获取验证码
  const fetchLoginCaptcha = async () => {
    setLoading(true);
    try {
      const data = await getCaptcha();
      setLoginCaptchaKey(data.captchaKey);
      setLoginCaptchaImage(data.imageBase64);
    } catch (error) {
      console.error("获取验证码失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisterCaptcha = async () => {
    setLoading(true);
    try {
      const data = await getCaptcha();
      setRegisterCaptchaKey(data.captchaKey);
      setRegisterCaptchaImage(data.imageBase64);
    } catch (error) {
      console.error("获取验证码失败:", error);
    } finally {
      setLoading(false);
    }
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
        <Col md={18} xs={24} lg={12} 
          style={{ backgroundColor: "rgb(240,242,245)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {!isRegisterMode ? (<>
            <Flex vertical justify="space-between" align="center">
              <Typography.Title
                level={1}
                style={{ letterSpacing: 2, marginBottom: 20 }}
              >
                Welcome to HCC!
              </Typography.Title>
              <Flex
                vertical
                justify="center"
                align="center"
                style={{ width: "100%" }}
              >
                <Flex style={{ width: "100%", marginBottom: 16 }}>
                  <Input
                    name="loginEmail"
                    status={loginEmailError ? "error" : ""}
                    value={loginEmail}
                    style={{ width: "100%" }}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Email"
                    size="middle"
                  />
                </Flex>
                <Flex style={{ width: "100%" }}>
                  <Input.Password
                    name="password"
                    status={loginPasswordError ? "error" : ""}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="6-digit password"
                    size="middle"
                  />
                </Flex>
                {loginCaptchaKey && (
                  <Flex
                    vertical
                    style={{ marginBottom: 16, marginTop: 16, width: "100%" }}
                  >
                    <Flex
                      style={{ marginBottom: 16, width: "100%" }}
                      align="center"
                      justify="space-between"
                    >
                      <span style={{ fontSize: "14px", marginRight: 12 }}>
                        验证码:
                      </span>
                      <Input
                        placeholder="请输入验证码"
                        value={loginCaptchaCode}
                        onChange={(e) => {
                          setLoginCaptchaCode(e.target.value);
                        }}
                        maxLength={4}
                        disabled={loading}
                        style={{ flex: 2, marginRight: 12 }}
                      />
                      <Flex align="center">
                        <img
                          style={{
                            width: 100,
                            height: 32,
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                          src={`data:image/png;base64,${loginCaptchaImage}`}
                          alt="验证码"
                        />
                      </Flex>
                    </Flex>

                    <Flex
                      align="center"
                      justify="space-between"
                      style={{ marginBottom: 8, width: "100%" }}
                    >
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                        请输入图中的字符，不区分大小写
                      </p>
                      <Button
                        type="link"
                        size="small"
                        onClick={fetchLoginCaptcha}
                        disabled={loading}
                        style={{ padding: 0, fontSize: 12, height: "auto" }}
                      >
                        看不清，换一张
                      </Button>
                    </Flex>
                  </Flex>
                )}

                <Flex
                  align="center"
                  justify="space-between"
                  style={{ width: "100%", marginBottom: 36, marginTop: 5 }}
                >
                  <Checkbox
                    onChange={(e) => setRememberMe(e.target.checked)}
                    checked={rememberMe}
                  >
                    Remember me
                  </Checkbox>
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
              <Typography.Paragraph style={{ marginTop: 20 }}>
                Don't have an account yet?
                <Button type="link" onClick={() => setIsRegisterMode(true)}>
                  Sign Up
                </Button>
              </Typography.Paragraph>
            </Flex>
          </>

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
                Let's get started!
              </Typography.Title>
              <Typography.Paragraph
                style={{
                  marginBottom: 20,
                  width: "100%",
                  textAlign: "left",
                  color: "#999",
                }}
              >
                Welcome to HCC platform, let's create your account
              </Typography.Paragraph>
              <Flex
                vertical
                justify="center"
                align="center"
                style={{
                  borderTop: "1px solid #d9d9d9",
                  paddingTop: 45,
                  width: "100%",
                }}
              >
                <Flex gap={15} style={{ width: "100%", marginBottom: 16 }}>
                  <Flex vertical flex={1}>
                    <Typography.Paragraph
                      style={{
                        marginBottom: 0,
                        width: "100%",
                        textAlign: "left",
                        color: "#999",
                      }}
                    >
                      用户名<span style={{ color: "red" }}>*</span>
                    </Typography.Paragraph>

                    <Input
                      status={userNameError ? "error" : ""}
                      placeholder="请输入用户名"
                      size="middle"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </Flex>
                  <Flex vertical flex={1}>
                    <Typography.Paragraph
                      style={{
                        marginBottom: 0,
                        width: "100%",
                        textAlign: "left",
                        color: "#999",
                      }}
                    >
                      邮箱<span style={{ color: "red" }}>*</span>
                    </Typography.Paragraph>
                    <Input
                      status={registerEmailError ? "error" : ""}
                      placeholder="请输入邮箱"
                      size="middle"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                  </Flex>
                </Flex>
                {/* 密码验证 */}
                <Flex gap={15} style={{ width: "100%" }}>
                  <Flex vertical flex={1}>
                    <Typography.Paragraph
                      style={{
                        marginBottom: 0,
                        width: "100%",
                        textAlign: "left",
                        color: "#999",
                      }}
                    >
                      密码<span style={{ color: "red" }}>*</span>
                    </Typography.Paragraph>
                    <Flex style={{ width: "100%", marginBottom: 16 }}>
                      <Input.Password
                        status={registerPasswordError ? "error" : ""}
                        placeholder="请输入6位数字密码"
                        size="middle"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                      />
                    </Flex>
                  </Flex>
                  <Flex vertical flex={1}>
                    <Typography.Paragraph
                      style={{
                        marginBottom: 0,
                        width: "100%",
                        textAlign: "left",
                        color: "#999",
                      }}
                    >
                      确认密码<span style={{ color: "red" }}>*</span>
                    </Typography.Paragraph>
                    <Input.Password
                      status={registerConfirmPasswordError ? "error" : ""}
                      placeholder="请输入确认密码"
                      size="middle"
                      value={registerConfirmPassword}
                      onChange={(e) =>
                        setRegisterConfirmPassword(e.target.value)
                      }
                    />
                  </Flex>
                </Flex>
                {/* 真实名字，研究领域 */}
                <Flex gap={15} style={{ width: "100%", marginBottom: 16 }}>
                  <Flex vertical flex={1}>
                    <Typography.Paragraph
                      style={{
                        marginBottom: 0,
                        width: "100%",
                        textAlign: "left",
                        color: "#999",
                      }}
                    >
                      真实姓名
                    </Typography.Paragraph>
                    <Input
                      placeholder="请输入真实姓名（选填）"
                      size="middle"
                      value={realName}
                      onChange={(e) => setRealName(e.target.value)}
                    />
                  </Flex>
                  <Flex vertical flex={1}>
                    <Typography.Paragraph
                      style={{
                        marginBottom: 0,
                        width: "100%",
                        textAlign: "left",
                        color: "#999",
                      }}
                    >
                      研究领域
                    </Typography.Paragraph>
                    <Input
                      placeholder="请输入研究领域（选填）"
                      size="middle"
                      value={researchField}
                      onChange={(e) =>
                        setResearchField(e.target.value)
                      }
                    />
                  </Flex>
                </Flex>
                {/* 所属单位，用户类型 */}
                <Flex gap={15} style={{ width: "100%", marginBottom: 16 }}>
                  <Flex vertical flex={1}>
                    <Typography.Paragraph
                      style={{
                        marginBottom: 0,
                        width: "100%",
                        textAlign: "left",
                        color: "#999",
                      }}
                    >
                      所属单位
                    </Typography.Paragraph>
                    <Input
                      placeholder="请输入所属单位（选填）"
                      size="middle"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                  </Flex>
                  <Flex vertical flex={1}>
                    <Typography.Paragraph
                      style={{
                        marginBottom: 0,
                        width: "100%",
                        textAlign: "left",
                        color: "#999",
                      }}
                    >
                      用户类型<span style={{ color: "red" }}>*</span>
                    </Typography.Paragraph>
                    <Select
                      placeholder="请选择"
                      style={{ width: "100%" }}
                      size="middle"
                      status={!userType ? "error" : ""}
                      onChange={setUserType}
                      options={[
                        { value: "研究员", label: "研究员" },
                        { value: "博士生", label: "博士生" },
                        { value: "硕士生", label: "硕士生" },
                        { value: "本科生", label: "本科生" },
                        { value: "博士后", label: "博士后" },
                        { value: "研究助理", label: "研究助理" },
                        { value: "医生", label: "医生" },
                        { value: "其他", label: "其他" },
                      ]}
                    />
                  </Flex>
                </Flex>
                {registerCaptchaKey && (
                  <Flex
                    vertical
                    style={{ marginBottom: 16, marginTop: 16, width: "100%" }}
                  >

                    <Flex
                      style={{ marginBottom: 16, width: "100%" }}
                      align="center"
                      justify="space-between"
                    >
                      <span style={{ fontSize: "14px", marginRight: 12 }}>
                        验证码:
                      </span>
                      <Input
                        placeholder="请输入验证码"
                        value={registerCaptchaCode}
                        onChange={(e) => {
                          setRegisterCaptchaCode(e.target.value);
                        }}
                        size="middle"
                        maxLength={4}
                        disabled={loading}
                        style={{ flex: 2, marginRight: 12 }}
                      />
                      <Flex align="center">
                        <img
                          style={{
                            width: 100,
                            height: 32,
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                          src={`data:image/png;base64,${registerCaptchaImage}`}
                          alt="验证码"
                        />
                      </Flex>
                    </Flex>

                    <Flex
                      align="center"
                      justify="space-between"
                      style={{ marginBottom: 8 }}
                    >
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                        请输入图中的字符，不区分大小写
                      </p>
                      <Button
                        type="link"
                        size="small"
                        onClick={fetchRegisterCaptcha}
                        disabled={loading}
                        style={{ padding: 0, fontSize: 12, height: "auto" }}
                      >
                        看不清，换一张
                      </Button>
                    </Flex>
                  </Flex>

                )}
                <Flex
                  align="center"
                  justify="space-between"
                  style={{ width: "100%", marginBottom: 36, marginTop: 5 }}
                >
                  <Checkbox
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    checked={agreeToTerms}
                  >
                    同意此协议
                  </Checkbox>
                  <Button type="link">这里是协议</Button>
                </Flex>
                <Button
                  type="primary"
                  size="large"
                  style={{ width: "100%" }}
                  onClick={handleRegister}
                  loading={loading}
                >
                  Sign Up
                </Button>
                <Typography.Paragraph style={{ marginTop: 30 }}>
                  Already have an account?
                  <Button type="link" onClick={() => setIsRegisterMode(false)}>
                    Login
                  </Button>
                </Typography.Paragraph>
              </Flex>
            </Flex>
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
