import React, { useState, useEffect } from "react";
import { Row, Col, Card, Alert, Space, Typography, Select } from "antd";
import HeatmapChart from "./heatmap";
import { getMutationHeatmapList } from "@/configs/request";

const { Title, Text } = Typography;
const { Option } = Select;

// 示例数据（实际使用时会从API获取）

const HeatmapPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartHeight, setChartHeight] = useState(600);

  // 模拟API数据加载
  const fetchData = async () => {
    setLoading(true);
    try {
      // 这里可以替换为实际的API调用
      const response = await getMutationHeatmapList();
      setData(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={3}>热图可视化</Title>
              <Text type="secondary">
                展示三种term的数据，使用共同的纵坐标，横坐标按TMEcluster分组
              </Text>

              <Alert
                message="热图说明"
                description={
                  <ul>
                    <li>纵坐标: terms（按terms_order排序）</li>
                    <li>横坐标: sampleid（按TMEcluster分组）</li>
                    <li>颜色: 红色表示正值，蓝色表示负值</li>
                    <li>垂直线: 分隔不同的TMEcluster</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title="图表设置"
            extra={
              <Select
                value={chartHeight}
                onChange={setChartHeight}
                style={{ width: 120 }}
              >
                <Option value={400}>400px</Option>
                <Option value={500}>500px</Option>
                <Option value={600}>600px</Option>
                <Option value={800}>800px</Option>
              </Select>
            }
          >
            <HeatmapChart data={data} height={chartHeight} loading={loading} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="数据统计">
            <Space direction="vertical">
              <Text>Terms数量: {data?.terms_order_name.length}</Text>
              <Text>样本数量: {data?.sampleid_order_name.length}</Text>
              <Text>
                TMEcluster数量:{" "}
                {
                  new Set(data?.sampleid_order_name.map((s) => s.TMEcluster))
                    .size
                }
              </Text>
              <Text>数据点数量: {data?.Heatmap_Body.length}</Text>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="图例说明">
            <Space direction="vertical">
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "#d73027",
                    marginRight: 8,
                  }}
                />
                <Text>高正值</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "#ffffbf",
                    marginRight: 8,
                  }}
                />
                <Text>零值附近</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "#313695",
                    marginRight: 8,
                  }}
                />
                <Text>高负值</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HeatmapPage;
