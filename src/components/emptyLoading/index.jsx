"use client";
import React from 'react';
import {
    Spin,
    Skeleton,
    Empty
} from 'antd';
const EmptyLoading = ({ hasData, loading, children }) => {
    return (
        <Spin spinning={loading}>
            {
                loading ? <Skeleton active></Skeleton> : (
                    hasData ? children :
                        <Empty style={{ width: '100%', padding: "20px" }}>
                        </Empty>
                )
            }
        </Spin>
    );
}
export default EmptyLoading;
