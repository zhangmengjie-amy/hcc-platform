/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
"use client";
import React from "react";
import {
  Spin,
  Skeleton,
  Empty,
} from "antd";
const EmptyLoading = ({ hasData = false, showEmpty = true, loading, children }) => {
  return (
    <Spin spinning={loading} style={{ width: "100%" }}>
      {
        loading ? <Skeleton active></Skeleton> : (
          hasData ? children :
            !showEmpty ? children :
              <Empty style={{ width: "100%", padding: "20px" }}>
              </Empty>
        )
      }
    </Spin>
  );
};
export default EmptyLoading;
