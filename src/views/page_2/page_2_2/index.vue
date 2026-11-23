<template>
  <Layout :aside="true" :main="true">
    <!-- ============ 左侧：产线总览 + 告警中心 ============ -->
    <template v-slot:aside-left>
      <div class="lh-col">
        <Box class="lh-box lh-box--overview" :delayTime="100" position="left">
          <template v-slot:header>
            <h1>产线总览</h1>
          </template>
          <div class="lh-body">
            <div class="kpi-row">
              <div v-for="item in statusKpis" :key="item.key" class="kpi" :class="{ on: statusFilter === item.key }"
                @click="statusFilter = statusFilter === item.key ? '' : item.key">
                <i :style="{ background: item.color, boxShadow: `0 0 8px ${item.color}` }" />
                <b>{{ item.value }}</b><span>{{ item.label }}</span>
              </div>
            </div>
            <div class="kpi-line">
              <div><span>综合 OEE</span><b>{{ (avgOee * 100).toFixed(1) }}<small>%</small></b></div>
              <div><span>实时功率</span><b>{{ totalPower.toFixed(0) }}<small>kW</small></b></div>
              <div><span>今日产量</span><b>{{ produced }}<small>件</small></b></div>
            </div>
            <div class="sub-title">设备结构 <em>点击定位</em></div>
            <div class="tree lh-scroll">
              <div v-for="group in deviceGroups" :key="group.area" class="tree-group">
                <div class="tree-head" @click="toggleGroup(group.area)">
                  <span class="caret" :class="{ open: !collapsed[group.area] }">▸</span>
                  {{ group.name }}<em>{{ group.items.length }}</em>
                </div>
                <div v-show="!collapsed[group.area]" class="tree-items">
                  <div v-for="item in group.items" :key="item.id" class="tree-item"
                    :class="{ active: selectedId === item.id }" @click="selectDevice(item.id)">
                    <i class="dot" :style="{ background: statusColor(item.id) }" />
                    <span class="t-code">{{ item.id }}</span>
                    <span class="t-name">{{ item.name }}</span>
                    <span class="t-state" :style="{ color: statusColor(item.id) }">{{ statusLabel(item.id) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Box>

        <Box class="lh-box lh-box--alarm" :delayTime="200" position="left">
          <template v-slot:header>
            <h1>告警中心</h1>
          </template>
          <div class="lh-body">
            <div class="filters">
              <select v-model="alarmFilter.range">
                <option value="1">近 1 小时</option>
                <option value="2">近 2 小时</option>
                <option value="24">今日</option>
              </select>
              <select v-model="alarmFilter.area">
                <option value="">全部区域</option>
                <option v-for="group in deviceGroups" :key="group.area" :value="group.area">{{ group.name }}</option>
              </select>
              <select v-model="alarmFilter.level">
                <option value="">全部等级</option>
                <option value="critical">紧急</option>
                <option value="warning">预警</option>
              </select>
              <select v-model="alarmFilter.state">
                <option value="open">未处置</option>
                <option value="closed">已处置</option>
                <option value="">全部</option>
              </select>
            </div>
            <div class="alarm-list lh-scroll">
              <div v-if="!filteredAlarms.length" class="empty">暂无符合条件的告警</div>
              <div v-for="alarm in filteredAlarms" :key="alarm.id" class="alarm" :class="[alarm.level, alarm.state]"
                @click="locateAlarm(alarm)">
                <div class="alarm-top">
                  <span class="lv">{{ alarm.level === 'critical' ? '紧急' : '预警' }}</span>
                  <b>{{ alarm.deviceName }}</b><em>{{ alarm.deviceId }}</em>
                  <time>{{ fmtTime(alarm.time) }}</time>
                </div>
                <div class="alarm-msg">
                  {{ alarm.message }}
                  <button v-if="alarm.state === 'open'" class="btn mini" @click.stop="openDisposal(alarm)">处置</button>
                  <span v-else class="done">已处置 · {{ alarm.handler }}</span>
                </div>
              </div>
            </div>
            <button class="btn ghost full" :disabled="!selectedId" @click="injectFault">
              {{ selectedId ? `模拟 ${selectedId} 异常数据` : '选中设备后可注入异常数据' }}
            </button>
          </div>
        </Box>
      </div>
    </template>

    <!-- ============ 主区域：底部能力坞 + 浮层 ============ -->
    <div class="lh-main">
      <div v-if="!ready" class="boot">
        <i class="spinner" /><span>{{ bootText }}</span>
      </div>

      <!-- 全局产线运行 / 停滞开关 -->
      <div v-if="ready" class="line-switch" :class="{ paused: linePaused }">
        <i class="led" />
        <div class="ls-text">
          <b>{{ linePaused ? '产线已停滞' : '产线运行中' }}</b>
          <span>{{ linePaused ? '工件 / AGV / 堆垛机已冻结' : `节拍 24 s · 今日 ${produced} 件` }}</span>
        </div>
        <button class="ls-btn" :disabled="lineBusy" @click="toggleLine">{{ linePaused ? '▶ 恢复生产' : '❚❚ 停止生产' }}</button>
      </div>

      <transition name="fade">
        <div v-if="toast" class="toast" :class="toast.type">{{ toast.text }}</div>
      </transition>

      <transition name="fade">
        <div v-if="touring" class="tour-bar">
          <span class="tour-title">自动巡检</span>
          <span v-for="(stop, index) in tourStops" :key="stop.view" class="tour-dot"
            :class="{ done: index < tourIndex, cur: index === tourIndex }" :title="stop.title" />
          <b>{{ tourCard ? tourCard.name : '' }}</b>
          <button class="btn mini" @click="tourPaused = !tourPaused">{{ tourPaused ? '继续' : '暂停' }}</button>
          <button class="btn mini ghost" @click="stopTour">结束</button>
        </div>
      </transition>

      <div v-if="hint" class="hint">{{ hint }}</div>

      <div class="dock" v-if="ready">
        <div class="dock-tabs">
          <span v-for="tab in dockTabs" :key="tab.id" :class="{ on: dockTab === tab.id }" @click="dockTab = tab.id">{{
            tab.name }}</span>
        </div>
        <div class="dock-actions">
          <template v-if="dockTab === 'browse'">
            <label class="inline">视角
              <select class="view-select" v-model="currentView" @change="gotoView(currentView)">
                <option v-for="view in views" :key="view.id" :value="view.id">{{ view.name }}</option>
              </select></label>
            <span class="sep" />
            <button class="btn" :class="{ on: touring }" @click="touring ? stopTour() : startTour()">自动巡检</button>
            <button class="btn" :class="{ on: active.walk }" @click="toggleWalk">第一人称</button>
            <button class="btn" :class="{ on: active.measure }" @click="toggleMeasure">距离测量</button>
            <button class="btn" :class="{ on: active.area }" @click="toggleArea">面积测量</button>
          </template>
          <template v-if="dockTab === 'xray'">
            <button class="btn" :class="{ on: xrayMode === 'off' }" @click="setXray('off')">实景</button>
            <button class="btn" :class="{ on: xrayMode === 'building' }" @click="setXray('building')">建筑透视 ·
              隐蔽管网</button>
            <button class="btn" :class="{ on: xrayMode === 'underground' }" @click="setXray('underground')">地下透视 ·
              环网</button>
          </template>
          <template v-if="dockTab === 'sim'">
            <button class="btn" :class="{ on: active.follow }" @click="toggleFollowProduct">{{ active.follow ? '结束产品跟随'
              : '产品全流程跟随' }}</button>
            <span class="sep" />
            <button class="btn" :class="{ on: rightPanel === 'trace' }" @click="startTrace">生产溯源</button>
            <button class="btn" :class="{ on: rightPanel === 'history' }" @click="openHistory">历史回放</button>
          </template>
          <template v-if="dockTab === 'stock'">
            <button class="btn" :class="{ on: stockMode === 'category' }" @click="setStockMode('category')">按类别</button>
            <button class="btn" :class="{ on: stockMode === 'occupancy' }"
              @click="setStockMode('occupancy')">按库存量</button>
            <button class="btn" :class="{ on: stockMode === 'off' }" @click="setStockMode('off')">关闭</button>
            <span class="sep" />
            <button class="btn" @click="gotoView('warehouse')">立体仓库视角</button>
          </template>
          <template v-if="dockTab === 'analysis'">
            <button class="btn" :class="{ on: analysis === 'health' }" @click="toggleAnalysis('health')">设备健康度</button>
            <button class="btn" :class="{ on: analysis === 'radiation' }"
              @click="toggleAnalysis('radiation')">辐射剂量</button>
            <button class="btn" :class="{ on: analysis === 'energy' }" @click="toggleAnalysis('energy')">能耗热力</button>
            <button class="btn" :class="{ on: analysis === 'safety' }" @click="toggleAnalysis('safety')">安全应急</button>
            <span class="sep" />
            <button class="btn" :class="{ on: analysis === 'thermal' }" @click="toggleAnalysis('thermal')">主轴热仿真 ·
              VTK</button>
          </template>
          <template v-if="dockTab === 'plan'">
            <button class="btn" :class="{ on: rightPanel === 'plan' }" @click="openPlanner">布局规划</button>
          </template>
          <template v-if="dockTab === 'env'">
            <label class="inline wide">时间
              <input type="range" min="0" max="1439" step="10" v-model.number="minutes" @input="onTimeChange" /><b>{{
                clock }}</b>
            </label>
            <button class="btn" :class="{ on: active.ao }" @click="toggleAo">环境光遮蔽</button>
          </template>
          <span class="grow" />
          <button class="btn ghost" @click="resetAll">复原场景</button>
        </div>
      </div>

      <!-- 处置看板 -->
      <transition name="fade">
        <div v-if="disposal" class="modal-mask" @click.self="disposal = null">
          <div class="modal">
            <h2>告警处置 <em>{{ disposal.alarm.id }}</em></h2>
            <div class="modal-grid">
              <div><span>设备</span><b>{{ disposal.alarm.deviceName }}（{{ disposal.alarm.deviceId }}）</b></div>
              <div><span>区域</span><b>{{ areaName(disposal.alarm.area) }}</b></div>
              <div><span>等级</span><b :class="disposal.alarm.level">{{ disposal.alarm.level === 'critical' ? '紧急' : '预警'
                  }}</b></div>
              <div><span>发生时间</span><b>{{ fmtTime(disposal.alarm.time, true) }}</b></div>
              <div class="full"><span>告警内容</span><b>{{ disposal.alarm.message }}</b></div>
            </div>
            <div class="steps">
              <label v-for="(step, index) in disposal.steps" :key="index" :class="{ done: step.done }">
                <input type="checkbox" v-model="step.done" />{{ step.text }}
              </label>
            </div>
            <div class="form-row">
              <span>处置人</span><input v-model="disposal.handler" />
              <span>结果</span>
              <select v-model="disposal.result">
                <option>已修复恢复运行</option>
                <option>转维修工单</option>
                <option>误报</option>
              </select>
            </div>
            <textarea v-model="disposal.note" placeholder="处置说明（可选）" />
            <div class="modal-actions">
              <button class="btn ghost" @click="disposal = null">取消</button>
              <button class="btn primary" :disabled="!disposal.steps.every((s) => s.done)"
                @click="confirmDisposal">确认处置并解除告警</button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- ============ 右侧：设备详情 + 场景面板 ============ -->
    <template v-slot:aside-right>
      <div class="lh-col">
        <Box class="lh-box lh-box--device" :delayTime="100" position="right">
          <template v-slot:header>
            <h1>设备详情</h1>
          </template>
          <div class="lh-body">
            <div v-if="!selected" class="empty tall">在三维场景或左侧结构树中点选设备</div>
            <template v-else>
              <div class="dev-head">
                <div>
                  <h2>{{ selected.name }}</h2>
                  <p>{{ selected.id }} · {{ selected.vendor }} {{ selected.model }}</p>
                </div>
                <span class="chip"
                  :style="{ color: statusColor(selected.id), borderColor: statusColor(selected.id) }">{{
                    statusLabel(selected.id) }}</span>
              </div>
              <div class="dev-grid">
                <div><span>投产年份</span><b>{{ selected.year || '-' }}</b></div>
                <div><span>额定功率</span><b>{{ selected.power || '-' }} kW</b></div>
                <div><span>加工节拍</span><b>{{ selected.cycle ? selected.cycle + ' s' : '-' }}</b></div>
                <template v-if="selectedMetric">
                  <div><span>温度</span><b :class="{ warn: selectedMetric.temperature > 60 }">{{
                      selectedMetric.temperature }} ℃</b></div>
                  <div><span>功率</span><b>{{ selectedMetric.power }} kW</b></div>
                  <div><span>累计运行</span><b>{{ (selectedMetric.runtime / 3600).toFixed(1) }} h</b></div>
                </template>
              </div>
              <div v-if="processOf(selected.id)" class="process-chip">工序 {{ process.indexOf(processOf(selected.id)) + 1
                }} · {{
                  processOf(selected.id).step }} <em>{{ processOf(selected.id).detail }}</em></div>
              <div class="dev-actions">
                <button class="btn" @click="focus(selected.id)">聚焦</button>
                <button class="btn" :class="{ on: followingId === selected.id }" @click="toggleFollowDevice">{{
                  followingId ===
                  selected.id ? '停止跟随' : '跟随' }}</button>
                <button v-if="isExplodable(selected.id)" class="btn" :class="{ on: explodedId === selected.id }"
                  @click="toggleExplode">
                  {{ explodedId === selected.id ? '收起拆解' : '爆炸拆解' }}</button>
                <button class="btn" :class="{ on: materialOpen }" @click="materialOpen = !materialOpen">材质调节</button>
              </div>
              <div v-if="materialOpen" class="material">
                <label>金属度<input type="range" min="0" max="1" step="0.05" v-model.number="material.metalness"
                    @input="applyMaterial" /><b>{{ material.metalness.toFixed(2) }}</b></label>
                <label>粗糙度<input type="range" min="0" max="1" step="0.05" v-model.number="material.roughness"
                    @input="applyMaterial" /><b>{{ material.roughness.toFixed(2) }}</b></label>
                <button class="btn mini ghost" @click="resetMaterial">复原材质</button>
              </div>
              <div v-if="part" class="part-card">
                <div class="part-title">构件 · {{ part.name }}</div>
                <div><span>材质</span>{{ part.material }}</div>
                <div><span>规格</span>{{ part.spec }}</div>
              </div>
              <div v-else-if="explodedId === selected.id" class="part-tip">点选拆解后的构件查看材质与规格</div>
            </template>
          </div>
        </Box>

        <Box class="lh-box lh-box--panel" :delayTime="200" position="right">
          <template v-slot:header>
            <h1>{{ panelTitle }}</h1>
          </template>
          <div class="lh-body">
            <!-- 生产仿真 -->
            <template v-if="rightPanel === 'production'">
              <div class="stat-grid">
                <div><span>跟随产品</span><b class="mono">{{ followInfo.productId || '-' }}</b></div>
                <div><span>当前工序</span><b>{{ followInfo.done ? '已入库' : (followInfo.step || '等待投产') }}</b></div>
                <div class="wide action-row"><span>当前动作</span>
                  <div class="action-line">
                    <b class="action">{{ followInfo.action || (followInfo.done ? '完成' : '输送中') }}</b>
                    <svg v-if="followInfo.progress != null" class="ring" :class="{ 'is-done': followInfo.progress >= 1 }" viewBox="0 0 36 36"
                      :aria-label="`工序进度 ${Math.round(followInfo.progress * 100)}%`">
                      <defs>
                        <linearGradient id="lhRingGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0" stop-color="#31aeff" />
                          <stop offset="1" stop-color="#ffd23a" />
                        </linearGradient>
                      </defs>
                      <circle class="ring-track" cx="18" cy="18" r="14" />
                      <circle class="ring-bar" cx="18" cy="18" r="14" pathLength="100"
                        :stroke-dasharray="`${Math.min(100, Math.max(0, followInfo.progress * 100))} 100`" />
                      <path v-if="followInfo.progress >= 1" class="ring-check" d="M12 18.5l4 4 8-9" />
                      <circle v-else class="ring-core" cx="18" cy="18" r="3.2" />
                    </svg>
                  </div>
                </div>
                <div><span>今日累计产出</span><b>{{ prodStats.produced || 0 }}</b></div>
                <div><span>在制品</span><b>{{ prodStats.wip || 0 }}</b></div>
              </div>
              <div class="timeline lh-scroll">
                <div v-for="(step, index) in process" :key="step.station" class="tl-item"
                  :class="{ done: followInfo.done || index < followInfo.stepIndex, cur: !followInfo.done && index === followInfo.stepIndex }">
                  <i />
                  <div><b>{{ index + 1 }}. {{ step.step }}</b><span>{{ step.station }}</span>
                    <p>{{ step.detail }}</p>
                  </div>
                </div>
              </div>
            </template>

            <!-- 溯源 / 回放：共享时间轴 -->
            <template v-else-if="rightPanel === 'trace'">
              <div class="trace-head">
                <input v-model="traceId" placeholder="产品序列号" />
                <button class="btn mini" @click="startTrace">重新溯源</button>
              </div>
              <div class="timeline lh-scroll">
                <div v-for="(entry, index) in traceSchedule" :key="index" class="tl-item"
                  :class="{ done: index < traceIndex, cur: index === traceIndex }">
                  <i />
                  <div><b>{{ entry.name }}</b><span>{{ entry.time }}</span>
                    <p>{{ entry.detail || entry.step }}</p>
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="rightPanel === 'history'">
              <div class="replay">
                <button class="btn mini" @click="toggleReplay">{{ replaying ? '❚❚ 暂停' : '▶ 播放' }}</button>
                <input type="range" min="0" :max="history.length - 1" v-model.number="historyIndex"
                  @input="seekHistory(historyIndex)" />
                <select v-model.number="replaySpeed" class="speed">
                  <option :value="1">×60</option>
                  <option :value="4">×240</option>
                  <option :value="10">×600</option>
                </select>
              </div>
              <div class="replay-now">
                <b>{{ historyFrame ? fmtTime(historyFrame.time) : '' }}</b>
                <span>运行 {{ historyCounts.running }} · 待机 {{ historyCounts.idle }} · 停机 {{ historyCounts.stopped }} · <em>故障 {{ historyCounts.fault }}</em></span>
              </div>
              <div class="hist-bars">
                <div v-for="item in historyDevices" :key="item.id" class="hist-row">
                  <span>{{ item.id }}</span>
                  <div class="bar"><i v-for="(seg, k) in item.segments" :key="k"
                      :style="{ left: seg.from + '%', width: seg.width + '%', background: STATUS_META[seg.status].color }" />
                    <b v-for="ev in item.events" :key="ev.index + ev.kind" class="ev" :class="ev.kind" :style="{ left: ev.left + '%' }" />
                    <em :style="{ left: (historyIndex / (history.length - 1)) * 100 + '%' }" />
                  </div>
                </div>
              </div>
              <div class="ev-list lh-scroll">
                <div v-for="ev in historyEvents" :key="ev.index + ev.id + ev.kind" class="ev-item"
                  :class="[ev.kind, { past: ev.index <= historyIndex }]" @click="seekHistory(ev.index, true)">
                  <i /><span>{{ fmtTime(ev.time) }}</span><b>{{ ev.id }}</b>{{ ev.text }}
                </div>
              </div>
              <button class="btn ghost full" @click="closeHistory">退出回放，恢复实时</button>
            </template>

            <!-- 仓储 -->
            <template v-else-if="rightPanel === 'stock'">
              <div class="stat-grid three">
                <div><span>库位</span><b>{{ stock.capacity }}</b></div>
                <div><span>占用</span><b>{{ stock.occupied }}</b></div>
                <div><span>占用率</span><b>{{ stock.capacity ? Math.round((stock.occupied / stock.capacity) * 100) : 0
                    }}%</b></div>
              </div>
              <input class="search" v-model="stockQuery" placeholder="搜索 SKU / 货位 / 类别，回车定位"
                @keyup.enter="highlightStock(stockQuery)" />
              <div class="stock-list lh-scroll">
                <div v-for="item in filteredStock" :key="item.cell" class="stock-item"
                  @click="highlightStock(item.cell)">
                  <span class="cell">{{ item.cell }}</span><span class="sku">{{ item.sku }}</span>
                  <span class="cat" :style="{ color: catMeta(item.category).color }">{{ catMeta(item.category).name
                    }}</span><b>{{ item.qty }}</b>
                  <button class="btn mini" @click.stop="retrieve(item.cell)">出库</button>
                </div>
              </div>
            </template>

            <!-- 规划 -->
            <template v-else-if="rightPanel === 'plan'">
              <div class="plan-tools">
                <button class="btn" :class="{ on: layoutTool === 'translate' }"
                  @click="setLayoutTool('translate')">平移</button>
                <button class="btn" :class="{ on: layoutTool === 'rotate' }"
                  @click="setLayoutTool('rotate')">旋转</button>
                <button class="btn" @click="runWorkflow">作业仿真</button>
              </div>
              <div v-if="workflow" class="wf">
                <div class="stat-grid">
                  <div><span>单件周期</span><b>{{ workflow.leadTimeSeconds }}s <small
                        :class="deltaClass(workflow.delta && workflow.delta.leadTimeSeconds, true)">{{
                          fmtDelta(workflow.delta && workflow.delta.leadTimeSeconds) }}</small></b></div>
                  <div><span>产线节拍</span><b>{{ workflow.taktSeconds }}s</b></div>
                  <div><span>产能</span><b>{{ workflow.throughputPerHour }}/h <small
                        :class="deltaClass(workflow.delta && workflow.delta.throughputPerHour)">{{
                          fmtDelta(workflow.delta && workflow.delta.throughputPerHour) }}</small></b></div>
                  <div><span>瓶颈</span><b>{{ bottleneckText }}</b></div>
                </div>
                <div v-if="workflow.collisions && workflow.collisions.length" class="warn-line">存在设备冲突：{{
                  workflow.collisions.map(collisionText).join('、') }}</div>
              </div>
              <div class="plan-save">
                <input v-model="schemeName" placeholder="方案名称" />
                <button class="btn mini" @click="saveScheme">保存方案</button>
              </div>
              <div class="schemes lh-scroll">
                <div v-for="scheme in schemes" :key="scheme.id" class="scheme">
                  <b>{{ scheme.name }}</b><span>{{ fmtTime(scheme.time, true) }} · 移动 {{ scheme.moved }} 台</span>
                  <button class="btn mini" @click="applyScheme(scheme)">应用</button>
                  <button class="btn mini ghost" @click="deleteScheme(scheme)">删除</button>
                </div>
                <div v-if="!schemes.length" class="empty">尚无已保存方案</div>
              </div>
              <div class="plan-foot">
                <button class="btn ghost" @click="cancelPlanner">取消并复原</button>
                <button class="btn primary" @click="finishPlanner">完成编辑</button>
              </div>
            </template>

            <!-- 分析 -->
            <template v-else-if="rightPanel === 'analysis'">
              <div v-if="analysis === 'thermal'" class="thermal">
                <div v-if="!thermal.ready" class="empty">正在加载仿真结果…</div>
                <template v-else>
                  <div class="th-tabs">
                    <span :class="{ on: thermal.field === 'Temperature' }"
                      @click="setThermalField('Temperature')">温度场</span>
                    <span :class="{ on: thermal.field === 'ThermalDisplacement' }"
                      @click="setThermalField('ThermalDisplacement')">热变形</span>
                  </div>
                  <div class="stat-grid">
                    <div><span>预热时长</span><b>{{ thermalFrame.minute }}<small>min</small></b></div>
                    <div><span>最高温度</span><b :class="{ warn: thermalFrame.maxTemperature > 45 }">{{
                        thermalFrame.maxTemperature }}<small>℃</small></b></div>
                    <div><span>刀尖 Z 向漂移</span><b>{{ thermalFrame.toolTipDriftUm }}<small>μm</small></b></div>
                    <div><span>热稳定状态</span><b :class="thermalStable ? 'ok' : 'warn'">{{ thermalStable ? '已稳定' : '升温中'
                        }}</b></div>
                  </div>
                  <div class="replay">
                    <button class="btn mini" @click="toggleThermalPlay">{{ thermal.playing ? '暂停' : '播放' }}</button>
                    <input type="range" min="0" :max="thermal.frames.length - 1" v-model.number="thermal.frame"
                      @input="seekThermal" />
                    <b>{{ thermalFrame.minute }} min</b>
                  </div>
                  <p class="th-note">
                    主轴高速运转时前轴承温升最快，主轴受热伸长使刀尖向下漂移，直接影响精加工尺寸。
                    仿真显示预热约 40 min 后漂移趋于稳定（约 {{ thermal.frames[thermal.frames.length - 1].toolTipDriftUm }} μm）：
                    <em>建议开机预热 ≥ 40 min 后再执行 IT6 级精加工，或启用数控系统热伸长补偿。</em>
                  </p>
                </template>
              </div>
              <div v-else-if="analysis === 'safety'" class="legend-list">
                <div v-for="item in safetyList" :key="item.id" @click="flyToPoint(item.position)"><i
                    class="dot green" />{{
                  item.name }}<em>{{ item.id }}</em></div>
              </div>
              <div v-else-if="analysis === 'energy'" class="legend-list">
                <div v-for="item in meters" :key="item.id" @click="flyToPoint(item.position)"><i class="dot amber" />{{
                  item.name
                  }}<em>{{ (meterValues[item.id] || 0).toFixed(0) }} kW</em></div>
              </div>
              <div v-else class="legend-list">
                <div v-for="item in analysisRows" :key="item.id" @click="focus(item.id)">
                  <i class="dot" :style="{ background: item.color }" />{{ item.id }}<em>{{ item.text }}</em>
                </div>
              </div>
            </template>

            <!-- 默认：工艺路线 -->
            <template v-else>
              <div class="flow vertical lh-scroll">
                <div v-for="(step, index) in process" :key="step.station" class="flow-step" :title="step.detail"
                  @click="focus(step.station)">
                  <i>{{ index + 1 }}</i><span>{{ step.step }}</span><em>{{ step.station }}</em>
                </div>
              </div>
            </template>
          </div>
        </Box>
      </div>
    </template>
  </Layout>
</template>

<script>
import { mapState } from "vuex";
import Layout from "@/layout/index.vue";
import Box from "@/layout/box.vue";
import { STATUS_META, viewer, kit, hasKit, deviceOfNode, flyToView, isCancelled, createCameraZones } from "./lighthouse/twin";
import { createLive, drivenDevices, areaName } from "./lighthouse/live";
import { emitter } from "@/utils/eventBus";

const SCHEME_KEY = "lighthouse.layout.schemes";
const DISPOSAL_STEPS = ["现场确认告警属实", "停机挂牌 / 隔离风险", "排除故障并复测参数"];
// 自动巡检：每站飞到预置视角，并在关键设备 / 地点上方悬浮标注（主标签为讲解词，其余为设备实时状态）
const TOUR = [
  { view: "entrance", title: "厂房南侧主入口", text: "人员与物料分流，右侧为中央控制室", anchor: [-21, 4.2, 18],
    places: [{ title: "中央控制室", sub: "产线集中监控 · 调度", position: [-29.8, 4.2, 12.8] }, { title: "安全出口 S1", sub: "通往紧急集合点", position: [-30.6, 3.2, 18] }] },
  { view: "line", title: "精密零部件加工线 A", text: "上料 → 双 CNC → 焊接 → 探伤 → 包装 → 码垛", anchor: [-10, 3.4, -3.5],
    devices: ["LD-01", "CNC-01", "CNC-02", "RB-01", "WD-01", "XR-01", "PK-01"] },
  { view: "cnc", title: "五轴加工单元", text: "RB-01 地轨上下料，支持爆炸拆解查看主轴 / 刀库", device: "CNC-01", devices: ["CNC-02", "RB-01"] },
  { view: "warehouse", title: "立体仓库", text: "潜伏式 AGV 满托送达，堆垛机自动入库", device: "SC-01", devices: ["AGV-01"] },
  { view: "energy", title: "能源站", text: "压缩空气 / 冷冻水 / 变配电集中供能", anchor: [-24, 7.5, -27.5], devices: ["AC-01", "AC-02", "AR-01", "CH-01"] },
  { view: "overview", title: "灯塔工厂 · 厂区全景", text: "巡检完成，所有关键设备已覆盖", anchor: [0, 16, -2] },
];

// 非响应式的场景运行态（three 对象、定时器、事件句柄）
// 产线设备（停滞时显示待机）
const LINE_IDS = ["LD-01", "CNC-01", "CNC-02", "RB-01", "WD-01", "XR-01", "PK-01", "CV-01"];
// 应急疏散路线 [x, z]（米）：厂内只走通道，出门后沿外围道路到紧急集合点（x -40~-28, z 22.5~29.5）
const EVAC_ROUTES = [
  // 产线西段 / 加工单元 → 主通道 → 南侧物流大门
  { id: "S2", points: [[-8, 0.6], [-21, 0.6], [-21, 18], [-21, 21.5], [-28.6, 24.5]] },
  // 中央控制室 → 南侧安全出口
  { id: "S1", points: [[-25.2, 9.4], [-30.6, 9.4], [-30.6, 18], [-30.6, 21.5], [-32.4, 23.2]] },
  // 产线东段 / 包装 / 立体仓库 → 东侧通道 → 东侧物流大门 → 厂房南侧外围
  { id: "E1", points: [[8, 0.6], [13.4, 0.6], [13.4, -1], [36, -1], [38.6, -1], [38.6, 21.5], [-27.8, 21.5], [-28.6, 23.6]] },
  // 北侧（能源站方向）→ 北侧通道门 → 厂房西侧外围
  { id: "N1", points: [[-21.5, -16.8], [-21.5, -20.6], [-38.6, -20.6], [-38.6, 21.5], [-36, 23.2]] },
];
// 仿真云图与实体主轴原位重合时需隐藏的节点（主轴箱含电主轴、顶罩、防护门）
const THERMAL_HIDE = ["cnc01-head", "cnc01-panel-top", "cnc01-door", "cnc01-panel-front"];
const rt = { zones: null, thermalHidden: false, live: null, timer: null, offs: [], coverings: [], tourTimer: null, replayTimer: null, statsTimer: null, traceTimer: null, materialTimer: null, vtk: null, vtkTimer: null };
// CNC-01 主轴热仿真结果（VTK legacy 时间步），由 lighthouse-scene/vtk/build-spindle-vtk.mjs 生成到 public/vtk/
const THERMAL_BASE = "vtk/cnc01-spindle/";
const THERMAL_FIELDS = {
  Temperature: { range: [22, 52], title: "温度 ℃", colorMap: "turbo" },
  ThermalDisplacement: { range: [0, 52], title: "热变形 μm", colorMap: "coolwarm" },
};

export default {
  name: "LighthouseFactory",
  components: { Layout, Box },
  data() {
    return {
      STATUS_META,
      ready: false,
      bootText: "正在等待三维场景…",
      catalog: { devices: [], explodable: [], process: [], safety: [], exits: [], meters: [], views: [] },
      metrics: {},
      alarms: [],
      produced: 1286,
      selectedId: "",
      statusFilter: "",
      collapsed: {},
      alarmFilter: { range: "2", area: "", level: "", state: "open" },
      disposal: null,
      toast: null,
      hint: "",
      dockTab: "browse",
      dockTabs: [
        { id: "browse", name: "浏览" }, { id: "xray", name: "透视" }, { id: "sim", name: "仿真" }, { id: "stock", name: "仓储" },
        { id: "analysis", name: "分析" }, { id: "plan", name: "规划" }, { id: "env", name: "环境" },
      ],
      active: { walk: false, measure: false, area: false, follow: false, ao: false },
      followInfo: { productId: "", stepIndex: -1, step: "", done: false },
      followingId: "",
      linePaused: false,
      lineBusy: false,
      indoor: false,
      shipping: false,
      xrayMode: "off",
      rightPanel: "",
      prodStats: {},
      traceId: "",
      traceSchedule: [],
      traceIndex: -1,
      history: [],
      historyEvents: [],
      historyIndex: 0,
      replaySpeed: 4,
      replaying: false,
      stock: { capacity: 0, occupied: 0, items: [] },
      stockMode: "off",
      stockQuery: "",
      analysis: "",
      analysisRows: [],
      meterValues: {},
      layoutTool: "translate",
      workflow: null,
      schemes: [],
      schemeName: "",
      explodedId: "",
      part: null,
      materialOpen: false,
      material: { metalness: 0.5, roughness: 0.5 },
      minutes: 600,
      currentView: "overview",
      thermal: { ready: false, frames: [], frame: 0, playing: false, field: "Temperature" },
      touring: false,
      tourIndex: 0,
      tourPaused: false,
      tourCard: null,
    };
  },
  computed: {
    ...mapState(["isSceneAlready"]),
    views() {
      return this.catalog.views;
    },
    tourStops() {
      return TOUR;
    },
    process() {
      return this.catalog.process || [];
    },
    driven() {
      return drivenDevices(this.catalog.devices);
    },
    selected() {
      return this.catalog.devices.find((item) => item.id === this.selectedId) || null;
    },
    selectedMetric() {
      return this.metrics[this.selectedId] || null;
    },
    statusKpis() {
      const count = { running: 0, idle: 0, stopped: 0, fault: 0 };
      for (const item of Object.values(this.metrics)) count[item.status]++;
      return Object.keys(count).map((key) => ({ key, value: count[key], ...STATUS_META[key] }));
    },
    avgOee() {
      const list = Object.values(this.metrics);
      return list.length ? list.reduce((sum, item) => sum + (item.status === "running" ? item.oee : 0), 0) / list.length : 0;
    },
    totalPower() {
      return Object.values(this.metrics).reduce((sum, item) => sum + (item.status === "running" ? item.power : 0), 0);
    },
    deviceGroups() {
      const groups = {};
      for (const item of this.driven) {
        if (this.statusFilter && (this.metrics[item.id] || {}).status !== this.statusFilter) continue;
        (groups[item.area] = groups[item.area] || { area: item.area, name: areaName(item.area), items: [] }).items.push(item);
      }
      return Object.values(groups);
    },
    filteredAlarms() {
      const since = Date.now() - Number(this.alarmFilter.range) * 3600 * 1000;
      return this.alarms
        .filter((item) => item.time >= since)
        .filter((item) => !this.alarmFilter.area || item.area === this.alarmFilter.area)
        .filter((item) => !this.alarmFilter.level || item.level === this.alarmFilter.level)
        .filter((item) => !this.alarmFilter.state || item.state === this.alarmFilter.state)
        .sort((a, b) => b.time - a.time);
    },
    panelTitle() {
      return { production: "产品全流程跟随", trace: "生产溯源", history: "历史回放", stock: "库存管理", plan: "布局规划", analysis: this.analysisTitle }[this.rightPanel] || "工艺路线";
    },
    analysisTitle() {
      return { health: "设备健康度", radiation: "辐射剂量", energy: "能耗分布", safety: "安全设施与疏散", thermal: "CNC-01 主轴热—结构仿真" }[this.analysis] || "分析";
    },
    thermalFrame() {
      return this.thermal.frames[this.thermal.frame] || { minute: 0, maxTemperature: 0, toolTipDriftUm: 0 };
    },
    thermalStable() {
      const frames = this.thermal.frames;
      const last = frames[frames.length - 1];
      return Boolean(last) && last.toolTipDriftUm - this.thermalFrame.toolTipDriftUm <= 3;
    },
    historyFrame() {
      return this.history[this.historyIndex];
    },
    historyCounts() {
      const counts = { running: 0, idle: 0, stopped: 0, fault: 0 };
      const frame = this.historyFrame;
      if (frame) for (const status of Object.values(frame.states)) counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    historyDevices() {
      if (!this.history.length) return [];
      const total = this.history.length - 1;
      const ids = new Set(this.historyEvents.map((ev) => ev.id));
      return this.driven.filter((item) => item.area === "line-a" || item.id.startsWith("AC") || ids.has(item.id)).map((item) => {
        const segments = [];
        this.history.forEach((frame, index) => {
          const status = frame.states[item.id];
          const last = segments[segments.length - 1];
          if (last && last.status === status) last.to = index;
          else segments.push({ status, from: index, to: index });
        });
        const events = this.historyEvents.filter((ev) => ev.id === item.id).map((ev) => ({ ...ev, left: (ev.index / total) * 100 }));
        return { id: item.id, events, segments: segments.map((seg) => ({ status: seg.status, from: (seg.from / total) * 100, width: (Math.max(1, seg.to - seg.from + 1) / total) * 100 })) };
      });
    },
    filteredStock() {
      const query = this.stockQuery.trim().toLowerCase();
      const items = this.stock.items || [];
      return (query ? items.filter((item) => [item.cell, item.sku, item.category].some((value) => String(value).toLowerCase().includes(query))) : items).slice(0, 80);
    },
    safetyList() {
      return [...this.catalog.safety, ...this.catalog.exits, this.catalog.assemblyPoint].filter(Boolean);
    },
    meters() {
      return this.catalog.meters || [];
    },
    clock() {
      const h = Math.floor(this.minutes / 60), m = this.minutes % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    },
    bottleneckText() {
      const value = this.workflow && this.workflow.bottleneck;
      if (!value) return "-";
      return typeof value === "string" ? value : value.name || value.id || value.station || "-";
    },
  },
  watch: {
    isSceneAlready(value) {
      if (value) this.init();
    },
    rightPanel(value, old) {
      if (old === "trace" && value !== "trace") {
        clearInterval(rt.traceTimer);
        kit("stopTraceability").catch(() => { });
      }
      if (old === "analysis" && value !== "analysis") {
        this.clearAnalysis();
        this.analysis = "";
      }
      if (old === "history" && value !== "history") this.exitReplay();
    },
  },
  mounted() {
    this.schemes = JSON.parse(localStorage.getItem(SCHEME_KEY) || "[]");
    emitter.on("agentStep", this.onAgentStep);
    if (this.isSceneAlready) this.init();
  },
  beforeDestroy() {
    emitter.off("agentStep", this.onAgentStep);
    this.teardown();
  },
  methods: {
    areaName,
    catMeta(key) {
      return (this.stock.categories && this.stock.categories[key]) || { name: key, color: "#9fb6cf" };
    },
    /* ---------------------------------------------------------------- 启动 / 销毁 */
    async init() {
      if (this.ready || this.booting) return;
      this.booting = true;
      try {
        if (!hasKit()) {
          this.bootText = "当前交付码未包含灯塔工厂专属功能，请检查 config.json 的 deliveryCode";
          return;
        }
        this.bootText = "加载设备台账…";
        this.catalog = await kit("getCatalog");
        rt.live = createLive(this.catalog.devices);
        this.metrics = { ...rt.live.metrics };
        this.history = Object.freeze(rt.live.history.frames.slice());
        this.historyEvents = Object.freeze(rt.live.history.events.slice());
        this.historyIndex = this.history.length - 1;
        this.alarms = rt.live.seedAlarms();
        for (const alarm of this.alarms) if (alarm.state === "open" && alarm.level === "critical") rt.live.metrics[alarm.deviceId].status = "fault";

        await kit("setTimeOfDay", { minutes: this.minutes });
        await this.pushStates();
        for (const alarm of this.alarms.filter((item) => item.state === "open")) await kit("raiseAlarm", { id: alarm.deviceId, level: alarm.level, message: alarm.message });
        // 产品链路常态运转：投产 → 加工 → 包装 → 码垛 → AGV → 入库，一直保持（与设备四态数据流并行）
        await kit("startProduction", { speed: 1 });
        this.bindEvents();
        rt.zones = createCameraZones(this.catalog.workshop, (indoor) => { this.indoor = indoor; });
        await flyToView("overview", 1800).catch(() => { });
        rt.timer = setInterval(() => this.onTick(), 1000);
        this.ready = true;
        this.notify("灯塔工厂场景已就绪");
      } catch (error) {
        this.bootText = `初始化失败：${error.message}`;
        console.error(error);
      } finally {
        this.booting = false;
      }
    },
    bindEvents() {
      const v = viewer();
      rt.offs.push(v.events.on("selection.changed", (event) => this.onPick(event && event.selected)));
      // 覆盖物（安全设施 / 出口 POI）点击 → 镜头聚焦
      rt.offs.push(v.events.on("entity.click", (event) => {
        if (event && event.type === "Poi" && rt.coverings.includes(event.entity)) this.flyToPoint(event.entity.getLocation());
      }));
      // 距离测量结果（SDK 在场景中标注距离，面板同时提示）
      rt.offs.push(v.events.on("measurement.changed", (event) => {
        if (event && event.distance != null) this.notify(`距离 ${event.distance.toFixed(2)} m`);
      }));
    },
    async teardown() {
      clearInterval(rt.timer); clearInterval(rt.tourTimer); clearInterval(rt.replayTimer); clearInterval(rt.statsTimer); clearInterval(rt.traceTimer); clearInterval(rt.vtkTimer);
      rt.offs.forEach((off) => off && off()); rt.offs = [];
      try {
        if (rt.zones) rt.zones.dispose();
        rt.zones = null;
        if (this.active.measure) viewer().measurements.end();
        await this.clearCoverings();
        this.restoreThermalNodes();
        if (hasKit()) await kit("resetScene");
      } catch (error) { /* 场景已卸载 */ }
      rt.live = null;
    },

    /* ---------------------------------------------------------------- 实时数据 */
    async onTick() {
      if (!rt.live || this.rightPanel === "history") return;
      const raised = rt.live.tick();
      this.metrics = { ...rt.live.metrics };
      if (!this.linePaused) this.produced += Math.random() < 0.15 ? 1 : 0;
      for (const alarm of raised) await this.addAlarm(alarm);
      if (raised.length || (this.tickCount = (this.tickCount || 0) + 1) % 5 === 0) await this.pushStates();
    },
    async pushStates() {
      const states = Object.values(rt.live.metrics).map((item) => {
        // 产线停滞时，运行中的产线设备显示为待机（故障 / 停机保持原状态）
        const status = this.linePaused && LINE_IDS.includes(item.id) && item.status === "running" ? "idle" : item.status;
        return { id: item.id, status, speed: status === "running" ? 1 : 0 };
      });
      await kit("applyDeviceStates", { states });
    },
    async addAlarm(alarm) {
      this.alarms.unshift(alarm);
      this.metrics = { ...rt.live.metrics };
      await kit("raiseAlarm", { id: alarm.deviceId, level: alarm.level, message: alarm.message });
      await this.pushStates();
      this.notify(`${alarm.level === "critical" ? "紧急告警" : "预警"}：${alarm.deviceName} ${alarm.message}`, alarm.level === "critical" ? "error" : "info");
    },
    async injectFault() {
      const item = this.selected;
      if (!item || !rt.live || !rt.live.metrics[item.id]) return this.notify("该设备不接入实时数据", "error");
      rt.live.metrics[item.id].temperature = 86.4;
      await this.addAlarm(rt.live.makeAlarm(item, "critical", "温度 86.4℃ 超过阈值 75℃"));
      await this.focus(item.id);
    },

    /* ---------------------------------------------------------------- 选择 / 聚焦 */
    async onPick(ref) {
      if (!ref || !ref.nodeKey) { this.part = null; return; }
      if (this.rightPanel === "plan") return;
      const device = deviceOfNode(this.catalog.devices, ref.nodeKey);
      if (this.explodedId) {
        const info = await kit("getPartInfo", { node: ref.nodeKey }).catch(() => null);
        if (info) { this.part = info; return; }
      }
      if (device) this.selectedId = device.id;
    },
    async selectDevice(id) {
      this.selectedId = id;
      this.part = null;
      await this.focus(id);
    },
    async focus(id) {
      if (!id) return;
      await this.releaseCamera();
      this.selectedId = id;
      await kit("focusDevice", { id }).catch((error) => { if (!isCancelled(error)) this.notify(error.message, "error"); });
    },
    /** 收回被跟随 / 漫游占用的镜头（第一人称、产品跟随、设备跟随互斥）。 */
    async releaseCamera() {
      if (this.active.walk) await this.toggleWalk(false);
      if (this.followingId) { await kit("stopFollowDevice").catch(() => { }); this.followingId = ""; }
      if (this.active.follow) await this.stopFollowProduct();
    },
    async toggleFollowDevice() {
      const id = this.selectedId;
      if (this.followingId === id) {
        await kit("stopFollowDevice");
        this.followingId = "";
        this.hint = "";
        return;
      }
      await this.releaseCamera();
      try {
        const result = await kit("followDevice", { id });
        this.followingId = id;
        this.hint = result.mode === "chase" ? `第三人称跟随：${result.name}（随设备移动）` : `第三人称跟随：${result.name}（环绕观察）`;
      } catch (error) { this.notify(error.message, "error"); }
    },
    async locateAlarm(alarm) {
      await this.focus(alarm.deviceId);
    },
    toggleGroup(area) {
      this.$set(this.collapsed, area, !this.collapsed[area]);
    },
    statusColor(id) {
      const item = this.metrics[id];
      return item ? STATUS_META[item.status].color : "#5d6b7d";
    },
    statusLabel(id) {
      const item = this.metrics[id];
      return item ? STATUS_META[item.status].label : "无数据";
    },
    processOf(id) {
      return this.process.find((step) => step.station === id);
    },
    isExplodable(id) {
      return this.catalog.explodable.some((item) => item.id === id);
    },

    /* ---------------------------------------------------------------- 处置 */
    /** Agent 直接调用 customApi 只改了三维效果，这里把告警列表与设备状态同步过来（否则下一次 pushStates / raiseAlarm 会把效果恢复）。 */
    async onAgentStep(step) {
      if (!rt.live || !step || !step.ok) return;
      const calls = (step.sdkCalls || []).filter((call) => call.ok && call.depth === 0 && /^customApi\.(clearAlarm|raiseAlarm)$/.test(call.api));
      if (!calls.length && /^case_(clearAlarm|raiseAlarm)$/.test(step.name)) calls.push({ api: `customApi.${step.name.slice(5)}`, args: [step.args || {}] });
      let changed = false;
      for (const call of calls) {
        const params = (call.args && call.args[0]) || {};
        if (call.api === "customApi.clearAlarm") {
          for (const alarm of this.alarms) {
            if (alarm.state !== "open" || (params.id && alarm.deviceId !== params.id)) continue;
            Object.assign(alarm, { state: "closed", handler: "AI 助手", result: "已解除" });
            const metric = rt.live.metrics[alarm.deviceId];
            if (metric && metric.status === "fault") metric.status = "running";
            changed = true;
          }
        } else if (params.id && !this.alarms.some((item) => item.state === "open" && item.deviceId === params.id)) {
          const item = this.catalog && this.catalog.devices.find((device) => device.id === params.id);
          if (item && rt.live.metrics[item.id]) {
            this.alarms.unshift(rt.live.makeAlarm(item, params.level || "critical", params.message || "AI 助手触发"));
            changed = true;
          }
        }
      }
      if (!changed) return;
      this.metrics = { ...rt.live.metrics };
      await this.pushStates().catch(() => { });
    },
    openDisposal(alarm) {
      this.disposal = { alarm, steps: DISPOSAL_STEPS.map((text) => ({ text, done: false })), handler: "值班员 王工", result: "已修复恢复运行", note: "" };
      this.focus(alarm.deviceId);
    },
    async confirmDisposal() {
      const { alarm, handler, result } = this.disposal;
      alarm.state = "closed";
      alarm.handler = handler;
      alarm.result = result;
      const stillOpen = this.alarms.some((item) => item.state === "open" && item.deviceId === alarm.deviceId);
      if (!stillOpen) {
        await kit("clearAlarm", { id: alarm.deviceId });
        if (rt.live.metrics[alarm.deviceId]) {
          rt.live.metrics[alarm.deviceId].status = result === "转维修工单" ? "stopped" : "running";
          rt.live.metrics[alarm.deviceId].temperature = 42;
        }
        await this.pushStates();
      }
      this.metrics = { ...rt.live.metrics };
      this.disposal = null;
      this.notify(`${alarm.deviceName} 告警已处置：${result}`);
    },

    /* ---------------------------------------------------------------- 浏览 */
    async gotoView(id) {
      await this.releaseCamera();
      await flyToView(id).catch((error) => { if (!isCancelled(error)) this.notify(error.message, "error"); });
    },
    startTour() {
      this.stopTour();
      this.touring = true; this.tourIndex = -1; this.tourPaused = false;
      const token = (rt.tourToken = {});
      const next = async () => {
        if (this.tourPaused || rt.tourToken !== token || rt.tourBusy) return;
        rt.tourBusy = true;
        try {
          this.tourIndex++;
          if (this.tourIndex >= TOUR.length) return this.stopTour();
          const stop = TOUR[this.tourIndex];
          this.tourCard = { name: stop.title };
          await kit("clearSpotLabels").catch(() => { });
          await flyToView(stop.view, 2200).catch(() => { });
          if (rt.tourToken !== token) return;
          await kit("showSpotLabels", { items: this.tourSpots(stop) }).catch((error) => console.warn(error));
        } finally {
          rt.tourBusy = false;
        }
      };
      next();
      rt.tourTimer = setInterval(next, 7000);
    },
    /** 巡检站点 → 悬浮标注：主标签讲解，设备标签显示实时状态 */
    tourSpots(stop) {
      const status = (id) => {
        const m = this.metrics[id];
        if (!m) return "";
        const meta = STATUS_META[m.status] || { label: m.status };
        return `${meta.label} · ${m.temperature}℃ · ${m.power} kW`;
      };
      const name = (id) => (this.catalog.devices.find((item) => item.id === id) || { name: id }).name;
      const items = [];
      const primary = { title: stop.title, sub: stop.text, primary: true };
      if (stop.device) items.push({ ...primary, device: stop.device });
      else items.push({ ...primary, position: stop.anchor });
      for (const id of stop.devices || []) {
        const m = this.metrics[id];
        items.push({ device: id, title: `${id} ${name(id)}`, sub: status(id), accent: m ? (STATUS_META[m.status] || {}).color : undefined });
      }
      for (const place of stop.places || []) items.push({ ...place, accent: "#3dff86" });
      return items;
    },
    stopTour() {
      clearInterval(rt.tourTimer);
      rt.tourToken = null;
      if (this.touring && hasKit()) kit("clearSpotLabels").catch(() => { });
      this.touring = false; this.tourCard = null;
    },
    async toggleWalk(flyBack = true) {
      if (this.active.walk) {
        await kit("stopFirstPerson");
        this.active.walk = false; this.hint = "";
        if (flyBack) await flyToView("line", 900).catch(() => { });
      } else {
        await this.releaseCamera();
        await kit("startFirstPerson", {});
        this.active.walk = true;
        this.hint = "第一人称：WASD / 方向键移动，Shift 加速；右键拖拽转向，左键拖拽平移，滚轮前进/后退（与默认镜头一致）";
      }
    },
    toggleMeasure() {
      const m = viewer().measurements;
      if (this.active.measure) { m.end(); this.active.measure = false; this.hint = ""; }
      else { m.start(); this.active.measure = true; this.hint = "距离测量：在模型表面依次点击两点，Esc 退出"; }
    },
    async toggleArea() {
      if (this.active.area) {
        await kit("clearMeasurements"); this.active.area = false; this.hint = ""; return;
      }
      this.active.area = true;
      this.hint = "面积测量：单击加点，双击 / 回车完成，退格撤销，Esc 取消";
      try {
        const result = await kit("measureArea");
        if (result) this.notify(`面积 ${result.area.toFixed(2)} ㎡ · 周长 ${result.perimeter.toFixed(2)} m`);
      } catch (error) {
        this.active.area = false;
      } finally {
        this.hint = "";
      }
    },

    /* ---------------------------------------------------------------- 透视 */
    async setXray(mode) {
      await kit("xray", { mode });
      this.xrayMode = mode;
      if (mode === "underground") await flyToView("overview").catch(() => { });
    },

    /* ---------------------------------------------------------------- 产线运行 / 停滞 */
    async toggleLine() {
      if (this.lineBusy) return;
      if (this.rightPanel === "history") return this.notify("历史回放中，退出回放后再控制产线", "error");
      this.lineBusy = true;
      try {
        const paused = !this.linePaused;
        await kit("setProductionPaused", { paused });
        this.linePaused = paused;
        await this.pushStates();
        this.notify(paused ? "产线已停滞：工件、AGV、堆垛机原地冻结" : "产线恢复生产");
      } catch (error) {
        this.notify(error.message, "error");
      } finally {
        this.lineBusy = false;
      }
    },

    /* ---------------------------------------------------------------- 仿真 */
    /** 产品全流程跟随：产线常态运转，选中下一件投产产品，镜头全程跟随至入库。 */
    async toggleFollowProduct() {
      if (this.active.follow) return this.stopFollowProduct();
      await this.releaseCamera();
      const result = await kit("followProduct", {});
      this.active.follow = true;
      this.followInfo = { productId: result.productId, stepIndex: 0, step: "等待投产", done: false };
      this.rightPanel = "production";
      this.hint = `产品 ${result.productId} 全流程跟随中：上料 → 加工 → 焊接 → 探伤 → 包装 → 码垛 → AGV → 入库`;
      clearInterval(rt.statsTimer);
      rt.statsTimer = setInterval(async () => {
        const stats = await kit("getProductionStats").catch(() => null);
        if (!stats) return;
        this.prodStats = stats;
        if (stats.follow) this.followInfo = stats.follow;
        else if (this.active.follow) {
          // 跟随结束（已入库，镜头已还原）
          this.followInfo = { ...this.followInfo, done: true };
          this.active.follow = false;
          this.hint = "";
          clearInterval(rt.statsTimer);
          this.notify(`产品 ${this.followInfo.productId} 已完成全部工序并入库`);
        }
      }, 500);
    },
    async stopFollowProduct() {
      clearInterval(rt.statsTimer);
      await kit("stopFollowProduct").catch(() => { });
      this.active.follow = false;
      this.hint = "";
    },
    async startTrace() {
      clearInterval(rt.traceTimer);
      const result = await kit("playTraceability", { productId: this.traceId || undefined, follow: true });
      this.traceId = result.productId;
      this.traceSchedule = result.schedule;
      this.traceIndex = 0;
      this.rightPanel = "trace";
      rt.traceTimer = setInterval(async () => {
        const progress = await kit("getTraceProgress").catch(() => null);
        if (!progress) return;
        this.traceIndex = progress.done ? this.traceSchedule.length : progress.index;
        if (progress.done) clearInterval(rt.traceTimer);
      }, 400);
    },
    /* ---------------------------------------------------------------- 历史回放
     * 时序：时间轴以分钟为帧，播放按倍速推进，跨越的每一帧事件都会依次播报，不跳事件；
     * 状态：只下发与上一次画面不同的设备状态 / 告警（diff），三维调用串行合并，拖动时只渲染最终帧；
     * 动画：进入回放冻结实时产线与实时告警，退出时完整恢复实时状态。 */
    async openHistory() {
      if (this.rightPanel === "history") return;
      this.stopTour();
      if (this.active.follow) await this.stopFollowProduct();
      const built = rt.live.rebuildHistory();
      this.history = Object.freeze(built.frames);
      this.historyEvents = Object.freeze(built.events);
      rt.replay = { shownStates: {}, shownAlarms: {}, busy: false, pending: null, acc: 0, lastIndex: 0 };
      this.rightPanel = "history";
      this.replaying = false;
      // 冻结实时产线动画，清掉实时告警标记（回放期间三维只反映历史）
      await kit("setProductionPaused", { paused: true }).catch(() => { });
      await kit("clearAlarm", {}).catch(() => { });
      this.historyIndex = 0;
      await this.renderHistory(0);
      this.notify("历史回放：实时数据已暂停，可播放 / 拖动 / 点击事件跳转");
    },
    seekHistory(index, announce = false) {
      if (!rt.replay) return;
      this.historyIndex = Math.max(0, Math.min(this.history.length - 1, index));
      rt.replay.lastIndex = this.historyIndex;
      if (announce) {
        const ev = this.historyEvents.find((item) => item.index === this.historyIndex);
        if (ev) this.notify(`${this.fmtTime(ev.time)} ${ev.id} ${ev.text}`, ev.kind === "critical" ? "error" : "info");
      }
      this.renderHistory(this.historyIndex);
    },
    /** 串行渲染：同一时刻只有一次三维调用，期间新的目标帧只保留最后一个。 */
    async renderHistory(index) {
      const replay = rt.replay;
      if (!replay) return;
      if (replay.busy) { replay.pending = index; return; }
      replay.busy = true;
      try {
        let target = index;
        while (target != null && rt.replay === replay) {
          replay.pending = null;
          await this.applyHistoryFrame(this.history[target], replay);
          target = replay.pending;
        }
      } finally {
        replay.busy = false;
      }
    },
    async applyHistoryFrame(frame, replay) {
      if (!frame) return;
      const states = [];
      for (const [id, status] of Object.entries(frame.states)) {
        if (replay.shownStates[id] === status) continue;
        replay.shownStates[id] = status;
        states.push({ id, status, speed: status === "running" ? 1 : 0 });
      }
      if (states.length) await kit("applyDeviceStates", { states });
      const active = {};
      for (const alarm of frame.alarms) active[alarm.id] = alarm;
      for (const id of Object.keys(replay.shownAlarms)) {
        if (active[id] && active[id].level === replay.shownAlarms[id].level) continue;
        delete replay.shownAlarms[id];
        await kit("clearAlarm", { id }).catch(() => { });
      }
      for (const alarm of frame.alarms) {
        if (replay.shownAlarms[alarm.id]) continue;
        replay.shownAlarms[alarm.id] = alarm;
        await kit("raiseAlarm", { id: alarm.id, level: alarm.level, message: alarm.message }).catch(() => { });
      }
    },
    toggleReplay() {
      if (this.replaying) { clearInterval(rt.replayTimer); this.replaying = false; return; }
      if (!rt.replay) return;
      this.replaying = true;
      if (this.historyIndex >= this.history.length - 1) this.seekHistory(0);
      rt.replay.acc = 0;
      rt.replay.lastIndex = this.historyIndex;
      let last = performance.now();
      clearInterval(rt.replayTimer);
      rt.replayTimer = setInterval(() => {
        const replay = rt.replay;
        if (!replay) return;
        const now = performance.now();
        replay.acc += ((now - last) / 1000) * this.replaySpeed;
        last = now;
        const step = Math.floor(replay.acc);
        if (step <= 0) return;
        replay.acc -= step;
        const from = replay.lastIndex;
        const to = Math.min(this.history.length - 1, from + step);
        // 依次播报被跨越的事件（时序不丢）
        for (const ev of this.historyEvents) if (ev.index > from && ev.index <= to) this.notify(`${this.fmtTime(ev.time)} ${ev.id} ${ev.text}`, ev.kind === "critical" ? "error" : "info");
        replay.lastIndex = to;
        this.historyIndex = to;
        this.renderHistory(to);
        if (to >= this.history.length - 1) { clearInterval(rt.replayTimer); this.replaying = false; this.notify("回放结束，已到达当前时刻"); }
      }, 100);
    },
    async closeHistory() {
      this.rightPanel = "";
    },
    /** 退出回放：清掉历史告警，恢复实时设备状态、实时告警与产线运行状态。 */
    async exitReplay() {
      clearInterval(rt.replayTimer);
      this.replaying = false;
      const replay = rt.replay;
      rt.replay = null;
      if (!replay || !rt.live) return;
      while (replay.busy) await new Promise((resolve) => setTimeout(resolve, 30));
      await kit("clearAlarm", {}).catch(() => { });
      for (const alarm of this.alarms.filter((item) => item.state === "open")) await kit("raiseAlarm", { id: alarm.deviceId, level: alarm.level, message: alarm.message }).catch(() => { });
      await kit("setProductionPaused", { paused: this.linePaused }).catch(() => { });
      await this.pushStates();
      this.notify("已恢复实时数据");
    },

    /* ---------------------------------------------------------------- 仓储 */
    async setStockMode(mode) {
      this.stockMode = mode;
      await kit("showStock", { mode });
      if (mode === "off") { if (this.rightPanel === "stock") this.rightPanel = ""; return; }
      this.stock = await kit("getStock");
      this.rightPanel = "stock";
      flyToView("warehouse").catch(() => { });
    },
    async highlightStock(key) {
      if (!key) return;
      // 唯一命中时由专属功能自动聚焦到该货位
      const result = await kit("showStock", { mode: this.stockMode === "off" ? "category" : this.stockMode, highlight: key });
      const count = result.matches ? result.matches.length : 0;
      this.notify(count === 1 ? `已定位货位 ${result.matches[0].cell}` : count ? `定位 ${count} 个货位` : "未找到匹配货位", count ? "info" : "error");
    },
    async retrieve(cell) {
      if (this.shipping) return;
      this.shipping = true;
      await this.releaseCamera();
      // 室外装车段镜头会离开厂房：先解除室内约束，结束后按镜头位置重新判定
      if (rt.zones) rt.zones.release();
      this.notify(`出库作业：堆垛机取货 → 叉车装车（${cell}）`);
      this.hint = "出库作业中：堆垛机取货，叉车叉取后经东侧卷帘门装入厢式货车";
      try {
        const result = await kit("retrieveStock", { cell });
        this.notify(`${result.sku} × ${result.qty} 已装车，等待发运`);
        this.stock = await kit("getStock");
      } catch (error) {
        if (!isCancelled(error)) this.notify(error.message, "error");
      } finally {
        this.shipping = false;
        this.hint = "";
        if (rt.zones) rt.zones.evaluate();
      }
    },

    /* ---------------------------------------------------------------- 分析 */
    async toggleAnalysis(type) {
      await this.clearAnalysis();
      if (this.analysis === type) { this.analysis = ""; this.rightPanel = ""; return; }
      this.analysis = type;
      this.rightPanel = "analysis";
      if (type === "health" || type === "radiation") {
        const values = {};
        const source = type === "health"
          ? this.driven.filter((item) => item.kind.startsWith("equipment.") || item.kind.startsWith("energy."))
          : this.driven.filter((item) => item.area === "line-a" || item.kind.startsWith("radiation."));
        for (const item of source) {
          values[item.id] = type === "health"
            ? +Math.min(0.98, 0.3 + ([...item.id].reduce((sum, ch) => sum * 31 + ch.charCodeAt(0), 7) % 69) / 100).toFixed(2)
            : +(item.kind === "equipment.xray" ? 0.82 : item.kind.startsWith("radiation.") ? 0.35 : Math.random() * 0.15).toFixed(2);
        }
        const rows = await kit("setHealthView", { values, higherIsBetter: type === "health" });
        this.analysisRows = rows.map((row) => ({ id: row.id, color: row.color, text: type === "health" ? `${Math.round(row.value * 100)}%` : `${(row.value * 2.5).toFixed(2)} μSv/h` }));
        await flyToView("line").catch(() => { });
      } else if (type === "energy") {
        const features = [];
        for (const meter of this.meters) {
          const value = 30 + Math.random() * 70;
          this.$set(this.meterValues, meter.id, value * 4);
          features.push({ point: [meter.position[0], 0.6, meter.position[2]], value });
        }
        for (const item of this.driven) {
          if (!item.center) continue;
          const metric = this.metrics[item.id];
          features.push({ point: [item.center[0], 0.6, item.center[2]], value: metric && metric.status === "running" ? Math.min(100, 30 + metric.power * 4) : 8 });
        }
        rt.coverings.push(...(await viewer().scene.creates([{
          type: "HeatMap", entityName: "lh-energy",
          points: { features },
          heatMapStyle: { brushDiameter: 18, blendMode: "max", mappingValueRange: [1, 100], gradientSetting: ["1d4ed800", "06b6d4e6", "facc15f2", "f97316fa", "dc2626ff"] },
        }])));
        // 全鸟瞰 + 自动透视厂房与地下：能耗热力与隐蔽管网、地下环网同屏
        await kit("xray", { mode: "underground" });
        this.xrayMode = "underground";
        await this.releaseCamera();
        await viewer().camera.flyTo({ id: "lh-energy-bird", name: "能耗鸟瞰", position: [4, 128, 44], target: [0, 0, -6] }, 1600).catch(() => { });
      } else if (type === "safety") {
        const pois = [
          ...this.catalog.safety.map((item) => ({ type: "Poi", entityName: `lh-safe-${item.id}`, location: item.position, poiStyle: { preset: "safety", labelContent: [item.name, "ffffffff", "12"] } })),
          ...this.catalog.exits.map((item) => ({ type: "Poi", entityName: `lh-exit-${item.id}`, location: [item.position[0], 2.4, item.position[2]], poiStyle: { preset: "safety", labelContent: [item.name, "3dff86ff", "13"] } })),
        ];
        const point = this.catalog.assemblyPoint;
        if (point) pois.push({ type: "Poi", entityName: "lh-assembly", location: [point.position[0], 2.4, point.position[2]], poiStyle: { preset: "warning", labelContent: [point.name, "ffd23aff", "14"] } });
        // 疏散路线沿厂内通道（AGV 主通道 z≈0.6、东侧仓储通道 z=-1）走到最近出口，再沿厂区外围到紧急集合点，不穿越设备
        const paths = EVAC_ROUTES.map((route) => ({
          type: "Path", entityName: `lh-route-${route.id}`,
          polyline: { coordinates: route.points.map(([x, z]) => [x, 0.18, z]) },
          pathStyle: { preset: "emergency_exit" },
        }));
        rt.coverings.push(...(await viewer().scene.creates([...pois, ...paths])));
        await flyToView("overview").catch(() => { });
      } else if (type === "thermal") {
        await this.showThermal();
      }
    },
    /* ---------------------------------------------------------------- VTK 主轴热仿真（标准 SDK Vtk 实体） */
    async showThermal() {
      const tip = this.catalog.anchors && this.catalog.anchors["CNC-01.toolTip"];
      if (!tip) return this.notify("未找到 CNC-01 主轴", "error");
      const base = new URL(`${process.env.BASE_URL || "/"}${THERMAL_BASE}`, location.href).toString();
      const summary = await fetch(`${base}summary.json`).then((res) => res.json());
      this.thermal = { ready: false, frames: summary.frames, frame: 0, playing: true, field: "Temperature" };
      // 仿真模型与场景主轴 1:1（刀尖为原点）：隐藏实体主轴箱 / 电主轴与遮挡的顶罩、防护门，云图原位替换
      viewer().hierarchy.setNodeVisible(THERMAL_HIDE.map((nodeKey) => ({ entityId: "factory", nodeKey })), false);
      rt.thermalHidden = true;
      const style = THERMAL_FIELDS.Temperature;
      const [entity] = await viewer().scene.creates([{
        type: "Vtk", entityName: "lh-thermal",
        location: tip,
        source: { url: base + summary.frames[0].frame, format: "vtk", frames: summary.frames.map((item) => base + item.frame), times: summary.frames.map((item) => item.minute) },
        placement: { unit: "m", upAxis: "Y", anchor: "origin" },
        vtkStyle: { field: "Temperature", colorMap: style.colorMap, range: style.range, legend: { visible: true, position: "right", title: style.title } },
        vtkPlayer: { frame: 0, playing: true, fps: 1.5, loop: true },
      }]);
      rt.vtk = entity;
      rt.coverings.push(entity);
      this.thermal.ready = true;
      clearInterval(rt.vtkTimer);
      rt.vtkTimer = setInterval(() => {
        try { this.thermal.frame = rt.vtk.getInfo().currentFrame || 0; } catch (error) { /* 未加载完成 */ }
      }, 300);
      await this.releaseCamera();
      const [x, y, z] = tip;
      await viewer().camera.flyTo({ id: "lh-thermal", name: "主轴热仿真", position: [x + 2.3, y + 1.35, z + 3.9], target: [x, y + 0.75, z] }, 1400).catch(() => { });
    },
    restoreThermalNodes() {
      if (!rt.thermalHidden) return;
      rt.thermalHidden = false;
      try { viewer().hierarchy.setNodeVisible(THERMAL_HIDE.map((nodeKey) => ({ entityId: "factory", nodeKey })), true); } catch (error) { /* 场景已卸载 */ }
    },
    async setThermalField(field) {
      if (!rt.vtk) return;
      const style = THERMAL_FIELDS[field];
      this.thermal.field = field;
      await rt.vtk.update({ vtkStyle: { field, colorMap: style.colorMap, range: style.range, legend: { visible: true, position: "right", title: style.title } } });
    },
    async toggleThermalPlay() {
      if (!rt.vtk) return;
      this.thermal.playing = !this.thermal.playing;
      await (this.thermal.playing ? rt.vtk.play({ fps: 1.5, loop: true }) : rt.vtk.pause());
    },
    async seekThermal() {
      if (!rt.vtk) return;
      if (this.thermal.playing) { this.thermal.playing = false; await rt.vtk.pause(); }
      await rt.vtk.seek(this.thermal.frame);
    },
    async clearAnalysis() {
      clearInterval(rt.vtkTimer);
      rt.vtk = null;
      this.restoreThermalNodes();
      if (this.analysis === "health" || this.analysis === "radiation") await kit("clearHealthView");
      if (this.analysis === "energy" && this.xrayMode !== "off") { await kit("xray", { mode: "off" }); this.xrayMode = "off"; }
      await this.clearCoverings();
    },
    async clearCoverings() {
      if (rt.coverings.length) {
        await viewer().scene.delete(rt.coverings).catch(() => { });
        rt.coverings = [];
      }
    },
    async flyToPoint(position) {
      if (!position) return;
      await this.releaseCamera();
      const [x, y, z] = position;
      const w = this.catalog.workshop;
      const indoor = w && x > w.x0 && x < w.x1 && z > w.z0 && z < w.z1;
      // 厂房内点位：镜头留在厂房内（朝厂房中心一侧取景），避免穿墙；室外点位：斜俯视
      const pose = indoor
        ? { position: [Math.min(w.x1 - 1, Math.max(w.x0 + 1, x + (x > 0 ? -4.5 : 4.5))), Math.min(w.eave - 1.2, y + 3.2), Math.min(w.z1 - 1, Math.max(w.z0 + 1, z + (z > 0 ? -4.5 : 4.5)))], target: [x, y, z] }
        : { position: [x + 12, y + 10, z + 12], target: [x, y, z] };
      await viewer().camera.flyTo({ id: "lh-point", name: "point", ...pose }, 1100).catch(() => { });
    },

    /* ---------------------------------------------------------------- 规划 */
    async openPlanner() {
      this.rightPanel = "plan";
      await kit("startLayoutEdit", { mode: this.layoutTool, id: this.selectedId || undefined });
      await flyToView("line").catch(() => { });
      this.hint = "布局编辑：点选产线设备后拖拽，平移吸附 0.25 m，旋转 15°，红框表示冲突";
    },
    async setLayoutTool(mode) {
      this.layoutTool = mode;
      await kit("setLayoutTool", { mode });
    },
    async runWorkflow() {
      this.workflow = await kit("simulateWorkflow");
    },
    async saveScheme() {
      const layout = await kit("getLayout");
      const scheme = { id: Date.now(), name: this.schemeName || `方案 ${this.schemes.length + 1}`, time: Date.now(), moved: layout.filter((item) => item.moved).length, layout };
      this.schemes.unshift(scheme);
      localStorage.setItem(SCHEME_KEY, JSON.stringify(this.schemes));
      this.schemeName = "";
      this.notify(`已保存「${scheme.name}」`);
    },
    async applyScheme(scheme) {
      await kit("applyLayout", { layout: scheme.layout });
      this.workflow = await kit("simulateWorkflow");
    },
    deleteScheme(scheme) {
      this.schemes = this.schemes.filter((item) => item.id !== scheme.id);
      localStorage.setItem(SCHEME_KEY, JSON.stringify(this.schemes));
    },
    async cancelPlanner() {
      await kit("clearSimulation");
      await kit("stopLayoutEdit", { keep: false });
      this.closePlanner();
    },
    async finishPlanner() {
      await kit("clearSimulation");
      await kit("stopLayoutEdit", { keep: true });
      this.closePlanner();
    },
    closePlanner() {
      this.workflow = null; this.rightPanel = ""; this.hint = "";
    },
    fmtDelta(value) {
      if (value == null || value === 0) return "";
      return `${value > 0 ? "+" : ""}${typeof value === "number" ? +value.toFixed(1) : value}`;
    },
    deltaClass(value, lowerIsBetter) {
      if (!value) return "";
      return (lowerIsBetter ? value < 0 : value > 0) ? "good" : "bad";
    },
    collisionText(item) {
      return Array.isArray(item) ? item.join("↔") : typeof item === "string" ? item : [item.a, item.b].filter(Boolean).join("↔") || item.id;
    },

    /* ---------------------------------------------------------------- 设备 */
    async toggleExplode() {
      const id = this.selectedId;
      if (this.explodedId === id) {
        await kit("collapseDevice", { id });
        this.explodedId = ""; this.part = null;
      } else {
        if (this.explodedId) await kit("collapseDevice", { id: this.explodedId });
        await kit("explodeDevice", { id });
        this.explodedId = id;
      }
    },
    applyMaterial() {
      clearTimeout(rt.materialTimer);
      rt.materialTimer = setTimeout(() => kit("setMaterial", { id: this.selectedId, ...this.material }), 40);
    },
    async resetMaterial() {
      await kit("setMaterial", { id: this.selectedId, reset: true });
      this.material = { metalness: 0.5, roughness: 0.5 };
    },

    /* ---------------------------------------------------------------- 环境 */
    onTimeChange() {
      clearTimeout(this.timeTimer);
      this.timeTimer = setTimeout(() => kit("setTimeOfDay", { minutes: this.minutes }), 30);
    },
    async toggleAo() {
      const result = await kit("setAmbientOcclusion", { enabled: !this.active.ao });
      this.active.ao = Boolean(result.enabled);
    },

    /* ---------------------------------------------------------------- 通用 */
    async resetAll() {
      this.stopTour();
      rt.replay = null;
      clearInterval(rt.statsTimer); clearInterval(rt.traceTimer); clearInterval(rt.replayTimer); clearInterval(rt.vtkTimer);
      if (this.active.measure) viewer().measurements.end();
      await this.clearCoverings();
      this.restoreThermalNodes();
      await kit("resetScene");
      Object.keys(this.active).forEach((key) => { this.active[key] = false; });
      Object.assign(this, { xrayMode: "off", rightPanel: "", analysis: "", stockMode: "off", explodedId: "", part: null, workflow: null, hint: "", replaying: false, minutes: 600, followingId: "" });
      await kit("setTimeOfDay", { minutes: 600 });
      await this.pushStates();
      await kit("startProduction", { speed: 1 });
      if (this.linePaused) await kit("setProductionPaused", { paused: true });
      for (const alarm of this.alarms.filter((item) => item.state === "open")) await kit("raiseAlarm", { id: alarm.deviceId, level: alarm.level, message: alarm.message });
      await flyToView("overview").catch(() => { });
    },
    notify(text, type = "info") {
      this.toast = { text, type };
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toast = null; }, 3200);
    },
    fmtTime(time, full) {
      const d = new Date(time);
      const pad = (n) => String(n).padStart(2, "0");
      const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      return full ? `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${hm}` : hm;
    },
  },
};
</script>

<style lang="scss" scoped>
$cyan: #31aeff;
$line: rgba(49, 174, 255, 0.22);
$panel: rgba(8, 24, 44, 0.55);
$text: #d6e6f7;
$muted: #7f97b2;

.lh-col {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.lh-box--overview,
.lh-box--device {
  flex: 1.15;
  min-height: 0;
}

.lh-box--alarm,
.lh-box--panel {
  flex: 1;
  min-height: 0;
}

.lh-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  height: 100%;
  padding: 0.8rem 1rem;
  color: $text;
  font-size: 0.75rem;
  box-sizing: border-box;
  min-height: 0;
}

.lh-scroll {
  overflow-y: auto;
  min-height: 0;
  flex: 1;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #3b5674;
    border-radius: 3px;
  }
}

