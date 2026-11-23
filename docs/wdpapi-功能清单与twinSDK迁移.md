# 灯塔工厂二开（dengta）wdpapi 功能清单与 twinSDK 迁移说明

> 源项目：`dengta-wdpapiProject`（wdpapi 2.2.1，UE 云渲染，原样保留可对照运行）
> 迁移项目：`dengta-twinProject`（本项目，@twin/web-sdk 0.1.0，浏览器内 WebGL 渲染）
> 本文只记录 API 执行顺序，不含入参与数据。附录 B 的调用链由代码中的 `// [twin 待实现]` 注释自动汇总，与源码一一对应。

图例：✅ twinSDK 现有接口可直接复刻　◐ 可复刻，但需改写方式或有局部缺口　❌ 需 SDK 补充能力

---

## 1. 迁移结果概览

| 层 | 原实现（wdpapi） | 迁移后（twinSDK） | 状态 |
|---|---|---|---|
| 依赖 | `wdpapi` | `@twin/web-sdk`（Verdaccio `http://10.67.8.183:4873`，见 `.npmrc`） | 完成 |
| 场景层 `layout/scene.vue` | `new WdpApi()` → `Renderer.Start` → `RegisterSceneEvent` | `createTwinApp`（交付码）→ `setTwinApp` → SDK 事件转发 `emitter` | 完成 |
| SDK 封装 `utils/wdpapi/*` | 7 个封装文件 | 删除，改用 `utils/twin/*`（与 twin-vue-starter 一致） | 完成 |
| 业务代码 | 29 个文件中约 620 条 wdpapi 语句 | 已剔除；141 个方法头部标注 `// [twin 待实现] 原 wdpapi 调用：…` | 框架就绪，待逐项实现 |
| 业务面板/路由/状态 | — | 原样保留（26 个路由逐一验证可进入、可往返、无控制台报错） | 完成 |
| 弹窗回传 | UE 注入 `w51_event` → `OnWebJSEvent` | `main.js` 垫片 `w51_event` → `postMessage` → `emitter("windowEvent")`，弹窗组件零改动 | 完成 |
| 面板隐藏联动 | `Scene.GetByTypes(Window)` → `SetVisibleByObjects` | `scene.getByTypes(["Window"])` → `scene.setVisible`（只缓存 eid） | 完成 |
| AI 场景助手 | 无（仅设备页 Lighthouse 问答） | 接入 twin-vue-starter 的场景助手（全局右下角），经 `/agent-api` 复用 agent-server | 完成，真实大模型验证 |
| Vuex | `state.wdpApp` 存 SDK 实例 | 删除；SDK 实例只放 `utils/twin/app.js`（防止 Vue 深度改造 three.js 场景图） | 完成 |

迁移工具：`scripts/strip-wdpapi.js`（Babel AST，按源码区间删除，未触及代码逐字节保留；被删语句的依赖变量会传递剔除）。

### 1.1 迁移时修正的行为
- **路由卡死**：`/page_2/4`、`/page_2/4-device` 的 `beforeRouteLeave` 在"地球展开"时挂起 `next`，等待 UE 回调 `Earth_State=false`。twinSDK 无地球，该回调永远不会到达。`store.earthState` 默认值改为 `false`，守卫走原有的"地球已关闭、直接放行"分支，路由逻辑本身未改。
- **`clearAllToolObjs` 调用了未定义的 `deleteByObjs`**（原项目潜在缺陷）：在 `toolCleanupMixin` 中补上，底层为 twin `scene.delete`。
- **`header.vue` 切到集团首页时调用了无参数的 `addPOI()`**（原代码实际不生效）：已标注为待实现。

### 1.2 运行
```bash
npm install                     # @twin/* 走 10.67.8.183:4873，首次需 npm login --registry http://10.67.8.183:4873/
npm run serve                   # .env 端口 3666；与 twin-vue-starter 同时运行时可用 VUE_APP_RUN_PORT=3668
```
- 三维平台：threejs-twin-p0 以 `npm run dev:lan` 启动（5184，局域网可访问）；`public/config.json` 中的 `serverUrl` / `deliveryCode` 可被 URL 参数 `?serverUrl=&deliveryCode=` 覆盖。
- 当前平台只有一个已发布案例 `TWN-DEMO-LINEA-0001`（泵站产线 A），工厂模型发布为 twin 案例前，场景内显示的是该演示案例。
- AI 助手：`/agent-api` 代理到 `127.0.0.1:3690`（twin-vue-starter 的 agent-server，大模型配置共用）。

---

## 2. wdpapi 能力 → twinSDK 对照

### 2.1 封装函数 → wdpapi 底层 API（附录 B 中的名字按此展开）
| 原封装（utils/wdpapi） | wdpapi 底层调用顺序 |
|---|---|
| `addPOI` | `App.Scene.Create(Poi×N)` |
| `addWINDOWS` | `[可选]App.Scene.Covering.ClearByTypes(Window)` → `new App.Window` → `App.Scene.Add` |
| `addWINDOWSBatch` | `[可选]Covering.ClearByTypes(Window)` → `App.Scene.Create(Window×N)` |
| `addRange` / `addPolygonRange` | `new App.Range` → `App.Scene.Add` |
| `updatePolygonRange` / `setPolygonRangeVisible` | `Range.Update` / `Range.SetVisible` |
| `addPath` / `addEntities` | `new App.Path` → `App.Scene.Add` / `App.Scene.Create(Path×N)` |
| `coveringMove` | `new App.Bound(moving, path)` → `App.Scene.Add`（实体沿路径移动） |
| `addParticle` | `new App.Particle` → `App.Scene.Add` |
| `addText3d` | `new App.Text3D` → `App.Scene.Add` |
| `addParabola` / `addCoveringParabola` / `updateCoveringParabola` | `new App.Parabola` → `App.Scene.Add` / `Parabola.Update` / `Parabola.SetVisible` |
| `getByEids` / `getObjectByEid` | `App.Scene.GetByEids` / `App.Scene.GetObjectEid` |
| `setEntityOutline` / `setEntityOutlineAndHighlight` | `entity.SetEntityOutline` (+ `entity.SetEntityHighlight`) |
| `setEntitiesHighlight` | `App.Scene.SetEntityHighlight` |
| `setVisualColorStyle` / `setOutlineThickness` | `App.Setting.SetVisualColorStyle` / `App.Setting.SetOutlineThickness` |
| `deleteTypes` / `deleteObjs` / `ClearByEids` | `App.Scene.ClearByTypes` / `App.Scene.Delete` / `App.Scene.ClearByEids` |
| `resetCamera` | `App.CameraControl.UpdateCamera`（位姿 + 限制 + 控制模式） |
| `FocusByPoints` | `App.CameraControl.FlyTo(targetPosition, pitch, yaw, distance)` |
| `FocusByCustomId` | `App.CameraControl.FocusByCustomId` |
| `followEntity` | `App.CameraControl.Follow` |
| `setCameraLimit` / `getCameraInfo` | `App.CameraControl.SetCameraLimit` / `App.CameraControl.GetCameraInfo` |
| `setCameraViewshed` | `new App.Viewshed` → `App.Scene.Add` |
| `setSceneTime` / `setSceneWeather` | `App.Environment.SetSkylightTime` / `App.Environment.SetSceneWeather` |
| `pickPoint` / `getPoints` | `App.Tools.PickerPoint.StartPickPoint` / `EndPickPoint` / `GetPickedPoints` |
| `splitBuildByName` | `App.Customize.RunCustomizeApi(CustomAPI_SplitBuildings.EC_SplitBuildByName)` |
| `areaTags` | `RunCustomizeApi(CustomAPI_TagControl.EC_ControlByTagType)` |
| `customFn(name)` | `RunCustomizeApi(CustomApi.<name>)` |
| `showEarthPoi` / `closeAllEarthPoi` | `RunCustomizeApi(CustomApi.Earth_POIState)` ×2 |
| `controlHeatMap` | `RunCustomizeApi(CustomApi.ControlHeatMap)` |
| `<实体>.onClick` / `<实体>.Update` / `<实体>.SetVisible` | POI 点击回调 / 覆盖物样式更新（如切换激活图标）/ 显隐 |

