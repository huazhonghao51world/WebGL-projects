<template>
  <div class="ai-panel">
    <div ref="messageScroller" class="message-scroller">

      <!-- 固定开场问候 -->
      <div class="assistant-greeting">
        <div class="greeting-text">
          您正在查看 {{ deviceLabel }}（设备管理 · 设备级）。预测性维护故障线在此汇聚，无需跳转其它模块。
        </div>
      </div>

      <!-- 推荐问题（无消息时展示） -->
      <div v-if="showSuggestionPanel" class="suggestion-panel">
        <div class="suggestion-list">
          <div class="suggestion-label">可以试着问我</div>
          <button
            v-for="item in visibleSuggestions"
            :key="item.id"
            class="suggestion-item"
            type="button"
            @click="sendSuggestedQuestion(item.text)"
          >{{ item.text }}</button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-if="messages.length" class="message-list" @click="onAnswerClick">
        <template v-for="msg in messages">

          <!-- 用户气泡 -->
          <div v-if="msg.role === 'user'" :key="msg.id" class="msg-row user-row">
            <div class="user-bubble">{{ msg.content }}</div>
          </div>

          <!-- AI 回复 -->
          <div v-else :key="msg.id" class="msg-row assistant-row">

            <!-- 思考块：streaming 时显示呼吸动画标签；完成后可展开详情 -->
            <div
              v-if="msg.thinking || msg.status === 'thinking' || msg.status === 'connecting'"
              class="thinking-block"
            >
              <button
                class="thinking-toggle"
                type="button"
                :disabled="msg.status === 'thinking' || msg.status === 'connecting'"
                @click="toggleThinking(msg.id)"
              >
                <!-- 思考中：三点跳动；完成后：静态勾 -->
                <span
                  v-if="msg.status === 'thinking' || msg.status === 'connecting'"
                  class="thinking-dots"
                ><i></i><i></i><i></i></span>
                <svg
                  v-else
                  class="thinking-done-icon"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(155,248,255,0.25)" stroke-width="2"/>
                  <path fill="none" stroke="rgba(155,248,255,0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M8 12.5l3 3 5-5"/>
                </svg>
                <span class="thinking-label">
                  <template v-if="msg.status === 'thinking' || msg.status === 'connecting'">
                    努力思考中
                  </template>
                  <template v-else>
                    {{ msg.thinkingVisible ? '收起思考过程' : '查看思考过程' }}
                  </template>
                </span>
                <span
                  v-if="msg.thinking && msg.status !== 'thinking' && msg.status !== 'connecting'"
                  class="thinking-chevron"
                >{{ msg.thinkingVisible ? '∧' : '∨' }}</span>
              </button>

              <transition name="think-expand">
                <div
                  v-if="msg.thinkingVisible && msg.thinking"
                  class="thinking-content markdown-body"
                  v-html="msg.thinkingHtml"
                ></div>
              </transition>
            </div>

            <!-- 正式回答 -->
            <div
              v-if="msg.content || msg.status === 'answering' || msg.status === 'done' || msg.status === 'aborted'"
              class="answer-content markdown-body"
              v-html="msg.contentHtml"
            ></div>

            <!-- 错误状态 -->
            <template v-if="msg.status === 'error'">
              <div class="msg-error">{{ msg.error || '请求失败，请稍后重试' }}</div>
              <button class="text-link" type="button" @click="retryQuestion(msg.sourceQuestion)">重新发送</button>
            </template>

          </div>
        </template>
      </div>

      <!-- 推荐追问（回答完成后展示，由后端 suggestions 事件驱动） -->
      <div v-if="showPostSuggestions" class="suggestion-panel suggestion-panel--post">
        <div class="suggestion-list">
          <div class="suggestion-label">可以继续问我</div>
          <button
            v-for="item in visibleSuggestions"
            :key="item.id"
            class="suggestion-item"
            type="button"
            @click="sendSuggestedQuestion(item.text)"
          >{{ item.text }}</button>
        </div>
      </div>

    </div>

    <!-- 输入框 -->
    <div class="composer">
      <div class="composer-inner">
        <button class="new-chat-btn" type="button" data-tip="新对话" @click="openNewChat">
          <svg viewBox="0 0 24 24" class="icon-new-chat">
            <path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>

        <el-input
          v-model="inputText"
          type="textarea"
          resize="none"
          :autosize="{ minRows: 1, maxRows: 5 }"
          maxlength="1000"
          placeholder="请输入您的问题，如：健康度..."
          @keydown.native="handleComposerKeydown"
          class="chat-input"
        />

        <button
          class="action-btn"
          type="button"
          :data-tip="isStreaming ? '停止生成' : '发送'"
          @click="handleActionClick"
          :disabled="!inputText && !isStreaming"
        >
          <svg v-if="!isStreaming" viewBox="0 0 24 24" class="icon-send" :class="{ active: !!inputText }">
            <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" class="icon-stop">
            <path fill="currentColor" d="M6 6h12v12H6z"/>
          </svg>
        </button>
      </div>

      <!-- 确认条：绝对定位覆盖在 composer-inner 上，不影响布局 -->
      <transition name="confirm-slide">
        <div v-if="showConfirmNewChat" class="new-chat-confirm">
          <span class="confirm-text">清空会话并重新开始？</span>
          <div class="confirm-actions">
            <button class="confirm-btn cancel" type="button" @click="showConfirmNewChat = false">取消</button>
            <button class="confirm-btn ok" type="button" @click="confirmNewChat">确认</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import { streamAgentResponse } from "../api/lighthouse.js";