.empty {
  color: $muted;
  text-align: center;
  padding: 1.2rem 0;

  &.tall {
    padding-top: 4rem;
  }
}

.sub-title {
  color: $muted;
  font-size: 0.7rem;
  letter-spacing: 1px;

  em {
    font-style: normal;
    opacity: 0.6;
    margin-left: 0.4rem;
  }
}

.btn {
  height: 1.7rem;
  padding: 0 0.8rem;
  border: 1px solid rgba(49, 174, 255, 0.45);
  border-radius: 3px;
  background: linear-gradient(180deg, rgba(45, 154, 222, 0.22), rgba(45, 154, 222, 0.06));
  color: #dff1ff;
  font-size: 0.72rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: $cyan;
    box-shadow: 0 0 10px rgba(49, 174, 255, 0.45) inset;
  }

  &.on {
    background: linear-gradient(180deg, rgba(49, 174, 255, 0.75), rgba(45, 120, 222, 0.45));
    border-color: #8fd3ff;
    color: #fff;
  }

  &.ghost {
    background: transparent;
    border-color: rgba(127, 151, 178, 0.5);
    color: #b7c8db;
  }

  &.primary {
    background: linear-gradient(180deg, #31aeff, #1f6fd1);
    border-color: #8fd3ff;
    color: #fff;
  }

  &.mini {
    height: 1.3rem;
    padding: 0 0.5rem;
    font-size: 0.65rem;
  }

  &.full {
    width: 100%;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

select,
input:not([type]),
input[type="text"],
textarea,
.search {
  background: rgba(4, 16, 32, 0.7);
  border: 1px solid $line;
  color: $text;
  border-radius: 3px;
  font-size: 0.7rem;
  height: 1.5rem;
  padding: 0 0.4rem;
  outline: none;

  &:focus {
    border-color: $cyan;
  }
}

input[type="range"] {
  accent-color: $cyan;
}

/* 总览 */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}

.kpi {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.45rem 0;
  background: $panel;
  border: 1px solid $line;
  border-radius: 3px;
  cursor: pointer;
  position: relative;

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    position: absolute;
    top: 6px;
    left: 6px;
  }

  b {
    font-size: 1.25rem;
    font-family: DIN, "DINPro", sans-serif;
    color: #fff;
  }

  span {
    color: $muted;
    font-size: 0.65rem;
  }

  &.on {
    border-color: $cyan;
    box-shadow: 0 0 10px rgba(49, 174, 255, 0.35) inset;
  }
}

