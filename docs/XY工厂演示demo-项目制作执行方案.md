# XY工厂演示demo 项目制作执行方案

> 本文是 2026-11-17 制定的研发基线。2026-11-20 已收到首批工作台、两份建筑 GLB 和一份点位 GLB。[首批交付包评估与接入方案](XY工厂-首批交付包评估与接入方案.md)记录了组合实景、实际导入阻塞、需求覆盖和下一步分工。本文保留工程边界与通用交接清单；涉及“尚未交付”的判断以新评估为准。

## 结论与原则

XY 案例独立于灯塔工厂 · 精密零部件智能加工车间开发，入口采用独立路由和独立案例目录，继续使用本项目现有 Vue2 + `@twin/web-sdk` 交付端。复用全局壳层、SDK 标准能力和业务面板交互模式；设备数据、告警数据、设备/构件映射、视角、坐标、场景锚点和案例专属动画全部由 XY 自己提供。

灯塔的产线仿真运行、生产溯源，以及任何依赖灯塔产线脚本的生产链路/历史产线回放/布局规划，不纳入 XY 首期。场景包已经预置的运动由场景自身负责；交付端只在明确需要用户控制时，通过 SDK 动画接口或 XY 专属 custom API 暴露播放、暂停、停止等控制。

首批实物已确认是原始 GLB 加场景侧工作台，最终平台交付格式仍需确认。先拿一份平台兼容的真实小样走完导入和发布，再固化 XY 接入。若 DSL 合同变化，兼容工作留在导入/适配边界；业务组件只消费稳定的 XY 业务 DTO 和场景适配能力，不直接读取不同版本的 DSL 原文。

## 现有工程基线

### 应用与场景生命周期

- `src/views/index.vue` 是应用级壳层，挂载 Header、全局路由视图、一个 `Scene` 和场景 Agent。应用当前只有一个常驻 WebGL 场景宿主。
- `src/layout/scene.vue` 读取 `public/config.json`（部分连接参数允许路由 query 覆盖），调用 `createTwinApp`；成功后通过 `setTwinApp` 发布实例、转发 viewer 事件、等待场景初始化完成并设置 `isSceneAlready`。失败提供重试；卸载时 abort 请求、解除事件并 `dispose()`。
- `src/utils/twin/app.js` 将 TwinApp/viewer 保存在模块级变量中。实例不可放 Vuex，因为 Vue 2 深度响应式处理 Three.js 场景对象会造成严重性能问题；Vuex 只保留就绪等轻量状态。
- 页面沿用“场景就绪后初始化、退出时清理覆盖物/事件/相机行为”的生命周期。XY 应复用该宿主和流程，不在案例页面再创建 renderer 或绕开交付码直接加载模型。

### SDK 与案例代码边界

- 标准场景能力走 `src/utils/twin/*`：场景实体查询、POI / Window、显隐、高亮、相机、环境、测量、Path / HeatMap 等；SDK 事件由场景宿主转发到 `src/utils/eventBus.js`。
- 灯塔 `src/views/page_2/page_2_2/lighthouse/twin.js` 同样区分标准 viewer 能力与 `customApi.call(name, params)` 案例专属能力。custom API 随发布案例版本交付，不能假定 XY 包实现了同名方法或同一套参数。
- `src/views/page_2/page_2_2/index.vue` 集中了灯塔页面 UI、数据编排、场景联动和大量灯塔常量；`lighthouse/live.js` 为设备状态、告警和两小时历史生成模拟数据。整页复制会连带灯塔的 ID、坐标、业务假设和不需要的生产仿真，XY 应建立自己的页面和适配层。
- 灯塔设备详情的 `src/views/page_2/page_2_5_device/api/lighthouse.js` 和 SSE 助手依赖精密机床设备 ID、主轴/轴位置/RUL 等上下文。可参考流式 UI 和错误处理，不可默认复用其接口地址、参数或诊断语义。

### 路由与导航

- 当前默认入口是 `/page_2/2`。现有业务导航数据在 `src/layout/footer.vue`；该组件由 `src/views/page_2/index.vue` 渲染。`src/layout/header.vue` 主要负责全局工具、告警/面板控制和页面标题，不是案例路由表。
- `/page_2` 容器的返回行为和 Header 标题判断都按上海工厂页面编写。XY 不应伪装成灯塔的某个 `/page_2/N` 子业务页。
- 建议增加根级 `/xy-factory` 路由，并把案例切换入口提升/抽到应用级壳层，使灯塔与 XY 两个路由都能切换案例。灯塔原菜单默认项和 `/page_2/2` 不变；不要在 XY 路由里重复挂载第二个 `Scene`。

