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
        1: this.mode1_noise,
        2: this.mode1_environment,
      },
      // id对应数据
      toolData: {
        1: {
          focusCamera: {
            "location": [
              113.72195488982452,
              34.77714892118064,
              280.25817706526834
            ],
            "pitch": -84.1996078491211,
            "yaw": 119.26325988769531,
            "distance": 0
          },
          heatmapGroups: [
            {
              customId: "my-heatmap-id",
              value: 69,
              points: [
                [113.7225607827478, 34.776201993638246, 1.599997940137712], [113.72262988342825, 34.77627712101795, 1.599997928077528],
                [113.72246031455458, 34.776248313614346, 1.5999980115582], [113.72250361666222, 34.77633512269182, 1.59999801776391],
                [113.72232220915743, 34.77643002485249, 1.599998150624742], [113.72226845127497, 34.77633350009876, 1.599998066811896],
                [113.7228725458145, 34.77691319120383, 1.599998014679095], [113.72267933580757, 34.776993291464116, 1.5999981489166],
                [113.72265540592875, 34.77693900548158, 1.599998143300038], [113.7227303210436, 34.777062418649066, 1.599998144762722],
                [113.72254042411853, 34.77705836939051, 1.5999982480231], [113.72109975024058, 34.77765658527703, 1.599999249291887],
                [113.72118145107197, 34.7777189292949, 1.59999922585843], [113.72100356277814, 34.77778557640041, 1.59999934698999],
                [113.72078913147972, 34.77791155035127, 1.599999508813635], [113.72070804585506, 34.777043065638, 1.59999808423625],
                [113.7206288066812, 34.777167420246705, 1.599998225567397], [113.72066161310877, 34.77799320240311, 1.59999956203661],
                [113.7220447158477, 34.776545214123324, 0], [113.72197070241303, 34.77642071544459, 0],
                [113.72179538389157, 34.776534271462964, 0], [113.72304012716327, 34.7769089245233, 0],
                [113.72301276512218, 34.77676123021831, 0], [113.72311883916058, 34.77689360779142, 0],
                [113.72229873811813, 34.776977281078125, 0], [113.72240467256815, 34.77719387837344, 0],
              ],
              style: {
                type: "plane",
                brushDiameter: 70,
                mappingValueRange: [1, 100],
                mappingHeightRange: [-1000000, 1000000],
                gradientSetting: ["3319ffff", "50ff7aff", "2dff09ff", "f07903ff", "c30c0cff"],
              },
            },
            {
              customId: "my-heatmap-id1",
              value: 65,
              points: [
                [113.72284420007509, 34.77603104170096, 1], [113.72294481169672, 34.7761993440707, 1],
                [113.7232446385504, 34.776650511499376, 1], [113.72335355057594, 34.776814716479116, 1],
                [113.72141762876207, 34.776635353346435, 1], [113.72157238685361, 34.77681178535322, 1],
                [113.72108241873481, 34.7767886998378, 1], [113.72119941929417, 34.7769500667114, 1],
                [113.72030544948005, 34.77712119331376, 1], [113.72037616947546, 34.777329595253384, 1],
                [113.72017595264595, 34.77742235456072, 1], [113.72002168450119, 34.77729362170948, 1],
                [113.720611068703, 34.7777276328997, 1], [113.72040603620643, 34.77785405249387, 1],
                [113.72050191059844, 34.77805157373445, 1], [113.72207297617365, 34.77737086961503, 1],
                [113.72182780905996, 34.77747072641131, 1], [113.72155128509165, 34.77759971809181, 1],
                [113.72151805138428, 34.77732595709814, 1], [113.72188317666918, 34.77723973184429, 1],
                [113.72187371495832, 34.77709634777832, 1], [113.72295740261424, 34.776401240552325, 1],
                [113.72261425731574, 34.77665402707463, 1], [113.72215594791555, 34.77677568761708, 1],
                [113.72164228980587, 34.777048508879936, 1], [113.72067526555642, 34.77747013697098, 1],
                [113.7210877371349, 34.7771802279629, 1], [113.72027634003842, 34.77758891963105, 1],
              ],
              style: {
                type: "plane",
                brushDiameter: 90,
                mappingValueRange: [1, 100],
                mappingHeightRange: [-1000000, 1000000],
                gradientSetting: ["3319ffff", "50ff7aff", "2dff09ff", "2dff09ff", "50ff7aff"],
              },
            },
            {
              customId: "my-heatmap-id2",
              value: 60,
              points: [
                [113.72302068151974, 34.776358225465515, 1], [113.72156952175388, 34.776533446214806, 1],
                [113.72186058475314, 34.77676414333768, 1], [113.72096950780718, 34.77737126962714, 1],
                [113.72119492332156, 34.77741783035947, 1], [113.72084859062845, 34.77689972153724, 1],
                [113.72177579210073, 34.77723206354884, 1],
              ],
              style: {
                type: "plane",
                brushDiameter: 90,
                mappingValueRange: [1, 100],
                mappingHeightRange: [-1000000, 1000000],
                gradientSetting: ["3319ffff", "50ff7aff", "2dff09ff", "e8e650ff", "2dff09ff"],
              },
            },
          ],
        },
        2: {
          focusCamera: {
            "location": [
              113.72220044871489,
              34.77706814304387,
              136.5394558921216
            ],
            "pitch": -68.59977722167969,
            "yaw": 64.06344604492188,
            "distance": 10
          },
          poiLocation: [[113.7224697471257, 34.776057204001525, 9.559934296431612], [113.72264527247079, 34.777266843314585, 9.535960694405496]],
          poiConfig: {
            customId: ["p2_7_ws_environment_1", "p2_7_ws_environment_2"],
            entityName: ["监测点位02", "监测点位03"],
          },
          markerConfig: {
            markerNormalUrl: "DT_env_monitor.png",
            markerActivateUrl: "DT_env_monitor_active.png",
            markerSize: [48, 65],
          },
          clickDistance: 130,
          clickFocusCameras: [
            { location: [113.72249311775472, 34.77626095861978, 36.12122300281095], pitch: -44.00132751464844, yaw: 84.16291809082031, distance: 0.1 },
            { location: [113.72236925193164, 34.77714454826456, 29.86733248965051], pitch: -35.00111770629883, yaw: -36.13650131225586, distance: 0.1 },
          ],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "噪声", content: "79 dB", flex: 0.5 },
              { title: "粉尘浓度", content: "45 µg/m³", flex: 0.5 },
              { title: "温度", content: "26.0°C", flex: 0.5 },
              { title: "湿度", content: "51%", flex: 0.5 },
            ],
            [
              { title: "噪声", content: "78 dB", flex: 0.5 },
              { title: "粉尘浓度", content: "46 µg/m³", flex: 0.5 },
              { title: "温度", content: "26.5°C", flex: 0.5 },
              { title: "湿度", content: "52%", flex: 0.5 },
            ],
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
    // [twin 待实现] 原 wdpapi 调用：deleteObjs → FocusByPoints
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

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → App.Scene.GetByCustomId → new App.HeatMap → App.Scene.Add
    async mode1_noise(data, index) {


      // 清理已存在的同 customId 热力图
      const existingIds = data.heatmapGroups.map((g) => g.customId);

      // 依次创建三组热力图
      for (const group of data.heatmapGroups) {
        const features = group.points.map((point) => ({ point, value: group.value }));
      }
    },

    async mode1_environment(data, index) {
      await this.runPoiWindowModule(data, index, "车间环境监测");
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

  // [twin 待实现] 原 wdpapi 调用：deleteTypes → splitBuildByName
  async beforeDestroy() {
  },
};
