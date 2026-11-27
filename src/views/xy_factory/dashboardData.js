// XY 工厂演示数据（一次性使用无菌注射器工厂）。
// 设备、楼栋、工序都取自已发布三维场景的真实对象；数量为演示值，但所有汇总都由明细推导，保证各面板口径一致。
import catalog from "./sceneCatalog.json";

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
  { part: "barrel", name: "针筒", machines: 26, output: 412800, scrap: 2064 },
  { part: "cap", name: "针帽", machines: 12, output: 415200, scrap: 1248 },
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

/* ---------------- 设备（按场景模型逐台清点） ---------------- */
// 台账由 sceneCatalog.json（scripts/build-xy-catalog.cjs 从交付 GLB 生成）逐台生成：每台设备对应场景中的一个节点，
// 楼栋按设备包围盒中心所在楼栋判定。分组台数、状态统计全部由台账推导，保证与三维场景一致。
const groupMeta = [
  { id: "ZSJ-F", name: "注塑机 FANUC", area: "注塑车间", temp: 226, power: 17.2, cycle: "12.6 s", hours: 16800 },
  { id: "ZSJ-Z", name: "注塑机 ZHAFIR", area: "注塑车间", temp: 218, power: 21.5, cycle: "10.2 s", hours: 17900 },
  { id: "GZJ", name: "干燥机", area: "注塑辅机", temp: 82, power: 6.0, cycle: "连续", hours: 14200 },
  { id: "CSGZJ", name: "除湿干燥机", area: "注塑辅机", temp: 120, power: 9.0, cycle: "连续", hours: 13800 },
  { id: "SSYT", name: "三机一体干燥机", area: "注塑辅机", temp: 115, power: 12.0, cycle: "连续", hours: 12600 },
  { id: "ZYGL", name: "中央供料系统", area: "注塑辅机", temp: 31, power: 4.2, cycle: "连续", hours: 15100 },
  { id: "ZZX", name: "组装线", area: "组装洁净区", temp: 30, power: 22.0, cycle: "0.43 s/支", hours: 9700 },
  { id: "ZJXB", name: "中转机械臂", area: "组装线 A", temp: 34, power: 2.4, cycle: "3.2 s", hours: 9500 },
  { id: "JXB", name: "码垛机械臂", area: "库区楼 2F 码垛区", temp: 35, power: 3.0, cycle: "8 s/箱", hours: 11800 },
  { id: "TSJ", name: "提升机", area: "生产楼东侧提升井", temp: 34, power: 7.5, cycle: "40 s/次", hours: 12180 },
  { id: "DDJ", name: "堆垛机", area: "立体库", temp: 36, power: 15.0, cycle: "96 s/托", hours: 12210 },
  { id: "ZYJ", name: "转运机", area: "立体库入口", temp: 33, power: 3.0, cycle: "30 s/托", hours: 12050 },
  { id: "AGV", name: "AGV 叉车", area: "厂内物流", temp: 33, power: 3.2, cycle: "—", hours: 6480 },
];
// 与告警一一对应的异常设备，以及有专门说明的重点设备；其余设备按分组典型值生成。
const deviceNotes = {
  "ZSJ-A": { status: "运行", health: 94, temp: 228, power: 18.6, hours: 15620, cycle: "12.4 s", note: "针筒模具 32 腔 · SQ_6 动画机台" },
  "ZSJ-B": { status: "运行", health: 91, temp: 205, power: 16.2, hours: 15480, cycle: "9.8 s", note: "针帽模具 48 腔 · SQ_6 动画机台" },
  "ZSJ-F17": { status: "告警", health: 72, temp: 241, power: 19.4, hours: 21033, cycle: "13.1 s", note: "料筒温度偏高，右侧模具水路流量偏低，节拍下降" },
  "ZSJ-F05": { status: "换模", health: 88, temp: 62, power: 1.1, hours: 18320, cycle: "—", note: "更换针帽模具，预计 22:10 恢复" },
  "ZSJ-F31": { status: "换模", health: 87, temp: 58, power: 0.9, hours: 17760, cycle: "—", note: "模具保养后试模" },
  "ZSJ-F38": { status: "换模", health: 85, temp: 66, power: 1.3, hours: 18990, cycle: "—", note: "切换 1 mL 针筒模具，首件检验中" },
  "ZSJ-Z03": { status: "故障", health: 38, temp: 61, power: 0, hours: 18450, cycle: "—", note: "液压油温超限停机" },
  "ZSJ-F09": { status: "故障", health: 46, temp: 72, power: 0, hours: 22410, cycle: "—", note: "顶出油缸内泄，顶针不到位，已停机待修" },
  "SSYT-02": { status: "故障", health: 52, temp: 48, power: 0, hours: 13990, cycle: "—", note: "再生加热器断路，露点升至 -18 °C，下游 2 台机改用 01 号供料" },
  "ZSJ-F33": { status: "告警", health: 68, temp: 236, power: 18.9, hours: 20480, cycle: "12.9 s", note: "螺杆背压波动 ±12%，制品短射率上升" },
  "GZJ-02": { status: "告警", health: 66, temp: 94, power: 6.8, hours: 15820, cycle: "连续", note: "干燥温度 94 °C 高于设定 80 °C，温控模块漂移" },
  // 能耗极值：高耗（大吨位 ZHAFIR 满负荷、三机一体再生加热）与低耗（待料空转）设备，热力图上形成明显对比。
  "ZSJ-Z01": { power: 46.8, note: "大吨位满负荷生产，电加热 + 伺服泵全开" },
  "ZSJ-Z02": { power: 41.5 },
  "SSYT-01": { power: 28.4, note: "再生加热段运行中，承担 02 号停机后的全部供料" },
  "ZYGL-02": { power: 0.6, note: "待料空转" },
  "GZJ-03": { power: 0.4, note: "料斗已满，保温待机" },
  "ZSJ-Z06": { status: "待机", health: 90, temp: 45, power: 0.8, hours: 16210, cycle: "—", note: "待排产" },
  "ZSJ-F24": { status: "待机", health: 89, temp: 40, power: 0.6, hours: 17420, cycle: "—", note: "夜班计划停机" },
  "ZSJ-F25": { status: "待机", health: 91, temp: 39, power: 0.6, hours: 17110, cycle: "—", note: "夜班计划停机" },
  ZZXA: { status: "告警", health: 74, temp: 31, power: 22.5, hours: 9820, cycle: "0.42 s/支", note: "振动盘 2 供料不足" },
  ZZXB: { status: "告警", health: 76, temp: 30, power: 21.8, hours: 9610, cycle: "0.44 s/支", note: "末端打包工位湿度 66 %RH 超限，纸箱受潮风险" },
  "DDJ-01": { status: "运行", health: 95, temp: 36, power: 15.0, hours: 12210, cycle: "96 s/托", note: "四级伸缩货叉" },
  "TSJ-01": { status: "运行", health: 93, temp: 34, power: 7.5, hours: 12180, cycle: "40 s/次", note: "1F ↔ 2F" },
  "AGV-01": { status: "运行", health: 89, temp: 33, power: 3.2, hours: 6480, cycle: "—", note: "电量 64%" },
};
const KEY_DEVICES = ["ZSJ-A", "ZSJ-B", "ZSJ-F17", "ZSJ-Z03", "ZZXA", "ZZXB", "DDJ-01", "TSJ-01", "AGV-01"];
const inside = (point, box) => point[0] >= box.min[0] && point[0] <= box.max[0] && point[2] >= box.min[2] && point[2] <= box.max[2];
// 稳定的伪随机扰动（同一设备每次刷新一致）。
const jitter = (id, span) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973; return ((h % 1000) / 1000 - 0.5) * span; };