### 2.2 能力对照
| wdpapi 能力 | twinSDK 对应 | 复刻 | 说明 / 缺口 |
|---|---|---|---|
| 场景启动 `Renderer.Start` + `OnWdpSceneIsReady` | `createTwinApp` resolve | ✅ | 交付码替代 url+order |
| `OnEntityClicked` / `OnMouseEnterEntity` / `OnMouseOutEntity` | `viewer.events` `entity.click/mouseenter/mouseout` | ✅ | 已转发到 `emitter` |
| `OnWebJSEvent`（弹窗回传） | `postMessage` | ✅ | 已完成垫片 |
| POI 批量创建 `Scene.Create(Poi)` | `scene.create({type:"Poi"}, batch)` | ✅ | 图标 / label / visible2D 字段同名 |
| `Poi.onClick(cb)` | `entity.click` 事件按 eid 分发 | ◐ | 写法从"实体回调"改为"全局事件 + eid 映射" |
| `Poi.Update`（切换激活图标） | — | ❌ | **缺覆盖物样式在线更新**；只能删除重建 |
| Window（iframe 弹窗） | `Window` 覆盖物 | ✅ | `#/wdpWindow` 路由与 9 种弹窗类型可直接复用 |
| Range 多边形围栏 | `Range`（polygon2D / circlePolygon2D） | ✅ | 样式名基本一致（wave / grid / stripe …） |
| `Range.Update` / `Parabola.Update` | — | ❌ | 同上，缺 update；`setVisible` 可用 |
| Path / 批量 Path | `Path`（含 arrow / flash / pipe 等 17 种） | ✅ | |
| Parabola 抛物线 | `Parabola` | ✅ | |
| Text3D | `Text3D` | ✅ | |
| HeatMap（`new App.HeatMap`） | `HeatMap` | ✅ | |
| `Bound` 实体沿路径移动 | `motion.moveAlongPath` | ✅ | |
| Particle 粒子（车辆、人员等 UE 粒子资产） | — | ❌ | **缺粒子/特效资产**；可暂用 POI 或业务 glTF 模型 + `moveAlongPath` 替代 |
| Viewshed 可视域 | — | ❌ | 缺可视域分析 |
| 实体描边 / 高亮 | `setEntityOutline` / `setEntityHighlight` | ✅ | 颜色直接传 HEXA |
| `Setting.SetVisualColorStyle`（命名样式） | 直接传颜色 | ✅ | |
| `Setting.SetOutlineThickness` | — | ◐ | 描边粗细不可调 |
| `Scene.GetByEids / GetByCustomId / GetByTypes / GetObjectEid` | `scene.getByEids / getByCustomId / getByTypes` | ✅ | |
| 显隐 `SetVisible` / `SetVisibleByObjects` | `scene.setVisible` | ✅ | |
| `CameraControl.UpdateCamera`（位姿+限制+模式） | `camera.flyTo` + `camera.setLimits` + `camera.setMode` | ✅ | 拆成三步 |
| `CameraControl.FlyTo(target, pitch, yaw, distance)` | `camera.flyTo({position, target})` | ◐ | 需辅助函数由 target+pitch/yaw/distance 计算 position |
| `FocusByCustomId` / `Focus` | `camera.focus(getByCustomId(...))` | ◐ | 不支持指定 pitch/yaw/distanceFactor |
| `CameraControl.Follow` | `camera.follow` | ◐ | 不支持 followRotation / 第一人称跟随 |
| `CameraControl.Stop` | `camera.stop` / `camera.stopFollow` | ✅ | |
| `SetCameraLimit` / `GetCameraInfo` | `camera.setLimits` / `camera.getPose` | ✅ | |
| `Environment.SetSkylightTime` / `SetSceneWeather` | `environment.setSkylightTime` / `setSceneWeather` | ✅ | 实时天气（isRealWeather）❌ |
| `Tools.PickerPoint` | `tools.startPickPoint` / `endPickPoint` / `getPickedPoints` | ✅ | |
| **坐标体系**（经纬度 + 海拔） | 本地米制坐标，Y 轴向上 | ◐ | **所有业务点位、相机视角需在 twin 案例中重新采集**（头部「相机信息」按钮已输出 twin 位姿） |

### 2.3 UE 定制蓝图（Customize.RunCustomizeApi）
| 定制函数 | 用途 | 调用页面 | 复刻 | twinSDK 方案 / 缺口 |
|---|---|---|---|---|
| `EC_SplitBuildByName` | 建筑按楼层拆分 / 复原（进车间显示 1 层，离开复原 2 层） | 首页、各车间页、设备页、能源页 | ❌ | 缺**楼层拆分**：需按节点/楼层的批量显隐与位移（`scene.getNodes` 已有节点元数据，缺节点级显隐/变换接口） |
| `EC_ControlByTagType`（areaTags） | 按 Tag 批量显隐区域 Actor（LK_FX 等区域标签） | 综合态势、智能生产车间 | ◐ | 用 `customData.tag` + `scene.setVisible`；需在案例中给模型打标签 |
| `Earth_POIState` / `Earth_ShowState` / `Earth_CameraState` | 数字地球：城市 / 采煤机 POI、地球展开收起、地球视角 | 集团首页、产品管理 | ❌ | 缺 **GIS 数字地球**；可改为 2D 地图 / 独立地球组件 + 跳转工厂场景 |
| `Earth_ClickEvent` / `ClickEarthPOI` / `Earth_State`（UE→Web 事件） | 地球 POI 点击 → 收起地球 → 进入工厂；地球状态回写 | 场景层全局 | ❌ | 同上 |
| `ControlCMJ` / `ControlCMJCrystal` | 采煤机动画与场景切换 / 采煤机水晶特效 | 产品管理-设备 | ❌ | 动画可用 `animations.playClip`（需资产带动画）；水晶（透明发光材质）缺**材质特效** |
| `ControlJC` | 机床动画模式一/二播放与停止 | 设备管理-车间 / 设备 | ◐ | `animations.playClip`；**全局只能播一个片段**，多台机床同时运行需多实例动画 |
| `ControlJCLocation` / `ControlJCAxisPercent` | 机床部件 X/Y/Z 位移、按百分比驱动轴运动 | 设备管理-设备（设备控制面板） | ❌ | 缺**部件级变换**（节点已有 pivot / motionAxis 元数据，缺驱动接口） |
| `ControlCrystal` / `ControlHighLight` | 设备水晶特效、部件高亮 | 设备管理-设备 | ◐ | 部件高亮可用 `outline.set(id, [{entityId,nodeKey}])`；水晶特效 ❌ |
| `FocusToEntities` | 聚焦到指定部件 | 设备管理-设备（告警 / AI 推荐部件） | ✅ | `camera.focus({entityId, nodeKey})` |
| `ControlHeatMap` | 切换 UE 预烘焙的电力 / 碳排热力图 | 能源管理 | ◐ | 用 `HeatMap` 覆盖物 + 业务数据生成；无预制纹理 |
| `ControlAreaCrystal` | 仿真结果影响区域晶体高亮 | 能源管理 | ◐ | 用 `Range` / `HighlightArea` 替代 |
| `ZHAF_JQRXGGJ_HighlightRobot`（UE→Web 事件） | 机器人巡逻高亮回调 → 切换 Web 弹窗 | 场景层全局 | ❌ | 依赖 UE 机器人蓝图 |