### 业务面板的复用尺度

可以复用或抽成无场景知识的 UI/逻辑：告警列表筛选与详情、告警处置表单样式、设备分组/详情布局、状态 KPI 展示、图表/表格/通用面板、通用事件清理模式，以及 AI 对话组件的流式渲染部分。复用时通过 XY 数据接口和 XY 场景适配层驱动。

需要重做或参数化：设备目录与 `businessId` / `entityId` / `nodeKey` 映射、设备选中后的定位、camera bookmarks、相机范围、能耗计量点及热力范围、安全设施/疏散路线、巡检站点、AI 业务上下文、告警与工况的数据来源。灯塔的 `TOUR`、`EVAC_ROUTES`、工作区尺寸和相机坐标不能直接带到 XY。

明确不迁移：产线持续运行/模拟异常注入、灯塔生产链演示、生产溯源、历史产线回放、库存/作业布局等产线专属或基于灯塔 custom API 的流程。若 XY 后续有同名业务需求，按 XY 数据合同另行设计，不因灯塔已有页面就默认带入。

## 场景与资产交接

首批园区素材已盘点；接下来请场景侧给一份保留本园区原坐标的兼容建筑小样，再补一台代表性设备、一个视点及其生成/发布方式，分别验证静态园区与设备动作。两条链路可独立验收。

### 必须随包确认的内容

| 类别 | 交接内容 | 用途 / 缺失处理 |
|---|---|---|
| 包与版本 | 包目录树、场景/包版本、生成工具与版本、交付日期、文件清单、大小、SHA-256、完整包 hash；若由平台发布，附场景 ID、发布 revision、delivery code 的安全交付渠道 | 能复现并确定加载的是哪一版；清单/hash 不匹配不得发布 |
| 模型与纹理 | 模型源文件、目标运行格式、完整贴图/材质依赖、外链资源清单、模型数量与大小、授权/使用范围 | 当前 Twin 平台材料显示 GLB/FBX 导入路径，但交付端消费的是平台发布版；具体格式、容量和转换支持以目标环境实测为准，不据此承诺其他格式 |
| 坐标与尺寸 | 单位、向上轴、左右手系、原点/基准点、场景变换、已知设备/厂房实测尺寸、场景范围 | 当前 Twin 合同采用本地米制、Y-up、右手系；不一致时先转换并用尺寸校准，禁止沿用灯塔坐标 |
| 层级与标识 | 模型/实体/业务设备/部件的层级关系；稳定且唯一的业务 ID、场景 entity ID、model ID、node ID / nodeKey；父节点引用与设备归属 | 资产重导后 ID 必须保持稳定，或随包提供新旧 ID 差异映射；无稳定映射时设备点选、详情和聚焦无法可靠验收 |
| 业务语义 | 设备名称、类型、区域、标签、关键部件、状态能力、测点/业务 ID；哪些字段由 DSL 给出、哪些由 XY 后端给出 | 形成设备目录映射和数据 DTO；业务属性不应被写死在模型名字或页面坐标推断中 |
| 视角与锚点 | 首屏视角及若干业务视角（ID、position、target、可选 FOV）；设备/区域/安全出口/摄像头/计量点/标注锚点；厂房 bounds、地坪/屋檐等空间边界（如启用镜头约束） | 所有位置须处于同一坐标系和单位；由场景/业务清单映射，不手抄灯塔镜头数据 |
| 动画与运动 | 动画来源（GLB baked clip、场景运行时动画、或 custom API）；对应 asset/entity/node、clip 名、时长、循环/初始状态、播放/暂停/seek/倍速/停止/复位语义；可否并行及资源开销 | 缺 clip 清单或可运行样例时先做动画 POC；不根据模型外观猜动画名称、对象或状态 |
| 定制能力 | 每个 custom API 的名称、版本、用途、参数 JSON Schema、返回值、错误码、事件、副作用、并发/重入/清理语义、最低 SDK/runtime 版本 | 插件/custom API 不视为“随 DSL 自动可运行”；接口合同缺失或目标 runtime 不支持时列为阻塞/能力缺口 |
| 验收材料 | 场景截图/录屏、目标浏览器和显卡要求、已知限制、可复现的视角/点击步骤、性能参考值 | 用同一代表包完成美术/业务/运行时三方验收 |

**建议包结构（必须与平台方实际合同对齐，不能单方面要求场景组改名）：**

