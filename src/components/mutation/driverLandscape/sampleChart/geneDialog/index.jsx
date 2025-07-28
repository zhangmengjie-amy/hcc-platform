import React, { useMemo } from 'react';
import styles from "./style.module.scss";
import GeneCoding from '@/components/gene-coding';
import { Modal, Button } from 'antd';

const GeneDialog = ({ modalOpen, onclose }) => {

    const renderModalTitle = useMemo(() => {
        return <>基因棒棒糖图</>
    })

    return (
        <Modal
            title={renderModalTitle}
            centered
            className={styles.fullModal}
            open={modalOpen}
            onCancel={onclose}
            footer={[
                <Button key="cancel" onClick={onclose}>
                    Cancel
                </Button>
            ]}
            height={500}
            width="70vw"
        >
            <GeneCoding />
        </Modal>

    );
};

export default GeneDialog;
