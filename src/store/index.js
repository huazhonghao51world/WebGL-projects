import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  // 定义已有的状态的数据
  // 注意：三维场景实例（TwinApp / viewer）不放进 Vuex，统一用 @/utils/twin/app 的 getViewer() 获取；
  // Vue 2 会深度改造进入 state 的对象，遍历 three.js 场景图会让渲染帧率跌到个位数且不可恢复。
  state: {
    isShowScene: false,
    isSceneAlready: false,
    // UE 数字地球展开状态（原由 UE 回调 Earth_State 回写）。twinSDK 无地球场景，恒为 false：
    // /page_2/4、/page_2/4-device 的 beforeRouteLeave 在地球展开时会挂起 next 等待该回调，为 true 会导致路由卡死
    earthState: false,
    isShowWindow: {
      isShow: false,
      config: {}
    },
    // public/config.json：大屏配置（sourceUrl 图标前缀、resolution 换算基准等），历史命名沿用 wdpConfig
    wdpConfig: null,
    // 三维平台配置 { serverUrl, deliveryCode, ... }
    twinConfig: null,
    // 当前渲染的发布版本 { sceneId, name, revision }
    twinScene: null,
    sceneStatus: { caseKey: null, state: "loading" },
    windowEid: null, // 添加窗口 EID 状态
    windowEidChild: {
      p_eid: null,
      eid: null,
    },
    trackPath: null,//查看轨迹
    isShowWebTwo: {
      isShow: false,
      config: {}
    },
    // AI机器人巡状态
    aiBotRouteState: null,
    aiBotWindowId: null,

    //存储当前环境压暗状态
    setDarkenStatus: {},
    // 面板与场景弹窗显隐状态
    isPanelHidden: false,
    // 发电设施2弹窗是否激活
    isGen2Active: false,
  },
  // 计算状态数据
  getters: {},

  mutations: {
    wdpConfig(state, newVal) {
      state.wdpConfig = newVal;
      console.log(state.wdpConfig, "全局存储wdp用户配置");
    },

    twinConfig(state, newVal) {
      state.twinConfig = newVal;
    },

    setTwinScene(state, newVal) {
      state.twinScene = newVal ? { ...newVal } : null;
    },

    setSceneStatus(state, status) {
      state.sceneStatus = status;
    },

    isShowScene(state, newVal) {
      state.isShowScene = newVal;
      console.log(state.isShowScene, "全局isShowScene");
    },

    isSceneAlready(state, newVal) {
      state.isSceneAlready = newVal;
      console.log(state.isSceneAlready, "全局isSceneAlready");
    },

    EarthState(state, newVal) {
      state.earthState = newVal;
      console.log(state.earthState, "全局earthState");
    },

    setWindowEid(state, newVal) {
      state.windowEid = newVal;
      console.log(state.windowEid, "全局windowEid");
    },
    setWindowEidChild(state, newVal) {
      state.windowEidChild = newVal;
      console.log(state.windowEidChild, "全局windowEidChild");
    },
    isShowWindow(state, newVal) {
      state.isShowWindow = { ...newVal };
      console.log(state.isShowWindow, "全局isShowWindow");
    },
    setTrackPath(state, newVal) {
      state.trackPath = newVal;
      console.log(state.trackPath, "全局trackPath");
    },
    isShowWebTwo(state, newVal) {
      state.isShowWebTwo = { ...newVal };
      console.log(state.isShowWebTwo, "全局isShowWebTwo");
    },
    // AI机器人巡检路线状态管理
    setAiBotRouteState(state, newVal) {
      state.aiBotRouteState = newVal;
      console.log(state.aiBotRouteState, "全局AI机器人巡检路线状态");
    },
    setAiBotWindowId(state, newVal) {
      state.aiBotWindowId = newVal;
      console.log(state.aiBotWindowId, "全局aiBotWindowId");
    },

    //存储当前环境压暗状态
    setDarkenStatus(state, newVal) {
      state.setDarkenStatus = newVal;
      console.log(state.setDarkenStatus, "全局setDarkenStatus");
    },
    // 切换面板显隐
    togglePanelHidden(state) {
      state.isPanelHidden = !state.isPanelHidden;
    },
    // 发电设施2弹窗激活状态
    setGen2Active(state, newVal) {
      state.isGen2Active = newVal;
      console.log(state.isGen2Active, "全局isGen2Active");
    },
  },

  actions: {},

  modules: {},
});
