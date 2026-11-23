<template>
  <div class="area-overlay" aria-hidden="true">
    <svg v-if="points.length" width="100%" height="100%">
      <polygon v-if="points.length >= 3" :points="ring" />
      <polyline v-else :points="ring" />
      <circle v-for="(point, index) in vertices" :key="index" :cx="point.x" :cy="point.y" r="4" />
    </svg>
    <div v-if="center && result.metrics" class="area-tag" :style="{ left: `${center.x}px`, top: `${center.y}px` }">
      <strong>{{ result.metrics.area.toFixed(2) }} m²</strong>
      <small>周长 {{ result.metrics.perimeter.toFixed(2) }} m</small>
    </div>
  </div>
</template>

<script>
export default {
  name: "XYAreaOverlay",
  props: { result: { type: Object, required: true } },
  computed: {
    points() { return this.result.screen; },
    vertices() { return this.points.slice(0, this.result.count); },
    ring() { return this.points.map(({ x, y }) => `${x},${y}`).join(" "); },
    center() {
      const count = this.points.length;
      if (!count) return null;
      return this.points.reduce((sum, point) => ({ x: sum.x + point.x / count, y: sum.y + point.y / count }), { x: 0, y: 0 });
    },
  },
};
</script>

<style scoped>
.area-overlay { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
.area-overlay svg { display:block; }
polygon,polyline { fill:rgba(255,209,111,.23); stroke:#ffce72; stroke-width:2; stroke-linejoin:round; }
polyline { fill:none; }
circle { fill:#ffce72; stroke:#31240f; stroke-width:1.5; }
.area-tag { position:absolute; transform:translate(-50%,calc(-100% - 8px)); display:grid; gap:1px; min-width:max-content; padding:5px 9px; border:1px solid #ffce72; border-radius:6px; background:#201b17; color:#ffe2a6; }
.area-tag strong { font:600 16px/1.35 var(--xy-mono); }
.area-tag small { font-size:12px; line-height:1.4; }
</style>
