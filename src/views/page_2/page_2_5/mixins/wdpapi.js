// WDP API 混入模板
import { mapState } from "vuex";
import store from "../../../../store/index";
import toolCleanupMixin from "@/mixins/toolCleanupMixin.js";

export default {
  mixins: [toolCleanupMixin],
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
        initalData: {
          poiLocation: [
            [113.72261488065365, 34.7790391955335, 14.903089331032557],
          ],
          poiConfig: {
            customId: ["p2_5_device_1"],
            entityName: ["设备"],
          },
          markerConfig: {
            markerNormalUrl: "DT_car_normal.png",
            markerActivateUrl: "DT_car_normal_active.png",
            markerSize: [48, 65],
          },
          clickCameraFocus: {
            location: [
              113.72211538695124, 34.778760098632056, 73.27232451926038,
            ],
            pitch: -41.60067367553711,
            yaw: -28.33686065673828,
            distance: 0.1,
          },
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          entityEids: ["56926"],
          windowData: [
            [
              { title: "类别", content: "锅炉", flex: 0.5 },
              { title: "编号", content: "GL-001", flex: 0.5 },
              { title: "出口含氧量", content: "5%", flex: 0.5 },
            ],
          ],
        },
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
      activeOutlineObj: null,
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
    // [twin 待实现] 原 wdpapi 调用：deleteObjs → resetCamera → setEntityOutline
    async closeAll() {
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          this.toolObjs[key] = [];
        }
      }
      if (this.activeOutlineObj) {
        this.activeOutlineObj = null;
      }
    },

    // [twin 待实现] 原 wdpapi 调用：addPOI → <实体>.onClick → deleteObjs → setEntityOutline → resetCamera → <实体>.Update → FocusByPoints → getByEids → addWINDOWS
    async runPoiWindowModule(data, index, fallbackPrefix) {
      if (!data?.poiLocation?.length) return;



      let activeWindowIndex = -1;
      let activeWindowObj = null;
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon = sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon =
        sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    // [twin 待实现] 原 wdpapi 调用：resetCamera
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      await this.normalPoi('/page_2/5-workshop');
      setTimeout(async () => {
        await this.runPoiWindowModule(this.toolData.initalData, 1, "锅炉设备");
      }, 350);
    },
  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：setEntityOutline → deleteTypes
  async beforeDestroy() {
    if (this.activeOutlineObj) {
      this.activeOutlineObj = null;
    }
  },
};
