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
          <Chart :option="hbar(healthRank)" :height="170" />
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
const Kpi = {
  functional: true,
  props: { value: [String, Number], unit: String, label: String, tone: String, small: Boolean },
  render: (h, { props }) => h("div", { class: ["kpi", props.tone, { small: props.small }] }, [h("strong", [String(props.value), props.unit ? h("i", props.unit) : null]), h("span", props.label)]),
};
const tones = { 运行: "ok", 已处置: "ok", 入库: "ok", 已返航: "ok", 待机: "idle", 换型: "warn", 巡检中: "info", 盘库: "info", 出库: "info", 告警: "warn", 未处置: "bad", 故障: "bad" };
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
      return this.pie([{ name: "运行", value: ds.running }, { name: "待机", value: ds.idle }, { name: "告警", value: ds.alarm }, { name: "故障", value: ds.fault }], `${ds.total}\n台`, ["#3ee6d4", "#6f86a3", "#f5c451", "#ff7a6b"]);
    },
  },
  methods: {
    fmt,
    pct: d.helpers.pct,
    bName(id) { return this.buildingNames[id] || { utility: "杂物房" }[id] || id; },
    trace() { this.traceMiss = this.sn && this.sn !== d.traceSample.sn ? this.sn : ""; },
    bar(x, y) {
      return { xAxis: { type: "category", data: x, ...axisStyle }, yAxis: { type: "value", ...axisStyle }, series: [{ type: "bar", data: y, barWidth: "46%", itemStyle: { borderRadius: [3, 3, 0, 0], color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#3ee6d4" }, { offset: 1, color: "rgba(62,230,212,.15)" }] } } }] };
    },
    bars2(x, groups) {
      return { legend: { right: 0, top: 0, textStyle: { color: "#8fa8c2", fontSize: 11 }, itemWidth: 10, itemHeight: 6 }, xAxis: { type: "category", data: x, ...axisStyle }, yAxis: { type: "value", ...axisStyle }, series: groups.map(([name, data]) => ({ name, type: "bar", data, barWidth: 7, itemStyle: { borderRadius: [2, 2, 0, 0] } })) };
    },
    line(x, y, unit, scale = false) {
      return { xAxis: { type: "category", data: x, boundaryGap: false, ...axisStyle }, yAxis: { type: "value", scale, name: unit, nameTextStyle: { color: "#8fa8c2", fontSize: 10 }, ...axisStyle }, series: [{ type: "line", data: y, smooth: true, symbol: "none", lineStyle: { width: 2 }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(62,230,212,.35)" }, { offset: 1, color: "rgba(62,230,212,0)" }] } } }] };
    },
    hbar(items) {
      return { grid: { left: 92, right: 30, top: 6, bottom: 6 }, tooltip: { trigger: "item" }, xAxis: { type: "value", show: false }, yAxis: { type: "category", inverse: true, data: items.map((i) => i.name), ...axisStyle, axisLine: { show: false } }, series: [{ type: "bar", data: items.map((i) => i.value), barWidth: 8, label: { show: true, position: "right", color: "#cfe3f5", fontSize: 11 }, itemStyle: { borderRadius: 4, color: "#4d9cff" }, showBackground: true, backgroundStyle: { color: "rgba(255,255,255,.05)", borderRadius: 4 } }] };
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
@media (max-width:1100px) { .dash-col { width:clamp(250px,30vw,320px); } }
}
</style>
