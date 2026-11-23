// page_2_6 右侧"能力模块"12 个子模块配置（数据驱动，便于复用）
// 图标物料：src/assets/images/ui_material/page_2_6/right-能力模块/<模块>/icon*.png
const iconCtx = require.context(
    "@/assets/images/ui_material/page_2_6/right-能力模块",
    true,
    /\.png$/
);

// 取某模块 4 个 KPI 图标（icon.png / icon (1).png / icon (2).png / icon (3).png）
function kpiIcons(dir) {
    return [
        iconCtx(`./${dir}/icon.png`),
        iconCtx(`./${dir}/icon (1).png`),
        iconCtx(`./${dir}/icon (2).png`),
        iconCtx(`./${dir}/icon (3).png`),
    ];
}

// 助手头像资源
export const assistantIcons = {
    header: iconCtx("./down/header-icon.png"),
    ai: iconCtx("./down/AI-Reply-icon.png"),
    person: iconCtx("./down/person-Reply-icon.png"),
};

const modules = [
    {
        id: "energy_query",
        name: "能耗查询",
        filters: [
            { label: "时段", key: "period", options: ["实时", "今日", "近7日", "本月", "历史对比"] },
            { label: "区域", key: "area", options: ["全厂", "生产", "动力", "公辅", "仓储"] },
            { label: "品种", key: "kind", options: ["全部", "电力分项", "化石燃料", "热力", "氢氨甲醇"], full: true },
        ],
        kpis: (i => [
            { value: "18.6", unit: "tce", label: "综合能耗", icon: i[0] },
            { value: "142", unit: "MWh", label: "电力合计", icon: i[1] },
            { value: "4.1", unit: "tce", label: "化石燃料折标", icon: i[2] },
            { value: "128/132", unit: "", label: "计量点在线", icon: i[3] },
        ])(kpiIcons("能耗查询")),
        content: {
            type: "bar",
            title: "分品种折标占比（今日）",
            data: [
                { name: "电力", value: 76 },
                { name: "天然气", value: 12 },
                { name: "柴油", value: 5 },
                { name: "热力", value: 4 },
                { name: "氢/其他", value: 3 },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「能耗查询」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "intensity",
        name: "能源消费量和强度计算",
        kpiGap: 0,
        kpiPaddingLeft: 0,
        filters: [
            { label: "统计期", key: "period", options: ["本月", "本季", "本年", "同比上年"] },
            { label: "折标口径", key: "caliber", options: ["等价值", "当量值"] },
            { label: "强度对象", key: "target", options: ["综合", "单位产品", "单位产值", "单位增加值"], full: true },
        ],
        kpis: (i => [
            { value: "4120", unit: "tce", label: "综合消费量", icon: i[0] },
            { value: "1.28", unit: "tce/t", label: "单位产品能耗", icon: i[1] },
            { value: "0.086", unit: "tce/万元", label: "单位产值能耗", icon: i[2] },
            { value: "0.142", unit: "tce/万元", label: "单位增加值能耗", icon: i[3] },
        ])(kpiIcons("能源消费量和强度计算")),
        content: {
            type: "progress",
            title: "强度指标相对基线",
            data: [
                { header: "单位产品", label: "较基线 -8%", percent: 78 },
                { header: "单位产值", label: "较基线 -14%", percent: 64 },
                { header: "单位增加值", label: "较基线 -12%", percent: 70 },
                { header: "综合消费量进度", label: "年进度 62%", percent: 62 },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「能源消费量和强度计算」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "analysis_reco",
        name: "能源消费分析与用能策略推荐",
        filters: [
            { label: "分析窗", key: "window", options: ["近7日", "本月", "峰段专项", "成本专项"] },
            { label: "策略目标", key: "goal", options: ["降本", "提清洁占比", "提效", "综合"] },
        ],
        kpis: (i => [
            { value: "76%", unit: "", label: "结构：电力占比", icon: i[0] },
            { value: "38%", unit: "", label: "峰段电费占比", icon: i[1] },
            { value: "41%", unit: "", label: "清洁电力占比", icon: i[2] },
            { value: "3", unit: "条", label: "可落地策略", icon: i[3] },
        ])(kpiIcons("能源消费分析与用能策略推荐")),
        content: {
            type: "segment",
            title: "能源消费结构",
            data: [
                { name: "峰电", value: 38, color: "#2261F0" },
                { name: "平电", value: 29, color: "#9BF8FF" },
                { name: "谷电", value: 18, color: "#FBC32B" },
                { name: "气/油/热", value: 15, color: "#94C2FF" },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「能源消费分析与用能策略推荐」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "benchmark",
        name: "能效对标",
        filters: [
            { label: "对象", key: "target", options: ["用能单位", "工序", "重点设备"] },
            { label: "时段", key: "period", options: ["班次", "日", "月", "峰平谷"] },
            { label: "标杆", key: "bench", options: ["行业先进", "国标2级", "厂内最优"], full: true },
        ],
        kpis: (i => [
            { value: "78%", unit: "", label: "单位达标率", icon: i[0] },
            { value: "3/4", unit: "", label: "工序达标", icon: i[1] },
            { value: "72%", unit: "", label: "设备≥2级", icon: i[2] },
            { value: "6", unit: "台", label: "落后待改造", icon: i[3] },
        ])(kpiIcons("能效对标")),
        content: {
            type: "bar",
            title: "重点设备能效评分",
            data: [
                { name: "加工", value: 82 },
                { name: "空压", value: 64 },
                { name: "制冷", value: 71 },
                { name: "变配", value: 88 },
                { name: "锅炉", value: 76 },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「能效对标」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "flow",
        name: "能流分析",
        filters: [
            { label: "视图", key: "view", options: ["电力能流", "综合能流", "热力能流"] },
            { label: "周期", key: "period", options: ["今日", "本周", "本月"] },
        ],
        kpis: (i => [
            { value: "186", unit: "MWh", label: "总输入", icon: i[0] },
            { value: "71%", unit: "", label: "有效利用", icon: i[1] },
            { value: "18%", unit: "", label: "转换损失", icon: i[2] },
            { value: "11%", unit: "", label: "管网/分配损失", icon: i[3] },
        ])(kpiIcons("能流分析")),
        content: {
            type: "flow",
            title: "电力能量平衡",
            topRow: [
                { label: "输入", value: "186" },
                { label: "转换", value: "168" },
                { label: "分配", value: "152" },
                { label: "利用", value: "132" },
                { label: "损失", value: "54" },
            ],
            groups: [
                {
                    header: { left: "输入", right: "转换" },
                    rows: [
                        { left: [{ label: "电网关口", value: "164" }], right: [{ label: "变电", value: "158" }] },
                        { left: [{ label: "电网关口", value: "164" }], right: [{ label: "空压", value: "10" }] },
                    ],
                },
                {
                    header: { left: "分配·利用", right: "损失" },
                    rows: [
                        { left: [{ label: "生产", value: "78" }, { label: "动力", value: "32" }], right: [{ label: "转换", value: "18%" }] },
                        { left: [{ label: "公辅", value: "22" }], right: [{ label: "管网", value: "11%" }] },
                    ],
                },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「能流分析」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "balance_opt",
        name: "能效平衡与优化",
        kpiPaddingLeft: 0,
        filters: [
            { label: "优化目标", key: "goal", options: ["综合能效", "峰段成本", "碳强度", "多目标"] },
            { label: "作用域", key: "scope", options: ["工艺参数", "设备运行", "负荷调度", "全局"] },
        ],
        kpis: (i => [
            { value: "71.2", unit: "", label: "当前综合效率", icon: i[0] },
            { value: "74.8%", unit: "", label: "模型可靠", icon: i[1] },
            { value: "126", unit: "tce", label: "预计月节能", icon: i[2] },
            { value: "2", unit: "项", label: "待工艺确认", icon: i[3] },
        ])(kpiIcons("能效平衡与优化")),
        content: {
            type: "progress",
            title: "优化方案对比",
            data: [
                { header: "基线", label: "71%", percent: 71 },
                { header: "方案A·设备", label: "73%", percent: 73 },
                { header: "方案B·工艺+调度", label: "75%", percent: 75 },
                { header: "方案C·保守", label: "74%", percent: 74 },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「能效平衡与优化」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "budget",
        name: "用能与碳排放预算管理",
        filters: [
            { label: "预算年", key: "year", options: ["2026", "2025"] },
            { label: "周期", key: "period", options: ["月度", "季度", "年度"] },
            { label: "维度", key: "dim", options: ["用能", "碳排放", "双控"], full: true },
        ],
        kpis: (i => [
            { value: "62%", unit: "", label: "能耗预算执行", icon: i[0] },
            { value: "58%", unit: "", label: "碳预算执行", icon: i[1] },
            { value: "2", unit: "项", label: "动态预警", icon: i[2] },
            { value: "3.2", unit: "", label: "本季建议调减", icon: i[3] },
        ])(kpiIcons("用能与碳排放预算管理")),
        content: {
            type: "progress",
            title: "预算执行与预测",
            data: [
                { header: "电力预算", label: "预测年终 97%", percent: 97 },
                { header: "天然气预算", label: "预测年终 88%", percent: 88 },
                { header: "碳排放预算", label: "预测年终 94%", percent: 94 },
                { header: "峰段电费预算", label: "预测年终 46%", percent: 46 },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「用能与碳排放预算管理」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "carbon_account",
        name: "碳排放核算",
        filters: [
            { label: "边界", key: "boundary", options: ["电力间接", "含燃烧直排", "厂界子集"] },
            { label: "规则", key: "rule", options: ["ZERO-FACTORY-TRY-2026", "行业指南", "GHG清册"] },
            { label: "视图", key: "view", options: ["总量", "强度", "源追踪", "趋势"], full: true },
        ],
        kpis: (i => [
            { value: "126", unit: "tCO₂", label: "本期排放总量", icon: i[0] },
            { value: "0.89", unit: "t/万元", label: "排放强度", icon: i[1] },
            { value: "0.536", unit: "t/MWh", label: "外购电因子", icon: i[2] },
            { value: "0", unit: "项", label: "超限预警", icon: i[3] },
        ])(kpiIcons("碳排放核算")),
        content: {
            type: "segment",
            title: "能源消费结构",
            data: [
                { name: "转入电(间接)", value: 86, color: "#3B6FE0" },
                { name: "柴油燃烧(直接)", value: 9, color: "#E0B84C" },
                { name: "边界外/转入", value: 5, color: "#2FB6C9" },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「碳排放核算」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "product_cfp",
        name: "产品碳足迹核算",
        filters: [
            { label: "产品", key: "product", options: ["产品A", "产品B", "自制件C"] },
            { label: "标准", key: "standard", options: ["GB/T 24067", "ISO 14067", "行业推荐"] },
            { label: "边界", key: "boundary", options: ["摇篮到大门", "摇篮到坟墓"], full: true },
        ],
        kpis: (i => [
            { value: "2.86", unit: "kgCO₂e", label: "单位足迹", icon: i[0] },
            { value: "3/8", unit: "", label: "已分析品类", icon: i[1] },
            { value: "0.21", unit: "kg", label: "绿电/绿证抵减", icon: i[2] },
            { value: "78%", unit: "", label: "数据完整度", icon: i[3] },
        ])(kpiIcons("产品碳足迹核算")),
        content: {
            type: "bar",
            title: "生命周期各环节碳足迹",
            data: [
                { name: "原料", value: 46 },
                { name: "生产", value: 28 },
                { name: "运输", value: 10 },
                { name: "使用", value: 8 },
                { name: "回收", value: 4 },
                { name: "销售", value: 4 },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「产品碳足迹核算」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "supply_chain",
        name: "供应链碳管理",
        kpiPaddingLeft: 0,
        filters: [
            { label: "方向", key: "direction", options: ["上游采集", "下游披露", "双向"] },
            { label: "层级", key: "level", options: ["一级供应商", "关键物料", "物流承运"] },
        ],
        kpis: (i => [
            { value: "28", unit: "家", label: "上游建档", icon: i[0] },
            { value: "16", unit: "类", label: "已采集物料数据", icon: i[1] },
            { value: "5", unit: "个", label: "下游已披露SKU", icon: i[2] },
            { value: "71%", unit: "", label: "清洁运输占比", icon: i[3] },
        ])(kpiIcons("供应链碳管理")),
        content: {
            type: "progress",
            title: "供应链碳管理",
            data: [
                { header: "上游数据采集", label: "28/44 家", percent: 64 },
                { header: "关键物料量化", label: "16 类", percent: 55 },
                { header: "下游足迹回传", label: "5 SKU", percent: 42 },
                { header: "清洁运输", label: "距目标 -14pp", percent: 71 },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「供应链碳管理」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "verification",
        name: "碳核查支撑",
        kpiPaddingLeft: 0,
        filters: [
            { label: "核查期", key: "period", options: ["2026上半年", "2025全年"] },
            { label: "材料包", key: "pack", options: ["证据底稿", "核算说明", "全量导出"] },
        ],
        kpis: (i => [
            { value: "86%", unit: "", label: "证据完整度", icon: i[0] },
            { value: "4", unit: "项", label: "待补原始凭证", icon: i[1] },
            { value: "ZF-26", unit: "", label: "因子版本归档", icon: i[2] },
            { value: "就绪", unit: "", label: "报告自动生成", icon: i[3] },
        ])(kpiIcons("碳核查支撑")),
        content: {
            type: "progress",
            title: "核查材料完备度",
            data: [
                { header: "电力/绿证结算", label: "可追溯", percent: 86 },
                { header: "柴油购进票据", label: "缺 2 条", percent: 64 },
                { header: "计量检定证书", label: "有效期内", percent: 92 },
                { header: "边界与方法说明", label: "可自动成稿", percent: 78 },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「碳核查支撑」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
    {
        id: "carbon_asset",
        name: "碳资产管理",
        kpiPaddingLeft: 0,
        filters: [
            { label: "履约年", key: "year", options: ["2026", "2025"] },
            { label: "资产类型", key: "type", options: ["全部", "配额", "CCER"] },
        ],
        kpis: (i => [
            { value: "12.6", unit: "万t", label: "配额持有", icon: i[0] },
            { value: "8.1", unit: "万t", label: "本周期已清缴", icon: i[1] },
            { value: "0.4", unit: "万t", label: "履约期预测缺口", icon: i[2] },
            { value: "0.3", unit: "万t", label: "CCER待核销", icon: i[3] },
        ])(kpiIcons("碳资产管理")),
        content: {
            type: "progress",
            title: "配额/CCER 履约与余缺",
            data: [
                { header: "配额持有", label: "100%", percent: 100 },
                { header: "已清缴", label: "64%", percent: 64 },
                { header: "预留备用", label: "22%", percent: 22 },
                { header: "预测缺口", label: "12%", percent: 12 },
            ],
        },
        assistant: {
            greeting: "你好，我是「能碳助手」。当前模块为「碳资产管理」，也可直接问电费、能效、碳排、预算、核查等任意问题。",
        },
    },
];

export default modules;
