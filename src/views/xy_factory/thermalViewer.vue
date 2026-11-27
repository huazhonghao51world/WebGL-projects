<template>
  <div class="xy-mask" @click.self="$emit('close')">
    <div class="xy-thermal" role="dialog" :aria-label="`${def.name} 热成像`">
      <header>
        <div><strong>{{ def.name }} · 表面温度仿真</strong><small>{{ def.type }} · {{ def.note }} · 温度场直接映射在设备模型表面</small></div>
        <div class="ops">
          <button v-for="x in devices" :key="x.id" type="button" class="op" :class="{ primary: x.id === def.id }" @click="$emit('switch', x.id)">{{ x.type }}</button>
          <button type="button" class="op close" aria-label="关闭" title="关闭" @click="$emit('close')">✕</button>
        </div>
      </header>
      <div class="body">
        <div ref="stage" class="stage">
          <canvas ref="canvas" @pointerdown="onDown" @pointermove="onMove" @pointerup="drag = null" @wheel.prevent="onWheel" @contextmenu.prevent></canvas>
          <div class="legend"><b>{{ def.range[1] }} °C</b><i></i><b>{{ def.range[0] }} °C</b></div>
          <div v-for="z in zoneTags" :key="z.name" class="tag" :style="{ left: `${z.x}px`, top: `${z.y}px` }"><b>{{ z.temp }} °C</b><small>{{ z.name }}</small></div>
        </div>
        <aside>
          <div class="player">
            <button type="button" class="op primary" @click="playing = !playing">{{ playing ? '暂停' : '播放' }}</button>
            <input v-model.number="time" type="range" min="0" :max="def.period" step="0.1" aria-label="仿真时间" @input="playing = false" />
            <span>{{ time.toFixed(1) }} / {{ def.period }} s</span>
          </div>
          <dl class="stats">
            <div><dt>表面峰值</dt><dd class="hot">{{ stats.max }} °C</dd></div>
            <div><dt>表面均值</dt><dd>{{ stats.mean }} °C</dd></div>
            <div><dt>高温区占比</dt><dd>{{ stats.hot }} %</dd></div>
            <div><dt>采样顶点</dt><dd>{{ stats.points.toLocaleString() }}</dd></div>
          </dl>
          <h4>测温区域</h4>
          <ul>
            <li v-for="z in zoneTags" :key="z.name"><span>{{ z.name }}</span><b :style="{ color: z.color }">{{ z.temp }} °C</b></li>
          </ul>
          <p class="hint">数据：按工艺参数的解析温度场（VTK 点数据结构，每个模型顶点一个 Temperature 标量），接入真实仿真后替换即可。</p>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
import { thermalDevices, temperatureAt, turbo } from "./thermal";