const markdown = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: false,
});

function renderMarkdown(value) {
  return DOMPurify.sanitize(markdown.render(String(value || "")), {
    ADD_ATTR: ["data-part"],
  });
}

/**
 * 在已 sanitize 的 HTML 中，把 RUL 零件名替换为可点击链接。
 * - 只处理纯文本节点，不污染已有的 <a>/<code>/<pre>
 * - 关键词按长度倒序匹配，避免短名吃掉长名
 * - 末尾安全缓冲区：流式拼接到一半时不替换最后 N 字（N = 最长关键词长度 - 1），
 *   防止"主轴电"中途被匹配成"主轴"
 */
function decorateRulLinks(html, partNames, streaming) {
  if (!html || !partNames || !partNames.length) return html;
  const names = partNames
    .filter((n) => n && typeof n === "string")
    .slice()
    .sort((a, b) => b.length - a.length);
  if (!names.length) return html;
  const maxLen = names[0].length;
  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(names.map(escapeRegex).join("|"), "g");

  const container = document.createElement("div");
  container.innerHTML = html;

  // 遍历所有文本节点，跳过 <a>/<code>/<pre> 等容器内的
  const SKIP_TAGS = new Set(["A", "CODE", "PRE", "SCRIPT", "STYLE"]);
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let p = node.parentNode;
      while (p && p !== container) {
        if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        p = p.parentNode;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  // 收集所有文本节点（边遍历边改 DOM 不安全）
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) textNodes.push(n);

  // 流式输出时，最后一个文本节点的末尾 maxLen-1 字符暂不替换（防误匹配）
  const lastNode = streaming && textNodes.length ? textNodes[textNodes.length - 1] : null;

  textNodes.forEach((textNode) => {
    let raw = textNode.nodeValue;
    if (!raw) return;
    let tail = "";
    if (textNode === lastNode && maxLen > 1) {
      const safeCut = Math.max(0, raw.length - (maxLen - 1));
      tail = raw.slice(safeCut);
      raw = raw.slice(0, safeCut);
    }
    if (!raw) return;
    if (!pattern.test(raw)) {
      pattern.lastIndex = 0;
      return;
    }
    pattern.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let lastIdx = 0;
    let m;
    while ((m = pattern.exec(raw)) !== null) {
      if (m.index > lastIdx) {
        frag.appendChild(document.createTextNode(raw.slice(lastIdx, m.index)));
      }
      const a = document.createElement("a");
      a.className = "rul-link";
      a.setAttribute("data-part", m[0]);
      a.textContent = m[0];
      frag.appendChild(a);
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < raw.length) {
      frag.appendChild(document.createTextNode(raw.slice(lastIdx)));
    }
    if (tail) frag.appendChild(document.createTextNode(tail));
    textNode.parentNode.replaceChild(frag, textNode);
  });

  return container.innerHTML;
}