.kpi-line {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;

  div {
    background: linear-gradient(90deg, rgba(49, 174, 255, 0.16), transparent);
    border-left: 2px solid $cyan;
    padding: 0.3rem 0.5rem;
  }

  span {
    display: block;
    color: $muted;
    font-size: 0.62rem;
  }

  b {
    font-size: 1rem;
    color: #fff;

    small {
      font-size: 0.6rem;
      color: $muted;
      margin-left: 2px;
      font-weight: normal;
    }
  }
}

.tree-head {
  cursor: pointer;
  padding: 0.3rem 0.2rem;
  color: #9fd4ff;
  font-weight: bold;

  em {
    font-style: normal;
    color: $muted;
    margin-left: 0.4rem;
    font-weight: normal;
  }
}

.caret {
  display: inline-block;
  transition: transform 0.2s;
  margin-right: 0.3rem;

  &.open {
    transform: rotate(90deg);
  }
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.28rem 0.4rem 0.28rem 1rem;
  cursor: pointer;
  border-radius: 2px;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex: none;
  }

  font-size: 0.72rem;
  line-height: 1.2;

  .t-code {
    color: #9fb6cf;
    width: 3.6rem;
    flex: none;
    font-family: Consolas, monospace;
    font-size: 0.68rem;
    white-space: nowrap;
  }

  .t-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.72rem;
  }

  .t-state {
    font-size: 0.65rem;
  }

  &:hover {
    background: rgba(49, 174, 255, 0.1);
  }

  &.active {
    background: rgba(49, 174, 255, 0.22);
    box-shadow: inset 2px 0 0 $cyan;
  }
}