---

## 3. 页面业务功能清单

> 统一交互模式（所有带左侧工具栏的页面）：
> **点击工具栏项** → `closeAll()`（清理上一个模式）→ 按 `toolId` 查 `toolHandlers` → `modeN_xxx(toolData)` → 复用模块：
> - `runPoiWindowModule` / `runPoiFocusWindowModule`：相机飞到区域 → 批量 POI → 点击 POI：删旧弹窗 → 描边关联模型 → 切换激活图标 → 飞到 POI → [可选] 区域围栏 → 信息弹窗(type7)；再次点击同一 POI 关闭
> - `runRangeWindowModule`：相机飞到区域 → 区域围栏 → 信息弹窗
> - `createPoiWindowPath`（`mixins/poi-window-path.js`）：巡检路线 POI + 路径 + 弹窗 + 巡检车沿路径移动 + 点击跟随
>
> **页面进入**：`isSceneAlready` watcher → `initAfterSceneReady`；**离开**：`beforeDestroy` 按类型清理覆盖物，车间页复原楼层拆分。

### 3.0 全局（框架层）
| # | 功能 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|
| G-1 | 场景启动与就绪 | 应用加载 | `new WdpApi` → `Renderer.Start` → `RegisterEvent(onVideoReady)` → `RegisterSceneEvent` → `OnWdpSceneIsReady(100%)` → `initSceneClose` | ✅ 已完成 | — |
| G-2 | 进入场景初始化 | 场景就绪 | `Scene.ClearByTypes` → `Environment.SetSkylightTime(10:00)` → `EC_SplitBuildByName(cj,2)` → `EC_SplitBuildByName(cc,2)` | ◐ 已完成清理 | 楼层拆分 ❌ |
| G-3 | 弹窗关闭 | 弹窗内关闭按钮 | `w51_event` → `OnWebJSEvent(closeThePage)` → `Scene.ClearByEids` | ✅ 已完成 | — |
| G-4 | 发电设施2 告警弹窗 | 点击场景实体 Eid=10081（仅发电设施2弹窗展开时） | `OnEntityClicked` → [已开]`Scene.ClearByEids` / [未开]`new App.Window` → `Scene.Add` | ✅ | 需在 twin 案例中确定对应实体 |
| G-5 | 地球 POI 进入工厂 / 采煤机 | 点击地球 POI | `Earth_ClickEvent` → `Earth_ShowState` → `Earth_State` 回调 → 路由跳转 | ❌ | 数字地球 |
| G-6 | 面板隐藏联动弹窗 | 头部"收起"按钮 | `Scene.GetByTypes(Window)` → `Scene.SetVisibleByObjects` | ✅ 已完成 | — |
| G-7 | 场景时间 / 天气 | 头部设置面板 `setUpSwitch` | `Environment.SetSkylightTime` / `Environment.SetSceneWeather` | ✅ | 实时天气 ❌ |
| G-8 | 测量取点 | 设置面板"测量"开关 | `PickerPoint.StartPickPoint` → `GetPickedPoints` → `EndPickPoint` | ✅ | — |
| G-9 | 相机信息 / 设置时间（调试工具） | 右侧调试按钮 | `CameraControl.GetCameraInfo` / `Environment.SetSkylightTime` | ✅ 已完成 | — |
| G-10 | 轨迹查看 | 表格行"轨迹"（`tableBase`） | `Scene.ClearByTypes` → `Scene.Create(Poi)` → `CustomApi.customStatus` ×2 | ◐ | 自定义状态蓝图 ❌ |

### 3.1 `/page_1/1` 集团-首页
| # | 功能 | 业务描述 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|---|
| 1-1 | 集团地球视图 | 数字地球上展示各城市工厂（广州/北京/上海） | 进入页面 / `beforeRouteEnter` | `Earth_POIState(采煤机隐藏)` → `Earth_POIState(城市显示)` | ❌ | 数字地球 |
| 1-2 | 地球展开 / 视角 | 展开地球并切到地球视角 | 进入页面、`earthState` 变化 | `Earth_ShowState` → `Earth_CameraState` | ❌ | 数字地球 |
| 1-3 | 城市 POI | 城市点位，点击进入工厂 | 进入页面 | `Scene.Create(Poi)` → `Poi.onClick` | ◐ | 可在工厂园区案例中用 POI 表示，不再依赖地球 |
| 1-4 | 离开清理 | — | `beforeDestroy` | `Scene.ClearByTypes` | ✅ | — |

> `wdpapi copy.js` 是未被引用的备份，额外包含 AI 机器人巡检、视频周界、安保人员、岗亭、闸机、热力图、视频弹窗、抛物线等示例（附录 B 已列出调用链）。