export default {
  name: "AiAssistantPanel",
  props: {
    deviceLabel: {
      type: String,
      default: "当前设备",
    },
    // 由 index.vue 每分钟轮询后传入，对话时作为系统上下文随每条消息发送
    deviceContext: {
      type: Object,
      default: null,
    },
    // 当前选中的零部件（来自 RUL 表），有值时推荐提问切换为该零件相关
    selectedPart: {
      type: Object,
      default: null,
    },
    // RUL 表数据，用于在 AI 回复里把零件名渲染成可点击链接
    rulData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      assistantStatus: "idle",
      inputText: "",
      isStreaming: false,
      activeRequestId: null,
      conversationId: "",
      showConfirmNewChat: false,
      hasSuggestions: false,
      messageSeed: 0,
      messages: [],
      visibleSuggestions: [],
      suggestionPool: [
        "这台设备健康度如何？",
        "建议什么时候保养？备件够吗？",
        "什么时候安排保养合适？还有风险吗？",
        "当前设备最值得优先排查的部件是什么？",
        "请结合近期报警解释当前停机风险。",
        "给班组长一份简短的巡检提示。",
      ],
    };
  },
  computed: {
    showSuggestionPanel() {
      return !this.messages.length && !this.isStreaming;
    },
    showPostSuggestions() {
      return this.messages.length > 0 && !this.isStreaming && this.hasSuggestions;
    },
  },
  watch: {
    messages: {
      deep: true,
      handler() {
        // 流式输出期间自动跟底；展开/折叠思考块时被 _suppressScroll 临时屏蔽
        if (!this.isStreaming || this._suppressScroll) return;
        this.$nextTick(() => this.scrollToBottom());
      },
    },
    isStreaming(val) {
      // 开始新流（新消息出现）时滚到底部；结束时不强制滚动
      if (val) this.$nextTick(() => this.scrollToBottom());
    },
    // 选中的零件变化时，若尚未开始对话，则替换预制推荐提问
    selectedPart: {
      immediate: false,
      handler(val) {
        if (this.messages.length > 0) return; // 已开始对话则不改动
        this.applySelectedPartSuggestions(val);
      },
    },
  },
  created() {
    this._abortToken = null;
    this._abortController = null;
    this._suppressScroll = false; // 展开/折叠思考块时临时抑制自动滚动
    this._renderRafId = null; // 节流 markdown 渲染的 rAF ID
  },
  mounted() {
    this.refreshSuggestions();
  },
  beforeDestroy() {
    this.stopStream(true);
    if (this._renderRafId) {
      cancelAnimationFrame(this._renderRafId);
      this._renderRafId = null;
    }
  },
  methods: {
    // ─── 工具 ────────────────────────────────────────────────
    createId(prefix) {
      this.messageSeed += 1;
      return `${prefix}_${Date.now()}_${this.messageSeed}`;
    },
    shuffle(array) {
      const cloned = array.slice();
      for (let i = cloned.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
      }
      return cloned;
    },
    findMessage(id) {
      return this.messages.find((m) => m.id === id);
    },
    scrollToBottom() {
      const el = this.$refs.messageScroller;
      if (el) el.scrollTop = el.scrollHeight;
    },
    refreshSuggestions() {
      this.visibleSuggestions = this.shuffle(this.suggestionPool)
        .slice(0, 3)
        .map((text, i) => ({ id: `sug_${i}_${Date.now()}`, text }));
    },
    /** 渲染答复 HTML：markdown → sanitize → 零件名替换为可点击链接 */
    _renderAnswer(text, streaming) {
      const html = renderMarkdown(text);
      const names = (this.rulData || [])
        .map((r) => r && r.part)
        .filter((n) => n && n !== "未连接");
      if (!names.length) return html;
      try {
        return decorateRulLinks(html, names, !!streaming);
      } catch (e) {
        return html;
      }
    },
    /** 答复内容点击事件委托：捕获 .rul-link 点击，emit 给父组件 */
    onAnswerClick(event) {
      const target = event.target;
      if (!target || !target.classList || !target.classList.contains("rul-link")) return;
      const partName = target.getAttribute("data-part");
      if (!partName) return;
      event.preventDefault();
      event.stopPropagation();
      this.$emit("select-part", partName);
    },
    /** 根据选中的零件动态替换预制推荐提问；零件为空时恢复默认 */
    applySelectedPartSuggestions(part) {
      const name = part && part.part ? String(part.part).trim() : "";
      if (!name || name === "未连接") {
        this.refreshSuggestions();
        return;
      }
      const texts = [
        `${name}剩余使用寿命还有多久？`,
        `${name}是否需要进行更换？`,
        `${name}备品是否充足？`,
      ];
      this.visibleSuggestions = texts.map((text, i) => ({
        id: `sug_part_${i}_${Date.now()}`,
        text,
      }));
    },

    // ─── 交互入口 ─────────────────────────────────────────────
    handleComposerKeydown(event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this.submitQuestion();
      }
    },
    handleActionClick() {
      if (this.isStreaming) {
        this.stopStream();
      } else {
        this.submitQuestion();
      }
    },
    openNewChat() {
      if (!this.messages.length && !this.isStreaming) return;
      this.showConfirmNewChat = true;
    },
    confirmNewChat() {
      this.showConfirmNewChat = false;
      this.stopStream(true);
      this.messages = [];
      this.inputText = "";
      this.conversationId = "";
      this.activeRequestId = null;
      this.assistantStatus = "idle";
      this.hasSuggestions = false;
      this.refreshSuggestions();
    },
    sendSuggestedQuestion(question) {
      this.submitQuestion(question);
    },
    retryQuestion(question) {
      if (!question || this.isStreaming) return;
      this.submitQuestion(question);
    },

    // ─── 提交问题 ─────────────────────────────────────────────
    submitQuestion(quickQuestion) {
      const question = (quickQuestion || this.inputText).trim();
      if (!question || this.isStreaming) return;

      const now = Date.now();
      const assistantMessage = {
        id: this.createId("assistant"),
        role: "assistant",
        thinking: "",
        thinkingHtml: "",
        thinkingVisible: false,
        content: "",
        contentHtml: "",
        status: "connecting",
        error: "",
        sourceQuestion: question,
        createdAt: now + 1,
      };

      this.messages.push(
        { id: this.createId("user"), role: "user", content: question, createdAt: now },
        assistantMessage,
      );

      this.inputText = "";
      this.assistantStatus = "connecting";
      this.isStreaming = true;
      this.hasSuggestions = false;
      this.activeRequestId = assistantMessage.id;

      // deviceContext 每次都传，内容来自 index.vue 的最新轮询缓存
      this.startRealConversation(assistantMessage.id, question, this.deviceContext);
    },

    // ─── 停止流 ───────────────────────────────────────────────
    stopStream(silent) {
      if (this._abortToken) {
        this._abortToken.aborted = true;
        this._abortToken = null;
      }
      // 中断 fetch，触发 AbortError，async 函数会 catch 后直接 return
      if (this._abortController) {
        this._abortController.abort();
        this._abortController = null;
      }

      const activeMsg = this.findMessage(this.activeRequestId);
      if (activeMsg && !["done", "error"].includes(activeMsg.status)) {
        activeMsg.status = "aborted";
      }

      this.isStreaming = false;
      this.activeRequestId = null;
      this.assistantStatus = silent && !this.messages.length ? "idle" : "done";
    },

    // ─── 对话结束收尾（done 事件 / 流关闭共用） ──────────────────
    _finalizeDone(messageId) {
      if (this.activeRequestId !== messageId) return; // 已被其他操作处理
      const m = this.findMessage(messageId);
      if (m && m.status !== "done") {
        // 最终清理：去掉末尾残留的 XML 结构标签
        const cut = m.content.match(/<\/?(answer|suggestions|thinking)\b/);
        if (cut) {
          m.content = m.content.slice(0, cut.index);
        }
        m.contentHtml = this._renderAnswer(m.content, false);
        m.status = "done";
      }
      this.assistantStatus = "done";
      this.isStreaming = false;
      this.activeRequestId = null;
    },

    // ─── 思考过程折叠 ─────────────────────────────────────────
    toggleThinking(id) {
      const msg = this.findMessage(id);
      if (!msg || !msg.thinking) return;
      const el = this.$refs.messageScroller;
      const savedTop = el ? el.scrollTop : 0;
      this._suppressScroll = true;
      msg.thinkingVisible = !msg.thinkingVisible;
      this.$nextTick(() => {
        this._suppressScroll = false;
        if (el) el.scrollTop = savedTop; // 恢复位置，展开不跳动
      });
    },

    // ─── 节流 markdown 渲染（每帧最多一次） ──────────────────────
    _scheduleRender(msg, field) {
      if (this._renderRafId) return; // 已排队，等下一帧统一渲染
      this._renderRafId = requestAnimationFrame(() => {
        this._renderRafId = null;
        if (field === 'thinking') {
          msg.thinkingHtml = renderMarkdown(msg.thinking);
        } else {
          const cut = msg.content.match(/<\/?(answer|suggestions|thinking)\b/);
          const display = cut ? msg.content.slice(0, cut.index) : msg.content;
          msg.contentHtml = this._renderAnswer(display, true);
        }
      });
    },

    // ─── 真实 SSE 对话 ────────────────────────────────────────
    async startRealConversation(messageId, question, context) {
      const token = { aborted: false };
      this._abortToken = token;
      const alive = () => !token.aborted;

      const controller = new AbortController();
      this._abortController = controller;

      // 是否已收到第一个合法 answer token（用于过滤开头乱码）
      let _firstRealToken = false;

      const handleError = (errorMsg) => {
        const m = this.findMessage(messageId);
        if (m) { m.status = "error"; m.error = errorMsg; }
        this.isStreaming = false;
        this.activeRequestId = null;
        this.assistantStatus = "idle";
      };

      try {
        await streamAgentResponse({
          sessionId: this.conversationId,
          content: question,
          context,
          signal: controller.signal,

          onConnect: ({ sessionId, session_id }) => {
            const id = sessionId || session_id;
            if (id) this.conversationId = id;
          },

          // start：进入处理状态，展示 spinner
          onStart: () => {
            if (!alive()) return;
            const m = this.findMessage(messageId);
            if (!m) return;
            m.status = "thinking";
            m.thinkingVisible = true;
            this.assistantStatus = "thinking";
          },

          // 兼容旧版后端（有 thinking 事件时仍能工作）
          onThinkingStart: () => {},
          onThinking: ({ content }) => {
            if (!alive() || !content) return;
            const m = this.findMessage(messageId);
            if (!m || _firstRealToken) return;
            m.thinking += content;
            this._scheduleRender(m, 'thinking');
          },
          onThinkingEnd: () => {},
          onAnswerStart: () => {
            if (!alive()) return;
            _firstRealToken = true;
            const m = this.findMessage(messageId);
            if (!m) return;
            m.thinkingVisible = false;
            m.status = "answering";
            this.assistantStatus = "answering";
          },

          // tool_start：更新 spinner 提示文字
          onToolStart: ({ tool, message }) => {
            if (!alive()) return;
            const m = this.findMessage(messageId);
            if (!m || _firstRealToken) return;
            m.thinking = message || `正在调用工具: ${tool}`;
            m.thinkingHtml = renderMarkdown(m.thinking);
          },
          onToolEnd: () => {},

          // answer：过滤开头乱码（非 CJK/ASCII 字符），收到第一个合法 token 才切换到回答状态
          onAnswer: ({ content }) => {
            if (!alive() || !content) return;
            const m = this.findMessage(messageId);
            if (!m) return;

            if (!_firstRealToken) {
              // 乱码 token 只含非常用 Unicode（Hebrew/Cyrillic/Greek 等），跳过
              const hasRealChar = /[\x20-\x7E\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/.test(content);
              if (!hasRealChar) return;
              _firstRealToken = true;
              m.status = "answering";
              m.thinkingVisible = false;
              this.assistantStatus = "answering";
            }

            m.content += content;
            this._scheduleRender(m, 'content');
          },

          // suggestions 事件（后端若恢复则生效）
          onSuggestions: ({ suggestions }) => {
            if (!alive() || !Array.isArray(suggestions)) return;
            this.visibleSuggestions = suggestions.slice(0, 3).map((text, i) => ({
              id: `sug_${i}_${Date.now()}`,
              text,
            }));
            this.hasSuggestions = true;
          },

          onDone: ({ session_id, sessionId }) => {
            if (!alive()) return;
            const id = session_id || sessionId;
            if (id) this.conversationId = id;
            this._finalizeDone(messageId);
          },

          onStreamEnd: () => {
            if (!alive()) return;
            this._finalizeDone(messageId);
          },

          onError: ({ message, error }) => {
            const raw = message || error || "";
            const friendly = raw.includes("deadline exceeded") || raw.includes("Timeout")
              ? "AI 响应超时，请稍后重试或尝试缩短问题"
              : raw || "模型服务异常，请稍后重试";
            handleError(friendly);
          },
        });
      } catch (e) {
        if (e.name === "AbortError") return;
        handleError(e.message || "网络异常，请检查连接后重试");
      } finally {
        this._abortController = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* ── 根容器 ─────────────────────────────────────────────────── */
.ai-panel {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ── 消息滚动区 ──────────────────────────────────────────────── */
.message-scroller {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0.85rem 0.75rem 0.5rem;
  user-select: text;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(155, 248, 255, 0.2);
    border-radius: 3px;
  }
}

/* ── 开场问候 ────────────────────────────────────────────────── */
.assistant-greeting {
  margin-bottom: 1rem;
  padding: 0.65rem 0.8rem;
  background: rgba(15, 28, 45, 0.42);
  border: 1px solid rgba(95, 183, 255, 0.06);
  border-radius: 8px;
  border-top-left-radius: 2px;
}

.greeting-text {
  font-size: var(--font-size-12);
  color: rgba(238, 248, 253, 0.9);
  line-height: 1.65;
}

/* ── 推荐提问 ────────────────────────────────────────────────── */
.suggestion-panel {
  margin-bottom: 0.75rem;

  &--post {
    margin-top: 0.75rem;
    margin-bottom: 0;
  }
}

.suggestion-label {
  font-size: var(--font-size-10);
  color: rgba(238, 248, 253, 0.42);
  font-family: var(--font-family-primary-Regular);
  padding: 0.48rem 0.75rem 0.2rem;
  border-left: 2px solid transparent;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  background: rgba(15, 28, 45, 0.42);
  border: 1px solid rgba(95, 183, 255, 0.12);
  border-radius: 8px;
  border-top-left-radius: 2px;
  overflow: hidden;
}

.suggestion-item {
  border: none;
  border-bottom: 1px solid rgba(95, 183, 255, 0.10);
  border-left: 2px solid rgba(95, 183, 255, 0.35);
  border-radius: 0;
  padding: 0.52rem 0.75rem;
  background: transparent;
  color: rgba(246, 255, 255, 0.78);
  cursor: pointer;
  font-size: var(--font-size-12);
  font-family: var(--font-family-primary-Regular);
  transition: all 0.18s ease;
  text-align: left;
  width: 100%;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(31, 122, 214, 0.10);
    color: rgba(246, 255, 255, 0.96);
  }
}

/* ── 消息列表 ────────────────────────────────────────────────── */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.msg-row {
  display: flex;
}

.user-row {
  justify-content: flex-end;
}

.assistant-row {
  flex-direction: column;
  max-width: 92%;
}

/* 用户气泡：蓝色半透明，靠右 */
.user-bubble {
  max-width: 80%;
  background: rgba(30, 100, 180, 0.55);
  border: 1px solid rgba(95, 183, 255, 0.25);
  border-radius: 12px;
  border-bottom-right-radius: 3px;
  padding: 0.52rem 0.82rem;
  font-size: var(--font-size-12);
  color: rgba(246, 255, 255, 0.97);
  line-height: 1.6;
  white-space: pre-wrap;
  user-select: text;
}

/* ── 思考块 ──────────────────────────────────────────────────── */
.thinking-block {
  margin-bottom: 0.5rem;
}

.thinking-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: var(--font-family-primary-Regular);

  &:disabled {
    cursor: default;
  }
}

/* 三点跳动（思考中） */
.thinking-dots {
  display: inline-flex;
  align-items: center;
  gap: 0.18rem;
  height: 0.85rem;
  flex-shrink: 0;

  i {
    display: block;
    width: 0.28rem;
    height: 0.28rem;
    border-radius: 50%;
    background: rgba(155, 248, 255, 0.7);
    animation: dot-bounce 1.4s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.16s; }
    &:nth-child(3) { animation-delay: 0.32s; }
  }
}

