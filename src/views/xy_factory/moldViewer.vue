<template>
  <div class="xy-mask" @click.self="$emit('close')">
    <div class="xy-mold" role="dialog" aria-label="模温仿真">
      <header>
        <div><strong>模温仿真 · {{ sim.name }}</strong><small>{{ sim.part }} · {{ sim.resin }} · {{ sim.cavities[0] * sim.cavities[1] }} 腔 · 熔体 {{ sim.melt }} °C · 顶出 ≤ {{ sim.eject }} °C</small></div>
        <div class="ops">
          <button v-for="s in sims" :key="s.id" type="button" class="op" :aria-pressed="s.id === sim.id" @click="$emit('switch', s.id)">{{ s.name.replace(/（.*）/, '') }}</button>
          <button type="button" class="op close" aria-label="关闭" @click="$emit('close')">✕</button>
        </div>
      </header>
      <div class="body">
        <section class="left">
          <div class="phase">
            <div class="track">
              <i v-for="p in phaseBars" :key="p.name" :class="p.cls" :style="{ width: `${p.w}%` }" :title="`${p.name} ${p.s} s`"><span>{{ p.name }} {{ p.s }}s</span></i>
              <b class="head" :style="{ left: `${(t / res.cycle) * 100}%` }"></b>
            </div>
            <div class="phase-ops">
              <button type="button" class="op primary" @click="playing = !playing">{{ playing ? '暂停' : '播放' }}</button>
              <span>周期内 {{ t.toFixed(1) }} / {{ res.cycle }} s · {{ phaseName }}</span>
            </div>
          </div>
          <div class="mold">
            <div class="half-label">动模（左，开模时后退） / 定模（右） · 型腔按温度着色 · 管道为冷却水路（色温=水温） · 左键旋转 / 滚轮缩放 / 点击型腔查看曲线</div>
            <div ref="stage" class="mold3d">
              <canvas ref="canvas" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @wheel.prevent="onWheel"></canvas>
              <div v-if="tag" class="cav-tag" :style="{ left: `${tag.x}px`, top: `${tag.y}px` }"><b>{{ tag.label }} · {{ tag.temp }} °C</b><small>{{ tag.circuit }} 回路 · 冷却 {{ tag.cool }} s</small></div>
            </div>
            <div class="scale"><span>{{ scale[0] }} °C</span><i></i><span>{{ scale[1] }} °C</span></div>
          </div>
          <div class="curve">
            <h4>型腔 {{ selCell.label }} 温度曲线<small>模具表面 / 制品平均 · 红线为顶出温度</small></h4>
            <XYChart :option="curveOption" :height="150" />
          </div>
        </section>
        <aside>
          <dl class="stats">
            <div><dt>成型周期</dt><dd :class="{ hot: res.cycle - res.ideal > 0.8 }">{{ res.cycle }} s</dd></div>
            <div><dt>冷却时间（最慢腔）</dt><dd>{{ res.coolTime }} s</dd></div>
            <div><dt>均衡后周期</dt><dd class="ok">{{ res.ideal }} s</dd></div>
            <div><dt>产能</dt><dd>{{ res.perHour.toLocaleString() }} 件/h</dd></div>
          </dl>
          <h4>冷却回路<small>设定 {{ setTemp }} °C</small></h4>
          <table>
            <thead><tr><th>回路</th><th>流量 L/min</th><th>出水 °C</th><th>Re</th><th>冷却 s</th></tr></thead>
            <tbody>
              <tr v-for="c in res.circuits" :key="c.id" :class="{ bad: c.flow < sim.nominalQ * 0.8 }">
                <td>{{ c.name }}</td>
                <td><input v-model.number="flowScale[c.id]" type="range" min="0.4" max="1.8" step="0.05" :aria-label="`${c.name}流量`" /><b>{{ c.flow }}</b></td>
                <td>{{ c.out }}</td><td :class="{ warn: !c.turbulent }">{{ (c.re / 1000).toFixed(1) }}k</td><td>{{ c.cool }}</td>
              </tr>
            </tbody>
          </table>
          <label class="set">模温机设定<input v-model.number="setTemp" type="range" :min="sim.setTemp - 15" :max="sim.setTemp + 20" step="1" /><b>{{ setTemp }} °C</b></label>
          <div class="ops-row"><button type="button" class="op" @click="balance">一键平衡回路</button><button type="button" class="op" @click="resetWhatIf">恢复现场值</button></div>
          <h4>诊断与建议</h4>
          <ul class="tips"><li v-for="(tip, i) in res.tips" :key="i">{{ tip }}</li></ul>
          <p class="hint">{{ sim.note }}</p>
          <p class="hint">模型：集总传热（τ∝Q<sup>-0.8</sup>，Dittus–Boelter），顶出判据 Tpart ≤ {{ sim.eject }} °C；用于工艺决策演示，接入 Moldflow / 模温机实测后替换参数。</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
