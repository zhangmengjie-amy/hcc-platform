import { get, post } from "@/utils/api";

export const getGeneList = async (current, size, keywords) => {
    try {
        const geneData = await get(`/hcc/v1/genes?current=${current}&size=${size}&keywords=${keywords}`); // 获取 public/json/hcc-gene.json 文件
        // const geneData = await fetch(`/json/hcc-gene.json`);
        return geneData?.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getValidGeneList = async (data) => {
    try {
        const geneData = await post(`/hcc/v1/verify-gene`, data);
        return geneData?.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getFullClinical = async () => {
    try {
        const geneData = await fetch(`/json/sampleClinical.json`);
        return geneData?.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getExpressionSubtypeList = async () => {
    try {
        const geneData = await fetch(`/json/hcc-expression-subtype.json`);
        return geneData?.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getImmuneSubtypeList = async () => {
    try {
        const geneData = await fetch(`/json/hcc-immune-subtype.json`);
        return geneData?.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getLiverSamples = async () => {
    try {
        const samples = await fetch(`/json/liver-sample.json`);
        return samples?.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};


export const getITHList = async () => {
    try {
        const geneData = await get(`/hcc/v1/getITHList`);
        return geneData?.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};



export const getFullPhylogenetic = async () => {
    try {
        const geneData = await fetch(`/json/phylogenetic-tree.json`);
        return geneData?.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getLollipopPlotData = async (data) => {
    try {
        const lollipopPlotData = await post(`http://10.0.0.113:8000/lollipopPlot_datalist`, data);
        return lollipopPlotData?.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getFullMutations = async () => {
    try {
        const geneData = await fetch(`/json/gene-based-mutations.json`);
        return geneData?.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getPatientList = async () => {
    try {
        const geneData = await fetch(`/json/hcc-patient.json`);
        return geneData?.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getGeneChart = async (data) => {
    try {
        const geneData = await post('/hcc/v1/mutation/gene-list', data); // 获取 public/json/hcc-gene.json 文件
        return geneData?.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getMutationChart = async (data) => {
    try {
        const geneData = await post('/hcc/v1/mutation/sample-mutation-type-list', data); // 获取 public/json/hcc-sample-full.json 文件
        return geneData?.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getSampleGeneChart = async (data) => {
    try {
        const geneData = await post('/hcc/v1/mutation/sample-gene-list', data); // 获取 public/json/hcc-sample-full.json 文件
        return geneData?.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

export const getClinicChart = async (data) => {
    try {
        const geneData = await post('/hcc/v1/mutation/clinic-list', data); // 获取 public/json/hcc-sample.json 文件
        return geneData?.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
