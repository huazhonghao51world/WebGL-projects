import { Message } from "element-ui";
import { debounce } from "throttle-debounce";
import { emitter } from "@/utils/eventBus";

/**
 * 框架内置的「接口状态 / 场景事件」枚举映射
 *
 * 目的：把 SDK 抛出的 TwinError 与场景事件统一翻译成一致的用户提示与事件广播，
 * 避免各业务页各写一套 console + $message。
 *
 * 用法：
 *   import { notify, handleTwinError, STATUS } from "@/utils/statusEnum";
 *   try { await viewer.camera.focus(entity) } catch (e) { handleTwinError(e, STATUS.FOCUS) }
 *   notify(STATUS.SCENE_UPDATED, true);   // 手动触发
 */

// 提示级别
export const LEVEL = {
  SUCCESS: "success",
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  SILENT: "silent", // 只打日志 / 只广播，不弹提示
};

// 状态键：业务侧统一引用此常量，禁止散写字符串
export const STATUS = {
  SCENE_START: "SCENE_START",
  SCENE_LOADED: "SCENE_LOADED",
  SCENE_UPDATED: "SCENE_UPDATED",
  SCENE_UPDATE_FAILED: "SCENE_UPDATE_FAILED",
  CONTEXT_LOST: "CONTEXT_LOST",
  CONTEXT_RESTORED: "CONTEXT_RESTORED",
  ENTITY_ADD: "ENTITY_ADD",
  ENTITY_DELETE: "ENTITY_DELETE",
  FOCUS: "FOCUS",
  CAMERA_RESET: "CAMERA_RESET",
  CAMERA_LIMIT: "CAMERA_LIMIT",
  CAMERA_MODE: "CAMERA_MODE",
  ENV_SET: "ENV_SET",
  SCENE_NOT_READY: "SCENE_NOT_READY",
};

/**
 * 状态枚举映射表
 * success / fail：对应操作成功、失败时的提示文案与级别
 * 成功态默认 SILENT，避免正常流程刷屏；确有需要的业务再单独 notify
 */
export const STATUS_MAP = {
  [STATUS.SCENE_START]: {
    success: { level: LEVEL.SILENT, text: "交付码校验通过" },
    fail: { level: LEVEL.ERROR, text: "场景启动失败" },
  },
  [STATUS.SCENE_LOADED]: {
    success: { level: LEVEL.SILENT, text: "场景加载完成" },
    fail: { level: LEVEL.ERROR, text: "场景加载失败，请刷新重试" },
  },
  [STATUS.SCENE_UPDATED]: {
    success: { level: LEVEL.SUCCESS, text: "案例已重新发布，场景已自动更新" },
    fail: { level: LEVEL.SILENT, text: "" },
  },
  [STATUS.SCENE_UPDATE_FAILED]: {
    success: { level: LEVEL.SILENT, text: "" },
    fail: { level: LEVEL.WARNING, text: "检查场景更新失败，将稍后重试" },
  },
  [STATUS.CONTEXT_LOST]: {
    success: { level: LEVEL.SILENT, text: "" },
    fail: { level: LEVEL.WARNING, text: "显卡上下文丢失，渲染已暂停，等待浏览器恢复" },
  },
  [STATUS.CONTEXT_RESTORED]: {
    success: { level: LEVEL.SUCCESS, text: "渲染已恢复" },
    fail: { level: LEVEL.SILENT, text: "" },
  },
  [STATUS.ENTITY_ADD]: {
    success: { level: LEVEL.SILENT, text: "实体添加完成" },
    fail: { level: LEVEL.ERROR, text: "实体添加失败" },
  },
  [STATUS.ENTITY_DELETE]: {
    success: { level: LEVEL.SILENT, text: "实体已清除" },
    fail: { level: LEVEL.ERROR, text: "实体清除失败" },
  },
  [STATUS.FOCUS]: {
    success: { level: LEVEL.SILENT, text: "聚焦成功" },
    fail: { level: LEVEL.WARNING, text: "聚焦失败，未找到目标实体" },
  },
  [STATUS.CAMERA_RESET]: {
    success: { level: LEVEL.SILENT, text: "视角已复位" },
    fail: { level: LEVEL.WARNING, text: "视角复位失败" },
  },
  [STATUS.CAMERA_LIMIT]: {
    success: { level: LEVEL.SILENT, text: "" },
    fail: { level: LEVEL.WARNING, text: "相机限制参数不合法" },
  },
  [STATUS.CAMERA_MODE]: {
    success: { level: LEVEL.SILENT, text: "" },
    fail: { level: LEVEL.WARNING, text: "相机模式切换失败" },
  },
  [STATUS.ENV_SET]: {
    success: { level: LEVEL.SILENT, text: "环境设置成功" },
    fail: { level: LEVEL.WARNING, text: "环境设置失败" },
  },
  [STATUS.SCENE_NOT_READY]: {
    success: { level: LEVEL.SILENT, text: "" },
    fail: { level: LEVEL.WARNING, text: "场景尚未就绪，请稍候再试" },
  },
};

