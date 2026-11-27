<template>

  <section v-if="bare" class="xy-campus xy-bare" aria-label="新耀工厂园区（排查模式）"></section>
  <section v-else class="xy-campus" :class="{ 'xy-clean-view': panelsHidden, 'xy-no-motion': !uiMotion }" aria-label="新耀工厂园区">
    <XYAreaOverlay v-if="areaResult" :result="areaResult" />

    <!-- 顶栏：品牌 + 业务模块（居中） + 时间、帧率、UI 动效与操作 -->
    <header class="xy-header">
      <div class="xy-brand">
        <img class="xy-logo" :src="logo" alt="新耀工厂">
      </div>
      <div class="xy-header-actions">
        <div class="xy-clock"><strong>{{ clock.time }}</strong><span>{{ clock.date }}</span></div>
        <div class="xy-weather"><strong>14.2°C</strong><span>多云 · AQI 46</span></div>
        <div class="xy-fps" :title="isReady ? '三维场景实际帧率' : statusLabel"><FpsCounter v-if="isReady" compact /><span v-else class="quiet">{{ sceneStatus.state === 'error' ? '连接失败' : '加载中' }}</span><button v-if="sceneStatus.state === 'error'" type="button" class="link" @click="retry">重试</button></div>
        <button type="button" class="xy-motion-toggle" role="switch" :aria-checked="uiMotion" title="UI 动效：国产化显卡或低性能设备建议关闭" @click="toggleUiMotion"><i></i><span>UI动效</span></button>
        <button type="button" class="xy-icon-button" :aria-pressed="panelsHidden" :title="panelsHidden ? '展开面板' : '收起面板'" @click="panelsHidden = !panelsHidden"><XYIcon name="panel" /></button>
      </div>
    </header>
    <nav class="xy-nav" aria-label="业务模块" :style="{ '--xy-tab': modules.findIndex((m) => m.id === activeId), '--xy-tabs': modules.length }">
      <button v-for="item in modules" :key="item.id" type="button" :aria-pressed="activeId === item.id" :title="item.name" @click="setModule(item.id)"><XYIcon :name="item.icon" /><span>{{ item.name }}</span></button>
    </nav>

    <XYDashboard :class="{ 'is-collapsed': panelsHidden }" :mod="activeId" :camera-count="cameras.length" :cameras="cameras" :building-names="buildingNames" :alarms="alarmData" :flow="flow" :ledger="ledger" :detail-id="card && card.type === 'device' ? card.id : ''"
      :selected-id="selectedId" :zone-id="zoneId" :line-name="LINE_NAME" :layer-id="layout ? 'layout' : replay.active ? 'replay' : moldView ? 'mold' : layerId" :layer-option="layerOption" :layer-busy="layerBusy"
      :area-on="areaOn" :task-id="taskId" :task-step="taskStep" :facility-id="facilityId" :env-on="envOn"
      @locate="locateArea" @device="(id) => showDeviceCard(id, { focus: false })" @alarm="(id) => locateAlarm(id, false, false)" @alarms="openAlarms" @cameras="openCameras" @flow="onFlow" @flyover="playFlyover" @strategy="openStrategy"
      @zone="highlightZone" @group="highlightGroup" @facility="focusFacility" @layer="runModuleLayer" @area="viewArea" @task="showTask" @status="highlightStatus" @camera="(id) => openPoint(id)" @env="showEnvArea" @module="setModule">
      <template #environment>
        <div class="xy-slot-card"><XYBusinessPanel :module="environmentModule" :ready="isReady" @time="setLightTime" @weather="setWeather" @reset-environment="restoreEnvironment" /></div>
      </template>
      <template #video="{ cam }">
        <XYVideo :whep="whepUrl(cam)" :hls="hlsUrl(cam)" />
      </template>
    </XYDashboard>
    <template v-if="panelsHidden">
      <button type="button" class="xy-edge-handle left" title="展开面板" @click="panelsHidden = false"><XYIcon name="chevron" /></button>
      <button type="button" class="xy-edge-handle right" title="展开面板" @click="panelsHidden = false"><XYIcon name="chevron" /></button>
    </template>

    <!-- 统一信息卡：右上方、紧靠右侧面板；楼栋（含楼层与拆楼）、设备（含聚焦 / 拆解 / 控制）、监控（含实时视频）、构件、拆楼控制、布局规划共用一个位置 -->
    <aside v-if="card" class="xy-focus-card" :aria-label="cardTitle">
      <!-- 楼栋：概况 + 楼层 + 拆楼 -->
      <template v-if="card.type === 'building' && selected">
        <header><XYIcon name="building" /><div><strong>{{ selected.name }}</strong><small>{{ profileOf(selectedId) ? profileOf(selectedId).use : '园区建筑' }}</small></div><button type="button" aria-label="关闭" @click="closeCard">×</button></header>
        <dl v-if="profileOf(selectedId)" class="xy-facts">
          <div><dt>建筑面积</dt><dd>{{ profileOf(selectedId).area.toLocaleString() }} m²</dd></div>
          <div><dt>楼层</dt><dd>{{ profileOf(selectedId).floors }} 层</dd></div>
          <div><dt>在岗人员</dt><dd>{{ profileOf(selectedId).people }} 人</dd></div>
          <div><dt>设备 / 告警</dt><dd>{{ buildingDevices.length }} 台 / {{ buildingAlarms.length }} 条</dd></div>
        </dl>
        <p v-if="profileOf(selectedId)">{{ profileOf(selectedId).note }}</p>
        <section v-if="canCutaway(selectedId)" class="xy-card-section">
          <h4>拆楼<small>{{ cutRow(selectedId).on ? `已拆 ${cutRow(selectedId).on}/${cutRow(selectedId).layers.length} 层` : '未拆' }}{{ selectedId === 'production' ? ' · 始终保留 1F' : '' }}</small></h4>
          <div v-if="cutRow(selectedId).layers.length > 1" class="xy-ops">
            <button v-for="l in cutRow(selectedId).layers" :key="l.key" type="button" :aria-pressed="cutaway.includes(l.key)" :title="`${l.count} 个构件`" @click="toggleCutLayer(l.key)">{{ l.name }}</button>
          </div>
          <div class="xy-dialog-actions">
            <button type="button" class="xy-btn" :disabled="cutRow(selectedId).on === cutRow(selectedId).layers.length" @click="setCutawayTo([...cutaway.filter((k) => !k.startsWith(selectedId + ':')), selectedId], '手动')">整栋拆开</button>
            <button type="button" class="xy-btn ghost" :disabled="!cutRow(selectedId).on" @click="setCutawayTo(cutaway.filter((k) => !k.startsWith(selectedId + ':')), '手动')">整栋恢复</button>
          </div>
        </section>
        <section v-if="buildingAlarms.length" class="xy-card-section">
          <h4>未处置告警</h4>
          <ul class="xy-log"><li v-for="a in buildingAlarms" :key="a.id" style="cursor:pointer" @click="locateAlarm(a.id)"><time>{{ a.time }}</time>{{ a.content }}</li></ul>
        </section>
      </template>

      <!-- 设备：信息 + 聚焦 / 拆解 + 控制 + 材质 -->
      <template v-else-if="card.type === 'device' && cardDevice">
        <header><XYIcon name="device" /><div><strong>{{ cardDevice.name }}</strong><small>{{ cardDevice.id }} · {{ deviceGroupName }} · {{ buildingNames[cardDevice.building] || '园区' }} {{ cardDevice.area }}</small></div><button type="button" aria-label="关闭" @click="closeCard">×</button></header>
        <div class="xy-card-tags"><em :class="statusTone(cardDevice.status)">{{ cardDevice.status }}</em><em :class="healthTone(cardDevice.health)">健康 {{ healthLevel(cardDevice.health) }}</em><em v-if="following === cardDevice.id" class="ok">跟随中</em></div>
        <dl class="xy-facts">
          <div :class="healthTone(cardDevice.health)"><dt>健康评分</dt><dd>{{ cardDevice.health }} / 100</dd></div>
          <div><dt>实时功率</dt><dd>{{ cardDevice.power }} kW</dd></div>
          <div><dt>本体温度</dt><dd>{{ cardDevice.temp }} °C</dd></div>
          <div><dt>生产节拍</dt><dd>{{ cardDevice.cycle }}</dd></div>
        </dl>
        <div v-for="a in deviceAlarms" :key="a.id" class="xy-card-alarm" :class="{ warn: a.level !== '紧急' }">{{ a.level }} · {{ a.time }} {{ a.content }}</div>
        <p v-if="!deviceAlarms.length && cardDevice.note">{{ cardDevice.note }}</p>
        <div class="xy-dialog-actions">
          <button type="button" class="xy-btn" @click="locateDevice(cardDevice.id)">{{ adapter && adapter.isMoving(cardDevice.id) ? '聚焦跟随' : '聚焦' }}</button>
          <button type="button" class="xy-btn ghost" @click="focusDetail(cardDevice.id)">近景</button>
          <button v-if="canExplode(cardDevice.id)" type="button" class="xy-btn ghost" @click="explodeDevice(cardDevice.id)">拆解</button>
          <button v-if="thermalOf(cardDevice.id)" type="button" class="xy-btn ghost" @click="openThermal(cardDevice.id)">热成像</button>
          <button v-if="moldOf(cardDevice.id)" type="button" class="xy-btn ghost" @click="moldView = cardDevice.id">模温仿真</button>
        </div>
        <section class="xy-card-section">
          <h4>远程控制<small>演示：不下发 PLC</small></h4>
          <div class="xy-ops">
            <button v-for="c in commands" :key="c.id" type="button" :class="{ danger: c.id === 'estop' }" :disabled="!c.allow.includes(cardDevice.status)" @click="controlDevice(cardDevice.id, c.id)">{{ c.name }}</button>
          </div>
          <h4 style="margin-top:10px">外观标识</h4>
          <div class="xy-ops">
            <button v-for="m in materialPresets" :key="m.id" type="button" :aria-pressed="(materials[cardDevice.id] || 'none') === m.id" @click="setDeviceMaterial(cardDevice.id, m.id)"><i class="xy-swatch" :style="{ background: m.color || 'linear-gradient(135deg,#8fa3b8,#2a3a4c)' }"></i> {{ m.name }}</button>
          </div>
          <ul v-if="deviceLog.length" class="xy-log"><li v-for="(l, i) in deviceLog" :key="i"><time>{{ l.time }}</time>{{ l.text }}</li></ul>
        </section>
      </template>

      <!-- 区域环境详情 -->
      <template v-else-if="card.type === 'env' && envCard">
        <header><XYIcon name="energy" /><div><strong>{{ envCard.name }}</strong><small>{{ envCard.grade }} · {{ buildingNames[envCard.building] || envCard.building }} · {{ envCard.source }}</small></div><button type="button" aria-label="关闭" @click="showEnvArea('')">×</button></header>
        <div class="xy-card-tags"><em :class="envCard.ok ? 'ok' : 'bad'">{{ envCard.ok ? '环境达标' : '环境超限' }}</em><em v-for="r in envReasons" :key="r" class="bad">{{ r }}</em></div>
        <dl class="xy-facts">
          <div :class="{ bad: envCard.temp < envRules.temp[0] || envCard.temp > envRules.temp[1] }"><dt>温度</dt><dd>{{ envCard.temp }} °C <small>限 {{ envRules.temp[0] }}–{{ envRules.temp[1] }}</small></dd></div>
          <div :class="{ bad: envCard.hum < envRules.hum[0] || envCard.hum > envRules.hum[1] }"><dt>相对湿度</dt><dd>{{ envCard.hum }} %RH <small>限 {{ envRules.hum[0] }}–{{ envRules.hum[1] }}</small></dd></div>
          <div v-if="envCard.dp != null" :class="{ bad: envCard.dp < envRules.dp }"><dt>压差</dt><dd>{{ envCard.dp }} Pa <small>≥ {{ envRules.dp }}</small></dd></div>
          <div v-if="envCard.particles != null"><dt>≥0.5 μm 粒子</dt><dd>{{ (envCard.particles / 10000).toFixed(0) }} 万/m³ <small>≤ 352 万</small></dd></div>
        </dl>
        <p>{{ envCard.note }}</p>
        <section v-if="envCard.devices && envCard.devices.length" class="xy-card-section">
          <h4>区域设备<small>点击设备定位并查看详情</small></h4>
          <ul class="xy-env-devs"><li v-for="id in envCard.devices" :key="id"><button type="button" :title="`定位到 ${id}`" @click="showDeviceCard(id, { focus: true })"><b>{{ (ledger.find((x) => x.id === id) || {}).name || id }}</b><small>{{ id }} · {{ (ledger.find((x) => x.id === id) || {}).status }}</small><span class="go"><XYIcon name="target" />定位</span></button></li></ul>
        </section>
      </template>

      <!-- 构件 / 消防设施 -->
      <template v-else-if="card.type === 'part' && picked">
        <header><XYIcon :name="picked.icon" /><div><strong>{{ picked.title }}</strong><small>{{ picked.kind }}</small></div><button type="button" aria-label="关闭" @click="closeCard">×</button></header>
        <dl class="xy-facts"><div v-for="f in picked.facts" :key="f[0]"><dt>{{ f[0] }}</dt><dd :title="f[1]">{{ f[1] }}</dd></div></dl>
        <p v-if="picked.note">{{ picked.note }}</p>
      </template>

      <!-- 拆楼控制 -->
      <template v-else-if="card.type === 'cutaway'">
        <header><XYIcon name="building" /><div><strong>拆楼控制</strong><small>已拆 {{ cutaway.length }} 层</small></div><button type="button" aria-label="关闭" @click="closeCard">×</button></header>
        <section v-for="b in cutRows" :key="b.id" class="xy-card-section">
          <h4>{{ b.name }}<small>{{ b.on ? `已拆 ${b.on}/${b.layers.length}` : '未拆' }}{{ b.id === 'production' ? ' · 保留 1F' : '' }}</small></h4>
          <div class="xy-ops">
            <template v-if="b.layers.length > 1"><button v-for="l in b.layers" :key="l.key" type="button" :aria-pressed="cutaway.includes(l.key)" @click="toggleCutLayer(l.key)">{{ l.name }}</button></template>
            <button type="button" @click="setCutawayTo(b.on ? cutaway.filter((k) => !k.startsWith(b.id + ':')) : [...cutaway, b.id], '手动')">{{ b.on ? '整栋恢复' : '整栋拆开' }}</button>
          </div>
        </section>
        <ul v-if="cutLog.length" class="xy-log"><li v-for="(l, i) in cutLog" :key="i"><time>{{ l.time }}</time>{{ l.text }}<small>{{ l.by }}</small></li></ul>
        <div class="xy-dialog-actions"><button type="button" class="xy-btn ghost" :disabled="!cutaway.length" @click="setCutawayTo([], '手动')">全部恢复</button></div>
      </template>

      <!-- 布局规划 -->
      <template v-else-if="card.type === 'layout'">
        <header><XYIcon name="layout" /><div><strong>设备布局规划</strong><small>生产楼 1F · {{ layout.count }} 台可调设备</small></div><button type="button" aria-label="关闭" @click="cancelLayout">×</button></header>
        <p>在场景中按住设备拖动即可移动（吸附 0.25 m）；切到“旋转”后左右拖动按 15° 旋转。红框表示与其他设备、墙体 / 立柱 / 隔断或车间边界冲突。</p>
        <div class="xy-ops" style="margin-top:10px">
          <button type="button" :aria-pressed="layout.mode === 'translate'" @click="layoutMode('translate')">平移</button>
          <button type="button" :aria-pressed="layout.mode === 'rotate'" @click="layoutMode('rotate')">旋转</button>
          <button type="button" :disabled="!layout.selected" @click="layoutRotate">转 90°</button>
          <button type="button" :disabled="!layout.selected" @click="layoutRestoreOne">该设备复原</button>
        </div>
        <dl v-if="layout.selected" class="xy-facts">
          <div><dt>选中设备</dt><dd>{{ layout.selected.name }}</dd></div>
          <div :class="{ bad: layout.selected.collision }"><dt>状态</dt><dd>{{ layout.selected.wall ? '碰到墙体' : layout.selected.collision ? '冲突' : '可放置' }}</dd></div>
          <div><dt>偏移 X / Z</dt><dd>{{ layout.selected.dx }} / {{ layout.selected.dz }} m</dd></div>
          <div><dt>转角</dt><dd>{{ layout.selected.rotation }}°</dd></div>
        </dl>
        <div class="xy-card-tags"><em>已调整 {{ layout.moved }} 台</em><em :class="layout.collisions.length ? 'bad' : 'ok'">冲突 {{ layout.collisions.length }}</em><em v-if="layout.wallCollisions && layout.wallCollisions.length" class="bad">撞墙 {{ layout.wallCollisions.length }}</em></div>
        <section class="xy-card-section">
          <h4>布局方案<small>保存在本机</small></h4>
          <div class="xy-layout-save"><input v-model.trim="schemeName" maxlength="16" placeholder="方案名称" /><button type="button" class="xy-btn" :disabled="!layout.moved" @click="saveScheme">保存</button></div>
          <ul class="xy-log">
            <li v-for="s in schemes" :key="s.id"><time>{{ s.time }}</time>{{ s.name }}<small>{{ s.layout.length }} 台</small>
              <button type="button" class="link" @click="applyScheme(s)">应用</button><button type="button" class="link" @click="deleteScheme(s)">删除</button></li>
            <li v-if="!schemes.length" class="quiet">暂无方案</li>
          </ul>
        </section>
        <div class="xy-dialog-actions"><button type="button" class="xy-btn ghost" @click="cancelLayout">取消并复原</button><button type="button" class="xy-btn" @click="finishLayout">完成</button></div>
      </template>

      <!-- POI 显隐：分组开关 -->
      <template v-else-if="card.type === 'pois'">
        <header><XYIcon name="position" /><div><strong>POI 显隐</strong><small>按分组显示 / 隐藏场景点位</small></div><button type="button" aria-label="关闭" @click="closeCard">×</button></header>
        <ul class="xy-switch-list">
          <li v-for="g in poiGroups" :key="g.id"><span>{{ g.name }}</span><button type="button" role="switch" class="xy-mini-switch" :aria-checked="String(poiGroupOn(g.id))" @click="setPoiGroup(g.id, !poiGroupOn(g.id))"><i></i></button></li>
        </ul>
        <div class="xy-dialog-actions"><button type="button" class="xy-btn ghost" @click="setPoiVisible(true)">全部显示</button><button type="button" class="xy-btn ghost" @click="setPoiVisible(false)">全部隐藏</button></div>
      </template>

      <!-- 历史回放：告警回溯列表 + 时间轴 -->
      <template v-else-if="card.type === 'replay'">
        <header><XYIcon name="route" /><div><strong>历史回放</strong><small>今日告警回溯 · {{ replayEvents.length }} 条</small></div><button type="button" aria-label="关闭" @click="stopReplay">×</button></header>
        <div class="xy-timeline" role="group" aria-label="告警时间轴">
          <div class="axis"><span v-for="h in [0, 6, 12, 18, 24]" :key="h" :style="{ left: `${h / 24 * 100}%` }">{{ String(h).padStart(2, '0') }}:00</span></div>
          <button v-for="(a, i) in replayEvents" :key="a.id" type="button" class="node" :class="[lvTone(a.level), { on: replay.index === i }]" :style="{ left: `${minuteOf(a.time) / 1440 * 100}%` }" :title="`${a.time} ${a.content}`" @click="replayAt(i)"></button>
        </div>
        <div class="xy-dialog-actions" style="margin-top:6px">
          <button type="button" class="xy-btn ghost" :disabled="replay.index <= 0" @click="replayAt(replay.index - 1)">上一条</button>
          <button type="button" class="xy-btn" @click="replay.playing ? pauseReplay() : playReplay()">{{ replay.playing ? '暂停' : '自动播放' }}</button>
          <button type="button" class="xy-btn ghost" :disabled="replay.index >= replayEvents.length - 1" @click="replayAt(replay.index + 1)">下一条</button>
        </div>
        <section v-if="replayDevice" class="xy-card-section">
          <h4>当时状态<small>{{ replayEvents[replay.index].time }} · {{ replayDevice.name }}</small></h4>
          <dl class="xy-facts">
            <div :class="replayDevice.tone"><dt>设备状态</dt><dd>{{ replayDevice.status }}</dd></div>
            <div :class="healthTone(replayDevice.health)"><dt>健康评分</dt><dd>{{ replayDevice.health }}</dd></div>
            <div><dt>本体温度</dt><dd>{{ replayDevice.temp }} °C</dd></div>
            <div><dt>实时功率</dt><dd>{{ replayDevice.power }} kW</dd></div>
          </dl>
        </section>
        <ul ref="replayList" class="xy-log xy-replay-list">
          <li v-for="(a, i) in replayEvents" :key="a.id" :class="{ on: replay.index === i }" @click="replayAt(i)"><time>{{ a.time }}</time><i class="lv" :class="a.level">{{ a.level }}</i><span>{{ a.content }}<small>{{ a.device }} · {{ a.state }}</small></span></li>
        </ul>
      </template>
    </aside>

    <!-- 监控视频：跟随监控 POI 弹出 -->
    <div v-if="camPop" class="xy-cam-pop" :style="{ left: `${camPop.x}px`, top: `${camPop.y}px` }">
      <header><strong>{{ camPop.name }}</strong><small>RTSP</small><button type="button" title="三维监控视角" @click="cameraView(camPop.point)"><XYIcon name="target" /></button><button type="button" aria-label="关闭" @click="closeCamPop">×</button></header>
      <XYVideo :key="camPop.id" :whep="whepUrl(camPop.point)" :hls="hlsUrl(camPop.point)" />
    </div>

    <!-- 设备拆解：独立视窗 -->
    <XYExplodeViewer v-if="explodeView" :THREE="explodeView.THREE" :renderer3d="explodeView.renderer" :source="explodeView.source" :device="explodeView.device" :name-part="explodeView.namePart" @close="explodeView = null" />
    <XYThermalViewer v-if="thermalView" :key="thermalView.def.id" :THREE="thermalView.THREE" :source="thermalView.source" :def="thermalView.def" :region="thermalView.region" :scene-root="thermalView.sceneRoot" @close="thermalView = null" @switch="openThermal" />
    <XYMoldViewer v-if="moldView && moldGl" :sim-id="moldView" :THREE="moldGl.THREE" :renderer3d="moldGl.renderer" @close="moldView = ''" @switch="(id) => (moldView = id)" />

    <!-- 工厂介绍：解说以场景内标签呈现；控制器在底部工具条上方（与提示条同一栈，不再重叠） -->

    <!-- VTK 仿真控制 -->
    <div v-if="vtk.active" class="xy-vtk" role="group" :aria-label="vtk.title">
      <header><strong>{{ vtk.title }}</strong><span class="tag">VTK</span><button type="button" aria-label="关闭仿真" @click="closeLayer">×</button></header>
      <div class="xy-vtk-row">
        <button type="button" class="xy-btn" @click="simulationControl(vtk.playing ? 'pause' : 'play')">{{ vtk.playing ? '❚❚' : '▶' }}</button>
        <input type="range" min="0" :max="vtk.frames.length - 1" :value="vtk.frame" aria-label="仿真帧" @change="simulationControl('seek', Number($event.target.value))" />
        <span class="num">{{ vtkFrame.time }} s</span>
      </div>
      <div v-if="vtk.fields.length > 1" class="xy-vtk-row fields">
        <button v-for="f in vtk.fields" :key="f" type="button" :aria-pressed="vtk.field === f" @click="simulationControl('field', null, f)">{{ vtk.fieldInfo[f].label }}</button>
      </div>
      <p class="xy-vtk-stats">{{ vtkStatsText }}</p>
    </div>

    <!-- 底部场景工具条 -->
    <div class="xy-scene-tools">
      <div v-if="tourStep" class="xy-tour-ctrl" role="group" aria-label="工厂介绍">
        <button type="button" :disabled="tourStep.index === 0" aria-label="上一步" @click="tourJump(-1)">‹ 上一步</button>
        <span class="step"><b>{{ tourStep.index + 1 }}</b>/{{ tourStep.total }}<small>{{ tourStep.chapterName ? `${tourStep.chapterName} · ` : '' }}{{ tourStep.title }}</small></span>
        <button type="button" :aria-pressed="!tourPaused" :aria-label="tourPaused ? '继续自动播放' : '暂停自动播放'" @click="toggleTourPause">{{ tourPaused ? '▶' : '❚❚' }}</button>
        <button type="button" :disabled="tourStep.index >= tourStep.total - 1" aria-label="下一步" @click="tourJump(1)">下一步 ›</button>
        <button type="button" class="end" aria-label="结束介绍" @click="stopTour">结束</button>
      </div>
      <div v-else-if="areaResult" class="xy-note xy-area-readout">
        <strong v-if="areaResult.metrics">{{ areaPicking ? '预览' : '结果' }} · 面积 {{ areaResult.metrics.area.toFixed(2) }} m² · 周长 {{ areaResult.metrics.perimeter.toFixed(2) }} m</strong>
        <span>{{ areaPicking ? `${areaResult.count} 个顶点 · 单击取点，双击 / 回车完成，退格撤销，Esc 取消` : '水平投影面积 · 点击清除测面或按 Esc 关闭' }}</span>
      </div>
      <div v-else-if="pointPick" class="xy-note xy-point-readout">
        <strong>取点 · {{ pointPick.points.length }} 个点</strong>
        <code v-if="pointPick.points.length" class="xy-point-list">{{ pointText() }}</code>
        <span>在模型表面单击取点（拖动不取点）· 退格撤销 · Esc 结束</span>
        <span class="xy-point-actions">
          <button type="button" class="link" :disabled="!pointPick.points.length" @click="copyPoints">{{ pointCopied ? '已复制' : '复制坐标' }}</button>
          <button type="button" class="link" :disabled="!pointPick.points.length" @click="pointTool && pointTool.undo()">撤销</button>
          <button type="button" class="link" :disabled="!pointPick.points.length" @click="pointTool && pointTool.clear()">清空</button>
          <button type="button" class="link" @click="endPointPick">结束</button>
        </span>
      </div>
      <div v-else-if="noteText" class="xy-note" :class="{ live: flow.follow || Boolean(flyover) }" role="status">{{ noteText }}<button v-if="flyover" type="button" class="link" @click="stopFlyover">结束巡航</button><button v-else-if="flow.follow" type="button" class="link" @click="onFlow('follow', false)">退出跟随</button></div>
      <nav class="xy-tools" aria-label="三维场景工具">
        <div v-for="group in toolGroups" :key="group.name" class="xy-tool-group" :data-group="group.name" :style="{ flexGrow: group.items.length }">
          <button v-for="t in group.items" :key="t.id" type="button" :aria-pressed="toolActive(t.id)" :disabled="t.scene && !isReady" :title="toolTitle(t)" @click="runTool(t)">
            <XYIcon :name="t.icon" /><span>{{ t.name }}</span>
          </button>
        </div>
      </nav>
    </div>

    <!-- 弹窗 -->
    <div v-if="dialog" class="xy-mask" @click.self="dialog = null">
      <div class="xy-dialog" role="dialog" :aria-label="dialog.title">
        <header><h3>{{ dialog.title }}</h3><button type="button" aria-label="关闭" @click="dialog = null">×</button></header>

        <template v-if="dialog.type === 'alarms'">
          <div class="xy-filters">
            <select v-model="alarmFilter.level"><option value="">全部等级</option><option>紧急</option><option>预警</option><option>提示</option></select>
            <select v-model="alarmFilter.state"><option value="">全部状态</option><option>未处置</option><option>已处置</option></select>
            <span>共 {{ filteredAlarms.length }} 条 · 未处置 {{ alarmData.filter((a) => a.state === '未处置').length }} 条</span>
          </div>
          <table class="xy-table">
            <thead><tr><th>等级</th><th>告警内容</th><th>设备</th><th>区域</th><th>时间</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="a in filteredAlarms" :key="a.id" :class="{ on: alarmId === a.id }">
                <td><i class="lv" :class="a.level">{{ a.level }}</i></td><td>{{ a.content }}</td><td>{{ a.device }}</td><td>{{ buildingNames[a.building] || '杂物房' }}</td><td>{{ a.time }}</td>
                <td>{{ a.state }}<small v-if="a.result">（{{ a.result }}）</small></td>
                <td><button type="button" class="link" @click="locateAlarm(a.id); dialog = null">定位</button><button v-if="a.state === '未处置'" type="button" class="link" @click="alarmId = a.id">处置</button></td>
              </tr>
            </tbody>
          </table>
          <p v-if="!filteredAlarms.length" class="quiet">暂无符合条件的告警</p>
          <form v-if="handling" class="xy-handle" @submit.prevent="handleAlarm">
            <strong>处置：{{ handling.content }}</strong>
            <label>处置人<input v-model.trim="handleForm.user" required maxlength="12" /></label>
            <label>结果<select v-model="handleForm.result"><option>已修复恢复运行</option><option>转维修工单</option><option>误报</option></select></label>
            <div><button type="button" class="xy-btn ghost" @click="alarmId = ''">取消</button><button type="submit" class="xy-btn" :disabled="!handleForm.user">确认处置并解除告警</button></div>
          </form>
        </template>

        <template v-else-if="dialog.type === 'cameras'">
          <p class="quiet">实时 RTSP 视频（经流媒体网关转 WebRTC 播放）。点“定位”在三维场景中进入该机位视角。</p>
          <div class="xy-video-grid">
            <figure v-for="c in cameras.slice(0, videoWallSize)" :key="c.id">
              <XYVideo :whep="whepUrl(c)" :hls="hlsUrl(c)" />
              <figcaption><span>{{ c.name.replace('园区监控摄像头', '监控 ') }}</span><button type="button" class="link" :disabled="!isReady" @click="dialog = null; openPoint(c.id)">定位</button></figcaption>
            </figure>
          </div>
          <div v-if="cameras.length > videoWallSize" class="xy-dialog-actions"><button type="button" class="xy-btn ghost" @click="videoWallSize = cameras.length">显示全部 {{ cameras.length }} 路</button></div>
        </template>

        <template v-else-if="dialog.type === 'strategy' && strategy">
          <p class="quiet">依据今日分项计量、设备台账与光伏出力曲线生成；节电量为当日口径估算，合计 <b>{{ strategy.total.toLocaleString() }} kWh</b>（占今日用电 {{ strategy.share }}%），减碳 {{ strategy.carbon }} tCO₂。</p>
          <ol class="xy-strategy">
            <li v-for="s in strategy.list" :key="s.title"><b>{{ s.title }}</b><span>{{ s.basis }}</span><span>措施：{{ s.action }}</span><em>预计节电 {{ s.saving.toLocaleString() }} kWh/日 · 减碳 {{ s.carbon }} t</em></li>
          </ol>
        </template>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState } from "vuex";
