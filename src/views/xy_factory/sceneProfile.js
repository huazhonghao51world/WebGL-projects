import { getTwinApp } from "@/utils/twin/app";

// 场景组的“场景配置包”（customApi 包 xy-scene-profile）：只改模型场景本身的材质、补光与性能，
// 约定见 docs/XY工厂-场景配置包约定.md。页面在场景加载和每次换版后调用一次，失败不影响业务。
const PREFIX = "xy.profile.";
const APPLY = "applySceneProfile";
// 配置包模块 → 它处理的实体（包内按 host.getObject({ entityId }) 取模型，取不到就跳过该模块）。
const MODULE_ENTITIES = {
  "l-building": ["xy-campus-exterior"], "l-building2": ["xy-campus-core"], "l-shinei": ["xy-shinei"],
  "l-prop": ["xy-prop-sq3"], "l-mesh": ["xy-mesh"], "l-vfx": ["xy-vfx", "xy-vfx-vfx-mesh"],
};
// 排查 ?strip=shader：配置包执行期间，材质的 onBeforeCompile / customProgramCacheKey 赋值一律忽略，自定义 ShaderMaterial 换成普通材质。
function blockCustomShaders(host) {
  const T = host.THREE;
  const proto = T.Material.prototype;
  const saved = ["onBeforeCompile", "customProgramCacheKey"].map((key) => [key, Object.getOwnPropertyDescriptor(proto, key)]);
  for (const [key, descriptor] of saved) {
    const base = descriptor.value;
    Object.defineProperty(proto, key, { configurable: true, get() { return base; }, set() { /* 排查：忽略自定义着色器 */ } });
  }
  const ShaderMaterial = T.ShaderMaterial;
  console.warn("[xy-scene-profile] 排查：配置包执行期间禁止自定义着色器");
  return () => {
    for (const [key, descriptor] of saved) Object.defineProperty(proto, key, descriptor);
    host.scene.traverse((o) => {
      if (o.material instanceof ShaderMaterial && !o.material.isRawShaderMaterial && !/^twin-/.test(o.name)) o.visible = false;
    });
  };
}
function onlyModules(host) {
  const keep = debugParam("only");
  if (!keep.length) return null;
  const allowed = new Set(keep.flatMap((id) => MODULE_ENTITIES[id] || []));
  const blocked = Object.values(MODULE_ENTITIES).flat().filter((entityId) => !allowed.has(entityId));
  const getObject = host.getObject;
  const state = host.state;
  // 只在包执行期间生效：被排除的模型“找不到”，包把它记入 missing 并跳过；排除光照时让光照的状态登记失败，包记日志后跳过。
  host.getObject = function (ref) {
    if (ref && !ref.nodeKey && blocked.includes(ref.entityId)) throw new Error(`排查：已排除 ${ref.entityId}`);
    return getObject.call(this, ref);
  };
  if (!keep.includes("lighting")) host.state = function (key, create) {
    if (String(key).startsWith(`${PREFIX}lighting.`)) throw new Error("排查：已排除光照模块");
    return state.call(this, key, create);
  };
  console.warn("[xy-scene-profile] 排查：配置包只执行", keep.join(", "));
  return () => { delete host.getObject; delete host.state; };
}
function blockSceneEnvironment(host) {
  const scene = host.scene;
  if (scene.__xyEnvBlocked) return;
  scene.__xyEnvBlocked = true;
  for (const key of ["background", "environment"]) {
    let value = scene[key] && scene[key].isTexture ? (key === "background" ? new host.THREE.Color("#9fb6cc") : null) : scene[key];
    Object.defineProperty(scene, key, { configurable: true, get: () => value, set: (next) => { if (!next || !next.isTexture) value = next; } });
  }
  console.warn("[xy-scene-profile] 排查：已拦截天空背景与场景环境贴图");
}
const debugParam = (name) => {
  const m = (window.location.search + "&" + (window.location.hash.split("?")[1] || "")).match(new RegExp(`[?&]${name}=([^&#]*)`));
  return m ? decodeURIComponent(m[1]).split(",").map((s) => s.trim()).filter(Boolean) : [];
};

