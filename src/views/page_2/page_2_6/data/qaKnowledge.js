/**
 * 能碳助手知识检索
 *
 * 数据源：src/assets/knowledge ，全量接入：
 * - JSON 由 require.context 直接读取
 * - md / csv 经 vue.config.js 里为该目录注册的 raw-loader 以纯文本读入
 *
 * 两层检索：
 * 1) 精选条目：人工标注了关键词/示例问句的高频问法，正文实时取自知识库文件
 * 2) 全量语料：目录下所有资料文件（md 按小节切分、csv 按表切分、json 展平）兜底检索
 * 两层都不命中才回退到「未检索到」并给出示例问句。检索跨模块，当前模块只作加权。
 */

const KB_JSON = require.context("@/assets/knowledge", true, /\.json$/);
const KB_TEXT = require.context("@/assets/knowledge", true, /\.(md|csv)$/);

// 仅排除下划线开头的内部批注（文件自述「不对用户朗读」）
const EXCLUDE_RE = /(^|\/)_/;

function relPath(key) {
    return key.replace(/^\.\//, "");
}

function readJson(path) {
    try {
        return KB_JSON("./" + path);
    } catch (e) {
        return null;
    }
}

function readText(path) {
    try {
        const mod = KB_TEXT("./" + path);
        if (typeof mod === "string") return mod;
        return (mod && mod.default) || "";
    } catch (e) {
        return "";
    }
}

/* ------------------------------------------------------------------
 * 文本整形：md 表格/标题转成聊天气泡里可读的纯文本
 * ------------------------------------------------------------------ */
function mdToPlain(md, keepFirstHeading) {
    const lines = String(md || "").split(/\r?\n/);
    const out = [];
    let seenHeading = false;

    lines.forEach((raw) => {
        let line = raw.trim();
        if (!line) return;
        // 表格分隔行
        if (/^\|?\s*:?-{2,}/.test(line)) return;
        // 面向应答者的批注、免责声明
        if (line.indexOf("问「") === 0 || line.indexOf(">") === 0) return;

        if (line.indexOf("#") === 0) {
            const title = line.replace(/^#+\s*/, "");
            if (!seenHeading && !keepFirstHeading) {
                seenHeading = true;
                return;
            }
            seenHeading = true;
            out.push("【" + title + "】");
            return;
        }

        if (line.indexOf("|") === 0) {
            line = line
                .replace(/^\||\|$/g, "")
                .split("|")
                .map((c) => c.trim())
                .filter(Boolean)
                .join(" · ");
        }

        out.push(line.replace(/\*\*/g, "").replace(/^[-*]\s*/, "· "));
    });

    return out.join("\n");
}

function csvRows(csv) {
    return String(csv || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split(",").map((c) => c.trim()));
}

function jsonToPlain(value, depth) {
    const d = depth || 0;
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) {
        return value
            .map((v) => jsonToPlain(v, d + 1))
            .filter(Boolean)
            .join("；");
    }
    if (typeof value === "object") {
        return Object.keys(value)
            .map((k) => {
                const v = jsonToPlain(value[k], d + 1);
                return v ? k + " " + v : "";
            })
            .filter(Boolean)
            .join(d === 0 ? "\n" : "，");
    }
    return String(value);
}

/* ------------------------------------------------------------------
 * 中文主题标签：目录用途取自 00_index/README.md 的目录表，
 * 文件名按词典逐词翻译，使 csv/json 这类英文文件也能被中文提问命中
 * ------------------------------------------------------------------ */
const DIR_ALIAS = (function () {
    const map = {};
    readText("00_index/README.md")
        .split(/\r?\n/)
        .forEach((line) => {
            const m = line.match(/^\|\s*(\d\d_[a-z_]+)\s*\|\s*([^|]+?)\s*\|/);
            if (m) map[m[1]] = m[2];
        });
    return map;
})();

const FILE_TOKENS = {
    "12m": "近12个月", a: "A", ab: "A与B", active: "当前", air: "空压", alert: "预警",
    alerts: "预警", all: "全部", allowance: "配额", asrs: "立式库", b: "B", backlog: "待办",
    benchmark: "对标", bill: "账单", budget: "预算", calibration: "检定", capacity: "容量",
    carbon: "碳", catalog: "目录清单", ccer: "CCER", cfp: "产品碳足迹", charge: "收费",
    checklist: "清单", compare: "对比", compliance: "履约", compressor: "空压机",
    conclusions: "结论", conversion: "折标", cost: "费用", daily: "日", data: "数据",
    demand: "需量", demo: "演示", diesel: "柴油", dispatch: "调度", elec: "电", energy: "能源",
    equipment: "设备", evidence: "证据", extra: "额外", factors: "因子", faq: "常见问题",
    file: "文件", flat: "平段", forecast: "预测", fuel: "燃料", gap: "缺口", gaps: "缺口",
    gas: "天然气", generation: "发电", generator: "柴发", handoff: "交接", heat: "热力",
    hierarchy: "层级", history: "历史", if: "假设", incident: "事件", index: "索引",
    indicators: "指标", intensity: "强度", intent: "意图", intents: "意图", internal: "内部",
    inventory: "清册", kpi: "关键指标", kwh: "电量", leak: "泄漏", ledger: "台账", light: "灯",
    list: "名单", log: "记录", manifest: "清单", map: "地图", meter: "计量点",
    meters: "计量点", microgrid: "微电网", mix: "结构", model: "模型", modes: "方式",
    module: "模块", mom: "环比", money: "金额", month: "月", monthly: "月", mwh: "电量",
    number: "数值", objects: "对象", offers: "报价", online: "在线", opt: "优化", peak: "峰段",
    persona: "角色", power: "电力", presets: "预设", price: "电价", prices: "电价",
    priority: "优先级", process: "工序", product: "产品", purchase: "外购", pv: "光伏",
    rank: "排名", registry: "台账", remaining: "剩余", result: "结果", retrofit: "改造",
    runtime: "运行时长", sankey: "能流桑基", saved: "节省", seeds: "种子问句", shift: "班次",
    site: "厂区", source: "来源", status: "状态", storage: "储能", supplier: "供应商",
    sync: "同步", table: "表", tariff: "电价", thermal: "热力", thresholds: "阈值",
    tier: "阶梯", tiered: "阶梯", today: "今日", topology: "拓扑", tou: "峰平谷分时",
    traceability: "追溯", traffic: "交通灯", transport: "运输", trend: "趋势", type: "类型",
    units: "用能单位", valley: "谷段", verify: "验策", vertical: "立式", vs: "对比",
    warehouse: "仓库", waste: "浪费", what: "假设", with: "与", workshop: "车间", year: "年",
    yesterday: "昨日", yoy: "同比", zone: "分区", zones: "分区", office: "办公", building: "楼",
    substation: "变电所", grid: "电网关口", poi: "关口", stacks: "烟囱", emission: "排放",
    points: "点", tank: "储罐", farm: "区", tunnel: "隧道", access: "通道", utility: "公辅",
    pipe: "管", rack: "廊", cooling: "制冷站", station: "站", bess: "储能电池",
    logistics: "物流", fleet: "车队", yard: "场区", production: "生产",
};

function pathLabel(path) {
    return path
        .split("/")
        .pop()
        .replace(/\.\w+$/, "")
        .toLowerCase()
        .split(/[_\-.]/)
        .map((t) => FILE_TOKENS[t] || "")
        .filter(Boolean)
        .join("");
}

function dirLabel(path) {
    return DIR_ALIAS[path.split("/")[0]] || "";
}

/* ------------------------------------------------------------------
 * 一、精选条目：JSON 直答档（正文取 answer_zh）
 * ------------------------------------------------------------------ */
const JSON_ENTRIES = [
    {
        file: "19_direct_answers/quantity_money/today_elec_bill.json",
        modules: ["energy_query", "budget", "analysis_reco"],
        kw: ["今天电费", "今日电费", "当天电费", "今天的电费"],
        q: ["今天电费花了多少", "今日电费多少钱"],
        deny: ["本月", "这个月", "今年", "全年", "昨天", "综合能源", "天然气"],
    },
    {
        file: "18_power_pricing/snapshots/today_cost.json",
        modules: ["energy_query", "budget"],
        kw: ["电费构成", "电度电费", "基本电费", "峰段费用", "电费明细"],
        q: ["今天电费由哪几部分构成", "电度电费和基本电费各是多少"],
    },
    {
        file: "19_direct_answers/quantity_money/month_elec_bill.json",
        modules: ["budget", "energy_query"],
        kw: ["本月电费", "当月电费", "月度电费", "这个月电费"],
        q: ["本月电费累计多少"],
        deny: ["今天", "今日", "今年", "全年"],
    },
    {
        file: "19_direct_answers/quantity_money/year_elec_bill.json",
        modules: ["budget", "energy_query"],
        kw: ["今年电费", "全年电费", "年度电费", "今年买电"],
        q: ["今年买电花了多少钱"],
        deny: ["今天", "今日", "本月"],
    },
    {
        file: "19_direct_answers/quantity_money/today_energy_cost_all.json",
        modules: ["energy_query", "budget"],
        kw: ["综合能源费", "能源费用", "总费用", "一共花", "合计费用", "能源成本"],
        q: ["今天综合能源费用是多少", "今天一共花了多少能源费"],
    },
    {
        file: "19_direct_answers/quantity_money/today_purchase_mwh.json",
        modules: ["energy_query"],
        kw: ["买了多少电", "外购电量", "购电量", "买电多少"],
        q: ["今天买了多少电"],
        deny: ["本月", "今年", "多少钱", "电费"],
    },
    {
        file: "19_direct_answers/quantity_money/month_purchase_mwh.json",
        modules: ["energy_query", "budget"],
        kw: ["本月外购", "本月购电", "本月电量"],
        q: ["本月外购结算电量是多少"],
    },
    {
        file: "19_direct_answers/quantity_money/year_purchase_mwh.json",
        modules: ["energy_query", "budget"],
        kw: ["今年外购", "今年购电", "全年电量", "今年电量"],
        q: ["今年外购电量累计多少"],
    },
    {
        file: "19_direct_answers/quantity_money/today_purchase_source.json",
        modules: ["energy_query", "analysis_reco"],
        kw: ["购电来源", "哪里的电", "电从哪", "供电来源", "买的哪里", "谁供的电"],
        q: ["买的哪里的电", "购电来源是什么"],
    },
    {
        file: "19_direct_answers/quantity_money/today_gas_heat.json",
        modules: ["energy_query"],
        kw: ["天然气", "热力", "燃气"],
        q: ["今天天然气和热力花了多少钱"],
    },
    {
        file: "19_direct_answers/quantity_money/today_energy_mix.json",
        modules: ["energy_query", "intensity", "analysis_reco"],
        kw: ["能耗结构", "能耗比例", "用能结构", "能源结构", "折标占比"],
        q: ["今天能耗结构是怎样的", "各品种能耗占比多少"],
    },
    {
        file: "19_direct_answers/quantity_money/zone_rank_kwh_today.json",
        modules: ["energy_query", "flow"],
        kw: ["用电最高", "谁最耗电", "用电排名", "耗电最多", "用电top"],
        q: ["今天哪个区域用电最高", "用电排名前三是谁"],
        deny: ["电费", "多少钱", "最贵"],
    },
    {
        file: "19_direct_answers/quantity_money/zone_rank_cost_today.json",
        modules: ["energy_query", "budget"],
        kw: ["电费最高", "谁最贵", "费用排名", "结算电费最高"],
        q: ["哪个区域电费最高"],
    },
    {
        file: "19_direct_answers/quantity_money/asrs_today_number.json",
        modules: ["energy_query", "product_cfp"],
        kw: ["立式库", "立式仓库", "立库", "asrs"],
        q: ["立式库今天用了多少电"],
    },
    {
        file: "19_direct_answers/quantity_money/carbon_month_number.json",
        modules: ["carbon_account", "budget"],
        kw: ["碳排放", "排放总量", "碳排", "排放多少"],
        q: ["本月碳排放多少"],
        deny: ["足迹", "配额", "履约"],
    },
    {
        file: "19_direct_answers/quantity_money/product_cfp_number.json",
        modules: ["product_cfp", "supply_chain"],
        kw: ["碳足迹", "单位足迹", "产品足迹", "足迹构成", "足迹怎么构成"],
        q: ["产品碳足迹是多少", "产品A足迹怎么构成"],
    },
    {
        file: "19_direct_answers/quantity_money/allowance_remaining.json",
        modules: ["carbon_asset"],
        kw: ["配额剩余", "还剩多少配额", "ccer持有", "碳资产", "配额还有"],
        q: ["碳配额还剩多少"],
    },
    {
        file: "19_direct_answers/compare/bill_today_vs_yesterday.json",
        modules: ["energy_query", "budget"],
        kw: ["今天比昨天", "昨天", "对比昨天", "比昨天"],
        q: ["今天电费比昨天多花了多少"],
    },
    {
        file: "19_direct_answers/compare/intensity_yoy.json",
        modules: ["intensity"],
        kw: ["强度同比", "同比", "环比"],
        q: ["能耗强度同比变化多少"],
    },
    {
        file: "19_direct_answers/compare/product_ab_cfp.json",
        modules: ["product_cfp"],
        kw: ["足迹对比", "ab对比", "哪个高"],
        q: ["产品A和产品B足迹差多少"],
        deny: ["构成", "占比"],
    },
    {
        file: "19_direct_answers/compare/supplier_peak_price.json",
        modules: ["analysis_reco", "energy_query"],
        kw: ["哪家便宜", "售电公司", "市电", "专线", "峰段一度电", "供应商报价"],
        q: ["市电和售电公司哪家便宜", "峰段一度电多少钱"],
    },
    {
        file: "19_direct_answers/delta/pv_saved_money.json",
        modules: ["analysis_reco", "balance_opt"],
        kw: ["光伏省", "光伏节省", "光伏少花", "光伏收益"],
        q: ["光伏今天省了多少钱"],
    },
    {
        file: "19_direct_answers/delta/air_leak_waste.json",
        modules: ["benchmark", "balance_opt"],
        kw: ["空压泄漏", "泄漏", "漏气"],
        q: ["空压泄漏浪费了多少"],
    },
    {
        file: "19_direct_answers/delta/diesel_extra_cost.json",
        modules: ["carbon_account", "budget"],
        kw: ["柴发", "柴油发电", "顶峰"],
        q: ["柴发顶峰多花了多少钱"],
    },
    {
        file: "19_direct_answers/status/meters_online.json",
        modules: ["energy_query", "verification"],
        kw: ["计量点", "在线率", "离线"],
        q: ["计量点在线吗", "有多少计量点离线"],
        deny: ["名单", "哪几个", "哪些点"],
    },
    {
        file: "19_direct_answers/status/budget_traffic_light.json",
        modules: ["budget"],
        kw: ["超预算", "预算执行", "预算进度", "预算状态"],
        q: ["会不会超预算", "预算执行到哪了"],
    },
    {
        file: "19_direct_answers/status/compliance_gap.json",
        modules: ["carbon_asset"],
        kw: ["履约缺口", "履约风险", "履约"],
        q: ["有履约缺口吗"],
    },
    {
        file: "19_direct_answers/status/pv_online.json",
        modules: ["balance_opt", "energy_query"],
        kw: ["光伏在线", "光伏发电", "光伏出力"],
        q: ["光伏在线吗", "光伏今天发了多少电"],
    },
    {
        file: "19_direct_answers/status/tier_status.json",
        modules: ["budget", "energy_query"],
        kw: ["阶梯电价", "阶梯档", "加价"],
        q: ["阶梯电价到哪一档了"],
    },
    {
        file: "19_direct_answers/status/active_alerts.json",
        modules: ["budget", "benchmark", "energy_query"],
        kw: ["预警", "告警", "异常", "报警", "需要关注"],
        q: ["当前有哪些预警"],
    },
];

/* ------------------------------------------------------------------
 * 二、精选条目：Markdown 直答档（正文实时读取整篇，表格自动转纯文本）
 * ------------------------------------------------------------------ */
const DOC_ENTRIES = [
    {
        source: "19_direct_answers/params/one_liners.md",
        modules: ["energy_query", "analysis_reco", "carbon_account", "intensity"],
        kw: [
            "峰谷电价", "电价多少", "分时电价", "峰平谷", "一度电多少钱", "电价是多少",
            "碳因子", "排放因子", "折标系数", "0.536", "因子多少", "因子是多少",
        ],
        q: ["峰平谷电价分别多少", "外购电碳因子是多少", "电力折标用了什么系数"],
    },
    {
        source: "17_glossary/answer_snippets/intensity_calc.md",
        modules: ["intensity"],
        kw: ["单位增加值", "增加值能耗", "强度怎么算", "单位产品能耗", "强度算法"],
        q: ["单位增加值能耗怎么算"],
    },
    {
        source: "17_glossary/answer_snippets/peak_cost_why.md",
        modules: ["analysis_reco", "budget"],
        kw: ["峰段为何", "峰段电费高", "为什么峰段", "峰段占比高", "峰段偏高"],
        q: ["为什么峰段电费偏高"],
    },
    {
        source: "17_glossary/answer_snippets/asrs_energy_profile.md",
        modules: ["energy_query", "benchmark"],
        kw: ["堆垛机", "单托电耗", "托盘能耗", "立式库电耗构成"],
        q: ["立式库电耗构成是什么"],
    },
    {
        source: "19_direct_answers/lists/retrofit_six.md",
        modules: ["benchmark", "balance_opt"],
        kw: ["待改造", "改造清单", "落后设备", "哪些设备要改", "改造名单"],
        q: ["待改造设备有哪些"],
    },
    {
        source: "19_direct_answers/lists/offline_meters.md",
        modules: ["energy_query", "verification"],
        kw: ["离线名单", "离线计量点", "计量点名单", "哪几个表离线"],
        q: ["离线计量点名单是什么"],
    },
    {
        source: "19_direct_answers/lists/supplier_chase.md",
        modules: ["supply_chain"],
        kw: ["催数", "供应商催", "哪些供应商没报", "催报"],
        q: ["需要催数的供应商有哪些"],
    },
    {
        source: "19_direct_answers/lists/verification_missing.md",
        modules: ["verification"],
        kw: ["核查材料", "缺哪些材料", "材料缺口", "缺什么材料"],
        q: ["核查还缺哪些材料"],
    },
    {
        source: "19_direct_answers/verify/handoff_shortlist.md",
        modules: ["analysis_reco", "balance_opt"],
        kw: ["验策", "可验证策略", "哪些可以验", "转验策"],
        q: ["哪些策略可以去做验策"],
    },
    {
        source: "08_strategy_opt/reco_bundle_month.md",
        modules: ["analysis_reco", "balance_opt", "budget"],
        kw: ["策略", "建议", "可落地", "三条策略", "怎么降本", "降本"],
        q: ["给我三条可落地的用能策略"],
    },
    {
        source: "06_flow_balance/loss_breakdown.md",
        modules: ["flow", "balance_opt"],
        kw: ["损失", "损失在哪", "降损", "转换损失", "管网损失"],
        q: ["能量损失主要在哪"],
    },
    {
        source: "06_flow_balance/diagrams/power_main_path.md",
        modules: ["flow"],
        kw: ["主路径", "能流路径", "电力路径", "能流走向", "能流怎么走"],
        q: ["电力主路径是什么"],
    },
    {
        source: "07_efficiency_benchmark/gap_to_national_l2.md",
        modules: ["benchmark"],
        kw: ["国标", "对标差距", "2级", "达标率", "差多少"],
        q: ["对标国标2级差多少"],
    },
    {
        source: "05_assets/air_compressor_station.md",
        modules: ["benchmark", "balance_opt"],
        kw: ["空压站", "空压为何落后", "比功率", "空压能效"],
        q: ["空压站为什么落后"],
    },
    {
        source: "04_factors_methods/green_certificate_rules.md",
        modules: ["carbon_account", "verification", "analysis_reco"],
        kw: ["绿证", "绿电", "清洁电力占比", "清洁占比"],
        q: ["绿证怎么算清洁电力"],
    },
    {
        source: "04_factors_methods/scope_boundary.md",
        modules: ["carbon_account", "verification"],
        kw: ["scope", "核算边界", "范围一", "范围二", "范围三", "边界是什么"],
        q: ["碳核算边界怎么划分"],
    },
    {
        source: "13_verification/factor_version_statement.md",
        modules: ["verification"],
        kw: ["因子版本", "写进报告", "报告如何写", "版本声明"],
        q: ["因子版本如何写进报告"],
    },
    {
        source: "14_carbon_assets/surrender_order.md",
        modules: ["carbon_asset"],
        kw: ["清缴顺序", "怎么清缴", "先用什么"],
        q: ["清缴顺序是怎样的"],
    },
    {
        source: "12_supply_chain/clean_transport_actions.md",
        modules: ["supply_chain"],
        kw: ["清洁运输", "运输提升", "空驶", "承运"],
        q: ["清洁运输占比怎么提升"],
    },
    {
        source: "11_product_cfp/label_readiness.md",
        modules: ["product_cfp"],
        kw: ["碳标签", "认证准备", "数据缺口", "完整度"],
        q: ["碳标签准备度如何"],
    },
    {
        source: "09_budget_forecast/adjust_playbook.md",
        modules: ["budget"],
        kw: ["预算调整", "怎么调预算", "调减", "预算怎么办"],
        q: ["预算紧了怎么调"],
    },
];

/* ------------------------------------------------------------------
 * 三、精选条目：边界结论（conclusions.json 的 items）
 * ------------------------------------------------------------------ */
function boundaryEntries() {
    const data = readJson("19_direct_answers/boundary/conclusions.json");
    const items = (data && data.items) || [];
    // keys 里的通用词会误命中专题提问，不当关键词用
    const generic = ["边界", "核算", "账单", "内部", "哪边", "生产", "仓储"];
    return items.map((it) => {
        const keys = (it.keys || []).filter((k) => generic.indexOf(k) < 0);
        return {
            source: "19_direct_answers/boundary/conclusions.json",
            modules: ["carbon_account", "verification"],
            kw: keys,
            kwWeight: 2,
            q: [(it.keys || []).join("") + "算不算"],
            text: it.answer_zh || "",
        };
    });
}

function buildCurated() {
    const list = [];

    JSON_ENTRIES.forEach((e) => {
        const data = readJson(e.file);
        if (!data || !data.answer_zh) return;
        list.push({
            source: e.file,
            text: data.answer_zh,
            modules: e.modules || [],
            kw: e.kw || [],
            q: e.q || [],
            deny: e.deny || [],
        });
    });

    DOC_ENTRIES.forEach((e) => {
        const text = mdToPlain(readText(e.source));
        if (!text) return;
        list.push({
            source: e.source,
            text: text,
            modules: e.modules || [],
            kw: e.kw || [],
            q: e.q || [],
            deny: e.deny || [],
        });
    });

    boundaryEntries().forEach((e) => list.push(Object.assign({ deny: [] }, e)));

    return list;
}

/* ------------------------------------------------------------------
 * 四、全量语料：目录下所有资料文件
 * ------------------------------------------------------------------ */
function buildCorpus() {
    const list = [];

    KB_JSON.keys().forEach((key) => {
        const path = relPath(key);
        if (EXCLUDE_RE.test(path)) return;
        const data = KB_JSON(key);
        const hasAnswer = !!(data && data.answer_zh);
        const text = hasAnswer ? data.answer_zh : jsonToPlain(data);
        if (text) {
            list.push({
                source: path,
                text: text,
                kind: hasAnswer ? "answer" : "json",
                title: pathLabel(path),
                dir: dirLabel(path),
            });
        }
    });

    KB_TEXT.keys().forEach((key) => {
        const path = relPath(key);
        if (EXCLUDE_RE.test(path)) return;
        const raw = readText(path);
        if (!raw) return;

        if (/\.csv$/.test(path)) {
            const rows = csvRows(raw);
            if (rows.length < 2) return;
            list.push({
                source: path,
                text: rows.map((r) => r.join(" · ")).join("\n"),
                kind: "csv",
                title: pathLabel(path),
                dir: dirLabel(path),
                header: rows[0],
                rows: rows.slice(1),
            });
            return;
        }

        // md 按标题切成小节，命中更精准
        const docTitle = (String(raw).match(/^#\s*(.+)$/m) || [])[1] || "";
        String(raw)
            .split(/\n(?=#{1,3}\s)/)
            .forEach((sec) => {
                // 只有标题没有正文的段落跳过，内容在下一段
                if (!mdToPlain(sec, false)) return;
                const heading = (sec.match(/^#{1,3}\s*(.+)$/) || [])[1] || "";
                list.push({
                    source: path,
                    text: mdToPlain(sec, true),
                    kind: "md",
                    title: docTitle + " " + heading + " " + pathLabel(path),
                    dir: dirLabel(path),
                });
            });
    });

    return list;
}

const CURATED = buildCurated();
const CORPUS = buildCorpus();

// 00_index/module_map.json：能力模块 -> 对应知识库目录，用作检索时的目录亲和度
const MODULE_DIRS = readJson("00_index/module_map.json") || {};

/* ------------------------------------------------------------------
 * 五、检索打分
 * ------------------------------------------------------------------ */
function normalize(str) {
    return String(str || "")
        .toLowerCase()
        .replace(/[\s，,。．.！!？?、：:；;"'“”‘’（）()【】[\]《》<>~`|\\/*+\-_=]/g, "");
}

function grams(str) {
    const t = normalize(str);
    if (!t) return [];
    if (t.length === 1) return [t];
    const out = [];
    for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2));
    return out;
}

// 去掉疑问句里的虚词，避免「…是什么/有哪些」这类尾巴造成误命中
const FILLER_RE = /(请问|帮我|我想|麻烦|一下|介绍|说明|基本|情况|原始数据|原始|原文|明细|数据表|原表|表格|是什么|什么|怎么样|怎样|怎么|如何|有哪些|哪些|哪个|是不是|能不能|可以|多少|吗|呢|了|的|啊|是|有)/g;

function contentGrams(question) {
    const stripped = normalize(question).replace(FILLER_RE, "");
    return grams(stripped.length >= 2 ? stripped : question);
}

// 查询词在目标文本中的二元组覆盖率（0~1）
function coverage(queryGrams, target) {
    if (!queryGrams.length) return 0;
    const t = normalize(target);
    if (!t) return 0;
    let hit = 0;
    queryGrams.forEach((g) => {
        if (t.indexOf(g) >= 0) hit++;
    });
    return hit / queryGrams.length;
}

const MATCH_THRESHOLD = 2.4;
const CORPUS_THRESHOLD = 1.4;
// 同等分数下优先用人工标注的精选条目
const CURATED_PREFERENCE = 0.8;
const CORPUS_MAX_CHARS = 420;
// 明确要看原始资料时跳过直答档，直接翻明细档
const RAW_INTENT_RE = /(原始|原文|明细|台账|数据表|原表|表格|csv)/;

function scoreCurated(query, queryGrams, entry, moduleId) {
    let score = 0;
    const kwWeight = entry.kwWeight || 3;
    let kwHits = 0;

    entry.kw.forEach((k) => {
        if (query.indexOf(normalize(k)) >= 0) kwHits++;
    });
    score += kwHits * kwWeight;

    let bestQ = 0;
    entry.q.forEach((q) => {
        bestQ = Math.max(bestQ, coverage(queryGrams, q));
    });

    // 既没命中关键词、示例问句又只是零散重合，视为没这条
    if (!kwHits && bestQ < 0.45) return -Infinity;

    score += bestQ * 4;
    score += coverage(queryGrams, entry.text) * 2;

    if (moduleId && entry.modules.indexOf(moduleId) >= 0) score += 1.2;

    entry.deny.forEach((d) => {
        if (query.indexOf(normalize(d)) >= 0) score -= 8;
    });

    return score;
}

function scoreCorpus(queryGrams, entry, moduleId) {
    // 结构化数据不如成文说明适合直接朗读；长文命中往往是词汇稀释而非真相关
    const kindWeight = entry.kind === "md" || entry.kind === "answer" ? 1 : 0.8;
    const len = entry.text.length;
    const damp = len > 1500 ? 0.5 : len > 600 ? 0.75 : 1;
    const textScore = coverage(queryGrams, entry.text) * 3.4 * kindWeight * damp;

    // 主题名命中不做篇幅衰减：按资料名提问时应能直接翻到那份原始资料
    const title = entry.title || "";
    const titleCov = coverage(queryGrams, title);
    const titleScore = titleCov * 3 + (titleCov >= 0.9 && normalize(title).length >= 3 ? 1.5 : 0);

    const dirs = MODULE_DIRS[moduleId] || [];
    const affinity = dirs.some((d) => entry.source.indexOf(d + "/") === 0) ? 0.5 : 0;

    return (
        textScore +
        titleScore +
        coverage(queryGrams, entry.dir || "") * 0.6 +
        coverage(queryGrams, entry.source) * 1.2 +
        affinity
    );
}

// csv 命中时只回相关行，避免整表刷屏
function csvAnswer(entry, queryGrams) {
    const matched = entry.rows.filter((r) => coverage(queryGrams, r.join("")) > 0.3);
    const picked = (matched.length ? matched : entry.rows).slice(0, 6);
    const total = matched.length ? matched.length : entry.rows.length;
    const body = picked.map((r) => "· " + r.join(" · ")).join("\n");
    const more = total - picked.length;
    return entry.header.join(" · ") + "\n" + body + (more > 0 ? "\n…另有 " + more + " 条" : "");
}

function truncate(text) {
    return text.length > CORPUS_MAX_CHARS ? text.slice(0, CORPUS_MAX_CHARS) + "…" : text;
}

/**
 * 检索问题答案
 * @param {string} question 用户自然语言问题
 * @param {string} moduleId 当前能力模块 id（仅作加权，不限制检索范围）
 * @returns {{matched:boolean, text:string, source:string}}
 */
export function answerQuestion(question, moduleId) {
    const query = normalize(question);
    const queryGrams = grams(question);
    const docGrams = contentGrams(question);

    let best = null;
    let bestScore = -Infinity;
    if (!RAW_INTENT_RE.test(query)) {
        CURATED.forEach((entry) => {
            const s = scoreCurated(query, queryGrams, entry, moduleId);
            if (s > bestScore) {
                bestScore = s;
                best = entry;
            }
        });
    }

    let doc = null;
    let docScore = -Infinity;
    CORPUS.forEach((entry) => {
        const s = scoreCorpus(docGrams, entry, moduleId);
        if (s > docScore) {
            docScore = s;
            doc = entry;
        }
    });

    if (best && bestScore >= MATCH_THRESHOLD && bestScore + CURATED_PREFERENCE >= docScore) {
        return { matched: true, text: best.text, source: best.source };
    }

    if (doc && docScore >= CORPUS_THRESHOLD) {
        const text = doc.kind === "csv" ? csvAnswer(doc, docGrams) : doc.text;
        return { matched: true, text: truncate(text), source: doc.source };
    }

    if (best && bestScore >= MATCH_THRESHOLD) {
        return { matched: true, text: best.text, source: best.source };
    }

    return {
        matched: false,
        text:
            "知识库里暂时没有检索到直接对应的结论。可以换个说法，或试试这些问题：\n" +
            sampleQuestions(moduleId, 3)
                .map((q) => "· " + q)
                .join("\n"),
        source: "",
    };
}

/**
 * 取若干示例问题：优先与当前模块相关，不足时用全局补齐
 */
export function sampleQuestions(moduleId, count) {
    const n = count || 3;
    const inModule = [];
    const others = [];

    CURATED.forEach((e) => {
        const q = e.q && e.q[0];
        if (!q) return;
        if (moduleId && e.modules.indexOf(moduleId) >= 0) inModule.push(q);
        else others.push(q);
    });

    const out = inModule.slice(0, n);
    for (let i = 0; out.length < n && i < others.length; i++) out.push(others[i]);
    return out;
}

// 语料统计，便于确认知识库接入范围
export const knowledgeStats = {
    curated: CURATED.length,
    corpus: CORPUS.length,
    files: KB_JSON.keys().length + KB_TEXT.keys().length,
};

export default { answerQuestion, sampleQuestions, knowledgeStats };
