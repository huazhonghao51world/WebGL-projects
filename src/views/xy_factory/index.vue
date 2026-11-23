<template>
  <section class="xy-campus" :class="{ 'xy-clean-view': panelsHidden }" aria-label="XY工厂园区">
    <XYAreaOverlay v-if="areaResult" :result="areaResult" />

    <!-- 顶栏：品牌 + 一级业务导航 + 时间与状态 -->
    <header class="xy-header">
      <div class="xy-brand">
        <div class="xy-mark"><XYIcon name="overview" /></div>
        <div><h1>XY 工厂数字孪生平台</h1><p>XY FACTORY · DIGITAL TWIN</p></div>
      </div>
      <nav class="xy-nav" aria-label="业务功能">
        <button v-for="item in modules" :key="item.id" type="button" :aria-pressed="activeId === item.id" :title="item.name" @click="setModule(item.id)"><XYIcon :name="item.icon" /><span>{{ item.name }}</span></button>
      </nav>
      <div class="xy-header-actions">
        <div class="xy-clock"><strong>{{ clock.time }}</strong><span>{{ clock.date }}</span></div>
        <div class="xy-weather"><strong>14.2°C</strong><span>多云 · AQI 46</span></div>
        <button type="button" class="xy-icon-button" title="园区助手" @click="pending('园区智能助手')"><XYIcon name="assistant" /></button>
        <button type="button" class="xy-icon-button" :aria-pressed="panelsHidden" :title="panelsHidden ? '展开面板' : '收起面板'" @click="panelsHidden = !panelsHidden"><XYIcon name="panel" /></button>
        <router-link to="/page_2/2" class="xy-switch">灯塔工厂 <XYIcon name="arrow" /></router-link>
      </div>
    </header>

    <!-- 面包屑：园区 / 楼栋 / 楼层 -->
    <div class="xy-crumb">
      <button type="button" @click="reset">XY 工厂园区</button>
      <template v-if="selected"><i>/</i><button type="button" @click="select(selectedId)">{{ selected.name }}</button></template>
      <template v-if="floor"><i>/</i><span>{{ floor }}</span></template>
      <span class="xy-asof">演示数据 · 截至 {{ asOf }}</span><span class="xy-live"><span class="dot" :class="{ online: isReady }"></span>{{ statusLabel }}<FpsCounter v-if="isReady" compact /><button v-if="sceneStatus.state === 'error'" type="button" @click="retry">重试</button></span>
    </div>

    <XYDashboard v-if="!panelsHidden" :mod="activeId" :camera-count="cameras.length" :building-names="buildingNames" :alarms="alarmData"
      @module="setModule" @locate="locate" @device="openDevice" @alarms="openAlarms" @cameras="openCameras" @pending="pending">
      <template #motion>
        <div class="xy-slot-card"><XYBusinessPanel :module="productionModule" :ready="isReady" :motion="motion" @motion="onMotion" /></div>
      </template>
      <template #environment>
        <div class="xy-slot-card"><XYBusinessPanel :module="environmentModule" :ready="isReady" @time="setLightTime" @weather="setWeather" @reset-environment="restoreEnvironment" /></div>
      </template>
    </XYDashboard>

    <!-- 中部浮层：楼栋 / 摄像头 选中卡片 -->
    <div v-if="selected && !panelsHidden" class="xy-focus-card">
      <header><XYIcon :name="selected.kind === 'camera' ? 'camera' : 'building'" /><strong>{{ selected.name }}</strong><button type="button" aria-label="关闭" @click="clearPoint">×</button></header>
      <template v-if="selected.kind === 'camera'">
        <p>安装位置已标定，视频流待接入。</p>
        <button type="button" class="xy-btn" @click="pending('实时视频')">查看实时视频</button>
      </template>
      <template v-else>
        <dl v-if="profileOf(selectedId)" class="xy-facts">
          <div><dt>用途</dt><dd>{{ profileOf(selectedId).use }}</dd></div>
          <div><dt>面积</dt><dd>{{ profileOf(selectedId).area.toLocaleString() }} m²</dd></div>
          <div><dt>楼层</dt><dd>{{ profileOf(selectedId).floors }} 层</dd></div>
          <div><dt>人员</dt><dd>{{ profileOf(selectedId).people }} 人</dd></div>
        </dl>
        <p v-if="profileOf(selectedId)">{{ profileOf(selectedId).note }}</p>
        <div v-if="buildingFloors.length" class="xy-floors" role="group" aria-label="楼层">
          <button type="button" :aria-pressed="!floor" @click="select(selectedId)">整栋</button>
          <button v-for="level in buildingFloors" :key="level" type="button" :aria-pressed="floor === level" @click="pickFloor(level)">{{ level }}</button>
        </div>
      </template>
    </div>

    <!-- 底部场景工具条（对齐灯塔工厂工具集） -->
    <div class="xy-scene-tools">
      <div v-if="areaResult" class="xy-note xy-area-readout">
        <strong v-if="areaResult.metrics">{{ areaPicking ? '预览' : '结果' }} · 面积 {{ areaResult.metrics.area.toFixed(2) }} m² · 周长 {{ areaResult.metrics.perimeter.toFixed(2) }} m</strong>
        <span>{{ areaPicking ? `${areaResult.count} 个顶点 · 单击取点，双击 / 回车完成，退格撤销，Esc 取消` : '水平投影面积 · 点击清除测面或按 Esc 关闭' }}</span>
      </div>
      <div v-else-if="message" class="xy-note" role="status">{{ message }}</div>
      <nav class="xy-tools" aria-label="三维场景工具">
        <div v-for="group in toolGroups.slice(0, 2)" :key="group.name" class="xy-tool-group">
          <button v-for="t in group.items" :key="t.id" type="button" :aria-pressed="toolActive(t.id)" :disabled="t.scene && !isReady" :title="t.name" @click="runTool(t)">
            <XYIcon :name="t.icon" /><span>{{ t.name }}</span><i v-if="t.pending" class="soon">建设中</i>
          </button>
        </div>
        <div class="xy-tool-group">
          <button type="button" :aria-pressed="toolActive('cameras')" :disabled="!isReady" title="监控点" @click="toggleCameras"><XYIcon name="camera" /><span>监控点</span></button>
          <button type="button" :aria-pressed="layersOpen" :aria-expanded="layersOpen" title="专题图层" @click="layersOpen = !layersOpen"><XYIcon name="layout" /><span>专题图层</span></button>
        </div>
        <div v-if="layersOpen" class="xy-layer-pop" role="menu">
          <button v-for="t in toolGroups[2].items.filter((x) => x.pending)" :key="t.id" type="button" role="menuitem" @click="layersOpen = false; runTool(t)"><XYIcon :name="t.icon" /><span>{{ t.name }}</span><i class="soon">建设中</i></button>
        </div>      </nav>
    </div>

    <!-- 弹窗：告警中心 -->
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
                <td><button type="button" class="link" @click="locate(a.building); dialog = null">定位</button><button v-if="a.state === '未处置'" type="button" class="link" @click="alarmId = a.id">处置</button></td>
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

        <template v-else-if="dialog.type === 'device' && device">
          <div class="xy-device">
            <dl class="xy-facts">
              <div><dt>编号</dt><dd>{{ device.id }}</dd></div><div><dt>类型</dt><dd>{{ device.type }}</dd></div>
              <div><dt>位置</dt><dd>{{ buildingNames[device.building] || '杂物房' }} {{ device.floor }}</dd></div><div><dt>状态</dt><dd>{{ device.status }}</dd></div>
              <div><dt>健康度</dt><dd>{{ device.health }} 分</dd></div><div><dt>温度</dt><dd>{{ device.temp }} °C</dd></div>
              <div><dt>功率</dt><dd>{{ device.power }} kW</dd></div><div><dt>累计运行</dt><dd>{{ device.hours.toLocaleString() }} h</dd></div>
            </dl>
            <div class="xy-dialog-actions">
              <button type="button" class="xy-btn" @click="locate(device.building, device.floor); dialog = null">聚焦设备所在楼层</button>
              <button type="button" class="xy-btn ghost" @click="pending('部件拆解')">部件拆解</button>
              <button type="button" class="xy-btn ghost" @click="pending('材质调节')">材质调节</button>
              <button type="button" class="xy-btn ghost" @click="pending('设备远程控制')">设备控制</button>
            </div>
          </div>
        </template>

        <template v-else-if="dialog.type === 'pending'">
          <div class="xy-pending"><XYIcon name="info" /><p><strong>「{{ dialog.feature }}」功能正在开发中</strong>该入口已预置，功能上线后将在此直接打开，敬请期待。</p></div>
          <div class="xy-dialog-actions"><button type="button" class="xy-btn" @click="dialog = null">我知道了</button></div>
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
import { startAreaMeasurement } from "@/utils/twin/areaMeasurement";
import { buildCampus, campus, floors, publishedAnchors } from "./campus";
import { connectCampus } from "./sceneAdapter";
import { connectMotion, idleMotion } from "./motion";
import { applySceneProfile } from "./sceneProfile";
import XYAreaOverlay from "./areaOverlay.vue";
import XYBusinessPanel from "./businessPanel.vue";
import XYIcon from "./icons.vue";
import XYDashboard from "./dashboard.vue";
import { modules, tourIds, toolGroups, productionModule, environmentModule } from "./operations";
import { alarms, devices, buildingProfiles, AS_OF } from "./dashboardData";

