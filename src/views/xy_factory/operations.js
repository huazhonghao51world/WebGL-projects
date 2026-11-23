export const modules = [
  { id: "overview", name: "综合态势", icon: "overview" },
  { id: "production", name: "智能生产", icon: "production" },
  { id: "warehouse", name: "智能仓储", icon: "warehouse" },
  { id: "product", name: "产品管理", icon: "product" },
  { id: "device", name: "设备管理", icon: "device" },
  { id: "energy", name: "能源管理", icon: "energy" },
  { id: "environment", name: "环境管理", icon: "environment" },
  { id: "safety", name: "应急安防", icon: "safety" },
];

// 场景工具：pending 为已预置入口、功能建设中
export const toolGroups = [
  { name: "视角", items: [
    { id: "reset", name: "全景", icon: "target" },
    { id: "tour", name: "自动巡检", icon: "route", scene: true },
    { id: "walk", name: "第一人称", icon: "position", scene: true },
    { id: "stereo", name: "立体仓库", icon: "warehouse", pending: true },
  ] },
  { name: "测量", items: [
    { id: "measure", name: "距离测量", icon: "measure", scene: true },
    { id: "area", name: "面积测量", icon: "layout", scene: true },
  ] },
  { name: "专题", items: [
    { id: "cameras", name: "监控点", icon: "camera", scene: true },
    { id: "live", name: "实景融合", icon: "environment", pending: true },
    { id: "replay", name: "历史回放", icon: "route", pending: true },
    { id: "health", name: "设备健康度", icon: "device", pending: true },
    { id: "heat", name: "能耗热力", icon: "energy", pending: true },
    { id: "radiation", name: "辐射剂量", icon: "info", pending: true },
    { id: "emergency", name: "安全应急", icon: "safety", pending: true },
    { id: "plan", name: "布局规划", icon: "layout", pending: true },
    { id: "ao", name: "环境光遮蔽", icon: "overview", pending: true },
  ] },
];

export const productionModule = { id: "production", name: "场景运动", icon: "production", description: "库区序列 SQ_3 预置运动与场景运镜", features: ["预置运动", "产线运行 · 待开发", "工序跟随 · 待开发", "生产溯源 · 待开发"], needs: "场景侧带动作的设备模型或 XY 专属 API" };
export const environmentModule = { id: "environment", name: "场景环境", icon: "environment", description: "调整三维场景光照时间与天气" };
export const sampleRows = {
  device: [
    { id: "DEMO-D01", name: "空压机示例", area: "动力站（示例）", value: "运行 · 64 °C", trend: [44, 49, 47, 52, 50, 56, 59, 64] },
    { id: "DEMO-D02", name: "输送机示例", area: "生产楼（示例）", value: "待机 · 28 °C", trend: [26, 28, 29, 29, 28, 27, 28, 28] },
    { id: "DEMO-D03", name: "通风机示例", area: "库区楼（示例）", value: "运行 · 42 °C", trend: [36, 36, 39, 38, 40, 42, 41, 42] },
  ],
  alarm: [
    { id: "DEMO-A01", name: "空压机温度异常", area: "设备温度 · 10:18", value: "待处置", level: "紧急" },
    { id: "DEMO-A02", name: "库区温湿度偏高", area: "环境巡检 · 09:46", value: "待处置", level: "预警" },
  ],
  warehouse: [
    { id: "DEMO-W01", name: "物料区 A", area: "模拟货位 A-01 ~ A-16", value: "10 / 16 位" },
    { id: "DEMO-W02", name: "备件区 B", area: "模拟货位 B-01 ~ B-12", value: "8 / 12 位" },
  ],
  energy: [
    { id: "DEMO-E01", name: "动力用电", area: "示例计量项 · kWh", value: "128 kWh", trend: [62, 70, 65, 74, 91, 87, 105, 128] },
    { id: "DEMO-E02", name: "照明用电", area: "示例计量项 · kWh", value: "42 kWh", trend: [27, 27, 25, 30, 37, 39, 38, 42] },
  ],
};

export const tourIds = ["production", "warehouse", "research-1", "office"];

export const featureRequirements = {
  "部件拆解": "需要可分别选择的设备和部件节点，以及拆解方向、位移和复位规则。",
  "非产线历史回放": "需要可回放的设备与告警时间序列，并按设备 ID 关联空间节点。",
  "三维定位": "需要把告警的设备 ID 映射到已发布的 XY 场景节点。",
  "货位占用配色": "需要货位状态和货架节点或实例的对应关系。",
  "能耗热力": "需要计量点读数、空间位置和覆盖范围。",
  "辐射 / VTK": "需要 XY 对应的仿真数据、工程单位和空间配准。",
  "视频监控": "需要摄像头业务 ID、视频通道和取流授权。",
  "应急疏散": "需要确认安全出口、集合点和可通行的路线。",
  "隐蔽管网 / 地下透视": "需要可独立显隐的管网模型、区域及节点清单。",
  "产线运行": "需要真实产线设备、运行状态和 XY 的播放、停止、复位合同。",
  "工序跟随": "需要移动对象、工序事件和跟随目标映射。",
  "生产溯源": "需要 XY 的产品标识、工序记录与质检数据。",
};

