<template>
  <div class="twin-scene" :class="`twin-scene--${phase}`" :aria-busy="phase === 'loading'">
    <div ref="player" id="player" :aria-hidden="phase !== 'ready'"></div>
    <div v-if="caseKey === 'xy' && loadingOverlay" class="twin-scene__preview" :aria-hidden="phase === 'loading' || phase === 'ready'">
      <img :src="xyPreview" alt="XY园区三维概览，生产楼、库区楼位于园区中央" />
    </div>
    <div v-if="phase === 'loading' && loadingOverlay" class="twin-scene__loading" role="status">
      <span class="twin-scene__spinner" aria-hidden="true"></span>
      正在加载三维场景
    </div>
    <!-- XY：全屏加载层。场景（模型、光照、配置包、全部实体显示）完全就绪前，页面面板与业务都不挂载。 -->
    <div v-if="caseKey === 'xy' && phase === 'loading'" class="twin-loader" role="status" aria-live="polite">
      <div class="twin-loader__grid" aria-hidden="true"></div>
      <div class="twin-loader__box">
        <img class="twin-loader__logo" :src="xyLogo" alt="新耀湃科 Bravo" />
        <div class="twin-loader__percent" aria-hidden="true">{{ loadPercent }}<small>%</small></div>
        <div class="twin-loader__bar" role="progressbar" aria-label="三维场景加载进度" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="loadPercent"><i :style="{ width: `${loadPercent}%` }"></i></div>
        <div class="twin-loader__meta"><span class="twin-loader__stage"><i class="twin-loader__dot" aria-hidden="true"></i>{{ loadText }}</span><span>{{ loadElapsed }}</span></div>
      </div>
      <div class="twin-loader__tip">首次加载需下载约 200 MB 模型，之后从本地缓存读取</div>
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
import xyLogo from "@/assets/images/xy_logo.png";
import { completeSceneLoad } from "@/views/xy_factory/sceneProfile";
import { overview as xyOverview } from "@/views/xy_factory/campus";

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
      // 临时关闭：加载提示 + 模糊预览图 + 场景淡入（排查国产显卡卡死期间，减少与 WebGL 画布叠加的合成层）。
      loadingOverlay: false,
      loadPercent: 0,
      loadStage: "config",
      loadStartedAt: 0,
      loadNow: 0,
      toFactory: false,
      xyPreview,
      xyLogo,
    };
  },

  computed: {
    ...mapState(["windowEid", "windowEidChild", "earthState", "sceneStatus"]),
    phase() { return this.sceneStatus.caseKey === this.caseKey ? this.sceneStatus.state : "loading"; },
    loadText() {
      return {
        config: "正在读取案例配置…", auth: "正在校验交付码…", download: "正在下载模型…", decode: "正在解析模型与贴图…",
        profile: "正在应用场景光照与材质…", reveal: "正在显示场景…", warm: "正在准备交互…", business: "正在准备业务数据…",
      }[this.loadStage] || "正在加载三维场景…";
    },
    loadElapsed() {
      const s = Math.max(0, Math.round((this.loadNow - this.loadStartedAt) / 1000));
      return this.loadStartedAt ? `已用时 ${Math.floor(s / 60) ? `${Math.floor(s / 60)} 分 ` : ""}${s % 60} 秒` : "";
    },
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
      this.beginLoading();
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
          // XY：模型等场景配置包应用后再显示（index.vue 调用 viewer.scene.reveal），避免国产显卡首帧编译过载卡死。
          deferReveal: caseKey === "xy" && config.deferReveal !== false,
          signal: loader.signal,
          onProgress: (p) => { if (current()) this.setLoad(p.stage === "ready" ? "decode" : p.stage, p.percent); },
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
        // 开发环境调试入口：浏览器控制台可直接 __twinApp.viewer.camera.getPose() 等；生产环境带 ?gldebug=1 时同样开放（排查用）。
        if (process.env.NODE_ENV === "development" || /[?&]gldebug=1/.test(window.location.search + window.location.hash)) window.__twinApp = app;
        this.registerEvents(app);
        notify(STATUS.SCENE_LOADED, true, app.scene);
        this.$store.commit("setTwinScene", app.scene);
        if (caseKey === "lighthouse") await this.initSceneClose();
        if (!current()) return;
        // XY：完全加载 = 配置包光照与材质已应用 + 全部实体已逐个显示（着色器已编译）；之后才挂载页面面板与业务。
        if (caseKey === "xy") await this.completeXyLoad(app, current);
        if (!current()) return;
        await app.viewer.whenFrameRendered();
        if (!current()) return;
        this.setLoad("business", 100);
        this.$store.commit("isSceneAlready", true);
        this.$store.commit("setSceneStatus", { caseKey, state: "ready" });
        this.endLoading();
      } catch (error) {
        if (!current() || (error && error.code === "E_OPERATION_CANCELLED")) return;
        this.endLoading();
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
      this.endLoading();
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

    beginLoading() {
      this.loadPercent = 0;
      this.loadStage = "config";
      this.loadStartedAt = this.loadNow = Date.now();
      clearInterval(this.loadClock);
      this.loadClock = setInterval(() => { this.loadNow = Date.now(); }, 1000);
    },
    endLoading() { clearInterval(this.loadClock); this.loadClock = null; },
    setLoad(stage, percent) {
      this.loadStage = stage;
      if (percent !== undefined) this.loadPercent = Math.max(this.loadPercent, Math.min(100, Math.round(percent)));
    },
    /** XY 场景完全加载（首次与换版共用）：应用场景配置包 → 逐个实体显示，进度 80–99%。 */
    async completeXyLoad(app, current) {
      const viewer = app.viewer;
      const offReveal = viewer.events.on("scene.progress", (e) => {
        if (e.stage === "reveal" && current()) this.setLoad("reveal", 86 + (e.total ? (e.completed / e.total) * 6 : 6));
      });
      const base = { profile: 82, reveal: 86, warm: 92 };
      try {
        await completeSceneLoad(viewer, { onStage: (stage, ratio) => { if (current()) this.setLoad(stage, base[stage] + (stage === "warm" && ratio ? ratio * 7 : 0)); } });
        if (current()) viewer.camera.setPose(xyOverview);
      } finally { offReveal(); }
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

    // 局域网其他机器打开大屏时，配置里的 127.0.0.1 / localhost 指向的是访问者自己的机器，需换成页面所在主机；
    // 相对地址（如 "/api"，交付包同源代理）解析为当前页面源下的绝对地址（SDK 要求绝对 URL）。
    resolveLoopbackUrl(value) {
      if (!value) return value;
      try {
        const url = new URL(value, window.location.href);
        const pageHost = window.location.hostname;
        const loopback = ["127.0.0.1", "localhost", "::1", "[::1]"];
        if (loopback.includes(url.hostname) && !loopback.includes(pageHost)) url.hostname = pageHost;
        return url.toString().replace(/\/$/, "");
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
        // 交付码跟随发布版：案例重新发布后 SDK 自动换上新版本（deferReveal：新版本模型先隐藏），业务覆盖物与视角保留。
        // XY：换版同样要“完全加载”——重新应用配置包并逐个显示实体，之后再通知页面重新挂接业务。
        app.events.on("app.updated", async (event) => {
          this.$store.commit("setTwinScene", app.scene);
          if (this.caseKey === "xy") {
            const current = () => this.app === app;
            try { await completeSceneLoad(app.viewer); } catch (error) { console.error("[xy-scene] 换版后显示场景失败", error); }
            if (!current()) return;
          }
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

/* 只用透明度淡入：WebGL 画布上的 CSS filter（blur）在国产显卡 / 麒麟系统合成时会白屏闪烁。 */
#player {
  opacity: 0;
  pointer-events: none;
}

.twin-scene--ready #player {
  opacity: 1;
  pointer-events: auto;
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
/* XY 全屏加载层：盖住整个视口（含页面面板区域）。只用不透明底色与 transform 动画，不用 blur / backdrop-filter
   （WebGL 画布上的模糊合成在国产显卡 / 麒麟系统上会白屏闪烁）。 */
.twin-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(ellipse 60% 50% at 50% 45%, rgba(37, 99, 160, .28) 0%, transparent 70%),
    linear-gradient(180deg, #08111d 0%, #050b14 100%);
  color: #dbe8f5;
  font-family: "OPPOSans-R", "PingFang SC", "Microsoft YaHei", sans-serif;
  pointer-events: auto;
}
.twin-loader__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(120, 180, 230, .06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120, 180, 230, .06) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(ellipse 55% 45% at 50% 50%, #000 0%, transparent 100%);
  mask-image: radial-gradient(ellipse 55% 45% at 50% 50%, #000 0%, transparent 100%);
}
.twin-loader__box { position: relative; width: min(520px, 78vw); display: flex; flex-direction: column; align-items: center; }
.twin-loader__logo { width: min(360px, 60vw); height: auto; margin-bottom: 56px; user-select: none; -webkit-user-drag: none; animation: twin-loader-in 600ms ease-out both; }
.twin-loader__percent {
  align-self: flex-start;
  font-family: "OPPOSans-M", "PingFang SC", sans-serif;
  font-size: 40px;
  line-height: 1;
  letter-spacing: 1px;
  color: #fff;
  font-variant-numeric: tabular-nums;
  margin-bottom: 14px;
}
.twin-loader__percent small { font-size: 16px; margin-left: 4px; color: #7fb4dc; }
.twin-loader__bar { position: relative; width: 100%; height: 2px; background: rgba(143, 200, 255, .14); }
.twin-loader__bar i { position: absolute; left: 0; top: 0; bottom: 0; background: linear-gradient(90deg, rgba(56, 189, 248, .35), #5cc8ff 70%, #e6f7ff); box-shadow: 0 0 10px rgba(92, 200, 255, .7); transition: width 400ms ease-out; }
.twin-loader__bar i::after { content: ""; position: absolute; right: -3px; top: 50%; width: 6px; height: 6px; margin-top: -3px; border-radius: 50%; background: #fff; box-shadow: 0 0 8px 2px rgba(140, 220, 255, .9); }
.twin-loader__meta { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 14px; font-size: 13px; letter-spacing: .5px; color: #8aa7c2; font-variant-numeric: tabular-nums; }
.twin-loader__meta span { font-size: 13px; line-height: 20px; color: #8aa7c2; }
.twin-loader__stage { display: inline-flex; align-items: center; color: #c4d9ec !important; }
.twin-loader__dot { width: 6px; height: 6px; margin-right: 10px; border-radius: 50%; background: #5cc8ff; animation: twin-loader-pulse 1.2s ease-in-out infinite; }
.twin-loader__tip { position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; font-size: 12px; letter-spacing: 1px; color: #4d6a85; }
@keyframes twin-loader-pulse { 0%, 100% { opacity: .3; transform: scale(.8); } 50% { opacity: 1; transform: scale(1); } }
@keyframes twin-loader-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.twin-loader--error .twin-loader__title { color: #fecaca; }
.twin-loader--error .twin-loader__stage { color: #c2e4ff; }
.twin-loader__btn { margin-top: 6px; padding: 8px 28px; border: 1px solid rgba(143, 230, 255, .5); border-radius: 6px; background: rgba(56, 189, 248, .16); color: #e9f2fb; font-size: 14px; cursor: pointer; }
@media (prefers-reduced-motion: reduce) { .twin-loader__dot, .twin-loader__logo { animation: none; } .twin-loader__bar i { transition: none; } }</style>
