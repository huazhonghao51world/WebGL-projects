<template>
  <div class="dash">
    <!-- ======================= 左栏 ======================= -->
    <aside class="dash-col dash-left">
      <template v-if="mod === 'overview'">
        <Card title="园区概况" :sub="d.product.name" more="园区巡航" @more="$emit('flyover', 'overview')">
          <div class="kpis k4">
            <Kpi :value="buildingCount" unit="栋" label="园区建筑" />
            <Kpi :value="(totalArea / 10000).toFixed(2)" unit="万m²" label="建筑面积" />
            <Kpi :value="fmt(d.peopleOnSite)" unit="人" label="在园人员" />
            <Kpi :value="cameraCount" unit="路" label="监控点位" />
          </div>
          <ul class="rows compact">
            <li v-for="b in buildingRows" :key="b.id" class="clickable" :class="{ on: selectedId === b.id }" title="定位楼栋并打开楼栋信息" @click="$emit('locate', b.id)">
              <span>{{ b.name }}</span><b>{{ b.people }} 人</b>
            </li>
          </ul>
        </Card>
        <Card title="今日生产" :sub="`截至 ${d.AS_OF}`">
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
        <Card :title="`实时产线 · ${lineName}`" :sub="flow.running ? `批次 ${flow.batch} · ${flow.started ? pct(flow.batchMs, flow.batchDurationMs).toFixed(0) : 0}%` : flow.started ? '已停止生产' : '未开始生产'">
          <ol class="flow-mini">
            <li v-for="(s, i) in flowStages" :key="s.id" :class="{ on: flow.stage === i, done: flow.started && i < flow.stage }" :title="`跟随观察：${s.name}`" @click="$emit('flow', 'watch', i)"><i>{{ i + 1 }}</i>{{ s.name }}</li>
          </ol>
          <div class="stage-bar" style="margin-top:8px"><i :style="{ width: `${flow.started ? pct(flow.stageMs, flow.stageDurationMs) : 0}%` }"></i></div>
        </Card>
      </template>

      <template v-else-if="mod === 'production'">
        <Card title="生产总览" :sub="`${d.product.name} · 今日 00:00—${d.AS_OF}`">
          <div class="kpis k4">
            <Kpi :value="wan(p.assembled)" unit="万支" label="组装完成" />
            <Kpi :value="p.rate" unit="%" label="计划达成" />
            <Kpi :value="p.yieldRate" unit="%" label="成品合格率" />
            <Kpi :value="`${ds.moldersRunning}/${ds.molders}`" label="注塑机运行" />
          </div>
          <div class="oee"><Ring :value="d.oee.value" label="OEE" /><ul class="rows compact"><li><span>时间开动率</span><b>{{ d.oee.availability }}%</b></li><li><span>性能开动率</span><b>{{ d.oee.performance }}%</b></li><li><span>合格品率</span><b>{{ d.oee.quality }}%</b></li></ul></div>
        </Card>
        <Card title="工序产出" sub="点击正俯视对应区域">
          <ul class="rows steps">
            <li v-for="m in d.molding" :key="m.part" class="clickable" :class="{ on: areaOn === `mold-${m.part}` }" @click="pickArea(`mold-${m.part}`)"><span>注塑 · {{ m.name }}<small>{{ m.machines }} 台 · 废品 {{ fmt(m.scrap) }}</small></span><b>{{ fmt(m.output - m.scrap) }} 件</b></li>
            <li v-for="l in d.assemblyLines" :key="l.id" class="clickable" :class="{ on: areaOn === l.id }" @click="pickArea(l.id)"><span>{{ l.name }}<small>计划 {{ fmt(l.plan) }} · 不良 {{ l.defects }}</small></span><div class="bar"><i :style="{ width: `${pct(l.output, l.plan)}%` }"></i></div><b>{{ fmt(l.output) }}</b></li>
            <li class="clickable" :class="{ on: areaOn === 'packing' }" @click="pickArea('packing')"><span>打包装箱<small>{{ d.product.perBox }} 支/箱 · 待码垛 {{ p.boxesWaiting }} 箱</small></span><b>{{ fmt(p.boxes) }} 箱</b></li>
            <li class="clickable" :class="{ on: areaOn === 'palletize' }" @click="pickArea('palletize')"><span>码垛入库<small>{{ d.product.perPallet }} 箱/托</small></span><b>{{ p.pallets }} 托</b></li>
          </ul>
        </Card>
        <Card title="产品与物料" :sub="d.product.spec">
          <ul class="rows">
            <li v-for="x in d.product.parts" :key="x.id"><span>{{ x.name }}<small>{{ x.material }} · {{ x.weight }} g/件 · {{ x.process }}</small></span><b>{{ wan(x.id === 'barrel' ? p.good.barrel : p.good.cap) }} 万</b></li>
            <li><span>原料消耗<small>PP + PE 粒料 · 注塑良率 {{ p.moldYield }}%</small></span><b>{{ fmt(p.resinKg) }} kg</b></li>
          </ul>
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
        <Card title="库区占用" :sub="layerId === 'slots' ? '占用柱已显示 · 点击高亮库区' : '点击在货架上高亮库区'" :more="layerId === 'slots' ? '隐藏占用柱' : '显示占用柱'" @more="$emit('layer', 'slots')">
          <ul class="rows">
            <li v-for="z in d.zones" :key="z.id" class="clickable" :class="{ on: zoneId === z.id }" @click="$emit('zone', z.id)">
              <span>{{ z.name }}<small>{{ z.note }}</small></span>
              <div class="bar" :class="{ warn: pct(z.used, z.slots) >= 85 }"><i :style="{ width: `${pct(z.used, z.slots)}%` }"></i></div>
              <b>{{ z.used }}/{{ z.slots }}</b>
            </li>
          </ul>
        </Card>
        <Card title="立库设备" sub="点击高亮，在信息卡中聚焦">
          <ul class="rows fixed xy-scroll" style="max-height:132px">
            <li v-for="x in storageDevices" :key="x.id" class="clickable" @click="$emit('device', x.id, { focus: true })"><span>{{ x.name }}<small>{{ [x.note, x.cycle !== '—' ? x.cycle : ''].filter(Boolean).join(' · ') || x.area }}</small></span><Tag :s="x.status" /></li>
          </ul>
        </Card>
        <Card title="库龄分布" :sub="`在库 ${fmt(w.used)} 托`">
          <Chart :option="pie(d.stockAge, `${fmt(w.used)}\n托`, ['#4ade80', '#38bdf8', '#f5c451', '#ff5a4f'])" :height="120" />
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
        <Card title="设备分类" sub="点击筛选并在场景中高亮">
          <ul class="rows compact">
            <li v-for="g in groups" :key="g.id" class="clickable" :class="{ on: devGroup === g.id }" @click="pickGroup(g.id)"><span>{{ g.name }}</span><b>{{ g.count }}</b></li>
          </ul>
        </Card>
        <Card title="维保计划" :sub="`待执行 ${d.maintenance.length} 项 · 点击定位`">
          <ul class="rows">
            <li v-for="m in d.maintenance" :key="m.device" class="clickable" @click="$emit('device', m.device, { focus: true })"><span>{{ m.task }}<small>{{ devName(m.device) }} · {{ m.owner }}</small></span><em class="tag" :class="m.tone">{{ m.due }}</em></li>
          </ul>
        </Card>
      </template>

      <template v-else-if="mod === 'energy'">
        <Card title="今日能耗" :sub="`00:00—${d.AS_OF}`">
          <div class="kpis k4">
            <Kpi :value="(e.today / 10000).toFixed(2)" unit="万kWh" label="总用电" />
            <Kpi :value="fmt(e.pv)" unit="kWh" label="光伏发电" tone="ok" />
            <Kpi :value="e.perK" unit="kWh" label="千支能耗" />
            <Kpi :value="e.carbon" unit="t" label="碳排" />
          </div>
          <Chart :option="lines2(hours, [['用电', e.hourly], ['光伏', e.pvHourly]], 'kWh')" :height="130" />
        </Card>
        <Card title="分项用电" sub="kWh · 点击定位区域">
          <ul class="rows">
            <li v-for="m in d.meters" :key="m.name" class="clickable" @click="$emit('locate', m.building)"><span>{{ m.name }}<small>{{ bName(m.building) }}</small></span><div class="bar"><i :style="{ width: `${pct(m.value, maxMeter)}%` }"></i></div><b>{{ fmt(m.value) }}</b></li>
          </ul>
          <button class="act" @click="$emit('strategy')">生成能效优化策略</button>
        </Card>
        <Card title="峰谷平用电" sub="kWh · 分时电价">
          <Chart :option="pie(d.tou, `${(e.today / 10000).toFixed(2)}\n万kWh`, ['#ff5a4f', '#f5c451', '#38bdf8'])" :height="130" />
        </Card>
      </template>

      <template v-else-if="mod === 'safety'">
        <Card title="安防态势">
          <div class="kpis k4">
            <Kpi :value="s.safeDays" unit="天" label="安全生产" tone="ok" />
            <Kpi :value="cameraCount" unit="路" label="监控点位" />
            <Kpi :value="`${s.fireOnline}/${s.fireTotal}`" label="消防在线" />
            <Kpi :value="fmt(d.peopleOnSite)" unit="人" label="在园人员" />
          </div>
        </Card>
        <Card title="风险统计" sub="近 30 天">
          <Chart :option="pie(s.risks, `${riskTotal}\n起`)" :height="150" />
        </Card>
        <Card title="门禁通行" :sub="`进 ${d.access.in} · 出 ${d.access.out} · 拒绝 ${d.access.denied}`">
          <Chart :option="bar(hours, d.access.hourly)" :height="110" />
        </Card>
        <Card title="安保巡更" sub="今日">
          <ul class="rows">
            <li v-for="r in d.patrol" :key="r.route"><span>{{ r.route }}<small>最近打卡 {{ r.last }}</small></span><div class="bar" :class="{ warn: r.done < r.plan }"><i :style="{ width: `${pct(r.done, r.plan)}%` }"></i></div><b>{{ r.done }}/{{ r.plan }}</b></li>
            <li v-for="g in d.guardPosts" :key="g.name"><span>{{ g.name }}<small>值守 {{ g.staff }} 人</small></span><b>访客 {{ g.visitors }}</b><b>车辆 {{ g.vehicles }}</b></li>
          </ul>
        </Card>
      </template>

    </aside>

    <!-- ======================= 右栏 ======================= -->
    <aside class="dash-col dash-right">
      <!-- 业务专题：原专题图层按业务归入各模块 -->
      <Card v-if="layers.length" title="业务专题" sub="再次点击关闭">
        <div class="layer-grid">
          <button v-for="l in layers" :key="l.id" type="button" class="layer-btn" :aria-pressed="layerId === l.id" :disabled="layerBusy" :title="l.desc" @click="$emit('layer', l.id)"><b>{{ l.name }}</b><small v-if="layers.length < 3">{{ l.desc }}</small></button>
        </div>
        <template v-if="layerId === 'emergency'">
          <h4 class="sub-title">应急案例撤离路线</h4>
          <ul class="rows"><li v-for="c in evac" :key="c.id" class="clickable" :class="{ on: (layerOption.case || evac[0].id) === c.id }" @click="$emit('layer', 'emergency', { case: c.id })"><span>{{ c.name }}<small>{{ c.desc }}</small></span><b>{{ c.routes.reduce((t, r) => t + r.people, 0) }} 人</b></li></ul>
        </template>
        <div v-if="layerId === 'health'" class="legend"><span class="ok">≥80 正常</span><span class="warn">60–79 预警</span><span class="bad">&lt;60 告警</span></div>
      </Card>
      <!-- 设备健康统计：常显，各状态数值卡（点击在场景中按该状态着色 + 列表筛选），健康度分档与模型着色同一套颜色 -->
      <Card v-if="mod === 'device'" title="设备健康统计" :sub="layerId === 'health' ? '场景已按健康分着色 · 再次点击关闭' : '点击状态卡筛选 · 场景着色'" :more="layerId === 'health' ? '关闭着色' : '健康着色'" @more="$emit('layer', 'health')">
        <div class="stat-cards">
          <button v-for="c in statusCards" :key="c.s" type="button" class="stat-card" :class="[c.tone, { on: devFilter === c.s }]" @click="pickStatus(c.s)"><b>{{ c.n }}<i>台</i></b><span>{{ c.label }}</span></button>
        </div>
        <div v-if="layerId === 'health'" class="legend"><span class="ok">≥80 正常</span><span class="warn">60–79 预警</span><span class="bad">&lt;60 告警</span></div>
      </Card>
      <template v-if="mod === 'overview'">
        <Card title="设备态势" :sub="`${ds.total} 台接入`" more="设备管理" @more="$emit('module', 'device')">
          <div class="stat-cards">
            <div v-for="c in statusCards" :key="c.s" class="stat-card" :class="c.tone"><b>{{ c.n }}<i>台</i></b><span>{{ c.label }}</span></div>
          </div>
        </Card>
        <Card title="告警中心" :sub="`未处置 ${pending.length}`" more="全部" @more="$emit('alarms')">
          <ul class="rows">
            <li v-for="a in alarmList" :key="a.id" class="clickable" title="定位告警设备" @click="$emit('alarm', a.id)"><Lv :l="a.level" /><span>{{ a.content }}<small>{{ a.time }} · {{ bName(a.building) }}</small></span><Tag :s="a.state" /></li>
          </ul>
        </Card>
      </template>

      <template v-if="mod === 'overview'">
        <Card title="能源环境" :sub="`${fmt(e.today)} kWh · 光伏 ${e.pvShare}%`">
          <Chart :option="lines2(hours, [['用电', e.hourly], ['光伏', e.pvHourly]], 'kWh')" :height="110" />
          <div class="kpis k4 mini">
            <Kpi :value="env.okRate" unit="%" label="环境达标" />
            <Kpi :value="w.rate" unit="%" label="库位利用" />
            <Kpi :value="s.safeDays" unit="天" label="安全生产" tone="ok" />
            <Kpi :value="s.visitors" unit="人" label="今日访客" />
          </div>
        </Card>
      </template>

      <template v-else-if="mod === 'production'">
        <Card :title="lineName" :sub="flow.running ? `生产中 · 批次 ${flow.batch}` : flow.available ? (flow.started ? '已停止生产' : '未开始生产') : flow.reason || '准备中'">
          <div class="line-clock">
            <button class="act" :class="{ stop: flow.running }" :disabled="!flow.available" @click="$emit('flow', flow.running ? 'stop' : 'start')">{{ flow.running ? '停止生产' : '开始生产' }}</button>
            <div class="speed" role="group" aria-label="播放倍速"><small>倍速</small>
              <button v-for="x in speeds" :key="x" type="button" :aria-pressed="flow.speed === x" :disabled="!flow.available" @click="$emit('flow', 'speed', x)">{{ x }}×</button>
            </div>
          </div>
          <div class="line-ops">
            <button class="act" :aria-pressed="flow.follow" :disabled="!flow.available" :title="flow.follow ? '退出后回到进入前的拆楼与管线状态' : '恢复全部拆楼、隐藏管线特效，按工序机位观察'" @click="$emit('flow', 'follow', !flow.follow)">{{ flow.follow ? '退出跟随' : '跟随产线' }}</button>
            <div class="flow-progress"><i :style="{ width: `${flow.started ? pct(flow.batchMs, flow.batchDurationMs) : 0}%` }"></i><span>本批次流转 {{ flow.started ? pct(flow.batchMs, flow.batchDurationMs).toFixed(0) : 0 }}%</span></div>
          </div>
          <ol class="flow">
            <li v-for="(s, i) in flowStages" :key="s.id" :class="{ on: flow.stage === i, done: flow.started && i < flow.stage }">
              <div class="flow-row">
                <i>{{ i + 1 }}</i>
                <span><b>{{ s.name }}</b><small>{{ s.area }}</small></span>
                <em>{{ !flow.started ? '待流转' : flow.stage === i ? (flow.running ? '进行中' : '已暂停') : i < flow.stage ? '已完成' : '待流转' }}</em>
                <button type="button" class="look icon" :disabled="!flow.available" :title="`查看：镜头聚焦到${s.name}工位`" :aria-label="`聚焦查看${s.name}`" @click="$emit('flow', 'view', i)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg></button>
                <button type="button" class="look icon" :disabled="!flow.available" :title="`跟随观察：从${s.name}开始流转，镜头跟随产线`" :aria-label="`跟随观察${s.name}`" @click="$emit('flow', 'watch', i)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/></svg></button>
              </div>
              <div v-if="flow.stage === i" class="flow-detail">
                <p>{{ s.desc }}</p>
                <div class="stage-bar"><i :style="{ width: `${pct(flow.stageMs, flow.stageDurationMs)}%` }"></i></div>
                <div v-if="s.segments.length > 1" class="segs"><span v-for="(g, k) in s.segments" :key="g.clip" :class="{ on: flow.segment === k, done: flow.segment > k }">{{ g.label }}</span></div>
              </div>
            </li>
          </ol>
        </Card>
        <Card title="质量分析" :sub="`组装不良 ${fmt(p.defects)} 支`">
          <div class="ring-row"><Ring :value="p.yieldRate" label="成品合格率" /><Chart class="grow" :option="hbar(defectBars)" :height="110" /></div>
        </Card>
      </template>

      <template v-else-if="mod === 'warehouse'">
        <Card title="近 7 日立库作业" sub="托">
          <Chart :option="bars2(d.DAYS, [['入库', w.inbound], ['出库', w.outbound]])" :height="130" />
        </Card>
        <Card title="今日立库任务" :sub="`完成 ${tasksDone} / ${d.stockTasks.length} 单 · 点击在场景中回放作业`">
          <div class="task-sum">
            <button v-for="t in taskTypes" :key="t.type" type="button" :aria-pressed="recFilter === t.type" @click="recFilter = recFilter === t.type ? '全部' : t.type">
              <i :class="t.tone"></i><b>{{ t.count }}</b><span>{{ t.type }}</span><small>{{ t.route }}</small>
            </button>
          </div>
          <div v-if="task" class="task-live">
            <header><b>{{ task.id }}</b><em class="tag" :class="{ 已完成: 'ok', 执行中: 'info', 排队: 'idle' }[task.state]">{{ task.state }}</em><button type="button" class="link" @click="pickTask(task)">结束回放</button></header>
            <p>{{ task.item }} · {{ task.from }} → {{ task.to }}</p>
            <ol class="task-path">
              <li v-for="(n, i) in task.path" :key="n" :class="{ done: i < taskStep, now: i === taskStep }"><i>{{ i + 1 }}</i>{{ n === '库位' ? task.to.replace(/^.*区 /, '') : n }}</li>
            </ol>
          </div>
          <ul class="rows tasks xy-scroll">
            <li v-for="r in records" :key="r.id" class="clickable task" :class="{ on: taskId === r.id }" title="在场景中回放：沿作业路径逐站运镜，标注设备与目标库位" @click="pickTask(r)">
              <time>{{ r.time }}</time>
              <span>{{ r.item }}<small>{{ r.to }} · {{ r.device }}{{ r.mins ? ` · ${r.mins} min` : '' }}</small></span>
              <em class="tag" :class="{ 已完成: 'ok', 执行中: 'info', 排队: 'idle' }[r.state]">{{ r.state }}</em>
            </li>
          </ul>
        </Card>
      </template>

      <template v-else-if="mod === 'device'">
        <Card :title="devGroup ? groupName(devGroup) : '全部设备'" :sub="`${deviceList.length} 台`" :more="devGroup ? '全部' : ''" @more="pickGroup('')">
          <div class="filter"><button v-for="s in ['全部', '运行', '告警', '故障', '待机/换模']" :key="s" :aria-pressed="devFilter === s" @click="devFilter = s">{{ s === '待机/换模' ? '待机' : s }}</button></div>
          <ul class="rows tall xy-scroll">
            <li v-for="x in deviceList" :key="x.id" class="clickable dev" :class="{ on: detailId === x.id }" title="高亮设备并打开信息卡" @click="$emit('device', x.id, { focus: true })">
              <span>{{ x.name }}<small>{{ x.id }} · {{ bName(x.building) }} · <b :class="healthTone(x.health)">健康 {{ x.health }}</b></small></span>
              <Tag :s="x.status" />
            </li>
          </ul>
          <p v-if="!deviceList.length" class="hint">暂无设备</p>
        </Card>
      </template>

      <template v-else-if="mod === 'energy'">
        <Card title="车间环境" :sub="`达标率 ${env.okRate}% · 点击查看区域环境`">
          <ul class="rows">
            <li v-for="x in d.envPoints" :key="x.name" class="clickable" :class="{ bad: !x.ok, on: envOn === x.name }" @click="$emit('env', envOn === x.name ? '' : x.name)">
              <span>{{ x.name }}<small>{{ x.grade }}{{ x.dp == null ? '' : ` · 压差 ${x.dp} Pa` }}</small></span><b>{{ x.temp }}°C</b><b>{{ x.hum }}%</b><Tag :s="x.ok ? '正常' : '告警'" />
            </li>
          </ul>
        </Card>
        <slot name="environment"></slot>
        <Card title="千支能耗趋势" sub="kWh / 千支 · 近 7 日">
          <Chart :option="line(d.DAYS, d.perKWeek, 'kWh', true)" :height="100" />
        </Card>
      </template>

      <template v-if="mod === 'safety'">
        <Card title="视频监控" :sub="`${cameraCount} 路 · 实时`">
          <div class="video-grid">
            <div v-for="(c, i) in videoCams" :key="c.id" class="video-cell" :class="{ live: i === liveCam }" :title="`${c.name} · 点击定位并在点位旁播放`" @click="$emit('camera', c.id)">
              <slot v-if="i === liveCam" name="video" :cam="c"></slot>
              <canvas v-else :ref="`snap${i}`" width="320" height="200"></canvas>
              <span>{{ c.name.replace('园区监控摄像头', '监控 ') }}</span>
            </div>
          </div>
        </Card>
        <Card title="消防设施" :sub="`${d.fireList.length} 类 · 点击标注全部点位`">
          <ul class="rows fire-rows">
            <li v-for="f in d.fireList" :key="f.id" class="clickable" :class="{ on: facilityId === f.id }" @click="pickFacility(f)"><span>{{ f.name }}<small>{{ { hydrant: '消防给水', alarm: '火灾报警', exit: '疏散指示' }[f.kind] }} · 点击场景点位聚焦</small></span><b>{{ f.online }}/{{ f.count }}</b><Tag :s="f.online === f.count ? '正常' : '离线'" /></li>
          </ul>
        </Card>
      </template>
    </aside>
  </div>