// 模温仿真：注塑模具型腔温度场随成型周期的变化、冷却回路平衡与节拍分析（与“热成像”的设备外表面温度区分）。
import XYChart, { axisStyle } from "./chart.vue";
import { moldSims, solveMold, cavityTemp, partTemp } from "./moldSim";

const ramp = [[0, [48, 18, 59]], [0.2, [70, 134, 251]], [0.4, [26, 228, 182]], [0.6, [164, 252, 60]], [0.8, [251, 128, 34]], [1, [122, 4, 3]]];
function colorOf(v) {
  const x = Math.min(1, Math.max(0, v));
  const i = ramp.findIndex(([p]) => p >= x);
  if (i <= 0) return `rgb(${ramp[0][1].join(",")})`;
  const [p0, c0] = ramp[i - 1]; const [p1, c1] = ramp[i];
  const k = (x - p0) / (p1 - p0);
  return `rgb(${c0.map((c, j) => Math.round(c + (c1[j] - c) * k)).join(",")})`;
}

export default {
  name: "XYMoldViewer",
  components: { XYChart },
  props: { simId: { type: String, default: "" }, THREE: { type: Object, default: null }, renderer3d: { type: Object, default: null } },
  data() {
    const sim = moldSims.find((s) => s.id === this.simId) || moldSims[0];
    return { sims: moldSims, sim, setTemp: sim.setTemp, flowScale: Object.fromEntries(sim.circuits.map((c) => [c.id, 1])), t: 0, playing: true, sel: "", tag: null };
  },
  computed: {
    res() { return solveMold(this.sim, { setTemp: this.setTemp, flowScale: this.flowScale }); },
    scale() { return [this.setTemp, Math.round(this.res.cavities[0].peak + 6)]; },
    phaseBars() {
      const { fill, pack, open } = this.sim.phases;
      const c = this.res.cycle;
      return [["充填", fill, "fill"], ["保压", pack, "pack"], ["冷却", this.res.coolTime, "cool"], ["开模顶出", open, "open"]].map(([name, s, cls]) => ({ name, s: Number(s.toFixed(1)), cls, w: (s / c) * 100 }));
    },
    phaseName() {
      const { fill, pack } = this.sim.phases;
      return this.t <= fill ? "熔体充填" : this.t <= fill + pack ? "保压补缩" : this.t <= fill + pack + this.res.coolTime ? "冷却定型" : "开模顶出";
    },
    cells() {
      const [lo, hi] = this.scale;
      const slow = this.res.slowest;
      return this.res.cavities.map((c) => {
        const temp = cavityTemp(this.sim, c, this.t, this.res.cycle);
        return { ...c, key: `${c.r}-${c.c}`, label: `${String.fromCharCode(65 + c.r)}${c.c + 1}`, temp: Math.round(temp), cool: c.cool.toFixed(1), color: colorOf((temp - lo) / (hi - lo)), slow: c === slow };
      });
    },
    selCell() { return this.cells.find((c) => c.key === this.sel) || this.cells.find((c) => c.slow); },
    curveOption() {
      const cav = this.res.cavities.find((c) => `${c.r}-${c.c}` === this.selCell.key);
      const n = 60; const cyc = this.res.cycle;
      const xs = Array.from({ length: n + 1 }, (_, i) => (i / n) * cyc);
      return {
        grid: { left: 40, right: 12, top: 24, bottom: 22 }, legend: { right: 0, top: 0, textStyle: { color: "#cbd5e1", fontSize: 11 }, itemWidth: 10, itemHeight: 6 },
        tooltip: { trigger: "axis", valueFormatter: (v) => `${v} °C` },
        xAxis: { type: "category", data: xs.map((x) => x.toFixed(1)), boundaryGap: false, ...axisStyle, axisLabel: { ...axisStyle.axisLabel, interval: 9 } },
        yAxis: { type: "value", name: "°C", nameTextStyle: { color: "#94a3b8", fontSize: 10 }, ...axisStyle },
        series: [
          { name: "模具表面", type: "line", smooth: true, symbol: "none", data: xs.map((x) => +cavityTemp(this.sim, cav, x, cyc).toFixed(1)), lineStyle: { color: "#38bdf8", width: 2 } },
          { name: "制品平均", type: "line", smooth: true, symbol: "none", data: xs.map((x) => +partTemp(this.sim, cav, x).toFixed(1)), lineStyle: { color: "#fb923c", width: 2 },
            markLine: { silent: true, symbol: "none", data: [{ yAxis: this.sim.eject }], lineStyle: { color: "#ff5a4f", type: "dashed" }, label: { color: "#ff5a4f", formatter: "顶出" } } },
        ],
      };
    },
  },
  watch: { simId() { this.load(); this.build(); } },
  mounted() {
    this.init3d();
    let last = performance.now();
    const loop = (now) => {
      this.raf = requestAnimationFrame(loop);
      // 30 fps 刷新足够平滑，且不与主场景争抢主线程。
      if (now - last < 33) return;
      if (this.playing) this.t = (this.t + ((now - last) / 1000) * 0.8) % this.res.cycle;
      last = now;
      this.tick3d();
    };
    this.raf = requestAnimationFrame(loop);
  },
  beforeDestroy() { cancelAnimationFrame(this.raf); this.dispose3d(); },
  methods: {
    load() {
      this.sim = moldSims.find((s) => s.id === this.simId) || moldSims[0];
      this.setTemp = this.sim.setTemp;
      this.flowScale = Object.fromEntries(this.sim.circuits.map((c) => [c.id, 1]));
      this.t = 0; this.sel = "";
    },
    balance() { this.flowScale = Object.fromEntries(this.sim.circuits.map((c) => [c.id, Math.max(1, this.sim.nominalQ / c.flow)])); },
    resetWhatIf() { this.flowScale = Object.fromEntries(this.sim.circuits.map((c) => [c.id, 1])); this.setTemp = this.sim.setTemp; },

    /* ---------------- 三维模具模型（复用主渲染器绘制到本画布，不新建 WebGL 上下文） ---------------- */
    init3d() {
      const T = this.THREE;
      if (!T || !this.renderer3d) return;
      this.ctx2d = this.$refs.canvas.getContext("2d");
      const scene = new T.Scene();
      scene.add(new T.HemisphereLight(0xdbeafe, 0x1e293b, 1.5));
      const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(5, 8, 6); scene.add(key);
      const rim = new T.DirectionalLight(0x93c5fd, 1.0); rim.position.set(-6, 3, -5); scene.add(rim);
      const grid = new T.GridHelper(20, 20, 0x38bdf8, 0x1e3a5f); grid.material.transparent = true; grid.material.opacity = 0.25; grid.position.y = -2.2;
      scene.add(grid);
      const camera = new T.PerspectiveCamera(36, 1, 0.1, 200);
      Object.assign(this, { T, scene, camera, orbit: { theta: -1.05, phi: 1.2, radius: 13, target: new T.Vector3(0, 0, 0) } });
      this.build();
      this.resize3d();
      this.observer = new ResizeObserver(() => this.resize3d());
      this.observer.observe(this.$refs.stage);
    },
    /** 按型腔布局（行 × 列）生成：定模板 / 动模板、型腔镶件（按温度着色）、四路冷却水路、导柱。动模沿 x 方向开合。 */
    build() {
      const T = this.T;
      if (!T) return;
      if (this.mold) { this.scene.remove(this.mold); this.mold.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
      const [rows, cols] = this.sim.cavities;
      const pitch = 0.62;
      const W = cols * pitch + 0.9; const H = rows * pitch + 0.9; const D = 1.1;
      const mold = new T.Group();
      // 无环境贴图时高金属度会发黑，用低金属度 + 半透明模板让型腔与水路可见。
      const steel = (c, op) => new T.MeshStandardMaterial({ color: c, metalness: 0.25, roughness: 0.45, transparent: op != null, opacity: op == null ? 1 : op, depthWrite: op == null });
      // 定模（右）与动模（左）：中缝为分型面 x = 0。
      const fixed = new T.Group(); const moving = new T.Group();
      fixed.add(new T.Mesh(new T.BoxGeometry(D, H, W), steel(0x9fb3c8, 0.28))); fixed.children[0].position.x = D / 2;
      moving.add(new T.Mesh(new T.BoxGeometry(D, H, W), steel(0x8aa0b8, 0.28))); moving.children[0].position.x = -D / 2;
      // 底板（动模座板 / 定模座板）
      const clamp1 = new T.Mesh(new T.BoxGeometry(0.35, H + 0.7, W + 0.7), steel(0x64748b, 0.45)); clamp1.position.x = D + 0.175; fixed.add(clamp1);
      const clamp2 = new T.Mesh(new T.BoxGeometry(0.35, H + 0.7, W + 0.7), steel(0x64748b, 0.45)); clamp2.position.x = -D - 0.175; moving.add(clamp2);
      // 导柱（四角，固定在定模，穿过动模）
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => {
        const rod = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, D * 2 + 1.6, 20), steel(0xcbd5e1));
        rod.rotation.z = Math.PI / 2; rod.position.set(0.2, a * (H / 2 + 0.18), b * (W / 2 + 0.18)); fixed.add(rod);
      });
      // 型腔镶件：分型面两侧各一个（定模侧凹腔面、动模侧型芯面），颜色随型腔温度变化。
      this.cavMeshes = [];
      this.parts3d = [];
      const cavGeo = new T.CylinderGeometry(0.22, 0.22, 0.12, 28);
      this.res.cavities.forEach((cav) => {
        const y = (rows / 2 - cav.r - 0.5) * pitch; const z = (cav.c - cols / 2 + 0.5) * pitch;
        [fixed, moving].forEach((g, side) => {
          const m = new T.Mesh(cavGeo, new T.MeshStandardMaterial({ color: 0x888888, emissive: 0x000000, metalness: 0.3, roughness: 0.5 }));
          m.rotation.z = Math.PI / 2; m.position.set(side === 0 ? 0.055 : -0.055, y, z);
          m.userData.cavKey = `${cav.r}-${cav.c}`;
          g.add(m); this.cavMeshes.push(m);
        });
        // 制品（针筒 / 针帽）：开模顶出阶段从动模型芯上被顶出。
        const part = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, this.sim.part.includes("针帽") ? 0.35 : 0.7, 18), new T.MeshStandardMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.85, roughness: 0.3 }));
        part.rotation.z = Math.PI / 2; part.position.set(-0.4, y, z); part.visible = false;
        moving.add(part); this.parts3d.push(part);
      });
      // 冷却水路：每个回路一根管道，在所在模板内沿 z 方向穿过该回路的型腔排（中缝进、外侧出），每根管按出水温度着色。
      this.pipes = [];
      this.sim.circuits.forEach((c) => {
        const left = c.id[0] === "L"; const top = c.id[1] === "1";
        const g = top ? fixed : moving;
        const x = top ? D * 0.55 : -D * 0.55;
        const rowsOf = Array.from({ length: rows / 2 }, (_, i) => (top ? i : rows / 2 + i));
        const pts = [];
        rowsOf.forEach((r, k) => {
          const y = (rows / 2 - r - 0.5) * pitch;
          const zs = left ? [-0.1, -W / 2 + 0.25] : [0.1, W / 2 - 0.25];
          const [a, b] = k % 2 ? [zs[1], zs[0]] : zs;
          pts.push(new T.Vector3(x, y, a), new T.Vector3(x, y, b));
        });
        pts.unshift(new T.Vector3(x, pts[0].y + 0.001, 0)); pts.push(new T.Vector3(x, H / 2 + 0.6, pts[pts.length - 1].z));
        const path = new T.CurvePath(); for (let i = 1; i < pts.length; i++) path.add(new T.LineCurve3(pts[i - 1], pts[i]));
        const pipe = new T.Mesh(new T.TubeGeometry(path, pts.length * 8, 0.06, 10, false), new T.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0b3a5a, metalness: 0.2, roughness: 0.4, transparent: true, opacity: 0.95 }));
        pipe.userData.circuit = c.id;
        g.add(pipe); this.pipes.push(pipe);
      });
      // 模板做半透明，便于看到内部水路与型腔。
      [fixed.children[0], moving.children[0]].forEach((m) => { m.material.transparent = true; m.material.opacity = 0.42; m.material.depthWrite = false; });
      mold.add(fixed, moving);
      this.fixed = fixed; this.moving = moving; this.mold = mold;
      this.scene.add(mold);
      this.orbit.radius = Math.max(W, H) * 1.9 + 3;
    },
    tick3d() {
      const T = this.T;
      if (!T || !this.mold || !this.ctx2d) return;
      const [lo, hi] = this.scale;
      const byKey = new Map(this.cells.map((c) => [c.key, c]));
      this.cavMeshes.forEach((m) => {
        const c = byKey.get(m.userData.cavKey);
        const col = new T.Color(c.color);
        m.material.color.copy(col); m.material.emissive.copy(col).multiplyScalar(0.45);
        m.scale.setScalar(this.selCell && this.selCell.key === c.key ? 1.25 : 1);
      });
      const outOf = Object.fromEntries(this.res.circuits.map((c) => [c.id, c]));
      this.pipes.forEach((p) => {
        const c = outOf[p.userData.circuit];
        const warm = Math.min(1, (c.out - this.setTemp) / 1.2);
        p.material.color.setRGB(0.22 + warm * 0.75, 0.74 - warm * 0.35, 0.97 - warm * 0.8);
        p.material.emissive.copy(p.material.color).multiplyScalar(c.turbulent ? 0.25 : 0.55);
      });
      // 开模：开模顶出阶段动模后退 1.2 m，制品被顶出；其余阶段合模。
      const { fill, pack, open } = this.sim.phases;
      const tOpen = fill + pack + this.res.coolTime;
      const k = this.t < tOpen ? 0 : Math.sin(Math.min(1, (this.t - tOpen) / open) * Math.PI);
      this.moving.position.x = -1.2 * k;
      (this.parts3d || []).forEach((p) => { p.visible = k > 0.05; p.position.x = -0.4 + 0.25 * k; });
      const o = this.orbit; const s = Math.sin(o.phi);
      this.camera.position.set(o.target.x + o.radius * s * Math.cos(o.theta), o.target.y + o.radius * Math.cos(o.phi), o.target.z + o.radius * s * Math.sin(o.theta));
      this.camera.lookAt(o.target);
      this.draw3d();
      if (this.selCell) {
        const m = this.cavMeshes.find((x) => x.userData.cavKey === this.selCell.key && x.parent === this.fixed);
        if (m) {
          const p = m.getWorldPosition(new T.Vector3()).project(this.camera);
          const el = this.$refs.stage;
          this.tag = p.z > 1 ? null : { ...this.selCell, x: ((p.x + 1) / 2) * el.clientWidth, y: ((1 - p.y) / 2) * el.clientHeight };
        }
      }
    },
    resize3d() {
      const el = this.$refs.stage; const canvas = this.$refs.canvas;
      if (!el || !canvas || !this.camera) return;
      canvas.width = Math.max(1, el.clientWidth); canvas.height = Math.max(1, el.clientHeight);
      this.camera.aspect = canvas.width / canvas.height; this.camera.updateProjectionMatrix();
    },
    /** 用主渲染器在弹窗下方（被遮罩覆盖的区域）绘制后拷贝到本画布；渲染器状态全部还原。 */
    draw3d() {
      const { T, renderer3d: r, ctx2d } = this;
      const out = this.$refs.canvas; const main = r.domElement;
      if (!out || !main.width) return;
      const pr = r.getPixelRatio();
      const a = out.getBoundingClientRect(); const b = main.getBoundingClientRect();
      const w = Math.min(main.width, Math.round(out.width * pr)); const h = Math.min(main.height, Math.round(out.height * pr));
      const x = Math.min(main.width - w, Math.max(0, Math.round((a.left - b.left) * pr)));
      const yTop = Math.min(main.height - h, Math.max(0, Math.round((a.top - b.top) * pr)));
      const saved = { target: r.getRenderTarget(), viewport: r.getViewport(new T.Vector4()), scissor: r.getScissor(new T.Vector4()), scissorTest: r.getScissorTest(), color: r.getClearColor(new T.Color()), alpha: r.getClearAlpha(), autoClear: r.autoClear, shadowAuto: r.shadowMap.autoUpdate };
      try {
        r.setRenderTarget(null); r.shadowMap.autoUpdate = false; r.autoClear = false;
        const vx = x / pr; const vy = (main.height - yTop - h) / pr;
        r.setViewport(vx, vy, w / pr, h / pr); r.setScissor(vx, vy, w / pr, h / pr); r.setScissorTest(true);
        r.setClearColor(0x000000, 0); r.clear(true, true, false);
        r.render(this.scene, this.camera);
        ctx2d.clearRect(0, 0, out.width, out.height);
        ctx2d.drawImage(main, x, yTop, w, h, 0, 0, out.width, out.height);
      } finally {
        r.setScissorTest(saved.scissorTest); r.setScissor(saved.scissor); r.setViewport(saved.viewport);
        r.setClearColor(saved.color, saved.alpha); r.autoClear = saved.autoClear; r.shadowMap.autoUpdate = saved.shadowAuto; r.setRenderTarget(saved.target);
      }
    },
    onDown(e) { this.drag = { x: e.clientX, y: e.clientY, moved: 0 }; e.target.setPointerCapture(e.pointerId); },
    onMove(e) {
      const d = this.drag; if (!d) return;
      const dx = e.clientX - d.x; const dy = e.clientY - d.y;
      d.x = e.clientX; d.y = e.clientY; d.moved += Math.abs(dx) + Math.abs(dy);
      this.orbit.theta += dx * 0.008;
      this.orbit.phi = Math.min(Math.PI - 0.15, Math.max(0.15, this.orbit.phi - dy * 0.008));
    },
    onUp(e) {
      const d = this.drag; this.drag = null;
      if (!d || d.moved > 4 || !this.T) return;
      const T = this.T; const rect = this.$refs.canvas.getBoundingClientRect();
      const ray = new T.Raycaster();
      ray.setFromCamera(new T.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1), this.camera);
      const hit = ray.intersectObjects(this.cavMeshes, false)[0];
      if (hit) this.sel = hit.object.userData.cavKey;
    },
    onWheel(e) { this.orbit.radius = Math.min(60, Math.max(4, this.orbit.radius * (e.deltaY > 0 ? 1.1 : 0.9))); },
    dispose3d() {
      if (this.observer) this.observer.disconnect();
      if (this.scene) {
        this.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        this.scene.clear();
      }
      if (this.renderer3d) this.renderer3d.renderLists.dispose();
      this.scene = null; this.mold = null; this.ctx2d = null;
    },
  },
};
</script>

