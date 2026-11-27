// 性能对照开关：逐项关闭交付端在 SDK 之上额外加的渲染负担，用于国产显卡排查。
// 来源（后者覆盖前者）：config.json cases.xy.perf；URL ?perf=项1,项2 关闭（?perf=all 全部关闭）；URL ?on=项1,项2 重新打开。
//   prewarm        场景配置包应用后的着色器预编译 + 分批预热渲染
//   shadowOverride 主光阴影 4096² 覆盖全园区
//   indoorShadow   室内设备（xy-shinei）重新投影
//   shadowRefresh  每 300 ms 强制刷新阴影（关闭后只在场景变化时刷新，同场景组工作台）
//   raycastWarm    空闲时预建拾取 BVH
//   softShadow     SDK 默认 PCFSoft 阴影（关闭后改为 PCF，同场景组工作台）
export const PERF_ITEMS = ["prewarm", "shadowOverride", "indoorShadow", "shadowRefresh", "raycastWarm", "softShadow"];

export function perfFlags(config) {
  const flags = Object.fromEntries(PERF_ITEMS.map((key) => [key, true]));
  const fromConfig = (config && config.perf) || {};
  for (const key of PERF_ITEMS) if (fromConfig[key] === false) flags[key] = false;
  const params = new URLSearchParams(window.location.search + "&" + (window.location.hash.split("?")[1] || ""));
  const list = (name) => (params.get(name) || "").split(",").map((item) => item.trim()).filter(Boolean);
  const off = list("perf");
  for (const key of off.includes("all") ? PERF_ITEMS : off) if (key in flags) flags[key] = false;
  for (const key of list("on")) if (key in flags) flags[key] = true;
  return flags;
}
