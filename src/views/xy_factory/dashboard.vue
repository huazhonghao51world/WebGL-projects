<template>
  <div class="dash">
    <!-- ======================= 左栏 ======================= -->
    <aside class="dash-col dash-left">
      <template v-if="mod === 'overview'">
        <Card title="园区概况" :sub="d.product.name">
          <div class="kpis k4">
            <Kpi :value="buildingCount" unit="栋" label="园区建筑" />
            <Kpi :value="fmt(totalArea)" unit="m²" label="建筑面积" />
            <Kpi :value="fmt(d.peopleOnSite)" unit="人" label="在园人员" />
            <Kpi :value="cameraCount" unit="路" label="监控点位" />
          </div>
          <ul class="rows compact">
            <li v-for="b in buildingRows" :key="b.id" class="clickable" @click="$emit('locate', b.id)">
              <span>{{ b.name }}</span><em>{{ b.use }}</em><b>{{ b.people }} 人</b>
            </li>
          </ul>
        </Card>
        <Card title="今日生产" more="智能生产" @more="$emit('module', 'production')">
          <div class="ring-row">
            <Ring :value="p.rate" label="计划达成" />
            <div class="kpis k2">
              <Kpi :value="wan(p.assembled)" unit="万支" label="组装完成" />
              <Kpi :value="wan(p.plan)" unit="万支" label="今日计划" />
              <Kpi :value="p.yieldRate" unit="%" label="成品合格率" />
              <Kpi :value="p.pallets" unit="托" label="成品入库" />
            </div>
          </div>
        </Card>
        <Card title="生产流水线" more="产品管理" @more="$emit('module', 'product')">
          <ol class="flow-mini">
            <li v-for="(s, i) in flowStages" :key="s.id" :class="{ on: flow.stage === i }" @click="$emit('flow', 'stage', i)"><i>{{ i + 1 }}</i>{{ s.name }}</li>
          </ol>
        </Card>
      </template>

      <template v-else-if="mod === 'production'">
        <Card title="生产总览" :sub="`今日 00:00—${d.AS_OF}`">
          <div class="kpis k4">
            <Kpi :value="wan(p.assembled)" unit="万支" label="组装完成" />
            <Kpi :value="p.rate" unit="%" label="计划达成" />
            <Kpi :value="p.yieldRate" unit="%" label="成品合格率" />
            <Kpi :value="`${ds.moldersRunning}/${ds.molders}`" label="注塑机运行" />
          </div>
        </Card>
        <Card title="工序产出" sub="注塑 → 组装 → 打包 → 入库">
          <ul class="rows steps">
            <li v-for="m in d.molding" :key="m.part" class="clickable" @click="$emit('locate', 'production')"><span>注塑 · {{ m.name }}<small>{{ m.machines }} 台 · 废品 {{ fmt(m.scrap) }}</small></span><b>{{ fmt(m.output - m.scrap) }} 件</b></li>
            <li v-for="l in d.assemblyLines" :key="l.id" class="clickable" @click="$emit('locate', 'production')"><span>{{ l.name }}<small>计划 {{ fmt(l.plan) }} · 不良 {{ l.defects }}</small></span><div class="bar"><i :style="{ width: `${pct(l.output, l.plan)}%` }"></i></div><b>{{ fmt(l.output) }}</b></li>
            <li><span>打包装箱<small>{{ d.product.perBox }} 支/箱 · 待码垛 {{ p.boxesWaiting }} 箱</small></span><b>{{ fmt(p.boxes) }} 箱</b></li>
            <li class="clickable" @click="$emit('locate', 'warehouse')"><span>码垛入库<small>{{ d.product.perPallet }} 箱/托</small></span><b>{{ p.pallets }} 托</b></li>
          </ul>
        </Card>
        <Card title="分时组装产量" :sub="`支 / 2h · 截至 ${d.AS_OF}`">
          <Chart :option="bar(hours, p.hourly)" :height="130" />
        </Card>
      </template>

      <template v-else-if="mod === 'warehouse'">
        <Card title="立体库总览" sub="库区楼">
          <div class="ring-row">
            <Ring :value="w.rate" label="库位利用率" />
            <div class="kpis k2">
              <Kpi :value="fmt(w.slots)" unit="位" label="托盘库位" />
              <Kpi :value="fmt(w.used)" unit="位" label="已占用" />
              <Kpi :value="w.fgIn" unit="托" label="今日成品入库" />
              <Kpi :value="w.rmOut" unit="托" label="今日原料出库" />
            </div>
          </div>
        </Card>
        <Card title="库区占用" sub="点击定位库区楼">
          <ul class="rows">
            <li v-for="z in d.zones" :key="z.id" class="clickable" @click="$emit('locate', 'warehouse')">
              <span>{{ z.name }}<small>{{ z.note }}</small></span>
              <div class="bar" :class="{ warn: pct(z.used, z.slots) >= 85 }"><i :style="{ width: `${pct(z.used, z.slots)}%` }"></i></div>
              <b>{{ z.used }}/{{ z.slots }}</b>
            </li>
          </ul>
        </Card>
        <Card title="立库设备">
          <ul class="rows">
            <li v-for="x in storageDevices" :key="x.id" class="clickable" @click="$emit('device', x.id)"><span>{{ x.name }}<small>{{ x.note }} · {{ x.cycle }}</small></span><Tag :s="x.status" /></li>
          </ul>
        </Card>
      </template>

      <template v-else-if="mod === 'product'">
        <Card title="产品档案" :sub="d.product.spec">
          <div class="product-head"><b>{{ d.product.name }}</b><small>由针筒、针帽两个注塑件组装而成</small></div>
          <ul class="rows">
            <li v-for="x in d.product.parts" :key="x.id"><span>{{ x.name }}<small>{{ x.material }} · {{ x.weight }} g/件</small></span><em>{{ x.process }}</em></li>
            <li><span>包装规格<small>{{ d.product.perBox }} 支/箱 · {{ d.product.perPallet }} 箱/托</small></span><em>打包入库</em></li>
          </ul>
        </Card>
        <Card title="今日产品流转" :sub="`截至 ${d.AS_OF}`">
          <ul class="rows">
            <li><span>原料消耗<small>PP + PE 粒料</small></span><b>{{ fmt(p.resinKg) }} kg</b></li>
            <li><span>合格针筒 / 针帽<small>注塑良率 {{ p.moldYield }}%</small></span><b>{{ wan(p.good.barrel) }} / {{ wan(p.good.cap) }} 万</b></li>
            <li><span>组装成品<small>合格率 {{ p.yieldRate }}%</small></span><b>{{ fmt(p.qualified) }} 支</b></li>
            <li><span>装箱 / 入库<small>零头 {{ p.looseUnits }} 支待装箱</small></span><b>{{ p.boxes }} 箱 / {{ p.pallets }} 托</b></li>
          </ul>
        </Card>
      </template>

      <template v-else-if="mod === 'device'">
        <Card title="设备运行态势" sub="按场景设备清点">
          <div class="kpis k4">
            <Kpi :value="ds.total" unit="台" label="接入设备" />
            <Kpi :value="ds.running" unit="台" label="运行" tone="ok" />
            <Kpi :value="ds.idle" unit="台" label="待机/换模" />
            <Kpi :value="ds.alarm + ds.fault" unit="台" label="告警/故障" tone="bad" />
          </div>
          <Chart :option="deviceDonut" :height="130" />
        </Card>
        <Card title="设备分类" sub="台数 · 运行">
          <ul class="rows">
            <li v-for="g in d.deviceGroups" :key="g.id"><span>{{ g.name }}<small>{{ g.area }}</small></span><b>{{ g.count }}</b><em>{{ g.status.运行 || 0 }} 运行</em></li>
          </ul>
        </Card>
      </template>

      <template v-else-if="mod === 'energy'">
        <Card title="今日能耗" :sub="`00:00—${d.AS_OF}`">
          <div class="kpis k4">
            <Kpi :value="fmt(e.today)" unit="kWh" label="总用电" />
            <Kpi :value="fmt(e.pv)" unit="kWh" label="光伏发电" tone="ok" />
            <Kpi :value="e.perK" unit="kWh/千支" label="单位产品能耗" />
            <Kpi :value="e.carbon" unit="tCO₂" label="外购电碳排" />
          </div>
          <div class="kpis k2 mini"><Kpi :value="e.water" unit="m³" label="今日用水" /><Kpi :value="e.steam" unit="t" label="锅炉蒸汽" /></div>
        </Card>
        <Card title="分项用电" sub="kWh · 点击定位">
          <ul class="rows">
            <li v-for="m in d.meters" :key="m.name" class="clickable" @click="$emit('locate', m.building)"><span>{{ m.name }}<small>{{ bName(m.building) }}</small></span><div class="bar"><i :style="{ width: `${pct(m.value, maxMeter)}%` }"></i></div><b>{{ fmt(m.value) }}</b><em>{{ pct(m.value, e.today) }}%</em></li>
          </ul>
        </Card>
      </template>

      <template v-else-if="mod === 'environment'">
        <Card title="室外气象">
          <div class="kpis k4">
            <Kpi :value="env.outdoor.temp" unit="°C" label="温度" />
            <Kpi :value="env.outdoor.hum" unit="%RH" label="湿度" />
            <Kpi :value="env.outdoor.aqi" label="AQI 优" tone="ok" />
            <Kpi :value="env.outdoor.wind" label="风向风力" small />
          </div>
        </Card>
        <Card title="车间环境" :sub="`达标率 ${env.okRate}%`">
          <table class="tbl"><thead><tr><th>区域</th><th>级别</th><th>温度</th><th>湿度</th><th>压差</th></tr></thead>
            <tbody><tr v-for="x in d.envPoints" :key="x.name" :class="{ bad: !x.ok }"><td>{{ x.name }}</td><td>{{ x.grade }}</td><td>{{ x.temp }}</td><td>{{ x.hum }}</td><td>{{ x.dp == null ? '—' : `${x.dp} Pa` }}</td></tr></tbody>
          </table>
          <p class="hint">判定：温度 {{ d.envRules.temp.join('–') }} °C，湿度 {{ d.envRules.hum.join('–') }} %RH，洁净区压差 ≥ {{ d.envRules.dp }} Pa。</p>
        </Card>
      </template>

      <template v-else-if="mod === 'safety'">
        <Card title="安防态势">
          <div class="kpis k4">
            <Kpi :value="s.safeDays" unit="天" label="安全生产" tone="ok" />
            <Kpi :value="cameraCount" unit="路" label="监控点位" />
            <Kpi :value="`${s.fireOnline}/${s.fireTotal}`" label="消防设施在线" />
            <Kpi :value="fmt(d.peopleOnSite)" unit="人" label="在园人员" />
          </div>
        </Card>
        <Card title="风险统计" sub="近 30 天">
          <Chart :option="pie(s.risks, `${riskTotal}\n起`)" :height="150" />
        </Card>
        <Card title="消防设施">
          <ul class="rows"><li v-for="f in d.fireFacilities" :key="f.name"><span>{{ f.name }}</span><b>{{ f.online }}/{{ f.count }}</b><Tag :s="f.online === f.count ? '正常' : '离线'" /></li></ul>
        </Card>
      </template>
    </aside>

    <!-- ======================= 右栏 ======================= -->
    <aside class="dash-col dash-right">
      <template v-if="['overview', 'device', 'safety'].includes(mod)">
        <Card title="告警中心" :sub="`未处置 ${pending.length}`" more="全部" @more="$emit('alarms')">
          <ul class="rows">
            <li v-for="a in alarmList" :key="a.id" class="clickable" @click="$emit('alarms', a.id)"><Lv :l="a.level" /><span>{{ a.content }}<small>{{ a.time }} · {{ bName(a.building) }}</small></span><Tag :s="a.state" /></li>
          </ul>
        </Card>
      </template>

      <template v-if="mod === 'overview'">
        <Card title="今日能耗" :sub="`${fmt(e.today)} kWh · 光伏 ${e.pvShare}%`" more="能源管理" @more="$emit('module', 'energy')">
          <Chart :option="lines2(hours, [['用电', e.hourly], ['光伏', e.pvHourly]], 'kWh')" :height="130" />
        </Card>
        <Card title="环境与安防">
          <div class="kpis k4">
            <Kpi :value="env.okRate" unit="%" label="车间环境达标" />
            <Kpi :value="w.rate" unit="%" label="库位利用率" />
            <Kpi :value="s.safeDays" unit="天" label="安全生产" tone="ok" />
            <Kpi :value="s.visitors" unit="人" label="今日访客" />
          </div>
        </Card>
      </template>

      <template v-else-if="mod === 'production'">
        <Card title="质量分析" :sub="`组装不良 ${fmt(p.defects)} 支`">
          <div class="ring-row"><Ring :value="p.yieldRate" label="成品合格率" /><Chart class="grow" :option="hbar(defectBars)" :height="120" /></div>
        </Card>
        <Card title="近 7 日组装产量" sub="支">
          <Chart :option="bar(d.DAYS, p.week)" :height="130" />
        </Card>
        <Card title="重点设备" sub="点击查看">
          <ul class="rows"><li v-for="x in productionDevices" :key="x.id" class="clickable" @click="$emit('device', x.id)"><span>{{ x.name }}<small>{{ x.note || x.cycle }}</small></span><Tag :s="x.status" /></li></ul>
        </Card>
      </template>

      <template v-else-if="mod === 'warehouse'">
        <Card title="近 7 日立库作业" sub="托">
          <Chart :option="bars2(d.DAYS, [['入库', w.inbound], ['出库', w.outbound]])" :height="140" />
        </Card>
        <Card title="今日立库任务">
          <div class="filter"><button v-for="t in ['全部', '成品入库', '原料入库', '原料出库']" :key="t" :aria-pressed="recFilter === t" @click="recFilter = t">{{ t }}</button></div>
          <ul class="rows tasks"><li v-for="r in records" :key="r.id"><Tag :s="r.type" /><span>{{ r.item }}<small>{{ r.id }} · {{ r.time }}</small></span></li></ul>
        </Card>
      </template>

      <template v-else-if="mod === 'product'">
        <Card title="产品生产流水线" :sub="flow.available ? `${flowStages.length} 个环节 · ${segCount} 段镜头 · ${secs(flow.totalMs)}` : '三维场景动画'">
          <p class="hint">由场景预置镜头动画按生产顺序串联，为固定演示，不代表实时生产。</p>
          <div class="flow-ctrl">
            <button class="act" :disabled="!flow.available" @click="$emit('flow', flow.active ? 'toggle' : 'all')">{{ !flow.active ? '▶ 播放完整流水线' : flow.playing ? '❚❚ 暂停' : '▶ 继续' }}</button>
            <button class="act ghost" :disabled="!flow.active" @click="$emit('flow', 'stop')">■ 结束</button>
          </div>
          <div v-if="flow.active" class="flow-progress"><i :style="{ width: `${pct(flow.elapsedMs, flow.totalMs)}%` }"></i><span>{{ secs(flow.elapsedMs) }} / {{ secs(flow.totalMs) }}</span></div>
          <p v-if="!flow.available" class="hint warn">{{ flow.reason }}</p>
          <ol class="flow">
            <li v-for="(s, i) in flowStages" :key="s.id" :class="{ on: flow.stage === i, done: flow.active && flow.mode === 'all' && i < flow.stage }">
              <button type="button" :disabled="!flow.available" @click="$emit('flow', 'stage', i)">
                <i>{{ i + 1 }}</i>
                <span><b>{{ s.name }}</b><small>{{ s.area }} · {{ secs(flow.durations[i] || 0) }}</small></span>
                <em v-if="flow.stage === i">{{ flow.playing ? '播放中' : '已暂停' }}</em>
              </button>
              <div v-if="flow.stage === i" class="flow-detail">
                <p>{{ s.desc }}</p>
                <div v-if="s.segments.length > 1" class="segs"><span v-for="(g, k) in s.segments" :key="g.clip" :class="{ on: flow.segment === k, done: flow.segment > k }">{{ g.label }}</span></div>
              </div>
            </li>
          </ol>
        </Card>
      </template>

      <template v-else-if="mod === 'device'">
        <Card title="重点设备" sub="点击查看详情">
          <div class="filter"><button v-for="s in ['全部', '运行', '告警', '故障']" :key="s" :aria-pressed="devFilter === s" @click="devFilter = s">{{ s }}</button></div>
          <ul class="rows">
            <li v-for="x in deviceList" :key="x.id" class="clickable" @click="$emit('device', x.id)"><span>{{ x.name }}<small>{{ x.id }} · {{ bName(x.building) }} · 健康 {{ x.health }}</small></span><Tag :s="x.status" /></li>
          </ul>
          <p v-if="!deviceList.length" class="hint">暂无设备</p>
        </Card>
        <Card title="健康度排行" sub="由低到高">
          <Chart :option="hbar(healthRank)" :height="150" />
        </Card>
      </template>

      <template v-else-if="mod === 'energy'">
        <Card title="今日分时用电与光伏" :sub="`kWh / 2h · 截至 ${d.AS_OF}`">
          <Chart :option="lines2(hours, [['用电', e.hourly], ['光伏', e.pvHourly]], 'kWh')" :height="140" />
        </Card>
        <Card title="近 7 日用电" sub="kWh">
          <Chart :option="bar(d.DAYS, e.week)" :height="130" />
        </Card>
        <Card title="供能结构">
          <div class="kpis k2"><Kpi :value="fmt(e.grid)" unit="kWh" label="外购电" /><Kpi :value="e.pvShare" unit="%" label="光伏自发占比" tone="ok" /></div>
          <button class="act" @click="$emit('pending', '能效优化策略')">生成能效优化策略</button>
        </Card>
      </template>

      <template v-else-if="mod === 'environment'">
        <Card title="组装洁净区温度" :sub="`°C · 截至 ${d.AS_OF}`">
          <Chart :option="line(hours, env.cleanTrend, '°C', true)" :height="130" />
        </Card>
        <slot name="environment"></slot>
      </template>

      <template v-if="mod === 'safety'">
        <Card title="监控与门岗">
          <button class="act" @click="$emit('cameras')">查看 {{ cameraCount }} 路监控点位</button>
          <ul class="rows"><li v-for="g in d.guardPosts" :key="g.name"><span>{{ g.name }}<small>值守 {{ g.staff }} 人</small></span><b>访客 {{ g.visitors }}</b><b>车辆 {{ g.vehicles }}</b></li></ul>
        </Card>
      </template>
    </aside>
  </div>
</template>

<script>
import * as d from "./dashboardData";
import { stages as flowStages } from "./pipeline";
import XYChart, { axisStyle, palette } from "./chart.vue";

const fmt = (v) => (typeof v === "number" ? v.toLocaleString("en-US") : v);
const Card = {
  props: { title: String, sub: String, more: String },
  render(h) {
    return h("section", { class: "card" }, [
      h("header", [h("h3", this.title), this.sub ? h("small", this.sub) : null, this.more ? h("button", { class: "more", on: { click: () => this.$emit("more") } }, `${this.more} ›`) : null]),
      this.$slots.default,
    ]);
  },
};
const Kpi = {
  functional: true,
  props: { value: [String, Number], unit: String, label: String, tone: String, small: Boolean },
  render: (h, { props }) => h("div", { class: ["kpi", props.tone, { small: props.small }] }, [h("strong", [String(props.value), props.unit ? h("i", props.unit) : null]), h("span", props.label)]),
};
const tones = { 运行: "ok", 正常: "ok", 已处置: "ok", 成品入库: "ok", 原料入库: "info", 原料出库: "info", 待机: "idle", 换模: "warn", 告警: "warn", 未处置: "bad", 故障: "bad", 离线: "bad" };
const Tag = { functional: true, props: { s: String }, render: (h, { props }) => h("em", { class: ["tag", tones[props.s] || "idle"] }, props.s) };
const Lv = { functional: true, props: { l: String }, render: (h, { props }) => h("i", { class: ["lv", { 紧急: "bad", 预警: "warn", 提示: "info" }[props.l]] }, props.l) };
const Ring = {
  functional: true,
  props: { value: Number, label: String },
  render: (h, { props }) => h("div", { class: "ring", style: { "--v": `${Math.min(props.value, 100) * 3.6}deg` } }, [h("strong", [String(props.value), h("i", "%")]), h("span", props.label)]),
};

