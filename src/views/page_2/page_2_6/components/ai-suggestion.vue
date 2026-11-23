<!-- AI 流式建议（原型：顶部标题 + 下方滚动内容） -->
<template>
  <div class="ai-suggestion" :class="{ visible: visible, 'no-side': hideSideLabel }">
    <!-- 顶部：AI建议标题（hideSideLabel=true 时隐藏） -->
    <div v-if="!hideSideLabel" class="ai-side">
      <div class="ai-label">
        <span>AI建议</span>
      </div>
      <span v-if="answering" class="ai-typing">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </span>
    </div>
    <!-- 下方：固定高度滚动框，流式追加自动滚到底部 -->
    <div ref="scroll" class="ai-scroll">
      <!-- Markdown 渲染（已做 DOMPurify XSS 清洗） -->
      <div
        v-if="content"
        class="ai-content markdown-body"
        v-html="renderedContent"
      ></div>
      <!-- 占位提示（无内容时） -->
      <p v-else class="ai-content placeholder">
        {{ answering ? "AI 正在生成…" : "运行仿真后将显示物理 AI 建议" }}
      </p>
    </div>
  </div>
</template>

<script>
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";

// 单例：避免每次渲染都重新创建实例
const md = new MarkdownIt({
  html: false,        // 不允许原始 HTML（XSS 防护）
  breaks: true,       // 单换行 → <br>，更适合 AI 流式输出
  linkify: true,      // 自动识别 URL
  typographer: false,
});

