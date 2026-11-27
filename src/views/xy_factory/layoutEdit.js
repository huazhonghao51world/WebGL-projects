// 设备自定义布局（参照灯塔工厂“布局规划”）：在三维场景中拖拽 / 旋转产线设备，吸附网格，实时冲突检测（与其他设备、
// 车间边界重叠时红框），方案可保存 / 应用 / 删除（localStorage），取消时全部复原。
// 每台设备的布局 = 绕设备中心的平移 (dx, dz) + 转角 rot。同一个世界变换同时作用于设备整机节点和
// 归属该设备的合批实例（GLB 实例化节点、场景组配置包的设备合批），保证整台设备一起移动。不改模型数据，离开页面复原。
import catalog from "./sceneCatalog.json";

const SNAP = 0.25;
const ROTATE_STEP = 15;
const SCHEME_KEY = "xy.layout.schemes";
const FLOOR_Y = 13.72;

/** 可编辑设备：生产楼 1F 室内设备（注塑机、干燥机、组装线等，台账中有独立整机节点）。 */
export const editableDevices = catalog.devices.filter((d) => d.entityId === "xy-shinei" && d.max[1] < 19);

export function loadSchemes() {
  try { return JSON.parse(localStorage.getItem(SCHEME_KEY)) || []; } catch (error) { return []; }
}
export function saveSchemes(list) { localStorage.setItem(SCHEME_KEY, JSON.stringify(list)); }

// 原始布局记录（按场景对象，跨多次进入编辑保持）：再次进入时在已有布局上继续，复原总是回到交付模型的原始位置。
const originals = new WeakMap();
const instanceBases = new WeakMap();
// 合批节点上的设备没有独立对象，按设备 id 记录姿态（同样跨多次进入编辑保持）。
const instancedPoses = new Map();

