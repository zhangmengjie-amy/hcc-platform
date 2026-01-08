import { get, post } from "@/utils/api";


export const login = async (data) => {
  try {
    const response = await post(`/api/auth/login`, data);
    return response;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await post(`/api/auth/reset-password`, data);
    return response;
  } catch (error) {
    console.error("Error during reset password:", error);
    throw error;
  }
};

export const sendResetEmail = async (data) => {
  try {
    const response = await post(`/api/auth/forgot-password`, data);
    return response;
  } catch (error) {
    console.error("Error during forgot password:", error);
    throw error;
  }
};

export const getCaptcha = async (data) => {
  try {
    const response = await get(`/api/captcha/image`, data);
    return response;
  } catch (error) {
    console.error("Error during captcha:", error);
    throw error;
  }
};

export const refreshCaptcha = async (data) => {
  try {
    const response = await get(`/api/captcha/refresh`, data);
    return response;
  } catch (error) {
    console.error("Error during refresh captcha:", error);
    throw error;
  }
};

export const register = async (data) => {
  try {
    const response = await post(`/api/auth/register`, data);
    return response;
  } catch (error) {
    console.error("Error during register:", error);
    throw error;
  }
};

export const activation = async (data) => {
  try {
    const response = await post(`/api/auth/activate`, data);
    return response;
  } catch (error) {
    console.error("Error during activation:", error);
    throw error;
  }
};

export const resendActivation = async (data) => {
  try {
    const response = await post(`/api/auth/resend-activation`, data);
    return response;
  } catch (error) {
    console.error("Error during resend activation:", error);
    throw error;
  }
};

export const getGeneList = async (current, size, keywords) => {
  try {
    const response = await get(`/hcc/v1/genes?current=${current}&size=${size}&keywords=${keywords}`);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getGeneSetList = async () => {
  try {
    const response = await get("/hcc/v1/gene-set/list");
    return response?.data;
  } catch (error) {
    console.error("Error fetching gene set:", error);
    throw error;
  }
};

export const getValidGeneList = async (data) => {
  try {
    const response = await post(`/hcc/v1/verify-gene`, data);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getFullClinical = async () => {
  try {
    const response = await fetch(`/json/sampleClinical.json`);
    return response?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getImmuneSubtypes = async () => {
  try {
    const response = await fetch(`/json/immune_subtypes.json`);
    return response?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};



export const getExpressionSubtypeList = async () => {
  try {
    const response = await fetch(`/json/hcc-expression-subtype.json`);
    return response?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getHeatmapBoxplot = async (data) => {
  try {
    const response = await post(`/hcc/v1/immune/heatmap-boxplot`, data);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getMutationHeatmapList = async () => {
  try {
    const response = await fetch(`/json/immune-heatmap.json`);
    return response?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getBiomarkersSingleGene = async () => {
  try {
    const response = await post(`/hcc/v1/single-genes`);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getBiomarkersGeneList = async () => {
  try {
    const response = await post(`/hcc/v1/gene-lists`);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getBiomarkersScore = async (data) => {
  try {
    const response = await post(`/hcc/v1/biomarker/genesScore`, data);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
  

export const getDEGTaskIds = async (data) => {
  try {
    const response = await post(`/hcc/v1/deg/submit`, data);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getDEGResultByTaskId = async (id) => {
  try {
    const response = await post(`/hcc/v1/deg/result/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getBiomarkersTaskIds = async (data) => {
  try {
    const response = await post(`/hcc/v1/biomarker/submit`, data);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getBiomarkersResultByTaskId = async (id) => {
  try {
    const response = await post(`/hcc/v1/biomarker/result/${id}`);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const download = async (data) => {
  try {
    const response = await post(`/hcc/v1/immune/downloadCSV`, data);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};


export const getVolcanoPlot = async () => {
  try {
    const response = await fetch(`/json/volcano_GO_api_json.json`);
    return response?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};


export const getImmuneSubtypeList = async () => {
  try {
    const response = await fetch(`/json/hcc-immune-subtype.json`);
    return response?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getLiverSamples = async () => {
  try {
    const samples = await fetch(`/json/liver-sample.json`);
    return samples?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getITHList = async (type = "planet") => {
  try {
    const response = await get(`/hcc/v1/ith/list?type=${type}`);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getCohortList = async () => {
  try {
    const response = await get(`/hcc/v1/cohort/list`);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getFullPhylogenetic = async (type = "planet") => {
  try {
    const response = await get(`/hcc/v1/phylogeneticTree/list${type ? "?type=" + type : ""}`);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getLollipopPlotData = async (data) => {
  try {
    const lollipopPlotData = await post(`http://10.0.0.113:8000/lollipopPlot_datalist`, data);
    return lollipopPlotData?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getClinicalConfig = async () => {
  try {
    const clinicalConfig = await get(`/hcc/v1/clinical/select/list`);
    return clinicalConfig?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getPatientList = async (type = "planet") => {
  try {
    const response = await get(`/hcc/v1/clinical/list${type ? "?type=" + type : ""}`);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}; 


export const getFullMutations = async (type) => {
  try {
    const response = await get(`/hcc/v1/oncoprint/list${type ? "?type=" + type : ""}`);
    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
