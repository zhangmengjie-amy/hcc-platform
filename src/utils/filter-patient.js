/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

const filterSampleByConditions = (originalSamples, clinicList, geneList) => {
  return originalSamples?.map((item) => {
    return {
      ...item,
      stage: item.stage,
      hcv: item.viralStatus == "0" || item.viralStatus == "B" ? "negative" : "positive",
      hbv: item.viralStatus == "0" || item.viralStatus == "C" ? "negative" : "positive",
      mutations: !item.mutations ? null : item.mutations?.filter((muttation) => geneList.some((gene) => gene.gene == muttation.gene)),
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

export default filterSampleByConditions;