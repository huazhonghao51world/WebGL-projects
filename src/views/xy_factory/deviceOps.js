// 设备级操作：部件拆解、材质调节、设备控制、能效优化策略。
// 场景设备是整体网格（室内设备合批渲染，SDK 不提供节点位移），“部件拆解”采用剖切 + 描边 + 按设备结构标注部件位置。
import * as d from "./dashboardData";

/** 各类设备的结构部件。at = 沿设备长轴 / 高度 / 短轴的相对位置（0–1），用于在包围盒上标注。 */
const structures = {
  ZSJ: [
    { key: "inject", name: "注射单元", detail: "料筒 · 螺杆 · 加热圈", at: [0.18, 0.75, 0.5] },
    { key: "mold", name: "模具", detail: "针筒/针帽多腔模 · 冷却水路", at: [0.52, 0.7, 0.5] },
    { key: "clamp", name: "合模单元", detail: "动定模板 · 拉杆 · 肘杆", at: [0.72, 0.65, 0.5] },
    { key: "hydraulic", name: "液压站", detail: "油泵 · 油箱 · 油冷却器", at: [0.4, 0.2, 0.5] },
    { key: "control", name: "电控柜", detail: "PLC · 伺服驱动", at: [0.94, 0.55, 0.5] },
  ],
  ZZX: [
    { key: "feed", name: "振动盘上料", detail: "针筒 / 针帽排序", at: [0.1, 0.6, 0.5] },
    { key: "convey", name: "输送定位", detail: "同步带 · 定位治具", at: [0.32, 0.5, 0.5] },
    { key: "assemble", name: "装配工位", detail: "压装 · 旋合", at: [0.55, 0.6, 0.5] },
    { key: "inspect", name: "视觉检测", detail: "CCD 外观 · 尺寸", at: [0.75, 0.7, 0.5] },
    { key: "unload", name: "下线剔除", detail: "合格品下线 · 不良剔除", at: [0.93, 0.5, 0.5] },
  ],
  DDJ: [
    { key: "travel", name: "行走机构", detail: "地轨 · 行走电机", at: [0.5, 0.03, 0.5] },
    { key: "lift", name: "升降机构", detail: "立柱 · 载货台", at: [0.5, 0.55, 0.5] },
    { key: "fork", name: "四级伸缩货叉", detail: "一级~四级货叉", at: [0.5, 0.35, 0.5] },
    { key: "control", name: "电控柜", detail: "定位 · 安全光幕", at: [0.5, 0.12, 0.5] },
  ],
  AGV: [
    { key: "body", name: "车体", detail: "差速驱动", at: [0.5, 0.35, 0.5] },
    { key: "fork", name: "叉臂", detail: "托盘叉取", at: [0.9, 0.3, 0.5] },
    { key: "battery", name: "动力电池", detail: "磷酸铁锂", at: [0.3, 0.2, 0.5] },
    { key: "nav", name: "激光导航", detail: "SLAM 定位", at: [0.5, 1, 0.5] },
  ],
  DRYER: [
    { key: "hopper", name: "料斗", detail: "粒料储存", at: [0.5, 0.9, 0.5] },
    { key: "heater", name: "加热器", detail: "热风加热", at: [0.5, 0.55, 0.5] },
    { key: "blower", name: "风机", detail: "循环风", at: [0.5, 0.25, 0.5] },
    { key: "control", name: "控制器", detail: "温度 / 露点", at: [0.5, 0.45, 0.9] },
  ],
  GENERIC: [
    { key: "body", name: "设备本体", detail: "", at: [0.5, 0.5, 0.5] },
    { key: "drive", name: "驱动单元", detail: "电机 · 减速机", at: [0.3, 0.25, 0.5] },
    { key: "control", name: "电控单元", detail: "PLC", at: [0.85, 0.5, 0.5] },
  ],
};
const familyOf = (group) => (group.startsWith("ZSJ") ? "ZSJ" : ["GZJ", "CSGZJ", "SSYT"].includes(group) ? "DRYER" : structures[group] ? group : "GENERIC");
// 异常部件：与告警原因一致。
const faults = {
  "ZSJ-Z03": { hydraulic: ["故障", "液压油温 68 °C 超限（上限 55 °C）"] },
  "ZSJ-F17": { inject: ["告警", "料筒温度 241 °C（设定 235 °C）"], mold: ["告警", "右侧水路流量 6.1 L/min（设定 9 L/min）"] },
  ZZXA: { feed: ["告警", "振动盘 2 供料不足"] },
};

/** 设备部件清单与世界坐标（沿包围盒长轴展开）。 */
export function componentsOf(device, item) {
  const parts = structures[familyOf(device.group)];
  const size = item.max.map((v, i) => v - item.min[i]);
  const longX = size[0] >= size[2];
  return parts.map((part) => {
    const [along, up, across] = part.at;
    const x = item.min[0] + size[0] * (longX ? along : across);
    const z = item.min[2] + size[2] * (longX ? across : along);
    const fault = faults[device.id] && faults[device.id][part.key];
    return { ...part, status: fault ? fault[0] : "正常", reason: fault ? fault[1] : "", position: [x, item.min[1] + size[1] * up + 0.5, z] };
  });
}

