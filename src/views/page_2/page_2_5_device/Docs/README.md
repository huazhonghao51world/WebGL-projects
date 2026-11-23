# page_2_5_device Docs

本目录用于存放 `page_2_5_device` 页面中“`大模型助手`”相关设计与对接文档。

## 当前文档

- `frontend-ai-assistant-design.md`
  - 当前页面右侧“大模型助手”的前端设计文档
  - 包含界面结构、状态流转、消息结构、SSE 接入预案、样式建议

- `backend-sse-contract-template.md`
  - 后端 SSE 协议待确认模板
  - 后续拿到接口文档后，可直接按此模板补充
- `ue-custom-api.md`
  - 本页面使用的 UE 自定义 API 接口文档
  - 包含已有接口（ControlJC、EC_SplitBuildByName）及待新增接口模板
  - 新增 UE 接口时需同步更新此文档
## 当前结论

- 大模型助手作为 `page_2_5_device` 的页面私有组件实现，已完成 v1.1 迭代
- 当前实现状态（Mock）：
  - ✅ 推荐问题点击发送
  - ✅ 手动输入问题（Enter 发送，Shift+Enter 换行）
  - ✅ async/await 线性状态机（骨架与 SSE 对接结构一致）
  - ✅ 思考过程流式展示 → 自动折叠 → 手动展开
  - ✅ Markdown 渲染（markdown-it + DOMPurify）
  - ✅ 停止生成 / 错误重试
  - ✅ 内联新对话确认（无全局弹窗）
  - ✅ 自定义按钮 Tooltip
  - ✅ 整个聊天区文字可选中复制
- 当前不包含：
  - 文件上传 / 图片上传
  - 多会话管理
  - 通用聊天框架接入

## 待办事项

1. **后端 SSE 协议确认**：响应 chunk 格式、事件类型区分、session_id 生命周期（见 `backend-sse-contract-template.md`）
2. **设备数据接入**：将页面中硬编码的 KPI、报警、RUL 数据替换为 `/api/v1/device/detail` 和 `/api/v1/device/rul` 真实接口
3. **CSS 变量补全**：在 `main.scss` 中补充 `--font-size-11: 0.6875rem` 定义，消除当前变量缺失导致的字号回退问题
4. **SSE 联调**：替换 `startMockConversation` 为真实 fetch 流式读取，适配确认后的 chunk 格式

## 依赖说明

`AiAssistantPanel.vue` 依赖以下两个运行时包，均已在项目 `package.json` 中声明：

| 包名 | 版本 | 用途 |
|---|---|---|
| `markdown-it` | `^14.1.1` | 将 AI 回复的 Markdown 文本渲染为 HTML |
| `dompurify` | `^3.3.3` | 对 `markdown-it` 输出的 HTML 做 XSS 安全清洗 |

如在新环境或新项目中使用该组件，需手动安装：

```bash
npm install markdown-it dompurify
```

组件内引用方式：

```js
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
```

> 两个包均为纯前端库，无需任何 Node.js 服务端依赖，也不依赖 Vue 版本。

## 建议后续流程

1. 后端确认 SSE 响应格式
2. 补充 `backend-sse-contract-template.md` 中的空白项
3. 替换 Mock 状态机为真实 SSE，其余逻辑不动

## 建议后续文件结构

```text
page_2_5_device/
├── Docs/
│   ├── README.md
│   ├── frontend-ai-assistant-design.md
│   └── backend-sse-contract-template.md
├── components/
│   ├── axis-params.vue
│   ├── device-control.vue
│   ├── device-params.vue
│   └── AiAssistantPanel.vue
└── index.vue
```
