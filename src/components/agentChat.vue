<template>
  <div class="ai" :class="{ 'is-open': open }" @keydown.stop>
    <!-- 悬浮唤起按钮 -->
    <transition name="ai-fab">
      <button v-if="!open" type="button" class="ai-fab" :class="{ 'is-busy': busy }" title="场景 AI 助手（Alt + A）" @click="openPanel">
        <span class="ai-fab__orb"><span class="ai-orb"><i></i></span></span>
        <span class="ai-fab__text">
          <b>AI 助手</b>
          <small>{{ busy ? "执行中…" : ready ? "说出你的需求" : "场景加载中" }}</small>
        </span>
        <span v-if="unread" class="ai-fab__dot"></span>
      </button>
    </transition>

    <!-- 对话面板 -->
    <transition name="ai-panel" @after-enter="focusInput">
      <section v-if="open" class="ai-panel" :class="{ 'is-wide': wide }" role="dialog" aria-label="场景 AI 助手">
        <div class="ai-panel__glow"></div>

        <header class="ai-head">
          <span class="ai-head__avatar"><span class="ai-orb" :class="{ 'is-thinking': busy }"><i></i></span></span>
          <div class="ai-head__info">
            <div class="ai-head__title">{{ caseInfo.name || "场景智能助手" }}</div>
            <div class="ai-head__status" :title="modeTitle">
              <span class="ai-status-dot" :class="statusClass"></span>{{ statusText }}
            </div>
          </div>
          <button type="button" class="ai-icon-btn" :title="wide ? '收窄' : '展开'" @click="wide = !wide">
            <svg viewBox="0 0 24 24"><path v-if="!wide" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /><path v-else d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
          </button>
          <button type="button" class="ai-icon-btn" title="新对话（清除标注与上下文）" :disabled="!ready" @click="resetChat">
            <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" /></svg>
          </button>
          <button type="button" class="ai-icon-btn" title="收起（Esc）" @click="open = false">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        <div ref="list" class="ai-list" @scroll="onScroll">
          <!-- 欢迎卡片 -->
          <div class="ai-welcome">
            <div class="ai-welcome__hi">{{ caseInfo.title }}</div>
            <p>{{ caseInfo.welcome }}</p>
          </div>

          <transition-group name="ai-msg" tag="div" class="ai-msgs">
            <div v-for="msg in messages" :key="msg.id" class="ai-msg" :class="`is-${msg.role}`">
              <span v-if="msg.role === 'assistant'" class="ai-msg__avatar"><span class="ai-orb is-mini"><i></i></span></span>
              <div class="ai-msg__body">
                <div class="ai-bubble" :class="{ 'is-error': msg.error }">
                  <div v-if="msg.role === 'assistant'" class="ai-bubble__text" v-html="renderText(msg.text)"></div>
                  <div v-else class="ai-bubble__text">{{ msg.text }}</div>
                </div>

                <!-- 执行步骤时间线 -->
                <div v-if="msg.steps && msg.steps.length" class="ai-steps" :class="{ 'is-open': msg.showSteps }">
                  <button type="button" class="ai-steps__toggle" @click="msg.showSteps = !msg.showSteps">
                    <span class="ai-steps__badge" :class="{ 'is-error': failedCount(msg.steps) }">{{ failedCount(msg.steps) ? "!" : "✓" }}</span>
                    执行 {{ msg.steps.length }} 步{{ failedCount(msg.steps) ? `，${failedCount(msg.steps)} 步失败` : "" }} · {{ totalMs(msg.steps) }}
                    <svg class="ai-steps__chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                  <div class="ai-collapse" :style="{ maxHeight: msg.showSteps ? `${msg.steps.length * 3}em` : '0' }">
                    <ol class="ai-timeline">
                      <li v-for="(step, i) in msg.steps" :key="i" :class="{ 'is-error': !step.ok, 'is-case': isCase(step) }">
                        <span class="ai-timeline__dot"></span>
                        <span class="ai-timeline__text">{{ describe(step) }}</span>
                        <span class="ai-timeline__ms">{{ step.ms }}ms</span>
                      </li>
                    </ol>
                  </div>
                </div>

                <!-- 消息操作与评价 -->
                <div v-if="msg.role === 'assistant' && msg.turnId" class="ai-actions">
                  <span class="ai-actions__time">{{ msg.time }}</span>
                  <button type="button" class="ai-chip-btn" :title="msg.copied ? '已复制' : '复制回复'" @click="copy(msg)">
                    <svg viewBox="0 0 24 24"><path v-if="!msg.copied" d="M9 9h10v10H9zM5 15V5h10" /><path v-else d="M5 12l5 5 9-10" /></svg>
                  </button>
                  <button type="button" class="ai-chip-btn" title="再问一次" :disabled="busy" @click="send(msg.question)">
                    <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4.5h-4.5" /></svg>
                  </button>
                  <template v-if="msg.recorded">
                    <span class="ai-actions__sep"></span>
                    <button
                      v-for="option in ratingOptions"
                      :key="option.value"
                      type="button"
                      class="ai-rate"
                      :class="[`is-${option.value}`, { 'is-active': msg.feedback.rating === option.value }]"
                      :disabled="msg.feedback.busy"
                      :title="option.label"
                      @click="chooseRating(msg, option.value)"
                    >
                      <svg viewBox="0 0 24 24">
                        <path v-if="option.value === 'satisfied'" d="M7 11v9H4v-9zM7 11l4-8c1.5 0 2.5 1 2.2 2.6L12.6 9H19c1.2 0 2 1 1.8 2.2l-1.3 7A2 2 0 0 1 17.5 20H7" />
                        <path v-else-if="option.value === 'partial'" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 14h8M9 9.5h.01M15 9.5h.01" />
                        <path v-else d="M17 13V4h3v9zM17 13l-4 8c-1.5 0-2.5-1-2.2-2.6l.6-3.4H5c-1.2 0-2-1-1.8-2.2l1.3-7A2 2 0 0 1 6.5 4H17" />
                      </svg>
                    </button>
                    <span v-if="msg.feedback.saved" class="ai-actions__saved">感谢反馈</span>
                  </template>
                </div>

                <transition name="ai-fold">
                  <form v-if="msg.feedback && msg.feedback.open" class="ai-reason" @submit.prevent="submitFeedback(msg)">
                    <div class="ai-reason__title">哪里不符合预期？</div>
                    <div class="ai-reason__chips">
                      <button
                        v-for="reason in reasonOptions"
                        :key="reason.value"
                        type="button"
                        :class="{ 'is-active': msg.feedback.reasons.includes(reason.value) }"
                        @click="toggleReason(msg, reason.value)"
                      >
                        {{ reason.label }}
                      </button>
                    </div>
                    <input v-model="msg.feedback.comment" maxlength="500" placeholder="补充说明（可选），例如：路线穿过了建筑" />
                    <div class="ai-reason__foot">
                      <span v-if="msg.feedback.error" class="ai-reason__error">{{ msg.feedback.error }}</span>
                      <button type="button" class="ai-btn is-ghost" @click="msg.feedback.open = false">取消</button>
                      <button type="submit" class="ai-btn" :disabled="msg.feedback.busy">提交</button>
                    </div>
                  </form>
                </transition>
                <div v-if="msg.feedback && !msg.feedback.open && msg.feedback.error" class="ai-reason__error">{{ msg.feedback.error }}</div>
              </div>
            </div>

            <!-- 执行中：打字指示 + 实时步骤 -->
            <div v-if="busy" key="pending" class="ai-msg is-assistant is-pending">
              <span class="ai-msg__avatar"><span class="ai-orb is-mini is-thinking"><i></i></span></span>
              <div class="ai-msg__body">
                <div class="ai-bubble">
                  <span class="ai-typing"><i></i><i></i><i></i></span>
                  <span class="ai-typing__label">{{ pendingSteps.length ? "正在操作场景" : "正在理解你的需求" }}</span>
                </div>
                <ol v-if="pendingSteps.length" class="ai-timeline is-live">
                  <li v-for="(step, i) in pendingSteps" :key="i" :class="{ 'is-error': !step.ok, 'is-case': isCase(step) }">
                    <span class="ai-timeline__dot"></span>
                    <span class="ai-timeline__text">{{ describe(step) }}</span>
                    <span class="ai-timeline__ms">{{ step.ms }}ms</span>
                  </li>
                  <li class="is-running"><span class="ai-timeline__dot"></span><span class="ai-timeline__text">执行中…</span></li>
                </ol>
              </div>
            </div>
          </transition-group>
        </div>

        <transition name="ai-fade">
          <button v-if="!atBottom" type="button" class="ai-to-bottom" title="回到最新" @click="scrollToBottom(true)">
            <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
          </button>
        </transition>

        <!-- 快捷指令 -->
        <div class="ai-suggest" :class="{ 'is-collapsed': messages.length > 0 && !showSuggest }">
          <div class="ai-suggest__tabs">
            <button
              v-for="(group, i) in suggestionGroups"
              :key="group.name"
              type="button"
              :class="{ 'is-active': suggestTab === i }"
              @click="suggestTab = i; showSuggest = true"
            >
              {{ group.name }}
            </button>
            <button type="button" class="ai-suggest__fold" :title="showSuggest ? '收起' : '展开快捷指令'" @click="showSuggest = !showSuggest">
              <svg viewBox="0 0 24 24" :class="{ 'is-flip': !showSuggest }"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          </div>
          <div class="ai-collapse" :style="{ maxHeight: showSuggest || !messages.length ? '6em' : '0' }">
            <transition name="ai-swap" mode="out-in">
              <div :key="suggestTab" class="ai-suggest__list">
                <button v-for="s in suggestionGroups[suggestTab].items" :key="s" type="button" :disabled="!ready || busy" @click="send(s)">{{ s }}</button>
              </div>
            </transition>
          </div>
        </div>

        <!-- 输入区 -->
        <form class="ai-input" :class="{ 'is-focus': focused, 'is-disabled': !ready }" @submit.prevent="send()">
          <textarea
            ref="input"
            v-model="input"
            rows="1"
            maxlength="1000"
            :placeholder="ready ? '描述你想在场景中做什么，Enter 发送，Shift+Enter 换行' : '场景加载中…'"
            :disabled="!ready"
            @input="autoGrow"
            @focus="focused = true"
            @blur="focused = false"
            @keydown.enter.exact.prevent="send()"
            @keydown.up.exact="recallLast"
          ></textarea>
          <transition name="ai-swap" mode="out-in">
            <button v-if="busy" key="stop" type="button" class="ai-send is-stop" title="停止" @click="stop">
              <svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2" /></svg>
            </button>
            <button v-else key="send" type="submit" class="ai-send" title="发送" :disabled="!ready || !input.trim()">
              <svg viewBox="0 0 24 24"><path d="M5 12l14-7-5 15-3-6z" /></svg>
            </button>
          </transition>
        </form>
        <div class="ai-foot">内容由 AI 生成，执行结果以场景为准 · 每轮对话会记录用于改进</div>
      </section>
    </transition>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { createSceneAgent, describeStep, RATING_OPTIONS, REASON_OPTIONS } from "@twin/web-sdk/agent";
