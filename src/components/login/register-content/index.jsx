// components/RegisterContent.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Flex,
  Checkbox,
  Button,
  Input,
  Typography,
  Select,
  Row,
  Col,
  Form,
  Result,
  Alert,
} from "antd";
import { MailOutlined } from "@ant-design/icons";

const { Option } = Select;

const RegisterContent = ({ 
  loading,
  fetchCaptcha,
  refreshCaptcha,
  onRegister,
  onSwitchToLogin,
}) => {
  const [registerForm] = Form.useForm();
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false); // 新增：注册成功状态
  const [registeredEmail, setRegisteredEmail] = useState(""); // 新增：注册的邮箱

  // 初始化验证码
  useEffect(() => {
    const initCaptcha = async () => {
      try {
        const data = await fetchCaptcha();
        setCaptchaKey(data.captchaKey);
        setCaptchaImage(data.imageBase64);
      } catch (error) {
        console.error("获取验证码失败:", error);
      }
    };
    initCaptcha();
  }, [fetchCaptcha]);

  // 处理注册提交
  const handleRegisterSubmit = async (values) => {
    const result = await onRegister(values, captchaKey);
    
    // 如果注册成功，显示成功页面
    if (result?.success) {
      setRegisterSuccess(true);
      setRegisteredEmail(values.email);
    }
  };


  // 返回注册表单
  const handleBackToRegister = () => {
    setRegisterSuccess(false);
    setRegisteredEmail("");
    registerForm.resetFields(); // 重置表单
    // 重新获取验证码
    const initCaptcha = async () => {
      try {
        const data = await fetchCaptcha();
        setCaptchaKey(data.captchaKey);
        setCaptchaImage(data.imageBase64);
      } catch (error) {
        console.error("获取验证码失败:", error);
      }
    };
    initCaptcha();
  };

  // 注册成功页面
  if (registerSuccess) {
    return (
      <Flex vertical justify="space-between" align="center" style={{ maxWidth: 600 }}>
        <Result
          status="success"
          icon={<MailOutlined style={{ color: "#52c41a", fontSize: 64 }} />}
          title="激活邮件已发送"
          subTitle={
            <div style={{ textAlign: "left", marginTop: 16, fontSize: 14 }}>
              <p style={{ marginBottom: 8 }}>
                激活链接已发送至您填写的注册邮箱：
              </p>
              <p style={{ 
                marginBottom: 16, 
                fontWeight: "bold", 
                fontSize: 16,
                color: "#1890ff",
              }}>
                {registeredEmail}
              </p>
              <p style={{ marginBottom: 12 }}>
                请点击邮件中的链接完成账户激活，链接24小时内有效
              </p>
            </div>
          }
          extra={[
            <Button
              type="primary"
              key="login"
              onClick={() => onSwitchToLogin()}
              size="large"
              style={{ marginRight: 8 }}
            >
              去登录
            </Button>,
            <Button
              key="back"
              onClick={handleBackToRegister}
              size="large"
            >
              继续注册
            </Button>,
          ]}
        />

        <Alert
          message="温馨提示"
          description={
            <div style={{ fontSize: 12 }}>
              <p style={{ margin: 0, marginBottom: 4 }}>
                1. 如果未收到邮件，请检查垃圾邮件文件夹
              </p>
              <p style={{ margin: 0, marginBottom: 4 }}>
                2. 邮件通常会在几分钟内送达，请耐心等待
              </p>
              <p style={{ margin: 0 }}>
                3. 建议将 <strong>no-reply@especies.cn</strong> 加入白名单，防止被系统拦截
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 24, width: "100%" }}
        />

        <Typography.Paragraph
          style={{ marginTop: 20, textAlign: "center" }}
        >
          已有账户?
          <Button
            type="link"
            onClick={() => onSwitchToLogin()}
            style={{ paddingLeft: 4 }}
          >
            登录
          </Button>
        </Typography.Paragraph>
      </Flex>
    );
  }

  // 正常注册表单
  return (
    <Flex vertical justify="space-between" align="center" style={{ maxWidth: 600 }}>
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
        onFinish={handleRegisterSubmit}
        layout="vertical"
        style={{ width: "100%" }}
        disabled={loading}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              style={{ marginBottom: 5 }}
              name="username"
              label="用户名"
              rules={[
                {
                  required: true,
                  message: "User name can not be empty.",
                },
              ]}
            >
              <Input placeholder="请输入用户名" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              style={{ marginBottom: 5 }}
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: "Email can not be empty." },
                {
                  type: "email",
                  message: "Please enter a valid email address.",
                },
              ]}
            >
              <Input placeholder="请输入邮箱" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              style={{ marginBottom: 5 }}
              name="password"
              label="密码"
              rules={[
                {
                  required: true,
                  message: "Please input your password.",
                },
                {
                  pattern: /^\d{6}$/,
                  message: "Password must be 6 digits.",
                },
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
              style={{ marginBottom: 5 }}
              name="confirmPassword"
              label="确认密码"
              rules={[
                {
                  required: true,
                  message: "Please confirm your password.",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Passwords do not match."),
                    );
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
              style={{ marginBottom: 5 }}
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
              style={{ marginBottom: 5 }}
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
              style={{ marginBottom: 5 }}
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
              style={{ marginBottom: 5 }}
              name="userType"
              label="用户类型"
              rules={[
                { required: true, message: "Please select user type" },
              ]}
            >
              <Select placeholder="请选择" size="large">
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

        {captchaImage && (
          <Form.Item
            style={{ marginBottom: 5 }}
            name="captcha"
            label="验证码"
            rules={[
              { required: true, message: "Please enter captcha" },
            ]}
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
                    src={`data:image/png;base64,${captchaImage}`}
                    alt="验证码"
                    onClick={async () => {
                      const data = await refreshCaptcha();
                      setCaptchaKey(data.captchaKey);
                      setCaptchaImage(data.imageBase64);
                    }}
                  />
                  <Button
                    type="link"
                    size="small"
                    onClick={async () => {
                      const data = await refreshCaptcha();
                      setCaptchaKey(data.captchaKey);
                      setCaptchaImage(data.imageBase64);
                    }}
                    style={{ padding: 0, fontSize: 12, height: "auto" }}
                  >
                    看不清，换一张
                  </Button>
                </Flex>
              </Flex>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                请输入图中的字符，不区分大小写
              </div>
            </div>
          </Form.Item>
        )}

        <Form.Item
          style={{ marginBottom: 5 }}
          name="agreeToTerms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Please agree to the terms")),
            },
          ]}
        >
          <Checkbox>同意此协议</Checkbox>
        </Form.Item>

        <Form.Item style={{ marginBottom: 5 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: "100%" }}
            loading={loading}
          >
            注册
          </Button>
        </Form.Item>
      </Form>

      <Typography.Paragraph
        style={{ marginTop: 20, textAlign: "center" }}
      >
        已有账户?
        <Button
          type="link"
          onClick={onSwitchToLogin}
          style={{ paddingLeft: 4 }}
        >
          登录
        </Button>
      </Typography.Paragraph>
    </Flex>
  );
};

export default RegisterContent;