/* 完成 icon（勾） */
.thinking-done-icon {
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
}

@keyframes dot-bounce {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.1); }
}

.thinking-label {
  font-size: var(--font-size-10);
  color: rgba(155, 248, 255, 0.72);
  font-family: var(--font-family-primary-Regular);
  line-height: 1;
}

.thinking-chevron {
  font-size: var(--font-size-10);
  color: rgba(155, 248, 255, 0.45);
  margin-left: 0.08rem;
}

/* 展开的思考内容 */
.thinking-content {
  margin-top: 0.38rem;
  padding: 0.48rem 0.6rem;
  background: rgba(8, 18, 30, 0.55);
  border-left: 2px solid rgba(155, 248, 255, 0.18);
  border-radius: 0 4px 4px 0;
  font-size: var(--font-size-10) !important;
  line-height: 1.55 !important;
  color: rgba(238, 248, 253, 0.58) !important;
}

/* 展开/收起动画 */
.think-expand-enter-active,
.think-expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  max-height: 400px;
  overflow: hidden;
}

.think-expand-enter,
.think-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* ── AI 回复背景框 ───────────────────────────────────────────── */
.assistant-row {
  background: rgba(15, 28, 45, 0.42);
  border: 1px solid rgba(95, 183, 255, 0.06);
  border-radius: 8px;
  border-top-left-radius: 2px;
  padding: 0.65rem 0.8rem;
}

