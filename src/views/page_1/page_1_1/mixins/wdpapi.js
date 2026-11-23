// WDP API 混入模板
import { mapState } from "vuex";
import toolCleanupMixin from "@/mixins/toolCleanupMixin.js";


export default {
  mixins: [toolCleanupMixin],
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: this.aiBot,
      },
      // id对应数据
      toolData: {
        1: {},
        2: {},
        3: {},
        'city': {
          location: [[113.69019501713147, 34.81674023201518, 153328.46582469862],
          [113.69741840341503, 34.814505664534295, 154091.02747851456],
          [113.6956806202095, 34.823432816017615, 152448.9564168532]],
          poiConfig: {
            customId: ["shanghai_poi", "beijing_poi", "guangzhou_poi"],
            entityName: ["上海", "北京", "广州"],
          },
          markerConfig: {
            markerNormalUrl: "monitor.png",
            markerActivateUrl: "monitor_active.png",
            markerSize: [40, 40],
          }
        }
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
      // 防止场景就绪后重复初始化
      hasSceneInit: false,
      fromPage: null, // 记录来源页面
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
    // [twin 待实现] 原 wdpapi 调用：showEarthPoi
    async earthState(newVal) {
      if(this.normalizeEarthState(newVal) === true) {
      }
    }
  },
  // [twin 待实现] 原 wdpapi 调用：showEarthPoi
  beforeRouteEnter(to, from, next) {
    next(async vm => {
      vm.fromPage = from.path;
      if (vm.fromPage === "/page_2/4") {
        await vm.initSceneClose();
        await vm.controlEarthCamera("World");
        console.log("从 /page_2/4 进入，调整地球镜头");
      } else {
        await vm.initAfterSceneReady();
      }
    });
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
    // [twin 待实现] 原 wdpapi 调用：showEarthPoi
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      await this.enterEarth();
      await this.initSceneClose();
      // await this.addCityPOI();
    },


    // 进入地球
    // [twin 待实现] 原 wdpapi 调用：customFn
    async enterEarth(isEnter = true) {
    },
    // 控制地球镜头
    // [twin 待实现] 原 wdpapi 调用：customFn
    async controlEarthCamera(CameraName = "China") {
    },

    // 添加城市 POI
    // [twin 待实现] 原 wdpapi 调用：addPOI → <实体>.onClick
    async addCityPOI() {
      const { location, poiConfig, markerConfig } = this.toolData.city;

    },
  },

  mounted() { },


  // [twin 待实现] 原 wdpapi 调用：deleteTypes
  async beforeDestroy() {
  },
};
