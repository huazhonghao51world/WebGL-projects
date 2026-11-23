<template>
  <div class="dash">
    <!-- 左栏 -->
    <aside class="dash-col dash-left">
      <template v-if="mod === 'overview'">
        <Card title="园区概况" sub="XY 工厂">
          <div class="kpis k4">
            <Kpi :value="buildingCount" unit="栋" label="园区建筑" />
            <Kpi :value="fmt(totalArea)" unit="m²" label="建筑面积" />
            <Kpi :value="fmt(d.peopleOnSite)" unit="人" label="在园人员" />
            <Kpi :value="cameraCount" unit="路" label="监控点位" />
          </div>
          <ul class="rows">
            <li v-for="b in buildingRows" :key="b.id" class="clickable" @click="$emit('locate', b.id)">
              <span>{{ b.name }}</span><em>{{ b.use }}</em><b>{{ b.people }} 人</b>
            </li>
          </ul>
        </Card>
        <Card title="生产概况" more="智能生产" @more="$emit('module', 'production')">
          <div class="ring-row">
            <Ring :value="p.rate" label="计划达成" />
            <div class="kpis k2">
              <Kpi :value="fmt(p.done)" unit="件" label="今日产量" />
              <Kpi :value="fmt(p.plan)" unit="件" label="今日计划" />
              <Kpi :value="p.oee" unit="%" label="综合 OEE" />
              <Kpi :value="p.yieldRate" unit="%" label="直通率" />
            </div>
          </div>
        </Card>
        <Card title="设备概况" more="设备管理" @more="$emit('module', 'device')">
          <Chart :option="deviceDonut" :height="140" />
        </Card>
      </template>

      <template v-else-if="mod === 'production'">
        <Card title="生产总览" :sub="`今日 00:00—${d.AS_OF}`">
          <div class="kpis k4">
            <Kpi :value="fmt(p.done)" unit="件" label="今日产量" />
            <Kpi :value="p.rate" unit="%" label="计划达成" />
            <Kpi :value="p.oee" unit="%" label="综合 OEE" />
            <Kpi :value="`${p.running}/${d.lines.length}`" label="运行产线" />
          </div>
        </Card>
        <Card title="产线运行" sub="点击定位到楼层">
          <ul class="rows lines">
            <li v-for="l in d.lines" :key="l.id" class="clickable" @click="$emit('locate', l.building, l.floor)">
              <span>{{ l.name }}<small>{{ l.floor }} · OEE {{ l.oee }}%</small></span>
              <div class="bar"><i :style="{ width: `${pct(l.done, l.plan)}%` }"></i></div>
              <b>{{ fmt(l.done) }}/{{ fmt(l.plan) }}</b><Tag :s="l.status" />
            </li>
          </ul>
        </Card>
        <Card title="分时产量" sub="件 / 2h">
          <Chart :option="bar(d.HOURS.map((h) => `${h}时`), p.hourly)" :height="140" />
        </Card>
      </template>

      <template v-else-if="mod === 'warehouse'">
        <Card title="库容总览" sub="库区楼 4 层">
          <div class="ring-row">
            <Ring :value="w.rate" label="库容利用率" />
            <div class="kpis k2">
              <Kpi :value="fmt(w.slots)" unit="位" label="货位总数" />
              <Kpi :value="fmt(w.used)" unit="位" label="在库货位" />
              <Kpi :value="w.todayIn" unit="单" label="今日入库" />
              <Kpi :value="w.todayOut" unit="单" label="今日出库" />
            </div>
          </div>
        </Card>
        <Card title="库区占用" sub="点击定位到楼层">
          <ul class="rows">
            <li v-for="z in d.zones" :key="z.id" class="clickable" @click="$emit('locate', 'warehouse', z.floor)">
              <span>{{ z.id }} 区 · {{ z.name }}<small>{{ z.floor }} · {{ z.used }}/{{ z.slots }}</small></span>
              <div class="bar" :class="{ warn: pct(z.used, z.slots) >= 85 }"><i :style="{ width: `${pct(z.used, z.slots)}%` }"></i></div>
              <b>{{ pct(z.used, z.slots) }}%</b>
            </li>
          </ul>
        </Card>
      </template>

      <template v-else-if="mod === 'product'">
        <Card title="产品产量" sub="今日">
          <Chart :option="pie(d.products.map((x) => ({ name: x.name, value: x.done })), `${fmt(p.done)}\n件`)" :height="170" />
        </Card>
        <Card title="产品列表">
          <ul class="rows">
            <li v-for="x in d.products" :key="x.id"><span>{{ x.name }}<small>型号 {{ x.id }}</small></span><b>{{ fmt(x.done) }} 件</b><em>{{ pct(x.done, p.done) }}%</em></li>
          </ul>
        </Card>
      </template>

      <template v-else-if="mod === 'device'">
        <Card title="设备运行态势">
          <div class="kpis k4">
            <Kpi :value="ds.total" unit="台" label="接入设备" />
            <Kpi :value="ds.running" unit="台" label="运行" tone="ok" />
            <Kpi :value="ds.alarm + ds.fault" unit="台" label="告警/故障" tone="bad" />
            <Kpi :value="ds.utilization" unit="%" label="开机率" />
          </div>
          <Chart :option="pie(ds.types, `${ds.total}\n台`)" :height="140" />
        </Card>
        <Card title="设备列表" sub="点击查看详情">
          <div class="filter"><button v-for="s in ['全部', '运行', '待机', '告警', '故障']" :key="s" :aria-pressed="devFilter === s" @click="devFilter = s">{{ s }}</button></div>
          <ul class="rows">
            <li v-for="x in deviceList" :key="x.id" class="clickable" @click="$emit('device', x.id)"><span>{{ x.name }}<small>{{ x.id }} · {{ bName(x.building) }} {{ x.floor }}</small></span><Tag :s="x.status" /></li>
          </ul>
        </Card>
      </template>

      <template v-else-if="mod === 'energy'">
        <Card title="今日能耗" :sub="`00:00—${d.AS_OF}`">
          <div class="kpis k4">
            <Kpi :value="fmt(e.today)" unit="kWh" label="今日用电" />
            <Kpi :value="fmt(e.power)" unit="kW" label="实时功率" />
            <Kpi :value="e.carbon" unit="tCO₂" label="碳排放" />
            <Kpi :value="e.perUnit" unit="kWh/件" label="单件能耗" />
          </div>
          <div class="kpis k2 mini"><Kpi :value="e.water" unit="m³" label="今日用水" /><Kpi :value="fmt(e.gas)" unit="m³" label="今日用气" /></div>
        </Card>
        <Card title="分项用电" sub="kWh">
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
        <Card title="室内监测点" :sub="`达标率 ${env.okRate}%`">
          <table class="tbl"><thead><tr><th>区域</th><th>温度</th><th>湿度</th><th>PM2.5</th><th>CO₂</th></tr></thead>
            <tbody><tr v-for="x in d.envPoints" :key="x.name" :class="{ bad: !x.ok }"><td>{{ x.name }}</td><td>{{ x.temp }}</td><td>{{ x.hum }}</td><td>{{ x.pm25 }}</td><td>{{ x.co2 }}</td></tr></tbody>
          </table>
          <p class="hint">办公楼 CO₂ 1046 ppm，超过 1000 ppm 限值，建议加大新风。</p>
        </Card>
      </template>

      <template v-else-if="mod === 'safety'">
        <Card title="安防态势">
          <div class="kpis k4">
            <Kpi :value="s.safeDays" unit="天" label="安全生产" tone="ok" />
            <Kpi :value="cameraCount" unit="路" label="监控点位" />
            <Kpi :value="`${s.fireOnline}/${s.fireDevices}`" label="消防设备在线" />
            <Kpi :value="fmt(s.staffOnSite)" unit="人" label="在园人员" />
          </div>
        </Card>
        <Card title="风险统计" sub="近 30 天">
          <Chart :option="pie(s.risks, `${riskTotal}\n起`)" :height="160" />
        </Card>
        <Card title="门岗通行" sub="今日">
          <ul class="rows"><li v-for="g in d.guardPosts" :key="g.name"><span>{{ g.name }}<small>值守 {{ g.staff }} 人</small></span><b>访客 {{ g.visitors }}</b><b>车辆 {{ g.vehicles }}</b></li></ul>
        </Card>
      </template>
    </aside>

    <!-- 右栏 -->
    <aside class="dash-col dash-right">
      <template v-if="['overview', 'device', 'safety'].includes(mod)">
        <Card title="告警中心" :sub="`未处置 ${pending.length}`" more="全部" @more="$emit('alarms')">
          <ul class="rows">
            <li v-for="a in alarmList" :key="a.id" class="clickable" @click="$emit('alarms', a.id)"><Lv :l="a.level" /><span>{{ a.content }}<small>{{ a.time }} · {{ bName(a.building) }}</small></span><Tag :s="a.state" /></li>
          </ul>
        </Card>
      </template>

      <template v-if="mod === 'overview'">
        <Card title="今日能耗" :sub="`${fmt(e.today)} kWh`" more="能源管理" @more="$emit('module', 'energy')">
          <Chart :option="line(d.HOURS.map((h) => `${h}时`), e.hourly, 'kWh')" :height="130" />
        </Card>
        <Card title="环境与安防">
          <div class="kpis k4">
            <Kpi :value="env.outdoor.temp" unit="°C" label="室外温度" />
            <Kpi :value="env.okRate" unit="%" label="环境达标" />
            <Kpi :value="s.safeDays" unit="天" label="安全生产" tone="ok" />
            <Kpi :value="s.visitors" unit="人" label="今日访客" />
          </div>
        </Card>
      </template>

      <template v-else-if="mod === 'production'">
        <Card title="质量分析" :sub="`不良 ${p.defectTotal} 件`">
          <div class="ring-row"><Ring :value="p.yieldRate" label="直通率" /><Chart class="grow" :option="hbar(p.defects)" :height="130" /></div>
        </Card>
        <slot name="motion"></slot>
      </template>

      <template v-else-if="mod === 'warehouse'">
        <Card title="近 7 日出入库" sub="单">
          <Chart :option="bars2(d.DAYS, [['入库', w.inbound], ['出库', w.outbound]])" :height="150" />
        </Card>
        <Card title="库存记录">
          <div class="filter"><button v-for="t in ['全部', '入库', '出库', '盘库']" :key="t" :aria-pressed="recFilter === t" @click="recFilter = t">{{ t }}</button></div>
          <ul class="rows"><li v-for="r in records" :key="r.id"><Tag :s="r.type" /><span>{{ r.material }}<small>{{ r.id }} · {{ r.zone }} 区 · {{ r.time }}</small></span><b>{{ fmt(r.qty) }}</b></li></ul>
          <p v-if="!records.length" class="hint">暂无记录</p>
        </Card>
      </template>

      <template v-else-if="mod === 'product'">
        <Card title="产品追溯" :sub="d.traceSample.order">
          <div class="search"><input v-model.trim="sn" placeholder="输入产品序列号" @keyup.enter="trace" /><button @click="trace">追溯</button></div>
          <p v-if="traceMiss" class="hint warn">未找到序列号 {{ traceMiss }}，示例序列号：{{ d.traceSample.sn }}</p>
          <div class="trace-head"><b>{{ d.traceSample.product }}</b><small>{{ d.traceSample.sn }}</small></div>
          <ol class="timeline"><li v-for="t in d.traceSample.steps" :key="t.name"><i></i><span>{{ t.name }}<small>{{ t.line }} · {{ t.time }}</small></span><b>{{ t.result }}</b></li></ol>
          <button class="act" @click="$emit('pending', '三维工序跟随')">在场景中跟随工序</button>
        </Card>
      </template>

      <template v-else-if="mod === 'device'">
        <Card title="健康度排行" sub="由低到高">
          <Chart :option="hbar(healthRank, true)" :height="170" />
        </Card>
      </template>

      <template v-else-if="mod === 'energy'">
        <Card title="今日分时用电" sub="kWh / 2h">
          <Chart :option="line(d.HOURS.map((h) => `${h}时`), e.hourly, 'kWh')" :height="140" />
        </Card>
        <Card title="近 7 日用电" sub="kWh">
          <Chart :option="bar(d.DAYS, e.week)" :height="140" />
        </Card>
        <Card title="峰谷与碳">
          <div class="kpis k2"><Kpi :value="e.peakShare" unit="%" label="峰段用电占比" /><Kpi :value="(100 - e.peakShare).toFixed(1)" unit="%" label="平谷段占比" /></div>
          <button class="act" @click="$emit('pending', '能效优化策略')">生成能效优化策略</button>
        </Card>
      </template>

      <template v-else-if="mod === 'environment'">
        <Card title="室内温度趋势" sub="生产楼 1F · °C">
          <Chart :option="line(d.HOURS.map((h) => `${h}时`), env.tempTrend, '°C', true)" :height="140" />
        </Card>
        <slot name="environment"></slot>
      </template>

      <template v-if="mod === 'safety'">
        <Card title="监控与巡检">
          <button class="act" @click="$emit('cameras')">查看 {{ cameraCount }} 路监控点位</button>
          <ul class="rows"><li v-for="x in d.patrols" :key="x.name"><span>{{ x.name }}<small>{{ x.route }}</small></span><div class="bar"><i :style="{ width: `${x.progress}%` }"></i></div><Tag :s="x.state" /></li></ul>
        </Card>
      </template>
    </aside>
  </div>
