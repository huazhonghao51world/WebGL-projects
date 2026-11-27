/**
 * 案例页面向场景 AI 助手（@twin/web-sdk/agent）注册专属能力。
 *
 * SDK Agent 会把传入的 customApi（list / has / call）自动转换为 `case_*` 工具交给大模型。
 * 平台下发的场景配置包函数（app.customApi）与页面注册的业务函数在这里合并：页面函数直接调用页面方法，
 * 因此 Agent 的操作与界面状态（告警列表、图层开关、设备台账…）始终一致。
 *
 * 注册项：{ key, title, welcome, clientName, suggestions: [{ name, items }], functions: [{ name, title, description,
 *          category, params: [{ name, type, description, required, default }], returns, handler(params, { signal }) }] }
 */
import { emitter } from "@/utils/eventBus";

let current = null;

export function registerAgentCase(definition) {
  current = definition;
  emitter.emit("agentCaseChanged", definition);
  return () => {
    if (current !== definition) return;
    current = null;
    emitter.emit("agentCaseChanged", null);
  };
}

export const currentAgentCase = () => current;

/** 打开助手面板；question 不为空时直接提问。 */
export const openAgent = (question = "") => emitter.emit("agentOpen", question);

const version = "page";

/** 合并平台 customApi 与页面注册的函数，同名时页面函数优先。 */
export function mergeCustomApi(platform, definition) {
  const own = definition ? definition.functions : [];
  const ownNames = new Set(own.map((f) => f.name));
  const platformList = () => {
    if (!platform) return [];
    try { return platform.list().filter((item) => !ownNames.has(item.name)); } catch (error) { return []; }
  };
  const api = {
    list: () => [
      ...own.map(({ handler, ...meta }) => ({ featureName: meta.name, version: `${definition.key}-${version}`, ...meta })),
      ...platformList(),
    ],
    has: (name) => ownNames.has(name) || Boolean(platform && platform.has(name)),
    async call(name, params = {}, options = {}) {
      const fn = own.find((f) => f.name === name);
      if (fn) return fn.handler(params || {}, options);
      if (platform && platform.has(name)) return platform.call(name, params, options);
      throw new Error(`未知的案例函数 ${name}`);
    },
  };
  api.fn = new Proxy({}, { get: (target, name) => (params) => api.call(String(name), params) });
  return api;
}