import { getTwinApp } from "@/utils/twin/app";
import { currentAgentCase, mergeCustomApi } from "@/utils/twin/agentCases";
import { emitter } from "@/utils/eventBus";

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
let seq = 0;

/** 灯塔工厂需求清单（EC9）对应的快捷指令 */
const SUGGESTION_GROUPS = [
  { name: "场景浏览", items: ["按预设路线漫游巡检", "切换到总控台视角", "聚焦立式加工中心 #1", "透视建筑与隐蔽管网", "一键复位"] },
  { name: "设备监控", items: ["用模拟数据流驱动设备状态", "模拟 CNC-02 故障报警", "解除全部报警", "显示设备健康视图", "标出所有空压机"] },
  { name: "产线仿真", items: ["启动整线生产", "爆炸拆解 1 号加工中心", "播放生产溯源", "跟随 AGV #1", "显示立体仓库库存"] },
  { name: "分析测量", items: ["进入布局编辑", "进行作业仿真计算", "测量面积", "测量 CNC-01 到 CNC-02 的距离", "在消防器材柜周围画范围"] },
];

/**
 * 场景 AI 助手：逻辑来自 SDK（@twin/web-sdk/agent），大模型由平台网关代理；
 * 案例的专属函数由 SDK 自动作为 case_* 工具提供给 Agent：平台场景配置包（app.customApi）
 * 与案例页面注册的业务能力（utils/twin/agentCases）合并后传入，页面能力优先。
 * 每轮对话记录到平台，用户可评价（满意 / 部分满足 / 不符合），在平台「Agent 管理」中统计与复核。
 */