```text
XY-scene-package/
  scene.json                    # 若采用当前 DSL draft：models、entities、camera、capabilities 等
  asset-lock.json               # 若采用当前 DSL draft：锁定资产版本和变体 hash
  registry.json                 # 可选：环境、状态样式、数据源和能力声明
  package.manifest.json         # 文件相对路径、字节数、hash；建议同时给 manifest hash
  assets/<asset-id>/<version>.glb
  assets/<asset-id>/manifest.json
  samples/                      # 可选：命令样例、业务数据样例、动画验收说明
  README.md                     # 包版本、坐标、依赖、导入说明、已知限制
```

以上是需求清单，不代表目标平台当前只接受这一种文件结构。若场景同事给的是独立 GLB/FBX、平台项目导出件或其他 DSL，先建立对应的导入转换/校验步骤，保留原始包及 hash，再产出交付端能够消费的已发布案例版本。

### 导入与发布流程

1. **交接登记**：登记原包、目录、版本、hash、坐标说明、资产授权、生成工具、目标平台及 SDK/runtime 版本。缺少 ID/轴向/单位/动画约定时先退回补齐或冻结为明确的适配假设。
2. **离线预检**：检查压缩包/文件路径、manifest 完整性、hash、JSON schema、引用闭合、模型/贴图依赖、必需 glTF 扩展、资产大小、节点 ID 唯一性及父层级。输出错误/警告清单；任何必需资产、绑定或能力解析失败都不进入发布。
3. **最小包平台导入**：走目标平台已有的资产导入、任务校验、预览、建场景、发布流程。记录导入报告、资产 revision、场景 revision、delivery code。若实际交付格式不是当前 draft DSL，使用平台认可的转换器/导入器，不绕过发布链直接从前端读源文件。
4. **语义与几何核对**：检查包里的稳定 ID 是否能映射到已发布 scene document；拾取设备后必须得到正确的业务设备及 nodeKey。校准 Y-up 米制尺寸、首屏/设备视角、标签/POI 锚点、室内范围和业务路线。
5. **动画冒烟**：在发布后的案例上列举 clip，并逐项播放/暂停/停止/复位；检查动画是否在目标 SDK 版本中可发现、多个实例的播放控制是否互相影响、dispose/切案例是否残留。通过后再固化 XY 动画调用合同。
6. **全量包与回归**：代表包通过后导入完整场景，检查资源总量和首屏加载；记录可回滚的已发布 revision，再进入 XY 页面联调。

## DSL / 场景包变化的处理策略

`threejs-twin-p0/packages/sdk/src/dsl.ts` 当前代码声明的是 `0.1.0-draft`：支持读取并校验 `scene.json`、`asset-lock.json`、资产 manifest/GLB，场景模型转为发布文档实体，camera views 转 bookmark，DSL entities 转 semantics。场景 schema 有额外字段透传，但这并不代表所有新字段都能运行；不认识的必需能力仍必须作为不兼容项处理。`packages/contracts/src/index.ts` 目前约束坐标为 local/m/Y-up/right-handed，并定义资产节点、稳定 ID、语义实体和动画 clip 元数据。**这些是当前仓库可查到的合同实现，不等于已确认目标部署平台支持该 DSL 版本。**

场景包带来的协议变更按以下规则处置：

- 先固定目标平台、SDK/runtime、DSL schemaVersion 和样包 hash，维护 XY 兼容矩阵；灯塔发布配置不随之升级。
- 区分可忽略可选字段、需要转换的字段、未知必需能力。可选展示字段可记录 warning；模型/业务映射/坐标/动画/定制命令的必需字段缺失或不支持则阻止发布验收。
- 新旧格式适配放在平台导入转换器或 XY `sceneAdapter` 边界，并用真实样包做契约测试。禁止在通用面板里散落 DSL 版本分支，禁止为了 XY 默认更改全局 `src/utils/twin` 的既有语义。
- 若协议变更需要 SDK 支持，先对照 SDK changelog/API 类型和 runtime 能力做隔离 POC，再决定升级 `@twin/web-sdk` 或由平台转换；升级后先跑灯塔回归。
- 任何包内插件/脚本都按需要新运行时代码处理。必须有受控执行方式、版本和能力声明；不能把“包里附了 JS”当成平台/浏览器已经支持。

### 动画特别风险