/* 告警 */
.filters {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.3rem;
}

.alarm {
  padding: 0.4rem 0.5rem;
  margin-bottom: 0.35rem;
  background: $panel;
  border: 1px solid $line;
  border-left: 3px solid #ffb02e;
  cursor: pointer;

  &.critical {
    border-left-color: #ff4d4f;
  }

  &.critical.open {
    animation: blink 1.6s infinite;
  }

  &.closed {
    opacity: 0.6;
  }

  &:hover {
    border-color: $cyan;
  }
}

@keyframes blink {
  50% {
    box-shadow: 0 0 12px rgba(255, 77, 79, 0.45) inset;
  }
}

.alarm-top {
  display: flex;
  align-items: center;
  gap: 0.35rem;

  .lv {
    font-size: 0.6rem;
    padding: 0 0.3rem;
    border-radius: 2px;
    background: rgba(255, 176, 46, 0.25);
    color: #ffcb6b;
  }

  em {
    color: $muted;
    font-style: normal;
    font-family: Consolas, monospace;
  }

  time {
    margin-left: auto;
    color: $muted;
    font-size: 0.65rem;
  }
}

.critical .alarm-top .lv {
  background: rgba(255, 77, 79, 0.25);
  color: #ff8a8a;
}

.alarm-msg {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.2rem;
  color: #c4d4e6;

  .done {
    color: #3dff86;
    font-size: 0.65rem;
  }
}

