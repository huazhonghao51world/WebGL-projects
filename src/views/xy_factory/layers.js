// 专题图层：全部基于场景目录（sceneCatalog.json）中的真实节点与包围盒放置，打开时按需拆楼，关闭时清理。
// 每个图层 open(ctx) 返回 { info, dispose }；ctx = { adapter, data, cutaway }：data 为页面当前的设备台账等响应式数据，
// cutaway(buildings) 由页面实现（叠加拆楼，图层关闭时恢复打开前的状态）。
import { campusPoiStyles } from "./poiStyles";
import * as d from "./dashboardData";
import { healthTier } from "./operations";

const poiStyle = campusPoiStyles().device;
const statusColor = { 告警: "#f5c451", 故障: "#ff5a4f", 换模: "#6f9bff", 待机: "#8fa3b8" };
const VTK_BASE = "./xy/vtk/";
const FLOOR_Y = 13.9;

async function loadSummary(name) {
  const response = await fetch(`${VTK_BASE}${name}/summary.json`, { cache: "no-cache" });
  if (!response.ok) throw new Error(`仿真数据 ${name} 不可用（HTTP ${response.status}）`);
  return response.json();
}

const layerPoi = (id, location, label, data = {}) => ({
  customId: `xy-layer-${id}`, location, label, customData: data, style: poiStyle,
});

/* ---------------- 设备健康度（分数梯队） ---------------- */
// 统一规则：≥80 正常（绿，保留原材质）；60–79 预警（黄色着色 + 光框）；<60 告警（红色着色 + 脉冲描边）。
async function health({ adapter, data, cutaway }) {
  cutaway(["production"]);
  const tiers = { 正常: [], 预警: [], 告警: [] };
  data.ledger.forEach((x) => tiers[healthTier(x.health).level].push(x));
  const abnormal = [...tiers.预警, ...tiers.告警];
  adapter.tint("xy-health", abnormal.map((x) => ({ ref: adapter.deviceRef(x.id), color: healthTier(x.health).color })), 3);
  adapter.outline("xy-health-bad", tiers.告警.map((x) => adapter.deviceRef(x.id)), { color: "#ff5a4f", hiddenColor: "#7f1d1d", pulseMs: 1100, glow: 0.8 });
  adapter.outline("xy-health-warn", tiers.预警.map((x) => adapter.deviceRef(x.id)), { color: "#f5c451", hiddenColor: "#8a6d2a", glow: 0.5 });
  const pois = await adapter.addLayerPois(abnormal.map((x) => {
    const item = adapter.catalog.devices.find((y) => y.id === x.id);
    return item ? layerPoi(`device-${x.id}`, [item.center[0], item.max[1] + 0.6, item.center[2]], `${x.name} · ${x.health}分 · ${healthTier(x.health).level}`, { device: x.id }) : null;
  }).filter(Boolean));
  return {
    info: `设备健康度 · 正常（≥80）${tiers.正常.length} 台 · 预警（60–79，黄）${tiers.预警.length} 台 · 告警（<60，红）${tiers.告警.length} 台`,
    dispose: () => { adapter.clearTint("xy-health"); adapter.clearOutline("xy-health-bad"); adapter.clearOutline("xy-health-warn"); return adapter.removeEntities(pois); },
  };
}

/* ---------------- 能耗热力（设备实时功率，分位数拉开对比） ---------------- */
async function heat({ adapter, data, cutaway }) {
  cutaway(["production"]);
  const list = data.ledger.filter((x) => x.power > 0);
  const sorted = list.map((x) => x.power).sort((a, b) => a - b);
  // 按功率排名映射到 0–100：低耗设备压到冷色端，前 10% 高耗设备拉到 100（极值红），色差明显。
  const rank = (p) => sorted.filter((v) => v <= p).length / sorted.length;
  const features = list.map((x) => {
    const item = adapter.catalog.devices.find((y) => y.id === x.id);
    const r = rank(x.power);
    const value = r >= 0.9 ? 100 : r <= 0.2 ? 4 : Math.round(r ** 1.6 * 90);
    return item && { value, point: [item.center[0], item.min[1] + 0.05, item.center[2]] };
  }).filter(Boolean);
  const [map] = await adapter.addCoverings([{
    type: "HeatMap", entityName: "XY能耗热力",
    points: { features },
    heatMapStyle: { type: "plane", brushDiameter: 11, blendMode: "max", mappingValueRange: [0, 100], gradientSetting: ["1d4fff00", "1d4fffaa", "22d3eecc", "a3e635dd", "f5c451ee", "ff3b30ff"] },
  }]);
  await adapter.flyTo({ id: "xy-heat-view", name: "能耗热力", position: [36, 105, 78], target: [36, 13.7, -2] }, 900);
  const top = [...list].sort((a, b) => b.power - a.power);
  const total = d.helpers.round(list.reduce((t, x) => t + x.power, 0));
  return {
    info: `能耗热力 · ${features.length} 台合计 ${total} kW；极值：${top[0].name} ${top[0].power} kW / ${top[1].name} ${top[1].power} kW（红），最低 ${top[top.length - 1].name} ${top[top.length - 1].power} kW（蓝）`,
    dispose: () => adapter.removeEntities([map]),
  };
}

