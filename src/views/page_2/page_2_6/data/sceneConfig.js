// page_2_6「能力模块」下拉与 WDP 3D 场景的联动配置
// 每个模块一套互斥的场景效果：镜头机位 + 建筑高亮 + 区域轮廓 + 迁徙图路径

// 建筑实体（eid 用于高亮，position 为建筑表面中心点绝对海拔，用作迁徙图起终点）
export const BUILDINGS = {
    // 生产车间
    workshop: {
        eids: ["57086"],
        position: [113.72164357102565, 34.777017768176876, 24.210462847340686],
    },
    // 配电所
    pv: {
        eids: ["57480"],
        position: [113.72699330897329, 34.774762760760346, 11.957368164062501],
    },
    // 电网杆塔
    grid: {
        eids: ["57084"],
        position: [113.72399441075429, 34.780054412113159, -4.8435947115992528],
    },
    // 仓库
    warehouse: {
        eids: ["57087"],
        position: [113.71815504245778, 34.777804617261843, 25.651572888025704],
    },
    // 变电站
    substation: {
        eids: ["57063", "57064", "57575", "57576", "57577", "57578", "57580", "57579"],
        position: [113.72669654474231, 34.774085885669322, 0.1717578125],
    },
    // 空压站
    air: {
        eids: ["57485"],
        position: [113.72493598025545, 34.773768413508812, 10.20443194237188],
    },
    // 办公楼
    office: {
        eids: ["57539", "57490", "57493", "57473", "57474", "57497"],
        position: [113.71470880907319, 34.779375864055282, 0.1717578125],
    },
    // 储能站
    storage: {
        eids: ["57530", "57529"],
        position: [113.72733322651017, 34.773853386363449, 10.581673647104781],
    },
    // 发电室
    generator: {
        eids: ["57521"],
        position: [113.72769900283005, 34.773645754182432, 13.58021790668033],
    },
};

// 生产车间区域轮廓多边形
const WORKSHOP_OUTLINE = [
    [113.71927501201762, 34.77733168714844, 0],
    [113.71935716240112, 34.777440611062879, 0],
    [113.71946300964447, 34.777570783273944, 0],
    [113.71990833574498, 34.778105410385457, 0],
    [113.72024026662778, 34.778484270517609, 0],
    [113.72109059426634, 34.778141947092905, 0],
    [113.72162152783804, 34.777925779612566, 0],
    [113.72219122393284, 34.777696111422777, 0],
    [113.72377512731482, 34.777052787764312, 0],
    [113.72338559405223, 34.776479599866001, 0],
    [113.72284712339847, 34.775693213269363, 0],
    [113.72169413156547, 34.776222351262405, 0],
    [113.72029296910351, 34.776869224620093, 0],
    [113.7194538073325, 34.777241548709284, 0],
];

// 复用机位
const CAMERA = {
    overview: {
        // location: [113.71610671591699, 34.776053641464081, 340.3945666190757],
        // pitch: -43.172496795654297,
        // yaw: -20.686368942260742,

        location: [113.72041554101935, 34.77569085263457, 1240.6812633652062],
        pitch: -79.70073699951172,
        yaw: -60.28519058227539,

    },
    workshop: {
        location: [113.71929350101175, 34.776410469551706, 390.90222492354241],
        pitch: -56.673572540283203,
        yaw: -23.086429595947266,
    },
    substation: {
        // location: [113.72630899348741, 34.773770090753395, 134.75340449836744],
        // pitch: -67.850296020507812,
        // yaw: -29.687019348144531,


        "location": [
            113.72627448542309,
            34.77377512927684,
            122.57065428350867
        ],
        "pitch": -61.10043716430664,
        "yaw": -30.7370548248291,

    },
    air: {
        location: [113.72459486562876, 34.773695720414068, 143.20093559472267],
        pitch: -79.235809326171875,
        yaw: -35.536933898925781,
    },
    pv: {
        // location: [113.72650807815745, 34.774647118130495, 152.07408740614716],
        // pitch: -72.52045440673828,
        // yaw: -31.482919692993164,

        "location": [
            113.72610375161126,
            34.774493291515526,
            116.91638387306
        ],
        "pitch": -52.421478271484375,
        "yaw": -22.93332290649414,
    },
    storage: {
        location: [113.72627281589408, 34.773546199310488, 113.32258037622933],
        pitch: -51.192867279052734,
        yaw: -28.937856674194336,
    },
    highOverview: {
        location: [113.71431069623232, 34.77556723752095, 596.3242703254019],
        pitch: -49.02284240722656,
        yaw: -28.03668975830078,
    },
    grid: {
        // location: [113.72164432620028, 34.778384502795795, 298.68296751197903],
        // pitch: -45.871150970458984,
        // yaw: -36.88652801513672,

        // location: [113.72380284721393, 34.78244954494474, 237.86687162831208],
        // pitch: -27.272544860839844,
        // yaw: 91.81101989746094,


        location: [113.71436466836543, 34.77711458473956, 542.9005707025416],
        pitch: -39.122337341308594,
        yaw: -9.289714813232422,


    },
    warehouse: {
        location: [113.71597357434895, 34.77668831061585, 313.9288384236533],
        pitch: -51.87282180786133,
        yaw: -39.58667755126953,
    },
    office: {
        location: [113.71309637717097, 34.77838542519994, 224.05416299539093],
        pitch: -49.623050689697266,
        yaw: -37.03587341308594,
    },
};

