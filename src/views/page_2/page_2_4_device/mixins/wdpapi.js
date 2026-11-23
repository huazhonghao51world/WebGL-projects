// WDP API 混入模板
import { mapState } from "vuex";
import store from "../../../../store/index";

export default {
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: this.mode1_crystal,
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
      toNext: null,
    };
  },
  computed: {
    ...mapState(["isSceneAlready", "earthState"]),
  },
  watch: {
    async isSceneAlready(newVal) {
      if (newVal) {
        await this.initAfterSceneReady();
      }
    },
    earthState(newVal) {
      if (this.normalizeEarthState(newVal) === false && this.toNext) {
        const next = this.toNext;
        this.toNext = null;
        // setTimeout(() => {
          next();
        // }, 5500); // 确保地球完全关闭后再跳转，避免视觉上闪烁
      }
    },
  },
  methods: {
    normalizeEarthState(value) {
      if (value === true || value === "true" || value === 1 || value === "1") {
        return true;
      }
      if (value === false || value === "false" || value === 0 || value === "0") {
        return false;
      }
      return value;
    },
    async closeAll() {
      await this.cmjCrystal(false);
    },

    async mode1_crystal() {
      await this.cmjCrystal(true);
    },

    // [twin 待实现] 原 wdpapi 调用：closeAllEarthPoi
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
    },

    // [twin 待实现] 原 wdpapi 调用：customFn
    async enterEarth(isEnter = true) {
    },

    // [twin 待实现] 原 wdpapi 调用：customFn
    async cmjCrystal(isShow = true) {
    }

  },

  // [twin 待实现] 原 wdpapi 调用：FocusByPoints → showEarthPoi
  async beforeRouteLeave(to, from, next) {
    if (to.path === "/page_2/4-device" || to.path === "/page_2/4") {
      next();
      return;
    }

    this.toNext = next;
    await this.cmjCrystal(false);
    if (this.normalizeEarthState(this.earthState) === false) {
      const nextFn = this.toNext;
      this.toNext = null;
      nextFn();
      return;
    }

    setTimeout(async () => { await this.enterEarth(false);  }, 800);



  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：showEarthPoi → deleteTypes
  async beforeDestroy() {
    await this.cmjCrystal(false);
    this.toNext = null;
  },
};
