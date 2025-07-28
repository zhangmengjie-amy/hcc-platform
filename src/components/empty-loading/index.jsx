"use client";
import React from 'react';
import {
    Spin,
    Skeleton,
    Empty
} from 'antd';
const EmptyLoading = ({ hasData = false, showEmpty = true, loading, children }) => {
    return (
        <Spin spinning={loading}>
            {
                loading ? <Skeleton active></Skeleton> : (
                    hasData ? children :
                        !showEmpty ? children :
                            <Empty style={{ width: '100%', padding: "20px" }}>
                            </Empty>
                )
            }
        </Spin>
    );
}
export default EmptyLoading;
