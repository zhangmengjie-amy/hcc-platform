import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Popover } from "antd";
import styles from "./style.module.scss";

const heatmapCellSize = 20;
const heatmapPadding = 10;

const HorizontalTree = ({ data, color, adaptive, sampleGeneData, heatmapFields = [], heatmapData = {}, alignLabel = false }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [tooltipState, setTooltipState] = useState({ visible: false, x: 0, y: 0, data: null });
  // 1) 监听容器尺寸
  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDims({ width, height });
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  function showCustomTooltip(event, data) {
    event.preventDefault();
    setTooltipState({
      visible: true,
      x: event.offsetX,
      y: event.offsetY,
      data,
    });
  }

  function hideCustomTooltipMenu() {
    setTooltipState({ visible: false, x: 0, y: 0, data: null });
  }

  function formatLabel(str) {
    // ^.*?_.*?_  匹配「开头任意+第一个下划线+任意+第二个下划线」
    return str?.replace(/^.*?_.*?_/, "") ?? "";
  }

  // 2) 绘制
  useEffect(() => {
    if (!data || dims.width === 0 || dims.height === 0) return;

    const showHeatMap = heatmapFields.length > 0 && heatmapData && Object.keys(heatmapData)?.length;
    const hmWidth = heatmapFields.length * heatmapCellSize;

    const svg = d3.select(svgRef.current)
      .style("width", "100%")
      .style("height", adaptive ? "100%" : "auto")
      .style("position", "relative")
      .style("overflow", "visible")
      .on("contextmenu", event => event.preventDefault());

    svg.selectAll("*").remove();

    const padY = 20, tickSize = 5;
    const margin = { top: 30, right: 20, bottom: padY + tickSize + 50, left: 20 };

    const root = d3.hierarchy(data, d => d.branchset);
    root.each(d => d.cum = (d.parent ? d.parent.cum : 0) + (d.data.length || 0));
    const leaves = root.leaves();
    const availableH = dims.height - margin.top - margin.bottom;
    const treeBodyHeight = adaptive
      ? availableH
      : heatmapCellSize * (leaves.length - 1);

    const dy = adaptive
      ? treeBodyHeight / (leaves.length - 1)
      : heatmapCellSize;
    leaves.forEach((d, i) => d.y = i * dy);
    root.eachAfter(d => { if (d.children) d.y = d3.mean(d.children, c => c.y); });

    const totalSvgHeight = adaptive
      ? dims.height
      : margin.top + treeBodyHeight + margin.bottom;

    svg
      .attr("viewBox", `0 0 ${dims.width} ${totalSvgHeight}`)
    // 当 adaptive = false 时，给一个固定像素高度；否则留给外层 div 的 100%
      .style("height", adaptive ? "100%" : `${totalSvgHeight}px`);
    // 然后把 height 变量赋给 treeBodyHeight
    const xMax = d3.max(root.descendants(), d => d.cum);

    // 1) 初始设置 margin.right（不考虑 label，只考虑 heatmap）
    const extraRightPadding = 30; // 增加额外的右侧内边距
    const heatmapRightPadding = showHeatMap ? 20 : 0; // 热图右侧间距
    const baseMarginRight =
            (showHeatMap ? heatmapPadding + hmWidth + heatmapRightPadding : extraRightPadding); // 修改这里，增加 extraRightPadding 和 heatmapRightPadding

    // 2) 先算可画宽度、xScale、并给每个叶子算个初始 d.x
    const width0 = dims.width - margin.left - baseMarginRight;
    const xScale0 = d3.scaleLinear([0, xMax], [0, width0]);
    root.each(d => (d.x = xScale0(d.cum)));

    // 3) 测量每个叶子的 label 宽度，计算它需要的「超出宽度」：
    //    overflow = d.x + labelGap + labelWidth - width0
    const measurer = svg.append("text")
      .attr("visibility", "visible")
      .attr("font-size", 14);

    const labelGap = 5;
    const maxOverflow = d3.max(leaves, d => {
      const name = formatLabel(d.data.name) || "";
      measurer.text(name);
      const w = measurer.node().getBBox().width;
      return Math.max(0, d.x + labelGap + w - width0);
    }) || 0;

    measurer.remove();

    // 4) 最终的 margin.right = base + maxOverflow
    margin.right = baseMarginRight + maxOverflow;

    // 5) 用新的 margin.right 重新算 width、xScale，一切按新的布局去画
    const width = dims.width - margin.left - margin.right;
    const xScale = d3.scaleLinear([0, xMax], [0, width]);
    root.each(d => (d.x = xScale(d.cum)));

    // —— zoomable group ——
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const yMaxLeaf = d3.max(leaves, d => d.y);
    const xTicks = xScale.ticks(10);

    g.append("g")
      .attr("class", styles.grid)
      .selectAll("line")
      .data(xTicks.filter((_, i) => i > 0))
      .enter().append("line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", yMaxLeaf)
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "4,4");

    // const zoomBehavior = d3.zoom()
    //     .scaleExtent([0.5, 5])
    //     .on('zoom', e => g.attr('transform', e.transform));
    // svg.call(zoomBehavior);

    // —— 在绘制连线之前 ——
    const links = root.links();

    // —— 去重：只保留每对 (source.x, target.y) 的第一条 ——
    const seenVert = new Set();
    const uniqueVertLinks = links.filter(l => {
      // 对于垂直线，我们关心的关键坐标是：x 固定为 source.x，y1 = source.y, y2 = target.y
      // 只要 x,target.y 相同，就认为是重复的竖线
      const key = `${l.source.x}|${l.target.y}`;
      if (seenVert.has(key)) return false;
      seenVert.add(key);
      return true;
    });

    // —— 纵线（只用去重后的 uniqueVertLinks）——
    g.selectAll("path.vert")
      .data(uniqueVertLinks)
      .enter().append("path")
      .attr("class", styles.vertlink)
      .attr("d", link => `M${link.source.x},${link.source.y}V${link.target.y}`);

    // —— 横线（如果也有重叠，再同理去重）——
    const seenHorz = new Set();
    const uniqueHorzLinks = links.filter(l => {
      // 横线关键坐标：y 固定为 target.y，x1 = source.x, x2 = target.x
      const key = `${l.source.x}|${l.target.y}|${l.target.x}`;
      if (seenHorz.has(key)) return false;
      seenHorz.add(key);
      return true;
    });
    const leafN = root
      .leaves()
      .find(d => formatLabel(d.data.name) === "N");
    g.selectAll("path.horz")
      .data(uniqueHorzLinks)
      .enter().append("path")
      .attr("class", styles.horzlink)
      .attr("d", link => {
        const x0 = Math.round(link.source.x);
        const dx = Math.round(link.target.x - link.source.x);
        return `M${x0},${Math.round(link.target.y)}h${dx}`;
      }).attr("stroke", d => d.target === leafN ? "rgb(29, 86, 126)" : "rgb(127, 127, 127)")
      .attr("stroke-width", d => d.target === leafN ? 2 : 1.5)
      .on("click", (event, link) => {
        event.stopPropagation();
        const branchNode = link.target;

        d3.select(event.currentTarget)
          .classed(styles.highlight, true);
        showCustomTooltip(event, {
          name: branchNode.data.name || "",
          length: branchNode.data.length,
          samples: branchNode.data.samples,
          geneData: branchNode.data.geneData,
        });
      })
      .on("pointerover", (event, link) => {
        event.stopPropagation();
        // 给当前路径打高亮

        g.selectAll(`path.${styles.horzlink}`).classed(styles.highlight, false);
        g.selectAll(`path.${styles.vertlink}`).classed(styles.highlight, false);
        g.selectAll("circle")
          .classed(styles.highlightNode, false);

        d3.select(event.currentTarget)
          .classed(styles.highlight, true);

        const branchNode = link.target;
        showCustomTooltip(event, {
          name: branchNode.data.name || "",
          length: branchNode.data.length,
          samples: branchNode.data.samples,
          geneData: branchNode.data.geneData,
        });
      })
      .on("pointerout", (event, link) => {
        event.stopPropagation();
        // 取消高亮
        d3.select(event.currentTarget)
          .classed(styles.highlight, false);
        g.selectAll(`path.${styles.horzlink}`).classed(styles.highlight, false);
        g.selectAll(`path.${styles.vertlink}`).classed(styles.highlight, false);
        g.selectAll("circle")
          .classed(styles.highlightNode, false);
        hideCustomTooltipMenu();
      });


    const heatmapStartX = showHeatMap
      ? dims.width - hmWidth - margin.left - heatmapRightPadding  // 这里跟画 heatmap 时的 startPos 保持一致
      : xScale(xMax);                       // 如果没 heatmap，就对齐到最长分支末端

    const labelGapToHeatmap = 5;   // label 与 heatmap 之间留 5px
    const labelAlignX = heatmapStartX - labelGapToHeatmap;

    // 找出最长分支对应的叶子节点
    const maxLeaf = leaves.reduce((a, b) => (a.cum > b.cum ? a : b), leaves[0]);

    // ---- 节点 & 文本 ----
    const node = g.selectAll("g.node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", d => d.children ? styles.node : `${styles.node} ${styles.leaf}`)
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // 只给叶子加 circle
    const leavesNodes = node.filter(d => !d.children);
    leavesNodes
      .append("circle")
      .attr("r", 6)
      .attr("fill", color ?? "rgb(212,110,64)");

    // 如果需要对齐，就先画虚线
    if (alignLabel) {
      leavesNodes
        .filter(d => formatLabel(d.data.name) != "N" || d != maxLeaf)
        .append("line")
        .attr("x1", 6)    // circle 半径
        .attr("y1", 0)
      // 线到文字起点再往左 20px
      // 修改这里，计算虚线的终点 x 坐标
        .attr("x2", d => {
          const maxLeafX = maxLeaf.x; // 最长分支圆圈中心的 x 坐标
          const endX = maxLeafX - d.x; // 虚线终点相对于当前节点的偏移量
          return Math.max(endX - 6, (labelAlignX - d.x) - maxOverflow); // 确保不超出 labelAlignX
        })
        .attr("y2", 0)
        .attr("stroke", "#999")
        .attr("stroke-dasharray", "2,2");
    }

    // 最后 append text
    leavesNodes
      .append("text")
      .text(d => formatLabel(d.data.name) || "")
      .attr("dy", "0")
      .attr("x", d => {
        if (alignLabel) {
          return labelAlignX - d.x + (showHeatMap ? 0 : extraRightPadding);
        } else {
          return 10;
        }
        // 默认紧跟在 circle 右侧
      })
      .attr("text-anchor", d => {
        return alignLabel ? "end" : "start";
      })
      .style("font-size", "12px");

    // 叶子圆点
    node.filter(d => !d.children)
      .append("circle")
      .attr("r", 6)
      .attr("fill", color ?? "rgb(212, 110, 64)")
      .on("click", (event, d) => {
        event.stopPropagation();
        showCustomTooltip(event, {
          name: d?.data?.name || "",
          length: d?.data?.length,
          samples: d?.data?.samples,
          geneData: sampleGeneData?.[d?.data?.name],
        });
        // 1) 找到叶子名字为 "N" 的节点
        const leafN = root.descendants()
          .find(n => formatLabel(n.data.name) === "N");
        if (!leafN) return;

        // 2) 各自的祖先链（包括自己）
        const ancestorsD = d.ancestors();    // [d, parent, ..., root]
        const ancestorsN = leafN.ancestors(); // [leafN, parent, ..., root]

        // 3) 找最低公共祖先 LCA
        const setD = new Set(ancestorsD);
        const lca = ancestorsN.find(n => setD.has(n));
        if (!lca) return;

        // 4) 拼出整条路径：d → … → LCA → … → N
        const pathUp = ancestorsD.slice(0, ancestorsD.indexOf(lca) + 1);   // [d, …, LCA]
        const pathDown = ancestorsN.slice(0, ancestorsN.indexOf(lca)).reverse(); // [child of LCA, …, N]
        const fullPath = pathUp.concat(pathDown);

        // 5) 高亮「无向」相邻的所有 link
        g.selectAll(`path.${styles.horzlink}, path.${styles.vertlink}`)
          .classed(styles.highlight, link => {
            const i = fullPath.indexOf(link.source);
            const j = fullPath.indexOf(link.target);
            return i >= 0 && j >= 0 && Math.abs(i - j) === 1;
          });

        // （可选）同时高亮这条路径上的节点圆点
        g.selectAll("circle")
          .classed(styles.highlightNode, nodeDatum => fullPath.includes(nodeDatum));
      })
      .on("pointerover", (event, d) => {
        event.stopPropagation();
        showCustomTooltip(event, {
          name: d?.data?.name || "",
          length: d?.data?.length,
          samples: d?.data?.samples,
          geneData: sampleGeneData?.[d?.data?.name],
        });
        // 1) 找到叶子名字为 "N" 的节点
        const leafN = root.descendants()
          .find(n => formatLabel(d.data.name) === "N");
        if (!leafN) return;

        // 2) 各自的祖先链（包括自己）
        const ancestorsD = d.ancestors();    // [d, parent, ..., root]
        const ancestorsN = leafN.ancestors(); // [leafN, parent, ..., root]

        // 3) 找最低公共祖先 LCA
        const setD = new Set(ancestorsD);
        const lca = ancestorsN.find(n => setD.has(n));
        if (!lca) return;

        // 4) 拼出整条路径：d → … → LCA → … → N
        const pathUp = ancestorsD.slice(0, ancestorsD.indexOf(lca) + 1);   // [d, …, LCA]
        const pathDown = ancestorsN.slice(0, ancestorsN.indexOf(lca)).reverse(); // [child of LCA, …, N]
        const fullPath = pathUp.concat(pathDown);

        // 5) 高亮「无向」相邻的所有 link
        g.selectAll(`path.${styles.horzlink}, path.${styles.vertlink}`)
          .classed(styles.highlight, link => {
            const i = fullPath.indexOf(link.source);
            const j = fullPath.indexOf(link.target);
            return i >= 0 && j >= 0 && Math.abs(i - j) === 1;
          });

        // （可选）同时高亮这条路径上的节点圆点
        g.selectAll("circle")
          .classed(styles.highlightNode, nodeDatum => fullPath.includes(nodeDatum));
      })
      .on("pointerout", (event) => {
        event.stopPropagation();
        hideCustomTooltipMenu();
        g.selectAll(`path.${styles.horzlink}`).classed(styles.highlight, false);
        g.selectAll(`path.${styles.vertlink}`).classed(styles.highlight, false);
        g.selectAll("circle")
          .classed(styles.highlightNode, false);
      });

    // —— 底部比例尺 ——
    const step = d3.tickStep(0, xMax, 2);
    const rawBarPx = xScale(step) - xScale(0);
    const scaleFactor = 0.2;      // 0.5 表示 50% 长度
    const barPx = rawBarPx * scaleFactor;

    const x0 = 0, y0 = yMaxLeaf + padY;

    const scaleBar = g.append("g").attr("class", styles.scaleBar);
    scaleBar.append("line")
      .attr("x1", x0).attr("y1", y0)
      .attr("x2", x0 + barPx).attr("y2", y0);
    [0, barPx].forEach(dx => {
      scaleBar.append("line")
        .attr("x1", x0 + dx).attr("y1", y0 - tickSize / 2)
        .attr("x2", x0 + dx).attr("y2", y0 + tickSize / 2);
    });
    scaleBar.append("text")
      .attr("x", x0)
      .attr("y", y0 - tickSize)
      .attr("text-anchor", "start")
      .attr("dx", "28px") // 稍微向右偏移，具体数值可能需要调整
      .text("Scale line: " + step * scaleFactor);

    if (showHeatMap) {
      const heatmapRightPadding = showHeatMap ? 20 : 0;
      const startPos = dims.width - hmWidth - margin.left - heatmapRightPadding;
      const gHeat = g
        .append("g")
        .attr("transform", `translate(${startPos},0)`)
        .attr("class", styles.heatmap);

      const xHeat = d3
        .scaleBand()
        .domain(heatmapFields)
        .range([0, hmWidth])
        .padding(0.05);

      // 底部字段名
      // 假设你在上面已经计算了 yMaxLeaf（叶子最大 y 值）和 heatmapCellSize

      // 用最后一个 leaf（yMaxLeaf）来定底部轴线位置，并且用动态 cellHeight
      const cellHeight = adaptive ? Math.min(dy, heatmapCellSize) : heatmapCellSize;
      const axisY = yMaxLeaf + cellHeight / 2 + 6;

      gHeat
        .append("g")
        .attr("transform", `translate(0, ${axisY})`)
        .call(
          d3
            .axisBottom(xHeat)
            .tickSize(0)
            .tickPadding(4),
        )
        .call(g => g.select(".domain").remove())
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .attr("text-anchor", "start")
        .attr("dy", "0")
        .attr("dx", "-15")
        .style("font-size", "12px");

      // 每个叶子一行
      leaves
        .filter(d => formatLabel(d.data.name) !== "N")
        .forEach(leaf => {
          heatmapFields.forEach(field => {
            const v = heatmapData?.[leaf.data.name]?.[field] ?? 0;
            gHeat
              .append("rect")
              .attr("x", xHeat(field))
              .attr("y", leaf.y - cellHeight / 2)
              .attr("width", xHeat.bandwidth())
              .attr("height", cellHeight)
              .attr("fill", v.color ?? "#f0f0f0")
              .attr("stroke", "#fff")
              .attr("stroke-width", 1)
              .append("title")
              .text(`${field}: ${v.value ?? "None"}`);
          });
        });
    }
  }, [data, dims, heatmapFields, heatmapData]);

  const clearHighlights = useCallback(() => {
    const svg = d3.select(svgRef.current);
    // 清除所有路径的 highlight
    svg.selectAll(`path.${styles.highlight}`)
      .classed(styles.highlight, false);
    // 清除所有圆点的 highlightNode
    svg.selectAll(`circle.${styles.highlightNode}`)
      .classed(styles.highlightNode, false);
    setTooltipState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.treeContainer}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <svg ref={svgRef} onClick={() => {
        tooltipState?.visible && clearHighlights();
      }} />

      {tooltipState?.visible && <Popover trigger="hover" fresh placement="right" content={(
        <div
          style={{
            width: "350px",
            overflowY: "auto",
            maxHeight: "50vh",
            borderRadius: "8px",
          }}
        >
          <div style={{ marginBottom: "10px", fontSize: "18px" }}>
            <strong>Current Branch Info</strong>
          </div>
          <p style={{ marginBottom: "10px" }}><span style={{ fontWeight: "lighter" }}>Sample:</span> <span style={{ lineHeight: "24px", fontWeight: "bold", fontSize: "16px" }}> {tooltipState?.data?.samples?.join(", ") ?? "None"}</span></p>
          <p style={{ marginBottom: "0" }}><span style={{ fontWeight: "lighter" }}>Protein-coding region mutations:</span><span style={{ fontWeight: "bold" }}> {(tooltipState?.data?.geneData?.driver?.length ?? 0) + (tooltipState?.data?.geneData?.nonDriver?.length ?? 0)}</span></p>
          <p style={{ marginBottom: "0" }}><span style={{ fontWeight: "lighter" }}>Driver Gene: </span><span style={{ fontWeight: "bold" }}> {tooltipState?.data?.geneData?.driver?.length ?? 0} </span></p>
          <p style={{ marginBottom: "0", fontSize: "14px", overflowY: "auto", wordBreak: "break-word", lineHeight: "24px", marginBottom: 0 }}>{
            tooltipState?.data?.geneData?.driver.map((item, index) => {
              return (
                <><span key={item} style={{ color: "#000", fontWeight: "bold" }}>{item.split("/")[0]}</span>
                  <span key={index + 1} style={{ color: "#666" }}>({item.split("/")[1]})</span></>
              );
            })
          }</p>
          <div style={{ marginBottom: "0" }}><span style={{ fontWeight: "lighter" }}>None Driver Gene: </span><span style={{ fontWeight: "bold" }}> {tooltipState?.data?.geneData?.nonDriver?.length ?? 0} </span></div>
          <div style={{ fontSize: "14px", overflowY: "auto", wordBreak: "break-word", lineHeight: "24px", marginBottom: 0 }}>
            {
              tooltipState?.data?.geneData?.nonDriver.map((item, index) => {
                return (
                  <div key={item}><span key={item} style={{ color: "#000", fontWeight: "bold" }}>{item.split("/")[0]}</span>
                    <span key={index + 1} style={{ color: "#666" }}>({item.split("/")[1]})</span>)</div>
                );
              })
            }
          </div>
        </div>
      )} open>
        <div style={{
          position: "absolute",
          top: tooltipState.y,
          left: tooltipState.x,
        }}></div>
      </Popover>}
    </div>
  );
};

export default HorizontalTree;