/* ── AI 正式回答 ─────────────────────────────────────────────── */
.answer-content {
  // 内容直接渲染在背景框内
}

/* ── RUL 零件名内嵌链接（v-html 注入，使用非 scoped 选择器） ── */
::v-deep .rul-link {
  color: #9bf8ff;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  transition: color 0.2s, text-shadow 0.2s;
}

::v-deep .rul-link:hover {
  color: #ffffff;
  text-shadow: 0 0 6px rgba(155, 248, 255, 0.7);
}

/* ── 错误状态 ────────────────────────────────────────────────── */
.msg-error {
  font-size: var(--font-size-10);
  color: rgba(255, 171, 141, 0.9);
  margin-bottom: 0.3rem;
}

.text-link {
  border: 0;
  background: transparent;
  color: rgba(155, 248, 255, 0.85);
  font-size: var(--font-size-10);
  cursor: pointer;
  padding: 0;
  font-family: var(--font-family-primary-Regular);

  &:hover { color: rgba(155, 248, 255, 1); }
}

/* ── 内联新对话确认条 ────────────────────────────────────────── */
.new-chat-confirm {
  position: absolute;
  inset: 0.48rem 0.6rem 0.52rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.32rem 0 0.55rem;
  background: rgb(38, 46, 62);
  border: 4px solid transparent;
  border-image-source: url(~@/assets/images/page_2_5/BG_chat_input.png);
  border-image-slice: 8 8 8 8 fill;
  border-image-repeat: stretch;
  border-radius: 5px;
  overflow: hidden;
  z-index: 1;
}