export async function applySceneProfile() {
  const app = getTwinApp();
  if (!app) return null;
  const host = app.viewer.extensions;
  // 换版后旧包的效果仍在：先按约定前缀统一撤销，再交给新包重新应用。
  for (const key of host.listStates()) if (key.startsWith(PREFIX)) host.disposeState(key);
  // 国产显卡排查：?noprofile=1 完整业务照常运行，只是不应用场景配置包（场景保持 SDK 加载的原始材质与默认灯光）。
  if (/[?&]noprofile=1/.test(window.location.search + window.location.hash)) {
    console.warn("[xy-scene-profile] 排查：已跳过场景配置包");
    return { version: "", ok: false, skipped: true };
  }
  const api = app.customApi;
  if (!api.has(APPLY)) return null;
  const info = api.list().find((item) => item.name === APPLY);
  const version = info && info.package ? info.package.packageVersion : "";
  try {
    // 国产显卡排查：?only=lighting,l-building,... 让配置包只执行这些模块，其余模块根本不运行。
    // （?modules= 是执行完整个包之后再撤销，排除不了“运行过程本身”导致的问题。）
    const restoreOnly = onlyModules(host);
    const restoreShader = debugParam("strip").some((item) => item === "shader" || item === "all") ? blockCustomShaders(host) : null;
    // 国产显卡排查：?noenv=1 从配置包应用开始就拦截天空背景 / 场景环境贴图（光照模块的半精度浮点全景图）。
    // 配置包应用期间（逐个模型异步处理）场景虽隐藏，但背景每帧都在画：three 会把全景图转成立方体贴图并做 PMREM 预滤波，
    // 所以只看 ?modules= 的结果时，光照模块其实总是先生效过。
    if (/[?&]noenv=1/.test(window.location.search + window.location.hash)) blockSceneEnvironment(host);
    let result;
    try { result = await api.call(APPLY); } finally { if (restoreOnly) restoreOnly(); if (restoreShader) restoreShader(); }
    if (result && Array.isArray(result.missing) && result.missing.length) console.warn(`[xy-scene-profile ${version}] 未找到节点：`, result.missing);
    // 国产显卡排查：?modules=lighting,l-building,... 只保留配置包的这些模块（其余模块的效果立即撤销）。
    const keep = debugParam("modules");
    if (keep.length) {
      const removed = [];
      for (const key of host.listStates()) {
        if (!key.startsWith(PREFIX)) continue;
        const name = key.slice(PREFIX.length);
        const id = name.startsWith("lighting.") ? "lighting" : name.replace(/^model\./, "");
        if (!keep.includes(id)) { host.disposeState(key); removed.push(id); }
      }
      host.updateShadows();
      console.warn("[xy-scene-profile] 排查：只保留模块", keep.join(", "), "；已撤销", removed.join(", "));
    }
    return { version, ok: true };
  } catch (error) {
    console.error(`[xy-scene-profile ${version}] 应用失败`, error);
    return { version, ok: false };
  }
}

// 交付端以 deferReveal 加载场景：模型在配置包（灯光、材质）应用后才显示，着色器按最终灯光只编译一次。
// 旧 SDK 没有 reveal 时直接跳过；失败也要显示场景，不能让页面停在空场景。
// 国产显卡排查：配置包应用后、场景显示（着色器编译）前，按 URL ?strip=项1,项2 去掉配置包的部分效果；?strip=all 全部去掉。
//   env 环境贴图/天空背景（HalfFloat 全景 → PMREM 预滤波渲染目标）   envmap 材质反射贴图（含玻璃反射 Cube）
//   fog 雾   spot 4 盏投影聚光灯   shadow 全部阴影   shader 材质自定义着色器（onBeforeCompile）   extra 配置包新增网格（远地面等）
// ?hide=实体1,实体2：隐藏整个模型实体（xy-campus-exterior / xy-campus-core / xy-shinei / xy-prop-sq3 / xy-mesh / xy-vfx / xy-vfx-vfx-mesh）。
export const STRIP_ITEMS = ["env", "envmap", "fog", "spot", "shadow", "shader", "extra"];

function stripForDebug(viewer) {
  const hide = debugParam("hide");
  if (hide.length) {
    for (const entityId of hide) { try { viewer.extensions.getObject({ entityId }).visible = false; } catch (error) { /* 实体不存在 */ } }
    console.warn("[xy-strip] 已隐藏实体：", hide.join(", "));
  }
  const list = debugParam("strip");
  if (!list.length) return;
  const items = new Set(list);
  if (items.has("all")) STRIP_ITEMS.forEach((k) => items.add(k));
  const host = viewer.extensions;
  const scene = host.scene;
  const T = host.THREE;
  const graphRoots = new Set();
  try { for (const node of host.findNodes(/.*/)) graphRoots.add(node.entityId); } catch (error) { /* 无节点 */ }
  const models = [...graphRoots].map((entityId) => { try { return host.getObject({ entityId }); } catch (error) { return null; } }).filter(Boolean);
  const inModel = (o) => { for (let p = o; p; p = p.parent) if (models.includes(p)) return true; return false; };
  if (items.has("env")) { scene.environment = null; if (scene.background && scene.background.isTexture) scene.background = new T.Color("#9fb6cc"); }
  if (items.has("fog")) scene.fog = null;
  if (items.has("shadow")) host.renderer.shadowMap.enabled = false;
  scene.traverse((o) => {
    if (items.has("spot") && o.isSpotLight) { o.visible = false; o.castShadow = false; }
    if (items.has("extra") && o.isMesh && !inModel(o) && !/^twin-/.test(o.name)) o.visible = false;
    for (const m of [].concat(o.material || [])) {
      let changed = false;
      if (items.has("envmap") && m.envMap) { m.envMap = null; changed = true; }
      if (items.has("shader") && m.onBeforeCompile !== T.Material.prototype.onBeforeCompile) {
        m.onBeforeCompile = T.Material.prototype.onBeforeCompile;
        m.customProgramCacheKey = T.Material.prototype.customProgramCacheKey;
        changed = true;
      }
      if (changed) m.needsUpdate = true;
    }
  });
  host.updateShadows();
  console.warn("[xy-strip] 已去掉配置包效果：", [...items].join(", "));
}

export async function revealScene(viewer) {
  if (!viewer || !viewer.scene || typeof viewer.scene.reveal !== "function" || viewer.getState() !== "ready") return;
  try { stripForDebug(viewer); } catch (error) { console.error("[xy-strip] 失败", error); }
  try { await viewer.scene.reveal(); } catch (error) { console.error("[xy-scene] 显示场景失败", error); }
}

let lastProfile = null;
/** 最近一次场景配置包应用结果（版本 / 是否生效），供状态栏显示。 */
export function lastSceneProfile() { return lastProfile; }

/**
 * XY 场景“完全加载”：模型已解码 → 应用场景配置包（光照、材质）→ 逐个实体编译着色器并显示。
 * 由三维场景层（layout/scene.vue）在首次加载与每次换版后调用；完成前页面面板与业务都不挂载。
 * ?bare=1（且 step < 1）跳过配置包。配置包超过 timeoutMs 未返回时直接显示，避免页面停在加载中。
 */
export async function completeSceneLoad(viewer, { onStage, timeoutMs = 60000 } = {}) {
  const query = window.location.search + window.location.hash;
  const bare = /[?&]bare=1/.test(query);
  const step = Number((query.match(/[?&]step=(\d+)/) || [])[1] || 0);
  if (!bare || step >= 1) {
    if (onStage) onStage("profile");
    lastProfile = await Promise.race([
      applySceneProfile(),
      new Promise((resolve) => setTimeout(() => { console.warn("[xy-scene] 场景配置包超时，直接显示场景"); resolve({ version: "", ok: false, timeout: true }); }, timeoutMs)),
    ]);
  } else {
    lastProfile = null;
  }
  if (onStage) onStage("reveal");
  await revealScene(viewer);
  if (onStage) onStage("warm");
  await warmPicking(viewer, onStage);
}

/**
 * 拾取 BVH 预建（加载屏期间完成）：SDK 在网格首次被射线检测时才构建 BVH。原先在加载屏关闭后由业务空闲分片构建，
 * 全园区约 10 s（本机），期间主线程每秒被占 200–600 ms，表现为“加载完后要等十来秒帧率才恢复”。
 * 这里在加载屏内一次建完（每片 ~40 ms、片间让出主线程，进度条持续更新），业务侧的预建队列随之为空。
 */
export async function warmPicking(viewer, onStage) {
  const host = viewer && viewer.extensions;
  if (!host || !host.scene) return;
  const T = host.THREE;
  const counts = new Map();
  const meshes = [];
  host.scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !o.geometry || !o.geometry.attributes.position) return;
    const fn = o.raycast;
    if (fn && fn !== T.Mesh.prototype.raycast && fn.length >= 2) counts.set(fn, (counts.get(fn) || 0) + 1);
    const size = o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count;
    if (size >= 3000) meshes.push([o, size]);
  });
  let bvhRaycast = null; let n = 0;
  counts.forEach((c, fn) => { if (c > n) { bvhRaycast = fn; n = c; } });
  if (!bvhRaycast) return;
  const queue = [...new Map(meshes.sort((a, b) => b[1] - a[1]).map(([m]) => [m.geometry, m])).values()].filter((m) => !m.geometry.boundsTree);
  const total = queue.length;
  const ray = new T.Raycaster();
  const proxy = new T.Mesh();
  const started = performance.now();
  while (queue.length) {
    const start = performance.now();
    while (queue.length && performance.now() - start < 40) {
      const mesh = queue.shift();
      if (mesh.geometry.boundsTree) continue;
      if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
      const sphere = mesh.geometry.boundingSphere;
      proxy.geometry = mesh.geometry;
      proxy.material = mesh.material;
      ray.set(sphere.center.clone().add(new T.Vector3(0, sphere.radius + 1, 0)), new T.Vector3(0, -1, 0));
      ray.far = sphere.radius * 2 + 2;
      try { bvhRaycast.call(proxy, ray, []); } catch (error) { /* 个别网格无法构建时跳过 */ }
    }
    if (onStage) onStage("warm", total ? (total - queue.length) / total : 1);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  console.info(`[xy-scene] 拾取加速结构预建完成（${total} 个几何体），用时 ${Math.round(performance.now() - started)} ms`);
}