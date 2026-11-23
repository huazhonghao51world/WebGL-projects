import { getViewer, peekViewer } from "./app";
import { handleTwinError, STATUS } from "@/utils/statusEnum";

/**
 * 相机相关封装（单位：米，Y 轴向上）
 * 位姿统一为 { position: [x, y, z], target: [x, y, z] }，可由 DevTools3D「相机信息」直接复制得到
 */

const isCancelled = (error) => error && error.code === "E_OPERATION_CANCELLED";

/** 飞到指定位姿；durationSeconds 为 0 时瞬切 */
export async function flyToPose(pose, durationSeconds = 1) {
  try {
    await getViewer().camera.flyTo(
      { id: pose.id || "pose", name: pose.name || "pose", position: pose.position, target: pose.target },
      Math.round(durationSeconds * 1000)
    );
    return true;
  } catch (error) {
    // 被新的相机动作打断属于正常交互，不提示
    if (!isCancelled(error)) handleTwinError(error, STATUS.FOCUS);
    return false;
  }
}

/** 当前相机位姿；场景未就绪返回 null */
export function getCameraPose() {
  const viewer = peekViewer();
  if (!viewer || viewer.getState() !== "ready") return null;
  const { position, target } = viewer.camera.getPose();
  return { position, target };
}

/** 聚焦实体（实体对象、eid 或其数组）；不传则聚焦全场景 */
export async function focusEntities(entities, durationSeconds = 0.8) {
  try {
    await getViewer().camera.focus(entities, Math.round(durationSeconds * 1000));
    return true;
  } catch (error) {
    if (!isCancelled(error)) handleTwinError(error, STATUS.FOCUS);
    return false;
  }
}

/** 复位到场景初始视角（发布时的第一个视点） */
export async function resetCamera(durationSeconds = 0.8) {
  try {
    await getViewer().camera.resetPose(Math.round(durationSeconds * 1000));
    return true;
  } catch (error) {
    if (!isCancelled(error)) handleTwinError(error, STATUS.CAMERA_RESET);
    return false;
  }
}

/**
 * 相机限制（增量合并），常用字段：
 * minDistance / maxDistance（米）、minPolarAngle / maxPolarAngle（弧度）、targetBounds { min, max }、enableRotate / enablePan / enableZoom
 */
export function setCameraLimit(limits) {
  try {
    return getViewer().camera.setLimits(limits);
  } catch (error) {
    handleTwinError(error, STATUS.CAMERA_LIMIT);
    return null;
  }
}

export function resetCameraLimit() {
  const viewer = peekViewer();
  if (viewer) viewer.camera.resetLimits();
}

/** 鼠标旋转 / 缩放 / 平移速度倍数 */
export function setCameraSpeed({ rotateSpeed, zoomSpeed, panSpeed } = {}) {
  const speed = {};
  if (rotateSpeed !== undefined) speed.rotateSpeed = rotateSpeed;
  if (zoomSpeed !== undefined) speed.zoomSpeed = zoomSpeed;
  if (panSpeed !== undefined) speed.panSpeed = panSpeed;
  return getViewer().camera.setSpeed(speed);
}

/**
 * 相机模式：RTS 环绕（默认）/ FPS 第一人称 / TPS 第三人称
 * FPS/TPS 下：拖拽转视角，WASD 移动，Shift 加速，Q/E 升降（FPS）
 */
export async function setCameraMode(mode, options = {}) {
  try {
    return await getViewer().camera.setMode({ mode, durationMs: 800, ...options });
  } catch (error) {
    if (!isCancelled(error)) handleTwinError(error, STATUS.CAMERA_MODE);
    return null;
  }
}

/** 相机碰撞：开启后相机 / 角色无法穿过模型 */
export function setCameraCollision(enabled) {
  const viewer = getViewer();
  if (enabled) viewer.camera.setCollision({ mode: "profile", collisionProfile: "pawn" });
  else viewer.camera.resetCollision();
}
