"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getITHList, getPatientList } from "@/configs/request";
import ReactECharts from 'echarts-for-react';
import { Modal } from 'antd';
import Image from 'next/image';
import { Flex, Typography, Button } from 'antd';
import styles from "./style.module.scss";
import TreeDialog from "@/components/mutation/phylogeneticRelationship/treeDialog"
import TreeList from '@/components/mutation/phylogeneticRelationship/treeList';
import EmptyLoading from "@/components/empty-loading";

const VISIBLE_TREE_LENGTH = 6;
const TREE_WIDTH = 120;
const TREE_CONTAINER_WIDTH = VISIBLE_TREE_LENGTH * TREE_WIDTH;
const PIE_CHART_WIDTH = 600;
const BAR_CHART_WIDTH = PIE_CHART_WIDTH / 2;
const BAR_CHART_HEIGHT = PIE_CHART_WIDTH * 0.3;
const BAR_AXIS = ['0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'];
const BAR_CATEGORIES = ['0~0.1', '0.1~0.2', '0.2~0.3', '0.3~0.4', '0.4~0.5', '0.5~0.6', '0.6~0.7', '0.7~0.8', '0.8~0.9', '0.9~1.0'];

const baseColors = [
    { r: 94, g: 79, b: 162 },    // #5E4FA2
    { r: 170, g: 55, b: 236 },    // #AA37EC
    { r: 132, g: 116, b: 197 },   // #8474C5
    { r: 47, g: 155, b: 200 },   // #2F9BC8
    { r: 102, g: 194, b: 165 },  // #66C2A5
    { r: 171, g: 221, b: 164 },  // #ABDDA4
    { r: 252, g: 212, b: 103 },  // #FCD467
    { r: 253, g: 174, b: 97 },   // #FDAE61
    { r: 244, g: 109, b: 67 },   // #F46D43
    { r: 158, g: 1, b: 66 }      // #9E0142
];

const LEGEND = [{
    name: "<=0.1",
    color: "#5E4FA2"
}, {
    name: "0.1-0.2",
    color: "#AA37EC"
}, {
    name: "0.2-0.3",
    color: "#8474C5"
}, {
    name: "0.3-0.4",
    color: "#2F9BC8"
}, {
    name: "0.4-0.5",
    color: "#66C2A5"
}, {
    name: "0.5-0.6",
    color: "#ABDDA4"
}, {
    name: "0.6-0.7",
    color: "#FCD467"
}, {
    name: "0.7-0.8",
    color: "#FDAE61"
}, {
    name: "0.8-0.9",
    color: "#F46D43"
}, {
    name: ">0.9",
    color: "#9E0142"
}]

const ITHList = [
    {
        "publicationId": "ITH_01",
        "ith": 0.5682472727272728
    },
    {
        "publicationId": "ITH_05",
        "ith": 0.6297
    },
    {
        "publicationId": "ITH_06",
        "ith": 0.84726
    },
    {
        "publicationId": "ITH_07",
        "ith": 0.9314600000000001
    },
    {
        "publicationId": "ITH_08",
        "ith": 0.83065
    },
    {
        "publicationId": "ITH_09",
        "ith": 0.6299466666666668
    },
    {
        "publicationId": "ITH_100",
        "ith": 0.46001000000000003
    },
    {
        "publicationId": "ITH_101",
        "ith": 0.38086
    },
    {
        "publicationId": "ITH_102",
        "ith": 0.8427700000000001
    },
    {
        "publicationId": "ITH_103",
        "ith": 0.9053833333333334
    },
    {
        "publicationId": "ITH_104",
        "ith": 0.9107499999999998
    },
    {
        "publicationId": "ITH_105",
        "ith": 0.80917
    },
    {
        "publicationId": "ITH_106",
        "ith": 0.9437266666666667
    },
    {
        "publicationId": "ITH_107",
        "ith": 0.7045285714285713
    },
    {
        "publicationId": "ITH_108",
        "ith": 0.5781666666666666
    },
    {
        "publicationId": "ITH_109",
        "ith": 0.36194000000000004
    },
    {
        "publicationId": "ITH_110",
        "ith": 0.75863
    },
    {
        "publicationId": "ITH_111",
        "ith": 0.41403
    },
    {
        "publicationId": "ITH_112",
        "ith": 0.4596699999999999
    },
    {
        "publicationId": "ITH_114",
        "ith": 0.3900666666666666
    },
    {
        "publicationId": "ITH_115",
        "ith": 0.5801
    },
    {
        "publicationId": "ITH_117",
        "ith": 0.5742
    },
    {
        "publicationId": "ITH_118",
        "ith": 0.6034
    },
    {
        "publicationId": "ITH_120",
        "ith": 0.5285
    },
    {
        "publicationId": "ITH_121",
        "ith": 0.5722999999999999
    },
    {
        "publicationId": "ITH_122",
        "ith": 0.5147833333333334
    },
    {
        "publicationId": "ITH_123",
        "ith": 0.4595
    },
    {
        "publicationId": "ITH_124",
        "ith": 0.4740333333333333
    },
    {
        "publicationId": "ITH_125",
        "ith": 0.7623500000000001
    },
    {
        "publicationId": "ITH_126",
        "ith": 0.72997
    },
    {
        "publicationId": "ITH_127",
        "ith": 0.41863333333333336
    },
    {
        "publicationId": "ITH_128",
        "ith": 0.47972000000000004
    },
    {
        "publicationId": "ITH_129",
        "ith": 0.7359
    },
    {
        "publicationId": "ITH_13",
        "ith": 0.5168000000000001
    },
    {
        "publicationId": "ITH_130",
        "ith": 0.3868333333333333
    },
    {
        "publicationId": "ITH_131",
        "ith": 0.4078866666666667
    },
    {
        "publicationId": "ITH_132",
        "ith": 0.5888333333333333
    },
    {
        "publicationId": "ITH_133",
        "ith": 0.5275
    },
    {
        "publicationId": "ITH_134",
        "ith": 0.5025333333333334
    },
    {
        "publicationId": "ITH_135",
        "ith": 0.6437
    },
    {
        "publicationId": "ITH_136",
        "ith": 0.64889
    },
    {
        "publicationId": "ITH_138",
        "ith": 0.5296
    },
    {
        "publicationId": "ITH_15",
        "ith": 0.7487
    },
    {
        "publicationId": "ITH_16",
        "ith": 0.36113333333333336
    },
    {
        "publicationId": "ITH_17",
        "ith": 0.7272666666666666
    },
    {
        "publicationId": "ITH_18",
        "ith": 0.8156833333333333
    },
    {
        "publicationId": "ITH_20",
        "ith": 0.4202
    },
    {
        "publicationId": "ITH_21",
        "ith": 0.8031666666666667
    },
    {
        "publicationId": "ITH_22",
        "ith": 0.8034333333333333
    },
    {
        "publicationId": "ITH_23",
        "ith": 0.81
    },
    {
        "publicationId": "ITH_24",
        "ith": 0.57921
    },
    {
        "publicationId": "ITH_25",
        "ith": 0.37433333333333335
    },
    {
        "publicationId": "ITH_26",
        "ith": 0.40199999999999997
    },
    {
        "publicationId": "ITH_27",
        "ith": 0.4973666666666667
    },
    {
        "publicationId": "ITH_29",
        "ith": 0.5701333333333333
    },
    {
        "publicationId": "ITH_31",
        "ith": 0.4044500000000001
    },
    {
        "publicationId": "ITH_32",
        "ith": 0.44744
    },
    {
        "publicationId": "ITH_33",
        "ith": 0.4796
    },
    {
        "publicationId": "ITH_34",
        "ith": 0.24933333333333332
    },
    {
        "publicationId": "ITH_35",
        "ith": 0.34096666666666664
    },
    {
        "publicationId": "ITH_36",
        "ith": 0.56545
    },
    {
        "publicationId": "ITH_37",
        "ith": 0.35205999999999993
    },
    {
        "publicationId": "ITH_39",
        "ith": 0.35263333333333335
    },
    {
        "publicationId": "ITH_40",
        "ith": 0.52756
    },
    {
        "publicationId": "ITH_41",
        "ith": 0.60456
    },
    {
        "publicationId": "ITH_42",
        "ith": 0.6962666666666667
    },
    {
        "publicationId": "ITH_43",
        "ith": 0.40159
    },
    {
        "publicationId": "ITH_44",
        "ith": 0.4096499999999999
    },
    {
        "publicationId": "ITH_45",
        "ith": 0.50762
    },
    {
        "publicationId": "ITH_48",
        "ith": 0.26405
    },
    {
        "publicationId": "ITH_49",
        "ith": 0.5023
    },
    {
        "publicationId": "ITH_50",
        "ith": 0.41007
    },
    {
        "publicationId": "ITH_51",
        "ith": 0.63102
    },
    {
        "publicationId": "ITH_52",
        "ith": 0.41988999999999993
    },
    {
        "publicationId": "ITH_53",
        "ith": 0.8384999999999999
    },
    {
        "publicationId": "ITH_54",
        "ith": 0.5174
    },
    {
        "publicationId": "ITH_55",
        "ith": 0.7383500000000001
    },
    {
        "publicationId": "ITH_56",
        "ith": 0.9374
    },
    {
        "publicationId": "ITH_57",
        "ith": 0.3938
    },
    {
        "publicationId": "ITH_58",
        "ith": 0.5884999999999999
    },
    {
        "publicationId": "ITH_59",
        "ith": 0.6344000000000001
    },
    {
        "publicationId": "ITH_60",
        "ith": 0.8467333333333333
    },
    {
        "publicationId": "ITH_61",
        "ith": 0.4461
    },
    {
        "publicationId": "ITH_62",
        "ith": 0.421
    },
    {
        "publicationId": "ITH_63",
        "ith": 0.24602
    },
    {
        "publicationId": "ITH_64",
        "ith": 0.5977666666666667
    },
    {
        "publicationId": "ITH_65",
        "ith": 0.5498
    },
    {
        "publicationId": "ITH_66",
        "ith": 0.44978999999999997
    },
    {
        "publicationId": "ITH_67",
        "ith": 0.32968
    },
    {
        "publicationId": "ITH_68",
        "ith": 0.244
    },
    {
        "publicationId": "ITH_69",
        "ith": 0.41136999999999996
    },
    {
        "publicationId": "ITH_70",
        "ith": 0.35231666666666667
    },
    {
        "publicationId": "ITH_71",
        "ith": 0.7144
    },
    {
        "publicationId": "ITH_72",
        "ith": 0.42597000000000007
    },
    {
        "publicationId": "ITH_73",
        "ith": 0.82065
    },
    {
        "publicationId": "ITH_74",
        "ith": 0.5599761904761904
    },
    {
        "publicationId": "ITH_75",
        "ith": 0.41533
    },
    {
        "publicationId": "ITH_76",
        "ith": 0.5556300000000001
    },
    {
        "publicationId": "ITH_77",
        "ith": 0.60183
    },
    {
        "publicationId": "ITH_78",
        "ith": 0.6431
    },
    {
        "publicationId": "ITH_79",
        "ith": 0.3303666666666667
    },
    {
        "publicationId": "ITH_80",
        "ith": 0.30656
    },
    {
        "publicationId": "ITH_81",
        "ith": 0.6594666666666668
    },
    {
        "publicationId": "ITH_82",
        "ith": 0.70838
    },
    {
        "publicationId": "ITH_83",
        "ith": 0.70999
    },
    {
        "publicationId": "ITH_84",
        "ith": 0.8068799999999999
    },
    {
        "publicationId": "ITH_85",
        "ith": 0.5857333333333332
    },
    {
        "publicationId": "ITH_86",
        "ith": 0.45915
    },
    {
        "publicationId": "ITH_87",
        "ith": 0.6771900000000001
    },
    {
        "publicationId": "ITH_88",
        "ith": 0.6541666666666667
    },
    {
        "publicationId": "ITH_89",
        "ith": 0.7946
    },
    {
        "publicationId": "ITH_90",
        "ith": 0.65394
    },
    {
        "publicationId": "ITH_91",
        "ith": 0.5704200000000001
    },
    {
        "publicationId": "ITH_92",
        "ith": 0.8763833333333334
    },
    {
        "publicationId": "ITH_93",
        "ith": 0.3947
    },
    {
        "publicationId": "ITH_94",
        "ith": 0.9059166666666667
    },
    {
        "publicationId": "ITH_95",
        "ith": 0.8779666666666666
    },
    {
        "publicationId": "ITH_96",
        "ith": 0.6190300000000001
    },
    {
        "publicationId": "ITH_97",
        "ith": 0.33154
    },
    {
        "publicationId": "ITH_98",
        "ith": 0.34761
    },
    {
        "publicationId": "ITH_99",
        "ith": 0.2644666666666666
    }
]

