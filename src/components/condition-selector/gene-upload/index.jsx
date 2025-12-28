// components/GeneUpload.jsx
import React, { useState } from "react";
import { Upload, Button, message, Tag, Spin, Space, Typography } from "antd";
import { UploadOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types"; // 导入 PropTypes

const { Paragraph } = Typography;

// 假设的后端接口模拟
const mockValidateGenesAPI = (geneNames) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const validGenes = geneNames.filter(name => {
        return name.startsWith("GENE") || (name.length > 3 && !name.includes("INVALID"));
      });
      resolve({
        success: true,
        data: validGenes,
        message: "基因验证成功",
      });
    }, 1000);
  });
};

// 添加一个 prop: onChange
const GeneUpload = ({ onChange }) => { // 接收 onChange prop
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [validGenes, setValidGenes] = useState([]);
  const [invalidGenes, setInvalidGenes] = useState([]);
  const [totalGenesCount, setTotalGenesCount] = useState(0);

  const beforeUpload = (file) => {
    const isTxt = file.type === "text/plain";
    if (!isTxt) {
      message.error("只能上传 TXT 文件!");
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
        .map(line => line.trim())
        .filter(line => line !== "");

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
        const response = await mockValidateGenesAPI(rawGeneNames);
        if (response.success) {
          const validated = response.data;
          const invalid = rawGeneNames.filter(name => !validated.includes(name));
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

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Typography.Title level={5}>上传基因列表 (TXT)</Typography.Title>
      <Paragraph>
        请上传一个 TXT 文件，每行包含一个基因名字。系统将自动识别、去除空格并验证基因名字的合法性。
      </Paragraph>

      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />} disabled={uploading || processing}>
          选择 TXT 文件
        </Button>
      </Upload>

      <Button
        type="primary"
        // onClick={handleUpload}
        disabled={true}
        loading={uploading || processing}
        style={{ marginTop: 16 }}
      >
        {uploading || processing ? "处理中..." : "等待验证"}
      </Button>

      {(validGenes.length > 0 || invalidGenes.length > 0 || (totalGenesCount > 0 && !processing)) && (
        <div style={{ marginTop: 24, borderTop: "1px solid #eee", paddingTop: 24 }}>
          <Typography.Title level={4}>验证结果</Typography.Title>
          {processing ? (
            <Spin tip="正在处理文件并验证基因..."></Spin>
          ) : (
            <>
              <Paragraph>
                总共识别到 <strong>{totalGenesCount}</strong> 个基因名字。
              </Paragraph>
              <Paragraph>
                合法的基因名字 ({validGenes.length} 个):
              </Paragraph>
              <Space size={[0, 8]} wrap>
                {validGenes.length > 0 ? (
                  validGenes.map((gene, index) => (
                    <Tag key={index} icon={<CheckCircleOutlined />} color="success">
                      {gene}
                    </Tag>
                  ))
                ) : (
                  <Tag color="default">无</Tag>
                )}
              </Space>

              <Paragraph style={{ marginTop: 16 }}>
                不合法的基因名字 ({invalidGenes.length} 个):
              </Paragraph>
              <Space size={[0, 8]} wrap>
                {invalidGenes.length > 0 ? (
                  invalidGenes.map((gene, index) => (
                    <Tag key={index} icon={<CloseCircleOutlined />} color="error">
                      {gene}
                    </Tag>
                  ))
                ) : (
                  <Tag color="default">无</Tag>
                )}
              </Space>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneUpload;