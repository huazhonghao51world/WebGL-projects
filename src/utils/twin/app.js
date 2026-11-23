/**
 * 场景实例持有者
 *
 * TwinApp / viewer 不放进 Vuex：Vue 2 会把对象深度改造成响应式，遍历 three.js 场景图会严重拖慢甚至卡死页面。
 * Vuex 只存「是否就绪」等标量状态，实例统一从这里取。
 */
let twinApp = null;

export function setTwinApp(app) {
  twinApp = app;
}

export function getTwinApp() {
  return twinApp;
}

/** 当前 viewer；场景未就绪时抛错，调用方无需再判空 */
export function getViewer() {
  if (!twinApp) throw new Error("3D 场景尚未就绪");
  return twinApp.viewer;
}

/** 场景未就绪时返回 null，适合事件回调等「可有可无」的场景 */
export function peekViewer() {
  return twinApp ? twinApp.viewer : null;
}
