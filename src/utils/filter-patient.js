const filterSampleByConditions = (originalSamples, clinicList, geneList) => {
    return originalSamples?.map((item) => {
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

export default filterSampleByConditions;