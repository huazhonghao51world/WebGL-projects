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

    <template v-else-if="module.id === 'production'">
      <section class="motion" aria-label="预置运动">
        <div class="section-label">预置运动 <strong v-if="motion.available">{{ motion.label }}</strong></div>
        <p v-if="!motion.available" class="quiet">{{ motion.reason }}</p>
        <template v-else>
          <div class="motion-transport">
            <button type="button" class="panel-action motion-play" @click="$emit('motion', 'toggle')">{{ motion.playing ? '暂停' : motion.active ? '继续' : '播放' }}</button>
            <button type="button" class="panel-action" :disabled="!motion.active" @click="$emit('motion', 'stop')">停止并复位</button>
          </div>
          <div class="motion-timeline">
            <input type="range" min="0" :max="duration" step="10" :value="motion.timeMs" :disabled="!motion.active" aria-label="动画进度" @input="$emit('motion', 'seek', Number($event.target.value))" />
            <i v-for="(shot, index) in motion.shots" v-show="index && motion.active" :key="shot.camera" class="motion-cut" :style="{ left: `${shot.fromMs / duration * 100}%` }" :title="`${shot.label} · ${seconds(shot.fromMs)}`"></i>
          </div>
          <div class="range-labels"><span>{{ seconds(motion.timeMs) }}</span><span>{{ motion.active ? seconds(motion.durationMs) : '—' }}</span></div>
          <div class="motion-options">
            <label class="field compact">倍速
              <select :value="motion.rate" :disabled="!motion.active" @change="$emit('motion', 'rate', Number($event.target.value))"><option v-for="rate in rates" :key="rate" :value="rate">{{ rate }}×</option></select>
            </label>
            <label class="motion-check"><input type="checkbox" :checked="motion.loop" @change="$emit('motion', 'loop', $event.target.checked)" /> 循环</label>
            <label class="motion-check"><input type="checkbox" :checked="motion.follow" :disabled="!motion.cameras" @change="$emit('motion', 'follow', $event.target.checked)" /> 场景运镜</label>
          </div>
          <p class="quiet">{{ motion.cameras ? (motion.follow ? `运镜中视角由场景镜头控制${motion.shot !== null ? ` · ${motion.shots[motion.shot].label}` : ''}；关闭运镜即可自由查看。` : '自由视角；勾选“场景运镜”按 UE 镜头回放。') : '模型未带可用镜头，使用自由视角。' }}</p>
        </template>
      </section>
      <div class="section-label">功能清单</div>
      <ul class="feature-list">
        <li v-for="feature in module.features" :key="feature">
          <button v-if="feature.includes('待开发')" type="button" class="feature-pending" :aria-expanded="planned === feature" @click="planned = planned === feature ? '' : feature"><span>{{ feature.split(' · ')[0] }}</span><small class="pending">待开发 ›</small></button>
          <div v-else class="feature-row"><span>{{ feature }}</span><small>{{ motion.available ? '可用' : '待场景' }}</small></div>
          <p v-if="planned === feature" class="feature-detail">{{ requirements[feature.split(' · ')[0]] || module.needs }}</p>
        </li>
      </ul>
    </template>

    <template v-else>
      <div class="workbench-metrics" v-if="module.metrics.length">
        <div v-for="(metric, index) in module.metrics" :key="metric">
          <strong>{{ metricValue(index) }}</strong><span>{{ metric }}</span>
        </div>
      </div>
      <div class="connection-note"><XYIcon name="info" /><div><strong>{{ module.id === 'safety' ? '已交付空间点位' : '等待真实数据接入' }}</strong><p>{{ module.needs }}</p></div><span class="pending-badge">待开发</span></div>

      <button v-if="module.id === 'warehouse'" class="panel-action" type="button" @click="$emit('locate', 'warehouse')"><XYIcon name="target" /> 浏览库区楼</button>
      <button v-if="module.id === 'safety'" class="panel-action" type="button" @click="$emit('cameras')"><XYIcon name="camera" /> 查看 {{ cameraCount }} 个摄像头点位</button>
      <button v-if="module.id === 'device'" class="panel-action" type="button" :aria-pressed="deviceDemoVisible" :disabled="!ready" @click="$emit('toggle-device-demo')"><XYIcon name="device" /> {{ deviceDemoVisible ? '隐藏设备演示点' : '显示设备演示点' }}</button>

      <template v-if="examples.length">
        <div class="section-label">面板样例 <button type="button" class="text-action" :aria-expanded="showSamples" @click="showSamples = !showSamples">{{ showSamples ? '收起' : '查看样例' }}</button></div>
        <template v-if="showSamples">
          <p class="sample-notice">演示数据 · 不会写入真实系统</p>
          <label v-if="module.id === 'alarm'" class="field compact">告警级别 <select v-model="filter"><option value="">全部</option><option>紧急</option><option>预警</option></select></label>
          <label v-if="module.id === 'warehouse'" class="field compact">查询示例库存 <input v-model.trim="filter" placeholder="物料区或货位" /></label>
          <div class="sample-list">
            <button type="button" v-for="row in filtered" :key="row.id" :aria-pressed="selected === row.id" @click="selected = selected === row.id ? '' : row.id">
              <span><strong>{{ row.name }}</strong><small>{{ row.area }}</small></span><span>{{ row.level ? `${row.level} · ` : '' }}{{ row.value }}</span>
            </button>
            <p v-if="!filtered.length" class="quiet">没有匹配的样例。</p>
          </div>
          <section v-if="detail" class="sample-detail" aria-label="样例详情">
            <strong>{{ detail.id }}</strong>
            <template v-if="detail.trend">
              <p>{{ module.id === 'device' ? '温度趋势 · °C' : '用量趋势 · kWh' }}</p>
              <div class="trend" role="img" :aria-label="`示例数据：${detail.trend.join('、')}`"><i v-for="(value, index) in detail.trend" :key="index" :title="String(value)" :style="{ height: `${value / Math.max(...detail.trend) * 100}%` }"></i></div>
            </template>
            <template v-if="module.id === 'alarm'">
              <p>正式入口将支持回填处置人、处置结果和备注。</p>
              <p v-if="handled[detail.id]">已记录（演示）：{{ handled[detail.id] }}</p>
              <label class="field">演示处置备注 <textarea v-model.trim="disposition" rows="2" maxlength="100"></textarea></label>
              <button type="button" class="panel-action" :disabled="!disposition" @click="saveSample">记录演示处置</button>
            </template>
          </section>
        </template>
      </template>

      <div class="section-label">功能清单</div>
      <ul class="feature-list">
        <li v-for="feature in module.features" :key="feature">
          <button v-if="feature.includes('待开发')" type="button" class="feature-pending" :aria-expanded="planned === feature" @click="planned = planned === feature ? '' : feature"><span>{{ feature.split(' · ')[0] }}</span><small class="pending">待开发 ›</small></button>
          <div v-else class="feature-row"><span>{{ feature }}</span><small>{{ featureState(feature) }}</small></div>
          <p v-if="planned === feature" class="feature-detail">{{ requirements[feature.split(' · ')[0]] || module.needs }}</p>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import XYIcon from "./icons.vue";
