// WDP API 混入模板
import { mapState } from "vuex";

export default {
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: this.mode1_device,
        2: this.mode2_shelf,
        3: this.mode3_people,
      },
      // id对应数据
      toolData: {
        1: {
          focusCamera: {
            location: [
              113.71758173770043, 34.77809062628411, 153.48199102577195,
            ],
            pitch: -68.60014343261719,
            yaw: 29.2632999420166,
            distance: 10,
          },
          carData: [
            {
              customId: "p2_3_car_1",
              entityName: "AGV",
              status: "normal",
              runStatus: "正常",
              todayCount: "56单",
              battery: "73%",
            },
            {
              customId: "p2_3_car_2",
              entityName: "AGV",
              status: "normal",
              runStatus: "正常",
              todayCount: "32单",
              battery: "85%",
            },
            {
              customId: "p2_3_car_3",
              entityName: "AGV",
              status: "normal",
              runStatus: "正常",
              todayCount: "40单",
              battery: "53%",
            },
            {
              customId: "p2_3_car_4",
              entityName: "AGV",
              status: "normal",
              runStatus: "正常",
              todayCount: "3单",
              battery: "12%",
            },
          ],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          standbyData: {
            poiLocation: [
              [113.71730187155082, 34.777700996756145, 2.7149112866237237],
              [113.71728348777192, 34.777671908894895, 2.7145847982983966],
              [113.71726026907992, 34.77764295665751, 2.715772132387915],
              [113.71724065518954, 34.777614201693, 2.7154315151472543],
            ],
            poiConfig: {
              customId: [
                "p2_3_car_s1",
                "p2_3_car_s2",
                "p2_3_car_s3",
                "p2_3_car_s4",
              ],
              entityName: ["AGV", "AGV", "AGV", "AGV"],
            },
            markerConfig: {
              markerNormalUrl: "DT_car_standby.png",
              markerActivateUrl: "DT_car_standby_active.png",
              markerSize: [48, 65],
            },
            entityEids: [57081, 57080, 57079, 57078],
            clickFocusCameras: [
              {
                location: [
                  113.7172509369007, 34.77785891820874, 18.384649582463602,
                ],
                pitch: -41.55022430419922,
                yaw: 71.85011291503906,
                distance: 0.1,
              },
              {
                location: [
                  113.71723176259913, 34.777825795741364, 18.384649582463602,
                ],
                pitch: -41.55022430419922,
                yaw: 71.85011291503906,
                distance: 0.1,
              },
              {
                location: [
                  113.71719817367594, 34.777785213967526, 18.384649582463602,
                ],
                pitch: -41.55022430419922,
                yaw: 71.85011291503906,
                distance: 0.1,
              },
              {
                location: [
                  113.71719109824387, 34.77775996307037, 18.384649582463602,
                ],
                pitch: -41.55022430419922,
                yaw: 71.85011291503906,
                distance: 0.1,
              },
            ],
            windowConfig: { size: [190, 144], offset: [24, 40] },
            windowData: [
              [
                { title: "编号", content: "005", flex: 0.5 },
                { title: "今日出入库量", content: "0单", flex: 0.5 },
                { title: "电量", content: "95%", flex: 0.6 },
              ],
              [
                { title: "编号", content: "006", flex: 0.5 },
                { title: "今日出入库量", content: "0单", flex: 0.5 },
                { title: "电量", content: "87%", flex: 0.6 },
              ],
              [
                { title: "编号", content: "007", flex: 0.5 },
                { title: "今日出入库量", content: "0单", flex: 0.5 },
                { title: "电量", content: "91%", flex: 0.6 },
              ],
              [
                { title: "编号", content: "008", flex: 0.5 },
                { title: "今日出入库量", content: "0单", flex: 0.5 },
                { title: "电量", content: "78%", flex: 0.6 },
              ],
            ],
            headerRight: ["待机", "待机", "待机", "待机"],
          },
          faultData: {
            poiLocation: [
              [113.71783970596414, 34.7775082271073, 1.1307133512034349],
              [113.71859068294802, 34.77713358062603, 1.433972427229403],
              [113.7189074573398, 34.777729311675664, 2.723814866076085],
            ],
            poiConfig: {
              customId: ["p2_3_car_f1", "p2_3_car_f2", "p2_3_car_f3"],
              entityName: ["AGV", "AGV", "AGV"],
            },
            markerConfig: {
              markerNormalUrl: "DT_car_fault.png",
              markerActivateUrl: "DT_car_fault_active.png",
              markerSize: [48, 65],
            },
            entityEids: [57077, 57075, 57076],
            clickFocusCameras: [
              {
                location: [
                  113.71760783544902, 34.77746612010192, 23.198579073335335,
                ],
                pitch: -40.80025863647461,
                yaw: -15.299508094787598,
                distance: 0.1,
              },
              {
                location: [
                  113.71833870039997, 34.777032716067104, 27.204093511678657,
                ],
                pitch: -37.350616455078125,
                yaw: -25.949190139770508,
                distance: 0.1,
              },
              {
                location: [
                  113.71904205894626, 34.777922275774216, 28.025923308652587,
                ],
                pitch: -45.45066833496094,
                yaw: 113.70043182373047,
                distance: 0.1,
              },
            ],
            windowConfig: { size: [190, 144], offset: [24, 40] },
            windowData: [
              [
                { title: "编号", content: "009", flex: 0.5 },
                { title: "今日出入库量", content: "8单", flex: 0.5 },
                { title: "电量", content: "23%", flex: 0.6 },
              ],
              [
                { title: "编号", content: "010", flex: 0.5 },
                { title: "今日出入库量", content: "5单", flex: 0.5 },
                { title: "电量", content: "15%", flex: 0.6 },
              ],
              [
                { title: "编号", content: "011", flex: 0.5 },
                { title: "今日出入库量", content: "12单", flex: 0.5 },
                { title: "电量", content: "31%", flex: 0.6 },
              ],
            ],
            headerRight: ["故障", "故障", "故障"],
          },
        },
        2: {
          focusCamera: {
            location: [
              113.71758173770043, 34.77809062628411, 153.48199102577195,
            ],
            pitch: -68.60014343261719,
            yaw: 29.2632999420166,
            distance: 10,
          },
          poiLocation: [
            [113.71806590785886, 34.77777628298401, 8.503307107755571],
            [113.71794189587179, 34.777841302268385, 9.846921845771483],
          ],
          poiConfig: {
            customId: ["p2_3_shelf_1", "p2_3_shelf_2"],
            entityName: ["货架01", "货架02"],
          },
          markerConfig: {
            markerNormalUrl: "DT_shelf.png",
            markerActivateUrl: "DT_shelf_active.png",
            markerSize: [48, 65],
          },
          clickDistance: 146,
          clickFocusCameras: [
            {
              location: [
                113.71773585941797, 34.777955702360714, 75.90901576611613,
              ],
              pitch: -64.40045928955078,
              yaw: 30.013200759887695,
              distance: 0.1,
            },
            {
              location: [
                113.71777953686376, 34.777956324680176, 69.90796242296189,
              ],
              pitch: -67.55001831054688,
              yaw: 30.612945556640625,
              distance: 0.1,
            },
          ],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "当前占用", content: "28件", flex: 0.5 },
              { title: "周转天数", content: "5天", flex: 0.5 },
              { title: "最近盘库", content: "02-28 08:30", flex: 0.5 },
            ],
            [
              { title: "当前占用", content: "32件", flex: 0.5 },
              { title: "周转天数", content: "4天", flex: 0.5 },
              { title: "最近盘库", content: "02-28 09:15", flex: 0.5 },
            ],
          ],
          headerRight: ["充足", "充足"],
          rangeLocations: [
            [
              [113.7182291398698, 34.778098984724345, 0],
              [113.71829427384804, 34.778068529280844, 0],
              [113.71791604607868, 34.777525318253744, 0],
              [113.71785101394022, 34.77755881068173, 0],
            ],
            [
              [113.71819614694293, 34.77811982798669, 0],
              [113.71812554437135, 34.77815273414076, 0],
              [113.71774074792086, 34.77760937287563, 0],
              [113.71780732216864, 34.7775775172425, 0],
            ],
          ],
          rangeStyle: {
            type: "wave",
            fillAreaType: "none",
            height: 12,
            strokeWeight: 2,
            color: "437bd4ff",
            fillAreaColor: "fa34008f",
            bBlocked: false,
          },
        },
        3: {
          focusCamera: {
            location: [
              113.71815575659845, 34.77755902276227, 158.53614225093384,
            ],
            pitch: -74.89997863769531,
            yaw: 29.713451385498047,
            distance: 10,
          },
          poiLocation: [
            [113.71832040219756, 34.77724409275475, 0.3803197391925363],
          ],
          poiConfig: {
            customId: ["p2_3_people_1"],
            entityName: ["人员03"],
          },
          markerConfig: {
            markerNormalUrl: "DT_wh_staff.png",
            markerActivateUrl: "DT_wh_staff_active.png",
            markerSize: [48, 65],
          },
          clickDistance: 146,
          clickFocusCameras: [
            {
              location: [
                113.71802651665172, 34.77731184096989, 126.25502423009523,
              ],
              pitch: -75.64997100830078,
              yaw: 7.0625901222229,
              distance: 0.1,
            },
          ],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowTag: ["仓库管理A03"],
          windowData: [
            [
              { title: "工种", content: "仓储管理", flex: 0.5 },
              { title: "班次", content: "白班", flex: 0.5 },
              { title: "今日作业单数", content: "21", flex: 0.5 },
              { title: "异常处置", content: "0", flex: 0.5 },
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
      },
      hasSceneInit: false, // 防止场景就绪后重复初始化
      // 小车路径数据（4条路径，4种颜色）
      carPathData: [
        {
          // 路径1：绿色
          color: "ffffffff",
          passColor: "3498dbff",
          coordinates: [
            [113.71744738857434, 34.77775249885842, 0.4],
            [113.71783912868938, 34.778313276650124, 0.3807036503253147],
            [113.71890694811023, 34.77780522761446, 0.3978680697780533],
            [113.7185112205999, 34.77723143628632, 0.3970271158028982],
            [113.71872407730841, 34.77713620465863, 0.4],
            [113.71912401986494, 34.7777174948258, 0.4],
            [113.71783495850333, 34.77832858512472, 0.3989584120585505],
            [113.71742928973579, 34.77774841752159, 0.38070365032531217],
            [113.71744012988216, 34.777742789786984, 0.39693644498421804],
            [113.71744738857454, 34.77775249885842, 0.4],
          ],
        },
        {
          // 路径2：蓝色
          color: "ffffffff",
          passColor: "3498dbff",
          coordinates: [
            [113.71879258720276, 34.77846180075972, 0.38070365032531245],
            [113.7188055915541, 34.778480336091455, 0.38070365032531245],
            [113.71844983023112, 34.77864996243992, 0.4],
            [113.71815769672493, 34.77823571750734, 0.3803197391924988],
            [113.71781219948677, 34.77839493650693, 0.39999999999999886],
            [113.71741937206306, 34.777836807596024, 0.380319964503488],
            [113.71743200295415, 34.777830778408834, 0.3803200475683292],
            [113.71781238662341, 34.778374212776164, 0.1],
            [113.7181492178632, 34.77822177251615, 0.38031973919249995],
            [113.71772345374742, 34.77760921165003, 0.3966492193940849],
            [113.71797456838816, 34.77749273755408, 0.39755198313898293],
            [113.71775470076075, 34.7771826245062, 0.4],
            [113.71786770806135, 34.77713413013064, 0.40997831145728925],
            [113.71846348531471, 34.777990390247815, 0.380320959895634],
            [113.71879223666312, 34.77846130908328, 0.38070365032531245],
          ],
        },
        {
          // 路径3：黄色
          color: "ffffffff",
          passColor: "3498dbff",
          coordinates: [
            [113.71725091983919, 34.77744922425834, 0.3803243934038113],
            [113.71723736452579, 34.77742699735779, 0.40000000000000113],
            [113.71742327619728, 34.7773383850871, 0.3803208697536769],
            [113.71796800672612, 34.77811179613626, 0.40996701090141413],
            [113.71777699852935, 34.778203013632556, 0.38032483103113407],
            [113.7172510176629, 34.77744936330111, 0.380324393527585],
          ],
        },
        {
          // 路径4：红色
          color: "ffffffff",
          passColor: "3498dbff",
          coordinates: [
            [113.71736754634314, 34.77778927661512, 0.38031982658482266],
            [113.71752241966152, 34.778007379443636, 0.3803200251748234],
            [113.71780151799099, 34.7784149978025, 0.3803203421254983],
            [113.71808297450134,34.77828361885271,0.400113018309803],
            [113.71837134743815,34.77869363234607,0.3993195979535131],
            [113.71791541814656, 34.778910644121254, 0.3984404982913111],
            [113.71716490850933, 34.77784954084682, 0.38070365032531017],
            [113.7173495677418, 34.777764367110564, 0.38031980238229324],
            [113.71736731763727, 34.777788990376166, 0.38031982619093413],
          ],
        },
      ],
      carPOI: [
        [113.71743624115362, 34.777750890375984, 0.38070365032531245],
        [113.71881614502989, 34.778481934595263, 0.38070365032530334],
        [113.71721703525975, 34.777437192952831, 0.38031993538760561],
        [113.71738005748612, 34.777777980849237, 0.38227530559874995],
      ],
      windowData: [
        [
          { title: "编号", content: "001", flex: 0.5 },
          { title: "今日出入库量", content: "52单", flex: 0.5 },
          { title: "电量", content: "73%", flex: 0.6 },
        ],
        [
          { title: "编号", content: "002", flex: 0.5 },
          { title: "今日出入库量", content: "56单", flex: 0.5 },
          { title: "电量", content: "80%", flex: 0.6 },
        ],
        [
          { title: "编号", content: "003", flex: 0.5 },
          { title: "今日出入库量", content: "40单", flex: 0.5 },
          { title: "电量", content: "53%", flex: 0.6 },
        ],
        [
          { title: "编号", content: "004", flex: 0.5 },
          { title: "今日出入库量", content: "36单", flex: 0.5 },
          { title: "电量", content: "43%", flex: 0.6 },
        ],
      ],
      headerRight: ["正常", "正常", "正常", "正常"],
      windowConfig: {
        size: [190, 144],
        offset: [100, 100],
        bVisible: false,
      },
      // 存储小车和路径对象，用于清理
      carPathObjs: [],
      // 设备模式（mode1）的 POI 和弹窗对象（创建后常驻，仅做显隐）
      devicePoiObjs: [],
      deviceWindowObjs: [],
      devicePathObjs: [],
      deviceActiveWindowIdx: -1,
      activeOutlineObj: null,
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
    // [twin 待实现] 原 wdpapi 调用：setEntityOutline → setEntityOutline → App.CameraControl.Stop → <实体>.SetVisible → <实体>.SetVisible → <实体>.SetVisible → deleteObjs → FocusByPoints
    async closeAll() {
      // 停止相机跟随并取消高亮
      if (this._followingParticle) {
        this._followingParticle = null;
      }
      if (this.activeOutlineObj) {
        this.activeOutlineObj = null;
      }
      // 隐藏设备 POI 及当前打开的弹窗（不删除，保留常驻）
      if (this.deviceActiveWindowIdx !== -1) {
        this.deviceActiveWindowIdx = -1;
        this.$store.commit("setWindowEid", null);
      }
      for (const poiObj of this.devicePoiObjs) {
      }
      for (const pathObj of this.devicePathObjs) {
      }
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          this.toolObjs[key] = [];
        }
      }
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → getByEids → addRange → addWINDOWS
    async runPoiWindowModule(data, index, fallbackPrefix, cancelFocusCamera, outlineColor) {
      if (!data?.poiLocation?.length) return;

      const focusCamera = cancelFocusCamera || data.focusCamera;

      if (data.focusCamera) {
      }



      let activeWindowIndex = -1;
      let activeWindowObj = null;
      let activeRangeObjs = [];
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon = sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon =
        sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → <实体>.SetVisible → <实体>.SetVisible
    async mode1_device(data, index) {
      if (!data) return;
      for (const poiObj of this.devicePoiObjs) {
      }
      for (const pathObj of this.devicePathObjs) {
      }
      if (data.standbyData) {
        await this.runPoiWindowModule(data.standbyData, index, "待机小车", data.focusCamera, "Yellow");
      }
      if (data.faultData) {
        await this.runPoiWindowModule(data.faultData, index, "故障小车", data.focusCamera, "OrangeRed");
      }
    },

    // [twin 待实现] 原 wdpapi 调用：addEntities → <实体>.SetVisible → addEntities → <实体>.SetVisible → addPOI → <实体>.SetVisible → addWINDOWSBatch → <实体>.SetVisible → addEntities → coveringMove → coveringMove → coveringMove → <实体>.onClick → <实体>.SetVisible → setEntityOutline → App.CameraControl.Stop → FocusByPoints → followEntity
    async initDeviceData() {
      const data = this.toolData[1];
      const carPathData = this.carPathData;
      const carPOI = this.carPOI;
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const statusIconMap = {
        normal: {
          normal: "DT_car_normal.png",
          active: "DT_car_normal_active.png",
        },
        standby: {
          normal: "DT_car_standby.png",
          active: "DT_car_standby_active.png",
        },
        fault: {
          normal: "DT_car_fault.png",
          active: "DT_car_fault_active.png",
        },
      };
      // === 1. 批量创建可见路径（POI 和小车模型跟随） ===
      const visPathDataArr = carPathData.map((p, i) => ({
        polyline: { coordinates: p.coordinates },
        pathStyle: {
          color: p.color,
          passColor: p.passColor,
        },
        customId: `p2_3_car_vispath_${i + 1}`,
        entityName: `小车巡逻路径-${i + 1}`,
      }));
      // 初始隐藏可见路径

      // === 2. 批量创建不可见路径（Window 跟随） ===
      const hidPathDataArr = carPathData.map((p, i) => ({
        polyline: { coordinates: p.coordinates },
        pathStyle: {
          color: "00000000",
          passColor: "00000000",
        },
        customId: `p2_3_car_wpath_${i + 1}`,
        entityName: `小车弹窗路径-${i + 1}`,
      }));

      // === 3. 批量创建 POI（初始隐藏）===
      // 隐藏所有 POI，并按状态更新为正确的图标

      // === 4. 批量创建 Window（初始隐藏）===
      const windowBatchData = data.carData.map((car, i) => ({
        location: carPOI[i],
        title: car.entityName,
        type: "type7",
        bgType: "bg_190_144",
        headerRight: this.headerRight?.[i] || "",
        infoList: JSON.stringify(this.windowData?.[i] || []),
        entityName: `${car.entityName}信息窗口`,
        customId: `${car.customId}_window`,
        isShowCloseBtn: false,
      }));

      // === 5. 批量创建粒子小车模型 ===
      const particleDataArr = data.carData.map((car, i) => ({
        location: carPOI[i],
        customId: `${car.customId}_particle`,
        entityName: `${car.entityName}模型`,
      }));

      // === 6. 按下标绑定移动 ===
      for (let i = 0; i < data.carData.length; i++) {

      }

      // === 7. 绑定 POI 点击事件 ===
    },

    async mode2_shelf(data, index) {
      await this.runPoiWindowModule(data, index, "货架");
    },

    async mode3_people(data, index) {
      await this.runPoiWindowModule(data, index, "人员");
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → splitBuildByName
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      setTimeout(async () => {
        // 拆楼
        // 批量创建设备实体（POI/弹窗/路径/小车模型），全部初始隐藏
        await this.initDeviceData();
      }, 1000);
    },
  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：setEntityOutline → deleteTypes → splitBuildByName
  async beforeDestroy() {
    if (this.activeOutlineObj) {
      this.activeOutlineObj = null;
    }
  },
};
