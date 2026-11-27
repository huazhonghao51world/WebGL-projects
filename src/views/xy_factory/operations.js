// 业务模块（6 个）：产品管理并入智能生产（产线即产品流转），能源与环境合并为“能源环境”。
export const modules = [
  { id: "overview", name: "综合态势", icon: "overview" },
  { id: "production", name: "智能生产", icon: "production" },
  { id: "warehouse", name: "智能仓储", icon: "warehouse" },
  { id: "device", name: "设备管理", icon: "device" },
  { id: "energy", name: "能源环境", icon: "energy" },
  { id: "safety", name: "应急安防", icon: "safety" },
];
// 旧模块 id（Agent / 历史链接）→ 合并后的模块。
export const moduleAlias = { product: "production", environment: "energy" };

// 切换模块时的业务视角：镜头飞到该模块关注的区域（overview 回到园区全景）。
export const moduleViews = {
  production: { id: "xy-mod-production", name: "智能生产", position: [39.43, 144.68, 114.73], target: [36, 14, -16] },
  warehouse: { id: "xy-mod-warehouse", name: "库区楼立体库", position: [92, 70, -2], target: [24, 20, -50] },
  device: { id: "xy-mod-device", name: "注塑车间设备", position: [62, 40, 46], target: [30, 14.5, -2] },
  energy: { id: "xy-mod-energy", name: "屋顶光伏与能源", position: [150, 120, 110], target: [32, 22, -22] },
  safety: { id: "xy-mod-safety", name: "园区安防", position: [40, 210, 230], target: [20, 14, -10] },
};

// 场景工具（只放通用工具；业务图层已并入各业务模块面板）：scene=需要三维场景就绪。
export const toolGroups = [
  { name: "视角", items: [
    { id: "reset", name: "全景", icon: "target" },
    { id: "tour", name: "工厂介绍", icon: "route", scene: true },
    { id: "walk", name: "第一人称", icon: "position", scene: true },
  ] },
  { name: "工具", items: [
    { id: "restore", name: "场景初始化", icon: "init", scene: true },
    { id: "cutaway", name: "拆楼控制", icon: "building", scene: true },
    { id: "pois", name: "POI显隐", icon: "position", scene: true },
    { id: "pick", name: "点选设备", icon: "device", scene: true },
    { id: "measure", name: "距离测量", icon: "measure", scene: true },
    { id: "area", name: "面积测量", icon: "layout", scene: true },
    { id: "coords", name: "取点工具", icon: "target", scene: true },
  ] },
  { name: "AI", items: [
    { id: "assistant", name: "AI小新", icon: "assistant" },
  ] },
];

// 业务模块内的专题功能（显示在对应模块面板的“专题”卡中）。
export const moduleLayers = {
  production: [
    { id: "pipeline", name: "生产管线", desc: "拆楼显示全流程" },
    { id: "layout", name: "布局规划", desc: "拖拽调整 1F 设备" },
    { id: "mold", name: "模温仿真", desc: "型腔温度 · 冷却回路平衡 · 节拍" },
  ],
  warehouse: [{ id: "slots", name: "库位占用", desc: "库区占用柱" }],
  device: [{ id: "health", name: "设备健康统计", desc: "按健康分着色" }],
  energy: [
    { id: "heat", name: "能耗热力", desc: "设备功率热力分布" },
    { id: "clean", name: "洁净区压差", desc: "开门压差仿真" },
  ],
  safety: [
    { id: "emergency", name: "应急疏散", desc: "2 套预置疏散预案" },
    { id: "replay", name: "历史回放", desc: "告警时间轴回溯" },
  ],
};

// POI 分组显隐。
export const poiGroups = [
  { id: "building", name: "楼栋标签" },
  { id: "camera", name: "监控点" },
  { id: "device", name: "设备点位" },
  { id: "layer", name: "专题点位" },
];

// 健康度梯队：分数 → 等级、颜色（模型着色、卡片、图例统一使用）。
export const HEALTH_TIERS = [
  { min: 80, level: "正常", tone: "ok", color: "#4ade80" },
  { min: 60, level: "预警", tone: "warn", color: "#f5c451" },
  { min: 0, level: "告警", tone: "bad", color: "#ff5a4f" },
];
export const healthTier = (score) => HEALTH_TIERS.find((t) => score >= t.min) || HEALTH_TIERS[2];

export const environmentModule = { id: "environment", name: "场景环境", icon: "environment", description: "调节场景组光照的时间与天气" };
