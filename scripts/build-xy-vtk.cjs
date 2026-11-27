#!/usr/bin/env node
/*
 * XY 工厂 VTK 仿真演示数据（VTK legacy POLYDATA 时间步），输出到 public/xy/vtk/：
 *   cleanroom/  组装洁净区 1.35 m 高水平剖面：相对压差 Pressure（Pa）与气流 Velocity（m/s），
 *               模拟 10–30 s 打开洁净区门时门口压差跌破 10 Pa、关门后恢复。
 *   mold-f17/   注塑机 FANUC-17 针筒模具表面温度 Temperature（°C），一个 13.1 s 成型周期，
 *               右侧冷却水路流量偏低导致右半模偏热（对应其告警与节拍下降）。
 * 数值为基于工艺参数的解析近似，不是 CFD / 模流求解结果；接入真实仿真后替换同名文件即可。
 * 用法：node scripts/build-xy-vtk.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../public/xy/vtk");
const f = (v) => v.toFixed(4);

function writeCase(dir, title, fields, frames) {
  const target = path.join(root, dir);
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
  frames.forEach((frame, index) => fs.writeFileSync(path.join(target, frame.file), frame.text));
  const summary = { title, fields, frames: frames.map(({ file, time, stats }) => ({ frame: file, time, ...stats })) };
  fs.writeFileSync(path.join(target, "summary.json"), `${JSON.stringify(summary, null, 1)}\n`);
  console.log(`${dir}: ${frames.length} 帧`);
}

function polydata(caption, points, quads, scalars, vectors) {
  const lines = ["# vtk DataFile Version 3.0", caption, "ASCII", "DATASET POLYDATA", `POINTS ${points.length} float`];
  points.forEach((p) => lines.push(p.map(f).join(" ")));
  lines.push(`POLYGONS ${quads.length} ${quads.length * 5}`);
  quads.forEach((q) => lines.push(`4 ${q.join(" ")}`));
  lines.push(`POINT_DATA ${points.length}`);
  for (const [name, values] of Object.entries(scalars)) {
    lines.push(`SCALARS ${name} float 1`, "LOOKUP_TABLE default");
    values.forEach((v) => lines.push(v.toFixed(3)));
  }
  for (const [name, values] of Object.entries(vectors || {})) {
    lines.push(`VECTORS ${name} float`);
    values.forEach((v) => lines.push(v.map((c) => c.toFixed(4)).join(" ")));
  }
  return `${lines.join("\n")}\n`;
}

/* ---------------- 组装洁净区压差 / 气流 ---------------- */
// 局部原点 = 世界 (51, 15.0, -5)：覆盖组装线 A/B（x 51–78，z -5–9.5）；洁净区门 SM_MEN1/2 位于世界 (76.1, 9.9)，即局部 (25.1, 14.5) 边。
function cleanroom() {
  const step = 0.5;
  const nx = 55;
  const nz = 30;
  const points = [];
  for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) points.push([i * step, 0, k * step]);
  const quads = [];
  for (let k = 0; k < nz - 1; k++) for (let i = 0; i < nx - 1; i++) quads.push([k * nx + i, k * nx + i + 1, (k + 1) * nx + i + 1, (k + 1) * nx + i]);
  const door = [25.1, 14.5];
  const center = [13.5, 7.25];
  // 开门程度：10 s 开始开门，12 s 全开，28 s 开始关闭，30 s 关闭；关门后压差约 15 s 恢复。
  const opening = (t) => (t < 10 ? 0 : t < 12 ? (t - 10) / 2 : t < 28 ? 1 : t < 30 ? (30 - t) / 2 : 0);
  const recovery = (t) => (t < 30 ? 0 : Math.exp(-(t - 30) / 6));
  const frames = [];
  for (let n = 0; n <= 12; n++) {
    const t = n * 5;
    const open = Math.max(opening(t), recovery(t) * 0.7);
    const pressure = [];
    const velocity = [];
    points.forEach(([x, , z]) => {
      const r = Math.hypot((x - center[0]) / 13.5, (z - center[1]) / 7.25);
      const dDoor = Math.hypot(x - door[0], z - door[1]);
      const base = 15.5 - 2.6 * Math.min(1, r) ** 2;
      const dip = open * (6.8 * Math.exp(-(dDoor ** 2) / (2 * 3.2 ** 2)) + 1.6);
      pressure.push(base - dip);
      // 层流罩下送风在剖面上的水平分量向回风口（四周墙）发散；开门时洁净区正压向门口外泄。
      const ox = x - center[0];
      const oz = z - center[1];
      const len = Math.hypot(ox, oz) || 1;
      const drift = 0.06 + 0.12 * Math.min(1, r);
      const toDoor = [(door[0] - x) / (dDoor || 1), (door[1] - z) / (dDoor || 1)];
      const leak = open * 0.75 * Math.exp(-dDoor / 5);
      velocity.push([(ox / len) * drift + toDoor[0] * leak, -0.32, (oz / len) * drift + toDoor[1] * leak]);
    });
    const min = Math.min(...pressure);
    const mean = pressure.reduce((s, v) => s + v, 0) / pressure.length;
    const below = pressure.filter((v) => v < 10).length / pressure.length;
    frames.push({
      file: `frame_${String(n).padStart(2, "0")}.vtk`, time: t,
      stats: { minPressure: +min.toFixed(1), meanPressure: +mean.toFixed(1), belowLimitPct: +(below * 100).toFixed(1), door: opening(t) > 0 ? "开" : "关" },
      text: polydata(`XY cleanroom pressure t=${t}s`, points, quads, { Pressure: pressure }, { Velocity: velocity }),
    });
  }
  writeCase("cleanroom", "组装洁净区压差与气流（开门扰动 60 s）", {
    Pressure: { label: "相对压差", unit: "Pa", range: [4, 16], colorMap: "coolwarm" },
    Velocity: { label: "气流速度", unit: "m/s", range: [0, 0.8], colorMap: "viridis" },
  }, frames);
}

