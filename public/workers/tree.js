/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

/**
 * Web Worker 计算模块（tree.js）
 *
 * 输入：
 * - newick: 系统发育树的 Newick 字符串
 * - geneData: 每个 sample 的突变信息（含 gene / genome_change / isDriver / 临床字段等）
 *
 * 输出：
 * - treeList: 解析后的树结构（在部分节点上会附加 geneData / samples 标注）
 * - clinic: 患者临床信息（带颜色映射）
 * - sampleGeneData: 每个样本的 driver/nonDriver 基因列表（unionGene 去重）
 *
 * 目的：
 * 在 Worker 线程中完成树解析与标注计算，避免阻塞主线程渲染。
 */
// 临床特征到颜色的映射（用于 UI 渲染标签/热图）
const clinicColorConfig = {
  stage: {
    "IA": "rgb(255, 245, 240)",
    "IB": "rgb(252, 187, 161)",
    "II": "rgb(251, 106, 74)",
    "IIIA": "rgb(239, 59, 44)",
    "IIIB": "rgb(203, 24, 29)",
    "IVA": "rgba(139, 13, 17, 1)",
  },
  age: {
    "<20": "rgb(242, 250, 248)",
    "20-39": "rgb(211, 238, 152)",
    "40-59": "rgb(160, 214, 131)",
    "60-79": "rgb(114, 191, 120)",
    ">=80": "rgb(83, 125, 93)",
  },
  hbv: { positive: "rgb(255,255,224)", negative: "rgb(110,123,139)" },
  hcv: { positive: "rgb(255,255,224)", negative: "rgb(110,123,139)" },
  race: {
    Asian: "rgb(20, 61, 96)", Caucasian: "rgb(190, 228, 208)", Cambodia: "rgb(255, 169, 85)",
    Chinese: "rgb(247, 90, 90)", Filipino: "rgb(255, 255, 85)", Indian: "rgb(142, 125, 190)",
    Indonesian: "rgb(255, 154, 154)", Malay: "rgb(201, 87, 146)", Sikh: "rgb(11, 132, 148)",
    Thai: "rgb(124, 69, 133)", Vietnamese: "rgb(95, 139, 76)", Others: "rgb(148, 80, 52)",
  },
  gender: { Female: "rgb(255, 144, 187)", Male: "rgb(109, 225, 210)" },
};

// 统一样本标签：将 "ITH_01_T1" → "T1"；类似 "DT01_01" → "01"（保留最后一个 "_" 后片段）
function formatLabel(str) {
  return str?.replace(/.*_/, "") ?? str;
}

/**
 * 解析 Newick 字符串为树结构
 * - 每个节点都会挂载 `_parent` 以便回溯到根
 * - 叶子节点（有 name 的节点）会被收集到 nameToNode 映射中，方便按样本名定位节点
 */
function parseNewick(newick) {
  const tokens = newick.split(/\s*(;|\(|\)|,|:)\s*/);
  const ancestors = [];
  const tree = {};
  let current = tree;
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
      nameToNode[current.name] = current;
    }
  }

  return { tree, nameToNode };
}

// 获取从根到当前节点的路径（包含根与当前节点）
function getPathToRoot(node) {
  const path = [];
  while (node) {
    path.push(node);
    node = node._parent;
  }
  return path.reverse();
}

// 在多条 root->leaf 路径中找到最近共同祖先（MRCA）
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

/**
 * 选择用于“基因标注”的节点：
 * - 优先使用 MRCA
 * - 若 MRCA 的 branch length 为 0，则沿着路径向上找第一个 length > 0 的节点
 * - 若仍找不到，则回退到 name="N" 的节点（如果存在）
 */
function resolveAnnotNode(mrcaInfo, nameToNode) {
  if (!mrcaInfo) return null;
  const { path } = mrcaInfo;
  for (let i = path.length - 1; i >= 0; i--) {
    if ((path[i].length || 0) > 0) return path[i];
  }
  return nameToNode["N"] || null;
}

