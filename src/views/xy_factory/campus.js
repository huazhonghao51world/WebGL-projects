import snapshot from "../../../docs/xy-first-delivery/anchors.raw.json";

// 场景点位来自场景组交付的 L_BP.glb。发布流程（scripts/release-xy-scene.cjs）把它写进场景实体 xy-anchors；
// 页面优先读已发布版本，读不到时用随代码提交的快照，保证静态预览可用。
export const ANCHOR_ENTITY_ID = "xy-anchors";

const ids = {
  "生产楼": "production", "库区楼": "warehouse", "1号研发楼": "research-1",
  "2号研发楼": "research-2", "杂物房": "utility", "办公楼": "office", "宿舍楼": "dormitory",
};

export const floors = {
  production: ["1F", "2F", "3F", "副楼"],
  warehouse: ["1F", "2F", "3F", "4F"],
};

function pointId(point) {
  if (point.kind === "building-label") return ids[point.sourceName] || `building-${point.sourceNodeIndex}`;
  const number = /\d+$/.exec(point.sourceName);
  return number ? `camera-${number[0]}` : `camera-${point.sourceNodeIndex}`;
}

/** 由点位原始数据构建目录；同一 ID 只取第一个。 */
export function buildCampus(raw) {
  const seen = new Set();
  const anchors = (raw && Array.isArray(raw.anchors) ? raw.anchors : []).flatMap((point) => {
    const id = pointId(point);
    if (seen.has(id) || !Array.isArray(point.position) || point.position.length !== 3) return [];
    seen.add(id);
    return [{ id, name: point.sourceName, position: point.position, kind: point.kind === "building-label" ? "building" : "camera" }];
  });
  const buildings = anchors.filter(({ kind }) => kind === "building");
  const cameras = anchors.filter(({ kind }) => kind === "camera").sort((left, right) => left.name.localeCompare(right.name, "zh-CN", { numeric: true }));
  const production = buildings.find(({ id }) => id === "production") || buildings[0];
  // 场景尚未交付设备位置：只在用户开启演示点时显示，用生产楼锚点作为方位参考。
  const demoDevice = {
    id: "device-demo", kind: "device", name: "设备演示点",
    position: (production ? production.position : [0, 0, 0]).map((value, axis) => value + [16, 0, 18][axis]),
  };
  return { anchors, buildings, cameras, demoDevice };
}

/** 已发布场景中的点位；没有或格式不对时返回 null。 */
export function publishedAnchors(viewer) {
  try {
    const entity = viewer.scene.getDocument().entities.find((item) => item.entityId === ANCHOR_ENTITY_ID);
    const data = entity && entity.customData;
    return data && Array.isArray(data.anchors) && data.anchors.length ? data : null;
  } catch (error) {
    return null;
  }
}

export const campus = buildCampus(snapshot);
export const { anchors, buildings, cameras, demoDevice } = campus;

export const overview = { id: "xy-overview", name: "园区全景", position: [164, 220, 284], target: [10, 17, -16] };
