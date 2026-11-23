// WDP API 混入模板
import { mapState } from "vuex";
import store from "../../../../store/index";

export default {
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: null,
      },
      // id对应数据
      toolData: {
        1: {},
        2: {},
        3: {},
      },
      //类型存储
      toolTypes: {
        2: [],
        5: [],
      },

      //对象存储
      toolObjs: {
        1: [],
        2: [],
        3: [],
      },
      hasSceneInit: false, // 防止场景就绪后重复初始化
    };
  },
  computed: {
    ...mapState(["isSceneAlready"]),
  },
  watch: {
    async isSceneAlready(newVal) {
      if (newVal) {
        await this.initAfterSceneReady();
      }
    },
  },
  methods: {
    // [twin 待实现] 原 wdpapi 调用：splitBuildByName
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      try {
        // 进入页面默认播放第一套动画（模式一 = AnimationIndex 0）
        await this.controlJC(true, 0);
      } catch (e) {
        console.warn('[wdpapi] initAfterSceneReady failed:', e.message || e);
      }
    },

    /**
     * 控制机床动画
     * @param {boolean} animationState - 是否播放动画
     * @param {number} [animationIndex] - 指定动画序号（0 或 1），不传则由 UE 侧走默认行为
     */
    // [twin 待实现] 原 wdpapi 调用：customFn
    async controlJC(animationState, animationIndex) {
      const args = { guid: "", AnimationState: animationState };
      if (animationIndex !== undefined) {
        args.AnimationIndex = animationIndex;
      }
    },

    /**
     * 控制机床零部件位移
     * @param {string} eid - 零部件实体 ID（Eid_10142 ~ Eid_10146）
     * @param {string} value - 局部偏移值 "x,y,z"，单位 cm
     * @param {number} time - 缓动时间（秒）
     */
    // [twin 待实现] 原 wdpapi 调用：customFn
    async controlJCLocation(eid, value, time) {
    },

    /**
     * 控制实体高亮
     * @param {string[]} eids - 实体 ID 数组，如 ["Eid_10147"]
     * @param {boolean} state - true = 开启高亮，false = 关闭高亮
     */
    // [twin 待实现] 原 wdpapi 调用：customFn
    async controlHighLight(eids, state) {
    },

    /**
     * 控制水晶特效开关
     * @param {boolean} state - true = 开启，false = 关闭
     */
    // [twin 待实现] 原 wdpapi 调用：customFn
    async controlCrystal(state) {
    },

    /**
     * 聚焦到指定实体（直接调用 SDK，绕过 camera.js 的双参数签名问题）
     * @param {string[]} eids - 实体 ID 数组
     * @param {number} [yaw=0] - 偏航角
     * @param {number} [pitch=-40] - 俯仰角
     * @param {number} [distanceFactor=0.5] - 视野占比
     */
    // [twin 待实现] 原 wdpapi 调用：App.Customize.RunCustomizeApi
    async focusToEntities(eids, yaw = 90, pitch = -50, distanceFactor = 0.3) {
      // FocusToEntities 只接受纯数字 ID，需去掉 "Eid_" 前缀
      const numericEids = eids.map(id => String(id).replace(/^Eid_/, ""));
    },

    /**
     * 机床轴百分比控制（X/Y/Z 各 0~100%，UE 侧负责换算为实际位移）
     * @param {number} x - X 轴百分比 0~100
     * @param {number} y - Y 轴百分比 0~100
     * @param {number} z - Z 轴百分比 0~100
     * @param {number} [time=1] - 缓动时间（秒）
     */
    // [twin 待实现] 原 wdpapi 调用：customFn
    async controlJCAxisPercent(x, y, z, time = 2) {
    },

  },

  // 离开 page_2_5 系列页面时，合拢车间并停止机床动画
  // [twin 待实现] 原 wdpapi 调用：splitBuildByName
  async beforeRouteLeave(to, from, next) {
    if (to.path.includes("/page_2/5")) {
      next();
    } else {
      try {
        await this.controlJC(false);
      } catch (e) {
        console.warn('[wdpapi] beforeRouteLeave cleanup failed:', e.message || e);
      }
      next();
    }
  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：deleteTypes
  async beforeDestroy() {
    try {
    } catch (e) {
      console.warn('[wdpapi] beforeDestroy cleanup failed:', e.message || e);
    }
  },
};
