/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

/**
 * Web Worker 计算模块（calculate.js）
 *
 * 主要职责：
 * 1. 基于突变数据和临床信息进行过滤、整合和排序
 * 2. 生成前端可直接使用的可视化数据结构（driver landscape 等）
 * 3. 在 Worker 线程中完成密集计算，避免阻塞主线程
 */

// 突变类型对应的默认配色，在运行过程中会按照出现频次重新排序
let mutationTypeColorConfig = {
  Missense_Mutation: "rgb(114, 158, 206)",
  Stop_Codon: "rgb(255, 158, 74)",
  Splice_Site: "rgb(103, 191, 92)",
  TSS: "rgb(173, 139, 201)",
  Frame_Shift_Indel: "rgb(237, 102, 93)",
  In_Frame_Indel: "rgb(168, 120, 110)",
  Multi_Hit: "rgb(255, 0, 255)",
};

// 临床特征对应的配色，用于临床热图 / 标签渲染
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
  hbv: {
    positive: "rgb(255,255,224)",
    negative: "rgb(110,123,139)",
  },
  hcv: {
    positive: "rgb(255,255,224)",
    negative: "rgb(110,123,139)",
  },
  race: {
    Asian: "rgb(20, 61, 96)",
    Caucasian: "rgb(190, 228, 208)",
    Cambodia: "rgb(255, 169, 85)",
    Chinese: "rgb(247, 90, 90)",
    Filipino: "rgb(255, 255, 85)",
    Indian: "rgb(142, 125, 190)",
    Indonesian: "rgb(255, 154, 154)",
    Malay: "rgb(201, 87, 146)",
    Sikh: "rgb(11, 132, 148)",
    Thai: "rgb(124, 69, 133)",
    Vietnamese: "rgb(95, 139, 76)",
    Others: "rgb(148, 80, 52)",
  },
  gender: {
    Female: "rgb(255, 144, 187)",
    Male: "rgb(109, 225, 210)",
  },
};

// Web Worker 入口，根据不同 key 分发到不同的计算流程
self.onmessage = async ({ data }) => {
  if (data.key === "driverLandscape") {
    const { data: { originalMutations, sampleType, conditions: { geneList: geneList, mutationTypeList: mutationTypeList, ...clinicList } } } = data;
    const filteredMutations = filterSampleByConditions(originalMutations, clinicList, geneList);
    mutationTypeColorConfig = sortMutationTypeColorConfig(filteredMutations);
    const finialGeneList = sortGeneListByPercentage(filteredMutations, geneList);
    let finialMutations = [];
    if (sampleType == "sortedBySample") {
      const { samplesIds } = maf2oncoprintdf(filteredMutations, [...finialGeneList].reverse());
      finialMutations = sortSamplesBySampleIds(filteredMutations, samplesIds);
      let blankMutationSample = finialMutations.filter((mutation) => !mutation.mutations?.length);
      blankMutationSample = mergePatients(blankMutationSample, finialGeneList);
      const mutationSample = finialMutations.filter((mutation) => !!mutation.mutations?.length);
      finialMutations = [...mutationSample, ...blankMutationSample];
    } else {
      finialMutations = mergePatients(filteredMutations, finialGeneList);
    }
    const finialClinicList = formatClinicList(finialMutations);
    const sampleMutations = generateSamplesMutations(finialMutations, finialGeneList);
    const sampleCategories = getSampleCategories(finialMutations);
    const genesMutations = generateGenesMutations(finialMutations, finialGeneList);
    const sampleGenesMutations = calculateSampleGenesMutations(finialMutations, finialGeneList, finialClinicList);
    self.postMessage({ finialGeneList, sampleCategories, sampleMutations, genesMutations, sampleGenesMutations, ...{ clinicList: finialClinicList } });
  } else if (data.key === "filterGene") {
    const { data: { originalMutations, conditions: { geneList: geneList, mutationTypeList: mutationTypeList, sampleType: sampleType, ...clinicList } } } = data;
    let filteredMutations = filterSampleByConditions(originalMutations, clinicList, geneList);
    filteredMutations = filterSampleByGene(filteredMutations, geneList);
    const finialClinicList = formatClinicList(filteredMutations);
    const finialSampleList = formatSampleList(finialClinicList);
    self.postMessage({ finialSampleList: finialSampleList });
  } else if (data.key === "phylogenetic") {
    self.postMessage();
  }
};

