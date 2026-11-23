// XY 工厂演示数据。所有汇总值都从明细推导，保证面板之间口径一致；接入真实接口时只替换明细即可。
const sum = (list, key) => list.reduce((total, item) => total + (typeof key === "function" ? key(item) : item[key]), 0);
const round = (value, digits = 1) => Number(value.toFixed(digits));
const pct = (part, whole, digits = 1) => (whole ? round((part / whole) * 100, digits) : 0);

// 演示数据快照时刻：所有“今日”口径都截至该时刻，避免出现未来时段的数据
export const AS_OF = "21:30";
export const HOURS = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20"];
export const DAYS = ["11-17", "11-18", "11-19", "11-20", "11-21", "11-22", "11-23"];

/* ---------------- 生产 ---------------- */
export const lines = [
  { id: "L1", name: "SMT 贴片线 1", building: "production", floor: "1F", plan: 4800, done: 3936, oee: 86.4, status: "运行" },
  { id: "L2", name: "SMT 贴片线 2", building: "production", floor: "1F", plan: 4800, done: 3744, oee: 82.1, status: "运行" },
  { id: "L3", name: "总装线 A", building: "production", floor: "2F", plan: 1600, done: 1352, oee: 88.7, status: "运行" },
  { id: "L4", name: "总装线 B", building: "production", floor: "2F", plan: 1600, done: 1088, oee: 71.5, status: "换型" },
  { id: "L5", name: "测试包装线", building: "production", floor: "3F", plan: 3000, done: 2610, oee: 90.2, status: "运行" },
];
export const production = (() => {
  const plan = sum(lines, "plan");
  const done = sum(lines, "done");
  const defects = [
    { name: "焊点不良", value: 38 }, { name: "外观划伤", value: 21 }, { name: "功能测试失败", value: 17 },
    { name: "缺件错件", value: 9 }, { name: "其他", value: 6 },
  ];
  const defectTotal = sum(defects, "value");
  // 每 2 小时产出，合计严格等于今日完成量
  const weights = [3, 3, 2, 2, 9, 11, 9, 11, 12, 10, 8];
  const unit = done / sum(weights, (w) => w);
  const hourly = weights.map((w) => Math.round(w * unit));
  hourly[hourly.length - 1] += done - sum(hourly, (v) => v);
  return {
    plan, done, rate: pct(done, plan), oee: round(sum(lines, (l) => l.oee * l.plan) / plan),
    defects, defectTotal, yieldRate: pct(done - defectTotal, done, 2), hourly,
    running: lines.filter((l) => l.status === "运行").length,
  };
})();

/* ---------------- 设备 ---------------- */
export const devices = [
  { id: "EQ-P101", name: "贴片机 NXT-01", type: "生产设备", building: "production", floor: "1F", status: "运行", health: 96, temp: 41.2, power: 6.8, hours: 18342 },
  { id: "EQ-P102", name: "贴片机 NXT-02", type: "生产设备", building: "production", floor: "1F", status: "运行", health: 91, temp: 43.6, power: 7.1, hours: 17610 },
  { id: "EQ-P103", name: "回流焊炉 RF-01", type: "生产设备", building: "production", floor: "1F", status: "告警", health: 68, temp: 251.4, power: 38.5, hours: 21877 },
  { id: "EQ-P201", name: "拧紧机器人 R-01", type: "生产设备", building: "production", floor: "2F", status: "运行", health: 93, temp: 38.9, power: 3.2, hours: 9821 },
  { id: "EQ-P202", name: "拧紧机器人 R-02", type: "生产设备", building: "production", floor: "2F", status: "待机", health: 89, temp: 29.4, power: 0.4, hours: 9650 },
  { id: "EQ-P301", name: "ICT 测试台 T-01", type: "检测设备", building: "production", floor: "3F", status: "运行", health: 95, temp: 35.1, power: 1.6, hours: 12034 },
  { id: "EQ-P302", name: "AOI 检测仪 A-01", type: "检测设备", building: "production", floor: "1F", status: "故障", health: 42, temp: 31.0, power: 0, hours: 15402 },
  { id: "EQ-W101", name: "堆垛机 SC-01", type: "物流设备", building: "warehouse", floor: "1F", status: "运行", health: 94, temp: 37.5, power: 11.2, hours: 13208 },
  { id: "EQ-W102", name: "堆垛机 SC-02", type: "物流设备", building: "warehouse", floor: "1F", status: "运行", health: 90, temp: 39.8, power: 10.6, hours: 13190 },
  { id: "EQ-W201", name: "AGV-07", type: "物流设备", building: "warehouse", floor: "2F", status: "待机", health: 87, temp: 30.2, power: 0.3, hours: 6540 },
  { id: "EQ-U001", name: "空压机 AC-01", type: "动力设备", building: "utility", floor: "1F", status: "运行", health: 78, temp: 64.3, power: 55.0, hours: 26410 },
  { id: "EQ-U002", name: "冷水机组 CH-01", type: "动力设备", building: "utility", floor: "1F", status: "运行", health: 88, temp: 12.6, power: 92.4, hours: 24180 },
];
export const deviceStats = (() => {
  const by = (status) => devices.filter((d) => d.status === status).length;
  const total = devices.length;
  const running = by("运行");
  return {
    total, running, idle: by("待机"), alarm: by("告警"), fault: by("故障"),
    utilization: pct(running, total), health: round(sum(devices, "health") / total),
    types: [...new Set(devices.map((d) => d.type))].map((type) => ({ name: type, value: devices.filter((d) => d.type === type).length })),
  };
})();

/* ---------------- 告警 ---------------- */
export const alarms = [
  { id: "ALM-20261123-012", device: "EQ-P302", content: "AOI 相机通讯中断", level: "紧急", building: "production", time: "13:12", state: "未处置" },
  { id: "ALM-20261123-011", device: "EQ-P103", content: "回流焊 7 温区超温 +6.4 °C", level: "紧急", building: "production", time: "12:47", state: "未处置" },
  { id: "ALM-20261123-010", device: "EQ-U001", content: "空压机排气温度偏高", level: "预警", building: "utility", time: "11:35", state: "未处置" },
  { id: "ALM-20261123-009", device: "ENV-W3", content: "库区 3F 湿度 68 %RH 超上限", level: "预警", building: "warehouse", time: "10:52", state: "已处置" },
  { id: "ALM-20261123-008", device: "EQ-W201", content: "AGV-07 电量低于 20%", level: "提示", building: "warehouse", time: "09:20", state: "已处置" },
  { id: "ALM-20261123-007", device: "EQ-P202", content: "拧紧扭矩连续 3 次偏下限", level: "预警", building: "production", time: "08:41", state: "已处置" },
  { id: "ALM-20261123-006", device: "CAM-12", content: "宿舍楼东侧周界入侵识别", level: "预警", building: "dormitory", time: "02:16", state: "已处置" },
];

/* ---------------- 仓储 ---------------- */
export const zones = [
  { id: "A", name: "原材料区", floor: "1F", slots: 480, used: 412 },
  { id: "B", name: "电子料区", floor: "2F", slots: 360, used: 297 },
  { id: "C", name: "半成品区", floor: "3F", slots: 240, used: 151 },
  { id: "D", name: "成品区", floor: "4F", slots: 320, used: 268 },
];
export const warehouse = (() => {
  const slots = sum(zones, "slots");
  const used = sum(zones, "used");
  const inbound = [86, 92, 78, 104, 97, 88, 95];
  const outbound = [81, 95, 84, 99, 102, 90, 87];
  return { slots, used, free: slots - used, rate: pct(used, slots), inbound, outbound, todayIn: inbound[6], todayOut: outbound[6] };
})();
export const stockRecords = [
  { id: "RK-1123-031", type: "入库", material: "PCB 主板 V3.2", qty: 1200, zone: "B", time: "13:05" },
  { id: "CK-1123-027", type: "出库", material: "整机成品 X5", qty: 360, zone: "D", time: "12:40" },
  { id: "RK-1123-030", type: "入库", material: "铝合金外壳", qty: 800, zone: "A", time: "11:58" },
  { id: "CK-1123-026", type: "出库", material: "电源模组 P65", qty: 540, zone: "C", time: "11:12" },
  { id: "PK-1123-002", type: "盘库", material: "电子料区 B-02 排", qty: 96, zone: "B", time: "10:30" },
];

/* ---------------- 产品 ---------------- */
export const products = [
  { id: "X5", name: "智能网关 X5", done: 3420 },
  { id: "X3", name: "边缘控制器 X3", done: 2614 },
  { id: "P65", name: "电源模组 P65", done: 3936 },
  { id: "S2", name: "传感节点 S2", done: 2760 },
];
// 产品产量合计 = 各产线完成量合计
if (sum(products, "done") !== production.done) throw new Error("XY 演示数据：产品产量与产线产量不一致");
export const traceSample = {
  sn: "XY-X5-2611230417", product: "智能网关 X5", order: "MO-202611-0186",
  steps: [
    { name: "SMT 贴片", line: "SMT 贴片线 1", time: "08:12", result: "合格" },
    { name: "回流焊接", line: "SMT 贴片线 1", time: "08:26", result: "合格" },
    { name: "AOI 检测", line: "SMT 贴片线 1", time: "08:31", result: "合格" },
    { name: "整机总装", line: "总装线 A", time: "09:47", result: "合格" },
    { name: "ICT 测试", line: "测试包装线", time: "10:55", result: "合格" },
    { name: "包装入库", line: "测试包装线", time: "11:20", result: "D 区 04-17" },
  ],
};

/* ---------------- 能源 ---------------- */
export const meters = [
  { name: "生产用电", building: "production", value: 6820 },
  { name: "空压站", building: "utility", value: 1320 },
  { name: "冷水机组", building: "utility", value: 2218 },
  { name: "仓储物流", building: "warehouse", value: 864 },
  { name: "办公研发", building: "office", value: 1046 },
  { name: "生活区", building: "dormitory", value: 532 },
];
export const energy = (() => {
  const today = sum(meters, "value");
  const weights = [3, 3, 3, 4, 10, 12, 10, 12, 12, 11, 6];
  const unit = today / sum(weights, (w) => w);
  const hourly = weights.map((w) => Math.round(w * unit));
  hourly[hourly.length - 1] += today - sum(hourly, (v) => v);
  const week = [13980, 14210, 13650, 14420, 14105, 9860, today];
  const water = 286;
  const gas = 1240;
  const carbon = round((today * 0.5703) / 1000, 2); // 全国电网排放因子 0.5703 tCO2/MWh
  return { today, hourly, week, water, gas, carbon, perUnit: round(today / production.done, 2), power: 1186, peakShare: 41.6 };
})();

/* ---------------- 环境 ---------------- */
export const envPoints = [
  { name: "生产楼 1F", temp: 23.6, hum: 46, pm25: 12, co2: 612, ok: true },
  { name: "生产楼 2F", temp: 24.1, hum: 48, pm25: 15, co2: 684, ok: true },
  { name: "生产楼 3F", temp: 23.2, hum: 45, pm25: 10, co2: 590, ok: true },
  { name: "库区楼 3F", temp: 21.8, hum: 63, pm25: 18, co2: 540, ok: true },
  { name: "研发楼 1", temp: 24.6, hum: 50, pm25: 9, co2: 812, ok: true },
  { name: "办公楼", temp: 25.0, hum: 49, pm25: 8, co2: 1046, ok: false },
];
export const environment = {
  outdoor: { temp: 14.2, hum: 58, aqi: 46, wind: "东北风 2 级" },
  okRate: pct(envPoints.filter((p) => p.ok).length, envPoints.length),
  tempTrend: [19.8, 19.6, 19.4, 19.9, 21.6, 22.8, 23.6, 24.1, 24.0, 23.5, 22.4],
};

/* ---------------- 安防 ---------------- */
export const guardPosts = [
  { name: "1 号门岗（主入口）", staff: 2, visitors: 37, vehicles: 112 },
  { name: "2 号门岗（物流口）", staff: 2, visitors: 4, vehicles: 86 },
];
export const patrols = [
  { name: "巡检机器人 PR-01", route: "生产楼—库区楼", progress: 72, state: "巡检中" },
  { name: "巡检无人机 UAV-02", route: "园区周界", progress: 100, state: "已返航" },
];
export const security = (() => {
  const events = alarms.filter((a) => ["CAM-12"].includes(a.device));
  return {
    visitors: sum(guardPosts, "visitors"), vehicles: sum(guardPosts, "vehicles"), staffOnSite: 1286,
    fireDevices: 642, fireOnline: 639, safeDays: 1218, events: events.length,
    risks: [{ name: "周界入侵", value: 3 }, { name: "消防通道占用", value: 2 }, { name: "未佩戴安全帽", value: 5 }, { name: "烟感误报", value: 1 }],
  };
})();

/* ---------------- 楼栋档案 ---------------- */
export const buildingProfiles = {
  production: { use: "生产制造", area: 18600, floors: 3, people: 486, note: "SMT、总装、测试包装三层布局" },
  warehouse: { use: "立体仓储", area: 9200, floors: 4, people: 64, note: "4 个库区，2 台堆垛机" },
  "research-1": { use: "研发测试", area: 6400, floors: 5, people: 212, note: "硬件实验室、EMC 暗室" },
  "research-2": { use: "研发办公", area: 6400, floors: 5, people: 188, note: "软件研发、样机试制" },
  office: { use: "行政办公", area: 7800, floors: 6, people: 246, note: "园区指挥中心位于 2F" },
  dormitory: { use: "员工生活", area: 8600, floors: 7, people: 90, note: "在宿人员为白班时段数据" },
  utility: { use: "动力辅助", area: 1200, floors: 1, people: 0, note: "空压站、冷水机房" },
};
export const peopleOnSite = Object.values(buildingProfiles).reduce((total, b) => total + b.people, 0);
if (peopleOnSite !== security.staffOnSite) throw new Error("XY 演示数据：在园人数与楼栋人数不一致");

export const helpers = { sum, pct, round };
