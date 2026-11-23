// WDP API 混入模板
import { mapState } from "vuex";
import toolCleanupMixin from "@/mixins/toolCleanupMixin.js";

export default {
  mixins: [toolCleanupMixin],
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: this.mode1_storage,
      },
      // id对应数据
      toolData: {
        1: {
          focusCamera: {
            location: [113.72537726670313, 34.774495401033114, 242.36118464525129],
            pitch: -41.67255783081055,
            yaw: -18.136449813842773,
            distance: 10,
          },
          poiLocation: [[113.72794641560535, 34.77488954269641, 75.19118172938121]],
          poiConfig: {
            customId: ["p2_2_storage_1"],
            entityName: ["堆存区"],
          },
          markerConfig: {
            markerNormalUrl: "monitor.png",
            markerActivateUrl: "monitor_active.png",
            markerSize: [40, 40],
          },
          windowLocation: [113.72794641560535, 34.77488954269641, 75.19118172938121],
          rangeData: [
            [113.72656700636388, 34.77455731820977, -1.1641532182693482e-12],
            [113.72808403801525, 34.77415492922682, 0],
            [113.7281272249209, 34.77431559649804, 1.0913936421275138e-13],
            [113.72818994445473, 34.77445868634196, 5.093170329928399e-13],
            [113.72837241203554, 34.7747264181803, 0],
            [113.72854891888394, 34.774949721589095, 0],
            [113.7278891289069, 34.77544949790969, 0],
            [113.72741688784274, 34.775792965487234, 0],
          ],
          rangeConfig: {
            type: "wave",
            fillAreaType: "none",
            height: 35,
            strokeWeight: 8,
            color: "rgba(71,161,181,1)",
          },
          clickDistance: 235,
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "当前库存", content: "25件", flex: 0.5 },
              { title: "关键物料", content: "箱体", flex: 0.5 },
              { title: "周转天数", content: "6天", flex: 0.5 },
            ]
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

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addRange → addWINDOWS
    async mode1_storage(data, index) {
      if (!data) return;





      // const poiRes = await addPOI(data.poiLocation, data.poiConfig, data.markerConfig);
      // if (poiRes.success && poiRes.result?.objects?.length) {
      //   this.toolObjs[index].push(...poiRes.result.objects);

      //   poiRes.result.objects.forEach((poiObj, i) => {
      //     poiObj.onClick(async () => {
      //       await FocusByPoints({
      //         location: data.poiLocation[i],
      //         pitch: data.focusCamera?.pitch || -40,
      //         yaw: data.focusCamera?.yaw || 0,
      //         distance: data.clickDistance || 30,
      //       });

      //       const windowRes = await addWINDOWS(
      //         data.poiLocation[i],
      //         data.windowConfig || {},
      //         {
      //           title: poiObj.BasicInfoAtom?.entityName || "堆存区",
      //           type: data.windowType || "type5",
      //           bgType: "bg3",
      //           entityName: "堆存区信息窗口",
      //           customId: "p2_2_storage_window_1",
      //           customParams: data.windowData || {},
      //         },
      //         {},
      //         true
      //       );

      //       if (windowRes.success && windowRes.result?.object) {
      //         this.toolObjs[index].push(windowRes.result.object);
      //         this.$store.commit("setWindowEid", windowRes.result.object.Eid);
      //       }
      //     });
      //   });
      // }


    },

    // [twin 待实现] 原 wdpapi 调用：resetCamera
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      await this.normalPoi('/page_2/2-workshop');
    },

  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：deleteTypes
  async beforeDestroy() {
  },
};
