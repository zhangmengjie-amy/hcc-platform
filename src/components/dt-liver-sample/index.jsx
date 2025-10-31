import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DtLiverSampleChart = ({ data }) => {
    const chartRef = useRef(null);
    const legendRef = useRef(null);

    useEffect(() => {
        // 绘制主图表
        const element = chartRef.current;
        const container = element.parentElement;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // 计算主图表尺寸（占80%宽度）
        let width = containerWidth * 0.8;
        let height = containerHeight;

        // 取宽高最小值保持正方形
        const minSize = Math.min(width, height);
        width = minSize;
        height = minSize;

        // 从数据中提取肿瘤尺寸和样本信息
        if (!data) return;
        
        const tumorWidth = parseFloat(data.width)?.toFixed(2);
        const tumorHeight = parseFloat(data.height)?.toFixed(2);
        const samples = data?.samples.map(sample => ({
            sample_id: sample.sample_id,
            x: parseFloat(sample.x),
            y: parseFloat(sample.y),
            color: sample.color || "#E95D65" // 添加color字段
        }));

        // Configuration - 保持原来的边距不变
        const margin = { top: 35, right: 35, bottom: 45, left: 45 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, tumorWidth])
            .range([0, chartWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, tumorHeight])
            .range([chartHeight, 0]);

        // 使用固定的样本半径
        const sampleRadius = Math.min(chartWidth, chartHeight) * 0.04;


        // 定义渐变颜色
        const gradientColors = [
            "#9E0142", "#D53E4F", "#F46D43", "#FDAE61", 
            "#FEE08B", "#FFFFBF", "#E6F598", "#ABDDA4", 
            "#66C2A5", "#3288BD", "#5E4FA2"
        ];


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
            .attr("y", -margin.top / 2 + 5)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "normal")
            .text(`${data.patientId}, Tumor: ${tumorWidth}cm × ${tumorHeight}cm, Sample count: ${samples.length}`);

        // 添加背景图片
        const imageUrl = `/images/RNA_${data.patientId}.svg`;
        
        // 添加背景图片（不裁剪）
        svg.append("image")
            .attr("xlink:href", imageUrl)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("preserveAspectRatio", "none")
            .on("error", function() {
                d3.select(this).remove();
                svg.append("rect")
                    .attr("class", "tumor")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", chartWidth)
                    .attr("height", chartHeight)
                    .style("fill", "#FDE4E1")
            });

        // 添加肿瘤边框
        svg.append("rect")
            .attr("class", "tumor-border")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .style("fill", "none")

        // 智能生成刻度值
        const generateSmartTicks = (scale, numTicks) => {
            let ticks = scale.ticks(numTicks);
            const domain = scale.domain();
            
            if (ticks.length > 2) {
                const tickSpacing = ticks[1] - ticks[0];
                
                if (ticks[0] - domain[0] < tickSpacing / 3) {
                    ticks = ticks.slice(1);
                }
                
                if (domain[1] - ticks[ticks.length - 1] < tickSpacing / 3) {
                    ticks = ticks.slice(0, -1);
                }
            }
            
            if (!ticks.includes(domain[0])) {
                ticks.unshift(domain[0]);
            }
            if (!ticks.includes(domain[1])) {
                ticks.push(domain[1]);
            }
            
            return ticks;
        };

        // Create axes with smart ticks
        const xTicks = generateSmartTicks(xScale, 5);
        const yTicks = generateSmartTicks(yScale, 5);

        const xAxis = d3.axisBottom(xScale)
            .tickSizeOuter(0)
            .tickValues(xTicks)
            .tickFormat(d => `${d}`);

        const yAxis = d3.axisLeft(yScale)
            .tickSizeOuter(0)
            .tickValues(yTicks)
            .tickFormat(d => `${d}`);

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
            .attr("y", chartHeight + margin.bottom - 15)
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .text("X (cm)");

        // Add Y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (chartHeight / 2))
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .text("Y (cm)");

        // Draw samples
        const sampleGroup = svg.selectAll(".sample")
            .data(samples)
            .enter()
            .append("g")
            .attr("class", "sample")
            .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`);

        // 绘制样本圆圈 - 根据color值设置颜色
        sampleGroup.append("circle")
            .attr("r", sampleRadius)
            .style("fill", d => d.color) // 根据color值设置颜色
            .style("stroke", "#fff")
            .style("stroke-width", 1);

        // 在圆圈中心添加样本ID文本
        sampleGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .style("font-size", () => {
                const baseSize = Math.max(8, sampleRadius * 0.8);
                return `${Math.min(baseSize, 12)}px`;
            })
            .style("fill", "white")
            .style("font-weight", "bold")
            .style("pointer-events", "none")
            .text(d => {
                const parts = d.sample_id.split('_');
                return parts[parts.length - 1];
            });

        svg.selectAll(".sample").raise();

        // 绘制色条
        const legendElement = legendRef.current;
        const legendWidth = 80;
        const legendHeight = height;

        const legendSvg = d3.select(legendRef.current)
            .append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        // 创建渐变定义
        const defs = legendSvg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "color-gradient")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%");

        gradientColors.forEach((color, i) => {
            gradient.append("stop")
                .attr("offset", `${(i / (gradientColors.length - 1)) * 100}%`)
                .attr("stop-color", color);
        });

        // 色条尺寸和位置
        const legendBarWidth = 20;
        const legendBarHeight = legendHeight * 0.6;
        const legendX = 5;
        const legendY = (legendHeight - legendBarHeight) / 2;

        // 绘制色条
        legendSvg.append("rect")
            .attr("x", legendX)
            .attr("y", legendY)
            .attr("width", legendBarWidth)
            .attr("height", legendBarHeight)
            .style("fill", "url(#color-gradient)")
            // .style("stroke", "#000")
            // .style("stroke-width", 1);

        // 添加色条刻度标签
        const legendScale = d3.scaleLinear()
            .domain([data.legend[0], data.legend[data.legend.length - 1]])
            .range([legendY + legendBarHeight, legendY]);

        data.legend.forEach(value => {
            const yPos = legendScale(value);

            // // 添加白色分割线（贯穿整个色条）
            // legendSvg.append("line")
            //     .attr("x1", legendX)
            //     .attr("x2", legendX + legendBarWidth)
            //     .attr("y1", yPos)
            //     .attr("y2", yPos)
            //     .style("stroke", "white")
            //     .style("stroke-width", 1)
            //     .style("opacity", 0.8);
            
            legendSvg.append("line")
                .attr("x1", legendX + legendBarWidth)
                .attr("x2", legendX + legendBarWidth + 5)
                .attr("y1", yPos)
                .attr("y2", yPos)
                .style("stroke", "#000")
                .style("stroke-width", 1);

            legendSvg.append("text")
                .attr("x", legendX + legendBarWidth + 8)
                .attr("y", yPos)
                .attr("dy", "0.3em")
                .style("font-size", "10px")
                .style("text-anchor", "start")
                .text(value);
        });

        // 添加色条标题
        legendSvg.append("text")
            .attr("x", legendX + legendBarWidth / 2)
            .attr("y", legendY - 10)
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .style("font-weight", "normal")
            .text("ITH");

        return () => {
            d3.select(chartRef.current).select("svg").remove();
            d3.select(legendRef.current).select("svg").remove();
        };
    }, [data]);

    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div 
                ref={chartRef} 
                style={{ 
                    width: '80%', 
                    height: '100%',
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            />
            <div 
                ref={legendRef} 
                style={{ 
                    width: '80px', 
                    height: '100%',
                    flexShrink: 0,
                    marginLeft: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            />
        </div>
    );
};

export default DtLiverSampleChart;