export const ledger = catalog.devices.map((item) => {
  const meta = groupMeta.find((g) => g.id === item.g);
  const building = inside(item.center, catalog.regions.production) ? "production" : inside(item.center, catalog.regions.warehouse) ? "warehouse" : "production";
  const base = {
    id: item.id, name: item.name, group: item.g, area: meta.area, building, status: "运行",
    health: Math.round(92 + jitter(item.id, 8)), temp: round(meta.temp + jitter(`${item.id}t`, meta.temp * 0.06)),
    power: round(meta.power * (1 + jitter(`${item.id}p`, 0.16))), rated: meta.power, hours: Math.round(meta.hours + jitter(`${item.id}h`, 3000)), cycle: meta.cycle, note: "",
  };
  return { ...base, ...deviceNotes[item.id] };
});

/** 由台账汇总分组台数 / 状态与整体统计；看板在设备被控制后用它实时重算。 */
export function summarizeDevices(list) {
  const groups = groupMeta.map(({ id, name, area }) => {
    const members = list.filter((x) => x.group === id);
    const status = {};
    members.forEach((x) => { status[x.status] = (status[x.status] || 0) + 1; });
    return { id, name, area, building: members[0] ? members[0].building : "production", count: members.length, status };
  });
  const by = (s) => list.filter((x) => x.status === s).length;
  const molders = list.filter((x) => x.group.startsWith("ZSJ"));
  const keys = KEY_DEVICES.map((id) => list.find((x) => x.id === id)).filter(Boolean);
  const stats = {
    total: list.length, running: by("运行"), idle: by("待机") + by("换模"), alarm: by("告警"), fault: by("故障"),
    utilization: pct(by("运行"), list.length), health: round(sum(keys, "health") / keys.length),
    molders: molders.length, moldersRunning: molders.filter((x) => x.status === "运行").length,
  };
  return { groups, stats };
}
export const deviceGroups = summarizeDevices(ledger).groups;

