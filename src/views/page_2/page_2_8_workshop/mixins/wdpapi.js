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
        1: this.mode1_risk,
        2: this.mode2_camera,
      },
      // id对应数据
      toolData: {
        1: {
          focusCamera: {
            "location": [
              113.72225961690289,
              34.776565893027175,
              65.65915435232539
            ],
            "pitch": -55.5499382019043,
            "yaw": 92.4134521484375,
            "distance": 0.1
          },
          poiLocation: [[113.72220480771509, 34.77615952579606, 0.87593666733409167]],
          poiConfig: {
            customId: ["p2_8_ws_risk_1"],
            entityName: ["风险点位"],
          },
          markerConfig: {
            markerNormalUrl: "DT_risk_point.png",
            markerActivateUrl: "DT_risk_point.png",
            markerSize: [48, 65],
          },
          clickFocusCameras: [
            {
              "location": [
                113.72220917660174,
                34.77629007864941,
                12.40532425684368
              ],
              "pitch": -38.900699615478516,
              "yaw": 92.56332397460938,
              "distance": 0.1
            }
          ],
          particleLocation: [113.7221938939804, 34.77643755425518, 10.769020535748716],
          particleConfig: {
            "scale3d": [1, 1, 1],
            "particleType": "fire",
            "bVisible": true,
            "entityName": "风险点位-粒子特效",
            "customId": "p2_8_risk_particle_1",
          },
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          headerRight: ["电气隐患"],
          bgType: "bg_red_190_144",
          entityEids: [["56935", "56936"]],
          windowData: [
            [
              { title: "当前等级", content: "警告", flex: 0.5 },
              { title: "触发概率", content: "0.71", flex: 0.5 },
              { title: "最近处置", content: "02-27 17:40", flex: 0.5 },
            ]
          ],
        },
        2: {
          focusCamera: {
            location: [113.72178465171072, 34.77715785887853, 302.3158421824016],
            pitch: -89,
            yaw: 120.3135986328125,
            distance: 10,
          },
          poiLocation: [
            [113.72294837265211, 34.77590147680767, 8.395440274439553],
            [113.72307317664968, 34.77609413650547, 8.368834011201802],
            [113.72340841063169, 34.776611892494756, 8.412712269085368],
            [113.72354600160818, 34.77682428719564, 8.776288179476168],
            [113.72038466194091, 34.77814729449292, 8.085372080495143],
            [113.72020805559039, 34.777874656485636, 8.654221287681422],
            [113.72014945786286, 34.77732269460408, 8.990606497704986],
            [113.72002670100791, 34.777106199420174, 6.180684283337806]
          ],
          poiConfig: {
            customId: [
              "p2_8_ws_camera_1",
              "p2_8_ws_camera_2",
              "p2_8_ws_camera_3",
              "p2_8_ws_camera_4",
              "p2_8_ws_camera_5",
              "p2_8_ws_camera_6",
              "p2_8_ws_camera_7",
              "p2_8_ws_camera_8",
            ],
            entityName: [
              "摄像堁01",
              "摄像堁02",
              "摄像堁03",
              "摄像堁04",
              "摄像堁05",
              "摄像堁06",
              "摄像堁07",
              "摄像堁08",
            ],
          },
          markerConfig: {
            markerNormalUrl: "DT_camera.png",
            markerActivateUrl: "DT_camera_active.png",
            markerSize: [48, 65],
          },
          clickDistance: 280,
          clickFocusCameras: [
            { location: [113.72261719194323, 34.776165640806255, 39.24704358634352], pitch: -36.3503532409668, yaw: 50.26392364501953, distance: 0.1 },
            { location: [113.72276641266843, 34.77632563102449, 39.24704358634352], pitch: -36.3503532409668, yaw: 50.26392364501953, distance: 0.1 },
            { location: [113.72312282301272, 34.77678942144915, 39.24704358634352], pitch: -36.3503532409668, yaw: 50.26392364501953, distance: 0.1 },
            { location: [113.723267900921, 34.77698972536329, 39.24704358634352], pitch: -36.3503532409668, yaw: 50.26392364501953, distance: 0.1 },
            { location: [113.72086109330104, 34.77801606036032, 40.477843568467655], pitch: -29.900768280029297, yaw: -170.08599853515625, distance: 0.1 },
            { location: [113.72065996392335, 34.77781768040476, 40.477843568467655], pitch: -29.900768280029297, yaw: -170.08599853515625, distance: 0.1 },
            { location: [113.7204690292308, 34.7773479632007, 14.478769197475037], pitch: -8.15102767944336, yaw: 173.26406860351562, distance: 0.1 },
            { location: [113.72031687483724, 34.77719164922275, 12.480199269269244], pitch: -15.201085090637207, yaw: 166.3637237548828, distance: 0.1 },
          ],
          windowConfig: {
            size: [190, 222],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "点位", content: "A区 1号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "A区 2号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "A区 3号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "A区 4号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "B区 1号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "B区 2号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "B区 3号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "B区 4号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
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
      this.$store.commit("setWindowEid", null);
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addPOI → addParticle → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addWINDOWS
    async runPoiFocusWindowModule(data, index, fallbackPrefix = "点位") {
      if (!data?.poiLocation?.length) return;

      if (data.focusCamera) {
      }



      if (data.particleLocation) {
      }

      let activeWindowIndex = -1;
      let activeWindowObj = null;
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon = sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon = sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    async mode1_risk(data, index) {
      await this.runPoiFocusWindowModule(data, index, "风险点位");
    },

    async mode2_camera(data, index) {
      await this.runPoiFocusWindowModule(data, index, "摄像头");
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