/* ---------------- VTK：组装洁净区压差与气流 ---------------- */
async function clean({ adapter, cutaway }) {
  cutaway(["production"]);
  const summary = await loadSummary("cleanroom");
  const base = `${VTK_BASE}cleanroom/`;
  const field = summary.fields.Pressure;
  const [vtk, zone] = await adapter.addCoverings([
    {
      type: "Vtk", entityName: "XY洁净区压差仿真", location: [51, 15.0, -5],
      source: { url: base + summary.frames[0].frame, format: "vtk", frames: summary.frames.map((f) => base + f.frame), times: summary.frames.map((f) => f.time) },
      placement: { unit: "m", upAxis: "Y", anchor: "origin" },
      vtkStyle: { field: "Pressure", colorMap: field.colorMap, range: field.range, opacity: 0.82, legend: { visible: true, position: "right", title: `${field.label} ${field.unit}` } },
      vtkPlayer: { frame: 0, playing: true, fps: 1.2, loop: true },
    },
    {
      type: "Range", entityName: "XY组装洁净区", polygon2D: { coordinates: [[[51, -5], [78, -5], [78, 9.9], [51, 9.9]]], coordZ: 13.7 },
      // box_wave_line 的波纹线框在透视下呈上下错位（看起来歪斜），改为竖直实体边框。
      rangeStyle: { preset: "cleanroom", type: "box_solid", height: 3, color: "3ee6d4ff", fillAreaType: "solid", fillAreaColor: "3ee6d418", strokeWeight: 0.12 },
    },
  ]);
  await adapter.flyTo({ id: "xy-clean-view", name: "组装洁净区", position: [64.5, 38, 30], target: [64.5, 14.5, 2.5] }, 900);
  return {
    vtk, summary,
    info: `洁净区压差仿真（VTK）· 10 万级，判定 ≥ ${d.envRules.dp} Pa；10–30 s 开门时门口最低 ${Math.min(...summary.frames.map((f) => f.minPressure))} Pa`,
    dispose: () => adapter.removeEntities([vtk, zone]),
  };
}

