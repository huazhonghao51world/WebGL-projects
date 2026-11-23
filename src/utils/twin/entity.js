import { getViewer } from "./app";
import { handleTwinError, STATUS } from "@/utils/statusEnum";

/**
 * 实体 / 覆盖物封装
 * - 场景发布自带的模型实体类型为 "Static"：customId = 业务编号（businessId），entityName = 模型名称
 * - 覆盖物（Poi / Window / Range / Path / Text3D …）由业务在运行时添加
 * 颜色统一为 HEXA 字符串：RRGGBB 或 RRGGBBAA（不带 #）
 */

/** 发布场景中的全部模型实体 */
export function getModelEntities() {
  return getViewer().scene.getByTypes(["Static"]);
}

/** 按业务编号取实体 */
export function getEntitiesByCustomId(customIds) {
  return getViewer().scene.getByCustomId(customIds.map(String));
}

/** 实体包围盒：{ eid, min, max, center, size } */
export function getEntityBox(entity) {
  return getViewer().scene.getBoundingBox([entity])[0] || null;
}

function imageLink(value) {
  if (typeof value !== "string") throw new TypeError("POI 资源需填写图片链接");
  if (!value.trim()) return "";
  const url = new URL(value, document.baseURI);
  if (!["http:", "https:"].includes(url.protocol)) throw new TypeError("POI 资源仅支持 HTTP(S) 图片链接");
  return url.href;
}

/**
 * 公共 POI 创建接口。style 可指定 icon（url/activeUrl/size/visible）和 label
 * （backgroundUrl/size/offset/textOffset/color/fontSize/align/visible）。
 * offset 为图标底边中心到标签背景左下角的 CSS 像素位移（右、上为正）；
 * 不传 label.size 时标签宽高按文字自适应；textOffset 为左右 / 上下留白，文字在标签内垂直居中，
 * align 默认 Center（水平居中）。点位可覆盖批次样式。
 */
export function createPOIs(items, { entityName = "poi", labelColor = "ffffff", labelFontSize = 14, poiStyle = {}, style = {}, viewer = getViewer() } = {}) {
  const payload = items.map((item) => {
    const icon = { ...style.icon, ...item.style?.icon };
    const label = { ...style.label, ...item.style?.label };
    const sdkStyle = { ...poiStyle, ...item.poiStyle };
    if (icon.url != null) sdkStyle.markerNormalUrl = imageLink(icon.url);
    if (icon.activeUrl != null) sdkStyle.markerActivateUrl = imageLink(icon.activeUrl);
    if (icon.size != null) sdkStyle.markerSize = icon.size;
    if (icon.visible != null) sdkStyle.markerVisible = icon.visible;
    if (label.backgroundUrl != null) sdkStyle.labelBgImageUrl = imageLink(label.backgroundUrl);
    if (label.size != null) sdkStyle.labelBgSize = label.size;
    if (label.offset != null) sdkStyle.labelBgOffset = label.offset;
    if (label.textOffset != null) sdkStyle.labelContentOffset = label.textOffset;
    sdkStyle.labelContentJustification = label.align ?? sdkStyle.labelContentJustification ?? "Center";
    if (label.visible != null) sdkStyle.labelVisible = label.visible;
    sdkStyle.labelContent = [item.label ?? "", label.color ?? labelColor, String(label.fontSize ?? labelFontSize)];
    return {
      location: item.location,
      customId: item.customId == null ? "" : String(item.customId),
      customData: item.customData ?? {},
      ...(item.bVisible == null ? {} : { bVisible: item.bVisible }),
      poiStyle: sdkStyle,
    };
  });
  return payload.length ? viewer.scene.create({ type: "Poi", entityName }, payload) : Promise.resolve([]);
}

/** 兼容原有调用者：创建失败时统一提示并返回空数组。 */
export async function addPOIs(items, options = {}) {
  try {
    return await createPOIs(items, options);
  } catch (error) {
    handleTwinError(error, STATUS.ENTITY_ADD);
    return [];
  }
}

/**
 * 添加三维挂接网页弹窗，内容为本项目的 #/wdpWindow 路由（query 原样传给弹窗组件）
 * @param {object} options { location, size:[w,h], offset:[x,y], query:{type,...}, customId, entityName }
 */
export async function addWindow({ location, size = [300, 160], offset = [0, 0], query = {}, customId = "", entityName = "window" }) {
  const search = Object.keys(query)
    .filter((key) => query[key] !== undefined && query[key] !== null)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(String(query[key]))}`)
    .join("&");
  try {
    const [win] = await getViewer().scene.add({
      type: "Window",
      location,
      customId: String(customId),
      entityName,
      windowStyle: { url: `./#/wdpWindow?${search}`, size, offset },
    });
    return win;
  } catch (error) {
    handleTwinError(error, STATUS.ENTITY_ADD);
    return null;
  }
}

/** 按类型显隐 */
export async function setVisibleByTypes(types, visible) {
  const viewer = getViewer();
  const entities = viewer.scene.getByTypes(types);
  if (entities.length) await viewer.scene.setVisible(entities, visible);
  return entities.length;
}

/** 按 eid 显隐 */
export async function setVisibleByEids(eids, visible) {
  const viewer = getViewer();
  const entities = viewer.scene.getByEids(eids.map(String));
  if (entities.length) await viewer.scene.setVisible(entities, visible);
  return entities.length;
}

/** 模型高亮（color 为 HEXA，传 false 取消） */
export function setHighlight(entities, color) {
  getViewer().scene.setEntityHighlight({ entities, bHighlight: Boolean(color), ...(color ? { color } : {}) });
}

/** 模型描边 */
export function setOutline(entities, color) {
  getViewer().scene.setEntityOutline({ entities, bOutline: Boolean(color), ...(color ? { color } : {}) });
}
