// XY 工厂演示数据（一次性使用无菌注射器工厂）。
// 设备、楼栋、工序都取自已发布三维场景的真实对象；数量为演示值，但所有汇总都由明细推导，保证各面板口径一致。
const sum = (list, key) => list.reduce((total, item) => total + (typeof key === "function" ? key(item) : item[key]), 0);
const round = (value, digits = 1) => Number(value.toFixed(digits));
const pct = (part, whole, digits = 1) => (whole ? round((part / whole) * 100, digits) : 0);
const spread = (total, weights) => {
  const unit = total / sum(weights, (w) => w);
  const list = weights.map((w) => Math.round(w * unit));
  // 取整误差补到权重最大的时段，避免零权重时段出现负数。
  list[weights.indexOf(Math.max(...weights))] += total - sum(list, (v) => v);
  return list;
};

// 快照时刻：所有“今日”口径都截至该时刻，图表不出现未来时段。
export const AS_OF = "21:30";
export const HOURS = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20"];
export const DAYS = ["11-17", "11-18", "11-19", "11-20", "11-21", "11-22", "11-23"];

/* ---------------- 产品 ---------------- */
export const product = {
  name: "一次性使用无菌注射器",
  spec: "5 mL · 带针帽",
  parts: [
    { id: "barrel", name: "针筒", material: "医用聚丙烯 PP", weight: 1.2, process: "注塑成型" },
    { id: "cap", name: "针帽", material: "医用聚乙烯 PE", weight: 0.35, process: "注塑成型" },
  ],
  perBox: 600, // 支/箱
  perPallet: 48, // 箱/托
  bagKg: 25, // 原料每袋
};

/* ---------------- 生产（注塑 → 组装 → 打包 → 入库） ---------------- */
export const molding = [
  { part: "barrel", name: "针筒", machines: 28, output: 412800, scrap: 2064 },
  { part: "cap", name: "针帽", machines: 13, output: 415200, scrap: 1248 },
];
export const assemblyLines = [
  { id: "ZZXA", name: "组装线 A", building: "production", plan: 216000, output: 206400, defects: 620, status: "运行", animated: true },
  { id: "ZZXB", name: "组装线 B", building: "production", plan: 216000, output: 198000, defects: 592, status: "运行", animated: false },
];
export const production = (() => {
  const good = Object.fromEntries(molding.map((m) => [m.part, m.output - m.scrap]));
  const assembled = sum(assemblyLines, "output");
  const defects = sum(assemblyLines, "defects");
  const qualified = assembled - defects;
  const boxes = Math.floor(qualified / product.perBox);
  const pallets = Math.floor(boxes / product.perPallet);
  const plan = sum(assemblyLines, "plan");
  if (assembled > Math.min(good.barrel, good.cap)) throw new Error("XY 演示数据：组装数量超过合格注塑件数量");
  const resinKg = round((molding[0].output * product.parts[0].weight + molding[1].output * product.parts[1].weight) / 1000, 1);
  return {
    good, assembled, defects, qualified, boxes, pallets, plan,
    rate: pct(assembled, plan), yieldRate: pct(qualified, assembled, 2),
    moldYield: pct(good.barrel + good.cap, molding[0].output + molding[1].output, 2),
    boxesWaiting: boxes - pallets * product.perPallet, looseUnits: qualified - boxes * product.perBox,
    resinKg, hourly: spread(assembled, [2, 2, 2, 3, 13, 15, 12, 15, 14, 12, 10]),
    week: [388200, 401600, 396900, 405300, 399800, 382400, assembled],
  };
})();

