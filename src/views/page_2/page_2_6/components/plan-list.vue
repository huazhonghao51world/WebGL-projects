<!-- 调控预案列表（标签页样式，点击切换方案） -->
<template>
  <div class="plan-tabs">
    <div
      v-for="plan in plans"
      :key="plan.id"
      class="plan-tab"
      :class="{ active: selectedId === plan.id }"
      @click="$emit('select', selectedId === plan.id ? null : plan)"
    >
      <span class="tab-text">{{ tabLabel(plan) }}</span>
    </div>
    <div v-if="!plans || !plans.length" class="empty-tip">暂无调控预案</div>
  </div>
</template>

<script>
export default {
  name: "PlanList",
  props: {
    /** 方案列表 */
    plans: {
      type: Array,
      default: () => []
    },
    /** 当前选中的方案 id */
    selectedId: {
      type: [String, Number],
      default: null
    }
  },
  methods: {
    /** 标签短名：优先 name/shortName/tag，回退 title */
    tabLabel(plan) {
      return plan.name || plan.shortName || plan.tag || plan.title || "";
    }
  }
};
</script>

<style lang="scss" scoped>
.plan-tabs {
  width: 100%;
  padding: 0.15rem 0.1rem;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  background: rgba(12, 21, 43, 0.6);
  border: 1px solid rgba(207, 231, 255, 0.2);
}

.plan-tab {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 0.15rem 0.2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.2rem;
  border: 1px solid transparent;
  box-sizing: border-box;

  /* 标签之间的竖向分隔线 */
  & + .plan-tab::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 1rem;
    background: rgba(167, 209, 255, 0.25);
  }

  .tab-text {
    font-size: var(--font-size-12);
    color: rgba(238, 248, 253, 0.7);
    font-family: var(--font-family-primary-Regular);
    font-size: 1rem;
    font-weight: normal;
    line-height: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover .tab-text {
    color: rgba(238, 248, 253, 0.95);
  }

  /* 选中态：蓝色描边框 + 高亮文字 */
  &.active {
    border-radius: 0.2rem;
    background: linear-gradient(180deg, #749fff4d 0%, #467fff00 91%), linear-gradient(0deg, rgba(5, 94, 241, 0.1), rgba(5, 94, 241, 0.1)), rgba(12, 21, 43, 0.5);
    border-color: rgba(146, 201, 250, 0.6);

    .tab-text {
      color: #fff;
      font-family: var(--font-family-primary-Bold);
    }

    /* 选中项两侧不显示相邻分隔线 */
    &::before,
    & + .plan-tab::before {
      display: none;
    }
  }
}

.empty-tip {
  flex: 1;
  text-align: center;
  font-size: var(--font-size-10);
  color: rgba(238, 248, 253, 0.4);
  padding: 0.4rem 0;
}
</style>