/* ---------------- FANUC-17 模具表面温度 ---------------- */
// 模具外形 0.9 × 0.8 × 0.55 m（x × y × z），局部原点在模具中心；分型面为 z = +0.275，32 腔（8 × 4）。
function mold() {
  const size = [0.9, 0.8, 0.55];
  const half = size.map((v) => v / 2);
  const n = 24;
  const points = [];
  const quads = [];
  const faces = [
    [2, +1, 0, 1], [2, -1, 0, 1], [0, +1, 2, 1], [0, -1, 2, 1], [1, +1, 0, 2], [1, -1, 0, 2],
  ];
  for (const [axis, sign, u, v] of faces) {
    const start = points.length;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const p = [0, 0, 0];
      p[axis] = sign * half[axis];
      p[u] = -half[u] + (size[u] * i) / n;
      p[v] = -half[v] + (size[v] * j) / n;
      points.push(p);
    }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) quads.push([start + j * (n + 1) + i, start + j * (n + 1) + i + 1, start + (j + 1) * (n + 1) + i + 1, start + (j + 1) * (n + 1) + i]);
  }
  const cavities = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) cavities.push([-0.35 + c * 0.1, -0.24 + r * 0.16]);
  const cycle = 13.1;
  // 腔壁温度响应：注射 0–1.2 s 升温，保压至 4 s，冷却至 11.4 s，开模顶出。
  const pulse = (t) => (t < 1.2 ? t / 1.2 : Math.exp(-(t - 1.2) / 3.4));
  const frames = [];
  const times = [0, 0.6, 1.2, 2.5, 4, 5.5, 7, 8.5, 10, 11.4, 12.4, 13.1];
  times.forEach((t, index) => {
    const temperature = points.map(([x, y, z]) => {
      const hotRight = x > 0.05 ? 7 + 5 * Math.min(1, (x - 0.05) / 0.35) : 0;
      const coolant = 38 + hotRight;
      const nearFace = Math.exp(-Math.max(0, half[2] - z) / 0.06);
      let cavity = 0;
      for (const [cx, cy] of cavities) cavity = Math.max(cavity, Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * 0.028 ** 2)));
      const surge = pulse(t % cycle) * (52 + hotRight * 1.6);
      return coolant + 14 * nearFace + cavity * nearFace * surge + (1 - nearFace) * 6 * pulse(t % cycle);
    });
    const left = temperature.filter((v, i) => points[i][0] < -0.05 && points[i][2] > half[2] - 0.001);
    const right = temperature.filter((v, i) => points[i][0] > 0.05 && points[i][2] > half[2] - 0.001);
    const avg = (list) => list.reduce((s, v) => s + v, 0) / list.length;
    frames.push({
      file: `frame_${String(index).padStart(2, "0")}.vtk`, time: t,
      stats: { maxTemperature: +Math.max(...temperature).toFixed(1), leftFace: +avg(left).toFixed(1), rightFace: +avg(right).toFixed(1) },
      text: polydata(`XY FANUC-17 mold t=${t}s`, points, quads, { Temperature: temperature }),
    });
  });
  writeCase("mold-f17", "FANUC-17 针筒模具表面温度（成型周期 13.1 s）", {
    Temperature: { label: "模具温度", unit: "°C", range: [36, 120], colorMap: "turbo" },
  }, frames);
}

