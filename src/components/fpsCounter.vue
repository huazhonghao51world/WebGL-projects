<template>
  <div class="fps-counter" :class="{ 'fps-counter--compact': compact }" title="三维场景最近一秒实际渲染帧率">
    <span class="fps-counter__label">{{ compact ? 'FPS' : '当前 FPS' }}</span>
    <strong class="fps-counter__value">{{ fps === null ? '—' : fps }}</strong>
  </div>
</template>

<script>
import { peekViewer } from '@/utils/twin/app';

export default {
  name: 'FpsCounter',
  props: { compact: Boolean },
  data() {
    return { fps: null };
  },
  mounted() {
    this.resetSample();
    this._fpsTimer = window.setInterval(this.sample, 1000);
    document.addEventListener('visibilitychange', this.resetSample);
  },
  beforeDestroy() {
    window.clearInterval(this._fpsTimer);
    document.removeEventListener('visibilitychange', this.resetSample);
    this._fpsSample = null;
  },
  methods: {
    resetSample() {
      this.fps = null;
      this._fpsSample = null;
      if (!document.hidden) this.sample();
    },
    sample() {
      const viewer = peekViewer();
      if (document.hidden || !viewer || viewer.getState() !== 'ready') {
        this.fps = null;
        this._fpsSample = null;
        return;
      }
      const frames = viewer.diagnostics.getMetrics().frames;
      const now = performance.now();
      const previous = this._fpsSample;
      if (previous && previous.viewer === viewer && frames >= previous.frames && now > previous.time) {
        this.fps = Math.round((frames - previous.frames) * 1000 / (now - previous.time));
      } else {
        this.fps = null;
      }
      this._fpsSample = { viewer, frames, time: now };
    },
  },
};
</script>

<style lang="scss" scoped>
.fps-counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 3.4rem;
  flex-shrink: 0;
  padding: 0.15rem 0.4rem;
  border: 1px solid rgba(91, 217, 255, 0.4);
  border-radius: 0.25rem;
  background: rgba(7, 24, 43, 0.75);
  pointer-events: none;
}
.fps-counter__label {
  color: #b6d9ec;
  font-size: var(--font-size-12);
  white-space: nowrap;
}
.fps-counter__value {
  color: #64f0c3;
  font: 600 1.1rem/1.2 monospace;
  font-variant-numeric: tabular-nums;
}
.fps-counter--compact {
  flex-direction: row;
  gap: 5px;
  min-width: 0;
  padding: 0 0 0 7px;
  border: 0;
  border-left: 1px solid var(--xy-line);
  border-radius: 0;
  background: none;
}
.fps-counter--compact .fps-counter__label,
.fps-counter--compact .fps-counter__value {
  font-size: 12px;
}
.fps-counter--compact .fps-counter__value {
  min-width: 3ch;
  text-align: center;
}
</style>