### 3.2 `/page_2/1` 工厂-综合态势（工具栏：人员 / 区域 / 环境 / 岗亭 / 摄像头 / 巡检 / 车间）
| # | 功能 | 业务描述 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|---|
| 2-1-0 | 进入初始化 | 厂区总览视角 | 场景就绪 | `CameraControl.UpdateCamera` | ✅ | 视角重采 |
| 2-1-1 | 人员 | 厂区人员点位，点击看人员信息并飞到该人 | 工具栏"人员" | `FlyTo` → `Scene.Create(Poi)` → `Poi.onClick` → `Scene.Delete(旧弹窗)` → `SetEntityOutline` → `FlyTo` → `Poi.Update(激活)` → `GetByEids` → `new Range`→`Scene.Add` → `new Window`→`Scene.Add` | ◐ | Poi.Update |
| 2-1-2 | 区域 | 显示管控区域并调整光照 | 工具栏"区域" | `EC_ControlByTagType` → `SetSkylightTime` → `FlyTo` | ◐ | Tag 显隐需案例打标签 |
| 2-1-3 | 环境 | 环境监测点位 + 信息弹窗 | 工具栏"环境" | 同 2-1-1 模块 | ◐ | Poi.Update |
| 2-1-4 | 岗亭 | 门岗点位 + 值守信息 | 工具栏"岗亭" | 同 2-1-1 模块 | ◐ | Poi.Update |
| 2-1-5 | 摄像头 | 监控点位，点击打开视频弹窗 | 工具栏"摄像头" | 同 2-1-1 模块（弹窗为视频类型） | ◐ | Poi.Update |
| 2-1-6 | 巡检 | 巡检车沿路线移动，点击后相机跟随 | 工具栏"巡检" | `createPoiWindowPath`：`FlyTo` → `Scene.Create(Poi)` → `Path`×2 → `SetVisible` → `Window` → `Scene.Create(Path)` → `new Bound`(沿路径移动) → `Poi.onClick` → `CameraControl.Follow`；取消：`CameraControl.Stop` → `FlyTo` | ◐ | 巡检车为粒子 ❌；移动用 `moveAlongPath` ✅ |
| 2-1-7 | 车间 | 进入车间子页 | 工具栏"车间" | 路由跳转 `/page_2/1-workshop` | ✅ | — |
| 2-1-8 | 关闭/离开 | 清理当前模式 | 切换工具 / 离开页面 | `SetEntityOutline(false)` → `CameraControl.Stop` → `EC_ControlByTagType` → `SetSkylightTime` → `Scene.Delete` → `Scene.ClearByTypes` → `UpdateCamera` | ◐ | Tag 显隐 |

### 3.3 `/page_2/1-workshop` 综合态势-车间（工具栏：人员 / 设备 / 环境 / 摄像头 / 工位）
| # | 功能 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|
| 进入 | 车间视角 + 拆楼显示 1 层 | 场景就绪 | `FlyTo` → `EC_SplitBuildByName` | ❌ | 楼层拆分 |
| 人员 / 设备 / 环境 / 摄像头 | 车间内点位 + 信息弹窗 | 工具栏 | `FlyTo` → `Scene.Create(Poi)` → `Poi.onClick` → `Scene.Delete` → `FlyTo` → `Poi.Update` → `Window` | ◐ | Poi.Update |
| 工位 | 工位区域 + 光照调整 | 工具栏"工位" | `FlyTo` → `EC_ControlByTagType` → `SetSkylightTime` | ◐ | Tag 显隐 |
| 离开 | 复原 | `beforeDestroy` | `EC_ControlByTagType` → `SetSkylightTime` → `Scene.ClearByTypes` → `EC_SplitBuildByName` | ❌ | 楼层拆分 |

### 3.4 `/page_2/2` 工厂-智能生产（工具栏：堆存区）与车间
| # | 功能 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|
| 2-2-0 | 进入 | 场景就绪 | `UpdateCamera` | ✅ | — |
| 2-2-1 | 堆存区 | 工具栏"堆存区" | `FlyTo` → `new Range`→`Scene.Add` → `new Window`→`Scene.Add` | ✅ | — |
| 2-2-W | 车间：设备 / 堆存区 / 质检区 | 车间工具栏 | 设备：POI+弹窗模块；堆存区/质检区：`runRangeWindowModule`（`FlyTo` → `Range` → `Window`） | ◐ / ✅ | Poi.Update |
| 2-2-W | 车间：工位 | 车间工具栏"工位" | `FlyTo` → `EC_ControlByTagType` → `SetSkylightTime` → `Scene.Create(Poi)` → `Poi.onClick` → `Scene.Delete` → `FlyTo` → `Poi.Update` → `Range` → `Window` | ◐ | Tag 显隐、Poi.Update |
| 2-2-D | 设备页离开 | `beforeRouteLeave` | `EC_SplitBuildByName` | ❌ | 楼层拆分 |

### 3.5 `/page_2/3` 工厂-智能仓储（工具栏：设备 / 货架 / 人员）
| # | 功能 | 业务描述 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|---|
| 2-3-0 | 仓储动态初始化 | AGV/叉车沿物流路线循环运输，货架 POI 与批量信息弹窗 | 进入页面 | `Scene.Create(Path)` → `SetVisible` → `Scene.Create(Path)` → `Scene.Create(Poi)` → `Scene.Create(Window×N)` → `Scene.Create(Path)` → `new Bound`×3(车辆沿路径) → `Poi.onClick` → `SetEntityOutline` → `CameraControl.Stop` → `FlyTo` → `CameraControl.Follow` | ◐ | 车辆为粒子 ❌；移动/跟随 ✅ |
| 2-3-1 | 设备 | 显示仓储设备及其路线 | 工具栏"设备" | `FlyTo` → `SetVisible`（显示预建的路径/POI/弹窗） | ✅ | — |
| 2-3-2 | 货架 / 人员 | 点位 + 描边 + 区域 + 弹窗 | 工具栏 | `FlyTo` → `Scene.Create(Poi)` → `Poi.onClick` → `Scene.Delete` → `SetEntityOutline` → `FlyTo` → `GetByEids` → `Range` → `Window` | ✅ | — |
| 2-3-9 | 关闭/离开 | — | 切换 / 离开 | `SetEntityOutline(false)` → `CameraControl.Stop` → `SetVisible(false)`×3 → `Scene.Delete` → `FlyTo`；离开再 `Scene.ClearByTypes` → `EC_SplitBuildByName` | ◐ | 楼层拆分 |

### 3.6 `/page_2/4` 工厂-产品管理 与 `/page_2/4-device`（工具栏：水晶体）
| # | 功能 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|
| 2-4-1 | 地球模式进入 | 路由进入（按来源决定策略） | `Earth_ShowState` → `Earth_State` 回调 → `Earth_CameraState` → `FlyTo` | ❌ | 数字地球 |
| 2-4-2 | 地球 POI 切换 | `earthState` 变化 | `Earth_POIState`（城市 / 采煤机） | ❌ | 数字地球 |
| 2-4-3 | 离开（挂起路由） | `beforeRouteLeave` | 挂起 `next` → `Earth_ShowState(false)` → 等待 `Earth_State=false` → 放行 | ❌（已改为直接放行） | 数字地球 |
| 2-4-4 | 采煤机设备视图 | 点击采煤机 POI / "煤矿01" | `ControlCMJ` → 路由 `/page_2/4-device` → `Earth_POIState(全部关闭)` | ❌ | 设备动画 + 地球 |
| 2-4-5 | 水晶体 | 工具栏"水晶体" | `ControlCMJCrystal` | ❌ | 材质特效 |
| 2-4-6 | 设备页离开 | `beforeRouteLeave` | `ControlCMJCrystal(false)` → `FlyTo(地球高空)` → `Earth_POIState` → `Earth_ShowState` | ❌ | 数字地球 |

