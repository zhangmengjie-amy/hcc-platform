// 将 "ITH_01_T1" → "T1", 将DT01_01 → T1
function formatLabel(str) {
  return str?.replace(/.*_/, "") ?? str;
}

// 解析 Newick, 给每个节点设置 _parent，并收集叶节点 name->node 映射
function parseNewick(newick) {
  const tokens = newick.split(/\s*(;|\(|\)|,|:)\s*/);
  const ancestors = [];
  const tree = {}, current = tree;
  const nameToNode = Object.create(null);

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "(") {
      const child = {};
      child._parent = current;
      (current.branchset = current.branchset || []).push(child);
      ancestors.push(current);
      current = child;
    } else if (t === ",") {
      const sib = {};
      sib._parent = ancestors[ancestors.length - 1];
      ancestors[ancestors.length - 1].branchset.push(sib);
      current = sib;
    } else if (t === ")") {
      current = ancestors.pop();
    } else if (t === ":") {
      const len = parseFloat(tokens[++i]);
      current.length = isNaN(len) ? 0 : len;
    } else if (t && t !== ";") {
      current.name = formatLabel(t);
      nameToNode[formatLabel(t)] = current;
    }
  }

  return { tree, nameToNode };
}

function getPathToRoot(node) {
  const path = [];
  while (node) {
    path.push(node);
    node = node._parent;
  }
  return path.reverse();
}

// 找到多条路径的 MRCA
function findMRCA(paths) {
  if (paths.length === 0) return null;
  let idx = 0;
  while (true) {
    const ref = paths[0][idx];
    if (!ref) break;
    for (const p of paths) {
      if (p[idx] !== ref) {
        return { node: paths[0][idx - 1], path: paths[0].slice(0, idx) };
      }
    }
    idx++;
  }
  return { node: paths[0][idx - 1], path: paths[0].slice(0, idx) };
}

// 如果 MRCA 本身 length 为 0，往上找第一个 length>0；都没有则找 name="N"
function resolveAnnotNode(mrcaInfo, nameToNode) {
  if (!mrcaInfo) return null;
  const { path } = mrcaInfo;
  for (let i = path.length - 1; i >= 0; i--) {
    if ((path[i].length || 0) > 0) return path[i];
  }
  return nameToNode["N"] || null;
}

// Modified onmessage handler to accept an array of treeData
self.onmessage = ({ data: { treeData } }) => {
  const treeList = [];

  for (const { newick, geneData, patientId, ith, itemStyle } of treeData) {
    const mutationsWithGenomeChange = geneData.map((item) => {
      return {
        sampleId: item.sampleId,
        geneData: item.geneData.map((mutation) => {
          return {
            ...mutation,
            unionGene: mutation.gene + "/" + mutation.genome_change,
          };
        }),
      };
    });

    // 1. 解析树
    const { tree, nameToNode } = parseNewick(newick);

    // 2. 构建 sample->[{gene,isDriver}]，并记录 gene 的 isDriver 标记
    const sampleToGenes = Object.create(null);
    const geneToDriverFlag = Object.create(null);

    mutationsWithGenomeChange.forEach(({ sampleId, geneData: muts }) => {
      if (!sampleToGenes[formatLabel(sampleId)]) sampleToGenes[formatLabel(sampleId)] = [];
      muts.forEach(m => {
        sampleToGenes[formatLabel(sampleId)].push({ unionGene: m.unionGene, gene: m.gene, isDriver: m.isDriver == 1 });
        // 只要有一个 isDriver===true，就标记为 driver
        if (!geneToDriverFlag[m.unionGene] || m.isDriver == 1) {
          geneToDriverFlag[m.unionGene] = m.isDriver == 1;
        }
      });
    });

    // 3. 构建 gene->sampleId 列表
    const geneToSamples = Object.create(null);
    for (const [smp, arr] of Object.entries(sampleToGenes)) {
      new Set(arr.map(x => x.unionGene)).forEach(unionGene => {
        if (!geneToSamples[unionGene]) geneToSamples[unionGene] = [];
        geneToSamples[unionGene].push(smp);
      });
    }

    // 4. 缓存每个样本的 root->leaf 路径
    const samplePaths = Object.fromEntries(
      Object.entries(sampleToGenes).map(([smp]) => {
        const node = nameToNode[smp];
        return [smp, node ? getPathToRoot(node) : null];
      }),
    );

    // 5. 标注每个基因到树节点
    for (const [unionGene, samplesArr] of Object.entries(geneToSamples)) {
      const paths = samplesArr
        .map(s => samplePaths[s])
        .filter(p => p);
      if (!paths.length) continue;

      const mrcaInfo = findMRCA(paths);
      let annotNode = mrcaInfo.node;
      if (!(annotNode.length > 0)) {
        annotNode = resolveAnnotNode(mrcaInfo, nameToNode);
      }
      if (!annotNode) continue;

      // 初始化 mutations 对象
      if (!annotNode.geneData) {
        annotNode.geneData = { driver: [], nonDriver: [] };
      }
      const bucket = geneToDriverFlag[unionGene]
        ? annotNode.geneData.driver
        : annotNode.geneData.nonDriver;
      if (!bucket.includes(unionGene)) {
        bucket.push(unionGene);
      }

      // 收集并去重样本标签
      annotNode.samples = annotNode.samples || [];
      samplesArr.forEach(s => {
        const fmt = formatLabel(s);
        if (!annotNode.samples.includes(fmt)) {
          annotNode.samples.push(fmt);
        }
      });
    }

    treeList.push({
      tree,
      patientId,
      ith,
      itemStyle,
    }); // Push the processed tree into the treeList array
  }

  // 8. 返回结果，现在返回的是一个数组 treeList
  self.postMessage({ treeList });
};