<!--
  可折叠分块 - 仿 PRD .section 风格
  =====================================================
  - 标题点击切换折叠状态（▼ / ▶）
  - 支持 noCollapse 模式（标题不可点击）
  - 支持 scopeTag（标题右侧的小标签，如"源网荷储""入口"）
  - 用法：
      <CollapseSection title="工厂能耗管控总览" scope-tag="主视图" scope-tag-class="primary">
        ...内容...
      </CollapseSection>
-->
<template>
  <div class="collapse-section" :class="{ collapsed: localCollapsed, 'no-collapse': noCollapse, 'is-plain': plain, 'no-separator': noSeparator }">
    <div class="section-head" @click="toggle">
      <span class="section-title" :style="{ fontSize: titleSize }">
        <slot name="title">{{ title }}</slot>
      </span>
      <span class="section-tools">
        <slot name="tools"></slot>
        <span
          v-if="scopeTag"
          class="scope-tag"
          :class="scopeTagClass ? `tag-${scopeTagClass}` : ''"
        >{{ scopeTag }}</span>
        <span v-if="!noCollapse" class="caret">▼</span>
      </span>
    </div>
    <transition name="collapse-fade">
      <div v-show="!localCollapsed" class="section-body">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "CollapseSection",
  props: {
    /** 标题文本（也可通过 v-slot:title 传入） */
    title: {
      type: String,
      default: ""
    },
    /** 是否默认折叠 */
    defaultCollapsed: {
      type: Boolean,
      default: false
    },
    /** 是否禁用折叠（标题点击不响应） */
    noCollapse: {
      type: Boolean,
      default: false
    },
    /** 标题右侧标签文本 */
    scopeTag: {
      type: String,
      default: ""
    },
    /** 标签样式：primary / sub / muted */
    scopeTagClass: {
      type: String,
      default: ""
    },
    /** 纯文字模式（子模块标题）：无背景图，仅顶部一条紫色横条 */
    plain: {
      type: Boolean,
      default: false
    },    /** plain 模式下：是否隐藏标题下方的「二级标题文字分隔.png」装饰横线 */
    noSeparator: {
      type: Boolean,
      default: false
    },    
    titleSize: {
      type: String,
      default: "1rem"
    }
  },
  data() {
    return {
      localCollapsed: this.defaultCollapsed
    };
  },
  watch: {
    defaultCollapsed(val) {
      this.localCollapsed = val;
    }
  },
  methods: {
    toggle() {
      if (this.noCollapse) return;
      this.localCollapsed = !this.localCollapsed;
      this.$emit("toggle", this.localCollapsed);
    }
  }
};
</script>

<style lang="scss" scoped>
.collapse-section {
  margin-bottom: 0;
  /* 设计稿：外层透明，标题栏为独立渐变区块，不需包裹边框 */
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: visible;
  flex-shrink: 0;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 设计稿标注：32px 高、左右 padding 20px、圆角 2px */
  height: 2rem;
  padding: 0 1.25rem;
  border-radius: 0.125rem;
  /* 设计稿提供的标题背景图（拉伸适配宽度，高度刚好 32px） */
  background: url("~@/assets/images/page_2_6/标题背景.png") no-repeat center / 100% 100%;
  /* 标题字号调大：18px @1920（原 16px） */
  font-size: 1.125rem;
  font-family: var(--font-family-primary-Bold);
  color: #f6ffff;
  letter-spacing: 0.01em;
  cursor: pointer;
  user-select: none;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.12);
  }
}

.no-collapse .section-head {
  cursor: default;

  &:hover {
    filter: none;
  }
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  /* 字号由 titleSize prop 通过 :style 注入，此处是无 prop 时的兜底默认值 */
  font-size: 1rem;
}

.section-tools {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.scope-tag {
  font-size: var(--font-size-10);
  font-weight: 400;
  padding: 0.05rem 0.3rem;
  border-radius: 0.15rem;
  background: rgba(0, 0, 0, 0.35);
  color: rgba(238, 248, 253, 0.7);
  border: 1px solid rgba(167, 209, 255, 0.25);

  &.tag-primary {
    color: #b5e3ff;
    border-color: rgba(155, 248, 255, 0.4);
    background: rgba(61, 158, 255, 0.18);
  }

  &.tag-sub {
    color: #fbd38d;
    border-color: rgba(245, 158, 11, 0.4);
    background: rgba(245, 158, 11, 0.12);
  }

  &.tag-muted {
    color: rgba(238, 248, 253, 0.65);
  }
}

.caret {
  font-size: var(--font-size-10);
  color: rgba(246, 255, 255, 0.7);
  transition: transform 0.25s ease;
  display: inline-block;
  width: 0.7rem;
  text-align: center;
}

.collapsed .caret {
  transform: rotate(-90deg);
}

.section-body {
  /* 与标题栏隔开 + 透明背板，最大化内容舒展空间 */
  margin-top: 0.22rem;
  padding: 0.3rem 0.5rem 0.3rem;
  background: rgba(12, 21, 43, 0.32);
  border: 1px solid rgba(167, 209, 255, 0.1);
  border-radius: 0.125rem;
}

/* ===================================================
   plain 模式（子模块标题）
   - 设计稿参考：推荐方案 / 参数配置 / 供电策略 / 仿真结果对比 / AI建议
   - 无渐变背景图、无边框；标题下方使用 二级标题文字分隔.png 作为装饰横线
=================================================== */
.collapse-section.is-plain {
  margin-bottom: 0;

  .section-head {
    /* 覆盖：去背景图、展开高度，贴左 padding，并预留底部给分隔图 */
    height: auto;
    min-height: 1.4rem;
    /* padding-top: 标题上方留白  padding-bottom: 标题文字到分隔线的间距（拉松一点更舒展） */
    padding: 0.5rem 0.1rem 0.75rem;
    background: none;
    border-radius: 0;
    font-size: 0.875rem; /* 14px @1920 */
    color: rgba(238, 248, 253, 0.95);
    font-family: var(--font-family-primary-Medium);
    letter-spacing: 0.02em;
    position: relative;

    /* 底部装饰横线（二级标题文字分隔.png）—— absolute 不影响 title/tools 横向 flex 布局 */
    /* bottom: 分隔线距 section-head 底边的位置，与 padding-bottom 配合控制间距 */
    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0.12rem;
      height: 0.38rem;
      margin-top: 0;
      background: url("~@/assets/images/page_2_6/二级标题文字分隔.png")
        no-repeat left center;
      background-size: 100% 100%;
      pointer-events: none;
    }

    &:hover {
      filter: none;
    }
  }

  /* 按需隐藏二级标题装饰横线（如「仿真结果对比」不需要分隔线）
     同时收回为分隔线预留的下边距 + section-body 顶距，让标题与内容贴合 */
  &.no-separator {
    .section-head {
      /* 无分隔线时下内边距尽量小，让标题贴近内容（与 inset-block 等纯文字组件视觉同源） */
      padding-bottom: 0.15rem;

      &::after {
        display: none;
      }
    }

    .section-body {
      margin-top: 0.06rem;
    }
  }

  .section-body {
    /* 透明背板：完全交给设计稿 3D 场景透出 */
    margin-top: 0.12rem;
    padding: 0.1rem 0.1rem 0.25rem;
    background: transparent;
    border: none;
    border-radius: 0;
  }
}

/* 折叠展开动画 */
.collapse-fade-enter-active,
.collapse-fade-leave-active {
  transition: opacity 0.2s ease;
}
.collapse-fade-enter,
.collapse-fade-leave-to {
  opacity: 0;
}
</style>
