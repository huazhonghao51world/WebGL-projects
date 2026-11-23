# 大模型助手前端设计文档

## 1. 背景

当前页面地址为：

```text
http://localhost:3666/#/page_2/5-device?from=factory
```

对应页面文件：

```text
src/views/page_2/page_2_5_device/index.vue
```

当前页面右侧“诊断与建议”区域已经预留了一个 `SecBox`，标题为“`大模型助手`”，但内部尚未实现任何组件、交互与数据逻辑。

本设计文档用于明确该区域第一版前端方案，方便后续基于实际 SSE 接口进行开发与联调。

---

## 2. 第一版需求范围

### 2.1 包含

- 文本输入提问
- 推荐问题列表，点击可直接发问
- SSE 流式接收 AI 回复
- 显示思考状态
- 显示思考内容
- 显示完整消息列表
- 支持 Markdown 渲染
- 支持请求中断
- 支持错误提示与重试

### 2.2 不包含

- 文件上传
- 图片上传
- 语音输入
- 多会话切换
- 历史会话列表
- 独立通用聊天框架接入

---

## 3. 实现策略

### 3.1 组件定位

推荐实现为页面私有组件，而不是全局通用组件。

原因：

- 该功能当前只服务于 `page_2_5_device`
- 页面语义与设备诊断场景强绑定
- 样式需高度贴合当前右侧工业大屏面板
- 后续可能与当前页的 `RUL`、报警、设备信息联动

### 3.2 推荐文件位置

```text
src/views/page_2/page_2_5_device/components/AiAssistantPanel.vue
```

如果后续复杂度上升，可继续拆分：

```text
src/views/page_2/page_2_5_device/components/
├── AiAssistantPanel.vue
├── AiSuggestionList.vue
├── AiMessageBubble.vue
└── AiComposer.vue
```

第一版建议先用单组件完成，等逻辑稳定后再拆。

---

## 4. 界面结构设计

大模型助手区域建议分为 4 个区块：

### 4.1 顶部状态区

用于显示当前对话运行状态。

建议展示内容：

- 当前状态文案
- 小型状态点
- 可选的耗时信息
- 请求中断按钮

建议状态枚举：

- `idle`：未开始
- `connecting`：连接中
- `thinking`：思考中
- `answering`：生成回答中
- `done`：已完成
- `aborted`：已中断
- `error`：失败

### 4.2 推荐问题区

在以下情况下展示：

- 初始空态
- 消息较少时
- 上一次请求失败时

推荐问题形式建议为卡片或胶囊按钮，例如：

- 为什么主轴轴承建议维护？
- 请结合近期报警解释风险
- 给我一份本周保养建议
- 当前设备是否存在停机风险？

点击行为建议：

- 默认直接发送
- 同时将问题插入输入框

### 4.3 消息区

消息区是主区域，用于展示：

- 用户问题
- AI 回复
- AI 思考内容
- 请求中间状态
- 错误提示

其中 AI 回复与思考内容建议视觉区分：

- 正式回答：高亮主内容区域
- 思考内容：折叠面板或弱化卡片区域

### 4.4 底部输入区

包含：

- 多行文本输入框
- 发送按钮
- 清空输入按钮，可选
- 中断按钮，可与顶部状态区二选一

输入区行为建议：

- `Enter` 发送
- `Shift + Enter` 换行
- 请求进行中可禁用重复发送

---

## 5. 交互流程

### 5.1 首次进入页面

1. 显示推荐问题区
2. 状态显示为 `idle`
3. 消息列表为空

### 5.2 点击推荐问题或手动发送

1. 立即插入一条用户消息
2. 立即创建一条空的 AI 占位消息
3. 状态切换为 `connecting`
4. 建立 SSE 连接

### 5.3 收到思考阶段事件

1. 状态切换为 `thinking`
2. 更新 AI 消息中的 `thinking` 内容
3. 页面上展示“思考中”状态

### 5.4 收到回答阶段事件

1. 状态切换为 `answering`
2. 持续追加 AI 回答内容
3. Markdown 实时渲染

### 5.5 收到结束事件

1. 状态切换为 `done`
2. 标记当前 AI 消息完成
3. 保留本轮消息供后续继续提问

### 5.6 用户中断

