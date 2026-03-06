/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

const PlanetLiverSampleChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const element = chartRef.current;
    let width = element.offsetWidth;
    let height = element.offsetHeight;

    // 取宽高最小值
    const minSize = Math.min(width, height);
    width = minSize;
    height = minSize;

    // 从数据中提取肝脏直径和样本信息
    if (!data) return;
    const liverDiameter = parseFloat(data.tumor_size); // 假设所有样本的肿瘤大小相同
    const samples = data?.samples.map(sample => ({
      sample_id: sample.sample_id,
      x: parseFloat(sample.x),
      y: parseFloat(sample.y),
      r: parseFloat(sample.sample_r),
      tumor: sample.tumor ?? "",
      color: sample.color || "#E95D65",
    }));

    // Configuration
    const margin = { top: 35, right: 35, bottom: 45, left: 45 }; // Smaller margins
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const liverRadius = liverDiameter / 2;

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, liverDiameter])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, liverDiameter])
      .range([chartHeight, 0]);

    // Create SVG container
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add title
    svg.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -margin.top / 2 + 5) // Adjust position as needed
      .attr("text-anchor", "middle")
      .style("font-size", "12px") // Slightly smaller font
      .text(`${data.patientId}, Tumor Size: ${data.tumor_size}cm, Sample: ${(Number(data.samples[0].sample_r) * 2).toFixed(2)}cm`);

    // Draw the liver
    svg.append("circle")
      .attr("class", "liver")
      .attr("cx", xScale(liverRadius))
      .attr("cy", yScale(liverRadius))
      .attr("r", xScale(liverRadius)) // Use xScale to convert radius to pixels
      .style("fill", "#FDE4E1");

    // Draw samples
    const sampleGroup = svg.selectAll(".sample")
      .data(samples)
      .enter()
      .append("g") // Create a group for each sample
      .attr("class", "sample")
      .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`); // Position the group

    sampleGroup.append("circle") // Draw the sample circle
      .attr("r", d => xScale(d.r)) // Use xScale to convert radius to pixels
      .style("fill", d => d.color); // 根据color值设置颜色

    // Add sample ID text beside the circle
    sampleGroup.append("text")
      .attr("dx", d => xScale(d.r) + 3) // Horizontal offset: circle radius + 5px
      .attr("dy", 0) // Vertical alignment
      .style("alignment-baseline", "middle") // Vertically align text to the middle
      .style("font-size", "10px")
      .style("fill", "black")
      .text(d => d.tumor);

    // Create axes
    const numTicks = 5;
    const xTicks = xScale.ticks(numTicks);
    if (!xTicks.includes(xScale.domain()[1])) {
      xTicks.push(xScale.domain()[1]);
    }
    const xAxis = d3.axisBottom(xScale)
      .tickSizeOuter(0)
      .tickValues(xTicks)
      .tickFormat((d, i) => {
        return `${d}`; // Add "cm" label
      });

    const yTicks = yScale.ticks(numTicks);
    if (!yTicks.includes(yScale.domain()[1])) {
      yTicks.push(yScale.domain()[1]);
    }

    const yAxis = d3.axisLeft(yScale)
      .tickSizeOuter(0)
      .tickValues(yTicks)
      .tickFormat(d => `${d}`); // Add "cm" label

    // Draw axes
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(xAxis);

    svg.append("g")
      .attr("class", "axis")
      .call(yAxis);

    // Add X axis label
    svg.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + margin.bottom - 15) // Position label below the axis
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .text("X (cm)");

    // Add Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20) // Position label to the left of the axis
      .attr("x", 0 - (chartHeight / 2))
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .text("Y (cm)");

    return () => {
      // Cleanup on unmount
      d3.select(chartRef.current).select("svg").remove();
    };
  }, [data]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div id="chart" ref={chartRef} style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%" }}></div>
    </div>
  );
};

export default PlanetLiverSampleChart;