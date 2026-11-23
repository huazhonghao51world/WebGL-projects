// WDP API 混入模板
import { mapState } from "vuex";
import store from "../../../../store/index";
import toolCleanupMixin from "../../../../mixins/toolCleanupMixin";

export default {
  mixins: [toolCleanupMixin],
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: this.aiBot,
        2: this.videoPerimeter,
        3: this.securityPersonnel,
        4: this.securityBooth,
        5: this.personGate,
        6: this.heatMap,
        7: this.footerVideo,
        8: this.footerAI,
        9: this.handleParabola,
        10: this.customPOI,
      },
      // id对应数据
      toolData: {
        1: {
          point: [
            [113.714452608383, 34.77145141753328, 42.71300854531253],
            [113.71183429011548, 34.77245016912414, 28.90433318660411],
            [113.71368798265868, 34.773881968867656, 27.831635551406272],
          ],
          markerConfig: {
            markerNormalUrl: [
              "aiBot_icon.png",
              "aiBot_icon.png",
              "aiBot_icon.png",
            ],
            markerActivateUrl: [
              "aiBot_icon.png",
              "aiBot_icon.png",
              "aiBot_icon.png",
            ],
          },
          data: [
            {
              title: "AI机器人巡检画面1",
              url: "ws://localhost:9999",
            },
            {
              title: "AI机器人巡检画面2",
              url: "ws://localhost:9999",
            },
            {
              title: "AI机器人巡检画面3",
              url: "ws://localhost:9999",
            },
          ],
        },
        2: {
          data: [
            [113.7181691618882, 34.76834500864765, 0],
            [113.71923078076577, 34.768742507115263, 0],
            [113.72014550397768, 34.76912891466737, 0],
            [113.72116424584908, 34.769516804041416, 0],
            [113.72224815522945, 34.769960796861149, 0],
            [113.72327382786585, 34.770459754778621, 0],
            [113.7247192343206, 34.771050850376191, 0],
            [113.7257204808454, 34.771390045125855, 0],
            [113.72653049958473, 34.771721000602398, 0],
            [113.72756569457155, 34.772087171545628, 0],
            [113.72852453134021, 34.772479022527584, 0],
            [113.72987607240469, 34.773027111851633, 0],
            [113.73067926409421, 34.773346108365033, 0],
            [113.7316855015878, 34.773752361620751, 0],
            [113.73280140190539, 34.774185459941449, 0],
            [113.73408311006432, 34.774706953724483, 0],
            [113.73559072679764, 34.775317095489527, 0],
            [113.73593878495129, 34.776019216555227, 0],
            [113.73471086853669, 34.776756876753986, 0],
            [113.73353634542822, 34.777307424217042, 0],
            [113.73219543558497, 34.777845111011501, 0],
            [113.73114967668823, 34.778248349158886, 0],
            [113.72975140290765, 34.778808974211771, 0],
            [113.72872182111767, 34.779214151500703, 0],
            [113.72758874482645, 34.779786975468845, 0],
            [113.72656408173023, 34.779418757527402, 0],
            [113.72520385735791, 34.778921672626673, 0],
            [113.7241259508571, 34.778490662187437, 0],
            [113.72306740100991, 34.778120303320073, 0],
            [113.72137157443707, 34.777523822257912, 0],
            [113.72003295382012, 34.777022806235834, 0],
            [113.71886906504248, 34.776592789972298, 0],
            [113.71781788658291, 34.776207686120721, 0],
            [113.71691212197646, 34.775884874099383, 0],
            [113.71609427838392, 34.775572821286048, 0],
            [113.7152077033423, 34.775254153015112, 0],
            [113.71424863482329, 34.774905430889866, 0],
            [113.71317556925506, 34.774515719001286, 0],
            [113.71220829089735, 34.774162265052816, 0],
            [113.71108989837167, 34.773733402063016, 0],
            [113.70993242247275, 34.773308718633864, 0],
            [113.70891794872392, 34.77291176937198, 0],
            [113.70921008206007, 34.772320904439411, 0],
            [113.70964434518804, 34.771523540524832, 0],
            [113.71020427315392, 34.770731933836913, 0],
            [113.71068769492534, 34.770025573030878, 0],
            [113.71112759626148, 34.76932182456644, 0],
            [113.71154376611833, 34.76848718793665, 0],
            [113.71196946337601, 34.76761138405579, 0],
            [113.71239955876059, 34.766783693396285, 0],
            [113.71324827299874, 34.765959699154223, 0],
            [113.71438538753155, 34.766480630553005, 0],
            [113.71528843318161, 34.766953845131283, 0],
            [113.71625293506365, 34.767455266412036, 0],
            [113.71725066083079, 34.767945693046748, 0],
          ],
          markerConfig: {
            markerNormalUrl: "monitor.png",
            markerActivateUrl: "monitor_active.png",
          },
        },
        3: {
          data: [
            [113.711185, 34.771586, 2.46],
            [113.71331380622433, 34.77082552300058, 0],
            [113.713289, 34.773860, 8.21],
          ],
          cameras: [
            {
              position: [113.710, 34.771, 94.014],
              pitch: -22.400002,
              yaw: -17.199926,
            },
            {
              position: [113.714, 34.770, 105.625],
              pitch: -36.400001,
              yaw: -96.599927,
            },
            {
              position: [113.712, 34.774, 113.133],
              pitch: -31.600000,
              yaw: 24.000069,
            },
          ],
          personnelInfoArray: [
            {
              name: "王鑫",
              workNumber: "89898989889",
              phone: "1898173333",
            },
            {
              name: "王乐乐",
              workNumber: "89898989889",
              phone: "1898173333",
            },
            {
              name: "王佳佳",
              workNumber: "89898989889",
              phone: "1898173333",
            },
          ],
          markerConfig: {
            markerNormalUrl: "security_personnel.png",
            markerActivateUrl: "security_personnel_active.png",
          },
        },
        4: {
          data: [[113.71128657197166, 34.771501127933334, 11.573811884531251]],
          cameras: [
            {
              position: [113.711, 34.772, 37.840],
              pitch: -30.599999,
              yaw: 21.600014,
            },
          ],
          boothInfoArray: [
            {
              name: "江某辉",
              workNumber: "755090027",
              phone: "135****0548",
              headerTag: "大门形象岗",
            },
          ],
          markerConfig: {
            markerNormalUrl: "security_booth.png",
            markerActivateUrl: "security_booth_active.png",
          },
        },
        5: {
          location: [[113.71276078327969, 34.772362149093965, 8]],
          markerConfig: {
            markerNormalUrl: "person_gate_normal.png",
            markerActivateUrl: "person_gate_active.png",
          },
        },
        6: {
          camera: {
            location: [
              113.71264585869423, 34.77252307670317, 97.51298896991864,
            ],
            pitch: -83.4582290649414,
            yaw: -7.131307125091553,
            distance: 10,
          },
        },
        7: {
          poi: [113.71548223634232, 34.77485783976573, 4.213086786875],
          markerNormalUrl: "monitor_red.png",
          footerData: {
            headerStatus: "紧急",
            title: "视频周界预警",
            warningNumber: "001515155295",
            warningType: "周界",
            warningLocations: "26防区",
            reporter: "系统自动上报",
            eventDetail:
              "26防区围栏处有人员试图翻阅，触发视频周界告警，系统已自动",
          },
        },
        8: {
          footerData: {
            headerStatus: "紧急",
            pathNumber: 0,
            title: "机器人巡检预警",
            warningNumber: "001515155296",
            warningType: "巡检",
            warningLocations: "16防区",
            reporter: "24号机器人",
            eventDetail:
              "16防区围栏处有人员试图翻阅，触发视频巡检告警，系统已自动",
          },
        },
        9: {
          coordinates: [
            [113.714452608383, 34.77145141753328, 42.71300854531253],
            [113.71183429011548, 34.77245016912414, 28.90433318660411]
          ],
          config: {
            color: "rgba(0, 255, 255, 1)",
            width: 50,
            topHeight: 100,
            speed: 2.0,
            entityName: "迁徙图"
          }
        },
        10: {
          data: [
            [113.71250, 34.77150, 5],
            [113.71350, 34.77200, 8],
            [113.71450, 34.77250, 6],
            [113.71300, 34.77100, 7],
            [113.71400, 34.77180, 9]
          ],
          cameras: [
            { position: [113.71250, 34.77150, 50], pitch: -30, yaw: 0 },
            { position: [113.71350, 34.77200, 50], pitch: -30, yaw: 0 },
            { position: [113.71450, 34.77250, 50], pitch: -30, yaw: 0 },
            { position: [113.71300, 34.77100, 50], pitch: -30, yaw: 0 },
            { position: [113.71400, 34.77180, 50], pitch: -30, yaw: 0 }
          ],
          markerConfig: {
            markerNormalUrl: "custom_poi.png",
            markerActivateUrl: "custom_poi_active.png",
            markerSize: [64, 64]
          }
        },
      },
      //类型存储
      toolTypes: {
        2: [],
        5: [],
        7: [],
        8: [],
      },

      //对象存储
      toolObjs: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        7: [],
        8: [],
        9: [],
        10: [],
      },

      aiBotStatus: {
        runningId: null,
      },
      currentFOVId: null,

      App: null,
    };
  },
  computed: {
    ...mapState(["isShowWebTwo", "isShowWindow"]),
  },
  methods: {
    // 关闭所有点位、窗口、特效等
    // [twin 待实现] 原 wdpapi 调用：customStatus → customStatus → aiBotRoute → spawnEffect → aiBotRoute → splitBuildByName → cameraFOV
    async closeAll() {
      console.log("关闭所有点位、窗口、特效等");
      this.$store.commit("setAiBotWindowId", 0);

      // 通用清空方法，清空所有对象，清空所有类型,根据全局Eid删除window
      await this.performCommonCleanup();

      // 下方是定制api的删除
      // 关闭定制api
      let setDarkenStatus = store.state.setDarkenStatus;
      // console.log(setDarkenStatus,'setDarkenStatus1111111')
      if (setDarkenStatus.status) {

        if (["ZHAF_AIJQR_DarkenScence", 'ZHAF_HeatMap_Person', 'ZHAF_AFGT_DarkenBuilding', 'ZHAF_SPZJ'].includes(setDarkenStatus.apiFuncName)) {
          setTimeout(async () => {
            // 清空状态
            store.commit("setDarkenStatus", {});
          }, 300);
        } else {
          // 清空状态
          store.commit("setDarkenStatus", {});
        }

      }

      this.$store.commit("isShowWindow", { isShow: false });

      if (this.aiBotStatus.runningId) {
        this.aiBotStatus.runningId = null;
      }

      // 关闭视频周界预警特效
      const poi = this.toolData[7].poi;

      // 关闭机器人巡更告警
      if (
        store.state.aiBotRouteState !== "Stop" &&
        store.state.aiBotRouteState !== null
      ) {
      }
      this.$store.commit("isShowWebTwo", { isShow: false });

      // 关闭人员热力拆楼

      // 关闭可视域
      if (this.currentFOVId) {
        this.currentFOVId = null;
      }
    },
    // [twin 待实现] 原 wdpapi 调用：addPOI → <实体>.onClick → deleteObjs → customStatus → aiBotRoute → FocusByPoints → customStatus
    async aiBot(data, index) {
      for (let i in data.point) {
        let poiObj = null;

        // 点击poi点击事件
      }
      // 飞过去再压暗
      setTimeout(async () => {
      }, 1000);
    },

    // [twin 待实现] 原 wdpapi 调用：addPOI → <实体>.onClick → FocusByPoints → cameraFOV → addWINDOWS → addRange
    async poiAndRange(data, index, type = "video") {
      const poiData = data.data;
      console.log(poiData, type, data.markerConfig, "poiData");
      //添加poi点位的返回结果
      const resultTypesList = this.toolTypes[index];
      const resultObjsList = this.toolObjs[index];


    },
    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → customStatus
    async videoPerimeter(data, index) {
      const { poiResult, success } = await this.poiAndRange(
        data,
        index,
        "videoWarning"
      );
      if (success) {
        // // 都成功则调用聚焦操作
        const location = [
          113.72618008676687, 34.76500457249732, 1026.517224103171,
        ];
        setTimeout(async () => {
        }, 1000);
      }
    },
    // 安保人员
    // [twin 待实现] 原 wdpapi 调用：addPOI → FocusByCustomId → FocusByPoints → <实体>.onClick → FocusByPoints → addWINDOWS
    async securityPersonnel(data, index) {
      const poiData = data.data;
      const personInfoData = data.personnelInfoArray;
      const markerConfig = data.markerConfig;
      const cameras = data.cameras;

      //添加poi点位的返回结果
      const resultObjsList = this.toolObjs[index];

      this.toolObjs[index].forEach((e, i) => {
      });
    },
    // 安保岗亭
    // [twin 待实现] 原 wdpapi 调用：addPOI → FocusByCustomId → FocusByPoints → customStatus → <实体>.onClick → addWINDOWS
    async securityBooth(data, index) {
      const poiData = data.data;
      const boothInfoData = data.boothInfoArray;
      const markerConfig = data.markerConfig;
      const cameras = data.cameras;

      //添加poi点位的返回结果
      const resultObjsList = this.toolObjs[index];

      this.toolObjs[index].forEach((e, i) => {
      });
    },

    // [twin 待实现] 原 wdpapi 调用：addPOI → FocusByPoints → <实体>.onClick → FocusByPoints → addWINDOWS
    async personGate(data, index) {
      const resultObjsList = this.toolObjs[index];
      const toolData = this.toolData[index];
      this.toolObjs[index].forEach((e, i) => {
      });
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → splitBuildByName → customStatus
    async heatMap(data, index) {
      // console.log(data,'人员热力数据')
      // 聚焦
      // 拆楼
      // 开启人员热力
      // console.log('ZHAF_HeatMap_Person', '人员热力')
      setTimeout(async () => {
      }, 1000);
    },

    // [twin 待实现] 原 wdpapi 调用：addPOI → spawnEffect → FocusByPoints → customStatus → addWINDOWS → <实体>.onClick
    async footerVideo(data, index) {

      // 聚焦
      setTimeout(async () => {
      }, 1000);

      // 封装添加窗口逻辑
      const openWindow = async () => {
        // wdpapi-window-type2-20250828
        const windowParams = {
          title: data.footerData.title,
          url: process.env.VUE_APP_WINDOW_VIDEO_BASE_URL,
          type: "type2",
          bgType: "bg2",
          customParams: { ...data.footerData },
        };
      };

      // 首次自动打开窗口
      await openWindow();

      this.toolObjs[index].forEach((e) => {
      });
    },

    // [twin 待实现] 原 wdpapi 调用：aiBotRoute → customStatus
    async footerAI(data, index) {
      // 巡检路线
      // 机器人高亮
      // 500ms后显示弹窗
      setTimeout(() => {
        this.$store.commit("isShowWebTwo", {
          isShow: true,
          config: data.footerData,
        });
        this.$store.commit("setAiBotWindowId", index);
      }, 500);
    },



    // [twin 待实现] 原 wdpapi 调用：addParabola → FocusByPoints
    async handleParabola(data, index) {
      console.log("Adding Parabola with data:", data);
    },

    // [twin 待实现] 原 wdpapi 调用：addPOI → <实体>.onClick → FocusByPoints
    async customPOI(data, index) {
      const poiData = data.data;
      const markerConfig = data.markerConfig;
      const cameras = data.cameras;


      const resultObjsList = this.toolObjs[index];
    },

  },
  mounted() { },

  beforeDestroy() { },
};