// 将样本 ID 统一截断为「患者级」ID（取前两个片段）
const formatSampleList = (finialMutations) => {
  return Array.from(new Set(finialMutations.map((item) => item.sampleId?.split("_")?.slice(0, 2).join("_"))));
};

// 将原始临床信息格式化为前端易用的结构，并附带颜色信息
const formatClinicList = (finialMutations) => {
  return finialMutations.map((item) => {

    const ageGroup =
            item.age < 20 ? "<20" :
              item.age < 40 ? "20-39" :
                item.age < 60 ? "40-59" :
                  item.age < 80 ? "60-79" : ">=80";
    const clinicProperties = ["gender", "race", "hcv", "hbv", "stage"];

    const result = {
      sampleId: item.sampleId,
      age: {
        value: item.age,
        color: clinicColorConfig.age[ageGroup],
      },
    };

    clinicProperties.forEach(prop => {
      result[prop] = {
        value: item[prop],
        color: clinicColorConfig[prop][item[prop]],
      };
    });

    return result;
  });
};

// 根据各突变类型在样本中的出现次数，对突变类型配色进行重新排序
const sortMutationTypeColorConfig = (samples) => {
  const mutationCounts = Object.keys(mutationTypeColorConfig).map(type => {
    const allSampleWitCurrentType = samples.flatMap(item =>
      item.mutations?.filter(mutation => {
        const { gene, isDriver, genome_change, ...mutations } = mutation;
        return type === "Multi_Hit"
          ? Object.keys(mutations).length > 1
          : Object.keys(mutations).length === 1 && mutations[type];
      }) || [],
    );
    return { [type]: allSampleWitCurrentType.length };
  }).sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

  return Object.fromEntries(
    mutationCounts.map(item => [
      Object.keys(item)[0],
      mutationTypeColorConfig[Object.keys(item)[0]],
    ]),
  );
};


// 先按患者聚合样本，再在每个患者内部按照基因突变模式排序样本
const sortSampleByPatients = (samples, geneList) => {
  const groupedSamples = samples.reduce((acc, current) => {
    const patientId = current.sampleId.split("_").slice(0, 2).join("_");
    if (!acc[patientId]) {
      acc[patientId] = [];
    }
    acc[patientId].push(current);
    return acc;
  }, {});

  const result = [];

  // 将对象转换为数组，并对每个患者的样本进行排序
  Object.entries(groupedSamples)
    .forEach(([_, patientSamples]) => {
      const { samplesIds } = maf2oncoprintdf(patientSamples, geneList);
      const _patientSamples = sortSamplesBySampleIds(patientSamples, samplesIds);
      result.push(..._patientSamples);
    });

  return result;
};

// 根据给定的 sampleId 顺序，对原始样本数组进行过滤 + 排序
function sortSamplesBySampleIds(originalData, sampleIds) {
  const sampleIdSet = new Set(sampleIds);

  return originalData
    .filter(sample => sampleIdSet.has(sample.sampleId)) // 过滤
    .sort((a, b) => sampleIds.indexOf(a.sampleId) - sampleIds.indexOf(b.sampleId)); // 排序
}

/**
 * 将 MAF 风格的突变数据展开为 oncoprint 友好的矩阵结构
 * 这里主要复用排序逻辑，只返回按基因模式排序后的样本 ID 列表
 */
