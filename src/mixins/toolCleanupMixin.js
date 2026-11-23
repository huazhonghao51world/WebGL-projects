import { deleteObjs, deleteTypes } from "@/utils/twin/delete";
import { resetCameraLimit } from "@/utils/twin/camera";

// twinSDK 运行时覆盖物类型；发布案例自带的模型（Static）不在其中，不会被清掉
const TWIN_COVERING_TYPES = ["Window", "Path", "Poi", "Range", "Parabola", "Text3D", "HeatMap", "HighlightArea"];

/**
 * 工具清理混入
 * 提供通用的工具对象清理方法，避免在各个页面重复编写相同的清理逻辑
 */
export default {
  data() {
    return {
      types: ["Window", "Path", "Poi", "Range", "Particle", "Text3D", "Viewshed"],
      normalPoiData: [{
        location: [
          [
            113.71812199871826,
            34.777884580332376,
            24.922707102038267
          ]
        ],
        poiConfig: {
          customId: ["storehouse"],
          entityName: ["仓储"],
        },
        markerConfig: {
          markerNormalUrl: "DT_wh_center.png",
          markerActivateUrl: "DT_wh_center_active.png",
          markerSize: [112, 72],
        }
      }, {
        location: [
          [
            113.72180917331556,
            34.777020993521155,
            24.085760423741657
          ]
        ],
        poiConfig: {
          customId: ["workshop"],
          entityName: ["生产车间"],
        },
        markerConfig: {
          markerNormalUrl: "DT_workshop.png",
          markerActivateUrl: "DT_workshop_active.png",
          markerSize: [112, 72],
        }
      }]
    }
  },
  methods: {

    // 进入场景初始化：清空上一页留下的运行时覆盖物、放开相机限制（与 twin-vue-starter 一致）
    // [twin 待实现] 原 wdpapi 调用：deleteTypes → setSceneTime → splitBuildByName → splitBuildByName
    async initSceneClose() {
      await deleteTypes(TWIN_COVERING_TYPES);
      resetCameraLimit();
    },

    // [twin 待实现] 原 wdpapi 调用：addPOI → <实体>.onClick → FocusByPoints
    async normalPoi(page) {
      setTimeout(async () => {
        for (const key in this.normalPoiData) {
          const { location, poiConfig, markerConfig } = this.normalPoiData[key];
        }
      }, 300);

    },

    /**
     * 清空所有工具对象
     * 遍历toolObjs中的所有对象并删除，然后清空数组
     */
    async clearAllToolObjs() {
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          await this.deleteByObjs(this.toolObjs[key]);
          this.toolObjs[key] = [];
        }
      }
    },

    async deleteByObjs(objs) {
      return deleteObjs(objs);
    },

    async deleteByTypes(types) {
      return deleteTypes(types);
    },

  }
};