### 3.7 `/page_2/5` 工厂-设备管理 及车间 / 设备
| # | 功能 | 业务描述 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|---|
| 2-5-1 | 设备点位与详情 | 车间级设备 POI，点击描边 + 弹窗 | 进入页面 | `Scene.Create(Poi)` → `Poi.onClick` → `Scene.Delete` → `SetEntityOutline` → `UpdateCamera` → `Poi.Update` → `FlyTo` → `GetByEids` → `Window` | ◐ | Poi.Update |
| 2-5-W1 | 车间进入 | 拆楼 + 机床动画 | 场景就绪 | `FlyTo` → `EC_SplitBuildByName` → `ControlJC` | ❌ / ◐ | 楼层拆分、多机床动画 |
| 2-5-W2 | 车间设备点位 | — | 进入 | `Scene.Create(Poi)` → `Poi.onClick` → `FlyTo` → `Scene.Delete` | ✅ | — |
| 2-5-D1 | 机床动画模式 | 设备控制面板"模式一/二 确认/停止" | `device-control.vue` | `ControlJC` | ◐ | 多实例动画 |
| 2-5-D2 | 机床部件位移 | 输入 X/Y/Z 确认 / 复位 | 设备控制面板 | `ControlJCLocation` | ❌ | 部件级变换 |
| 2-5-D3 | 轴百分比控制 | 轴参数面板 | 设备控制面板 | `ControlJCAxisPercent` | ❌ | 部件级变换 |
| 2-5-D4 | 部件高亮 / 水晶 | 选择部件 | 面板 | `ControlHighLight` / `ControlCrystal` | ◐ / ❌ | 水晶材质 |
| 2-5-D5 | 告警 / AI 推荐部件聚焦 | 点击告警行；AI 助手 `select-part` | 表格 / AiAssistantPanel | `FocusToEntities` → `FocusByCustomId` | ✅ | — |
| 2-5-D9 | 离开 | `beforeRouteLeave` | `ControlJC(false)` → `EC_SplitBuildByName` → `Scene.ClearByTypes` | ◐ | 楼层拆分 |

> 设备页原有 AI 助手（`AiAssistantPanel` + Lighthouse SSE `/api/v1/agent/sse/stream`）保持不变；它推荐的部件经 `select-part` 事件触发 2-5-D5 聚焦，该聚焦在 twinSDK 中可直接用 `camera.focus({entityId, nodeKey})` 实现。

### 3.8 `/page_2/6` 工厂-能源管理（工具栏：空压 / 光伏 / 变电 / 发电 / 储能；电力 / 碳排）
| # | 功能 | 业务描述 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|---|
| 2-6-0 | 初始化 | 能源总览视角 + 描边样式 + 方案覆盖物 | 场景就绪 | `UpdateCamera` → `Setting.SetVisualColorStyle` → `Setting.SetOutlineThickness` → `ensureSceneCoverings` | ◐ | 描边粗细 |
| 2-6-1 | 能源设施定位 | 空压 / 光伏 / 变电 / 发电飞到设施；储能聚焦实体 | 左下工具栏 | `FlyTo`；储能：`GetByEids` → `CameraControl.Focus` | ✅ | — |
| 2-6-2 | 设施 POI 与数据弹窗 | 点击设施 POI：描边关联模型 + 能源数据弹窗 | 点击 POI / 损失与风险列表项 | `Scene.ClearByEids` → `Scene.Delete` → `FlyTo` → `Scene.Create(Poi)` → `Poi.onClick` → `SetEntityOutline` → `FlyTo` → `Poi.Update` → `GetByEids` → `Range` → `Window` | ◐ | Poi.Update |
| 2-6-3 | 空压 / 发电拆楼 | 打开设施时拆楼看内部 | 工具栏 | `FlyTo` → `Scene.Create(Poi)` → `EC_SplitBuildByName` → `Scene.Delete` | ❌ | 楼层拆分 |
| 2-6-4 | 电力 / 碳排热力 | 厂区空间分布热力 | 工具栏"电力/碳排" | `ControlHeatMap` | ◐ | 改用 HeatMap 覆盖物 |
| 2-6-5 | 方案能流与区域围栏 | 方案 / 验策参数变化 → 购电·光伏·储能·空压·柴发能流抛物线 + 影响区域围栏 | 方案卡片、验策表单 | `[已有]Range.Update`→`Range.SetVisible` / `[无]new Range`→`Scene.Add`；`[已有]Parabola.Update`→`SetVisible` / `[无]new Parabola`→`Scene.Add` | ◐ | Range/Parabola **update** ❌ |
| 2-6-6 | 仿真结果影响 | 仿真 SSE 返回后，目标区域按结果着色 + 晶体高亮 | "运行仿真"（开启"呈现配置影响"） | `ControlAreaCrystal` → `new Range` → `Scene.Add`；撤销 `Scene.Delete` | ◐ | 晶体特效 |
| 2-6-7 | 选中 POI 联动 | 列表选中设施 | 列表 | `Poi.Update`×2（切换激活/常态图标） | ❌ | Poi.Update |
| 2-6-9 | 离开 | — | `beforeDestroy` | `SetEntityOutline(false)` → `Scene.ClearByTypes` → 清 Range/Parabola 缓存 | ✅ | — |
| 2-6-W | `/page_2/6w` 能力模块 | 切换能力模块：高亮实体 + 区域 + 能流 + 热力 | 能力模块下拉 | `FlyTo` → `GetByEids` → `Scene.SetEntityHighlight` → `Range` → `Parabola` → `ControlHeatMap` | ◐ | 热力预制 |
| 2-6-WS | `/page_2/6-workshop` 配电柜 | 配电柜 POI + 描边 + 数据弹窗 | 工具栏"配电柜" | POI+弹窗模块（含 `SetEntityOutline`） | ◐ | Poi.Update |

> 能碳助手（`CarbonAssistant`）、AI 建议卡片、`qaKnowledge` 本地知识库不直接调用 wdpapi，通过修改方案 / 验策参数间接触发 2-6-5、2-6-6，迁移后保持不变。

### 3.9 `/page_2/7` 工厂-环境管理（工具栏：环境传感器）及车间（噪声 / 环境传感器）
| # | 功能 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|
| 2-7-1 | 环境传感器点位 + 弹窗 | 工具栏 | `FlyTo` → `Scene.Create(Poi)` → `Poi.onClick` → `Scene.Delete` → `FlyTo` → `Poi.Update` → `Window` | ◐ | Poi.Update |
| 2-7-2 | 车间入口 | 点击"生产车间"POI | `Scene.Create(Poi)` → `Poi.onClick` → `FlyTo` → 路由 `/page_2/7-workshop` | ✅ | — |
| 2-7-W1 | 噪声热力 | 车间工具栏"噪声" | `FlyTo` → `Scene.GetByCustomId`（去重） → `new App.HeatMap` → `Scene.Add` | ✅ | — |
| 2-7-W9 | 车间进入/离开 | — | `FlyTo` → `EC_SplitBuildByName`；离开 `Scene.ClearByTypes` → `EC_SplitBuildByName` | ❌ | 楼层拆分 |

