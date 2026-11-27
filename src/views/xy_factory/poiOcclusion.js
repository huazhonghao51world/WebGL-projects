// POI 墙体遮挡：SDK 的 POI 是屏幕层叠加，默认不受模型遮挡。这里做深度比较——
// 相机停稳后用 MeshDepthMaterial 把场景离屏渲染成一张低分辨率深度图（320×180，约一帧开销），
// 读取每个 POI 投影像素周围的场景深度；场景表面比 POI 更近（超过容差）即视为被遮挡并隐藏。
// 不用 picking.pick 逐 POI 拾取：场景 2000 万+ 三角面、无逐网格 BVH，单次拾取约 40 ms，相机移动时会把帧率拖到个位数；
// 也不用网格包围盒：合并网格（树木、围栏、地形）的包围盒覆盖大片空区域，会大量误判。
// 深度图天然包含合批实例、隐藏楼层、拆楼和剖切面；相机运动中保持上一次结果，停稳后重算。
//
// 参数（public/config.json → cases.xy.poiOcclusion，也可运行时通过页面开关 / Agent 修改）：
//   true / false                              全部开启 / 关闭
//   { enabled, kinds: { building, camera, device, layer }, tolerance: { ...米 }, intervalMs }
// tolerance：遮挡表面离 POI 不足该距离时不算遮挡（米）；intervalMs：相机停稳多久后重算。
export const occlusionDefaults = Object.freeze({
  enabled: true,
  kinds: { building: true, camera: true, device: true, layer: true },
  tolerance: { building: 8, camera: 1, device: 1.2, layer: 1.2 },
  intervalMs: 200,
});

export function resolveOcclusion(config) {
  if (typeof config === "boolean") return { ...occlusionDefaults, kinds: { ...occlusionDefaults.kinds }, tolerance: { ...occlusionDefaults.tolerance }, enabled: config };
  const value = config && typeof config === "object" ? config : {};
  return {
    enabled: value.enabled !== false,
    kinds: { ...occlusionDefaults.kinds, ...value.kinds },
    tolerance: { ...occlusionDefaults.tolerance, ...value.tolerance },
    intervalMs: Number(value.intervalMs) > 0 ? Number(value.intervalMs) : occlusionDefaults.intervalMs,
  };
}

/**
 * 离屏深度探测：BasicDepthPacking + 浮点渲染目标，避免 RGBA 打包格式随 three 版本变化。
 * 渲染时临时关闭阴影更新与背景，结束后完整恢复 viewer 的渲染状态。
 */
function createDepthProbe(viewer, width = 320, height = 180) {
  const host = viewer.extensions;
  const T = host.THREE;
  const target = new T.WebGLRenderTarget(width, height, { type: T.FloatType, depthBuffer: true });
  const material = new T.MeshDepthMaterial({ depthPacking: T.BasicDepthPacking, side: T.DoubleSide });
  const pixels = new Float32Array(width * height * 4);
  const clearColor = new T.Color();
  const point = new T.Vector3();
  let camera = null;
  let log = false;

  // 深度值 [0,1] → 视空间距离（米）
  const toDistance = (d) => {
    const { near, far } = camera;
    if (log) return 2 ** (d * Math.log2(far + 1)) - 1;
    return (near * far) / (far - d * (far - near));
  };

  return {
    capture() {
      const renderer = host.renderer;
      const scene = host.scene;
      camera = host.camera;
      log = Boolean(renderer.capabilities.logarithmicDepthBuffer);
      const saved = { target: renderer.getRenderTarget(), override: scene.overrideMaterial, background: scene.background, auto: renderer.shadowMap.autoUpdate, alpha: renderer.getClearAlpha() };
      renderer.getClearColor(clearColor);
      // POI 批次、覆盖物用自定义着色器做屏幕朝向；套用深度材质后会按原始顶点写入深度，把 POI 自己判成被挡住：探测时整体隐藏。
      const overlays = ["twin-coverings", "twin-poi-batch", "twin-poi-batch-top", "twin-pick-tools", "xy-focus-frame", "xy-layout-edit"].map((name) => scene.getObjectByName(name)).filter(Boolean);
      const overlayVisible = overlays.map((o) => o.visible);
      overlays.forEach((o) => { o.visible = false; });
      try {
        renderer.shadowMap.autoUpdate = false;
        scene.overrideMaterial = material;
        scene.background = null;
        renderer.setRenderTarget(target);
        renderer.setClearColor(0x000000, 1);
        renderer.clear();
        renderer.render(scene, camera);
        renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
      } finally {
        renderer.setRenderTarget(saved.target);
        renderer.setClearColor(clearColor, saved.alpha);
        scene.overrideMaterial = saved.override;
        scene.background = saved.background;
        renderer.shadowMap.autoUpdate = saved.auto;
        overlays.forEach((o, i) => { o.visible = overlayVisible[i]; });
      }
    },
    /** POI 是否被遮挡：取投影点周围 3×3 像素中最远的场景表面（避开细杆、边缘），与 POI 的视空间距离比较。 */
    occluded(position, tolerance) {
      point.set(position[0], position[1], position[2]).applyMatrix4(camera.matrixWorldInverse);
      const poiDistance = -point.z;
      if (poiDistance <= camera.near) return false;
      point.set(position[0], position[1], position[2]).project(camera);
      if (Math.abs(point.x) > 1 || Math.abs(point.y) > 1) return false;
      const px = Math.round(((point.x + 1) / 2) * (width - 1));
      const py = Math.round(((point.y + 1) / 2) * (height - 1));
      let farthest = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const x = Math.min(width - 1, Math.max(0, px + dx));
        const y = Math.min(height - 1, Math.max(0, py + dy));
        const depth = 1 - pixels[(y * width + x) * 4];
        farthest = Math.max(farthest, depth >= 1 ? Infinity : toDistance(depth));
      }
      return farthest < poiDistance - tolerance;
    },
    dispose() { target.dispose(); material.dispose(); },
  };
}

