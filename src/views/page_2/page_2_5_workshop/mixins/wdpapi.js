// WDP API 混入模板
import { mapState } from "vuex";

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
        initalData: {
          poiLocation: [[113.72200635857202, 34.77743108714726, 6.212833298928301]],
          poiConfig: {
            customId: ["p2_5_device_1"],
            entityName: ["CNC-设备-1"],
          },
          markerConfig: {
            markerNormalUrl: "DT_CNC.png",
            markerActivateUrl: "DT_CNC_active.png",
            markerSize: [109, 72],
          },
          clickCameraFocus: {
            "location": [
              113.72222305388767,
              34.77741011223896,
              16.412770287362772
            ],
            "pitch": -47.89927673339844,
            "yaw": 172.36380004882812,
            "distance": 0
          },
          windowType: "type5",
          windowConfig: {
            size: [320, 220],
            offset: [24, 40],
          },
          windowData: [
            { deviceName: "CNC-设备-1", deviceId: "CNC-01", workTime: "全天", light: "正常" },
          ],
          navigateOnClick: {
            path: "/page_2/5-device",
            query: { from: "workshop" },
          },
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
        4: [],
      },
      hasSceneInit: false, // 防止场景就绪后重复初始化
      skipBeforeDestroyCleanup: false,
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
    // [twin 待实现] 原 wdpapi 调用：deleteObjs → FocusByPoints
    async closeAll() {
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          this.toolObjs[key] = [];
        }
      }
    },

    // [twin 待实现] 原 wdpapi 调用：addPOI → <实体>.onClick → FocusByPoints → deleteObjs
    async runPoiWindowModule(data, index, fallbackPrefix) {
      if (!data?.poiLocation?.length) return;




    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → splitBuildByName → customFn
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      await this.runPoiWindowModule(this.toolData.initalData, 1, "初始POI");
      // setTimeout(async () => {
      // }, 1000);
    },

  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：deleteTypes → splitBuildByName → customFn
  async beforeDestroy() {
    if (this.skipBeforeDestroyCleanup) {
      return;
    }
  },
};
