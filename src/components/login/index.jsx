"use client";
import React, { useState, useMemo } from 'react';
import { Flex, Checkbox, Button, Input, Typography } from 'antd';
export default function Login() {

    const [isRegisterMode, setIsRegisterMode] = useState(false);
    return (
        <Flex style={{ width: '100vw', height: '100vh', backgroundColor: 'rgb(240,242,245)' }}>
            <Flex vertical justify="center" align="center" flex={1}>
                <div style={{ borderRadius: 20, backgroundColor: "#cce7ee", backgroundRepeat: "no-repeat", backgroundImage: "url('/images/login-left.png')", width: '100%', height: '100%', backgroundSize: 'contain', backgroundPosition: 'center' }}>
                </div>
            </Flex>
            <Flex vertical justify="center" align="center" flex={1.5} style={{ paddingBottom: 30, backgroundColor: 'rgb(240,242,245)' }}>
                {
                    !isRegisterMode && <Flex vertical justify="space-between" align="center" >
                        <Typography.Title level={1} style={{ letterSpacing: 2, marginBottom: 60 }}>Welcome to HCC!</Typography.Title>
                        <Flex vertical justify="center" align="center" style={{ width: '350px' }}>
                            <Input placeholder="User Name" size="large" style={{ marginBottom: 16, }} />
                            <Input.Password placeholder="Password" size="large" />
                            <Flex align="center" justify="space-between" style={{ width: '100%', marginBottom: 36, marginTop: 5 }}>
                                <Checkbox>Remember me</Checkbox>
                                <Button type="link">Forgot Password?</Button>
                            </Flex>
                            <Button type="primary" size="large" style={{ width: '100%' }}>Login</Button>
                        </Flex>
                        <Typography.Paragraph style={{ marginTop: 60 }}>Don't have an account yet? <Button type="link" onClick={() => { setIsRegisterMode(true) }}>Sign Up</Button></Typography.Paragraph>
                    </Flex>
                }
                {
                    isRegisterMode && (
                        <Flex vertical justify="space-between" align="center" >
                            <Typography.Title level={1} style={{ letterSpacing: 2, width: "100%", marginBottom: 0, textAlign: "left" }}>Let's started!</Typography.Title>
                            <Typography.Paragraph style={{ marginBottom: 45, width: "100%", textAlign: "left", color: "#999" }}>Welcome to hcc platform, let's create your account</Typography.Paragraph>
                            <Flex vertical justify="center" align="center" style={{ width: '350px', borderTop: "1px solid #d9d9d9", paddingTop: 45 }}>
                                <Input placeholder="Name" size="large" style={{ marginBottom: 16 }} />
                                <Input.Password placeholder="Password" size="large" style={{ marginBottom: 16 }} />
                                <Input.Password placeholder="Confirm Password" size="large" />
                                <Button type="primary" size="large" style={{ width: '100%', marginTop: 60 }}>Sign Up</Button>
                                <Typography.Paragraph style={{ marginTop: 60 }}>Already have an account?<Button type="link" onClick={() => { setIsRegisterMode(false) }}>Login In</Button></Typography.Paragraph>
                            </Flex>
                        </Flex>
                    )
                }
            </Flex>
        </Flex>
    );
}