// 楼栋锚点在楼体内、屋面下约 4 m：探测点抬 1 m（标签底边），容差放宽到 8 m，只会被别的楼挡住、不会被自家屋面挡住。
const PROBE_LIFT = { building: 1 };

/**
 * 管理一组 POI 的最终显隐 = 业务需要显示（wanted） && 未被遮挡。
 * 调用方不要再直接对这些 POI 调 setVisible，改用 setWanted。
 */
export function createPoiOcclusion(viewer, config) {
  let options = resolveOcclusion(config);
  const items = new Map();
  let probe = null;
  let disposed = false;
  let timer = 0;
  let queue = Promise.resolve();
  let masked = false;
  const hiddenKinds = new Set();

  const shouldTest = (item) => options.enabled && options.kinds[item.kind] !== false;
  const probePoint = (item) => [item.position[0], item.position[1] + (PROBE_LIFT[item.kind] || 0), item.position[2]];

  function apply() {
    const show = [];
    const hide = [];
    for (const item of items.values()) {
      const target = !masked && !hiddenKinds.has(item.kind) && item.wanted && !item.occluded;
      if (target === item.applied) continue;
      item.applied = target;
      (target ? show : hide).push(item.entity);
    }
    if (!show.length && !hide.length) return queue;
    queue = queue.catch(() => {}).then(async () => {
      if (disposed || viewer.getState() !== "ready") return;
      if (show.length) await viewer.scene.setVisible(show, true);
      if (hide.length) await viewer.scene.setVisible(hide, false);
    });
    return queue;
  }

  function compute() {
    timer = 0;
    if (disposed || viewer.getState() !== "ready") return;
    const active = [...items.values()].filter((item) => item.wanted && shouldTest(item));
    let ready = false;
    if (active.length) {
      try {
        if (!probe) probe = createDepthProbe(viewer);
        probe.capture();
        ready = true;
      } catch (error) { console.warn("[xy] POI 遮挡深度探测失败", error); }
    }
    for (const item of items.values()) {
      item.occluded = ready && active.includes(item) ? probe.occluded(probePoint(item), Number(options.tolerance[item.kind]) || 1) : false;
    }
    apply();
  }

  /** 防抖：相机连续移动时不断推迟，停稳 intervalMs 后计算一次。 */
  function schedule() {
    if (disposed) return;
    clearTimeout(timer);
    timer = setTimeout(compute, options.intervalMs);
  }

  const off = viewer.events.on("camera.changed", schedule);

  return {
    /** 登记 POI：position 为世界坐标锚点，kind 决定开关与容差。 */
    track(entity, { position, kind = "layer", wanted = true }) {
      items.set(entity, { entity, position, kind, wanted, occluded: false, applied: null });
      schedule();
    },
    untrack(entities) { entities.forEach((entity) => items.delete(entity)); },
    setWanted(entities, wanted) {
      // 业务隐藏立即生效；遮挡结果随后重算。
      entities.forEach((entity) => { const item = items.get(entity); if (item) { item.wanted = wanted; if (!wanted) item.occluded = false; } });
      const pending = apply();
      schedule();
      return pending;
    },
    setOptions(next) {
      options = resolveOcclusion(typeof next === "boolean" ? next : { ...options, ...next, kinds: { ...options.kinds, ...(next && next.kinds) }, tolerance: { ...options.tolerance, ...(next && next.tolerance) } });
      if (!options.enabled) for (const item of items.values()) item.occluded = false;
      apply();
      schedule();
      return this.getOptions();
    },
    /** 一键显隐全部 POI（不改变各自的业务显隐状态）。 */
    setMasked(value) { masked = Boolean(value); return apply(); },
    isMasked: () => masked,
    /** 分组显隐：kind = building / camera / device / layer。 */
    setKindHidden(kind, hidden) { if (hidden) hiddenKinds.add(kind); else hiddenKinds.delete(kind); return apply(); },
    hiddenKinds: () => [...hiddenKinds],
    getOptions: () => JSON.parse(JSON.stringify(options)),
    getOptionsRef: () => options,
    /** 场景几何变化（楼层、拆楼、图层）后调用。 */
    refresh: schedule,
    /** 当前实际显示的 POI 世界坐标（解说卡等屏幕覆盖物据此避让）。 */
    shownPositions() { return [...items.values()].filter((item) => item.applied).map((item) => item.position); },
    stats() {
      let hidden = 0;
      for (const item of items.values()) if (item.wanted && item.occluded) hidden += 1;
      return { tracked: items.size, occluded: hidden };
    },
    dispose() {
      disposed = true;
      clearTimeout(timer);
      off();
      items.clear();
      if (probe) probe.dispose();
      probe = null;
    },
  };
}