### 3.10 `/page_2/8` 工厂-应急安防（工具栏：风险点位 / 摄像头 / 岗亭 / 巡检）及车间（风险点位 / 摄像头）
| # | 功能 | 业务描述 | 触发 | wdpapi 执行顺序 | 复刻 | 缺口 |
|---|---|---|---|---|---|---|
| 2-8-1 | 风险点位 / 摄像头 / 岗亭 | 点位（可带粒子特效）+ 描边 + 信息/视频弹窗 | 工具栏 | `FlyTo` → `[可选]Particle` → `Scene.Create(Poi)` → `Poi.onClick` → `Scene.Delete` → `SetEntityOutline` → `FlyTo` → `Poi.Update` → `GetByEids` → `Window` | ◐ | 粒子、Poi.Update |
| 2-8-2 | 巡检 | 巡逻人员/车辆沿路线，点击后描边 + 跟随 | 工具栏"巡检" | `createPoiWindowPath` → `onActivate`：`SetEntityOutline` → `CameraControl.Follow`；`onDeactivate`：`SetEntityOutline(false)` → `CameraControl.Stop` → `FlyTo` | ◐ | 粒子 |
| 2-8-9 | 关闭/离开 | — | `SetEntityOutline(false)` → `CameraControl.Stop` → `Scene.Delete` → `UpdateCamera`；车间另加 `EC_SplitBuildByName` | ◐ | 楼层拆分 |

### 3.11 弹窗页面 `#/wdpWindow`（Window 覆盖物的 iframe 内容，可直接复用）
| 类型 | 用途 | 回传 |
|---|---|---|
| type1 | RTSP / FLV 视频播放 | — |
| type2 | 视频 + 指标图表；"查看视频 / 轨迹 / 设备" | `w51_event`（showTheVedio / showThePath / showTheDevice） |
| type3–type6 | 多媒体 / 多站点信息 / 图片卡片 / 雷达图 | — |
| type7 | 通用信息列表（infoList），可"上报" | `w51_event` |
| webType1/2 | 内嵌网页 | — |
| 公共 | 关闭按钮 | `w51_event(closeThePage)` → 已桥接 `postMessage` → 场景层删除弹窗 |

---

## 4. 需要 twinSDK 补充的能力（按影响面排序）

| 优先级 | 能力 | 影响的原功能 | 说明 |
|---|---|---|---|
| P0 | **覆盖物在线更新** `update(entity, patch)`（POI 图标/label、Range、Parabola、Path 样式） | 所有 POI 激活态切换（约 20 处 `Poi.Update`）、能源方案能流与围栏（2-6-5） | 现在只能删除重建，会丢事件绑定并闪烁 |
| P0 | **工厂案例与坐标** | 全部点位 / 视角 | 需把工厂模型发布为 twin 案例，所有经纬度点位、相机视角在本地坐标系重采（属平台 / 交付工作，不是 SDK 接口） |
| P1 | **楼层拆分 / 节点级显隐与变换** | 首页、所有车间与设备页、能源拆楼（约 15 处 `EC_SplitBuildByName`） | 节点元数据已有（`getNodes`），缺 `scene.setNodeVisible` / `setNodeTransform` 或"按楼层拆分"高阶接口 |
| P1 | **部件级运动驱动**（按 nodeKey + pivot/motionAxis 平移/旋转/百分比） | 机床位移、轴控制（2-5-D2/D3） | |
| P1 | **多实例动画** | 机床动画（ControlJC）、采煤机动画 | 当前 `animations` 全局只能播一个片段 |
| P1 | **粒子 / 动态模型资产**（车辆、人员、告警特效） | 巡检、仓储 AGV、风险点位特效 | 可先用业务 glTF 模型 + `moveAlongPath` 过渡 |
| P2 | `camera.flyTo` 支持 target + pitch/yaw/distance 入参；`focus` 支持视角与距离系数；`follow` 支持跟随角度 / 第一人称 | 全部 `FocusByPoints`、`FocusByCustomId`、`Follow` | 业务侧可先写换算函数 |
| P2 | 材质特效（水晶 / 半透明发光） | 水晶体、区域晶体高亮 | |
| P2 | 描边粗细、命名样式 | 能源页描边样式 | |
| P2 | 可视域分析 Viewshed | 备份代码中的可视域 | 当前路由未使用 |
| P3 | 数字地球 / GIS | 集团首页、产品管理地球 | 建议业务改为 2D 地图组件 + 进入工厂案例，而不是在 twinSDK 内做地球 |
| P3 | 实时天气 | 设置面板"实时天气" | |

---

## 5. 建议的实现顺序
1. 发布工厂案例，在案例中给模型设置 `businessId` 与 `customData.tag`（区域、楼层、设备类别）；用头部"相机信息"重采各页视角。
2. 在 `utils/twin` 中实现与原封装同名语义的业务函数（`addPOI`、`addWINDOWS`、`addRange`、`FocusByPoints` 等），坐标与视角改为 twin 本地坐标。
3. 先实现通用模块 `runPoiWindowModule` / `runRangeWindowModule` / `createPoiWindowPath`，这三个模块覆盖 8 个页面的大部分工具栏功能（POI 激活态先用"删除重建"，等 SDK 提供 update 后替换）。
4. 再按 SDK 能力补齐楼层拆分、部件运动、多实例动画相关页面。
5. 地球相关（集团首页 / 产品管理）按业务决定替代方案。

---

## 附录 A：迁移涉及的文件
- 新增：`src/utils/twin/*`、`src/utils/agent/*`、`src/utils/statusEnum.js`、`src/utils/eventBus.js`、`src/components/agentChat.vue`、`scripts/strip-wdpapi.js`、`.npmrc`
- 重写：`src/layout/scene.vue`、`public/config.json`
- 手工移植：`src/layout/header.vue`、`src/views/index.vue`、`src/store/index.js`、`src/main.js`、`src/mixins/toolCleanupMixin.js`、`vue.config.js`
- 删除：`src/utils/wdpapi/`
- 工具剔除（保留 UI 逻辑）：29 个业务文件（见附录 B）

## 附录 B：方法级原调用链（自动汇总自代码注释）

#### `components/table/tableBase.vue`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 248 | `handleTrackClick` | deleteTypes → addPOI → customStatus → customStatus |

#### `components/setUpSwitch.vue`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 105 | `changeTime` | setSceneTime |
| 112 | `selectTime` | setSceneTime |
| 117 | `syncWeather` | setSceneWeather |
| 123 | `selectWeather` | setSceneWeather |
| 129 | `toggleMeasureMode` | pickPoint → getPoints → pickPoint |

#### `components/splitBuilding.vue`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 154 | `getCaerma` | getCameraInfo |

#### `layout/header.vue`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 201 | `（行内）` | 切到集团首页（id=1）时 addPOI（原代码未传参，实际不生效） |

#### `mixins/poi-window-path.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 47 | `createPoiWindowPath` | FocusByPoints → addPOI → addPath → addPath → <实体>.SetVisible → addWINDOWS → addEntities → coveringMove → <实体>.onClick → <实体>.SetVisible → <实体>.Update → addPath → <实体>.SetVisible |