/* 主区域 */
.lh-main {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;

  >* {
    pointer-events: auto;
  }
}

.boot {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #cfe6ff;
  padding: 0.7rem 1.2rem;
  background: rgba(4, 16, 32, 0.75);
  border: 1px solid $line;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(49, 174, 255, 0.3);
  border-top-color: $cyan;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.toast {
  position: absolute;
  top: 10.2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1.2rem;
  font-size: 0.8rem;
  color: #fff;
  background: rgba(10, 40, 70, 0.9);
  border: 1px solid $cyan;
  box-shadow: 0 0 20px rgba(49, 174, 255, 0.35);

  &.error {
    border-color: #ff4d4f;
    background: rgba(70, 14, 18, 0.9);
    box-shadow: 0 0 20px rgba(255, 77, 79, 0.4);
  }
}

.line-switch {
  position: absolute;
  top: 6.1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0.55rem 0.45rem 0.9rem;
  border-radius: 2rem;
  color: #e6fff0;
  background: linear-gradient(90deg, rgba(6, 46, 30, 0.92), rgba(6, 30, 46, 0.92));
  border: 1px solid rgba(61, 255, 134, 0.55);
  box-shadow: 0 0 22px rgba(61, 255, 134, 0.25), inset 0 0 12px rgba(61, 255, 134, 0.12);
  backdrop-filter: blur(6px);

  .led {
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 50%;
    background: #3dff86;
    box-shadow: 0 0 10px #3dff86;
    animation: led 1.4s ease-in-out infinite;
  }

  .ls-text {
    display: flex;
    flex-direction: column;
    line-height: 1.25;

    b {
      font-size: 0.92rem;
      letter-spacing: 1px;
    }

    span {
      font-size: 0.62rem;
      color: rgba(214, 255, 230, 0.7);
    }
  }

  .ls-btn {
    height: 1.9rem;
    padding: 0 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(255, 120, 120, 0.7);
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: bold;
    letter-spacing: 1px;
    color: #fff;
    background: linear-gradient(180deg, #e5484d, #a8262b);
    box-shadow: 0 0 12px rgba(229, 72, 77, 0.45);
    transition: all 0.2s;

    &:hover:not(:disabled) {
      filter: brightness(1.15);
    }

    &:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  }

  &.paused {
    color: #fff4d6;
    border-color: rgba(255, 196, 58, 0.65);
    background: linear-gradient(90deg, rgba(56, 40, 6, 0.92), rgba(40, 30, 10, 0.92));
    box-shadow: 0 0 22px rgba(255, 196, 58, 0.25), inset 0 0 12px rgba(255, 196, 58, 0.12);

    .led {
      background: #ffc43a;
      box-shadow: 0 0 10px #ffc43a;
      animation: none;
    }

    .ls-text span {
      color: rgba(255, 236, 190, 0.7);
    }

    .ls-btn {
      border-color: rgba(61, 255, 134, 0.75);
      background: linear-gradient(180deg, #22c55e, #15803d);
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.45);
    }
  }
}

@keyframes led {
  50% {
    opacity: 0.35;
  }
}

.hint {
  position: absolute;
  bottom: 9.2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.35rem 1rem;
  font-size: 0.72rem;
  color: #dff1ff;
  background: rgba(4, 16, 32, 0.75);
  border: 1px dashed rgba(49, 174, 255, 0.5);
}

.tour-bar {
  position: absolute;
  top: 10.2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem 0.35rem 0.9rem;
  color: $text;
  font-size: 0.75rem;
  background: rgba(6, 22, 42, 0.86);
  border: 1px solid $line;
  border-radius: 1.2rem;
  backdrop-filter: blur(6px);

  .tour-title {
    color: $cyan;
    font-weight: 600;
    margin-right: 0.2rem;
  }

  .tour-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: rgba(148, 163, 184, 0.45);
    transition: all 0.3s;

    &.done { background: $cyan; }
    &.cur { width: 1.2rem; border-radius: 0.3rem; background: #facc15; }
  }

  b {
    min-width: 6rem;
    color: #fff;
    font-weight: 600;
  }
}

.dock {
  position: absolute;
  bottom: 3.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(80vw, 70rem);
  background: linear-gradient(180deg, rgba(8, 28, 52, 0.88), rgba(4, 14, 28, 0.92));
  border: 1px solid rgba(49, 174, 255, 0.35);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45), 0 0 18px rgba(49, 174, 255, 0.15) inset;
  backdrop-filter: blur(6px);
}

.dock-tabs {
  display: flex;
  border-bottom: 1px solid $line;

  span {
    flex: 1;
    text-align: center;
    padding: 0.4rem 0;
    color: $muted;
    font-size: 0.75rem;
    cursor: pointer;
    letter-spacing: 2px;
    transition: all 0.2s;
  }

  span.on {
    color: #fff;
    background: linear-gradient(0deg, rgba(49, 174, 255, 0.3), transparent);
    box-shadow: inset 0 -2px 0 $cyan;
  }
}

.dock-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.55rem 0.7rem;
  min-height: 2.8rem;
  box-sizing: border-box;

  .sep {
    width: 1px;
    height: 1.2rem;
    background: $line;
    margin: 0 0.2rem;
  }

  .grow {
    flex: 1;
  }
}

