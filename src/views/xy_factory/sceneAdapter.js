import { getTwinApp } from "@/utils/twin/app";
import { createPOIs } from "@/utils/twin/entity";
import { overview } from "./campus";
import { campusPoiStyles } from "./poiStyles";
import { createPoiOcclusion } from "./poiOcclusion";
import { createEnvironmentControl } from "./environment";
import catalog from "./sceneCatalog.json";

const prefix = "xy-poi-";
const buildingXref = { "生产楼": "production", "库区楼": "warehouse" };
const SHELL_ENTITY = "xy-campus-core";
export const PIPELINE_VFX = ["xy-vfx"];
const refKey = (ref) => `${ref.entityId}|${ref.nodeKey}`;
const isChild = (o, root) => { for (; o; o = o.parent) if (o === root) return true; return false; };

// 拆楼分层：按外壳节点名后缀（_生产楼_3F 等）归组，自上而下排列；光伏板归屋顶。
const LAYER_NAMES = { "4F": "屋顶", "3F": "屋顶 / 3F", "2F": "2F 楼板与外墙", "1F": "1F 外墙", "副楼": "副楼" };
export const CUT_GROUPS = Object.fromEntries(Object.entries(catalog.cutaway).map(([id, names]) => {
  const groups = new Map();
  names.forEach((name) => {
    const m = /_(?:生产楼|库区楼)_(\w+|副楼)$/.exec(name);
    const layer = m ? m[1] : id === "production" ? "3F" : "4F";
    if (!groups.has(layer)) groups.set(layer, []);
    groups.get(layer).push(name);
  });
  const order = ["4F", "3F", "副楼", "2F", "1F"];
  // 库区楼：仅开放 屋顶/4F 与 3F 两层（两层都拆即视为整栋拆开），2F、1F 外墙不参与拆楼；生产楼整栋拆开时始终保留 1F。
  if (id === "warehouse") {
    const names = { "4F": "屋顶 / 4F", "3F": "3F" };
    return [id, [...groups].filter(([layer]) => names[layer]).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0])).map(([layer, nodes]) => ({ id: layer, name: names[layer], nodes }))];
  }
  groups.delete("1F");
  return [id, [...groups].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0])).map(([layer, nodes]) => ({ id: layer, name: LAYER_NAMES[layer] || layer, nodes }))];
}));

function nodeData(viewer) {
  return viewer.scene.getByTypes(["Static"]).flatMap((entity) => {
    const nodes = viewer.hierarchy.getNodes(entity.eid);
    const index = new Map(nodes.map((node) => [node.nodeKey, node]));
    return nodes.flatMap((node) => {
      const building = Object.keys(buildingXref).find((name) => node.nodeName === name || node.nodeName.includes(`_${name}_`));
      if (!building) return [];
      const floor = node.nodeName.split(`_${building}_`)[1];
      let ancestor = index.get(node.parentKey);
      while (ancestor && !ancestor.nodeName.includes(building)) ancestor = index.get(ancestor.parentKey);
      return [{ id: buildingXref[building], floor: /^(?:[1-4]F|副楼)$/.test(floor) ? floor : null, parentKey: ancestor && ancestor.nodeKey, ref: { entityId: entity.eid, nodeKey: node.nodeKey } }];
    });
  });
}

/** 场景实体中按 glTF 节点名查 nodeKey（每个实体只建一次索引）。 */
function nodeResolver(viewer) {
  const cache = new Map();
  return (entityId, nodeName) => {
    if (!cache.has(entityId)) {
      let nodes = [];
      try { nodes = viewer.hierarchy.getNodes(entityId); } catch (error) { nodes = []; }
      cache.set(entityId, new Map(nodes.map((node) => [node.nodeName, node.nodeKey])));
    }
    const nodeKey = cache.get(entityId).get(nodeName);
    return nodeKey ? { entityId, nodeKey } : null;
  };
}

