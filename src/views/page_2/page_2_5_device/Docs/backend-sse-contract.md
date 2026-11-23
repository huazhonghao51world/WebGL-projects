# 大模型助手 · 后端接口协议

`AiAssistantPanel.vue` 所依赖的全部后端接口。

**联调地址（中台）**：`http://172.31.9.74:8080` → 前端读 `process.env.VUE_APP_LIGHTHOUSE_API`
**IP 配置位置**：项目根目录 `.env` / `.env.development` / `.env.production`
**认证**：当前无 token，暂不需要

> `8081` 是 Agent 服务与中台之间的内部通信端口，**前端不直接调用**。前端所有接口（含 SSE 流）均走 `8080`。

---

## 1. 设备详情（校长用）

```
GET /api/v1/device/detail?level=device
```

页面加载时拉取，同时用于组装首条对话的 `context`。

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "createdAt": "2026-03-05T11:09:12.334+08:00",
    "updatedAt": "2026-03-05T11:09:12.334+08:00",
    "deviceOEE": 87,
    "runtime": 6.5,
    "shiftHours": 8,
    "todayOutput": 42,
    "last7DaysAlarms": 3,
    "basicInfo": {
      "deviceName": "CNC 加工中心",
      "model": "DMG MORI NVX 5080",
      "location": "机加车间",
      "productLine": "滚筒加工线"
    },
    "runtimeParams": {
      "spindleSpeed": 12000,
      "spindleLoad": 78.5,
      "spindleTemp": 45.2,
      "axisPositions": [
        { "axis": "X", "pos": 125.8, "load": 45.2, "error": 0.002 },
        { "axis": "Y", "pos": 200.3, "load": 52.1, "error": 0.003 },
        { "axis": "Z", "pos": 85.6, "load": 38.9, "error": 0.001 }
      ]
    },
    "cuttingTools": null,
    "maintenancePlans": [
      { "item": "主轴轴承", "next": "2026-03-18", "cycle": "每 500 小时" },
      { "item": "液压密封", "next": "2026-04-15", "cycle": "每 1000 小时" },
      { "item": "冷却液更换", "next": "2026-03-25", "cycle": "每月" },
      { "item": "全面检修", "next": "2026-06-01", "cycle": "每季度" }
    ],
    "alarmRecords": [
      { "time": "02-24 11:00", "code": "S12", "description": "主轴过载", "handled": true },
      { "time": "02-26 08:15", "code": "S125", "description": "刀库未到位", "handled": true },
      { "time": "02-28 14:30", "code": "E02", "description": "主轴过载", "handled": true },
      { "time": "03-01 09:45", "code": "W15", "description": "冷却液温度过高", "handled": false }
    ]
  }
}
```

---

## 2. 设备 RUL 列表（校长用）

```
GET /api/v1/device/rul
```

页面加载时拉取，同时用于组装首条对话的 `context`。

`health`：健康度 0–100；`recommend: true` 表示建议纳入维护计划。
`eid`：UE 场景实体 ID，用于前端聚焦定位。
新增字段：`deviceId`（所属设备）、`dl`（设计寿命）、`lh`（已用时长）、`cl`（剩余时长）。

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "createdAt": "2026-04-09T14:45:26+08:00",
      "updatedAt": "2026-04-09T14:45:26+08:00",
      "deviceId": 1,
      "eid": "Eid_10146",
      "component": "主轴",
      "dl": 1000,
      "lh": 320,
      "cl": 235,
      "rul": 85,
      "n": 11000,
      "c": 80000,
      "peq": 75000,
      "p": 3,
      "a1": 0.89,
      "viscosity": 0.5,
      "contamination": 0.2,
      "vibrationFeedback": 3,
      "health": 32,
      "recommend": true
    },
    {
      "id": 2,
      "deviceId": 1,
      "eid": "Eid_10150",
      "component": "X 轴直线导轨",
      "dl": 1200, "lh": 864, "cl": 344,
      "rul": 520, "n": 350, "c": 44500, "peq": 30000, "p": 3.33,
      "a1": 0.89, "viscosity": 0.85, "contamination": 0.7, "vibrationFeedback": 1,
      "health": 72, "recommend": false
    },
    {
      "id": 3,
      "deviceId": 1,
      "eid": "Eid_10152",
      "component": "Y 轴直线导轨",
      "dl": 1200, "lh": 816, "cl": 336,
      "rul": 480, "n": 320, "c": 44500, "peq": 28000, "p": 3.33,
      "a1": 0.89, "viscosity": 0.85, "contamination": 0.7, "vibrationFeedback": 1,
      "health": 68, "recommend": false
    },
    {
      "id": 4,
      "deviceId": 1,
      "eid": "Eid_10153",
      "component": "Z 轴直线导轨",
      "dl": 1200, "lh": 696, "cl": 296,
      "rul": 400, "n": 280, "c": 44500, "peq": 32000, "p": 3.33,
      "a1": 0.89, "viscosity": 0.7, "contamination": 0.6, "vibrationFeedback": 2,
      "health": 58, "recommend": false
    },
    {
      "id": 5,
      "deviceId": 1,
      "eid": "Eid_10147",
      "component": "控制箱",
      "dl": 1500, "lh": 1170, "cl": 520,
      "rul": 650, "n": 3000, "c": 5000, "peq": 1500, "p": 3,
      "a1": 0.89, "viscosity": 0.9, "contamination": 0.9, "vibrationFeedback": 1,
      "health": 78, "recommend": false
    },
    {
      "id": 6,
      "deviceId": 1,
      "eid": "Eid_10145",
      "component": "刀头",
      "dl": 700, "lh": 294, "cl": 14,
      "rul": 280, "n": 25, "c": 12000, "peq": 7000, "p": 3,
      "a1": 0.89, "viscosity": 0.6, "contamination": 0.5, "vibrationFeedback": 2,
      "health": 42, "recommend": true
    }
  ]
}
```

