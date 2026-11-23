// WDP API 混入模板
import { mapState } from "vuex";

export default {
  mixins: [],
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: this.mode1_people,
        2: this.mode2_device,
        3: this.mode3_env,
        4: this.mode4_camera,
        5: this.mode5_workstation,
      },
      // id对应数据
      toolData: {
        1: {
          focusCamera: {
            location: [
              113.72235326899771, 34.77742855047473, 97.85929268514744,
            ],
            pitch: -65.44970703125,
            yaw: 106.3628921508789,
            distance: 0,
          },
          poiLocation: [
            [113.72239113709044, 34.77724154501969, 0.1860222968668235],
          ],
          poiConfig: {
            customId: ["p2_1_ws_people_1"],
            entityName: ["人员"],
          },
          markerConfig: {
            markerNormalUrl: "DT_person.png",
            markerActivateUrl: "DT_person_active.png",
            markerSize: [48, 65],
          },
          clickFocusCamera: {
            location: [113.722218898868, 34.77738351392271, 29.3829471981563],
            pitch: -46.849552154541016,
            yaw: 50.862728118896484,
            distance: 0,
          },
          windowType: "type7",
          windowConfig: {
            size: [190, 246],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "姓名", content: "张大大", flex: 0.5 },
              { title: "工号", content: "00103850", flex: 0.5 },
              { title: "联系方式", content: "138xxxxxxxx", flex: 1 },
              { title: "工种", content: "焊接班组操作员", flex: 1 },
              { title: "班组", content: "A3", flex: 0.5 },
            ],
          ],
        },
        2: {
          focusCamera: {
            location: [
              113.72207407070762, 34.77750071071611, 67.49525436436386,
            ],
            pitch: -76.24966430664062,
            yaw: 118.51273345947266,
            distance: 10,
          },
          poiLocation: [
            [113.72199881663254, 34.77743120973399, 6.144841052226572],
          ],
          poiConfig: {
            customId: ["p2_1_ws_device_1"],
            entityName: ["设备"],
          },
          markerConfig: {
            markerNormalUrl: "DT_CNC.png",
            markerActivateUrl: "DT_CNC_active.png",
            markerSize: [109, 72],
          },
          clickFocusCamera: {
            location: [
              113.7223621530213, 34.777368404932304, 27.401763509762816,
            ],
            pitch: -41.59971237182617,
            yaw: 179.2618865966797,
            distance: 0.1,
          },
          windowType: "type5",
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "运行状态", content: "运行", flex: 0.5 },
              { title: "OEE", content: "87%", flex: 0.5 },
              { title: "主轴负载", content: "68%", flex: 0.5 },
              { title: "今日报警次数", content: "0", flex: 0.5 },
            ],
          ],
          windowTag2: ["立式加工中心01"],
        },
        3: {
          focusCamera: {
            location: [
              113.72218594609063, 34.77710354577759, 151.88198410895126,
            ],
            pitch: -69.95046997070312,
            yaw: 52.21299743652344,
            distance: 10,
          },
          poiLocation: [
            [113.72265263626333, 34.7772747284428, 9.583011228620537],
            [113.72252649295794, 34.77603004562972, 9.559933410146561],
          ],
          poiConfig: {
            customId: ["p2_1_ws_env_1", "p2_1_ws_env_2"],
            entityName: ["监测点位02", "监测点位03"],
          },
          markerConfig: {
            markerNormalUrl: "DT_device.png",
            markerActivateUrl: "DT_device_active.png",
            markerSize: [48, 65],
          },
          clickDistance: 151,
          clickFocusCameras: [
            {
              location: [
                113.72236925193164, 34.77714454826456, 29.86733248965051,
              ],
              pitch: -35.00111770629883,
              yaw: -36.13650131225586,
              distance: 0.1,
            },
            {
              location: [
                113.72249311775472, 34.77626095861978, 36.12122300281095,
              ],
              pitch: -44.00132751464844,
              yaw: 84.16291809082031,
              distance: 0.1,
            },
          ],
          windowType: "type5",
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
        4: {
          focusCamera: {
            location: [
              113.72178465171072, 34.77715785887853, 302.3158421824016,
            ],
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
            [113.72002670100791, 34.777106199420174, 6.180684283337806],
          ],
          poiConfig: {
            customId: [
              "p2_1_ws_camera_1",
              "p2_1_ws_camera_2",
              "p2_1_ws_camera_3",
              "p2_1_ws_camera_4",
              "p2_1_ws_camera_5",
              "p2_1_ws_camera_6",
              "p2_1_ws_camera_7",
              "p2_1_ws_camera_8",
            ],
            entityName: [
              "摄像头01",
              "摄像头02",
              "摄像头03",
              "摄像头04",
              "摄像头05",
              "摄像头06",
              "摄像头07",
              "摄像头08",
            ],
          },
          markerConfig: {
            markerNormalUrl: "DT_camera.png",
            markerActivateUrl: "DT_camera_active.png",
            markerSize: [48, 65],
          },
          clickDistance: 302,
          clickFocusCameras: [
            {
              location: [
                113.72261719194323, 34.776165640806255, 39.24704358634352,
              ],
              pitch: -36.3503532409668,
              yaw: 50.26392364501953,
              distance: 0.1,
            },
            {
              location: [
                113.72276641266843, 34.77632563102449, 39.24704358634352,
              ],
              pitch: -36.3503532409668,
              yaw: 50.26392364501953,
              distance: 0.1,
            },
            {
              location: [
                113.72312282301272, 34.77678942144915, 39.24704358634352,
              ],
              pitch: -36.3503532409668,
              yaw: 50.26392364501953,
              distance: 0.1,
            },
            {
              location: [
                113.723267900921, 34.77698972536329, 39.24704358634352,
              ],
              pitch: -36.3503532409668,
              yaw: 50.26392364501953,
              distance: 0.1,
            },
            {
              location: [
                113.72086109330104, 34.77801606036032, 40.477843568467655,
              ],
              pitch: -29.900768280029297,
              yaw: -170.08599853515625,
              distance: 0.1,
            },
            {
              location: [
                113.72065996392335, 34.77781768040476, 40.477843568467655,
              ],
              pitch: -29.900768280029297,
              yaw: -170.08599853515625,
              distance: 0.1,
            },
            {
              location: [
                113.7204690292308, 34.7773479632007, 14.478769197475037,
              ],
              pitch: -8.15102767944336,
              yaw: 173.26406860351562,
              distance: 0.1,
            },
            {
              location: [
                113.72031687483724, 34.77719164922275, 12.480199269269244,
              ],
              pitch: -15.201085090637207,
              yaw: 166.3637237548828,
              distance: 0.1,
            },
          ],
          windowType: "type1",
          windowConfig: {
            size: [190, 222],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "点位", content: "xxxx 1号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "xxxx 2号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "xxxx 3号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "xxxx 4号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "xxxx 5号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "xxxx 6号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "xxxx 7号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
            [
              { title: "点位", content: "xxxx 8号", flex: 1 },
              { title: "监控画面", content: "", flex: 1 },
            ],
          ],
        },
        5: {
          focusCamera: {
            location: [
              113.72171422788617, 34.77705374744689, 303.8316841637755,
            ],
            pitch: -88.99766540527344,
            yaw: 118.51263427734375,
            distance: 0.1,
          },
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
        4: [],
        5: [],
      },
      // 防止场景就绪后重复初始化
      hasSceneInit: false,
      isMode5Active: false,
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
    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → splitBuildByName
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      // setTimeout(async () => {
      // }, 1000);
    },

    // [twin 待实现] 原 wdpapi 调用：areaTags → setSceneTime → deleteObjs → FocusByPoints
    async closeAll() {
      if (this.isMode5Active) {
        this.isMode5Active = false;
      }
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          this.toolObjs[key] = [];
        }
      }
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addPOI → <实体>.onClick → deleteObjs → FocusByPoints → <实体>.Update → addWINDOWS
    async runPoiFocusWindowModule(data, index, fallbackPrefix) {
      if (!data?.poiLocation?.length) return;




      let activeWindowIndex = -1;
      let activeWindowObj = null;
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon = sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon =
        sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    async mode1_people(data, index) {
      await this.runPoiFocusWindowModule(data, index, "人员");
    },

    async mode2_device(data, index) {
      await this.runPoiFocusWindowModule(data, index, "设备");
    },

    async mode3_env(data, index) {
      await this.runPoiFocusWindowModule(data, index, "环境");
    },

    async mode4_camera(data, index) {
      await this.runPoiFocusWindowModule(data, index, "摄像头");
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → areaTags → setSceneTime
    async mode5_workstation(data, index) {
      if (!data) return;
      this.isMode5Active = true;
    },
  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：areaTags → setSceneTime → deleteTypes → splitBuildByName
  async beforeDestroy() {
    if (this.isMode5Active) {
    }
  },
};
