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
import { getValidGeneList } from "@/configs/request";
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
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();

  const beforeUpload = (file) => {
    const isTxt = file.type === "text/plain";
    if (!isTxt) {
      message.error(t("common:onlyTxtFile"));
    }
    setFileList(isTxt ? [file] : []);
    return isTxt || Upload.LIST_IGNORE;
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      messageApi.open({
        type: "warning",
        content: t("common:selectTxtFile"),
      });
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
        messageApi.open({
          type: "warning",
          content: t("common:noGeneNameInTxt"),
        });
        setUploading(false);
        setProcessing(false);
        if (onChange) {
          onChange?.([]); // 没有基因，传递空数组
        }
        return;
      }

      try {
        const response = await getValidGeneList(rawGeneNames);
        if (response.code == 200) {
          const validated = response.data?.map((item) => item.gene);

          const invalid = rawGeneNames.filter(
            (name) => !validated.includes(name),
          );
          setValidGenes(validated);
          setInvalidGenes(invalid);
          messageApi.open({
            type: "success",
            content: t("common:geneFileProcessSuccess"),
          });

          // *** 关键修改：调用父组件传递的回调函数 ***
          onChange?.(validated);
        } else {
          messageApi.open({
            type: "error",
            content: `${t("common:geneValidationFailed")}`,
          });
          if (onChange) {
            onChange?.([]); // 验证失败，传递空数组
          }
        }
      } catch (error) {
        messageApi.open({
          type: "error",
          content: `${t("common:geneFileApiFailed")}`,
        });
        onChange?.([]); // 异常情况，传递空数组
      } finally {
        setUploading(false);
        setProcessing(false);
      }
    };

    reader.onerror = () => {
      messageApi.open({
        type: "error",
        content: t("common:readFailed"),
      });
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
    <>
      {contextHolder}
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* <Typography.Title level={5}>{t("common:uploadGeneList")} (TXT)</Typography.Title> */}
        <Paragraph>{t("common:customizedGeneListTips")}</Paragraph>
        <Flex justify="space-between">
          <Upload {...uploadProps}>
            <Button
              size="midium"
              type="primary"
              loading={uploading || processing}
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
          >
            {uploading || processing
              ? `${t("common:processing")}...`
              : t("common:waitForValidation")}
          </Button>
        </Flex>

        {(validGenes.length > 0 ||
          invalidGenes.length > 0 ||
          (totalGenesCount > 0 && !processing)) && (
          <div
            style={{
              marginTop: 24,
              borderTop: "1px solid #eee",
              paddingTop: 24,
            }}
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
    </>
  );
};

export default GeneUpload;
