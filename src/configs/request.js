import { get } from "@/utils/request";

export const getWordMap = async () => {
    try {
        const mapData = await get('/json/world.topo.json'); // 获取 public/json/world.topo.json 文件
        return mapData;
    } catch (error) {
        console.error('Error fetching world map data:', error);
        throw error;
    }
};

export const getGene = async () => {
    try {
        const geneData = await get('/json/hcc-gene.json'); // 获取 public/json/hcc-gene.json 文件
        return geneData;
    } catch (error) {
        console.error('Error fetching gene data:', error);
        throw error;
    }
};

export const getSample = async () => {
    try {
        const geneData = await get('/json/hcc-sample.json'); // 获取 public/json/hcc-sample-full.json 文件
        return geneData;
    } catch (error) {
        console.error('Error fetching gene data:', error);
        throw error;
    }
};

export const getClinic = async () => {
    try {
        const geneData = await get('/json/hcc-clinic.json'); // 获取 public/json/hcc-sample.json 文件
        return geneData;
    } catch (error) {
        console.error('Error fetching gene data:', error);
        throw error;
    }
};

