<template>
  <div class="twin-scene" :class="`twin-scene--${phase}`" :aria-busy="phase === 'loading'">
    <div ref="player" id="player" :aria-hidden="phase !== 'ready'"></div>
    <div v-if="caseKey === 'xy'" class="twin-scene__preview" :aria-hidden="phase === 'loading' || phase === 'ready'">
      <img :src="xyPreview" alt="XY园区三维概览，生产楼、库区楼位于园区中央" />
    </div>
    <div v-if="phase === 'loading'" class="twin-scene__loading" role="status">
      <span class="twin-scene__spinner" aria-hidden="true"></span>
      正在加载三维场景
    </div>
    <div v-if="errorText && caseKey !== 'xy'" class="twin-scene__error">
      <p class="twin-scene__error-title">三维场景加载失败</p>
      <p class="twin-scene__error-text">{{ errorText }}</p>
      <button type="button" class="twin-scene__error-btn" @click="retry">重试</button>
    </div>
  </div>
</template>

<script>
import { createTwinApp } from "@twin/web-sdk";
import { mapState } from "vuex";
import { setTwinApp } from "@/utils/twin/app";
import { clearByEids } from "@/utils/twin/delete";
import { notify, handleTwinError, STATUS, TWIN_ERROR_TEXT } from "@/utils/statusEnum";
import { emitter } from "@/utils/eventBus";
import toolCleanupMixin from "@/mixins/toolCleanupMixin.js";
import xyPreview from "../../docs/xy-first-delivery/campus-overlay.png";

/**
 * 三维场景层（twinSDK）：交付码 → createTwinApp → 浏览器内渲染已发布案例
 *
 * 对外只做三件事：
 * 1. setTwinApp(app)：业务通过 @/utils/twin/* 或 getViewer() 调用 SDK（实例不进 Vuex）
 * 2. 场景就绪 commit("isSceneAlready", true)：各页面 mixin 仍按原有 watcher 触发 init
 * 3. SDK 事件 → emitter：entityClicked / entityDblClicked / sceneUpdated / windowEvent（悬停事件未转发，见 registerEvents）
 *
 * 配置来源 public/config.json，可被 URL 参数覆盖：?deliveryCode=xxx&serverUrl=http://host:5184/api&agentHostUrl=xxx
 *
 * 原 wdpapi 场景层中依赖 UE 定制蓝图的全局事件（功能清单「全局场景事件」），twinSDK 暂无对应能力，保留为待实现：
 *   - OnEntityClicked(Eid=10081)：发电设施2 告警弹窗开关（依赖 isGen2Active）
 *   - Earth_ClickEvent / ClickEarthPOI：地球 POI 点击 → Earth_ShowState 收起地球 → 进入 /page_2/1；采煤机 → ControlCMJ → /page_2/4-device
 *   - Earth_State：地球展开/收起状态回写 store.earthState
 *   - ZHAF_JQRXGGJ_HighlightRobot：机器人高亮回调 → 切换 isShowWebTwo
 */
