// 自动出口：起点可达区域与室外区域之间，找到最接近目标方向、墙厚 ≤ 0.75 m 的位置作为安全出口；
// 路线 = 起点 →（A*，室内）→ 出口内侧 → 出口外侧 →（A*，室外）→ 集合点。
const fs = require("fs");
const raw = JSON.parse(fs.readFileSync("occ.json", "utf8")).result;
const { nx, nz, S, x0, z0 } = raw;
const occ = Buffer.from(raw.occ, "base64");
const R = 1;
const grown = new Uint8Array(occ.length);
for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) if (occ[k * nx + i]) for (let a = -R; a <= R; a++) for (let b = -R; b <= R; b++) { const x = i + b, y = k + a; if (x >= 0 && y >= 0 && x < nx && y < nz) grown[y * nx + x] = 1; }
const free = (i, k) => i >= 0 && k >= 0 && i < nx && k < nz && !grown[k * nx + i];
const cell = (p) => [Math.floor((p[0] - x0) / S), Math.floor((p[1] - z0) / S)];
const W = (i) => +(x0 + (i + 0.5) * S).toFixed(1), Zc = (k) => +(z0 + (k + 0.5) * S).toFixed(1);
function flood(start) { const vis = new Uint8Array(occ.length); const q = [start]; while (q.length) { const [i, k] = q.pop(); if (!free(i, k) || vis[k * nx + i]) continue; vis[k * nx + i] = 1; q.push([i + 1, k], [i - 1, k], [i, k + 1], [i, k - 1]); } return vis; }
const outside = flood(cell([-49, 29]));
function nearestFree(c) { for (let r = 0; r < 40; r++) for (let dk = -r; dk <= r; dk++) for (let di = -r; di <= r; di++) if (free(c[0] + di, c[1] + dk)) return [c[0] + di, c[1] + dk]; return c; }
const clearLine = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2) + 1; for (let j = 0; j <= n; j++) { const i = Math.round(a[0] + (b[0] - a[0]) * j / n), k = Math.round(a[1] + (b[1] - a[1]) * j / n); if (!free(i, k)) return false; } return true; };
function astar(s, g0) {
  const N = nx * nz, g = new Float32Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), heap = [], closed = new Uint8Array(N);
  const push = (f, n) => { heap.push([f, n]); let c = heap.length - 1; while (c > 0) { const p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; [heap[p], heap[c]] = [heap[c], heap[p]]; c = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let c = 0; for (;;) { const l = 2 * c + 1, r = l + 1; let m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
  const si = s[1] * nx + s[0], goal = g0[1] * nx + g0[0]; g[si] = 0; push(0, si);
  const dirs = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
  while (heap.length) {
    const [, n] = pop(); if (n === goal) break; if (closed[n]) continue; closed[n] = 1;
    const i = n % nx, k = (n / nx) | 0;
    for (const [di, dk, c] of dirs) { const a2 = i + di, b2 = k + dk; if (!free(a2, b2)) continue; if (di && dk && (!free(i + di, k) || !free(i, k + dk))) continue; const m = b2 * nx + a2, ng = g[n] + c; if (ng < g[m]) { g[m] = ng; prev[m] = n; push(ng + Math.hypot(a2 - g0[0], b2 - g0[1]), m); } }
  }
  if (g[goal] === Infinity) return null;
  const p = []; for (let n = goal; n !== -1; n = prev[n]) p.unshift([n % nx, (n / nx) | 0]);
  const out = [p[0]]; let st = 0;
  while (st < p.length - 1) { let e = st + 1; while (e + 1 < p.length && clearLine(p[st], p[e + 1])) e++; out.push(p[e]); st = e; }
  return out;
}
const plans = JSON.parse(fs.readFileSync("routes.json", "utf8"));
const img = Buffer.alloc(nx * nz * 3, 255);
for (let n = 0; n < occ.length; n++) { if (grown[n]) img.fill(200, n * 3, n * 3 + 3); if (occ[n]) img.fill(0, n * 3, n * 3 + 3); }
const cols = [[230, 40, 40], [40, 170, 40], [40, 80, 230], [220, 140, 0], [170, 0, 200], [0, 160, 160], [120, 70, 0]];
const draw = (pts, col) => { for (let j = 0; j < pts.length - 1; j++) { const [a, b] = [pts[j], pts[j + 1]]; const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])) + 1; for (let t = 0; t <= n; t++) { const i = Math.round(a[0] + (b[0] - a[0]) * t / n), k = Math.round(a[1] + (b[1] - a[1]) * t / n); for (let d = -1; d <= 1; d++) for (let e = -1; e <= 1; e++) { const q = (k + e) * nx + (i + d); if (q >= 0 && q < occ.length) img.set(col, q * 3); } } } };
const result = plans.map((r, ri) => {
  const s = nearestFree(cell(r.from));
  const inside = flood(s);
  const want = cell(r.exitNear);
  // 墙两侧：inside 点 a 与 outside 点 b，沿 4 个轴向距离 ≤ 6 格（1.5 m，含膨胀），取离 exitNear 最近者。
  let best = null;
  for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) {
    if (!inside[k * nx + i]) continue;
    for (const [di, dk] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      for (let st = 2; st <= 7; st++) {
        const a = i + di * st, b = k + dk * st;
        if (a < 0 || b < 0 || a >= nx || b >= nz) break;
        if (outside[b * nx + a]) { const d = Math.hypot(i - want[0], k - want[1]); if (!best || d < best.d) best = { d, inn: [i, k], out: [a, b] }; break; }
        if (inside[b * nx + a]) break;
      }
    }
  }
  if (!best || best.d * S > (r.maxExit || 4)) return { name: r.name, fail: "no-exit", near: best && [W(best.out[0]), Zc(best.out[1]), +(best.d * S).toFixed(1)] };
  const p1 = astar(s, best.inn);
  const p2 = astar(best.out, nearestFree(cell(r.assembly)));
  if (!p1 || !p2) return { name: r.name, fail: "path" };
  const all = [...p1, ...p2];
  draw(all, cols[ri % cols.length]);
  const pts = all.map((q) => [W(q[0]), Zc(q[1])]);
  return { name: r.name, exit: [W(best.out[0]), Zc(best.out[1])], exitIn: [W(best.inn[0]), Zc(best.inn[1])], pts };
});
fs.writeFileSync("evac.ppm", Buffer.concat([Buffer.from(`P6 ${nx} ${nz} 255\n`), img]));
console.log(JSON.stringify(result));
