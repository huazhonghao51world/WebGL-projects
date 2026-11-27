#!/usr/bin/env node
/*
 * 把 L_Prop.glb 里的纯镜头片段（SQ_1 园区总览、SQ_2 基地鸟瞰）烘焙成相机轨迹 src/views/xy_factory/flyovers.json。
 * 页面用相机巡航回放这些轨迹，不占用 SDK 唯一的动画通道，因此生产线持续运行时也能看“园区巡航”。
 *
 * 用法：node scripts/build-xy-flyovers.mjs [L_Prop.glb] [three 安装目录]
 * 动画通道经 EXT_meshopt_compression 压缩，需要 three 的 meshopt 解码器（默认取场景组工程 xy-source 的依赖）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const research = path.resolve(here, "../../threejs-twin-research/xy-versionpackage");
const glbPath = process.argv[2] || path.join(research, "xy-delivery-1.1.0/models/L_Prop.glb");
const threeDir = process.argv[3] || path.join(research, "xy-source/node_modules/three");
const out = path.resolve(here, "../src/views/xy_factory/flyovers.json");
const { MeshoptDecoder } = await import(pathToFileURL(path.join(threeDir, "examples/jsm/libs/meshopt_decoder.module.js")).href);
await MeshoptDecoder.ready;

const CLIPS = {
  overview: { clip: "SQ_1_zonglan_4", name: "园区巡航", desc: "入口大门、办公楼、研发楼、生产楼与库区楼全貌" },
  base: { clip: "SQ_2_jidi_3", name: "屋顶光伏巡航", desc: "沿生产楼、库区楼屋顶光伏俯瞰生产基地" },
};
const RATE = 5; // 采样频率（Hz），回放时线性插值

const file = fs.readFileSync(glbPath);
const jsonLength = file.readUInt32LE(12);
const gltf = JSON.parse(file.toString("utf8", 20, 20 + jsonLength));
const binStart = 20 + jsonLength + 8;
const bin = file.subarray(binStart, binStart + file.readUInt32LE(20 + jsonLength));

const views = new Map();
function bufferView(index) {
  if (views.has(index)) return views.get(index);
  const view = gltf.bufferViews[index];
  const meshopt = view.extensions && view.extensions.EXT_meshopt_compression;
  let bytes;
  if (meshopt) {
    bytes = new Uint8Array(meshopt.count * meshopt.byteStride);
    const source = bin.subarray(meshopt.byteOffset || 0, (meshopt.byteOffset || 0) + meshopt.byteLength);
    MeshoptDecoder.decodeGltfBuffer(bytes, meshopt.count, meshopt.byteStride, source, meshopt.mode, meshopt.filter);
  } else {
    bytes = bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
  }
  views.set(index, bytes);
  return bytes;
}
const SIZES = { SCALAR: 1, VEC3: 3, VEC4: 4 };
const TYPES = { 5126: [Float32Array, 1], 5122: [Int16Array, 32767], 5120: [Int8Array, 127], 5123: [Uint16Array, 65535], 5121: [Uint8Array, 255] };
function accessor(index) {
  const acc = gltf.accessors[index];
  const bytes = bufferView(acc.bufferView);
  const [Type, max] = TYPES[acc.componentType];
  const size = SIZES[acc.type];
  const stride = gltf.bufferViews[acc.bufferView].byteStride || (gltf.bufferViews[acc.bufferView].extensions?.EXT_meshopt_compression?.byteStride) || size * Type.BYTES_PER_ELEMENT;
  const out = [];
  for (let i = 0; i < acc.count; i++) {
    const view = new Type(bytes.buffer, bytes.byteOffset + (acc.byteOffset || 0) + i * stride, size);
    out.push(Array.from(view, (v) => (acc.normalized ? Math.max(v / max, -1) : v)));
  }
  return out;
}

function sampler(times, values, t, rotation) {
  if (t <= times[0]) return values[0];
  if (t >= times[times.length - 1]) return values[values.length - 1];
  let i = 1;
  while (times[i] < t) i++;
  const k = (t - times[i - 1]) / (times[i] - times[i - 1]);
  const a = values[i - 1];
  let b = values[i];
  if (rotation && a.reduce((s, v, j) => s + v * b[j], 0) < 0) b = b.map((v) => -v);
  const mix = a.map((v, j) => v + (b[j] - v) * k);
  if (!rotation) return mix;
  const n = Math.hypot(...mix);
  return mix.map((v) => v / n);
}
const rotate = ([x, y, z, w], [vx, vy, vz]) => {
  const ix = w * vx + y * vz - z * vy; const iy = w * vy + z * vx - x * vz; const iz = w * vz + x * vy - y * vx; const iw = -x * vx - y * vy - z * vz;
  return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x];
};
const r3 = (v) => v.map((x) => Math.round(x * 1000) / 1000);
function fovOf(nodeIndex) {
  const stack = [nodeIndex];
  while (stack.length) {
    const node = gltf.nodes[stack.pop()];
    if (node.camera !== undefined) return (gltf.cameras[node.camera].perspective.yfov * 180) / Math.PI;
    stack.push(...(node.children || []));
  }
  return 45;
}
/** Actor 到挂相机节点之间的静态子节点变换（导出器的坐标系修正通常在这里）。 */
function cameraChain(nodeIndex) {
  const walk = (index, chain) => {
    const node = gltf.nodes[index];
    if (node.camera !== undefined) return chain;
    for (const child of node.children || []) {
      const found = walk(child, [...chain, gltf.nodes[child]]);
      if (found) return found;
    }
    return null;
  };
  return walk(nodeIndex, []) || [];
}
const qmul = ([ax, ay, az, aw], [bx, by, bz, bw]) => [
  aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx,
  aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz,
];