export default {
  name: "scene",
  mixins: [toolCleanupMixin],
  props: { caseKey: { type: String, default: "lighthouse" } },
  data() {
    return {
      errorText: "",
      toFactory: false,
      xyPreview,
    };
  },

  computed: {
    ...mapState(["windowEid", "windowEidChild", "earthState", "sceneStatus"]),
    phase() { return this.sceneStatus.caseKey === this.caseKey ? this.sceneStatus.state : "loading"; },
  },

  watch: {
    caseKey() { this.retry(); },
    "$route.query.xyDeliveryCode"() { if (this.caseKey === "xy" && this.configuredCase === "xy") this.retry(); },
    "$route.query.xyServerUrl"() { if (this.caseKey === "xy" && this.configuredCase === "xy") this.retry(); },
    earthState(newVal) {
      const state = newVal === true || newVal === "true" || newVal === 1 || newVal === "1";
      if (!state && this.toFactory) {
        this.toFactory = false;
        this.$router.push("/page_2/2");
      }
    },
  },

  mounted() {
    window.addEventListener("message", this.onWindowMessage);
    emitter.on("windowEvent", this.onWindowEvent);
    emitter.on("sceneRetry", this.retry);
    this.start();
  },

  beforeDestroy() {
    window.removeEventListener("message", this.onWindowMessage);
    emitter.off("windowEvent", this.onWindowEvent);
    emitter.off("sceneRetry", this.retry);
    this.stop();
  },

  methods: {
    async start() {
      this.errorText = "";
      const loader = new AbortController();
      const caseKey = this.caseKey;
      this.loader = loader;
      this.configuredCase = caseKey;
      const current = () => this.loader === loader && !loader.signal.aborted && this.caseKey === caseKey;
      this.$store.commit("setSceneStatus", { caseKey, state: "loading" });
      try {
        const config = await this.loadConfig(caseKey, loader.signal);
        if (!current()) return;
        this.$store.commit("wdpConfig", config);
        this.$store.commit("twinConfig", config);
        if (caseKey === "xy" && (!config.serverUrl || !config.deliveryCode)) {
          this.$store.commit("setSceneStatus", { caseKey, state: "preview" });
          return;
        }
        const app = await createTwinApp({
          container: this.$refs.player,
          serverUrl: config.serverUrl,
          deliveryCode: config.deliveryCode,
          autoUpdate: config.autoUpdate === false ? false : { intervalMs: Number(config.autoUpdateIntervalMs) || 30000 },
          pixelRatio: Number(config.pixelRatio) || 1,
          signal: loader.signal,
        });
        if (!current()) {
          app.dispose();
          return;
        }
        if (caseKey === "xy" && app.scene.sceneId !== (config.xy.sceneId || "xy-factory")) {
          app.dispose();
          throw new Error("交付码与 XY 工厂案例不匹配");
        }
        this.app = app;
        if (process.env.VUE_APP_VENDOR_OFFLINE === 'true') {
          window.__dengtaDiagnostics = { state: 'ready', scene: { ...app.scene }, sdkVersion: '0.5.4', readyAt: new Date().toISOString() };
          window.__dengtaVendorApp = app;
        }
        setTwinApp(app);
        // 开发环境调试入口：浏览器控制台可直接 __twinApp.viewer.camera.getPose() 等
        if (process.env.NODE_ENV === "development") window.__twinApp = app;
        this.registerEvents(app);
        notify(STATUS.SCENE_LOADED, true, app.scene);
        this.$store.commit("setTwinScene", app.scene);
        if (caseKey === "lighthouse") await this.initSceneClose();
        if (!current()) return;
        await app.viewer.whenFrameRendered();
        if (!current()) return;
        this.$store.commit("isSceneAlready", true);
        this.$store.commit("setSceneStatus", { caseKey, state: "ready" });
      } catch (error) {
        if (!current() || (error && error.code === "E_OPERATION_CANCELLED")) return;
        handleTwinError(error, STATUS.SCENE_START);
        this.errorText = TWIN_ERROR_TEXT[error && error.code] || (error && error.message) || String(error);
        if (process.env.VUE_APP_VENDOR_OFFLINE === 'true') {
          window.__dengtaDiagnostics = { state: 'failed', code: error && error.code, message: error && error.message, details: error && error.details, stack: error && error.stack };
          this.errorText = [this.errorText, error && error.message, error && error.details && JSON.stringify(error.details)].filter(Boolean).join(' | ');
        }
        this.$store.commit("isSceneAlready", false);
        this.$store.commit("setSceneStatus", { caseKey, state: "error", message: this.errorText });
      }
    },

    stop() {
      if (process.env.VUE_APP_VENDOR_OFFLINE === 'true') delete window.__dengtaVendorApp;
      if (this.loader) this.loader.abort();
      if (this.offEvents) this.offEvents.forEach((off) => off());
      this.offEvents = null;
      setTwinApp(null);
      if (window.__twinApp === this.app) delete window.__twinApp;
      if (this.app) {
        this.app.dispose();
        this.app = null;
      }
      this.$store.commit("isSceneAlready", false);
      this.$store.commit("setTwinScene", null);
    },

    retry() {
      this.stop();
      this.start();
    },

    async loadConfig(caseKey, signal) {
      const response = await fetch("./config.json", { cache: "no-store", signal });
      if (!response.ok) throw new Error(`案例配置读取失败 (${response.status})`);
      const config = await response.json();
      const query = this.$route.query;
      if (caseKey === "xy") {
        const override = await fetch("./xy-scene.local.json", { cache: "no-store", signal });
        const local = override.ok && (override.headers.get("content-type") || "").includes("json") ? await override.json() : {};
        const xy = { ...(config.cases && config.cases.xy), ...local };
        config.deliveryCode = String(query.xyDeliveryCode || xy.deliveryCode || "");
        config.serverUrl = String(query.xyServerUrl || xy.serverUrl || config.serverUrl || "");
        config.autoUpdate = xy.autoUpdate === true;
        config.xy = xy;
      } else {
        if (query.deliveryCode) config.deliveryCode = String(query.deliveryCode);
        if (query.serverUrl) config.serverUrl = String(query.serverUrl);
        if (query.agentHostUrl) config.agentHostUrl = String(query.agentHostUrl);
      }
      delete config.cases;
      config.caseKey = caseKey;
      config.serverUrl = this.resolveLoopbackUrl(config.serverUrl);
      if (config.isNeedFullScreen) config.resolution = [innerWidth, innerHeight];
      return config;
    },

    // 局域网其他机器打开大屏时，配置里的 127.0.0.1 / localhost 指向的是访问者自己的机器，需换成页面所在主机
    resolveLoopbackUrl(value) {
      if (!value) return value;
      try {
        const url = new URL(value, window.location.href);
        const pageHost = window.location.hostname;
        const loopback = ["127.0.0.1", "localhost", "::1", "[::1]"];
        if (loopback.includes(url.hostname) && !loopback.includes(pageHost)) {
          url.hostname = pageHost;
          return url.toString().replace(/\/$/, "");
        }
      } catch (e) {
        // 非法 URL 原样交给 SDK 报错
      }
      return value;
    },

    registerEvents(app) {
      const { viewer } = app;
      this.offEvents = [
        // 点击空白处 event 为 null；具体业务由各页面 emitter.on 订阅
        // [twin 待实现] 原 wdpapi OnEntityClicked：Eid=10081 且 isGen2Active 时开关「设备告警」type7 弹窗（addWINDOWS / ClearByEids）
        viewer.events.on("entity.click", (event) => emitter.emit("entityClicked", event)),
        viewer.events.on("entity.dblclick", (event) => emitter.emit("entityDblClicked", event)),
        // entity.mouseenter / entity.mouseout 不再订阅：订阅后 SDK 悬停时需对整个模型做射线检测（国产 CPU 上开销大），且当前无业务使用。
        viewer.events.on("viewer.contextLost", () => notify(STATUS.CONTEXT_LOST, false)),
        viewer.events.on("viewer.contextRestored", () => notify(STATUS.CONTEXT_RESTORED, true)),
        // 交付码跟随发布版：案例重新发布后 SDK 自动换上新版本，业务覆盖物与视角保留
        app.events.on("app.updated", (event) => {
          this.$store.commit("setTwinScene", app.scene);
          notify(STATUS.SCENE_UPDATED, true, event);
          emitter.emit("sceneUpdated", event);
        }),
        app.events.on("app.updateFailed", (error) => handleTwinError(error, STATUS.SCENE_UPDATE_FAILED)),
      ];
    },

    // 三维弹窗（#/wdpWindow，iframe 内）通过 postMessage 回传交互（替代原 UE 的 w51_event → OnWebJSEvent）
    onWindowMessage(event) {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.source !== "twin-window") return;
      emitter.emit("windowEvent", data);
    },

    // 弹窗内点击关闭：删除当前弹窗（子弹窗优先）
    async onWindowEvent(data) {
      if (data.name !== "closeThePage") return;
      const eid = data.p_eid && data.p_eid !== "null" ? this.windowEidChild && this.windowEidChild.eid : this.windowEid;
      if (eid) await clearByEids([eid]);
    },
  },
};
</script>