import FpsCounter from "@/components/fpsCounter.vue";
import { emitter } from "@/utils/eventBus";
import { getTwinApp } from "@/utils/twin/app";
import { registerAgentCase, openAgent } from "@/utils/twin/agentCases";
import { startAreaMeasurement } from "@/utils/twin/areaMeasurement";
import { startPointPicker, formatPoints } from "@/utils/twin/pointPicker";
import { buildCampus, campus, floors, publishedAnchors } from "./campus";
import { connectCampus, CUT_GROUPS } from "./sceneAdapter";
import { createProductionLine, idleLine, stages as lineStages, WORLD_SPEEDS } from "./pipeline";
import { playFlyover } from "./flyover";
import { lastSceneProfile } from "./sceneProfile";
import { installRenderTuning } from "./renderTuning";
import { installRenderOverrides } from "./renderOverrides";
import { perfFlags } from "./perfFlags";
import { layerDefs } from "./layers";
import { applyCommand, commands, componentsOf, energyStrategies, materialPresets } from "./deviceOps";
import { createXYAgentCase } from "./agentApi";
import catalog from "./sceneCatalog.json";
import XYAreaOverlay from "./areaOverlay.vue";
import XYBusinessPanel from "./businessPanel.vue";
import XYIcon from "./icons.vue";
import XYDashboard from "./dashboard.vue";
import XYVideo from "./video.vue";
import XYExplodeViewer from "./explodeViewer.vue";
import { modules, moduleAlias, moduleViews, toolGroups, environmentModule, poiGroups, healthTier, moduleLayers as moduleLayersMap } from "./operations";
import { tourScript, TOUR_CHAPTERS } from "./factoryTour";
import { showSpotLabels } from "./spotLabels";
import { createLayoutEditor, loadSchemes, saveSchemes } from "./layoutEdit";
import { warehouseZones } from "./layers";
import { thermalDevices, thermalOf as thermalOfDevice } from "./thermal";
import XYThermalViewer from "./thermalViewer.vue";
import XYMoldViewer from "./moldViewer.vue";
import { moldSims } from "./moldSim";
import * as d from "./dashboardData";
import xyLogo from "@/assets/images/xy_logo.png";

