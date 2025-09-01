"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { clinicColorConfig } from "@/configs/mutation";
import { getLollipopPlotData } from '@/configs/request';
import * as d3 from 'd3';

const GeneLollipop = ({gene, samples }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dims, setDims] = useState({ width: 0 });
const mutationTypeColorConfig = {
    Missense_Mutation: "rgb(103, 191, 92)",
    Splice_Site: "rgb(255, 158, 74)",
    Frame_Shift_Ins: "rgb(173, 139, 201)",
    Frame_Shift_Idel: "rgb(114, 158, 206)",
    Nonsense_Mutation: "rgb(237, 102, 93)"
}
    const result = {
        "Protein_Domain": [
            {
                "HGNC": "TP53",
                "refseq.ID": "NM_000546",
                "protein.ID": "NP_000537",
                "aa.length": 393,
                "Start": 109,
                "End": 288,
                "domain.source": "db_xref",
                "Label": "P53",
                "domain.anno": "P53 DNA-binding domain; cd08367",
                "pfam": "cd08367",
                "Description": "P53 DNA-binding domain",
                "domainCol": "#F3A683FF",
                "pos": 198.5
            },
            {
                "HGNC": "TP53",
                "refseq.ID": "NM_000546",
                "protein.ID": "NP_000537",
                "aa.length": 393,
                "Start": 319,
                "End": 359,
                "domain.source": "db_xref",
                "Label": "P53_tetramer",
                "domain.anno": "P53 tetramerisation motif; pfam07710",
                "pfam": "pfam07710",
                "Description": "P53 tetramerisation motif",
                "domainCol": "#F7D794FF",
                "pos": 339
            },
            {
                "HGNC": "TP53",
                "refseq.ID": "NM_000546",
                "protein.ID": "NP_000537",
                "aa.length": 393,
                "Start": 5,
                "End": 29,
                "domain.source": "db_xref",
                "Label": "P53_TAD",
                "domain.anno": "P53 transactivation motif; pfam08563",
                "pfam": "pfam08563",
                "Description": "P53 transactivation motif",
                "domainCol": "#778BEBFF",
                "pos": 17
            }
        ],
        "prot.snp.sumamry": [
            {
                "pos": 72,
                "conv": "P72R",
                "count": 1,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 73,
                "conv": "V73fs",
                "count": 5,
                "Variant_Classification": "Frame_Shift_Ins"
            },
            {
                "pos": 109,
                "conv": "F109fs",
                "count": 2,
                "Variant_Classification": "Frame_Shift_Del"
            },
            {
                "pos": 124,
                "conv": "C124*",
                "count": 2,
                "Variant_Classification": "Nonsense_Mutation"
            },
            {
                "pos": 145,
                "conv": "L145R",
                "count": 3,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 157,
                "conv": "V157F",
                "count": 12,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 158,
                "conv": "R158L",
                "count": 5,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 161,
                "conv": "A161T",
                "count": 3,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 179,
                "conv": "H179R",
                "count": 2,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 195,
                "conv": "I195F",
                "count": 3,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 197,
                "conv": "V197M",
                "count": 4,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 205,
                "conv": "Y205C",
                "count": 5,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 213,
                "conv": "R213*",
                "count": 8,
                "Variant_Classification": "Nonsense_Mutation"
            },
            {
                "pos": 213,
                "conv": "R213L",
                "count": 1,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 224,
                "conv": "E224E",
                "count": 11,
                "Variant_Classification": "Splice_Site"
            },
            {
                "pos": 238,
                "conv": "C238Y",
                "count": 5,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 239,
                "conv": "N239S",
                "count": 5,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 242,
                "conv": "C242Y",
                "count": 5,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 244,
                "conv": "G244S",
                "count": 4,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 245,
                "conv": "G245D",
                "count": 5,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 245,
                "conv": "G245C",
                "count": 5,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 245,
                "conv": "G245V",
                "count": 5,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 248,
                "conv": "R248G",
                "count": 2,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 249,
                "conv": "R249S",
                "count": 40,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 249,
                "conv": "R249M",
                "count": 1,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 262,
                "conv": "G262del",
                "count": 2,
                "Variant_Classification": "Splice_Site"
            },
            {
                "pos": 266,
                "conv": "G266*",
                "count": 5,
                "Variant_Classification": "Nonsense_Mutation"
            },
            {
                "pos": 273,
                "conv": "R273C",
                "count": 2,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 275,
                "conv": "C275S",
                "count": 1,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 275,
                "conv": "C275Y",
                "count": 5,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 294,
                "conv": "E294*",
                "count": 2,
                "Variant_Classification": "Nonsense_Mutation"
            },
            {
                "pos": 320,
                "conv": "K320*",
                "count": 3,
                "Variant_Classification": "Nonsense_Mutation"
            },
            {
                "pos": 337,
                "conv": "R337C",
                "count": 5,
                "Variant_Classification": "Missense_Mutation"
            },
            {
                "pos": 342,
                "conv": "R342*",
                "count": 5,
                "Variant_Classification": "Nonsense_Mutation"
            },
            {
                "pos": 351,
                "conv": "K351*",
                "count": 4,
                "Variant_Classification": "Nonsense_Mutation"
            },
            {
                "pos": 374,
                "conv": "G374C",
                "count": 1,
                "Variant_Classification": "Missense_Mutation"
            }
        ],
        "mutRate": 36.98,
        "NM": "NM_000546"
    }

    useEffect(() => {
        const ro = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width } = entry.contentRect;
                setDims({ width });
            }
        });
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        getLollipopPlotData({gene}).then((results) => {
        });
    }, [gene, samples]);

    const colors = ["#778beb", "#f3a683", "#f7d794"];

    useEffect(() => {
        if (!dims.width) return;
        const width = dims.width;
        const height = 600;
        const geneLength = 393;
        const exons = result.Protein_Domain.map((item, index) => {
            return {
                start: item.Start, end: item.End, color: colors[index], name: item.Label || ""
            }
        })
        const mutations = result['prot.snp.sumamry'].map((item) => {
            return { pos: item.pos, value: item.count, color: mutationTypeColorConfig[item.Variant_Classification] || "gray" };
        })

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('width', '100%')
            .style('height', '100%')
            .style('overflow', 'visible');

        const margin = { left: 50, right: 60, top: 20, bottom: 40 };
        const chartWidth = width - margin.left - margin.right;

        const xScale = d3.scaleLinear()
            .domain([0, geneLength])
            .range([margin.left, margin.left + chartWidth]);

        // 绘制基因线
        svg.append("rect")
            .attr("x", xScale(0))
            .attr("y", height / 2 - 7)
            .attr("width", xScale(geneLength) - xScale(0))
            .attr("height", 14)
            .attr("fill", "rgb(149, 165, 166)")
            .attr("stroke", "#555")
            .attr("stroke-width", 1);

        // 绘制外显子
        exons.forEach(exon => {
            svg.append("rect")
                .attr("x", xScale(exon.start))
                .attr("y", height / 2 - 10)
                .attr("width", xScale(exon.end) - xScale(exon.start))
                .attr("height", 20)
                .attr("fill", exon.color || "blue")
                .attr("stroke", "#555")
                .attr("stroke-width", 1);

            svg.append("text")
                .attr("x", xScale(exon.start) + (xScale(exon.end) - xScale(exon.start)) / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", "#000")
                .attr("font-size", "10px")
                .attr("pointer-events", "none")
                .text(exon.name || "");
        });

        // 创建Y轴比例尺（修正后的范围）
        const maxMutationValue = d3.max(mutations, d => d.value);
        // 修改Y轴比例尺（保持数值从下往上递增）
        const yScale = d3.scaleLinear()
            .domain([0.1, maxMutationValue])
            .range([height / 2 - 30, height / 2 - height * 0.4]); // 小值在下，大值在上

        // 修改为左侧Y轴
        const yAxis = d3.axisLeft(yScale)  // 改为 axisLeft
            .ticks(5)
            .tickSize(-chartWidth);  // 负值让网格线向右延伸

        // 调整Y轴位置（放到左侧）
        const yAxisGroup = svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)  // 移到左侧
            .call(yAxis);

        // 调整网格线样式
        yAxisGroup.select(".domain").remove();
        yAxisGroup.selectAll(".tick line")
            .attr("stroke", "#ddd")
            .attr("stroke-dasharray", "2,2")
            .attr("x2", chartWidth);  // 向右绘制网格线

        // Y轴标题位置调整（左侧）
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 15)  // 调整到左侧边缘
            .attr("x", -height / 2)
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .text("Mutation Value");

        // 绘制棒棒糖（使用修正后的yScale）
        mutations.forEach(mut => {
            svg.append("line")
                .attr("x1", xScale(mut.pos))
                .attr("y1", height / 2 - 10)
                .attr("x2", xScale(mut.pos))
                .attr("y2", yScale(mut.value))
                .attr("stroke", "gray")
                .attr("stroke-width", 1);

            svg.append("circle")
                .attr("cx", xScale(mut.pos))
                .attr("cy", yScale(mut.value))
                .attr("r", 5)
                .attr("fill", mut.color);
        });

        // 添加X轴
        const xAxis = d3.axisBottom(xScale);
        svg.append("g")
            .attr("transform", `translate(0, ${height / 2 + 20})`)
            .call(xAxis);
    }, [dims]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '600px' }}>
            <svg ref={svgRef} />
        </div>
    );
};

export default GeneLollipop;