<template>
  <div
    class="image-slider"
    ref="track"
    @mousedown="onMouseDown"
  >
    <!-- 底层轨道 -->
    <div class="slider-runway"></div>
    <!-- 填充条 -->
    <div class="slider-bar" :style="{ width: percent + '%' }"></div>
    <!-- 拖拽按钮 -->
    <div class="slider-btn-wrapper" :style="{ left: percent + '%' }">
      <div class="slider-btn"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageSlider',
  props: {
    value: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
  },
  computed: {
    percent() {
      return ((this.value - this.min) / (this.max - this.min)) * 100;
    },
  },
  methods: {
    onMouseDown(e) {
      e.preventDefault();
      this.updateValue(e);
      const onMouseMove = (ev) => this.updateValue(ev);
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    updateValue(e) {
      const rect = this.$refs.track.getBoundingClientRect();
      let ratio = (e.clientX - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));
      const val = Math.round(this.min + ratio * (this.max - this.min));
      this.$emit('input', val);
    },
  },
};
</script>

<style lang="scss" scoped>
.image-slider {
  position: relative;
  height: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.slider-runway {
  position: absolute;
  left: 0;
  right: 0;
  height: 0.5rem;
  background: url('~@/assets/images/page_2_5/slider_bar_fill.png') no-repeat center / 100% 100%;
  border-radius: 0.25rem;
}

.slider-bar {
  position: absolute;
  left: 0;
  height: 0.5rem;
  background: url('~@/assets/images/page_2_5/slider_bar_value.png') no-repeat left center / cover;
  border-radius: 0.25rem;
}

.slider-btn-wrapper {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1.1rem;
  height: 1.5rem;
  z-index: 1;
}

.slider-btn {
  width: 100%;
  height: 100%;
  background: url('~@/assets/images/page_2_5/slider_btn.png') no-repeat center / contain;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.15);
  }
}
</style>
