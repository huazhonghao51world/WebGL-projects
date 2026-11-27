<template>
  <div class="xy-mask" @click.self="$emit('close')">
    <div class="xy-explode" role="dialog" :aria-label="`${device.name} 拆解`">
      <header>
        <div><strong>{{ device.name }} · 部件拆解</strong><small>{{ device.id }} · 独立视窗，不影响主场景 · 左键旋转 / 右键平移 / 滚轮缩放 / 点击构件查看</small></div>
        <div class="ops">
          <button type="button" class="op primary" @click="toggle">{{ exploded ? '复原' : '拆解' }}</button>
          <button type="button" class="op" @click="frame">重置视角</button>
          <button type="button" class="op close" aria-label="关闭" title="关闭" @click="$emit('close')">✕</button>
        </div>
      </header>
      <div class="body">
        <div ref="stage" class="stage">
          <canvas ref="canvas" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @wheel.prevent="onWheel" @contextmenu.prevent></canvas>
          <div v-if="tag" class="tag" :style="{ left: `${tag.x}px`, top: `${tag.y}px` }"><b>{{ tag.title }}</b><small>{{ tag.node }}</small></div>
          <p v-if="!count" class="empty">该设备为整体模型，无独立构件可拆解</p>
        </div>
        <aside>
          <section v-if="selected" class="detail">
            <h4>{{ selected.title }}</h4>
            <dl>
              <dt>构件</dt><dd :title="selected.node">{{ selected.node }}</dd>
              <dt>尺寸</dt><dd>{{ selected.size }}</dd>
              <dt>序号</dt><dd>{{ selected.index + 1 }} / {{ count }}</dd>
              <dt>状态</dt><dd :class="{ bad: selected.status !== '正常' }">{{ selected.status }}</dd>
            </dl>
            <p v-if="selected.detail">{{ selected.detail }}</p>
          </section>
          <h4>结构大纲<small>{{ count }} 个构件</small></h4>
          <ul class="tree">
            <template v-for="row in treeRows">
              <li v-if="row.group" :key="row.key" class="grp" :style="{ paddingLeft: `${8 + row.depth * 14}px` }" @click="toggleNode(row.key)">
                <i class="caret" :class="{ open: !closed[row.key] }">▸</i><b>{{ row.title }}</b><small>{{ row.count }}</small>
              </li>
              <li v-else :key="row.key" class="leaf" :class="{ on: selected && selected.index === row.index, bad: row.status !== '正常' }" :style="{ paddingLeft: `${22 + row.depth * 14}px` }" @click="select(row.index)">
                <b>{{ row.title }}</b><em>{{ row.status }}</em><small>{{ row.node }}</small>
              </li>
            </template>
          </ul>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
