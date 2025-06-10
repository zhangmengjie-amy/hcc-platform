import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
const parser = require("biojs-io-newick");

const PhylogeneticTree = ({ newickData }) => {
    const svgRef = useRef();

    const width = 800; // SVG宽度
    const height = 600; // SVG高度

    useEffect(() => {
        // 使用 biojs-io-newick 解析 Newick 数据
        const treeData = parser.parse_newick(newickData);
        const root = d3.hierarchy(treeData);

        // 使用 D3 树布局
        const treeLayout = d3.tree().size([height, width - 160]);
        treeLayout(root);
        
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // 清空SVG画布

        const g = svg.append('g').attr('transform', 'translate(40,0)');

        // 绘制链接
        g.selectAll('.link')
          .data(root.links())
          .enter()
          .append('path')
          .attr('class', 'link')
          .attr('d', d3.linkHorizontal()
              .x(d => d.y)
              .y(d => d.x));

        // 绘制节点
        const node = g.selectAll('.node')
          .data(root.descendants())
          .enter()
          .append('g')
          .attr('class', d => `node${d.children ? ' node--internal' : ' node--leaf'}`)
          .attr('transform', d => `translate(${d.y},${d.x})`);

        node.append('circle')
            .attr('r', 5);

        node.append('text')
            .attr('dy', 3)
            .attr('x', d => d.children ? -8 : 8)
            .style('text-anchor', d => d.children ? 'end' : 'start')
            .text(d => d.data.name || ''); // 使用 name 字段作为标签，biojs-io-newick 返回的树结构有所不同
    }, [newickData]);

    return (
        <svg ref={svgRef} width={width} height={height}>
        </svg>
    );
};

export default PhylogeneticTree;