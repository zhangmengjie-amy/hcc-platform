
import React, { useEffect, useRef, useState } from 'react';
const parser = require("biojs-io-newick");
import * as d3 from 'd3';
const ITolStyleTree = ({ newickString, width = 1000, height = 700 }) => {
  const svgRef = useRef();
  const [treeData, setTreeData] = useState(null);
  const [scale, setScale] = useState(1);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!newickString) return;
    
    // 解析Newick字符串
    try {
      const parsedData = parser.parse_newick(newickString);

      setTreeData(parsedData);
    } catch (error) {
      console.error("Failed to parse Newick string:", error);
    }
  }, [newickString]);

  useEffect(() => {
    if (!treeData) return;

    // 清除之前的渲染
    d3.select(svgRef.current).selectAll("*").remove();

    // 创建SVG容器 - iTOL风格背景
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("background", "#ffffff")
      .style("border", "1px solid #e0e0e0")
      .style("border-radius", "4px");

    // 创建一个分组用于平移和缩放
    const g = svg.append("g")
      .attr("transform", `translate(${transform.x},${transform.y}) scale(${scale})`);

    // 定义树布局 - iTOL使用横向布局
    const treeLayout = d3.tree()
      .size([height - 120, width - 200]) // 留出边距
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

    // 处理数据
    const root = d3.hierarchy(treeData);
    const treeDataLayout = treeLayout(root);

    // 计算缩放比例以适应视图
    const bounds = treeDataLayout.descendants().reduce((acc, d) => {
      return {
        x0: Math.min(acc.x0, d.x),
        x1: Math.max(acc.x1, d.x),
        y0: Math.min(acc.y0, d.y),
        y1: Math.max(acc.y1, d.y)
      };
    }, { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity });

    const dx = bounds.x1 - bounds.x0;
    const dy = bounds.y1 - bounds.y0;
    const initialScale = Math.min(0.8 * width / dx, 0.8 * height / dy);
    const initialX = (width - dx * initialScale) / 2 - bounds.x0 * initialScale;
    const initialY = (height - dy * initialScale) / 2 - bounds.y0 * initialScale;

    setTransform({ x: initialX, y: initialY });
    setScale(initialScale);

    // 绘制连接线 - iTOL风格的分支
    g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#4a4a4a") // iTOL使用深灰色分支
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 1.2) // 比默认稍细
      .selectAll("path")
      .data(treeDataLayout.links())
      .join("path")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));

    // 创建节点组
    const node = g.append("g")
      .selectAll("g")
      .data(treeDataLayout.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // 添加圆形节点 - iTOL使用小灰点
    node.append("circle")
      .attr("r", 2.5) // 非常小的节点
      .attr("fill", "#7f8c8d") // iTOL的灰色节点
      .attr("stroke", "none");

    // 添加分支长度标签（内部节点）
    node.filter(d => d.children && d.data.branchLength)
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", -8)
      .attr("y", 0)
      .text(d => d.data.branchLength.toFixed(3))
      .attr("text-anchor", "end")
      .attr("fill", "#7f8c8d") // 灰色文字
      .style("font-size", "9px")
      .style("font-family", "Arial, sans-serif");

    // 添加叶节点标签 - iTOL风格的科学名称
    node.filter(d => !d.children)
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", 6)
      .text(d => formatSpeciesName(d.data.name)) // 格式化物种名称
      .attr("text-anchor", "start")
      .attr("fill", "#2c3e50") // 深蓝色文字
      .style("font-size", "10px")
      .style("font-family", "Arial, sans-serif")
      .style("font-style", "italic") // 学名斜体
      .clone(true).lower()
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    // 添加比例尺 - iTOL风格
    const scaleBarLength = 0.1 * (bounds.y1 - bounds.y0); // 分支长度的10%
    g.append("line")
      .attr("x1", width - 100)
      .attr("x2", width - 100 - scaleBarLength)
      .attr("y1", height - 50)
      .attr("y2", height - 50)
      .attr("stroke", "#2c3e50")
      .attr("stroke-width", 1.5);

    g.append("text")
      .attr("x", width - 100 - scaleBarLength/2)
      .attr("y", height - 55)
      .text(`${scaleBarLength.toFixed(2)}`)
      .attr("text-anchor", "middle")
      .attr("fill", "#2c3e50")
      .style("font-size", "10px");

    // 添加缩放控制 - 更平滑的iTOL风格缩放
    svg.call(d3.zoom()
      .scaleExtent([0.2, 5])
      .on("zoom", (event) => {
        setScale(event.transform.k);
        setTransform({ x: event.transform.x, y: event.transform.y });
      }));

  }, [treeData, width, height]);

  // 格式化物种名称（模仿iTOL的显示方式）
  const formatSpeciesName = (name) => {
    if (!name) return "";
    // 替换下划线为空格
    let formatted = name.replace(/_/g, " ");
    // 首字母大写
    formatted = formatted.split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return formatted;
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} />
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '5px 10px',
        borderRadius: '3px',
        fontSize: '12px',
        color: '#2c3e50'
      }}>
        缩放: {(scale * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default ITolStyleTree;