export function connectCampus(anchors, onPick, { showCameras: showCamerasInitially = true, poiStyles, occlusion: occlusionConfig, raycastWarm = true } = {}) {
  const app = getTwinApp();
  const viewer = app.viewer;
  const nodes = nodeData(viewer);
  const resolve = nodeResolver(viewer);
  const occlusion = createPoiOcclusion(viewer, occlusionConfig);
  const envControl = createEnvironmentControl(viewer);
  let disposed = false;
  let poi = [];
  let layerEntities = [];
  let showCameras = showCamerasInitially;
  let showDevice = false;
  let floorHidden = [];
  let cutHidden = [];
  let cutBuildings = [];
  let applied = new Map();
  const tintLayers = new Set();
  const outlineIds = new Map();
  const styles = campusPoiStyles(poiStyles || {});
  const pointKinds = new Map(anchors.map(({ id, kind }) => [`${prefix}${id}`, kind]));
  const live = () => !disposed && getTwinApp() === app;
  // SDK 点击模型会自动“选中”并画 GPU 描边（全屏后处理，帧率减半）。业务只用自己的轻量描边：屏蔽来自指针的选中。
  const sdkSelect = viewer.selection.set;
  viewer.selection.set = (selected, source) => (source === "pointer" ? undefined : sdkSelect(selected, source));
  viewer.selection.clear();
  let pickEnabled = false;
  const off = viewer.events.on("entity.click", (event) => {
    if (!live() || !event) return;
    const identifier = event.entity.toJSON().customId;
    if (event.type === "Poi" && typeof identifier === "string" && identifier.startsWith(prefix)) onPick(identifier.slice(prefix.length), true);
    if (event.type === "Poi" && typeof identifier === "string" && identifier.startsWith("xy-layer-")) onPick(identifier, true, event.entity.toJSON().customData);
    if (event.type === "Static") {
      // 点选设备关闭时：模型点击完全不响应（不做构件识别、不高亮）。
      if (!pickEnabled) return;
      const node = nodes.find(({ ref }) => ref.entityId === event.eid && ref.nodeKey === event.nodeKey);
      // 楼栋外壳：沿用楼栋选中；其余构件（设备、消防设施、道路标线…）交给页面展示实体信息。
      if (node && !cutBuildings.length) onPick(node.id, false);
      else if (event.nodeKey) onPick("xy-entity", false, describeNode(event.eid, event.nodeKey, event.position));
    }
  });

  function fly(pose, durationMs = 650) {
    if (!live()) return Promise.resolve();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return viewer.camera.flyTo(pose, reduced ? 0 : durationMs).catch((error) => {
      if (live() && error.code !== "E_OPERATION_CANCELLED") throw error;
    });
  }

  // 静态网格世界包围盒缓存（场景加载后建一次）：射线只对附近网格求交，避免每次遍历 2000 万三角面的全场景。
  let meshBoxes = null;
  function nearbyMeshes(center, radius) {
    const T = viewer.extensions.THREE;
    if (!meshBoxes) {
      meshBoxes = [];
      viewer.extensions.scene.traverse((o) => {
        if (!o.isMesh || o.name === "twin-poi-batch" || o.name === "twin-poi-batch-top") return;
        for (let p = o; p; p = p.parent) if (p.name === "twin-coverings" || p.name === "twin-pick-tools") return;
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        // InstancedMesh 的几何包围盒只含单个实例：用 computeBoundingBox 得到全部实例的范围。
        if (o.isInstancedMesh && !o.boundingBox) o.computeBoundingBox();
        meshBoxes.push({ mesh: o, box: new T.Box3().copy(o.isInstancedMesh ? o.boundingBox : o.geometry.boundingBox).applyMatrix4(o.matrixWorld) });
      });
    }
    const probe = new T.Box3().setFromCenterAndSize(center, new T.Vector3(radius * 2, radius * 2, radius * 2));
    return meshBoxes.filter(({ box }) => box.intersectsBox(probe)).map(({ mesh }) => mesh);
  }

  // SDK 只给普通 Mesh 挂了 BVH 射线加速，InstancedMesh 仍逐三角形求交。立库轨道 SM_LK_GD（88 万三角 ×2 实例）
  // 在镜头经过库区楼上方时被相机贴地探测每帧命中，单帧 ~100 ms（帧率掉到个位数）。
  // 这里给大实例网格换上“逐实例 + 复用 SDK 的 BVH 射线”实现，结果与原生一致（含 instanceId），离开页面还原。
  // SDK 给普通网格挂的 BVH 射线函数（名为 bvhRaycast；个别对象的禁用拾取空函数要排除）。
  // 生产构建会压缩函数名（bvhRaycast → mR），不能按名字识别：取普通网格上出现最多、且不是 three.js 原生 / 空函数的 raycast。
  function findBvhRaycast() {
    const T = viewer.extensions.THREE;
    const counts = new Map();
    viewer.extensions.scene.traverse((o) => {
      const fn = o.isMesh && !o.isInstancedMesh && o.raycast;
      if (!fn || fn === T.Mesh.prototype.raycast || fn.length < 2 || !o.geometry || !o.geometry.attributes.position) return;
      counts.set(fn, (counts.get(fn) || 0) + 1);
    });
    let best = null; let n = 0;
    counts.forEach((c, fn) => { if (c > n) { best = fn; n = c; } });
    return best;
  }
  // 碰撞只保留地面：SDK 漫游导航默认对全部可见网格做墙体滑移与贴地探测（贴地从 1 万米高空向下射线，
  // 第一人称进入室内时会落到屋顶）。这里关闭水平墙体碰撞，贴地探测改为从当前视高向下找最近的地面 / 楼板。
  let navPatch = null;
  function limitCollision() {
    const nav = viewer.navFx;
    if (!nav || navPatch || typeof nav.groundAt !== "function") return;
    const T = viewer.extensions.THREE;
    const original = { groundAt: nav.groundAt, slide: nav.slide, sweep: nav.sweep };
    nav.slide = function slide(from, to) { return to; };
    nav.sweep = function sweep() { return null; };
    nav.groundAt = function groundAt(point, fromY) {
      if (Number.isFinite(fromY)) return original.groundAt.call(this, point, fromY);
      // 进入第一人称 / 第三人称时：取正下方最低的可见表面（室外地面或建筑 1F 楼板），不落在屋顶上。
      const graph = this.host.graph();
      if (!graph) return 0;
      const ray = new T.Raycaster(new T.Vector3(point.x, 1e4, point.z), new T.Vector3(0, -1, 0), 0, 2e4);
      let lowest = null;
      for (const hit of graph.intersect(ray)) if (graph.hit(hit) && (lowest === null || hit.point.y < lowest)) lowest = hit.point.y;
      return lowest === null ? 0 : lowest;
    };
    navPatch = { nav, original };
  }
  function restoreCollision() {
    if (!navPatch) return;
    Object.assign(navPatch.nav, navPatch.original);
    navPatch = null;
  }
  const instancedPatched = [];
  function accelerateInstanced() {
    const T = viewer.extensions.THREE;
    let bvhRaycast = null;
    bvhRaycast = findBvhRaycast();
    if (!bvhRaycast) return;
    const proxy = new T.Mesh();
    const local = new T.Matrix4();
    viewer.extensions.scene.traverse((o) => {
      if (!o.isInstancedMesh || o.raycast !== T.InstancedMesh.prototype.raycast) return;
      const tris = (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
      if (tris < 20000 || Object.keys(o.geometry.morphAttributes).length) return;
      const original = o.raycast;
      o.raycast = function raycastInstancedBvh(raycaster, intersects) {
        if (this.boundingSphere === null) this.computeBoundingSphere();
        const sphere = new T.Sphere().copy(this.boundingSphere).applyMatrix4(this.matrixWorld);
        if (!raycaster.ray.intersectsSphere(sphere)) return;
        proxy.geometry = this.geometry;
        proxy.material = this.material;
        for (let i = 0; i < this.count; i++) {
          this.getMatrixAt(i, local);
          proxy.matrixWorld.multiplyMatrices(this.matrixWorld, local);
          const hits = [];
          bvhRaycast.call(proxy, raycaster, hits);
          for (const hit of hits) { hit.instanceId = i; hit.object = this; intersects.push(hit); }
        }
      };
      instancedPatched.push([o, original]);
    });
  }

  // SDK 在网格首次被射线检测时才构建 BVH（大网格单个 30–60 ms），首次聚焦某区域会一次构建数百个、卡顿数秒。
  // 场景就绪后利用空闲时间分片预建：每片不超过 ~10 ms（单个超大网格例外），相机运动或页面隐藏时暂停，大网格优先（生产楼、库区楼墙体等）。
  let warmTimer = 0;
  function warmRaycast() {
    if (!live()) return;
    const T = viewer.extensions.THREE;
    nearbyMeshes(new T.Vector3(), 0);
    const queue = meshBoxes.map(({ mesh }) => mesh)
      .filter((m) => m.geometry && !m.geometry.boundsTree && (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) >= 3000)
      .sort((a, b) => (b.geometry.index ? b.geometry.index.count : 0) - (a.geometry.index ? a.geometry.index.count : 0));
    const ray = new T.Raycaster();
    const proxy = new T.Mesh();
    let bvhRaycast = null;
    bvhRaycast = findBvhRaycast();
    if (!bvhRaycast) return;
    let lastMove = 0;
    const offMove = viewer.events.on("camera.changed", () => { lastMove = performance.now(); });
    const step = () => {
      warmTimer = 0;
      if (!live()) { offMove(); return; }
      if (document.hidden || performance.now() - lastMove < 400) { warmTimer = setTimeout(step, 300); return; }
      const start = performance.now();
      while (queue.length && performance.now() - start < 10) {
        const mesh = queue.shift();
        if (mesh.geometry.boundsTree) continue;
        // 用局部坐标的代理网格调用 SDK 的 BVH 射线：首次调用即构建并缓存在几何体上（实例网格共享同一几何）。
        if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
        proxy.geometry = mesh.geometry;
        proxy.material = mesh.material;
        ray.set(mesh.geometry.boundingSphere.center.clone().add(new T.Vector3(0, mesh.geometry.boundingSphere.radius + 1, 0)), new T.Vector3(0, -1, 0));
        ray.far = mesh.geometry.boundingSphere.radius * 2 + 2;
        try { bvhRaycast.call(proxy, ray, []); } catch (error) { /* 个别网格无法构建时跳过 */ }
      }
      if (queue.length) warmTimer = setTimeout(step, 24);
      else offMove();
    };
    warmTimer = setTimeout(step, 1500);
  }

  // 着色器预编译：室内材质首次进入视野时才同步编译（单帧 2–3 s）。场景配置包应用后调用一次，
  // 在后台用 KHR_parallel_shader_compile 并行编译全部材质（含拆楼 / 楼层隐藏的节点），之后首次聚焦不再卡顿。
  function prewarmShaders() {
    if (!live()) return Promise.resolve();
    const host = viewer.extensions;
    if (typeof host.renderer.compileAsync !== "function") return Promise.resolve();
    const hidden = [];
    const activeLights = new Set();
    host.scene.traverseVisible((o) => { if (o.isLight) activeLights.add(o); });
    host.scene.traverse((o) => { if (!o.visible && !o.isLight && !/^twin-|xy-focus-frame/.test(o.name)) { hidden.push(o); o.visible = true; } });
    // 灯光数量是着色器变体的一部分：被拆楼隐藏的灯保持关闭，预编译的变体才与实际渲染一致。
    const muted = [];
    host.scene.traverseVisible((o) => { if (o.isLight && !activeLights.has(o)) { muted.push(o); o.visible = false; } });
    let promise;
    try { promise = host.renderer.compileAsync(host.scene, host.camera); } catch (error) { promise = Promise.resolve(); }
    hidden.forEach((o) => { o.visible = false; });
    muted.forEach((o) => { o.visible = true; });
    // compile 计算的变体与实际渲染不完全一致（场景组材质在渲染时才挂反射环境）：再用真实渲染路径把网格画到 1×1 目标。
    // 分批进行（每批 40 个网格、批间让出 2 帧）：一次性把 3000 万三角面全部提交，国产显卡（麒麟系统）会触发 GPU 超时重置，
    // 表现为场景加载后白屏闪烁多次；分批后单次提交量与正常一帧相当。
    return promise.catch(() => {}).then(() => prewarmBatches(hidden, activeLights));
  }
  function prewarmBatches(hiddenRoots, activeLights) {
    const host = viewer.extensions;
    const T = host.THREE;
    const LAYER = 31;
    const meshes = [];
    host.scene.traverse((o) => { if (o.isMesh && !/^twin-/.test(o.name)) meshes.push(o); });
    const lights = [...activeLights];
    const camera = host.camera.clone();
    camera.layers.set(LAYER);
    const target = new T.WebGLRenderTarget(1, 1);
    return new Promise((resolve) => {
      let i = 0;
      const step = () => {
        if (!live() || i >= meshes.length) { target.dispose(); resolve(); return; }
        if (document.hidden) { setTimeout(step, 300); return; }
        const batch = meshes.slice(i, i + 40);
        i += batch.length;
        const shown = hiddenRoots.filter((o) => !o.visible);
        const r = host.renderer;
        const previous = r.getRenderTarget();
        const shadowAuto = r.shadowMap.autoUpdate;
        try {
          shown.forEach((o) => { o.visible = true; });
          batch.forEach((o) => { o.layers.enable(LAYER); o.userData.xyCulled = o.frustumCulled; o.frustumCulled = false; });
          lights.forEach((l) => l.layers.enable(LAYER));
          r.shadowMap.autoUpdate = false;
          r.setRenderTarget(target);
          r.render(host.scene, camera);
        } catch (error) { /* 预热失败不影响业务 */ } finally {
          r.setRenderTarget(previous);
          r.shadowMap.autoUpdate = shadowAuto;
          batch.forEach((o) => { o.layers.disable(LAYER); o.frustumCulled = o.userData.xyCulled !== false; delete o.userData.xyCulled; });
          lights.forEach((l) => l.layers.disable(LAYER));
          shown.forEach((o) => { o.visible = false; });
        }
        requestAnimationFrame(() => requestAnimationFrame(step));
      };
      setTimeout(step, 500);
    });
  }
  function filterPoints(kind) {
    const points = poi.filter((item) => pointKinds.get(item.toJSON().customId) === kind);
    return occlusion.setWanted(points, kind === "camera" ? showCameras : showDevice);
  }

  const ready = (async () => {
    const points = anchors.map((point) => ({
      location: point.position,
      customId: `${prefix}${point.id}`,
      customData: { kind: point.kind, ...(point.kind === "device" ? { demo: true } : {}) },
      bVisible: false,
      label: point.kind === "camera" ? `监控 ${point.id.slice(7)}` : point.name,
      style: styles[point.kind],
    }));
    poi = await createPOIs(points, { entityName: "XY园区点位", viewer });
    if (!live()) {
      if (getTwinApp() === app && poi.length) await viewer.scene.delete(poi);
      return;
    }
    poi.forEach((entity, index) => {
      const point = anchors[index];
      occlusion.track(entity, { position: point.position, kind: point.kind, wanted: point.kind === "building" || (point.kind === "camera" ? showCameras : showDevice) });
    });
    await occlusion.setWanted(poi.filter((entity, index) => anchors[index].kind === "building"), true);
    accelerateInstanced();
    if (raycastWarm) warmRaycast();
    limitCollision();
    // 生产流程特效默认隐藏，只在“生产管线”专题中显示。
    await setEntitiesVisible(PIPELINE_VFX, false);
  })();

  async function setEntitiesVisible(eids, visible) {
    if (!live()) return 0;
    const list = viewer.scene.getByEids(eids);
    if (list.length) await viewer.scene.setVisible(list, visible);
    occlusion.refresh();
    return list.length;
  }

  /** 楼层显隐与拆楼共用同一份“会话隐藏”节点集合，互不覆盖。 */
  function syncNodes() {
    if (!live() || viewer.getState() !== "ready") return;
    const next = new Map([...floorHidden, ...cutHidden].map((ref) => [refKey(ref), ref]));
    const show = [...applied].filter(([key]) => !next.has(key)).map(([, ref]) => ref);
    const hide = [...next].filter(([key]) => !applied.has(key)).map(([, ref]) => ref);
    if (show.length) viewer.hierarchy.setNodeVisible(show, true);
    if (hide.length) viewer.hierarchy.setNodeVisible(hide, false);
    applied = next;
    occlusion.refresh();
  }

  function applyFloor(id, floor) {
    if (!live()) return;
    const sameBuilding = nodes.filter((node) => node.id === id);
    const keep = new Set(sameBuilding.filter((node) => node.floor === floor).map(({ ref }) => ref.nodeKey));
    sameBuilding.forEach((node) => {
      if (!keep.has(node.ref.nodeKey)) return;
      let key = node.parentKey;
      while (key && !keep.has(key)) {
        keep.add(key);
        key = sameBuilding.find(({ ref }) => ref.nodeKey === key)?.parentKey;
      }
    });
    floorHidden = floor ? sameBuilding.filter((node) => node.floor && !keep.has(node.ref.nodeKey)).map(({ ref }) => ref) : [];
    syncNodes();
  }

  /** 点击构件 → 业务语义：优先匹配台账设备，其次消防设施，再按场景命名规则归类。
   *  合批节点（多台设备共用一个 InstancedMesh 节点）按点击位置取最近的设备。 */
  function describeNode(entityId, nodeKey, position) {
    let list = [];
    try { list = viewer.hierarchy.getNodes(entityId); } catch (error) { list = []; }
    const index = new Map(list.map((n) => [n.nodeKey, n]));
    const chain = [];
    for (let n = index.get(nodeKey); n; n = index.get(n.parentKey)) chain.push(n.nodeName);
    const candidates = catalog.devices.filter((d) => d.entityId === entityId && chain.includes(d.nodeName));
    const dist = (d) => (position ? (d.center[0] - position[0]) ** 2 + (d.center[1] - position[1]) ** 2 + (d.center[2] - position[2]) ** 2 : 0);
    const device = candidates.sort((a, b) => dist(a) - dist(b))[0];
    if (device) return { type: "device", deviceId: device.id, nodeName: chain[0], ref: { entityId, nodeKey } };
    const facility = catalog.facilities.find((f) => f.entityId === entityId && chain.includes(f.nodeName));
    if (facility) return { type: "facility", ...facility, ref: { entityId, nodeKey } };
    return { type: "part", entityId, nodeName: chain[0] || nodeKey, chain, ref: { entityId, nodeKey } };
  }

  // 真实部件爆炸：设备子网格沿“中心→部件中心”方向外推（水平为主，竖直只上抬），复原时写回原位（不改模型数据）。
  // 构件落点不低于设备底面（楼板），避免提升机等高大设备的下部构件钻到地下。
  let exploded = null;
  let partGlow = null;
  function explode(id, factor = 1.6) {
    collapse();
    const ref = deviceRef(id);
    const item = catalog.devices.find((x) => x.id === id);
    if (!live() || !ref || !item) return 0;
    const T = viewer.extensions.THREE;
    const root = viewer.extensions.getObject(ref);
    if (!root) return 0;
    const meshes = [];
    root.traverse((o) => { if (o.isMesh && !o.isInstancedMesh) meshes.push(o); });
    if (meshes.length < 3) return 0;
    root.updateWorldMatrix(true, true);
    const whole = new T.Box3().setFromObject(root);
    const center = whole.getCenter(new T.Vector3());
    const size = whole.getSize(new T.Vector3());
    const span = Math.max(size.x, size.z);
    const floor = Math.max(item.min[1], whole.min.y) + 0.02;
    exploded = meshes.map((mesh) => {
      const box = new T.Box3().setFromObject(mesh);
      const c = box.getCenter(new T.Vector3());
      const dir = c.clone().sub(center);
      dir.y = Math.max(0, dir.y) * 0.5;
      if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0);
      const move = dir.normalize().multiplyScalar(span * 0.22 * factor).add(new T.Vector3(0, Math.min(size.y * 0.15, 1.5), 0));
      // 落点检查：整件下沿抬到楼板以上。
      const lowest = box.min.y + move.y;
      if (lowest < floor) move.y += floor - lowest;
      const local = mesh.parent.worldToLocal(mesh.getWorldPosition(new T.Vector3()).add(move)).sub(mesh.position);
      return { mesh, from: mesh.position.clone(), offset: local, name: mesh.name || (mesh.parent && mesh.parent.name) || "构件" };
    });
    const t0 = performance.now();
    const off = viewer.extensions.onFrame(() => {
      const k = Math.min(1, (performance.now() - t0) / 700);
      const e = 1 - (1 - k) ** 3;
      (exploded || []).forEach(({ mesh, from, offset }) => mesh.position.copy(from).addScaledVector(offset, e));
      if (k >= 1) off();
    });
    exploded.off = off;
    return meshes.length;
  }
  function clearPartGlow() {
    if (!partGlow) return;
    partGlow.overlay.removeFromParent();
    partGlow.overlay.material.dispose();
    partGlow.overlay.children.forEach((c) => { c.geometry.dispose(); c.material.dispose(); });
    partGlow = null;
  }
  /** 拆解后点击构件：命中的构件叠加一层独特高亮（青色半透 + 线框），返回构件名与屏幕投影函数（信息卡贴在构件上方）。 */
  function pickPart(clientX, clientY) {
    if (!exploded || !live()) return null;
    const T = viewer.extensions.THREE;
    const canvas = viewer.extensions.canvas;
    const rect = canvas.getBoundingClientRect();
    const ndc = new T.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new T.Raycaster();
    ray.setFromCamera(ndc, viewer.extensions.camera);
    // 框架类构件（提升机立柱、护栏）中空且多为单面：先按网格求交（临时双面），未命中则取屏幕包围框包含点击点、离相机最近的构件。
    let part = null;
    let best = Infinity;
    exploded.forEach((p) => p.mesh.updateWorldMatrix(true, false));
    for (const p of exploded) {
      const mats = Array.isArray(p.mesh.material) ? p.mesh.material : [p.mesh.material];
      const sides = mats.map((m) => m.side);
      mats.forEach((m) => { m.side = T.DoubleSide; });
      const h = ray.intersectObject(p.mesh, false)[0];
      mats.forEach((m, i) => { m.side = sides[i]; });
      if (h && h.distance < best) { best = h.distance; part = p; }
    }
    if (!part) {
      const cam = viewer.extensions.camera;
      for (const p of exploded) {
        const b = new T.Box3().setFromObject(p.mesh);
        const corners = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => new T.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).project(cam));
        const xs = corners.map((c) => c.x); const ys = corners.map((c) => c.y);
        if (ndc.x < Math.min(...xs) || ndc.x > Math.max(...xs) || ndc.y < Math.min(...ys) || ndc.y > Math.max(...ys)) continue;
        const d = b.getCenter(new T.Vector3()).distanceTo(cam.position);
        if (d < best) { best = d; part = p; }
      }
    }
    clearPartGlow();
    if (!part) return null;
    const overlay = new T.Mesh(part.mesh.geometry, new T.MeshBasicMaterial({ color: "#ffb347", transparent: true, opacity: 0.55, side: T.DoubleSide, depthTest: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    const wire = new T.LineSegments(new T.EdgesGeometry(part.mesh.geometry, 30), new T.LineBasicMaterial({ color: "#ffe2a6", transparent: true, opacity: 0.9, depthTest: false }));
    wire.renderOrder = 999;
    overlay.add(wire);
    overlay.name = "xy-part-glow";
    overlay.renderOrder = 998;
    overlay.raycast = () => {};
    part.mesh.add(overlay);
    partGlow = { overlay, part };
    const index = exploded.indexOf(part);
    return {
      index, total: exploded.length, nodeName: part.name,
      size: new T.Box3().setFromObject(part.mesh).getSize(new T.Vector3()).toArray(),
      /** 构件包围盒顶部中点在画布上的像素位置（随相机实时变化）。 */
      screen() {
        if (!partGlow || partGlow.part !== part || !live()) return null;
        const b = new T.Box3().setFromObject(part.mesh);
        const p = new T.Vector3((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2).project(viewer.extensions.camera);
        if (p.z > 1) return null;
        return { x: ((p.x + 1) / 2) * rect.width + rect.left, y: ((1 - p.y) / 2) * rect.height + rect.top };
      },
    };
  }
  function collapse() {
    clearPartGlow();
    if (!exploded) return;
    exploded.off();
    exploded.forEach(({ mesh, from }) => mesh.position.copy(from));
    exploded = null;
  }
  /** 拆开后镜头外拉，完整框住所有散开的构件（按爆炸终态计算，不等动画结束）。 */
  function frameExploded() {
    if (!exploded || !live()) return Promise.resolve();
    const T = viewer.extensions.THREE;
    const box = new T.Box3();
    exploded.forEach(({ mesh, from, offset }) => {
      const now = mesh.position.clone();
      mesh.position.copy(from).add(offset);
      mesh.updateWorldMatrix(true, false);
      box.expandByObject(mesh);
      mesh.position.copy(now);
      mesh.updateWorldMatrix(true, false);
    });
    const c = box.getCenter(new T.Vector3());
    const r = box.getSize(new T.Vector3()).length() / 2;
    const cam = viewer.extensions.camera;
    const dist = r / Math.sin(T.MathUtils.degToRad(cam.fov / 2)) * 0.95;
    const dir = cam.position.clone().sub(c);
    dir.y = Math.max(dir.y, dir.length() * 0.35);
    dir.normalize();
    return fly({ id: "xy-explode-view", name: "部件拆解", position: c.clone().addScaledVector(dir, Math.max(dist, 6)).toArray(), target: c.toArray() }, 800);
  }

  // 设备聚焦框：按台账包围盒绘制地面光框 + 竖向棱线。室内设备的部分构件被合批到别的节点，描边只能覆盖一部分，光框保证整台设备被完整标示。
  let focusFrame = null;
  function clearFocusFrame() {
    if (!focusFrame) return;
    focusFrame.off();
    focusFrame.group.removeFromParent();
    focusFrame.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    focusFrame = null;
  }
  function showFocusFrame(id, color = "#3ee6d4") {
    clearFocusFrame();
    const item = catalog.devices.find((x) => x.id === id);
    if (!live() || !item) return;
    const T = viewer.extensions.THREE;
    const group = new T.Group();
    group.name = "xy-focus-frame";
    const live3 = viewer.extensions.getObject(deviceRef(id));
    // 机械臂台账只记了底座节点，臂身网格挂在模型根下的其他节点：收集中心落在底座周边的的网格一并包进光框。
    // AGV、堆垛机、转运机：取设备节点实时包围盒。
    const parts = [];
    if (live3 && /^(JXB|ZJXB)/.test(id)) {
      const near = new T.Box3(new T.Vector3(...item.min), new T.Vector3(...item.max));
      near.min.x -= 1.5; near.min.z -= 0.3; near.max.x += 1.5; near.max.z += 0.3; near.max.y += 2.5;
      const size = new T.Vector3();
      let root = live3;
      while (root.parent && root.parent.parent && root.parent !== viewer.extensions.scene && !/^xy-/.test(root.name)) root = root.parent;
      root.traverse((o) => {
        if (!o.isMesh || !o.visible) return;
        const b = new T.Box3().setFromObject(o);
        if (b.getSize(size).length() < 3.5 && near.containsPoint(b.getCenter(new T.Vector3()))) parts.push(o);
      });
    } else if (live3 && /^(AGV|DDJ|ZYJ)/.test(id)) parts.push(live3);
    const box = () => {
      const b = new T.Box3(new T.Vector3(...item.min), new T.Vector3(...item.max));
      if (parts.length) {
        const r = new T.Box3();
        parts.forEach((o) => r.expandByObject(o));
        if (!r.isEmpty()) return (/^(JXB|ZJXB)/.test(id) ? r.union(b) : r).expandByScalar(0.15);
      }
      return b.expandByScalar(0.15);
    };
    const edges = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1, 1, 1)), new T.LineBasicMaterial({ color, transparent: true, opacity: 0.95, depthTest: false }));
    edges.renderOrder = 997;
    const fill = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.08, depthWrite: false }));
    group.add(edges, fill);
    viewer.extensions.scene.add(group);
    const t0 = performance.now();
    const off = viewer.extensions.onFrame(() => {
      const b = box();
      b.getCenter(group.position);
      const s = b.getSize(new T.Vector3());
      edges.scale.copy(s); fill.scale.copy(s);
      edges.material.opacity = 0.55 + 0.4 * Math.abs(Math.sin((performance.now() - t0) / 450));
    });
    focusFrame = { group, off };
  }

  // 聚焦跟随：设备运动时把“相机位置 + 环绕中心”按设备位移同步平移。只叠加增量，用户拖拽旋转/缩放照常生效（相对设备的视角被保留）；
  // 用户平移（右键）、滚轮外拉超过 4 倍距离或做其他镜头操作时由页面调用 stopFollow。
  let following = null;
  function followDevice(id) {
    stopFollowDevice();
    const ref = deviceRef(id);
    const obj = ref && viewer.extensions.getObject(ref);
    if (!live() || !obj) return false;
    const T = viewer.extensions.THREE;
    const center = () => new T.Box3().setFromObject(obj).getCenter(new T.Vector3());
    let last = center();
    const off = viewer.extensions.onFrame(() => {
      if (!live()) return;
      const now = center();
      const delta = now.clone().sub(last);
      last = now;
      if (delta.lengthSq() < 1e-8 || delta.length() > 5) return;
      const pose = viewer.camera.getPose();
      viewer.camera.setPose({ id: "xy-follow", name: "跟随设备", position: pose.position.map((v, k) => v + delta.getComponent(k)), target: pose.target.map((v, k) => v + delta.getComponent(k)) });
    });
    following = { id, off };
    return true;
  }
  function stopFollowDevice() { if (following) { following.off(); following = null; } }
  const MOVING = /^(AGV|DDJ|JXB|ZJXB|ZYJ|ZSJ-A|ZSJ-B)/;

  // POI 像素级遮挡：SDK 的标注精灵默认关闭深度测试（永远浮在最上层）；开启遮挡时对设备/监控/专题点位打开深度测试，
  // 被墙体挡住的部分直接不绘制。楼栋标签锚点位于楼体内部，仍由深度探测（抬升到屋顶）整体判定。
  const spriteKinds = () => {
    const map = new Map();
    viewer.scene.getByTypes(["Poi"]).forEach((e) => {
      const id = e.toJSON().customId || "";
      map.set(e.eid, id.startsWith(prefix) ? pointKinds.get(id) : "layer");
    });
    return map;
  };
  let kindsByEid = new Map();
  let kindsAt = 0;
  const offDepth = viewer.extensions.onFrame(() => {
    if (!live()) return;
    const group = viewer.extensions.scene.getObjectByName("twin-coverings");
    if (!group) return;
    const opts = occlusion.getOptionsRef();
    if (performance.now() - kindsAt > 1000) { kindsByEid = spriteKinds(); kindsAt = performance.now(); }
    group.children.forEach((s) => {
      if (!s.isSprite || !s.userData.eid) return;
      const kind = kindsByEid.get(s.userData.eid);
      const want = Boolean(opts.enabled && kind && kind !== "building" && opts.kinds[kind] !== false);
      if (s.material.depthTest !== want) { s.material.depthTest = want; s.material.needsUpdate = true; }
    });
  });

  /**
   * 拆楼：按“楼栋:分层”键隐藏外壳节点（屋顶、外墙、楼板），露出室内。
   * 传楼栋 id（production）等于拆该楼全部分层；传 "production:2F" 只拆该层；空数组即复原。返回当前生效的分层键。
   */
  function setCutaway(keys) {
    if (!live()) return [];
    const next = new Set();
    [].concat(keys || []).forEach((key) => {
      const [id, layer] = String(key).split(":");
      const groups = CUT_GROUPS[id];
      if (!groups) return;
      if (layer) { if (groups.some((g) => g.id === layer)) next.add(`${id}:${layer}`); } else groups.forEach((g) => next.add(`${id}:${g.id}`));
    });
    cutBuildings = [...next];
    cutHidden = cutBuildings.flatMap((key) => {
      const [id, layer] = key.split(":");
      return CUT_GROUPS[id].find((g) => g.id === layer).nodes.map((name) => resolve(SHELL_ENTITY, name)).filter(Boolean);
    });
    syncNodes();
    return cutBuildings.slice();
  }

  const deviceRef = (id) => {
    const device = catalog.devices.find((item) => item.id === id);
    return device ? resolve(device.entityId, device.nodeName) : null;
  };

  async function addLayerPois(items, { entityName = "XY专题点位", kind = "layer" } = {}) {
    if (!live() || !items.length) return [];
    const created = await createPOIs(items.map((item) => ({ ...item, bVisible: false })), { entityName, viewer });
    if (!live()) { if (created.length && getTwinApp() === app) await viewer.scene.delete(created); return []; }
    created.forEach((entity, index) => occlusion.track(entity, { position: items[index].location, kind: items[index].kind || kind }));
    await occlusion.setWanted(created, true);
    layerEntities.push(...created);
    return created;
  }

  /** 覆盖物（Range/Path/HeatMap/Vtk/Text3D…）统一登记，图层关闭或离开页面时删除。 */
  async function addCoverings(list) {
    if (!live() || !list.length) return [];
    const created = await viewer.scene.creates(list);
    if (!live()) { if (getTwinApp() === app) await viewer.scene.delete(created).catch(() => {}); return []; }
    layerEntities.push(...created);
    return created;
  }

  async function removeEntities(entities) {
    const list = entities.filter(Boolean);
    if (!list.length) return;
    occlusion.untrack(list);
    const set = new Set(list);
    layerEntities = layerEntities.filter((entity) => !set.has(entity));
    if (live() && viewer.getState() === "ready") await viewer.scene.delete(list).catch(() => {});
  }

  return {
    ready,
    occlusion,
    catalog,
    hasFloor: (id, floor) => nodes.some((node) => node.id === id && node.floor === floor),
    filterCameras(visible) { showCameras = visible; return filterPoints("camera"); },
    filterDevice(visible) { showDevice = visible; return filterPoints("device"); },
    applyFloor,
    setEntitiesVisible,
    showPipelineVfx: (visible) => setEntitiesVisible(PIPELINE_VFX, visible),
    setCutaway,
    getCutaway: () => cutBuildings.slice(),
    cutGroups: CUT_GROUPS,
    describeNode,
    explode,
    frameExploded,
    collapse,
    pickPart,
    clearPartGlow,
    isExploded: () => Boolean(exploded),
    showFocusFrame,
    prewarmShaders,
    clearFocusFrame,
    followDevice,
    stopFollowDevice,
    isMoving: (id) => MOVING.test(id),
    following: () => (following ? following.id : null),
    select(ref) { if (live()) { if (ref) sdkSelect(ref, "xy"); else sdkSelect(null, "xy"); } },
    setPickEnabled(on) { pickEnabled = Boolean(on); },
    deviceRef,
    facilityRef: (f) => resolve(f.entityId, f.nodeName),
    /** 消防设施逐个点位：设施节点为合并网格，按顶点空间聚类（2 m 网格连通）拆出每个设施的世界坐标中心。 */
    facilityPoints(f) {
      const ref = resolve(f.entityId, f.nodeName);
      const root = ref && viewer.extensions.getObject(ref);
      if (!root) return [];
      const T = viewer.extensions.THREE;
      root.updateWorldMatrix(true, true);
      const cell = 1.2;
      const cells = new Map();
      const v = new T.Vector3();
      const local = new T.Matrix4();
      const world = new T.Matrix4();
      const add = (m, matrix) => {
        const pos = m.geometry.attributes.position;
        const step = Math.max(1, Math.floor(pos.count / 20000));
        for (let i = 0; i < pos.count; i += step) {
          v.fromBufferAttribute(pos, i).applyMatrix4(matrix);
          const key = `${Math.floor(v.x / cell)},${Math.floor(v.y / cell)},${Math.floor(v.z / cell)}`;
          const c = cells.get(key) || cells.set(key, { n: 0, x: 0, y: 0, z: 0, maxY: -Infinity, key }).get(key);
          c.n++; c.x += v.x; c.y += v.y; c.z += v.z; c.maxY = Math.max(c.maxY, v.y);
        }
      };
      root.traverse((m) => {
        if (!m.isMesh || !m.geometry || !m.geometry.attributes.position) return;
        if (m.isInstancedMesh) for (let i = 0; i < m.count; i++) { m.getMatrixAt(i, local); add(m, world.multiplyMatrices(m.matrixWorld, local)); }
        else add(m, m.matrixWorld);
      });
      // 相邻（26 邻域）网格连通即同一个设施。
      const seen = new Set();
      const groups = [];
      for (const c of cells.values()) {
        if (seen.has(c.key)) continue;
        const stack = [c]; seen.add(c.key);
        const g = { n: 0, x: 0, y: 0, z: 0, maxY: -Infinity };
        while (stack.length) {
          const k = stack.pop();
          g.n += k.n; g.x += k.x; g.y += k.y; g.z += k.z; g.maxY = Math.max(g.maxY, k.maxY);
          const [a, b, e] = k.key.split(",").map(Number);
          for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
            const nk = `${a + dx},${b + dy},${e + dz}`;
            if (!seen.has(nk) && cells.has(nk)) { seen.add(nk); stack.push(cells.get(nk)); }
          }
        }
        groups.push([g.x / g.n, g.maxY, g.z / g.n]);
      }
      return groups.map((p) => p.map((x) => Math.round(x * 100) / 100));
    },
    addLayerPois,
    addCoverings,
    removeEntities,
    /** 节点着色（扩展层 tint，按图层 id 独立，priority 高者生效）。 */
    tint(layer, items, priority = 1) {
      if (!live()) return;
      tintLayers.add(layer);
      viewer.extensions.clearNodeColors(layer);
      items.forEach(({ ref, color }) => { if (ref) viewer.extensions.setNodeColor(ref, color, { id: layer, priority }); });
    },
    clearTint(layer) { if (live()) viewer.extensions.clearNodeColors(layer); tintLayers.delete(layer); },
    // SDK GPU 描边需整屏额外遮罩/模糊通道（实测 58→18 FPS），这里改为共享几何的半透明叠加网格：只多几次 draw call。
    outline(id, refs, style) {
      if (!live()) return;
      this.clearOutline(id);
      const list = refs.filter(Boolean);
      if (!list.length) return;
      const T = viewer.extensions.THREE;
      const color = (style && (style.color || style.visibleColor)) || "#ffd23f";
      const mat = new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.38, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const added = [];
      list.forEach((ref) => {
        const obj = viewer.extensions.getObject(ref);
        if (!obj) return;
        const meshes = [];
        obj.traverse((o) => { if (o.isMesh && o.visible && !o.userData.xyOverlay) meshes.push(o); });
        meshes.forEach((o) => {
          const m = o.isInstancedMesh ? new T.InstancedMesh(o.geometry, mat, o.count) : new T.Mesh(o.geometry, mat);
          if (o.isInstancedMesh) m.instanceMatrix = o.instanceMatrix;
          m.userData.xyOverlay = true;
          m.raycast = () => {};
          m.renderOrder = 996;
          o.add(m);
          added.push(m);
        });
      });
      outlineIds.set(id, { mat, added });
    },
    clearOutline(id) {
      const e = outlineIds.get(id);
      if (!e) return;
      e.added.forEach((m) => m.removeFromParent());
      e.mat.dispose();
      outlineIds.delete(id);
    },
    setTime(time) { if (live()) envControl.setTime(time); },
    setWeather(weather) { if (live()) envControl.setWeather(weather); },
    restoreEnvironment() { if (live()) envControl.reset(); },
    invalidateEnvironment() { envControl.invalidate(); },
    focus(point, floor) {
      if (!live()) return Promise.resolve();
      const offset = point.kind === "camera" ? [24, 21, 33] : [39, 43, 65];
      const target = floor ? [point.position[0], point.position[1] - (4 - (parseInt(floor, 10) || 2)) * 4, point.position[2]] : point.position;
      return fly({ id: point.id, name: point.name, position: target.map((value, index) => value + offset[index]), target });
    },
    /**
     * 聚焦单台设备（不拆楼）：从室内近距离斜视，机位压在楼层净高以内，屋顶与上层楼板不会挡住。
     * detail=true 为“观察细节”：贴近到设备尺寸的 1.3 倍，适合封闭小房间内的设备。
     */
    focusDevice(id, { detail = false } = {}) {
      const device = catalog.devices.find((item) => item.id === id);
      if (!live() || !device) return Promise.resolve();
      const size = Math.max(...device.max.map((value, index) => value - device.min[index]));
      // 动画设备（机械臂、AGV、堆垛机）实时位置与交付静态包围盒不同：优先取运行时包围盒。
      let c = device.center;
      try {
        const live3 = viewer.extensions.getObject(deviceRef(id));
        const T0 = viewer.extensions.THREE;
        const b = live3 && new T0.Box3().setFromObject(live3);
        if (b && !b.isEmpty() && b.getSize(new T0.Vector3()).length() < size * 4 + 5) c = b.getCenter(new T0.Vector3()).toArray();
      } catch (error) { /* 回退静态包围盒 */ }
      const name = `xy-device-${id}${detail ? "-detail" : ""}`;
      // 聚焦统一为近景：距离约为设备尺寸的 1.1 倍（≥ 2.6 m），“观察细节”再贴近 30%。
      const reach = detail ? Math.max(2.4, size * 0.8) : Math.max(3.8, size * 1.1);
      const T = viewer.extensions.THREE;
      const ray = new T.Raycaster();
      const target = new T.Vector3(...c);
      const visible = (o) => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
      const self = viewer.extensions.getObject(deviceRef(id));
      // 合批实例无法区分到单台：只忽略“室内设备批次”落在本设备包围盒内的命中，建筑楼板等照常计入。
      const half = device.max.map((v, k) => (v - device.min[k]) / 2);
      const box = new T.Box3(new T.Vector3(...c.map((v, k) => v - half[k])), new T.Vector3(...c.map((v, k) => v + half[k]))).expandByScalar(0.3);
      const ownBatch = (h) => /equipment-batch/.test(h.object.name) && box.containsPoint(h.point);
      // 全场景射线一次约 0.5 s：只对设备周围 reach+12 m 内的网格求交（包围盒缓存一次）。
      const near = nearbyMeshes(target, reach + 12).filter((m) => !(self && isChild(m, self)));
      const firstHit = (from, dir, far) => { ray.set(from, dir); ray.far = far; return ray.intersectObjects(near, false).find((h) => visible(h.object) && !ownBatch(h)); };
      // 实测设备上方的楼板高度，机位压在楼板下 0.8 m，避免钻进楼板或被屋顶挡住。
      const up = firstHit(new T.Vector3(c[0], c[1], c[2]), new T.Vector3(0, 1, 0), 30);
      const ceiling = up ? c[1] + up.distance - 0.5 : Infinity;
      const lift = device.g === "DDJ" ? 0.6 : Math.max(0.5, Math.min(reach * 0.45, (half[1]) + (detail ? 0.6 : 1.0), ceiling - c[1]));
      const poseAt = (yaw, r) => ({ id: name, name: device.name, position: [c[0] + Math.cos(yaw) * r, c[1] + lift, c[2] + Math.sin(yaw) * r], target: c });
      // 堆垛机夹在货架巷道里：只允许沿巷道（X 轴）两端取景，镜头与载货台同高；其余设备 8 方向。
      const yaws = device.g === "DDJ" ? [0, Math.PI] : [0, 1, 2, 3, 4, 5, 6, 7].map((i) => Math.atan2(0.8, 0.6) + (i * Math.PI) / 4);
      // 室内隔断、洁净间墙体、楼板高低不一：从设备中心向候选机位方向发射射线，
      // 相机放在首个遮挡物内侧 0.4 m（无遮挡则在 reach 处），取可退距离最远的方向。
      let best = { yaw: yaws[0], r: 0, dir: null };
      for (const yaw of yaws) {
        const to = new T.Vector3(...poseAt(yaw, reach).position);
        const dir = to.clone().sub(target);
        const dist = dir.length();
        const hitOut = firstHit(target, dir.clone().normalize(), dist);
        // 楼板、墙体多为单面材质，从背面射入测不到：再从机位往回射一次，取两者中离设备最近的遮挡。
        const hitIn = firstHit(to, dir.clone().normalize().negate(), dist);
        const block = Math.min(hitOut ? hitOut.distance : Infinity, hitIn ? dist - hitIn.distance : Infinity);
        const hit = Number.isFinite(block);
        dir.normalize();
        const r = hit ? block - 0.4 : dist;
        if (r > best.r) best = { yaw, r, dir };
        if (!hit) break;
      }
      let pos = best.dir ? target.clone().addScaledVector(best.dir, Math.max(1.2, best.r)) : new T.Vector3(...poseAt(best.yaw, reach).position);
      // 楼板下有梁、风管时局部更低：机位正上方留 0.8 m 净空，不足则下压（不低于设备中心）。
      for (let k = 0; k < 6; k++) {
        const above = firstHit(pos.clone().add(new T.Vector3(0, -3, 0)), new T.Vector3(0, 1, 0), 3.8);
        if (!above) break;
        const room = above.distance - 3;
        if (room >= 0.5) break;
        pos.y = Math.max(c[1], pos.y - (0.5 - room) - 0.1);
      }
      return fly({ id: name, name: device.name, position: pos.toArray(), target: c }, 900);
    },
    /**
     * 监控视角：站在摄像头安装点，下俯约 20°。摄像头多装在墙面、立杆上，固定朝园区中心常会对着自家墙体，
     * 因此在 8 个水平方向上实测视线（屏幕中心拾取），取视线最开阔、且偏向园区中心的方向（真实视频流待接入）。
     */
    cameraView(point) {
      if (!live()) return Promise.resolve();
      const reach = 40;
      const center = overview.target;
      const toCenter = Math.atan2(center[2] - point.position[2], center[0] - point.position[0]);
      const poseAt = (yaw, origin) => ({
        id: `xy-cam-view-${point.id}`, name: point.name, position: origin,
        target: [origin[0] + Math.cos(yaw) * reach, origin[1] - reach * 0.36, origin[2] + Math.sin(yaw) * reach],
      });
      const saved = viewer.camera.getPose();
      const rect = viewer.extensions.canvas.getBoundingClientRect();
      const search = (origin) => {
        let best = { yaw: toCenter, clear: 0, score: -Infinity, origin };
        for (let i = 0; i < 8; i++) {
          const yaw = toCenter + (i * Math.PI) / 4;
          const pose = poseAt(yaw, origin);
          viewer.camera.setPose(pose);
          // setPose 只写入位姿，世界矩阵要到下一帧渲染才更新；拾取前手动刷新。
          viewer.extensions.camera.updateMatrixWorld(true);
          const hit = viewer.picking.pick(rect.width / 2, rect.height / 2);
          const clear = hit ? Math.min(reach * 2, Math.hypot(...hit.position.map((v, k) => v - origin[k]))) : reach * 2;
          const score = clear + Math.cos(yaw - toCenter) * 10;
          if (score > best.score) best = { yaw, clear, score, origin };
        }
        return best;
      };
      let best;
      try {
        best = search(point.position);
        // 安装点被屋檐、立杆、树木包围时：沿最佳方向外移 2 m、抬高 3 m 再选一次。
        if (best.clear < 10) {
          const moved = [point.position[0] + Math.cos(best.yaw) * 2, point.position[1] + 3, point.position[2] + Math.sin(best.yaw) * 2];
          const retry = search(moved);
          if (retry.clear > best.clear) best = retry;
        }
      } finally { viewer.camera.setPose(saved); }
      return fly(poseAt(best.yaw, best.origin), 900);
    },
    flyTo: fly,
    reset() {
      applyFloor(null, null);
      return live() ? fly(overview, 650) : Promise.resolve();
    },
    dispose() {
      const active = live() && viewer.getState() === "ready";
      if (active) {
        envControl.reset();
        floorHidden = [];
        cutHidden = [];
        syncNodes();
        tintLayers.forEach((layer) => viewer.extensions.clearNodeColors(layer));
        outlineIds.forEach((e) => { e.added.forEach((m) => m.removeFromParent()); e.mat.dispose(); });
        outlineIds.clear();
      }
      disposed = true;
      off();
      offDepth();
      if (active) { collapse(); clearFocusFrame(); stopFollowDevice(); sdkSelect(null, "xy"); }
      viewer.selection.set = sdkSelect;
      occlusion.dispose();
      instancedPatched.forEach(([o, original]) => { o.raycast = original; });
      instancedPatched.length = 0;
      restoreCollision();
      if (warmTimer) { clearTimeout(warmTimer); warmTimer = 0; }
      if (!active) return;
      const list = [...poi, ...layerEntities];
      if (list.length) viewer.scene.delete(list).catch(() => {});
    },
  };
}