/* ---------------- 设备（按场景模型清点） ---------------- */
// count 为场景中的实例数；status 统计之和必须等于 count。
export const deviceGroups = [
  { id: "ZSJ-F", name: "注塑机（FANUC）", area: "注塑车间", building: "production", count: 40, status: { 运行: 37, 换模: 2, 告警: 1 } },
  { id: "ZSJ-Z", name: "注塑机（ZHAFIR）", area: "注塑车间", building: "production", count: 6, status: { 运行: 4, 待机: 1, 故障: 1 } },
  { id: "GZJ", name: "干燥机", area: "注塑辅机", building: "production", count: 3, status: { 运行: 3 } },
  { id: "CSGZJ", name: "除湿干燥机", area: "注塑辅机", building: "production", count: 3, status: { 运行: 3 } },
  { id: "SSYT", name: "三机一体除湿干燥机", area: "注塑辅机", building: "production", count: 2, status: { 运行: 2 } },
  { id: "ZYGL", name: "中央供料系统", area: "注塑辅机", building: "production", count: 2, status: { 运行: 2 } },
  { id: "ZZX", name: "组装线", area: "组装车间", building: "production", count: 2, status: { 运行: 1, 告警: 1 } },
  { id: "JXB", name: "组装机械臂", area: "组装线 A", building: "production", count: 2, status: { 运行: 2 } },
  { id: "ZJXB", name: "中转机械臂", area: "打包区", building: "production", count: 2, status: { 运行: 2 } },
  { id: "DDJ", name: "堆垛机", area: "立体库", building: "warehouse", count: 1, status: { 运行: 1 } },
  { id: "TSJ", name: "提升机", area: "立体库", building: "warehouse", count: 2, status: { 运行: 2 } },
  { id: "ZYJ", name: "转运机", area: "立体库", building: "warehouse", count: 2, status: { 运行: 2 } },
  { id: "AGV", name: "AGV 叉车", area: "厂内物流", building: "warehouse", count: 1, status: { 运行: 1 } },
];
deviceGroups.forEach((g) => { if (sum(Object.values(g.status), (v) => v) !== g.count) throw new Error(`XY 演示数据：${g.name} 状态数与台数不一致`); });

// 重点设备：均为场景中可见、带动画或有明确节点的单台设备。
export const devices = [
  { id: "ZSJ-A", name: "注塑机 A", group: "ZSJ-F", building: "production", status: "运行", health: 94, temp: 228, power: 18.6, hours: 15620, cycle: "12.4 s", note: "针筒模具 32 腔" },
  { id: "ZSJ-B", name: "注塑机 B", group: "ZSJ-F", building: "production", status: "运行", health: 91, temp: 205, power: 16.2, hours: 15480, cycle: "9.8 s", note: "针帽模具 48 腔" },
  { id: "ZSJ-F17", name: "注塑机 FANUC-17", group: "ZSJ-F", building: "production", status: "告警", health: 72, temp: 241, power: 19.4, hours: 21033, cycle: "13.1 s", note: "模温偏高，节拍下降" },
  { id: "ZSJ-Z03", name: "注塑机 ZHAFIR-03", group: "ZSJ-Z", building: "production", status: "故障", health: 38, temp: 61, power: 0, hours: 18450, cycle: "—", note: "液压油温超限停机" },
  { id: "ZZXA", name: "组装线 A", group: "ZZX", building: "production", status: "告警", health: 86, temp: 31, power: 22.5, hours: 9820, cycle: "0.42 s/支", note: "振动盘 2 供料不足" },
  { id: "ZZXB", name: "组装线 B", group: "ZZX", building: "production", status: "运行", health: 92, temp: 30, power: 21.8, hours: 9610, cycle: "0.44 s/支", note: "" },
  { id: "DDJ-01", name: "堆垛机", group: "DDJ", building: "warehouse", status: "运行", health: 95, temp: 36, power: 15.0, hours: 12210, cycle: "96 s/托", note: "四级伸缩货叉" },
  { id: "TSJ-01", name: "提升机", group: "TSJ", building: "warehouse", status: "运行", health: 93, temp: 34, power: 7.5, hours: 12180, cycle: "40 s/次", note: "1F ↔ 2F" },
  { id: "AGV-01", name: "AGV 叉车", group: "AGV", building: "warehouse", status: "运行", health: 89, temp: 33, power: 3.2, hours: 6480, cycle: "—", note: "电量 64%" },
];
export const deviceStats = (() => {
  const total = sum(deviceGroups, "count");
  const by = (s) => sum(deviceGroups, (g) => g.status[s] || 0);
  const running = by("运行");
  const molders = deviceGroups.filter((g) => g.id.startsWith("ZSJ"));
  return {
    total, running, idle: by("待机") + by("换模"), alarm: by("告警"), fault: by("故障"),
    utilization: pct(running, total), health: round(sum(devices, "health") / devices.length),
    molders: sum(molders, "count"), moldersRunning: sum(molders, (g) => g.status.运行 || 0),
  };
})();

