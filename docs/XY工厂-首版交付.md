# XY 工厂首版交付

## 业务工作台更新

XY 大屏把三维画面留在中央，左侧用楼栋与摄像头目录定位，右侧查看空间详情或业务模块，底部切换园区、设备、告警、仓储、能耗、安防、生产、布局、环境和助手。现有 Twin viewer 提供全景、巡检、自由漫游、楼层显隐、距离、水平投影面积及环境调节。测距和测面使用模型坐标，工程精度仍待场景方校准。

设备趋势、告警处置、库存查询和能耗趋势提供按需展开的演示样例。样例只在页面内工作，不提交真实处置；未接入的指标显示 `—`。各待开发入口可展开查看所缺的模型、数据或接口。生产与运动面板的“预置运动”播放场景自带动画（见下文），不调用灯塔产线脚本。企业局域网演示地址为 `http://10.67.8.183:3716/#/xy-factory`。

## 初始发布与资产来源

打开大屏顶部 **XY工厂**，或直接访问 `/#/xy-factory`。默认入口 `/#/page_2/2` 仍是灯塔。两者复用 `src/layout/scene.vue` 的同一个 SDK 场景宿主，切换时清理旧案例实例；XY 不调用灯塔 AI、台账和生产仿真接口。

本版发布场景 `xy-factory`，revision `r-db567e28-d3eb-42ed-bf89-1dfe9c599a12`。`public/config.json` 的 `cases.xy` 默认使用现有内网 Twin 平台和该案例的只读交付码。迁移部署时修改 `cases.xy.serverUrl` / `deliveryCode`（也可用被忽略的 `public/xy-scene.local.json` 覆盖案例配置），测试 URL 可用 `xyServerUrl` / `xyDeliveryCode`。不同交付码不会共用，也不会将其他场景显示为 XY。未配置或连接失败时保留静态园区图和可浏览目录。

首版支持两份真实园区模型、7 个建筑标签、13 个摄像头位置、生产楼和库区楼分层、点选、聚焦、全景复位、监控点显隐和 SDK 测距。点位沿用原模型坐标，尚待实尺校准。只展示已经收到的空间数据；视频、真实设备/告警数据和场景运动未随交付包提供，验收时不要计入。两份转换后的 GLB 共约 304 MiB，冷载和目标显卡性能仍需现场验收。

复现导入：在 Node 22+ 使用下列命令。平台源码工作区已安装依赖；执行发布脚本前通过本地环境变量 `XY_PLATFORM_USER`、`XY_PLATFORM_PASSWORD` 提供有权限的账号。脚本要求使用新案例；如果目标平台已存在 `xy-factory`，在编辑器按既有版本流程更新，不覆盖当前案例。

```powershell
node scripts/prepare-xy-assets.cjs <原件目录> <尚不存在的输出目录> <Twin平台源码目录>
node scripts/publish-xy-campus.cjs <平台API地址> <兼容GLB目录> <原件目录>
```

第一步解码 Meshopt、修复 WebP 扩展引用并通过 glTF 校验，不修改原件。第二步使用标准自动导入接口，等 Worker 验证后再创建和发布 XY。部署源代码不携带原始或转换后的 GLB；它们由 Twin 平台按发布版分发。

P4V 场景资产交付目录：`D:\P4_workspace\WebGL\51CD_2026\WebGL_EC9_Demo\assets\xy-factory`。场景同事在此持续提交 XY 模型、点位、动画及随包说明。二开工作区仍是 `E:\All_in_wdp\wdpapi_sdk\dengta-twinProject`；二开源码、构建产物和导入时生成的兼容 GLB 不在这条场景资产交付链路中。

## 预置运动（场景自带动画 + UE 运镜）

2026-11-20 接入场景组交付的 `L_Prop.glb`（UE 5.5.4 → glTF-Transform，SHA-256 `95a06fbef64f9a7df8e7beca803dbf2f0ae0c64cdfee5d1474b4e34acd98fabc`）：平台资产 `xy-prop-sq3-v1@a-7668668e67aa340b239e2af5`，场景实体 `xy-prop-sq3`，发布 revision `r-6f2eb214-0cd2-4ca5-8018-0ce7e3155195`。片段 `SQ_3_likuquanjing_0`，54.23 s / 30 fps，驱动堆垛机（一级～四级）、提升机、转运机 1/2、托盘和两台 CineCamera；机械臂骨骼本版无动画。

