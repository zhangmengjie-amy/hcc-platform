"use client";
import React from 'react';
import { Flex } from 'antd';
import Image from 'next/image';
const TreeList = ({ list, viewTree }) => {
    return (
        <Flex wrap="wrap" gap={5} style={{ width: "832px", overflowX: "scroll", maxHeight: "580px", position: "relative", overflowX: "hidden", overflowY: "scroll", margin: "0 auto", marginTop: "-300px", zIndex: "1" }}>
            {
                list.map((item, i) => {
                    return <Flex vertical align='center' justify='center' key={i} onClick={() => { viewTree(item) }} style={{ cursor: "pointer", width: '200px', height: "200px", border: `3px solid ${item.itemStyle.color}`, borderRadius: "12px" }}>
                        <div><span style={{ marginTop: "5px", textAlign: "center", color: "#000" }}>{item.patientId}</span><span style={{ marginLeft: "10px", marginTop: "5px", textAlign: "center", fontWeight: "bold", color: `${item.itemStyle.color}` }}> {item.ITH}</span></div>
                        <Image src={`/images/${item.patientId}.svg`} width={180} height={160} alt="tree"></Image>
                    </Flex>
                })
            }
        </Flex>
    );
}
export default TreeList;