.view-select {
  height: 1.7rem;
  width: 7.5rem;
}

.inline {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: $muted;
  font-size: 0.72rem;

  b {
    color: #fff;
    min-width: 2.6rem;
  }

  &.wide input {
    width: 14rem;
  }
}

/* 弹窗 */
.modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 6, 14, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal {
  width: 30rem;
  padding: 1.1rem 1.3rem;
  color: $text;
  background: linear-gradient(180deg, #0b2441, #071629);
  border: 1px solid rgba(49, 174, 255, 0.5);
  box-shadow: 0 0 40px rgba(49, 174, 255, 0.25);

  h2 {
    margin: 0 0 0.8rem;
    font-size: 1.05rem;
    color: #fff;

    em {
      font-style: normal;
      color: $muted;
      font-size: 0.75rem;
      margin-left: 0.4rem;
    }
  }

  textarea {
    width: 100%;
    height: 3.6rem;
    padding: 0.4rem;
    box-sizing: border-box;
    margin-top: 0.6rem;
  }
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem 1rem;
  font-size: 0.75rem;

  span {
    display: block;
    color: $muted;
    font-size: 0.65rem;
  }

  .full {
    grid-column: span 2;
  }

  b.critical {
    color: #ff6b6b;
  }

  b.warning {
    color: #ffcb6b;
  }
}

.steps {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;

    &.done {
      color: #3dff86;
    }
  }
}