/* ---------------- 典型设备表面温度（热成像） ---------------- */
// 热成像不再在主场景放包围盒 VTK：页面以独立弹窗（thermalViewer.vue）把温度场直接映射到设备模型表面。
export { thermalDevices } from "./thermal";
/* ---------------- 应急疏散（预置案例） ---------------- */
const Y = FLOOR_Y + 0.15;
const P = (x, z) => [x, Y, z];
// 路线为现场取点工具在模型表面手工采集（2026-11-27），保持原始坐标。
export const evacuationCases = [
  {
    id: "molding-fire", name: "注塑车间火情", fireLabel: "起火点 · ZHAFIR-03", desc: "ZHAFIR-03 油泄漏起火，人员经南侧卷帘门撤离至西侧入口广场",
    fire: P(30.2, -19), view: { position: [29.09, 147.28, 0.89], target: [28.84, 13.7, -6.43] },
    exits: [{ name: "南侧卷帘门", at: P(13.4, -27.2) }],
    assembly: [{ name: "集合点 · 入口广场", at: P(-50.6, 29.6) }],
    routes: [
      { name: "注塑车间 → 南侧卷帘门 → 入口广场", people: 108, points: [[29.14, 13.65, -18.63], [25.04, 13.65, -14.25], [10.86, 13.65, -13.68], [13.63, 13.65, -22.09], [13.37, 13.51, -27.38], [-12.39, 13.51, -26.37], [-26.19, 13.51, -11.19], [-24.93, 13.51, 24.79], [-50.62, 13.51, 29.57]] },
    ],
  },
  {
    id: "clean-leak", name: "洁净区泄漏", fireLabel: "泄漏点 · 组装洁净区", desc: "洁净区酒精泄漏，组装线人员经北侧出口 2 撤离至东侧广场",
    fire: P(64, 3), leak: true, view: { position: [70.82, 96.94, 18.42], target: [70.71, 13.7, 15.44] },
    exits: [{ name: "北侧出口 2", at: P(77.3, 23) }],
    assembly: [{ name: "集合点 · 东侧广场", at: P(106.3, 26.1) }],
    routes: [
      { name: "组装洁净区 → 北侧出口 2 → 东侧广场", people: 52, points: [[64.06, 13.65, 3.12], [64.47, 13.65, 7.36], [66.38, 13.65, 8.7], [66.74, 13.65, 15.03], [55.94, 13.65, 15.32], [56.26, 13.65, 20.45], [77.06, 13.65, 19.72], [77.43, 13.51, 26.73], [106.27, 13.51, 26.05]] },
    ],
  },
];async function emergency({ adapter, cutaway, options = {} }) {
  const plan = evacuationCases.find((x) => x.id === options.case) || evacuationCases[0];
  cutaway(["production"]);
  // 疏散路线：与「今日立库任务」路径同款 logistics_flow 样式（绿色，朝出口流动）。
  const paths = await adapter.addCoverings(plan.routes.map((route) => ({
    type: "Path", entityName: "XY疏散路线", polyline: { coordinates: route.points },
    pathStyle: { preset: "logistics_flow", color: "4ade80ff", width: 1.1, speedupFactor: 1.4 },
  })));
  // 事故点：火情用 SDK Fire 覆盖物（火焰 + 烟柱 + 地面光晕 + 闪烁光源）；泄漏用红色警戒区 + 小火苗（酒精挥发燃点低，示意引燃风险）。
  const hazard = await adapter.addCoverings(plan.leak ? [
    { type: "Range", entityName: "XY泄漏警戒区", circlePolygon2D: { center: [plan.fire[0], plan.fire[2]], radius: 4.5, coordZ: plan.fire[1] - 0.1 }, rangeStyle: { preset: "restricted_area", height: 2.4 } },
    { type: "Fire", entityName: "XY泄漏引燃点", location: plan.fire, fireStyle: { intensity: "small", radius: 0.5, smokeHeight: 4, light: false } },
  ] : [
    { type: "Fire", entityName: "XY火情", location: plan.fire, fireStyle: { intensity: "medium", radius: 1.2, scale: 0.9, smokeHeight: 9, wind: [0.4, 0.1], light: false } },
    { type: "Range", entityName: "XY火情警戒区", circlePolygon2D: { center: [plan.fire[0], plan.fire[2]], radius: 5, coordZ: plan.fire[1] - 0.1 }, rangeStyle: { preset: "restricted_area", height: 0.6 } },
  ]);
  const pois = await adapter.addLayerPois([
    layerPoi("fire", [plan.fire[0], plan.fire[1] + 2.4, plan.fire[2]], plan.fireLabel, { fire: plan.id }),
    ...plan.exits.map((x, i) => layerPoi(`exit-${i}`, [x.at[0], x.at[1] + 2.4, x.at[2]], x.name, { exit: i })),
    ...plan.assembly.map((x, i) => layerPoi(`assembly-${i}`, [x.at[0], x.at[1] + 1.5, x.at[2]], x.name, { assembly: i })),
  ]);
  await adapter.flyTo({ id: `xy-evac-${plan.id}`, name: plan.name, ...plan.view }, 900);
  const people = plan.routes.reduce((t, r) => t + r.people, 0);
  return {
    evacuation: plan.id,
    info: `应急疏散 · ${plan.name}：${plan.desc}；${plan.routes.length} 条路线、${plan.exits.length} 个出口，疏散 ${people} 人`,
    dispose: () => adapter.removeEntities([...paths, ...hazard, ...pois]),
  };
}

