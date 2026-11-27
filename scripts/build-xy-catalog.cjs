#!/usr/bin/env node
/*
 * 从场景组交付的 GLB 生成 XY 场景目录（src/views/xy_factory/sceneCatalog.json）：
 * 室内设备、消防安防设施、楼栋/楼层/货架区域的世界包围盒。页面据此定位设备、着色、放置热力图/VTK/疏散路线。
 *
 * 用法：node scripts/build-xy-catalog.cjs [交付目录/models]
 * 坐标与场景实体一致（实体变换为单位矩阵，本地米制 Y-up）。节点改名时重新运行并提交结果。
 */
const fs = require("fs");
const path = require("path");

const modelsDir = process.argv[2] || path.resolve(__dirname, "../../threejs-twin-research/xy-versionpackage/xy-delivery-1.1.0/models");
const out = path.resolve(__dirname, "../src/views/xy_factory/sceneCatalog.json");

function readGlb(file) {
  const buffer = fs.readFileSync(path.join(modelsDir, file));
  const length = buffer.readUInt32LE(12);
  return JSON.parse(buffer.toString("utf8", 20, 20 + length));
}

const multiply = (a, b) => {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return r;
};
function localMatrix(node) {
  if (node.matrix) return node.matrix;
  const [x, y, z, w] = node.rotation || [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale || [1, 1, 1];
  const [tx, ty, tz] = node.translation || [0, 0, 0];
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1,
  ];
}
const apply = (m, [x, y, z]) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];

/** 每个节点（含子孙网格）的世界包围盒；EXT_mesh_gpu_instancing 的合批节点不计入。 */
function boxes(gltf) {
  const result = new Map();
  const grow = (box, p) => { for (let i = 0; i < 3; i++) { box.min[i] = Math.min(box.min[i], p[i]); box.max[i] = Math.max(box.max[i], p[i]); } };
  function visit(index, parentMatrix, ancestors) {
    const node = gltf.nodes[index];
    const world = multiply(parentMatrix, localMatrix(node));
    const chain = [...ancestors, index];
    const instanced = node.extensions && node.extensions.EXT_mesh_gpu_instancing;
    if (node.mesh != null && !instanced) {
      for (const primitive of gltf.meshes[node.mesh].primitives) {
        const accessor = gltf.accessors[primitive.attributes.POSITION];
        if (!accessor || !accessor.min) continue;
        // 量化网格（KHR_mesh_quantization）的 normalized 整型坐标需先换算回 [-1, 1] / [0, 1]。
        const unit = accessor.normalized ? { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 }[accessor.componentType] || 1 : 1;
        const [a, b] = [accessor.min.map((v) => v / unit), accessor.max.map((v) => v / unit)];
        for (const corner of [[a[0], a[1], a[2]], [b[0], a[1], a[2]], [a[0], b[1], a[2]], [a[0], a[1], b[2]], [b[0], b[1], a[2]], [b[0], a[1], b[2]], [a[0], b[1], b[2]], [b[0], b[1], b[2]]]) {
          const point = apply(world, corner);
          for (const owner of chain) {
            if (!result.has(owner)) result.set(owner, { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] });
            grow(result.get(owner), point);
          }
        }
      }
    }
    for (const child of node.children || []) visit(child, world, chain);
  }
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  for (const root of gltf.scenes[gltf.scene || 0].nodes) visit(root, identity, []);
  return result;
}

const r2 = (v) => Math.round(v * 100) / 100;
const pack = (box) => ({ min: box.min.map(r2), max: box.max.map(r2), center: box.min.map((v, i) => r2((v + box.max[i]) / 2)) });

function collect(file, entityId, rules) {
  const gltf = readGlb(file);
  const box = boxes(gltf);
  const list = [];
  gltf.nodes.forEach((node, index) => {
    if (!box.has(index) || !node.name) return;
    for (const rule of rules) {
      const match = rule.pattern.exec(node.name);
      if (match) { list.push({ ...rule.map(match, node.name), entityId, nodeName: node.name, ...pack(box.get(index)) }); break; }
    }
  });
  return list;
}

const pad = (n) => String(n).padStart(2, "0");