#### `mixins/toolCleanupMixin.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 55 | `initSceneClose` | deleteTypes → setSceneTime → splitBuildByName → splitBuildByName |
| 61 | `normalPoi` | addPOI → <实体>.onClick → FocusByPoints |

#### `views/page_1/page_1_1/mixins/wdpapi copy.js`（备份文件，未被路由使用）
| 行 | 方法 | 原调用链 |
|---|---|---|
| 301 | `closeAll` | customStatus → customStatus → aiBotRoute → spawnEffect → aiBotRoute → splitBuildByName → cameraFOV |
| 351 | `aiBot` | addPOI → <实体>.onClick → deleteObjs → customStatus → aiBotRoute → FocusByPoints → customStatus |
| 363 | `poiAndRange` | addPOI → <实体>.onClick → FocusByPoints → cameraFOV → addWINDOWS → addRange |
| 373 | `videoPerimeter` | FocusByPoints → customStatus |
| 390 | `securityPersonnel` | addPOI → FocusByCustomId → FocusByPoints → <实体>.onClick → FocusByPoints → addWINDOWS |
| 404 | `securityBooth` | addPOI → FocusByCustomId → FocusByPoints → customStatus → <实体>.onClick → addWINDOWS |
| 418 | `personGate` | addPOI → FocusByPoints → <实体>.onClick → FocusByPoints → addWINDOWS |
| 426 | `heatMap` | FocusByPoints → splitBuildByName → customStatus |
| 437 | `footerVideo` | addPOI → spawnEffect → FocusByPoints → customStatus → addWINDOWS → <实体>.onClick |
| 463 | `footerAI` | aiBotRoute → customStatus |
| 479 | `handleParabola` | addParabola → FocusByPoints |
| 484 | `customPOI` | addPOI → <实体>.onClick → FocusByPoints |

#### `views/page_1/page_1_1/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 60 | `earthState` | showEarthPoi |
| 66 | `beforeRouteEnter` | showEarthPoi |
| 91 | `initAfterSceneReady` | showEarthPoi |
| 104 | `enterEarth` | customFn |
| 108 | `controlEarthCamera` | customFn |
| 113 | `addCityPOI` | addPOI → <实体>.onClick |
| 123 | `beforeDestroy` | deleteTypes |

#### `views/page_2/page_2_1/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 478 | `initAfterSceneReady` | resetCamera |
| 487 | `closeAll` | setEntityOutline → App.CameraControl.Stop → setEntityOutline → areaTags → setSceneTime → deleteObjs → deleteTypes → resetCamera |
| 545 | `onActivate` | followEntity → followEntity |
| 548 | `onDeactivate` | App.CameraControl.Stop → FocusByPoints |
| 559 | `runPoiFocusWindowModule` | FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addRange → addWINDOWS |
| 580 | `mode2_area` | areaTags → setSceneTime → FocusByPoints |
| 683 | `onActivate` | setEntityOutline → followEntity |
| 690 | `onDeactivate` | setEntityOutline → App.CameraControl.Stop → FocusByPoints |
| 708 | `beforeDestroy` | setEntityOutline → areaTags → setSceneTime → deleteTypes |

#### `views/page_2/page_2_1_workshop/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 359 | `initAfterSceneReady` | FocusByPoints → splitBuildByName |
| 369 | `closeAll` | areaTags → setSceneTime → deleteObjs → FocusByPoints |
| 381 | `runPoiFocusWindowModule` | FocusByPoints → addPOI → <实体>.onClick → deleteObjs → FocusByPoints → <实体>.Update → addWINDOWS |
| 413 | `mode5_workstation` | FocusByPoints → areaTags → setSceneTime |
| 424 | `beforeDestroy` | areaTags → setSceneTime → deleteTypes → splitBuildByName |

#### `views/page_2/page_2_2/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 92 | `closeAll` | deleteObjs → resetCamera |
| 101 | `mode1_storage` | FocusByPoints → addRange → addWINDOWS |
| 148 | `initAfterSceneReady` | resetCamera |
| 163 | `beforeDestroy` | deleteTypes |

#### `views/page_2/page_2_2_device/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 54 | `beforeRouteLeave` | splitBuildByName |
| 67 | `beforeDestroy` | deleteTypes |

#### `views/page_2/page_2_2_workshop/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 266 | `closeAll` | areaTags → setSceneTime → deleteObjs → FocusByPoints |
| 278 | `runPoiWindowModule` | FocusByPoints → addPOI → <实体>.onClick → deleteObjs → FocusByPoints → addWINDOWS |
| 296 | `runRangeWindowModule` | FocusByPoints → addRange → addWINDOWS |
| 309 | `mode2_station` | FocusByPoints → areaTags → setSceneTime → addPOI → <实体>.onClick → deleteObjs → areaTags → setSceneTime → FocusByPoints → <实体>.Update → addRange → addWINDOWS |
| 339 | `initAfterSceneReady` | FocusByPoints → splitBuildByName |
| 354 | `beforeDestroy` | areaTags → setSceneTime → deleteTypes → splitBuildByName |

#### `views/page_2/page_2_3/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 474 | `closeAll` | setEntityOutline → setEntityOutline → App.CameraControl.Stop → <实体>.SetVisible → <实体>.SetVisible → <实体>.SetVisible → deleteObjs → FocusByPoints |
| 499 | `runPoiWindowModule` | FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → getByEids → addRange → addWINDOWS |
| 520 | `mode1_device` | FocusByPoints → <实体>.SetVisible → <实体>.SetVisible |
| 535 | `initDeviceData` | addEntities → <实体>.SetVisible → addEntities → <实体>.SetVisible → addPOI → <实体>.SetVisible → addWINDOWSBatch → <实体>.SetVisible → addEntities → coveringMove → coveringMove → coveringMove → <实体>.onClick → <实体>.SetVisible → setEntityOutline → App.CameraControl.Stop → FocusByPoints → followEntity |
| 617 | `initAfterSceneReady` | FocusByPoints → splitBuildByName |
| 635 | `beforeDestroy` | setEntityOutline → deleteTypes → splitBuildByName |

#### `views/page_2/page_2_4/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 47 | `earthState` | showEarthPoi |
| 84 | `initAfterSceneReady` | FocusByPoints |
| 100 | `enterEarth` | customFn |
| 104 | `controlEarthCamera` | customFn |
| 157 | `beforeDestroy` | deleteTypes |

#### `views/page_2/page_2_4_device/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 71 | `initAfterSceneReady` | closeAllEarthPoi |
| 79 | `enterEarth` | customFn |
| 83 | `cmjCrystal` | customFn |
| 89 | `beforeRouteLeave` | FocusByPoints → showEarthPoi |
| 115 | `beforeDestroy` | showEarthPoi → deleteTypes |

#### `views/page_2/page_2_5/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 81 | `closeAll` | deleteObjs → resetCamera → setEntityOutline |
| 93 | `runPoiWindowModule` | addPOI → <实体>.onClick → deleteObjs → setEntityOutline → resetCamera → <实体>.Update → FocusByPoints → getByEids → addWINDOWS |
| 108 | `initAfterSceneReady` | resetCamera |
| 125 | `beforeDestroy` | setEntityOutline → deleteTypes |