// 设备拆解独立视窗：克隆主场景中的设备节点（共享几何与材质，不修改主场景），在独立渲染器里展示爆炸拆解与构件详情。
export default {
  name: "XYExplodeViewer",
  props: { THREE: { type: Object, required: true }, renderer3d: { type: Object, required: true }, source: { type: Object, required: true }, device: { type: Object, required: true }, namePart: { type: Function, required: true } },
  data: () => ({ exploded: false, list: [], selected: null, tag: null, count: 0, tree: null, closed: {} }),
  computed: {
    /** 大纲：模型节点层级 → 设备 / 子装配 / 构件；只有一层（合并网格）时按业务部件归组，组内为具体构件。 */
    treeRows() {
      const rows = [];
      const walk = (node, depth) => {
        if (node.index != null) { rows.push({ ...this.list[node.index], key: `p${node.index}`, index: node.index, depth }); return; }
        rows.push({ group: true, key: node.key, title: node.title, count: node.count, depth });
        if (!this.closed[node.key]) node.children.forEach((c) => walk(c, depth + 1));
      };
      if (this.tree) walk(this.tree, 0);
      return rows;
    },
  },
  mounted() { this.init(); },
  beforeDestroy() { this.dispose(); },
  methods: {
    init() {
      const T = this.THREE;
      const canvas = this.$refs.canvas;
      // 不新建 WebGL 上下文：第二个上下文会把共享的几何 / 材质 / 贴图重新上传、重新编译着色器，关闭时 forceContextLoss 还会让
      // GPU 进程重建资源，主场景随后 10 s 内掉到个位数。改为复用主渲染器（弹窗期间主循环已暂停），在弹窗下方区域绘制后拷贝到本画布。
      const renderer = this.renderer3d;
      this.ctx2d = canvas.getContext("2d");
      const scene = new T.Scene();
      scene.add(new T.HemisphereLight(0xdbeafe, 0x1e293b, 1.6));
      const key = new T.DirectionalLight(0xffffff, 2.4); key.position.set(4, 8, 6); scene.add(key);
      const rim = new T.DirectionalLight(0x93c5fd, 1.2); rim.position.set(-6, 4, -5); scene.add(rim);
      const grid = new T.GridHelper(40, 40, 0x38bdf8, 0x1e3a5f);
      grid.material.transparent = true; grid.material.opacity = 0.35;
      scene.add(grid);

      this.source.updateWorldMatrix(true, true);
      const clone = this.source.clone(true);
      const overlays = [];
      clone.traverse((o) => { if (o.userData && o.userData.xyOverlay) overlays.push(o); });
      overlays.forEach((o) => o.removeFromParent());
      this.source.matrixWorld.decompose(clone.position, clone.quaternion, clone.scale);
      const root = new T.Group();
      root.add(clone);
      clone.traverse((o) => { o.visible = true; o.matrixAutoUpdate = true; if (o.isMesh) { o.frustumCulled = false; o.raycast = T.Mesh.prototype.raycast; } });
      root.updateWorldMatrix(true, true);
      const box = new T.Box3().setFromObject(clone);
      const center = box.getCenter(new T.Vector3());
      clone.position.sub(new T.Vector3(center.x, box.min.y, center.z));
      scene.add(root);
      root.updateWorldMatrix(true, true);
      grid.position.y = 0;

      const meshes = [];
      clone.traverse((o) => { if (o.isMesh && !o.isInstancedMesh) meshes.push(o); });
      const whole = new T.Box3().setFromObject(clone);
      const mid = whole.getCenter(new T.Vector3());
      const size = whole.getSize(new T.Vector3());
      const span = Math.max(size.x, size.z, 1);
      this.parts = meshes.map((mesh) => {
        const b = new T.Box3().setFromObject(mesh);
        const c = b.getCenter(new T.Vector3());
        const dir = c.clone().sub(mid);
        dir.y = Math.max(0, dir.y) * 0.6;
        if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0);
        const move = dir.normalize().multiplyScalar(span * 0.45).add(new T.Vector3(0, Math.min(size.y * 0.2, 1.5), 0));
        if (b.min.y + move.y < 0.02) move.y += 0.02 - (b.min.y + move.y);
        const local = mesh.parent.worldToLocal(mesh.getWorldPosition(new T.Vector3()).add(move)).sub(mesh.position);
        return { mesh, from: mesh.position.clone(), offset: local };
      });
      this.count = meshes.length >= 3 ? meshes.length : 0;
      const seen = {};
      this.list = this.parts.map((p, i) => {
        const node = p.mesh.name || (p.mesh.parent && p.mesh.parent.name) || `构件 ${i + 1}`;
        const part = this.namePart(node);
        seen[part.name] = (seen[part.name] || 0) + 1;
        return { title: `${part.name} ${String(seen[part.name]).padStart(2, "0")}`, node, status: part.status || "正常", detail: part.reason || part.detail || "" };
      });
      if (!this.count) this.list = [];
      this.tree = this.buildTree(clone);

      const camera = new T.PerspectiveCamera(40, 1, 0.05, 500);
      Object.assign(this, { T, renderer, scene, camera, clone, span, height: size.y, k: 0, goal: 0 });
      this.orbit = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 1, target: new T.Vector3(0, size.y / 2, 0) };
      this.frame();
      this.resize();
      this.observer = new ResizeObserver(this.resize);
      this.observer.observe(this.$refs.stage);
      const loop = () => { this.raf = requestAnimationFrame(loop); this.tick(); };
      loop();
      if (this.count) setTimeout(() => { if (!this.exploded) this.toggle(); }, 400);
    },
    resize() {
      const el = this.$refs.stage;
      if (!el || !this.renderer) return;
      const canvas = this.$refs.canvas;
      canvas.width = Math.max(1, el.clientWidth);
      canvas.height = Math.max(1, el.clientHeight);
      this.camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
      this.camera.updateProjectionMatrix();
    },
    frame() {
      const T = this.T;
      // 按拆开后的整体包围球取景（拆开 / 复原都在画内，切换时无需移动镜头）；高大设备（堆垛机 16 m）也能完整入画。
      const box = new T.Box3();
      const k = 1;
      (this.parts || []).forEach(({ mesh, from, offset }) => {
        const now = mesh.position.clone();
        mesh.position.copy(from).addScaledVector(offset, k);
        mesh.updateWorldMatrix(true, false);
        box.expandByObject(mesh);
        mesh.position.copy(now);
        mesh.updateWorldMatrix(true, false);
      });
      if (box.isEmpty()) box.setFromObject(this.clone);
      const sphere = box.getBoundingSphere(new T.Sphere());
      const aspect = this.camera ? this.camera.aspect : 1.6;
      const fov = T.MathUtils.degToRad(40) / 2;
      const fit = Math.min(fov, Math.atan(Math.tan(fov) * aspect));
      this.orbit.radius = (sphere.radius / Math.sin(fit)) * 1.05;
      this.orbit.target.copy(sphere.center);
      this.orbit.theta = Math.PI / 4;
      this.orbit.phi = Math.PI / 2.6;
    },
    toggleNode(key) { this.$set(this.closed, key, !this.closed[key]); },
    buildTree(clone) {
      if (!this.count) return null;
      const meshIndex = new Map(this.parts.map((p, i) => [p.mesh, i]));
      let seq = 0;
      const label = (o) => o.name || `节点 ${seq}`;
      const build = (o) => {
        if (meshIndex.has(o) && !o.children.some((c) => c.isMesh)) return { index: meshIndex.get(o) };
        const children = o.children.map(build).filter(Boolean);
        if (meshIndex.has(o)) children.unshift({ index: meshIndex.get(o) });
        if (!children.length) return null;
        // 单子节点的中间层合并，大纲不出现空壳层级。
        if (children.length === 1 && o !== clone) return children[0];
        seq += 1;
        const count = children.reduce((t, c) => t + (c.index != null ? 1 : c.count), 0);
        return { key: `g${seq}`, title: label(o), children, count };
      };
      const root = build(clone) || { key: "g0", title: this.device.name, children: [], count: 0 };
      root.title = this.device.name;
      // 节点层级扁平（全部构件直接挂在设备下）时：按业务部件分组，形成“设备 → 部件 → 构件”三级大纲。
      if (root.children && root.children.every((c) => c.index != null) && root.children.length > 6) {
        const groups = new Map();
        root.children.forEach((c) => {
          const name = this.list[c.index].title.replace(/\s\d+$/, "");
          if (!groups.has(name)) groups.set(name, []);
          groups.get(name).push(c);
        });
        root.children = [...groups].map(([name, items], i) => ({ key: `b${i}`, title: name, children: items, count: items.length }));
        root.children.forEach((g) => { this.$set(this.closed, g.key, true); });
      }
      return root;
    },
    toggle() {
      if (!this.count) return;
      // 拆解 / 复原只驱动构件位移，保持用户当前视角（不重置镜头）。
      this.exploded = !this.exploded;
      this.goal = this.exploded ? 1 : 0;
    },
    tick() {
      const { T, orbit, camera } = this;
      if (this.k !== this.goal) {
        this.k += Math.sign(this.goal - this.k) * Math.min(Math.abs(this.goal - this.k), 0.035);
        const e = 1 - (1 - this.k) ** 3;
        this.parts.forEach(({ mesh, from, offset }) => mesh.position.copy(from).addScaledVector(offset, e));
      }
      const s = Math.sin(orbit.phi);
      camera.position.set(orbit.target.x + orbit.radius * s * Math.cos(orbit.theta), orbit.target.y + orbit.radius * Math.cos(orbit.phi), orbit.target.z + orbit.radius * s * Math.sin(orbit.theta));
      camera.lookAt(orbit.target);
      this.draw();
      if (this.selected) {
        const b = new T.Box3().setFromObject(this.parts[this.selected.index].mesh);
        const p = new T.Vector3((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2).project(camera);
        const el = this.$refs.stage;
        this.tag = p.z > 1 ? null : { title: this.selected.title, node: this.selected.node, x: ((p.x + 1) / 2) * el.clientWidth, y: ((1 - p.y) / 2) * el.clientHeight };
      }
    },
    /** 用主渲染器在“弹窗画布正下方”的区域绘制（被不透明弹窗遮住），同一任务内拷贝到本画布；渲染器状态全部还原。 */
    draw() {
      const { T, renderer: r, ctx2d } = this;
      const out = this.$refs.canvas;
      const main = r.domElement;
      if (!ctx2d || !out || !main.width) return;
      const pr = r.getPixelRatio();
      const a = out.getBoundingClientRect();
      const b = main.getBoundingClientRect();
      const w = Math.min(main.width, Math.round(out.width * pr));
      const h = Math.min(main.height, Math.round(out.height * pr));
      const x = Math.min(main.width - w, Math.max(0, Math.round((a.left - b.left) * pr)));
      const yTop = Math.min(main.height - h, Math.max(0, Math.round((a.top - b.top) * pr)));
      const saved = { target: r.getRenderTarget(), viewport: r.getViewport(new T.Vector4()), scissor: r.getScissor(new T.Vector4()), scissorTest: r.getScissorTest(), color: r.getClearColor(new T.Color()), alpha: r.getClearAlpha(), autoClear: r.autoClear, exposure: r.toneMappingExposure, shadowAuto: r.shadowMap.autoUpdate };
      try {
        r.setRenderTarget(null);
        r.shadowMap.autoUpdate = false;
        r.toneMappingExposure = 1.1;
        r.autoClear = false;
        // setViewport / setScissor 以 CSS 像素计，原点在左下。
        const vx = x / pr; const vy = (main.height - yTop - h) / pr;
        r.setViewport(vx, vy, w / pr, h / pr);
        r.setScissor(vx, vy, w / pr, h / pr);
        r.setScissorTest(true);
        r.setClearColor(0x000000, 0);
        r.clear(true, true, false);
        r.render(this.scene, this.camera);
        ctx2d.clearRect(0, 0, out.width, out.height);
        ctx2d.drawImage(main, x, yTop, w, h, 0, 0, out.width, out.height);
      } finally {
        r.setScissorTest(saved.scissorTest);
        r.setScissor(saved.scissor);
        r.setViewport(saved.viewport);
        r.setClearColor(saved.color, saved.alpha);
        r.autoClear = saved.autoClear;
        r.toneMappingExposure = saved.exposure;
        r.shadowMap.autoUpdate = saved.shadowAuto;
        r.setRenderTarget(saved.target);
      }
    },
    onDown(e) { this.drag = { x: e.clientX, y: e.clientY, button: e.button, moved: 0 }; e.target.setPointerCapture(e.pointerId); },
    onMove(e) {
      const d = this.drag;
      if (!d) return;
      const dx = e.clientX - d.x; const dy = e.clientY - d.y;
      d.x = e.clientX; d.y = e.clientY; d.moved += Math.abs(dx) + Math.abs(dy);
      const o = this.orbit;
      if (d.button === 0) {
        o.theta += dx * 0.008;
        o.phi = Math.min(Math.PI / 2 - 0.02, Math.max(0.12, o.phi - dy * 0.008));
      } else {
        const T = this.T;
        const right = new T.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0);
        const up = new T.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 1);
        const k = o.radius * 0.0015;
        o.target.addScaledVector(right, -dx * k).addScaledVector(up, dy * k);
      }
    },
    onUp(e) {
      const d = this.drag;
      this.drag = null;
      if (!d || d.button !== 0 || d.moved > 4 || !this.count) return;
      const T = this.T;
      const rect = this.$refs.canvas.getBoundingClientRect();
      const ndc = new T.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const ray = new T.Raycaster();
      ray.setFromCamera(ndc, this.camera);
      let best = null;
      this.parts.forEach((p, i) => {
        const mats = [].concat(p.mesh.material);
        const sides = mats.map((m) => m.side);
        mats.forEach((m) => { m.side = T.DoubleSide; });
        const h = ray.intersectObject(p.mesh, false)[0];
        mats.forEach((m, j) => { m.side = sides[j]; });
        if (h && (!best || h.distance < best.distance)) best = { distance: h.distance, i };
      });
      if (best) this.select(best.i); else this.clearGlow();
    },
    onWheel(e) { this.orbit.radius = Math.min(200, Math.max(0.6, this.orbit.radius * (e.deltaY > 0 ? 1.12 : 0.89))); },
    select(i) {
      const T = this.T;
      this.clearGlow();
      const p = this.parts[i];
      const overlay = new T.Mesh(p.mesh.geometry, new T.MeshBasicMaterial({ color: "#ffb347", transparent: true, opacity: 0.55, side: T.DoubleSide, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      const wire = new T.LineSegments(new T.EdgesGeometry(p.mesh.geometry, 30), new T.LineBasicMaterial({ color: "#ffe2a6", depthTest: false }));
      wire.renderOrder = 999;
      overlay.add(wire);
      p.mesh.add(overlay);
      this.glow = overlay;
      const size = new T.Box3().setFromObject(p.mesh).getSize(new T.Vector3()).toArray().map((v) => v.toFixed(2)).join(" × ");
      this.selected = { ...this.list[i], index: i, size: `${size} m` };
    },
    clearGlow() {
      if (this.glow) {
        this.glow.removeFromParent();
        this.glow.material.dispose();
        this.glow.children.forEach((c) => { c.geometry.dispose(); c.material.dispose(); });
      }
      this.glow = null;
      this.selected = null;
      this.tag = null;
    },
    dispose() {
      cancelAnimationFrame(this.raf);
      if (this.observer) this.observer.disconnect();
      this.clearGlow();
      // 克隆体共享主场景的几何与材质（不能释放）：从本视窗场景中摘除克隆与辅助对象，释放本视窗自建的网格 / 灯光资源与渲染器。
      if (this.scene) {
        if (this.clone) this.clone.removeFromParent();
        this.scene.traverse((o) => { if (o.isGridHelper) { o.geometry.dispose(); o.material.dispose(); } });
        this.scene.clear();
      }
      this.parts = null; this.clone = null; this.scene = null; this.ctx2d = null;
      // 主渲染器归主场景所有，这里只清掉本视窗场景的渲染列表缓存。
      if (this.renderer) this.renderer.renderLists.dispose();
      this.renderer = null;
    },
  },
};
</script>

<style scoped>
.xy-explode { display:flex; flex-direction:column; width:80vw; height:80vh; padding:14px 16px 16px; border:1px solid rgba(56,189,248,.35); border-radius:18px; background:rgba(11,18,32,.97); box-shadow:0 24px 60px rgba(2,6,23,.6); }
header { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
header > div:first-child { flex:1; min-width:0; }
header strong { display:block; font:17px/1.3 "OPPOSans-B", sans-serif; color:#fff; }
header small { display:block; color:#94a3b8; font-size:12px; }
.ops { display:flex; align-items:center; gap:8px; }
.op { height:30px; padding:0 14px; border:1px solid rgba(255,255,255,.16); border-radius:8px; background:rgba(255,255,255,.05); color:#e2e8f0; font-size:12px; line-height:28px; cursor:pointer; transition:background-color .2s, border-color .2s, color .2s; }
.op:hover { border-color:rgba(56,189,248,.6); background:rgba(56,189,248,.14); color:#fff; }
.op.primary { border-color:transparent; background:linear-gradient(135deg,#38bdf8,#6366f1); color:#fff; }
.op.primary:hover { filter:brightness(1.1); }
.op.close { width:30px; padding:0; font-size:14px; color:#94a3b8; }
.op.close:hover { color:#fff; border-color:rgba(248,113,113,.6); background:rgba(248,113,113,.16); }
.tree li.grp { grid-template-columns:auto 1fr auto; align-items:center; gap:6px; background:rgba(255,255,255,.02); }
.tree li.grp b { color:#bae6fd; }
.tree li.grp small { grid-column:auto; color:#64748b; }
.tree .caret { font-style:normal; color:#7dd3fc; font-size:10px; transition:transform .2s; }
.tree .caret.open { transform:rotate(90deg); }
.tree li.leaf small { grid-column:1 / -1; }
.tree li.leaf em { grid-row:1; }
.body { flex:1; min-height:0; display:grid; grid-template-columns:minmax(0,1fr) 300px; gap:12px; }
.stage { position:relative; min-height:0; border-radius:12px; overflow:hidden; background:radial-gradient(circle at 50% 40%,#16263f,#070d18 75%); border:1px solid rgba(255,255,255,.08); }
.stage canvas { display:block; width:100%; height:100%; cursor:grab; }
.stage canvas:active { cursor:grabbing; }
.empty { position:absolute; left:0; right:0; bottom:16px; margin:0; text-align:center; color:#94a3b8; font-size:12px; }
.tag { position:absolute; transform:translate(-50%,calc(-100% - 10px)); padding:6px 10px; border:1px solid rgba(255,179,71,.6); border-radius:8px; background:rgba(15,23,42,.94); pointer-events:none; white-space:nowrap; }
.tag b { display:block; color:#ffd59a; font-size:12px; } .tag small { color:#94a3b8; font-size:11px; }
aside { min-height:0; overflow-y:auto; padding-right:4px; }
aside h4 { display:flex; justify-content:space-between; margin:0 0 8px; color:#e2e8f0; font:13px "OPPOSans-M", sans-serif; }
aside h4 small { color:#94a3b8; font-size:11px; }
aside ul { list-style:none; margin:0; padding:0; display:grid; gap:4px; }
aside li { display:grid; grid-template-columns:1fr auto; gap:0 8px; padding:6px 10px; border-radius:8px; background:rgba(255,255,255,.04); cursor:pointer; }
aside li:hover,aside li.on { background:rgba(56,189,248,.16); }
aside li b { color:#f1f5f9; font-size:12px; font-weight:normal; }
aside li small { grid-column:1; color:#94a3b8; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
aside li em { grid-row:1 / span 2; grid-column:2; align-self:center; font-style:normal; font-size:11px; color:#86efac; }
aside li.bad em { color:#fde68a; }
.detail { margin-bottom:12px; padding:10px 12px; border:1px solid rgba(255,179,71,.45); border-radius:10px; background:rgba(255,179,71,.06); }
.detail h4 { color:#ffd59a; }
.detail dl { display:grid; grid-template-columns:auto 1fr; gap:3px 10px; margin:0; font-size:12px; }
.detail dt { color:#94a3b8; } .detail dd { margin:0; color:#e2e8f0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.detail dd.bad { color:#f5c451; }
.detail p { margin:8px 0 0; color:#cbd5e1; font-size:12px; }
</style>