1. 主动关闭连接
2. 状态切换为 `aborted`
3. AI 消息保留当前已返回内容

### 5.7 请求失败

1. 状态切换为 `error`
2. AI 消息显示错误说明
3. 提供“重新提问”或“重新生成”入口

---

## 6. 数据结构设计

### 6.1 面板级状态

建议组件维护如下状态：

```js
{
  assistantStatus: 'idle',
  inputText: '',
  isStreaming: false,
  activeRequestId: null,
  errorMessage: '',
  suggestions: [],
  messages: []
}
```

### 字段说明

- `assistantStatus`：当前整体状态
- `inputText`：输入框内容
- `isStreaming`：是否正在流式接收
- `activeRequestId`：当前请求 id，可选
- `errorMessage`：本轮失败提示
- `suggestions`：推荐问题列表
- `messages`：消息列表

### 6.2 推荐问题结构

```js
[
  {
    id: 's1',
    text: '为什么主轴轴承建议维护？'
  }
]
```

### 6.3 消息结构

```js
{
  id: 'msg_xxx',
  role: 'assistant',
  content: '',
  contentHtml: '',
  thinking: '',
  thinkingHtml: '',
  thinkingVisible: true,
  status: 'thinking',
  error: '',
  createdAt: 1710000000000
}
```

用户消息结构可简化为：

```js
{
  id: 'msg_user_xxx',
  role: 'user',
  content: '当前设备是否存在停机风险？',
  createdAt: 1710000000000
}
```

### 字段说明

- `role`：`user` 或 `assistant`
- `content`：AI 正式回答原始文本
- `contentHtml`：Markdown 渲染后的 HTML
- `thinking`：思考原始文本
- `thinkingHtml`：思考内容渲染后的 HTML
- `thinkingVisible`：是否展开思考内容
- `status`：当前消息状态
- `error`：该条消息级错误

---

## 7. SSE 接入设计预案

由于当前后端接口文档尚未提供，本节仅定义前端推荐预案。

### 7.1 推荐事件类型

建议后端尽量提供分事件流，而不是只返回一段纯文本。

推荐事件：

- `status`
- `thinking_delta`
- `answer_delta`
- `done`
- `error`

### 7.2 推荐事件语义

#### `status`

用于通知阶段切换，例如：

- 建立连接
- 开始思考
- 开始回答
- 完成

#### `thinking_delta`

用于增量返回思考内容。

#### `answer_delta`

用于增量返回正式回答内容。

#### `done`

用于标记当前回答结束，并可返回：

- `conversationId`
- `messageId`
- `usage`

#### `error`

用于返回本轮错误信息。

### 7.3 前端兼容策略

如果后端最终不是以上事件格式，前端仍可做兼容，但至少需要保证能区分：

- 状态事件
- 思考内容
- 回答内容
- 结束事件
- 错误事件

### 7.4 请求方式待确认

需后端确认以下问题：

- 使用原生 SSE `GET`，还是流式 `POST`
- 是否需要认证 token
- 认证 token 放在 header、query 还是 cookie
- 是否返回 `conversationId`
- 是否支持中断
- 是否支持继续上下文对话

---

## 8. Markdown 渲染方案

建议引入：

- `markdown-it`
- `dompurify`

### 8.1 渲染流程

1. 接收到原始文本
2. 使用 `markdown-it` 转为 HTML
3. 使用 `DOMPurify` 做安全清洗
4. 使用 `v-html` 渲染

### 8.2 渲染范围

建议同时支持：

- AI 正式回答 Markdown
- AI 思考内容 Markdown

### 8.3 展示差异

正式回答：

- 颜色更亮
- 行高更高
- 重点突出

思考内容：

- 默认折叠或半展开
- 背景更弱
- 字体更小
- 明显区分于正式回答

---

## 9. 状态显示设计

建议统一状态映射：

| 状态值 | 展示文案 | 说明 |
|---|---|---|
| `idle` | 等待提问 | 初始状态 |
| `connecting` | 正在连接模型 | 请求已发出 |
| `thinking` | 正在思考 | 已收到思考阶段 |
| `answering` | 正在生成回答 | 已开始返回回答 |
| `done` | 回答完成 | 本轮结束 |
| `aborted` | 已停止生成 | 用户手动中断 |
| `error` | 生成失败 | 本轮异常 |