</template>

<script>
import * as d from "./dashboardData";
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
// 数字从 0 滚动到目标值，保留原始的小数位与千分位；非纯数字（如 8/12）直接显示
const Num = {
  props: { value: [String, Number] },
  data: () => ({ shown: "" }),
  watch: { value: { immediate: true, handler(v) { this.run(String(v)); } } },
  beforeDestroy() { cancelAnimationFrame(this.raf); },
  methods: {
    run(text) {
      cancelAnimationFrame(this.raf);
      const m = /^([\d,]*\d)(\.\d+)?$/.exec(text);
      if (!m || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { this.shown = text; return; }
      const target = Number(text.replace(/,/g, ""));
      const digits = m[2] ? m[2].length - 1 : 0;
      const show = (n) => (m[1].includes(",") ? n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }) : n.toFixed(digits));
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / 900);
        this.shown = p < 1 ? show(target * (1 - Math.pow(1 - p, 4))) : text;
        if (p < 1) this.raf = requestAnimationFrame(step);
      };
      this.shown = show(0);
      this.raf = requestAnimationFrame(step);
    },
  },
  render(h) { return h("span", { class: "num" }, this.shown); },
};
const Kpi = {
  functional: true,
  props: { value: [String, Number], unit: String, label: String, tone: String, small: Boolean },
  render: (h, { props }) => h("div", { class: ["kpi", props.tone, { small: props.small }] }, [h("strong", [h(Num, { props: { value: props.value } }), props.unit ? h("i", props.unit) : null]), h("span", props.label)]),
};
const tones = { 运行: "ok", 已处置: "ok", 入库: "ok", 已返航: "ok", 待机: "idle", 换型: "warn", 巡检中: "info", 盘库: "info", 出库: "info", 告警: "warn", 未处置: "bad", 故障: "bad" };
const Tag = { functional: true, props: { s: String }, render: (h, { props }) => h("em", { class: ["tag", tones[props.s] || "idle"] }, props.s) };
const Lv = { functional: true, props: { l: String }, render: (h, { props }) => h("i", { class: ["lv", { 紧急: "bad", 预警: "warn", 提示: "info" }[props.l]] }, props.l) };
const Ring = {
  functional: true,
  props: { value: Number, label: String },
  render: (h, { props }) => h("div", { class: "ring", style: { "--xy-ring-v": `${Math.min(props.value, 100) * 3.6}deg` } }, [h("strong", [h(Num, { props: { value: props.value } }), h("i", "%")]), h("span", props.label)]),
};