// Worker 入口：解析树并把基因映射标注到树节点上
self.onmessage = ({ data: { newick, geneData } }) => {
  // 将 gene + genome_change 组合成唯一键（用于去重与标注）
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

  // 1) 解析树（生成 tree 结构和 name->node 的索引）
  const { tree, nameToNode } = parseNewick(newick);

  // 2) 构建 sample -> 基因列表，并汇总每个 unionGene 是否为 driver
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

  // 3) 构建 unionGene -> 样本列表（每个样本对同一 unionGene 只计一次）
  const geneToSamples = Object.create(null);
  for (const [smp, arr] of Object.entries(sampleToGenes)) {
    new Set(arr.map(x => x.unionGene)).forEach(unionGene => {
      if (!geneToSamples[unionGene]) geneToSamples[unionGene] = [];
      geneToSamples[unionGene].push(smp);
    });
  }

  // 4) 缓存每个样本在树上的 root->leaf 路径（便于 MRCA 计算）
  const samplePaths = Object.fromEntries(
    Object.entries(sampleToGenes).map(([smp]) => {
      const node = nameToNode[smp];
      return [smp, node ? getPathToRoot(node) : null];
    }),
  );

  /**
   * 5) 将每个 unionGene 标注到树节点上
   * - 找出携带该突变的样本集合
   * - 计算这些样本在树上的 MRCA
   * - 将该 unionGene 写入 MRCA（或其上方满足条件的节点）的 geneData.driver/nonDriver 中
   * - 同时把涉及到的样本标签写入 annotNode.samples
   */
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

    // 初始化基因标注容器
    if (!annotNode.geneData) {
      annotNode.geneData = { driver: [], nonDriver: [] };
    }
    const bucket = geneToDriverFlag[unionGene]
      ? annotNode.geneData.driver
      : annotNode.geneData.nonDriver;
    if (!bucket.includes(unionGene)) {
      bucket.push(unionGene);
    }

    // 收集并去重样本标签（用于节点 tooltip / 标注）
    annotNode.samples = annotNode.samples || [];
    samplesArr.forEach(s => {
      const fmt = formatLabel(s);
      if (!annotNode.samples.includes(fmt)) {
        annotNode.samples.push(fmt);
      }
    });
  }

  // 6) 构建患者临床信息（取 geneData 第一条作为患者级字段来源）
  const first = geneData[0] || {};
  const patientItem = {
    ...first,
    hcv: ["0", "B"].includes(first.viralStatus) ? "negative" : "positive",
    hbv: ["0", "C"].includes(first.viralStatus) ? "negative" : "positive",
  };
  const ageGroup =
        patientItem.age < 20 ? "<20" :
          patientItem.age < 40 ? "20-39" :
            patientItem.age < 60 ? "40-59" :
              patientItem.age < 80 ? "60-79" : ">=80";

  const clinic = {
    age: { value: patientItem.age, color: clinicColorConfig.age[ageGroup] },
  };
  ["gender", "race", "hcv", "hbv", "stage"].forEach(prop => {
    clinic[prop] = {
      value: patientItem[prop],
      color: clinicColorConfig[prop][patientItem[prop]],
    };
  });

  // 7) 构建 sampleGeneData：每个样本的 driver/nonDriver unionGene 列表（去重）
  const sampleGeneData = Object.fromEntries(
    Object.entries(sampleToGenes).map(([sample, arr]) => {
    // 提取所有基因
      const driverGenesInSample = Array.from(new Set(arr.filter((item) => item.isDriver).map(x => x.unionGene)));
      const nonDriverGenesInSample = Array.from(new Set(arr.filter((item) => !item.isDriver).map(x => x.unionGene)));

      // 可根据需要，存入对象或数组
      return [
        sample,
        {
          driver: driverGenesInSample,
          nonDriver: nonDriverGenesInSample,
        },
      ];
    }),
  );

  // 8) 返回结果给主线程
  self.postMessage({ treeList: tree, clinic, sampleGeneData });
};