"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Popover } from 'antd';
import distinctColors from '@/utils/colors';
import * as d3 from 'd3';

const margin = 20;
const fontSize = 14;
const labelPadding = 2;
const scaleOffset = 20;

const VerticalTree = ({
    sampleGeneData,
    data,
    color,
    circleRadius = 8,
    showTooltip = true,
    handleClick = () => { },
    geneList = [],
    baseline = 'center' // 新增 baseline prop，默认为 'center'
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

        const W = dims.width;
        const H = dims.height;
        const padX = margin;

        const root = d3.hierarchy(data, d => d.branchset)
            .sort((a, b) => (a.data.name || '').localeCompare(b.data.name || '', undefined, { numeric: true }));
        root.eachBefore(d => {
            d.y0 = d.parent ? d.parent.y0 + (d.data.length || 0) : 0;
        });

        const outgroupNode = root.descendants().find(d => d.data.name === 'N');
        if (outgroupNode && outgroupNode.parent) {
            outgroupNode.descendants().forEach(d => d.data.__out = true);
        }

        const leaves = root.leaves();
        const xScale = d3.scalePoint()
            .domain(d3.range(leaves.length))
            .range([padX, W - 2 * padX + padX]);
        leaves.forEach((d, i) => d.x = xScale(i) + padX);
        root.eachAfter(d => {
            if (d.children) {
                const good = d.children.filter(c => !c.data.__out);
                d.x = good.length
                    ? d3.mean(good, c => c.x)
                    : d.parent.x;
            }
        });

        let P, y0P, maxUp, maxDown;
        if (outgroupNode && outgroupNode.parent) {
            P = outgroupNode.parent;
            y0P = P.y0;
            maxUp = d3.max(root.descendants().filter(d => !d.data.__out), d => d.y0) - y0P;
            maxDown = d3.max(outgroupNode.descendants(), d => d.y0) - y0P;
        } else {
            P = root;
            y0P = 0;
            maxUp = d3.max(root.descendants(), d => d.y0);
            maxDown = 0;
        }

        const extraY = circleRadius + labelPadding + fontSize;
        const padY = margin + extraY;

        const scaleY = (H - 2 * padY) / (maxUp + maxDown);
        P.y = padY + maxUp * scaleY;
        root.descendants().forEach(d => {
            const dy = (d.y0 - y0P) * scaleY;
            d.y = d.data.__out ? P.y + dy : P.y - dy;
        });

        const svg = d3.select(svgRef.current)
            .attr('viewBox', `0 0 ${W} ${H}`)
            .style('width', '100%').style('height', '100%')
            .style('overflow', 'visible')
            .on('contextmenu', e => e.preventDefault());
        svg.selectAll('*').remove();

        const g = svg.append('g').attr('class', 'tree');

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
            ));

        const leafG = g.selectAll('g.leaf')
            .data(leaves)
            .enter().append('g')
            .attr('class', 'leaf')
            .attr('transform', d => {
                const x = d.data.__out ? P.x : d.x;
                return `translate(${x},${d.y})`;
            });
        leafG.append('circle')
            .attr('r', circleRadius)
            .attr('fill', color)
            .attr('stroke', '#555')
            .attr('stroke-width', 1.5);
        leafG.append('text')
            .attr('font-size', fontSize)
            .attr('fill', '#000')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', d => d.data.__out ? 'hanging' : 'text-after-edge')
            .attr('y', d => d.data.__out
                ? circleRadius + labelPadding
                : -(circleRadius + labelPadding))
            .text(d => (d.data.name || '').replace(/^.*?_.*?_/, ''));

        function getPathNodes(a, b) {
            const ancestors = new Set();
            let cur = a;
            while (cur) { ancestors.add(cur); cur = cur.parent; }
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

        const allCircles = g.selectAll('g.leaf circle, g.N-node circle');
        const allLinks = g.selectAll('path.link');

        allLinks.style('cursor', 'pointer')
            .on('pointerover', function (event, link) {
                if (!showTooltip) return;
                const branchNode = link.target;
                showCustomTooltip(event, {
                    name: branchNode.data.name || "",
                    length: branchNode.data.length,
                    samples: branchNode.data.samples,
                    geneData: branchNode.data.geneData
                });
                allLinks.style('stroke', '#555')
                    .style('stroke-width', 1.5);

                allCircles
                    .style('fill', color);

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
                    geneData: branchNode.data.geneData
                });
                allLinks.style('stroke', '#555')
                    .style('stroke-width', 1.5);

                allCircles
                    .style('fill', color);

                d3.select(this)
                    .transition().duration(100)
                    .style('stroke', '#d46e40')
                    .style('stroke-width', 3);
            });

        leafG.selectAll('circle')
            .style('cursor', 'pointer')
            .on('pointerover', function (event, d) {
                if (!showTooltip) return;
                event.stopPropagation();
                showCustomTooltip(event, {
                    name: d?.data?.name || "",
                    length: d?.data?.length,
                    samples: d?.data?.samples,
                    geneData: sampleGeneData?.[d?.data?.name]
                });
                const pathNodes = getPathNodes(d, outgroupNode);

                allCircles
                    .style('fill', nodeDatum =>
                        pathNodes.has(nodeDatum) ? '#ff4500' : color
                    );

                if (d?.data?.name === 'N') return;

                allLinks
                    .style('stroke', l => pathNodes.has(l.target) ? '#d46e40' : '#555')
                    .style('stroke-width', l => pathNodes.has(l.target) ? 3 : 1.5);

            }).on('click', function (event, d) {
                event.stopPropagation();
                showCustomTooltip(event, {
                    name: d?.data?.name || "",
                    length: d?.data?.length,
                    samples: d?.data?.samples,
                    geneData: sampleGeneData?.[d?.data?.name]
                });
                const pathNodes = getPathNodes(d, outgroupNode);

                allLinks
                    .style('stroke', l => pathNodes.has(l.target) ? '#d46e40' : '#555')
                    .style('stroke-width', l => pathNodes.has(l.target) ? 3 : 1.5);

                allCircles
                    .style('fill', nodeDatum =>
                        pathNodes.has(nodeDatum) ? '#ff4500' : color
                    );

            });

        g.selectAll('g.N-node circle')
            .style('cursor', 'pointer')
            .on('pointerover', function () {
                if (!showTooltip) return;
                const pathNodes = new Set([outgroupNode]);
                allCircles
                    .style('fill', d => pathNodes.has(d) ? '#ff4500' : color);
            });

        const internalG = g.selectAll('g.internal')
            .data(root.descendants().filter(d => d.branchset))
            .enter().append('g')
            .attr('class', 'internal')
            .attr('transform', d => `translate(${d.x},${d.y})`);
        internalG.append('text')
            .attr('font-size', fontSize)
            .attr('fill', '#000')
            .attr('text-anchor', 'middle')
            .attr('dy', fontSize)
            .text(d => (d.data.name || '').replace(/^.*?_.*?_/, ''));

        if (outgroupNode && outgroupNode.parent) {
            const rawUnits = (maxUp + maxDown) / 10;

            function niceNum(x) {
                if (x <= 0) return 0;
                const exp = Math.floor(Math.log10(x));
                const mag = Math.pow(10, exp);
                const norm = x / mag;
                const niceNorm = Math.max(1, Math.round(norm));
                return niceNorm * mag;
            }

            const niceUnits = niceNum(rawUnits);
            const barPx = niceUnits * scaleY;

            let xPos;
            if (baseline === 'left') {
                // 与第一个叶子节点平齐
                const firstLeaf = leaves[0];
                xPos = firstLeaf.x;
            } else {
                // 默认：居中
                P = outgroupNode.parent
                xPos = P.x + scaleOffset;
            }

            const yBottom = outgroupNode.y;
            const yTop = yBottom - barPx;
            const tickSize = 6;

            const scaleBar = g.append('g').attr('class', 'scale-bar');

            scaleBar.append('line')
                .attr('x1', xPos).attr('y1', yTop)
                .attr('x2', xPos).attr('y2', yBottom)
                .attr('stroke', '#000')
                .attr('stroke-width', 1);

            [yTop, yBottom].forEach(y => {
                scaleBar.append('line')
                    .attr('x1', xPos - tickSize / 2).attr('y1', y)
                    .attr('x2', xPos + tickSize / 2).attr('y2', y)
                    .attr('stroke', '#000')
                    .attr('stroke-width', 1);
            });

            scaleBar.append('text')
                .attr('x', xPos + tickSize)
                .attr('y', (yTop + yBottom) / 2)
                .attr('dominant-baseline', 'middle')
                .attr('font-size', fontSize * 0.8)
                .attr('fill', '#000')
                .text(niceUnits);
        }

        const bbox = g.node().getBBox();
        const dx = padX - bbox.x + (((W - 2 * padX) - bbox.width) / 2);
        const dy = padY - bbox.y + (((H - 2 * padY) - bbox.height) / 2);
        g.attr('transform', `translate(${dx},${dy})`);

        if (geneList.length) {
            const star = d3.symbol().type(d3.symbolStar).size(120);

            const geneMarkers = [];
            root.descendants().forEach(d => {
                if (!d.parent) return;
                const drivers = d.data.geneData?.driver || [];
                const hits = Array.from(new Set(drivers.filter(g => geneList.filter((item) => item.isDriverGene).map((item) => item.gene).includes(g.split("/")?.[0])).map((item) => item?.split("/")[0])));
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

            const geneMarkerGroup = g.selectAll('g.gene-marker-group')
                .data(geneMarkers)
                .enter().append('g')
                .attr('class', 'gene-marker-group')
                .attr('transform', d => {
                    const p = d.parent,
                        c = d.child;
                    const x0 = p.data.__out ? P.x : p.x,
                        y0 = p.y,
                        x1 = c.data.__out ? P.x : c.x,
                        y1 = c.y;
                    const t = (d.idx + 1) / (d.total + 1);
                    const x = x0 + (x1 - x0) * t;
                    const y = y0 + (y1 - y0) * t;
                    return `translate(${x},${y})`;
                });

            geneMarkerGroup.append('path')
                .attr('class', 'gene-marker-star')
                .attr('d', star)
                .attr('fill', (d) => distinctColors[d.gene] || '#f5f5f5')
                .attr('stroke', '#f5f5f5')
                .attr('stroke-width', 0.5)
                .append('title')
                .text(d => d.gene);

            const textOffset = 10;
            geneMarkerGroup.append('text')
                .attr('class', 'gene-marker-label')
                .attr('font-size', 10)
                .attr('fill', '#000')
                .attr('stoke', "#fff")
                .attr('text-anchor', 'start')
                .attr('dominant-baseline', 'middle')
                .attr('x', textOffset)
                .text(d => d.gene);
        }

        return () => {
            setTooltipState(prev => ({
                ...prev,
                visible: false
            }));
        };
    }, [data, dims, color, baseline]); // baseline 加入依赖项

    const clearHighlights = useCallback(() => {
        const svg = d3.select(svgRef.current);
        const allLinks = svg.selectAll('path.link');
        allLinks.style('stroke', '#555')
            .style('stroke-width', 1.5);
        const allCircles = svg.selectAll('g.leaf circle, g.N-node circle');

        allCircles
            .style('fill', color);
        setTooltipState(prev => ({
            ...prev,
            visible: false
        }));
    }, [color]);

    return (
        <div ref={containerRef}
            onClick={handleClick}
            style={{ width: '100%', height: '100%', position: 'relative' }}
        >
            <svg ref={svgRef} onClick={() => {
                tooltipState?.visible && clearHighlights();
            }} />

            {tooltipState?.visible && showTooltip && <Popover trigger="hover" fresh placement='right' content={(
                <div
                    style={{
                        width: "350px",
                        overflowY: "auto",
                        maxHeight: "50vh",
                        borderRadius: "8px"
                    }}
                >
                    <div style={{ marginBottom: '10px', fontSize: '18px' }}>
                        <strong>Current Branch Info</strong>
                    </div>
                    <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: "lighter" }}>Sample:</span> <span style={{ lineHeight: "24px", fontWeight: "bold", fontSize: "16px" }}> {tooltipState?.data?.samples?.join(", ") ?? "None"}</span></p>
                    <p style={{ marginBottom: '0' }}><span style={{ fontWeight: "lighter" }}>Protein-coding region mutations:</span><span style={{ fontWeight: "bold" }}> {(tooltipState?.data?.geneData?.driver?.length ?? 0) + (tooltipState?.data?.geneData?.nonDriver?.length ?? 0)}</span></p>
                    <p style={{ marginBottom: '0' }}><span style={{ fontWeight: "lighter" }}>Driver Gene: </span><span style={{ fontWeight: "bold" }}> {tooltipState?.data?.geneData?.driver?.length ?? 0} </span></p>
                    <p style={{ marginBottom: '0', fontSize: "14px", overflowY: "auto", wordBreak: "break-word", lineHeight: "24px", marginBottom: 0 }}>{
                        tooltipState?.data?.geneData?.driver.map((item, index) => {
                            return (
                                <><span key={index} style={{ color: "#000", fontWeight: "bold" }}>{item.split("/")[0]}</span>
                                    <span key={index + 1} style={{ color: "#666" }}>({item.split("/")[1]})</span></>
                            );
                        })
                    }</p>
                    <div style={{ marginBottom: '0' }}><span style={{ fontWeight: "lighter" }}>None Driver Gene: </span><span style={{ fontWeight: "bold" }}> {tooltipState?.data?.geneData?.nonDriver?.length ?? 0} </span></div>
                    <div style={{ fontSize: "14px", overflowY: "auto", wordBreak: "break-word", lineHeight: "24px", marginBottom: 0 }}>
                        {
                            tooltipState?.data?.geneData?.nonDriver.map((item, index) => {
                                return (
                                    <div><span key={index} style={{ color: "#000", fontWeight: "bold" }}>{item.split("/")[0]}</span>
                                        <span key={index + 1} style={{ color: "#666" }}>({item.split("/")[1]})</span>)</div>
                                );
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
    );
};

export default VerticalTree;