// 区域轮廓样式
export const RANGE_STYLE = {
    type: "stripe",
    fillAreaType: "none",
    height: 50,
    strokeWeight: 8,
    color: "22c55eff",
    bBlocked: false,
};

// 模块 id 与 data/moduleConfig.js 中的 id 一一对应
/*
    highlights: 建筑高亮的建筑 key 数组，key 对应 BUILDINGS 中的建筑
    ranges: 区域轮廓的坐标数组，坐标数组为 [经度, 纬度, 高程]
    parabolaStyle: 迁徙图默认样式(color/width/topHeight/topScale)，type/gather 固定写死在 addParabola 中
    parabolas: 迁徙图路径数组，每个元素为 [fromKey, toKey, styleOverride?]；styleOverride 可选，覆盖该条线自己的 parabolaStyle 字段
*/
export const MODULE_SCENES = {
    // 1 能耗查询
    energy_query: {
        camera: CAMERA.overview,
        highlights: ["workshop", "air", "warehouse", "substation", "pv"],
        heatMap: { id: "0", alpha: 1 }, // 菱形图案热力图
    },
    // 2 能源消费量和强度计算
    intensity: {
        camera: CAMERA.workshop,
        ranges: [{ coordinates: WORKSHOP_OUTLINE, name: "生产车间轮廓" }],
    },
    // 3 能源消费分析与用能策略推荐
    analysis_reco: {
        camera: CAMERA.substation,
        highlights: ["grid", "substation", "workshop", "storage"],
        parabolaStyle: { type: "solid", color: "f0b724ff", width: 3, topHeight: 60, topScale: 0.5 },
        parabolas: [
            ["grid", "substation", { topHeight: 110, topScale: 0.5 }],
            ["substation", "workshop", { topHeight: 80, topScale: 0.8 }],
            ["substation", "storage", { topHeight: 40, topScale: 0, width: 2 }],
        ],
    },
    // 4 能效对标
    benchmark: {
        camera: CAMERA.air,
        highlights: ["air", "workshop", "substation"],
        parabolaStyle: { type: "solid", color: "da6aa6ff", width: 3, topHeight: 60, topScale: 0.5 },
        parabolas: [["substation", "air"]],
    },
    // 5 能流分析
    flow: {
        camera: CAMERA.pv,
        parabolaStyle: { type: "solid", color: "2f9dffff", width: 3, topHeight: 60, topScale: 0.5 },
        parabolas: [
            ["grid", "substation", { topHeight: 110, topScale: 0.8 }],
            ["pv", "substation", { topHeight: 40, topScale: 0.5 }],
            ["substation", "workshop"],
            ["substation", "air"],
        ],
    },
    // 6 能效平衡与优化
    balance_opt: {
        camera: CAMERA.storage,
        highlights: ["storage", "air", "workshop", "substation"],
        parabolaStyle: { type: "solid", color: "fbc32bff", width: 3, topHeight: 60, topScale: 0.5 },
        parabolas: [
            ["storage", "substation", { topHeight: 40, topScale: 0.8 }],
            ["substation", "air"],
            ["substation", "workshop"],
        ],
    },
    // 7 用能与碳排放预算管理
    budget: {
        camera: CAMERA.highOverview,
        highlights: ["grid", "workshop", "warehouse"],
    },
    // 8 碳排放核算
    carbon_account: {
        camera: CAMERA.grid,
        highlights: ["grid", "substation", "generator"],
        parabolaStyle: { type: "solid", color: "e0b84cff", width: 5, topHeight: 40, topScale: 0.5 },
        parabolas: [
            ["grid", "substation", { topHeight: 110, topScale: 0.2, width: 8 }],
            ["generator", "substation"],
        ],
        heatMap: { id: "1", alpha: 1 }, // 普通热力图
    },
    // 9 产品碳足迹核算
    product_cfp: {
        camera: CAMERA.workshop,
        highlights: ["warehouse", "workshop"],
    },
    // 10 供应链碳管理
    supply_chain: {
        camera: CAMERA.warehouse,
        highlights: ["warehouse"],
    },
    // 11 碳核查支撑
    verification: {
        camera: CAMERA.substation,
        parabolaStyle: { type: "solid", color: "7da4d0ff", width: 3, topHeight: 60, topScale: 0.5 },
        parabolas: [
            ["grid", "substation", { topHeight: 110, topScale: 0.8 }],
            ["pv", "substation",],
            ["generator", "substation"],
        ],
    },
    // 12 碳资产管理
    carbon_asset: {
        camera: CAMERA.office,
        highlights: ["office"],
    },
};

export default MODULE_SCENES;