const two = (n) => String(n).padStart(2, "0");
const hhmm = (date = new Date()) => `${two(date.getHours())}:${two(date.getMinutes())}`;
const CUTAWAY_BUILDINGS = Object.keys(catalog.cutaway);
// 产线名称：新耀工厂一次性无菌注射器从原料到入库的全流程。
const LINE_NAME = "注射器智造线";
// 生产楼“整栋拆”= 拆除全部分层但保留 1F（CUT_GROUPS 已不含 1F）；库区楼“整栋拆”= 屋顶/4F + 3F，2F、1F 不暴露。
const MODULE_CUTAWAY = { warehouse: ["warehouse"], device: ["production"], energy: ["production", "warehouse"] };
// 业务区域 → 拆楼 + 聚焦视角（面板中点击区域 / 楼栋条目时联动）。
const AREA_VIEWS = {
  production: { cut: ["production"], view: { position: [38, 92, 86], target: [38, 14, 0] } },
  warehouse: { cut: ["warehouse"], view: { position: [28, 90, 18], target: [28, 14, -38] } },
};
const UI_MOTION_KEY = "xy-ui-motion";
// 视频网关（MediaMTX，tools/rtsp/start-xy-cameras.bat）：RTSP 8554 → WebRTC 8889 / HLS 8888。可在 config.json cases.xy.video 覆盖。
const VIDEO_DEFAULT = { source: "rtsp://10.67.15.2:554", host: "", rtspPort: 8554, webrtcPort: 8889, hlsPort: 8888 };
// 交付模型中含 ≥3 个独立结构件、可物理爆炸拆解的设备。
const EXPLODABLE = new Set(["AGV-01", "DDJ-01", "JXB-A", "TSJ-01", "ZJXB-C", "ZJXB-E", "ZSJ-A", "ZSJ-B", "ZYGL-01", "ZYGL-02", "ZYJ-01", "ZYJ-02", "ZZXA", "ZZXB"]);
const ENTITY_NAMES = { "xy-campus-exterior": "园区外景", "xy-campus-core": "生产楼 / 库区楼主体", "xy-prop-sq3": "产线动线道具", "xy-mesh": "组装线机构", "xy-shinei": "室内设备" };
// 构件命名规则 → 专业名称（场景组命名：SM_<项目>_<类别>_…）
const PART_RULES = [[/SnappyRoad|jinjiexian|马路标线/i, "地面警示标线（黄黑斑马线）"], [/Ding|屋顶/, "屋面"], [/guangfu|光伏/i, "屋顶光伏组件"], [/Wall|墙/, "外墙围护"], [/Glass|WindowGlass|玻璃/, "幕墙 / 窗玻璃"], [/_Sn_|楼板/, "楼板"], [/_NJ_/, "内墙隔断"], [/_DT_|电梯|diantimen/i, "电梯 / 货梯"], [/daolu|DX0|Asphalt|道路/i, "厂区道路"], [/Caodi|草/i, "绿化草坪"], [/围墙/, "园区围墙"], [/tuopan|托盘/i, "物流托盘"], [/baoguo|BOX|box/, "成品纸箱"], [/KT|Conditioner/, "空调 / 新风设备"], [/MEN|门/, "门"], [/LX|料箱/, "原料料箱"]];
const partName = (name = "") => (PART_RULES.find(([re]) => re.test(name)) || [null, "建筑构件"])[1];
const idleVtk = { active: false, title: "", playing: false, frame: 0, frames: [], field: "", fields: [], fieldInfo: {} };