/* ---------------- 典型设备热成像外壳（模温 / 料筒 / 油温 / 干燥） ---------------- */
// 网格贴合设备台账包围盒（局部原点 = 包围盒最小角，单位 m），六个面按内部热源求表面温度。
// sources：[位置（相对包围盒 0–1）、峰值温升、影响半径 m、周期响应（t → 0–1）]。
function thermalShell(dir, title, size, base, sources, times, range) {
  const n = 18;
  const points = [];
  const quads = [];
  const faces = [[2, 1, 0, 1], [2, 0, 0, 1], [0, 1, 2, 1], [0, 0, 2, 1], [1, 1, 0, 2], [1, 0, 0, 2]];
  for (const [axis, side, u, v] of faces) {
    const start = points.length;
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const p = [0, 0, 0];
      p[axis] = side * size[axis];
      p[u] = (size[u] * i) / n;
      p[v] = (size[v] * j) / n;
      points.push(p);
    }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) quads.push([start + j * (n + 1) + i, start + j * (n + 1) + i + 1, start + (j + 1) * (n + 1) + i + 1, start + (j + 1) * (n + 1) + i]);
  }
  const frames = times.map((t, index) => {
    const temperature = points.map((p) => sources.reduce((sum, [rel, amp, radius, wave]) => {
      const d = Math.hypot(...p.map((v, k) => v - rel[k] * size[k]));
      return sum + amp * wave(t) * Math.exp(-(d * d) / (2 * radius * radius));
    }, base));
    const sorted = [...temperature].sort((a, b) => a - b);
    return {
      file: `frame_${String(index).padStart(2, "0")}.vtk`, time: t,
      stats: { maxTemperature: +sorted[sorted.length - 1].toFixed(1), meanTemperature: +(sorted.reduce((s, v) => s + v, 0) / sorted.length).toFixed(1), hotPct: +((temperature.filter((v) => v > range[0] + (range[1] - range[0]) * 0.7).length / temperature.length) * 100).toFixed(1) },
      text: polydata(`XY ${dir} t=${t}s`, points, quads, { Temperature: temperature }),
    };
  });
  writeCase(dir, title, { Temperature: { label: "表面温度", unit: "°C", range, colorMap: "turbo" } }, frames);
}

function typicalDevices() {
  const steady = () => 1;
  const cycle = (period, rise) => (t) => { const x = t % period; return x < rise ? 0.55 + 0.45 * (x / rise) : 0.55 + 0.45 * Math.exp(-(x - rise) / (period * 0.3)); };
  const times12 = Array.from({ length: 12 }, (_, i) => +(i * 1.1).toFixed(1));
  // 注塑机长轴为 z：前端（z≈0.1）为合模 / 模具，后段（z 0.45–0.85）为射台料筒五段加热，底部后侧为液压油箱。
  // 注塑机 A（FANUC-13，针筒 32 腔）：正常运行，料筒 200–230 °C、模具 60–80 °C。
  thermalShell("zsj-a", "注塑机 A（FANUC-13）表面温度 · 正常运行", [2.7, 3.0, 6.5], 28, [
    [[0.5, 0.95, 0.48], 150, 0.35, steady], [[0.5, 0.95, 0.62], 175, 0.35, steady], [[0.5, 0.95, 0.76], 140, 0.35, steady],
    [[0.5, 0.9, 0.14], 60, 0.6, cycle(12.4, 1.2)], [[0.5, 0.15, 0.7], 14, 0.9, steady],
  ], times12, [25, 240]);
  // 注塑机 FANUC-17：料筒超温（241 °C）+ 右侧模具冷却水路流量偏低。
  thermalShell("zsj-f17", "注塑机 FANUC-17 表面温度 · 料筒超温 / 右半模偏热", [2.6, 3.0, 6.5], 28, [
    [[0.5, 0.95, 0.48], 168, 0.35, steady], [[0.5, 0.95, 0.62], 196, 0.38, steady], [[0.5, 0.95, 0.76], 150, 0.35, steady],
    [[0.92, 0.6, 0.14], 85, 0.55, cycle(13.1, 1.2)], [[0.08, 0.6, 0.14], 45, 0.5, cycle(13.1, 1.2)], [[0.5, 0.15, 0.7], 16, 0.9, steady],
  ], times12, [25, 240]);
  // 注塑机 ZHAFIR-03：液压油温超限停机，料筒降温中，油箱 / 泵站区域高温。
  thermalShell("zsj-z03", "注塑机 ZHAFIR-03 表面温度 · 液压油温超限（停机）", [2.9, 3.3, 7.2], 26, [
    [[0.5, 0.05, 0.72], 62, 0.8, steady], [[0.1, 0.25, 0.85], 40, 0.5, steady],
    [[0.5, 0.95, 0.62], 70, 0.45, (t) => Math.exp(-t / 30)],
  ], times12, [25, 240]);
  // 除湿干燥机 01：料斗 120 °C 再生加热，上部进风口最热，底部出料口降温。
  thermalShell("csgzj-01", "除湿干燥机 01 表面温度 · 料斗干燥 120 °C", [1.3, 2.8, 0.8], 30, [
    [[0.5, 0.92, 0.9], 95, 0.45, cycle(13.2, 4)], [[0.5, 0.55, 0.9], 70, 0.5, steady], [[0.2, 0.25, 0.5], 24, 0.4, steady],
  ], times12, [25, 140]);
}

cleanroom();
mold();
typicalDevices();
