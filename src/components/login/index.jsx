"use client";
import React, { useState, useEffect } from "react";
import {
  Flex,
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

const { Option } = Select;

function LoginForm({ searchParams }) {
  const { login: authLogin } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 验证码相关状态
  const [loginCaptchaKey, setLoginCaptchaKey] = useState("");
  const [loginCaptchaImage, setLoginCaptchaImage] = useState("");
  const [registerCaptchaKey, setRegisterCaptchaKey] = useState("");
  const [registerCaptchaImage, setRegisterCaptchaImage] = useState("");

  // Form 实例
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  useEffect(() => {
    const checkedRememberMe = localStorage.getItem("rememberMe");
    const cachedLoginEmail = localStorage.getItem("loginEmail");
    const cachedPassword = localStorage.getItem("loginPassword");
    
    if (checkedRememberMe && cachedLoginEmail && cachedPassword) {
      setRememberMe(true);
      loginForm.setFieldsValue({
        email: cachedLoginEmail,
        password: cachedPassword,
      });
    }
    
    fetchLoginCaptcha();
    fetchRegisterCaptcha();
  }, []);

  // 获取验证码
  const fetchLoginCaptcha = async () => {
    try {
      const data = await getCaptcha();
      setLoginCaptchaKey(data.captchaKey);
      setLoginCaptchaImage(data.imageBase64);
    } catch (error) {
      console.error("获取验证码失败:", error);
    }
  };

  const fetchRegisterCaptcha = async () => {
    try {
      const data = await getCaptcha();
      setRegisterCaptchaKey(data.captchaKey);
      setRegisterCaptchaImage(data.imageBase64);
    } catch (error) {
      console.error("获取验证码失败:", error);
    }
  };

  // 登录处理
  const handleLogin = async (values) => {
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
        fetchLoginCaptcha(); // 刷新验证码
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: error.message,
      });
      fetchLoginCaptcha(); // 刷新验证码
    } finally {
      setLoading(false);
    }
  };

  // 注册处理
  const handleRegister = async (values) => {
    setLoading(true);

    try {
      const params = {
        userType: values.userType,
        username: values.username,
        email: values.email,
        password: values.password,
        captchaKey: registerCaptchaKey,
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
        // 注册成功后重置表单并切换到登录模式
        registerForm.resetFields();
        setIsRegisterMode(false);
      } else {
        messageApi.open({
          type: "error",
          content: result?.message ?? "注册失败！",
        });
        fetchRegisterCaptcha(); // 刷新验证码
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: error.message,
      });
      fetchRegisterCaptcha(); // 刷新验证码
    } finally {
      setLoading(false);
    }
  };

  // 切换模式时重置表单
  const handleModeSwitch = (isRegister) => {
    setIsRegisterMode(isRegister);
    if (isRegister) {
      loginForm.resetFields();
    } else {
      registerForm.resetFields();
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
        <Col 
          md={18} 
          xs={24} 
          lg={12} 
          style={{ 
            backgroundColor: "rgb(240,242,245)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center" 
          }}
        >
          {!isRegisterMode ? (
            // 登录表单
            <Flex vertical justify="space-between" align="center" style={{ width: "100%", maxWidth: 400 }}>
              <Typography.Title
                level={1}
                style={{ letterSpacing: 2, marginBottom: 20 }}
              >
                Welcome to HCC!
              </Typography.Title>
              
              <Form
                form={loginForm}
                onFinish={handleLogin}
                layout="vertical"
                style={{ width: "100%" }}
                disabled={loading}
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Email can not be empty." },
                    { type: "email", message: "Please enter a valid email address." }
                  ]}
                >
                  <Input
                    placeholder="Email"
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Password can not be empty." },
                    { pattern: /^\d{6}$/, message: "Password must be 6 digits." }
                  ]}
                >
                  <Input.Password
                    placeholder="6-digit password"
                    size="large"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                {loginCaptchaKey && (
                  <Form.Item
                    name="captcha"
                    rules={[{ required: true, message: "Please enter captcha" }]}
                  >
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
                            height: 32,
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                          src={`data:image/png;base64,${loginCaptchaImage}`}
                          alt="验证码"
                          onClick={fetchLoginCaptcha}
                        />
                        <Button
                          type="link"
                          size="small"
                          onClick={fetchLoginCaptcha}
                          style={{ padding: 0, fontSize: 12, height: "auto" }}
                        >
                          换一张
                        </Button>
                      </Flex>
                    </Flex>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      请输入图中的字符，不区分大小写
                    </div>
                  </Form.Item>
                )}

                <Form.Item style={{marginBottom: 5}}>
                  <Flex
                    align="center"
                    justify="space-between"
                    style={{ width: "100%", marginBottom: 16 }}
                  >
                    <Checkbox
                      onChange={(e) => setRememberMe(e.target.checked)}
                      checked={rememberMe}
                    >
                      Remember me
                    </Checkbox>
                    <Button type="link" style={{ padding: 0 }}>
                      Forgot Password?
                    </Button>
                  </Flex>
                </Form.Item>

                <Form.Item style={{marginBottom: 5}}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    style={{ width: "100%" }}
                    loading={loading}
                  >
                    Login
                  </Button>
                </Form.Item>
              </Form>

              <Typography.Paragraph style={{ marginTop: 20, textAlign: "center" }}>
                Don't have an account yet?
                <Button 
                  type="link" 
                  onClick={() => handleModeSwitch(true)}
                  style={{ paddingLeft: 4 }}
                >
                  Sign Up
                </Button>
              </Typography.Paragraph>
            </Flex>
          ) : (
            // 注册表单
            <Flex vertical justify="space-between" align="center" style={{ width: "100%", maxWidth: 600 }}>
              <div style={{ width: "100%", textAlign: "left", marginBottom: 20 }}>
                <Typography.Title
                  level={1}
                  style={{
                    letterSpacing: 2,
                    marginBottom: 0,
                  }}
                >
                  Let's get started!
                </Typography.Title>
                <Typography.Paragraph
                  style={{
                    marginBottom: 0,
                    color: "#999",
                  }}
                >
                  Welcome to HCC platform, let's create your account
                </Typography.Paragraph>
              </div>
              
              <Form
                form={registerForm}
                onFinish={handleRegister}
                layout="vertical"
                style={{ width: "100%" }}
                disabled={loading}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                    style={{marginBottom: 5}}
                      name="username"
                      label="用户名"
                      rules={[{ required: true, message: "User name can not be empty." }]}
                    >
                      <Input
                        placeholder="请输入用户名"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{marginBottom: 5}}
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: "Email can not be empty." },
                        { type: "email", message: "Please enter a valid email address." }
                      ]}
                    >
                      <Input
                        placeholder="请输入邮箱"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      style={{marginBottom: 5}}
                      name="password"
                      label="密码"
                      rules={[
                        { required: true, message: "Please input your password." },
                        { pattern: /^\d{6}$/, message: "Password must be 6 digits." }
                      ]}
                    >
                      <Input.Password
                        placeholder="请输入6位数字密码"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{marginBottom: 5}}
                      name="confirmPassword"
                      label="确认密码"
                      rules={[
                        { required: true, message: "Please confirm your password." },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match.'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        placeholder="请输入确认密码"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      style={{marginBottom: 5}}
                      name="realName"
                      label="真实姓名"
                    >
                      <Input
                        placeholder="请输入真实姓名（选填）"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      style={{marginBottom: 5}}
                      name="researchField"
                      label="研究领域"
                    >
                      <Input
                        placeholder="请输入研究领域（选填）"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      style={{marginBottom: 5}}
                      name="organization"
                      label="所属单位"
                    >
                      <Input
                        placeholder="请输入所属单位（选填）"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                     style={{marginBottom: 5}}
                      name="userType"
                      label="用户类型"
                      rules={[{ required: true, message: "Please select user type" }]}
                    >
                      <Select
                        placeholder="请选择"
                        size="large"
                      >
                        <Option value="研究员">研究员</Option>
                        <Option value="博士生">博士生</Option>
                        <Option value="硕士生">硕士生</Option>
                        <Option value="本科生">本科生</Option>
                        <Option value="博士后">博士后</Option>
                        <Option value="研究助理">研究助理</Option>
                        <Option value="医生">医生</Option>
                        <Option value="其他">其他</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {registerCaptchaKey && (
                  <Form.Item
                    style={{marginBottom: 5}}
                    name="captcha"
                    label="验证码"
                    rules={[{ required: true, message: "Please enter captcha" }]}
                  >
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
                            height: 32,
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                          src={`data:image/png;base64,${registerCaptchaImage}`}
                          alt="验证码"
                          onClick={fetchRegisterCaptcha}
                        />
                        <Button
                          type="link"
                          size="small"
                          onClick={fetchRegisterCaptcha}
                          style={{ padding: 0, fontSize: 12, height: "auto" }}
                        >
                          看不清，换一张
                        </Button>
                      </Flex>
                    </Flex>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      请输入图中的字符，不区分大小写
                    </div>
                  </Form.Item>
                )}

                <Form.Item
                  style={{marginBottom: 5}}
                  name="agreeToTerms"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Please agree to the terms')),
                    },
                  ]}
                >
                  <Checkbox>
                    同意此协议
                  </Checkbox>
                </Form.Item>

                <Form.Item style={{marginBottom: 5}}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    style={{ width: "100%" }}
                    loading={loading}
                  >
                    Sign Up
                  </Button>
                </Form.Item>
              </Form>

              <Typography.Paragraph style={{ marginTop: 20, textAlign: "center" }}>
                Already have an account?
                <Button 
                  type="link" 
                  onClick={() => handleModeSwitch(false)}
                  style={{ paddingLeft: 4 }}
                >
                  Login
                </Button>
              </Typography.Paragraph>
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