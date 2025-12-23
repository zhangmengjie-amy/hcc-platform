import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Alert,
  Space,
  Typography,
  Select,
  Flex,
  Spin,
} from "antd";
import HeatmapChart from "./heatmap";
import BoxPlot from "./boxplot";
import { getMutationHeatmapList, getHeatmapBoxplot } from "@/configs/request";

const { Title, Text } = Typography;
const { Option } = Select;

const HeatmapPage = ({ conditions }) => {
  const [data1, setData1] = useState(null); // method: conditions.method
  const [data2, setData2] = useState(null); // method: "hallmarks"
  const [data3, setData3] = useState(null); // method: "markergenes"
  const [loading, setLoading] = useState(false);
  const [chartHeight, setChartHeight] = useState(400);
  const [error, setError] = useState(null);

  // 并发请求三个接口
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 构建三个请求的参数
      const request1 = {
        method: conditions?.method,
        tmeGroupBy: conditions?.method,
        cohort: conditions?.numbers?.[0],
      };

      const request2 = {
        method: "hallmarks",
        tmeGroupBy: "cibersort",
        cohort: conditions?.numbers?.[0],
      };

      const request3 = {
        method: "markergenes",
        tmeGroupBy: "cibersort",
        cohort: conditions?.numbers?.[0],
      };

      // 并发发送三个POST请求
      const [response1, response2, response3] = await Promise.all([
        getHeatmapBoxplot(request1),
        getHeatmapBoxplot(request2),
        getHeatmapBoxplot(request3),
      ]);

      // 分别设置数据
      setData1(response1);
      setData2(response2);
      setData3(response3);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("数据加载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conditions?.numbers?.[0] && conditions?.method) {
      fetchData();
    }
  }, [conditions]);

  // 如果参数不完整，显示提示
  if (!conditions?.numbers?.[0] || !conditions?.method) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Alert
          message="暂无数据"
          description="请检查筛选条件或稍后重试"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // 加载中状态
  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: "500px" }}>
        <Spin size="large" tip="加载中..." />
      </Flex>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <button
              onClick={fetchData}
              style={{ marginTop: 8, padding: "4px 12px", cursor: "pointer" }}
            >
              重试
            </button>
          }
        />
      </div>
    );
  }

  // 数据加载完成，渲染图表
  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        {/* Hallmarks 热图 */}
        <Col span={24}>
          {data2 ? (
            <HeatmapChart data={data2} height={chartHeight} />
          ) : (
            <div
              style={{
                // height: chartHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text type="secondary">暂无数据</Text>
            </div>
          )}
        </Col>

        {/* Markergenes 热图 */}
        <Col span={24}>
          {data3 ? (
            <HeatmapChart data={data3} height={chartHeight} />
          ) : (
            <div
              style={{
                // height: chartHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text type="secondary">暂无数据</Text>
            </div>
          )}
        </Col>

        {/* 主要方法热图 */}
        <Col span={24}>
          {data1 ? (
            <HeatmapChart data={data1} height={chartHeight} />
          ) : (
            <div
              style={{
                height: chartHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text type="secondary">暂无数据</Text>
            </div>
          )}
        </Col>

        {/* 箱体图（使用data1的数据） */}
        <Col span={24}>
          {data1 ? (
            <BoxPlot data={data1} height={chartHeight} />
          ) : (
            <div
              style={{
                height: chartHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text type="secondary">暂无数据</Text>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default HeatmapPage;
