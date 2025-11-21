"use client";

import { useCallback, useState } from "react";
import { Button, message } from "antd";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DownloadOutlined, LoadingOutlined } from "@ant-design/icons";

/**
 * 基于Ant Design的PDF导出按钮组件
 * @param {Object} props - 组件属性
 * @param {string} [props.document] - 要导出的组件实例
 */
export default function PdfExportButton({
  document,
}) {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const exportToPDF = useCallback( () => {
    setLoading(true);
    messageApi.open({
      key: "exporting",
      type: "loading",
      content: t("common:generatePdf"),
      duration: 0,
    });
                
            

    setTimeout(async () => {
      try {
        



        const canvas = await html2canvas(document, {
          scale: 6,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/svg");
        const pdf = new jsPDF("l", "mm", "a4");
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "SVG", 0, 0, imgWidth, imgHeight);
        pdf.save("driver_landscape.pdf");
        messageApi.destroy("exporting");
        messageApi.success(t("common:pdfExportSuccess"));

      } catch (error) {
        messageApi.destroy("exporting");
        messageApi.error(error.message);
      } finally {
        setLoading(false);
      }
    }, 0);
  }, [document]);

    

  return (
    <>
      {contextHolder}
      <Button color="default" onClick={exportToPDF} type="primary" size="middle" icon={(loading ? <LoadingOutlined /> : <DownloadOutlined />)}

        loading={loading}>
        {t("common:exportPdf")}
      </Button>

    </>
  );
}