## 2b. 设备 RUL 详情（李姐用，校长酌情使用）

```
GET /api/v1/device/rul/:id
```

`health`：健康度 0–100；`recommend: true` 表示建议纳入维护计划。

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 2,
        "createdAt": "2026-03-19T15:32:05.247+08:00",
        "updatedAt": "2026-03-19T15:32:05.247+08:00",
        "deviceId": 1,
        "component": "X 轴滚珠丝杠",
        "rul": 320,
        "n": 1000,
        "c": 8000,
        "peq": 3000,
        "p": 3,
        "a1": 0.5,
        "viscosity": 1,
        "contamination": 1,
        "vibrationFeedback": 1,
        "health": 83,
        "recommend": true
    }
}
```

---

## 3. SSE 流式问答

```
中台接口：  POST /api/v1/agent/sse/stream
agent接口： POST /api/v1/chat/stream
Content-Type: application/json
Accept: text/event-stream
```

### 请求体

**首条消息**（携带设备上下文，对用户不可见）：

> ⚠️ `context` 字段结构为临时方案，待后端处理逻辑完善后可能调整。
> **每轮请求都需携带 `context`。**

```json
{
  "session_id": "",
  "content": "当前设备最值得优先排查的部件是什么？",
  "context": {
    "device_id": 1,
    "device_name": "CNC 加工中心",
    "model": "DMG MORI NVX 5080",
    "location": "机加车间",
    "oee": 87,
    "runtime_hours": 6.5,
    "spindle": {
      "speed": 12000,
      "load": 78.5,
      "temp": 45.2
    },
    "axis_positions": [
      { "axis": "X", "pos": 125.8, "load": 45.2, "error": 0.002 },
      { "axis": "Y", "pos": 200.3, "load": 52.1, "error": 0.003 },
      { "axis": "Z", "pos": 85.6, "load": 38.9, "error": 0.001 }
    ],
    "alarms": [
      { "time": "02-24 11:00", "code": "S12", "description": "主轴过载", "handled": true }
    ],
    "maintenance_plans": [
      { "item": "主轴轴承", "next": "2026-03-18", "cycle": "每 500 小时" }
    ],
    "rul": [
      {
        "id": 1,
        "component": "主轴",
        "eid": "Eid_10146",
        "rul": 85, "dl": 1000, "lh": 320, "cl": 235,
        "n": 11000, "c": 80000, "peq": 75000, "p": 3,
        "a1": 0.89, "viscosity": 0.5, "contamination": 0.2, "vibrationFeedback": 3,
        "health": 32, "recommend": true
      },
      {
        "id": 6,
        "component": "刀头",
        "eid": "Eid_10145",
        "rul": 280, "dl": 700, "lh": 294, "cl": 14,
        "n": 25, "c": 12000, "peq": 7000, "p": 3,
        "a1": 0.89, "viscosity": 0.6, "contamination": 0.5, "vibrationFeedback": 2,
        "health": 42, "recommend": true
      }
    ]
  }
}
```

**后续轮次**（每轮都携带 `context`，`session_id` 由首次 `connected` 事件返回）：

```json
{
  "session_id": "28dbf363-09c8-495b-b8d1-76edacde25dc",
  "content": "把结论整理成值班人员执行清单",
  "context": { "...": "同首条，结构相同" }
}
```

> `context` 数据来自接口 1 和 2 的返回值，页面加载后前端缓存完整结构，每轮请求复用，无额外请求。
> RUL 数组传全量字段（含 `n`、`c`、`peq` 等原始参数），`createdAt`/`updatedAt` 可在组装时过滤掉。

### SSE 事件

标准 `text/event-stream` 格式（`event:` + `data:` 行）。以下为后端实际事件，按推送顺序排列。

#### `connected`

连接建立后立即推送。**前端应在此处保存 `session_id`，用于后续轮次请求。**

```
event: connected
data: {
    "session_id": "28dbf363-09c8-495b-b8d1-76edacde25dc",
    "timestamp": 1773887815
}
```

#### `start`

后端开始处理，推理启动。

```
event: start
data: {
    "session_id": "28dbf363-09c8-495b-b8d1-76edacde25dc",
    "status": "processing",
    "context": {},
    "timestamp": 1773887815.7937016
}
```

#### `thinking_start`

思考阶段开始。前端切换到 thinking 状态，展开思考块并显示转圈动画。

```
event: thinking_start
data: {
    "message": "Agent 正在思考...",
    "timestamp": 1773887818.244253
}
```

#### `thinking`

流式思考内容，逐 token 推送，前端实时追加到思考块。

```
event: thinking
data: {
    "content": "用户询问的是...",
    "timestamp": 1773887818.2453682
}
```

#### `thinking_end`

思考阶段结束。前端自动折叠思考块，切换到 answering 状态。

```
event: thinking_end
data: {
    "message": "思考完成",
    "timestamp": 1773887819.0787363
}
```

#### `answer`

流式正式回答，逐 token 推送，前端实时追加并渲染。

> `content` 字段为 Markdown 格式，前端按 Markdown 渲染。

```
event: answer
data: {
    "content": "## 诊断结论\n\n当前建议优先关注...",
    "timestamp": 1773887818.1136417
}
```

#### `suggestions`

本轮回答结束后推送，包含 AI 生成的追问建议。**前端用此替换硬编码的推荐问题列表。**

```
event: suggestions
data: {
    "suggestions": [
        "主轴轴承的预防性检查具体包含哪些项目？",
        "请把结论整理为值班人员执行清单。",
        "如果推迟维护，最坏情况是什么？"
    ],
    "timestamp": 1773887821.6437542
}
```

#### `done`

本轮结束。

```
event: done
data: {
    "session_id": "28dbf363-09c8-495b-b8d1-76edacde25dc",
    "agent_used": "main_assistant",
    "context": {},
    "timestamp": 1773887821.7774093
}
```

#### `error`

本轮失败，前端展示错误提示并提供重试入口。

```
event: error
data: {"code": "500", "message": "模型服务异常，请稍后重试"}
```

### 前端状态机映射

| SSE 事件 | 前端状态 | 前端动作 |
|---|---|---|
| `connected` | `connecting` | 保存 `session_id` |
| `start` | `connecting` | 等待思考开始 |
| `thinking_start` | `thinking` | 展开思考块，显示转圈动画 |
| `thinking` | `thinking` | 追加思考内容到思考块 |
| `thinking_end` | `thinking → answering` | 折叠思考块，切换状态 |
| `answer` | `answering` | 追加回答内容，Markdown 渲染 |
| `suggestions` | `answering` | 更新推荐问题列表 |
| `done` | `done` | 停止 loading，允许再次输入 |
| `error` | `error` | 显示错误提示，启用重试 |

---

## 4. 中断

前端通过 `AbortController.abort()` 关闭 `fetch` 连接，服务端感知断开后停止推送。

若需显式通知后端停止推理：

```
中台接口：  POST /api/v1/agent/session/abort
agent接口： POST /api/v1/chat/interrupt
Body: { "session_id": "9b07cfc0-e9c4-472f-85d7-3cac82e0ff17" }
```

---

## 5. 重新生成

```
中台接口：  POST /api/v1/agent/sse/regenerate/stream
agent接口： POST /api/v1/chat/regenerate/stream
Body: { "session_id": "abc-123" }
```

---

## 6. 错误码

| 码 | 含义 |
|---|---|
| `400` | 请求参数错误 |
| `401` | 未认证 |
| `429` | 请求过频 |
| `500` | 服务内部错误 |
| `503` | 服务不可用 |

---

## 7. 已确认事项

| 问题 | 结论 |
|---|---|
| SSE 是否为标准 `text/event-stream` 格式？ | ✅ 是 |
| 思考内容与回答是否分 event 返回？ | ✅ 按 event 类型区分 |
| `session_id` 由前端生成还是后端返回？ | ✅ 后端首次 `connected` 返回，建议使用后端值 |
| 关闭连接能否停止推理？ | ✅ 前端关闭 / 调用中台接口均可 |
| `answer` 内容格式？ | ✅ Markdown |
| `context` 是否每轮都要传？ | ✅ 每轮都携带 |
| 是否需要认证 token？ | ✅ 暂不需要 |
| 推荐问题是否有独立接口？ | ✅ 无需，由 `suggestions` SSE 事件动态返回 |
