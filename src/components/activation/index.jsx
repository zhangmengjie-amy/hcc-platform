"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Spin, Card, Flex, Input, message } from "antd";
import { resendActivation, activation, getCaptcha } from "@/configs/request";
import {
  CheckCircleFilled,
  MailFilled,
  RocketFilled,
} from "@ant-design/icons";

export default function ActivationPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error, resend-success
  const [countdown, setCountdown] = useState(6);
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaKey, setCaptchaKey] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [email, setEmail] = useState("");

  const token = searchParams.get("token");

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      const result = await getCaptcha();
      setCaptchaKey(result?.data?.captchaKey);
      setCaptchaImage(result?.data?.imageBase64);
    } catch (error) {
      console.error("获取验证码失败:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    activateAccount(token);
  }, [token]);

  // 倒计时和自动跳转
  useEffect(() => {
    let timer;
    if (status === "success") {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);
      } else {
        // 倒计时结束，自动跳转
        router.push("/login");
      }
    }
    return () => clearTimeout(timer);
  }, [status, countdown, router]);

  useEffect(() => {
    if (showResendForm) {
      fetchCaptcha();
    }
  }, [showResendForm]);

  const activateAccount = async (token) => {
    try {
      const response = await activation({
        token: token,
      });

      if (response.code === 200) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  const handleResendEmail = useCallback(async () => {
    if (!email) {
      messageApi.open({
        type: "error",
        content: "请输入邮箱",
      });
      return;
    }

    const userRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!userRegex.test(email)) {
      messageApi.open({
        type: "error",
        content: "邮箱格式不正确",
      });
      return;
    }

    if (!captchaCode) {
      messageApi.open({
        type: "error",
        content: "请输入验证码",
      });
      return;
    }

    setResendLoading(true);
    try {
      const response = await resendActivation({
        email: email,
        captcha: captchaCode,
        captchaKey: captchaKey,
      });
      if (response.code == 200) {
        setStatus("resend-success");
        setShowResendForm(false);
        // 重置表单
        setEmail("");
        setCaptchaCode("");
      } else {
        messageApi.open({
          type: "error",
          content: response.message || "发送失败，请重试",
        });
        fetchCaptcha();
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: error.message || "发送失败，请重试",
      });
      fetchCaptcha();
    } finally {
      setResendLoading(false);
    }
  }, [email, captchaCode, captchaKey]);

  const showResendFormHandler = () => {
    setShowResendForm(true);
  };

  // 立即跳转，不等待倒计时
  const handleJumpNow = () => {
    router.push("/login");
  };

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          flexDirection: "column",
        }}
      >
        <Spin size="middle" />
        <div style={{ marginTop: 24, fontSize: 16, color: "#666" }}>
          正在激活您的账户，请稍候...
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
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
            账户激活成功！
          </h1>

          <div
            style={{
              fontSize: 16,
              color: "#6b7280",
              lineHeight: 1.6,
              marginBottom: 8,
            }}
          >
            <p>🎉 恭喜！您的邮箱验证已成功完成</p>
            <p>现在您可以享受我们平台的所有功能了</p>
          </div>

          <div
            style={{
              background: "#f8f9fa",
              padding: "16px 24px",
              borderRadius: 8,
              margin: "24px 0",
              border: "1px solid #e9ecef",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "#495057",
              }}
            >
              <RocketFilled style={{ color: "#1890ff" }} />
              <span>{countdown}秒后自动跳转到登录页面</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button type="primary" size="middle" onClick={handleJumpNow}>
              立即登录
            </Button>

            <Button size="middle" onClick={() => router.push("/home")}>
              返回首页
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 重新发送成功状态
  if (status === "resend-success") {
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
            <div style={{ marginBottom: 32 }}>
              <MailFilled
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
              激活邮件已发送！
            </h1>

            <div
              style={{
                fontSize: 16,
                color: "#6b7280",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              <p>📧 我们已向您的邮箱发送了新的激活链接</p>
              <p>请查收邮件并点击链接完成账户激活</p>
            </div>

            <div
              style={{
                background: "#f0f7ff",
                padding: "16px 24px",
                borderRadius: 8,
                margin: "24px 0",
                border: "1px solid #d0e4ff",
              }}
            >
              <div
                style={{
                  color: "#1890ff",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                <p>
                  <strong>温馨提示：</strong>
                </p>
                <p>• 如果未收到邮件，请检查垃圾邮件文件夹</p>
                <p>• 激活链接通常会在几分钟内送达</p>
                <p>• 链接有效期为24小时，请及时激活</p>
              </div>
            </div>
            {!showResendForm ? (
              <div
                style={{ display: "flex", gap: 12, justifyContent: "center" }}
              >
                <Button type="primary" onClick={showResendFormHandler}>
                  重新发送激活邮件
                </Button>

                <Button size="middle" onClick={() => router.push("/login")}>
                  前往登录
                </Button>
                <Button onClick={() => router.push("/home")}>返回首页</Button>
              </div>
            ) : (
              <div style={{ maxWidth: 300, margin: "0 auto" }}>
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
                      邮&nbsp;&nbsp;&nbsp;箱:
                    </span>
                    <Input
                      placeholder="请输入注册邮箱"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      size="middle"
                      disabled={status == "loading"}
                      style={{ flex: 2 }}
                    />
                  </Flex>
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
                      value={captchaCode}
                      onChange={(e) => {
                        setCaptchaCode(e.target.value);
                      }}
                      size="middle"
                      maxLength={4}
                      disabled={status == "loading"}
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
                        src={`data:image/png;base64,${captchaImage}`}
                        alt="验证码"
                        onClick={fetchCaptcha}
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
                      onClick={fetchCaptcha}
                      disabled={status == "loading"}
                      style={{ padding: 0, fontSize: 12, height: "auto" }}
                    >
                      看不清，换一张
                    </Button>
                  </Flex>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      justifyContent: "center",
                      marginTop: "20px",
                    }}
                  >
                    <Button
                      type="primary"
                      size="middle"
                      onClick={handleResendEmail}
                      disabled={resendLoading}
                    >
                      重新发送激活邮件
                    </Button>

                    <Button size="middle" onClick={() => router.push("/login")}>
                      前往登录
                    </Button>

                    <Button size="middle" onClick={() => router.push("/home")}>
                      返回首页
                    </Button>
                  </div>
                </Flex>
              </div>
            )}
          </Card>
        </div>
      </>
    );
  }

  // 错误状态
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
        <Card style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 24 }}>
            <MailFilled
              style={{
                fontSize: 48,
                color: "#ff4d4f",
              }}
            />
          </div>

          <h1 style={{ fontSize: 24, marginBottom: 16 }}>
            激活链接无效或已过期
          </h1>

          <Flex
            vertical
            style={{
              fontSize: 14,
              color: "#666",
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            <p>可能是以下原因：</p>
            <Flex style={{ textAlign: "left" }} justify="center">
              <Flex vertical>
                <span>• 链接已超过有效期</span>
                <span>• 链接已被使用</span>
                <span>• 链接格式不正确</span>
              </Flex>
            </Flex>
          </Flex>

          {!showResendForm ? (
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Button type="primary" onClick={showResendFormHandler}>
                重新发送激活邮件
              </Button>

              <Button onClick={() => router.push("/home")}>返回首页</Button>
            </div>
          ) : (
            <div style={{ maxWidth: 300, margin: "0 auto" }}>
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
                    邮&nbsp;&nbsp;&nbsp;箱:
                  </span>
                  <Input
                    placeholder="请输入注册邮箱"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    size="middle"
                    disabled={status == "loading"}
                    style={{ flex: 2 }}
                  />
                </Flex>
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
                    value={captchaCode}
                    onChange={(e) => {
                      setCaptchaCode(e.target.value);
                    }}
                    size="middle"
                    maxLength={4}
                    disabled={status == "loading"}
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
                      src={`data:image/png;base64,${captchaImage}`}
                      alt="验证码"
                      onClick={fetchCaptcha}
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
                    onClick={fetchCaptcha}
                    disabled={status == "loading"}
                    style={{ padding: 0, fontSize: 12, height: "auto" }}
                  >
                    看不清，换一张
                  </Button>
                </Flex>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <Button
                    type="primary"
                    size="middle"
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                  >
                    重新发送激活邮件
                  </Button>

                  <Button size="middle" onClick={() => router.push("/home")}>
                    返回首页
                  </Button>
                </div>
              </Flex>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
