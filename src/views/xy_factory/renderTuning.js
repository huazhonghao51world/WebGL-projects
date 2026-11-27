// 渲染调优（页面级，离开页面或换版时撤销）：
// 1. 自适应近裁面：平台固定 near = 0.05 m、far = 3000 m，远近比 6 万，全景时深度精度不足，
//    屋顶光伏板与屋面（场景组只做了 -0.5 单位的 polygonOffset，按其工作台 near = 1 m 调校）出现闪烁条纹。
//    这里按相机到观察目标的距离取 near = 距离 × 0.4%，限制在 0.05–1 m：特写不穿模，全景精度回到场景组工作台水平。
// 2. 阴影限频：场景配置包的两盏平行光（1024² + 2048²）每帧重绘阴影，约占一半三角面；
//    改为每 300 ms 更新一次，设备运动的阴影仍连续，帧率提升约 50%（RTX 3070 全景 12 → 18 FPS）。
const NEAR_RATIO = 0.004;
const NEAR_MIN = 0.05;
const NEAR_MAX = 1;
const SHADOW_INTERVAL_MS = 300;

export function installRenderTuning(viewer, perf = {}) {
  const host = viewer.extensions;
  const renderer = host.renderer;
  const camera = host.camera;
  const T = host.THREE;
  const saved = { near: camera.near, auto: renderer.shadowMap.autoUpdate, type: renderer.shadowMap.type };
  // SDK ≥ 0.6.11 只在场景变化时刷新阴影（动画播放时限频），页面不再接管；旧 SDK 仍按 300 ms 限频。
  const sdkManaged = renderer.shadowMap.autoUpdate === false;
  const refresh = perf.shadowRefresh !== false && !sdkManaged;
  let lastShadow = 0;
  if (!sdkManaged) {
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
  }
  const recompile = () => host.scene.traverse((o) => { for (const m of [].concat(o.material || [])) m.needsUpdate = true; });
  if (perf.softShadow === false && renderer.shadowMap.type !== T.PCFShadowMap) {
    renderer.shadowMap.type = T.PCFShadowMap;
    recompile();
  }

  const off = host.onFrame((delta, now) => {
    const target = host.getTarget();
    const cuts = viewer.camera.getCameraCuts();
    const distance = cuts ? 0 : camera.position.distanceTo(target);
    const near = Math.min(NEAR_MAX, Math.max(NEAR_MIN, distance * NEAR_RATIO));
    if (Math.abs(near - camera.near) / camera.near > 0.05) {
      camera.near = near;
      camera.updateProjectionMatrix();
    }
    if (refresh && now - lastShadow >= SHADOW_INTERVAL_MS) {
      lastShadow = now;
      renderer.shadowMap.needsUpdate = true;
    }
  });

  return () => {
    off();
    camera.near = saved.near;
    camera.updateProjectionMatrix();
    renderer.shadowMap.autoUpdate = saved.auto;
    if (renderer.shadowMap.type !== saved.type) { renderer.shadowMap.type = saved.type; recompile(); }
  };
}
