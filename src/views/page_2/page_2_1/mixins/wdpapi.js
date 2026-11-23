// WDP API 混入模板
import { createPoiWindowPath } from "@/mixins/poi-window-path.js";
import toolCleanupMixin from "@/mixins/toolCleanupMixin.js";
import { mapState } from "vuex";

export default {
  mixins: [toolCleanupMixin],
  data() {
    return {
      // id对应方法
      toolHandlers: {
        1: this.mode1_people,
        2: this.mode2_area,
        3: this.mode3_env,
        4: this.mode4_booth,
        5: this.mode5_camera,
        6: this.mode6_patrol,
      },
      // id对应数据
      toolData: {
        1: {
          poiLocation: [
            [113.7179501135133, 34.77917546440622, 0.1999998660374149],
            [113.72550538591716, 34.77718968277967, 0],
          ],
          poiConfig: {
            customId: ["p2_people_1", "p2_people_2"],
            entityName: ["人员", "人员"],
          },
          markerConfig: {
            markerNormalUrl: "DT_person.png",
            markerActivateUrl: "DT_person_active.png",
            markerSize: [48, 65],
          },
          focusCamera: {
            location: [113.7203488828716, 34.77585832267946, 648.4894715619527],
            pitch: -73.99999237060547,
            yaw: -60.28645324707031,
            distance: 10,
          },
          pathData: [
            [
              [113.7179501135133, 34.77917546440622, 0.1999998660374149],
              [113.7201541446789, 34.77852135041877, -5.820766091346741e-13],
              [113.7184942902851, 34.7765462430663, 0],
              [113.72359839427622, 34.774251386303234, 0],
              [113.72415080169934, 34.775141714174765, 0],
            ],
            [
              [113.72552161101886, 34.777191661563876, 0],
              [113.72505212089992, 34.77660762195751, 1.0186340659856797e-12],
              [113.72027896737633, 34.77849335646047, -7.275957614183426e-13],
            ],
          ],
          followConfig: { pitch: -38, yaw: -30, distance: 150 },
          windowLocation: [
            [113.72031020508622, 34.77801867348916, 25.181460949753593],
            [113.72268141714402, 34.77726825494639, 23.100929434573544],
          ],
          windowData: [
            [
              { title: "姓名", content: "张某某", flex: 0.5 },
              { title: "工号", content: "00103850", flex: 0.5 },
              { title: "联系方式", content: "138xxxxxxxx", flex: 0.6 },
            ],
            [
              { title: "姓名", content: "李某某", flex: 0.5 },
              { title: "工号", content: "00103851", flex: 0.5 },
              { title: "联系方式", content: "159xxxxxxxx", flex: 0.6 },
            ],
          ],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
        },
        2: {
          focusCamera: {
            location: [
              113.71989028122212, 34.775462708183156, 552.6017757628289,
            ],
            pitch: -65.90007781982422,
            yaw: -60.58737564086914,
            distance: 0.1,
          },
          windowLocations: [
            [113.71437463444423, 34.779428486570076, 30.599999999999927],
            [113.71549947611334, 34.779052274338568, 30.599999858583178],
            [113.71660772513917, 34.778623929640005, 30.600000000000001],
            [113.71817674828844, 34.777832774794661, 30.600000000000001],
            [113.71903722061377, 34.779063998297637, 30.5999990926592],
            [113.72213775435148, 34.77858512138318, 30.600000000000072],
            [113.72174638619816, 34.776977100851092, 30.599998657511605],
            [113.72021317076413, 34.776471382379611, 30.600000000000001],
            [113.72250763220654, 34.775275003017356, 30.600000000000001],
            [113.72435392924784, 34.777436332962651, 30.599999775881297],
            [113.72403701070398, 34.776175197835926, 30.600000000000001],
            [113.72576122213631, 34.776722654083009, 48.815121696506033],
            [113.72509762946979, 34.77550874879784, 30.600000000000072],
            [113.7261354726315, 34.775104454587805, 30.600000000000072],
            [113.72770298941495, 34.77470137902575, 30.599999071064669],
            [113.72718973282093, 34.773893098162496, 30.599998763559853],
            [113.72675859332331, 34.773303744276824, 30.599999999999927],
          ],
          windowConfig: {
            size: [143, 77],
            offset: [-71, 38],
          },
          windowData: [
            [{ title: "区域名称", content: "办公大楼", flex: 1 }],
            [{ title: "区域名称", content: "生活区", flex: 1 }],
            [{ title: "区域名称", content: "研发中心", flex: 1 }],
            [{ title: "区域名称", content: "仓储中心", flex: 1 }],
            [{ title: "区域名称", content: "新产品研发试验室", flex: 1 }],
            [{ title: "区域名称", content: "供能站", flex: 1 }],
            [{ title: "区域名称", content: "生产车间1", flex: 1 }],
            [{ title: "区域名称", content: "成品分拣区", flex: 1 }],
            [{ title: "区域名称", content: "原料储存区（气体）", flex: 1 }],
            [{ title: "区域名称", content: "管廊与公共设施区", flex: 1 }],
            [{ title: "区域名称", content: "检测中心", flex: 1 }],
            [{ title: "区域名称", content: "配电房", flex: 1 }],
            [{ title: "区域名称", content: "机修工段", flex: 1 }],
            [{ title: "区域名称", content: "生产车间2", flex: 1 }],
            [{ title: "区域名称", content: "废料回收与中转区", flex: 1 }],
            [{ title: "区域名称", content: "危废暂存间", flex: 1 }],
            [{ title: "区域名称", content: "废水处理中心", flex: 1 }],
          ],
          // 和上面windowData一一对应，单独存储风险等级用于右侧显示
          headerRight: [
            "低风险",
            "低风险",
            "中风险",
            "中风险",
            "中风险",
            "高风险",
            "高风险",
            "中风险",
            "高风险",
            "中风险",
            "低风险",
            "中风险",
            "低风险",
            "高风险",
            "中风险",
            "高风险",
            "中风险",
          ],
        },
        3: {
          poiLocation: [
            [113.72545244700201, 34.777236104265285, 0.17175781250007277],
            [113.72400318036503, 34.77506427820318, 0.1717578125],
            [113.72008018515432, 34.77848634954429, 0.17165781249992723],
          ],
          poiConfig: {
            customId: ["p2_env_1", "p2_env_2", "p2_env_3"],
            entityName: ["监测点位01", "监测点位02", "监测点位03"],
          },
          markerConfig: {
            markerNormalUrl: "DT_device.png",
            markerActivateUrl: "DT_device_active.png",
            markerSize: [48, 65],
          },
          focusCamera: {
            location: [
              113.72111258530596, 34.77485577472376, 482.56469395117387,
            ],
            pitch: -61.099937438964844,
            yaw: -65.3864517211914,
            distance: 10,
          },
          focusDistance: 30,
          poiFocusCameras: [
            {
              location: [
                113.72514028192167, 34.77708859772518, 53.446422486045115,
              ],
              pitch: -55.70014190673828,
              yaw: -27.587068557739258,
              distance: 0.1,
            },
            {
              location: [
                113.72379959241407, 34.77462930552918, 69.29022081209659,
              ],
              pitch: -51.049930572509766,
              yaw: -71.53663635253906,
              distance: 0.1,
            },
            {
              location: [
                113.71984471084141, 34.777996627042086, 89.94212647498516,
              ],
              pitch: -56.600521087646484,
              yaw: -65.08645629882812,
              distance: 0.1,
            },
          ],
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowData: [
            [
              { title: "温度", content: "24.5℃", flex: 0.5 },
              { title: "湿度", content: "18ug/m³", flex: 0.5 },
              { title: "PM2.5", content: "24.5μg/m³", flex: 0.5 },
              { title: "VOC", content: "0.08mg/m³", flex: 0.5 },
            ],
            [
              { title: "温度", content: "24.5℃", flex: 0.5 },
              { title: "湿度", content: "18ug/m³", flex: 0.5 },
              { title: "PM2.5", content: "24.5μg/m³", flex: 0.5 },
              { title: "VOC", content: "0.08mg/m³", flex: 0.5 },
            ],
            [
              { title: "温度", content: "24.5℃", flex: 0.5 },
              { title: "湿度", content: "18ug/m³", flex: 0.5 },
              { title: "PM2.5", content: "24.5μg/m³", flex: 0.5 },
              { title: "VOC", content: "0.08mg/m³", flex: 0.5 },
            ],
            [
              { title: "温度", content: "24.5℃", flex: 0.5 },
              { title: "湿度", content: "18ug/m³", flex: 0.5 },
              { title: "PM2.5", content: "24.5μg/m³", flex: 0.5 },
              { title: "VOC", content: "0.08mg/m³", flex: 0.5 },
            ],
          ],
        },
        4: {
          poiLocation: [
            [113.71435098434267, 34.77862636127909, 2.735971960851623],
            [113.71498275144471, 34.778353924860326, 3.3846374112509667],
          ],
          poiConfig: {
            customId: ["p2_booth_1", "p2_booth_2", "p2_booth_3"],
            entityName: ["岗亭-西门", "岗亭-东门", "岗亭-西门"],
          },
          markerConfig: {
            markerNormalUrl: "DT_booth.png",
            markerActivateUrl: "DT_booth_active.png",
            markerSize: [48, 65],
          },
          focusCamera: {
            location: [
              113.71498860751994, 34.777353510928926, 280.6794827513698,
            ],
            pitch: -60.500152587890625,
            yaw: -88.9370346069336,
            distance: 0.1,
          },
          focusDistance: 28,
          poiFocusCameras: [
            {
              location: [
                113.71442160568749, 34.778351213806886, 24.82387069590756,
              ],
              pitch: -32.45094680786133,
              yaw: -100.33614349365234,
              distance: 0.1,
            },
            {
              location: [
                113.71473860820225, 34.77813569840859, 28.851376390580153,
              ],
              pitch: -36.95070266723633,
              yaw: -50.98725128173828,
              distance: 0.1,
            },
          ],
          // rangeLocations: [
          //   [
          //     [113.71434550742345, 34.77865746303513, 0.17175781250000455],
          //     [113.71431896382711, 34.77861759200906, 0.1717578125],
          //     [113.71435690562681, 34.778599037790464, 1.4551915228366853e-12],
          //     [113.71438326597087, 34.77863903309084, -1.1641532182693482e-12],
          //   ],
          //   [
          //     [113.71501321266345, 34.77837040696232, 0.21651333025052283],
          //     [113.7149810440343, 34.7783870572649, 0.21573730345566447],
          //     [113.71494606116174, 34.77834112545384, 0.20864059123409107],
          //     [113.71498079238776, 34.77832241602995, 0.20940689247604496],
          //   ],
          // ],
          // rangeStyle: {
          //   type: "wave",
          //   fillAreaType: "none",
          //   height: 4,
          //   strokeWeight: 0,
          //   color: "437bd4ff",
          //   fillAreaColor: "fa34008f",
          //   bBlocked: false,
          // },
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          entityEids: ["57066", "57065"],
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
        5: {
          poiLocation: [
            [113.72084571759868, 34.779155974473106, 0.1717578125],
            [113.71975842369291, 34.777147032971875, 0.42175769999996365],
            [113.72300463937586, 34.77556179500143, -3.637978807091713e-14],
          ],
          poiConfig: {
            customId: ["p2_camera_1", "p2_camera_2", "p2_camera_3"],
            entityName: ["摄像头01", "摄像头02", "摄像头03"],
          },
          markerConfig: {
            markerNormalUrl: "DT_camera.png",
            markerActivateUrl: "DT_camera_active.png",
            markerSize: [48, 65],
          },
          focusCamera: {
            location: [
              113.71858116320401, 34.775290134535794, 479.88608816372545,
            ],
            pitch: -51.19999313354492,
            yaw: -30.436452865600586,
            distance: 10,
          },
          focusDistance: 24,
          poiFocusCameras: [
            {
              location: [
                113.7198324210755, 34.77852682259889, 144.44821337461588,
              ],
              pitch: -45.950313568115234,
              yaw: -35.38644790649414,
              distance: 0.1,
            },
            {
              location: [
                113.71879143493437, 34.77657290075707, 150.11938184845732,
              ],
              pitch: -45.950313568115234,
              yaw: -35.38644790649414,
              distance: 0.1,
            },
            {
              location: [
                113.72223145315853, 34.77533051172591, 178.66397859355376,
              ],
              pitch: -63.80015182495117,
              yaw: -35.38642883300781,
              distance: 0.1,
            },
          ],
          windowType: "type7",
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
            ],
          ],
        },
        6: {
          poiLocation: [
            [113.72406159419889, 34.77512264615672, 0],
            [113.72025370357849, 34.77850025771139, -1.4551915228366852e-13],
          ],
          poiConfig: {
            customId: ["p2_patrol_1", "p2_patrol_2"],
            entityName: ["巡检设备0001", "巡检设备0002"],
          },
          markerConfig: {
            markerNormalUrl: "DT_inspect.png",
            markerActivateUrl: "DT_inspect_active.png",
            markerSize: [48, 65],
          },
          focusCamera: {
            location: [113.7221214348777, 34.77674395236899, 414.2793503471141],
            pitch: -89,
            yaw: -61.48637008666992,
            distance: 0.1,
          },
          focusDistance: 700,
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
          followConfig: { pitch: -30, yaw: 0, distance: 50 },
          windowConfig: {
            size: [190, 144],
            offset: [24, 40],
          },
          windowType: "type7",
          windowLocation: [
            [113.722433788502, 34.77669907133933, 24.270917290882124],
            [113.72052165603307, 34.77818848301397, 23.304053607811138],
          ],
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
        5: [],
        6: [],
      },
      activeOutlineObj: null,
      hasSceneInit: false,
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
    // [twin 待实现] 原 wdpapi 调用：resetCamera
    async initAfterSceneReady() {
      if (!this.isSceneAlready || this.hasSceneInit) {
        return;
      }
      this.hasSceneInit = true;
      await this.normalPoi("/page_2/1-workshop");
    },

    // [twin 待实现] 原 wdpapi 调用：setEntityOutline → App.CameraControl.Stop → setEntityOutline → areaTags → setSceneTime → deleteObjs → deleteTypes → resetCamera
    async closeAll() {

      // 停止相机跟随并取消高亮
      if (this._followingParticle) {
        this._followingParticle = null;
      }
      if (this.activeOutlineObj) {
        this.activeOutlineObj = null;
      }
      if (this.isMode2Active) {
        this.isMode2Active = false;
      }
      for (const key in this.toolObjs) {
        if (this.toolObjs[key] && this.toolObjs[key].length > 0) {
          this.toolObjs[key] = [];
        }
      }
      this.$store.commit("setWindowEid", null);
      // this.$store.commit("isShowWindow", { isShow: false, config: {} });
    },

    // 人员模块功能
    async mode1_people(data, index) {
      console.log("人员模块数据：", data);
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
          options: { type: "type7", bgType: "bg_190_144", headerTag: "02车间" },
        },
        path: {
          pathData: data.pathData,
          poiPathConfig: {
            type: "arrow",
            width: 8,
            color: "rgba(0,0,0,0)",
            passColor: "00e5ff",
          },
          windowPathConfig: {
            type: "solid",
            width: 1,
            color: "rgba(0,0,0,0)",
            passColor: "rgba(0,0,0,0)",
          },
          moveTimes: [200, 120],
        },
        focusCamera: data.focusCamera,
        prefix: "p2_people",
        // [twin 待实现] 原 wdpapi 调用：followEntity → followEntity
        onActivate: async (i, { poiObjs }) => {
        },
        // [twin 待实现] 原 wdpapi 调用：App.CameraControl.Stop → FocusByPoints
        onDeactivate: async () => {
          self._followingParticle = null;
          if (data.focusCamera) {
          }
        },
      });

      this.toolObjs[index].push(...result.allObjs);
    },

    // [twin 待实现] 原 wdpapi 调用：FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addRange → addWINDOWS
    async runPoiFocusWindowModule(data, index, fallbackPrefix = "点位") {
      if (!data?.poiLocation?.length) return;

      const peopleFocus = data.focusCamera;
      if (peopleFocus) {
      }



      let activeWindowIndex = -1;
      let activeWindowObj = null;
      let activeRangeObjs = [];
      const sourceUrl = this.$store.state.wdpConfig.sourceUrl;
      const normalIcon = sourceUrl + (data.markerConfig?.markerNormalUrl || "");
      const activeIcon =
        sourceUrl + (data.markerConfig?.markerActivateUrl || "");

    },

    // 区域模块功能
    // [twin 待实现] 原 wdpapi 调用：areaTags → setSceneTime → FocusByPoints
    async mode2_area(data, index) {
      if (!data) return;

      this.isMode2Active = true;


      const buildItem = (loc, i) => ({
        location: loc,
        title: "区域",
        type: "type7",
        bgType: "bg_190_102",
        headerRight: data.headerRight?.[i] || "",
        infoList: JSON.stringify(data.windowData?.[i] || []),
        entityName: `区域信息窗口-${i + 1}`,
        customId: `p2_area_window_${i + 1}`,
      });

      // // 第一批：单数索引 (4-13)
      // const oddData = data.windowLocations
      //   .map((loc, i) => ({ loc, i }))
      //   .filter(({ i }) => i >= 3 && i <= 10)
      //   .map(({ loc, i }) => buildItem(loc, i));

      // // 第二批：双数索引 (0-3, 14-16)
      // const evenData = data.windowLocations
      //   .map((loc, i) => ({ loc, i }))
      //   .filter(({ i }) => (i >= 0 && i <= 2) || (i >= 11 && i <= 16))
      //   .map(({ loc, i }) => buildItem(loc, i));

      // const [oddRes, evenRes] = [
      //   await addWINDOWSBatch(oddData, data.windowConfig),
      //   await addWINDOWSBatch(evenData, data.windowConfig),
      // ];

      // if (oddRes.success && oddRes.result?.objects?.length) {
      //   this.toolObjs[index].push(...oddRes.result.objects);
      // }
      // if (evenRes.success && evenRes.result?.objects?.length) {
      //   this.toolObjs[index].push(...evenRes.result.objects);
      // }
    },

    // 环境模块功能
    async mode3_env(data, index) {
      await this.runPoiFocusWindowModule(data, index, "环境");
    },

    // 岗亭模块功能
    async mode4_booth(data, index) {
      await this.runPoiFocusWindowModule(data, index, "岗亭");
    },

    // 摄像头模块功能
    async mode5_camera(data, index) {
      await this.runPoiFocusWindowModule(data, index, "摄像头");
    },

    // 巡检模块功能
    async mode6_patrol(data, index) {
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
            type: data.windowType || "type7",
            bgType: "bg_190_144",
            headerRight: "运行",
          },
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
        prefix: "p2_patrol",
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
  },

  async mounted() {
    await this.initAfterSceneReady();
  },

  // [twin 待实现] 原 wdpapi 调用：setEntityOutline → areaTags → setSceneTime → deleteTypes
  async beforeDestroy() {
    if (this.activeOutlineObj) {
      this.activeOutlineObj = null;
    }
    if (this.isMode2Active) {
    }
  },
};