.confirm-text {
  font-size: 0.6875rem;
  color: rgba(238, 248, 253, 0.72);
  font-family: var(--font-family-primary-Regular);
  white-space: nowrap;
}

.confirm-actions {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.confirm-btn {
  height: 1.6rem;
  padding: 0 0.65rem;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 0.6875rem;
  font-family: var(--font-family-primary-Regular);
  cursor: pointer;
  transition: all 0.15s;

  &.cancel {
    background: transparent;
    border-color: rgba(192, 220, 231, 0.2);
    color: rgba(238, 248, 253, 0.55);
    &:hover { border-color: rgba(192, 220, 231, 0.4); color: rgba(238, 248, 253, 0.85); }
  }

  &.ok {
    background: rgba(31, 100, 180, 0.5);
    border-color: rgba(95, 183, 255, 0.35);
    color: rgba(246, 255, 255, 0.95);
    &:hover { background: rgba(31, 100, 180, 0.75); }
  }
}

.confirm-slide-enter-active,
.confirm-slide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.confirm-slide-enter,
.confirm-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* ── 输入框区域 ──────────────────────────────────────────────── */
.composer {
  flex-shrink: 0;
  position: relative;
  padding: 0.48rem 0.6rem 0.52rem;
  border-top: none;
}

.composer-inner {
  display: flex;
  align-items: flex-end;
  gap: 0.28rem;
  position: relative;
  z-index: 0;
  background: none;
  border: none;
  border-radius: 5px;
  padding: 0.25rem 0.32rem;
  transition: filter 0.2s;

  /* 9-slice 拉伸：只拉伸中间区域，保留四角和边缘不变形 */
  /* 源图 648×80，圆角约 5px，边框约 2px，slice 取 8px 覆盖角+边 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border: 4px solid transparent;
    border-image-source: url(~@/assets/images/page_2_5/BG_chat_input.png);
    border-image-slice: 8 8 8 8 fill;
    border-image-repeat: stretch;
    pointer-events: none;
  }

  &:focus-within {
    filter: brightness(1.2);
  }
}

/* 新对话按钮（左侧图标） */
.new-chat-btn {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: rgba(155, 248, 255, 0.35);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 0.08rem;
  transition: color 0.18s, background 0.18s;

  &:hover {
    color: rgba(155, 248, 255, 0.85);
    background: rgba(155, 248, 255, 0.08);
  }
}

.icon-new-chat {
  width: 1.05rem;
  height: 1.05rem;
}

/* 输入框 */
.chat-input {
  flex: 1;
}

:deep(.chat-input .el-textarea__inner) {
  background: transparent;
  border: none;
  color: rgba(246, 255, 255, 0.96);
  font-size: var(--font-size-12);
  line-height: 1.5;
  padding: 0.4rem 0.45rem;
  box-shadow: none !important;
  min-height: unset !important;
  font-family: inherit;
  resize: none;
}

:deep(.chat-input .el-textarea__inner::placeholder) {
  color: rgba(238, 248, 253, 0.36);
  font-size: var(--font-size-10);
}

:deep(.chat-input .el-textarea__inner:focus) {
  border: none;
  box-shadow: none;
}

:deep(.el-input__count) {
  display: none;
}

/* ── 自定义 Tooltip（[data-tip] 通用） ─────────────────────────── */
[data-tip] {
  position: relative;

  &::before {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 0.625rem;
    font-family: var(--font-family-primary-Regular);
    color: rgba(238, 248, 253, 0.92);
    background: rgba(67, 82, 110, 0.85);
    border: 1px solid rgba(140, 159, 184, 0.4);
    border-radius: 5px;
    padding: 0.2rem 0.45rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 10;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: calc(100% + 2px);
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(140, 159, 184, 0.4);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 10;
  }

  &:hover::before,
  &:hover::after {
    opacity: 1;
  }
}

/* 发送 / 停止按钮 */
.action-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 0.06rem;
  transition: background 0.18s;

  &:hover:not(:disabled) {
    background: rgba(95, 183, 255, 0.1);
  }

  &:disabled { cursor: not-allowed; }
}

.icon-send {
  width: 1.15rem;
  height: 1.15rem;
  color: rgba(238, 248, 253, 0.3);
  transition: color 0.18s;

  &.active { color: #31aeff; }
}

.icon-stop {
  width: 1.05rem;
  height: 1.05rem;
  color: rgba(255, 171, 141, 0.85);
}

/* ── Markdown 渲染 ───────────────────────────────────────────── */
.markdown-body {
  font-size: var(--font-size-12);
  line-height: 1.65;
  color: rgba(238, 248, 253, 0.9);
  user-select: text;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  color: #f5fcff;
  font-family: var(--font-family-primary-Bold);
  margin: 0 0 0.48rem;
}

.markdown-body :deep(h1) { font-size: var(--font-size-14); }
.markdown-body :deep(h2),
.markdown-body :deep(h3) { font-size: var(--font-size-12); }

.markdown-body :deep(p) { margin: 0 0 0.48rem; }

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 0.48rem 1rem;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  margin: 0 0 0.48rem;
  padding: 0.35rem 0.55rem;
  border-left: 2px solid rgba(155, 248, 255, 0.28);
  background: rgba(155, 248, 255, 0.05);
}

.markdown-body :deep(code) {
  padding: 0.06rem 0.2rem;
  border-radius: 0.18rem;
  background: rgba(8, 18, 30, 0.85);
  color: #9bf8ff;
  font-size: 0.88em;
}

.markdown-body :deep(pre) {
  margin: 0 0 0.5rem;
  padding: 0.5rem 0.6rem;
  overflow-x: auto;
  background: rgba(8, 18, 30, 0.96);
  border: 1px solid rgba(79, 214, 255, 0.1);
  border-radius: 4px;
}

.markdown-body :deep(pre code) {
  padding: 0;
  background: transparent;
}

.markdown-body :deep(table) {
  width: 100%;
  margin: 0 0 0.5rem;
  border-collapse: collapse;
  font-size: var(--font-size-10);
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid rgba(79, 214, 255, 0.14);
  padding: 0.3rem 0.4rem;
  text-align: left;
}

.markdown-body :deep(th) {
  color: #9bf8ff;
  background: rgba(155, 248, 255, 0.05);
}

.markdown-body :deep(a) { color: #9bf8ff; }
</style>