<style lang="scss" scoped>
.twin-scene,
#player {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
  overscroll-behavior: none;
  -webkit-user-drag: none;
  user-select: none;
}

.twin-scene {
  background: #101e2b;
}

#player {
  opacity: 0;
  filter: blur(14px);
  pointer-events: none;
}

.twin-scene--ready #player {
  opacity: 1;
  filter: none;
  pointer-events: auto;
  transition: opacity 460ms ease-out, filter 550ms ease-out;
}

.twin-scene__preview {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.twin-scene__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: .8;
}

.twin-scene--loading .twin-scene__preview img,
.twin-scene--ready .twin-scene__preview img {
  filter: blur(16px);
  transform: scale(1.05);
  opacity: .58;
}

.twin-scene--ready .twin-scene__preview {
  opacity: 0;
  visibility: hidden;
  transition: opacity 460ms ease-out, visibility 0s 460ms;
}

.twin-scene__loading {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border: 1px solid rgba(143, 230, 255, .36);
  border-radius: 6px;
  background: #0b1c2c;
  color: #e9f2fb;
  font: 15px/1.5 "Microsoft YaHei", sans-serif;
  white-space: nowrap;
}

.twin-scene__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(143, 230, 255, .26);
  border-top-color: #8fe6ff;
  border-radius: 50%;
  animation: twin-scene-spin 850ms linear infinite;
}

@keyframes twin-scene-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .twin-scene--ready #player,
  .twin-scene--ready .twin-scene__preview { transition: none; }
  .twin-scene__spinner { animation: none; }
}

.twin-scene__error {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  transform: translate(-50%, -50%);
  padding: px2rem(40) px2rem(60);
  border: px2rem(2) solid rgba(255, 121, 121, 0.4);
  border-radius: px2rem(12);
  background: rgba(13, 33, 47, 0.92);
  color: #fff;
  text-align: center;
}

.twin-scene__error-title {
  font-size: px2rem(36);
  margin-bottom: px2rem(16);
}

.twin-scene__error-text {
  font-size: px2rem(26);
  color: #c2e4ff;
  margin-bottom: px2rem(24);
}

.twin-scene__error-btn {
  padding: px2rem(10) px2rem(40);
  border: none;
  border-radius: px2rem(8);
  background: #1677ff;
  color: #fff;
  font-size: px2rem(24);
  cursor: pointer;
}
</style>
