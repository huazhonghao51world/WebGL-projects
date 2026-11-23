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
        1: this.mode1_cabinet,
      },
      // id对应数据
      toolData: {
        1: {
          focusCamera: {
            "location": [
              113.72233268229859,
              34.77674325825544,
              139.45814352144183
            ],
            "pitch": -60.79972839355469,
            "yaw": -160.48678588867188,
            "distance": 0
          },
          poiLocation: [[113.72185280222837,34.77631860550303,2.5259354410957524],[113.7214674895178,34.77725295598407,2.525928903411321]],
          poiConfig: {
            customId: ["p2_6_ws_cab_1", "p2_6_ws_cab_2"],
            entityName: ["配电柜01", "配电柜02"],
          },
          markerConfig: {
            markerNormalUrl: "DT_cabinet.png",
            markerActivateUrl: "DT_cabinet_active.png",
            markerSize: [48, 65],
          },
          clickDistance: 126,
          clickFocusCameras: [
            { location: [113.72194150669135, 34.77644238544541, 17.66425362664689], pitch: -41.29993438720703, yaw: 116.41252136230469, distance: 0.1 },
            { location: [113.72156312848435, 34.77737488421967, 15.297603533796751], pitch: -44.45037078857422, yaw: 119.56358337402344, distance: 0.1 },
          ],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowTag2: ["工段配电柜C01", "工段配电柜C02"],
          entityEids: [
            ["56939", "56940"],
            ["56997", "56998"],
          ],
          windowData: [
            [
              { title: "输出电流", content: "580 A", flex: 0.5 },
              { title: "开关状态", content: "合闸", flex: 0.5 },
              { title: "告警数", content: "0", flex: 0.5 },
              { title: "漏电保护", content: "正常", flex: 0.5 },
            ],
            [
              { title: "输出电流", content: "620 A", flex: 0.5 },
              { title: "开关状态", content: "合闸", flex: 0.5 },
              { title: "告警数", content: "2（短时）", flex: 0.5 },
              { title: "漏电保护", content: "正常", flex: 0.5 },
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
      activeOutlineObjs: [],
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
    // [twin 待实现] 原 wdpapi 调用：deleteObjs → FocusByPoints → setEntityOutline
    async closeAll() {
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          this.toolObjs[key] = [];
        }
      }
      this.activeOutlineObjs = [];
    },
    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addWINDOWS
    async runPoiWindowModule(data, index, fallbackPrefix) {
      if (!data?.poiLocation?.length) return;




      let activeWindowIndex = -1;
      let activeWindowObj = null;
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon = sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon = sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    async mode1_cabinet(data, index) {
      await this.runPoiWindowModule(data, index, "配电柜");
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → splitBuildByName
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      // setTimeout(async () => {
      // }, 1000);
    },

  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：setEntityOutline → deleteTypes → splitBuildByName
  async beforeDestroy() {
    this.activeOutlineObjs = [];
  },
};