“生产与运动 → 预置运动”只播放模型自带的片段，**前端不编写任何设备运动**。支持播放/暂停、进度拖动、0.5～4 倍速、循环、停止并复位，以及“场景运镜”：用 `@twin/web-sdk` 0.6.0 新增的 `camera.setCameraCuts` 按 UE 镜头回放，第 900 帧（30.10 s）切到镜头 2。全景、聚焦、巡检、漫游、测距、测面会先结束运镜；离开页面时停止动画、恢复视角。

**r02 轨迹替换（消除抖动）**：首版 GLB 的动画经 Meshopt 量化（位移 1/16 m、旋转 Int16），设备和镜头呈台阶式抖动。场景组随后交付 `SQ3-trajectories`（`SQ3.motion.glb` SHA-256 `8b794b77d321f1f670b2f42c645e63fd1a4b6790aff44fc2fd43fc5fc42c327c`，Float32 全量采样）。当时用一次性脚本按节点路径把 32 条轨道替换进 L_Prop（网格、材质不变），两台相机 Actor 的位置/旋转写为 glTF `CUBICSPLINE`，与包内 `sq3-player.mjs` 的平滑一致（误差 < 5 µm / 0.04°），设备保持 `LINEAR` 原始采样；镜头 FOV 更正为 21.62° / 54.41°。平台资产 `xy-prop-sq3-v1@a-3c98ec0d3cf3c471c99a31ca`，发布 revision `r-7bb4affd-9e16-4f60-abf5-7822c8f3f6f3`。实测逐帧采样相机与转运机 2 均无停顿帧，相邻帧位移比 ≤ 1.011。此后场景组已在导出端解决动画压缩问题，`L_Prop.glb` 直接带 Float32 动画，不再单独交付轨迹包，替换脚本已移除；发布流程会拦截动画被量化的模型。

**场景换版（统一流程）**：模型（含动画）、点位和场景配置包都由场景组提交到 P4 `assets/xy-factory/`，二开运行一条命令发布，约定见 [XY工厂-场景交付与配置包约定](XY工厂-场景配置包约定.md)：

```powershell
$env:XY_PLATFORM_USER = '<账号>'; $env:XY_PLATFORM_PASSWORD = '<密码>'
node scripts/release-xy-scene.cjs <P4 本地目录>\assets\xy-factory <平台 API 地址> [--dry-run]
```

脚本按 sha256 比对场景草稿中登记的指纹，只处理变化项：模型先检查动画是否为 Float32（被量化则停止发布并说明原因），再解压 Meshopt 后导入，`L_BP.glb` 的点位写入实体 `xy-anchors`，配置包在版本号升高时上传并绑定；最后合成一次发布。没有变化时不发布。页面开启自动更新（`cases.xy.autoUpdate: true`），30 秒内切到新版本，按新点位重建 POI，并重新应用配置包，状态栏显示当前配置包版本。若片段名、实体、镜头名、帧率、导出起始帧或切镜帧变化，只改 `src/views/xy_factory/motion.js` 顶部的 `sequence` 配置；新增模型文件时在 `scripts/xy-release.config.json` 中登记实体。

2026-11-20 用模拟交付目录（三份首批原件 + L_Prop）实测：首次运行为四个模型登记指纹、写入 20 个点位，并发布 revision `r-82b5204e-ed00-4bd4-ad2e-6e3b6b80eac6`；再次运行输出“无需发布”。测试配置包从 0.0.1 升到 0.0.3 后，已打开的页面无需刷新即自动更新，旧补光撤销后只剩一盏、亮度为新值；随后测试包已从案例中移除并重新发布。

**场景组交付 xy-1.0.0（2026-11-20）**：`L_Building.glb` 只替换了一张贴图：材质 `MI_XYBK_DX10_06_GLB` 的底色改为黄色 PNG，作用于草地 `SM_Caodi`；节点、材质参数和位置不变，新 SHA-256 `6f6460ab…b802`。`L_Building2`、`L_BP` 未变。场景配置包 `xy-scene-profile@1.0.0` 首次上线，尚无效果项。发布 revision `r-e242071e-ad25-4a15-99f7-da7bc367e1cc`，资产 `xy-campus-exterior-v1@a-8a81212baf9a4b6d86a867d9`。页面实测新贴图已生效，状态栏显示“场景配置 1.0.0”；再次运行发布命令输出“无需发布”。