export default {
  name: "XYDashboard",
  components: { Card, Kpi, Tag, Lv, Ring, Chart: XYChart },
  props: { mod: String, cameraCount: Number, buildingNames: Object, alarms: Array, flow: Object },
  data: () => ({ d, flowStages, devFilter: "全部", recFilter: "全部" }),
  computed: {
    p: () => d.production, w: () => d.warehouse, e: () => d.energy, env: () => d.environment, s: () => d.security, ds: () => d.deviceStats,
    hours: () => d.HOURS.map((h) => `${h}时`),
    segCount: () => flowStages.reduce((t, s) => t + s.segments.length, 0),
    buildingRows() { return Object.entries(d.buildingProfiles).map(([id, b]) => ({ id, ...b, name: this.bName(id) })); },
    buildingCount() { return Object.keys(this.buildingNames).length; },
    totalArea() { return Object.values(d.buildingProfiles).reduce((t, b) => t + b.area, 0); },
    pending() { return this.alarms.filter((a) => a.state === "未处置"); },
    alarmList() { return [...this.alarms].sort((a, b) => (a.state === b.state ? 0 : a.state === "未处置" ? -1 : 1)).slice(0, 5); },
    deviceList() { return d.devices.filter((x) => this.devFilter === "全部" || x.status === this.devFilter); },
    storageDevices: () => d.devices.filter((x) => x.building === "warehouse"),
    productionDevices: () => d.devices.filter((x) => x.building === "production"),
    records() { return d.stockTasks.filter((r) => this.recFilter === "全部" || r.type === this.recFilter); },
    maxMeter() { return Math.max(...d.meters.map((m) => m.value)); },
    riskTotal() { return this.s.risks.reduce((t, r) => t + r.value, 0); },
    healthRank() { return [...d.devices].sort((a, b) => a.health - b.health).slice(0, 6).map((x) => ({ name: x.name, value: x.health })); },
    defectBars() { return [{ name: "注塑废品·针筒", value: d.molding[0].scrap }, { name: "注塑废品·针帽", value: d.molding[1].scrap }, ...d.assemblyLines.map((l) => ({ name: `${l.name}不良`, value: l.defects }))]; },
    deviceDonut() {
      const ds = this.ds;
      return this.pie([{ name: "运行", value: ds.running }, { name: "待机/换模", value: ds.idle }, { name: "告警", value: ds.alarm }, { name: "故障", value: ds.fault }], `${ds.total}\n台`, ["#3ee6d4", "#6f86a3", "#f5c451", "#ff7a6b"]);
    },
  },
  methods: {
    fmt,
    pct: d.helpers.pct,
    wan: (v) => (v / 10000).toFixed(2),
    secs: (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; },
    bName(id) { return this.buildingNames[id] || { utility: "杂物房" }[id] || id; },
    bar(x, y) {
      return { xAxis: { type: "category", data: x, ...axisStyle }, yAxis: { type: "value", ...axisStyle }, series: [{ type: "bar", data: y, barWidth: "46%", itemStyle: { borderRadius: [3, 3, 0, 0], color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#3ee6d4" }, { offset: 1, color: "rgba(62,230,212,.15)" }] } } }] };
    },
    bars2(x, groups) {
      return { legend: { right: 0, top: 0, textStyle: { color: "#8fa8c2", fontSize: 11 }, itemWidth: 10, itemHeight: 6 }, xAxis: { type: "category", data: x, ...axisStyle }, yAxis: { type: "value", ...axisStyle }, series: groups.map(([name, data]) => ({ name, type: "bar", data, barWidth: 7, itemStyle: { borderRadius: [2, 2, 0, 0] } })) };
    },
    line(x, y, unit, scale = false) {
      return { xAxis: { type: "category", data: x, boundaryGap: false, ...axisStyle }, yAxis: { type: "value", scale, name: unit, nameTextStyle: { color: "#8fa8c2", fontSize: 10 }, ...axisStyle }, series: [{ type: "line", data: y, smooth: true, symbol: "none", lineStyle: { width: 2 }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(62,230,212,.35)" }, { offset: 1, color: "rgba(62,230,212,0)" }] } } }] };
    },
    lines2(x, groups, unit) {
      return { legend: { right: 0, top: 0, textStyle: { color: "#8fa8c2", fontSize: 11 }, itemWidth: 10, itemHeight: 6 }, color: ["#3ee6d4", "#f5c451"], xAxis: { type: "category", data: x, boundaryGap: false, ...axisStyle }, yAxis: { type: "value", name: unit, nameTextStyle: { color: "#8fa8c2", fontSize: 10 }, ...axisStyle }, series: groups.map(([name, data]) => ({ name, type: "line", data, smooth: true, symbol: "none", lineStyle: { width: 2 }, areaStyle: { opacity: 0.12 } })) };
    },
    hbar(items) {
      return { grid: { left: 104, right: 34, top: 6, bottom: 6 }, tooltip: { trigger: "item" }, xAxis: { type: "value", show: false }, yAxis: { type: "category", inverse: true, data: items.map((i) => i.name), ...axisStyle, axisLine: { show: false } }, series: [{ type: "bar", data: items.map((i) => i.value), barWidth: 8, label: { show: true, position: "right", color: "#cfe3f5", fontSize: 11 }, itemStyle: { borderRadius: 4, color: "#4d9cff" }, showBackground: true, backgroundStyle: { color: "rgba(255,255,255,.05)", borderRadius: 4 } }] };
    },
    pie(data, center, colors = palette) {
      return {
        color: colors, tooltip: { trigger: "item", formatter: "{b}：{c}（{d}%）" },
        legend: { orient: "vertical", right: 4, top: "middle", itemWidth: 8, itemHeight: 8, textStyle: { color: "#b9cce0", fontSize: 11 }, formatter: (n) => `${n}  ${data.find((x) => x.name === n).value}` },
        title: { text: center, left: "29%", top: "center", textAlign: "center", textStyle: { color: "#eaf6ff", fontSize: 15, fontWeight: 600, lineHeight: 18 } },
        series: [{ type: "pie", radius: ["52%", "72%"], center: ["30%", "50%"], data, label: { show: false }, itemStyle: { borderColor: "#0c1a2a", borderWidth: 2 } }],
      };
    },
  },
};
</script>

<style lang="scss">
.dash {
span,em,b,small { font-size:inherit; }
.rows li > span { font-size:13px; }
.rows li small { font-size:11px; }
.dash-col { position:absolute; top:calc(var(--xy-head) + 14px); bottom:calc(var(--xy-dock) + 18px); width:clamp(300px,22vw,400px); display:flex; flex-direction:column; gap:10px; overflow-y:auto; pointer-events:auto; scrollbar-width:none; }
.dash-left { left:var(--xy-gutter); }
.dash-right { right:var(--xy-gutter); }
.card { flex:none; position:relative; padding:10px 12px 12px; border:1px solid rgba(92,170,220,.22); border-radius:6px; background:linear-gradient(180deg,rgba(14,32,52,.92),rgba(8,20,34,.88)); box-shadow:inset 0 1px 0 rgba(120,220,255,.08), 0 8px 24px rgba(0,8,18,.35); backdrop-filter:blur(6px); }
.card::before { content:""; position:absolute; left:-1px; top:-1px; width:14px; height:14px; border-left:2px solid var(--xy-accent); border-top:2px solid var(--xy-accent); border-radius:6px 0 0 0; }
.card > header { display:flex; align-items:center; gap:8px; margin:0 0 8px; padding-bottom:6px; border-bottom:1px solid rgba(92,170,220,.15); }
.card h3 { margin:0; font-size:15px; font-weight:700; letter-spacing:.06em; background:linear-gradient(180deg,#fff,#9fdcff); -webkit-background-clip:text; color:transparent; }
.card header small { color:var(--xy-muted); font-size:11px; }
.card .more { margin-left:auto; border:0; background:none; color:var(--xy-accent); font-size:12px; padding:0; }
.kpis { display:grid; gap:6px; }
.k4 { grid-template-columns:repeat(4,minmax(0,1fr)); } .k4 .kpi strong { font-size:15px; }
.k2 { grid-template-columns:repeat(2,minmax(0,1fr)); }
.kpis.mini { margin-top:6px; }
.kpi { min-width:0; padding:6px 4px; text-align:center; border-radius:4px; background:linear-gradient(180deg,rgba(62,230,212,.06),rgba(62,230,212,.01)); border-bottom:1px solid rgba(62,230,212,.35); }
.kpi strong { display:block; font:700 18px/1.25 var(--xy-num); color:#eafcff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.kpi.small strong { font-size:12px; line-height:22px; }
.kpi strong i { font:normal 10px var(--xy-font); color:var(--xy-muted); margin-left:2px; }
.kpi span { display:block; font-size:11px; color:var(--xy-muted); }
.kpi.ok strong { color:#5ff0b0; } .kpi.bad strong { color:#ff8a7a; }
.ring-row { display:flex; align-items:center; gap:10px; }
.ring-row .kpis,.grow { flex:1; min-width:0; }
.ring { flex:none; width:92px; height:92px; border-radius:50%; display:grid; place-content:center; text-align:center; background:radial-gradient(closest-side,#0b1b2c 76%,transparent 78% 100%),conic-gradient(var(--xy-accent) var(--v),rgba(120,170,210,.15) 0); }
.ring strong { font:700 19px var(--xy-num); color:#eafcff; } .ring strong i { font-size:10px; font-style:normal; }
.ring span { font-size:11px; color:var(--xy-muted); }
.rows { list-style:none; margin:0; padding:0; display:grid; gap:4px; }
.rows li { display:flex; align-items:center; gap:8px; min-height:36px; padding:4px 8px; border-radius:4px; background:rgba(120,180,230,.05); font-size:13px; }
.rows li.clickable { cursor:pointer; }
.rows li.clickable:hover { background:rgba(62,230,212,.12); }
.rows li > span { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.rows small { display:block; color:var(--xy-muted); font-size:11px; }
.rows b { font:600 12px var(--xy-num); color:#d9ecff; white-space:nowrap; }
.rows em { font-style:normal; font-size:11px; color:var(--xy-muted); white-space:nowrap; }
.bar { flex:0 0 26%; height:5px; border-radius:3px; background:rgba(255,255,255,.08); overflow:hidden; }
.bar i { display:block; height:100%; border-radius:3px; background:linear-gradient(90deg,#2a8dff,#3ee6d4); }
.bar.warn i { background:linear-gradient(90deg,#f59f42,#f5c451); }
.rows .tag,.tag { flex:none; font-style:normal; font-size:11px; padding:1px 7px; border-radius:10px; border:1px solid; }
.tag.ok { color:#5ff0b0; border-color:rgba(95,240,176,.4); background:rgba(95,240,176,.08); }
.tag.warn { color:#f5c451; border-color:rgba(245,196,81,.4); background:rgba(245,196,81,.08); }
.tag.bad { color:#ff8a7a; border-color:rgba(255,122,107,.45); background:rgba(255,122,107,.1); }
.tag.info { color:#7fb8ff; border-color:rgba(77,156,255,.4); background:rgba(77,156,255,.08); }
.tag.idle { color:#9fb2c6; border-color:rgba(159,178,198,.3); }
.lv { flex:none; font-style:normal; font-size:11px; width:34px; text-align:center; padding:1px 0; border-radius:3px; color:#08121d; font-weight:700; }
.lv.bad { background:#ff7a6b; } .lv.warn { background:#f5c451; } .lv.info { background:#7fb8ff; }
.filter { display:flex; gap:4px; margin-bottom:6px; }
.filter button,.act,.search button { border:1px solid rgba(92,170,220,.3); background:rgba(20,50,80,.5); color:#cfe3f5; border-radius:4px; font-size:12px; padding:3px 9px; }
.filter button[aria-pressed='true'],.filter button:hover,.act:hover,.search button:hover { color:#06131f; background:var(--xy-accent); border-color:var(--xy-accent); }
.act { display:block; width:100%; min-height:32px; margin:8px 0 4px; }
.tbl { width:100%; border-collapse:collapse; font-size:12px; }
.tbl th { color:var(--xy-muted); font-weight:400; text-align:left; padding:4px; background:rgba(62,230,212,.06); }
.tbl td { padding:5px 4px; border-bottom:1px solid rgba(120,180,230,.08); font-family:var(--xy-num); }
.tbl tr.bad td { color:#ff8a7a; }
.hint { margin:6px 0 0; font-size:11px; color:var(--xy-muted); } .hint.warn { color:#f5c451; }
.search { display:flex; gap:6px; margin-bottom:6px; }
.search input { flex:1; min-width:0; background:rgba(4,14,24,.7); border:1px solid rgba(92,170,220,.3); color:#e8f3ff; border-radius:4px; padding:4px 8px; font:12px var(--xy-font); }
.trace-head { display:flex; align-items:baseline; justify-content:space-between; margin:8px 0 4px; } .trace-head small { color:var(--xy-muted); font-family:var(--xy-num); }
.timeline { list-style:none; margin:0; padding:0 0 0 6px; }
.timeline li { position:relative; display:flex; align-items:center; gap:8px; padding:5px 0 5px 14px; border-left:1px dashed rgba(62,230,212,.4); font-size:12px; }
.timeline li i { position:absolute; left:-5px; width:9px; height:9px; border-radius:50%; background:var(--xy-accent); box-shadow:0 0 6px var(--xy-accent); }
.timeline span { flex:1; } .timeline small { display:block; color:var(--xy-muted); font-size:11px; } .timeline b { color:#5ff0b0; font-weight:400; }
.act.ghost { background:transparent; }
.act:disabled { opacity:.45; cursor:not-allowed; }
.product-head { display:grid; margin-bottom:6px; } .product-head b { font-size:15px; } .product-head small { color:var(--xy-muted); font-size:11px; }
.flow-mini { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:4px; }
.flow-mini li { display:flex; align-items:center; gap:4px; padding:5px 4px; border-radius:4px; background:rgba(120,180,230,.06); font-size:12px; cursor:pointer; white-space:nowrap; }
.flow-mini li i { flex:none; width:16px; height:16px; border-radius:50%; display:grid; place-items:center; font:normal 10px var(--xy-num); color:#06131f; background:var(--xy-accent); }
.flow-mini li.on,.flow-mini li:hover { background:rgba(62,230,212,.16); color:#fff; }
.flow-ctrl { display:grid; grid-template-columns:2fr 1fr; gap:6px; } .flow-ctrl .act { margin:6px 0; }
.flow-progress { position:relative; height:16px; margin:2px 0 6px; border-radius:3px; background:rgba(255,255,255,.06); overflow:hidden; }
.flow-progress i { position:absolute; inset:0 auto 0 0; background:linear-gradient(90deg,#2a8dff,#3ee6d4); opacity:.55; }
.flow-progress span { position:relative; display:block; text-align:center; font:11px/16px var(--xy-num); color:#eafcff; }
.flow { list-style:none; margin:0; padding:0; display:grid; gap:3px; }
.flow > li { border-radius:4px; background:rgba(120,180,230,.05); border:1px solid transparent; }
.flow > li.on { border-color:rgba(62,230,212,.55); background:rgba(62,230,212,.08); }
.flow > li > button { display:flex; align-items:center; gap:8px; width:100%; padding:5px 8px; border:0; background:none; color:inherit; text-align:left; font-size:13px; }
.flow > li > button:disabled { cursor:not-allowed; opacity:.6; }
.flow > li > button i { flex:none; width:20px; height:20px; border-radius:50%; display:grid; place-items:center; font:normal 11px var(--xy-num); border:1px solid var(--xy-accent); color:var(--xy-accent); }
.flow > li.on > button i,.flow > li.done > button i { background:var(--xy-accent); color:#06131f; }
.flow > li > button span { flex:1; min-width:0; } .flow > li > button b { font-weight:600; } .flow > li > button small { display:block; color:var(--xy-muted); font-size:11px; }
.flow > li > button em { font-style:normal; font-size:11px; color:var(--xy-accent); }
.flow-detail { padding:0 8px 8px 36px; } .flow-detail p { margin:0 0 6px; font-size:12px; color:#cfe3f5; }
.segs { display:flex; flex-wrap:wrap; gap:4px; } .segs span { font-size:11px; padding:1px 6px; border-radius:3px; border:1px solid var(--xy-line); color:var(--xy-muted); }
.segs span.done { color:#cfe3f5; } .segs span.on { color:#06131f; background:var(--xy-accent); border-color:var(--xy-accent); }
.rows.tasks { max-height:300px; overflow:auto; }
.rows.compact { grid-template-columns:1fr 1fr; } .rows.compact li { min-height:30px; padding:3px 8px; } .rows.compact li em { display:none; }
.rows.compact { grid-template-columns:1fr 1fr; } .rows.compact li { min-height:30px; padding:3px 8px; } .rows.compact li em { display:none; }
@media (max-width:1100px) { .dash-col { width:clamp(250px,30vw,320px); } }
}
</style>