#### `views/page_2/page_2_5_device/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 44 | `initAfterSceneReady` | splitBuildByName |
| 63 | `controlJC` | customFn |
| 77 | `controlJCLocation` | customFn |
| 86 | `controlHighLight` | customFn |
| 94 | `controlCrystal` | customFn |
| 105 | `focusToEntities` | App.Customize.RunCustomizeApi |
| 118 | `controlJCAxisPercent` | customFn |
| 125 | `beforeRouteLeave` | splitBuildByName |
| 143 | `beforeDestroy` | deleteTypes |

#### `views/page_2/page_2_5_workshop/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 79 | `closeAll` | deleteObjs → FocusByPoints |
| 88 | `runPoiWindowModule` | addPOI → <实体>.onClick → FocusByPoints → deleteObjs |
| 97 | `initAfterSceneReady` | FocusByPoints → splitBuildByName → customFn |
| 114 | `beforeDestroy` | deleteTypes → splitBuildByName → customFn |

#### `views/page_2/page_2_6/mixins/wdpapi-bak.js`（备份文件，未被路由使用）
| 行 | 方法 | 原调用链 |
|---|---|---|
| 275 | `closeAll` | deleteObjs → resetCamera → setEntityOutline |
| 289 | `runPoiWindowModule` | FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addRange → addWINDOWS |
| 362 | `initAfterSceneReady` | resetCamera |
| 376 | `beforeDestroy` | setEntityOutline → deleteTypes |

#### `views/page_2/page_2_6/mixins/wdpapi-w.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 170 | `closeAllW` | deleteObjs → resetCamera → setEntityOutline |
| 184 | `clearModuleSceneW` | setEntitiesHighlight → deleteObjs → controlHeatMap |
| 201 | `applyModuleSceneW` | FocusByPoints → getByEids → setEntitiesHighlight → addRange → addParabola → controlHeatMap → setEntitiesHighlight → deleteObjs → controlHeatMap |
| 254 | `runPoiWindowModuleW` | FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addRange → addWINDOWS |
| 280 | `initAfterSceneReadyW` | resetCamera |
| 297 | `beforeDestroy` | setEntityOutline → deleteTypes |

#### `views/page_2/page_2_6/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 136 | `controlAreaCrystal` | customFn |
| 146 | `controlHeatMap` | customFn |
| 156 | `focusEnergyCamera` | FocusByPoints → getByEids → App.CameraControl.Focus |
| 194 | `setupSceneOutlineStyles` | setVisualColorStyle → setOutlineThickness |
| 235 | `updateScenePoiColor` | getPolygonRangeEntity → updatePolygonRange |
| 283 | `addSimFence` | addRange |
| 302 | `removeSimFence` | deleteObjs |
| 333 | `ensureSceneCoverings` | getPolygonRangeEntity → updatePolygonRange → setPolygonRangeVisible → addPolygonRange → getParabolaEntity → updateCoveringParabola → setParabolaVisible → addCoveringParabola |
| 387 | `applySceneCoverings` | setParabolaVisible → setParabolaVisible |
| 524 | `closeAll` | ClearByEids → deleteObjs → splitBuildByName → deleteTypes → resetCamera → setEntityOutline |
| 558 | `runPoiWindowModule` | ClearByEids → deleteObjs → FocusByPoints → addPOI → ClearByEids → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addRange → addWINDOWS → <实体>.onClick |
| 602 | `runSplitBuildModule` | ClearByEids → deleteObjs → FocusByPoints → addPOI → FocusByPoints → splitBuildByName → deleteObjs → <实体>.onClick |
| 636 | `selectPoiByApiId` | <实体>.Update → <实体>.Update |
| 712 | `initAfterSceneReady` | resetCamera |
| 728 | `beforeDestroy` | setEntityOutline → deleteTypes → clearPolygonRangeCache → clearParabolaCache |

#### `views/page_2/page_2_6_bak/mixins/wdpapi.js`（备份文件，未被路由使用）
| 行 | 方法 | 原调用链 |
|---|---|---|
| 163 | `closeAll` | deleteObjs → resetCamera → setEntityOutline |
| 176 | `runPoiWindowModule` | FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addRange → addWINDOWS |
| 202 | `initAfterSceneReady` | resetCamera |
| 217 | `beforeDestroy` | setEntityOutline → deleteTypes |

#### `views/page_2/page_2_6_workshop/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 96 | `closeAll` | deleteObjs → FocusByPoints → setEntityOutline |
| 105 | `runPoiWindowModule` | FocusByPoints → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addWINDOWS |
| 124 | `initAfterSceneReady` | FocusByPoints → splitBuildByName |
| 140 | `beforeDestroy` | setEntityOutline → deleteTypes → splitBuildByName |

#### `views/page_2/page_2_7/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 97 | `closeAll` | deleteObjs → resetCamera |
| 106 | `runPoiWindowModule` | FocusByPoints → addPOI → <实体>.onClick → deleteObjs → FocusByPoints → <实体>.Update → addWINDOWS |
| 125 | `initAfterSceneReady` | resetCamera |
| 140 | `beforeDestroy` | deleteTypes |

#### `views/page_2/page_2_7_workshop/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 174 | `closeAll` | deleteObjs → FocusByPoints |
| 182 | `runPoiWindowModule` | FocusByPoints → addPOI → <实体>.onClick → deleteObjs → FocusByPoints → <实体>.Update → addWINDOWS |
| 197 | `mode1_noise` | FocusByPoints → App.Scene.GetByCustomId → new App.HeatMap → App.Scene.Add |
| 214 | `initAfterSceneReady` | FocusByPoints → splitBuildByName |
| 230 | `beforeDestroy` | deleteTypes → splitBuildByName |

#### `views/page_2/page_2_8/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 252 | `closeAll` | setEntityOutline → setEntityOutline → App.CameraControl.Stop → deleteObjs → resetCamera |
| 268 | `runPoiFocusWindowModule` | FocusByPoints → addParticle → addPOI → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addWINDOWS |
| 348 | `onActivate` | setEntityOutline → followEntity |
| 355 | `onDeactivate` | setEntityOutline → App.CameraControl.Stop → FocusByPoints |
| 368 | `initAfterSceneReady` | resetCamera |
| 383 | `beforeDestroy` | setEntityOutline → deleteTypes |

#### `views/page_2/page_2_8_workshop/mixins/wdpapi.js`
| 行 | 方法 | 原调用链 |
|---|---|---|
| 196 | `closeAll` | deleteObjs → FocusByPoints → setEntityOutline |
| 207 | `runPoiFocusWindowModule` | FocusByPoints → addPOI → addParticle → <实体>.onClick → deleteObjs → setEntityOutline → FocusByPoints → <实体>.Update → getByEids → addWINDOWS |
| 235 | `initAfterSceneReady` | FocusByPoints → splitBuildByName |
| 251 | `beforeDestroy` | setEntityOutline → deleteTypes → splitBuildByName |
