const generageClinicData = () => {
  const samples= [];
  const genes = ['TP53', 'CTNNB1', 'APOB', 'ARID1A', 'ALB', 'ARID2', 'AXIN1', 'COL11A1', 'RPS6KA3', 'NFE2L2', 'KMT2D', 'RB1', 'TSC2', 'DOCK2', 'ACVR2A', 'KEAP1', 'SETD2', 'SRCAP', 'APC', 'BAP1', 'PIK3CA', 'NCOR1', 'CDKN2A', 'TNRC6B', 'HNF1A', 'SF3B1', 'VAV3', 'BRD7', 'PTEN', 'KMT2B', 'PBRM1', 'TF', 'NEFH', 'IL6ST', 'TSC1', 'DYRK1A', 'EEF1A1', 'ATRX', 'ARID1B', 'CDKN1A', 'HNF4A', 'PTPN3', 'CYP2E1', 'RPL22', 'KCNN3', 'ERRFI1', 'HNRNPA2B1', 'SLC30A1', 'FRG1', 'TLE1', 'GSE1', 'KDM6A', 'ADH1B', 'IDH1', 'SELPLG', 'HP', 'CRIP3', 'KRAS', 'ZFP36LE', 'CELF1', 'PHF10', 'RAPGEF2'];
  const mutationTypes = ["frameShiftIndel", "missense", "inFrameIndel", "stopCodon", "spliceSite", "transtationStartSite"];

  const genders = ["male", "female"];
  const stages = ["late", "early"];
  const hbvHcvStatuses = ["positive", "negative"];
  const races = ["ASIAN", "CAUCASIAN"];

  for (let i = 1; i <= 500; i++) {
    // 生成突变计数数据
    const detailData = genes.map(gene => ({
      gene,
      mutationType: mutationTypes[Math.floor(Math.random() * mutationTypes.length)]
    }));
    const mutationCountBySample = mutationTypes.map((type, index) => ({
      type,
      count: Math.floor(Math.random() * 3) // 0-3之间的随机数
    }));

    samples.push({
      sample: `sample${i}`,
      stage: stages[Math.floor(Math.random() * stages.length)],
      HBV: hbvHcvStatuses[Math.floor(Math.random() * hbvHcvStatuses.length)],
      HCV: hbvHcvStatuses[Math.floor(Math.random() * hbvHcvStatuses.length)],
      race: races[Math.floor(Math.random() * races.length)],
      age: Math.floor(Math.random() * 51) + 50, // 50-100随机年龄
      gender: genders[Math.floor(Math.random() * genders.length)],
      mutationCountList: mutationCountBySample,
      mutation: detailData
    });
  }

  return samples;
}

export default generageClinicData;