// 设备热成像独立视窗：克隆设备模型，几何体复制一份并写入逐顶点温度色（不改主场景），材质换成热成像着色。
export default {
  name: "XYThermalViewer",
  props: { THREE: { type: Object, required: true }, source: { type: Object, required: true }, def: { type: Object, required: true }, region: { type: Object, default: null }, sceneRoot: { type: Object, default: null } },
  data: () => ({ devices: thermalDevices, playing: true, time: 0, stats: { max: 0, mean: 0, hot: 0, points: 0 }, zoneTags: [], drag: null }),
  mounted() { this.init(); },
  beforeDestroy() { this.dispose(); },
  methods: {
    init() {
      const T = this.THREE;
      const renderer = new T.WebGLRenderer({ canvas: this.$refs.canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.outputColorSpace = T.SRGBColorSpace;
      const scene = new T.Scene();
      scene.add(new T.HemisphereLight(0xffffff, 0x334155, 1.1));
      const key = new T.DirectionalLight(0xffffff, 1.2); key.position.set(4, 8, 6); scene.add(key);

      this.source.updateWorldMatrix(true, true);
      const box = new T.Box3().setFromObject(this.source);
      // 先收集几何（世界坐标），包围盒确定后再统一平移并计算相对坐标。
      const material = new T.MeshLambertMaterial({ vertexColors: true, side: T.DoubleSide });
      const meshes = [];
      const p = new T.Vector3();
      const pending = [];
      const addGeometry = (geometry, matrix) => {
        const g = new T.BufferGeometry();
        const src = geometry.attributes.position;
        const arr = new Float32Array(src.count * 3);
        for (let i = 0; i < src.count; i++) { arr[i * 3] = src.getX(i); arr[i * 3 + 1] = src.getY(i); arr[i * 3 + 2] = src.getZ(i); }
        g.setAttribute("position", new T.BufferAttribute(arr, 3));
        if (geometry.index) g.setIndex(geometry.index.clone());
        g.applyMatrix4(matrix);
        pending.push(g);
      };
      let min; let size; let center;
      const finalize = () => {
        min = box.min.clone(); size = box.getSize(new T.Vector3()); center = box.getCenter(new T.Vector3());
        pending.forEach((g) => {
          g.translate(-center.x, -min.y, -center.z);
          const pos = g.attributes.position;
          const rel = new Float32Array(pos.count * 3);
          for (let i = 0; i < pos.count; i++) {
            p.fromBufferAttribute(pos, i);
            rel[i * 3] = (p.x + center.x - min.x) / Math.max(size.x, 1e-3);
            rel[i * 3 + 1] = p.y / Math.max(size.y, 1e-3);
            rel[i * 3 + 2] = (p.z + center.z - min.z) / Math.max(size.z, 1e-3);
          }
          g.setAttribute("color", new T.BufferAttribute(new Float32Array(pos.count * 3), 3));
          g.computeVertexNormals();
          const mesh = new T.Mesh(g, material);
          scene.add(mesh);
          meshes.push({ mesh, rel });
        });
      };
      this.source.traverse((o) => {
        if (!o.isMesh || o.isInstancedMesh || (o.userData && o.userData.xyOverlay) || !o.geometry || !o.geometry.attributes.position) return;
        addGeometry(o.geometry, o.matrixWorld);
      });
      // 室内设备的大部分构件被场景组合批为 GPU 实例（不在设备节点下）：按台账包围盒收集落在设备内的实例一并映射。
      if (this.region && this.sceneRoot) {
        const inBox = new T.Box3(new T.Vector3(...this.region.min), new T.Vector3(...this.region.max)).expandByScalar(0.2);
        const m = new T.Matrix4(); const w = new T.Matrix4(); const c = new T.Vector3();
        this.sceneRoot.traverse((o) => {
          if (!o.isInstancedMesh || !o.visible || (o.userData && o.userData.xyOverlay) || !o.geometry.attributes.position) return;
          if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
          o.updateWorldMatrix(true, false);
          for (let i = 0; i < o.count; i++) {
            o.getMatrixAt(i, m);
            w.multiplyMatrices(o.matrixWorld, m);
            o.geometry.boundingBox.getCenter(c).applyMatrix4(w);
            if (inBox.containsPoint(c)) addGeometry(o.geometry, w);
          }
        });
      }
      if (this.region) { box.set(new T.Vector3(...this.region.min), new T.Vector3(...this.region.max)); }
      finalize();
      const grid = new T.GridHelper(Math.max(size.x, size.z) * 3, 30, 0x38bdf8, 0x1e3a5f);
      grid.material.transparent = true; grid.material.opacity = 0.3;
      scene.add(grid);
      const camera = new T.PerspectiveCamera(38, 1, 0.05, 500);
      const radius = size.length() * 1.15;
      Object.assign(this, { T, renderer, scene, camera, meshes, material, grid, size: size.toArray(), orbit: { theta: Math.PI / 4, phi: Math.PI / 2.8, radius, target: new T.Vector3(0, size.y / 2, 0) } });
      this.stats.points = meshes.reduce((t, m) => t + m.mesh.geometry.attributes.position.count, 0);
      this.resize();
      this.observer = new ResizeObserver(this.resize);
      this.observer.observe(this.$refs.stage);
      this.last = performance.now();
      this.applied = -1;
      const loop = () => { this.raf = requestAnimationFrame(loop); this.tick(); };
      loop();
    },
    resize() {
      const el = this.$refs.stage;
      if (!el || !this.renderer) return;
      this.renderer.setSize(el.clientWidth, el.clientHeight, false);
      this.camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
      this.camera.updateProjectionMatrix();
    },
    /** 把 t 秒的温度场写入每个顶点颜色，并统计峰值 / 均值 / 高温区。 */
    paint(t) {
      const { def } = this;
      // 热源按“长轴 = z”定义；模型长轴为 x 时交换水平两轴，热源落在真实的射台 / 模具位置。
      const swap = this.size[0] > this.size[2];
      const size = swap ? [this.size[2], this.size[1], this.size[0]] : this.size;
      const [lo, hi] = def.range;
      const hotLine = lo + (hi - lo) * 0.7;
      let max = -Infinity; let sum = 0; let n = 0; let hot = 0;
      const r = [0, 0, 0];
      this.meshes.forEach(({ mesh, rel }) => {
        const col = mesh.geometry.attributes.color;
        for (let i = 0; i < col.count; i++) {
          r[0] = rel[i * 3 + (swap ? 2 : 0)]; r[1] = rel[i * 3 + 1]; r[2] = rel[i * 3 + (swap ? 0 : 2)];
          const v = temperatureAt(def, r, size, t);
          const c = turbo((v - lo) / (hi - lo));
          col.setXYZ(i, c[0], c[1], c[2]);
          max = Math.max(max, v); sum += v; n += 1; if (v > hotLine) hot += 1;
        }
        col.needsUpdate = true;
      });
      this.stats = { ...this.stats, max: max.toFixed(1), mean: (sum / Math.max(n, 1)).toFixed(1), hot: ((hot / Math.max(n, 1)) * 100).toFixed(1) };
    },
    tick() {
      const now = performance.now();
      if (this.playing) this.time = (this.time + (now - this.last) / 1000) % this.def.period;
      this.last = now;
      // 温度场每 1 s 重算一次（性能优先）。
      const step = Math.floor(this.time);
      if (step !== this.applied) { this.applied = step; this.paint(this.time); }
      const { orbit, camera, T } = this;
      const s = Math.sin(orbit.phi);
      camera.position.set(orbit.target.x + orbit.radius * s * Math.cos(orbit.theta), orbit.target.y + orbit.radius * Math.cos(orbit.phi), orbit.target.z + orbit.radius * s * Math.sin(orbit.theta));
      camera.lookAt(orbit.target);
      this.renderer.render(this.scene, camera);
      const el = this.$refs.stage;
      const [lo, hi] = this.def.range;
      this.zoneTags = this.def.zones.map(([name, rel]) => {
        const swap = this.size[0] > this.size[2];
        const sz = swap ? [this.size[2], this.size[1], this.size[0]] : this.size;
        const wx = swap ? rel[2] : rel[0]; const wz = swap ? rel[0] : rel[2];
        const w = new T.Vector3((wx - 0.5) * this.size[0], rel[1] * this.size[1], (wz - 0.5) * this.size[2]).project(camera);
        const temp = temperatureAt(this.def, rel, sz, this.time);
        const c = turbo((temp - lo) / (hi - lo)).map((v) => Math.round(v * 255));
        return { name, temp: temp.toFixed(1), color: `rgb(${c.join(",")})`, x: ((w.x + 1) / 2) * el.clientWidth, y: ((1 - w.y) / 2) * el.clientHeight };
      });
    },
    onDown(e) { this.drag = { x: e.clientX, y: e.clientY, button: e.button }; e.target.setPointerCapture(e.pointerId); },
    onMove(e) {
      const d = this.drag;
      if (!d) return;
      const dx = e.clientX - d.x; const dy = e.clientY - d.y;
      d.x = e.clientX; d.y = e.clientY;
      const o = this.orbit;
      if (d.button === 0) { o.theta += dx * 0.008; o.phi = Math.min(Math.PI - 0.1, Math.max(0.1, o.phi - dy * 0.008)); return; }
      const right = new this.T.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0);
      const up = new this.T.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 1);
      o.target.addScaledVector(right, -dx * o.radius * 0.0015).addScaledVector(up, dy * o.radius * 0.0015);
    },
    onWheel(e) { this.orbit.radius = Math.min(80, Math.max(0.8, this.orbit.radius * (e.deltaY > 0 ? 1.12 : 0.89))); },
    dispose() {
      cancelAnimationFrame(this.raf);
      if (this.observer) this.observer.disconnect();
      // 几何体是本视窗复制的：全部释放；材质与网格辅助同样自建。
      (this.meshes || []).forEach(({ mesh }) => mesh.geometry.dispose());
      if (this.material) this.material.dispose();
      if (this.grid) { this.grid.geometry.dispose(); this.grid.material.dispose(); }
      if (this.scene) this.scene.clear();
      this.meshes = null; this.scene = null;
      if (this.renderer) { this.renderer.dispose(); this.renderer.forceContextLoss(); }
      this.renderer = null;
    },
  },
};
</script>