建议额外显示：

- 最近一次更新时间
- 本轮是否已完成
- 是否允许再次发送

---

## 10. 异常场景设计

至少需要覆盖以下情况：

### 10.1 连接失败

- 无法建立 SSE
- 页面提示“连接失败，请重试”

### 10.2 返回格式异常

- 后端返回非预期事件结构
- 页面提示“响应格式异常”

### 10.3 中途断流

- 未收到 `done` 但连接关闭
- 页面提示“连接中断”

### 10.4 用户重复发送

- 流式请求过程中再次点击发送
- 建议禁止或二次确认

### 10.5 空输入

- 输入框为空时不发送

---

## 11. 样式方向

当前页面视觉基于：

- `Box`
- `SecBox`
- 全局 CSS 变量

建议助手样式遵循以下原则：

### 11.1 视觉风格

- 延续蓝青色工业大屏风格
- 保持弱透明面板感
- 不使用通用 IM 产品风格气泡
- 不使用圆润移动端聊天 UI

### 11.2 推荐视觉元素

- 细边框
- 渐变描边或淡蓝发光
- 卡片化推荐问题
- 可折叠思考区
- 清晰的滚动条样式

### 11.3 消息展示建议

用户消息：

- 右对齐或弱右偏布局
- 背景更简洁

AI 消息：

- 左对齐
- 更强调正文阅读体验

思考区：

- 内嵌次级卡片
- 可收起展开

---

## 12. 第一版实现建议

建议按以下顺序落地：

1. 在页面中预留并挂载 `AiAssistantPanel.vue`
2. 先完成静态 UI
3. 再完成本地假数据对话
4. 再接入 Markdown 渲染
5. 最后对接 SSE

这样可以把问题拆开，避免一开始把 UI、状态、流式通信混在一起。

---

## 13. 后端待确认项

后端文档到位后，需要尽快补充这些信息：

1. SSE 地址
2. 请求方法
3. 是否需要 token
4. 请求参数结构
5. 返回事件类型
6. 返回数据示例
7. 中断方式
8. 多轮会话标识字段
9. 是否有推荐问题接口
10. 是否有历史记录接口

---

## 14. 当前建议结论

基于现有需求，推荐方案如下：

- 使用页面私有组件实现
- 不引入整套聊天框架
- 使用小型工具库支持 Markdown 与安全清洗
- 先完成前端结构与状态机
- 待后端 SSE 协议确认后再接流式通信

当前这套方案对本项目最稳，也最容易保持与现有大屏风格一致。

---

## 15. 实现变更记录（v1 → v1.1）

> 本章记录第一版 Mock 实现完成后，经 UX 审查与迭代所做的改动。
> 对应文件：`components/AiAssistantPanel.vue`、`components/../index.vue`、`components/secBox.vue`

### 15.1 结构瘦身：去除冗余外壳

**问题**：组件内部自带 `.chat-shell` 边框与 `.chat-header`（含"大模型助手"标题），与外层 `SecBox` 形成双重边框、双重标题。

**改动**：
- 删除组件内 `.chat-shell`、`.chat-header`、`.chat-title` 及相关 CSS
- 组件直接裸挂在 `SecBox` 容器内，由外层提供标题与边框

---

### 15.2 异步状态机重写

**问题**：原版使用预先计算偏移量的 `setTimeout` 队列（回调地狱），用户中途中断后定时器无法干净销毁，易引发状态死锁与 DOM 错误。

**改动**：
- 完全抛弃 `timerHandles` / `queueTimeout` 机制
- 引入基于 Promise 的 `sleep(ms)` 函数
- 状态机改写为线性 `async/await + for...of` 循环
- 中断机制改为共享令牌对象 `{ aborted: false }`，挂载在 `this._abortToken`（非响应式），`stopStream()` 时设置 `aborted = true`，async 循环在每个 `await` 后通过 `alive()` 检查安全退出
- 状态流：`connecting → thinking → answering → done`，与真实 SSE 结构完全一致，后续对接只需替换数据源

---

### 15.3 消息气泡视觉重设计

**用户气泡（右对齐）**：
- 去掉多层渐变与边框叠加，改为干净深蓝实底 `linear-gradient(135deg, #1761a8, #0c3560)`
- 单条浅蓝边框，`border-bottom-right-radius: 3px` 标识气泡方向

