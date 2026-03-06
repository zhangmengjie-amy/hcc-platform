/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
"use client";
import React from "react";
import { Flex, Row, Col } from "antd";
import Image from "next/image";
const TreeList = ({ list, viewTree, dataType }) => {
  return (
    <Row
      wrap="wrap"
      style={{
        overflowX: "scroll",
        position: "relative",
        overflowX: "hidden",
        overflowY: "scroll",
        margin: "0 auto",
        marginTop: "-300px",
        zIndex: "1",
      }}
    >
      {list?.map((item, i) => {
        return (
          <Col
            key={item?.patientId}
            xs={6}
            sm={6}
            md={6}
            lg={6}
            vertical
            align="center"
            justify="center"
            onClick={() => {
              viewTree(item);
            }}
            style={{ cursor: "pointer", padding: "10px" }}
          >
            <Flex
              vertical
              justify="center"
              align="center"
              style={{
                border: `1px solid ${item.itemStyle.color}`,
                borderRadius: "12px",
                boxShadow: "0 0  10px rgb(0, 0, 0, .05)",
              }}
            >
              <span
                style={{ marginTop: "5px", textAlign: "center", color: "#000" }}
              >
                {item.patientId}
              </span>
              <span
                style={{
                  marginLeft: "10px",
                  marginTop: "5px",
                  textAlign: "center",
                  fontWeight: "bold",
                  color: `${item.itemStyle.color}`,
                }}
              >
                {" "}
                {item.ITH}
              </span>
              <Image
                src={`/images/${item.patientId}.${dataType == "dt" ? "png" : "svg"}`}
                width={180}
                height={160}
                alt="tree"
              ></Image>
            </Flex>
          </Col>
        );
      })}
    </Row>
  );
};
export default TreeList;
