<template>
  <div class="device-control">
    <!-- Tab 切换 -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Tab 1: 模式调节 -->
    <div v-show="activeTab === 'mode'" class="tab-content mode-panel">
      <div class="mode-label">模式选择</div>
      <div class="mode-list">
        <div
          v-for="(mode, idx) in modes"
          :key="idx"
          class="mode-item"
          :class="{
            'is-selected': selectedMode === idx,
            'is-running': runningMode === idx,
          }"
          @click="selectedMode = idx"
        >
          {{ mode.label }}
        </div>
      </div>
      <div class="panel-buttons">
        <button class="ctrl-btn primary" @click="onModeConfirm">确认</button>
        <button class="ctrl-btn" @click="onModeStop">停止</button>
      </div>
    </div>

    <!-- Tab 2: 参数指令 -->
    <div v-show="activeTab === 'param'" class="tab-content param-panel">
      <div
        v-for="axis in axes"
        :key="axis.key"
        class="axis-row"
      >
        <span class="axis-label">{{ axis.label }}</span>
        <div class="slider-wrapper">
          <image-slider
            v-model="axisValues[axis.key]"
            :min="0"
            :max="100"
          />
        </div>
        <span class="axis-value">{{ axisValues[axis.key] }}%</span>
      </div>
      <div class="panel-buttons">
        <button class="ctrl-btn primary" @click="onParamConfirm">确认</button>
        <button class="ctrl-btn" @click="onParamReset">复位</button>
      </div>
    </div>
  </div>
</template>

<script>
import ImageSlider from './ImageSlider.vue';

export default {
  name: 'DeviceControl',
  components: { ImageSlider },
  data() {
    return {
      activeTab: 'mode',
      tabs: [
        { key: 'mode', label: '模式调节' },
        { key: 'param', label: '参数指令' },
      ],
      modes: [
        { label: '模式一' },
        { label: '模式二' },
      ],
      selectedMode: 0,
      runningMode: 0,
      axes: [
        { key: 'x', label: 'X轴' },
        { key: 'y', label: 'Y轴' },
        { key: 'z', label: 'Z轴' },
      ],
      axisValues: { x: 30, y: 57, z: 23 },
      defaultAxisValues: { x: 30, y: 57, z: 23 },
    };
  },
  methods: {
    onModeConfirm() {
      if (this.selectedMode < 0) return;
      this.runningMode = this.selectedMode;
      // 模式控制生效，复位参数指令
      this.axisValues = { ...this.defaultAxisValues };
      // 模式一 → AnimationIndex 0，模式二 → AnimationIndex 1
      this.$emit('mode-confirm', this.runningMode);
    },
    onModeStop() {
      this.runningMode = -1;
      this.selectedMode = -1;
      this.$emit('mode-stop');
    },
    onParamConfirm() {
      // 参数指令生效，取消模式调节；仅在动画播放中才停止
      const wasRunning = this.runningMode >= 0;
      this.runningMode = -1;
      this.selectedMode = -1;
      if (wasRunning) this.$emit('mode-stop');
      this.$emit('param-confirm', { ...this.axisValues });
    },
    onParamReset() {
      this.axisValues = { ...this.defaultAxisValues };
      // 复位取消模式调节；仅在动画播放中才停止
      const wasRunning = this.runningMode >= 0;
      this.runningMode = -1;
      this.selectedMode = -1;
      if (wasRunning) this.$emit('mode-stop');
      this.$emit('param-reset', { ...this.axisValues });
    },
  },
};
</script>

<style lang="scss" scoped>
.device-control {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.5rem;
  gap: 0.5rem;
}

/* ── Tab 栏 ─────────────────────────── */
.tab-bar {
  display: flex;
  height: 2rem;
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: var(--font-size-14);
  font-family: var(--font-family-primary-Regular);
  color: rgba(255, 255, 255, 0.55);
  transition: all 0.25s;
  background: url('~@/assets/images/page_2_5/Tab未选中.png') no-repeat center / 100% 100%;
  border: none;
  position: relative;

  &:hover { color: rgba(255, 255, 255, 0.8); }

  &.active {
    color: #fff;
    font-family: var(--font-family-primary-Medium);
    background: url('~@/assets/images/page_2_5/Tab选中.png') no-repeat center / 100% 100%;

    &::after {
      content: '';
      position: absolute;
      bottom: -0.2rem;
      left: 50%;
      transform: translateX(-50%);
      width: 1.375rem;
      height: 0.47rem;
      background: url('~@/assets/images/page_2_5/TabSelectArrow.png') no-repeat center / contain;
    }
  }
}

/* ── 内容区通用 ─────────────────────── */
.tab-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* ── Tab1: 模式调节 ─────────────────── */
.mode-label {
  font-size: var(--font-size-12);
  color: rgba(201, 216, 229, 0.7);
  margin-bottom: 0.4rem;
}

.mode-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
  min-height: 0;
}

.mode-item {
  height: 2rem;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  border: none;
  background: url('~@/assets/images/page_2_5/BG_Mode3.png') no-repeat center / 100% 100%;
  color: rgba(219, 245, 255, 0.65);
  font-size: var(--font-size-14);
  font-family: var(--font-family-primary-Regular);
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    filter: brightness(1.15);
    color: rgba(219, 245, 255, 0.85);
  }

  &.is-selected {
    background: url('~@/assets/images/page_2_5/BG_Mode2.png') no-repeat center / 100% 100%;
    color: #DBF5FF;
  }

  &.is-running {
    background: url('~@/assets/images/page_2_5/BG_Mode1.png') no-repeat center / 100% 100%;
    color: #9BF8FF;
    font-family: var(--font-family-primary-Medium);
  }
}

/* ── Tab2: 参数指令 ─────────────────── */
.param-panel {
  gap: 0.35rem;
}

.axis-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.axis-label {
  width: 2.2rem;
  font-size: var(--font-size-14);
  color: #C9D8E5;
  flex-shrink: 0;
}

.axis-value {
  width: 2.8rem;
  text-align: right;
  font-size: var(--font-size-16);
  color: #FFFFFF;
  font-family: var(--font-family-primary-Medium);
  flex-shrink: 0;
}

.slider-wrapper {
  flex: 1;
  min-width: 0;
}

/* ── 底部按钮 ───────────────────────── */
.panel-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.5rem;
  flex-shrink: 0;
}

.ctrl-btn {
  /* 204×64 原图比例 ≈ 3.19:1 */
  width: 31.5%;
  height: 2rem;
  border: none;
  background: url('~@/assets/images/page_2_5/Button_Stop.png') no-repeat center / 100% 100%;
  color: #DBF5FF;
  font-size: var(--font-size-14);
  font-family: var(--font-family-primary-Regular);
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    filter: brightness(1.2);
  }

  &:active {
    filter: brightness(0.9);
  }

  &.primary {
    background: url('~@/assets/images/page_2_5/Button_OK.png') no-repeat center / 100% 100%;
    color: #fff;

    &:hover {
      filter: brightness(1.15);
    }

    &:active {
      filter: brightness(0.9);
    }
  }
}
</style>
