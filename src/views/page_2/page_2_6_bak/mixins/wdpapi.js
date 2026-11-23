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
        1: this.mode1_generator,
        2: this.mode2_transformer,
      },
      // id对应数据
      toolData: {
        1: {
          focusCamera: {
            "location": [
              113.71869660355185,
              34.77628168089931,
              637.8688866586805
            ],
            "pitch": -70.32255554199219,
            "yaw": -83.53645324707031,
            "distance": 10
          },
          poiLocation: [[113.72041620130084, 34.779499298087806, 12.608822581351244], [113.7161689457923, 34.77847766559691, 11.935527986830014]],
          poiConfig: {
            customId: ["p2_6_gen_1", "p2_6_gen_2"],
            entityName: ["发电设施01", "发电设施02"],
          },
          markerConfig: {
            markerNormalUrl: "DT_power.png",
            markerActivateUrl: "DT_power_active.png",
            markerSize: [48, 65],
          },
          entityEids: ["57067"],
          clickDistance: 617,
          clickFocusCameras: [
            {
              "location": [
                113.72105034315165,
                34.778864489682334,
                73.19268288535329
              ],
              "pitch": -33.72257995605469,
              "yaw": -134.38638305664062,
              "distance": 0.1
            },
            { location: [113.71585364935258, 34.777788580657294, 89.722466120881], pitch: -53.222877502441406, yaw: -74.0866928100586, distance: 0.1 },
          ],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          headerRight: "运行",
          rangeLocations: [
            [],
            [[113.71596291362916, 34.77825911015444, 9.580964490030695], [113.71592238953984, 34.77819610403538, 9.580964490030695], [113.71596918055711, 34.7781723456081, 9.580964490030697], [113.71601326495806, 34.77823615360143, 9.580964490030697]],
          ],
          rangeStyle: {
            type: "loop_line",
            fillAreaType: "solid",
            height: 0,
            strokeWeight: 0,
            color: "f853ffff",
            fillAreaColor: "fa3400ff",
            bBlocked: false,
          },
          windowData: [
            [
              { title: "当前输出", content: "6.8 MW", flex: 0.5 },
              { title: "今日发电量", content: "160 MWh", flex: 0.5 },
              { title: "可用功率", content: "7.5 MW", flex: 0.5 },
            ],
            [
              { title: "当前输出", content: "7.2 MW", flex: 0.5 },
              { title: "今日发电量", content: "155 MWh", flex: 0.5 },
              { title: "可用功率", content: "7.5 MW", flex: 0.5 },
            ],
          ],
        },
        2: {
          focusCamera: {
            "location": [
              113.72369656780063,
              34.77373296647845,
              385.38016397664984
            ],
            "pitch": -50.9727783203125,
            "yaw": -18.286428451538086,
            "distance": 10
          },
          clickCameraFocus: {
            "location": [
              113.72503230707348,
              34.77395818687787,
              169.4964561053846
            ],
            "pitch": -44.2227783203125,
            "yaw": 2.563572883605957,
            "distance": 10
          },
          clickFocusCameras: [
            { location: [113.72583907673638, 34.77386421865383, 68.3978063771974], pitch: -35.97329330444336, yaw: -12.736247062683105, distance: 0.1 },
          ],
          poiLocation: [[113.72665539925733, 34.77396697892957, 6.035388423839118]],
          poiConfig: {
            customId: ["p2_6_trans_1"],
            entityName: ["变压器01"],
          },
          markerConfig: {
            markerNormalUrl: "DT_transformer.png",
            markerActivateUrl: "DT_transformer_active.png",
            markerSize: [48, 65],
          },
          clickDistance: 146,
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowTag2: ["10kV机加变T01"],
          entityEids: ["57063"],
          windowData: [
            [
              { title: "负载率", content: "62%", flex: 0.5 },
              { title: "油温", content: "58°C", flex: 0.5 },
              { title: "温升", content: "18°C", flex: 0.5 },
              { title: "健康等级", content: "良好", flex: 0.5 },
            ]
          ],
        },
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
      this.$store.commit('setGen2Active', false);
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addRange → addWINDOWS
    async runPoiWindowModule(data, index, fallbackPrefix, onWindowChange) {
      if (!data?.poiLocation?.length) return;




      let activeWindowIndex = -1;
      let activeWindowObj = null;
      let activeRangeObjs = [];
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon = sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon = sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    async mode1_generator(data, index) {
      await this.runPoiWindowModule(data, index, "发电设施", (activeIndex) => {
        this.$store.commit('setGen2Active', activeIndex === 1);
      });
    },

    async mode2_transformer(data, index) {
      await this.runPoiWindowModule(data, index, "变压器");
    },

    // [twin 待实现] 原 wdpapi 调用：resetCamera
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      await this.normalPoi('/page_2/6-workshop');
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
    this.$store.commit('setGen2Active', false);
  },
};
