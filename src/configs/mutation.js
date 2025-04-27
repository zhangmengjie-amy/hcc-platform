export const mutationTypeColorConfig = {
    Nonstop_Mutation: "rgb(255, 158, 74)",
    Splice_Site: "rgb(103, 191, 92)",
    Frame_Shift_Del: "rgb(237, 102, 93)",
    Translation_Start_Site: "rgb(173, 139, 201)",
    In_Frame_Del: "rgb(168, 120, 110)",
    Missense_Mutation: "rgb(114, 158, 206)"
}

export const clinicConfig = [
    {
        key: "race",
        children: [{
            key: "Cambodia",
        }, {
            key: "Chinese"
        }, {
            key: "Filipino"
        }, {
            key: "Indian"
        }, {
            key: "Indonesian"
        }, {
            key: "Malay"
        }, {
            key: "Sikh"
        }, {
            key: "Thai"
        }, {
            key: "Vietnamese"
        }]
    },
    {
        key: "gender",
        children: [{
            title: "female",
            key: "Female",

        }, {
            title: "male",
            key: "Male"
        }]
    },  {
        key: "hbv",
        children: [{
            key: "hbv-positive"
        }, {
            key: "hbv-negative"
        }]
    }, {
        key: "hcv",
        children: [{
            key: "hcv-positive"
        }, {
            key: "hcv-negative"
        }]
    }
]

export const clinicColorConfig = {
    stage: {
        early: 'rgb(255,255,240)',
        late: 'rgb(253,174,107)'
    },
    hbv: {
        negative: 'rgb(255,255,224)',
        positive: 'rgb(110,123,139)'
    },
    hcv: {
        negative: 'rgb(255,255,224)',
        positive: 'rgb(110,123,139)'
    },
    race: {
        asian: 'rgb(255,247,243)',
        caucasian: 'rgb(247,104,161)',
        cambodia: "#B5D3E7",  // 淡柬埔寨蓝（类似吴哥窟的宁静色调）
        chinese: "#F8C3CD",   // 淡中国红（柔和的粉红色调）
        filipino: "#A2C4C9",  // 淡菲律宾海岛蓝
        indian: "#D2B4DE",    // 淡印度紫（柔和薰衣草色）
        indonesian: "#F9CB9C", // 淡印尼沙黄色
        malay: "#A4C2A5",     // 淡马来绿（热带雨林柔和色调）
        sikh: "#FAC898",      // 淡锡克橙（柔和芒果色)
        thai: "#C9DAF8",      // 淡泰国蓝（皇家蓝的柔和版）
        vietnamese: "#D5A6BD"  // 淡越南粉（莲花色调）
    },
    gender:
        {
            female: 'rgb(255,228,225)',
            male: 'rgb(108,166,205)'
        }
}
