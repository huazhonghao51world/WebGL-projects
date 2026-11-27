// 工厂介绍（自动巡检）：从厂外逐栋建筑，到厂内关键设备、注射器智造线、立体仓储，形成完整导览。
// 剧本为纯数据，可复用到其他导览入口（如 AI小新、大屏轮播）：每一步给出镜头、拆楼、高亮与解说词。
//   kind: "building" 用楼栋锚点自动取景；"device" 用设备近景聚焦（focusDevice）；"view" 使用固定机位。
//   cut：本步拆楼（楼栋或楼栋:分层）；outline：本步描边的设备；hold：停留毫秒（解说播放时长）。
export const TOUR_CHAPTERS = [
  { id: "campus", name: "园区总览" },
  { id: "buildings", name: "园区建筑" },
  { id: "production", name: "生产楼" },
  { id: "line", name: "注射器智造线" },
  { id: "warehouse", name: "智能仓储" },
];

export const tourScript = [
  { chapter: "campus", kind: "view", title: "新耀工厂园区", view: { position: [164, 220, 284], target: [10, 17, -16] }, hold: 6000,
    text: "新耀工厂是一次性使用无菌注射器的数字化工厂，园区 7 栋建筑、总建筑面积 5.76 万 m²，日产注射器约 43 万支，从原料、注塑、组装到成品入库全流程在园区内闭环。" },
  { chapter: "buildings", kind: "building", id: "office", title: "办公楼", hold: 5000, text: "办公楼 6 层，园区运营中心所在地，负责生产计划、质量管理与园区调度。" },
  { chapter: "buildings", kind: "building", id: "research-1", title: "1 号研发楼", hold: 5000, text: "1 号研发楼承担模具开发与产品检测，新模具在此完成试模与尺寸检验后投产。" },
  { chapter: "buildings", kind: "building", id: "research-2", title: "2 号研发楼", hold: 4500, text: "2 号研发楼为工艺与质量部门，负责注塑工艺参数、洁净区环境与批次放行。" },
  { chapter: "buildings", kind: "building", id: "dormitory", title: "宿舍楼", hold: 4000, text: "宿舍楼 7 层，保障三班倒生产人员的生活需求。" },
  { chapter: "buildings", kind: "building", id: "warehouse", title: "库区楼", hold: 5000, text: "库区楼是园区的物流中枢：自动化立体库存放原料、包材与成品，屋顶铺设光伏。" },
  { chapter: "buildings", kind: "building", id: "production", title: "生产楼", hold: 5000, text: "生产楼是核心制造区：1F 注塑车间 46 台注塑机，组装洁净区 2 条组装线，屋顶光伏为车间供电。" },
  { chapter: "production", kind: "view", title: "注塑车间", cut: ["production"], view: { position: [62, 40, 46], target: [30, 14.5, -2] }, hold: 6000,
    text: "拆开生产楼：1F 注塑车间整齐排布 FANUC 与 ZHAFIR 注塑机，中央供料系统把干燥后的 PP / PE 粒料输送到每台机台。" },
  { chapter: "production", kind: "device", id: "ZSJ-A", title: "注塑机 A · 针筒成型", cut: ["production"], hold: 5500,
    text: "注塑机 A（FANUC-13）使用 32 腔针筒模具，成型周期约 12 秒，是注射器针筒的主力机台。" },
  { chapter: "production", kind: "device", id: "ZSJ-B", title: "注塑机 B · 针帽成型", cut: ["production"], hold: 5000,
    text: "注塑机 B 使用 48 腔针帽模具，与 A 机节拍匹配，保证针筒、针帽 1:1 供应组装线。" },
  { chapter: "production", kind: "device", id: "CSGZJ-01", title: "除湿干燥机", cut: ["production"], hold: 4500,
    text: "粒料先经除湿干燥机 120 °C 干燥，含水率降到 0.02% 以下，避免制品出现银纹、气泡。" },
  { chapter: "line", kind: "view", title: "组装洁净区", cut: ["production"], view: { position: [82, 30, 20], target: [70, 15, 3] }, hold: 5500,
    text: "组装洁净区为 10 万级环境，保持 ≥ 10 Pa 正压。针筒、针帽在此组装成注射器。" },
  { chapter: "line", kind: "device", id: "ZZXA", title: "组装线 A", cut: ["production"], hold: 5500,
    text: "组装线 A 由振动盘排序上料、输送定位、装配与视觉检测工位组成，节拍 0.42 秒/支。" },
  { chapter: "line", kind: "device", id: "JXB-A", title: "码垛机械臂", hold: 5000,
    text: "组装合格的注射器装箱后，由码垛机械臂按 48 箱/托码垛，经提升机送往立体库。" },
  { chapter: "warehouse", kind: "view", title: "立体库", cut: ["warehouse"], view: { position: [92, 70, -2], target: [24, 20, -50] }, hold: 5500,
    text: "拆开库区楼：立体库共 1440 个托盘库位，分原料区、包材区、成品区与空托盘区。" },
  { chapter: "warehouse", kind: "device", id: "DDJ-01", title: "堆垛机", cut: ["warehouse"], hold: 5500,
    text: "巷道堆垛机配四级伸缩货叉，单托存取约 96 秒，完成成品上架与原料出库。" },
  { chapter: "warehouse", kind: "device", id: "AGV-01", title: "AGV 叉车", hold: 5000,
    text: "AGV 叉车把出库原料送到注塑车间供料区，形成原料 → 注塑 → 组装 → 入库的完整闭环。导览结束。" },
];