export function createLayoutEditor(viewer, adapter, onChange, names = {}) {
  const host = viewer.extensions;
  const T = host.THREE;
  const canvas = host.canvas;
  const region = catalog.regions.production;
  const nodes = new Map();
  const shared = new Map();
  for (const d of editableDevices) { const key = `${d.entityId}|${d.nodeName}`; shared.set(key, (shared.get(key) || 0) + 1); }
  for (const d of editableDevices) {
    const ref = adapter.deviceRef(d.id);
    const object = ref && host.getObject(ref);
    if (!object) continue;
    // 多台设备共用一个合批节点（如干燥机 GZJ-01~03）：不移动节点本身，只移动包围盒内属于本设备的实例。
    const instancedOnly = shared.get(`${d.entityId}|${d.nodeName}`) > 1;
    object.updateMatrix();
    if (!instancedOnly && !originals.has(object)) originals.set(object, { base: object.matrix.clone(), pose: { dx: 0, dz: 0, rot: 0 } });
    if (instancedOnly && !instancedPoses.has(d.id)) instancedPoses.set(d.id, { base: new T.Matrix4(), pose: { dx: 0, dz: 0, rot: 0 } });
    const rec = instancedOnly ? instancedPoses.get(d.id) : originals.get(object);
    nodes.set(d.id, { id: d.id, device: d, object: instancedOnly ? null : object, ref, base: rec.base, rec, pose: rec.pose, half: [(d.max[0] - d.min[0]) / 2, (d.max[2] - d.min[2]) / 2], c0: d.center, instances: [] });
  }
  // 合批实例按“原始”世界位置归属到所在设备的包围盒。
  const shineiRoot = (() => { try { return host.getObject({ entityId: "xy-shinei" }); } catch (error) { return null; } })();
  if (shineiRoot) {
    shineiRoot.updateMatrixWorld(true);
    const m = new T.Matrix4();
    const p = new T.Vector3();
    shineiRoot.traverse((mesh) => {
      if (!mesh.isInstancedMesh) return;
      if (!instanceBases.has(mesh)) instanceBases.set(mesh, new Map());
      const bases = instanceBases.get(mesh);
      for (let i = 0; i < mesh.count; i++) {
        if (!bases.has(i)) { mesh.getMatrixAt(i, m); bases.set(i, m.clone()); }
        m.copy(bases.get(i));
        p.setFromMatrixPosition(m).applyMatrix4(mesh.matrixWorld);
        for (const item of nodes.values()) {
          const d = item.device;
          if (p.x >= d.min[0] - 0.3 && p.x <= d.max[0] + 0.3 && p.z >= d.min[2] - 0.3 && p.z <= d.max[2] + 0.3 && p.y >= d.min[1] - 0.5 && p.y <= d.max[1] + 0.5) {
            item.instances.push({ mesh, index: i, base: m.clone() });
            break;
          }
        }
      }
    });
  }

  const D = new T.Matrix4(); const A = new T.Matrix4(); const B = new T.Matrix4(); const inv = new T.Matrix4();
  /** 世界增量：T(c0 + d) · Ry(rot) · T(-c0)。 */
  function worldDelta(item) {
    const [cx, , cz] = item.c0;
    return D.makeTranslation(cx + item.pose.dx, 0, cz + item.pose.dz).multiply(A.makeRotationY(T.MathUtils.degToRad(item.pose.rot))).multiply(B.makeTranslation(-cx, 0, -cz));
  }
  function setPose(item, pose) {
    item.pose = { dx: pose.dx, dz: pose.dz, rot: pose.rot };
    item.rec.pose = item.pose;
    worldDelta(item);
    if (item.object) {
      const parent = item.object.parent;
      parent.updateMatrixWorld(true);
      // 节点局部矩阵 = P⁻¹ · D · P · M0
      inv.copy(parent.matrixWorld).invert();
      const local = new T.Matrix4().copy(inv).multiply(D).multiply(parent.matrixWorld).multiply(item.base);
      local.decompose(item.object.position, item.object.quaternion, item.object.scale);
      item.object.updateMatrixWorld(true);
    }
    const touched = new Set();
    for (const inst of item.instances) {
      inv.copy(inst.mesh.matrixWorld).invert();
      inst.mesh.setMatrixAt(inst.index, new T.Matrix4().copy(inv).multiply(D).multiply(inst.mesh.matrixWorld).multiply(inst.base));
      touched.add(inst.mesh);
    }
    touched.forEach((mesh) => { mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingBox(); mesh.computeBoundingSphere(); });
  }

  const group = new T.Group();
  group.name = "xy-layout-edit";
  const outlines = new Map();
  for (const [id] of nodes) {
    const line = new T.LineLoop(new T.BufferGeometry().setFromPoints([0, 1, 2, 3].map(() => new T.Vector3())), new T.LineBasicMaterial({ color: "#34d399", transparent: true, opacity: 0.95, depthTest: false }));
    line.renderOrder = 996;
    line.frustumCulled = false;
    const fill = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ color: "#34d399", transparent: true, opacity: 0.08, depthWrite: false, side: T.DoubleSide }));
    fill.rotation.x = -Math.PI / 2;
    group.add(line, fill);
    outlines.set(id, { line, fill });
  }
  const size = Math.ceil(Math.max(region.max[0] - region.min[0], region.max[2] - region.min[2]));
  const grid = new T.GridHelper(size, size, "#38bdf8", "#1e3a5f");
  grid.position.set(region.center[0], FLOOR_Y + 0.01, region.center[2]);
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  grid.material.depthWrite = false;
  group.add(grid);
  host.scene.add(group);

  let selected = null;
  let mode = "translate";
  let drag = null;
  let disposed = false;

  function footprint(item) {
    const cx = item.c0[0] + item.pose.dx; const cz = item.c0[2] + item.pose.dz;
    const r = T.MathUtils.degToRad(item.pose.rot);
    const cos = Math.abs(Math.cos(r)); const sin = Math.abs(Math.sin(r));
    const hw = item.half[0] * cos + item.half[1] * sin;
    const hd = item.half[0] * sin + item.half[1] * cos;
    return { x0: cx - hw, x1: cx + hw, z0: cz - hd, z1: cz + hd };
  }
  function collisions() {
    const list = [...nodes.values()].map((item) => ({ id: item.id, ...footprint(item) }));
    const hits = new Set();
    const overlap = (a, b) => a.x0 < b.x1 - 0.05 && a.x1 > b.x0 + 0.05 && a.z0 < b.z1 - 0.05 && a.z1 > b.z0 + 0.05;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) if (overlap(list[i], list[j])) { hits.add(list[i].id); hits.add(list[j].id); }
      const b = list[i];
      if (b.x0 < region.min[0] + 0.5 || b.x1 > region.max[0] - 0.5 || b.z0 < region.min[2] + 0.5 || b.z1 > region.max[2] - 0.5) hits.add(b.id);
    }
    return hits;
  }
  const moved = (item) => Math.abs(item.pose.dx) > 0.01 || Math.abs(item.pose.dz) > 0.01 || Math.abs(item.pose.rot) > 0.1;

  // 墙体 / 柱子 / 隔断占用栅格：在 1F 地面以上 0.6 m、1.4 m 两个高度水平切建筑外壳与室内构件（不含可编辑设备、门、地面、货物），
  // 0.25 m 栅格。设备平面投影覆盖到占用格即判定“与墙体冲突”。
  const WALL_S = 0.25;
  const wall = (() => {
    const x0 = region.min[0] - 1; const z0 = region.min[2] - 1;
    const nx = Math.ceil((region.max[0] - region.min[0] + 2) / WALL_S); const nz = Math.ceil((region.max[2] - region.min[2] + 2) / WALL_S);
    const occ = new Uint8Array(nx * nz);
    const mark = (x, z) => { const i = Math.floor((x - x0) / WALL_S); const k = Math.floor((z - z0) / WALL_S); if (i >= 0 && k >= 0 && i < nx && k < nz) occ[k * nx + i] = 1; };
    const seg = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (WALL_S / 2)) + 1; for (let j = 0; j <= n; j++) mark(a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n); };
    const skip = /MEN|men|PKM|JLM|Door|Caodi|DX0|tuopan|baoguo|box|Glass|WindowGlass|guangfu|Ding|SnappyRoad|jinjiexian|equipment-batch/i;
    const editable = new Set([...nodes.values()].map((n) => n.object).filter(Boolean));
    const own = (o) => { for (let q = o; q; q = q.parent) if (editable.has(q)) return true; return false; };
    const va = new T.Vector3(); const vb = new T.Vector3(); const vc = new T.Vector3();
    const heights = [FLOOR_Y + 0.6, FLOOR_Y + 1.4];
    host.scene.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh || !o.geometry || !o.geometry.attributes.position) return;
      for (let q = o; q; q = q.parent) { if (!q.visible) return; if (/^twin-|^xy-(focus|part|layout)/.test(q.name || "")) return; }
      if (skip.test(o.name || "") || skip.test((o.parent && o.parent.name) || "") || own(o)) return;
      const bb = new T.Box3().setFromObject(o);
      if (bb.max.y < heights[0] || bb.min.y > heights[1] || bb.max.x < x0 || bb.min.x > x0 + nx * WALL_S || bb.max.z < z0 || bb.min.z > z0 + nz * WALL_S) return;
      const pos = o.geometry.attributes.position; const index = o.geometry.index; const m = o.matrixWorld;
      const count = index ? index.count : pos.count;
      for (let t = 0; t < count; t += 3) {
        va.fromBufferAttribute(pos, index ? index.getX(t) : t).applyMatrix4(m);
        vb.fromBufferAttribute(pos, index ? index.getX(t + 1) : t + 1).applyMatrix4(m);
        vc.fromBufferAttribute(pos, index ? index.getX(t + 2) : t + 2).applyMatrix4(m);
        for (const y of heights) {
          const pts = [];
          for (const [p, q] of [[va, vb], [vb, vc], [vc, va]]) {
            if ((p.y - y) * (q.y - y) > 0 || p.y === q.y) continue;
            const k = (y - p.y) / (q.y - p.y);
            pts.push([p.x + (q.x - p.x) * k, p.z + (q.z - p.z) * k]);
          }
          if (pts.length >= 2) seg(pts[0], pts[1]);
        }
      }
    });
    return { occ, nx, nz, x0, z0 };
  })();
  function hitsWall(f) {
    const { occ, nx, nz, x0, z0 } = wall;
    // 内缩 0.1 m，避免设备贴墙摆放时被边缘格误判。
    const i0 = Math.max(0, Math.floor((f.x0 + 0.1 - x0) / WALL_S)); const i1 = Math.min(nx - 1, Math.floor((f.x1 - 0.1 - x0) / WALL_S));
    const k0 = Math.max(0, Math.floor((f.z0 + 0.1 - z0) / WALL_S)); const k1 = Math.min(nz - 1, Math.floor((f.z1 - 0.1 - z0) / WALL_S));
    for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) if (occ[k * nx + i]) return true;
    return false;
  }
  const wallHits = () => new Set([...nodes.values()].filter((item) => hitsWall(footprint(item))).map((item) => item.id));
  // 原始位置已与墙体切片接触的设备（如靠墙、紧贴立柱）只在挪动后才提示。
  const wallBaseline = wallHits();
  // 冲突对只在“相对原始布局新出现”时提示：原始模型中注塑机之间本就贴得很近，不作为冲突。
  const baseline = collisions();

  function state() {
    const hits = collisions();
    const walls = new Set([...wallHits()].filter((id) => !wallBaseline.has(id) || moved(nodes.get(id))));
    const item = selected && nodes.get(selected);
    return {
      mode, count: nodes.size,
      selected: item ? { id: item.id, name: names[item.id] || item.device.nodeName, dx: +item.pose.dx.toFixed(2), dz: +item.pose.dz.toFixed(2), rotation: item.pose.rot, collision: (hits.has(item.id) && !baseline.has(item.id)) || walls.has(item.id), wall: walls.has(item.id) } : null,
      moved: [...nodes.values()].filter(moved).length,
      collisions: [...new Set([...[...hits].filter((id) => !baseline.has(id) || moved(nodes.get(id))), ...walls])],
      wallCollisions: [...walls],
    };
  }
  function refresh() {
    const s = state();
    const bad = new Set(s.collisions);
    for (const [id, item] of nodes) {
      const f = footprint(item);
      const { line, fill } = outlines.get(id);
      const y = FLOOR_Y + 0.04;
      const pos = line.geometry.attributes.position;
      [[f.x0, f.z0], [f.x1, f.z0], [f.x1, f.z1], [f.x0, f.z1]].forEach(([x, z], k) => pos.setXYZ(k, x, y, z));
      pos.needsUpdate = true;
      const active = id === selected || bad.has(id) || moved(item);
      const color = bad.has(id) ? "#f43f5e" : id === selected ? "#38bdf8" : moved(item) ? "#f5c451" : "#34d399";
      line.material.color.set(color); fill.material.color.set(color);
      line.material.opacity = active ? 1 : 0.55;
      fill.material.opacity = active ? 0.24 : 0.05;
      fill.position.set((f.x0 + f.x1) / 2, y - 0.005, (f.z0 + f.z1) / 2);
      fill.scale.set(f.x1 - f.x0, f.z1 - f.z0, 1);
    }
    host.updateShadows();
    onChange(s);
  }

  const ray = new T.Raycaster();
  const plane = new T.Plane(new T.Vector3(0, 1, 0), -FLOOR_Y);
  function floorPoint(event) {
    const rect = canvas.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1), host.camera);
    return ray.ray.intersectPlane(plane, new T.Vector3());
  }
  function deviceAt(point) {
    if (!point) return null;
    let best = null;
    for (const item of nodes.values()) {
      const f = footprint(item);
      if (point.x >= f.x0 && point.x <= f.x1 && point.z >= f.z0 && point.z <= f.z1) {
        const area = (f.x1 - f.x0) * (f.z1 - f.z0);
        if (!best || area < best.area) best = { item, area };
      }
    }
    return best && best.item;
  }
  function pick(id) {
    selected = id;
    const item = nodes.get(id);
    if (item) adapter.outline("xy-layout", [item.ref], { color: "#38bdf8", hiddenColor: "#1e5f86", glow: 0.5 });
    else adapter.clearOutline("xy-layout");
  }

  function onDown(event) {
    if (event.button !== 0) return;
    const point = floorPoint(event);
    const item = deviceAt(point);
    if (!item) return;
    event.stopImmediatePropagation();
    event.preventDefault();
    pick(item.id);
    drag = { item, start: point, pose: { ...item.pose }, x: event.clientX, pointerId: event.pointerId };
    host.acquireCamera("xy-layout-edit");
    refresh();
  }
  function onMove(event) {
    if (!drag) return;
    const { item } = drag;
    if (mode === "rotate") {
      const rot = drag.pose.rot + Math.round(((event.clientX - drag.x) / 40)) * ROTATE_STEP;
      setPose(item, { ...drag.pose, rot: ((rot % 360) + 360) % 360 });
    } else {
      const point = floorPoint(event);
      if (!point) return;
      const dx = Math.round((drag.pose.dx + point.x - drag.start.x) / SNAP) * SNAP;
      const dz = Math.round((drag.pose.dz + point.z - drag.start.z) / SNAP) * SNAP;
      setPose(item, { ...drag.pose, dx, dz });
    }
    refresh();
  }
  function onUp() {
    if (!drag) return;
    drag = null;
    host.releaseCamera("xy-layout-edit");
    refresh();
  }
  canvas.addEventListener("pointerdown", onDown, true);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  refresh();

  function tweenTo(layout, ms = 900) {
    const map = new Map(layout.map((x) => [x.id, x]));
    const plan = [...nodes.values()].map((item) => ({ item, from: { ...item.pose }, to: map.get(item.id) || { dx: 0, dz: 0, rot: 0 } })).filter(({ from, to }) => from.dx !== to.dx || from.dz !== to.dz || from.rot !== to.rot);
    if (!plan.length) return Promise.resolve();
    const start = performance.now();
    return new Promise((resolve) => {
      const off = host.onFrame(() => {
        const k = Math.min(1, (performance.now() - start) / ms);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        plan.forEach(({ item, from, to }) => setPose(item, { dx: from.dx + (to.dx - from.dx) * e, dz: from.dz + (to.dz - from.dz) * e, rot: from.rot + (to.rot - from.rot) * e }));
        if (k >= 1) { plan.forEach(({ item, to }) => setPose(item, to)); off(); refresh(); resolve(); } else refresh();
      });
    });
  }

  return {
    setMode(next) { mode = next === "rotate" ? "rotate" : "translate"; refresh(); return state(); },
    state,
    getLayout: () => [...nodes.values()].filter(moved).map((item) => ({ id: item.id, ...item.pose })),
    applyLayout: (layout) => tweenTo(layout),
    reset: () => tweenTo([]),
    select(id) { if (nodes.has(id)) { pick(id); refresh(); } return state(); },
    rotateSelected(step = ROTATE_STEP) { const item = selected && nodes.get(selected); if (item) { setPose(item, { ...item.pose, rot: (item.pose.rot + step + 360) % 360 }); refresh(); } return state(); },
    restoreSelected() { const item = selected && nodes.get(selected); if (item) { setPose(item, { dx: 0, dz: 0, rot: 0 }); refresh(); } return state(); },
    has: (id) => nodes.has(id),
    /** 结束编辑：keep=false 复原到原始布局。 */
    dispose(keep = true) {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      host.releaseCamera("xy-layout-edit");
      adapter.clearOutline("xy-layout");
      if (!keep) for (const item of nodes.values()) setPose(item, { dx: 0, dz: 0, rot: 0 });
      host.updateShadows();
      group.removeFromParent();
      group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    },
  };
}
