"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Form,
  Input,
  Button,
  Steps,
  message,
  Flex,
  Typography,
  Divider,
  Result,
  Spin,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { getCaptcha, sendResetEmail, resetPassword } from "@/configs/request";

const { Step } = Steps;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 表单状态
  const [email, setEmail] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [status, setStatus] = useState("form"); // form, success, error

  // 从URL参数获取token（如果是通过邮件链接进入）
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // 如果有token，直接跳到密码重置步骤
      setResetToken(token);
      setCurrentStep(1);
      setStatus("form");
    }
    fetchCaptcha();
  }, [token]);

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      const data = await getCaptcha();
      setCaptchaKey(data.captchaKey);
      setCaptchaImage(data.imageBase64);
    } catch (error) {
      console.error("获取验证码失败:", error);
    }
  };

  // 第一步：输入邮箱和验证码
  const handleStep1Submit = async () => {
    if (!email) {
      messageApi.error("请输入邮箱地址");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      messageApi.error("请输入有效的邮箱地址");
      return;
    }

    if (!captchaCode) {
      messageApi.error("请输入验证码");
      return;
    }

    setLoading(true);
    try {
      const response = await sendResetEmail({
        email,
        captcha: captchaCode,
        captchaKey,
      });

      if (response.code === 200) {
        messageApi.success("重置邮件已发送，请查收邮箱并点击链接重置密码");
        setStatus("email-sent");
      } else {
        messageApi.error(response.message || "发送失败");
        fetchCaptcha(); // 刷新验证码
      }
    } catch (error) {
      messageApi.error("发送失败，请重试");
      fetchCaptcha(); // 刷新验证码
    } finally {
      setLoading(false);
    }
  };

  // 第二步：重置密码
  const handleStep2Submit = async (values) => {
    const { newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      messageApi.error("两次输入的密码不一致");
      return;
    }

    if (!/^\d{6}$/.test(newPassword)) {
      messageApi.error("密码必须是6位数字");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({
        token: resetToken,
        newPassword,
        confirmPassword,
      });

      if (response.code === 200) {
        setStatus("success");
        messageApi.success("密码重置成功");
      } else {
        setStatus("error");
        messageApi.error(response.message || "重置失败");
      }
    } catch (error) {
      setStatus("error");
      messageApi.error("重置失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 重新发送邮件
  const handleResendEmail = () => {
    setStatus("form");
    setEmail("");
    setCaptchaCode("");
    fetchCaptcha();
  };

  const steps = [
    {
      title: "验证邮箱",
      content: (
        <div>
          {status === "email-sent" ? (
            <Result
              status="success"
              title="重置邮件已发送！"
              subTitle="我们已向您的邮箱发送了密码重置链接，请点击链接继续重置密码"
              extra={[
                <Button type="primary" key="resend" onClick={handleResendEmail}>
                  重新发送邮件
                </Button>,
                <Button key="back" onClick={() => router.push("/login")}>
                  返回登录
                </Button>,
              ]}
            />
          ) : (
            <Form layout="vertical" onFinish={handleStep1Submit}>
              <Form.Item
                label="邮箱地址"
                name="email"
                rules={[
                  { required: true, message: "请输入邮箱地址" },
                  { type: "email", message: "请输入有效的邮箱地址" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="请输入注册时使用的邮箱"
                  size="large"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                label="验证码"
                name="captcha"
                rules={[{ required: true, message: "请输入验证码" }]}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Input
                    prefix={<SafetyCertificateOutlined />}
                    placeholder="请输入验证码"
                    size="large"
                    value={captchaCode}
                    onChange={(e) => setCaptchaCode(e.target.value)}
                    maxLength={4}
                    style={{ flex: 1 }}
                  />
                  {captchaImage && (
                    <div
                      style={{
                        cursor: "pointer",
                        border: "1px solid #d9d9d9",
                        borderRadius: 6,
                        padding: 4,
                      }}
                      onClick={fetchCaptcha}
                    >
                      <img
                        src={`data:image/png;base64,${captchaImage}`}
                        alt="验证码"
                        style={{ height: 32, display: "block" }}
                      />
                    </div>
                  )}
                  <Button
                    type="link"
                    onClick={fetchCaptcha}
                    style={{ padding: 0 }}
                  >
                    看不清，换一张
                  </Button>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  onClick={sendResetEmail}
                  block
                >
                  发送重置邮件
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      ),
    },
    {
      title: "重置密码",
      content: (
        <div>
          {status === "success" ? (
            <Result
              status="success"
              title="密码重置成功！"
              subTitle="您的密码已成功重置，现在可以使用新密码登录"
              extra={[
                <Button
                  type="primary"
                  key="login"
                  onClick={() => router.push("/login")}
                >
                  立即登录
                </Button>,
                <Button key="home" onClick={() => router.push("/home")}>
                  返回首页
                </Button>,
              ]}
            />
          ) : status === "error" ? (
            <Result
              status="error"
              title="重置失败"
              subTitle="密码重置失败，请重试或联系管理员"
              extra={[
                <Button
                  type="primary"
                  key="retry"
                  onClick={() => setStatus("form")}
                >
                  重试
                </Button>,
                <Button key="back" onClick={() => router.push("/login")}>
                  返回登录
                </Button>,
              ]}
            />
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleStep2Submit}
            >
              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[
                  { required: true, message: "请输入新密码" },
                  { pattern: /^\d{6}$/, message: "密码必须是6位数字" },
                ]}
                extra="密码必须是6位数字"
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入6位数字新密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="确认密码"
                name="confirmPassword"
                rules={[
                  { required: true, message: "请确认密码" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的密码不一致"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入新密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                >
                  重置密码
                </Button>
              </Form.Item>
            </Form>
          )}
        </div>
      ),
    },
  ];

  if (!token && status === "form") {
    // 没有token时显示步骤指示器
    return (
      <>
        {contextHolder}
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Card
            style={{
              width: "100%",
              maxWidth: 480,
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <Typography.Title level={2} style={{ marginBottom: 8 }}>
                找回密码
              </Typography.Title>
              <Typography.Text type="secondary">
                请按照以下步骤重置您的密码
              </Typography.Text>
            </div>

            <Steps current={currentStep} style={{ marginBottom: 32 }}>
              {steps.map((item) => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>

            <div style={{ minHeight: 200 }}>
              {steps[currentStep].content}
            </div>

            <Divider />

            <div style={{ textAlign: "center" }}>
              <Button
                type="link"
                onClick={() => router.push("/login")}
                style={{ padding: 0 }}
              >
                返回登录
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // 有token时直接显示密码重置表单（类似激活页面的样式）
  return (
    <>
      {contextHolder}
      <div
        style={{
          maxWidth: 600,
          margin: "40px auto",
          padding: "0 24px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {status === "success" ? (
            <>
              <div style={{ marginBottom: 32 }}>
                <CheckCircleFilled
                  style={{
                    fontSize: 64,
                    color: "#52c41a",
                  }}
                />
              </div>

              <h1
                style={{
                  fontSize: 28,
                  marginBottom: 16,
                  color: "#1f2937",
                }}
              >
                密码重置成功！
              </h1>

              <div
                style={{
                  fontSize: 16,
                  color: "#6b7280",
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                <p>✅ 您的密码已成功重置</p>
                <p>现在可以使用新密码登录账户</p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="primary"
                  size="middle"
                  onClick={() => router.push("/login")}
                >
                  立即登录
                </Button>

                <Button
                  size="middle"
                  onClick={() => router.push("/home")}
                >
                  返回首页
                </Button>
              </div>
            </>
          ) : status === "error" ? (
            <>
              <div style={{ marginBottom: 24 }}>
                <CheckCircleFilled
                  style={{
                    fontSize: 48,
                    color: "#ff4d4f",
                  }}
                />
              </div>

              <h1 style={{ fontSize: 24, marginBottom: 16 }}>
                密码重置失败
              </h1>

              <div
                style={{
                  fontSize: 14,
                  color: "#666",
                  lineHeight: 1.6,
                  marginBottom: 32,
                }}
              >
                <p>重置链接可能已过期或无效</p>
                <p>请重新获取重置链接或联系管理员</p>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Button
                  type="primary"
                  onClick={() => window.location.reload()}
                >
                  重试
                </Button>

                <Button onClick={() => router.push("/forgot-password")}>
                  重新获取链接
                </Button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 32 }}>
                <LockOutlined
                  style={{
                    fontSize: 48,
                    color: "#1890ff",
                  }}
                />
              </div>

              <h1
                style={{
                  fontSize: 24,
                  marginBottom: 16,
                  color: "#1f2937",
                }}
              >
                设置新密码
              </h1>

              <div
                style={{
                  fontSize: 14,
                  color: "#666",
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                <p>请设置您的新密码</p>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleStep2Submit}
                style={{ maxWidth: 400, margin: "0 auto" }}
              >
                <Form.Item
                  label="新密码"
                  name="newPassword"
                  rules={[
                    { required: true, message: "请输入新密码" },
                    { pattern: /^\d{6}$/, message: "密码必须是6位数字" },
                  ]}
                  extra="密码必须是6位数字"
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入6位数字新密码"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="确认密码"
                  name="confirmPassword"
                  rules={[
                    { required: true, message: "请确认密码" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("newPassword") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("两次输入的密码不一致"));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请再次输入新密码"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    block
                  >
                    重置密码
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}
        </Card>
      </div>
    </>
  );
}