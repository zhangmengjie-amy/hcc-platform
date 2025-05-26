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

export const getFullClinical = async () => {
    try {
        const geneData = await fetch(`/json/sampleClinical.json`);
        return geneData?.json();
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