当前交付端依赖 `@twin/web-sdk ^0.5.4`。类型定义公开了 `scene.getClipNames(entityId)` 与 `animations.playClip` 等 GLB 动画片段能力，也有不同用途的实体 motion/path API；它们不能互相替代。更关键的是，当前 DSL 导入实现 `dslAssetMetadata()` 明确输出 `clips: []`，尽管 GLB 自身可能带 `animations`。因此不能仅凭 DSL 文档或模型源文件判定动画可以在已发布场景里播放：必须用 XY 首个带动画的真实包，走完整导入/发布/SDK 加载链验证 clip discovery 和播放。如 metadata 丢失导致接口不可用，应由场景包合同或 importer 显式保留 clip 清单/时长，再重新验证。

场景开发侧优先提供已烘焙进 GLB 的 clip 与语义清单。若动画是场景专属运行时能力，则由场景侧提供显式 custom API 合同，XY 的 `sceneAdapter` 负责调用并统一错误/生命周期；不把 `AnimationIndex`、Eid 或灯塔 UE 蓝图参数挪用过来。退出 XY、切换案例、重新发布时要停止本页发起的控制、解除 listener，并确认场景预置动画按合同恢复或继续。

## XY 应用结构与接口边界

### 路由和场景选择

- 新增根级 `/xy-factory`，`src/views/xy_factory/index.vue` 负责 XY 面板编排；保持灯塔 `/page_2/2`、默认跳转、导航文案和现有 scene 生命周期兼容。
- 将案例切换项放在应用级可见导航中。现有灯塔导航仍指向 `/page_2/2`；XY 项指向 `/xy-factory`。Header 标题需要识别 XY 路由，但不要改动灯塔原有标题结果。
- 一个时刻只保留一个 TwinApp/WebGL context。场景宿主按当前 route `caseKey` 选择对应 `serverUrl`/`deliveryCode` 和初始化配置；切换案例时先让旧页面完成清理，再 abort/解绑/dispose 旧实例，切换 active case 后启动新交付码并恢复 `isSceneAlready` 生命周期。
- 将 delivery code 配置按案例分开保存/部署，例如案例配置表或各自 runtime config；保留 `public/config.json` 灯塔默认值作为回退，不把 XY delivery code 写成全局默认值。不要把不同案例配置仅靠页面组件内部条件判断。

### 建议目录

```text
src/views/xy_factory/
  index.vue                    # 页面壳与业务面板编排
  components/                  # XY 页面私有面板；通用组件继续用 src/components
  api/                         # XY 后端请求与 DTO 归一化
  data/                        # 设备/区域/视角等静态配置或清晰标注的演示 fixture
  scene/
    config.js                  # XY delivery/runtime case config（不放业务 UI 常量）
    sceneAdapter.js            # selection、focus、高亮、POI、动画/custom API
    mapping.js                 # businessId/entityId/nodeKey/anchor 关联
```

### 业务与三维 API

建议建立三个单向边界：

1. **DataProvider**：从 XY 业务接口读取设备、状态、指标、告警、处置结果、能源/安全数据；将 XY 原始字段归一为页面 DTO。后端接口未知时仅用隔离的演示 fixture，UI 明示数据属性由产品方案决定，不把灯塔随机模拟器当真实源。
2. **SceneAdapter**：把业务 ID 映射到已发布场景 entity/node/anchors，提供 `focusDevice`、`highlightDevice`、必要的 overlay、视角和 XY 动画命令。所有 SDK 调用在此收口；若 DTO 找不到实体应给明确结果，不吞掉 ID 不匹配。
3. **业务面板**：只消费 DTO 和 adapter 的语义方法，不直接读取 DSL 原文、GLB 内部节点索引、绝对坐标或 custom API 名称。处置成功后更新业务数据源，再由同一数据流更新场景状态与 UI，避免 AI/面板/场景三份状态相互覆盖。

设备目录至少能表达 `{ id, name, kind, area, entityId, nodeKey, status, metrics }`；告警至少表达 `{ id, deviceId, level, message, time, state }`。最终字段与状态枚举以后端接口和 XY 场景语义为准。锚点、相机视角、计量点、出口路线及厂房边界独立于面板 DTO 维护。

## 并行研发安排

场景暂缺时可以并行做不依赖坐标和接口的工作，但先冻结面板需求清单和归一 DTO：

| 工作流 | 可并行内容 | 需要等待的输入 |
|---|---|---|
| 场景/平台 | 索取最小包；确认导出格式、DSL、坐标、ID、动画/API 合同；完成导入与发布 POC | 场景开发侧与目标平台提供真实样包 |
| 交付端面板 | 按灯塔现有信息层级设计 XY 首页、设备/告警/分析面板；以 XY DTO fixture 做可替换数据原型；移除生产仿真/溯源入口 | XY 业务范围、数据字段、处置流程和产品确认 |
| 框架接入 | 设计 route caseKey、全局案例菜单、单 Scene 生命周期切换和错误态 | 确认平台允许的多交付码配置与切换行为 |
| 数据与 AI | 梳理接口 DTO、鉴权、告警闭环、AI 上下文/工具动作 | XY 后端接口与 AI 服务合同 |