// 重点设备：带动画或与告警对应的单台设备。
export const KEY_DEVICE_IDS = KEY_DEVICES;
export const devices = KEY_DEVICES.map((id) => ledger.find((d) => d.id === id));
export const deviceStats = summarizeDevices(ledger).stats;
if (deviceStats.moldersRunning < molding[0].machines + molding[1].machines) throw new Error("XY 演示数据：在产注塑机数量少于工序占用数量");

/* ---------------- 告警（与设备状态一一对应） ---------------- */
export const alarms = [
  { id: "ALM-1123-014", device: "ZSJ-Z03", content: "ZHAFIR-03 液压油温超限，已停机", level: "紧急", building: "production", time: "19:42", state: "未处置" },
  { id: "ALM-1123-018", device: "ZSJ-F09", content: "FANUC-09 顶出油缸内泄，顶针不到位，已停机", level: "紧急", building: "production", time: "20:51", state: "未处置" },
  { id: "ALM-1123-017", device: "SSYT-02", content: "三机一体干燥机 02 再生加热器断路，露点 -18 °C", level: "紧急", building: "production", time: "20:18", state: "未处置" },
  { id: "ALM-1123-016", device: "ZSJ-F33", content: "FANUC-33 螺杆背压波动 ±12%，短射率上升", level: "预警", building: "production", time: "19:58", state: "未处置" },
  { id: "ALM-1123-015", device: "GZJ-02", content: "干燥机 02 温度 94 °C，高于设定 80 °C", level: "预警", building: "production", time: "19:10", state: "未处置" },
  { id: "ALM-1123-013", device: "ZSJ-F17", content: "FANUC-17 料筒温度 241 °C，高于设定 +6 °C；右侧模具水路流量偏低", level: "预警", building: "production", time: "18:15", state: "未处置" },
  { id: "ALM-1123-012", device: "ZZXA", content: "组装线 A 振动盘 2 供料不足", level: "预警", building: "production", time: "17:06", state: "未处置" },
  { id: "ALM-1123-011", device: "ZZXB", content: "组装线 B 打包工位湿度 66 %RH，高于上限 65 %RH", level: "预警", building: "production", time: "15:30", state: "未处置" },
  { id: "ALM-1123-010", device: "DDJ-01", content: "堆垛机货叉定位偏差 3 mm，已自动校正", level: "提示", building: "warehouse", time: "11:48", state: "已处置" },
  { id: "ALM-1123-009", device: "AGV-01", content: "AGV 叉车电量低于 20%，已回充", level: "提示", building: "warehouse", time: "09:20", state: "已处置" },
  { id: "ALM-1123-008", device: "CAM-07", content: "监控摄像头 07 周界入侵识别（宿舍楼东侧，误报）", level: "预警", building: "dormitory", time: "02:16", state: "已处置" },
];
{
  const flagged = new Set(ledger.filter((d) => ["告警", "故障"].includes(d.status)).map((d) => d.id));
  const open = new Set(alarms.filter((a) => a.state === "未处置" && flagged.has(a.device)).map((a) => a.device));
  if (open.size !== flagged.size) throw new Error("XY 演示数据：告警/故障设备与未处置告警不一致");
  // 状态与健康度梯队一致：故障 <60（红），告警 60–79（黄），其余 ≥80（绿）。
  const bad = ledger.find((x) => (x.status === "故障" ? x.health >= 60 : x.status === "告警" ? x.health < 60 || x.health >= 80 : x.health < 80));
  if (bad) throw new Error(`XY 演示数据：${bad.id} 状态「${bad.status}」与健康度 ${bad.health} 不一致`);
}

