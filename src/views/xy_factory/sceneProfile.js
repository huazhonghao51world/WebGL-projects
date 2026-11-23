import { getTwinApp } from "@/utils/twin/app";

// 场景组的“场景配置包”（customApi 包 xy-scene-profile）：只改模型场景本身的材质、补光与性能，
// 约定见 docs/XY工厂-场景配置包约定.md。页面在场景加载和每次换版后调用一次，失败不影响业务。
const PREFIX = "xy.profile.";
const APPLY = "applySceneProfile";

export async function applySceneProfile() {
  const app = getTwinApp();
  if (!app) return null;
  const host = app.viewer.extensions;
  // 换版后旧包的效果仍在：先按约定前缀统一撤销，再交给新包重新应用。
  for (const key of host.listStates()) if (key.startsWith(PREFIX)) host.disposeState(key);
  const api = app.customApi;
  if (!api.has(APPLY)) return null;
  const info = api.list().find((item) => item.name === APPLY);
  const version = info && info.package ? info.package.packageVersion : "";
  try {
    const result = await api.call(APPLY);
    if (result && Array.isArray(result.missing) && result.missing.length) console.warn(`[xy-scene-profile ${version}] 未找到节点：`, result.missing);
    return { version, ok: true };
  } catch (error) {
    console.error(`[xy-scene-profile ${version}] 应用失败`, error);
    return { version, ok: false };
  }
}