function maf2oncoprintdf(mafData, geneList = null, options = {}) {
  const {
    ordergene = true,
    coding = true,
    subtypeOrder = null,
  } = options;

  const flatMutations = [];
  mafData.forEach(sample => {
    if (sample.mutations) {
      sample.mutations.forEach(mutation => {
        // 提取变异类型
        const variantTypes = Object.keys(mutation).filter(key =>
          key !== "gene" && key !== "isDriverGene" && mutation[key] > 0,
        );

        variantTypes.forEach(variantType => {
          flatMutations.push({
            Hugo_Symbol: mutation.gene,
            Tumor_Sample_Barcode: sample.sampleId,
            Variant_Classification: variantType,
          });
        });
      });
    }
  });

  const genes = [...new Set(flatMutations.map(m => m.Hugo_Symbol))];
  const samples = [...new Set(mafData.map(s => s.sampleId))];

  const oncodf = {};
  samples.forEach(sample => {
    oncodf[sample] = {};
    genes.forEach(gene => {
      oncodf[sample][gene] = "";
    });
  });

  flatMutations.forEach(mutation => {
    const g = mutation.Hugo_Symbol;
    const s = mutation.Tumor_Sample_Barcode;
    const v = mutation.Variant_Classification;

    if (!oncodf[s][g].includes(v)) {
      oncodf[s][g] += `${v};`;
    }
  });

  const orderedGenes = geneList?.map(g => g?.gene).filter(g => genes?.includes(g));

  const orderedSamples = [...samples];
  orderedSamples.sort((s1, s2) => {
    for (const gene of orderedGenes) {
      const val1 = oncodf[s1][gene];
      const val2 = oncodf[s2][gene];
      if (val1 !== val2) {
        return val2.localeCompare(val1);
      }
    }
    return 0;
  });

  // 11. 构建最终矩阵
  const resultMatrix = orderedSamples.map(sample => {
    return orderedGenes.map(gene => oncodf[sample][gene]);
  });

  return {
    // matrix: resultMatrix,
    samplesIds: orderedSamples,
  };
}


/**
 * 将同一患者的多个样本在基因维度上合并：
 * - 多个样本只要某个基因出现突变，就在患者级记录一次
 * - 多突变类型会被归并为 Multi_Hit
 * 然后再次在患者与样本两个层面按 oncoprint 规则排序
 */
function mergePatients(samples, geneList) {
  const patientsMap = samples.reduce((map, sample) => {
    const patientId = sample.sampleId.split("_").slice(0, 2).join("_");
    if (!map.has(patientId)) {
      map.set(patientId, []);
    }
    map.get(patientId).push(sample);
    return map;
  }, new Map());

  const mergedPatients = Array.from(patientsMap.entries()).map(([patientId, patientSamples]) => {
    const geneMutations = patientSamples.reduce((acc, sample) => {
      if (!sample.mutations) return acc;

      sample.mutations.forEach(mutation => {
        const { gene, isDriver, genome_change, ...types } = mutation;
        if (!acc[gene]) {
          acc[gene] = {
            gene,
            isDriver,
            mutationTypes: new Set(),
          };
        }

        Object.keys(types).forEach(type => {
          if (types[type] === 1) {
            acc[gene].mutationTypes.add(type);
          }
        });
      });
      return acc;
    }, {});

    const finalMutations = Object.values(geneMutations).map(({ gene, isDriver, mutationTypes }) => {
      const types = Array.from(mutationTypes);
      const mutation = { gene, isDriver };

      if (types.length === 1) {
        mutation[types[0]] = 1;
      } else if (types.length > 1) {
        mutation.Multi_Hit = 1;
      }

      return mutation;
    });

    return {
      ...patientSamples[0],
      sampleId: patientId,
      mutations: finalMutations,
    };
  });


  const { samplesIds } = maf2oncoprintdf(mergedPatients, [...geneList].reverse());
  const sortedMergedPatients = sortSamplesBySampleIds(mergedPatients, samplesIds);

  return sortedMergedPatients.flatMap(patient => {
    const patientSamples = samples.filter(s => s.sampleId.startsWith(patient.sampleId + "_"));
    const { samplesIds } = maf2oncoprintdf(patientSamples, [...geneList].reverse());
    return sortSamplesBySampleIds(patientSamples, samplesIds);
  });
}

