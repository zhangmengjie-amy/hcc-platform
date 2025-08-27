import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import VerticalTree from "@/components/vertical-tree"
import { Modal, Typography, Flex, Button } from 'antd';
import styles from "./style.module.scss";
import { useTranslation } from "react-i18next";
import { getFullPhylogenetic } from "@/configs/request";

const TreeChart = ({ treeData, modalOpen, geneList, onclose }) => {

    const [treeList, setTreeList] = useState(null);
    const [clinic, setClinic] = useState(null);
    const [sampleGeneData, setSampleGeneData] = useState(null);
    const { t } = useTranslation();
    useEffect(() => {
        if (!treeData?.newick) return;
        const treeWorker = new Worker('/workers/tree.js');
        getFullPhylogenetic().then((results) => {
            const geneData = results?.filter((item) => item?.sampleId?.includes(`${treeData.patientId}_`))

            treeWorker.postMessage({ newick: treeData?.newick, geneData });
            treeWorker.onmessage = ({ data }) => {
                setTreeList(data.treeList);
                setClinic(data.clinic);
                setSampleGeneData(data.sampleGeneData);

            };
        });

    }, [treeData?.newick]);

    const renderModalTitle = useMemo(() => {
        return <><Flex align='center'><Image src={"/images/patient.svg"} width={30} height={30} alt='patient'></Image><Typography.Paragraph style={{ margin: 0, marginLeft: "10px", fontSize: "24px" }}>
            {treeData?.patientId}
        </Typography.Paragraph>
            <Flex align='baseline'> <span style={{ display: "inline-block", width: "18px", height: "18px", marginLeft: "5px", backgroundColor: treeData?.itemStyle?.color }}></span><span style={{ marginLeft: "5px", fontSize: "24px" }}>{treeData?.ITH}</span></Flex>
        </Flex>
            <Flex style={{ height: "20px" }} >
                {
                    clinic && Object.keys(clinic)?.map((item) => {
                        return <Flex align='center' key={item}><span style={{ marginLeft: "10px", fontSize: "14px" }}>{t(`mutation:sample.${item}`)}:</span><span style={{ display: "inline-block", marginLeft: "5px", width: "12px", height: "12px", borderRadius: "6px", backgroundColor: `${clinic?.[item]?.color}` }}></span><span style={{ marginLeft: "5px", fontSize: "12px", color: "#666" }}>{clinic?.[item]?.value}</span></Flex>
                    })
                }</Flex></>
    })

    return (
        <Modal
            title={renderModalTitle}
            className={styles.fullModal}
            centered
            open={modalOpen}
            onCancel={onclose}
            footer={[
                <Button key="cancel" onClick={onclose}>
                    Cancel
                </Button>
            ]}
            width="70vw"
        >
            <VerticalTree
                width={800}
                height={500}
                geneList={geneList}
                color={treeData?.itemStyle?.color}
                data={treeList}
                sampleGeneData={sampleGeneData}
            />
        </Modal>

    );
};

export default TreeChart;
