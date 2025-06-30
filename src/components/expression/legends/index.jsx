"use client";
import React, { useEffect, useState, useRef } from 'react';
import { getPatientSubtypeList } from "@/configs/request";
import { Flex } from 'antd';
import EChartsReact from "echarts-for-react";

const SUBTYPE_COLOR = {
    "C1": "rgb(79, 151, 121)",
    "C2": "rgb(72, 128, 187)",
    "C3": "rgb(150, 91, 164)",
    "C4": "rgb(167, 134, 56)",
    "C5": "rgb(238, 188, 57)",
    "C6": "rgb(218, 85, 76)",
}


const MIXED_PURE = {
    "PURE": "rgb(106, 194, 165)",
    "MIXED": "rgb(158, 153, 197)",
}

const STAGE_COLOR = {
    "I": "rgb(250, 213, 120)",
    "II": "rgb(245, 138, 66)",
    "III": "rgb(224, 36, 40)",
}

const Legends = () => {

    return (
        <Flex style={{ padding: "20px", position: "absolute", left: 500, top: 0 }}>
            <Flex vertical >
                <Flex style={{ marginBottom: "10px" }}>Mixed or Pure</Flex>
                {
                    Object.keys(MIXED_PURE).map((item) => {
                        return <Flex key={item} align='center'><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: MIXED_PURE[item] }}></span><span>{item}</span></Flex>
                    })
                }
            </Flex>
            <Flex vertical style={{ marginLeft: "10px" }}>
                <Flex style={{ marginBottom: "10px" }}>Stage</Flex>
                {
                    Object.keys(STAGE_COLOR).map((item) => {
                        return <Flex key={item} align='center'><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: STAGE_COLOR[item] }}></span><span>{item}</span></Flex>
                    })
                }
            </Flex>

            <Flex vertical style={{ marginLeft: "10px" }}>
                <Flex style={{ marginBottom: "10px" }}>Subtype</Flex>
                {
                    Object.keys(SUBTYPE_COLOR).map((item) => {
                        return <Flex key={item} align='center'><span style={{ display: "inline-block", width: "20px", height: "12px", marginRight: "5px", backgroundColor: SUBTYPE_COLOR[item] }}></span><span>{item}</span></Flex>
                    })
                }
            </Flex>

        </Flex>
    )
}

export default Legends;