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
    const geneData = await get(`/hcc/v1/genes?current=${current}&size=${size}&keywords=${keywords}`);
    return geneData?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getGeneSetList = async () => {
  try {
    const geneData = await get("/hcc/v1/gene-set/list");
    return geneData?.data;
  } catch (error) {
    console.error("Error fetching gene set:", error);
    throw error;
  }
};

export const getValidGeneList = async (data) => {
  try {
    const geneData = await post(`/hcc/v1/verify-gene`, data);
    return geneData?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getFullClinical = async () => {
  try {
    const geneData = await fetch(`/json/sampleClinical.json`);
    return geneData?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getImmuneSubtypes = async () => {
  try {
    const geneData = await fetch(`/json/immune_subtypes.json`);
    return geneData?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};



export const getExpressionSubtypeList = async () => {
  try {
    const geneData = await fetch(`/json/hcc-expression-subtype.json`);
    return geneData?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getVolcanoPlot = async () => {
  try {
    const geneData = await fetch(`/json/volcano_GO_api_json.json`);
    return geneData?.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};


export const getImmuneSubtypeList = async () => {
  try {
    const geneData = await fetch(`/json/hcc-immune-subtype.json`);
    return geneData?.json();
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
    const geneData = await get(`/hcc/v1/ith/list?type=${type}`);
    return geneData?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getCohortList = async () => {
  try {
    const geneData = await get(`/hcc/v1/cohort/list`);
    return geneData?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getFullPhylogenetic = async (type = "planet") => {
  try {
    const geneData = await get(`/hcc/v1/phylogeneticTree/list${type ? "?type=" + type : ""}`);
    return geneData?.data;
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
    const geneData = await get(`/hcc/v1/clinical/list${type ? "?type=" + type : ""}`);
    return geneData?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}; 


export const getFullMutations = async (type) => {
  try {
    const geneData = await get(`/hcc/v1/oncoprint/list${type ? "?type=" + type : ""}`);
    return geneData?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
