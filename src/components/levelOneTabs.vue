<template>
  <div class="level-one-tabs">
    <div
      v-for="(item, index) in tabs"
      :key="item.value"
      class="tab-item"
      :class="{ active: value === item.value }"
      @click="handleTabClick(item.value)"
    >
      <span class="tab-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LevelOneTabs',
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    tabs: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleTabClick(val) {
      this.$emit('input', val);
      this.$emit('change', val);
    }
  }
}
</script>

<style lang="scss" scoped>
.level-one-tabs {
  display: flex;
  align-items: center;
  height: 2.37rem;
  background: rgba(30, 45, 65, 0.4);
  border: 1px solid rgba(80, 100, 120, 0.6);
  border-radius: 2px;
  position: relative;
  margin-bottom: 12px;

  .tab-item {
    flex: 1;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    position: relative;
    color: rgba(255, 255, 255, 0.6);
    font-size: var(--font-size-14);
    font-family: var(--font-family-primary-Regular);
    transition: color 0.3s;

    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }

    &.active {
      color: #fff;
      font-family: var(--font-family-primary-Medium);
      
      &::before {
        content: "";
        position: absolute;
        top: -1px;
        left: -1px;
        width: 100%;
        height: 115%;
        background: url('~@/assets/images/img/tab_active.png') no-repeat center bottom;
        background-size: 100% 100%;
        z-index: 0;
        pointer-events: none;
      }
    }

    .tab-label {
      position: relative;
      font-size: var(--font-size-14);
      z-index: 1;
    }
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 20%;
      height: 60%;
      width: 1px;
      background: rgba(80, 100, 120, 0.6);
    }
    
    &.active::after,
    &:has(+ .active)::after {
      display: none;
    }
  }
}
</style>
