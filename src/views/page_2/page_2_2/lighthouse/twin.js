/**
 * 灯塔工厂交付端 · 三维调用封装
 *
 * - 标准能力直接用 twinSDK：getTwinApp().viewer（相机、选中、测量、覆盖物 POI / Path / HeatMap、节点显隐）
 * - 案例专属能力走 customApi：getTwinApp().customApi.call(name, params)（随案例发布版本冻结，由平台交付）
 * 场景实例不放进 Vue 响应式（见 @/utils/twin/app）。
 */
import { getTwinApp } from "@/utils/twin/app";

export const STATUS_META = {
  running: { label: "运行", color: "#3dff86" },
  idle: { label: "待机", color: "#ffd23a" },
  stopped: { label: "停机", color: "#8a94a3" },
  fault: { label: "故障", color: "#ff4d4f" },
};

export function app() {
  const instance = getTwinApp();
  if (!instance) throw new Error("三维场景尚未就绪");
  return instance;
}
export const viewer = () => app().viewer;

/** 调用案例专属功能；返回 Promise，错误统一抛出 TwinError（code / message）。 */
export function kit(name, params = {}) {
  return app().customApi.call(name, params);
}
export function hasKit() {
  const instance = getTwinApp();
  return Boolean(instance && instance.customApi && instance.customApi.has("getCatalog"));
}

/** 点选到的 nodeKey → 设备（最长前缀匹配，构件也能映射回所属设备）。 */
export function deviceOfNode(devices, nodeKey) {
  if (!nodeKey) return null;
  let best = null;
  for (const device of devices) {
    if (nodeKey === device.node || nodeKey.startsWith(`${device.node}-`)) {
      if (!best || device.node.length > best.node.length) best = device;
    }
  }
  return best;
}

/** 平台书签（DSL camera.views 导入为案例书签）→ 标准 SDK 飞行。 */
export async function flyToView(id, durationMs = 1400) {
  const bookmark = viewer().scene.getDocument().bookmarks.find((item) => item.id === id);
  if (!bookmark) throw new Error(`视角 ${id} 不存在`);
  await viewer().camera.flyTo(bookmark, durationMs);
  return bookmark;
}

/** 镜头被新的飞行打断属于正常交互，不提示给用户。 */
export function isCancelled(error) {
  return Boolean(error) && (error.code === "E_OPERATION_CANCELLED" || /cancel/i.test(error.message || ""));
}

/**
 * 室内 / 室外镜头分区（标准 SDK：camera.setCollision + camera.setLimits）。
 * 每次镜头飞行结束（camera.transitionEnded，先于下一帧约束执行）按镜头所在位置切换：
 * - 室内：厂房内墙多边形边界 + 高度限制（地坪以上、屋面以下），轨道最大距离 16 m，旋转中心限制在厂房内 —— 滚轮拉远、拖拽都不会飞出厂房；
 * - 室外：解除约束。
 * 飞行过程中 SDK 暂停约束，因此从室内飞往室外视角不受影响。
 */
export function createCameraZones(workshop, onChange) {
  const v = viewer();
  const m = 0.7;
  const box = { x0: workshop.x0 + m, x1: workshop.x1 - m, z0: workshop.z0 + m, z1: workshop.z1 - m };
  const low = workshop.floor + 0.5;
  const high = workshop.eave - 0.4;
  let indoor = null;
  const inside = ([x, y, z]) => x > box.x0 && x < box.x1 && z > box.z0 && z < box.z1 && y < workshop.ridge - 0.3;
  const apply = (next) => {
    if (next === indoor) return;
    indoor = next;
    if (next) {
      v.camera.setCollision({
        mode: "bounds",
        customPoints: [[box.x0, low, box.z0], [box.x1, low, box.z0], [box.x1, high, box.z1], [box.x0, high, box.z1]],
        useHeightLimit: true,
      });
      // 轨道距离上限只防止滚轮无限拉远；真正把镜头限制在厂房内的是边界多边形 + 高度限制
      v.camera.setLimits({ maxDistance: 40, targetBounds: { min: [box.x0, workshop.floor, box.z0], max: [box.x1, high, box.z1] } });
    } else {
      v.camera.resetCollision();
      v.camera.resetLimits();
    }
    if (onChange) onChange(next);
  };
  const evaluate = () => {
    const pose = v.camera.getPose ? v.camera.getPose() : null;
    const position = pose && pose.position ? pose.position : v.extensions.camera.position.toArray();
    apply(inside(position));
  };
  const off = v.events.on("camera.transitionEnded", evaluate);
  evaluate();
  return {
    evaluate,
    /** 镜头即将离开厂房（由业务主动触发的室外动作）前先解除约束。 */
    release: () => apply(false),
    dispose: () => { off(); apply(false); },
  };
}
