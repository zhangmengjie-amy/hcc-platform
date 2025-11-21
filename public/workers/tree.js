// tree.js (作为 Web Worker)
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
      nameToNode[current.name] = current;
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

self.onmessage = ({ data: { newick, geneData } }) => {
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

  // 6. 构建 clinic 信息
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

  // 7. 构建 sampleGeneData 输出（不区分 driver，仅去重）
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

  // 8. 返回结果
  self.postMessage({ treeList: tree, clinic, sampleGeneData });
};