const two = (n) => String(n).padStart(2, "0");

export default {
  name: "XYFactory",
  components: { FpsCounter, XYAreaOverlay, XYBusinessPanel, XYIcon, XYDashboard },
  data: () => ({
    campus, floors, modules, toolGroups, productionModule, environmentModule,
    asOf: AS_OF, activeId: "overview", panelsHidden: false, selectedId: "", floor: null, availableFloors: [],
    showCameras: false, touring: false, measuring: false, areaResult: null, walking: false, message: "", motion: { ...idleMotion }, profile: null,
    now: new Date(), layersOpen: false, dialog: null, alarmData: alarms.map((a) => ({ ...a })), alarmFilter: { level: "", state: "" }, alarmId: "",
    handleForm: { user: "", result: "已修复恢复运行" }, deviceId: "",
  }),
  computed: {
    clock() {
      const n = this.now;
      return { time: `${two(n.getHours())}:${two(n.getMinutes())}:${two(n.getSeconds())}`, date: `${n.getFullYear()}-${two(n.getMonth() + 1)}-${two(n.getDate())} 星期${"日一二三四五六"[n.getDay()]}` };
    },
    buildingNames() { return Object.fromEntries(this.buildings.map((b) => [b.id, b.name])); },
    filteredAlarms() { return this.alarmData.filter((a) => (!this.alarmFilter.level || a.level === this.alarmFilter.level) && (!this.alarmFilter.state || a.state === this.alarmFilter.state)); },
    handling() { return this.alarmData.find((a) => a.id === this.alarmId && a.state === "未处置"); },
    device() { return devices.find((d) => d.id === this.deviceId); },
    ...mapState(["sceneStatus", "isSceneAlready"]),
    isReady() { return this.isSceneAlready && this.sceneStatus.caseKey === "xy" && this.sceneStatus.state === "ready"; },
    isLoading() { return this.sceneStatus.caseKey !== "xy" || this.sceneStatus.state === "loading"; },
    areaPicking() { return Boolean(this.areaResult && this.areaResult.active); },
    buildings() { return this.campus.buildings; },
    cameras() { return this.campus.cameras; },
    selected() { return this.campus.anchors.find(({ id }) => id === this.selectedId); },
    selectedPosition() {
      const offset = this.isReady ? this.$store.state.twinConfig.xy.anchorOffset || [] : [];
      return this.selected.position.map((value, index) => value + (Number(offset[index]) || 0));
    },
    buildingFloors() { return floors[this.selectedId] || []; },
    statusLabel() {
      if (this.isReady) return this.profile && this.profile.version ? `实时三维视图 · 场景配置 ${this.profile.version}${this.profile.ok ? "" : "（未生效）"}` : "实时三维视图";
      return this.sceneStatus.state === "error" ? "静态预览 · 连接失败" : "静态预览 · 三维尚未配置";
    },
  },
  watch: { isReady(ready) { if (ready) this.attach(); else this.detach(); } },
  mounted() {
    emitter.on("sceneUpdated", this.attach);
    document.addEventListener("visibilitychange", this.onVisibility);
    if (this.isReady) this.attach();
    this.clockTimer = setInterval(() => { this.now = new Date(); }, 1000);
    window.addEventListener("keydown", this.onKey);
  },
  beforeDestroy() {
    clearInterval(this.clockTimer);
    window.removeEventListener("keydown", this.onKey);
    emitter.off("sceneUpdated", this.attach);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.detach();
  },
  methods: {
    attach() {
      if (!this.isReady) return;
      this.detach();
      const xy = this.$store.state.twinConfig.xy || {};
      const offset = Array.isArray(xy.anchorOffset) ? xy.anchorOffset : [0, 0, 0];
      const published = publishedAnchors(getTwinApp().viewer);
      if (published) this.campus = Object.freeze(buildCampus(published));
      const { anchors, demoDevice } = this.campus;
      if (this.selectedId && !this.selected) { this.selectedId = ""; this.floor = null; }
      this.scenePoints = [...anchors, demoDevice].map((point) => ({ ...point, position: point.position.map((value, index) => value + (Number(offset[index]) || 0)) }));
      try {
        const adapter = connectCampus(this.scenePoints, (id, isPoi) => {
          if (this.measuring || this.areaPicking) return;
          this.stopTour();
          if (id === demoDevice.id) { this.activeId = "device"; return; }
          this.select(id, !isPoi && id === this.selectedId ? this.floor : null, isPoi);
        }, { showCameras: this.showCameras, poiStyles: xy.poiStyles });
        this.adapter = adapter;
        this.run(adapter.ready);
        if (this.selected) this.select(this.selectedId, this.floor, false);
        this.measureViewer = getTwinApp().viewer;
        this.motionPlayer = connectMotion((next) => { this.motion = next; });
        this.motion = this.motionPlayer.snapshot();
        applySceneProfile().then((profile) => { if (this.adapter === adapter) this.profile = profile; });
        this.offMeasure = this.measureViewer.events.on("measurement.changed", (event) => {
          this.measuring = this.measureViewer.measurements.isActive();
          this.message = !this.measuring ? "" : !event || event.distance == null ? "依次点击两个模型表面，Esc 退出" : `距离 ${event.distance.toFixed(2)} m`;
        });
      } catch (error) { this.message = `点位未能加载：${error.message}`; }
    },
    detach() {
      this.stopTour();
      if (this.motionPlayer) this.motionPlayer.dispose();
      this.motionPlayer = null;
      this.motion = { ...idleMotion };
      this.profile = null;
      if (this.offMeasure) this.offMeasure();
      this.offMeasure = null;
      this.endSpatialTools();
      this.measureViewer = null;
      if (this.adapter) this.adapter.dispose();
      this.adapter = null;
      this.measuring = false;
      this.walking = false;
      this.availableFloors = [];
    },
    run(action) {
      const adapter = this.adapter;
      Promise.resolve().then(action instanceof Function ? action : () => action).catch((error) => { if (this.adapter === adapter) this.message = error.message; });
    },
    setModule(id) { this.stopTour(); this.activeId = id; },
    profileOf(id) { return buildingProfiles[id]; },
    pending(feature) { this.dialog = { type: "pending", title: "功能建设中", feature }; },
    openAlarms(id = "") { this.alarmId = id; this.alarmFilter = { level: "", state: "" }; this.dialog = { type: "alarms", title: "告警中心" }; },
    openDevice(id) { this.deviceId = id; const d = devices.find((x) => x.id === id); this.dialog = { type: "device", title: d ? d.name : "设备详情" }; },
    openCameras() { if (this.adapter && !this.showCameras) this.toggleCameras(); this.message = `已在场景中显示 ${this.cameras.length} 个监控点位`; },
    handleAlarm() {
      const a = this.handling;
      if (!a || !this.handleForm.user) return;
      Object.assign(a, { state: "已处置", result: this.handleForm.result, user: this.handleForm.user });
      this.alarmId = "";
      this.handleForm = { user: "", result: "已修复恢复运行" };
    },
    locate(id, level = null) {
      if (!this.campus.anchors.some((x) => x.id === id)) { this.message = "该位置暂无三维点位"; return; }
      this.stopTour();
      this.select(id, level);
      if (level && !this.availableFloors.includes(level)) this.message = this.isReady ? `${level} 楼层构件未交付，已定位到整栋` : "三维场景连接后可切换楼层";
    },
    pickFloor(level) {
      if (!this.availableFloors.includes(level)) { this.message = this.isReady ? `${level} 楼层构件未交付` : "三维场景连接后可切换楼层"; return; }
      this.select(this.selectedId, level);
    },
    toolActive(id) {
      return { tour: this.touring, walk: this.walking, measure: this.measuring, area: Boolean(this.areaResult), cameras: this.showCameras }[id] || false;
    },
    runTool(tool) {
      if (tool.pending) { this.pending(tool.name); return; }
      ({ reset: this.reset, tour: this.toggleTour, walk: this.toggleWalk, measure: this.toggleMeasure, area: this.toggleArea, cameras: this.toggleCameras })[tool.id]();
    },
    onKey(event) { if (event.key === "Escape" && this.dialog) this.dialog = null; },    clearPoint() {
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
      this.releaseMotionCamera();
      this.selectedId = "";
      this.floor = null;
      this.message = "";
      this.endSpatialTools();
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
      const measure = this.measureViewer.measurements;
      if (measure.isActive()) measure.end(); else measure.start();
      this.measuring = measure.isActive();
      this.message = this.measuring ? "依次点击两个模型表面，Esc 退出" : "";
    },
    endSpatialTools() {
      const viewer = this.measureViewer;
      this.clearArea();
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
    toggleTour() {
      if (this.touring) { this.stopTour(); return; }
      if (!this.adapter) return;
      this.endSpatialTools();
      this.releaseMotionCamera();
      this.touring = true;
      let step = 0;
      const visit = () => {
        if (!this.touring || !this.adapter) return;
        if (step === tourIds.length) { this.reset(); return; }
        this.select(tourIds[step]);
        this.message = `园区巡检 ${step + 1} / ${tourIds.length} · ${this.selected.name}`;
        step += 1;
        this.tourTimer = setTimeout(visit, 3800);
      };
      visit();
    },
    stopTour() {
      clearTimeout(this.tourTimer);
      if (this.touring) this.message = "";
      this.touring = false;
    },
    onVisibility() { if (document.hidden) this.stopTour(); },
    setLightTime(time) { if (this.adapter) this.run(() => this.adapter.setTime(time)); },
    setWeather(weather) { if (this.adapter) this.run(() => this.adapter.setWeather(weather)); },
    restoreEnvironment() { if (this.adapter) this.run(() => this.adapter.restoreEnvironment()); },
    retry() { emitter.emit("sceneRetry"); },
    onMotion(command, value) {
      const player = this.motionPlayer;
      if (!player) return;
      const camerasTaken = this.motion.follow && this.motion.cameras;
      if ((command === "toggle" && camerasTaken) || (command === "follow" && value)) {
        this.stopTour();
        this.endSpatialTools();
      }
      this.run(async () => {
        if ((command === "toggle" && camerasTaken) || (command === "follow" && value)) await this.leaveWalk();
        if (this.motionPlayer !== player) return;
        if (command === "toggle") player.toggle();
        else if (command === "stop") player.stop();
        else if (command === "seek") player.seek(value);
        else if (command === "rate") player.setRate(value);
        else if (command === "loop") player.setLoop(value);
        else if (command === "follow") player.setFollow(value);
      });
    },
    /** 运镜接管相机时先结束，避免全景、聚焦、漫游与场景镜头争抢。 */
    releaseMotionCamera() {
      if (this.motionPlayer && this.motion.follow && this.motion.shot !== null) this.motionPlayer.setFollow(false);
    },
  },
};
</script>

<style scoped src="./campus.css"></style>

