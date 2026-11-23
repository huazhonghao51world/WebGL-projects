# page_2_5_device — UE 自定义 API 接口文档

本文档记录 `page_2_5_device`（设备管理-设备详情）页面使用的所有 UE 侧自定义 API 接口。

> **调用方式**：前端统一通过 `customFn(apiFuncName, args)` 或 `splitBuildByName(build_id, floor)` 调用，底层走 `App.Customize.RunCustomizeApi()`。
>
> **封装位置**：`src/utils/wdpapi/custom.js`
>
> **页面 Mixin**：`src/views/page_2/page_2_5_device/mixins/wdpapi.js`

---

## 已有接口

### 1. ControlJC — 机床动画控制

控制设备页面中机床（加工中心）的运行动画开关。

| 字段 | 说明 |
|------|------|
| **apiFuncName** | `ControlJC` |
| **apiClassName** | `CustomApi` |

**参数（args）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `guid` | string | 是 | 实体 GUID，当前传空串 `""` |
| `AnimationState` | boolean | 是 | `true` = 开启动画，`false` = 关闭动画 |
| `AnimationIndex` | number | 否 | 指定动画序号，目前支持 `0` 和 `1` 两个动画，不传则由 UE 侧走默认行为 |

**调用示例**：

```js
// 通过 mixin 方法调用（推荐）
await this.controlJC(true, 0);   // 开启动画 0
await this.controlJC(true, 1);   // 开启动画 1
await this.controlJC(false);     // 关闭动画（不指定序号）
```

**调用时机**：

| 场景 | AnimationState | AnimationIndex | 说明 |
|------|---------------|----------------|------|
| 用户点击按钮触发 | `true` | `0` 或 `1` | 按需播放指定动画 |
| 离开设备详情页（`beforeRouteLeave`） | `false` | 不传 | 停止动画，还原场景 |

---

### 2. EC_SplitBuildByName — 楼层拆分

控制建筑/车间的楼层展开与合拢效果。

| 字段 | 说明 |
|------|------|
| **apiFuncName** | `EC_SplitBuildByName` |
| **apiClassName** | `CustomAPI_SplitBuildings` |

**参数（args）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `guid` | string | 是 | 传空串 `""` |
| `build_id` | string | 是 | 建筑标识，如 `"cj"` = 车间 |
| `floor` | string | 是 | `"1"` = 展开拆楼，`"2"` = 合拢还原 |

**调用示例**：

```js
import { splitBuildByName } from "@utilsWdpApi/custom";

// 展开车间楼层
await splitBuildByName("cj", "1");

// 合拢车间楼层
await splitBuildByName("cj", "2");
```

**调用时机**：

| 场景 | floor | 说明 |
|------|-------|------|
| 进入页面（`initAfterSceneReady`） | `"1"` | 展开车间楼层 |
| 离开 page_2_5 系列页面 | `"2"` | 合拢车间，还原场景 |

---

### 3. ControlJCLocation — 机床零部件位移控制

控制机床指定零部件的位置偏移，支持缓动动画。

| 字段 | 说明 |
|------|------|
| **apiFuncName** | `ControlJCLocation` |
| **apiClassName** | `CustomApi` |

**参数（args）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `Eid` | string | 是 | 零部件实体 ID，见下方清单 |
| `Value` | string | 是 | 局部偏移值 `"x,y,z"`，单位 cm |
| `Time` | number | 是 | 从当前位置到目标位置的缓动时间（秒） |

**有效 Eid 清单**：

| Eid | 零部件 |
|-----|------|
| `Eid_10145` | 刀头 |
| `Eid_10146` | 主轴 |
| `Eid_10147` | 控制箱 |
| `Eid_10150` | X 轴直线导轨 |
| `Eid_10152` | Y 轴直线导轨 |
| `Eid_10153` | Z 轴直线导轨 |

**调用示例**：

```js
await this.controlJCLocation("Eid_10146", "0,0,1000", 4);  // 主轴 Z轴上移 1000cm，4秒缓动
await this.controlJCLocation("Eid_10146", "0,0,0", 2);     // 还原位置，2秒缓动
```

**调用时机**：

| 场景 | 说明 |
|------|------|
| 用户操作参数指令滑块 | 按需移动指定零部件到目标位置 |
| 还原位置 | 传 `Value="0,0,0"` 将部件移回原点 |

---

### 4. ControlCrystal — 水晶特效开关

控制设备水晶体视觉特效的开启与关闭。

| 字段 | 说明 |
|------|------|
| **apiFuncName** | `ControlCrystal` |
| **apiClassName** | `CustomApi` |

**参数（args）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `State` | boolean | 是 | `true` = 开启水晶特效，`false` = 关闭 |

**调用示例**：

