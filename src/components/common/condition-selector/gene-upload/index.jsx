// components/GeneUpload.jsx
import React, { useState, useEffect } from "react";
import {
  Upload,
  Button,
  message,
  Tag,
  Spin,
  Space,
  Typography,
  Flex,
} from "antd";
import {
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { validGene } from "@/configs/request";
import { useTranslation } from "react-i18next";

const { Paragraph } = Typography;

// 添加一个 prop: onChange
const GeneUpload = ({ onChange }) => {
  // 接收 onChange prop
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [validGenes, setValidGenes] = useState([]);
  const [invalidGenes, setInvalidGenes] = useState([]);
  const [totalGenesCount, setTotalGenesCount] = useState(0);
  const { t } = useTranslation();

  const beforeUpload = (file) => {
    const isTxt = file.type === "text/plain";
    if (!isTxt) {
      message.error(t("common:only-txt-file"));
    }
    setFileList(isTxt ? [file] : []);
    return isTxt || Upload.LIST_IGNORE;
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("请选择一个 TXT 文件。");
      return;
    }

    setUploading(true);
    setProcessing(true);
    setValidGenes([]);
    setInvalidGenes([]);
    setTotalGenesCount(0);
    // 在开始新的上传/处理时，也通知父组件清空数据（如果父组件需要）
    if (onChange) {
      onChange?.([]);
    }

    const file = fileList[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target.result;
      const lines = content.split("\n");

      const rawGeneNames = lines
        .map((line) => line.trim())
        .filter((line) => line !== "");

      setTotalGenesCount(rawGeneNames.length);

      if (rawGeneNames.length === 0) {
        message.warning("TXT 文件中没有识别到基因名字。");
        setUploading(false);
        setProcessing(false);
        if (onChange) {
          onChange?.([]); // 没有基因，传递空数组
        }
        return;
      }

      try {
        console.log("rawGeneNames:", rawGeneNames);
        const response = await validGene(rawGeneNames);
        if (response.code == 200) {
          const validated = response.data?.map((item) => item.name);

          const invalid = rawGeneNames.filter(
            (name) => !validated.includes(name),
          );
          setValidGenes(validated);
          setInvalidGenes(invalid);
          message.success("基因文件处理并验证成功！");

          // *** 关键修改：调用父组件传递的回调函数 ***
          onChange?.(validated);
        } else {
          message.error(`基因验证失败: ${response.message}`);
          if (onChange) {
            onChange?.([]); // 验证失败，传递空数组
          }
        }
      } catch (error) {
        console.error("基因验证接口调用失败:", error);
        message.error("基因验证失败，请检查网络或服务器。");
        onChange?.([]); // 异常情况，传递空数组
      } finally {
        setUploading(false);
        setProcessing(false);
      }
    };

    reader.onerror = () => {
      message.error("文件读取失败。");
      setUploading(false);
      setProcessing(false);
      onChange?.([]); // 读取失败，传递空数组
    };

    reader.readAsText(file);
  };

  const onRemove = (file) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    setValidGenes([]);
    setInvalidGenes([]);
    setTotalGenesCount(0);
    // 文件移除时，也通知父组件清空数据
    onChange?.([]);
  };

  const uploadProps = {
    onRemove,
    beforeUpload,
    fileList,
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess("ok");
        handleUpload();
      }, 0);
    },
    maxCount: 1,
  };

  useEffect(() => {
    // 每当 validGenes 变化时，调用 onChange 通知父组件
    if (onChange) {
      onChange([]);
    }
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* <Typography.Title level={5}>{t("common:uploadGeneList")} (TXT)</Typography.Title> */}
      <Paragraph>{t("common:uploadGeneListTips")}</Paragraph>

      <Upload {...uploadProps}>
        <Button
          size="small"
          icon={<UploadOutlined />}
          disabled={uploading || processing}
        >
          {t("common:selectTxtFile")}
        </Button>
      </Upload>

      <Button
        type="primary"
        disabled={true}
        loading={uploading || processing}
        style={{ marginTop: 16 }}
      >
        {uploading || processing
          ? `${t("common:processing")}...`
          : t("common:waitForValidation")}
      </Button>

      {(validGenes.length > 0 ||
        invalidGenes.length > 0 ||
        (totalGenesCount > 0 && !processing)) && (
        <div
          style={{ marginTop: 24, borderTop: "1px solid #eee", paddingTop: 24 }}
        >
          {processing ? (
            <Spin tip={`${t("common:processing")}...`}></Spin>
          ) : (
            <>
              <Typography.Title level={5}>
                {t("common:allVerifiedGeneNames")}:{" "}
                <strong>{totalGenesCount}</strong>
              </Typography.Title>
              <Flex>
                <Flex vertical style={{ flex: 1, marginRight: 24 }}>
                  <Paragraph style={{ marginTop: 16 }}>
                    {t("common:validGeneNames")} ({validGenes.length}):
                  </Paragraph>
                  <Space size={[0, 8]} wrap>
                    {validGenes.length > 0 ? (
                      validGenes.map((gene, index) => (
                        <Tag
                          key={index}
                          icon={<CheckCircleOutlined />}
                          color="success"
                        >
                          {gene}
                        </Tag>
                      ))
                    ) : (
                      <Tag color="default">{t("common:none")}</Tag>
                    )}
                  </Space>
                </Flex>
                <Flex vertical style={{ flex: 1 }}>
                  <Paragraph style={{ marginTop: 16 }}>
                    {t("common:invalidGeneNames")} ({invalidGenes.length}):
                  </Paragraph>
                  <Space size={[0, 8]} wrap>
                    {invalidGenes.length > 0 ? (
                      invalidGenes.map((gene, index) => (
                        <Tag
                          key={index}
                          icon={<CloseCircleOutlined />}
                          color="error"
                        >
                          {gene}
                        </Tag>
                      ))
                    ) : (
                      <Tag color="default">{t("common:none")}</Tag>
                    )}
                  </Space>
                </Flex>
              </Flex>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneUpload;