export default {
  name: "AiSuggestion",
  props: {
    /** AI 已累积内容（Markdown 文本） */
    content: {
      type: String,
      default: ""
    },
    /** 是否流式中 */
    answering: {
      type: Boolean,
      default: false
    },
    /** 隐藏顶部“AI建议”标题（外层已提供同名标题时使用） */
    hideSideLabel: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    visible() {
      return !!this.content || this.answering;
    },
    /**
     * 把 Markdown 渲染为 HTML 并做 XSS 清洗
     * - content 每次更新都会触发重新渲染（流式天然支持）
     * - 空字符串短路返回，避免无谓的 markdown 解析
     */
    renderedContent() {
      const raw = String(this.content || "");
      if (!raw) return "";
      return DOMPurify.sanitize(md.render(raw));
    }
  },
  watch: {
    /**
     * 流式追加内容时自动滚到底部
     * - 用户手动向上滚阅读时不强制滚动（容差 24px）
     */
    content() {
      this.$nextTick(() => {
        const el = this.$refs.scroll;
        if (!el) return;
        const distanceToBottom =
          el.scrollHeight - el.scrollTop - el.clientHeight;
        // 仅当用户基本停留在底部附近时才自动滚动，避免打断阅读
        if (distanceToBottom < 24) {
          el.scrollTop = el.scrollHeight;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
/* ============ AI 建议卡片：340×142 @ 1920 ============ */
.ai-suggestion {
  width: 100%;
  height: 8.875rem;
  padding: 0.625rem 0.625rem 1.125rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: 0.25rem;
  background: rgba(12, 21, 43, 0.6);
  border: 1px solid rgba(207, 231, 255, 0.2);
  overflow: hidden;
  font-size: var(--font-size-10);
  line-height: 1.5;
  opacity: 0.5;
  transition: opacity 0.3s;

  &.visible {
    opacity: 1;
  }

  /* 外层已经提供标题时，仅保留正文滚动区。 */
  &.no-side {
    .ai-scroll {
      height: 100%;
      margin-top: 0;
    }
  }
}

/* ============ 顶部标题：48×14 的视觉规格 ============ */
.ai-side {
  flex: 0 0 0.875rem;
  height: 0.875rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.35rem;
  padding: 0;
  background: transparent;
  border: none;
}

.ai-label {
  display: flex;
  align-items: center;
  height: 0.875rem;
  color: #9bf8ff;
  font-family: var(--font-family-primary-Medium);
  line-height: 0.875rem;
  letter-spacing: 0.02em;

  > span {
    color: #9bf8ff;
    font-size: var(--font-size-12);
    line-height: 0.875rem;
  }
}

.ai-typing {
  display: inline-flex;
  align-items: center;
  gap: 0.12rem;

  .dot {
    width: 0.16rem;
    height: 0.16rem;
    border-radius: 50%;
    background: #91a8c2;
    animation: ai-blink 1.4s infinite both;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes ai-blink {
  0%,
  80%,
  100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}

.ai-content {
  margin: 0;
  color: rgba(238, 248, 253, 0.88);
  word-break: break-word;

  &.placeholder {
    white-space: pre-wrap;
    color: rgba(238, 248, 253, 0.5);
  }
}

/* ============ 正文：标题下 10px；由 flex 吃满中间区域，固定保留约 18px 底部留白 ============ */
.ai-scroll {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  height: auto;
  margin-top: 0.625rem;
  padding: 0 0.35rem 0 0;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(145, 168, 194, 0.4) transparent;

  /* WebKit (Chrome / Safari / Edge) */
  &::-webkit-scrollbar {
    width: 0.3125rem;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    min-height: 2.625rem;
    border-radius: 6.125rem;
    background: rgba(145, 168, 194, 0.4);

    &:hover {
      background: rgba(145, 168, 194, 0.62);
    }
  }
}

/* ===== Markdown 渲染样式（v-html 注入内容需用 ::v-deep） ===== */
::v-deep .markdown-body {
  p {
    margin: 0.12rem 0;
    color: rgba(238, 248, 253, 0.88);

    &:first-child { margin-top: 0; }
    &:last-child { margin-bottom: 0; }
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0.22rem 0 0.12rem;
    color: rgba(246, 255, 255, 0.96);
    font-family: var(--font-family-primary-Medium);
    font-weight: 600;
    line-height: 1.3;
  }
  h1 { font-size: var(--font-size-12); }
  h2, h3 { font-size: var(--font-size-10); }
  h4, h5, h6 { font-size: var(--font-size-10); }

  ul, ol {
    margin: 0.12rem 0;
    padding-left: 1rem;

    li {
      margin: 0.04rem 0;
      color: rgba(238, 248, 253, 0.88);
      line-height: 1.45;
    }
  }
  ul li { list-style: disc outside; }
  ol li { list-style: decimal outside; }

  code {
    padding: 0.02rem 0.2rem;
    border-radius: 0.12rem;
    background: rgba(0, 0, 0, 0.4);
    color: #fbbf24;
    font-family: "JetBrains Mono", Consolas, Monaco, monospace;
    font-size: 0.92em;
  }

  pre {
    margin: 0.2rem 0;
    padding: 0.25rem 0.35rem;
    border-radius: 0.2rem;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(207, 231, 255, 0.12);
    overflow-x: auto;

    code {
      padding: 0;
      background: transparent;
      color: rgba(238, 248, 253, 0.9);
    }
  }

  strong, b {
    color: #fff;
    font-family: var(--font-family-primary-Medium);
    font-weight: 600;
  }
  em, i {
    color: rgba(255, 255, 255, 0.9);
    font-style: italic;
  }

  a {
    color: #9bf8ff;
    text-decoration: none;
    border-bottom: 1px dashed rgba(155, 248, 255, 0.45);
  }

  blockquote {
    margin: 0.2rem 0;
    padding: 0.12rem 0.35rem;
    border-left: 0.12rem solid rgba(145, 168, 194, 0.7);
    background: rgba(145, 168, 194, 0.08);
    color: rgba(238, 248, 253, 0.78);
  }

  table {
    width: 100%;
    margin: 0.2rem 0;
    border-collapse: collapse;
    font-size: var(--font-size-10);

    th, td {
      padding: 0.12rem 0.25rem;
      border: 1px solid rgba(207, 231, 255, 0.16);
      text-align: left;
    }

    th {
      background: rgba(61, 158, 255, 0.08);
      color: rgba(246, 255, 255, 0.9);
      font-weight: 600;
    }
  }

  hr {
    margin: 0.25rem 0;
    border: none;
    border-top: 1px dashed rgba(207, 231, 255, 0.18);
  }
}
</style>