<style scoped>
.xy-thermal { display:flex; flex-direction:column; width:78vw; height:78vh; padding:14px 16px 16px; border:1px solid rgba(56,189,248,.35); border-radius:18px; background:rgba(11,18,32,.97); box-shadow:0 24px 60px rgba(2,6,23,.6); }
header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
header > div:first-child { flex:1; min-width:0; }
header strong { display:block; font:17px/1.3 "OPPOSans-B", sans-serif; color:#fff; }
header small { display:block; color:#94a3b8; font-size:12px; }
.ops { display:flex; align-items:center; gap:6px; }
.op { height:30px; padding:0 12px; border:1px solid rgba(255,255,255,.16); border-radius:8px; background:rgba(255,255,255,.05); color:#e2e8f0; font-size:12px; cursor:pointer; }
.op:hover { border-color:rgba(56,189,248,.6); background:rgba(56,189,248,.14); }
.op.primary { border-color:transparent; background:linear-gradient(135deg,#38bdf8,#6366f1); color:#fff; }
.op.close { width:30px; padding:0; color:#94a3b8; }
.op.close:hover { color:#fff; border-color:rgba(248,113,113,.6); background:rgba(248,113,113,.16); }
.body { flex:1; min-height:0; display:grid; grid-template-columns:minmax(0,1fr) 280px; gap:12px; }
.stage { position:relative; min-height:0; border-radius:12px; overflow:hidden; background:radial-gradient(circle at 50% 40%,#16263f,#070d18 75%); border:1px solid rgba(255,255,255,.08); }
.stage canvas { display:block; width:100%; height:100%; cursor:grab; }
.legend { position:absolute; right:14px; top:14px; bottom:14px; display:flex; flex-direction:column; align-items:center; gap:6px; font-size:11px; color:#e2e8f0; }
.legend i { flex:1; width:12px; border-radius:6px; background:linear-gradient(#7a0403,#fb8022,#e3d136,#3ff58f,#1ae4b6,#4686fb,#30123b); }
.tag { position:absolute; transform:translate(-50%,-50%); padding:3px 8px; border:1px solid rgba(255,255,255,.3); border-radius:6px; background:rgba(15,23,42,.85); pointer-events:none; white-space:nowrap; text-align:center; }
.tag b { display:block; color:#fff; font-size:12px; } .tag small { color:#94a3b8; font-size:10px; }
aside { min-height:0; overflow-y:auto; display:flex; flex-direction:column; gap:10px; }
.player { display:grid; grid-template-columns:auto 1fr; gap:6px 8px; align-items:center; }
.player input { width:100%; } .player span { grid-column:1 / -1; color:#94a3b8; font-size:12px; text-align:right; }
.stats { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:0; }
.stats div { padding:8px; border-radius:8px; background:rgba(255,255,255,.04); }
.stats dt { color:#94a3b8; font-size:11px; } .stats dd { margin:2px 0 0; color:#fff; font:16px "OPPOSans-M", sans-serif; } .stats dd.hot { color:#fb923c; }
h4 { margin:0; color:#e2e8f0; font:13px "OPPOSans-M", sans-serif; }
ul { list-style:none; margin:0; padding:0; display:grid; gap:4px; }
li { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:6px 10px; border-radius:8px; background:rgba(255,255,255,.04); font-size:12px; line-height:18px; color:#cbd5e1; }
li span { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:normal; }
li b { flex:none; font:13px "OPPOSans-M", sans-serif; }
.hint { margin:0; color:#64748b; font-size:11px; }
</style>
