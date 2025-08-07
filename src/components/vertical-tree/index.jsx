"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Popover } from 'antd';
import * as d3 from 'd3'


const margin = 20
const circleRadius = 8
const fontSize = 14
const labelPadding = 2
const scaleOffset = 20       // 新增：刻度线相对分支的水平偏移量
const VerticalTree = ({
    sampleMutations,
    data,
    color,
    genes =  ["CTNNB1/g.chr1:248764615T>C", "KMT2D/g.chr3:35253149A>T", "TP53/g.chr7:108685025C>A"]
}) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [dims, setDims] = useState({ width: 0, height: 0 });
    const [tooltipState, setTooltipState] = useState({ visible: false, x: 0, y: 0, data: null });

    useEffect(() => {
        const ro = new ResizeObserver(entries => {
            for (let entry of entries) {
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
            data
        });
    }

    useEffect(() => {
        if (!data || dims.width === 0 || dims.height === 0) return;

        const W = dims.width
        const H = dims.height
        const padX = margin

        // 1) 解析 Newick，构造层次 & 排序

        const root = d3.hierarchy(data, d => d.branchset)
            .sort((a, b) => (a.data.name || '').localeCompare(b.data.name || '', undefined, { numeric: true }))
        root.eachBefore(d => {
            d.y0 = d.parent ? d.parent.y0 + (d.data.length || 0) : 0
        })

        // 2) 标记 outgroupNode（名字为 'N'）
        const outgroupNode = root.descendants().find(d => d.data.name === 'N')
        if (outgroupNode && outgroupNode.parent) {
            outgroupNode.descendants().forEach(d => d.data.__out = true)
        }

        // 3) X 方向布局
        const leaves = root.leaves()
        const xScale = d3.scalePoint()
            .domain(d3.range(leaves.length))
            .range([padX, W - 2 * padX + padX])
        leaves.forEach((d, i) => d.x = xScale(i) + padX)
        root.eachAfter(d => {
            if (d.children) {
                const good = d.children.filter(c => !c.data.__out)
                d.x = good.length
                    ? d3.mean(good, c => c.x)
                    : d.parent.x
            }
        })

        // 4) Y 方向缩放，考虑 outgroup 上下
        let P, y0P, maxUp, maxDown
        if (outgroupNode && outgroupNode.parent) {
            P = outgroupNode.parent
            y0P = P.y0
            maxUp = d3.max(root.descendants().filter(d => !d.data.__out), d => d.y0) - y0P
            maxDown = d3.max(outgroupNode.descendants(), d => d.y0) - y0P
        } else {
            P = root
            y0P = 0
            maxUp = d3.max(root.descendants(), d => d.y0)
            maxDown = 0
        }
        // padY 用来控制上下空白，需留出 circleRadius + labelPadding + fontSize 的空间
        const extraY = circleRadius + labelPadding + fontSize
        const padY = margin + extraY

        // 真正可用的高度要除去上下两段 padY
        const scaleY = (H - 2 * padY) / (maxUp + maxDown)
        // 根节点的 y 固定在 padY + 上游高度
        P.y = padY + maxUp * scaleY
        root.descendants().forEach(d => {
            const dy = (d.y0 - y0P) * scaleY
            d.y = d.data.__out ? P.y + dy : P.y - dy
        })

        // 5) 初始化 SVG
        const svg = d3.select(svgRef.current)
            .attr('viewBox', `0 0 ${W} ${H}`)
            .style('width', '100%').style('height', '100%')
            .style('overflow', 'visible')
            .on('contextmenu', e => e.preventDefault())
        svg.selectAll('*').remove()

        // 6) 主体 <g class="tree">
        const g = svg.append('g').attr('class', 'tree')

        // 6.1) 绘制连线
        g.selectAll('path.link')
            .data(root.links())
            .enter().append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#555')
            .attr('stroke-width', 1.5)
            .attr('d', d => (
                d.source.data.__out || d.target.data.__out
                    ? `M${P.x},${d.source.y}V${d.target.y}`
                    : `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`
            ))

        // const zoomBehavior = d3.zoom()
        //     .scaleExtent([0.5, 5])
        //     .on('zoom', e => g.attr('transform', e.transform));
        // svg.call(zoomBehavior);

        // 6.2) 叶子节点及文字
        const leafG = g.selectAll('g.leaf')
            .data(leaves)
            .enter().append('g')
            .attr('class', 'leaf')
            .attr('transform', d => {
                const x = d.data.__out ? P.x : d.x
                return `translate(${x},${d.y})`
            })
        leafG.append('circle')
            .attr('r', circleRadius)
            .attr('fill', color)
            .attr('stroke', '#555')
            .attr('stroke-width', 1.5)
        leafG.append('text')
            .attr('font-size', fontSize)
            .attr('fill', '#000')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', d => d.data.__out ? 'hanging' : 'text-after-edge')
            .attr('y', d => d.data.__out
                ? circleRadius + labelPadding
                : -(circleRadius + labelPadding))
            .text(d => (d.data.name || '').replace(/^.*?_.*?_/, ''))




        // 2) 工具：给定两个节点 a, b，返回它们在树中连通路径上的所有节点
        function getPathNodes(a, b) {
            // 先把 a 和 b 往上走到 root，记录两个 ancestor 列表
            const ancestorsA = new Set()
            let cur = a
            while (cur) { ancestorsA.add(cur); cur = cur.parent }
            // 找 b→root 上第一个也在 ancestorsA 里的，就是 LCA
            cur = b
            let LCA = null
            while (cur) {
                if (ancestorsA.has(cur)) { LCA = cur; break }
                cur = cur.parent
            }
            // 再从 a 和 b 分别走到 MRCA，把沿途所有节点收集到一个 Set
            const pathNodes = new Set()
            cur = a
            while (cur) {
                pathNodes.add(cur)
                if (cur === LCA) break
                cur = cur.parent
            }
            cur = b
            while (cur) {
                pathNodes.add(cur)
                if (cur === LCA) break
                cur = cur.parent
            }
            return pathNodes
        }

        // 收集所有 circle
        const allCircles = g.selectAll('g.leaf circle, g.N-node circle');

        // 点击或 hover 链路的逻辑（和前面一样）
        const allLinks = g.selectAll('path.link');


        allLinks.style('cursor', 'pointer')
            .on('pointerover', function (event, link) {
                const branchNode = link.target;
                showCustomTooltip(event, {
                    name: branchNode.data.name || "",
                    length: branchNode.data.length,
                    samples: branchNode.data.samples,
                    mutations: branchNode.data.mutations
                });
                allLinks.style('stroke', '#555')
                    .style('stroke-width', 1.5);

                allCircles
                    .style('fill', color);

                // 1) 高亮当前 link
                d3.select(this)
                    .transition().duration(100)
                    .style('stroke', '#d46e40')
                    .style('stroke-width', 3);
            }).on('click', function (event, link) {
                const branchNode = link.target;
                showCustomTooltip(event, {
                    name: branchNode.data.name || "",
                    length: branchNode.data.length,
                    samples: branchNode.data.samples,
                    mutations: branchNode.data.mutations
                });
                allLinks.style('stroke', '#555')
                    .style('stroke-width', 1.5);

                allCircles
                    .style('fill', color);

                // 1) 高亮当前 link
                d3.select(this)
                    .transition().duration(100)
                    .style('stroke', '#d46e40')
                    .style('stroke-width', 3);
            })

        function getPathNodes(a, b) {
            const ancestors = new Set();
            let cur = a;
            while (cur) { ancestors.add(cur); cur = cur.parent; }
            // 找 LCA
            cur = b;
            let LCA = null;
            while (cur) {
                if (ancestors.has(cur)) { LCA = cur; break; }
                cur = cur.parent;
            }
            const path = new Set();
            cur = a;
            while (cur) { path.add(cur); if (cur === LCA) break; cur = cur.parent; }
            cur = b;
            while (cur) { path.add(cur); if (cur === LCA) break; cur = cur.parent; }
            return path;
        }


        // 给 leaf circles 绑事件
        leafG.selectAll('circle')
            .style('cursor', 'pointer')
            .on('pointerover', function (event, d) {

                event.stopPropagation();
                showCustomTooltip(event, {
                    name: d?.data?.name || "",
                    length: d?.data?.length,
                    samples: d?.data?.samples,
                    mutations: sampleMutations?.[d?.data?.name]
                });
                const pathNodes = getPathNodes(d, outgroupNode);




                // highlight circles
                allCircles
                    .style('fill', nodeDatum =>
                        pathNodes.has(nodeDatum) ? '#ff4500' : color
                    );


                if (d?.data?.name === 'N') return
                // highlight links

                allLinks
                    .style('stroke', l => pathNodes.has(l.target) ? '#d46e40' : '#555')
                    .style('stroke-width', l => pathNodes.has(l.target) ? 3 : 1.5);

            }).on('click', function (event, d) {
                event.stopPropagation();
                showCustomTooltip(event, {
                    name: d?.data?.name || "",
                    length: d?.data?.length,
                    samples: d?.data?.samples,
                    mutations: sampleMutations?.[d?.data?.name]
                });
                const pathNodes = getPathNodes(d, outgroupNode);

                // highlight links
                allLinks
                    .style('stroke', l => pathNodes.has(l.target) ? '#d46e40' : '#555')
                    .style('stroke-width', l => pathNodes.has(l.target) ? 3 : 1.5);

                // highlight circles
                allCircles
                    .style('fill', nodeDatum =>
                        pathNodes.has(nodeDatum) ? '#ff4500' : color
                    );

            })
        // .on('mouseout', function () {
        //     // reset links
        //     allLinks
        //         .style('stroke', '#555')
        //         .style('stroke-width', 1);
        //     // reset circles
        //     allCircles
        //         .style('fill', color);
        // });

        // 同样给 N-node circle 绑事件（如果需要单独 hover N）


        g.selectAll('g.N-node circle')
            .style('cursor', 'pointer')
            .on('pointerover', function () {
                const pathNodes = new Set([outgroupNode]);
                // allLinks
                //     .style('stroke', l => pathNodes.has(l.target) ? '#d46e40' : '#555')
                //     .style('stroke-width', l => pathNodes.has(l.target) ? 3 : 1.5);
                allCircles
                    .style('fill', d => pathNodes.has(d) ? '#ff4500' : color);
            })
        // .on('mouseout', function () {
        //     allLinks
        //         .style('stroke', '#555')
        //         .style('stroke-width', 1);
        //     allCircles
        //         .style('fill', color);
        // });


        // 6.3) 内部节点标签（可选）
        const internalG = g.selectAll('g.internal')
            .data(root.descendants().filter(d => d.branchset))
            .enter().append('g')
            .attr('class', 'internal')
            .attr('transform', d => `translate(${d.x},${d.y})`)
        internalG.append('text')
            .attr('font-size', fontSize)
            .attr('fill', '#000')
            .attr('text-anchor', 'middle')
            .attr('dy', fontSize)
            .text(d => (d.data.name || '').replace(/^.*?_.*?_/, ''))



        // 6.x) 绘制「漂亮数字」比例尺，且底部与 N 圆心对齐
        if (outgroupNode && outgroupNode.parent) {
            // 1) 计算原始单位长度（取树高的十分之一）
            const rawUnits = (maxUp + maxDown) / 10

            // 2) niceNum：四舍五入到最接近的 10^n × [1…10]
            function niceNum(x) {
                if (x <= 0) return 0
                const exp = Math.floor(Math.log10(x))
                const mag = Math.pow(10, exp)
                const norm = x / mag      // 归一化到 [1,10)
                const niceNorm = Math.max(1, Math.round(norm))
                return niceNorm * mag
            }

            // 3) 得到漂亮数字和对应像素长度
            const niceUnits = niceNum(rawUnits)
            const barPx = niceUnits * scaleY

            // 4) 位置：x 在 P.x 右侧偏移，yBottom 对齐 N 的 y
            const xPos = P.x + scaleOffset
            const yBottom = outgroupNode.y
            const yTop = yBottom - barPx
            const tickSize = 6

            const scaleBar = g.append('g').attr('class', 'scale-bar')

            // 主刻度线：从 yTop 到 yBottom
            scaleBar.append('line')
                .attr('x1', xPos).attr('y1', yTop)
                .attr('x2', xPos).attr('y2', yBottom)
                .attr('stroke', '#000')
                .attr('stroke-width', 1)

                // 顶端 & 底端的小刻度
                ;[yTop, yBottom].forEach(y => {
                    scaleBar.append('line')
                        .attr('x1', xPos - tickSize / 2).attr('y1', y)
                        .attr('x2', xPos + tickSize / 2).attr('y2', y)
                        .attr('stroke', '#000')
                        .attr('stroke-width', 1)
                })

            // 中间文字
            scaleBar.append('text')
                .attr('x', xPos + tickSize)
                .attr('y', (yTop + yBottom) / 2)
                .attr('dominant-baseline', 'middle')
                .attr('font-size', fontSize * 0.8)
                .attr('fill', '#000')
                .text(niceUnits)
        }
        // 7) 整体水平+垂直居中
        const bbox = g.node().getBBox()
        // 目标是把 bbox 完全摆进 [padX, W-padX] × [padY, H-padY] 区域
        const dx = padX - bbox.x + (((W - 2 * padX) - bbox.width) / 2)
        const dy = padY - bbox.y + (((H - 2 * padY) - bbox.height) / 2)
        g.attr('transform', `translate(${dx},${dy})`)
        if (genes.length) {
            // 1) 基因颜色
            const geneColorMap = {
                "CTNNB1": "red",
                "TP53": "yellow",
                "KMT2D": "pink"
            };
            // 2) 五角星 generator
            const star = d3.symbol().type(d3.symbolStar).size(200);

            // 3) 收集需要标记的分支（parent → child）
            const geneMarkers = [];
            root.descendants().forEach(d => {
                if (!d.parent) return;  // 跳过根节点
                const drivers = d.data.mutations?.driver || [];
                // 只保留我们关心的基因
                const hits = drivers.filter(g => genes.includes(g));
                hits.forEach((gene, idx) => {
                    geneMarkers.push({
                        parent: d.parent,
                        child: d,
                        gene,
                        idx,
                        total: hits.length
                    });
                });
            });

                // 4) 绘制五角星
                g.selectAll('path.gene-marker')
                    .data(geneMarkers)
                    .enter().append('path')
                    .attr('class', 'gene-marker')
                    .attr('d', star)
                    .attr('fill', d => geneColorMap[d.gene.split('/')[0]] || '#000')
                    .attr('stroke', '#333')
                    .attr('stroke-width', 0.5)
                    .attr('transform', d => {
                        const p = d.parent,
                            c = d.child;
                        const x0 = p.data.__out ? P.x : p.x,
                            y0 = p.y,
                            x1 = c.data.__out ? P.x : c.x,
                            y1 = c.y;
                        // 均匀分布在分支上
                        const t = (d.idx + 1) / (d.total + 1);
                        const x = x0 + (x1 - x0) * t;
                        const y = y0 + (y1 - y0) * t;
                        return `translate(${x},${y})`;
                    }).append('title')
                .text(d => d.gene);
        }
        return () => {
            setTooltipState(prev => ({
                ...prev,
                visible: false
            }))
        }
    }, [data, dims, color])

    const clearHighlights = useCallback(() => {
        const svg = d3.select(svgRef.current)
        const allLinks = svg.selectAll('path.link');
        // 清除所有路径的 highlight
        allLinks.style('stroke', '#555')
            .style('stroke-width', 1.5);
        const allCircles = svg.selectAll('g.leaf circle, g.N-node circle');

        allCircles
            .style('fill', color);
        setTooltipState(prev => ({
            ...prev,
            visible: false
        }))
    }, [color])

    return (
        <div ref={containerRef}
            style={{ width: '70%', height: '100%', position: 'relative' }}
        >
            <svg ref={svgRef} onClick={() => {
                tooltipState?.visible && clearHighlights()
            }} />

            {tooltipState?.visible && <Popover trigger="hover" fresh placement='right' content={(
                <div
                    style={{
                        width: "350px",
                        overflowY: "auto",
                        padding: '10px',
                        maxHeight: "50vh",
                        border: "2px solid #fff",
                        borderRadius: "8px"
                    }}
                >
                    <div style={{ marginBottom: '10px', fontSize: '18px' }}>
                        <strong>Current Branch Info</strong>
                    </div>
                    <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: "lighter" }}>Sample:</span> <span style={{ lineHeight: "24px", fontWeight: "bold", fontSize: "16px" }}> {tooltipState?.data?.samples?.join(", ") ?? "None"}</span></p>
                    {/* <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: "lighter" }}>Length:</span> {tooltipState.data.length}</p> */}
                    <p style={{ marginBottom: '0' }}><span style={{ fontWeight: "lighter" }}>Protein-coding region mutations:</span><span style={{ fontWeight: "bold" }}> {(tooltipState?.data?.mutations?.driver?.length ?? 0) + (tooltipState?.data?.mutations?.nonDriver?.length ?? 0)}</span></p>
                    <p style={{ marginBottom: '0' }}><span style={{ fontWeight: "lighter" }}>Driver Gene: </span><span style={{ fontWeight: "bold", fontSize: "16px" }}> {tooltipState?.data?.mutations?.driver?.length ?? 0} </span></p>
                    <p style={{ marginBottom: '0', fontSize: "14px", overflowY: "auto", wordBreak: "break-word", lineHeight: "24px", marginBottom: 0 }}>{
                        tooltipState?.data?.mutations?.driver.map((item, index) => {
                            return (
                                <><span key={index} style={{ color: "#000", fontWeight: "bold" }}>{item.split("/")[0]}</span>
                                <span key={index+1} style={{ color: "#666" }}>({item.split("/")[1]})</span>)</>
                            )
                        })
                    }</p>
                    <div style={{ marginBottom: '0' }}><span style={{ fontWeight: "lighter" }}>None Driver Gene: </span><span style={{ fontWeight: "bold", fontSize: "16px" }}> {tooltipState?.data?.mutations?.nonDriver?.length ?? 0} </span></div>
                    <div style={{ fontSize: "14px", overflowY: "auto", wordBreak: "break-word", lineHeight: "24px", marginBottom: 0 }}>
                        {
                            tooltipState?.data?.mutations?.nonDriver.map((item, index) => {
                            return (
                                <div><span key={index} style={{ color: "#000", fontWeight: "bold" }}>{item.split("/")[0]}</span>
                                <span key={index+1} style={{ color: "#666" }}>({item.split("/")[1]})</span>)</div>
                            )
                        })
                        }
                    </div>
                </div>
            )} open>
                <div style={{
                    position: 'absolute',
                    top: tooltipState.y,
                    left: tooltipState.x,

                }}></div>
            </Popover>}
        </div>
    )
}

export default VerticalTree