<style scoped>
.xy-mold { display:flex; flex-direction:column; width:min(1280px,86vw); height:min(820px,84vh); padding:14px 16px 16px; border:1px solid rgba(56,189,248,.35); border-radius:18px; background:rgba(11,18,32,.97); box-shadow:0 24px 60px rgba(2,6,23,.6); color:#cbd5e1; font-size:12px; }
header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
header > div:first-child { flex:1; min-width:0; }
header strong { display:block; font:17px/1.3 "OPPOSans-B", sans-serif; color:#fff; }
header small { display:block; color:#94a3b8; font-size:12px; }
.ops { display:flex; align-items:center; gap:6px; }
.op { height:28px; padding:0 12px; border:1px solid rgba(255,255,255,.16); border-radius:8px; background:rgba(255,255,255,.05); color:#e2e8f0; font-size:12px; cursor:pointer; }
.op:hover,.op[aria-pressed='true'] { border-color:rgba(56,189,248,.6); background:rgba(56,189,248,.16); color:#fff; }
.op.primary { border-color:transparent; background:linear-gradient(135deg,#38bdf8,#6366f1); color:#fff; }
.op.close { width:28px; padding:0; color:#94a3b8; }
.body { flex:1; min-height:0; display:grid; grid-template-columns:minmax(0,1fr) 380px; gap:14px; }
.left { min-height:0; display:flex; flex-direction:column; gap:10px; }
.phase .track { position:relative; display:flex; height:24px; border-radius:6px; overflow:hidden; background:rgba(255,255,255,.05); }
.phase .track i { display:flex; align-items:center; justify-content:center; font-style:normal; font-size:11px; line-height:24px; color:#06131f; white-space:nowrap; overflow:hidden; }
.phase .track i span { font-size:11px; }
.phase-ops { display:flex; align-items:center; gap:10px; margin-top:6px; color:#94a3b8; font-size:12px; }
.phase-ops span { font-size:12px; }
.phase .track .fill { background:#fb923c; } .phase .track .pack { background:#f5c451; } .phase .track .cool { background:#38bdf8; } .phase .track .open { background:#94a3b8; }
.phase .head { position:absolute; top:-2px; bottom:-2px; width:2px; background:#fff; box-shadow:0 0 6px #fff; }
.mold { flex:1; min-height:0; display:flex; flex-direction:column; gap:6px; padding:10px; border:1px solid rgba(255,255,255,.08); border-radius:12px; background:radial-gradient(circle at 50% 40%,#16263f,#070d18 75%); }
.mold3d { position:relative; flex:1; min-height:0; }
.mold3d canvas { display:block; width:100%; height:100%; cursor:grab; }
.cav-tag { position:absolute; transform:translate(-50%,calc(-100% - 14px)); padding:5px 9px; border:1px solid rgba(255,179,71,.6); border-radius:8px; background:rgba(15,23,42,.92); pointer-events:none; white-space:nowrap; }
.cav-tag b { display:block; color:#ffd59a; font-size:12px; } .cav-tag small { color:#94a3b8; font-size:11px; }
.half-label { color:#94a3b8; font-size:11px; }
.grid { flex:1; display:grid; gap:5px; align-content:stretch; position:relative; }
.cav { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:8px; border:1px solid rgba(255,255,255,.15); cursor:pointer; transition:background-color .15s linear; min-height:34px; }
.cav b { color:#fff; font:14px "OPPOSans-M", sans-serif; text-shadow:0 1px 2px rgba(0,0,0,.7); } .cav small { color:rgba(255,255,255,.8); font-size:10px; text-shadow:0 1px 2px rgba(0,0,0,.7); }
.cav.slow { box-shadow:inset 0 0 0 2px #ff5a4f; } .cav.sel { outline:2px solid #fff; outline-offset:1px; }
.scale { display:flex; align-items:center; gap:8px; color:#94a3b8; font-size:11px; } .scale span { font-size:11px; }
.scale i { flex:1; height:8px; border-radius:4px; background:linear-gradient(90deg,#30123b,#4686fb,#1ae4b6,#a4fc3c,#fb8022,#7a0403); }
.curve h4,aside h4 { display:flex; justify-content:space-between; align-items:baseline; margin:0 0 4px; color:#e2e8f0; font:13px "OPPOSans-M", sans-serif; }
.curve h4 small,aside h4 small { color:#94a3b8; font-size:11px; font-family:inherit; }
aside { min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:4px; }
.stats { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:0; }
.stats div { padding:8px 10px; border-radius:8px; background:rgba(255,255,255,.04); }
.stats dt { color:#94a3b8; font-size:11px; } .stats dd { margin:2px 0 0; color:#fff; font:17px "OPPOSans-M", sans-serif; }
.stats dd.hot { color:#fb923c; } .stats dd.ok { color:#4ade80; }
table { width:100%; border-collapse:collapse; font-size:11px; }
th { color:#94a3b8; font-weight:normal; text-align:left; padding:4px 3px; border-bottom:1px solid rgba(255,255,255,.08); }
td { padding:5px 3px; border-bottom:1px solid rgba(255,255,255,.05); color:#e2e8f0; white-space:nowrap; }
td input { width:64px; vertical-align:middle; } td b { display:inline-block; width:30px; margin-left:4px; font-weight:normal; text-align:right; }
tr.bad td:first-child { color:#ff5a4f; } td.warn { color:#f5c451; }
.set { display:flex; align-items:center; gap:8px; color:#94a3b8; } .set input { flex:1; } .set b { color:#fff; font-weight:normal; }
.ops-row { display:flex; gap:6px; }
.tips { margin:0; padding:0; list-style:none; display:grid; gap:4px; }
.tips li { padding:6px 8px; border-left:3px solid #f5c451; border-radius:4px; background:rgba(245,196,81,.08); line-height:1.5; }
.hint { margin:0; color:#64748b; font-size:11px; line-height:1.5; }
</style>
