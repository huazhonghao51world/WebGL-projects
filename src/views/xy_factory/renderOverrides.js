// 页面级渲染覆盖：在场景组配置包应用之后执行，离开页面或换版时撤销。
// 1. 曝光 1.0：平台渲染器默认 1.15，场景组工作台（three 默认）为 1.0，配置包未设置曝光，平台画面整体偏亮发灰。
// 2. 室内设备阴影：配置包 l-shinei 模块把整个室内设备模型的投影 / 接收阴影都关了，这里重新打开（透明材质不投影）。
// 3. 阴影覆盖整个园区：配置包主光阴影只覆盖中心 330 m 见方，园区边缘无阴影。改为覆盖全部模型的包围球
//    （与光源方向无关，时间 / 天气调节移动太阳时仍然覆盖），贴图 4096²，normalBias 按纹素尺寸同比放大。
const EXPOSURE = 1.0;
const SHADOW_MAP = 4096;
const SHADOW_MARGIN = 5;
const MODEL_ENTITIES = ["xy-campus-exterior", "xy-campus-core", "xy-prop-sq3", "xy-mesh", "xy-shinei"];
const INDOOR_ENTITY = "xy-shinei";

export function installRenderOverrides(viewer, perf = {}) {
  // 低显存模式（国产显卡等）：不放大阴影贴图、不额外打开室内设备投影（SDK 也会把阴影贴图限制在 1024²）。
  const compact = (() => { try { return viewer.diagnostics.getMetrics().gpuProfile === "compact"; } catch (error) { return false; } })();
  if (compact) perf = { ...perf, shadowOverride: false, indoorShadow: false };
  const host = viewer.extensions;
  const T = host.THREE;
  const renderer = host.renderer;
  const undo = [];
  const entity = (entityId) => { try { return host.getObject({ entityId }); } catch (error) { return null; } };

  const exposure = renderer.toneMappingExposure;
  renderer.toneMappingExposure = EXPOSURE;
  undo.push(() => { renderer.toneMappingExposure = exposure; });

  const indoor = perf.indoorShadow === false ? null : entity(INDOOR_ENTITY);
  if (indoor) {
    const flags = [];
    indoor.traverse((o) => {
      if (!o.isMesh || (o.userData && o.userData.xyOverlay)) return;
      const materials = Array.isArray(o.material) ? o.material : [o.material];
      flags.push([o, o.castShadow, o.receiveShadow]);
      o.castShadow = !materials.every((m) => m.transparent && m.opacity < 0.9);
      o.receiveShadow = true;
    });
    undo.push(() => { for (const [o, cast, receive] of flags) { o.castShadow = cast; o.receiveShadow = receive; } });
  }

  const defaults = new Set(Object.values(host.defaultLights));
  let key = null;
  host.scene.traverse((o) => { if (o.isDirectionalLight && o.visible && o.castShadow && !defaults.has(o) && (!key || o.intensity > key.intensity)) key = o; });
  const box = new T.Box3();
  for (const id of MODEL_ENTITIES) { const root = entity(id); if (root) box.expandByObject(root); }
  if (perf.shadowOverride !== false && key && !box.isEmpty()) {
    const shadow = key.shadow;
    const cam = shadow.camera;
    const saved = {
      left: cam.left, right: cam.right, top: cam.top, bottom: cam.bottom, near: cam.near, far: cam.far, size: shadow.mapSize.clone(), normalBias: shadow.normalBias,
      position: key.position.clone(), target: key.target.position.clone(),
    };
    const sphere = box.getBoundingSphere(new T.Sphere());
    const radius = sphere.radius + SHADOW_MARGIN;
    // 主光目标移到园区包围球中心（方向、距离不变）：阴影正交相机以此为轴，覆盖范围 = 包围球。
    // 时间 / 天气调节在此之后才采集光照基准，太阳将绕新中心旋转，覆盖范围不变。
    const offset = saved.position.clone().sub(saved.target);
    const distance = Math.max(offset.length(), radius + SHADOW_MARGIN);
    key.target.position.copy(sphere.center);
    key.position.copy(sphere.center).addScaledVector(offset.normalize(), distance);
    key.updateMatrixWorld();
    key.target.updateMatrixWorld();
    const size = Math.min(SHADOW_MAP, renderer.capabilities.maxTextureSize);
    const texelBefore = (saved.right - saved.left) / saved.size.x;
    Object.assign(cam, { left: -radius, right: radius, top: radius, bottom: -radius, near: Math.max(0.5, distance - radius), far: distance + radius });
    cam.updateProjectionMatrix();
    shadow.mapSize.set(size, size);
    shadow.normalBias = saved.normalBias * ((2 * radius) / size / texelBefore);
    if (shadow.map) { shadow.map.dispose(); shadow.map = null; }
    undo.push(() => {
      Object.assign(cam, { left: saved.left, right: saved.right, top: saved.top, bottom: saved.bottom, near: saved.near, far: saved.far });
      cam.updateProjectionMatrix();
      shadow.mapSize.copy(saved.size);
      shadow.normalBias = saved.normalBias;
      key.position.copy(saved.position);
      key.target.position.copy(saved.target);
      if (shadow.map) { shadow.map.dispose(); shadow.map = null; }
    });
  }

  host.updateShadows();
  return () => {
    for (const fn of undo.reverse()) fn();
    host.updateShadows();
  };
}
