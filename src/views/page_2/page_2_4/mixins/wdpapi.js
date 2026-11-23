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
      // 离开路由时先暂存 next，等 EarthState=false 后再放行跳转
      toNext: null,
      // 仅在需要时才执行进入地球与后续控镜头
      shouldEnterEarth: true,
    };
  },
  computed: {
    ...mapState(["isSceneAlready", "earthState"]),
  },
  watch: {
    async isSceneAlready(newVal) {
      // 场景准备好后才允许执行初始化流程
      if (newVal) {
        await this.initAfterSceneReady();
      }
    },
    // [twin 待实现] 原 wdpapi 调用：showEarthPoi
    async earthState(newVal) {
      // 统一把可能的字符串/数字状态转为布尔语义
      const isEarthOpen = this.normalizeEarthState(newVal) === true;
      const isEarthClose = this.normalizeEarthState(newVal) === false;
      console.log("EarthState changed:", newVal, "=>", { isEarthOpen, isEarthClose });

      // 仅在“等待控镜头”的场景下，EarthState=true 才执行控制镜头
      if (isEarthOpen) {
        await this.controlEarthCamera();
      }

      // 仅在“等待离开”的场景下，EarthState=false 才允许继续路由跳转
      console.log("Checking if we can proceed with route change...", { isEarthClose, hasToNext: !!this.toNext });
      if (isEarthClose && this.toNext) {
        console.log("EarthState is false, proceeding with route change...");
        const next = this.toNext;
        this.toNext = null;
        // setTimeout(() => {
          next();
        // }, 5500); // 确保地球完全关闭后再跳转，避免视觉上闪烁
        
      }
    }
  },
  methods: {
    // 兼容后端/SDK 可能返回 true/false、"true"/"false"、1/0 等不同格式
    normalizeEarthState(value) {
      if (value === true || value === "true" || value === 1 || value === "1") {
        return true;
      }
      if (value === false || value === "false" || value === 0 || value === "0") {
        return false;
      }
      return value;
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints
    async initAfterSceneReady() {
      // 必须满足：场景已就绪，且未初始化过
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;

      if (!this.shouldEnterEarth) {
        return;
      }

      // 请求进入地球
      await this.enterEarth();
    },
    // 进入地球
    // [twin 待实现] 原 wdpapi 调用：customFn
    async enterEarth(isEnter = true) {
    },
    // 控制地球镜头
    // [twin 待实现] 原 wdpapi 调用：customFn
    async controlEarthCamera(CameraName = "China") {
    },
    setEnterStrategyByRoute(fromPath = "") {
      // 从 /page_2/4-device 进入 /page_2/4 时，不重复调用 enterEarth()
      this.shouldEnterEarth = fromPath !== "/page_2/4-device";
    }

  },

  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.setEnterStrategyByRoute(from.path);
      vm.initAfterSceneReady();
    });
  },

  async beforeRouteLeave(to, from, next) {
    // 在 /page_2/4 与 /page_2/4-device 之间切换，不做退出地球动作
    if (to.path === "/page_2/4-device" || to.path === "/page_2/4") {
      next();
      return;
    }
    if (to.path === "/page_1/1") {
      next();
      return;
    }

        // 地球已经关闭（如 routeParamsKeeper 重定向导致二次触发），直接放行
    if (this.normalizeEarthState(this.earthState) === false) {
      next();
      return;
    }
    // 离开到其他页面：先挂起 next，等 EarthState=false 再跳转
    this.toNext = next;
    // if (this.normalizeEarthState(this.earthState) === false) {
    //   const nextFn = this.toNext;
    //   this.toNext = null;
    //   nextFn();
    //   return;
    // }

    // 当前还没退出地球，先发起退出请求
    console.log("请求退出地球...");
    await this.enterEarth(false);
  },


  async mounted() {
    this.setEnterStrategyByRoute("");
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：deleteTypes
  async beforeDestroy() {
    // 组件销毁时清理挂起回调，避免内存泄漏或误触发
    this.toNext = null;
  },
};
