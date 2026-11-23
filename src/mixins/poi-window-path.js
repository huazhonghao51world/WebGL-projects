import store from "@/store/index.js";

/**
 * POI + Window + Path 联动模块
 * 创建 POI 点位、双路径（可见+不可见）、预创建隐藏弹窗，并绑定路径移动和点击切换弹窗显隐
 *
 * @param {Object} params
 *
 * @param {Object} params.poi                      - POI 配置
 * @param {Array}  params.poi.locations             - POI 坐标数组 [[lng, lat, alt], ...]
 * @param {Object} [params.poi.poiConfig]           - POI 基本配置 { customId: string[], entityName: string[] }
 * @param {Object} [params.poi.markerConfig]        - 图标配置 { markerNormalUrl: string, markerActivateUrl: string, markerSize: [w, h] }
 *
 * @param {Object} params.window                    - Window 弹窗配置
 * @param {Array}  [params.window.locations]         - 弹窗坐标数组（可选，缺省取 poi.locations）
 * @param {Object} [params.window.windowConfig]      - 弹窗尺寸与偏移 { size: [w, h], offset: [x, y] }，x>0 向右 y>0 向上（像素）
 * @param {Array}  [params.window.windowData]        - 每个弹窗的信息列表 [[{ title, content, flex }], ...]
 * @param {Object} [params.window.options]           - 弹窗额外选项，会展开覆盖默认值，如 { type, bgType, headerTag, headerRight, ... }
 * @param {Array}  [params.window.optionsPerWindow]    - 每个弹窗的独立选项数组，按索引对应，优先级高于 options
 *
 * @param {Object} [params.path]                     - 路径配置（可选，不传则不创建路径和绑定移动）
 * @param {Array}  params.path.pathData              - 路径坐标数组 [[[lng, lat, alt], ...], ...]
 * @param {Object} params.path.poiPathConfig         - POI 可见路径样式 { type, width, color, passColor, ... }
 * @param {Object} params.path.windowPathConfig      - Window 不可见路径样式 { type, width, color, passColor, ... }
 * @param {number} [params.path.poiUp=0.1]           - POI 绑定路径的垂直偏移，上+下-（单位：米）
 * @param {number} [params.path.windowUp=3]          - Window 绑定路径的垂直偏移，上+下-（单位：米）
 * @param {number[]} [params.path.moveTimes]          - 每条路径的移动时间数组（秒），按索引对应
 *
 * @param {Object} [params.particle]                  - 粒子小车配置（可选，不传则不创建小车模型）
 * @param {string} [params.particle.particleType="vehicle_taxi"] - 粒子类型
 * @param {Array}  [params.particle.scale3d=[0.5,0.5,0.5]]       - 缩放
 * @param {number} [params.particle.up=0.5]            - 小车绑定路径的垂直偏移（米）
 * @param {number} [params.particle.yaw=-4]            - 小车朝向偏移
 * @param {number} [params.particle.time]              - 移动时间（秒），不传则使用路径默认
 *
 * @param {Object} [params.focusCamera]              - 聚焦相机参数 { location: [lng, lat, alt], pitch, yaw, distance }
 * @param {string} [params.prefix="点位"]            - 实体命名前缀，用于生成 entityName 和 customId
 *
 * @returns {Promise<Object>} 返回创建的对象集合
 * @returns {Array}  return.poiObjs          - POI 对象数组
 * @returns {Array}  return.windowObjs       - Window 对象数组（创建失败的位置为 null）
 * @returns {Array}  return.pathObjs         - POI 可见路径对象数组
 * @returns {Array}  return.windowPathObjs   - Window 不可见路径对象数组
 * @returns {Array}  return.particleObjs     - 粒子小车对象数组
 * @returns {Array}  return.allObjs          - 所有创建的对象（用于统一销毁）
 */
// [twin 待实现] 原 wdpapi 调用：FocusByPoints → addPOI → addPath → addPath → <实体>.SetVisible → addWINDOWS → addEntities → coveringMove → <实体>.onClick → <实体>.SetVisible → <实体>.Update → addPath → <实体>.SetVisible
export async function createPoiWindowPath(params) {
  const {
    poi,
    window: win,
    path,
    particle,
    focusCamera,
    prefix = "点位",
  } = params;

  const allObjs = [];

  // 聚焦相机
  if (focusCamera) {
  }

  // 1. 创建 POI


  // 2. 创建可见路径（POI 用）和不可见路径（Window 用）
  const pathObjs = [];
  const windowPathObjs = [];

  if (path?.pathData?.length) {
  }

  // 3. 预创建隐藏的 Window
  const windowObjs = [];
  const winOptions = win.options || {};
  const winOptionsPerWindow = win.optionsPerWindow || [];


  // 4. 创建粒子小车模型（可选）
  const particleObjs = [];
  if (particle && path?.pathData?.length) {
  }

  // 5. 绑定路径移动
  const poiUp = path?.poiUp ?? 0.1;
  const windowUp = path?.windowUp ?? 3;
  const particleUp = particle?.up ?? 0.5;
  const particleYaw = particle?.yaw ?? -4;


  // 6. 点击 POI 切换弹窗显隐
  let activeWindowIndex = -1;
  const sourceUrl = store.state.wdpConfig.sourceUrl;
  const normalIcon = sourceUrl + (poi.markerConfig?.markerNormalUrl || "");
  const activeIcon = sourceUrl + (poi.markerConfig?.markerActivateUrl || "");


}
