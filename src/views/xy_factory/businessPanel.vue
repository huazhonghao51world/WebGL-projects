<template>
  <div class="workbench" :aria-label="module.name">
    <header class="workbench-head">
      <div class="workbench-icon"><XYIcon :name="module.icon" /></div>
      <div><h2>{{ module.name }}</h2><p>{{ module.description }}</p></div>
    </header>

    <template v-if="module.id === 'environment'">
      <div class="section-label">场景光照 <strong>{{ clock }}</strong></div>
      <input class="time-range" type="range" min="0" max="1439" step="15" :value="minutes" :disabled="!ready" aria-label="场景光照时间" @input="minutes = Number($event.target.value)" @change="$emit('time', clock)" />
      <div class="range-labels"><span>00:00</span><span>12:00</span><span>23:59</span></div>
      <label class="field">天气预设
        <select v-model="weather" :disabled="!ready" @change="$emit('weather', weather)"><option value="Sunny">晴天</option><option value="Cloudy">多云</option><option value="Overcast">阴天</option><option value="Foggy">雾天</option></select>
      </label>
      <button class="panel-action" type="button" :disabled="!ready" @click="resetEnvironment">恢复默认环境</button>
      <p v-if="!ready" class="quiet">三维场景连接后可调整。</p>
    </template>

  </div>
</template>

<script>
import XYIcon from "./icons.vue";

// 场景环境面板：调整三维场景光照时间与天气，恢复时重新应用场景配置包的默认光照。
export default {
  name: "XYBusinessPanel",
  components: { XYIcon },
  props: { module: { type: Object, required: true }, ready: Boolean },
  data: () => ({ minutes: 720, weather: "Sunny" }),
  computed: {
    clock() { return `${String(Math.floor(this.minutes / 60)).padStart(2, "0")}:${String(this.minutes % 60).padStart(2, "0")}`; },
  },
  methods: {
    resetEnvironment() { this.minutes = 720; this.weather = "Sunny"; this.$emit("reset-environment"); },
  },
};
</script>