/** SDK 错误码 → 用户可读原因（优先于 STATUS_MAP 的通用失败文案） */
export const TWIN_ERROR_TEXT = {
  E_DELIVERY_INVALID: "交付码无效或已停用，请检查 public/config.json 中的 deliveryCode",
  E_DELIVERY_EXPIRED: "交付码已过期，请联系平台管理员续期",
  E_PERMISSION_DENIED: "当前页面地址未被该交付码授权，请联系平台管理员添加访问域名",
  E_STORAGE: "无法连接三维平台服务，请检查 serverUrl 与网络",
  E_ASSET_LOAD_FAILED: "模型下载或校验失败",
  E_CAPABILITY_UNAVAILABLE: "当前浏览器或显卡不支持该能力（需 WebGL2）",
  E_SCENE_NOT_READY: "场景尚未就绪，请稍候再试",
  E_ENTITY_NOT_FOUND: "未找到目标实体",
  E_INVALID_ARGUMENT: "接口参数不合法",
};

// HTTP 状态码 → 文案，供 request.js 统一提示
export const HTTP_STATUS_MAP = {
  400: "请求参数有误",
  401: "登录已失效，请重新登录",
  403: "没有访问权限",
  404: "请求的资源不存在",
  408: "请求超时，请稍后重试",
  429: "请求过于频繁，请稍后再试",
  500: "服务异常，请稍后重试",
  502: "网关异常，请稍后重试",
  503: "服务暂不可用，请稍后重试",
  504: "网关超时，请检查您的网络",
};

export function getHttpStatusText(status) {
  return HTTP_STATUS_MAP[status] || "网络错误，请检查您的网络";
}

// 同文案 500ms 内只弹一次，防止批量接口失败刷屏
const popMessage = debounce(500, (text, type) => {
  Message({ message: text, type, duration: 3000 });
});

/**
 * 按枚举弹出提示，并通过事件总线广播（供业务监听做额外处理）
 * @param {string} key STATUS 中的键
 * @param {boolean} ok 是否成功
 * @param {*} [detail] 附加的原始错误信息，仅打印到控制台
 * @param {string} [overrideText] 覆盖默认文案
 */
export function notify(key, ok = false, detail = "", overrideText = "") {
  const item = STATUS_MAP[key];
  if (!item) {
    console.warn("[statusEnum] 未登记的状态键:", key);
    return;
  }
  const { level } = ok ? item.success : item.fail;
  const text = overrideText || (ok ? item.success : item.fail).text;

  const log = ok ? console.log : console.error;
  log(`[Twin][${key}] ${text || ""}`, detail || "");

  emitter.emit("twinStatus", { key, ok, level, text, detail });

  if (level !== LEVEL.SILENT && text) popMessage(text, level);
}

/**
 * 统一处理 SDK 抛出的错误（TwinError：{ code, message, details, requestId }）
 * @param {*} error 捕获到的异常
 * @param {string} key STATUS 中的键
 */
export function handleTwinError(error, key) {
  const code = error && error.code;
  notify(key, false, error, TWIN_ERROR_TEXT[code] || "");
}