/* ---------------- 告警（与设备状态一一对应） ---------------- */
export const alarms = [
  { id: "ALM-1123-014", device: "ZSJ-Z03", content: "ZHAFIR-03 液压油温超限，已停机", level: "紧急", building: "production", time: "19:42", state: "未处置" },
  { id: "ALM-1123-013", device: "ZSJ-F17", content: "FANUC-17 模具温度 241 °C，高于设定 +6 °C", level: "预警", building: "production", time: "18:15", state: "未处置" },
  { id: "ALM-1123-012", device: "ZZXA", content: "组装线 A 振动盘 2 供料不足", level: "预警", building: "production", time: "17:06", state: "未处置" },
  { id: "ALM-1123-011", device: "ENV-PK", content: "打包区湿度 66 %RH，高于上限 65 %RH", level: "预警", building: "production", time: "15:30", state: "未处置" },
  { id: "ALM-1123-010", device: "DDJ-01", content: "堆垛机货叉定位偏差 3 mm，已自动校正", level: "提示", building: "warehouse", time: "11:48", state: "已处置" },
  { id: "ALM-1123-009", device: "AGV-01", content: "AGV 叉车电量低于 20%，已回充", level: "提示", building: "warehouse", time: "09:20", state: "已处置" },
  { id: "ALM-1123-008", device: "CAM-07", content: "宿舍楼东侧周界入侵识别（误报）", level: "预警", building: "dormitory", time: "02:16", state: "已处置" },
];
{
  const flagged = new Set(devices.filter((d) => ["告警", "故障"].includes(d.status)).map((d) => d.id));
  const open = new Set(alarms.filter((a) => a.state === "未处置" && flagged.has(a.device)).map((a) => a.device));
  if (open.size !== flagged.size) throw new Error("XY 演示数据：告警/故障设备与未处置告警不一致");
}

/* ---------------- 立体库（库区楼） ---------------- */
export const zones = [
  { id: "RM", name: "原料区", note: "PP / PE 粒料，25 kg/袋", slots: 360, used: 248 },
  { id: "PK", name: "包材区", note: "纸箱、内袋、标签", slots: 240, used: 166 },
  { id: "FG", name: "成品区", note: "注射器成品，48 箱/托", slots: 720, used: 553 },
  { id: "EP", name: "空托盘区", note: "循环托盘", slots: 120, used: 71 },
];
// 今日立库任务：成品入库托数 = 今日打包整托数，原料出库量覆盖当日粒料消耗。
export const stockTasks = (() => {
  const list = [];
  const finishTimes = ["08:52", "09:47", "10:41", "11:38", "12:36", "13:31", "14:27", "15:22", "16:18", "17:15", "18:10", "19:06", "20:02", "20:57"];
  for (let i = 0; i < production.pallets; i++) list.push({ id: `FG-IN-${String(i + 1).padStart(3, "0")}`, type: "成品入库", item: `${product.name} ${product.perPallet} 箱`, qty: product.perPallet, unit: "箱", zone: "FG", time: finishTimes[i] });
  list.push({ id: "RM-IN-001", type: "原料入库", item: "医用 PP 粒料 40 袋", qty: 40, unit: "袋", zone: "RM", time: "10:05" });
  list.push({ id: "RM-OUT-001", type: "原料出库", item: "医用 PP 粒料 40 袋", qty: 40, unit: "袋", zone: "RM", time: "07:40" });
  list.push({ id: "RM-OUT-002", type: "原料出库", item: "医用 PE 粒料 16 袋", qty: 16, unit: "袋", zone: "RM", time: "07:55" });
  return list.sort((a, b) => b.time.localeCompare(a.time));
})();
export const warehouse = (() => {
  const slots = sum(zones, "slots");
  const used = sum(zones, "used");
  const count = (type) => stockTasks.filter((t) => t.type === type).length;
  const issuedKg = sum(stockTasks.filter((t) => t.type === "原料出库"), "qty") * product.bagKg;
  if (issuedKg < production.resinKg) throw new Error("XY 演示数据：原料出库量不足以支撑当日注塑消耗");
  return {
    slots, used, free: slots - used, rate: pct(used, slots), issuedKg,
    fgIn: count("成品入库"), rmIn: count("原料入库"), rmOut: count("原料出库"),
    inbound: [14, 15, 15, 16, 15, 14, count("成品入库") + count("原料入库")],
    outbound: [3, 2, 3, 2, 3, 2, count("原料出库")],
  };
})();

