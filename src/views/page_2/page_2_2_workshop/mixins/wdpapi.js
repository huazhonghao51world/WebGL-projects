// WDP API 混入模板
import { mapState } from "vuex";

export default {
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: this.mode1_device,
        2: this.mode2_station,
        3: this.mode3_storage,
        4: this.mode4_quality,
      },
      // id对应数据
      toolData: {
        1: {
          focusCamera: {
            location: [113.7219262117984, 34.77756308420902, 200.6446410081609],
            pitch: -76.39967346191406,
            yaw: 108.4632797241211,
            distance: 0,
          },
          poiLocation: [
            [113.72200639697174, 34.77742911492325, 6.144841052226562],
          ],
          poiConfig: {
            customId: ["p2_2_ws_device_1"],
            entityName: ["设备"],
          },
          markerConfig: {
            markerNormalUrl: "DT_CNC.png",
            markerActivateUrl: "DT_CNC_active.png",
            markerSize: [109, 72],
          },
          clickFocusCamera: {
            location: [
              113.72198539896206, 34.77754817529917, 30.204373321232936,
            ],
            pitch: -47.60013198852539,
            yaw: 70.96370697021484,
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
          navigateOnClick: {
            path: "/page_2/2-device",
            query: { from: "workshop" },
          },
        },
        2: {
          focusCamera: {
            location: [
              113.72171422788617, 34.77705374744689, 303.8316841637755,
            ],
            pitch: -88.99766540527344,
            yaw: 118.51263427734375,
            distance: 0.1,
          },
          poiLocation: [
            [113.72269735483378, 34.77650691782101, 1.000000000000002],
          ],
          poiConfig: {
            customId: ["p2_2_ws_station_1"],
            entityName: ["工位-A01"],
          },
          markerConfig: {
            markerNormalUrl: "DT_work_station.png",
            markerActivateUrl: "DT_work_station_active.png",
            markerSize: [48, 65],
          },
          windowLocation: [113.72269319409534, 34.776486421515145, 1],
          rangeData: [
            [113.72284575920649, 34.77638834796547, 0.17796730698252888],
            [113.72290372608514, 34.77647800718969, 0.17796730698252888],
            [113.72258922497716, 34.77661330061817, 0.17796730698252888],
            [113.72253488923155, 34.77652480156325, 0.1759388458673233],
          ],
          rangeConfig: {
            type: "wave",
            fillAreaType: "none",
            height: 3,
            strokeWeight: 1,
            color: "rgba(71,161,181,1)",
          },
          clickFocusCamera: {
            location: [
              113.72257774784191, 34.77672433657876, 16.10713869639665,
            ],
            pitch: -27.049999237060547,
            yaw: 71.11318969726562,
            distance: 0.1,
          },
          windowType: "type5",
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "当前工序", content: "切割", flex: 0.5 },
              { title: "节拍", content: "65 min/件", flex: 0.5 },
              { title: "在制数", content: "9件", flex: 0.5 },
              { title: "计划完成率", content: "89%", flex: 0.5 },
            ],
          ],
        },
        3: {
          focusCamera: {
            location: [
              113.72126281070217, 34.77730667194838, 15.686645939141261,
            ],
            pitch: -22.85133934020996,
            yaw: 54.16256332397461,
            distance: 0.1,
          },
          poiLocation: [
            [113.72223133333587, 34.77678860192828, 0.27796730698252888],
          ],
          poiConfig: {
            customId: ["p2_2_ws_storage_1"],
            entityName: ["堆存区"],
          },
          markerConfig: {
            markerNormalUrl: "monitor.png",
            markerActivateUrl: "monitor_active.png",
            markerSize: [40, 40],
          },
          windowLocation: [
            113.72150094710364, 34.77719438004607, 5.000000000000003,
          ],
          rangeData: [
            [113.72124669248589, 34.777092571374894, 0.17796730698252858],
            [113.72317728215987, 34.77624980347793, 0.17593873990117018],
            [113.7232967919457, 34.77643406581045, 0.17593438885468587],
            [113.72136723026489, 34.777278045482596, 0.17796730698252775],
          ],
          rangeConfig: {
            type: "wave",
            fillAreaType: "none",
            height: 5,
            strokeWeight: 3,
            color: "rgba(71,161,181,1)",
          },
          clickFocusCamera: {
            location: [
              113.72126281070217, 34.77730667194838, 15.686645939141261,
            ],
            pitch: -22.85133934020996,
            yaw: 54.16256332397461,
            distance: 0.1,
          },
          windowType: "type5",
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "当前库存", content: "98件", flex: 0.5 },
              { title: "物料", content: "钢板", flex: 0.5 },
              { title: "周转天数", content: "8天", flex: 0.5 },
            ],
          ],
        },
        4: {
          focusCamera: {
            location: [
              113.72152979935336, 34.777708264504966, 227.48441825862625,
            ],
            pitch: -71.29991912841797,
            yaw: 129.4632568359375,
            distance: 10,
          },
          poiLocation: [
            [113.72077437178612, 34.777427812573734, 0.27593638777175458],
          ],
          poiConfig: {
            customId: ["p2_2_ws_quality_1"],
            entityName: ["质检区"],
          },
          markerConfig: {
            markerNormalUrl: "monitor.png",
            markerActivateUrl: "monitor_active.png",
            markerSize: [40, 40],
          },
          windowLocation: [
            113.72077437178612, 34.777427812573734, 0.27593638777175458,
          ],
          rangeData: [
            [113.72134432310044, 34.777284255459364, 0.29636527789398087],
            [113.72122758312528, 34.77710376415699, 0.2822180899403793],
            [113.7200466744904, 34.77762749906754, 0.17593856485775078],
            [113.72016066248057, 34.77780211407345, 0.1759344357165459],
          ],
          rangeConfig: {
            type: "wave",
            fillAreaType: "none",
            height: 5,
            strokeWeight: 3,
            color: "rgba(71,161,181,1)",
          },
          clickFocusCamera: {
            location: [
              113.72144850557967, 34.77721103335375, 20.361844984644954,
            ],
            pitch: -25.400192260742188,
            yaw: -172.33616638183594,
            distance: 0.1,
          },
          windowType: "type5",
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "抽检合格率", content: "96%", flex: 0.5 },
              { title: "今日不良数", content: "3", flex: 0.5 },
              { title: "主要缺陷", content: "孔径偏差", flex: 0.5 },
              { title: "检测设备在线", content: "是", flex: 0.5 },
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
      hasSceneInit: false, // 防止场景就绪后重复初始化
      skipBeforeDestroyCleanup: false,
      isMode2Active: false,
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
    // [twin 待实现] 原 wdpapi 调用：areaTags → setSceneTime → deleteObjs → FocusByPoints
    async closeAll() {
      if (this.isMode2Active) {
        this.isMode2Active = false;
      }
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          this.toolObjs[key] = [];
        }
      }
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addPOI → <实体>.onClick → deleteObjs → FocusByPoints → addWINDOWS
    async runPoiWindowModule(data, index, fallbackPrefix) {
      if (!data?.poiLocation?.length) return;


      // if (data.rangeData?.length) {
      //   const rangeRes = await addRange(
      //     data.rangeData,
      //     data.rangeConfig || {},
      //     "Altitude",
      //     0
      //   );
      //   if (rangeRes.success && rangeRes.result?.object) {
      //     this.toolObjs[index].push(rangeRes.result.object);
      //   }
      // }
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addRange → addWINDOWS
    async runRangeWindowModule(data, index, fallbackPrefix) {

      if (data.rangeData?.length) {
      }


    },

    async mode1_device(data, index) {
      await this.runPoiWindowModule(data, index, "设备");
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → areaTags → setSceneTime → addPOI → <实体>.onClick → deleteObjs → areaTags → setSceneTime → FocusByPoints → <实体>.Update → addRange → addWINDOWS
    async mode2_station(data, index) {
      if (!data) return;

      // 1. 聚焦 + 开启 areaTags / setSceneTime（与 mode5_workstation 一致）
      this.isMode2Active = true;

      // 2. 打 POI
      if (!data.poiLocation?.length) return;


      let activeWindowIndex = -1;
      let activeWindowObj = null;
      let activeRangeObj = null;
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon =
        sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon =
        sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    async mode3_storage(data, index) {
      await this.runRangeWindowModule(data, index, "堆存区");
    },

    async mode4_quality(data, index) {
      await this.runRangeWindowModule(data, index, "质检区");
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

  // [twin 待实现] 原 wdpapi 调用：areaTags → setSceneTime → deleteTypes → splitBuildByName
  async beforeDestroy() {
    if (this.skipBeforeDestroyCleanup) {
      return;
    }
    if (this.isMode2Active) {
    }
  },
};