export default {
  name: "XYDashboard",
  components: { Card, Kpi, Tag, Lv, Ring, Chart: XYChart },
  props: { mod: String, cameraCount: Number, buildingNames: Object, alarms: Array },
  data: () => ({ d, devFilter: "全部", recFilter: "全部", sn: "", traceMiss: "" }),
  computed: {
    p: () => d.production, w: () => d.warehouse, e: () => d.energy, env: () => d.environment, s: () => d.security, ds: () => d.deviceStats,
    buildingRows() { return Object.entries(d.buildingProfiles).map(([id, b]) => ({ id, ...b, name: this.bName(id) })); },
    buildingCount() { return Object.keys(this.buildingNames).length; },
    totalArea() { return Object.values(d.buildingProfiles).reduce((t, b) => t + b.area, 0); },
    pending() { return this.alarms.filter((a) => a.state === "未处置"); },
    alarmList() { return [...this.alarms].sort((a, b) => (a.state === b.state ? 0 : a.state === "未处置" ? -1 : 1)).slice(0, 5); },
    deviceList() { return d.devices.filter((x) => this.devFilter === "全部" || x.status === this.devFilter); },
    records() { return d.stockRecords.filter((r) => this.recFilter === "全部" || r.type === this.recFilter); },
    maxMeter() { return Math.max(...d.meters.map((m) => m.value)); },
    riskTotal() { return this.s.risks.reduce((t, r) => t + r.value, 0); },
    healthRank() { return [...d.devices].sort((a, b) => a.health - b.health).slice(0, 6).map((x) => ({ name: x.name, value: x.health })); },
    deviceDonut() {
      const ds = this.ds;
      return this.pie([{ name: "运行", value: ds.running }, { name: "待机", value: ds.idle }, { name: "告警", value: ds.alarm }, { name: "故障", value: ds.fault }], `${ds.total}\n台`, ["#38bdf8", "#64748b", "#f59e0b", "#ef4444"]);
    },
  },
  methods: {
    fmt,
    pct: d.helpers.pct,
    bName(id) { return this.buildingNames[id] || { utility: "杂物房" }[id] || id; },
    trace() { this.traceMiss = this.sn && this.sn !== d.traceSample.sn ? this.sn : ""; },
    bar(x, y) {
      return { xAxis: { type: "category", data: x, ...axisStyle }, yAxis: { type: "value", ...axisStyle }, series: [{ type: "bar", data: y, barWidth: "46%", itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#38bdf8" }, { offset: 1, color: "rgba(129,140,248,.18)" }] } } }] };
    },
    bars2(x, groups) {
      return { legend: { right: 0, top: 0, textStyle: { color: "#cbd5e1", fontSize: 11 }, itemWidth: 10, itemHeight: 6 }, xAxis: { type: "category", data: x, ...axisStyle }, yAxis: { type: "value", ...axisStyle }, series: groups.map(([name, data]) => ({ name, type: "bar", data, barWidth: 7, itemStyle: { borderRadius: [3, 3, 0, 0] } })) };
    },
    line(x, y, unit, scale = false) {
      return { xAxis: { type: "category", data: x, boundaryGap: false, ...axisStyle }, yAxis: { type: "value", scale, name: unit, nameTextStyle: { color: "#94a3b8", fontSize: 10 }, ...axisStyle }, series: [{ type: "line", data: y, smooth: true, symbol: "none", lineStyle: { width: 2, color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: "#818cf8" }, { offset: 1, color: "#38bdf8" }] } }, areaStyle: { origin: "start", color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(56,189,248,.35)" }, { offset: 1, color: "rgba(56,189,248,0)" }] } } }] };
    },
    hbar(items, health = false) {
      const grad = (a, b) => ({ type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: a }, { offset: 1, color: b }] });
      const color = health ? (p) => (p.value < 60 ? grad("#ef4444", "#f87171") : p.value < 85 ? grad("#f97316", "#f59e0b") : grad("#818cf8", "#38bdf8")) : grad("#818cf8", "#38bdf8");
      return { grid: { left: 92, right: 30, top: 6, bottom: 6 }, tooltip: { trigger: "item" }, xAxis: { type: "value", show: false, max: health ? 100 : null }, yAxis: { type: "category", inverse: true, data: items.map((i) => i.name), ...axisStyle, axisLine: { show: false } }, series: [{ type: "bar", data: items.map((i) => i.value), barWidth: 10, barMaxWidth: 12, label: { show: true, position: "right", color: "#e2e8f0", fontSize: 12, fontFamily: "OPPOSans-M" }, itemStyle: { borderRadius: 5, color }, showBackground: true, backgroundStyle: { color: "rgba(255,255,255,.06)", borderRadius: 5 } }] };
    },
    pie(data, center, colors = palette) {
      const [num, unit] = center.split("\n");
      // 宽卡片：环在左、图例在右；卡片接近方形时由 chart.vue 切到 compact：环居中、图例在下
      const ring = (c, outer, inner) => [{ center: c, radius: outer }, { center: c, radius: inner }];
      const [wide, wideIn] = ring(["30%", "50%"], ["62%", "80%"], ["50%", "51%"]);
      const [tall, tallIn] = ring(["50%", "43%"], ["56%", "74%"], ["45%", "46%"]);
      return {
        color: colors, tooltip: { trigger: "item", formatter: "{b}：{c}（{d}%）" },
        legend: { data: data.map((x) => x.name), orient: "vertical", left: "60%", top: "middle", itemWidth: 8, itemHeight: 8, itemGap: 12, icon: "circle", textStyle: { color: "#e2e8f0", fontSize: 12 }, formatter: (n) => `${n}   ${data.find((x) => x.name === n).value}` },
        // 中心文字：百分比锚点 + textAlign/VerticalAlign，避免 'center' 关键字二次偏移
        title: { text: `{n|${num}}\n{u|${unit || ""}}`, left: wide.center[0], top: wide.center[1], textAlign: "center", textVerticalAlign: "middle", padding: 0, textStyle: { rich: { n: { color: "#fff", fontSize: 24, fontFamily: "OPPOSans-M", lineHeight: 28 }, u: { color: "#94a3b8", fontSize: 11, lineHeight: 14 } } } },
        series: [
          { type: "pie", ...wide, data, label: { show: false }, padAngle: 3, itemStyle: { borderRadius: 5 }, emphasis: { scaleSize: 5 }, animationType: "expansion", animationDuration: 1200 },
          { type: "pie", ...wideIn, silent: true, label: { show: false }, tooltip: { show: false }, data: [{ value: 1, itemStyle: { color: "rgba(255,255,255,.16)" } }] },
        ],
        compact: {
          maxAspect: 1.3,
          option: {
            legend: { orient: "horizontal", left: "center", top: undefined, bottom: 4, itemGap: 16 },
            title: { left: tall.center[0], top: tall.center[1] },
            series: [tall, tallIn],
          },
        },
      };
    },
  },
};
</script>

<style lang="scss">
@property --xy-ring-v { syntax:"<angle>"; inherits:false; initial-value:0deg; }
@keyframes xy-card-in { from { opacity:0; transform:translateY(16px); } }
@keyframes xy-row-in { from { opacity:0; transform:translateX(-14px); } }
@keyframes xy-bar-grow { from { transform:scaleX(0); } }
@keyframes xy-ring-fill { from { --xy-ring-v:0deg; } }

.dash {
span,em,b,small { font-size:inherit; }
.rows li > span { font-size:14px; }
.rows li small { font-size:11px; }
.dash-col { position:absolute; top:var(--xy-stack-top); bottom:var(--xy-gutter); width:var(--xy-col); display:flex; flex-direction:column; gap:12px; overflow-y:auto; pointer-events:auto; scrollbar-width:none;
  transition:transform .6s var(--xy-ease), opacity .45s ease, visibility 0s; }
.dash-left { left:var(--xy-gutter); transform-origin:left center; }
.dash-right { right:var(--xy-gutter); transform-origin:right center; }

/* 收起：两栏向屏幕外侧 3D 侧滑隐去，卡片级联淡出；展开时反向回弹 */
&.is-collapsed .dash-col { opacity:0; visibility:hidden; pointer-events:none; transition:transform .5s cubic-bezier(.55,0,.75,.2), opacity .4s ease .1s, visibility 0s .6s; }
&.is-collapsed .dash-left { transform:perspective(1200px) translateX(calc(-100% - 40px)) rotateY(18deg); }
&.is-collapsed .dash-right { transform:perspective(1200px) translateX(calc(100% + 40px)) rotateY(-18deg); }
&.is-collapsed .dash-col > * { opacity:0; transition:opacity .25s ease; }

/* 撑满：含图表/列表的卡片分摄剩余高度；整栏都没有时由最后一张卡片充满 */
.dash-col > * { flex:0 0 auto; animation:xy-card-in .65s var(--xy-ease) backwards; transition:opacity .45s ease, border-color .25s; }
.dash-col > .card:has(> .xy-chart, > .rows) { flex:1 1 auto; display:flex; flex-direction:column; }
.dash-col > .card:has(> .xy-chart) { flex-grow:3; }
.dash-col:not(:has(> .card > .xy-chart, > .card > .rows)) > :last-child { flex-grow:1; }
.card > .xy-chart { flex:1 1 0; min-height:120px; height:auto !important; overflow:hidden; }
.card > .rows { flex:1 1 auto; grid-auto-rows:minmax(38px, 1fr); align-items:start; }
.card > .rows > li { height:100%; max-height:58px; }
.dash-col > :nth-child(2) { animation-delay:.09s; transition-delay:.08s; } .dash-col > :nth-child(3) { animation-delay:.18s; transition-delay:.16s; } .dash-col > :nth-child(4) { animation-delay:.27s; transition-delay:.24s; }
.dash-right > * { animation-delay:.05s; }
.dash-right > :nth-child(2) { animation-delay:.14s; } .dash-right > :nth-child(3) { animation-delay:.23s; }

.card { position:relative; padding:14px 16px 16px; border:1px solid var(--xy-edge); border-radius:var(--xy-radius); background:var(--xy-glass); backdrop-filter:var(--xy-blur); box-shadow:var(--xy-shadow); }
.card::after { content:""; position:absolute; top:-1px; left:18px; right:18px; height:1px; background:linear-gradient(90deg,transparent,rgba(125,211,252,.75),transparent); opacity:.7; transition:opacity .25s; pointer-events:none; }
.card:hover { border-color:rgba(255,255,255,.22); }
.card:hover::after { opacity:1; }
.card > header { display:flex; align-items:center; gap:8px; margin:0 0 12px; }
.card > header::before { content:""; flex:none; width:4px; height:16px; border-radius:2px; background:linear-gradient(180deg,var(--xy-accent),var(--xy-accent-2)); }
.card h3 { margin:0; font:16px/1.3 var(--xy-font-b); letter-spacing:.02em; color:#fff; white-space:nowrap; }
.card header small { color:var(--xy-muted); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
/* 更多：悬停时渐变从左向右填充 */
.card .more { flex:none; margin-left:auto; height:24px; padding:0 11px; border:1px solid rgba(56,189,248,.3); border-radius:999px; color:var(--xy-accent); font-size:12px;
  background:linear-gradient(90deg,var(--xy-accent),var(--xy-accent-2)) left / 0% 100% no-repeat, rgba(56,189,248,.08); transition:background-size .35s var(--xy-ease), color .2s, border-color .2s; }
.card .more:hover { color:#0b1220; border-color:transparent; background-size:100% 100%, auto; }

.kpis { display:grid; gap:8px; }
.k4 { grid-template-columns:repeat(4,minmax(0,1fr)); } .k4 .kpi { padding-left:2px; padding-right:2px; } .k4 .kpi strong { font-size:17px; } .k4 .kpi strong i { font-size:10px; margin-left:1px; }
.k2 { grid-template-columns:repeat(2,minmax(0,1fr)); }
.kpis.mini { margin-top:8px; }
.kpi { position:relative; min-width:0; padding:9px 4px 7px; text-align:center; border-radius:12px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.06); transition:background-color .2s, border-color .2s, transform .25s var(--xy-ease), box-shadow .25s; }
.kpi:hover { background:rgba(56,189,248,.1); border-color:rgba(56,189,248,.35); transform:translateY(-2px); box-shadow:0 8px 18px rgba(2,6,23,.35), 0 0 0 1px rgba(56,189,248,.12); }
.kpi strong { display:block; font:20px/1.25 var(--xy-num); color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.kpi.small strong { font-size:13px; line-height:25px; }
.kpi strong i { font:normal 11px var(--xy-font); color:var(--xy-muted); margin-left:2px; }
.kpi > span { display:block; font-size:12px; color:var(--xy-muted); }
.kpi.ok strong { color:var(--xy-ok); } .kpi.bad strong { color:var(--xy-bad); }

.ring-row { display:flex; align-items:center; gap:14px; }
.ring-row .kpis,.grow { flex:1; min-width:0; }
.ring { flex:none; width:100px; height:100px; border-radius:50%; display:grid; place-content:center; text-align:center;
  background:radial-gradient(closest-side,rgba(15,23,42,.96) 79%,transparent 81% 100%),conic-gradient(from 0deg,var(--xy-accent-2),var(--xy-accent) var(--xy-ring-v),rgba(255,255,255,.08) 0);
  animation:xy-ring-fill 1.1s var(--xy-ease) .2s both; }
.ring strong { font:22px var(--xy-num); color:#fff; } .ring strong i { font-size:11px; font-style:normal; color:var(--xy-muted); }
.ring > span { font-size:12px; color:var(--xy-muted); }

.rows { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:minmax(0,1fr); gap:3px; }
.rows li { position:relative; display:flex; align-items:center; gap:10px; min-height:38px; padding:4px 10px; border-radius:10px; background:rgba(255,255,255,.04); font-size:14px; transition:background-color .18s, transform .18s var(--xy-ease), box-shadow .18s; animation:xy-row-in .45s var(--xy-ease) .2s backwards; }
@for $i from 2 through 12 { .rows li:nth-child(#{$i}) { animation-delay:#{.2 + $i * .04}s; } }
.rows li.clickable { cursor:pointer; }
.rows li.clickable::before { content:""; position:absolute; left:0; top:22%; bottom:22%; width:3px; border-radius:2px; background:var(--xy-accent); box-shadow:0 0 8px var(--xy-accent); transform:scaleY(0); transition:transform .22s var(--xy-ease); }
.rows li.clickable:hover { background:rgba(56,189,248,.14); box-shadow:inset 0 0 0 1px rgba(56,189,248,.35); transform:translateX(2px); }
.rows li.clickable:hover::before { transform:scaleY(1); }
.rows li.clickable:active { transform:translateX(2px) scale(.99); }
.rows li:has(> .lv.bad):has(> .tag.bad) { box-shadow:inset 3px 0 0 rgba(248,113,113,.55); }
.rows li > span { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#f1f5f9; }
.rows small { display:block; color:var(--xy-muted); font-size:11px; }
.rows b { font:14px var(--xy-num); color:#e2e8f0; white-space:nowrap; }
.rows em { font-style:normal; font-size:12px; color:var(--xy-muted); white-space:nowrap; }
.bar { flex:0 0 26%; height:6px; border-radius:3px; background:rgba(255,255,255,.08); overflow:hidden; }
.bar i { display:block; height:100%; border-radius:3px; background:linear-gradient(90deg,var(--xy-accent-2),var(--xy-accent)); transform-origin:left; animation:xy-bar-grow .9s var(--xy-ease) .2s both; }
.bar.warn i { background:linear-gradient(90deg,#f97316,var(--xy-warn)); }
.rows .tag,.tag { flex:none; font-style:normal; font-size:11px; padding:2px 9px; border-radius:999px; }
.tag.ok { color:#86efac; background:rgba(34,197,94,.14); }
.tag.warn { color:#fde68a; background:rgba(245,158,11,.16); }
.tag.bad { color:#fca5a5; background:rgba(239,68,68,.16); }
.tag.info { color:#bfdbfe; background:rgba(96,165,250,.16); }
.tag.idle { color:#cbd5e1; background:rgba(148,163,184,.14); }
.lv { flex:none; font-style:normal; font-size:12px; width:42px; text-align:center; padding:2px 0; border-radius:6px; font-weight:600; }
.lv.bad { color:#fecaca; background:rgba(239,68,68,.28); } .lv.warn { color:#fde68a; background:rgba(245,158,11,.24); } .lv.info { color:#bfdbfe; background:rgba(96,165,250,.24); }

.filter { display:flex; gap:4px; margin-bottom:8px; padding:3px; border-radius:10px; background:rgba(255,255,255,.05); }
.filter button { flex:1; border:1px solid transparent; border-radius:8px; background:transparent; color:#cbd5e1; font-size:12px; padding:3px 0; transition:background-color .18s, color .18s, box-shadow .2s; }
.filter button:hover { color:#fff; background:rgba(255,255,255,.08); }
.filter button[aria-pressed='true'] { color:#fff; background:linear-gradient(180deg,rgba(56,189,248,.3),rgba(56,189,248,.06)) padding-box,linear-gradient(#12223a,#0d1830) padding-box,linear-gradient(135deg,#7dd3fc,rgba(129,140,248,.5)) border-box; border:1px solid transparent; box-shadow:0 0 12px rgba(56,189,248,.25); }
/* 主操作：悬停时流光扫过、箭头前移 */
.act { position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; gap:8px; width:100%; min-height:38px; margin:12px 0 4px; padding:0 14px; border:1px solid rgba(56,189,248,.45); border-radius:12px;
  background:linear-gradient(90deg,rgba(56,189,248,.2),rgba(129,140,248,.2)); color:#e0f2fe; font:13px var(--xy-font-m); letter-spacing:.04em; transition:color .2s, border-color .2s, box-shadow .25s, transform .18s var(--xy-ease); }
.act::before { content:""; position:absolute; top:0; bottom:0; left:-60%; width:40%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent); transform:skewX(-20deg); transition:left .7s var(--xy-ease); pointer-events:none; }
.act::after { content:"→"; transition:transform .25s var(--xy-ease); }
.act:hover { color:#fff; border-color:var(--xy-accent); box-shadow:0 0 0 3px rgba(56,189,248,.14), 0 8px 22px rgba(56,189,248,.28); }
.act:hover::before { left:120%; }
.act:hover::after { transform:translateX(4px); }
.act:active { transform:scale(.98); }
.search button { flex:none; height:34px; padding:0 16px; border:0; border-radius:10px; background:linear-gradient(180deg,#7dd3fc,#38bdf8); color:#0b1220; font:13px var(--xy-font-m); box-shadow:0 6px 16px rgba(56,189,248,.3); transition:transform .18s var(--xy-ease), box-shadow .2s; }
.search button:hover { transform:translateY(-1px); box-shadow:0 8px 20px rgba(56,189,248,.45); }
.search button:active { transform:scale(.97); }
.tbl { width:100%; border-collapse:separate; border-spacing:0; font-size:12px; }
.tbl th { color:var(--xy-muted); font-weight:400; text-align:left; padding:6px; background:rgba(255,255,255,.05); }
.tbl th:first-child { border-radius:8px 0 0 8px; } .tbl th:last-child { border-radius:0 8px 8px 0; }
.tbl td { padding:7px 6px; border-bottom:1px solid rgba(255,255,255,.06); font-family:var(--xy-num); }
.tbl tr.bad td { color:var(--xy-bad); }
.hint { margin:8px 0 0; font-size:12px; color:var(--xy-muted); } .hint.warn { color:var(--xy-warn); }
.search { display:flex; gap:6px; margin-bottom:8px; }
.search input { flex:1; min-width:0; height:34px; background:rgba(255,255,255,.06); border:1px solid var(--xy-edge); color:var(--xy-text); border-radius:10px; padding:0 10px; font:13px var(--xy-font); transition:border-color .18s; }
.search input:focus { outline:none; border-color:var(--xy-accent); }
.trace-head { display:flex; align-items:baseline; justify-content:space-between; margin:10px 0 6px; } .trace-head small { color:var(--xy-muted); font-family:var(--xy-num); }
.timeline { list-style:none; margin:0; padding:0 0 0 6px; }
.timeline li { position:relative; display:flex; align-items:center; gap:8px; padding:6px 0 6px 16px; border-left:1px dashed rgba(56,189,248,.4); font-size:13px; }
.timeline li i { position:absolute; left:-5px; width:9px; height:9px; border-radius:50%; background:var(--xy-accent); box-shadow:0 0 0 3px rgba(56,189,248,.2); }
.timeline span { flex:1; } .timeline small { display:block; color:var(--xy-muted); font-size:11px; } .timeline b { color:var(--xy-ok); font-weight:400; }
@media (max-width:1440px) {
  .k4 { gap:6px; } .k4 .kpi { padding-left:0; padding-right:0; } .k4 .kpi strong { font-size:14px; letter-spacing:-.02em; } .k4 .kpi strong i { font-size:9px; margin-left:0; } .k4 .kpi.small strong { font-size:10.5px; }
  .ring { width:84px; height:84px; } .ring strong { font-size:19px; }
  .k2 .kpi strong { font-size:16px; } .kpi strong i { margin-left:1px; }
}
@media (max-height:820px) {
  .dash-col { gap:10px; scrollbar-width:thin; scrollbar-color:rgba(255,255,255,.18) transparent; }
  .card { padding:10px 14px 12px; } .card > header { margin-bottom:8px; }
  .rows li { min-height:32px; padding-top:2px; padding-bottom:2px; }
  .card > .rows { grid-auto-rows:minmax(32px, 1fr); }
  .card > .xy-chart { min-height:100px; }
  .kpi { padding-top:6px; padding-bottom:5px; }
}
@media (max-width:1100px) { .dash-col { width:clamp(250px,30vw,320px); } }
@media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation:none !important; transition:none !important; } }
}
</style>