import { idleMotion } from "./motion";
import { featureRequirements, sampleRows } from "./operations";

export default {
  name: "XYBusinessPanel",
  components: { XYIcon },
  props: { module: { type: Object, required: true }, ready: Boolean, cameraCount: Number, deviceDemoVisible: Boolean, motion: { type: Object, default: () => idleMotion } },
  data: () => ({ requirements: featureRequirements, planned: "", showSamples: false, filter: "", selected: "", disposition: "", handled: {}, minutes: 720, weather: "Sunny", rates: [0.5, 1, 2, 4] }),
  computed: {
    duration() { return Math.max(1, this.motion.durationMs || (this.motion.shots.length ? this.motion.shots[this.motion.shots.length - 1].fromMs * 2 : 1)); },
    clock() { return `${String(Math.floor(this.minutes / 60)).padStart(2, "0")}:${String(this.minutes % 60).padStart(2, "0")}`; },
    examples() { return sampleRows[this.module.id] || []; },
    filtered() {
      return this.examples.filter((row) => !this.filter || (this.module.id === "alarm" ? row.level === this.filter : `${row.name} ${row.area}`.toLowerCase().includes(this.filter.toLowerCase())))
        .map((row) => this.handled[row.id] ? { ...row, value: "已记录（演示）" } : row);
    },
    detail() { return this.filtered.find((row) => row.id === this.selected); },
  },
  watch: { "module.id"() { this.showSamples = false; this.filter = ""; this.selected = ""; this.planned = ""; }, selected() { this.disposition = ""; } },
  methods: {
    metricValue(index) { return this.module.id === "safety" && index === 0 ? this.cameraCount : "—"; },
    seconds(ms) { return `${(ms / 1000).toFixed(1)} s`; },
    featureState(feature) { return ["库区楼定位", "摄像头位置"].includes(feature) ? "可用" : "演示样例"; },
    saveSample() { if (this.detail && this.disposition) { this.$set(this.handled, this.detail.id, this.disposition); this.disposition = ""; } },
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