function main() {
// 设备：编号规则与 dashboardData 的设备分组一一对应（g = 分组 id）。
const devices = [
  ...collect("L_shinei.glb", "xy-shinei", [
    { pattern: /^SM_XY_ZSJ_FANUC_(\d+)$/, map: (m) => ({ id: `ZSJ-F${pad(+m[1])}`, g: "ZSJ-F", name: `注塑机 FANUC-${pad(+m[1])}` }) },
    { pattern: /^SM_BLF_ZSJ_ZHAFIR_(\d+)$/, map: (m) => ({ id: `ZSJ-Z${pad(+m[1])}`, g: "ZSJ-Z", name: `注塑机 ZHAFIR-${pad(+m[1])}` }) },
    { pattern: /^SM_BLF_GZJ_(\d+)$/, map: (m) => ({ id: `GZJ-${pad(+m[1])}`, g: "GZJ", name: `干燥机 ${pad(+m[1])}` }) },
    { pattern: /^SM_XY_CSGZJ_(\d+)$/, map: (m) => ({ id: `CSGZJ-${pad(+m[1])}`, g: "CSGZJ", name: `除湿干燥机 ${pad(+m[1])}` }) },
    { pattern: /^SM_XY_SSYTSCSGZJ_(\d+)$/, map: (m) => ({ id: `SSYT-${pad(+m[1])}`, g: "SSYT", name: `三机一体除湿干燥机 ${pad(+m[1])}` }) },
    { pattern: /^SM_BLF_ZYGL_(\d+)$/, map: (m) => ({ id: `ZYGL-${pad(+m[1])}`, g: "ZYGL", name: `中央供料系统 ${pad(+m[1])}` }) },
    { pattern: /^SM_XY_ZZX([AB])$/, map: (m) => ({ id: `ZZX${m[1]}`, g: "ZZX", name: `组装线 ${m[1]}` }) },
    { pattern: /^SM_LK_TSJ_([12])F$/, map: (m) => ({ id: `TSJ-0${m[1]}`, g: "TSJ", name: `提升机 ${m[1]}F` }) },
  ]),
  ...collect("L_Prop.glb", "xy-prop-sq3", [
    // 注塑机 A/B 是 SQ_6 动画用的 FANUC 机型，补在室内模型 FANUC-13/14 的空位上。
    { pattern: /^注塑机([AB])$/, map: (m) => ({ id: `ZSJ-${m[1]}`, g: "ZSJ-F", name: `注塑机 ${m[1]}（FANUC-${m[1] === "A" ? 13 : 14}）` }) },
    { pattern: /^一级$/, map: () => ({ id: "DDJ-01", g: "DDJ", name: "堆垛机" }) },
    { pattern: /^转运机([12])$/, map: (m) => ({ id: `ZYJ-0${m[1]}`, g: "ZYJ", name: `转运机 ${m[1]}` }) },
    { pattern: /^AGV车$/, map: () => ({ id: "AGV-01", g: "AGV", name: "AGV 叉车" }) },
    { pattern: /^机械臂A$/, map: () => ({ id: "JXB-A", g: "JXB", name: "组装机械臂 A" }) },
    { pattern: /^机械臂B底座$/, map: () => ({ id: "JXB-B", g: "JXB", name: "组装机械臂 B" }) },
  ]),
  ...collect("L_Mesh.glb", "xy-mesh", [
    { pattern: /^中转机械臂([CE])$/, map: (m) => ({ id: `ZJXB-${m[1]}`, g: "ZJXB", name: `中转机械臂 ${m[1]}` }) },
  ]),
].sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));

// 消防与安全设施（生产楼各层）。
const floorOf = (name) => (/_(1F|2F|3F|副楼)$/.exec(name) || [])[1] || null;
const facilities = collect("L_Building2.glb", "xy-campus-core", [
  { pattern: /AQCK/, map: (m, name) => ({ kind: "exit", name: "安全出口", floor: floorOf(name) }) },
  { pattern: /xiaohuoshuan|XHS/, map: (m, name) => ({ kind: "hydrant", name: "消火栓", floor: floorOf(name) }) },
  { pattern: /XFBJQ|_BJQ_/, map: (m, name) => ({ kind: "alarm", name: "消防报警器", floor: floorOf(name) }) },
]);

const regions = Object.fromEntries([
  ...collect("L_Building2.glb", "xy-campus-core", [
    { pattern: /^生产楼$/, map: () => ({ id: "production" }) },
    { pattern: /^库区楼$/, map: () => ({ id: "warehouse" }) },
    { pattern: /^SM_huojia_01$/, map: () => ({ id: "racks" }) },
  ]),
  ...collect("L_shinei.glb", "xy-shinei", [{ pattern: /^SM_XY_ZZXA_YS2$/, map: () => ({ id: "assemblyFeeder" }) }]),
].map(({ id, min, max, center }) => [id, { min, max, center }]));

const counts = devices.reduce((map, d) => ({ ...map, [d.g]: (map[d.g] || 0) + 1 }), {});
// 拆楼（剖切）时隐藏的构件：生产楼隐藏高于设备层（1F 顶 16.8 m）的墙、顶、楼板；
// 库区楼是贯通高架库，只隐藏屋顶、光伏、外墙玻璃与附楼 3F 以上，保留货架与附楼 2F 作业层。
const shell = collect("L_Building2.glb", "xy-campus-core", [
  { pattern: /_生产楼_/, map: () => ({ b: "production" }) },
  { pattern: /^XYBK_Build05_01_guangfu/, map: () => ({ b: "production" }) },
  { pattern: /_库区楼_/, map: () => ({ b: "warehouse" }) },
]);
const cutaway = {
  production: shell.filter((n) => n.b === "production" && n.max[1] > 16.8).map((n) => n.nodeName),
  warehouse: shell.filter((n) => n.b === "warehouse" && (/屋顶|光伏|_SW_|WindowGlass|LOGO/.test(n.nodeName) || n.min[1] >= 22)).map((n) => n.nodeName),
};
fs.writeFileSync(out, `${JSON.stringify({ source: path.basename(path.dirname(modelsDir)), devices, facilities, regions, cutaway }, null, 1)}\n`);
console.log(`写入 ${path.relative(process.cwd(), out)}：设备 ${devices.length}（${Object.entries(counts).map(([g, n]) => `${g}×${n}`).join(" ")}），设施 ${facilities.length}，区域 ${Object.keys(regions).join("/")}，剖切 ${cutaway.production.length}+${cutaway.warehouse.length}`);
}

if (require.main === module) main();
module.exports = { readGlb, boxes };