/* ---------------- 立体库（库区楼） ---------------- */
export const zones = [
  { id: "RM", name: "原料区", note: "PP / PE 粒料，25 kg/袋", slots: 360, used: 248 },
  { id: "PK", name: "包材区", note: "纸箱、内袋、标签", slots: 240, used: 166 },
  { id: "FG", name: "成品区", note: "注射器成品，48 箱/托", slots: 720, used: 553 },
  { id: "EP", name: "空托盘区", note: "循环托盘", slots: 120, used: 71 },
];
// 今日立库任务：成品入库托数 = 今日打包整托数，原料出库量覆盖当日粒料消耗。
// 每单带：路径节点（station 名，对应场景位置）、目标库位（列-层）、执行设备、耗时与状态，用于在场景中复现作业路径。
export const stockTasks = (() => {
  const list = [];
  const finishTimes = ["08:52", "09:47", "10:41", "11:38", "12:36", "13:31", "14:27", "15:22", "16:18", "17:15", "18:10", "19:06", "20:02", "20:57"];
  const fgPath = ["打包区", "提升机", "转运机", "堆垛机巷道", "库位"];
  for (let i = 0; i < production.pallets; i++) {
    const col = 30 + i * 3; const level = 1 + (i % 6);
    list.push({ id: `FG-IN-${String(i + 1).padStart(3, "0")}`, type: "成品入库", item: `${product.name} ${product.perPallet} 箱`, qty: product.perPallet, unit: "箱", zone: "FG", from: "打包区 1F", to: `成品区 ${String(col).padStart(2, "0")} 列 ${level} 层`, col, level, path: fgPath, device: "堆垛机 DDJ-01", mins: 6 + (i % 3), time: finishTimes[i], state: "已完成" });
  }
  list.push({ id: "FG-IN-014", type: "成品入库", item: `${product.name} 48 箱`, qty: 48, unit: "箱", zone: "FG", from: "打包区 1F", to: "成品区 72 列 2 层", col: 72, level: 2, path: fgPath, device: "堆垛机 DDJ-01", mins: 0, time: "21:24", state: "执行中" });
  list.push({ id: "FG-IN-015", type: "成品入库", item: `${product.name} 48 箱`, qty: 48, unit: "箱", zone: "FG", from: "打包区 1F", to: "成品区 75 列 3 层", col: 75, level: 3, path: fgPath, device: "堆垛机 DDJ-01", mins: 0, time: "21:40", state: "排队" });
  list.push({ id: "RM-IN-001", type: "原料入库", item: "医用 PP 粒料 40 袋", qty: 40, unit: "袋", zone: "RM", from: "收货口 1F", to: "原料区 07 列 4 层", col: 7, level: 4, path: ["收货口", "转运机", "堆垛机巷道", "库位"], device: "堆垛机 DDJ-01", mins: 8, time: "10:05", state: "已完成" });
  list.push({ id: "RM-OUT-001", type: "原料出库", item: "医用 PP 粒料 40 袋", qty: 40, unit: "袋", zone: "RM", from: "原料区 03 列 2 层", to: "注塑车间中央供料", col: 3, level: 2, path: ["库位", "堆垛机巷道", "转运机", "提升机", "注塑供料"], device: "堆垛机 + AGV-01", mins: 14, time: "07:40", state: "已完成" });
  list.push({ id: "RM-OUT-002", type: "原料出库", item: "医用 PE 粒料 16 袋", qty: 16, unit: "袋", zone: "RM", from: "原料区 05 列 1 层", to: "注塑车间中央供料", col: 5, level: 1, path: ["库位", "堆垛机巷道", "转运机", "提升机", "注塑供料"], device: "堆垛机 + AGV-01", mins: 12, time: "07:55", state: "已完成" });
  return list.sort((a, b) => b.time.localeCompare(a.time));
})();
export const warehouse = (() => {
  const slots = sum(zones, "slots");
  const used = sum(zones, "used");
  const count = (type) => stockTasks.filter((t) => t.type === type && t.state === "已完成").length;
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
// area：场景中的区域范围 [x0, z0, x1, z1]（1F 地面），按设备实际分布划定、互不重叠，用于在三维中高亮（正常绿 / 超限红）。
// devices：区域内的关联设备（详情卡列出并可定位）；source：监测点位。
export const envPoints = [
  { name: "注塑北区", grade: "一般区", temp: 24.2, hum: 52, dp: null, particles: null, building: "production", area: [-8, 7, 51, 15.5], devices: ["ZSJ-A", "ZSJ-B", "ZSJ-F17", "ZSJ-F09"], source: "温湿度传感器 TH-01 / TH-02", note: "FANUC 机群 22 台，料筒散热为主要热源，空调送风维持 24 °C。" },
  { name: "注塑南区", grade: "一般区", temp: 25.8, hum: 49, dp: null, particles: null, building: "production", area: [20, -27, 82, -6], devices: ["ZSJ-Z01", "ZSJ-Z03", "ZSJ-F33"], source: "温湿度传感器 TH-03 / TH-04", note: "ZHAFIR 大吨位机群满负荷，温度偏高但在限值内。" },
  { name: "组装洁净区", grade: "10 万级", temp: 22.6, hum: 50, dp: 14, particles: 1850000, building: "production", area: [69, -4, 78, 11], devices: ["ZZXA", "ZJXB-C", "ZJXB-E"], source: "洁净区监测 CR-01（温湿度 / 压差 / 尘埃粒子）", note: "10 万级（ISO 8），对邻区保持 ≥ 10 Pa 正压。" },
  { name: "打包区", grade: "10 万级", temp: 23.1, hum: 66, dp: 12, particles: 2130000, building: "production", area: [52, -5, 68.5, 6], devices: ["ZZXB"], source: "洁净区监测 CR-02", note: "末端打包工位除湿机效率下降，湿度 66 %RH 超上限，纸箱有受潮风险。" },
  { name: "干燥供料区", grade: "一般区", temp: 31.6, hum: 38, dp: null, particles: null, building: "production", area: [11, 16, 73, 20.5], devices: ["SSYT-01", "SSYT-02", "CSGZJ-01", "ZYGL-02"], source: "温湿度传感器 TH-05", note: "三机一体 02 停机后 01 满负荷再生，排热集中，温度 31.6 °C 超上限、湿度 38 %RH 低于下限。" },
  { name: "辅机房", grade: "一般区", temp: 27.4, hum: 46, dp: null, particles: null, building: "production", area: [3.5, -25, 9.5, -16.5], devices: ["GZJ-01", "GZJ-02", "GZJ-03", "ZYGL-01"], source: "温湿度传感器 TH-06", note: "干燥机 02 温控漂移，局部温度偏高，接近上限。" },
  { name: "立库原料区", grade: "一般区", temp: 20.4, hum: 48, dp: null, particles: null, building: "warehouse", area: [-36.5, -58.5, -6, -39], devices: ["DDJ-01"], source: "温湿度传感器 WH-01", note: "PP / PE 粒料要求 ≤ 30 °C、≤ 60 %RH，防止吸潮。" },
  { name: "立库成品区", grade: "一般区", temp: 20.8, hum: 47, dp: null, particles: null, building: "warehouse", area: [12, -58.5, 62, -39], devices: ["DDJ-01", "ZYJ-01", "ZYJ-02"], source: "温湿度传感器 WH-02", note: "无菌成品存放，温湿度稳定。" },
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

/* ---------------- 叙事面板补充数据 ---------------- */
// 生产：近 24 h 每 2 h 产出与 OEE 分解（可用率 × 性能 × 良率）。
export const oee = { availability: 91.4, performance: 94.2, quality: production.yieldRate };
oee.value = round((oee.availability * oee.performance * oee.quality) / 10000, 1);
export const shifts = [
  { name: "早班 08–16", output: 182400, defects: 486, leader: "王立新" },
  { name: "中班 16–24", output: 176200, defects: 512, leader: "陈晓", current: true },
  { name: "夜班 00–08", output: 45800, defects: 214, leader: "李卫国" },
];
// 设备：近 7 日平均健康度、MTBF/MTTR 与维保计划。
export const healthWeek = [93.1, 92.8, 92.4, 92.6, 91.9, 91.2, 90.6];
export const reliability = { mtbf: 412, mttr: 1.8, plannedRate: 96.4, spareDays: 21 };
export const maintenance = [
  { device: "ZSJ-Z03", task: "液压油冷却器清洗 + 更换油温传感器", due: "今日 22:30", owner: "设备一组", tone: "bad" },
  { device: "ZSJ-F09", task: "顶出油缸密封更换", due: "今日 23:00", owner: "设备一组", tone: "bad" },
  { device: "SSYT-02", task: "再生加热器更换", due: "明日 08:30", owner: "辅机组", tone: "bad" },
  { device: "ZSJ-F33", task: "止逆环检查、背压阀校准", due: "明日 10:00", owner: "设备二组", tone: "warn" },
  { device: "GZJ-02", task: "温控模块校准", due: "明日 14:00", owner: "辅机组", tone: "warn" },
  { device: "DDJ-01", task: "季度保养（货叉、钢丝绳）", due: "11-28", owner: "物流组", tone: "ok" },
];
// 仓储：近 12 h 入出库节拍、AGV 车队与库龄。
export const agvFleet = [
  { id: "AGV-01", task: "原料托盘 R-05 → 注塑供料", battery: 64, state: "运行" },
  { id: "AGV-02", task: "空托盘回收 → 空托盘区", battery: 81, state: "运行" },
  { id: "AGV-03", task: "充电中", battery: 23, state: "待机" },
];
export const stockAge = [{ name: "≤7 天", value: 612 }, { name: "8–15 天", value: 284 }, { name: "16–30 天", value: 108 }, { name: "＞30 天", value: 34 }];
// 能源：峰谷平用电与近 7 日单耗。
export const tou = [{ name: "峰时", value: 12840 }, { name: "平时", value: 11960 }, { name: "谷时", value: 7160 }];
export const perKWeek = [79.6, 80.2, 79.1, 78.4, 79.8, 81.0, energy.perK];
// 安防：巡更、门禁、消防设施清单（与场景消防构件对应）。
export const patrol = [
  { route: "生产楼 1F 巡更线", done: 6, plan: 6, last: "21:05" },
  { route: "库区楼巡更线", done: 5, plan: 6, last: "20:40" },
  { route: "园区周界巡更线", done: 4, plan: 4, last: "21:20" },
];
export const access = { in: 812, out: 774, denied: 3, hourly: [12, 4, 2, 6, 188, 92, 136, 84, 118, 96, 74] };
export const fireList = [
  { id: "XHS-1F", name: "消火栓 · 生产楼 1F", kind: "hydrant", floor: "1F", node: "SM_xiaohuoshuan_01_生产楼_1F", count: 24, online: 24 },
  { id: "XHS-2F", name: "消火栓 · 生产楼 2F", kind: "hydrant", floor: "2F", node: "SM_BJ_XHS_生产楼_2F", count: 22, online: 22 },
  { id: "BJQ-1F", name: "声光报警器 · 生产楼 1F", kind: "alarm", floor: "1F", node: "SM_BJQ_01_生产楼_1F", count: 38, online: 38 },
  { id: "XFBJ-1F", name: "手动报警按钮 · 生产楼 1F", kind: "alarm", floor: "1F", node: "SM_XFBJQ_01_生产楼_1F", count: 36, online: 35 },
  { id: "BJQ-2F", name: "声光报警器 · 生产楼 2F", kind: "alarm", floor: "2F", node: "SM_BJ_BJQ_生产楼_2F", count: 34, online: 34 },
  { id: "XFBJ-2F", name: "手动报警按钮 · 生产楼 2F", kind: "alarm", floor: "2F", node: "SM_BJ_XFBJQ_生产楼_2F", count: 32, online: 32 },
  { id: "AQCK-1F", name: "安全出口指示 · 生产楼 1F", kind: "exit", floor: "1F", node: "SM_AQCK_01_生产楼_1F", count: 68, online: 68 },
  { id: "AQCK-2F", name: "安全出口指示 · 生产楼 2F", kind: "exit", floor: "2F", node: "SM_BJ_AQCK_生产楼_2F", count: 64, online: 64 },
];