// 基于「基因优先级 + 突变类型」对样本进行重新排序
const sortMutations = (samples, geneList) => {
  const sampleOrder = new Set();
  const rerangedSamples = [];
  const slicedRangedSample = [];

  // 遍历基因列表
  const totalSampleWithoutNull = samples.filter(sample => sample.mutations);

  geneList.forEach((gene) => {

    if (rerangedSamples.length === totalSampleWithoutNull.length) return;
    // 获取与当前基因有关的样本
    const samplesWithMutation = samples.filter(sample =>
      sample.mutations && sample.mutations.some(m => m.gene === gene.gene),
    );

    // 按照突变类型进行分组（同一基因下，不同突变类型单独成组）
    const mutationTypeGroups = {};
    samplesWithMutation.forEach(sample => {
      sample.mutations.forEach(mutation => {
        if (mutation.gene === gene.gene) {
          const mutationType = Object.keys(mutationTypeColorConfig).find(type => mutation[type]);
          if (!mutationTypeGroups[mutationType]) {
            mutationTypeGroups[mutationType] = [];
          }
          mutationTypeGroups[mutationType].push(sample);
        }
      });
    });
    Object.keys(mutationTypeGroups).forEach(mutationType => {
      const samplesInGroup = mutationTypeGroups[mutationType];
      samplesInGroup.forEach(sample => {
        if (!sampleOrder.has(sample.sampleId)) {
          rerangedSamples.push(sample);
          sampleOrder.add(sample.sampleId);
        }
      });
    });
  });

  return rerangedSamples;
};

// 提取样本 ID 列表，作为横轴 / 分组用类别
const getSampleCategories = (finialClinicList) => {
  return finialClinicList.map((item) => item.sampleId);
};

// 根据每个基因在所有样本中出现的比例，重新排序基因列表并附加统计信息
const sortGeneListByPercentage = (finialMutations, geneList) => {
  return geneList?.map((geneItem) => {
    const totalMutationsInSamples = finialMutations.filter((sample) => {
      if (!sample.mutations) return false;
      return !!sample.mutations?.some(mutation => mutation.gene == geneItem.gene);
    });
    let num = (totalMutationsInSamples.length / finialMutations.length * 100).toFixed(2);
    num = num >= 0 ? num : 0;
    return {
      ...geneItem,
      percentage: num + "%",
      totalTimes: totalMutationsInSamples.length,
    };
  }).sort((a, b) => a.totalTimes - b.totalTimes);
};

// 只保留在指定基因列表中至少发生一次突变的样本
const filterSampleByGene = (originalSamples, geneList) => {
  return originalSamples.filter((item) => {
    return item.mutations?.some((mutation) => geneList.some((gene) => gene.gene == mutation.gene));
  });
};


// 通过临床条件 + 基因过滤样本，并对部分字段做标准化转换
const filterSampleByConditions = (originalSamples, clinicList, geneList) => {
  return originalSamples.map((item) => {
    return {
      ...item,
      stage: item.stage === "Ib" ? "IB" : (item.stage === "III A" ? "IIIA" : item.stage),
      hcv: item.viralStatus == "0" || item.viralStatus == "B" ? "negative" : "positive",
      hbv: item.viralStatus == "0" || item.viralStatus == "C" ? "negative" : "positive",
      mutations: !item.mutations ? null : item.mutations?.filter((mutation) => geneList.some((gene) => gene.gene == mutation.gene)),
    };
  }).filter((clinic) => {
    return Object.keys(clinicList).every((condition) => {
      if (!clinicList?.[condition]?.length) return true;
      let realValue = clinic[condition];
      if (condition === "age") {
        if (clinic["age"] < 20) {
          realValue = "<20";
        } else if (clinic["age"] >= 20 && clinic["age"] <= 39) {
          realValue = "20-39";
        } else if (clinic["age"] >= 40 && clinic["age"] <= 59) {
          realValue = "40-59";
        } else if (clinic["age"] >= 60 && clinic["age"] <= 79) {
          realValue = "60-79";
        } else {
          realValue = ">=80";
        }
      }
      return clinicList[condition]?.includes(realValue);
    });
  });

};

