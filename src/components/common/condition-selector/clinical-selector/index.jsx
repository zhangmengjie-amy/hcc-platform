"use client";
import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
} from "react";
import {
  getClinicalConfig,
} from "@/configs/request";
import {
  CaretRightOutlined,
} from "@ant-design/icons";
import {
  Collapse,
  Row,
  Col,
  Tooltip,
  Checkbox,
  Button,
  Spin,
  Skeleton,
  Flex,
  Typography,
  Timeline,
} from "antd";
import EmptyLoading from "@/components/empty-loading";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import styles from "../style.module.scss";
const RELOAD_ICON = "/images/reload.svg";
const ConditionSelection = forwardRef(({ onChange, onReady }, ref) => {
  const { t } = useTranslation();
  const [clinicList, setClinicList] = useState({
    gender: [],
    age: [],
    race: [],
    stage: [],
    viralStatus: [],
  });
  const [loading, setLoading] = useState(false);
  const clinicalConfigRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getClinicalConfig().then((results) => {
      clinicalConfigRef.current = results?.data;
      setLoading(false);
    });
  }, []);

  const handleClinicReload = (event) => {
    event.stopPropagation();
    const params = {
      gender: [],
      age: [],
      race: [],
      stage: [],
      viralStatus: [],
    };
    setClinicList(params);
    onChange?.({
      clinicalConditions: params,
    });
  };

  const onClinicChange = (value, parent) => {
    const params = {
      ...clinicList,
      [parent]: value,
    };
    setClinicList(params);
    onChange?.({
      clinicalConditions: params,
    });
  };

  useEffect(() => {
    onReady?.({
      clinicalConditions: {
        gender: [],
        age: [],
        race: [],
        stage: [],
        viralStatus: [],
      },
    });
  }, []);

  const clinicCollapseTitle = () => {
    return (
      <Flex justify={"space-between"} align={"center"}>
        <Typography.Title
          level={5}
          ellipsis={{
            rows: 1,
            expandable: false,
          }}
          style={{ margin: 0, color: "#fff", fontWeight: "500" }}
        >
          {t("mutation:filter.filterByClinic")}
        </Typography.Title>

        <Tooltip placement="bottom" title={t("common:resetSelection")}>
          <Button
            color="default"
            onClick={(event) => {
              handleClinicReload(event);
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

  const clinicCollapseContent = () => {
    return (
      <div
        variant="borderless"
      >
        <EmptyLoading loading={loading} hasData={clinicalConfigRef.current}>
          <Row key={"clinicContent"}>
            {clinicalConfigRef.current &&
              ["age", "stage", "hbv", "hcv", "race", "gender"]?.map(
                (item, index) => {
                  return (
                    <Col xs={12} md={12} lg={12} key={item}>
                      <Timeline
                        items={[
                          {
                            dot: (
                              <Image
                                src={`/images/${item == "stage" ? "tnm-stage-v8" : item
                                }.svg`}
                                width={15}
                                height={15}
                                alt={item}
                              ></Image>
                            ),
                            children: (
                              <Checkbox.Group
                                value={clinicList[item]}
                                onChange={(value) => {
                                  onClinicChange(value, item);
                                }}
                                key={index}
                              >
                                <Row key={item.key}>
                                  <Typography.Title
                                    level={5}
                                  >
                                    {t(`common:clinical.${item}`)}
                                  </Typography.Title>
                                  {clinicalConfigRef.current[item]?.map(
                                    (child) => {
                                      return (
                                        <Col
                                          xs={24}
                                          sm={24}
                                          md={24}
                                          lg={24}
                                          key={child}
                                        >
                                          <Checkbox
                                            value={child}
                                            label={child.title}
                                          >
                                            <Typography.Paragraph
                                              style={{ margin: 0 }}
                                              ellipsis={{
                                                rows: 1,
                                                expandable: false,
                                              }}
                                            >
                                              {t(`common:clinical.${child}`)}
                                            </Typography.Paragraph>
                                          </Checkbox>
                                        </Col>
                                      );
                                    },
                                  )}
                                </Row>
                              </Checkbox.Group>
                            ),
                          },
                        ]}
                      ></Timeline>
                    </Col>
                  );
                },
              )}
          </Row>
        </EmptyLoading>
      </div>
    );
  };
  return (
    <div className={styles.condition}>
      <Collapse
        defaultActiveKey={"clinic"}
        className={styles.searchCollapse}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{ fontSize: 14 }}
            rotate={isActive ? 90 : 0}
          />
        )}
        items={[
          {
            key: "clinic",
            label: clinicCollapseTitle(),
            children: clinicCollapseContent(),
          },
        ]}
      ></Collapse>
    </div>
  );
});

export default ConditionSelection;
