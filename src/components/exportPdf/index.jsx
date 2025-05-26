'use client';

import { useState } from 'react';
import { Button, message } from 'antd';
import { useTranslation } from "react-i18next";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';

/**
 * 基于Ant Design的PDF导出按钮组件
 * @param {Object} props - 组件属性
 * @param {string} [props.url] - 要导出的URL路径（如'/report/1'），不传则使用当前页面URL
 * @param {string} [props.filename] - 导出的文件名（不带.pdf后缀）
 * @param {string} [props.buttonText] - 按钮文字
 * @param {string} [props.buttonType] - 按钮类型（primary/dashed/link等）
 * @param {boolean} [props.showIcon] - 是否显示下载图标
 * @param {string} [props.className] - 自定义按钮样式类名
 * @param {Object} [props.buttonProps] - 其他AntD Button支持的props
 */
export default function PdfExportButton({
    url,
    filename = 'export',
    showIcon = true,
    buttonProps = {},
    custom
}) {
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const { t } = useTranslation();
    const exportToPDF = async () => {
        try {
            setLoading(true);
            messageApi.open({
                key: 'exporting',
                type: 'loading',
                content: t("common:generatePdf"),
                duration: 0
            });

            // 确定要导出的URL
            const targetUrl = url || window.location.pathname + window.location.search;

            const response = await fetch(`/api/export-pdf?path=${encodeURIComponent(targetUrl)}`);

            if (!response.ok) {
                throw new Error(response.status === 404
                    ? t("common:pdfServiceUnavailable")
                    : `${t("common:pdfExportFailed")}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            // 创建下载链接
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();

            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(downloadUrl);
            }, 100);

            messageApi.destroy('exporting');
            messageApi.success(t("common:pdfExportSuccess"));

        } catch (error) {
            console.error('导出错误:', error);
            messageApi.destroy('exporting');
            messageApi.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Button color="default" onClick={exportToPDF} type="primary" size="large" icon={showIcon && (loading ? <LoadingOutlined /> : <DownloadOutlined />)}

                loading={loading}
                {...buttonProps}
                style={{ color: "#fff", background: "rgb(212, 110, 64)" }}>
                {t("common:exportPdf")}
            </Button>

        </>
    );
}