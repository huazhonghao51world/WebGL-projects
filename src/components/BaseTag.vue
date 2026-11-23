<template>
  <div class="tag-wrapper" :style="cssVars">
    <span class="tag-bar"></span>
    <span class="tag-text"
      ><slot>{{ text }}</slot></span
    >
    <span class="tag-bar"></span>
  </div>
</template>

<script>
export default {
  name: "BaseTag",
  props: {
    text: {
      type: String,
      default: "",
    },
    bgColor: {
      type: String,
      default: "", // 默认使用 CSS 回退值
    },
    barColor: {
      type: String,
      default: "",
    },
    textColor: {
      type: String,
      default: "",
    },
    width: {
      type: String,
      default: "", // 默认宽度
    },
  },
  computed: {
    cssVars() {
      const vars = {};
      if (this.bgColor) vars["--tag-bg-color"] = this.bgColor;
      if (this.barColor) vars["--tag-bar-color"] = this.barColor;
      if (this.textColor) vars["--tag-text-color"] = this.textColor;
      if (this.width) vars["width"] = this.width;
      return vars;
    },
  },
};
</script>

<style lang="scss" scoped>
.tag-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--tag-bg-color, rgba(224, 233, 233, 0.1));
  padding: 0.25rem 0;

  .tag-bar {
    display: inline-block;
    width: 1px;
    height: 0.6rem;
    background: var(--tag-bar-color, #e0e9e9);
    border-radius: 1px;
    flex-shrink: 0;
    position: absolute;
    &:first-child {
      left: 0;
    }
    &:last-child {
      right: 0;
    }
  }

  .tag-text {
    color: var(--tag-text-color, #ebf6ff);
    font-size: var(--font-size-12, 12px);
    font-family: var(--font-family-primary-Regular, sans-serif);
    padding: 0 0.5rem;
  }
}
</style>
