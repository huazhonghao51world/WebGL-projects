# XY 工厂 · 平台场景差异与性能排查（2026-11-23）

对照对象：场景组工作台 `xy-version­package/xy-source`（`?mode=release`，正式清单 6 个模型 + `sky-atmos-6800`）与平台交付页 `#/xy-factory`（同一批 GLB + 配置包 `xy-scene-profile@1.1.0`），测试机 RTX 3070。

## 1. 结论速览

| # | 现象 | 根因 | 处理 |
|---|---|---|---|
| 1 | 屋顶光伏板、库区楼屋面闪烁条纹 / 蓝色线状伪影 | 平台相机 near = 0.05 m、far = 3000 m（远近比 6 万）；工作台 near = 1 m、far = 6000 m（6 千），深度精度差 10 倍。`roofDepth.ts` 给光伏板的 `polygonOffset` −0.5 单位是按工作台近裁面调的，在平台上不够 | **二开已修**：`renderTuning.js` 自适应近裁面（相机到目标距离 × 0.4%，限制 0.05–1 m） |
| 2 | 场景整体卡顿（全景约 12 FPS） | 配置包两盏平行光（1024² + 2048²）阴影**每帧**重绘，阴影通道约占一半三角面（4490 万 → 2690 万） | **二开已修**：阴影改为每 300 ms 更新一次，全景 12 → 18 FPS |
| 3 | 旋转相机时帧率跌到 1–4 FPS | 二开的 POI 遮挡曾用逐点拾取（2000 万面、无逐网格 BVH，单次约 40 ms） | **二开已修**：改为相机停稳后离屏渲染 320×180 深度图比较，运动中零开销；同视角 1.2 → 45 FPS |
| 4 | 剩余的基础开销 | 场景本身：全景 2690 万三角面、2472 次 draw call | **需场景组处理**（见第 3 节） |

配置包本身的模块在平台上是生效的：已核对 6 个实体的源网格材质与平台实际绘制的材质一致（`materialNotRendered = 0`），光照与 5 个模型模块均已登记到扩展层状态。

## 2. 渲染管线差异（无法在配置包内消除，需知悉）

| 项 | 工作台 | 平台 |
|---|---|---|
| 后处理 | EffectComposer → RenderPass → 特效 Pass → OutputPass；另有 SSR 对比 | 直接渲染，无后处理链 |
| 相机 | near 1 / far 6000 / 正式机位 target (20,22,-15) 距离 320 | near 0.05（现由二开自适应）/ far 3000 / fov 45 |
| 曝光 | ACES，曝光由光照预设设置 | ACES，曝光 1.15（配置包写入） |
| 网格 | 原始 three 对象 | 合批 / 实例化后绘制（材质修改可传递，新增几何需挂在实体子树下） |

依赖后处理（OutputPass 色彩、SSR、描边 Pass）的效果在平台上不会出现；如需保留，请改为材质级实现。

## 3. 场景侧优化建议（按三角面排序，全景可见）

| 网格 | 实体 | 三角面 |
|---|---|---|
| SM_MERGED_BP_SnappyRoad_C（道路合并） | xy-campus-exterior | 1.74 M |
| SM_LK_GD_Instanced（立库轨道） | xy-campus-core | 0.88 M |
| JXB（码垛机械臂） | xy-prop-sq3 | 0.83 M |
| SM_zhenmao（针帽） | xy-mesh | 0.78 M |
| SM_BLF_ZYGL_01_BLa（中央供料） | xy-shinei | 0.78 M |
| SM_XYBK_Build04_SB_2F | xy-campus-core | 0.72 M |
| SM_MERGED_SM_XY_ZSJ_FANUC_01_LOW_C（注塑机） | xy-shinei | 0.72 M |
| SM_XY_ZZXA_YS（组装线） | xy-mesh | 0.68 M |

建议：道路与地面改为平面 + 贴图；室内小件（针帽、针筒、托盘箱）减面或做 LOD；室外合批实例（道路、立库轨道）检查是否重复导出；阴影只让建筑与大型设备投射（当前 1584 个投射体）。

## 4. 二开侧改动位置

- `src/views/xy_factory/renderTuning.js`：自适应近裁面、阴影限频（离开页面时完整还原）。
- `src/views/xy_factory/poiOcclusion.js`：深度图遮挡。
- `src/views/xy_factory/chart.vue`：图表只在 option 内容变化时重绘（原先看板每次刷新都会重建全部 ECharts 并重放动画）。
