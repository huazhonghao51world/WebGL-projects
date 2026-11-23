import lighthouseRequest, { lighthouseBaseURL } from '@/utils/lighthouseRequest'

/**
 * page_2_6 工厂能源管理接口
 * 详见：能源管理接口.md
 */

/**
 * 获取能源管理总览信息
 * GET /api/v1/energy/overview
 */
export function getEnergyOverviewAPI(params) {
    return lighthouseRequest({
        url: '/api/v1/energy/overview',
        method: 'get',
        params
    })
}

/**
 * 获取调控方案列表
 * GET /api/v1/energy/plans
 */
export function getEnergyPlansAPI(params) {
    return lighthouseRequest({
        url: '/api/v1/energy/plans',
        method: 'get',
        params
    })
}

/**
 * 获取场景联动数据（线/区域）
 * GET /api/v1/energy/scene
 */
export function getEnergySceneAPI(params) {
    return lighthouseRequest({
        url: '/api/v1/energy/scene',
        method: 'get',
        params
    })
}

/**
 * 运行孪生仿真（SSE 流式接口）
 * POST /api/v1/energy/simulate
 *
 * 由于 axios 对 SSE 支持有限，这里使用原生 fetch + ReadableStream 实现。
 *
 * @param {Object} body 请求体
 *   {
 *     factoryId, planId, pois, storagePeakOut, storagePeakMw,
 *     airStrategy, workshopShift, gridMode, buyMode
 *   }
 * @param {Object} handlers 事件处理器
 * @param {Function} [handlers.onSimulateResult] (result) 仿真结果数据
 * @param {Function} [handlers.onAnswerStart]    () AI 开始生成答案
 * @param {Function} [handlers.onAnswer]         (content) AI 流式内容追加
 * @param {Function} [handlers.onDone]           () AI 回答结束
 * @param {Function} [handlers.onError]          (errMsg) 错误
 * @returns {{ abort: Function }}  控制对象，调用 abort() 中断请求
 */
export function runEnergySimulationAPI(body, handlers = {}) {
    const controller = new AbortController()
    const url = `${lighthouseBaseURL}/api/v1/energy/simulate`

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream'
        },
        body: JSON.stringify(body || {}),
        signal: controller.signal
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`)
            }
            if (!response.body) {
                throw new Error('当前环境不支持 SSE 流式响应')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder('utf-8')
            let buffer = ''

            // SSE 协议：以 \n\n 分割事件块
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { value, done } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })

                let idx
                while ((idx = buffer.indexOf('\n\n')) !== -1) {
                    const chunk = buffer.slice(0, idx)
                    buffer = buffer.slice(idx + 2)
                    handleSseChunk(chunk, handlers)
                }
            }
            // 处理收尾残留
            if (buffer.trim()) {
                handleSseChunk(buffer, handlers)
            }
            // 读流自然结束（后端未发 done 事件时兜底）
            handlers.onDone && handlers.onDone({ reason: 'stream-closed' })
        })
        .catch((err) => {
            if (err.name === 'AbortError') return
            handlers.onError && handlers.onError(err.message || '仿真请求失败')
        })

    return {
        abort: () => controller.abort()
    }
}

/**
 * 解析单个 SSE 事件块
 * 兼容两种协议格式：
 *   1) data: {"type": "xxx", ...}
 *   2) event: xxx\ndata: {...}
 *   3) 多行 data: 拼接
 */
function handleSseChunk(chunk, handlers) {
    if (!chunk) return
    const lines = chunk.split('\n')
    let eventName = ''
    const dataLines = []

    for (const raw of lines) {
        const line = raw.replace(/\r$/, '')
        if (!line || line.startsWith(':')) continue
        if (line.startsWith('event:')) {
            eventName = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trim())
        }
    }

    const dataStr = dataLines.join('\n').trim()
    if (!dataStr) return

    let data
    try {
        data = JSON.parse(dataStr)
    } catch (e) {
        // 非 JSON：视为纯文本 answer 内容
        if (eventName === 'answer' || !eventName) {
            handlers.onAnswer && handlers.onAnswer(dataStr)
        }
        return
    }

    // type 优先从 data.type 取，其次从 event 名取
    const type = data.type || eventName

    switch (type) {
        case 'simulate_result':
            handlers.onSimulateResult && handlers.onSimulateResult(data)
            break
        case 'answer_start':
            handlers.onAnswerStart && handlers.onAnswerStart(data)
            break
        case 'answer':
            handlers.onAnswer && handlers.onAnswer(data.content || '')
            break
        case 'done':
            handlers.onDone && handlers.onDone(data)
            break
        case 'error':
            handlers.onError && handlers.onError(data.error || data.message || '未知错误')
            break
        default:
            // 兜底：未带 type 但根据负载特征识别
            if (data.tool === 'simulate_fast_run' || data.result) {
                handlers.onSimulateResult && handlers.onSimulateResult(data)
            } else if (typeof data.content === 'string') {
                handlers.onAnswer && handlers.onAnswer(data.content)
            }
    }
}