面板可以先用 fixture 做布局，但每份 fixture 标记为演示数据且不调用灯塔 custom API；接口接入后由 DataProvider 替换。场景 POC 负责验证包/ID/坐标/动画，二者通过固定 DTO 和 SceneAdapter 合并。

## 分阶段实施与验收

| 阶段 | 主要工作 | 完成标准 |
|---|---|---|
| 0. 冻结基线 | 记录灯塔默认路由、delivery config、主要交互与性能观察值；确认 XY 业务面板一期范围和非目标 | 有明确的灯塔回归清单；未修改灯塔默认案例/发布配置 |
| 1. 最小包与协议 POC | 收一台设备/一视点样包；验证 DSL/schema、资产 hash、坐标、节点引用、发布和 SDK 加载 | 有导入诊断、发布 revision、首屏截图和兼容性结论；动画单独记录通过/阻塞 |
| 2. 框架隔离 | 添加 `/xy-factory`、应用级案例入口、按 caseKey 切换唯一 TwinApp 和 XY 页面骨架 | 两个案例可直达与往返切换；灯塔仍用原 delivery code；无双 WebGL context 和旧覆盖物残留 |
| 3. 面板与数据 | 按 DTO 完成首页、设备、告警、分析模块和 XY 数据适配；接 AI 时绑定 XY 上下文 | 页面动作只经 XY DataProvider/SceneAdapter；生产仿真/溯源 UI 和灯塔假数据不进入 XY |
| 4. 场景联调 | 接完整场景包，校准实体映射、书签、空间锚点、安全/能源覆盖物和动画命令 | 设备点选、告警定位、返回、视角、覆盖物与动画符合场景包合同；错误映射可诊断 |
| 5. 交付回归 | 重新发布/自动更新、失败重试、退出清理、浏览器 build/lint 与两案例回归 | XY 与灯塔分别通过验收；包版本、delivery config、限制、测试结果均留档 |

验收至少覆盖：灯塔 `/page_2/2` 默认进入及主要设备/告警交互；XY 直达、导航切换和刷新；切换时旧任务/事件/覆盖物清理；场景加载失败与重试；设备 ID 映射；动画逐条播放与离场清理；`npm run lint`、`npm run build`；浏览器内两个案例往返验证。当前 `package.json` 没有专用测试脚本，具体自动化方式按实现范围补充，浏览器回归不可省略。

## 待场景包和业务方确认

1. 目标场景平台地址、实际导入器版本、接受的完整包格式、DSL schemaVersion、支持的资产类型/大小/扩展、发布和回滚流程是什么？
2. 场景是否提供稳定 businessId/entityId/nodeKey？设备或 GLB 重新导出后如何保持或迁移 node ID？
3. 模型是否自带烘焙动画？能否给一台设备的真实 clip 清单、场景 API 清单和并发播放要求？
4. XY 一期具体保留哪些共性面板，是否包括告警处置、设备详情、能源、安全、巡检、历史趋势和 AI？生产仿真/溯源类入口按当前要求排除。
5. 业务数据接口与 AI 服务分别由谁提供？演示数据是否允许、怎样标识，告警处置是否要求真实写回？

## 调研依据

- 当前交付端场景/实例：`src/layout/scene.vue`、`src/utils/twin/app.js`、`src/utils/twin/entity.js`、`src/utils/twin/camera.js`。
- 应用壳、默认路由和导航：`src/views/index.vue`、`src/router/index.js`、`src/views/page_2/index.vue`、`src/layout/footer.vue`、`src/layout/header.vue`。
- 灯塔智能生产页面和案例绑定：`src/views/page_2/page_2_2/index.vue`、`src/views/page_2/page_2_2/lighthouse/twin.js`、`src/views/page_2/page_2_2/lighthouse/live.js`。
- 迁移能力/缺口对照：`docs/wdpapi-功能清单与twinSDK迁移.md`。
- 当前工作区可读到的 DSL / 合同实现（需与目标部署核实）：`../threejs-twin-p0/packages/sdk/src/dsl.ts`、`../threejs-twin-p0/packages/contracts/src/index.ts`、`../threejs-twin-p0/docs/copilot-history/02-完整场景数据维度与字段.md`、`../threejs-twin-p0/docs/copilot-history/05-GLB-FBX模型导入闭环.md`。