```js
await this.controlCrystal(true);   // 开启
await this.controlCrystal(false);  // 关闭
```

**调用时机**：

| 场景 | State | 说明 |
|------|-------|------|
| 用户点击 RUL 表格行（选中） | `true` | 开启水晶体特效 |
| 用户点击同一行（取消选中） | `false` | 关闭水晶体特效 |
| 离开页面（`beforeDestroy`） | `false` | 确保离开时关闭 |

---

### 5. ControlHightLight — 实体高亮控制

控制指定实体的高亮显示开关，支持同时高亮多个实体。

| 字段 | 说明 |
|------|------|
| **apiFuncName** | `ControlHightLight` |
| **apiClassName** | `CustomApi` |

**参数（args）**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `Eid` | string[] | 是 | 实体 ID 数组，如 `["Eid_10147"]`，支持多个 |
| `State` | boolean | 是 | `true` = 开启高亮，`false` = 关闭高亮 |

**调用示例**：

```js
await this.controlHighLight(["Eid_10147"], true);            // 高亮单个实体
await this.controlHighLight(["Eid_10145", "Eid_10146"], true); // 高亮多个实体
await this.controlHighLight(["Eid_10147"], false);           // 取消高亮
```

**调用时机**：

| 场景 | State | 说明 |
|------|-------|------|
| 用户点击 RUL 表格行（选中） | `true` | 高亮对应零部件 |
| 用户点击同一行（取消选中） | `false` | 取消高亮 |
| 切换选中行 | 先 `false` 旧行，再 `true` 新行 | 确保同一时间只有一组高亮 |

---

## WDP SDK 接口（非自定义 API）

以下为 51WORLD WDP SDK 内置接口，本页面直接调用。

### 5. FocusByCustomId — 按 CustomId 聚焦实体

相机飞行到指定 CustomId 实体并聚焦。

| 字段 | 说明 |
|------|------|
| **SDK 方法** | `App.CameraControl.FocusByCustomId(customId, config)` |
| **封装位置** | `src/utils/wdpapi/camera.js` |

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `customId` | string[] | 是 | 实体 CustomId 数组（**必须传数组**，如 `["Eid_10146"]`） |
| `yaw` | number | 否 | 偏航角 -180~180，默认 `0` |
| `pitch` | number | 否 | 仰俯角 -90~0，默认 `-40` |
| `distanceFactor` | number | 否 | 视野参数 0.1~1，默认 `0.8` |

**SDK config 结构**：

```js
{
  rotation: { pitch: -40, yaw: 0 },
  distanceFactor: 0.5,
  flyTime: 1
}
```

**调用示例**：

```js
import { FocusByCustomId } from "@utilsWdpApi/camera";

// 聚焦到主轴
FocusByCustomId(["Eid_10146"], 0, -40, 0.5);
```

**调用时机**：

| 场景 | 说明 |
|------|------|
| 用户点击 RUL 表格行 | 相机飞行到对应零部件 |

> **注意**：`customId` 必须传数组，传字符串会报错 `e.forEach is not a function`。

---

### 6. deleteTypes — 按类型清除场景对象

离开页面时清除本页创建的场景对象。

| 字段 | 说明 |
|------|------|
| **SDK 方法** | `App.Scene.ClearByTypes(types)` |
| **封装位置** | `src/utils/wdpapi/delete.js` |

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `types` | string[] | 是 | 要清除的对象类型数组 |

**本页使用的类型**：

```js
["Window", "Path", "Poi", "Range", "Particle", "Text3D", "Viewshed"]
```

**调用示例**：

```js
import { deleteTypes } from "@utilsWdpApi/delete";

await deleteTypes(["Window", "Path", "Poi", "Range", "Particle", "Text3D", "Viewshed"]);
```

**调用时机**：

| 场景 | 说明 |
|------|------|
| 离开页面（`beforeDestroy`） | 清除本页创建的所有场景对象 |

---

## 通用调用协议

所有自定义 API 最终构造为以下 JSON 结构传给 WDP SDK：

```js
const jsondata = {
  apiClassName: "CustomApi",           // UE 侧蓝图/C++ 类名
  apiFuncName: "YourFunctionName",     // UE 侧注册的函数名（区分大小写）
  args: {
    guid: "",                          // 必传，通常为空串
    // ... 其他业务参数
  }
};
const res = await App.Customize.RunCustomizeApi(jsondata);
```

**注意事项**：

1. `apiFuncName` 必须与 UE 端注册名**完全一致**（大小写敏感）
2. `args` 字段名和类型需与 UE 端定义匹配
3. 前端禁止直接调用 `store.state.wdpApp`，必须走 `@utilsWdpApi/custom.js` 封装
4. 新增接口需同时更新本文档
