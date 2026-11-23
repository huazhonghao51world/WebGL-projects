/**
 * lighthouse.js — 灯塔中台 API 封装
 * 设备详情 + RUL 数据获取，以及组装 AI 对话 context
 */

const BASE = process.env.VUE_APP_LIGHTHOUSE_API  // http://host:8080，所有前端接口统一走此地址

// ── 基础 fetch 封装 ────────────────────────────────────────────

async function get(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  return res.json()
}

// ── 接口 1：设备详情 ──────────────────────────────────────────

/**
 * @param {number|string} deviceId
 * @returns {Promise<Object>} 设备详情原始数据
 */
export async function fetchDeviceDetail(deviceId) {
  return get(`${BASE}/api/v1/device/detail?level=device&deviceId=${deviceId}`)
}

// ── 接口 2：设备 RUL 列表 ─────────────────────────────────────

/**
 * @param {number|string} deviceId
 * @returns {Promise<Array>} RUL 列表原始数据
 */
export async function fetchDeviceRul(deviceId) {
  return get(`${BASE}/api/v1/device/rul?level=device&deviceId=${deviceId}`)
}

// ── 接口 3：AI 对话 SSE ───────────────────────────────────────

/**
 * 通过 fetch + ReadableStream 实现 POST-SSE。
 * EventSource 原生只支持 GET，后端要求 POST body，所以用 fetch 手动解析 SSE 格式。
 *
 * @param {Object} opts
 * @param {string}      opts.sessionId   会话 ID，首轮传空字符串，后续用 done 事件返回值
 * @param {string}      opts.content     用户问题
 * @param {Object|null} opts.context     设备上下文（每次都传）
 * @param {AbortSignal} opts.signal      AbortController.signal，用于中断
 * @param {Function}    opts.onStatus    ({ phase }) => void
 * @param {Function}    opts.onThinking  ({ delta }) => void
 * @param {Function}    opts.onAnswer    ({ delta }) => void
 * @param {Function}    opts.onDone      ({ session_id, message_id }) => void
 * @param {Function}    opts.onError     ({ code, message }) => void
 */
export async function streamAgentResponse({
  sessionId, content, context, signal,
  onConnect, onStart, onThinkingStart, onThinking, onThinkingEnd,
  onAnswerStart, onAnswer, onSuggestions, onToolStart, onToolEnd,
  onDone, onStreamEnd, onError,
}) {
  const res = await fetch(`${BASE}/api/v1/agent/sse/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, content, context }),
    signal,
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // SSE 事件块以 \n\n 分隔
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() // 最后一段可能不完整，留到下次拼接

    for (const block of blocks) {
      if (!block.trim()) continue

      let eventName = 'message'
      let dataStr = ''

      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim()
        else if (line.startsWith('data:')) dataStr = line.slice(5).trim()
      }

      if (!dataStr) continue

      let data
      try { data = JSON.parse(dataStr) } catch { continue }

      switch (eventName) {
        case 'connect':
        case 'connected':   onConnect?.(data);      break
        case 'start':       onStart?.(data);        break
        case 'thinking_start': onThinkingStart?.(data); break
        case 'thinking':    onThinking?.(data);     break
        case 'thinking_end': onThinkingEnd?.(data); break
        case 'answer_start': onAnswerStart?.(data); break
        case 'answer':      onAnswer?.(data);       break
        case 'suggestions': onSuggestions?.(data);  break
        case 'tool_start':  onToolStart?.(data);    break
        case 'tool_end':    onToolEnd?.(data);      break
        case 'done':        onDone?.(data);         break
        case 'error':       onError?.(data);        break
      }
    }
  }

  // 流正常结束（后端关闭连接），通知调用方做收尾
  onStreamEnd?.()
}

// ── Context 组装 ──────────────────────────────────────────────

/**
 * 将设备详情和 RUL 列表组装为 AI 对话所需的 context 对象。
 * 前端每次对话都带上最新缓存的 context。
 *
 * @param {Object} detail  fetchDeviceDetail 返回值
 * @param {Array}  rulList fetchDeviceRul 返回值
 * @returns {Object} context
 */
export function assembleContext(detail, rulList) {
  const basic = detail?.basicInfo || {}
  const rp = detail?.runtimeParams || {}
  const alarms = detail?.alarmRecords || []
  const plans = detail?.maintenancePlans || []

  return {
    device_id:    detail?.id ?? null,
    device_name:  basic.deviceName ?? '',
    model:        basic.model ?? '',
    location:     basic.location ?? '',
    oee:          detail?.deviceOEE ?? null,
    runtime_hours: detail?.runtime ?? null,
    spindle: {
      speed: rp.spindleSpeed ?? null,
      load:  rp.spindleLoad ?? null,
      temp:  rp.spindleTemp ?? null,
    },
    axis_positions: (rp.axisPositions || []).map(a => ({
      axis:  a.axis,
      pos:   a.pos,
      load:  a.load,
      error: a.error,
    })),
    alarms: alarms.map(a => ({
      time:        a.time ?? '',
      code:        a.code ?? '',
      description: a.description ?? '',
      handled:     a.handled ?? false,
    })),
    maintenance_plans: plans.map(p => ({
      item:  p.item ?? '',
      next:  p.next ?? '',
      cycle: p.cycle ?? '',
    })),
    rul: (Array.isArray(rulList) ? rulList : []).map(r => ({
      id:                 r.id,
      component:          r.component,
      eid:                Array.isArray(r.eid) ? r.eid : (r.eid ? [r.eid] : []),
      rul:                r.rul,
      health:             r.health,
      recommend:          r.recommend,
      dl:                 r.dl,
      lh:                 r.lh,
      cl:                 r.cl,
      n:                  r.n,
      c:                  r.c,
      peq:                r.peq,
      p:                  r.p,
      a1:                 r.a1,
      viscosity:          r.viscosity,
      contamination:      r.contamination,
      vibrationFeedback:  r.vibrationFeedback,
    })),
  }
}