**AI 回复（左对齐）**：
- 删除笨重的 `.assistant-card` 卡片容器
- 整个 `.assistant-row`（思考块 + 正文）使用统一轻量背景框 `rgba(20,36,58,0.72)`，细边框，左上角圆角收窄为 2px
- 开场问候区使用相同背景框，与后续 AI 回复视觉一致

---

### 15.4 思考过程交互重设计

**问题**：原版将思考过程拆分为多个 Steps 步骤，每步独立展开/收起，视觉噪音大，与工业场景"直达结论"的核心需求背离。

**改动**：
- 删除全部 `steps` 数组及相关渲染逻辑
- 改为单一思考块，行为如下：
  - `connecting / thinking` 阶段：显示**转圈 SVG 图标** + "正在结合 RUL 与报警数据分析…"（呼吸感由 CSS 旋转动画提供）
  - 思考内容在后台流式积累，`thinkingVisible = true` 自动展开，用户可实时看到内容写入
  - 进入 `answering` 阶段时 `thinkingVisible = false` 自动折叠，转圈图标切换为静态**勾号图标**
  - 完成后用户可点击勾号手动展开/折叠思考内容
- 展开/收起使用 `max-height` + `opacity` CSS 过渡动画

---

### 15.5 输入框区域优化

**改动**：
- 删除 `.composer-tip` 独占行（"AI 生成内容仅供参考"）
- Placeholder 改为 `输入设备相关问题…`，简洁不冗余
- `v-model.trim` 改为 `v-model`，避免输入空格时字符被实时抹除；trim 保留在 `submitQuestion` 逻辑层

---

### 15.6 新对话交互改造

**问题**：原版通过 `v-if` 在 Flex 顶部插入 Callout div，导致整个消息列表被挤压，视觉突兀；后改为 `this.$confirm` 全局弹窗，但弹窗层级过重，不适合工业大屏场景。

**改动**：
- 删除 `showNewChatCallout` 及顶部插入结构
- 新增 `showConfirmNewChat` 状态，驱动**内联确认条**
- 确认条使用 `position: absolute; inset: 与 composer 的 padding 值对齐`，精确覆盖输入框区域，不影响任何布局
- 出现/消失使用 `opacity + translateY` 过渡动画
- 新对话图标按钮移至 composer 最左侧

---

### 15.7 按钮 Tooltip

- 移除 HTML `title` 属性（浏览器原生 tooltip 样式不可控）
- 改用 `data-tip` 属性 + CSS `::before / ::after` 伪元素实现自定义 tooltip
- Tooltip 出现在按钮正上方，带小三角箭头，延续工业蓝黑配色
- 发送/停止按钮 tooltip 随 `isStreaming` 状态动态切换："发送" / "停止生成"

---

### 15.8 布局链修复

**问题**：`SecBox` 的 `.sec-box-content` 缺少 `min-height: 0`，打断了从 `assistant-sec → sec-box → sec-box-content → ai-panel` 的 flex 高度传递链，导致 `.ai-panel` 被内容撑高而非收缩在容器内，输入框无法固定在底部。

**改动**：
- `secBox.vue` — `.sec-box-content` 补充 `min-height: 0; display: flex; flex-direction: column`
- `index.vue` — `:deep(.sec-box)` / `:deep(.sec-box-content)` 补充 `min-height: 0`
- 整个面板高度链通过 flex 收缩正确传递，消息区 `flex: 1` 自动占满剩余空间，输入框 `flex-shrink: 0` 固定底部

---

### 15.9 文字可选中

- `.message-scroller` 根节点加 `user-select: text`
- 覆盖浏览器对 `<button>` 的默认 `user-select: none`，整个聊天内容区所有文字均可选中复制

---

### 15.10 字体变量说明

项目中 `--font-size-11` 变量**未定义**（main.scss 中只有 `--font-size-10: 0.625rem` 与 `--font-size-12: 0.75rem`），使用该变量时浏览器回退到默认值（约 16px），导致字号跳跃异常大。

**建议**：
- 需要介于两者之间的字号时，直接写 `0.6875rem`（= 11px）
- 或在 main.scss 中补充 `--font-size-11: 0.6875rem` 的定义
