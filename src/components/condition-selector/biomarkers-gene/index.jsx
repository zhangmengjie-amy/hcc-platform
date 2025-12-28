"use client";
import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
  forwardRef,
  useMemo,
} from "react";
import { usePDF } from "react-to-pdf";
import {
  getBiomarkersGeneList,
  getBiomarkersSingleGene,
} from "@/configs/request";
import GeneUpload from "@/components/condition-selector/gene-upload";
import {
  CaretRightOutlined,
} from "@ant-design/icons";


import {
  Card,
  Collapse,
  Radio,
  Table,
  Row,
  Col,
  Tag,
  Tooltip,
  Space,
  List,
  Checkbox,
  Button,
  Affix,
  Spin,
  Flex,
  Input,
  Splitter,
  Typography,
  Select,
  Timeline,
  Slider,
  message,
  Upload,
  Segmented,
} from "antd";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { FixedSizeList } from "react-window";
import styles from "../style.module.scss";
import { use } from "react";


const RELOAD_ICON = "/images/reload.svg";
const BiomarkersGene = forwardRef(({ onChange }, ref) => {
  const { t } = useTranslation();
  const paramsRef = useRef(null);
   const [singleGeneList, setSingleGeneList] = useState([]);
  const [geneList, setGeneList] = useState([]);
  const [selectedGeneType, setSelectedGeneType] = useState("singleGene");
  const [selectedCustomizedGeneList, setSelectedCustomizedGeneList] = useState([]);
  const [selectedSingleGene, setSelectedSingleGene] = useState("");
    const [selectedGeneList, setSelectedGeneList] = useState("");

  const handleDriverReload = () => {};

  useImperativeHandle(ref, () => ({
    getParams: () => {
      return paramsRef.current;
    },
  }));

  useEffect(() => {
    // setFetchLoading(true);
    Promise.all([getBiomarkersSingleGene(), getBiomarkersGeneList()]).then((results) => {
      const [singleGeneListResult, geneListResult] = results;
      setSingleGeneList(singleGeneListResult?.data);
      setSelectedSingleGene(singleGeneListResult?.data[0]?.geneName)
      setGeneList(geneListResult?.data);
      setSelectedGeneList(geneListResult?.data[0]?.geneListName)
      // setFetchLoading(false);
    }).catch(() => {
      // setFetchLoading(false);
    });
  }, [])

  useEffect(() => {
    onChange({
      selectedGeneType,
      selectedSingleGene,
      selectedGeneList,
      selectedCustomizedGeneList
    })

  }, [selectedGeneType, selectedSingleGene, selectedGeneList, selectedCustomizedGeneList])

  const biomarkersCollapseTitle = () => {
    return (
      <Flex justify={"space-between"} align={"center"}>
        <Typography.Paragraph
          ellipsis={{
            rows: 1,
            expandable: false,
          }}
          style={{ margin: 0, color: "#fff", fontWeight: "500" }}
        >
          Biomarkers Method
        </Typography.Paragraph>

        <Tooltip placement="bottom" title={t("common:reset-selection")}>
          <Button
            color="default"
            onClick={(event) => {
              handleDriverReload(event);
            }}
            variant="text"
            style={{ color: "#fff", padding: 0 }}
          >
            <Image
              src={RELOAD_ICON}
              alt="reload"
              width={16}
              height={16}
              tooltip={t("common:reload")}
            />
          </Button>
        </Tooltip>
      </Flex>
    );
  };

  const biomarkersCollapseContent = () => {
    return (
      <div className={styles.searchCard} variant="borderless">
        <Flex>
          <Flex
            vertical
            flex={1}
            style={{
              border: "1px solid #f5f5f5",
              boxShadow: "0 4px 12px #f5f5f5",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <Typography.Title level={5}>Gene Type</Typography.Title>
             <Radio.Group
                           onChange={(e) => {
                setSelectedGeneType(e.target.value);
              }}
              value={selectedGeneType}
            >
              <Flex vertical>
                <Radio value="singleGene">Single Gene</Radio>
                <Radio value="geneList">Gene List</Radio>
                <Radio value="customized">Customized</Radio>
              </Flex>
             </Radio.Group>
          </Flex>
          {
          selectedGeneType == "singleGene" && <Flex
            vertical
            flex={1}
            style={{
              marginLeft: "15px",
              border: "1px solid #f5f5f5",
              boxShadow: "0 4px 12px #f5f5f5",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <Typography.Title level={5}>Single Gene</Typography.Title>
            <Radio.Group
              onChange={(e) => {
                setSelectedSingleGene(e.target.value);
              }}
              value={selectedSingleGene}
            >
              <Flex vertical>
                {
                  singleGeneList.map((item) => {
                    return <Radio key={item.geneName} value={item.geneName}>{item.geneName}</Radio>
                  })
                }
                
              </Flex>
            </Radio.Group>
          </Flex>
          }
          {
            selectedGeneType == "geneList" && <Flex
            vertical
            flex={1}
            style={{
              marginLeft: "15px",
              border: "1px solid #f5f5f5",
              boxShadow: "0 4px 12px #f5f5f5",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <Typography.Title level={5}>Gene List</Typography.Title>
            <Radio.Group
              onChange={(e) => {
                setSelectedSingleGene(e.target.value);
              }}
              value={selectedGeneList}
            >
              <Flex vertical>
                {
                  geneList.map((item) => {
                    return <Radio key={item.geneListName} value={item.geneListName}>{item.geneListName}</Radio>
                  })
                }
                
              </Flex>
            </Radio.Group>
          </Flex>
          }
                    {
            selectedGeneType == "customized" && <Flex
            vertical
            flex={1}
            style={{
              marginLeft: "15px",
              border: "1px solid #f5f5f5",
              boxShadow: "0 4px 12px #f5f5f5",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            <Typography.Title level={5}>Customized</Typography.Title>
            <GeneUpload onChange={setSelectedCustomizedGeneList}></GeneUpload>
          </Flex>
          }

        </Flex>
      </div>
    );
  };

  return (
    <div className={styles.cohortCondition}>
      <Collapse
        defaultActiveKey={"biomarkers"}
        className={styles.searchCollapse}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: 14 }}
            rotate={isActive ? 90 : 0}
          />
        )}
        items={[
          {
            key: "biomarkers",
            label: biomarkersCollapseTitle(),
            children: biomarkersCollapseContent(),
          },
        ]}
      ></Collapse>
    </div>
  );
});

export default BiomarkersGene;