</template>

<script>
import * as d from "./dashboardData";
import { stages as flowStages, WORLD_SPEEDS } from "./pipeline";
import { moduleLayers, healthTier } from "./operations";
import { thermalDevices, evacuationCases } from "./layers";
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
const tones = { 运行: "ok", 正常: "ok", 已处置: "ok", 成品入库: "ok", 原料入库: "info", 原料出库: "info", 待机: "idle", 换模: "info", 告警: "warn", 未处置: "bad", 故障: "bad", 离线: "bad" };
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
  props: { mod: String, cameraCount: Number, cameras: { type: Array, default: () => [] }, buildingNames: Object, alarms: Array, flow: Object, ledger: { type: Array, default: () => d.ledger }, detailId: String, selectedId: String, zoneId: String, lineName: { type: String, default: "注射器智造线" },
    layerId: { type: String, default: "" }, layerOption: { type: Object, default: () => ({}) }, layerBusy: Boolean, areaOn: String, taskId: String, taskStep: { type: Number, default: -1 }, facilityId: String, envOn: String },
  data: () => ({ d, flowStages, speeds: WORLD_SPEEDS, devFilter: "全部", devGroup: "", recFilter: "全部", thermal: thermalDevices, evac: evacuationCases, liveCam: 0 }),
  watch: {
    // 视频面板：同时解码多路视频会让主场景帧率减半（6 路 57 → 29 FPS）。只保持 1 路实时解码（每 8 s 轮换），
    // 其余格子每秒从实时画面截一帧（网关所有点位同源），画面持续更新且主场景帧率不受影响。
    mod: { immediate: true, handler(m) { this.stopVideoWall(); if (m === "safety") this.$nextTick(this.startVideoWall); } },
  },
  beforeDestroy() { this.stopVideoWall(); },
  computed: {
    // 仓储的库位占用已在“库区占用”卡头部提供开关；设备健康度并入常显的“设备健康统计”卡，不重复出专题卡。
    layers() { return ["warehouse", "device"].includes(this.mod) ? [] : moduleLayers[this.mod] || []; },
    statusCards() {
      const n = (list) => this.ledger.filter((x) => list.includes(x.status)).length;
      return [
        { s: "运行", label: "运行", tone: "ok", n: n(["运行"]) },
        { s: "告警", label: "告警", tone: "warn", n: n(["告警"]) },
        { s: "故障", label: "故障", tone: "bad", n: n(["故障"]) },
        { s: "待机/换模", label: "待机/换模", tone: "info", n: n(["待机", "换模"]) },
      ];
    },
    healthTiers() {
      return [["正常", "ok", "≥80"], ["预警", "warn", "60–79"], ["告警", "bad", "<60"]].map(([level, tone, range]) => ({ level, tone, range, n: this.ledger.filter((x) => healthTier(x.health).level === level).length }));
    },
    tasksDone() { return d.stockTasks.filter((t) => t.state === "已完成").length; },
    task() { return d.stockTasks.find((t) => t.id === this.taskId) || null; },
    videoCams() { return this.cameras.slice(0, 6); },
    detail() { return this.detailId ? this.ledger.find((x) => x.id === this.detailId) : null; },
    p: () => d.production, w: () => d.warehouse, e: () => d.energy, env: () => d.environment, s: () => d.security,
    summary() { return d.summarizeDevices(this.ledger); },
    ds() { return this.summary.stats; },
    groups() { return this.summary.groups; },
    hours: () => d.HOURS.map((h) => `${h}时`),
    // 世界时钟：从数据快照时刻起，按世界时间倍率累计。
    worldClock() {
      const [h, m] = d.AS_OF.split(":").map(Number);
      const total = Math.floor((h * 3600 + m * 60) + (this.flow.worldMs || 0) / 1000) % 86400;
      const two = (n) => String(n).padStart(2, "0");
      return `${two(Math.floor(total / 3600))}:${two(Math.floor((total % 3600) / 60))}:${two(total % 60)}`;
    },
    buildingRows() { return Object.entries(d.buildingProfiles).map(([id, b]) => ({ id, ...b, name: this.bName(id) })); },
    buildingCount() { return Object.keys(this.buildingNames).length; },
    totalArea() { return Object.values(d.buildingProfiles).reduce((t, b) => t + b.area, 0); },
    pending() { return this.alarms.filter((a) => a.state === "未处置"); },
    alarmList() { return [...this.alarms].sort((a, b) => (a.state === b.state ? 0 : a.state === "未处置" ? -1 : 1)).slice(0, 5); },
    deviceList() {
      return this.ledger.filter((x) => (!this.devGroup || x.group === this.devGroup)
        && (this.devFilter === "全部" || (this.devFilter === "待机/换模" ? ["待机", "换模"].includes(x.status) : x.status === this.devFilter)));
    },
    keyDevices() { return d.KEY_DEVICE_IDS.map((id) => this.ledger.find((x) => x.id === id)).filter(Boolean); },
    storageDevices() { return this.ledger.filter((x) => x.building === "warehouse"); },
    productionDevices() { return this.keyDevices.filter((x) => x.building === "production"); },
    records() { return d.stockTasks.filter((r) => this.recFilter === "全部" || r.type === this.recFilter); },
    taskTypes() {
      const meta = { 成品入库: { route: "打包区 → 成品区", tone: "ok" }, 原料入库: { route: "收货口 → 原料区", tone: "info" }, 原料出库: { route: "原料区 → 注塑供料", tone: "warn" } };
      return Object.entries(meta).map(([type, m]) => ({ type, ...m, count: d.stockTasks.filter((r) => r.type === type).length }));
    },
    maxMeter() { return Math.max(...d.meters.map((m) => m.value)); },
    riskTotal() { return this.s.risks.reduce((t, r) => t + r.value, 0); },
    defectBars() { return [{ name: "注塑废品·针筒", value: d.molding[0].scrap }, { name: "注塑废品·针帽", value: d.molding[1].scrap }, ...d.assemblyLines.map((l) => ({ name: `${l.name}不良`, value: l.defects }))]; },
    deviceDonut() {
      const ds = this.ds;
      return this.pie([{ name: "运行", value: ds.running }, { name: "待机/换模", value: ds.idle }, { name: "告警", value: ds.alarm }, { name: "故障", value: ds.fault }], `${ds.total}\n台`, ["#4ade80", "#6f9bff", "#f5c451", "#ff5a4f"]);
    },
  },
  methods: {
    fmt,
    pct: d.helpers.pct,
    healthBar: (v) => ({ warn: healthTier(v).tone === "warn", bad: healthTier(v).tone === "bad" }),
    healthTone: (v) => healthTier(v).tone,
    devName(id) { const x = this.ledger.find((y) => y.id === id); return x ? x.name : id; },
    startVideoWall() {
      this.stopVideoWall();
      this.snapTimer = setInterval(() => {
        const video = this.$el.querySelector(".video-cell.live video");
        if (!video || video.readyState < 2) return;
        this.videoCams.forEach((c, i) => {
          if (i === this.liveCam) return;
          const canvas = (this.$refs[`snap${i}`] || [])[0];
          if (canvas) canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        });
      }, 1000);
      this.rotateTimer = setInterval(() => { this.liveCam = (this.liveCam + 1) % Math.max(1, this.videoCams.length); }, 8000);
    },
    stopVideoWall() { clearInterval(this.snapTimer); clearInterval(this.rotateTimer); },
    pickStatus(s) { this.devFilter = this.devFilter === s ? "全部" : s; this.$emit("status", this.devFilter); },
    pickArea(id) { this.$emit("area", id); },
    pickTask(r) { this.$emit("task", this.taskId === r.id ? "" : r.id); },
    pickFacility(f) { this.$emit("facility", this.facilityId === f.id ? "" : f.id); },
    wan: (v) => (v / 10000).toFixed(2),
    secs: (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; },
    bName(id) { return this.buildingNames[id] || { utility: "杂物房" }[id] || id; },
    groupName(id) { const g = this.groups.find((x) => x.id === id); return g ? g.name : id; },
    pickGroup(id) { this.devGroup = this.devGroup === id ? "" : id; this.$emit("group", this.devGroup); },
    bar(x, y) {
      return { xAxis: { type: "category", data: x, ...axisStyle }, yAxis: { type: "value", ...axisStyle }, series: [{ type: "bar", data: y, barWidth: "46%", itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#38bdf8" }, { offset: 1, color: "rgba(129,140,248,.18)" }] } } }] };
    },
    bars2(x, groups) {
      return { legend: { right: 0, top: 0, textStyle: { color: "#cbd5e1", fontSize: 11 }, itemWidth: 10, itemHeight: 6 }, xAxis: { type: "category", data: x, ...axisStyle }, yAxis: { type: "value", ...axisStyle }, series: groups.map(([name, data]) => ({ name, type: "bar", data, barWidth: 7, itemStyle: { borderRadius: [3, 3, 0, 0] } })) };
    },
    line(x, y, unit, scale = false) {
      return { xAxis: { type: "category", data: x, boundaryGap: false, ...axisStyle }, yAxis: { type: "value", scale, name: unit, nameTextStyle: { color: "#94a3b8", fontSize: 10 }, ...axisStyle }, series: [{ type: "line", data: y, smooth: true, symbol: "none", lineStyle: { width: 2, color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: "#818cf8" }, { offset: 1, color: "#38bdf8" }] } }, areaStyle: { origin: "start", color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(56,189,248,.35)" }, { offset: 1, color: "rgba(56,189,248,0)" }] } } }] };
    },
    lines2(x, groups, unit) {
      return { legend: { right: 0, top: 0, textStyle: { color: "#8fa8c2", fontSize: 11 }, itemWidth: 10, itemHeight: 6 }, color: ["#3ee6d4", "#f5c451"], xAxis: { type: "category", data: x, boundaryGap: false, ...axisStyle }, yAxis: { type: "value", name: unit, nameTextStyle: { color: "#8fa8c2", fontSize: 10 }, ...axisStyle }, series: groups.map(([name, data]) => ({ name, type: "line", data, smooth: true, symbol: "none", lineStyle: { width: 2 }, areaStyle: { opacity: 0.12 } })) };
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
.rows li.bad > span,.rows li.bad > b { color:var(--xy-bad); }
.line-ops { display:grid; grid-template-columns:auto 1fr; gap:8px; align-items:center; margin:10px 0 6px; } .line-ops .act { margin:0; padding:0 12px; } .line-ops .flow-progress { margin:0; height:24px; } .line-ops .flow-progress span { line-height:24px; }
.rows li.clickable.on { background:rgba(56,189,248,.16); box-shadow:inset 0 0 0 1px rgba(56,189,248,.45); }
.rows li > span { font-size:14px; }
.rows li small { font-size:11px; }
.dash-col { position:absolute; top:var(--xy-stack-top); bottom:var(--xy-gutter); width:var(--xy-col); display:flex; flex-direction:column; gap:12px; overflow-y:auto; pointer-events:auto; padding-right:2px;
  transition:transform .6s var(--xy-ease), opacity .45s ease, visibility 0s; }
.dash-left { left:var(--xy-gutter); transform-origin:left center; }
.dash-right { right:var(--xy-gutter); transform-origin:right center; }

/* 收起：两栏向屏幕外侧 3D 侧滑隐去，卡片级联淡出；展开时反向回弹 */
&.is-collapsed .dash-col { opacity:0; visibility:hidden; pointer-events:none; transition:transform .5s cubic-bezier(.55,0,.75,.2), opacity .4s ease .1s, visibility 0s .6s; }
&.is-collapsed .dash-left { transform:perspective(1200px) translateX(calc(-100% - 40px)) rotateY(18deg); }
&.is-collapsed .dash-right { transform:perspective(1200px) translateX(calc(100% + 40px)) rotateY(-18deg); }
&.is-collapsed .dash-col > * { opacity:0; transition:opacity .25s ease; }

/* 高度自适应：卡片按内容高度排列，不再强行撑满整栏；整栏超出时滚动 */
.dash-col { bottom:auto; max-height:calc(100% - var(--xy-stack-top) - var(--xy-gutter)); }
.dash-col > * { flex:0 0 auto; animation:xy-card-in .65s var(--xy-ease) backwards; transition:opacity .45s ease, border-color .25s; }
.card > .xy-chart { overflow:hidden; }
.rows.tall { max-height:52vh; overflow-y:auto; }
.rows li.on { background:rgba(56,189,248,.16); box-shadow:inset 0 0 0 1px rgba(56,189,248,.45); }
.rows li.dev .dev-ops { display:flex; gap:4px; }
.dev-ops button,.ops button { height:22px; padding:0 8px; border:1px solid rgba(56,189,248,.35); border-radius:6px; background:rgba(56,189,248,.08); color:#bae6fd; font-size:11px; }
.dev-ops button:hover,.ops button:hover:not(:disabled) { color:#0b1220; background:var(--xy-accent); }
.ops { display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-top:10px; }
.ops button:disabled { opacity:.35; }
.ops button.danger { border-color:rgba(239,68,68,.5); color:#fca5a5; background:rgba(239,68,68,.1); }
.ops.swatches > span { font-size:12px; color:var(--xy-muted); }
.ops.swatches button { width:22px; padding:0; } .ops.swatches i { display:block; width:12px; height:12px; margin:auto; border-radius:3px; }
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
.kpis + .rows,.kpis + ul,.kpis + div { margin-top:12px; }
.k4 { grid-template-columns:repeat(4,minmax(0,1fr)); } .k4 .kpi { padding-left:2px; padding-right:2px; } .k4 .kpi strong { font-size:15px; letter-spacing:-.01em; } .k4 .kpi strong i { font-size:10px; margin-left:1px; }
.k2 .kpi strong { font-size:18px; letter-spacing:-.01em; }
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
.bar.warn i { background:linear-gradient(90deg,#d9a53a,#f5c451); }
.rows .tag,.tag { flex:none; font-style:normal; font-size:11px; padding:2px 9px; border-radius:999px; }
.tag.ok { color:#4ade80; background:rgba(74,222,128,.14); }
.tag.warn { color:#f5c451; background:rgba(245,196,81,.16); }
.tag.bad { color:#ff5a4f; background:rgba(255,90,79,.16); }
.tag.info { color:#bfdbfe; background:rgba(96,165,250,.16); }
.tag.idle { color:#cbd5e1; background:rgba(148,163,184,.14); }
.lv { flex:none; font-style:normal; font-size:12px; width:42px; text-align:center; padding:2px 0; border-radius:6px; font-weight:600; }
.lv.bad { color:#fecaca; background:rgba(239,68,68,.28); } .lv.warn { color:#fde68a; background:rgba(245,158,11,.24); } .lv.info { color:#bfdbfe; background:rgba(96,165,250,.24); }

.task-sum { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; margin-bottom:8px; }
.task-sum button { display:grid; grid-template-columns:auto 1fr; align-items:baseline; gap:0 6px; padding:6px 8px; border:1px solid rgba(255,255,255,.08); border-radius:10px; background:rgba(255,255,255,.04); color:#cbd5e1; text-align:left; cursor:pointer; }
.task-sum button[aria-pressed='true'] { border-color:rgba(56,189,248,.6); background:rgba(56,189,248,.14); }
.task-sum i { grid-row:1 / span 3; align-self:stretch; width:3px; border-radius:2px; background:#38bdf8; } .task-sum i.ok { background:#4ade80; } .task-sum i.warn { background:#f5c451; }
.task-sum b { font:18px var(--xy-num); color:#fff; } .task-sum span { grid-column:2; font-size:12px; } .task-sum small { grid-column:2; font-size:10px; color:var(--xy-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.rows.tasks time { flex:none; font:12px var(--xy-num); color:#7dd3fc; }
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
  .dash-col { gap:10px; }
  .card { padding:10px 14px 12px; } .card > header { margin-bottom:8px; }
  .rows li { min-height:32px; padding-top:2px; padding-bottom:2px; }
  .card > .rows { grid-auto-rows:minmax(32px, 1fr); }
  .card > .xy-chart { min-height:100px; }
  .kpi { padding-top:6px; padding-bottom:5px; }
}
.act.ghost { background:transparent; }
.act:disabled { opacity:.45; cursor:not-allowed; }
.product-head { display:grid; margin-bottom:6px; } .product-head b { font-size:15px; } .product-head small { color:var(--xy-muted); font-size:11px; }
.flow-mini { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:4px; }
.flow-mini li { display:flex; align-items:center; gap:4px; padding:5px 4px; border-radius:4px; background:rgba(120,180,230,.06); font-size:12px; cursor:pointer; white-space:nowrap; }
.flow-mini li i { flex:none; width:16px; height:16px; border-radius:50%; display:grid; place-items:center; font:normal 10px var(--xy-num); color:#06131f; background:var(--xy-accent); }
.flow-mini li.on,.flow-mini li:hover { background:rgba(62,230,212,.16); color:#fff; }
.flow-ctrl { display:grid; grid-template-columns:2fr 1fr; gap:6px; } .flow-ctrl .act { margin:6px 0; }
.line-clock { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 10px; border-radius:12px; background:rgba(56,189,248,.08); border:1px solid rgba(56,189,248,.22); }
.line-clock small { display:block; font-size:11px; color:var(--xy-muted); }
.line-clock strong { font:20px/1.2 var(--xy-num); color:#fff; letter-spacing:.04em; }
.line-clock .speed { display:flex; gap:4px; }
.line-clock .speed button { min-width:34px; height:28px; border:1px solid rgba(255,255,255,.14); border-radius:8px; background:rgba(255,255,255,.05); color:#cbd5e1; font:12px var(--xy-num); }
.line-clock .speed button[aria-pressed='true'] { color:#0b1220; background:var(--xy-accent); border-color:var(--xy-accent); }
.line-clock .act { width:auto; min-height:30px; margin:0; padding:0 14px; white-space:nowrap; }
.line-clock .act::after { content:none; }
.line-clock .act.stop { color:#fecaca; border-color:rgba(248,113,113,.55); background:rgba(248,113,113,.12); }
.act[aria-pressed='true'] { color:#0b1220; background:var(--xy-accent); border-color:var(--xy-accent); }
.flow-row { display:flex; align-items:center; gap:8px; padding:6px 8px; font-size:13px; }
.flow-row > i { flex:none; width:20px; height:20px; border-radius:50%; display:grid; place-items:center; font:normal 11px var(--xy-num); border:1px solid var(--xy-accent); color:var(--xy-accent); }
.flow > li.on .flow-row > i,.flow > li.done .flow-row > i { background:var(--xy-accent); color:#06131f; }
.flow-row > span { flex:1; min-width:0; } .flow-row b { font-weight:600; } .flow-row small { display:block; color:var(--xy-muted); font-size:11px; }
.flow-row em { font-style:normal; font-size:11px; color:var(--xy-muted); } .flow > li.on .flow-row em { color:var(--xy-accent); }
.flow-row .look { border:1px solid rgba(56,189,248,0); background:transparent; color:#bae6fd; border-radius:999px; font-size:11px; padding:1px 8px; cursor:pointer; }
.flow-row .look:hover { color:#0b1220; background:var(--xy-accent); }
.stage-bar { height:4px; margin:0 0 6px; border-radius:2px; background:rgba(255,255,255,.08); overflow:hidden; }
.stage-bar i { display:block; height:100%; background:linear-gradient(90deg,#818cf8,#38bdf8); transition:width .25s linear; }
.flow-mini li.done { color:#cbd5e1; }
.rows.tall { max-height:330px; overflow:auto; }
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
/* 两侧栏不出现滚动条：栏本身不滚动，内容超出时只由卡片内部列表收缩并滚动。 */
.dash-col { overflow:hidden !important; max-height:calc(100% - var(--xy-stack-top) - var(--xy-gutter)); }
.dash-col > .card { flex:0 1 auto; min-height:0; display:flex; flex-direction:column; overflow:hidden; }
.dash-col > .card > .flow { flex:1 1 auto; min-height:120px; overflow-y:auto; }
.dash-col > .card:not(:has(> .rows)):not(:has(> .video-grid)):not(:has(> .flow)) { flex-shrink:0; }
.dash-col > .card > .video-grid { flex:1 1 auto; min-height:96px; overflow-y:auto; }
.dash-col > .card > .rows { flex:1 1 auto; min-height:48px; overflow-y:auto; }
.dash-col > .card > .rows.xy-scroll,.dash-col > .card > .rows.tall,.dash-col > .card > .rows.tasks { flex:1 1 auto; min-height:64px; overflow-y:auto; }
.dash-col > .card > .xy-chart,.dash-col > .card > .kpis,.dash-col > .card > header,.dash-col > .card > .stat-cards,.dash-col > .card > .task-sum,.dash-col > .card > .task-live { flex:none; }
/* 消防设施：固定较矮高度，优先收缩，为业务专题、视频监控让出空间 */
.dash-col > .card:has(> .rows.fire-rows) { flex:0 3 auto; }
.dash-col > .card > .rows.fire-rows { flex:0 1 auto; max-height:136px; min-height:48px; }
.flow-row .look.icon { display:grid; place-items:center; width:26px; height:22px; padding:0; }
.flow-row .look.icon svg { width:15px; height:15px; }
.flow-row .look.icon:hover:not(:disabled) { color:#06131f; background:var(--xy-accent); border-color:var(--xy-accent); }
.task-live { margin:8px 0; padding:8px 10px; border:1px solid rgba(56,189,248,.4); border-radius:10px; background:rgba(56,189,248,.08); }
.task-live header { display:flex; align-items:center; gap:8px; } .task-live header b { color:#fff; font:13px var(--xy-num); } .task-live header .link { margin-left:auto; border:0; background:none; color:#7dd3fc; cursor:pointer; font-size:12px; }
.task-live p { margin:4px 0 0; color:#cbd5e1; font-size:12px; }
.rows.compact { grid-template-columns:1fr 1fr; } .rows.compact li { min-height:30px; padding:3px 8px; } .rows.compact li em { display:none; }
.rows.compact { grid-template-columns:1fr 1fr; } .rows.compact li { min-height:30px; padding:3px 8px; } .rows.compact li em { display:none; }
@media (max-width:1100px) { .dash-col { width:clamp(250px,30vw,320px); } }
@media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation:none !important; transition:none !important; } }
/* 业务专题 */
.layer-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(0,1fr)); gap:8px; }
.layer-btn { display:grid; gap:2px; align-content:center; min-height:50px; padding:8px 10px; border:1px solid rgba(255,255,255,.1); border-radius:11px; background:rgba(255,255,255,.04); color:#e2e8f0; text-align:left; cursor:pointer; }
.layer-btn b { font:13px var(--xy-font-m); font-weight:normal; white-space:nowrap; }
.layer-grid .layer-btn:only-child,.layer-btn:not(:has(small)) { text-align:center; justify-items:center; min-height:40px; }
.layer-btn small { color:var(--xy-muted); font-size:11px; line-height:1.4; }
.layer-btn:hover:not(:disabled) { border-color:rgba(56,189,248,.5); background:rgba(56,189,248,.1); }
.layer-btn[aria-pressed='true'] { border-color:var(--xy-accent); background:rgba(56,189,248,.18); box-shadow:inset 3px 0 0 var(--xy-accent); }
.layer-btn[aria-pressed='true'] b { color:#fff; }
.sub-title { margin:14px 0 8px; font:13px var(--xy-font-m); font-weight:normal; color:#e2e8f0; }
.chips { display:flex; flex-wrap:wrap; gap:6px; }
.chips button { height:28px; padding:0 10px; border:1px solid rgba(56,189,248,.35); border-radius:8px; background:rgba(56,189,248,.08); color:#bae6fd; font-size:12px; cursor:pointer; }
.chips button[aria-pressed='true'] { color:#0b1220; background:var(--xy-accent); border-color:var(--xy-accent); }
.legend { display:flex; gap:12px; margin-top:12px; font-size:12px; }
.legend span::before { content:""; display:inline-block; width:10px; height:10px; margin-right:5px; border-radius:3px; vertical-align:-1px; }
.legend .ok::before { background:#4ade80; } .legend .warn::before { background:#f5c451; } .legend .bad::before { background:#ff5a4f; }
/* 状态 / 健康数值卡：颜色与模型着色（HEALTH_TIERS）、状态标签一致 */
.stat-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-top:4px; }
.rows small b.ok,.rows small b.warn,.rows small b.bad,.rows small b { font-size:inherit; font-weight:500; }
.dash-col .rows,.dash-col .video-grid,.dash-col .flow { overflow-x:hidden !important; }
.stat-cards.health { grid-template-columns:repeat(3,1fr); margin-top:6px; }
.stat-card { --c:#94a3b8; --c1:rgba(148,163,184,.1); --c3:rgba(148,163,184,.35); display:flex; flex-direction:column; align-items:flex-start; gap:2px; padding:8px 10px; border:1px solid var(--c3); border-radius:10px; background:var(--c1); color:#cbd5e1; text-align:left; font:inherit; }
button.stat-card { cursor:pointer; } button.stat-card:hover,.stat-card.on { border-color:var(--c); box-shadow:inset 0 0 0 1px var(--c); }
.stat-card.ok { --c:#4ade80; --c1:rgba(74,222,128,.1); --c3:rgba(74,222,128,.35); } .stat-card.warn { --c:#f5c451; --c1:rgba(245,196,81,.1); --c3:rgba(245,196,81,.35); }
.stat-card.bad { --c:#ff5a4f; --c1:rgba(255,90,79,.1); --c3:rgba(255,90,79,.35); } .stat-card.info { --c:#6f9bff; --c1:rgba(111,155,255,.1); --c3:rgba(111,155,255,.35); }
.stat-card b { color:var(--c); font:22px/1.1 var(--xy-num, "OPPOSans-M"); } .stat-card b i { margin-left:2px; font-style:normal; font-size:11px; color:#94a3b8; }
.stat-card span { font-size:11px; color:#94a3b8; white-space:nowrap; }
.rows small b.ok { color:#4ade80; } .rows small b.warn { color:#f5c451; } .rows small b.bad { color:#ff5a4f; } .rows small b { font-weight:normal; }
.tag.idle { color:#cbd5e1; }
.oee { display:grid; grid-template-columns:auto 1fr; gap:12px; align-items:center; margin-top:10px; }
.oee .rows { grid-template-columns:1fr !important; display:grid; gap:4px; }
.hint { margin:6px 0 0; color:var(--xy-muted, #94a3b8); font-size:11px; }
.task-path { display:flex; gap:4px; margin:8px 0 0; padding:0; list-style:none; }
.task-path li { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:6px 2px; border-radius:8px; background:rgba(255,255,255,.04); color:#94a3b8; font-size:11px; text-align:center; }
.task-path li i { display:grid; place-items:center; width:18px; height:18px; border-radius:50%; background:rgba(255,255,255,.1); font-style:normal; font-size:10px; }
.task-path li.done { color:#bbf7d0; } .task-path li.done i { background:#22c55e; color:#06131f; }
.task-path li.now { color:#fff; background:rgba(56,189,248,.18); } .task-path li.now i { background:#38bdf8; color:#06131f; }
.video-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.video-cell { position:relative; aspect-ratio:16/10; border-radius:8px; overflow:hidden; background:#050b14; cursor:pointer; border:1px solid rgba(255,255,255,.08); }
.video-cell:hover { border-color:rgba(56,189,248,.6); }
.video-cell > span { position:absolute; left:6px; top:4px; padding:1px 6px; border-radius:4px; background:rgba(2,6,23,.7); color:#e2e8f0; font-size:11px; pointer-events:none; }
.video-cell .xy-video,.video-cell canvas { display:block; width:100%; height:100%; object-fit:cover; }
.video-cell.live { border-color:rgba(255,90,79,.6); }
.bar.bad i { background:linear-gradient(90deg,#e0443a,#ff5a4f); }
}
</style>

