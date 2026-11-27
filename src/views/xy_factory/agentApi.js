// 新耀工厂向 AI小新 开放的专属能力（SDK 自动生成 case_* 工具）。
// 所有函数都调用页面方法，Agent 的操作与界面状态（台账、告警、图层、生产线、拆楼、POI 显隐）保持一致。
// 注意：SDK 会把名为 id 的参数当作场景实体解析，设备参数统一命名为 deviceId。
import { modules } from "./operations";
import { layerDefs } from "./layers";
import { materialPresets, commands } from "./deviceOps";
import { stages, WORLD_SPEEDS } from "./pipeline";

const str = (name, description, required = false) => ({ name, type: "string", description, required });
const num = (name, description, required = false) => ({ name, type: "number", description, required });
const bool = (name, description, required = false) => ({ name, type: "boolean", description, required });
const arr = (name, description, required = false) => ({ name, type: "array", description, required });

const layerIds = [...Object.keys(layerDefs), "mold", "thermal"];
const moduleIds = modules.map((m) => m.id);

export function createXYAgentCase(vm) {
  const fn = (name, title, category, description, params, returns, handler) => ({ name, title, category, description, params, returns, handler });
  const functions = [
    fn("getFactoryOverview", "工厂总览", "查询", "新耀工厂（一次性无菌注射器）园区、生产、设备、告警、仓储、能耗、环境的当前汇总。回答概况类问题前先调用。", [], "各业务域关键指标", () => vm.apiOverview()),
    fn("listDevices", "查询设备台账", "设备", "按分组/状态/楼栋/关键字筛选 70 台场景设备（注塑机 FANUC×42、ZHAFIR×6、干燥机、组装线、堆垛机、AGV 等）。", [
      str("group", "设备分组 id，如 ZSJ-F 注塑机FANUC、ZSJ-Z 注塑机ZHAFIR、GZJ、CSGZJ、SSYT、ZYGL、ZZX 组装线、ZJXB、JXB 码垛机械臂、TSJ、DDJ、ZYJ、AGV"),
      str("status", "运行 / 告警 / 故障 / 待机 / 换模"),
      str("building", "production | warehouse：生产楼 / 库区楼"),
      str("keyword", "名称关键字，如 FANUC-17"),
    ], "设备列表（最多 40 条）与总数", (p) => vm.apiDevices(p)),
    fn("getDevice", "设备详情", "设备", "读取单台设备的状态、健康度、温度、功率、累计运行、节拍与部件状态。", [str("deviceId", "设备编号或名称，如 ZSJ-F17、FANUC-17、组装线 A、堆垛机", true)], "设备详情与部件", (p) => vm.apiDevice(p.deviceId)),
    fn("locateDevice", "定位设备", "设备", "相机飞到设备室内近景（不拆楼），光框标示整台设备，右上打开设备信息卡；运动设备自动跟随。", [str("deviceId", "设备编号或名称", true)], "定位结果", (p) => vm.locateDevice(p.deviceId)),
    fn("controlDevice", "设备控制", "设备", "远程控制设备（演示，只更新孪生台账与动画，不下发真实 PLC）：start 启动（待机/换模可用）、stop 停机、reset 故障复位、estop 急停。有自带动画的设备启动后循环播放运动。", [
      str("deviceId", "设备编号或名称", true),
      str("command", `${commands.map((c) => c.id).join(" | ")}：${commands.map((c) => c.name).join(" / ")}`, true),
      str("user", "操作人，默认 中控值班"),
    ], "执行结果与新状态", (p) => vm.controlDevice(p.deviceId, p.command, p.user)),
    fn("explodeDevice", "部件拆解", "设备", "部件拆解：在独立大窗口中展示设备拆解动画与构件详情（主场景不变）。支持 AGV、堆垛机、机械臂、注塑机 A/B、组装线、中央供料、转运机、提升机；FANUC/ZHAFIR 注塑机等为整体模型，不能拆解，会改为打开设备信息。", [str("deviceId", "设备编号或名称", true)], "部件列表", (p) => vm.explodeDevice(p.deviceId)),
    fn("focusDeviceDetail", "观察细节", "设备", "镜头贴近设备（适合封闭小房间内的设备）。", [str("deviceId", "设备编号或名称", true)], "", (p) => vm.focusDetail(p.deviceId)),
    fn("collapseDevice", "拆解复原", "设备", "把爆炸展开的结构件收回原位并清除描边。", [], "", () => vm.collapseDevice()),
    fn("setDeviceMaterial", "材质调节", "设备", "给设备着色以便识别。", [
      str("deviceId", "设备编号或名称", true),
      str("preset", `${materialPresets.map((m) => m.id).join(" | ")}：${materialPresets.map((m) => m.name).join(" / ")}`, true),
    ], "", (p) => vm.setDeviceMaterial(p.deviceId, p.preset)),
    fn("listAlarms", "查询告警", "告警", "查询告警中心记录。", [str("state", "未处置 / 已处置"), str("level", "紧急 / 预警 / 提示")], "告警列表", (p) => vm.apiAlarms(p)),
    fn("handleAlarm", "处置告警", "告警", "处置并解除一条未处置告警。", [
      str("alarmId", "告警编号，如 ALM-1123-014", true), str("user", "处置人", true), str("result", "已修复恢复运行 / 转维修工单 / 误报"),
    ], "处置结果", (p) => vm.handleAlarmBy(p.alarmId, p.user, p.result)),
    fn("locateAlarm", "定位告警", "告警", "定位告警对应的设备或楼栋。", [str("alarmId", "告警编号", true)], "", (p) => vm.locateAlarm(p.alarmId)),
    fn("showLayer", "打开专题图层", "专题", "打开一个业务专题（同一时间一个）：pipeline 生产管线、health 设备健康度（≥80 正常 / 60–79 黄 / <60 红）、heat 能耗热力、clean 洁净区压差 VTK、mold 模温仿真弹窗（模具型腔温度、冷却回路平衡与成型节拍；device 可选 ZSJ-A / ZSJ-B / ZSJ-F17）、thermal 设备表面热成像弹窗（device 可选 ZSJ-F17 注塑机 / SSYT-01 干燥机 / DDJ-01 堆垛机 / ZZXA 组装线）、emergency 应急疏散（case 可选 molding-fire 注塑车间火情 / clean-leak 洁净区泄漏）、slots 库位占用、video 监控点位。", [str("layer", `${layerIds.join(" | ")}`, true), str("device", "mold / thermal 时的设备编号"), str("case", "emergency 时的疏散案例")], "图层说明", (p) => vm.openLayer(p.layer, { ...(p.device ? { device: p.device } : {}), ...(p.case ? { case: p.case } : {}) })),
    fn("clearLayer", "关闭专题图层", "专题", "关闭当前专题图层并清理覆盖物。", [], "", () => vm.closeLayer()),
    fn("controlSimulation", "控制 VTK 仿真", "专题", "控制当前打开的 VTK 仿真（clean / mold 图层）：play 播放、pause 暂停、seek 跳到第 frame 帧、field 切换显示字段（clean 支持 Pressure 压差 / Velocity 气流）。返回当前帧统计。", [
      str("action", "play | pause | seek | field | info", true), num("frame", "帧序号（seek 时）"), str("field", "Pressure | Velocity | Temperature（field 时）"),
    ], "当前帧与统计", (p) => vm.simulationControl(p.action, p.frame, p.field)),
    fn("controlProductionLine", "注射器智造线", "生产", `注射器智造线（${stages.map((s, i) => `${i} ${s.name}`).join(" → ")}）：场景就绪时未开始生产；running=true 开始生产（从当前工序续播、批次循环），running=false 停止生产；follow=true 跟随产线视角（未开始生产时会先开始生产；恢复拆楼、隐藏管线特效），follow=false 退出并回到之前的拆楼状态；speed 播放倍速（${WORLD_SPEEDS.join(" / ")}）；stage 查看某道工序。`, [
      bool("running", "开始（true）或停止（false）生产"), num("speed", `播放倍速 ${WORLD_SPEEDS.join(" | ")}`), bool("follow", "是否跟随产线视角"), num("stage", "要查看的工序序号 0–5"),
    ], "生产线状态", (p) => vm.apiControlLine(p)),
    fn("playFlyover", "相机巡航", "场景", "沿 UE 镜头轨迹巡航：overview 园区巡航（入口、办公、研发、生产与库区全貌），base 屋顶光伏巡航（俯瞰生产楼、库区楼屋顶光伏）。只移动相机，生产线照常运行。", [
      str("route", "overview | base", true),
    ], "", (p) => vm.playFlyover(p.route)),
    fn("factoryTour", "工厂介绍", "场景", "启动 / 结束完整的工厂介绍导览：园区总览 → 厂外各建筑 → 生产楼注塑设备 → 注射器智造线组装 → 立体仓储，自动拆楼、描边并播放解说。", [
      bool("on", "true 开始，false 结束", true),
    ], "", (p) => { if (Boolean(p.on) !== vm.touring) vm.toggleTour(); return { ok: true, touring: vm.touring }; }),
    fn("getProductionState", "生产线状态", "生产", "生产线当前批次、所在工序、工序与批次进度、播放倍速与观察方式。", [], "", () => vm.apiProductionState()),
    fn("setCutaway", "拆楼", "场景", "拆楼或复原：production 拆生产楼（整栋拆开、始终保留 1F；也可 production:3F / production:副楼 / production:2F 单独拆）；warehouse 拆库区楼整栋；空数组 = 全部复原。", [
      arr("buildings", "楼栋或楼栋:分层键", true),
    ], "当前已拆分层", (p) => vm.setCutawayTo(p.buildings || [], "AI小新")),
    fn("restoreScene", "场景初始化", "场景", "恢复场景初始状态：镜头、拆楼、专题图层、选中、测量、材质着色、部件拆解全部复位（生产线状态不变）。", [], "", () => vm.restoreScene()),
    fn("setPoiVisible", "POI 显隐", "场景", "POI 显隐：group 指定分组（building 楼栋标签 / camera 监控点 / device 设备点位 / layer 专题点位）只控制该组；不传 group 则全部显示或隐藏。", [
      bool("visible", "显示或隐藏", true), str("group", "building | camera | device | layer"),
    ], "", (p) => (p.group ? vm.setPoiGroup(p.group, p.visible !== false) : vm.setPoiVisible(p.visible !== false))),
    fn("locateBuilding", "定位楼栋", "场景", "定位楼栋：生产楼（保留 1F）/ 库区楼自动拆楼并聚焦室内，其余楼栋飞到楼栋。", [
      str("building", "production | warehouse | research-1 | research-2 | office | dormitory | utility", true),
    ], "", (p) => vm.apiLocateBuilding(p.building)),
    fn("openCameraView", "监控视角", "安防", "打开某路监控：在监控点位上方弹出实时视频窗（随镜头跟随），可切到三维监控视角。", [num("camera", "摄像头编号 1–13", true)], "", (p) => vm.cameraViewById(p.camera)),
    fn("getWarehouse", "仓储信息", "仓储", "立体库库区占用、今日出入库任务与立库设备状态。", [], "", () => vm.apiWarehouse()),
    fn("getEnergy", "能耗信息", "能源", "今日用电、光伏、分项计量、碳排与单位产品能耗。", [], "", () => vm.apiEnergy()),
    fn("getEnergyStrategies", "能效优化策略", "能源", "基于分项计量、设备台账、光伏曲线生成能效优化策略与预计节电量，并在界面打开策略面板。", [], "策略列表", () => vm.openStrategy()),
    fn("getEnvironment", "环境信息", "环境", "车间温湿度、洁净区压差与达标情况。", [], "", () => vm.apiEnvironment()),
    fn("switchModule", "切换业务模块", "界面", "切换顶部业务模块面板。", [str("module", `${moduleIds.join(" | ")}`, true)], "", (p) => vm.apiSwitchModule(p.module)),
    fn("replayHistory", "历史回放", "告警", "历史回放：右侧弹出告警回溯列表与时间轴，逐条聚焦设备并显示当时状态。action=start 打开，stop 关闭。", [str("action", "start | stop", true)], "", (p) => (p.action === "stop" ? vm.stopReplay() : vm.startReplay())),
    fn("resetView", "复位", "场景", "回到园区全景，清除设备定位描边与部件标注。", [], "", () => { vm.collapseDevice(); vm.reset(); return { ok: true }; }),
  ];
  return Object.freeze({
    key: "xy",
    title: "你好，我是 AI小新",
    welcome: "我是新耀工厂的 AI 助手小新，用一句话操作工厂孪生：查询设备与告警、定位并拆解设备、远程控制、生产线（倍速 / 跟随视角）、园区巡航、拆楼、业务专题（健康度 / 能耗热力 / 应急疏散预案 / 库位占用 / VTK 压差与设备热成像）、能效策略。",
    name: "AI小新",
    persona: "AI小新（新耀工厂 AI 助手）",
    clientName: "dengta-twinProject/xy-factory",
    suggestions: [
      { name: "生产", items: ["今天生产情况怎么样？", "产线到哪道工序了？", "跟随产线视角"] },
      { name: "设备告警", items: ["哪些设备在告警？", "拆解注塑机 A 看看结构", "回放今天的告警"] },
      { name: "能源环境", items: ["今天用电和光伏情况", "哪些车间环境不达标？", "生成能效优化策略"] },
      { name: "仓储安防", items: ["立体库库位占用情况", "演示注塑车间火情疏散", "园区巡航一圈"] },
    ],    functions,
  });
}