.form-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.7rem;
  font-size: 0.75rem;

  span {
    color: $muted;
    font-size: 0.72rem;
  }

  input {
    width: 7rem;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.8rem;
}

/* 设备详情 */
.dev-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  h2 {
    margin: 0;
    font-size: 1.05rem;
    color: #fff;
  }

  p {
    margin: 0.2rem 0 0;
    color: $muted;
  }
}

.chip {
  border: 1px solid;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-size: 0.68rem;
}

.dev-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;

  div {
    background: $panel;
    border: 1px solid $line;
    padding: 0.3rem 0.45rem;
  }

  span {
    display: block;
    color: $muted;
    font-size: 0.62rem;
  }

  b {
    color: #fff;
    font-size: 0.85rem;

    &.warn {
      color: #ff6b6b;
    }
  }
}

.process-chip {
  padding: 0.35rem 0.5rem;
  background: rgba(61, 255, 134, 0.08);
  border: 1px solid rgba(61, 255, 134, 0.3);
  color: #9bf5bf;

  em {
    color: $muted;
    font-style: normal;
    margin-left: 0.3rem;
  }
}

.dev-actions {
  display: flex;
  gap: 0.4rem;
}

.material {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $muted;

    input {
      flex: 1;
    }

    b {
      width: 2rem;
      color: #fff;
    }
  }
}

