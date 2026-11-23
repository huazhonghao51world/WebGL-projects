<template>
  <div class="suggestion-card" :style="{ 'aspect-ratio': aspectRatio }">
    <div class="suggestion-label">
      <div>{{ label }}</div>
    </div>
    <div class="suggestion-content">
      <div>{{ content }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SuggestionCard",
  props: {
    label: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    aspectRatio: {
      type: String,
      default: "324/64",
    },
  },
};
</script>

<style lang="scss" scoped>
.suggestion-card {
  display: flex;
  align-items: stretch;
  margin-bottom: 0.9rem;
  width: 100%;
  position: relative;
  background-image: url("~@/assets/images/page_1_1/表单背景.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  transition: all 0.3s ease;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

.suggestion-label {
  flex-shrink: 0;
  width: 6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  div {
    font-size: var(--font-size-16);
    font-weight: bold;
    margin-right: 0.5rem;
    color: #9bf8ff;
    font-family: var(--font-family-Bold);
    letter-spacing: 0.1rem;
  }
}

.suggestion-content {
  position: absolute;
  left: 6.5rem;
  right: 0;
  top: 0;
  bottom: 0;
  width: 13rem;
  display: flex;
  align-items: center;

  div {
    margin: 0;
    font-size: 0.753rem;
    line-height: px2rem(16);
    color: var(--color-primary);
    font-family: var(--font-family-primary-Regular);
    text-align: left;
  }
}
</style>
