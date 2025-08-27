"use client";
import React from 'react';
import { Flex, Row, Col } from 'antd';
import Image from 'next/image';
const TreeList = ({ list, viewTree }) => {
    return (
        <Row wrap="wrap" style={{ overflowX: "scroll", position: "relative", overflowX: "hidden", overflowY: "scroll", margin: "0 auto", marginTop: "-300px", zIndex: "1" }}>
            {
                list?.map((item, i) => {
                    return <Col xs={6} sm={6} md={6} lg={6} vertical align='center' justify='center' key={i} onClick={() => { viewTree(item) }} style={{ cursor: "pointer", padding: "10px"}}>
                        <div style={{ border: `1px solid ${item.itemStyle.color}`, borderRadius: "12px", boxShadow: "0 0  10px rgb(0, 0, 0, .05)"}}>
                             <span style={{ marginTop: "5px", textAlign: "center", color: "#000" }}>{item.patientId}</span><span style={{ marginLeft: "10px", marginTop: "5px", textAlign: "center", fontWeight: "bold", color: `${item.itemStyle.color}` }}> {item.ITH}</span>
                        <Image src={`/images/${item.patientId}.svg`} width={180} height={160} alt="tree"></Image>
                        </div>
                    </Col>
                })
            }
        </Row>
    );
}
export default TreeList;