.part-card {
  padding: 0.5rem 0.6rem;
  border: 1px solid rgba(255, 210, 58, 0.5);
  background: rgba(255, 210, 58, 0.06);
  line-height: 1.7;

  span {
    color: $muted;
    margin-right: 0.5rem;
  }

  .part-title {
    color: #ffd23a;
    font-weight: bold;
  }
}

.part-tip {
  color: $muted;
  font-size: 0.68rem;
}

/* 右下面板 */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;

  &.three {
    grid-template-columns: repeat(3, 1fr);
  }

  div {
    background: $panel;
    border: 1px solid $line;
    padding: 0.35rem 0.5rem;
  }

  span {
    display: block;
    color: $muted;
    font-size: 0.62rem;
  }

  b {
    color: #fff;
    font-size: 0.95rem;

    small {
      font-size: 0.62rem;
      margin-left: 0.2rem;

      &.good {
        color: #3dff86;
      }

      &.bad {
        color: #ff6b6b;
      }
    }
  }

  .wide {
    grid-column: span 2;
  }

  b.action {
    font-size: 0.8rem;
    color: #ffd23a;
  }

  .action-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
  }

  .ring {
    flex: none;
    width: 1.6rem;
    height: 1.6rem;
    transform: rotate(-90deg);
    filter: drop-shadow(0 0 3px rgba(49, 174, 255, 0.45));

    .ring-track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.1);
      stroke-width: 3.6;
    }

    .ring-bar {
      fill: none;
      stroke: url(#lhRingGrad);
      stroke-width: 3.6;
      stroke-linecap: round;
      transition: stroke-dasharray 0.35s ease-out;
    }

    .ring-core {
      fill: #ffd23a;
      animation: lh-ring-pulse 1.2s ease-in-out infinite;
    }

    .ring-check {
      fill: none;
      stroke: #34d399;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      transform: rotate(90deg);
      transform-origin: 18px 18px;
    }

    &.is-done .ring-bar {
      stroke: #34d399;
    }
  }
}

@keyframes lh-ring-pulse {
  50% {
    opacity: 0.35;
  }
}

.flow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;

  &.vertical {
    flex-direction: column;
    flex-wrap: nowrap;
  }

  .flow-step {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.45rem;
    background: $panel;
    border: 1px solid $line;
    cursor: pointer;
    font-size: 0.72rem;
    line-height: 1.3;
  }

  .flow-step span {
    font-size: 0.72rem;
  }

  .flow-step:hover {
    border-color: $cyan;
  }

  i {
    font-style: normal;
    width: 1.1rem;
    height: 1.1rem;
    line-height: 1.1rem;
    text-align: center;
    border-radius: 50%;
    background: rgba(49, 174, 255, 0.3);
    color: #fff;
    font-size: 0.62rem;
  }

  em {
    margin-left: auto;
    color: $muted;
    font-style: normal;
    font-family: Consolas, monospace;
  }
}

.trace-head,
.plan-save {
  display: flex;
  gap: 0.4rem;

  input {
    flex: 1;
  }
}

.timeline {
  padding-left: 0.4rem;

  .tl-item {
    display: flex;
    gap: 0.6rem;
    position: relative;
    padding-bottom: 0.55rem;
    opacity: 0.5;
    transition: opacity 0.3s;
  }

  .tl-item::before {
    content: "";
    position: absolute;
    left: 4px;
    top: 12px;
    bottom: 0;
    width: 1px;
    background: $line;
  }

  .tl-item i {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 1px solid $cyan;
    margin-top: 3px;
    flex: none;
  }

  .tl-item.done {
    opacity: 0.85;

    i {
      background: $cyan;
    }
  }

  .tl-item.cur {
    opacity: 1;

    i {
      background: #ffd23a;
      border-color: #ffd23a;
      box-shadow: 0 0 8px #ffd23a;
    }

    b {
      color: #ffd23a;
    }
  }

  b {
    color: #fff;
  }

  span {
    margin-left: 0.5rem;
    color: $muted;
    font-size: 0.65rem;
  }

  p {
    margin: 0.1rem 0 0;
    color: #a9bdd2;
    font-size: 0.68rem;
  }
}

.replay {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input {
    flex: 1;
  }

  b {
    color: #fff;
    font-family: Consolas, monospace;
  }

  .speed {
    padding: 0.1rem 0.2rem;
    color: $text;
    font-size: 0.65rem;
    background: rgba(6, 22, 42, 0.9);
    border: 1px solid $line;
  }
}

.replay-now {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 0.45rem 0;
  font-size: 0.6rem;
  color: #9fb6cf;

  span {
    font-size: 0.6rem;
  }

  b {
    color: #fff;
    font-size: 0.8rem;
    font-family: Consolas, monospace;
  }

  em {
    color: #ff5a4f;
    font-style: normal;
  }
}

.hist-row .bar .ev {
  position: absolute;
  top: -0.15rem;
  width: 0.2rem;
  height: 0.85rem;
  margin-left: -0.1rem;
  border-radius: 0.1rem;
  background: #ffd23a;

  &.critical { background: #ff3b30; }
  &.clear { background: #3dff86; }
  &.stopped { background: #9aa4af; }
}

.ev-list {
  max-height: 7.5rem;
  margin: 0.4rem 0;
  overflow-y: auto;
  border-top: 1px solid $line;

  .ev-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.28rem 0.2rem;
    font-size: 0.68rem;
    color: #b9cde3;
    cursor: pointer;
    opacity: 0.55;

    &.past { opacity: 1; }
    &:hover { background: rgba(49, 174, 255, 0.1); }

    i {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
      background: #ffd23a;
    }

    &.critical i { background: #ff3b30; }
    &.clear i { background: #3dff86; }
    &.stopped i { background: #9aa4af; }

    span { color: #7f97b2; font-size: 0.6rem; font-family: Consolas, monospace; }
    b { color: #fff; font-size: 0.62rem; font-weight: 600; }
  }
}

.hist-bars {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.hist-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.25rem;

  span {
    width: 3.4rem;
    color: #9fb6cf;
    font-family: Consolas, monospace;
    font-size: 0.65rem;
  }

  .bar {
    flex: 1;
    height: 0.55rem;
    position: relative;
    background: rgba(255, 255, 255, 0.05);

    i {
      position: absolute;
      top: 0;
      bottom: 0;
      opacity: 0.75;
    }

    em {
      position: absolute;
      top: -2px;
      bottom: -2px;
      width: 2px;
      background: #fff;
      box-shadow: 0 0 6px #fff;
    }
  }
}

.stock-item {
  display: grid;
  grid-template-columns: 4.6rem 1fr 3.6rem 2rem auto;
  align-items: center;
  gap: 0.3rem;
  padding: 0.28rem 0.3rem;
  border-bottom: 1px dashed rgba(49, 174, 255, 0.12);
  cursor: pointer;
  font-size: 0.68rem;
  line-height: 1.3;

  span {
    font-size: 0.68rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cell {
    font-family: Consolas, monospace;
    color: #9fd4ff;
  }

  .cat {
    color: $muted;
  }

  b {
    color: #fff;
    text-align: right;
  }

  &:hover {
    background: rgba(49, 174, 255, 0.1);
  }
}

.plan-tools,
.plan-foot {
  display: flex;
  gap: 0.4rem;
}

.plan-foot {
  justify-content: flex-end;
}

.warn-line {
  color: #ff8a8a;
  margin-top: 0.3rem;
}

.scheme {
  display: grid;
  grid-template-columns: 1fr auto auto;
  grid-template-rows: auto auto;
  gap: 0 0.3rem;
  padding: 0.35rem;
  border-bottom: 1px dashed $line;
  align-items: center;

  b {
    color: #fff;
  }

  span {
    grid-row: 2;
    color: $muted;
    font-size: 0.62rem;
  }

  .btn {
    grid-row: span 2;
  }
}

.legend-list {
  overflow-y: auto;
  flex: 1;

  div {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.3rem 0.3rem;
    cursor: pointer;
    border-bottom: 1px dashed rgba(49, 174, 255, 0.12);

    &:hover {
      background: rgba(49, 174, 255, 0.1);
    }
  }

  em {
    margin-left: auto;
    font-style: normal;
    color: #fff;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.green {
      background: #3dff86;
    }

    &.amber {
      background: #ffb02e;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.thermal {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  flex: 1;
  min-height: 0;

  .th-tabs {
    display: flex;
    border: 1px solid $line;

    span {
      flex: 1;
      text-align: center;
      padding: 0.3rem 0;
      cursor: pointer;
      color: $muted;
      font-size: 0.72rem;
    }

    span.on {
      color: #fff;
      background: rgba(49, 174, 255, 0.35);
    }
  }

  b.warn {
    color: #ffb02e;
  }

  b.ok {
    color: #3dff86;
  }

  .th-note {
    margin: 0;
    font-size: 0.68rem;
    line-height: 1.7;
    color: #a9bdd2;

    em {
      font-style: normal;
      color: #ffd23a;
    }
  }
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
