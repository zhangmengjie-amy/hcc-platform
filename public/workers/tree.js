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
        ">=80": "rgb(83, 125, 93)",
    },
    hbv: {
        positive: "rgb(255,255,224)",
        negative: "rgb(110,123,139)"
    },
    hcv: {
        positive: "rgb(255,255,224)",
        negative: "rgb(110,123,139)"
    },
    race: {
        Asian: 'rgb(20, 61, 96)',
        Caucasian: 'rgb(190, 228, 208)',
        Cambodia: "rgb(255, 169, 85)",
        Chinese: "rgb(247, 90, 90)",
        Filipino: "rgb(255, 255, 85)",
        Indian: "rgb(142, 125, 190)",
        Indonesian: "rgb(255, 154, 154)",
        Malay: "rgb(201, 87, 146)",
        Sikh: "rgb(11, 132, 148)",
        Thai: "rgb(124, 69, 133)",
        Vietnamese: "rgb(95, 139, 76)",
        Others: "rgb(148, 80, 52)"
    },
    gender: {
        Female: 'rgb(255, 144, 187)',
        Male: 'rgb(109, 225, 210)'
    }
}

self.onmessage = async ({ data: { newick, mutations } }) => {
    const branchSetList = parseNewick(newick);
function getLeafNames(node) {
      if (node.name && !node.branchset) return [node.name];
      return (node.branchset || []).flatMap(getLeafNames);
    }
    function intersectSets(sets) {
      return sets.length === 0 ? new Set() :
        sets.reduce((a, b) => new Set([...a].filter(x => b.has(x))));
    }
    function annotateCommon(node, parentCommon = new Set()) {
      const leaves = getLeafNames(node);
      node.samples = leaves.map((item) => formatLabel(item));
      const leafSets = leaves.map(nm => new Set(mutations.find((item) => item.sampleId === nm)?.mutations.map( (item) => item.gene) || []));
      const commonSet = intersectSets(leafSets);
      const uniqueHere = new Set([...commonSet].filter(x => !parentCommon.has(x)));
      node.mutations = [...uniqueHere];
      const nextCommon = new Set([...parentCommon, ...commonSet]);
      (node.branchset || []).forEach(ch => annotateCommon(ch, nextCommon));
    }
    function annotateFromRoot(root) {
      const children = root.branchset || [];
      const Nnode = children.find(d => d.name === 'N');
      const Nleaves = getLeafNames(Nnode);
        Nnode.samples = Nleaves.map((item) => formatLabel(item));;
      const mainNode = children.find(d => d !== Nnode);
      if (!Nnode || !mainNode) {
        annotateCommon(root, new Set());
        return root;
      }
      const mainLeaves = getLeafNames(mainNode);

      const mainSets = mainLeaves.map(nm => new Set(mutations.find((item) => item.sampleId === nm)?.mutations.map( (item) => item.gene) || []));
      const allInter = intersectSets(mainSets);
      Nnode.mutations = [...allInter];
      annotateCommon(mainNode, allInter);
      return root;
    }
    const patientItem = {
        ...mutations[0],
            hcv: mutations[0].viralStatus == "0" || mutations[0].viralStatus == "B" ? "negative" : "positive",
            hbv: mutations[0].viralStatus == "0" || mutations[0].viralStatus == "C" ? "negative" : "positive",
    };

  const ageGroup =
            patientItem.age < 20 ? "<20" :
                patientItem.age < 40 ? "20-39" :
                    patientItem.age < 60 ? "40-59" :
                        patientItem.age < 80 ? "60-79" : ">=80";
        const clinicProperties = ['gender', 'race', 'hcv', 'hbv', 'tnmStageV8'];

        const clinic = {
            age: {
                value: patientItem.age,
                color: clinicColorConfig.age[ageGroup]
            },

        };

        clinicProperties.forEach(prop => {
            clinic[prop] = {
                value: patientItem[prop],
                color: clinicColorConfig[prop][patientItem[prop]]
            };
        });



    const treeList = annotateFromRoot(branchSetList);
    const _sampleMutations = {};
    mutations.forEach((item) => {
        _sampleMutations[item.sampleId] = item.mutations.map((mutation) => mutation.gene);
    })
    console.log("treeList", treeList)
    self.postMessage({ treeList, clinic, sampleMutations: _sampleMutations });
};

    function formatLabel(str) {
        // ^.*?_.*?_  匹配「开头任意+第一个下划线+任意+第二个下划线」
        return str?.replace(/^.*?_.*?_/, '') ?? '';
    }
function parseNewick(newick) {
    const tokens = newick.split(/\s*(;|\(|\)|,|:)\s*/)
    const ancestors = []
    let tree = {}
    let current = tree

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i]
        switch (t) {
            case '(':
                const child = {}
                current.branchset = current.branchset || []
                current.branchset.push(child)
                ancestors.push(current)
                current = child
                break
            case ',':
                const sibling = {}
                ancestors[ancestors.length - 1].branchset.push(sibling)
                current = sibling
                break
            case ')':
                current = ancestors.pop()
                break
            case ':':
                const len = parseFloat(tokens[++i])
                current.length = isNaN(len) ? 0 : len
                break
            case ';':
                break
            default:
                if (t && t !== ';') current.name = t
        }
    }
    return tree
}