const result = {};
for (const [id, def] of Object.entries(CLIPS)) {
  const anim = gltf.animations.find((a) => a.name === def.clip);
  if (!anim) throw new Error(`L_Prop 缺少片段 ${def.clip}`);
  const tracks = new Map();
  let duration = 0;
  for (const channel of anim.channels) {
    const s = anim.samplers[channel.sampler];
    const times = accessor(s.input).map((v) => v[0]);
    duration = Math.max(duration, times[times.length - 1]);
    if (!tracks.has(channel.target.node)) tracks.set(channel.target.node, {});
    tracks.get(channel.target.node)[channel.target.path] = { times, values: accessor(s.output) };
  }
  const cameras = [...tracks.entries()].filter(([index]) => /CineCameraActor/.test(gltf.nodes[index].name)).map(([index, track]) => {
    const node = gltf.nodes[index];
    const chain = cameraChain(index);
    const frames = [];
    for (let t = 0; t <= duration + 1e-6; t += 1 / RATE) {
      let p = track.translation ? sampler(track.translation.times, track.translation.values, t) : node.translation || [0, 0, 0];
      let q = track.rotation ? sampler(track.rotation.times, track.rotation.values, t, true) : node.rotation || [0, 0, 0, 1];
      for (const child of chain) {
        if (child.translation) p = p.map((v, i) => v + rotate(q, child.translation)[i]);
        if (child.rotation) q = qmul(q, child.rotation);
      }
      const forward = rotate(q, [0, 0, -1]);
      frames.push([...r3(p), ...r3(p.map((v, i) => v + forward[i] * 60))]);
    }
    // 镜头起始：该相机开始运动的时刻（与发布流程推断切镜的规则一致），用于没有发布切镜表时的兜底。
    const moving = frames.findIndex((f, i) => i > 0 && Math.hypot(f[0] - frames[i - 1][0], f[1] - frames[i - 1][1], f[2] - frames[i - 1][2]) > 1e-3);
    return { camera: node.name, fov: Math.round(fovOf(index) * 100) / 100, startMs: Math.max(0, moving - 1) * (1000 / RATE), frames };
  }).sort((a, b) => a.startMs - b.startMs);
  cameras[0].startMs = 0;
  result[id] = { ...def, durationMs: Math.round(duration * 1000), rate: RATE, cameras };
  console.log(`${id}: ${def.clip} ${duration.toFixed(1)} s，${cameras.map((c) => `${c.camera}@${(c.startMs / 1000).toFixed(1)}s fov${c.fov}`).join(" / ")}`);
}
fs.writeFileSync(out, `${JSON.stringify(result)}\n`);
console.log(`写入 ${path.relative(process.cwd(), out)}（${(fs.statSync(out).size / 1024).toFixed(0)} KB）`);
