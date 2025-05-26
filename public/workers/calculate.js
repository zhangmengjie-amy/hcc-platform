

const mutationTypeColorConfig = {
    Missense_Mutation: "rgb(114, 158, 206)",
    Stop_Codon: "rgb(255, 158, 74)",
    Splice_Site: "rgb(103, 191, 92)",
    TSS: "rgb(173, 139, 201)",
    Frame_Shift_Indel: "rgb(237, 102, 93)",
    In_Frame_Indel: "rgb(168, 120, 110)",

}

const clinicColorConfig = {
    tnmStageV8: {
        "TNM Stage IB": 'rgb(63, 125, 88)',
        "TNM Stage IA": 'rgb(239, 239, 239)',
        "TNM Stage II": 'rgb(201, 87, 146)',
        "TNM Stage IIIA": "rgb(235, 91, 0)",
        "TNM Stage IIIB": "rgb(96, 181, 255)"
    },
    age: {
        "<20": "rgb(248, 250, 252)",
        "20-39": "rgb(211, 238, 152)",
        "40-59": "rgb(160, 214, 131)",
        "60-79": "rgb(114, 191, 120)",
        ">=80": "rgb(83, 125, 93)",
    },
    hbv: {
        "positive": "rgb(255,255,224)",
        "negative": "rgb(110,123,139)"
    },
    hcv: {
        "positive": "rgb(255,255,224)",
        "negative": "rgb(110,123,139)"
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

self.onmessage = async ({ data }) => {
    if (data.key === "driverLandscape") {
        const { data: { originalMutations, conditions: { geneList: geneList, mutationTypeList: mutationTypeList, sampleType: sampleType, ...clinicCondition } } } = data;
        const filteredMutations = filterSampleByClinicAndConditions(originalMutations, clinicCondition, geneList);

        const finialGeneList = sortGeneListByPercentage(filteredMutations, geneList);

        // const finialMutations = sortMutations(filteredMutations, [...finialGeneList].reverse());

        let finialMutations = [];
        if (sampleType == "bySample") {
            const { samplesIds } = maf2oncoprintdf(filteredMutations, [...finialGeneList].reverse());
            finialMutations = sortSamplesBySampleIds(filteredMutations, samplesIds);
        } else {
            finialMutations = sortSampleByPatients(filteredMutations,  [...finialGeneList].reverse());
        }

        const finialClinicList = finialMutations.map((item) => {
            let ageColor;
                if (item.age < 20) {
                    ageColor = clinicColorConfig["age"]["<20"];
                } else if (item.age < 40) {
                    ageColor = clinicColorConfig["age"]["20-39"];
                } else if (item.age < 60) {
                    ageColor = clinicColorConfig["age"]["40-59"];
                } else if (item.age < 80) {
                    ageColor = clinicColorConfig["age"]["60-79"];
                } else {
                    ageColor = clinicColorConfig["age"][">=80"];
                }
            return {
                sampleId: item.sampleId,
                gender: {
                    value: item.gender,
                    color: clinicColorConfig.gender[item.gender]
                },
                race: {
                    value: item.race,
                    color: clinicColorConfig.race[item.race]
                },
                age: {
                    value: item.age,
                    color: ageColor
                },
                hcv: {
                    value: item.hcv,
                    color: clinicColorConfig.hcv[item.hcv]
                },
                hbv: {
                    value: item.hbv,
                    color: clinicColorConfig.hbv[item.hbv]
                },
                tnmStageV8: {
                    value: item.tnmStageV8,
                    color: clinicColorConfig.tnmStageV8[item.tnmStageV8]
                },
            }
        })
        const sampleMutations = generateSamplesMutations(finialMutations, finialGeneList);
        const sampleCategories = getSampleCategories(finialMutations);
        const genesMutations = generateGenesMutations(finialMutations, finialGeneList);
        const sampleGenesMutations = calculateSampleGenesMutations(finialMutations, finialGeneList, finialClinicList);
        self.postMessage({ finialGeneList, sampleCategories, sampleMutations, genesMutations, sampleGenesMutations, ...{ clinicList: finialClinicList } });
    }
};

const sortSampleByPatients = (samples, geneList) => {
const groupedSamples = samples.reduce((acc, current) => {
    const patientId = current.sampleId.split('_').slice(0, 2).join('_');
    if (!acc[patientId]) {
        acc[patientId] = [];
    }
    acc[patientId].push(current);
    return acc;
}, {});

let result = [];

// 将对象转换为数组，并对每个患者的样本进行排序
    Object.entries(groupedSamples)
        .forEach(([_, patientSamples]) => {
            const { samplesIds } = maf2oncoprintdf(patientSamples, geneList);
            const _patientSamples = sortSamplesBySampleIds(patientSamples, samplesIds);
            result.push(..._patientSamples)
        });

    return result
}

function sortSamplesBySampleIds(originalData, sampleIds) {
    // 创建一个映射，以便快速查找样本位置
    const sampleIdToIndex = {};
    sampleIds.forEach((id, index) => {
        sampleIdToIndex[id] = index;
    });

    // 过滤掉sampleIds中不存在的样本（如果需要保留所有样本，可以去掉这个filter）
    const filteredData = originalData.filter(sample =>
        sampleIds.includes(sample.sampleId)
    );

    // 按照sampleIds的顺序排序
    return filteredData.sort((a, b) => {
        return sampleIdToIndex[a.sampleId] - sampleIdToIndex[b.sampleId];
    });
}


function maf2oncoprintdf(mafData, geneList = null, options = {}) {
    // 默认参数
    const {
        ordergene = false,
        coding = true,
        noSilent = false,
        mergeVariant = true,
        subtypeOrder = null
    } = options;

    // 1. 预处理数据 - 转换为类似MAF的扁平结构
    let flatMutations = [];
    mafData.forEach(sample => {
        if (sample.mutations) {
            sample.mutations.forEach(mutation => {
                // 提取变异类型
                const variantTypes = Object.keys(mutation).filter(key =>
                    key !== 'gene' && key !== 'isDriverGene' && mutation[key] > 0
                );

                variantTypes.forEach(variantType => {
                    flatMutations.push({
                        Hugo_Symbol: mutation.gene,
                        Tumor_Sample_Barcode: sample.sampleId,
                        Variant_Classification: variantType
                    });
                });
            });
        }
    });
    // 2. 按基因名筛选
    if (geneList) {
        const geneNames = geneList.map(g => g.gene);
        flatMutations = flatMutations.filter(m => geneNames.includes(m.Hugo_Symbol));
    }

    // 3. 筛选编码突变
    if (coding) {
        const codingVariation = [
            "TSS",
            "Frame_Shift_Indel",
            "Stop_Codon",
            "Splice_Site",
            "In_Frame_Indel",
            "Missense_Mutation",
        ];
        flatMutations = flatMutations.filter(m => codingVariation.includes(m.Variant_Classification));
    }

    //   // 4. 去除沉默突变
    //   if (noSilent) {
    //     flatMutations = flatMutations.filter(m => m.Variant_Classification !== "Silent");
    //   }

    //   // 5. 合并相似变异类型
    //   if (mergeVariant) {
    //     flatMutations = flatMutations.map(m => {
    //       const variant = m.Variant_Classification;
    //       let newVariant = variant;

    //       if (["Frame_Shift_Del", "Frame_Shift_Ins"].includes(variant)) {
    //         newVariant = "Frame_Shift_Indel";
    //       } else if (["In_Frame_Ins", "In_Frame_Del"].includes(variant)) {
    //         newVariant = "In_Frame_Indel";
    //       }

    //       return {...m, Variant_Classification: newVariant};
    //     });
    //   }

    // 6. 获取所有唯一基因和样本
    const genes = [...new Set(flatMutations.map(m => m.Hugo_Symbol))];
    const samples = [...new Set(mafData.map(s => s.sampleId))];

    // 7. 初始化结果矩阵
    const oncodf = {};
    samples.forEach(sample => {
        oncodf[sample] = {};
        genes.forEach(gene => {
            oncodf[sample][gene] = "";
        });
    });

    // 8. 填充数据
    flatMutations.forEach(mutation => {
        const g = mutation.Hugo_Symbol;
        const s = mutation.Tumor_Sample_Barcode;
        const v = mutation.Variant_Classification;

        if (!oncodf[s][g].includes(v)) {
            oncodf[s][g] += `${v};`;
        }
    });

    // 9. 基因排序
    let orderedGenes = genes;
    if (ordergene && geneList) {
        orderedGenes = geneList.map(g => g.gene).filter(g => genes.includes(g));
    } else {
        // 按突变频率排序
        orderedGenes.sort((a, b) => {
            const countA = samples.filter(s => oncodf[s][a] !== "").length;
            const countB = samples.filter(s => oncodf[s][b] !== "").length;
            return countB - countA; // 降序
        });
    }

    // 10. 样本排序
    let orderedSamples = [...samples];
    if (subtypeOrder === null) {
        // 按突变模式排序
        orderedSamples.sort((s1, s2) => {
            // 比较每个基因的突变情况
            for (const gene of orderedGenes) {
                const val1 = oncodf[s1][gene];
                const val2 = oncodf[s2][gene];
                if (val1 !== val2) {
                    return val2.localeCompare(val1); // 降序
                }
            }
            return 0;
        });
    } else {
        // 先按亚型排序，再按突变模式排序
        orderedSamples = orderedSamples.filter(s => s in subtypeOrder);

        orderedSamples.sort((s1, s2) => {
            // 先按亚型排序
            const subtypeCompare = subtypeOrder[s1].localeCompare(subtypeOrder[s2]);
            if (subtypeCompare !== 0) return subtypeCompare;

            // 同亚型内按突变模式排序
            for (const gene of orderedGenes) {
                const val1 = oncodf[s1][gene];
                const val2 = oncodf[s2][gene];
                if (val1 !== val2) {
                    return val2.localeCompare(val1); // 降序
                }
            }
            return 0;
        });
    }

    // 11. 构建最终矩阵
    const resultMatrix = orderedSamples.map(sample => {
        return orderedGenes.map(gene => oncodf[sample][gene]);
    });

    return {
        // matrix: resultMatrix,
        samplesIds: orderedSamples,
        // genes: orderedGenes,
        // data: orderedSamples.map(sample => ({
        //     sampleId: sample,
        //     mutations: orderedGenes.map(gene => ({
        //         gene,
        //         value: oncodf[sample][gene]
        //     }))
        // }))
    };
}

// 主处理函数
const sortMutations = (samples, geneList) => {
    let sampleOrder = new Set();
    let rerangedSamples = [];
    let slicedRangedSample = [];

    // 遍历基因列表
    const totalSampleWithoutNull = samples.filter(sample => sample.mutations);

    geneList.forEach((gene, index) => {

        if (rerangedSamples.length === totalSampleWithoutNull.length) return;
        // 获取与当前基因有关的样本
        const samplesWithMutation = samples.filter(sample =>
            sample.mutations && sample.mutations.some(m => m.gene === gene.gene)
        );

        // 按照突变类型进行分组
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

        // mutationTypeGroups[mutationType] = sortMutations(mutationTypeGroups[mutationType], geneList.slice(1, geneList.length - 1))

        // 将分组样本添加到重排后的样本列表中

        let lastRerangedSamples = [];
        Object.keys(mutationTypeGroups).forEach(mutationType => {
            const samplesInGroup = mutationTypeGroups[mutationType];
            samplesInGroup.forEach(sample => {
                if (!sampleOrder.has(sample.sampleId)) {
                    rerangedSamples.push(sample);
                    lastRerangedSamples.push(sample);
                    sampleOrder.add(sample.sampleId);
                }
            });
        });
    });

    return rerangedSamples;
};

const getSampleCategories = (finialClinicList) => {
    return finialClinicList.map((item) => item.sampleId);
}

const sortGeneListByPercentage = (finialMutations, geneList) => {
    return geneList?.map((geneItem) => {
        const totalMutationsInSamples = finialMutations.filter((sample) => {
            if (!sample.mutations) return false;
            return !!sample.mutations?.some(mutation => mutation.gene == geneItem.gene);
        });
        return {
            ...geneItem,
            percentage: (totalMutationsInSamples.length / finialMutations.length * 100).toFixed(2) + "%",
            totalTimes: totalMutationsInSamples.length
        }
    }).sort((a, b) => a.totalTimes - b.totalTimes)
}


// 通过临床信息条件过滤样本
const filterSampleByClinicAndConditions = (originalClinicList, clinicCondition) => {
    return originalClinicList.filter((clinic) => {
        return Object.keys(clinicCondition).every((condition) => {
            if (!clinicCondition[condition].length) return true;
            let realValue = clinic[condition];
            if (condition === "age") {
                const ageValue = clinicCondition[condition];
                if (clinic["age"] < 20) {
                    realValue = "<20"
                } else if (clinic["age"] >= 20 && clinic["age"] <= 39) {
                    realValue = "20-39"
                } else if (clinic["age"] >= 40 && clinic["age"] <= 59) {
                    realValue = "40-59"
                } else if (clinic["age"] >= 60 && clinic["age"] <= 79) {
                    realValue = "60-79"
                } else {
                    realValue = ">=80"
                }
            } else if (condition === "hbv" || condition === "hcv") {
                let result = [];
                realValue = clinic["viralStatus"];
                if (clinicCondition["hbv"]?.length == 2 || !clinicCondition["hbv"]?.length) {
                    if (clinicCondition["hcv"]?.length == 2 || !clinicCondition["hcv"]?.length) {
                        result = ["0", "B", "B/C", "C"];
                    } else if (clinicCondition["hcv"]?.includes("positive")) {
                        result = ["C", "B/C"];
                    } else {
                        result = ["0", "B"]
                    }
                } else if (clinicCondition["hbv"]?.includes("positive")) {
                    if (clinicCondition["hcv"]?.length == 2 || !clinicCondition["hcv"]?.length) {
                        result = ["B", "B/C"]

                    } else if (clinicCondition["hcv"]?.includes("positive")) {
                        result = ["B/C"]
                    } else {
                        result = ["B"];
                    }
                } else {
                    if (clinicCondition["hcv"]?.length == 2 || !clinicCondition["hcv"]?.length) {
                        result = ["0", "C"];
                    } else if (clinicCondition["hcv"]?.includes("positive")) {
                        result = ["C"];
                    } else {
                        result = ["0"];
                    }
                }
                return result?.includes(realValue);
            }
            return clinicCondition[condition]?.includes(realValue);
        })
    }).map((item) => {
        return {
            ...item,
            hcv: item.viralStatus == "0" || item.viralStatus =="B" ? "negative" : "positive",
            hbv: item.viralStatus == "0" || item.viralStatus =="C" ? "negative" : "positive",
        }
    });

}

const filterSampleByConditions = (originalMutations, finialClinicList) => {
    const finialClinicListSampleIds = new Set(finialClinicList.map(aItem => aItem.sampleId));
    return originalMutations.filter(item => finialClinicListSampleIds.has(item.sampleId));
}

function calculateSampleGenesMutations(samples, geneList, clinicList) {
    const series = [];
    let maxMutationTypeNumber = 3;
    samples.forEach((sample, sampleIndex) => {
        const { sampleId, mutations } = sample;
        const geneMutationMap = {};
        if (mutations && mutations.length > 0) {
            mutations.forEach(mutation => {
                const { gene, isDriver, ...mutationCounts } = mutation;
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
                            mutationTypesCounts: totalMutations
                        },
                        value: [sampleIndex, geneIndex, value || '-'],
                        itemStyle: {
                            color: itemStyleColor
                        },
                    }
                })
                series.push(...points);
            }
        })
    })
    return {
        series,
        maxMutationTypeNumber: maxMutationTypeNumber + 1
    }
}

