// tree.js (作为 Web Worker)
const clinicColorConfig = {
    tnmStageV8: {
        "TNM Stage IA": 'rgb(255, 245, 240)',
        "TNM Stage IB": "rgb(252, 187, 161)",
        "TNM Stage II": 'rgb(251, 106, 74)',
        "TNM Stage IIIA": "rgb(239, 59, 44)",
        "TNM Stage IIIB": "rgb(203, 24, 29)"
    },
    age: {
        "<20": "rgb(242, 250, 248)",
        "20-39": "rgb(211, 238, 152)",
        "40-59": "rgb(160, 214, 131)",
        "60-79": "rgb(114, 191, 120)",
        ">=80": "rgb(83, 125, 93)"
    },
    hbv: { positive: "rgb(255,255,224)", negative: "rgb(110,123,139)" },
    hcv: { positive: "rgb(255,255,224)", negative: "rgb(110,123,139)" },
    race: {
        Asian: 'rgb(20, 61, 96)', Caucasian: 'rgb(190, 228, 208)', Cambodia: "rgb(255, 169, 85)",
        Chinese: "rgb(247, 90, 90)", Filipino: 'rgb(255, 255, 85)', Indian: "rgb(142, 125, 190)",
        Indonesian: 'rgb(255, 154, 154)', Malay: 'rgb(201, 87, 146)', Sikh: 'rgb(11, 132, 148)',
        Thai: 'rgb(124, 69, 133)', Vietnamese: 'rgb(95, 139, 76)', Others: 'rgb(148, 80, 52)'
    },
    gender: { Female: 'rgb(255, 144, 187)', Male: 'rgb(109, 225, 210)' }
};

// 将 "ITH_01_T1" → "T1"
function formatLabel(str) {
    return str?.replace(/^.*?_.*?_/, '') ?? str;
}

// 解析 Newick, 给每个节点设置 _parent，并收集叶节点 name->node 映射
function parseNewick(newick) {
    const tokens = newick.split(/\s*(;|\(|\)|,|:)\s*/);
    const ancestors = [];
    let tree = {}, current = tree;
    const nameToNode = Object.create(null);

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t === '(') {
            const child = {};
            child._parent = current;
            (current.branchset = current.branchset || []).push(child);
            ancestors.push(current);
            current = child;
        } else if (t === ',') {
            const sib = {};
            sib._parent = ancestors[ancestors.length - 1];
            ancestors[ancestors.length - 1].branchset.push(sib);
            current = sib;
        } else if (t === ')') {
            current = ancestors.pop();
        } else if (t === ':') {
            const len = parseFloat(tokens[++i]);
            current.length = isNaN(len) ? 0 : len;
        } else if (t && t !== ';') {
            current.name = t;
            nameToNode[t] = current;
        }
    }

    return { tree, nameToNode };
}

// 从某叶节点沿 _parent 回溯到 root，取逆序就是 root→leaf 路径
function getPathToRoot(node) {
    const path = [];
    while (node) {
        path.push(node);
        node = node._parent;
    }
    return path.reverse();
}

// 给定几条路径，找到它们的最长公共前缀（最后一个相同节点即 MRCA）
function findMRCA(paths) {
    if (paths.length === 0) return null;
    let idx = 0;
    while (true) {
        const ref = paths[0][idx];
        if (!ref) break;
        for (let p of paths) {
            if (p[idx] !== ref) {
                return { node: paths[0][idx - 1], path: paths[0].slice(0, idx) };
            }
        }
        idx++;
    }
    return { node: paths[0][idx - 1], path: paths[0].slice(0, idx) };
}

self.onmessage = ({ data: { newick, mutations } }) => {
    // 1. 解析树并拿到 leaf name->node 的映射
    const { tree, nameToNode } = parseNewick(newick);

    // 2. 构建 sample→genes 映射，再反转为 gene→samples
    const sampleToGenes = Object.create(null);
    mutations.forEach(({ sampleId, mutations: muts }) => {
        if (!sampleToGenes[sampleId]) sampleToGenes[sampleId] = [];
        sampleToGenes[sampleId].push(...muts.map(m => m.gene));
    });

    const geneToSamples = Object.create(null);
    for (let [smp, genes] of Object.entries(sampleToGenes)) {
        new Set(genes).forEach(g => {
            if (!geneToSamples[g]) geneToSamples[g] = [];
            geneToSamples[g].push(smp);
        });
    }

    // 3. 缓存每个样本的 root→leaf 路径
    const samplePaths = Object.fromEntries(
        Object.entries(sampleToGenes).map(([smp]) => {
            const node = nameToNode[smp];
            return [smp, node ? getPathToRoot(node) : null];
        })
    );

    function formatLabel(str) {
        // ^.*?_.*?_  匹配「开头任意+第一个下划线+任意+第二个下划线」
        return str?.replace(/^.*?_.*?_/, '') ?? '';
    }

    // 4. resolveAnnotNode：如果 MRCA.length===0，就往上找第一个 length>0；都没有则找 name="N"
    function resolveAnnotNode(mrcaInfo) {
        if (!mrcaInfo) return null;
        const { path } = mrcaInfo;
        for (let i = path.length - 1; i >= 0; i--) {
            if ((path[i].length || 0) > 0) return path[i];
        }
        return nameToNode["N"] || null;
    }

    for (let [gene, samplesArr] of Object.entries(geneToSamples)) {
        const paths = samplesArr
            .map(s => samplePaths[s])
            .filter(p => p);
        if (!paths.length) continue;

        const mrcaInfo = findMRCA(paths);
        let annotNode = mrcaInfo.node;
        // 如果该节点本身 length 为 0，则再往上找或退到 "N"
        if (!(annotNode.length > 0)) {
            annotNode = resolveAnnotNode(mrcaInfo);
        }
        if (!annotNode) continue;

        // 加 mutations
        (annotNode.mutations = annotNode.mutations || []).push(gene);
        // 加 samples 并去重
        annotNode.samples = annotNode.samples || [];

        samplesArr.forEach(s => {
            const fmt = formatLabel(s);
            if (!annotNode.samples.includes(fmt)) {
                annotNode.samples.push(fmt);
            }
        });
    }


    // 6. 构建 clinic 信息
    const first = mutations[0] || {};
    const patientItem = {
        ...first,
        hcv: ["0", "B"].includes(first.viralStatus) ? "negative" : "positive",
        hbv: ["0", "C"].includes(first.viralStatus) ? "negative" : "positive"
    };
    const ageGroup =
        patientItem.age < 20 ? "<20" :
            patientItem.age < 40 ? "20-39" :
                patientItem.age < 60 ? "40-59" :
                    patientItem.age < 80 ? "60-79" : ">=80";
    const clinic = {
        age: { value: patientItem.age, color: clinicColorConfig.age[ageGroup] }
    };
    ["gender", "race", "hcv", "hbv", "tnmStageV8"].forEach(prop => {
        clinic[prop] = {
            value: patientItem[prop],
            color: clinicColorConfig[prop][patientItem[prop]]
        };
    });

    // 7. 样本→基因列表去重
    const sampleMutations = Object.fromEntries(
        Object.entries(sampleToGenes).map(
            ([s, genes]) => [s, Array.from(new Set(genes))]
        )
    );

    // 输出
    self.postMessage({ treeList: tree, clinic, sampleMutations });
};