// WDP API 混入模板
import { mapState } from "vuex";
import store from "../../../../store/index";
import toolCleanupMixin from "@/mixins/toolCleanupMixin.js";
import { createPoiWindowPath } from "@/mixins/poi-window-path.js";

export default {
  mixins: [toolCleanupMixin],
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: this.mode1_risk,
        2: this.mode2_camera,
        3: this.mode3_booth,
        4: this.mode4_patrol,
      },
      // id对应数据
      toolData: {
        1: {
          focusCamera: {
            "location": [
              113.7199178600999,
              34.77731231248379,
              461.24442278542995
            ],
            "pitch": -64.32255554199219,
            "yaw": -75.7364501953125,
            "distance": 10
          },
          poiLocation: [[113.720629652613, 34.778831370524436, 0.17175781250003638]],
          poiConfig: {
            customId: ["p2_8_risk_1"],
            entityName: ["风险点位"],
          },
          markerConfig: {
            markerNormalUrl: "DT_risk_point.png",
            markerActivateUrl: "DT_risk_point.png",
            markerSize: [48, 65],
          },
          clickDistance: 146,
          particleLocation: [113.720629652613, 34.778831370524436, 0.17075781250003638],
          particleConfig: {
            "scale3d": [18, 18, 18],
            "particleType": "fire",
            "bVisible": true,
            "entityName": "风险点位-粒子特效",
            "customId": "p2_8_risk_particle_1",
          },
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          headerRight: ["违章"],
          bgType: "bg_red_190_144",
          windowData: [
            [
              { title: "当前等级", content: "中级", flex: 0.5 },
              { title: "触发概率", content: "0.62", flex: 0.5 },
              { title: "最近处置", content: "02-27 18:00", flex: 0.5 },
            ]
          ],
        },
        2: {
          poiLocation: [
            [113.72084571759868, 34.779155974473106, 0.1717578125],
            [113.71975842369291, 34.777147032971875, 0.42175769999996365],
            [113.72300463937586, 34.77556179500143, -3.637978807091713e-14],
          ],
          poiConfig: {
            customId: ["p2_8_camera_1", "p2_8_camera_2", "p2_8_camera_3"],
            entityName: ["摄像头01", "摄像头02", "摄像头03"],
          },
          markerConfig: {
            markerNormalUrl: "DT_camera.png",
            markerActivateUrl: "DT_camera_active.png",
            markerSize: [48, 65],
          },
          focusCamera: {
            "location": [
              113.71858116320401,
              34.775290134535794,
              479.88608816372545
            ],
            "pitch": -51.19999313354492,
            "yaw": -30.436452865600586,
            "distance": 10
          },
          clickDistance: 700,
          poiFocusCameras: [
            { location: [113.7198324210755, 34.77852682259889, 144.44821337461588], pitch: -45.950313568115234, yaw: -35.38644790649414, distance: 0.1 },
            { location: [113.71879143493437, 34.77657290075707, 150.11938184845732], pitch: -45.950313568115234, yaw: -35.38644790649414, distance: 0.1 },
            { location: [113.72223145315853, 34.77533051172591, 178.66397859355376], pitch: -63.80015182495117, yaw: -35.38642883300781, distance: 0.1 },
          ],
          windowConfig: {
            size: [190, 222],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "点位", content: "西北角xxxxxx", flex: 1 },
              { title: "监控画面", content: "gc", flex: 1 },
            ],
            [
              { title: "点位", content: "西南角xxxxxx", flex: 1 },
              { title: "监控画面", content: "gc", flex: 1 },
            ],
            [
              { title: "点位", content: "东南角xxxxxx", flex: 1 },
              { title: "监控画面", content: "gc", flex: 1 },
            ]
          ],
        },
        3: {
          poiLocation: [[113.71435098434267, 34.77862636127909, 2.735971960851623], [113.71498275144471, 34.778353924860326, 3.3846374112509667]],
          poiConfig: {
            customId: ["p2_8_booth_1", "p2_8_booth_2", "p2_8_booth_3"],
            entityName: ["岗亭-西门", "岗亭-东门", "岗亭-西门"],
          },
          markerConfig: {
            markerNormalUrl: "DT_booth.png",
            markerActivateUrl: "DT_booth_active.png",
            markerSize: [48, 65],
          },
          focusCamera: {
            "location": [
              113.71498860751994,
              34.777353510928926,
              280.6794827513698
            ],
            "pitch": -60.500152587890625,
            "yaw": -88.9370346069336,
            "distance": 0.1
          },
          clickDistance: 700,
          poiFocusCameras: [
            { location: [113.71442160568749, 34.778351213806886, 24.82387069590756], pitch: -32.45094680786133, yaw: -100.33614349365234, distance: 0.1 },
            { location: [113.71473860820225, 34.77813569840859, 28.851376390580153], pitch: -36.95070266723633, yaw: -50.98725128173828, distance: 0.1 },
          ],
          entityEids: ["57066", "57065"],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "责任人", content: "张三", flex: 0.5 },
              { title: "在岗人数", content: "5", flex: 0.5 },
              { title: "最近巡检", content: "02-28 10:05", flex: 0.5 },
              { title: "本班异常处置", content: "1次", flex: 0.5 },
            ],
            [
              { title: "责任人", content: "李四", flex: 0.5 },
              { title: "在岗人数", content: "5", flex: 0.5 },
              { title: "最近巡检", content: "02-28 10:07", flex: 0.5 },
              { title: "本班异常处置", content: "0次", flex: 0.5 },
            ],
            [
              { title: "责任人", content: "王五", flex: 0.5 },
              { title: "在岗人数", content: "5", flex: 0.5 },
              { title: "最近巡检", content: "02-28 10:10", flex: 0.5 },
              { title: "本班异常处置", content: "1次", flex: 0.5 },
            ],
          ],
        },
        4: {
          poiLocation: [
            [113.72406159419889, 34.77512264615672, 0],
            [113.72025370357849, 34.77850025771139, -1.4551915228366852e-13],
          ],
          poiConfig: {
            customId: ["p2_8_patrol_1", "p2_8_patrol_2"],
            entityName: ["巡检设备0001", "巡检设备0002"],
          },
          markerConfig: {
            markerNormalUrl: "DT_inspect.png",
            markerActivateUrl: "DT_inspect_active.png",
            markerSize: [48, 65],
          },
          focusCamera: {
            "location": [
              113.72198979115596,
              34.77670449780214,
              454.7745204140472
            ],
            "pitch": -89,
            "yaw": -61.48637008666992,
            "distance": 10
          },
          clickDistance: 700,
          pathData: [
            [
              [113.72406159419889, 34.77512264615672, 0],
              [113.71927060130842, 34.77731050579289, 1.0186340659856797e-12],
            ],
            [
              [113.72025370357849, 34.77850025771139, -1.4551915228366852e-13],
              [113.7249958255332, 34.776581737076214, 0],
            ],
          ],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          headerRight: ["运行", "运行"],
          windowLocation: [[113.722433788502, 34.77669907133933, 24.270917290882124], [113.72052165603307, 34.77818848301397, 23.304053607811138]],
          followConfig: { pitch: -30, yaw: 0, distance: 50 },
          windowData: [
            [
              // 设备编号：0001；运行状态=运行；电量=64%；本次覆盖=机加区+总装；最近发现异常=无
              { title: "电量", content: "64%", flex: 0.5 },
              { title: "本次覆盖", content: "机加区+总装", flex: 0.5 },
              { title: "最近发现异常", content: "无", flex: 0.5 },
            ],
            [
              // 设备编号：0002；运行状态=运行；电量=64%；本次覆盖=机加区+总装；最近发现异常=无
              { title: "电量", content: "70%", flex: 0.5 },
              { title: "本次覆盖", content: "机加区+总装", flex: 0.5 },
              { title: "最近发现异常", content: "无", flex: 0.5 },
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
        4: [],
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
    // [twin 待实现] 原 wdpapi 调用：setEntityOutline → setEntityOutline → App.CameraControl.Stop → deleteObjs → resetCamera
    async closeAll() {
      if (this._followingParticle) {
        this._followingParticle = null;
      }
      if (this.activeOutlineObj) {
        this.activeOutlineObj = null;
      }
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          this.toolObjs[key] = [];
        }
      }
      this.$store.commit("setWindowEid", null);
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addParticle → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addWINDOWS
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

    async mode3_booth(data, index) {
      await this.runPoiFocusWindowModule(data, index, "岗亭");
    },

    async mode4_patrol(data, index) {
      if (!data) return;
      const self = this;

      const result = await createPoiWindowPath({
        poi: {
          locations: data.poiLocation,
          poiConfig: data.poiConfig,
          markerConfig: data.markerConfig,
        },
        window: {
          locations: data.windowLocation,
          windowConfig: data.windowConfig,
          windowData: data.windowData,
          options: {
            type: "type7",
            bgType: "bg_190_144",
          },
          optionsPerWindow: data.poiLocation.map((_, i) => ({
            headerTag: data.windowTag?.[i] || "",
            headerTag2: data.windowTag2?.[i] || "",
            headerRight: data.headerRight?.[i] || "",
          })),
        },
        path: {
          pathData: data.pathData,
          poiPathConfig: {
            type: "arrow",
            width: 6,
            color: "e2f5ff",
            passColor: "00e5ff",
          },
          windowPathConfig: {
            type: "solid",
            width: 1,
            color: "rgba(0,0,0,0)",
            passColor: "rgba(0,0,0,0)",
          },
          moveTimes: [90, 95],
        },
        particle: {
          particleType: "vehicle_car_white",
          scale3d: [6, 6, 6],
          up: 0.5,
          yaw: -1,
        },
        focusCamera: data.focusCamera,
        prefix: "p2_8_patrol",
        // [twin 待实现] 原 wdpapi 调用：setEntityOutline → followEntity
        onActivate: async (i, { particleObjs }) => {
          const particle = particleObjs[i];
          if (particle) {
            self._followingParticle = particle;
          }
        },
        // [twin 待实现] 原 wdpapi 调用：setEntityOutline → App.CameraControl.Stop → FocusByPoints
        onDeactivate: async () => {
          if (self._followingParticle) {
            self._followingParticle = null;
          }
          if (data.focusCamera) {
          }
        },
      });

      this.toolObjs[index].push(...result.allObjs);
    },

    // [twin 待实现] 原 wdpapi 调用：resetCamera
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      await this.normalPoi('/page_2/8-workshop');
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