export default {
  name: "XYFactory",
  components: { FpsCounter, XYAreaOverlay, XYBusinessPanel, XYIcon, XYDashboard, XYVideo, XYExplodeViewer, XYThermalViewer, XYMoldViewer },
  data: () => ({
    campus, floors, modules, toolGroups, environmentModule, commands, materialPresets, LINE_NAME, poiGroups,
    asOf: d.AS_OF, activeId: "overview", panelsHidden: false, selectedId: "", floor: null, availableFloors: [],
    showCameras: false, touring: false, measuring: false, areaResult: null, pointPick: null, pointCopied: false, walking: false, message: "", flow: { ...idleLine }, flyover: null, profile: null,
    now: new Date(), dialog: null, alarmData: d.alarms.map((a) => ({ ...a })), alarmFilter: { level: "", state: "" }, alarmId: "",
    handleForm: { user: "", result: "已修复恢复运行" }, card: null, zoneId: "", following: null, videoWallSize: 6,
    ledger: d.ledger, opLog: [], materials: {}, explode: null, cutaway: [], occlusion: null, picked: null, cutLog: [], partTag: null,
    layout: null, schemes: [], schemeName: "", poiHidden: false, poiHiddenKinds: [], assistantOpen: false, logo: xyLogo,
    uiMotion: !/[?&]lite=1/.test(window.location.search) && window.localStorage.getItem(UI_MOTION_KEY) !== "off", pickEnabled: false,
    camPop: null, explodeView: null, thermalView: null, moldView: "", moldGl: null, areaOn: "", taskId: "", taskStep: -1, facilityId: "", envOn: "", envRules: d.envRules, layerOption: {}, replayEvents: [], tourStep: null, tourPaused: false, tourChapters: TOUR_CHAPTERS,
    layerId: "", layerInfo: "", layerBusy: false, vtk: { ...idleVtk }, replay: { active: false, index: -1, total: 0, playing: false }, strategy: null,
    bare: /[?&]bare=1/.test(window.location.search + window.location.hash),
    bareStep: Number(((window.location.search + window.location.hash).match(/[?&]step=(\d+)/) || [])[1] || 0),
  }),
  computed: {
    clock() {
      const n = this.now;
      return { time: `${two(n.getHours())}:${two(n.getMinutes())}:${two(n.getSeconds())}`, date: `${n.getFullYear()}-${two(n.getMonth() + 1)}-${two(n.getDate())} 星期${"日一二三四五六"[n.getDay()]}` };
    },
    buildingNames() { return Object.fromEntries(this.buildings.map((b) => [b.id, b.name])); },
    filteredAlarms() { return this.alarmData.filter((a) => (!this.alarmFilter.level || a.level === this.alarmFilter.level) && (!this.alarmFilter.state || a.state === this.alarmFilter.state)); },
    handling() { return this.alarmData.find((a) => a.id === this.alarmId && a.state === "未处置"); },
    cardDevice() { return this.card && this.card.type === "device" ? this.ledger.find((x) => x.id === this.card.id) : null; },
    deviceGroupName() { const g = this.cardDevice && d.deviceGroups.find((x) => x.id === this.cardDevice.group); return g ? g.name : "生产设备"; },
    deviceAlarms() { return this.cardDevice ? this.alarmData.filter((a) => a.device === this.cardDevice.id && a.state === "未处置") : []; },
    deviceLog() { return this.cardDevice ? this.opLog.filter((l) => l.deviceId === this.cardDevice.id).slice(0, 4) : []; },
    buildingDevices() { return this.ledger.filter((x) => x.building === this.selectedId); },
    buildingAlarms() { return this.alarmData.filter((a) => a.building === this.selectedId && a.state === "未处置"); },
    cardTitle() { return this.card ? { building: "楼栋信息", device: "设备信息", part: "构件信息", cutaway: "拆楼控制", layout: "布局规划", pois: "POI 显隐", replay: "历史回放", env: "区域环境" }[this.card.type] : ""; },
    envCard() { return this.card && this.card.type === "env" ? d.envPoints.find((p) => p.name === this.card.id) : null; },
    envReasons() {
      const p = this.envCard; const r = d.envRules;
      if (!p) return [];
      return [p.temp > r.temp[1] ? "温度偏高" : p.temp < r.temp[0] ? "温度偏低" : "", p.hum > r.hum[1] ? "湿度偏高" : p.hum < r.hum[0] ? "湿度偏低" : "", p.dp != null && p.dp < r.dp ? "压差不足" : ""].filter(Boolean);
    },
    replayDevice() {
      const a = this.replay.active && this.replayEvents[this.replay.index];
      const x = a && this.ledger.find((y) => y.id === a.device);
      if (!x) return null;
      // 告警发生时刻的状态：未处置按告警等级回推，已处置的为处置前状态。
      const status = a.level === "紧急" ? "故障" : a.level === "预警" ? "告警" : x.status;
      const health = a.level === "紧急" ? Math.min(x.health, 45) : a.level === "预警" ? Math.min(x.health, 72) : x.health;
      return { ...x, status, health, tone: this.statusTone(status) };
    },
    videoConf() { const v = (this.$store.state.twinConfig.xy || {}).video || {}; return { ...VIDEO_DEFAULT, host: window.location.hostname, ...v }; },
    ...mapState(["sceneStatus", "isSceneAlready"]),
    isReady() { return this.isSceneAlready && this.sceneStatus.caseKey === "xy" && this.sceneStatus.state === "ready"; },
    areaPicking() { return Boolean(this.areaResult && this.areaResult.active); },
    buildings() { return this.campus.buildings; },
    cameras() { return this.campus.cameras; },
    selected() { return this.campus.anchors.find(({ id }) => id === this.selectedId); },
    buildingFloors() { return floors[this.selectedId] || []; },
    cutRows() {
      return Object.entries(CUT_GROUPS).map(([id, groups]) => {
        const layers = groups.map((g) => ({ key: `${id}:${g.id}`, name: g.name, count: g.nodes.length }));
        return { id, name: this.buildingNames[id] || id, layers, on: layers.filter((l) => this.cutaway.includes(l.key)).length };
      });
    },
    layerName() { return this.layerId ? layerDefs[this.layerId].name : ""; },
    vtkFrame() { return this.vtk.frames[this.vtk.frame] || { time: 0 }; },
    vtkStatsText() {
      const f = this.vtkFrame;
      if (f.minPressure != null) return `门 ${f.door} · 最低 ${f.minPressure} Pa · 平均 ${f.meanPressure} Pa · 低于 ${d.envRules.dp} Pa 面积 ${f.belowLimitPct}%`;
      if (f.leftFace != null) return `峰值 ${f.maxTemperature} °C · 分型面左半模 ${f.leftFace} °C / 右半模 ${f.rightFace} °C`;
      if (f.maxTemperature != null) return `表面峰值 ${f.maxTemperature} °C · 平均 ${f.meanTemperature} °C · 高温区 ${f.hotPct}%`;
      return "";
    },
    lineNote() {
      const f = this.flow;
      if (this.flyover) return `${this.flyover} · 按 Esc 结束巡航（生产线照常运行）`;
      if (!f.follow || f.stage < 0) return "";
      return `跟随产线视角 · 批次 ${f.batch} · ${f.stage + 1}/${lineStages.length} ${lineStages[f.stage].name} · ${f.speed}× 播放`;
    },
    noteText() { return this.lineNote || this.message || this.layerInfo; },
    statusLabel() {
      if (this.isReady) return this.profile && this.profile.version ? `实时三维视图 · 场景配置 ${this.profile.version}${this.profile.ok ? "" : "（未生效）"}` : "实时三维视图";
      return this.sceneStatus.state === "error" ? "静态预览 · 连接失败" : "静态预览 · 三维尚未配置";
    },
  },
  watch: {
    isReady(ready) { if (ready) this.attach(); else this.detach(); },
    activeId(id, before) { if (id !== before) this.flyModule(id); },
    explodeView(v) { if (!v && !this.thermalView && !this.moldView) this.resumeMainRender(); },
    thermalView(v) { if (!v && !this.explodeView && !this.moldView) this.resumeMainRender(); },
    moldView(v) {
      // 模温仿真三维视窗复用主渲染器（Object.freeze 防止 Vue 把 three 对象响应式化）；打开期间暂停主场景渲染。
      this.moldGl = v && this.measureViewer ? Object.freeze({ THREE: this.measureViewer.extensions.THREE, renderer: this.measureViewer.extensions.renderer }) : null;
      if (v && this.measureViewer) this.pauseMainRender(this.measureViewer);
      else if (!v && !this.explodeView && !this.thermalView) this.resumeMainRender();
    },
  },
  mounted() {
    if (this.bare) {
      emitter.on("sceneUpdated", this.attach);
      if (this.isReady) this.attach();
      return;
    }
    emitter.on("sceneUpdated", this.attach);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.offAgent = registerAgentCase(createXYAgentCase(this));
    this.onAgentState = (open) => { this.assistantOpen = open; };
    emitter.on("agentState", this.onAgentState);
    if (this.isReady) this.attach();
    this.clockTimer = setInterval(() => { this.now = new Date(); }, 1000);
    // 调试：每 5 s 打印当前镜头参数，便于标定各场景机位。
    this.poseTimer = setInterval(() => {
      const v = this.measureViewer;
      if (!v || v.getState() !== "ready") return;
      try { console.log("[xy-camera]", JSON.stringify(v.camera.getPose())); } catch (e) { /* 场景切换中 */ }
    }, 5000);
    window.addEventListener("keydown", this.onKey);
  },
  beforeDestroy() {
    clearInterval(this.clockTimer);
    clearInterval(this.poseTimer);
    window.removeEventListener("keydown", this.onKey);
    emitter.off("sceneUpdated", this.attach);
    document.removeEventListener("visibilitychange", this.onVisibility);
    if (this.offAgent) this.offAgent();
    emitter.off("agentState", this.onAgentState);
    this.detach();
  },
  methods: {
    attach() {
      if (!this.isReady) return;
      const app = getTwinApp();
      if (!app || app.viewer.getState() !== "ready") return;
      this.detach();
      const xy = this.$store.state.twinConfig.xy || {};
      // 排查模式：不执行任何三维默认业务（POI、产线动画、点选、配置包、渲染调优），只显示 SDK 加载的原始场景。
      // ?bare=1&step=N 逐级加回：1 场景配置包；2 + POI 与点选；3 + 产线动画；4 + 渲染调优 / 覆盖（阴影等）。
      const step = this.bare ? this.bareStep : 99;
      // 场景配置包与逐个实体显示已由三维场景层在“完全加载”阶段完成（layout/scene.vue → completeSceneLoad）。
      if (this.bare && step < 2) {
        console.warn(`[xy-bare] 已跳过交付端全部三维默认业务${step >= 1 ? "（已应用场景配置包）" : ""}`);
        return;
      }
      if (this.bare) console.warn(`[xy-bare] 逐级加回 step=${step}：配置包${step >= 2 ? " + POI" : ""}${step >= 3 ? " + 产线动画" : ""}${step >= 4 ? " + 渲染调优" : ""}`);
      const perf = perfFlags(xy);
      if (Object.values(perf).includes(false)) console.warn("[xy-perf] 已关闭：", Object.keys(perf).filter((key) => !perf[key]).join(", "));
      const offset = Array.isArray(xy.anchorOffset) ? xy.anchorOffset : [0, 0, 0];
      const published = publishedAnchors(getTwinApp().viewer);
      if (published) this.campus = Object.freeze(buildCampus(published));
      const { anchors, demoDevice } = this.campus;
      if (this.selectedId && !this.selected) { this.selectedId = ""; this.floor = null; }
      this.scenePoints = [...anchors, demoDevice].map((point) => ({ ...point, position: point.position.map((value, index) => value + (Number(offset[index]) || 0)) }));
      try {
        const adapter = connectCampus(this.scenePoints, this.onScenePick, { showCameras: this.showCameras, poiStyles: xy.poiStyles, occlusion: false, raycastWarm: perf.raycastWarm });
        this.adapter = adapter;
        if (this.poiHidden) adapter.occlusion.setMasked(true);
        this.poiHiddenKinds.forEach((k) => adapter.occlusion.setKindHidden(k, true));
        this.run(adapter.ready);
        if (this.selected) this.select(this.selectedId, this.floor, false);
        adapter.setPickEnabled(this.pickEnabled);
        if (Object.keys(this.materials).length) this.applyMaterials();
        this.measureViewer = getTwinApp().viewer;
        if (step >= 4) this.offTuning = installRenderTuning(this.measureViewer, perf);
        // 场景就绪后产线处于停产状态，由“开始生产”启动。
        if (step >= 3) {
          this.line = createProductionLine(this.measureViewer, (next) => { this.flow = next; });
          this.flow = this.line.snapshot();
        }
        this.profile = lastSceneProfile();
        if (step >= 4) {
          if (this.offOverrides) this.offOverrides();
          this.offOverrides = installRenderOverrides(this.measureViewer, perf);
          adapter.invalidateEnvironment();
          if (perf.prewarm) adapter.prewarmShaders();
        }
        this.offMeasure = this.measureViewer.events.on("measurement.changed", (event) => {
          this.measuring = this.measureViewer.measurements.isActive();
          this.message = !this.measuring ? "" : !event || event.distance == null ? "依次点击两个模型表面，Esc 退出" : `距离 ${event.distance.toFixed(2)} m`;
        });
      } catch (error) { this.message = `点位未能加载：${error.message}`; }
    },
    detach() {
      this.closeCamPop();
      this.explodeView = null;
      this.thermalView = null;
      this.moldView = "";
      this.resumeMainRender();
      this.stopTour();
      this.stopReplay();
      this.stopFlyover();
      this.stopFollow();
      this.unbindPartPick();
      this.clearPartTag();
      if (this.layoutEditor) this.layoutEditor.dispose(false);
      this.layoutEditor = null;
      this.layout = null;
      this.zoneBox = null;
      this.envAlarmEntities = null;
      this.clearTourLabel();
      this.zoneId = "";
      this.card = null;
      this.disposeLayer();
      this.explode = null;
      if (this.line) this.line.dispose();
      this.line = null;
      this.flow = { ...idleLine };
      this.profile = null;
      if (this.offMeasure) this.offMeasure();
      this.offMeasure = null;
      this.endSpatialTools();
      if (this.offTuning && this.measureViewer && this.measureViewer.getState() === "ready") this.offTuning();
      this.offTuning = null;
      if (this.offOverrides && this.measureViewer && this.measureViewer.getState() === "ready") this.offOverrides();
      this.offOverrides = null;
      this.measureViewer = null;
      if (this.adapter) this.adapter.dispose();
      this.adapter = null;
      this.cutaway = [];
      this.measuring = false;
      this.walking = false;
      this.availableFloors = [];
    },
    run(action) {
      const adapter = this.adapter;
      return Promise.resolve().then(action instanceof Function ? action : () => action).catch((error) => { if (this.adapter === adapter) this.message = error.message; });
    },
    onScenePick(id, isPoi, data) {
      if (this.measuring || this.areaPicking || this.pointPick || this.layout) return;
      if (id === "xy-entity") {
        // 点选设备开关关闭时（默认），场景模型点击不做任何高亮，避免误触。
        if (!this.pickEnabled) return;
        if (data && data.type === "device") { this.showDeviceCard(data.deviceId, { focus: false }); return; }
        this.showPicked(data);
        return;
      }
      if (id.startsWith("xy-layer-")) {
        if (data && data.facility) this.focusFacilityPoint(data);
        else if (data && data.env) this.showEnvArea(data.env);
        else if (data && data.device) this.showDeviceCard(data.device, { focus: false });
        else if (data && data.zone) this.highlightZone(data.zone);
        return;
      }
      this.stopTour();
      if (id === this.campus.demoDevice.id) { this.activeId = "device"; return; }
      this.openPoint(id, isPoi);
    },
    /** 楼栋：选中并打开信息卡；监控点：在 POI 上方弹出跟随的实时视频窗。 */
    openPoint(id, isPoi = true) {
      const point = this.campus.anchors.find((x) => x.id === id);
      if (!point) return;
      if (point.kind === "camera") { this.openCamPop(point); return; }
      this.select(id, !isPoi && id === this.selectedId ? this.floor : null, true);
      this.openCard("building", id);
    },
    openCamPop(point) {
      const scenePoint = (this.scenePoints || []).find((x) => x.id === point.id) || point;
      this.closeCamPop();
      this.camPop = { id: point.id, point: scenePoint, name: point.name.replace("园区监控摄像头", "监控 "), x: -9999, y: -9999 };
      const app = getTwinApp();
      const viewer = app && app.viewer.getState() === "ready" ? app.viewer : null;
      // 点位不在画面中部时（如从视频墙 / 助手打开）镜头先对准该监控点。
      if (viewer && this.adapter) {
        const s = viewer.coordinates.worldToScreen(scenePoint.position);
        const rect = viewer.extensions.canvas.getBoundingClientRect();
        if (!s || !s.visible || s.x < rect.width * 0.25 || s.x > rect.width * 0.75 || s.y < 200 || s.y > rect.height - 160) {
          this.releaseMotionCamera();
          this.run(this.adapter.focus(scenePoint));
        }
      }
      const step = () => {
        if (!this.camPop || !viewer || viewer.getState() !== "ready") return;
        const p = viewer.coordinates.worldToScreen(this.camPop.point.position);
        const rect = viewer.extensions.canvas.getBoundingClientRect();
        if (p && p.visible) { this.camPop.x = Math.round(rect.left + p.x); this.camPop.y = Math.round(rect.top + p.y); } else { this.camPop.x = -9999; }
        this.camRaf = requestAnimationFrame(step);
      };
      this.camRaf = requestAnimationFrame(step);
    },
    closeCamPop() { cancelAnimationFrame(this.camRaf); this.camPop = null; },
    openCard(type, id = "") {
      if (this.layout && type !== "layout") return;
      if (type !== "device" && this.explode) this.collapseDevice();
      if (type !== "part") this.clearPickHighlight();
      this.clearPartTag();
      this.card = { type, id };
    },
    closeCard() {
      const card = this.card;
      this.card = null;
      if (!card) return;
      if (card.type === "device") { this.collapseDevice(); this.stopFollow(); if (this.adapter) { this.adapter.clearFocusFrame(); this.adapter.clearOutline("xy-locate"); } }
      if (card.type === "part") this.clearPickHighlight();
      if (card.type === "building" || card.type === "camera") this.clearPoint();
    },
    clearPickHighlight() { this.picked = null; if (this.adapter) { this.adapter.select(null); this.adapter.clearOutline("xy-pick"); } },
    statusTone: (s) => ({ 运行: "ok", 正常: "ok", 告警: "warn", 换模: "info", 故障: "bad" }[s] || ""),
    healthTone: (score) => healthTier(score).tone,
    healthLevel: (score) => healthTier(score).level,
    lvTone: (l) => ({ 紧急: "bad", 预警: "warn", 提示: "info" }[l] || ""),
    minuteOf: (t) => { const [h, m] = String(t).split(":").map(Number); return h * 60 + m; },
    thermalOf: (id) => thermalDevices.some((x) => x.id === id),
    moldOf: (id) => moldSims.some((x) => x.id === id),
    toggleUiMotion() {
      this.uiMotion = !this.uiMotion;
      window.localStorage.setItem(UI_MOTION_KEY, this.uiMotion ? "on" : "off");
    },
    cutRow(id) { return this.cutRows.find((r) => r.id === id) || { on: 0, layers: [] }; },
    camNo: (point) => Number(String(point.id).replace(/\D+/g, "")) || 1,
    rtspUrl() { return this.videoConf.source; },
    // 视频地址默认走页面同源代理（tools/deploy/xy-server.js 或 vue.config 开发代理），客户端只需访问页面端口；
    // 也可在 config.json cases.xy.video.base 指定网关地址（如 http://10.0.0.5:8889 不推荐，需额外开放端口）。
    whepUrl(point) { const v = this.videoConf; return `${v.webrtcBase || "/xy-video/webrtc"}/cam${this.camNo(point)}/whep`; },
    hlsUrl(point) { const v = this.videoConf; return `${v.hlsBase || "/xy-video/hls"}/cam${this.camNo(point)}/index.m3u8`; },
    setModule(id) { this.stopTour(); this.activeId = moduleAlias[id] || id; },
    /** 切换业务模块：镜头飞到该模块关注的区域，并清理上一个模块的场景高亮。 */
    flyModule(id) {
      this.zoneId = "";
      this.clearZoneBox();
      this.clearTask();
      this.clearFacilityPois();
      this.envOn = "";
      this.areaOn = ""; this.facilityId = "";
      if (this.adapter) { this.adapter.clearTint("xy-zone"); this.adapter.clearTint("xy-group"); this.adapter.clearTint("xy-status"); this.adapter.clearOutline("xy-status"); this.adapter.clearOutline("xy-facility"); this.adapter.clearOutline("xy-area"); }
      // 应急安防：默认显示监控点位；离开时恢复为不显示（用户在 POI 显隐中手动打开的除外）。
      if (this.adapter && id === "safety" && !this.showCameras) { this.camerasBySafety = true; this.setPoiGroup("camera", true); }
      else if (this.adapter && id !== "safety" && this.camerasBySafety) { this.camerasBySafety = false; if (this.showCameras) this.setPoiGroup("camera", false); }
      if (this.skipModuleFly) { this.skipModuleFly = false; return; }
      if (!this.adapter) return;
      if (this.layout) this.cancelLayout();
      if (this.card && ["building", "camera", "part", "device", "cutaway", "env"].includes(this.card.type)) this.closeCard();
      this.closeCamPop();
      this.releaseMotionCamera();
      this.stopFollow();
      const view = moduleViews[id];
      const adapter = this.adapter;
      // 离开模块时关闭该模块的专题（布局规划、图层、回放）。
      if (this.layerId && !this.layerOwnedBy(id, this.layerId)) { const ctl = this.layerCtl; this.disposeLayer(); if (ctl) Promise.resolve(ctl.dispose()).catch(() => {}); }
      if (this.replay.active) this.stopReplay();
      // 默认拆楼：仓储看整栋库区楼内部；设备看生产楼 1F 车间（整栋拆开、保留 1F）。
      const cut = MODULE_CUTAWAY[id];
      // 切模块统一回到该模块的默认拆楼状态（无定义则复原），避免上一个模块 / 区域查看的拆楼残留。
      this.setCutawayTo(cut || [], "模块切换");
      this.lastModule = id;
      if (id === "energy") this.showEnvAlarms(); else this.clearEnvAlarms();
      // 智能生产默认加载生产管线（自带镜头）。
      if (id === "production" && this.layerId !== "pipeline") { this.run(async () => { await this.leaveWalk(); await this.openLayer("pipeline"); }); return; }
      this.run(async () => { await this.leaveWalk(); if (this.adapter !== adapter) return; if (view) await adapter.flyTo(view, 1100); else await adapter.reset(); });
    },
    /** 车间环境：每个监测区域用地面高亮区（HighlightArea：区内着色 + 轮廓线，无立面，不会出现透视歪斜）标出，达标绿色、超限红色。 */
    async showEnvAlarms() {
      const adapter = this.adapter;
      if (!adapter || this.envAlarmEntities) return;
      this.envAlarmEntities = [];
      const BUILDING_ANGLE = (-2.3 * Math.PI) / 180;
      const rc = Math.cos(BUILDING_ANGLE), rs = Math.sin(BUILDING_ANGLE);
      const items = d.envPoints.filter((p) => p.area).map((p) => {
        const [x0, z0, x1, z1] = p.area;
        const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
        // 楼体与货架同样绕竖轴约 -2.3° 摆放：区域矩形按楼体方向旋转，轮廓与墙线平行。
        const rot = ([x, z]) => [cx + (x - cx) * rc - (z - cz) * rs, cz + (x - cx) * rs + (z - cz) * rc];
        const y0 = p.building === "warehouse" ? 13.75 : 13.8;
        const c = p.ok ? "4ade80" : "ff4d4f";
        return { type: "HighlightArea", entityName: p.ok ? "XY环境达标区" : "XY环境告警区", customId: `xy-env-${p.name}`, polygon2D: { coordinates: [[[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(rot)], coordZ: y0 },
          highlightAreaStyle: { interiorColor: `${c}${p.ok ? "26" : "4a"}`, exteriorColor: "00000000", exteriorOutlineColor: `${c}ff` } };
      });
      if (!items.length) return;
      const list = (await adapter.addCoverings(items)).filter(Boolean);
      if (this.adapter !== adapter || this.activeId !== "energy" || !this.envAlarmEntities) { adapter.removeEntities(list); return; }
      this.envAlarmEntities = list;
      // 区域标注：与工厂介绍相同的悬浮解说卡（落点 + 引线 + 卡片），小字号；点击卡片打开区域环境详情。
      const viewer = this.measureViewer;
      if (viewer) {
        this.offEnvLabels = showSpotLabels(viewer, d.envPoints.filter((p) => p.area).map((p) => ({
          position: [(p.area[0] + p.area[2]) / 2, p.building === "warehouse" ? 13.8 : 13.9, (p.area[1] + p.area[3]) / 2], lift: 3.2, size: 17,
          title: `${p.ok ? "" : "⚠ "}${p.name}`, sub: `${p.temp}°C · ${p.hum}%RH${p.ok ? "" : " · 超限"}`, accent: p.ok ? "#4ade80" : "#ff4d4f", maxWidth: 220, env: p.name,
        })), { key: "xy.env-spots", onClick: (e) => this.showEnvArea(e.env) });
      }
    },
    /** 车间环境条目：近景聚焦该区域并打开区域环境详情卡（温湿度、压差、洁净度、判定依据与关联设备）。 */
    showEnvArea(name) {
      this.envOn = name;
      if (!name) { if (this.card && this.card.type === "env") this.card = null; return; }
      const p = d.envPoints.find((x) => x.name === name);
      if (!p || !this.adapter) return;
      this.openCard("env", name);
      if (!p.area) return;
      const [x0, z0, x1, z1] = p.area;
      const cx = (x0 + x1) / 2; const cz = (z0 + z1) / 2;
      const span = Math.max(x1 - x0, (z1 - z0) * 1.6, 10);
      this.setCutawayTo([...new Set([...this.cutaway, p.building])], "车间环境");
      // 近景：区域斜上方、俯角约 55°，距离按区域尺寸取 0.8 倍，区域占满画面中部。
      this.run(this.adapter.flyTo({ id: `xy-env-${d.envPoints.indexOf(p)}`, name, position: [cx, 13.8 + span * 1.3 + 8, cz + span * 0.9 + 6], target: [cx, 13.8, cz] }, 900));
    },
    clearEnvAlarms() {
      if (this.offEnvLabels) { this.offEnvLabels(); this.offEnvLabels = null; }
      const list = this.envAlarmEntities || [];
      this.envAlarmEntities = null;
      if (list.length && this.adapter) this.adapter.removeEntities(list);
    },
    /** 库区占用：在立体库货架上用半透明体块高亮该库区，镜头对准。 */
    async highlightZone(zoneId) {
      if (!this.adapter) return;
      const adapter = this.adapter;
      if (this.zoneId === zoneId) { this.zoneId = ""; await this.clearZoneBox(); return; }
      this.zoneId = zoneId;
      await this.clearZoneBox();
      const z = warehouseZones(catalog.regions.racks).find((x) => x.id === zoneId);
      if (!z) return;
      const rate = d.helpers.pct(z.used, z.slots);
      const color = rate >= 85 ? "ff5a4f" : rate >= 75 ? "f5c451" : "3ee6d4";
      const [box, ...labels] = await adapter.addCoverings([{ type: "Range", entityName: "XY库区高亮", polygon2D: { coordinates: [z.corners], coordZ: z.box.min[1] },
        rangeStyle: { type: "box_solid", height: (z.box.max[1] - z.box.min[1]) * (z.used / z.slots), color: `${color}ff`, fillAreaType: "solid", fillAreaColor: `${color}40`, strokeWeight: 0.25 } },
      // 3D 文字（公共接口 Text3D）：库区名、占用率、库位数，立在库区顶部朝向相机。
      { type: "Text3D", entityName: "XY库区标注", location: [(z.box.min[0] + z.box.max[0]) / 2, z.box.max[1] + 3.2, (z.box.min[2] + z.box.max[2]) / 2], scale3d: [2.2, 2.2, 2.2],
        text3DStyle: { text: `${z.name} ${rate}%`, color: `${color}ff`, type: "technology", outline: 0.4, faceToCamera: true } },
      { type: "Text3D", entityName: "XY库区标注", location: [(z.box.min[0] + z.box.max[0]) / 2, z.box.max[1] + 1.2, (z.box.min[2] + z.box.max[2]) / 2], scale3d: [1.3, 1.3, 1.3],
        text3DStyle: { text: `已用 ${z.used} / ${z.slots} 位 · 空 ${z.slots - z.used}`, color: "e2e8f0ff", type: "plain", outline: 0.3, faceToCamera: true } }]);
      if (this.adapter !== adapter || this.zoneId !== zoneId) { adapter.removeEntities([box, ...labels].filter(Boolean)); return; }
      this.zoneBox = box;
      this.zoneLabels = labels;
      this.setCutawayTo([...new Set([...this.cutaway, "warehouse"])], "库区查看");
      this.message = `${z.name} · 已占用 ${z.used}/${z.slots}（${rate}%）· ${z.note}`;
      const cx = (z.box.min[0] + z.box.max[0]) / 2; const cz = (z.box.min[2] + z.box.max[2]) / 2;
      this.run(adapter.flyTo({ id: `xy-zone-${zoneId}`, name: z.name, position: [cx + 4, 78, cz + 46], target: [cx, 16, cz - 2] }, 900));
    },
    async clearZoneBox() {
      const list = [this.zoneBox, ...(this.zoneLabels || [])].filter(Boolean);
      this.zoneBox = null;
      this.zoneLabels = null;
      if (list.length && this.adapter) await this.adapter.removeEntities(list);
    },
    /** 设备分类：该类设备在场景中统一着色，镜头框住整组。 */
    highlightGroup(group) {
      if (!this.adapter) return;
      this.adapter.clearTint("xy-group");
      if (!group) { this.message = ""; return; }
      const list = this.ledger.filter((x) => x.group === group);
      this.adapter.tint("xy-group", list.map((x) => ({ ref: this.adapter.deviceRef(x.id), color: "#38bdf8" })), 1);
      const items = list.map((x) => catalog.devices.find((c) => c.id === x.id)).filter(Boolean);
      if (!items.length) return;
      const min = [0, 1, 2].map((k) => Math.min(...items.map((i) => i.min[k])));
      const max = [0, 1, 2].map((k) => Math.max(...items.map((i) => i.max[k])));
      const c = min.map((v, k) => (v + max[k]) / 2);
      const span = Math.max(max[0] - min[0], max[2] - min[2], 8);
      const g = d.deviceGroups.find((x) => x.id === group);
      this.message = `${g ? g.name : group} · ${list.length} 台已高亮`;
      this.run(this.adapter.flyTo({ id: `xy-group-${group}`, name: group, position: [c[0] + span * 0.55, c[1] + span * 0.75, c[2] + span * 0.9], target: c }, 900));
    },
    /** 工序产出：点击后正俯视对应区域（镜头位于区域正上方，俯视角约 85°，屏幕上方朝北）。 */
    viewArea(key) {
      if (!this.adapter) return;
      const boxOf = (ids) => {
        const items = ids.map((id) => catalog.devices.find((x) => x.id === id)).filter(Boolean);
        return { min: [0, 1, 2].map((k) => Math.min(...items.map((i) => i.min[k]))), max: [0, 1, 2].map((k) => Math.max(...items.map((i) => i.max[k]))) };
      };
      const molders = (re) => this.ledger.filter((x) => re.test(x.id)).map((x) => x.id);
      const areas = {
        "mold-barrel": { name: "注塑 · 针筒（FANUC 机群）", box: boxOf(molders(/^ZSJ-(F|A|B)/)), cut: ["production"] },
        "mold-cap": { name: "注塑 · 针帽（ZHAFIR 机群）", box: boxOf(molders(/^ZSJ-Z/)), cut: ["production"] },
        ZZXA: { name: "组装线 A", box: boxOf(["ZZXA", "ZJXB-C", "ZJXB-E"]), cut: ["production"] },
        ZZXB: { name: "组装线 B", box: boxOf(["ZZXB"]), cut: ["production"] },
        packing: { name: "打包装箱", box: boxOf(["ZZXB", "TSJ-01"]), cut: ["production"] },
        palletize: { name: "码垛入库", box: boxOf(["JXB-A", "JXB-B", "ZYJ-01", "ZYJ-02"]), cut: ["warehouse"] },
      };
      const a = areas[key];
      if (!a) return;
      if (this.areaOn === key) { this.areaOn = ""; this.adapter.clearOutline("xy-area"); return; }
      this.areaOn = key;
      this.releaseMotionCamera();
      this.stopTour();
      this.setCutawayTo([...new Set([...this.cutaway, ...a.cut])], "工序查看");
      const c = [0, 1, 2].map((k) => (a.box.min[k] + a.box.max[k]) / 2);
      const span = Math.max(a.box.max[0] - a.box.min[0], (a.box.max[2] - a.box.min[2]) * 1.8, 10);
      // 竖直 FOV 约 45°：高度 ≈ 跨度 × 1.25 可完整框住；z 方向留极小偏移避免相机 up 向量与视线共线。
      const h = span * 1.25;
      const ids = key.startsWith("mold-") ? molders(key === "mold-barrel" ? /^ZSJ-(F|A|B)/ : /^ZSJ-Z/) : null;
      this.adapter.outline("xy-area", (ids || []).map((id) => this.adapter.deviceRef(id)).filter(Boolean), { color: "#3ee6d4", hiddenColor: "#1f7f78", glow: 0.5 });
      this.message = `${a.name} · 正俯视`;
      const adapter = this.adapter;
      this.run(async () => { await this.leaveWalk(); await adapter.flyTo({ id: `xy-area-top-${key}`, name: a.name, position: [c[0], c[1] + h, c[2] + h * 0.08], target: [c[0], c[1], c[2]] }, 900); });
    },
    /**
     * 立库任务回放（与场景强联动）：库区楼拆开 → 全程路径（物流流向箭头）+ 目标库位体块 + 站点标签；
     * 随后镜头逐站运镜（每站 2.6 s），当前站设备描边脉冲、面板路径节点同步点亮，末站对准目标库位。
     */
    async showTask(id) {
      const adapter = this.adapter;
      await this.clearTask();
      if (!id) { this.message = ""; return; }
      this.taskId = id;
      const task = d.stockTasks.find((t) => t.id === id);
      if (!task || !adapter) return;
      this.releaseMotionCamera();
      this.setCutawayTo([...new Set([...this.cutaway, "production", "warehouse"])], "立库任务");
      const zone = warehouseZones(catalog.regions.racks).find((z) => z.id === task.zone);
      const racks = catalog.regions.racks;
      const dev = (k) => catalog.devices.find((x) => x.id === k);
      // 目标库位：按列号在库区长度方向上插值，按层号在货架高度方向上插值。
      const [p0, p1] = [zone.corners[0], zone.corners[1]];
      const cols = { RM: [1, 30], PK: [31, 50], FG: [30, 90], EP: [91, 100] }[task.zone] || [1, 100];
      const k = Math.min(1, Math.max(0, (task.col - cols[0]) / (cols[1] - cols[0])));
      const aisleZ = -55.8;
      const slot = [p0[0] + (p1[0] - p0[0]) * k, racks.min[1] + 1.2 + (task.level - 1) * 2.4, (p0[1] + p1[1]) / 2];
      const stations = {
        打包区: { at: [60, 15, 6], device: "ZZXB" }, 收货口: { at: [96, 20.5, -38] }, 提升机: { at: dev("TSJ-02").center, device: "TSJ-02" },
        转运机: { at: dev("ZYJ-02").center, device: "ZYJ-02" }, 堆垛机巷道: { at: [slot[0] + 8, 20.5, aisleZ], device: "DDJ-01" }, 库位: { at: slot }, 注塑供料: { at: dev("ZYGL-01").center, device: "ZYGL-01" },
      };
      const stops = task.path.map((n) => ({ name: n, ...stations[n] })).filter((s) => s.at);
      const pts = stops.map((s) => [s.at[0], s.at[1] + 0.6, s.at[2]]);
      const color = { 成品入库: "4ade80", 原料入库: "38bdf8", 原料出库: "f5c451" }[task.type] || "38bdf8";
      const list = await adapter.addCoverings([
        { type: "Path", entityName: "XY立库任务路径", polyline: { coordinates: pts }, pathStyle: { preset: "logistics_flow", color: `${color}ff`, width: 1.1, speedupFactor: 1.4 } },
        { type: "Range", entityName: "XY立库目标库位", polygon2D: { coordinates: [[[slot[0] - 0.8, slot[2] - 0.8], [slot[0] + 0.8, slot[2] - 0.8], [slot[0] + 0.8, slot[2] + 0.8], [slot[0] - 0.8, slot[2] + 0.8]]], coordZ: slot[1] - 0.6 },
          rangeStyle: { type: "box_solid", height: 1.2, color: `${color}ff`, fillAreaType: "solid", fillAreaColor: `${color}88`, strokeWeight: 0.12 } },
      ]);
      const pois = await adapter.addLayerPois(stops.map((s, i) => ({ customId: `xy-layer-task-${task.id}-${i}`, location: [s.at[0], s.at[1] + (s.name === "库位" ? 1.6 : 2.2), s.at[2]], label: `${i + 1} ${s.name === "库位" ? task.to.replace(/^.*区 /, "") : s.name}`, customData: { task: task.id, stop: i } })));
      if (this.taskId !== id || this.adapter !== adapter) { adapter.removeEntities([...list, ...pois].filter(Boolean)); return; }
      this.taskEntities = [...list, ...pois].filter(Boolean);
      this.message = `${task.type} ${task.id} · ${task.from} → ${task.to} · ${task.device} · ${task.state}`;
      // 先俯视全程（1.6 s），再逐站运镜。
      const xs = pts.map((p) => p[0]); const zs = pts.map((p) => p[2]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2; const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
      const span = Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...zs) - Math.min(...zs)) * 1.8, 30);
      const token = (this.taskToken = {});
      const alive = () => this.taskToken === token && this.adapter === adapter;
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      this.taskStep = -1;
      await adapter.flyTo({ id: `xy-task-${task.id}`, name: task.id, position: [cx, 18 + span * 1.1, cz + span * 0.18], target: [cx, 18, cz] }, 900).catch(() => {});
      await wait(1200);
      for (let i = 0; i < stops.length && alive(); i++) {
        const s = stops[i];
        this.taskStep = i;
        adapter.clearOutline("xy-task-stop");
        if (s.device) adapter.outline("xy-task-stop", [adapter.deviceRef(s.device)].filter(Boolean), { color: `#${color}`, hiddenColor: `#${color}`, glow: 0.8, pulseMs: 900 });
        const [x, y, z] = s.at;
        const near = s.name === "库位" ? { position: [x + 9, y + 3, aisleZ], target: [x, y, z] } : { position: [x + 10, y + 9, z + 12], target: [x, y, z] };
        this.message = `${task.id} · 第 ${i + 1}/${stops.length} 站 · ${s.name === "库位" ? task.to : s.name}`;
        await adapter.flyTo({ id: `xy-task-stop-${i}`, name: s.name, ...near }, 1100).catch(() => {});
        await wait(1500);
      }
      if (alive()) { this.taskStep = stops.length; adapter.clearOutline("xy-task-stop"); this.message = `${task.id} 回放结束 · ${task.state} · 目标 ${task.to}`; }
    },
    async clearTask() {
      const list = this.taskEntities || [];
      this.taskEntities = null;
      this.taskToken = null;
      this.taskId = "";
      this.taskStep = -1;
      if (this.adapter) this.adapter.clearOutline("xy-task-stop");
      if (list.length && this.adapter) await this.adapter.removeEntities(list);
    },
    /** 设备健康统计：点击状态卡，场景中该状态设备按状态色着色（与标签、健康色卡同色）。 */
    highlightStatus(status) {
      if (!this.adapter) return;
      this.adapter.clearTint("xy-status");
      this.adapter.clearOutline("xy-status");
      if (!status || status === "全部") { this.message = ""; return; }
      const color = { 运行: "#4ade80", 告警: "#f5c451", 故障: "#ff5a4f", "待机/换模": "#6f9bff" }[status];
      const list = this.ledger.filter((x) => (status === "待机/换模" ? ["待机", "换模"].includes(x.status) : x.status === status));
      this.adapter.tint("xy-status", list.map((x) => ({ ref: this.adapter.deviceRef(x.id), color })), 2);
      if (status !== "运行") this.adapter.outline("xy-status", list.map((x) => this.adapter.deviceRef(x.id)).filter(Boolean), { color, hiddenColor: color, glow: 0.6, pulseMs: status === "故障" ? 1100 : undefined });
      this.message = `${status} · ${list.length} 台已在场景中着色`;
    },
    /** 消防设施：拆到设施所在楼层，场景中为该类每一个设施立 POI（名称 + 序号），点击 POI 聚焦到该设施近景。 */
    async focusFacility(id) {
      const adapter = this.adapter;
      if (!adapter) return;
      adapter.clearOutline("xy-facility");
      await this.clearFacilityPois();
      this.facilityId = id;
      const f = d.fireList.find((x) => x.id === id);
      if (!f) { this.message = ""; return; }
      const item = catalog.facilities.find((x) => x.nodeName === f.node);
      if (!item) { this.message = `${f.name}：场景中未建模`; return; }
      // 1F 设施：整栋拆（保留 1F）；2F 设施：只拆 2F 以上（屋顶 / 3F、副楼），保留 2F 楼板显示设施。
      const upper = CUT_GROUPS.production.filter((g) => g.id !== "2F").map((g) => `production:${g.id}`);
      const others = this.cutaway.filter((k) => k !== "production" && !k.startsWith("production:"));
      this.setCutawayTo([...others, ...(f.floor === "1F" ? ["production"] : upper)], "消防设施");
      const nodeRef = adapter.facilityRef(item);
      if (nodeRef) adapter.outline("xy-facility", [nodeRef], { color: "#ff5a4f", hiddenColor: "#ff5a4f", glow: 0.9, pulseMs: 1200 });
      const points = adapter.facilityPoints(item);
      const short = f.name.split(" · ")[0];
      const pois = await adapter.addLayerPois(points.map((p, i) => ({ customId: `xy-layer-fire-${f.id}-${i}`, location: [p[0], p[1] + 0.8, p[2]], label: `${short} ${String(i + 1).padStart(2, "0")}`, customData: { facility: f.id, at: p, index: i } })));
      if (this.facilityId !== id || this.adapter !== adapter) { adapter.removeEntities(pois); return; }
      this.facilityPois = pois;
      const xs = points.map((p) => p[0]); const zs = points.map((p) => p[2]);
      const c = points.length ? [(Math.min(...xs) + Math.max(...xs)) / 2, item.min[1], (Math.min(...zs) + Math.max(...zs)) / 2] : item.center;
      const span = points.length ? Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...zs) - Math.min(...zs)) * 1.8, 24) : 40;
      this.message = `${f.name} · ${f.online}/${f.count} 在线 · 场景已标注 ${points.length} 处，点击点位聚焦`;
      this.run(adapter.flyTo({ id: `xy-fire-${f.id}`, name: f.name, position: [c[0], c[1] + span * 0.95, c[2] + span * 0.55], target: c }, 900));
    },
    async clearFacilityPois() {
      const list = this.facilityPois || [];
      this.facilityPois = null;
      if (list.length && this.adapter) await this.adapter.removeEntities(list);
    },
    /** 点击某个消防设施 POI：近景聚焦（斜上方 6 m）。 */
    focusFacilityPoint(data) {
      if (!this.adapter || !data || !data.at) return;
      const [x, y, z] = data.at;
      const f = d.fireList.find((i) => i.id === data.facility);
      this.message = `${f ? f.name.split(" · ")[0] : "消防设施"} ${String(data.index + 1).padStart(2, "0")} · 在线`;
      this.run(this.adapter.flyTo({ id: `xy-fire-pt-${data.facility}-${data.index}`, name: "消防设施", position: [x + 3.5, y + 4.5, z + 4.5], target: [x, y - 0.6, z] }, 800));
    },
    highlightFacility(name) {
      if (!this.adapter) return;
      const list = catalog.facilities.filter((f) => f.name === name || (name === "安全出口指示" && f.kind === "exit"));
      if (!list.length) { this.message = `${name}：场景中未建模该类设施`; return; }
      this.openPoint("production", false);
      this.pickFloor(list[0].floor);
      this.message = `${name} · 场景中 ${list.length} 组位于生产楼 ${list[0].floor}，已切到该楼层`;
    },
    openAssistant() { openAgent(); },
    toggleAssistant() { openAgent(); },
    openAlarms(id = "") { this.alarmId = id; this.alarmFilter = { level: "", state: "" }; this.dialog = { type: "alarms", title: "告警中心" }; },
    /** 设备信息卡（右上）：可选同时聚焦设备。 */
    showDeviceCard(text, { focus = true } = {}) {
      const device = this.findDevice(text);
      if (!device) { this.message = `未找到设备 ${text}`; return null; }
      if (this.explode && this.explode.deviceId !== device.id) this.collapseDevice();
      this.openCard("device", device.id);
      if (focus) this.locateDevice(device.id);
      else if (this.adapter) { this.adapter.showFocusFrame(device.id); this.adapter.outline("xy-locate", [this.adapter.deviceRef(device.id)], { color: "#3ee6d4", hiddenColor: "#1f7f78", glow: 0.6 }); }
      return device;
    },
    openCameras() {
      if (this.adapter && !this.showCameras) this.toggleCameras();
      this.videoWallSize = 6;
      this.dialog = { type: "cameras", title: `视频监控 · ${this.cameras.length} 路` };
    },
    profileOf(id) { return d.buildingProfiles[id]; },
    handleAlarm() {
      const a = this.handling;
      if (!a || !this.handleForm.user) return;
      this.handleAlarmBy(a.id, this.handleForm.user, this.handleForm.result);
      this.alarmId = "";
      this.handleForm = { user: "", result: "已修复恢复运行" };
    },
    handleAlarmBy(alarmId, user, result = "已修复恢复运行") {
      const a = this.alarmData.find((x) => x.id === alarmId);
      if (!a) return { ok: false, message: `未找到告警 ${alarmId}` };
      if (a.state !== "未处置") return { ok: false, message: `${alarmId} 已于此前处置（${a.result || a.state}）` };
      if (!user) return { ok: false, message: "请提供处置人" };
      Object.assign(a, { state: "已处置", result, user });
      return { ok: true, message: `${a.content} → 已处置（${result}，${user}）`, pending: this.alarmData.filter((x) => x.state === "未处置").length };
    },
    locate(id, level = null) {
      if (!this.campus.anchors.some((x) => x.id === id)) { this.message = "该位置暂无三维点位"; return; }
      this.stopTour();
      this.openPoint(id, true);
      if (level) this.pickFloor(level);
      if (level && !this.availableFloors.includes(level)) this.message = this.isReady ? `${level} 楼层构件未交付，已定位到整栋` : "三维场景连接后可切换楼层";
    },
    pickFloor(level) {
      if (!this.availableFloors.includes(level)) { this.message = this.isReady ? `${level} 楼层构件未交付` : "三维场景连接后可切换楼层"; return; }
      this.select(this.selectedId, level);
    },
    toolActive(id) {
      return {
        tour: this.touring, walk: this.walking, measure: this.measuring, area: Boolean(this.areaResult), coords: Boolean(this.pointPick),
        cutaway: Boolean(this.card && this.card.type === "cutaway"), pois: Boolean(this.poiHidden || this.poiHiddenKinds.length || (this.card && this.card.type === "pois")),
        pick: this.pickEnabled, assistant: this.assistantOpen,
      }[id] || false;
    },
    toolTitle(t) {
      if (t.id === "pois") return "POI 显隐：按分组显示 / 隐藏点位";
      if (t.id === "pick") return this.pickEnabled ? "点选设备已开启：点击场景中的设备高亮并查看信息" : "点选设备已关闭（默认）：点击场景模型不高亮，避免误触";
      if (t.id === "assistant") return "AI小新：一句话查询与操作场景（Alt + A）";
      if (t.id === "coords") return "取点工具：在模型表面依次单击取点，生成路线坐标并复制";
      if (t.id === "cutaway") return `拆楼控制：生产楼（保留 1F）/ 库区楼整栋拆除与恢复，当前已拆 ${this.cutaway.length} 层`;
      if (t.id === "restore") return "恢复场景初始状态：镜头、拆楼、图层、选中、测量、材质与布局全部复位";
      return t.name;
    },
    runTool(tool) {
      ({
        reset: this.reset, tour: this.toggleTour, walk: this.toggleWalk, measure: this.toggleMeasure, area: this.toggleArea, coords: this.togglePointPick,
        cutaway: () => { if (this.card && this.card.type === "cutaway") this.closeCard(); else this.openCard("cutaway"); },
        pois: () => { if (this.card && this.card.type === "pois") this.closeCard(); else this.openCard("pois"); },
        pick: () => { this.pickEnabled = !this.pickEnabled; if (this.adapter) this.adapter.setPickEnabled(this.pickEnabled); if (!this.pickEnabled) this.clearPickHighlight(); this.message = this.pickEnabled ? "点选设备已开启：点击设备高亮并打开信息卡" : "点选设备已关闭"; },
        assistant: () => openAgent(),
        restore: this.restoreScene,
      })[tool.id]();
    },
    /** 模块面板中的专题功能。 */
    layerOwnedBy(module, id) { return (moduleLayersMap[module] || []).some((x) => x.id === id); },
    runModuleLayer(id, option = {}) {
      if (id === "layout") { if (this.layout) return this.finishLayout(); if (this.layerId) this.closeLayer(); return this.startLayout(); }
      if (id === "replay") return this.replay.active ? this.stopReplay() : this.startReplay();
      if (this.layerId === id && JSON.stringify(option) === JSON.stringify(this.layerOption)) return this.closeLayer();
      return this.openLayer(id, option);
    },
    /** 面板中点击楼栋 / 区域：自动拆楼并聚焦到对应区域（楼栋无拆楼定义时飞到楼栋）。 */
    locateArea(id) {
      const area = AREA_VIEWS[id];
      if (!area || !this.adapter) { this.locate(id); return; }
      this.stopTour();
      this.releaseMotionCamera();
      this.setCutawayTo([...new Set([...this.cutaway, ...area.cut])], "区域查看");
      this.selectedId = id;
      this.openCard("building", id);
      const adapter = this.adapter;
      this.message = `${this.buildingNames[id] || id} · 已拆开${id === "production" ? "（保留 1F）" : ""}并聚焦`;
      this.run(async () => { await this.leaveWalk(); await adapter.flyTo({ id: `xy-area-${id}`, name: this.buildingNames[id] || id, ...area.view }, 900); });
    },
    onKey(event) {
      if (event.key !== "Escape") return;
      if (this.explodeView) this.explodeView = null;
      else if (this.dialog) this.dialog = null;
      else if (this.camPop) this.closeCamPop();
      else if (this.replay.active) this.stopReplay();
      else if (this.card && this.card.type !== "layout") this.closeCard();
    },
    clearPoint() {
      this.selectedId = "";
      this.floor = null;
      this.availableFloors = [];
      if (this.adapter) this.adapter.applyFloor(null, null);
    },
    select(id, level = null, move = true) {
      const point = this.campus.anchors.find((item) => item.id === id);
      if (!point) return;
      this.selectedId = id;
      this.availableFloors = this.adapter ? (floors[id] || []).filter((item) => this.adapter.hasFloor(id, item)) : [];
      this.floor = this.availableFloors.includes(level) ? level : null;
      this.message = "";
      if (this.adapter) {
        this.adapter.applyFloor(id, this.floor);
        const adapter = this.adapter;
        const floor = this.floor;
        if (move) this.releaseMotionCamera();
        if (move) this.run(async () => {
          if (this.adapter !== adapter) return;
          await this.leaveWalk();
          if (this.adapter === adapter && this.selectedId === id && this.floor === floor) await adapter.focus(this.scenePoints.find((item) => item.id === id), floor);
        });
      }
    },
    reset() {
      this.stopTour();
      this.stopReplay();
      this.releaseMotionCamera();
      this.selectedId = "";
      this.floor = null;
      this.message = "";
      this.endSpatialTools();
      if (this.adapter) this.adapter.clearOutline("xy-locate");
      if (this.adapter) this.run(async () => { const adapter = this.adapter; await this.leaveWalk(); if (adapter && this.adapter === adapter) await adapter.reset(); });
    },
    toggleCameras() {
      if (!this.adapter) return;
      this.showCameras = !this.showCameras;
      this.run(this.adapter.filterCameras(this.showCameras));
    },
    toggleMeasure() {
      this.stopTour();
      this.releaseMotionCamera();
      if (!this.measureViewer) return;
      this.clearArea();
      this.endPointPick();
      const measure = this.measureViewer.measurements;
      if (measure.isActive()) measure.end(); else measure.start();
      this.measuring = measure.isActive();
      this.message = this.measuring ? "依次点击两个模型表面，Esc 退出" : "";
    },
    endSpatialTools() {
      const viewer = this.measureViewer;
      this.clearArea();
      this.endPointPick();
      if (viewer && viewer.getState() === "ready") {
        if (viewer.measurements.isActive()) viewer.measurements.end();
      }
      this.measuring = false;
    },
    toggleArea() {
      const viewer = this.measureViewer;
      if (!viewer) return;
      this.stopTour();
      if (this.areaResult) { this.clearArea(); return; }
      this.endSpatialTools();
      this.releaseMotionCamera();
      this.message = "";
      this.run(async () => {
        await this.leaveWalk();
        if (viewer !== this.measureViewer || this.areaTool || this.measuring || this.touring || this.walking) return;
        const canvas = document.querySelector("#player canvas");
        if (!canvas) return;
        this.areaTool = startAreaMeasurement(viewer, canvas, (result) => {
          this.areaResult = result;
          if (!result) this.areaTool = null;
        });
      });
    },
    clearArea() {
      if (this.areaTool) this.areaTool.cancel();
    },
    togglePointPick() {
      const viewer = this.measureViewer;
      if (!viewer) return;
      this.stopTour();
      if (this.pointPick) { this.endPointPick(); return; }
      this.endSpatialTools();
      this.releaseMotionCamera();
      this.message = "";
      this.run(async () => {
        await this.leaveWalk();
        if (viewer !== this.measureViewer || this.pointTool || this.touring) return;
        const canvas = document.querySelector("#player canvas");
        if (!canvas) return;
        this.pointCopied = false;
        this.pointTool = startPointPicker(viewer, canvas, (state) => {
          this.pointPick = state;
          this.pointCopied = false;
          if (!state) this.pointTool = null;
        });
      });
    },
    endPointPick() { if (this.pointTool) this.pointTool.cancel(); },
    pointText() { return this.pointPick ? formatPoints(this.pointPick.points) : ""; },
    async copyPoints() {
      const text = this.pointText();
      if (!text) return;
      try { await navigator.clipboard.writeText(text); }
      catch (error) {
        // 局域网 http 页面没有 Clipboard API：退回到 textarea + execCommand。
        const area = document.createElement("textarea");
        area.value = text; area.style.position = "fixed"; area.style.opacity = "0";
        document.body.appendChild(area); area.select();
        try { document.execCommand("copy"); } finally { area.remove(); }
      }
      this.pointCopied = true;
      console.info("[xy-picker] 路线坐标", text);
    },
    async leaveWalk() {
      if (!this.walking || !this.measureViewer) return;
      this.walking = false;
      await this.measureViewer.camera.setMode({ mode: "RTS", durationMs: 0 });
    },
    toggleWalk() {
      const viewer = this.measureViewer;
      if (!viewer) return;
      this.stopTour();
      this.endSpatialTools();
      if (!this.walking) this.releaseMotionCamera();
      this.run(async () => {
        if (this.walking) { await this.leaveWalk(); this.message = ""; return; }
        await viewer.camera.setMode({ mode: "FPS", durationMs: 0 });
        if (this.measureViewer !== viewer) return;
        this.walking = true;
        this.message = "自由漫游 · WASD 移动，Q / E 升降";
      });
    },
    /** 工厂介绍：按剧本从厂外建筑 → 生产楼设备 → 智造线 → 仓储逐步讲解（镜头、拆楼、描边、解说）。 */
    toggleTour() {
      if (this.touring) { this.stopTour(); return; }
      if (!this.adapter) return;
      this.endSpatialTools();
      this.releaseMotionCamera();
      this.closeCard();
      this.touring = true;
      this.tourPaused = false;
      this.tourCutRestore = this.cutaway.slice();
      this.playTourStep(0);
    },
    playTourStep(index) {
      clearTimeout(this.tourTimer);
      if (!this.touring || !this.adapter) return;
      if (index >= tourScript.length) { this.stopTour(); this.reset(); this.message = "工厂介绍结束"; return; }
      const step = tourScript[index];
      const adapter = this.adapter;
      this.tourStep = { index, total: tourScript.length, ...step, chapterName: (TOUR_CHAPTERS.find((c) => c.id === step.chapter) || {}).name };
      this.setCutawayTo(step.cut || [], "工厂介绍");
      adapter.clearOutline("xy-tour");
      adapter.clearFocusFrame();
      const go = () => {
        if (step.kind === "device") {
          adapter.outline("xy-tour", [adapter.deviceRef(step.id)], { color: "#3ee6d4", hiddenColor: "#1f7f78", glow: 0.6 });
          adapter.showFocusFrame(step.id);
          return adapter.focusDevice(step.id);
        }
        if (step.kind === "building") {
          const point = (this.scenePoints || []).find((p) => p.id === step.id);
          return point ? adapter.focus(point) : Promise.resolve();
        }
        return adapter.flyTo({ id: `xy-tour-${index}`, name: step.title, ...step.view }, 1600);
      };
      this.run(async () => { await this.leaveWalk(); await go(); });
      this.showTourLabel(step, index);
      if (!this.tourPaused) this.tourTimer = setTimeout(() => this.playTourStep(index + 1), step.hold + 1200);
    },
    toggleTourPause() {
      if (!this.tourStep) return;
      this.tourPaused = !this.tourPaused;
      clearTimeout(this.tourTimer);
      if (!this.tourPaused) this.tourTimer = setTimeout(() => this.playTourStep(this.tourStep.index + 1), 1500);
    },
    /** 场景内解说：与灯塔工厂总览讲解同一形式——讲解对象上方的落点 + 引线 + 悬浮卡片（标题 + 分行解说），每站替换。 */
    async showTourLabel(step, index) {
      this.clearTourLabel();
      const viewer = this.measureViewer;
      if (!viewer || !this.adapter) return;
      let anchor; let lift = 1.5;
      if (step.kind === "device") {
        const item = catalog.devices.find((x) => x.id === step.id);
        if (item) { anchor = [(item.min[0] + item.max[0]) / 2, item.max[1], (item.min[2] + item.max[2]) / 2]; lift = 0.5; }
      } else if (step.kind === "building") {
        const p = (this.scenePoints || []).find((x) => x.id === step.id);
        if (p) { anchor = p.position.slice(); lift = 6; }
      } else if (step.view) {
        anchor = step.view.target.slice();
        lift = Math.max(2, Math.hypot(...step.view.position.map((x, i) => x - step.view.target[i])) / 40);
      }
      if (!anchor) return;
      const chapter = (TOUR_CHAPTERS.find((c) => c.id === step.chapter) || {}).name;
      this.offTourLabel = showSpotLabels(viewer, [{ position: anchor, lift, primary: true, index: `${index + 1}/${tourScript.length}`, title: `${chapter ? `${chapter} · ` : ""}${step.title}`, sub: step.text, accent: "#3ee6d4" }], { avoid: () => (this.adapter ? this.adapter.occlusion.shownPositions() : []) });
    },
    clearTourLabel() {
      if (this.offTourLabel) this.offTourLabel();
      this.offTourLabel = null;
    },
    tourJump(delta) { if (this.touring && this.tourStep) this.playTourStep(Math.max(0, Math.min(tourScript.length - 1, this.tourStep.index + delta))); },
    stopTour() {
      clearTimeout(this.tourTimer);
      const was = this.touring;
      this.touring = false;
      this.tourStep = null;
      this.clearTourLabel();
      if (!was) return;
      if (this.adapter) { this.adapter.clearOutline("xy-tour"); this.adapter.clearFocusFrame(); }
      if (this.tourCutRestore) this.setCutawayTo(this.tourCutRestore, "工厂介绍结束");
      this.tourCutRestore = null;
      this.message = "";
    },
    onVisibility() { if (document.hidden) this.stopTour(); },
    setLightTime(time) { if (this.adapter) this.run(() => this.adapter.setTime(time)); },
    setWeather(weather) { if (this.adapter) this.run(() => this.adapter.setWeather(weather)); },
    restoreEnvironment() {
      if (!this.adapter) return;
      // 写回场景组光照的原始参数（天空、主光、补光、雾、曝光），不重新执行配置包，不会卡顿。
      this.adapter.restoreEnvironment();
      this.message = "已恢复场景组默认光照";
    },
    retry() { emitter.emit("sceneRetry"); },

    /* ---------------- 生产线（开始 / 停止生产）/ 相机巡航 ---------------- */
    /** start/stop=开始/停止生产，speed=世界时间倍率，follow=跟随产线视角（true/false），view=查看某道工序。场景就绪时产线处于停产状态。 */
    onFlow(command, value) {
      const line = this.line;
      if (!line) { this.message = "三维场景未就绪，生产线不可用"; return { ok: false, message: this.message }; }
      if (command === "start") {
        const next = line.play();
        this.message = next.running ? "已开始生产" : (next.reason || "生产线暂不可用");
        return { ok: next.running, running: next.running };
      }
      if (command === "stop") {
        if (this.flow.follow) this.onFlow("follow", false);
        const next = line.pause();
        this.message = "已停止生产";
        return { ok: true, running: next.running };
      }
      if (command === "speed") {
        const next = line.setSpeed(value);
        this.message = `产线播放 ×${next.speed}`;
        return { ok: true, speed: next.speed };
      }
      if (command === "watch") {
        // 观察：从该工序开始流转并直接进入跟随镜头（已在跟随时只跳转工序）。
        const next = line.jump(value);
        if (!this.flow.follow) this.onFlow("follow", true);
        this.message = "";
        return { ok: true, stage: next.stage, follow: true };
      }
      if (command === "jump") {
        const next = line.jump(value);
        this.message = "";
        return { ok: true, stage: next.stage };
      }
      if (command === "follow") {
        if (value === this.flow.follow) return { ok: true, follow: value };
        if (value) {
          this.stopTour(); this.stopFlyover(); this.endSpatialTools(); this.run(() => this.leaveWalk());
          // 跟随产线：UE 机位在室内取景，恢复全部拆楼并隐藏生产管线特效；记录进入前的状态，退出时回退。
          this.followRestore = { cut: this.cutaway.slice(), vfx: this.layerId === "pipeline" };
          this.setCutawayTo([], "跟随产线");
          if (this.adapter) this.adapter.showPipelineVfx(false);
        }
        const next = line.setFollow(Boolean(value));
        if (!value) {
          this.message = "";
          const back = this.followRestore;
          this.followRestore = null;
          if (back && this.adapter) { this.setCutawayTo(back.cut, "退出跟随"); if (back.vfx) this.adapter.showPipelineVfx(true); }
        }
        return { ok: true, follow: next.follow };
      }
      if (command === "view") { if (this.flow.follow) this.onFlow("follow", false); return this.viewStage(value); }
      return { ok: false, message: `未知指令 ${command}` };
    },
    /** 不跟随时查看某道工序：拆开所在楼栋，飞到该工序机位（机位均在设备斜上方，避开货架、楼板等遮挡）。 */
    viewStage(index) {
      const stage = lineStages[index];
      if (!stage || !this.adapter) return { ok: false, message: "工序不存在或场景未就绪" };
      this.releaseMotionCamera();
      this.stopTour();
      this.stopFlyover();
      // 不拆楼：工序机位都在室内近景，屋顶不会遮挡。切模块前先标记，避免模块切换的镜头动作覆盖工位机位。
      if (this.activeId !== "production") { this.skipModuleFly = true; this.activeId = "production"; }
      this.message = `${stage.name} · ${stage.area}`;
      this.run(async () => { await this.leaveWalk(); await this.adapter.flyTo({ id: `xy-stage-${stage.id}`, name: stage.name, ...stage.view }, 900); });
      return { ok: true, stage: stage.name };
    },
    playFlyover(id) {
      if (!this.measureViewer) return { ok: false, message: "三维场景未就绪" };
      this.stopFlyover();
      this.releaseMotionCamera();
      this.stopTour();
      this.endSpatialTools();
      const viewer = this.measureViewer;
      return this.run(async () => {
        await this.leaveWalk();
        if (this.measureViewer !== viewer) return;
        const player = playFlyover(viewer, id, () => { if (this.flyoverPlayer === player) { this.flyoverPlayer = null; this.flyover = null; } });
        this.flyoverPlayer = player;
        this.flyover = player.name;
      }).then(() => ({ ok: true, flyover: this.flyover }));
    },
    stopFlyover() {
      const player = this.flyoverPlayer;
      this.flyoverPlayer = null;
      this.flyover = null;
      if (player) player.stop();
      return { ok: true };
    },
    /** 其他相机操作前：退出跟随产线视角与相机巡航（生产线本身不受影响）。 */
    releaseMotionCamera() {
      this.stopFlyover();
      if (this.line && this.flow.follow) this.onFlow("follow", false);
    },

    /* ---------------- 拆楼 / POI 遮挡 ---------------- */
    canCutaway: (id) => CUTAWAY_BUILDINGS.includes(id),
    setCutawayTo(list, by = "系统") {
      if (!this.adapter) return { ok: false, message: "三维场景未就绪" };
      const before = this.cutaway.slice();
      this.cutaway = this.adapter.setCutaway(list);
      const added = this.cutaway.filter((k) => !before.includes(k));
      const removed = before.filter((k) => !this.cutaway.includes(k));
      const label = (k) => { const [b, l] = k.split(":"); const g = (CUT_GROUPS[b] || []).find((x) => x.id === l); return `${this.buildingNames[b] || b}·${g ? g.name : l}`; };
      if (added.length) this.cutLog.unshift({ time: hhmm(), text: `拆除 ${added.map(label).join("、")}`, by });
      if (removed.length) this.cutLog.unshift({ time: hhmm(), text: `恢复 ${removed.map(label).join("、")}`, by });
      this.cutLog.splice(8);
      return { ok: true, layers: this.cutaway.map(label) };
    },
    toggleCutaway() { return this.setCutawayTo(this.cutaway.length ? [] : CUTAWAY_BUILDINGS, "手动"); },
    toggleBuildingCutaway(id) { const on = this.cutaway.some((k) => k.startsWith(`${id}:`)); return this.setCutawayTo(on ? this.cutaway.filter((k) => !k.startsWith(`${id}:`)) : [...this.cutaway, id], "手动"); },
    toggleCutLayer(key) { return this.setCutawayTo(this.cutaway.includes(key) ? this.cutaway.filter((k) => k !== key) : [...this.cutaway, key], "手动"); },
    /** 场景复位：镜头、拆楼、图层、选中、测量、材质、拆解、跟随与巡航全部回到初始状态（生产线不停）。 */
    async restoreScene() {
      this.stopTour(); this.stopReplay(); this.releaseMotionCamera(); this.stopFollow();
      if (this.layout) this.cancelLayout();
      else if (this.layoutApplied && this.measureViewer && this.adapter) { createLayoutEditor(this.measureViewer, this.adapter, () => {}).dispose(false); this.layoutApplied = false; }
      await this.collapseDevice();
      await this.closeLayer();
      await this.clearZoneBox();
      this.zoneId = "";
      this.closeCard();
      this.materials = {};
      if (this.adapter) { this.adapter.clearTint("xy-material"); this.adapter.clearTint("xy-group"); this.adapter.clearOutline("xy-locate"); this.adapter.clearFocusFrame(); }
      if (this.showCameras) this.toggleCameras();
      this.setCutawayTo([], "场景初始化");
      this.reset();
      this.message = "场景已恢复初始状态";
      return { ok: true };
    },
    clearPicked() { this.clearPickHighlight(); if (this.card && this.card.type === "part") this.card = null; },
    canExplode(id) { return EXPLODABLE.has(id); },
    /** 点击构件：消防设施 / 建筑构件信息卡（设备直接走设备卡）。 */
    showPicked(info) {
      if (!info) return;
      const b = (id) => this.buildingNames[id] || id;
      if (info.type === "facility") {
        const desc = { hydrant: "室内消火栓箱，DN65 栓口 + 25 m 水带，按 GB 50974 每月巡检", alarm: "火灾声光报警器，接入消防报警主机联动", exit: "安全出口指示，应急照明持续时间 ≥ 90 min" }[info.kind];
        this.picked = { icon: "safety", title: info.name, kind: `消防设施 · ${b("production")} ${info.floor}`, facts: [["设施类别", info.name], ["所在楼层", info.floor], ["在线状态", "在线"], ["最近巡检", "2026-11-20"]], note: desc };
      } else {
        this.picked = { icon: "building", title: partName(info.nodeName), kind: "建筑 / 场景构件", facts: [["模型节点", info.nodeName], ["所属模型", ENTITY_NAMES[info.entityId] || info.entityId]], note: "非台账资产，仅提供构件识别信息。" };
      }
      this.openCard("part");
      if (this.adapter) { this.adapter.outline("xy-pick", [info.ref], { color: "#3ee6d4", hiddenColor: "#1f7f78", glow: 0.6 }); this.adapter.select(null); }
    },
    /* ---------------- 设备布局规划 ---------------- */
    startLayout() {
      if (!this.adapter || !this.measureViewer) return { ok: false, message: "三维场景未就绪" };
      this.stopTour(); this.releaseMotionCamera(); this.stopFollow(); this.endSpatialTools();
      this.collapseDevice();
      this.closeCard();
      const adapter = this.adapter;
      this.schemes = loadSchemes();
      const names = Object.fromEntries(this.ledger.map((x) => [x.id, x.name]));
      this.layoutCutRestore = this.cutaway.slice();
      this.setCutawayTo([...new Set([...this.cutaway, "production"])], "布局规划");
      this.layoutEditor = createLayoutEditor(this.measureViewer, adapter, (s) => { this.layout = s; }, names);
      this.layout = this.layoutEditor.state();
      this.card = { type: "layout", id: "" };
      this.message = "布局规划 · 按住设备拖动；完成前镜头仍可右键平移、滚轮缩放";
      this.run(async () => { await this.leaveWalk(); await adapter.flyTo({ id: "xy-layout-view", name: "生产楼 1F 布局", position: [36, 92, 58], target: [36, 13.7, -3] }, 900); });
      return { ok: true, devices: this.layout.count };
    },
    layoutMode(mode) { if (this.layoutEditor) this.layout = this.layoutEditor.setMode(mode); },
    layoutRotate() { if (this.layoutEditor) this.layout = this.layoutEditor.rotateSelected(90); },
    layoutRestoreOne() { if (this.layoutEditor) this.layout = this.layoutEditor.restoreSelected(); },
    saveScheme() {
      if (!this.layoutEditor) return;
      const layout = this.layoutEditor.getLayout();
      const scheme = { id: Date.now(), name: this.schemeName || `方案 ${this.schemes.length + 1}`, time: hhmm(), layout };
      this.schemes = [scheme, ...this.schemes].slice(0, 12);
      saveSchemes(this.schemes);
      this.schemeName = "";
      this.message = `已保存「${scheme.name}」· ${layout.length} 台设备`;
    },
    async applyScheme(scheme) { if (this.layoutEditor) { await this.layoutEditor.applyLayout(scheme.layout); this.message = `已应用「${scheme.name}」`; } },
    deleteScheme(scheme) { this.schemes = this.schemes.filter((s) => s.id !== scheme.id); saveSchemes(this.schemes); },
    finishLayout() {
      const editor = this.layoutEditor;
      if (!editor) return { ok: true };
      const moved = editor.getLayout().length;
      editor.dispose(true);
      this.layoutEditor = null;
      this.layout = null;
      if (this.layoutCutRestore) { this.setCutawayTo(this.layoutCutRestore, "布局规划"); this.layoutCutRestore = null; }
      if (this.card && this.card.type === "layout") this.card = null;
      this.message = moved ? `布局已更新 · 调整 ${moved} 台设备（会话内有效，场景初始化即恢复原布局）` : "";
      this.layoutApplied = moved > 0;
      return { ok: true, moved };
    },
    cancelLayout() {
      const editor = this.layoutEditor;
      if (editor) editor.dispose(false);
      this.layoutEditor = null;
      this.layout = null;
      if (this.layoutCutRestore && this.adapter) { this.setCutawayTo(this.layoutCutRestore, "布局规划"); this.layoutCutRestore = null; }
      this.layoutApplied = false;
      if (this.card && this.card.type === "layout") this.card = null;
      this.message = "";
      return { ok: true };
    },
    /** POI 显隐：全部显示 / 隐藏 = 逐组设置（分组开关同步反映；监控点一并显示 / 隐藏）。 */
    setPoiVisible(visible) {
      if (!this.adapter) return { ok: false, message: "三维场景未就绪" };
      if (this.poiHidden) { this.poiHidden = false; this.adapter.occlusion.setMasked(false); }
      poiGroups.forEach((g) => this.setPoiGroup(g.id, visible));
      this.message = visible ? "POI 点位已全部显示" : "POI 点位已全部隐藏";
      return { ok: true, visible };
    },
    /** 分组当前是否显示：监控点还取决于监控点位是否已加载显示。 */
    poiGroupOn(kind) { return !this.poiHidden && !this.poiHiddenKinds.includes(kind) && (kind !== "camera" || this.showCameras); },
    /** POI 分组显隐：building / camera / device / layer。 */
    setPoiGroup(kind, visible) {
      if (!this.adapter || !poiGroups.some((g) => g.id === kind)) return { ok: false, message: `分组可选：${poiGroups.map((g) => g.id).join(" / ")}` };
      if (this.poiHidden) { this.poiHidden = false; this.adapter.occlusion.setMasked(false); }
      this.poiHiddenKinds = visible ? this.poiHiddenKinds.filter((k) => k !== kind) : [...new Set([...this.poiHiddenKinds, kind])];
      if (kind === "camera") {
        if (!visible) this.closeCamPop();
        if (visible !== this.showCameras) this.toggleCameras();
      }
      this.run(this.adapter.occlusion.setKindHidden(kind, !visible));
      const g = poiGroups.find((x) => x.id === kind);
      return { ok: true, group: g.name, visible };
    },

    /* ---------------- 设备 ---------------- */
    /** 按编号或名称查设备：ZSJ-F17 / FANUC-17 / 注塑机 FANUC-17 / 组装线A / 堆垛机。 */
    findDevice(text) {
      if (!text) return null;
      const norm = (value) => String(value).toUpperCase().replace(/\s+/g, "");
      const key = norm(text);
      const exact = this.ledger.find((x) => x.id.toUpperCase() === key);
      if (exact) return exact;
      const brand = /(FANUC|ZHAFIR)-?0*(\d+)/.exec(key);
      const byBrand = brand && this.ledger.find((x) => x.id === `ZSJ-${brand[1][0]}${two(Number(brand[2]))}`);
      if (byBrand) return byBrand;
      // FANUC-13/14 是动画机台注塑机 A/B，名称中带有对应编号。
      const name = brand ? `${brand[1]}-${Number(brand[2])}` : key;
      return this.ledger.find((x) => norm(x.name) === name)
        || this.ledger.find((x) => norm(x.name).includes(name)) || null;
    },
    async locateDevice(text) {
      const device = this.findDevice(text);
      if (!device) return { ok: false, message: `未找到设备 ${text}` };
      if (!this.adapter) { this.openCard("device", device.id); return { ok: false, message: "三维场景未就绪，已打开设备信息" }; }
      this.stopTour();
      this.releaseMotionCamera();
      this.stopFollow();
      if (!this.card || this.card.type !== "device" || this.card.id !== device.id) this.openCard("device", device.id);
      const adapter = this.adapter;
      adapter.outline("xy-locate", [adapter.deviceRef(device.id)], { color: "#3ee6d4", hiddenColor: "#1f7f78", glow: 0.6 });
      adapter.showFocusFrame(device.id);
      this.message = `已定位 ${device.name} · ${this.buildingNames[device.building] || "园区"} ${device.area}`;
      await this.run(async () => { await this.leaveWalk(); await adapter.focusDevice(device.id); });
      // 运动设备（机械臂、AGV、堆垛机、注塑机开合模）：聚焦后镜头跟随；用户旋转 / 缩放照常，平移或其他镜头操作即退出。
      if (this.adapter === adapter && adapter.isMoving(device.id) && this.card && this.card.id === device.id) this.startFollow(device.id);
      return { ok: true, message: this.message, device: this.deviceSummary(device) };
    },
    startFollow(id) {
      if (!this.adapter || !this.adapter.followDevice(id)) return;
      this.following = id;
      const canvas = document.querySelector("#player canvas");
      // 右键 / 中键拖动（平移）或双击时交还镜头，左键旋转与滚轮缩放保持跟随。
      const stop = (event) => { if (event.type === "dblclick" || event.button === 2 || event.button === 1) this.stopFollow(); };
      if (canvas) { canvas.addEventListener("pointerdown", stop); canvas.addEventListener("dblclick", stop); }
      this.offFollowInput = () => { if (canvas) { canvas.removeEventListener("pointerdown", stop); canvas.removeEventListener("dblclick", stop); } };
      const device = this.findDevice(id);
      this.message = `镜头跟随 ${device ? device.name : id} · 可旋转缩放，右键平移即退出跟随`;
    },
    stopFollow() {
      if (this.offFollowInput) this.offFollowInput();
      this.offFollowInput = null;
      if (this.adapter) this.adapter.stopFollowDevice();
      if (this.following && this.message.startsWith("镜头跟随")) this.message = "";
      this.following = null;
    },
    /** 观察细节：镜头贴近设备（封闭小房间内的设备也能看清）。 */
    async focusDetail(text) {
      const device = this.findDevice(text);
      if (!device || !this.adapter) return { ok: false, message: `未找到设备 ${text}` };
      this.stopTour();
      this.releaseMotionCamera();
      this.stopFollow();
      this.adapter.showFocusFrame(device.id);
      this.message = `观察细节 · ${device.name}`;
      await this.run(async () => { await this.leaveWalk(); await this.adapter.focusDevice(device.id, { detail: true }); });
      return { ok: true, message: this.message };
    },
    /** 设备拆解：在独立大窗口中克隆设备模型，展示拆解动画与构件详情（主场景不变）。 */
    async explodeDevice(text) {
      const device = this.findDevice(text);
      const item = device && catalog.devices.find((x) => x.id === device.id);
      if (!device || !item) return { ok: false, message: `未找到设备 ${text}` };
      if (!this.adapter || !this.measureViewer) return { ok: false, message: "三维场景未就绪" };
      if (!EXPLODABLE.has(device.id)) { this.showDeviceCard(device.id, { focus: false }); return { ok: false, message: `${device.name} 为整体模型，不支持拆解（可拆解：${[...EXPLODABLE].map((id) => (this.findDevice(id) || { name: id }).name).join("、")}）；已打开设备信息` }; }
      const viewer = this.measureViewer;
      const source = viewer.extensions.getObject(this.adapter.deviceRef(device.id));
      if (!source) return { ok: false, message: `${device.name} 模型节点不可用` };
      this.dialog = null;
      const ex = { parts: componentsOf(device, item) };
      // 拆解窗口独占 GPU：打开期间暂停主场景渲染循环（主场景被遮罩完全覆盖），关闭后恢复。
      this.pauseMainRender(viewer);
      // Object.freeze：阻止 Vue2 把 THREE 场景树深度响应式化（否则关闭后主场景每帧访问属性都走 getter，帧率骤降）。
      this.explodeView = Object.freeze({ THREE: viewer.extensions.THREE, renderer: viewer.extensions.renderer, source, device, namePart: (node) => this.namePart(node, ex) });
      this.explode = null;
      this.message = "";
      return { ok: true, device: device.name, window: true, parts: ex.parts.map(({ name, detail, status, reason }) => ({ name, detail, status, reason })) };
    },
    async collapseDevice() { this.explodeView = null; return { ok: true }; },
    /** 设备热成像：弹窗中把温度场映射到设备模型表面（克隆几何，主场景不变）。 */
    openThermal(text) {
      const def = thermalOfDevice((this.findDevice(text) || {}).id) || thermalDevices[0];
      if (!this.adapter || !this.measureViewer) return { ok: false, message: "三维场景未就绪" };
      const viewer = this.measureViewer;
      const source = viewer.extensions.getObject(this.adapter.deviceRef(def.id));
      if (!source) return { ok: false, message: `${def.name} 模型节点不可用` };
      this.pauseMainRender(viewer);
      const item = catalog.devices.find((x) => x.id === def.id);
      this.thermalView = Object.freeze({ THREE: viewer.extensions.THREE, source, def, region: item ? { min: item.min, max: item.max } : null, sceneRoot: viewer.extensions.scene });
      return { ok: true, device: def.name, info: `${def.name} 表面温度仿真 · ${def.note}` };
    },
    pauseMainRender(viewer) {
      const r = viewer.extensions.renderer;
      if (!r || this.mainLoop || typeof viewer.frame !== "function") return;
      r.setAnimationLoop(null);
      this.mainLoop = { r, loop: viewer.frame };
    },
    resumeMainRender() {
      const m = this.mainLoop;
      this.mainLoop = null;
      if (m) m.r.setAnimationLoop(m.loop);
    },
    unbindPartPick() {},
    clearPartTag() { this.partTag = null; },
    /** 构件名 → 业务部件（按命名关键字匹配设备结构；匹配不到给出通用名称）。 */
    namePart(nodeName, ex) {
      const rules = [[/screw|luogan|料筒|inject|zhushe/i, "inject"], [/mold|muju|模/i, "mold"], [/clamp|hemo|拉杆|tie/i, "clamp"], [/oil|youxiang|hydra|泵/i, "hydraulic"], [/panel|kongzhi|ctrl|电控|柜/i, "control"], [/hopper|liaodou|斗/i, "hopper"], [/fan|fengji|风/i, "blower"], [/fork|huocha|叉/i, "fork"], [/wheel|lun|track|guidao|轨/i, "travel"]];
      const key = (rules.find(([re]) => re.test(nodeName)) || [])[1];
      const found = key && ex.parts.find((p) => p.key === key);
      if (found) return found;
      // 模型构件名多为导出编号（SM_LK_TSJ_1F_10k_1）：按部件结构顺序给出业务名称，编号保留在“构件”行。
      const idx = Number((/_(\d+)$/.exec(nodeName) || [])[1] || 0);
      const generic = ex.parts[idx % Math.max(1, ex.parts.length)];
      return generic ? { ...generic, name: `${generic.name}` } : { name: "设备构件", status: "正常" };
    },
    setDeviceMaterial(text, preset) {
      const device = this.findDevice(text);
      const def = materialPresets.find((m) => m.id === preset);
      if (!device || !def) return { ok: false, message: !device ? `未找到设备 ${text}` : `未知材质 ${preset}` };
      if (def.color) this.$set(this.materials, device.id, def.id); else this.$delete(this.materials, device.id);
      this.applyMaterials();
      return { ok: true, message: `${device.name} → ${def.name}` };
    },
    applyMaterials() {
      if (!this.adapter) return;
      const items = Object.entries(this.materials).map(([id, preset]) => ({ ref: this.adapter.deviceRef(id), color: materialPresets.find((m) => m.id === preset).color }));
      if (items.length) this.adapter.tint("xy-material", items, 2); else this.adapter.clearTint("xy-material");
    },
    controlDevice(text, command, user = "中控值班") {
      const device = this.findDevice(text);
      if (!device) return { ok: false, message: `未找到设备 ${text}` };
      const result = applyCommand(device, command, user);
      this.message = result.message;
      if (!result.ok) return result;
      this.opLog.unshift({ deviceId: device.id, time: hhmm(), text: result.message, user });
      if (command === "reset") {
        this.alarmData.filter((a) => a.device === device.id && a.state === "未处置").forEach((a) => Object.assign(a, { state: "已处置", result: "远程复位", user }));
      }
      if (command === "estop") {
        this.alarmData.unshift({ id: `ALM-1123-${String(15 + this.alarmData.length).padStart(3, "0")}`, device: device.id, content: `${device.name} 远程急停，待现场确认`, level: "紧急", building: device.building, time: hhmm(), state: "未处置" });
      }
      if (this.layerId === "health" || this.layerId === "heat") this.reopenLayer();
      return { ...result, device: this.deviceSummary(device) };
    },
    deviceSummary: (x) => ({ deviceId: x.id, name: x.name, group: x.group, building: x.building, area: x.area, status: x.status, health: x.health, temp: x.temp, power: x.power, cycle: x.cycle, note: x.note }),

    /* ---------------- 专题图层 ---------------- */
    async toggleLayer(id) { return this.layerId === id ? this.closeLayer() : this.openLayer(id); },
    async openLayer(id, options = {}) {
      if (id === "replay") return this.startReplay();
      if (id === "thermal") return this.openThermal(options.device);
      if (id === "mold") { this.moldView = this.moldView ? "" : (options.device && moldSims.some((s) => s.id === options.device) ? options.device : "ZSJ-F17"); return { ok: true, layer: "模温仿真" }; }
      if (id === "layout") return this.startLayout();
      if (this.layout) this.finishLayout();
      const def = layerDefs[id];
      if (!def) return { ok: false, message: `未知图层 ${id}` };
      if (!this.adapter) return { ok: false, message: "三维场景未就绪" };
      await this.closeLayer();
      const adapter = this.adapter;
      const token = {};
      this.layerToken = token;
      this.layerId = id;
      this.layerBusy = true;
      this.layerInfo = `${def.name} 加载中…`;
      this.message = "";
      this.releaseMotionCamera();
      this.layerCutawayRestore = this.cutaway.slice();
      const cutaway = (list) => this.setCutawayTo([...new Set([...this.cutaway, ...list])], `图层·${def.name}`);
      try {
        this.layerOption = options;
        const ctl = await def.open({ adapter, data: { ledger: this.ledger, cameras: this.cameras }, cutaway, options });
        if (this.layerToken !== token || this.adapter !== adapter) { await ctl.dispose(); return { ok: false, message: "已取消" }; }
        this.layerCtl = ctl;
        this.layerInfo = ctl.info;
        if (ctl.vtk) this.bindVtk(ctl);
        return { ok: true, layer: def.name, info: ctl.info };
      } catch (error) {
        if (this.layerToken === token) { this.layerId = ""; this.layerInfo = ""; this.restoreLayerCutaway(); }
        this.message = `${def.name}打开失败：${error.message}`;
        return { ok: false, message: this.message };
      } finally {
        if (this.layerToken === token) this.layerBusy = false;
      }
    },
    async closeLayer() {
      const ctl = this.layerCtl;
      this.disposeLayer();
      if (ctl) await Promise.resolve(ctl.dispose()).catch(() => {});
      return { ok: true };
    },
    /** 同步清理图层状态（离开页面时适配层会统一删除覆盖物）。 */
    disposeLayer() {
      const wasOpen = Boolean(this.layerId);
      this.layerToken = null;
      this.layerCtl = null;
      this.layerBusy = false;
      this.unbindVtk();
      if (wasOpen) this.layerCutawayRestore = null;
      this.layerId = "";
      this.layerInfo = "";
      this.layerOption = {};
    },
    restoreLayerCutaway() {
      const restore = this.layerCutawayRestore;
      this.layerCutawayRestore = null;
      if (!restore || !this.adapter) return;
      this.setCutawayTo(restore);
    },
    async reopenLayer() {
      const id = this.layerId;
      if (id) await this.openLayer(id);
    },
    bindVtk(ctl) {
      const { summary, vtk } = ctl;
      const fields = Object.keys(summary.fields);
      this.vtkEntity = vtk;
      this.vtk = { active: true, title: summary.title, playing: true, frame: 0, frames: summary.frames, field: fields[0], fields, fieldInfo: summary.fields };
      clearInterval(this.vtkTimer);
      this.vtkTimer = setInterval(() => {
        try { this.vtk.frame = this.vtkEntity.getInfo().currentFrame || 0; } catch (error) { /* 数据加载中 */ }
      }, 300);
    },
    unbindVtk() {
      clearInterval(this.vtkTimer);
      this.vtkEntity = null;
      this.vtk = { ...idleVtk };
    },
    async simulationControl(action, frame, field) {
      const entity = this.vtkEntity;
      if (!entity) return { ok: false, message: "当前没有打开 VTK 仿真，请先打开 clean 洁净区压差或 mold 模温仿真图层" };
      if (action === "play") { await entity.play({ fps: this.layerId === "mold" ? 2 : 1.2, loop: true }); this.vtk.playing = true; }
      if (action === "pause") { await entity.pause(); this.vtk.playing = false; }
      if (action === "seek") {
        const index = Math.max(0, Math.min(this.vtk.frames.length - 1, Number(frame) || 0));
        if (this.vtk.playing) { await entity.pause(); this.vtk.playing = false; }
        await entity.seek(index);
        this.vtk.frame = index;
      }
      if (action === "field") {
        const info = this.vtk.fieldInfo[field];
        if (!info) return { ok: false, message: `字段可选：${this.vtk.fields.join(" / ")}` };
        await entity.update({ vtkStyle: { field, colorMap: info.colorMap, range: info.range, legend: { visible: true, position: "right", title: `${info.label} ${info.unit}` } } });
        this.vtk.field = field;
      }
      return { ok: true, title: this.vtk.title, field: this.vtk.field, playing: this.vtk.playing, frame: this.vtk.frame, frames: this.vtk.frames.length, current: this.vtkFrame, stats: this.vtkStatsText, allFrames: this.vtk.frames };
    },

    /* ---------------- 监控视角 ---------------- */
    cameraView(point) {
      if (!this.adapter || !point) return { ok: false, message: "三维场景未就绪" };
      const scenePoint = this.scenePoints.find((x) => x.id === point.id) || point;
      this.stopTour();
      this.releaseMotionCamera();
      this.message = `${point.name.replace("园区监控摄像头", "监控 ")} · 三维监控视角`;
      this.run(async () => { await this.leaveWalk(); await this.adapter.cameraView(scenePoint); });
      return { ok: true, message: this.message };
    },
    cameraViewById(n) {
      const point = this.cameras.find((c) => c.id === `camera-${Number(n)}`);
      if (!point) return { ok: false, message: `没有编号 ${n} 的监控点（共 ${this.cameras.length} 路）` };
      this.openPoint(point.id);
      return { ok: true, message: `${point.name} · 实时视频与三维监控视角` };
    },

    /* ---------------- 历史回放 ---------------- */
    /** 历史回放：右侧弹出告警回溯列表与时间轴；点击节点聚焦设备并显示当时状态，可自动播放。 */
    startReplay() {
      if (!this.adapter) return { ok: false, message: "三维场景未就绪" };
      this.stopReplay();
      this.stopTour();
      this.releaseMotionCamera();
      this.replayEvents = [...this.alarmData].sort((a, b) => a.time.localeCompare(b.time));
      this.replay = { active: true, index: -1, total: this.replayEvents.length, playing: false };
      this.openCard("replay");
      this.replayAt(0);
      return { ok: true, events: this.replayEvents.map((a) => `${a.time} ${a.content}`) };
    },
    replayAt(index) {
      const a = this.replayEvents[index];
      if (!this.replay.active || !a) return;
      this.replay.index = index;
      this.locateAlarm(a.id, true, true);
      this.$nextTick(() => { const el = this.$refs.replayList && this.$refs.replayList.children[index]; if (el) el.scrollIntoView({ block: "nearest" }); });
      this.message = `历史回放 ${index + 1}/${this.replayEvents.length} · ${a.time} [${a.level}] ${a.content}`;
    },
    playReplay() {
      if (!this.replay.active) return;
      this.replay.playing = true;
      const step = () => {
        if (!this.replay.active || !this.replay.playing) return;
        if (this.replay.index >= this.replayEvents.length - 1) { this.pauseReplay(); this.message = "历史回放结束"; return; }
        this.replayAt(this.replay.index + 1);
        this.replayTimer = setTimeout(step, 4200);
      };
      if (this.replay.index >= this.replayEvents.length - 1) this.replayAt(0);
      this.replayTimer = setTimeout(step, 4200);
    },
    pauseReplay() { clearTimeout(this.replayTimer); this.replay.playing = false; },
    stopReplay() {
      clearTimeout(this.replayTimer);
      if (!this.replay.active) return { ok: true };
      this.replay = { active: false, index: -1, total: 0, playing: false };
      if (this.message.startsWith("历史回放")) this.message = "";
      if (this.card && this.card.type === "replay") this.card = null;
      if (this.adapter) { this.adapter.clearOutline("xy-locate"); this.adapter.clearFocusFrame(); }
      return { ok: true };
    },
    /** 告警定位：聚焦设备（keepCard=回放时保留回放面板，只高亮并移动镜头）。 */
    locateAlarm(alarmId, keepReplay = false, keepCard = false) {
      const a = this.alarmData.find((x) => x.id === alarmId);
      if (!a) return { ok: false, message: `未找到告警 ${alarmId}` };
      if (!keepReplay) this.stopReplay();
      const device = this.findDevice(a.device);
      if (device && keepCard && this.adapter) {
        const adapter = this.adapter;
        this.stopFollow();
        adapter.outline("xy-locate", [adapter.deviceRef(device.id)], { color: "#3ee6d4", hiddenColor: "#1f7f78", glow: 0.6 });
        adapter.showFocusFrame(device.id, a.level === "紧急" ? "#ff5a4f" : "#f5c451");
        this.run(async () => { await this.leaveWalk(); await adapter.focusDevice(device.id); });
        return { ok: true, message: `定位到设备 ${a.device}` };
      }
      if (device) { this.locateDevice(a.device); return { ok: true, message: `定位到设备 ${a.device}` }; }
      const camera = /^CAM-0*(\d+)$/.exec(a.device);
      if (camera) return this.cameraViewById(camera[1]);
      this.locate(a.building);
      return { ok: true, message: `定位到 ${this.buildingNames[a.building] || a.building}` };
    },
    /* ---------------- 能效策略 ---------------- */
    openStrategy() {
      this.strategy = energyStrategies(this.ledger);
      this.dialog = { type: "strategy", title: "能效优化策略" };
      return { ok: true, totalKWh: this.strategy.total, sharePct: this.strategy.share, carbonT: this.strategy.carbon, list: this.strategy.list };
    },

    /* ---------------- Agent 查询 ---------------- */
    apiOverview() {
      const { stats } = d.summarizeDevices(this.ledger);
      const open = this.alarmData.filter((a) => a.state === "未处置");
      return {
        product: `${d.product.name}（${d.product.spec}）`, asOf: d.AS_OF,
        campus: { buildings: this.buildings.length, cameras: this.cameras.length, people: d.peopleOnSite },
        production: { assembled: d.production.assembled, plan: d.production.plan, ratePct: d.production.rate, yieldPct: d.production.yieldRate, boxes: d.production.boxes, pallets: d.production.pallets },
        devices: stats,
        alarms: { open: open.length, list: open.map((a) => `${a.id} [${a.level}] ${a.content}`) },
        warehouse: { used: d.warehouse.used, slots: d.warehouse.slots, ratePct: d.warehouse.rate },
        energy: { todayKWh: d.energy.today, pvKWh: d.energy.pv, carbonT: d.energy.carbon },
        environment: { okRatePct: d.environment.okRate, bad: d.envPoints.filter((p) => !p.ok).map((p) => p.name) },
        scene: { cutaway: this.cutaway, layer: this.layerName, followLine: this.flow.follow, worldSpeed: this.flow.speed, poiOcclusion: this.occlusion },
      };
    },
    apiDevices({ group, status, building, keyword } = {}) {
      const key = keyword ? String(keyword).toUpperCase().replace(/\s+/g, "") : "";
      const list = this.ledger.filter((x) => (!group || x.group === group) && (!status || x.status === status) && (!building || x.building === building)
        && (!key || x.id.toUpperCase().includes(key) || x.name.toUpperCase().replace(/\s+/g, "").includes(key)));
      return { total: list.length, devices: list.slice(0, 40).map(this.deviceSummary) };
    },
    apiDevice(text) {
      const device = this.findDevice(text);
      if (!device) return { ok: false, message: `未找到设备 ${text}` };
      const item = catalog.devices.find((x) => x.id === device.id);
      return { ...this.deviceSummary(device), hours: device.hours, parts: componentsOf(device, item).map(({ name, status, reason }) => ({ name, status, reason })), alarms: this.alarmData.filter((a) => a.device === device.id) };
    },
    apiAlarms({ state, level } = {}) {
      return this.alarmData.filter((a) => (!state || a.state === state) && (!level || a.level === level));
    },
    /** 生产线控制（Agent）：running 开始/停止生产、speed 世界时间倍率、follow 是否跟随产线视角、stage 查看某道工序（不跟随时）。 */
    apiControlLine({ running, speed, follow, stage } = {}) {
      if (!this.line) return { ok: false, message: "三维场景未就绪，生产线不可用" };
      if (speed !== undefined && !WORLD_SPEEDS.includes(Number(speed))) return { ok: false, message: `倍速可选 ${WORLD_SPEEDS.join(" / ")}` };
      if (running === true) this.onFlow("start");
      if (running === false) this.onFlow("stop");
      if (speed !== undefined) this.onFlow("speed", Number(speed));
      if (typeof follow === "boolean") this.onFlow("follow", follow);
      if (stage !== undefined && stage !== null && stage !== "") {
        const index = Number(stage);
        if (!lineStages[index]) return { ok: false, message: `工序序号应为 0–${lineStages.length - 1}` };
        this.onFlow("view", index);
      }
      return { ok: true, ...this.apiProductionState() };
    },
    apiProductionState() {
      const f = this.flow;
      const sec = (ms) => Math.round(ms / 1000);
      return {
        running: f.running, batch: f.batch, stage: f.stage >= 0 ? lineStages[f.stage].name : null, worldSpeed: f.speed, follow: f.follow,
        stageProgress: f.stageDurationMs ? `${sec(f.stageMs)} / ${sec(f.stageDurationMs)} s` : "", batchProgress: f.batchDurationMs ? `${sec(f.batchMs)} / ${sec(f.batchDurationMs)} s` : "",
        stages: lineStages.map((s, i) => `${i} ${s.name}（${s.area}）`), note: "产线直接播放、批次循环；可调播放倍速或切换跟随视角",
      };
    },
    apiLocateBuilding(building) {
      if (!this.campus.anchors.some((x) => x.id === building)) return { ok: false, message: `未知楼栋 ${building}` };
      this.locateArea(building);
      return { ok: true, building: this.buildingNames[building], cutaway: this.cutaway };
    },
    apiWarehouse() {
      return { zones: d.zones.map((z) => ({ ...z, ratePct: d.helpers.pct(z.used, z.slots) })), total: { used: d.warehouse.used, slots: d.warehouse.slots, ratePct: d.warehouse.rate }, today: { fgIn: d.warehouse.fgIn, rmIn: d.warehouse.rmIn, rmOut: d.warehouse.rmOut, issuedKg: d.warehouse.issuedKg }, devices: this.ledger.filter((x) => x.building === "warehouse").map(this.deviceSummary) };
    },
    apiEnergy() {
      const e = d.energy;
      return { todayKWh: e.today, pvKWh: e.pv, gridKWh: e.grid, pvSharePct: e.pvShare, carbonT: e.carbon, perThousandKWh: e.perK, waterM3: e.water, steamT: e.steam, meters: d.meters, livePowerKW: d.helpers.round(this.ledger.reduce((t, x) => t + x.power, 0)) };
    },
    apiEnvironment() { return { rules: d.envRules, points: d.envPoints, outdoor: d.environment.outdoor, okRatePct: d.environment.okRate }; },
    apiSwitchModule(id) {
      const target = moduleAlias[id] || id;
      if (!modules.some((m) => m.id === target)) return { ok: false, message: `未知模块 ${id}` };
      this.setModule(target);
      return { ok: true, module: modules.find((m) => m.id === target).name };
    },
  },
};
</script>

<style scoped src="./campus.css"></style>