export const materialPresets = [
  { id: "none", name: "原色", color: null },
  { id: "blue", name: "科技蓝", color: "#3ea6ff" },
  { id: "green", name: "安全绿", color: "#3ef08a" },
  { id: "yellow", name: "警示黄", color: "#f5c451" },
  { id: "gray", name: "灰化", color: "#56606b" },
];

/** 设备控制指令：按当前状态给出可执行项（停机/故障设备不能直接启动，须先复位）。 */
export const commands = [
  { id: "start", name: "启动", allow: ["待机", "换模"] },
  { id: "stop", name: "停机", allow: ["运行", "告警"] },
  { id: "reset", name: "故障复位", allow: ["故障", "告警"] },
  { id: "estop", name: "急停", allow: ["运行", "告警", "换模"] },
];
const nextStatus = { start: "运行", stop: "待机", reset: "待机", estop: "故障" };

/** 执行控制（演示：只改页面台账，不下发真实 PLC）。返回 { ok, message, device }。 */
export function applyCommand(device, command, user = "中控值班") {
  const def = commands.find((c) => c.id === command);
  if (!def) return { ok: false, message: `未知指令 ${command}` };
  if (!def.allow.includes(device.status)) return { ok: false, message: `${device.name} 当前「${device.status}」，不可执行「${def.name}」` };
  const before = device.status;
  device.status = nextStatus[command];
  if (command === "start") { device.power = device.rated; device.note = `${user} 远程启动`; }
  if (command === "stop" || command === "estop") device.power = command === "estop" ? 0 : d.helpers.round(device.rated * 0.06);
  if (command === "reset") { device.health = Math.max(device.health, 70); device.note = `${user} 已复位，待点检后启动`; }
  if (command === "estop") device.note = `${user} 急停，需现场确认后复位`;
  return { ok: true, before, message: `${device.name}：${before} → ${device.status}（${def.name}）`, device };
}

/** 能效优化策略：由分项计量、设备台账与光伏曲线推导，节电量按当日口径估算。 */
export function energyStrategies(ledger) {
  const e = d.energy;
  const meter = (name) => d.meters.find((m) => m.name === name).value;
  const idle = ledger.filter((x) => ["待机", "换模"].includes(x.status) && x.group.startsWith("ZSJ"));
  const factor = 0.5703;
  const list = [
    {
      title: "换模 / 待机注塑机自动降温保压",
      basis: `当前 ${idle.length} 台注塑机待机或换模（${idle.map((x) => x.name.replace("注塑机 ", "")).join("、")}），料筒保温约 2.2 kW/台`,
      action: "待机超过 20 min 自动降至保温 160 °C，换模期间关闭料筒加热，开机前 25 min 预热",
      saving: Math.round(idle.length * 2.2 * 0.45 * 10),
    },
    {
      title: "干燥机负荷移峰到光伏发电时段",
      basis: `光伏今日 ${d.helpers.round(e.pv / 1000, 2)} MWh，10–16 时出力占全天 ${d.helpers.pct(e.pvHourly.slice(5, 8).reduce((t, v) => t + v, 0), e.pv)}%；干燥与供料 ${meter("干燥与供料").toLocaleString()} kWh`,
      action: "粒料干燥批次集中在 10–16 时，夜间仅保持露点；三机一体干燥机启用再生余热回收",
      saving: Math.round(meter("干燥与供料") * 0.08),
    },
    {
      title: "洁净区 FFU 非生产时段降频",
      basis: `空调与洁净 ${meter("空调与洁净").toLocaleString()} kWh；组装线 00–06 时产量仅占全天 ${d.helpers.pct(d.production.hourly.slice(0, 3).reduce((t, v) => t + v, 0), d.production.assembled)}%`,
      action: `低产时段 FFU 降频 30%，保持压差 ≥ ${d.envRules.dp} Pa（以 VTK 压差仿真与在线压差计校核）`,
      saving: Math.round(meter("空调与洁净") * 0.25 * 0.3 * 0.6),
    },
    {
      title: "FANUC-17 冷却水路检修",
      basis: "右侧模具水路流量 6.1 L/min 低于设定 9 L/min，冷却时间延长，节拍 13.1 s（同型号 12.4 s）",
      action: "清洗水路过滤器与快插接头，恢复流量后节拍回到 12.4 s，单位产品能耗下降约 5%",
      saving: Math.round((ledger.find((x) => x.id === "ZSJ-F17") || { power: 19.4 }).power * 21.5 * 0.05),
    },
    {
      title: "空压与照明分区控制",
      basis: `生活区 ${meter("生活区").toLocaleString()} kWh、办公研发 ${meter("办公研发").toLocaleString()} kWh 夜间仍有基础负荷`,
      action: "办公研发楼 22 时后照明分区关断，宿舍公共区感应控制",
      saving: Math.round((meter("生活区") + meter("办公研发")) * 0.06),
    },
  ].map((s) => ({ ...s, carbon: d.helpers.round((s.saving * factor) / 1000, 3) }));
  const total = list.reduce((t, s) => t + s.saving, 0);
  return { list, total, share: d.helpers.pct(total, e.today), carbon: d.helpers.round((total * factor) / 1000, 2) };
}
