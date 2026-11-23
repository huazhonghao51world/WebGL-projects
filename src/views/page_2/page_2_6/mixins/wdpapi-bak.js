// WDP API 混入 - 工厂能源管理（page_2_6）
// 设计模式（Plan A · 保留 + 增强）：
//   1) 沿用 bak 中"发电设施 / 变压器"的真实坐标和窗口数据（toolHandlers / toolData）
//   2) 新增 selectPoiByApiId / highlightPlanPois 方法，供右栏告警/方案点击时联动场景
//   3) 接口返回的 scenePois[].x/y 为前端百分比坐标，仅供 SVG 占位使用，不直接用于 WDP；
//      真实 WDP 经纬度通过下方 apiPoiSceneMap 显式映射（暂时仅映射已有点位）

import { mapState } from "vuex";
import toolCleanupMixin from "@/mixins/toolCleanupMixin.js";

export default {
    mixins: [toolCleanupMixin],
    data() {
        return {
            // ===== 左侧工具栏（与原 bak 保持一致；UI 设计稿到位后可扩展配电柜/储能等） =====
            leftTools: [
                {
                    id: "1",
                    label: "发电设施",
                    icon: require("@/assets/images/page_2_6/发电设施-默认.png"),
                    activeIcon: require("@/assets/images/page_2_6/发电设施-选中.png"),
                    isActive: false,
                },
                {
                    id: "2",
                    label: "变压器",
                    icon: require("@/assets/images/page_2_6/变压器-默认.png"),
                    activeIcon: require("@/assets/images/page_2_6/变压器-选中.png"),
                    isActive: false,
                },
                {
                    id: "3",
                    label: "配电柜",
                    icon: require("@/assets/images/page_2_6/配电柜-默认.png"),
                    activeIcon: require("@/assets/images/page_2_6/配电柜-选中.png"),
                    isActive: false,
                },
            ],

            // ===== 工具 id → 处理函数 =====
            toolHandlers: {
                1: this.mode1_generator,
                2: this.mode2_transformer,
                3: this.mode3_cabinet,
            },

            // ===== 工具 id → 真实 WDP 数据（沿用 bak） =====
            toolData: {
                1: {
                    defaultActiveIndex: 0,
                    focusCamera: {
                        location: [113.71869660355185, 34.77628168089931, 637.8688866586805],
                        pitch: -70.32255554199219,
                        yaw: -83.53645324707031,
                        distance: 10,
                    },
                    poiLocation: [
                        [113.72041620130084, 34.779499298087806, 12.608822581351244],
                    ],
                    poiConfig: {
                        customId: ["p2_6_gen_1"],
                        entityName: ["发电设施01"],
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
                            location: [113.72105034315165, 34.778864489682334, 73.19268288535329],
                            pitch: -33.72257995605469,
                            yaw: -134.38638305664062,
                            distance: 0.1,
                        },
                    ],
                    windowConfig: { size: [190, 144], offset: [24, 40] },
                    headerRight: "运行",
                    rangeLocations: [
                        [],
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
                    ],
                },
                3: {
                    defaultActiveIndex: 0,
                    focusCamera: {
                        location: [113.71869660355185, 34.77628168089931, 637.8688866586805],
                        pitch: -70.32255554199219,
                        yaw: -83.53645324707031,
                        distance: 10,
                    },
                    poiLocation: [[113.7161689457923, 34.77847766559691, 11.935527986830014]],
                    poiConfig: {
                        customId: ["p2_6_cab_1"],
                        entityName: ["配电柜01"],
                    },
                    markerConfig: {
                        markerNormalUrl: "DT_power.png",
                        markerActivateUrl: "DT_power_active.png",
                        markerSize: [48, 65],
                    },
                    clickDistance: 617,
                    clickFocusCameras: [
                        {
                            location: [113.71585364935258, 34.777788580657294, 89.722466120881],
                            pitch: -53.222877502441406,
                            yaw: -74.0866928100586,
                            distance: 0.1,
                        },
                    ],
                    windowConfig: { size: [190, 144], offset: [24, 40] },
                    headerRight: "运行",
                    rangeLocations: [
                        [
                            [113.71596291362916, 34.77825911015444, 9.580964490030695],
                            [113.71592238953984, 34.77819610403538, 9.580964490030695],
                            [113.71596918055711, 34.7781723456081, 9.580964490030697],
                            [113.71601326495806, 34.77823615360143, 9.580964490030697],
                        ],
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
                            { title: "当前输出", content: "7.2 MW", flex: 0.5 },
                            { title: "今日发电量", content: "155 MWh", flex: 0.5 },
                            { title: "可用功率", content: "7.5 MW", flex: 0.5 },
                        ],
                    ],
                },
                2: {
                    focusCamera: {
                        location: [113.72369656780063, 34.77373296647845, 385.38016397664984],
                        pitch: -50.9727783203125,
                        yaw: -18.286428451538086,
                        distance: 10,
                    },
                    clickCameraFocus: {
                        location: [113.72503230707348, 34.77395818687787, 169.4964561053846],
                        pitch: -44.2227783203125,
                        yaw: 2.563572883605957,
                        distance: 10,
                    },
                    clickFocusCameras: [
                        {
                            location: [113.72583907673638, 34.77386421865383, 68.3978063771974],
                            pitch: -35.97329330444336,
                            yaw: -12.736247062683105,
                            distance: 0.1,
                        },
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
                    windowConfig: { size: [190, 144], offset: [24, 40] },
                    windowTag2: ["10kV机加变T01"],
                    entityEids: ["57063"],
                    windowData: [
                        [
                            { title: "负载率", content: "62%", flex: 0.5 },
                            { title: "油温", content: "58°C", flex: 0.5 },
                            { title: "温升", content: "18°C", flex: 0.5 },
                            { title: "健康等级", content: "良好", flex: 0.5 },
                        ],
                    ],
                },
            },

            // 类型存储
            toolTypes: { 2: [], 5: [] },

            // 对象存储（按工具 id 分桶）
            toolObjs: { 1: [], 2: [], 3: [] },


            activeOutlineObj: null,
            hasSceneInit: false, // 防止场景就绪后重复初始化

            /**
             * ===== 接口 POI id → WDP 真实点位数据映射 =====
             * 用于：右栏告警/方案/损失项点击时，定位到真实场景对象。
             *
             * 接口 POI 共 9 类（grid/sub/pv1~3/storage/ws1~2/air），
             * 但 bak 中真实 WDP 资源只有"发电设施(2 台)"和"变压器(1 台)"。
             *
             * - 凡是有实景资源的，填入 { tool, poiIndex }，调用 selectPoiByApiId 时会激活
             *   对应工具栏并触发对应索引 POI 的点击效果。
             * - 凡是 WDP 暂未提供资源的（pv2/pv3/storage/ws/air 等），值为 null，前端只更新
             *   选中态供 alert/feed 高亮使用，不影响 3D 场景。
             *
             * UI/3D 资源到位后，仅需扩充本表即可，业务代码无需改动。
             */
            apiPoiSceneMap: {
                pv1: { tool: 1, poiIndex: 0 }, // 屋顶光伏 → 发电设施01
                pv2: { tool: 3, poiIndex: 0 }, // 车棚光伏 → 配电柜01（原点2）
                pv3: null, // 地面西站 - 暂无 WDP 资源
                sub: { tool: 2, poiIndex: 0 }, // 总降压站 → 变压器01
                grid: null, // 并网点
                storage: null, // 储能站
                ws1: null, // 加工一车间
                ws2: null, // 加工二车间
                air: null, // 空压站
            },

            // 当前由外部（告警/方案）选中的 API POI id（用于子组件高亮态展示）
            selectedApiPoi: null,
            // 当前方案高亮的 POI id 集合
            highlightedPlanPois: [],
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
        // ============ 工具栏统一入口 ============
        async handleToolSelect(selectedItem) {
            const toolId = Number(selectedItem.id);

            if (typeof this.closeAll === "function") {
                await this.closeAll();
            }

            if (!selectedItem.isActive) return;

            const handler = this.toolHandlers && this.toolHandlers[toolId];
            const data = this.toolData && this.toolData[toolId];
            if (typeof handler === "function") {
                await handler(data, toolId);
            }
        },

        // ============ 通用清理 ============
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
            this.$store.commit("setGen2Active", false);
        },

        // ============ POI 通用模块（完全参考 bak） ============
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

        // ============ 模式入口 ============
        async mode1_generator(data, index) {
            await this.runPoiWindowModule(data, index, "发电设施", (activeIndex) => {
                this.$store.commit("setGen2Active", activeIndex === 1);
            });
        },

        async mode2_transformer(data, index) {
            await this.runPoiWindowModule(data, index, "变压器");
        },

        async mode3_cabinet(data, index) {
            await this.runPoiWindowModule(data, index, "配电柜", (activeIndex) => {
                this.$store.commit("setGen2Active", activeIndex === 0);
            });
        },

        // ============ 新增：API POI 联动 ============
        /**
         * 根据接口 POI id（如 'pv1' / 'sub'）选中场景中的对应点位
         * - 若 apiPoiSceneMap 中有真实映射，激活对应工具栏
         * - 用户需手动点击 POI 来打开窗口（保持与 bak 一致的交互流程）
         */
        async selectPoiByApiId(apiPoiId) {
            this.selectedApiPoi = apiPoiId;
            const map = this.apiPoiSceneMap && this.apiPoiSceneMap[apiPoiId];
            if (!map) {
                // 暂无 WDP 资源 - 仅更新前端态供子组件展示
                return;
            }

            // 激活对应工具栏
            const tool = (this.leftTools || []).find((t) => Number(t.id) === Number(map.tool));
            if (!tool) return;

            // 已激活则不重复触发
            if (!tool.isActive) {
                this.leftTools.forEach((t) => (t.isActive = false));
                tool.isActive = true;
                await this.handleToolSelect(tool);
            }
            // 用户需手动点击POI来打开窗口
        },

        /**
         * 高亮一组 POI（用于"选中方案"时联动场景）
         * 当前阶段仅维护前端态，待 UI 设计稿到位后扩展为场景实际高亮（描边/能流亮线等）
         */
        highlightPlanPois(poiIds) {
            this.highlightedPlanPois = Array.isArray(poiIds) ? poiIds.slice() : [];
        },

        clearPlanHighlight() {
            this.highlightedPlanPois = [];
        },

        // ============ 场景就绪初始化 ============
        // [twin 待实现] 原 wdpapi 调用：resetCamera
        async initAfterSceneReady() {
            if (!this.isSceneAlready || this.hasSceneInit) {
                return;
            }
            this.hasSceneInit = true;
            await this.normalPoi("/page_2/6-workshop");
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
        this.$store.commit("setGen2Active", false);
    },
};