/**
 * 计算「样本 × 基因」二维矩阵的突变分布：
 * - 为每个有突变的 (sample, gene) 组合生成一个点
 * - 点中包含临床信息、突变类型统计等，用于 tooltip 和图层渲染
 */
function calculateSampleGenesMutations(samples, geneList, clinicList) {
  const series = [];
  const maxMutationTypeNumber = 3;
  samples.forEach((sample, sampleIndex) => {
    const { sampleId, mutations } = sample;
    const geneMutationMap = {};
    if (mutations && mutations.length > 0) {
      mutations.forEach(mutation => {
        const { gene, isDriver, genome_change, ...mutationCounts } = mutation;
        geneMutationMap[gene] = geneMutationMap[gene] || {};
        for (const mutationType in mutationCounts) {
          geneMutationMap[gene][mutationType] = (geneMutationMap[gene][mutationType] || 0) + mutationCounts[mutationType];
        }
      });
    }
    const clinicInfo = clinicList.find((item) => item.sampleId == sampleId);
    geneList.forEach((geneItem, geneIndex) => {
      const totalMutations = geneMutationMap[geneItem.gene] || {};
      const value = Object.values(totalMutations).reduce((a, b) => a + (b || 0), 0);
      if (value > 0) {
        const points = Object.keys(totalMutations).map((type, index) => {
          // maxMutationTypeNumber = index;
          const itemStyleColor = mutationTypeColorConfig[type] ?? "transparent";
          return {
            custom: {
              sampleId: sample.sampleId,
              gene: geneItem.gene,
              isDriver: geneItem.isDriverGene,
              clinic: clinicInfo,
              seriesIndex: index,
              mutationTypesCounts: totalMutations,
            },
            value: [sampleIndex, geneIndex, value || "-"],
            itemStyle: {
              color: itemStyleColor,
            },
          };
        });
        series.push(...points);
      }
    });
  });
  return {
    series,
    maxMutationTypeNumber: maxMutationTypeNumber + 1,
  };
}

// 统计每个样本在不同突变类型上的总次数（用于样本堆叠柱状图）
function generateSamplesMutations(samples, geneList) {
  if (!geneList?.length) return [];
  const sampleMutations = Object.keys(mutationTypeColorConfig).map((type, index) => ({
    name: type,
    type: "bar",
    stack: true,
    itemStyle: { color: mutationTypeColorConfig[type] },
    data: samples.map((sample) => {
      let count = 0;
      if (sample?.mutations) {
        sample.mutations.filter((item) => {
          return geneList.some(gene => gene.gene == item.gene);
        })?.forEach((mutation) => {
          count += (mutation[type] ?? 0);
        });
      }

      return count;
    }),
  }));

  return sampleMutations;
}

// 统计每个基因在不同突变类型上的样本计数（用于基因堆叠柱状图）
function generateGenesMutations(samples, geneList) {
  if (!geneList?.length || !samples?.length) return [];
  return Object.entries(mutationTypeColorConfig).map(([type, color]) => ({
    name: type,
    type: "bar",
    barWidth: 8,
    stack: true,
    data: geneList?.map(geneItem => {
      return samples.reduce((count, sample) => {
        if (!sample.mutations) return count;
        const mutation = sample.mutations.find(m => m.gene === geneItem.gene);
        if (!mutation) return count;
        const { gene, isDriver, genome_change, ...mutations } = mutation;
        const isMultiHit = type === "Multi_Hit";
        const shouldCount = isMultiHit
          ? Object.keys(mutations).length > 1
          : Object.keys(mutations).length === 1 && mutations[type];
        return count + (shouldCount ? 1 : 0);
      }, 0);
    }),
    itemStyle: { color },
  }));
}
