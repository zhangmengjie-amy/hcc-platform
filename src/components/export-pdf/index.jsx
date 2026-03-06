
/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
"use client";

import { useCallback, useState } from "react";
import { Button, message } from "antd";
import { useTranslation } from "react-i18next";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";

export default function PdfExportButton({ getDocument }) {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();

  // 替换Next.js Image为普通img
  const replaceNextImages = (element) => {
    if (!element) return "";

    // 深度克隆
    const cloned = element.cloneNode(true);

    // 找到所有的Next.js Image组件
    const nextImages = cloned.querySelectorAll(
      'img[src^="/_next/image"], span[data-next-image]',
    );

    nextImages.forEach((img) => {
      // 获取原始图片URL
      let src = img.getAttribute("src");

      // Next.js Image的特殊处理
      if (src && src.includes("_next/image")) {
        // 尝试从data-src或其他属性获取原始URL
        const dataSrc =
          img.getAttribute("data-src") ||
          img.getAttribute("data-nimg") ||
          img.getAttribute("original-src");

        if (dataSrc) {
          src = dataSrc;
        } else {
          // 解析Next.js优化URL
          const urlMatch = src.match(/url=([^&]+)/);
          if (urlMatch) {
            src = decodeURIComponent(urlMatch[1]);
          }
        }
      }

      // 创建普通img元素
      if (src) {
        const newImg = document.createElement("img");
        newImg.src = src;
        newImg.alt = img.getAttribute("alt") || "";
        newImg.style.cssText = img.style.cssText;
        newImg.className = img.className;

        // 复制尺寸
        newImg.width = img.width || img.clientWidth;
        newImg.height = img.height || img.clientHeight;

        // 替换元素
        if (img.parentNode) {
          img.parentNode.replaceChild(newImg, img);
        }
      }
    });

    return cloned.outerHTML;
  };

  const exportToPDF = useCallback(async () => {
    setLoading(true);

    const loadingKey = "pdf-export";
    messageApi.open({
      key: loadingKey,
      type: "loading",
      content: "正在处理图片并生成PDF...",
      duration: 0,
    });

    try {
      const element = getDocument();
      if (!element) {
        throw new Error("未找到要导出的内容");
      }

      // 替换Next.js Images
      const htmlContent = replaceNextImages(element);

      // 获取页面所有样式
      let allStyles = "";
      try {
        const styleSheets = Array.from(document.styleSheets);
        for (const sheet of styleSheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            if (rules) {
              for (const rule of rules) {
                allStyles += rule.cssText + "\n";
              }
            }
          } catch (e) {
            // 忽略跨域错误
          }
        }
      } catch (e) {
        console.warn("获取样式失败:", e);
      }

      // 添加图片处理CSS
      const imageFixCss = `
        /* 确保图片正确显示 */
        img {
          max-width: 100% !important;
          height: auto !important;
          display: block !important;
        }
        
        /* Next.js Image容器修复 */
        span[data-next-image] {
          display: inline-block !important;
        }
        
        /* 打印优化 */
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `;

      // 调用API
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html: htmlContent,
          css: allStyles + imageFixCss,
          options: {
            filename: `document_${Date.now()}.pdf`,
            landscape: true,
            format: "A4",
            margin: {
              top: "10mm",
              right: "10mm",
              bottom: "10mm",
              left: "10mm",
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("导出失败");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      messageApi.destroy(loadingKey);
      messageApi.success(t("common:pdfExportSuccess"));
    } catch (error) {
      messageApi.destroy(loadingKey);
      messageApi.error(error.message || t("common:pdfExportFailed"));
    } finally {
      setLoading(false);
    }
  }, [getDocument, messageApi, t]);

  return (
    <>
      {contextHolder}
      <Button
        type="primary"
        onClick={exportToPDF}
        size="middle"
        icon={loading ? <LoadingOutlined /> : <DownloadOutlined />}
        loading={loading}
      >
        {t("common:exportPdf")}
      </Button>
    </>
  );
}