const patientList = [
    {
        "patientId": "ITH_01",
        "newick": "((((ITH_01_T9:6880.5625,(((ITH_01_T4:8267.84375,ITH_01_T6:7156.15625):19.75,(ITH_01_T1:7779.475,ITH_01_T2:8480.525):40.75):76.125,(ITH_01_T7:7275.892857,ITH_01_T8:6717.107143):60.125):8.6875):42.9375,(ITH_01_T10:7151.8,ITH_01_T11:6615.2):402.3125):109.6875,(ITH_01_T3:6567.333333,ITH_01_T5:6568.666667):124.8125):0,N:11096.1875);",
        "originValue": "0.568248406800174",
        "currentValue": "0.57"
    },
    {
        "patientId": "ITH_05",
        "newick": "((ITH_05_T2:13535,ITH_05_T1:9253):0,N:13402);",
        "originValue": "0.629676706272451",
        "currentValue": "0.63"
    },
    {
        "patientId": "ITH_06",
        "newick": "(((ITH_06_T4:34907.25,((ITH_06_T1:39047,ITH_06_T3:37837):69.75,ITH_06_T5:34566.25):38.75):344.75,ITH_06_T2:19969.5):0,N:11657.5);",
        "originValue": "0.847247905551996",
        "currentValue": "0.85"
    },
    {
        "patientId": "ITH_07",
        "newick": "(((((ITH_07_T4:19139.5,ITH_07_T3:5332.5):311.75,ITH_07_T1:40454.25):3826.75,ITH_07_T2:39441.66667):1264.333333,ITH_07_T5:8824):0,N:1230);",
        "originValue": "0.931464719815121",
        "currentValue": "0.93"
    },
    {
        "patientId": "ITH_08",
        "newick": "((ITH_08_T1:21269,((ITH_08_T2:15126.33333,ITH_08_T5:14942.66667):788.5,ITH_08_T4:14314.5):391.5):0,N:6496);",
        "originValue": "0.830650740288538",
        "currentValue": "0.83"
    },
    {
        "patientId": "ITH_09",
        "newick": "(((((ITH_09_T2:15550.75,ITH_09_T1:6595.25):88.625,ITH_09_T3:5548.375):569.125,ITH_09_T4:6623):924.5,(ITH_09_T5:8448.8,ITH_09_T6:7196.2):2007.5):0,N:9951.5);",
        "originValue": "0.629937593821569",
        "currentValue": "0.63"
    },
    {
        "patientId": "ITH_13",
        "newick": "((((((ITH_13_T3:5773.6875,ITH_13_T2:5966.3125):133.1875,ITH_13_T4:8353.8125):207.9375,ITH_13_T5:7421):373,ITH_13_T1:6424.5):799.5,ITH_13_T6:8380.4):0,N:12997.6);",
        "originValue": "0.516798213182228",
        "currentValue": "0.52"
    },
    {
        "patientId": "ITH_15",
        "newick": "((ITH_15_T2:8950,ITH_15_T1:6445):0,N:5168);",
        "originValue": "0.748674804260079",
        "currentValue": "0.75"
    },
    {
        "patientId": "ITH_16",
        "newick": "((((ITH_16_T3:6361.75,ITH_16_T2:5386.25):1134.25,ITH_16_T4:6506.75):1386.25,ITH_16_T1:9211.666667):0,N:25802.33333);",
        "originValue": "0.361132411830834",
        "currentValue": "0.36"
    },
    {
        "patientId": "ITH_17",
        "newick": "(((ITH_17_T3:7190.5,ITH_17_T2:8492.5):15838.5,ITH_17_T1:4870.5):0,N:4210.5);",
        "originValue": "0.727266923562709",
        "currentValue": "0.73"
    },
    {
        "patientId": "ITH_18",
        "newick": "((((ITH_18_T4:5256,ITH_18_T2:5940):314,ITH_18_T3:5723):1701,ITH_18_T1:5519):0,N:1882);",
        "originValue": "0.815691090248592",
        "currentValue": "0.82"
    },
    {
        "patientId": "ITH_20",
        "newick": "((ITH_20_T2:6228,ITH_20_T1:5710):0,N:16471);",
        "originValue": "0.420218944700623",
        "currentValue": "0.42"
    },
    {
        "patientId": "ITH_21",
        "newick": "((ITH_21_T5:41781.5,(ITH_21_T1:5115.5,ITH_21_T2:4990.5):5582.5):0,N:3369.5);",
        "originValue": "0.803158744593413",
        "currentValue": "0.80"
    },
    {
        "patientId": "ITH_22",
        "newick": "((ITH_22_T2:7027.5,(ITH_22_T1:54069.5,ITH_22_T3:6468.5):82.5):0,N:7725.5);",
        "originValue": "0.803415389211031",
        "currentValue": "0.80"
    },
    {
        "patientId": "ITH_23",
        "newick": "((ITH_23_T2:6848,ITH_23_T1:5183):0,N:2822);",
        "originValue": "0.810004712852622",
        "currentValue": "0.81"
    },
    {
        "patientId": "ITH_24",
        "newick": "((ITH_24_T5:5051.125,(((ITH_24_T1:5109.5,ITH_24_T2:5447.5):948,ITH_24_T3:4985):218.125,ITH_24_T4:5080.375):180.625):0,N:7900.875);",
        "originValue": "0.579208587470141",
        "currentValue": "0.58"
    },
    {
        "patientId": "ITH_25",
        "newick": "(((ITH_25_T3:6304.5,ITH_25_T2:4629.5):845.5,ITH_25_T1:3733.5):0,N:16956.5);",
        "originValue": "0.374351461382382",
        "currentValue": "0.37"
    },
    {
        "patientId": "ITH_26",
        "newick": "(((ITH_26_T3:4087,ITH_26_T2:4122):560,ITH_26_T1:3816):0,N:12297);",
        "originValue": "0.401997988906979",
        "currentValue": "0.40"
    },
    {
        "patientId": "ITH_27",
        "newick": "((ITH_27_T4:7081.75,((ITH_27_T1:5724.666667,ITH_27_T2:5428.333333):1346.75,ITH_27_T3:7046.25):342.75):0,N:13461.25);",
        "originValue": "0.49736452388576",
        "currentValue": "0.50"
    },
    {
        "patientId": "ITH_29",
        "newick": "((ITH_29_T3:6206,(ITH_29_T1:6149,ITH_29_T2:5260):204):0,N:8876);",
        "originValue": "0.570136329201899",
        "currentValue": "0.57"
    },
    {
        "patientId": "ITH_31",
        "newick": "(((((ITH_31_T3:4753.75,ITH_31_T2:4950.25):49.25,ITH_31_T4:5229.75):218.25,ITH_31_T1:5325.333333):1568.666667,ITH_31_T5:4986):0,N:15022);",
        "originValue": "0.404426875857498",
        "currentValue": "0.40"
    },
    {
        "patientId": "ITH_32",
        "newick": "(((((ITH_32_T5:5236.25,ITH_32_T4:5307.75):87.5,ITH_32_T1:5946.5):404.5,ITH_32_T2:5497.333333):609.6666667,ITH_32_T3:4733):0,N:13372);",
        "originValue": "0.447432926409809",
        "currentValue": "0.45"
    },
    {
        "patientId": "ITH_33",
        "newick": "((ITH_33_T2:4509,ITH_33_T1:4586):0,N:9868);",
        "originValue": "0.479618203870696",
        "currentValue": "0.48"
    },
    {
        "patientId": "ITH_34",
        "newick": "((((ITH_34_T8:6276.75,ITH_34_T6:6727.25):321.25,ITH_34_T2:8090.75):3201.25,ITH_34_T4:6783.333333):0,N:45765.66667);",
        "originValue": "0.249342082951807",
        "currentValue": "0.25"
    },
    {
        "patientId": "ITH_35",
        "newick": "((ITH_35_T2:4146,(ITH_35_T1:3879,ITH_35_T3:4279):20):0,N:15871);",
        "originValue": "0.340972027402948",
        "currentValue": "0.34"
    },
    {
        "patientId": "ITH_36",
        "newick": "((((ITH_36_T4:4052.5,ITH_36_T3:3477.5):467.5,ITH_36_T2:4355.5):1289.5,ITH_36_T1:3621):0,N:5980);",
        "originValue": "0.565468834969472",
        "currentValue": "0.57"
    },
    {
        "patientId": "ITH_40",
        "newick": "(((((ITH_40_T5:2332.75,ITH_40_T3:2222.25):23.25,ITH_40_T2:2250.75):2653.75,ITH_40_T1:6613.833333):3506.166667,ITH_40_T4:3198.25):0,N:5514.75);",
        "originValue": "0.527563822259499",
        "currentValue": "0.53"
    },
    {
        "patientId": "ITH_37",
        "newick": "(((ITH_37_T4:3100.75,ITH_37_T5:3260.25):242.625,((ITH_37_T1:3143.166667,ITH_37_T2:3309.833333):105.125,ITH_37_T3:3484.875):78.125):0,N:12448.375);",
        "originValue": "0.352066435669616",
        "currentValue": "0.35"
    },
    {
        "patientId": "ITH_41",
        "newick": "((((ITH_41_T2:8404.25,(ITH_41_T4:7319.5,ITH_41_T5:6818.5):1184.75):87.75,ITH_41_T3:6868.25):354.75,ITH_41_T1:7565.333333):0,N:9902.666667);",
        "originValue": "0.604577799672669",
        "currentValue": "0.60"
    },
    {
        "patientId": "ITH_42",
        "newick": "((ITH_42_T1:2719,((ITH_42_T3:2184.333333,ITH_42_T5:3639.666667):31,ITH_42_T2:2354):10):0,N:2358);",
        "originValue": "0.696251391703331",
        "currentValue": "0.70"
    },
    {
        "patientId": "ITH_43",
        "newick": "((ITH_43_T4:4457,((ITH_43_T1:4652.5,ITH_43_T10:3935.5):105.25,(ITH_43_T13:3862,ITH_43_T7:4763):126.25):86.25):0,N:13085);",
        "originValue": "0.401601482073777",
        "currentValue": "0.40"
    },
    {
        "patientId": "ITH_44",
        "newick": "(((ITH_44_T18:7384,ITH_44_T11:7393):234,(ITH_44_T1:6666,ITH_44_T6:7138):1866):0,N:22246);",
        "originValue": "0.409663848139705",
        "currentValue": "0.41"
    },
    {
        "patientId": "ITH_45",
        "newick": "((((ITH_45_T3:7165,ITH_45_T2:6904):1438.25,(ITH_45_T4:5000.833333,ITH_45_T5:5165.166667):1620.75):61275.75,ITH_45_T1:3379.25):0,N:577.75);",
        "originValue": "0.507618223548065",
        "currentValue": "0.51"
    },
    {
        "patientId": "ITH_48",
        "newick": "((ITH_48_T3:4283.75,((ITH_48_T1:3809.666667,ITH_48_T2:4081.333333):851.75,ITH_48_T4:5324.25):586.75):0,N:26630.25);",
        "originValue": "0.264066785055149",
        "currentValue": "0.26"
    },
    {
        "patientId": "ITH_49",
        "newick": "((ITH_49_T4:4352,ITH_49_T3:4290):0,N:8562);",
        "originValue": "0.502325040688212",
        "currentValue": "0.50"
    },
    {
        "patientId": "ITH_39",
        "newick": "(((ITH_39_T3:5437,ITH_39_T2:4668):597,ITH_39_T1:4534):0,N:18443);",
        "originValue": "0.352647877615855",
        "currentValue": "0.35"
    },
    {
        "patientId": "ITH_50",
        "newick": "((ITH_50_T4:4181.25,(((ITH_50_T1:4628.25,ITH_50_T2:4004.75):40.5,ITH_50_T3:4051.5):235.25,ITH_50_T5:5150.25):16.75):0,N:12795.75);",
        "originValue": "0.410074382869237",
        "currentValue": "0.41"
    },
    {
        "patientId": "ITH_51",
        "newick": "(((((ITH_51_T4:6607.25,ITH_51_T3:8995.75):664,ITH_51_T5:7202):4920,ITH_51_T2:7390):2583,ITH_51_T1:12091):0,N:9111);",
        "originValue": "0.631006963149579",
        "currentValue": "0.63"
    },
    {
        "patientId": "ITH_56",
        "newick": "((ITH_56_T2:5701,ITH_56_T1:4224):0,N:663);",
        "originValue": "0.937381941820929",
        "currentValue": "0.94"
    },
    {
        "patientId": "ITH_54",
        "newick": "((ITH_54_T2:7161,ITH_54_T1:7137):0,N:13338);",
        "originValue": "0.517368649587495",
        "currentValue": "0.52"
    },
    {
        "patientId": "ITH_52",
        "newick": "(((((ITH_52_T2:3795.125,ITH_52_T1:4754.875):167.125,ITH_52_T3:5108.875):291.625,ITH_52_T4:5234.333333):347.6666667,ITH_52_T5:5035):0,N:13458);",
        "originValue": "0.419893400330466",
        "currentValue": "0.42"
    },
    {
        "patientId": "ITH_53",
        "newick": "(((ITH_53_MF2T2:6180,ITH_53_MF2T1:6724):10509,ITH_53_MF1T1:25513):0,N:513);",
        "originValue": "0.838487674619641",
        "currentValue": "0.84"
    },
    {
        "patientId": "ITH_55",
        "newick": "(((((ITH_55_T2:5185.25,ITH_55_T1:4255.75):1305,ITH_55_T3:7920):2101.5,ITH_55_T4:8180.833333):1720.166667,ITH_55_T5:5019.75):0,N:3477.25);",
        "originValue": "0.738349074508788",
        "currentValue": "0.74"
    },
    {
        "patientId": "ITH_72",
        "newick": "((((ITH_72_T2:3202.75,ITH_72_T1:3423.25):88,ITH_72_T3:3075):1218.5,(ITH_72_T4:3716.25,ITH_72_T5:3712.75):897.5):0,N:10479.5);",
        "originValue": "0.425961714456621",
        "currentValue": "0.43"
    },
    {
        "patientId": "ITH_57",
        "newick": "(((ITH_57_MF2T2:4291.5,ITH_57_MF2T1:3988.5):825.5,ITH_57_MF1T1:5515.5):0,N:14676.5);",
        "originValue": "0.393780809886231",
        "currentValue": "0.39"
    },
    {
        "patientId": "ITH_68",
        "newick": "((ITH_68_T2:2770,ITH_68_T1:2952):0,N:17730);",
        "originValue": "0.243987719597476",
        "currentValue": "0.24"
    },
    {
        "patientId": "ITH_69",
        "newick": "(((ITH_69_T1:5741.75,((ITH_69_T2:4677.333333,ITH_69_T3:5531.666667):1152.75,ITH_69_T4:6512.25):425.25):2367.25,ITH_69_T5:7198.25):0,N:17937.75);",
        "originValue": "0.411371519023991",
        "currentValue": "0.41"
    },
    {
        "patientId": "ITH_58",
        "newick": "((ITH_58_T3:5010,(ITH_58_T1:4287,ITH_58_T2:4209):188):0,N:6312);",
        "originValue": "0.588470877277907",
        "currentValue": "0.59"
    },
    {
        "patientId": "ITH_71",
        "newick": "((ITH_71_T2:9794,ITH_71_T1:3966):0,N:5500);",
        "originValue": "0.714434060228453",
        "currentValue": "0.71"
    },
    {
        "patientId": "ITH_59",
        "newick": "(((ITH_59_T4:11636.5,ITH_59_T3:8666.5):1745,(ITH_59_T1:10339,ITH_59_T2:8890):3817):0,N:12482);",
        "originValue": "0.634377366994365",
        "currentValue": "0.63"
    },
    {
        "patientId": "ITH_60",
        "newick": "((ITH_60_T4:4134,((ITH_60_T1:6146,ITH_60_T2:4456):4643.5,ITH_60_T3:4430.5):2594.5):0,N:638);",
        "originValue": "0.84673149206558",
        "currentValue": "0.85"
    },
    {
        "patientId": "ITH_61",
        "newick": "((ITH_61_T2:3862,ITH_61_T1:3561):0,N:9215);",
        "originValue": "0.44614737348239",
        "currentValue": "0.45"
    },
    {
        "patientId": "ITH_62",
        "newick": "((ITH_62_T2:4989,ITH_62_T1:3654):0,N:11889);",
        "originValue": "0.420952659263589",
        "currentValue": "0.42"
    },
    {
        "patientId": "ITH_97",
        "newick": "((((ITH_97_T2:2877.5,ITH_97_T1:3015.5):41.5,ITH_97_T3:2680.5):46.5,(ITH_97_T4:2534.5,ITH_97_T5:2880.5):49):0,N:11420);",
        "originValue": "0.331522503530924",
        "currentValue": "0.33"
    },
    {
        "patientId": "ITH_98",
        "newick": "(((((ITH_98_T3:4079.875,ITH_98_T2:4419.125):53.625,ITH_98_T4:3962.375):78.625,ITH_98_T5:4029.5):398.5,ITH_98_T1:5037.25):0,N:16313.75);",
        "originValue": "0.347618701851422",
        "currentValue": "0.35"
    },
    {
        "patientId": "ITH_99",
        "newick": "(((ITH_99_T3:3021,ITH_99_T2:2546):27,ITH_99_T1:2836):0,N:15617);",
        "originValue": "0.264465646560694",
        "currentValue": "0.26"
    },
    {
        "patientId": "ITH_100",
        "newick": "((((ITH_100_T5:5663.75,(ITH_100_T1:5490.75,ITH_100_T2:4371.25):848.25):122.25,ITH_100_T3:4945.25):760.75,ITH_100_T4:3604.333333):0,N:11706.66667);",
        "originValue": "0.460006498257989",
        "currentValue": "0.46"
    },
    {
        "patientId": "ITH_101",
        "newick": "(((((ITH_101_T3:4021.125,ITH_101_T2:4176.875):60.625,ITH_101_T4:4251.375):422.125,ITH_101_T5:4387):978,ITH_101_T1:5237):0,N:14703);",
        "originValue": "0.380857130177107",
        "currentValue": "0.38"
    },
    {
        "patientId": "ITH_80",
        "newick": "((ITH_80_T5:4973.5,(((ITH_80_T1:4276.75,ITH_80_T2:3953.25):148.8333333,ITH_80_T3:4342.166667):34.25,ITH_80_T4:4285.25):32.75):0,N:19993.5);",
        "originValue": "0.306561333255935",
        "currentValue": "0.31"
    },
    {
        "patientId": "ITH_63",
        "newick": "(((((ITH_63_T2:4222.25,ITH_63_T1:4682.75):327.25,ITH_63_T5:4316.75):743.75,ITH_63_T3:5955.5):442.5,ITH_63_T4:4294.25):0,N:30726.75);",
        "originValue": "0.246022071061247",
        "currentValue": "0.25"
    },
    {
        "patientId": "ITH_64",
        "newick": "((((ITH_64_T4:5393.25,ITH_64_T1:4994.75):149.25,ITH_64_T2:5689.75):1428.25,ITH_64_T3:7585):0,N:7665);",
        "originValue": "0.597768263186733",
        "currentValue": "0.60"
    },
    {
        "patientId": "ITH_65",
        "newick": "(((ITH_65_T2:15738.25,ITH_65_T1:16675.75):9647.75,(ITH_65_T3_repeat:4620.333333,ITH_65_T4:4612.666667):12210.75):0,N:23081.25);",
        "originValue": "0.549791402178314",
        "currentValue": "0.55"
    },
    {
        "patientId": "ITH_66",
        "newick": "((((ITH_66_T5:5432.5,(ITH_66_T3:5868.5,ITH_66_T4:5285.5):270.5):141.5,ITH_66_T2:5830.5):155.5,ITH_66_T1:6412):0,N:14297);",
        "originValue": "0.449796775618483",
        "currentValue": "0.45"
    },
    {
        "patientId": "ITH_67",
        "newick": "(((ITH_67_T1:4561.75,ITH_67_T2:3968.25):3065.875,((ITH_67_T4:5250.166667,ITH_67_T5:4732.833333):772.375,ITH_67_T3:4752.625):727.375):0,N:23771.125);",
        "originValue": "0.329681480613852",
        "currentValue": "0.33"
    },
    {
        "patientId": "ITH_81",
        "newick": "((ITH_81_T3:5577,(ITH_81_T1:6823,ITH_81_T2:6529):2805):0,N:6586);",
        "originValue": "0.659489290645101",
        "currentValue": "0.66"
    },
    {
        "patientId": "ITH_73",
        "newick": "((((ITH_73_T3:4296.25,ITH_73_T2:5182.75):2249.25,ITH_73_T1:6630.75):4066.25,ITH_73_T4:4033.333333):0,N:692.6666667);",
        "originValue": "0.820657843996494",
        "currentValue": "0.82"
    },
    {
        "patientId": "ITH_82",
        "newick": "(((ITH_82_T4:97670.75,((ITH_82_T1:4757,ITH_82_T5:3971):48.75,ITH_82_T2:4054.25):39.75):9128.25,ITH_82_T3:4341.5):0,N:4905.5);",
        "originValue": "0.708376899768669",
        "currentValue": "0.71"
    },
    {
        "patientId": "ITH_74",
        "newick": "((((ITH_74_MF1_T4:4262,ITH_74_MF1_T5:4084):713.8125,(ITH_74_MF1_T2:4509.5,ITH_74_MF1_T3:4568.5):263.1875):16.8125,((ITH_74_MF2_T1:3802.1,ITH_74_MF2_T2:4222.9):523.5833333,ITH_74_MF1_T1:5419.416667):133.3125):0,N:7452.1875);",
        "originValue": "0.559976310809148",
        "currentValue": "0.56"
    },
    {
        "patientId": "ITH_75",
        "newick": "(((ITH_75_T4:5308.75,ITH_75_T5:6530.25):872.25,((ITH_75_T1:7341,ITH_75_T2:7853):281.75,ITH_75_T3:6705.25):196.25):0,N:19929.75);",
        "originValue": "0.415348071450176",
        "currentValue": "0.42"
    },
    {
        "patientId": "ITH_83",
        "newick": "(((ITH_83_T2:4742.25,((ITH_83_T3:170924,ITH_83_T4:18698):183.25,ITH_83_T5:47384.75):132.25):855.75,ITH_83_T1:7645):0,N:22927);",
        "originValue": "0.709980603189961",
        "currentValue": "0.71"
    },
    {
        "patientId": "ITH_96",
        "newick": "((ITH_96_T4:6499.125,(((ITH_96_T1:8510.5,ITH_96_T2:6839.5):1199,ITH_96_T3:6277):622.875,ITH_96_T5:8545.625):591.375):0,N:8653.875);",
        "originValue": "0.619049520299898",
        "currentValue": "0.62"
    },
    {
        "patientId": "ITH_102",
        "newick": "(((ITH_102_T1:4933.75,ITH_102_T2:14148.25):253.5,((ITH_102_T3:74573.33333,ITH_102_T4:8479.666667):173,ITH_102_T5:10030):90.5):0,N:5245.5);",
        "originValue": "0.842785308823493",
        "currentValue": "0.84"
    },
    {
        "patientId": "ITH_103",
        "newick": "((ITH_103_T4:3685,((ITH_103_T1:5742.333333,ITH_103_T2:5805.666667):415,ITH_103_T3:4056):146):0,N:900);",
        "originValue": "0.905373959841869",
        "currentValue": "0.91"
    },
    {
        "patientId": "ITH_84",
        "newick": "(((ITH_84_T5:90701,((ITH_84_T3:38140.33333,ITH_84_T4:51705.66667):22344,ITH_84_T2:67968):10631):48892,ITH_84_T1:6074):0,N:3061);",
        "originValue": "0.80688699781951",
        "currentValue": "0.81"
    },
    {
        "patientId": "ITH_106",
        "newick": "((ITH_106_MF1T4:3617.375,(((ITH_106_MF1T2:4880.125,ITH_106_MF1T3:5345.875):4936.916667,ITH_106_MF1T1:5267.083333):143.75,(ITH_106_MF2T1:4034.2,ITH_106_MF2T2:14926.8):6836.5):53):0,N:252.625);",
        "originValue": "0.943722367025848",
        "currentValue": "0.94"
    },
    {
        "patientId": "ITH_107",
        "newick": "((((ITH_107_MF1T2:5952.5,((ITH_107_MF1T4:5550.833333,ITH_107_MF1T5:5567.166667):341,ITH_107_MF1T3:5752):271):828.75,ITH_107_MF1T1:7057.25):14550.25,(ITH_107_MF2T1:8134.5,ITH_107_MF2T2:6258.5):16625.9):0,N:536.1);",
        "originValue": "0.704529711256359",
        "currentValue": "0.70"
    },
    {
        "patientId": "ITH_108",
        "newick": "((ITH_108_MF1T3:5345,(ITH_108_MF1T1:9612,ITH_108_MF1T2:5027):189):0,N:9615);",
        "originValue": "0.578143214975977",
        "currentValue": "0.58"
    },
    {
        "patientId": "ITH_109",
        "newick": "((ITH_109_MF1T3:7102,((ITH_109_MF1T1:8768.166667,ITH_109_MF1T4:7374.833333):232.75,(ITH_109_MF1T2:7509,ITH_109_MF1T5:7630):243.75):112.75):0,N:27516);",
        "originValue": "0.361930642657508",
        "currentValue": "0.36"
    },
    {
        "patientId": "ITH_110",
        "newick": "((((ITH_110_MF1T3:7140.25,ITH_110_MF1T1:7653.75):463.75,(ITH_110_MF1T4:19536.66667,ITH_110_MF1T5:42284.33333):468.75):580.25,ITH_110_MF1T2:7481):0,N:8627);",
        "originValue": "0.758626011334471",
        "currentValue": "0.76"
    },
    {
        "patientId": "ITH_118",
        "newick": "((ITH_118_T2:9274,ITH_118_T1:9555):0,N:12376);",
        "originValue": "0.603396891523794",
        "currentValue": "0.60"
    },
    {
        "patientId": "ITH_88",
        "newick": "((ITH_88_T3:6718,(ITH_88_T1:6208,ITH_88_T2:6271):453):0,N:6770);",
        "originValue": "0.654154360508227",
        "currentValue": "0.65"
    },
    {
        "patientId": "ITH_89",
        "newick": "((ITH_89_T3:8174.5,(ITH_89_T1:6092.5,ITH_89_T2:6450.5):503.5):0,N:3461.5);",
        "originValue": "0.794590386145027",
        "currentValue": "0.79"
    },
    {
        "patientId": "ITH_90",
        "newick": "(((((ITH_90_T4:4641.375,ITH_90_T3:5063.625):212.375,ITH_90_T1:5668.625):384.875,ITH_90_T2:5577.333333):6288.666667,ITH_90_T5:6819):0,N:3313);",
        "originValue": "0.653942834100325",
        "currentValue": "0.65"
    },
    {
        "patientId": "ITH_91",
        "newick": "((((ITH_91_T5:6302.875,ITH_91_T3:6424.125):112.625,ITH_91_T4:6678.375):1027.125,(ITH_91_T1:7245.5,ITH_91_T2:6293.5):815):0,N:10380);",
        "originValue": "0.570422227993512",
        "currentValue": "0.57"
    },
    {
        "patientId": "ITH_131",
        "newick": "(((ITH_131_T1:4815,ITH_131_T2:6437):910.3125,(((ITH_131_T4:4748.625,ITH_131_T5:5293.375):500.5833333,ITH_131_T3:5455.416667):516.0625,ITH_131_T6:5516.4375):106.5625):0,N:16958.6875);",
        "originValue": "0.407883574062934",
        "currentValue": "0.41"
    },
    {
        "patientId": "ITH_134",
        "newick": "((ITH_134_T1:5084.5,((ITH_134_T3:5109.333333,ITH_134_T4:5117.666667):98,ITH_134_T2:4943):78):0,N:10089.5);",
        "originValue": "0.502549516078868",
        "currentValue": "0.50"
    },
    {
        "patientId": "ITH_132",
        "newick": "(((ITH_132_T3:7110,ITH_132_T2:9147):124,ITH_132_T1:9393):0,N:11929);",
        "originValue": "0.588847787703339",
        "currentValue": "0.59"
    },
    {
        "patientId": "ITH_130",
        "newick": "((ITH_130_T3:6372,(ITH_130_T1:4200,ITH_130_T2:4089):1750):0,N:16614);",
        "originValue": "0.386825501829923",
        "currentValue": "0.39"
    },
    {
        "patientId": "ITH_133",
        "newick": "((ITH_133_T2:7389,ITH_133_T1:7856):0,N:13653);",
        "originValue": "0.527545158834521",
        "currentValue": "0.53"
    },
    {
        "patientId": "ITH_121",
        "newick": "((ITH_121_T3:8270,(ITH_121_T1:5988,ITH_121_T2:5648):820):0,N:9975);",
        "originValue": "0.57231745334418",
        "currentValue": "0.57"
    },
    {
        "patientId": "ITH_122",
        "newick": "((ITH_122_T2:5913.5,((ITH_122_T3:7191.666667,ITH_122_T4:7128.333333):1572.5,ITH_122_T1:7489.5):66.5):0,N:13797.5);",
        "originValue": "0.514791472586171",
        "currentValue": "0.51"
    },
    {
        "patientId": "ITH_123",
        "newick": "((ITH_123_T2:3615,ITH_123_T1:4428):0,N:9461);",
        "originValue": "0.459494972577697",
        "currentValue": "0.46"
    },
    {
        "patientId": "ITH_125",
        "newick": "(((ITH_125_T4:12107.25,ITH_125_T1:10562.75):4616.25,(ITH_125_T2:9624.333333,ITH_125_T3:11814.66667):5017.25):0,N:7018.75);",
        "originValue": "0.762353935913529",
        "currentValue": "0.76"
    },
    {
        "patientId": "ITH_126",
        "newick": "(((ITH_126_MF1T2:14708.625,((ITH_126_MF1T1:11120.5,ITH_126_MF1T4:11476.5):836.875,ITH_126_MF1T3:10284.125):680.375):3106.375,ITH_126_MF2_T1:7245.5):0,N:6916.5);",
        "originValue": "0.729970783622902",
        "currentValue": "0.73"
    },
    {
        "patientId": "ITH_128",
        "newick": "(((ITH_128_T2:5385.75,ITH_128_T1:6218.25):281.5,((ITH_128_T4:5116.5,ITH_128_T5:6854.5):442.6666667,ITH_128_T3:5248.333333):325.5):0,N:13001.5);",
        "originValue": "0.479726994107047",
        "currentValue": "0.48"
    },
    {
        "patientId": "ITH_127",
        "newick": "(((((ITH_127_T3:6614.5,(ITH_127_T1:6340.5,ITH_127_T2:6463.5):257.5):0,N:18127.5);",
        "originValue": "0.418654351786414",
        "currentValue": "0.42"
    },
    {
        "patientId": "ITH_129",
        "newick": "((ITH_129_T2:5370,ITH_129_T1:6793):0,N:4365);",
        "originValue": "0.735902710551791",
        "currentValue": "0.74"
    },
    {
        "patientId": "ITH_138",
        "newick": "((ITH_138_T2:7974,ITH_138_T1:10444):0,N:16361);",
        "originValue": "0.529572443140976",
        "currentValue": "0.53"
    },
    {
        "patientId": "ITH_124",
        "newick": "(((ITH_124_T3:7023.5,ITH_124_T2:7576.5):1012.5,ITH_124_T1:8504.5):0,N:17474.5);",
        "originValue": "0.474015008241609",
        "currentValue": "0.47"
    },
    {
        "patientId": "ITH_85",
        "newick": "((ITH_85_T3:9040,(ITH_85_T1:7214,ITH_85_T2:6563):1056):0,N:10842);",
        "originValue": "0.585731799320918",
        "currentValue": "0.59"
    },
    {
        "patientId": "ITH_76",
        "newick": "(((((ITH_76_T2:7996.75,ITH_76_T1:8157.25):280.5,ITH_76_T5:7136.5):771.5,ITH_76_T3:9250):7059,ITH_76_T4:5937.5):0,N:10759.5);",
        "originValue": "0.555620719124771",
        "currentValue": "0.56"
    },
    {
        "patientId": "ITH_77",
        "newick": "((((ITH_77_T1:6269,(ITH_77_T4:7858.25,ITH_77_T5:8225.75):607):319.5,ITH_77_T2:7520):521,ITH_77_T3:7144.333333):0,N:9789.666667);",
        "originValue": "0.601821962463123",
        "currentValue": "0.60"
    },
    {
        "patientId": "ITH_78",
        "newick": "((ITH_78_T2:4556,ITH_78_T1:8348):0,N:7161);",
        "originValue": "0.643109892848243",
        "currentValue": "0.64"
    },
    {
        "patientId": "ITH_86",
        "newick": "((ITH_86_T5:5782.625,(((ITH_86_T3:4201.5,ITH_86_T4:4507.5):302.3333333,ITH_86_T2:4147.666667):155.625,ITH_86_T1:3559.875):86.125):0,N:10653.375);",
        "originValue": "0.459135439948525",
        "currentValue": "0.46"
    },
    {
        "patientId": "ITH_87",
        "newick": "(((((ITH_87_T2:5600,ITH_87_T1:5417):1542,ITH_87_T5:7983):1824,ITH_87_T4:7163.333333):9311.666667,ITH_87_T3:7021):0,N:2810);",
        "originValue": "0.677186684421024",
        "currentValue": "0.68"
    },
    {
        "patientId": "ITH_70",
        "newick": "((((ITH_70_T3:4434.75,ITH_70_T2:3189.25):55.25,ITH_70_T4:4290.75):196.25,ITH_70_T1:3694):0,N:14462);",
        "originValue": "0.352320082631282",
        "currentValue": "0.35"
    },
    {
        "patientId": "ITH_120",
        "newick": "((ITH_120_T2:5257,ITH_120_T1:4700):0,N:8884);",
        "originValue": "0.528475134016241",
        "currentValue": "0.53"
    },
    {
        "patientId": "ITH_79",
        "newick": "((ITH_79_T3:5444.5,(ITH_79_T1:5941.5,ITH_79_T2:4792.5):550.5):0,N:22403.5);",
        "originValue": "0.330380280270794",
        "currentValue": "0.33"
    },
    {
        "patientId": "ITH_111",
        "newick": "((ITH_111_T3:4729.125,(((ITH_111_T1:4965.5,ITH_111_T2:4596.5):854.6666667,ITH_111_T4:4427.333333):40.625,ITH_111_T5:4611.875):36.125):0,N:13859.875);",
        "originValue": "0.414042739800999",
        "currentValue": "0.41"
    },
    {
        "patientId": "ITH_112",
        "newick": "(((ITH_112_T5:5380.25,(ITH_112_T1:4237.25,ITH_112_T2:4093.75):565.75):145.75,(ITH_112_T3:4412.666667,ITH_112_T4:4558.333333):514.25):0,N:11344.75);",
        "originValue": "0.459672214823305",
        "currentValue": "0.46"
    },
    {
        "patientId": "ITH_117",
        "newick": "((ITH_117_T3:4861,ITH_117_T1:5343):0,N:7568);",
        "originValue": "0.574161602520819",
        "currentValue": "0.57"
    },
    {
        "patientId": "ITH_115",
        "newick": "((ITH_115_T2:7898,ITH_115_T1:5146):0,N:9441);",
        "originValue": "0.580120080053369",
        "currentValue": "0.58"
    },
    {
        "patientId": "ITH_114",
        "newick": "((ITH_114_T3:4342,(ITH_114_T1:3852,ITH_114_T2:3746):352):0,N:12688);",
        "originValue": "0.390031313261074",
        "currentValue": "0.39"
    },
    {
        "patientId": "ITH_136",
        "newick": "((ITH_136_T1:5760.625,(((ITH_136_T2:6249.75,ITH_136_T5:7264.25):4506.166667,ITH_136_T4:4960.833333):1327.625,ITH_136_T3:5977.375):941.625):0,N:6893.375);",
        "originValue": "0.648886839332525",
        "currentValue": "0.65"
    },
    {
        "patientId": "ITH_104",
        "newick": "(((ITH_104_T3:3450,ITH_104_T2:3409):294,(ITH_104_T1:3804.333333,ITH_104_T4:3732.666667):336):0,N:638);",
        "originValue": "0.910736801877832",
        "currentValue": "0.91"
    },
    {
        "patientId": "ITH_105",
        "newick": "((ITH_105_T2:4168.5,(((ITH_105_T4:4856.75,ITH_105_T5:6276.25):128.5,ITH_105_T3:4355.5):223.25,ITH_105_T1:4351.25):69.75):0,N:2173.5);",
        "originValue": "0.809170612567283",
        "currentValue": "0.81"
    },
    {
        "patientId": "ITH_92",
        "newick": "((((ITH_92_T4-T5:10428,ITH_92_T3:4861):191.5,ITH_92_T2:4997.5):1581.5,ITH_92_T1:4805):0,N:1084);",
        "originValue": "0.876387709875478",
        "currentValue": "0.88"
    },
    {
        "patientId": "ITH_93",
        "newick": "((((ITH_93_T4-T5:19576,ITH_93_T3:8156):1418,ITH_93_T2:8503):4525,ITH_93_T1:8159.666667):0,N:35967.33333);",
        "originValue": "0.394706918881749",
        "currentValue": "0.39"
    },
    {
        "patientId": "ITH_94",
        "newick": "((((ITH_94_T4-T5:7076.5,ITH_94_T1:4407.5):51.5,ITH_94_T2:3870.5):153.5,ITH_94_T3:3807):0,N:916);",
        "originValue": "0.905909714337587",
        "currentValue": "0.91"
    },
    {
        "patientId": "ITH_95",
        "newick": "((ITH_95_T2:108898,(ITH_95_T1:5854,ITH_95_T3-T4:10318):570):0,N:5581);",
        "originValue": "0.877943408322415",
        "currentValue": "0.88"
    },
    {
        "patientId": "ITH_135",
        "newick": "((ITH_135_T4-T5:12673.5,((ITH_135_T2:5731.666667,ITH_135_T3:6081.333333):1779,ITH_135_T1:6818):411):0,N:8595.5);",
        "originValue": "0.643723129849863",
        "currentValue": "0.64"
    }
]
const PhylogeneticRelationship = ({ range = [0, 1], treeType = "overview" }) => {
    const [pieChartOption, setPieChartOption] = useState();
    const [columnOption, setColumnOption] = useState();
    const [loading, setLoading] = useState(true);
    const [rangeList, setRangeList] = useState([]);
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const [activeBar, setActiveBar] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const patientListRef = useRef(null);
    const currentPatientRef = useRef(null);
    const rangePatientListRef = useRef(null);

    useEffect(() => {
        setLoading(true)
        const fetchData = async () => {
            // let [ITHList, patientList] = await Promise.all([getITHList(), getPatientList()]);
            // console.log("ITHList", ITHList)
            // console.log("patientList", patientList)
            if (!ITHList || !patientList) return;
            let _patientList = ITHList?.map((item) => {
                const currentPatient = patientList.find((patient) => patient.patientId == item.publicationId);
                return {
                    ...currentPatient,
                    currentValue: item.ith?.toFixed(2)
                }
            })
            _patientList = _patientList?.sort((a, b) => a.currentValue - b.currentValue);
            patientListRef.current = _patientList;
            patientListRef.current = buildAllPatientsData();
            rangePatientListRef.current = getPatientListByRange();
            setRangeList(rangePatientListRef.current);
            buildPieChart();
            buildBarChart();
        }
        fetchData();
        setLoading(false);
    }, []);

    const getPatientListByRange = () => {
        return patientListRef.current?.filter((item) => {
            return item.ITH >= range[0] && item.ITH <= range[1];
        })
    }

    const getPatientListByActiveBar = () => {
        const [min, max] = activeBar.split("~");
        return rangePatientListRef.current.filter((item) => {
            return item.ITH > min && item.ITH <= max
        })
    }


    useEffect(() => {
        if (!range?.length) return;
        rangePatientListRef.current = getPatientListByRange();
        const barEchartsInstance = barChartRef.current?.getEchartsInstance();
        barEchartsInstance?.setOption({
            series: [{
                data: getBarSeriesData(),
            }]
        });
        if (activeBar && activeBar !== "all") {
            rangePatientListRef.current = getPatientListByActiveBar()
        }
        barEchartsInstance?.setOption({
            title: {
                text: `Total: ${rangePatientListRef.current?.length ?? 0}`,
            }
        });
        const pieEchartsInstance = pieChartRef.current?.getEchartsInstance();
        pieEchartsInstance?.setOption({
            series: [{
                data: buildPieSeriesData()
            }]
        });
        setRangeList(rangePatientListRef.current);
    }, [range, activeBar])

    function generateGradientColors(totalSteps) {
        const colors = [];
        const segments = baseColors.length - 1;
        const stepsPerSegment = Math.floor(totalSteps / segments);

        for (let i = 0; i < segments; i++) {
            const start = baseColors[i];
            const end = baseColors[i + 1];

            // 当前分段的步数（最后一个分段补齐剩余步数）
            const steps = (i === segments - 1)
                ? totalSteps - (stepsPerSegment * (segments - 1))
                : stepsPerSegment;

            for (let j = 0; j < steps; j++) {
                const ratio = j / steps;
                const r = Math.round(start.r + (end.r - start.r) * ratio);
                const g = Math.round(start.g + (end.g - start.g) * ratio);
                const b = Math.round(start.b + (end.b - start.b) * ratio);
                colors.push(`rgb(${r},${g},${b})`);
            }
        }
        return colors;
    }

    const buildPieChart = () => {
        const _pieChartOption = {
            grid: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                containLabel: false
            },
            responsive: true,
            tooltip: {
                trigger: 'item',
                formatter: function (params) {
                    const color = params.color;
                    return `
                    <div style="padding:5px">
                        <span style="display:inline-block;
                                    width:12px;
                                    height:12px;
                                    background:${color};
                                    margin-right:8px;
                                    border-radius:2px">
                        </span><span >${params.name}</span> <span style="font-weight:bold">${params?.data?.ITH}<span>
                    </div>
                `;
                }
            },
            series: [
                {
                    emphasis: {
                        scale: 0,
                    },
                    name: '',
                    type: 'pie',
                    radius: ['60%', '100%'], // 外径已设为100%
                    startAngle: 180,
                    endAngle: 0,
                    data: buildPieSeriesData(),
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false
                    },
                    itemStyle: {
                        borderRadius: 8, // 增大圆角
                        borderColor: '#fff',
                        borderWidth: 0
                    }
                }
            ],
        };

        setPieChartOption(_pieChartOption);
    }

    const getBarData = () => {
        return BAR_CATEGORIES.map((item) => {
            const [minValue, maxValue] = item.split("~");
            const filteredPatients = getAreaPatientData(minValue, maxValue)
            return filteredPatients?.length ?? 0
        });
    }

    const getBarSeriesData = () => {
        const barData = getBarData();
        return generateGradientColors(barData.length
        ).map((color, index) => ({
            name: BAR_CATEGORIES[index],
            value: barData[index],
            itemStyle: { color, borderRadius: [5, 5, 0, 0], borderWidth: BAR_CATEGORIES[index] === activeBar ? 3 : 0, borderColor: "rgb(29, 86, 126)" },
        }))
    }

    const buildBarChart = () => {
        const _columnOption = {
            grid: {
                top: 20,
                right: 0,
                bottom: 0,
                left: 0,
                containLabel: true
            },
            title: {
                text: `Total: ${rangePatientListRef.current?.length ?? 0}`,
                left: 'center',
                top: "0",
                textStyle: {
                    fontSize: "14px",
                    color: "#000"
                }
            },
            responsive: true,
            tooltip: {
                trigger: 'item',
            },
            xAxis: {
                show: true,
                type: 'category',
                data: BAR_AXIS,
                axisLabel: {
                    interval: 0,
                    fontSize: 8,
                    color: "#666",
                    align: "right",
                    padding: [0, 8, 0, 0] // 左内边距10px
                },
                axisLine: {
                    lineStyle: {
                        color: '#CCCCCC' // 浅灰色轴线
                    }
                },
                axisTick: { show: false },
            },
            yAxis: {
                axisLabel: {
                    width: 0,
                    show: false,
                },
                show: false,
                type: 'value'
            },
            series: [
                {
                    data: getBarSeriesData(),
                    type: 'bar',
                    barWidth: '100%',  // 柱子宽度设为100%
                    barGap: '0%',
                }
            ]
        };

        setColumnOption(_columnOption);
    }

    function calculateFanLayout(numElements = 1) {
        const centerPosition = { rotate: 0, translate: "0px, -20px" };
        if (numElements === 1) {
            return [{ rotate: 0, translate: "300px, -20px" }];
        }
        else if (numElements === 2) {
            return [{ rotate: -30, translate: "100px, 80px" },
            { rotate: 30, translate: "-100px, 80px" },]
        } else if (numElements === 3) {
            return [{ rotate: -40, translate: "0px, 90px" }, centerPosition, { rotate: 40, translate: "0px, 90px" }]
        } else if (numElements === 4) {
            return [{ rotate: -55, translate: "-135px, 60px" },
            { rotate: -20, translate: "-30px, -20px" },
            { rotate: 20, translate: "30px, -20px" },
            { rotate: 55, translate: "135px, 60px" },]
        } else if (numElements === 5) {
            return [{ rotate: -55, translate: "-135px, 60px" },
            { rotate: -30, translate: "-30px, 0px" },
                centerPosition,
            { rotate: 30, translate: "30px, 0px" },
            { rotate: 55, translate: "135px, 60px" },]
        } else {
            return [
                { rotate: -80, translate: "-300px, -20px" },
                { rotate: -50, translate: "-160px, -10px" },
                { rotate: -15, translate: "-50px, -20px" },
                { rotate: 15, translate: "50px, -20px" },
                { rotate: 50, translate: "160px, -10px" },
                { rotate: 80, translate: "300px, -20px" }
            ]
        }
    }

    function getSamplesFromNewick(newick) {
        const regex = /([^(),:]+):\d+(\.\d+)?/g;
        const samples = [];
        let match;
        while ((match = regex.exec(newick)) !== null) {
            samples.push(match[1]);
        }
        return samples.length;
    }

    const getVisibleTreeList = () => {
        if (!rangePatientListRef.current?.length) return;
        const patientLength = rangePatientListRef.current.length;
        let result = [];

        if (patientLength >= VISIBLE_TREE_LENGTH) {
            const patientsWithSamples = rangePatientListRef.current.map(item => ({
                ...item,
                sampleLength: getSamplesFromNewick(item.newick)
            }));

            // 计算如何尽量均匀分成 6 份
            const baseChunkSize = Math.floor(patientLength / VISIBLE_TREE_LENGTH);
            const remainder = patientLength % VISIBLE_TREE_LENGTH;

            let start = 0;
            for (let i = 0; i < VISIBLE_TREE_LENGTH; i++) {
                // 前 `remainder` 个 chunk 多 1 个元素
                const end = start + baseChunkSize + (i < remainder ? 1 : 0);
                const chunk = patientsWithSamples.slice(start, end);
                start = end;

                // 取当前 chunk 中 sampleLength 最大的元素
                if (chunk.length > 0) {
                    const maxInChunk = chunk.reduce((max, current) =>
                        (current.sampleLength > max.sampleLength ? current : max), chunk[0]);
                    result.push(maxInChunk);
                }
                // 如果 chunk 为空（理论上不会发生，因为 patientLength >= 6）
                else {
                    // 可以取前一个 chunk 的最后一个元素，或者随机补一个
                    // 这里简单处理：取前一个元素（仅当 i > 0）
                    if (i > 0 && result.length > 0) {
                        result.push(result[result.length - 1]);
                    } else {
                        // 如果第一个 chunk 就为空（理论上不可能），取第一个元素
                        result.push(patientsWithSamples[0]);
                    }
                }
            }
        } else {
            result = rangePatientListRef.current;
        }

        return result.sort((a, b) => a.ITH - b.ITH);
    };

    const getVisibleTreeListWithStyle = useMemo(() => {
        const result = getVisibleTreeList();
        return result?.map((item, index) => {
            console.log(item)
            return {
                ...item,
                image: `/images/${item?.patientId}.svg`,
                transform: `rotate(${calculateFanLayout(result?.length)[index].rotate}deg) translate(${calculateFanLayout(result?.length)[index].translate})`
            }
        })
    }, [rangePatientListRef.current])

    const buildAllPatientsData = () => {
        const colors = generateGradientColors(100);
        return patientListRef.current?.map((item) => {
            return {
                ITH: item.currentValue,
                newick: item.newick,
                samples: item.samples,
                name: item.patientId,
                patientId: item.patientId,
                itemStyle: { color: colors[Math.round(item.currentValue * 100) - 1] },
            }
        })
    }

    const buildPieSeriesData = () => {
        return rangePatientListRef.current.map((item) => {
            return {
                ...item,
                value: 1,
            }
        })
    }

    const getAreaPatientData = (minValue, maxValue) => {
        return rangePatientListRef.current?.filter((patient) => patient.ITH > minValue && patient.ITH <= maxValue);
    }

    const onBarEvents = useMemo(() => ({
        "click": function (params) {
            const [rangeMin, rangeMax] = range;
            rangePatientListRef.current = rangePatientListRef.current = patientListRef.current.filter((item) => {
                return item.ITH > rangeMin && item.ITH <= rangeMax
            })
            if (activeBar !== params.name) {
                const [min, max] = params.name.split("~");
                rangePatientListRef.current = rangePatientListRef.current.filter((item) => {
                    return item.ITH > min && item.ITH <= max
                })
                setActiveBar(params.name);
            } else {
                setActiveBar("all");
            }
        },
    }), [activeBar]);

    const viewTree = (data) => {
        currentPatientRef.current = data;
        setModalOpen(true);
    }

    const onPieEvents = useMemo(() => ({
        "click": function (params) {
            viewTree(params.data)
        },
    }), []);

    const renderModalTitle = useMemo(() => {
        return <Flex align='center'><Image src={"/images/patient.svg"} width={30} height={30} alt='patient'></Image><Typography.Paragraph style={{ margin: 0, marginLeft: "10px", fontSize: "24px" }}>
            {currentPatientRef.current?.patientId}
        </Typography.Paragraph>
            <Flex align='center'>
                <span style={{ marginLeft: "30px" }}>ITH: </span> <span style={{ display: "inline-block", width: "16px", height: "16px", marginLeft: "10px", backgroundColor: currentPatientRef.current?.itemStyle?.color }}></span><span style={{ marginLeft: "5px" }}>{currentPatientRef.current?.ITH}</span>
            </Flex>
        </Flex>
    })

    console.log(currentPatientRef.current)

    return (
        <>
            <EmptyLoading loading={loading} showEmpty={true} hasData={!!pieChartOption}>

                <div style={{ position: "relative", marginTop: treeType == "overview" ? "150px" : "0px", transform: `scale(${treeType == "overview" ? 1 : 0.7})`, transition: "all ease .3s" }}>
                    <ReactECharts ref={pieChartRef} option={pieChartOption} opts={{ renderer: 'svg' }}
                        lazyUpdate={true}
                        onEvents={onPieEvents}
                        style={{ height: PIE_CHART_WIDTH, width: PIE_CHART_WIDTH, margin: "0 auto" }}>
                    </ReactECharts>
                    <ReactECharts ref={barChartRef} option={columnOption} opts={{ renderer: 'svg' }}
                        lazyUpdate={true}
                        onEvents={onBarEvents}
                        style={{ height: BAR_CHART_HEIGHT, width: BAR_CHART_WIDTH, position: "absolute", left: "50%", marginLeft: -BAR_CHART_WIDTH / 2, bottom: "285px" }}>
                    </ReactECharts>
                    {
                        treeType == "overview" && <Flex style={{ width: TREE_CONTAINER_WIDTH, margin: "0 auto", justifyContent: "space-between", position: "absolute", top: "-120px", left: "50%", marginLeft: "-360px" }}>
                            {
                                getVisibleTreeListWithStyle?.map((item, index) => {
                                    return <Flex onClick={() => { viewTree(item) }} className={rangeList?.length > 6 && index != getVisibleTreeListWithStyle.length - 1 ? styles.ellipse : null} key={item.patientId} vertical align="center" style={{ width: "120px", height: "120px", transform: item.transform }}>
                                        <Typography.Paragraph style={{ margin: 0, textAlign: "center" }}>
                                            {item.patientId}
                                        </Typography.Paragraph>

                                        <Image src={item.image} width="100" height="100" alt='tree'></Image>
                                    </Flex>
                                })
                            }

                        </Flex>
                    }

                    <Flex align='center' justify="center" style={{ position: "absolute", width: "100%", bottom: 240, margin: "0 auto" }}>
                        <Flex>
                            {
                                LEGEND.map((item) => {
                                    return <Flex key={item.name} align='center'>
                                        <span style={{ marginLeft: 8, backgroundColor: item.color, borderRadius: 3, width: 12, height: 12, display: "inline-block" }}></span><span style={{ marginLeft: 3, color: "#666" }}>{item.name}</span>
                                    </Flex>
                                })
                            }
                        </Flex>
                    </Flex>
                </div>
                {
                    treeType === "detail" && <TreeList list={rangeList} treeType={treeType} viewTree={viewTree}></TreeList>
                }
            </EmptyLoading>
            {
                <TreeDialog treeData={currentPatientRef.current} modalOpen={modalOpen} onclose={() => { setModalOpen(false) }} />
            }</>
    );
}
export default PhylogeneticRelationship;