/* ---------------- 库位占用 ---------------- */
// 立体库货架（SM_huojia_01）沿 x 方向按库位数划分库区：西端原料、包材，中部成品，东端靠近入库转运机的空托盘。
// 立体库货架在场景中绕竖轴约 -2.3° 摆放：库区按货架自身方向（u 沿长边、w 沿短边）切分，轮廓与货架贴合。
const RACK_FRAME = { angle: (-2.3 * Math.PI) / 180, u: [-34.5, 76.95], w: [-56.07, -39.87] };
export function warehouseZones(racks) {
  const order = ["RM", "PK", "FG", "EP"];
  const total = order.reduce((t, id) => t + d.zones.find((z) => z.id === id).slots, 0);
  const c = Math.cos(RACK_FRAME.angle), s = Math.sin(RACK_FRAME.angle);
  const toXZ = (u, w) => [u * c - w * s, u * s + w * c];
  const [w0, w1] = RACK_FRAME.w;
  let u = RACK_FRAME.u[0];
  return order.map((id) => {
    const zone = d.zones.find((z) => z.id === id);
    const width = ((RACK_FRAME.u[1] - RACK_FRAME.u[0]) * zone.slots) / total;
    const corners = [toXZ(u, w0), toXZ(u + width, w0), toXZ(u + width, w1), toXZ(u, w1)];
    u += width;
    const xs = corners.map((p) => p[0]), zs = corners.map((p) => p[1]);
    const box = { min: [Math.min(...xs), racks.min[1], Math.min(...zs)], max: [Math.max(...xs), racks.max[1], Math.max(...zs)] };
    return { ...zone, rate: d.helpers.pct(zone.used, zone.slots), box, corners };
  });
}
async function slots({ adapter, cutaway }) {
  cutaway(["warehouse"]);
  const zones = warehouseZones(adapter.catalog.regions.racks);
  const color = (rate) => (rate >= 85 ? "ff5a4f" : rate >= 75 ? "f5c451" : "3ee6d4");
  const ranges = await adapter.addCoverings(zones.map((z) => ({
    type: "Range", entityName: "XY库位占用",
    polygon2D: { coordinates: [z.corners], coordZ: z.box.min[1] },
    rangeStyle: { type: "box_solid", height: (z.box.max[1] - z.box.min[1]) * (z.used / z.slots), color: `${color(z.rate)}ff`, fillAreaType: "solid", fillAreaColor: `${color(z.rate)}33`, strokeWeight: 0.2 },
  })));
  const pois = await adapter.addLayerPois(zones.map((z) => layerPoi(`zone-${z.id}`, [(z.box.min[0] + z.box.max[0]) / 2, z.box.max[1] + 1.2, (z.box.min[2] + z.box.max[2]) / 2], `${z.name} ${z.used}/${z.slots} · ${z.rate}%`, { zone: z.id })));
  await adapter.flyTo({ id: "xy-slots-view", name: "立体库库位", position: [20, 78, 18], target: [20, 18, -49] }, 900);
  return {
    info: `库位占用 · 柱高为占用比例：${zones.map((z) => `${z.name} ${z.rate}%`).join("，")}；合计 ${d.warehouse.used}/${d.warehouse.slots}（${d.warehouse.rate}%）`,
    dispose: () => adapter.removeEntities([...ranges, ...pois]),
  };
}

/* ---------------- 视频监控（三维点位 + 监控视角） ---------------- */
async function video({ adapter, data }) {
  await adapter.filterCameras(true);
  return { info: `视频监控 · ${data.cameras.length} 路点位已显示，点选点位或列表进入监控视角（视频流待接入）`, dispose: () => {} };
}

/* ---------------- 生产管线：生产楼整栋拆（保留 1F）、库区楼整栋拆，显示生产流程特效 ---------------- */
async function pipeline({ adapter, cutaway }) {
  cutaway(["production", "warehouse"]);
  if (!(await adapter.showPipelineVfx(true))) throw new Error("场景中没有生产流程特效（实体 xy-vfx）");
  // 正向俯视：从园区南侧正对生产楼与库区楼的南北轴线，俯角约 50°。
  await adapter.flyTo({ id: "xy-pipeline-view", name: "生产管线", position: [39.43, 144.68, 114.73], target: [36, 14, -16] }, 900);
  return {
    info: "生产管线 · 生产楼与库区楼已拆开（保留生产楼 1F），显示立库取料 → AGV 接驳 → 原料配送 → 注塑 → 洁净组装 → 包装入库的生产流程",
    dispose: () => adapter.showPipelineVfx(false),
  };
}
export const layerDefs = {
  pipeline: { name: "生产管线", open: pipeline },
  video: { name: "视频监控", open: video },
  health: { name: "设备健康度", open: health },
  heat: { name: "能耗热力", open: heat },
  clean: { name: "洁净区压差", open: clean, vtk: true },

  emergency: { name: "应急疏散", open: emergency },
  slots: { name: "库位占用", open: slots },
};
