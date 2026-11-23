// WDP API 混入模板
import { mapState } from "vuex";
import store from "../../../../store/index";
import toolCleanupMixin from "@/mixins/toolCleanupMixin.js";
import { MODULE_SCENES, BUILDINGS, RANGE_STYLE } from "../data/sceneConfig.js";

const MODULE_HIGHLIGHT_STYLE = "SpringGreen";

export default {
  mixins: [toolCleanupMixin],
  data() {
    return {
      // id对应方法
      toolHandlersW: {
        1: this.mode1_generatorW,
        2: this.mode2_transformerW,
      },
      // id对应数据
      toolDataW: {
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
      toolTypesW: {
        2: [],
        5: [],
      },

      //对象存储
      toolObjsW: {
        1: [],
        2: [],
        3: [],
      },
      activeOutlineObjW: null,
      hasSceneInitW: false, // 防止场景就绪后重复初始化
      moduleSceneObjs: [], // 能力模块场景创建的实体(Range/Parabola)
      moduleHighlightObjs: [], // 能力模块当前高亮的建筑实体
      moduleHeatMapId: null, // 能力模块当前开启的热力图 id
      moduleSceneToken: 0, // 快速切换时丢弃过期的异步结果
    };
  },
  computed: {
    ...mapState(["isSceneAlready"]),
  },
  watch: {
    async isSceneAlready(newVal) {
      if (newVal) {
        await this.initAfterSceneReadyW();
      }
    },
  },
  methods: {
    // [twin 待实现] 原 wdpapi 调用：deleteObjs → resetCamera → setEntityOutline
    async closeAllW() {
      for (const key in this.toolObjsW) {
        if (this.toolObjsW[key] && this.toolObjsW[key].length > 0) {
          this.toolObjsW[key] = [];
        }
      }
      if (this.activeOutlineObjW) {
        this.activeOutlineObjW = null;
      }
      this.$store.commit('setGen2Active', false);
    },

    // 清除能力模块场景（取消高亮 + 删除本模块创建的实体 + 关闭热力图）
    // [twin 待实现] 原 wdpapi 调用：setEntitiesHighlight → deleteObjs → controlHeatMap
    async clearModuleSceneW() {
      const highlightObjs = this.moduleHighlightObjs;
      const sceneObjs = this.moduleSceneObjs;
      const heatMapId = this.moduleHeatMapId;
      this.moduleHighlightObjs = [];
      this.moduleSceneObjs = [];
      this.moduleHeatMapId = null;
      if (highlightObjs.length) {
      }
      if (sceneObjs.length) {
      }
      if (heatMapId !== null) {
      }
    },

    // 应用能力模块场景：镜头机位 + 建筑高亮 + 区域轮廓 + 迁徙图路径
    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → getByEids → setEntitiesHighlight → addRange → addParabola → controlHeatMap → setEntitiesHighlight → deleteObjs → controlHeatMap
    async applyModuleSceneW(moduleId) {
      if (!this.isSceneAlready) return;
      const token = ++this.moduleSceneToken;
      await this.clearModuleSceneW();

      const scene = MODULE_SCENES[moduleId];
      if (!scene) return;

      const createdObjs = [];
      const highlightObjs = [];
      const isStale = () => token !== this.moduleSceneToken;

      if (isStale()) return;
      if (scene.camera) {
      }

      if (!isStale() && scene.highlights?.length) {
        const eids = scene.highlights.reduce(
          (acc, key) => acc.concat(BUILDINGS[key]?.eids || []),
          []
        );
      }

      for (const [i, range] of (scene.ranges || []).entries()) {
        if (isStale()) break;
      }

      for (const [i, link] of (scene.parabolas || []).entries()) {
        if (isStale()) break;
        const [fromKey, toKey, linkStyle] = link; // linkStyle 可选，单独覆盖该条线的样式
        const start = BUILDINGS[fromKey]?.position;
        const end = BUILDINGS[toKey]?.position;
        if (!start || !end) continue;
      }

      let heatMapId = null;
      if (!isStale() && scene.heatMap) {
        heatMapId = scene.heatMap.id;
      }

      // 快速切换导致本次结果已过期，回滚本次产物避免残留
      if (isStale()) {
        if (highlightObjs.length) {
        }
        return;
      }

      this.moduleSceneObjs = createdObjs;
      this.moduleHighlightObjs = highlightObjs;
      this.moduleHeatMapId = heatMapId;
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addRange → addWINDOWS
    async runPoiWindowModuleW(data, index, fallbackPrefix, onWindowChange) {
      if (!data?.poiLocation?.length) return;




      let activeWindowIndex = -1;
      let activeWindowObj = null;
      let activeRangeObjs = [];
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon = sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon = sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    async mode1_generatorW(data, index) {
      await this.runPoiWindowModuleW(data, index, "发电设施", (activeIndex) => {
        this.$store.commit('setGen2Active', activeIndex === 1);
      });
    },

    async mode2_transformerW(data, index) {
      await this.runPoiWindowModuleW(data, index, "变压器");
    },

    // [twin 待实现] 原 wdpapi 调用：resetCamera
    async initAfterSceneReadyW() {
      // 与 wdpapi.js 同页混入时由后者负责场景初始化，避免 POI 重复创建
      if (typeof this.initAfterSceneReady === "function") return;
      if (!this.isSceneAlready || this.hasSceneInitW) {
        return;
      }
      this.hasSceneInitW = true;
      await this.normalPoi('/page_2/6-workshop');
    },

  },

  async mounted() {
    await this.initAfterSceneReadyW();
  },

  // [twin 待实现] 原 wdpapi 调用：setEntityOutline → deleteTypes
  async beforeDestroy() {
    this.moduleSceneToken++;
    await this.clearModuleSceneW();
    if (this.activeOutlineObjW) {
      this.activeOutlineObjW = null;
    }
    this.$store.commit('setGen2Active', false);
  },
};