const LIGHTHOUSE_CASE = {
  key: "lighthouse",
  title: "你好，我是灯塔工厂场景助手",
  welcome: "用一句话操控三维场景：查找与聚焦设备、生成标注覆盖物、驱动设备状态与报警、爆炸拆解、透视管网、产线仿真、布局编辑与测量。",
  suggestions: SUGGESTION_GROUPS,
  clientName: "dengta-twinProject",
};

export default {
  name: "AgentChat",
  props: { caseKey: { type: String, default: "lighthouse" } },
  data() {
    return {
      open: false,
      wide: false,
      input: "",
      busy: false,
      mode: null,
      focused: false,
      atBottom: true,
      unread: false,
      showSuggest: true,
      suggestTab: 0,
      pendingSteps: [],
      messages: [],
      registered: currentAgentCase(),
      ratingOptions: RATING_OPTIONS,
      reasonOptions: REASON_OPTIONS,
    };
  },
  computed: {
    ...mapState(["isSceneAlready"]),
    caseInfo() {
      const page = this.registered && this.registered.key === this.caseKey ? this.registered : null;
      return page || LIGHTHOUSE_CASE;
    },
    suggestionGroups() {
      return this.caseInfo.suggestions || SUGGESTION_GROUPS;
    },
    ready() {
      return this.isSceneAlready;
    },
    statusClass() {
      if (!this.ready) return "is-wait";
      if (this.busy) return "is-busy";
      return this.mode === "llm" ? "is-llm" : this.mode === "local" ? "is-local" : "is-wait";
    },
    statusText() {
      if (!this.ready) return "场景加载中";
      if (this.busy) return "正在执行";
      return this.mode === "llm" ? "大模型在线" : this.mode === "local" ? "本地规则模式" : "连接中";
    },
    modeTitle() {
      return this.mode === "local" ? "平台未配置大模型或不可达，使用本地规则解析（请在平台「Agent 管理 → 模型配置」中设置）" : "";
    },
  },
  watch: {
    open(value) { emitter.emit("agentState", value); },
    ready(value) {
      if (value) this.initAgent();
    },
  },
  mounted() {
    emitter.on("sceneUpdated", this.onSceneUpdated);
    emitter.on("agentCaseChanged", this.onCaseChanged);
    emitter.on("agentOpen", this.onOpenRequest);
    // 案例页可能在本组件 data() 与订阅之间完成注册，这里补读一次
    this.registered = currentAgentCase();
    window.addEventListener("keydown", this.onHotkey);
    if (this.ready) this.initAgent();
  },
  beforeDestroy() {
    emitter.off("sceneUpdated", this.onSceneUpdated);
    emitter.off("agentCaseChanged", this.onCaseChanged);
    emitter.off("agentOpen", this.onOpenRequest);
    window.removeEventListener("keydown", this.onHotkey);
    if (this.abort) this.abort.abort();
    if (this.agent) this.agent.dispose();
    this.agent = null;
  },
  methods: {
    // agent 持有 viewer 引用，不放入 data，避免 Vue 2 深度响应式遍历 three.js 场景
    ensureAgent() {
      if (!this.agent) {
        const app = getTwinApp();
        // customApi 传 getter：案例换版后 app.customApi 会被替换、页面注册的能力随路由变化，Agent 始终使用最新函数集
        const page = () => (this.registered && this.registered.key === this.caseKey ? this.registered : null);
        this.agent = createSceneAgent({ app, customApi: () => mergeCustomApi(app && app.customApi, page()), clientName: this.caseInfo.clientName || "dengta-twinProject", persona: this.caseInfo.persona || "" });
        if (process.env.NODE_ENV === "development") {
          window.__sceneAgent = this.agent;
          window.__runAgentScenarios = (ids) => import("@twin/web-sdk/agent").then((m) => m.runAgentScenarios(this.agent, ids));
        }
      }
      return this.agent;
    },
    initAgent() {
      this.ensureAgent()
        .detectMode()
        .then((mode) => (this.mode = mode));
    },
    onSceneUpdated() {
      if (this.agent) this.agent.invalidateCatalog();
    },
    onCaseChanged(definition) {
      this.registered = definition;
      this.suggestTab = 0;
    },
    onOpenRequest(question) {
      if (this.open && !question) { this.open = false; return; }
      this.openPanel();
      if (question) this.$nextTick(() => this.send(question));
      else this.$nextTick(this.focusInput);
    },
    onHotkey(e) {
      if (e.altKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        if (this.open) this.open = false;
        else this.openPanel();
      } else if (e.key === "Escape" && this.open && !this.busy) {
        this.open = false;
      }
    },
    openPanel() {
      this.open = true;
      this.unread = false;
      this.scrollToBottom(true);
    },
    focusInput() {
      if (this.$refs.input && this.ready) this.$refs.input.focus();
    },
    autoGrow() {
      const el = this.$refs.input;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    },
    recallLast(e) {
      if (this.input) return;
      const last = [...this.messages].reverse().find((m) => m.role === "user");
      if (last) {
        e.preventDefault();
        this.input = last.text;
        this.$nextTick(this.autoGrow);
      }
    },
    describe(step) {
      return describeStep(step);
    },
    isCase(step) {
      return String(step.name || "").startsWith("case_");
    },
    failedCount(steps) {
      return steps.filter((s) => !s.ok).length;
    },
    totalMs(steps) {
      const ms = steps.reduce((sum, s) => sum + (s.ms || 0), 0);
      return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
    },
    // 回复按纯文本展示；兼容模型偶尔输出的 **加粗**、`代码` 与设备编号高亮
    renderText(text) {
      return escapeHtml(text)
        .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
        .replace(/`([^`\n]+)`/g, "<code>$1</code>")
        .replace(/\b([A-Z]{1,4}-\d{2})\b/g, '<span class="ai-tag">$1</span>');
    },

    async send(preset) {
      const text = String(typeof preset === "string" ? preset : this.input).trim();
      if (!text || this.busy || !this.ready) return;
      this.input = "";
      this.$nextTick(this.autoGrow);
      this.messages.push({ id: ++seq, role: "user", text, time: now() });
      this.showSuggest = false;
      this.busy = true;
      this.pendingSteps = [];
      this.abort = new AbortController();
      this.scrollToBottom(true);
      const base = { id: 0, role: "assistant", question: text, time: "", showSteps: false, copied: false };
      let reply;
      try {
        const result = await this.ensureAgent().ask(text, {
          signal: this.abort.signal,
          onStep: (step) => {
            this.pendingSteps.push(step);
            // 广播给业务页面：Agent 直接调用 customApi 会绕过页面状态（如告警列表），由页面自行同步
            emitter.emit("agentStep", step);
            this.scrollToBottom();
          },
        });
        this.mode = result.mode;
        reply = {
          ...base,
          text: result.reply,
          steps: result.steps,
          turnId: result.turnId,
          recorded: result.recorded,
          error: Boolean(result.error),
          feedback: { rating: null, reasons: [], comment: "", open: false, busy: false, saved: false, error: "" },
        };
      } catch (error) {
        const aborted = error && (error.name === "AbortError" || error.code === "E_OPERATION_CANCELLED");
        reply = { ...base, text: aborted ? "已停止。" : `出错了：${(error && error.message) || error}`, steps: this.pendingSteps.slice(), error: !aborted };
      } finally {
        this.busy = false;
        this.pendingSteps = [];
      }
      reply.id = ++seq;
      reply.time = now();
      this.messages.push(reply);
      if (!this.open) this.unread = true;
      this.scrollToBottom(true);
    },

    stop() {
      if (this.abort) this.abort.abort();
    },

    async copy(msg) {
      try {
        await navigator.clipboard.writeText(msg.text);
      } catch (e) {
        const area = document.createElement("textarea");
        area.value = msg.text;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      msg.copied = true;
      setTimeout(() => (msg.copied = false), 1500);
    },

    chooseRating(msg, rating) {
      const fb = msg.feedback;
      fb.error = "";
      fb.rating = rating;
      if (rating === "satisfied") {
        fb.reasons = [];
        fb.open = false;
        this.submitFeedback(msg);
        return;
      }
      fb.open = true;
      this.scrollToBottom();
    },
    toggleReason(msg, value) {
      const list = msg.feedback.reasons;
      const index = list.indexOf(value);
      if (index >= 0) list.splice(index, 1);
      else list.push(value);
    },
    async submitFeedback(msg) {
      const fb = msg.feedback;
      fb.busy = true;
      fb.error = "";
      try {
        await this.ensureAgent().feedback(msg.turnId, { rating: fb.rating, reasons: fb.reasons, comment: fb.comment });
        fb.saved = true;
        fb.open = false;
      } catch (error) {
        fb.error = `评价提交失败：${(error && error.message) || error}`;
      } finally {
        fb.busy = false;
      }
    },

    async resetChat() {
      if (this.abort) this.abort.abort();
      const agent = this.ensureAgent();
      if (this.ready) {
        const { executeTool } = await import("@twin/web-sdk/agent");
        await executeTool("clear_agent_overlays", {}, agent.ctx);
      }
      agent.reset();
      this.messages = [];
      this.showSuggest = true;
    },

    onScroll() {
      const list = this.$refs.list;
      if (list) this.atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 40;
    },
    scrollToBottom(force) {
      this.$nextTick(() => {
        const list = this.$refs.list;
        if (!list || (!force && !this.atBottom)) return;
        list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
        this.atBottom = true;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
// 设计稿宽 1920（1rem = 16px@1920），尺寸按 1920 稿标注
$c-primary: #3ea6ff;
$c-cyan: #2fe6ff;
$c-violet: #8b7bff;
$c-text: #e8f4ff;
$c-sub: #8fb4cf;
$c-line: rgba(110, 190, 255, 0.18);
$c-ok: #3ee0a0;
$c-warn: #ffc24b;
$c-err: #ff6b6b;
$ease: cubic-bezier(0.22, 1, 0.36, 1);
$spring: cubic-bezier(0.34, 1.56, 0.64, 1);

.ai {
  position: absolute;
  right: 21%;
  bottom: 13%;
  z-index: 20;
  font-size: px2rem(13);
  color: $c-text;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;

  // XY 工厂：对齐底部场景工具条右侧空间（工具条右缘与右栏之间），与工具条垂直居中
  // XY（新耀工厂）：由底部工具栏「AI小新」按钮唤起，不显示悬浮按钮；面板贴右栏内侧、位于工具栏上方，避开右上信息卡。
  &.ai-in-xy {
    left: auto;
    right: calc(clamp(316px, 21vw, 404px) + 2 * clamp(12px, 0.9vw, 18px));
    bottom: calc(clamp(12px, 0.9vw, 18px) + 114px);
    z-index: 30;
    .ai-fab { display: none !important; }
    .ai-panel { width: 380px; height: min(540px, calc(100vh - 300px)); max-height: none; transform-origin: 100% 100%; }
    .ai-suggest__list { max-height: 64px; overflow: hidden; }
    .ai-panel.is-wide { width: min(560px, calc(100vw - 2 * clamp(316px, 21vw, 404px) - 80px)); }

    // 统一 XY 玻璃拟态风格：深色玻璃底、细描边、12px 圆角、青蓝主色
    .ai-fab {
      flex-direction: column;
      gap: 4px;
      width: 56px;
      padding: 10px 0 8px;
      border-radius: 16px;
      border-color: rgba(255, 255, 255, 0.14);
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(14px);
      box-shadow: 0 12px 32px rgba(2, 6, 23, 0.45);
      .ai-fab__orb { width: 30px; height: 30px; }
      .ai-fab__text { text-align: center; b { font-size: 12px; } small { display: none; } }
    }
    .ai-panel {
      right: -4px;
      bottom: 0;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(15, 23, 42, 0.86);
      backdrop-filter: blur(16px);
      box-shadow: 0 24px 56px rgba(2, 6, 23, 0.6), 0 0 0 1px rgba(56, 189, 248, 0.08);
    }
    .ai-panel__glow { opacity: 0.35; }
    .ai-head { border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
  }

  svg {
    width: 1em;
    height: 1em;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  button {
    font-family: inherit;
  }
}

/* ---------------------------------------------------------------- 光球（品牌标识） */
.ai-orb {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #c9f6ff 0%, $c-cyan 22%, $c-primary 52%, $c-violet 100%);
  box-shadow: 0 0 px2rem(14) rgba(47, 230, 255, 0.55), inset 0 0 px2rem(6) rgba(255, 255, 255, 0.5);
  animation: ai-breathe 3.2s ease-in-out infinite;

  i {
    position: absolute;
    inset: -18%;
    border-radius: 50%;
    border: px2rem(1.5) solid transparent;
    border-top-color: rgba(47, 230, 255, 0.9);
    border-right-color: rgba(139, 123, 255, 0.6);
    animation: ai-spin 3.6s linear infinite;
  }

  &.is-thinking {
    animation: ai-breathe 0.9s ease-in-out infinite;
    i {
      animation-duration: 0.9s;
    }
  }

  &.is-mini {
    box-shadow: 0 0 px2rem(8) rgba(47, 230, 255, 0.45);
    i {
      display: none;
    }
  }
}

/* ---------------------------------------------------------------- 悬浮按钮 */
.ai-fab {
  position: relative;
  display: flex;
  align-items: center;
  gap: px2rem(10);
  padding: px2rem(7) px2rem(18) px2rem(7) px2rem(8);
  border: px2rem(1) solid rgba(62, 166, 255, 0.45);
  border-radius: px2rem(30);
  background: linear-gradient(135deg, rgba(14, 38, 60, 0.92), rgba(16, 26, 54, 0.92));
  color: $c-text;
  cursor: pointer;
  box-shadow: 0 px2rem(8) px2rem(24) rgba(0, 10, 30, 0.45), 0 0 px2rem(18) rgba(47, 230, 255, 0.18);
  backdrop-filter: blur(px2rem(10));
  transition: transform 0.35s $spring, box-shadow 0.3s, border-color 0.3s;

  &::before {
    content: "";
    position: absolute;
    inset: px2rem(-1);
    border-radius: inherit;
    padding: px2rem(1);
    background: linear-gradient(120deg, transparent 20%, rgba(47, 230, 255, 0.9), transparent 60%);
    background-size: 250% 100%;
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: ai-sheen 3.5s linear infinite;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(px2rem(-3));
    border-color: rgba(47, 230, 255, 0.8);
    box-shadow: 0 px2rem(12) px2rem(28) rgba(0, 10, 30, 0.5), 0 0 px2rem(26) rgba(47, 230, 255, 0.35);
  }

  &:active {
    transform: scale(0.96);
  }

  &.is-busy .ai-orb {
    animation-duration: 0.9s;
  }
}

.ai-fab__orb {
  width: px2rem(34);
  height: px2rem(34);
  padding: px2rem(4);
}

.ai-fab__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;

  b {
    font-size: px2rem(14);
    letter-spacing: px2rem(1);
    background: linear-gradient(90deg, #fff, #9be9ff);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  small {
    font-size: px2rem(10);
    color: $c-sub;
  }
}

.ai-fab__dot {
  position: absolute;
  top: px2rem(4);
  right: px2rem(6);
  width: px2rem(8);
  height: px2rem(8);
  border-radius: 50%;
  background: $c-err;
  box-shadow: 0 0 0 px2rem(2) rgba(255, 107, 107, 0.3);
  animation: ai-ping 1.6s ease-out infinite;
}

/* ---------------------------------------------------------------- 面板 */
.ai-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: px2rem(400);
  height: px2rem(560);
  max-height: 78vh;
  border-radius: px2rem(16);
  background: linear-gradient(180deg, rgba(12, 30, 48, 0.9) 0%, rgba(8, 18, 34, 0.94) 100%);
  border: px2rem(1) solid rgba(110, 190, 255, 0.28);
  box-shadow: 0 px2rem(24) px2rem(60) rgba(0, 6, 20, 0.6), inset 0 px2rem(1) 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(px2rem(16)) saturate(140%);
  overflow: hidden;
  transform-origin: 85% 100%;
  transition: width 0.45s $ease, height 0.45s $ease;

  &.is-wide {
    width: px2rem(560);
    height: px2rem(680);
  }
}

.ai-panel__glow {
  position: absolute;
  top: px2rem(-120);
  left: 50%;
  width: px2rem(320);
  height: px2rem(200);
  transform: translateX(-50%);
  background: radial-gradient(ellipse at center, rgba(47, 230, 255, 0.22), transparent 70%);
  pointer-events: none;
  animation: ai-drift 8s ease-in-out infinite alternate;
}

/* ---------------------------------------------------------------- 头部 */
.ai-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: px2rem(6);
  padding: px2rem(12) px2rem(12) px2rem(10) px2rem(14);
  border-bottom: px2rem(1) solid $c-line;
}

.ai-head__avatar {
  width: px2rem(30);
  height: px2rem(30);
  padding: px2rem(3);
  margin-right: px2rem(4);
}

.ai-head__info {
  flex: 1;
  min-width: 0;
}

.ai-head__title {
  font-size: px2rem(15);
  font-weight: 600;
  letter-spacing: px2rem(0.5);
}

.ai-head__status {
  display: flex;
  align-items: center;
  gap: px2rem(5);
  margin-top: px2rem(2);
  font-size: px2rem(11);
  color: $c-sub;
}

.ai-status-dot {
  width: px2rem(7);
  height: px2rem(7);
  border-radius: 50%;
  background: $c-sub;
  transition: background 0.3s;

  &.is-llm {
    background: $c-ok;
    box-shadow: 0 0 px2rem(6) $c-ok;
  }
  &.is-local {
    background: $c-warn;
    box-shadow: 0 0 px2rem(6) $c-warn;
  }
  &.is-busy {
    background: $c-cyan;
    animation: ai-blink 0.8s ease-in-out infinite;
  }
}

.ai-icon-btn {
  display: grid;
  place-items: center;
  width: px2rem(28);
  height: px2rem(28);
  border: none;
  border-radius: px2rem(8);
  background: transparent;
  color: $c-sub;
  font-size: px2rem(15);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;

  &:hover:not(:disabled) {
    background: rgba(62, 166, 255, 0.14);
    color: #fff;
  }
  &:active:not(:disabled) {
    transform: scale(0.9);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

/* ---------------------------------------------------------------- 消息列表 */
.ai-list {
  position: relative;
  flex: 1;
  padding: px2rem(14) px2rem(14) px2rem(6);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(110, 190, 255, 0.3) transparent;

  &::-webkit-scrollbar {
    width: px2rem(4);
  }
  &::-webkit-scrollbar-thumb {
    border-radius: px2rem(4);
    background: rgba(110, 190, 255, 0.3);
  }
}

.ai-welcome {
  margin-bottom: px2rem(14);
  padding: px2rem(12) px2rem(14);
  border-radius: px2rem(12);
  background: linear-gradient(135deg, rgba(47, 230, 255, 0.1), rgba(139, 123, 255, 0.1));
  border: px2rem(1) solid rgba(110, 190, 255, 0.16);
  animation: ai-rise 0.6s $ease both;

  p {
    margin: px2rem(6) 0 0;
    font-size: px2rem(12);
    line-height: 1.7;
    color: $c-sub;
  }
}

.ai-welcome__hi {
  font-size: px2rem(14);
  font-weight: 600;
  background: linear-gradient(90deg, #fff, #9be9ff 60%, #c2b8ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.ai-msg {
  display: flex;
  gap: px2rem(8);
  margin-bottom: px2rem(14);

  &.is-user {
    flex-direction: row-reverse;

    .ai-msg__body {
      align-items: flex-end;
    }

    .ai-bubble {
      border-radius: px2rem(14) px2rem(14) px2rem(4) px2rem(14);
      background: linear-gradient(135deg, #2f8cff 0%, #5a6dff 100%);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 px2rem(6) px2rem(16) rgba(47, 120, 255, 0.35);
    }
  }
}

.ai-msg__avatar {
  flex: none;
  width: px2rem(24);
  height: px2rem(24);
  margin-top: px2rem(2);
  padding: px2rem(3);
}

.ai-msg__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  max-width: 86%;
}

.ai-bubble {
  position: relative;
  padding: px2rem(9) px2rem(12);
  border-radius: px2rem(4) px2rem(14) px2rem(14) px2rem(14);
  background: rgba(30, 60, 92, 0.55);
  border: px2rem(1) solid rgba(110, 190, 255, 0.16);
  line-height: 1.7;
  word-break: break-word;

  &.is-error {
    border-color: rgba(255, 107, 107, 0.45);
    background: rgba(90, 30, 40, 0.45);
  }

  ::v-deep code {
    padding: 0 px2rem(4);
    border-radius: px2rem(4);
    background: rgba(0, 0, 0, 0.35);
    font-family: Consolas, monospace;
    font-size: 0.92em;
  }

  ::v-deep .ai-tag {
    padding: 0 px2rem(5);
    border-radius: px2rem(4);
    background: rgba(47, 230, 255, 0.14);
    color: #9be9ff;
    font-family: Consolas, monospace;
    font-size: 0.92em;
  }
}

.ai-bubble__text {
  white-space: pre-wrap;
}

/* 打字指示 */
.ai-typing {
  display: inline-flex;
  gap: px2rem(4);
  vertical-align: middle;

  i {
    width: px2rem(6);
    height: px2rem(6);
    border-radius: 50%;
    background: $c-cyan;
    animation: ai-bounce 1.2s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }
    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

.ai-typing__label {
  margin-left: px2rem(8);
  font-size: px2rem(12);
  background: linear-gradient(90deg, $c-sub, #fff, $c-sub);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ai-shimmer 1.8s linear infinite;
}

/* ---------------------------------------------------------------- 步骤时间线 */
.ai-steps {
  margin-top: px2rem(6);
  width: 100%;
}

.ai-steps__toggle {
  display: inline-flex;
  align-items: center;
  gap: px2rem(6);
  padding: px2rem(3) px2rem(8) px2rem(3) px2rem(4);
  border: px2rem(1) solid $c-line;
  border-radius: px2rem(12);
  background: rgba(10, 24, 40, 0.5);
  color: $c-sub;
  font-size: px2rem(11);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    border-color: rgba(110, 190, 255, 0.4);
    color: #fff;
  }
}

.ai-steps__badge {
  display: grid;
  place-items: center;
  width: px2rem(15);
  height: px2rem(15);
  border-radius: 50%;
  background: rgba(62, 224, 160, 0.18);
  color: $c-ok;
  font-size: px2rem(9);
  font-weight: 700;

  &.is-error {
    background: rgba(255, 107, 107, 0.2);
    color: $c-err;
  }
}

.ai-steps__chev {
  transition: transform 0.3s $ease;
}

.ai-steps.is-open .ai-steps__chev {
  transform: rotate(180deg);
}

.ai-collapse {
  overflow: hidden;
  transition: max-height 0.4s $ease;
}

.ai-timeline {
  position: relative;
  margin: px2rem(6) 0 0;
  padding: 0 0 0 px2rem(14);
  list-style: none;
  font-size: px2rem(11);
  color: $c-sub;

  &::before {
    content: "";
    position: absolute;
    top: px2rem(6);
    bottom: px2rem(6);
    left: px2rem(4);
    width: px2rem(1);
    background: linear-gradient($c-line, rgba(110, 190, 255, 0.05));
  }

  li {
    position: relative;
    display: flex;
    gap: px2rem(8);
    padding: px2rem(3) 0;
    animation: ai-rise 0.35s $ease both;
  }

  .ai-timeline__dot {
    position: absolute;
    top: px2rem(9);
    left: px2rem(-13);
    width: px2rem(7);
    height: px2rem(7);
    border-radius: 50%;
    background: $c-ok;
    box-shadow: 0 0 px2rem(5) rgba(62, 224, 160, 0.7);
  }

  .is-case .ai-timeline__dot {
    background: $c-violet;
    box-shadow: 0 0 px2rem(5) rgba(139, 123, 255, 0.8);
  }

  .is-error {
    color: #ffaaaa;
    .ai-timeline__dot {
      background: $c-err;
      box-shadow: 0 0 px2rem(5) rgba(255, 107, 107, 0.8);
    }
  }

  .is-running .ai-timeline__dot {
    background: $c-cyan;
    animation: ai-ping 1.2s ease-out infinite;
  }

  .ai-timeline__text {
    flex: 1;
    min-width: 0;
    font-size: 16px;
  }

  .ai-timeline__ms {
    flex: none;
    opacity: 0.55;
    font-family: Consolas, monospace;
    font-size: px2rem(10);
  }
}

/* ---------------------------------------------------------------- 消息操作 / 评价 */
.ai-actions {
  display: flex;
  align-items: center;
  gap: px2rem(2);
  margin-top: px2rem(4);
  color: $c-sub;
  font-size: px2rem(11);
  opacity: 0.7;
  transition: opacity 0.2s;

  .ai-msg:hover & {
    opacity: 1;
  }
}

.ai-actions__time {
  margin-right: px2rem(4);
  font-size: px2rem(10);
  opacity: 0.7;
}

.ai-actions__sep {
  width: px2rem(1);
  height: px2rem(12);
  margin: 0 px2rem(4);
  background: $c-line;
}

.ai-actions__saved {
  margin-left: px2rem(4);
  color: $c-ok;
  font-size: px2rem(10);
  animation: ai-rise 0.4s $ease both;
}

.ai-chip-btn,
.ai-rate {
  display: grid;
  place-items: center;
  width: px2rem(24);
  height: px2rem(24);
  border: none;
  border-radius: px2rem(6);
  background: transparent;
  color: inherit;
  font-size: px2rem(13);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.25s $spring;

  &:hover:not(:disabled) {
    background: rgba(62, 166, 255, 0.14);
    color: #fff;
  }
  &:active:not(:disabled) {
    transform: scale(0.85);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.ai-rate.is-active {
  transform: scale(1.12);
  &.is-satisfied {
    color: $c-ok;
    background: rgba(62, 224, 160, 0.14);
  }
  &.is-partial {
    color: $c-warn;
    background: rgba(255, 194, 75, 0.14);
  }
  &.is-unsatisfied {
    color: $c-err;
    background: rgba(255, 107, 107, 0.14);
  }
}

.ai-reason {
  width: 100%;
  margin-top: px2rem(6);
  padding: px2rem(10);
  border-radius: px2rem(10);
  border: px2rem(1) solid $c-line;
  background: rgba(8, 20, 36, 0.7);
  font-size: px2rem(11);

  input {
    width: 100%;
    margin-top: px2rem(8);
    padding: px2rem(6) px2rem(8);
    border: px2rem(1) solid $c-line;
    border-radius: px2rem(6);
    background: rgba(0, 0, 0, 0.25);
    color: #fff;
    font-size: px2rem(11);
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;

    &:focus {
      border-color: rgba(47, 230, 255, 0.6);
    }
  }
}

.ai-reason__title {
  margin-bottom: px2rem(8);
  color: $c-sub;
}

.ai-reason__chips {
  display: flex;
  flex-wrap: wrap;
  gap: px2rem(5);

  button {
    padding: px2rem(3) px2rem(10);
    border: px2rem(1) solid $c-line;
    border-radius: px2rem(12);
    background: transparent;
    color: $c-sub;
    font-size: px2rem(11);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: #fff;
    }
    &.is-active {
      border-color: rgba(255, 107, 107, 0.6);
      background: rgba(255, 107, 107, 0.16);
      color: #ffd0d0;
    }
  }
}

.ai-reason__foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: px2rem(6);
  margin-top: px2rem(8);
}

.ai-reason__error {
  margin-right: auto;
  color: $c-err;
  font-size: px2rem(11);
}

.ai-btn {
  padding: px2rem(4) px2rem(14);
  border: none;
  border-radius: px2rem(6);
  background: linear-gradient(135deg, #2f8cff, #5a6dff);
  color: #fff;
  font-size: px2rem(11);
  cursor: pointer;
  transition: filter 0.2s, transform 0.2s;

  &:hover:not(:disabled) {
    filter: brightness(1.15);
  }
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  &.is-ghost {
    border: px2rem(1) solid $c-line;
    background: transparent;
    color: $c-sub;
  }
  &:disabled {
    opacity: 0.5;
  }
}

.ai-to-bottom {
  position: absolute;
  right: px2rem(16);
  bottom: px2rem(150);
  display: grid;
  place-items: center;
  width: px2rem(30);
  height: px2rem(30);
  border: px2rem(1) solid rgba(110, 190, 255, 0.35);
  border-radius: 50%;
  background: rgba(12, 30, 48, 0.95);
  color: $c-cyan;
  font-size: px2rem(15);
  cursor: pointer;
  box-shadow: 0 px2rem(4) px2rem(12) rgba(0, 0, 0, 0.4);
  z-index: 2;
}

/* ---------------------------------------------------------------- 快捷指令 */
.ai-suggest {
  padding: px2rem(6) px2rem(14) px2rem(4);
  border-top: px2rem(1) solid $c-line;
}

.ai-suggest__tabs {
  display: flex;
  align-items: center;
  gap: px2rem(2);

  button {
    position: relative;
    padding: px2rem(4) px2rem(8);
    border: none;
    background: transparent;
    color: $c-sub;
    font-size: px2rem(11);
    cursor: pointer;
    transition: color 0.2s;

    &::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 0;
      height: px2rem(2);
      border-radius: px2rem(2);
      background: linear-gradient(90deg, $c-cyan, $c-violet);
      transform: translateX(-50%);
      transition: width 0.3s $ease;
    }

    &:hover {
      color: #fff;
    }
    &.is-active {
      color: #fff;
      &::after {
        width: 60%;
      }
    }
  }
}

.ai-suggest__fold {
  margin-left: auto;
  font-size: px2rem(14) !important;

  svg {
    transition: transform 0.3s $ease;
    &.is-flip {
      transform: rotate(180deg);
    }
  }
  &::after {
    display: none;
  }
}

.ai-suggest__list {
  display: flex;
  flex-wrap: wrap;
  gap: px2rem(6);
  padding: px2rem(6) 0 px2rem(4);

  button {
    padding: px2rem(4) px2rem(10);
    border: px2rem(1) solid rgba(110, 190, 255, 0.25);
    border-radius: px2rem(14);
    background: rgba(30, 60, 92, 0.35);
    color: #cfe8ff;
    font-size: px2rem(11);
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.25s $spring, color 0.2s;

    &:hover:not(:disabled) {
      border-color: rgba(47, 230, 255, 0.7);
      background: rgba(47, 230, 255, 0.12);
      color: #fff;
      transform: translateY(px2rem(-2));
    }
    &:active:not(:disabled) {
      transform: scale(0.95);
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

/* ---------------------------------------------------------------- 输入区 */
.ai-input {
  display: flex;
  align-items: flex-end;
  gap: px2rem(8);
  margin: px2rem(4) px2rem(12) 0;
  padding: px2rem(6) px2rem(6) px2rem(6) px2rem(12);
  border: px2rem(1) solid rgba(110, 190, 255, 0.25);
  border-radius: px2rem(14);
  background: rgba(4, 12, 24, 0.6);
  transition: border-color 0.25s, box-shadow 0.25s;

  &.is-focus {
    border-color: rgba(47, 230, 255, 0.65);
    box-shadow: 0 0 0 px2rem(3) rgba(47, 230, 255, 0.12), 0 0 px2rem(18) rgba(47, 230, 255, 0.15);
  }

  &.is-disabled {
    opacity: 0.6;
  }

  textarea {
    flex: 1;
    min-height: px2rem(22);
    max-height: px2rem(120);
    padding: px2rem(5) 0;
    border: none;
    background: transparent;
    color: #fff;
    font-size: px2rem(13);
    line-height: 1.5;
    font-family: inherit;
    resize: none;
    outline: none;

    &::placeholder {
      color: rgba(143, 180, 207, 0.6);
    }
  }
}

.ai-send {
  flex: none;
  display: grid;
  place-items: center;
  width: px2rem(34);
  height: px2rem(34);
  border: none;
  border-radius: px2rem(10);
  background: linear-gradient(135deg, $c-cyan, #2f8cff 55%, $c-violet);
  color: #fff;
  font-size: px2rem(16);
  cursor: pointer;
  box-shadow: 0 px2rem(4) px2rem(14) rgba(47, 140, 255, 0.45);
  transition: transform 0.25s $spring, filter 0.2s, opacity 0.2s;

  svg {
    fill: currentColor;
  }

  &:hover:not(:disabled) {
    transform: translateY(px2rem(-1)) rotate(-8deg);
    filter: brightness(1.12);
  }
  &:active:not(:disabled) {
    transform: scale(0.9);
  }
  &:disabled {
    opacity: 0.35;
    box-shadow: none;
    cursor: not-allowed;
  }

  &.is-stop {
    background: rgba(255, 107, 107, 0.16);
    border: px2rem(1) solid rgba(255, 107, 107, 0.6);
    color: $c-err;
    box-shadow: 0 0 px2rem(12) rgba(255, 107, 107, 0.3);
    animation: ai-pulse-ring 1.6s ease-out infinite;
  }
}

.ai-foot {
  padding: px2rem(6) 0 px2rem(8);
  text-align: center;
  font-size: px2rem(10);
  color: rgba(143, 180, 207, 0.5);
}

/* ---------------------------------------------------------------- 过渡动画 */
.ai-fab-enter-active {
  transition: opacity 0.4s $ease 0.15s, transform 0.5s $spring 0.15s;
}
.ai-fab-leave-active {
  transition: opacity 0.15s, transform 0.2s;
}
.ai-fab-enter,
.ai-fab-leave-to {
  opacity: 0;
  transform: scale(0.6) translateY(px2rem(10));
}

.ai-panel-enter-active {
  transition: opacity 0.35s $ease, transform 0.5s $spring, filter 0.4s $ease;
}
.ai-panel-leave-active {
  transition: opacity 0.22s ease, transform 0.25s ease, filter 0.22s ease;
}
.ai-panel-enter,
.ai-panel-leave-to {
  opacity: 0;
  transform: translateY(px2rem(24)) scale(0.88);
  filter: blur(px2rem(6));
}

.ai-msg-enter-active {
  transition: opacity 0.4s $ease, transform 0.45s $spring;
}
.ai-msg-enter {
  opacity: 0;
  transform: translateY(px2rem(14)) scale(0.96);
}
.ai-msg.is-user.ai-msg-enter {
  transform: translateX(px2rem(18)) scale(0.96);
}
.ai-msg-leave-active {
  position: absolute;
  transition: opacity 0.2s;
}
.ai-msg-leave-to {
  opacity: 0;
}
.ai-msg-move {
  transition: transform 0.3s $ease;
}

.ai-fold-enter-active,
.ai-fold-leave-active {
  transition: opacity 0.25s, transform 0.3s $ease;
}
.ai-fold-enter,
.ai-fold-leave-to {
  opacity: 0;
  transform: translateY(px2rem(-6));
}

.ai-fade-enter-active,
.ai-fade-leave-active {
  transition: opacity 0.2s, transform 0.25s $ease;
}
.ai-fade-enter,
.ai-fade-leave-to {
  opacity: 0;
  transform: translateY(px2rem(8));
}

.ai-swap-enter-active,
.ai-swap-leave-active {
  transition: opacity 0.18s, transform 0.22s $ease;
}
.ai-swap-enter {
  opacity: 0;
  transform: translateY(px2rem(6));
}
.ai-swap-leave-to {
  opacity: 0;
  transform: translateY(px2rem(-6));
}

@keyframes ai-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes ai-breathe {
  0%,
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(0.92);
    filter: brightness(1.2);
  }
}
@keyframes ai-sheen {
  from {
    background-position: 150% 0;
  }
  to {
    background-position: -100% 0;
  }
}
@keyframes ai-ping {
  0% {
    box-shadow: 0 0 0 0 rgba(47, 230, 255, 0.6);
  }
  100% {
    box-shadow: 0 0 0 px2rem(8) rgba(47, 230, 255, 0);
  }
}
@keyframes ai-pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.5);
  }
  100% {
    box-shadow: 0 0 0 px2rem(8) rgba(255, 107, 107, 0);
  }
}
@keyframes ai-blink {
  50% {
    opacity: 0.35;
  }
}
@keyframes ai-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(px2rem(-5));
    opacity: 1;
  }
}
@keyframes ai-shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
@keyframes ai-rise {
  from {
    opacity: 0;
    transform: translateY(px2rem(6));
  }
}
@keyframes ai-drift {
  from {
    transform: translateX(-60%);
  }
  to {
    transform: translateX(-40%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai *,
  .ai *::before,
  .ai *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