<style scoped>
.workbench { color:var(--xy-text); font-size:var(--xy-body); line-height:1.5; }
/* Scoped parent rules do not reach slots in this component. Override the legacy global span sizing here. */
.workbench span { color:inherit; font-size:inherit; }
.workbench-head { display:flex; gap:12px; align-items:flex-start; margin-bottom:18px; }
.workbench-icon { display:grid; place-items:center; flex:0 0 39px; height:39px; border-radius:10px; background:var(--xy-accent-bg); color:var(--xy-accent); }
.workbench h2 { margin:0; color:var(--xy-text); font-size:var(--xy-title); line-height:1.35; }
.workbench p { margin:3px 0 0; color:var(--xy-muted); font-size:var(--xy-body); }
.workbench-metrics { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; }
.workbench-metrics div { min-width:0; background:var(--xy-surface); border:1px solid var(--xy-line); border-radius:9px; padding:8px; }
.workbench-metrics strong,.workbench-metrics span { display:block; }
.workbench-metrics strong { font:600 24px/1.3 var(--xy-mono); color:var(--xy-text); }
.workbench-metrics span { font-size:var(--xy-meta); color:var(--xy-muted); overflow-wrap:anywhere; }
.connection-note { display:flex; align-items:flex-start; gap:9px; margin:14px 0; padding:10px; border:1px solid var(--xy-line); background:var(--xy-surface); border-radius:9px; }
.connection-note svg { flex:none; width:17px; color:var(--xy-accent); }
.connection-note strong { font-size:var(--xy-body); }
.connection-note p { line-height:1.55; }
.connection-note .pending-badge { flex:none; font-size:var(--xy-meta); color:var(--xy-warn); }
.section-label { display:flex; align-items:center; justify-content:space-between; color:var(--xy-text); margin:16px 0 6px; font-size:var(--xy-body); font-weight:700; }
.section-label strong { color:var(--xy-accent); font-family:var(--xy-mono); }
.feature-list { list-style:none; padding:0; margin:0; }
.feature-list li { border-bottom:1px solid var(--xy-line); }
.feature-pending,.feature-row { display:flex; justify-content:space-between; align-items:center; text-align:left; gap:8px; width:100%; min-height:38px; padding:3px 4px; font:inherit; }
.feature-pending { cursor:pointer; color:var(--xy-text); background:transparent; border:0; border-radius:5px; }
.workbench .feature-detail { margin:2px 4px 9px; }
.feature-list small { color:var(--xy-accent); white-space:nowrap; font-size:var(--xy-meta); }
.feature-list small.pending,.workbench .sample-notice { color:var(--xy-warn); }
.panel-action,.text-action { cursor:pointer; font:inherit; border:1px solid var(--xy-line); color:var(--xy-accent); border-radius:7px; padding:8px 10px; background:var(--xy-surface); }
.panel-action { display:flex; align-items:center; justify-content:center; gap:7px; width:100%; min-height:40px; margin-top:10px; }
.text-action { padding:3px 8px; font-size:var(--xy-meta); }
.workbench button:hover:not(:disabled) { background:var(--xy-accent-bg); }
.workbench button:disabled,.workbench input:disabled,.workbench select:disabled { opacity:.5; cursor:default; }
.field { display:grid; gap:6px; margin:10px 0; color:var(--xy-muted); font-size:var(--xy-body); }
.field.compact { grid-template-columns:auto minmax(0,1fr); align-items:center; }
.field select,.field input,.field textarea { color:var(--xy-text); background:var(--xy-surface); border:1px solid var(--xy-line); border-radius:6px; padding:6px 8px; font:inherit; min-width:0; }
.time-range { width:100%; accent-color:var(--xy-accent); }
.range-labels { display:flex; justify-content:space-between; font:var(--xy-meta) var(--xy-mono); color:var(--xy-muted); }
.sample-list { display:grid; gap:5px; margin:6px 0; }
.sample-list button { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; text-align:left; gap:8px; min-height:46px; padding:7px 9px; font:inherit; cursor:pointer; color:var(--xy-text); border:1px solid var(--xy-line); border-radius:6px; background:var(--xy-surface); }
.sample-list button[aria-pressed='true'] { border-color:var(--xy-accent); }
.sample-list small,.sample-list strong { display:block; }
.sample-list button > span { min-width:0; overflow-wrap:anywhere; }
.sample-list button > span:last-child { max-width:9em; text-align:right; }
.sample-list small,.sample-list button > span:last-child,.sample-detail strong { color:var(--xy-muted); font-size:var(--xy-meta); }
.sample-detail { padding:8px; border:1px solid var(--xy-line); border-radius:7px; }
.motion-transport { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
.motion-transport .panel-action { margin-top:4px; }
.motion-play { color:var(--xy-bg); background:var(--xy-accent) !important; border-color:var(--xy-accent); font-weight:700; }
.motion-timeline { position:relative; margin-top:12px; }
.motion-timeline input { width:100%; accent-color:var(--xy-accent); }
.motion-cut { position:absolute; top:-3px; width:2px; height:22px; margin-left:-1px; background:var(--xy-warn); pointer-events:none; }
.motion-options { display:flex; flex-wrap:wrap; align-items:center; gap:4px 14px; }
.motion-check { display:flex; align-items:center; gap:5px; color:var(--xy-muted); cursor:pointer; }
.motion-check input { accent-color:var(--xy-accent); }
.trend { display:flex; gap:4px; align-items:flex-end; height:58px; margin-top:6px; }
.trend i { flex:1; border-radius:3px 3px 0 0; background:var(--xy-accent); opacity:.79; }
@media (max-width:700px) { .sample-list button { grid-template-columns:1fr; gap:2px; } .sample-list button > span:last-child { max-width:none; text-align:left; } }
</style>
