"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";

const GeneCoding = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 0 });

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDims({ width });
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!dims.width) return;
    const width = dims.width;
    const height = 300;
    const geneLength = 1000;
    const exons = [
      { start: 50, end: 200, color: "lightblue", name: "P53_TAD" },
      { start: 300, end: 600, color: "rgb(243, 166, 131)", name: "P53_TAD" },
      { start: 700, end: 800, color: "rgb(247, 215, 148)", name: "P53_tetramer" },
    ];
    const mutations = [
      { pos: 120, value: 6 },
      { pos: 150, value: 5 },
      { pos: 350, value: 8 },
      { pos: 550, value: 3 },
      { pos: 750, value: 10 },
    ];

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "100%")
      .style("overflow", "visible");

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
      .range([height / 2 - 10, height / 2 - height * 0.4]); // 小值在下，大值在上

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
        .attr("fill", "lightgreen");
    });

    // 添加X轴
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
      .attr("transform", `translate(0, ${height / 2 + 20})`)
      .call(xAxis);


  }, [dims]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "300px" }}>
      <svg ref={svgRef} />
    </div>
  );
};

export default GeneCoding;