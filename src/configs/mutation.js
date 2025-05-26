export const mutationTypeColorConfig = {
    TSS: "rgb(173, 139, 201)",
    Frame_Shift_Indel: "rgb(237, 102, 93)",
    Stop_Codon: "rgb(255, 158, 74)",
    Splice_Site: "rgb(103, 191, 92)",
    In_Frame_Indel: "rgb(168, 120, 110)",
    Missense_Mutation: "rgb(114, 158, 206)",
}

export const clinicConfig = [
    {
        key: "age",
        children: [{
            key: "<20"
        }, {
            key: "20-39"
        }, {
            key: "40-59"
        }, {
            key: "60-79"
        }, {
            key: ">=80"
        }]
    },
    {
        key: "tnmStageV8",
        children: [{
            key: "TNM Stage II"
        }, {
            key: "TNM Stage IA"
        }, {
            key: "TNM Stage IB"
        }, {
            key: "TNM Stage IIIA",
        }, {
            key: "TNM Stage IIIB",
        }]
    },
    {
        key: "hbv",
        children: [{
            key: "positive"
        }, {
            key: "negative"
        }]
    }, {
        key: "hcv",
        children: [{
            key: "positive"
        }, {
            key: "negative"
        }]
    },
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
        }, {
            key: "Others"
        }]
    },
    {
        key: "gender",
        children: [{
            key: "Female",
        }, {
            key: "Male"
        }]
    },

]

export const clinicColorConfig = {
    tnmStageV8: {
        "TNM Stage IB": 'rgb(63, 125, 88)',
        "TNM Stage IA": 'rgb(239, 239, 239)',
        "TNM Stage II": 'rgb(201, 87, 146)',
        "TNM Stage IIIA": "rgb(235, 91, 0)",
        "TNM Stage IIIB": "rgb(96, 181, 255)"
    },
    age: {
        "<20": "rgb(248, 250, 252)",
        "20-39": "rgb(211, 238, 152)",
        "40-59": "rgb(160, 214, 131)",
        "60-79": "rgb(114, 191, 120)",
        ">=80": "rgb(83, 125, 93)",
    },
    hbv: {
        "positive": "rgb(255,255,224)",
        "negative": "rgb(110,123,139)"
    },
    hcv: {
        "positive": "rgb(255,255,224)",
        "negative": "rgb(110,123,139)"
    },
    race: {
        Asian: 'rgb(20, 61, 96)',
        Caucasian: 'rgb(190, 228, 208)',
        Cambodia: "rgb(255, 169, 85)",
        Chinese: "rgb(247, 90, 90)",
        Filipino: "rgb(255, 255, 85)",
        Indian: "rgb(142, 125, 190)",
        Indonesian: "rgb(255, 154, 154)",
        Malay: "rgb(201, 87, 146)",
        Sikh: "rgb(11, 132, 148)",
        Thai: "rgb(124, 69, 133)",
        Vietnamese: "rgb(95, 139, 76)",
        Others: "rgb(148, 80, 52)"
    },
    gender: {
        Female: 'rgb(255, 144, 187)',
        Male: 'rgb(109, 225, 210)'
    }
}
