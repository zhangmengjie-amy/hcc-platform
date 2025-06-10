

let mutationTypeColorConfig = {
    Missense_Mutation: "rgb(114, 158, 206)",
    Stop_Codon: "rgb(255, 158, 74)",
    Splice_Site: "rgb(103, 191, 92)",
    TSS: "rgb(173, 139, 201)",
    Frame_Shift_Indel: "rgb(237, 102, 93)",
    In_Frame_Indel: "rgb(168, 120, 110)",
    Multi_Hit: "rgb(255, 0, 255)"
}

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

self.onmessage = async ({ data }) => {
    if (data.key === "driverLandscape") {
        const { data: { originalMutations, conditions: { geneList: geneList, mutationTypeList: mutationTypeList, sampleType: sampleType, ...clinicList } } } = data;
        const filteredMutations = filterSampleByConditions(originalMutations, clinicList, geneList);
        mutationTypeColorConfig = sortMutationTypeColorConfig(filteredMutations);
        const finialGeneList = sortGeneListByPercentage(filteredMutations, geneList);
        let finialMutations = [];
        if (sampleType == "bySample") {
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
    }
};

const formatClinicList = (finialMutations) => {
    return finialMutations.map((item) => {
        const ageGroup =
            item.age < 20 ? "<20" :
                item.age < 40 ? "20-39" :
                    item.age < 60 ? "40-59" :
                        item.age < 80 ? "60-79" : ">=80";
        const clinicProperties = ['gender', 'race', 'hcv', 'hbv', 'tnmStageV8'];

        const result = {
            sampleId: item.sampleId,
            age: {
                value: item.age,
                color: clinicColorConfig.age[ageGroup]
            }
        };

        clinicProperties.forEach(prop => {
            result[prop] = {
                value: item[prop],
                color: clinicColorConfig[prop][item[prop]]
            };
        });

        return result;
    });
}

const sortMutationTypeColorConfig = (samples) => {
    const mutationCounts = Object.keys(mutationTypeColorConfig).map(type => {
        const allSampleWitCurrentType = samples.flatMap(item =>
            item.mutations?.filter(mutation => {
                const { gene, isDriver, ...mutations } = mutation;
                return type === "Multi_Hit"
                    ? Object.keys(mutations).length > 1
                    : Object.keys(mutations).length === 1 && mutations[type];
            }) || []
        );
        return { [type]: allSampleWitCurrentType.length };
    }).sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

    return Object.fromEntries(
        mutationCounts.map(item => [
            Object.keys(item)[0],
            mutationTypeColorConfig[Object.keys(item)[0]]
        ])
    );
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
    const sampleIdSet = new Set(sampleIds);

    return originalData
        .filter(sample => sampleIdSet.has(sample.sampleId)) // 过滤
        .sort((a, b) => sampleIds.indexOf(a.sampleId) - sampleIds.indexOf(b.sampleId)); // 排序
}

function maf2oncoprintdf(mafData, geneList = null, options = {}) {
    const {
        ordergene = true,
        coding = true,
        subtypeOrder = null
    } = options;

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

    let orderedGenes = geneList.map(g => g.gene).filter(g => genes.includes(g));

    let orderedSamples = [...samples];
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
        samplesIds: orderedSamples
    };
}


function mergePatients(samples, geneList) {
    const patientsMap = samples.reduce((map, sample) => {
        const patientId = sample.sampleId.split('_').slice(0, 2).join('_');
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
                const { gene, isDriver, ...types } = mutation;
                if (!acc[gene]) {
                    acc[gene] = {
                        gene,
                        isDriver,
                        mutationTypes: new Set()
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
            mutations: finalMutations
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

// 主处理函数
const sortMutations = (samples, geneList) => {
    let sampleOrder = new Set();
    let rerangedSamples = [];
    let slicedRangedSample = [];

    // 遍历基因列表
    const totalSampleWithoutNull = samples.filter(sample => sample.mutations);

    geneList.forEach((gene) => {

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

const getSampleCategories = (finialClinicList) => {
    return finialClinicList.map((item) => item.sampleId);
}

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
            totalTimes: totalMutationsInSamples.length
        }
    }).sort((a, b) => a.totalTimes - b.totalTimes)
}


// 通过临床信息条件过滤样本
const filterSampleByConditions = (originalSamples, clinicList, geneList) => {
    return originalSamples.map((item) => {
        return {
            ...item,
            tnmStageV8: item.tnmStageV8 === "TNM Stage Ib" ? "TNM Stage IB" : (item.tnmStageV8 === "TNM Stage III A" ? "TNM Stage IIIA" : (item.tnmStageV8 === "TNM  Stage II" ? "TNM Stage II" : item.tnmStageV8)),
            hcv: item.viralStatus == "0" || item.viralStatus == "B" ? "negative" : "positive",
            hbv: item.viralStatus == "0" || item.viralStatus == "C" ? "negative" : "positive",
            mutations: !item.mutations ? null : item.mutations?.filter((muttation) => geneList.some((gene) => gene.gene == muttation.gene))
        }
    }).filter((clinic) => {
        return Object.keys(clinicList).every((condition) => {
            if (!clinicList[condition].length) return true;
            let realValue = clinic[condition];
            if (condition === "age") {
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
            }
            return clinicList[condition]?.includes(realValue);
        })
    });

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
    if (!geneList?.length || !samples?.length) return [];
    return Object.entries(mutationTypeColorConfig).map(([type, color]) => ({
        name: type,
        type: "bar",
        barWidth: 10,
        stack: true,
        data: geneList.map(geneItem => {
            return samples.reduce((count, sample) => {
                if (!sample.mutations) return count;
                const mutation = sample.mutations.find(m => m.gene === geneItem.gene);
                if (!mutation) return count;
                const { gene, isDriver, ...mutations } = mutation;
                const isMultiHit = type === "Multi_Hit";
                const shouldCount = isMultiHit
                    ? Object.keys(mutations).length > 1
                    : Object.keys(mutations).length === 1 && mutations[type];
                return count + (shouldCount ? 1 : 0);
            }, 0);
        }),
        itemStyle: { color }
    }));
}