function generateSamplesMutations(samples, geneList) {
    const sampleMutations = Object.keys(mutationTypeColorConfig).map((type, index) => ({
        name: type,
        type: "bar",
        stack: true,
        itemStyle: { color: mutationTypeColorConfig[type] },
        data: samples.map((sample) => {
            let count = 0;
            if (sample?.mutations) {
                sample.mutations.filter((item) => {
                    return geneList.some(gene => gene.gene == item.gene)
                })?.forEach((mutation) => {
                    count += (mutation[type] ?? 0);
                })
            }

            return count;
        })
    }));

    return sampleMutations
}

function generateGenesMutations(samples, geneList) {
    const mutationTypes = Object.keys(mutationTypeColorConfig); // 从颜色配置中提取突变类型
    const series = mutationTypes.map((type) => {
        return {
            name: type,
            type: "bar",
            stack: true,
            data: geneList.map((geneItem) => {
                let count = 0;
                samples.forEach((sample) => {
                    if (sample.mutations) {
                        const mutationSample = sample.mutations.find((mutation) => (mutation.gene == geneItem.gene) && mutation[type]);
                        if (!!mutationSample) {
                            count += (mutationSample[type] ?? 0);
                        }
                    }
                })
                return count
            }),
            itemStyle: {
                color: mutationTypeColorConfig[type]
            }
        }

    })
    return series
}