/* ---------------- 能源（含屋顶光伏） ---------------- */
export const meters = [
  { name: "注塑车间", building: "production", value: 18460 },
  { name: "空调与洁净", building: "production", value: 4860 },
  { name: "干燥与供料", building: "production", value: 3120 },
  { name: "组装与打包", building: "production", value: 2240 },
  { name: "立库物流", building: "warehouse", value: 1380 },
  { name: "办公研发", building: "office", value: 1260 },
  { name: "生活区", building: "dormitory", value: 640 },
];
export const energy = (() => {
  const today = sum(meters, "value");
  const pv = 2480; // 库区楼、生产楼屋顶光伏今日发电
  const grid = today - pv;
  return {
    today, pv, grid, pvShare: pct(pv, today),
    hourly: spread(today, [7, 7, 7, 8, 12, 13, 11, 13, 13, 12, 10]),
    pvHourly: spread(pv, [0, 0, 0, 1, 14, 24, 27, 22, 11, 1, 0]),
    week: [33620, 34180, 33910, 34450, 33980, 31240, today],
    water: 186, steam: 3.6, // 锅炉房蒸汽（t），用于洁净区加湿与灭菌预热
    carbon: round((grid * 0.5703) / 1000, 2), // 全国电网排放因子 0.5703 tCO₂/MWh，光伏部分不计
    perK: round(today / (production.assembled / 1000), 1), // kWh/千支
    power: 1520,
  };
})();

/* ---------------- 环境（洁净生产） ---------------- */
// 判定规则（参照无菌医疗器械洁净车间要求）：温度 18–28 °C，湿度 45–65 %RH；洁净区压差 ≥ 10 Pa。
export const envRules = { temp: [18, 28], hum: [45, 65], dp: 10 };
export const envPoints = [
  { name: "注塑车间", grade: "一般区", temp: 24.2, hum: 52, dp: null, particles: null },
  { name: "组装洁净区", grade: "10 万级", temp: 22.6, hum: 50, dp: 14, particles: 1850000 },
  { name: "打包区", grade: "10 万级", temp: 23.1, hum: 66, dp: 12, particles: 2130000 },
  { name: "立库原料区", grade: "一般区", temp: 20.4, hum: 48, dp: null, particles: null },
  { name: "立库成品区", grade: "一般区", temp: 20.8, hum: 47, dp: null, particles: null },
  { name: "研发楼实验室", grade: "一般区", temp: 23.5, hum: 49, dp: null, particles: null },
].map((p) => ({
  ...p,
  ok: p.temp >= envRules.temp[0] && p.temp <= envRules.temp[1] && p.hum >= envRules.hum[0] && p.hum <= envRules.hum[1] && (p.dp == null || p.dp >= envRules.dp),
}));
export const environment = {
  outdoor: { temp: 14.2, hum: 58, aqi: 46, wind: "东北风 2 级" },
  okRate: pct(envPoints.filter((p) => p.ok).length, envPoints.length),
  cleanTrend: [22.4, 22.3, 22.2, 22.4, 22.7, 22.9, 23.0, 22.8, 22.7, 22.6, 22.6],
};

/* ---------------- 安防 ---------------- */
export const guardPosts = [{ name: "保安亭（入口大门）", staff: 2, visitors: 26, vehicles: 148 }];
export const fireFacilities = [
  { name: "消火栓", count: 86, online: 86 },
  { name: "消防报警器", count: 214, online: 213 },
  { name: "安全出口指示", count: 132, online: 132 },
];
export const security = {
  visitors: sum(guardPosts, "visitors"), vehicles: sum(guardPosts, "vehicles"),
  fireTotal: sum(fireFacilities, "count"), fireOnline: sum(fireFacilities, "online"), safeDays: 1218,
  risks: [{ name: "周界入侵", value: 2 }, { name: "洁净服违规", value: 4 }, { name: "消防通道占用", value: 1 }, { name: "叉车超速", value: 3 }],
};

/* ---------------- 楼栋档案（与场景楼栋一一对应） ---------------- */
export const buildingProfiles = {
  production: { use: "注塑 · 组装 · 打包", area: 18600, floors: 3, people: 312, note: "注塑车间 46 台注塑机；组装线 A/B；10 万级洁净区" },
  warehouse: { use: "立体仓库", area: 9200, floors: 4, people: 18, note: "原料区、包材区、成品区；堆垛机、提升机、转运机" },
  "research-1": { use: "研发测试", area: 6400, floors: 5, people: 126, note: "模具开发、产品检测实验室" },
  "research-2": { use: "研发办公", area: 6400, floors: 5, people: 98, note: "工艺与质量部门" },
  office: { use: "行政办公", area: 7800, floors: 6, people: 142, note: "园区运营中心" },
  dormitory: { use: "员工生活", area: 8600, floors: 7, people: 64, note: "在宿人数为夜班轮休" },
  utility: { use: "杂物存放", area: 600, floors: 1, people: 0, note: "工具与耗材暂存" },
};
export const peopleOnSite = sum(Object.values(buildingProfiles), "people");

export const helpers = { sum, pct, round };
