import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Popover } from 'antd';
import styles from './style.module.scss';

const Tree = ({ data, color, sampleMutations }) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [dims, setDims] = useState({ width: 0, height: 0 });
    const [tooltipState, setTooltipState] = useState({ visible: false, x: 0, y: 0, data: null });
    // 1) 监听容器尺寸
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

    function hideCustomTooltipMenu() {
        setTooltipState({ visible: false, x: 0, y: 0, data: null });

    }

    function formatLabel(str) {
        // ^.*?_.*?_  匹配「开头任意+第一个下划线+任意+第二个下划线」
        return str?.replace(/^.*?_.*?_/, '') ?? '';
    }

    // 2) 绘制
    useEffect(() => {
        if (!data || dims.width === 0 || dims.height === 0) return;

        const svg = d3.select(svgRef.current)
            .attr('viewBox', `0 0 ${dims.width} ${dims.height}`)
            .style('width', '100%')
            .style('height', '100%')
            .style('position', 'relative')
            .style('overflow', 'visible')
            .on('contextmenu', event => event.preventDefault());

        svg.selectAll('*').remove();

        const padY = 20, tickSize = 5;
        const margin = { top: 30, right: 20, bottom: padY + tickSize + 50, left: 20 };
        let width = dims.width - margin.left - margin.right;
        let height = dims.height - margin.top - margin.bottom;

        const root = d3.hierarchy(data, d => d.branchset);
        root.each(d => d.cum = (d.parent ? d.parent.cum : 0) + (d.data.length || 0));
        const leaves = root.leaves();
        const dy = leaves.length > 1 ? height / (leaves.length - 1) : height / 2;
        leaves.forEach((d, i) => d.y = i * dy);
        root.eachAfter(d => { if (d.children) d.y = d3.mean(d.children, c => c.y); });
        const xMax = d3.max(root.descendants(), d => d.cum);

        // —— 测量叶子标签最大宽度 —— 
        const measurer = svg.append('text')
            .attr('visibility', 'visible')
            .attr('font-size', 12)
            .attr('x', 0)
            .attr('y', 0);
        const maxLabelWidth = d3.max(leaves, d => {
            measurer.text(formatLabel(d.data.name) || '');
            return measurer.node().getBBox().width;
        }) || 0;
        measurer.remove();

        margin.right = Math.max(margin.right, maxLabelWidth + 20);
        width = dims.width - margin.left - margin.right;

        // —— x 轴 —— 
        const xScale = d3.scaleLinear([0, xMax], [0, width]);
        root.each(d => { d.x = xScale(d.cum); });

        // —— zoomable group —— 
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        const yMaxLeaf = d3.max(leaves, d => d.y);
        const xTicks = xScale.ticks(10);

        g.append('g')
            .attr('class', styles.grid)
            .selectAll('line')
            .data(xTicks.filter((_, i) => i > 0))
            .enter().append('line')
            .attr('x1', d => xScale(d))
            .attr('x2', d => xScale(d))
            .attr('y1', 0)
            .attr('y2', yMaxLeaf)
            .attr('stroke', '#ddd')
            .attr('stroke-dasharray', '4,4');

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
        g.selectAll('path.vert')
            .data(uniqueVertLinks)
            .enter().append('path')
            .attr('class', styles.vertlink)
            .attr('d', link => `M${link.source.x},${link.source.y}V${link.target.y}`);

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
            .find(d => formatLabel(d.data.name) === 'N');
        g.selectAll('path.horz')
            .data(uniqueHorzLinks)
            .enter().append('path')
            .attr('class', styles.horzlink)
            .attr('d', link => {
                const x0 = Math.round(link.source.x);
                const dx = Math.round(link.target.x - link.source.x);
                return `M${x0},${Math.round(link.target.y)}h${dx}`;
            }).attr('stroke', d => d.target === leafN ? 'rgb(29, 86, 126)' : 'rgb(127, 127, 127)')
            .attr('stroke-width', d => d.target === leafN ? 2 : 1.5)
            .on('click', (event, link) => {
                event.stopPropagation();
                const branchNode = link.target;

                d3.select(event.currentTarget)
                    .classed(styles.highlight, true);
                showCustomTooltip(event, {
                    name: branchNode.data.name || "",
                    length: branchNode.data.length,
                    samples: branchNode.data.samples,
                    mutations: branchNode.data.mutations
                });
            })
            .on('pointerover', (event, link) => {
                event.stopPropagation();
                // 给当前路径打高亮


                g.selectAll(`path.${styles.horzlink}`).classed(styles.highlight, false);
                g.selectAll(`path.${styles.vertlink}`).classed(styles.highlight, false);
                g.selectAll('circle')
                    .classed(styles.highlightNode, false);

                d3.select(event.currentTarget)
                    .classed(styles.highlight, true);

                const branchNode = link.target;
                showCustomTooltip(event, {
                    name: branchNode.data.name || "",
                    length: branchNode.data.length,
                    samples: branchNode.data.samples,
                    mutations: branchNode.data.mutations
                });
            })
        // .on('pointerout', (event, link) => {
        //     event.stopPropagation();
        //     // 取消高亮
        //     d3.select(event.currentTarget)
        //         .classed(styles.highlight, false);
        //     g.selectAll(`path.${styles.horzlink}`).classed(styles.highlight, false);
        //     g.selectAll(`path.${styles.vertlink}`).classed(styles.highlight, false);
        //     g.selectAll('circle')
        //         .classed(styles.highlightNode, false);
        //     hideCustomTooltipMenu();
        // });


        // —— 节点 & 文本 —— 
        const node = g.selectAll('g.node')
            .data(root.descendants())
            .enter().append('g')
            .attr('class', d => d.children
                ? styles.node
                : `${styles.node} ${styles.leaf}`)
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // 叶子圆点
        node.filter(d => !d.children)
            .append('circle')
            .attr('r', 6)
            .attr('fill', color ?? 'rgb(212, 110, 64)')
            .on('click', (event, d) => {
                event.stopPropagation();
                showCustomTooltip(event, {
                    name: d?.data?.name || "",
                    length: d?.data?.length,
                    samples: d?.data?.samples,
                    mutations: sampleMutations?.[d?.data?.name]
                });
                // 1) 找到叶子名字为 "N" 的节点
                const leafN = root.descendants()
                    .find(n => formatLabel(n.data.name) === 'N');
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
                    })

                // （可选）同时高亮这条路径上的节点圆点
                g.selectAll('circle')
                    .classed(styles.highlightNode, nodeDatum => fullPath.includes(nodeDatum));
            })
            .on('pointerover', (event, d) => {
                event.stopPropagation();
                showCustomTooltip(event, {
                    name: d?.data?.name || "",
                    length: d?.data?.length,
                    samples: d?.data?.samples,
                    mutations: sampleMutations?.[d?.data?.name]
                });
                // 1) 找到叶子名字为 "N" 的节点
                const leafN = root.descendants()
                    .find(n => formatLabel(n.data.name) === 'N');
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
                    })

                // （可选）同时高亮这条路径上的节点圆点
                g.selectAll('circle')
                    .classed(styles.highlightNode, nodeDatum => fullPath.includes(nodeDatum));
            })
        // .on('pointerout', (event) => {
        //     event.stopPropagation();
        //     hideCustomTooltipMenu();
        //     g.selectAll(`path.${styles.horzlink}`).classed(styles.highlight, false);
        //     g.selectAll(`path.${styles.vertlink}`).classed(styles.highlight, false);
        //     g.selectAll('circle')
        //         .classed(styles.highlightNode, false);
        // });

        // 叶子标签
        node.filter(d => !d.children)
            .append('text')
            .attr('dx', 10)
            .attr('dy', 0)
            .text(d => formatLabel(d.data.name) || '');

        // —— 底部比例尺 —— 
        const step = d3.tickStep(0, xMax, 2);
        const rawBarPx = xScale(step) - xScale(0);
        const scaleFactor = 0.2;      // 0.5 表示 50% 长度
        const barPx = rawBarPx * scaleFactor;

        const x0 = 0, y0 = yMaxLeaf + padY;

        const scaleBar = g.append('g').attr('class', styles.scaleBar);
        scaleBar.append('line')
            .attr('x1', x0).attr('y1', y0)
            .attr('x2', x0 + barPx).attr('y2', y0);
        [0, barPx].forEach(dx => {
            scaleBar.append('line')
                .attr('x1', x0 + dx).attr('y1', y0 - tickSize / 2)
                .attr('x2', x0 + dx).attr('y2', y0 + tickSize / 2);
        });
        scaleBar.append('text')
            .attr('x', x0 + barPx / 2)
            .attr('y', y0 - tickSize)
            // 如果想让文字也显示“实际长度”，可以写 step，
            // 或者写 step * scaleFactor 来对应缩短后的长度
            .text('Scale line: ' + step * scaleFactor);


        return () => {
            setTooltipState(prev => ({
                ...prev,
                visible: false
            }))
        }
    }, [data, dims]);

    const clearHighlights = useCallback(() => {
        const svg = d3.select(svgRef.current)
        // 清除所有路径的 highlight
        svg.selectAll(`path.${styles.highlight}`)
            .classed(styles.highlight, false)
        // 清除所有圆点的 highlightNode
        svg.selectAll(`circle.${styles.highlightNode}`)
            .classed(styles.highlightNode, false)
        setTooltipState(prev => ({
            ...prev,
            visible: false
        }))
    }, [])



    return (
        <div
            ref={containerRef}
            className={styles.treeContainer}
            style={{ width: '100%', height: '100%', position: 'relative' }}
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
                        maxHeight: "90vh",
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
                    <p style={{ marginBottom: '0', fontSize: "14px", overflowY: "auto", fontWeight: "normal", wordBreak: "break-word", lineHeight: "24px", marginBottom: 0, fontWeight: "bold" }}>{tooltipState?.data?.mutations?.driver?.join(', ')}</p>
                    <p style={{ marginBottom: '0' }}><span style={{ fontWeight: "lighter" }}>None Driver Gene: </span><span style={{ fontWeight: "bold", fontSize: "16px" }}> {tooltipState?.data?.mutations?.nonDriver?.length ?? 0} </span></p>
                    <p style={{ fontSize: "14px", overflowY: "auto", fontWeight: "normal", wordBreak: "break-word", lineHeight: "24px", marginBottom: 0 }}>{tooltipState?.data?.mutations?.nonDriver?.join(', ')}</p>
                </div>
            )} open>
                <div style={{
                    position: 'absolute',
                    top: tooltipState.y,
                    left: tooltipState.x,

                }}></div>
            </Popover>}
        </div>
    );
};

export default Tree;
