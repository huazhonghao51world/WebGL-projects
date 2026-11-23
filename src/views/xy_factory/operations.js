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

// 场景工具：scene=需要三维场景就绪；pending=已预置入口、功能建设中（点击弹窗提示）。
export const toolGroups = [
  { name: "视角", items: [
    { id: "reset", name: "全景", icon: "target" },
    { id: "tour", name: "自动巡检", icon: "route", scene: true },
    { id: "walk", name: "第一人称", icon: "position", scene: true },
    { id: "stacker", name: "立体库", icon: "warehouse", scene: true },
  ] },
  { name: "测量", items: [
    { id: "measure", name: "距离测量", icon: "measure", scene: true },
    { id: "area", name: "面积测量", icon: "layout", scene: true },
  ] },
  { name: "专题", items: [
    { id: "cameras", name: "监控点", icon: "camera", scene: true },
    { id: "video", name: "视频监控", icon: "camera", pending: true },
    { id: "health", name: "设备健康度", icon: "device", pending: true },
    { id: "heat", name: "能耗热力", icon: "energy", pending: true },
    { id: "clean", name: "洁净区压差", icon: "environment", pending: true },
    { id: "emergency", name: "应急疏散", icon: "safety", pending: true },
    { id: "slots", name: "库位占用", icon: "warehouse", pending: true },
    { id: "replay", name: "历史回放", icon: "route", pending: true },
  ] },
];

export const environmentModule = { id: "environment", name: "场景环境", icon: "environment", description: "调整三维场景光照时间与天气" };

// 自动巡检站序：园区主要生产相关楼栋。
export const tourIds = ["production", "warehouse", "research-1", "office"];
