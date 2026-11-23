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
        1: this.mode1_environment,
      },
      // id对应数据
      toolData: {
        1: {
          focusCamera: {
            "location": [
              113.72108481557613,
              34.775944464576924,
              508.1265282585598
            ],
            "pitch": -71.67256164550781,
            "yaw": -50.08645248413086,
            "distance": 10
          },
          poiLocation: [[113.72010547942577, 34.7784843261618, 0.17165781249999998], [113.72401102898, 34.775065665500705, 0.1717578125], [113.72546716651533, 34.77725169637564, 0]],
          poiConfig: {
            customId: ["p2_7_environment_1", "p2_7_environment_2", "p2_7_environment_3"],
            entityName: ["监测点位01", "监测点位02", "监测点位03"],
          },
          markerConfig: {
            markerNormalUrl: "DT_env_monitor.png",
            markerActivateUrl: "DT_env_monitor_active.png",
            markerSize: [48, 65],
          },
          clickDistance: 500,
          poiFocusCameras: [
            { location: [113.71984471084141, 34.777996627042086, 89.94212647498516], pitch: -56.600521087646484, yaw: -65.08645629882812, distance: 0.1 },
            { location: [113.72379959241407, 34.77462930552918, 69.29022081209659], pitch: -51.049930572509766, yaw: -71.53663635253906, distance: 0.1 },
            { location: [113.72514028192167, 34.77708859772518, 53.446422486045115], pitch: -55.70014190673828, yaw: -27.587068557739258, distance: 0.1 },
          ],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "温度", content: "24.5°C", flex: 0.5 },
              { title: "湿度", content: "56%", flex: 0.5 },
              { title: "PM2.5", content: "18 µg/m³", flex: 0.5 },
              { title: "VOC", content: "0.08 mg/m³", flex: 0.5 },
            ],
            [
              { title: "温度", content: "25.0°C", flex: 0.5 },
              { title: "湿度", content: "54%", flex: 0.5 },
              { title: "PM2.5", content: "20 µg/m³", flex: 0.5 },
              { title: "VOC", content: "0.09 mg/m³", flex: 0.5 },
            ],
            [
              { title: "温度", content: "23.8°C", flex: 0.5 },
              { title: "湿度", content: "58%", flex: 0.5 },
              { title: "PM2.5", content: "16 µg/m³", flex: 0.5 },
              { title: "VOC", content: "0.07 mg/m³", flex: 0.5 },
            ],
          ],
        },
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
    // [twin 待实现] 原 wdpapi 调用：deleteObjs → resetCamera
    async closeAll() {
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          this.toolObjs[key] = [];
        }
      }
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addPOI → <实体>.onClick → deleteObjs → FocusByPoints → <实体>.Update → addWINDOWS
    async runPoiWindowModule(data, index, fallbackPrefix) {
      if (!data?.poiLocation?.length) return;




      let activeWindowIndex = -1;
      let activeWindowObj = null;
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon = sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon = sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    async mode1_environment(data, index) {
      await this.runPoiWindowModule(data, index, "环境监测");
    },

    // [twin 待实现] 原 wdpapi 调用：resetCamera
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      await this.normalPoi('/page_2/7-workshop');
    },

  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：deleteTypes
  async beforeDestroy() {
  },
};
