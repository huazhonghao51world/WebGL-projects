import { getTwinApp } from "@/utils/twin/app";
import { createPOIs } from "@/utils/twin/entity";
import { overview } from "./campus";
import { campusPoiStyles } from "./poiStyles";

const prefix = "xy-poi-";
const buildingXref = { "生产楼": "production", "库区楼": "warehouse" };

function nodeData(viewer) {
  return viewer.scene.getByTypes(["Static"]).flatMap((entity) => {
    const nodes = viewer.hierarchy.getNodes(entity.eid);
    const index = new Map(nodes.map((node) => [node.nodeKey, node]));
    return nodes.flatMap((node) => {
      const building = Object.keys(buildingXref).find((name) => node.nodeName === name || node.nodeName.includes(`_${name}_`));
      if (!building) return [];
      const floor = node.nodeName.split(`_${building}_`)[1];
      let ancestor = index.get(node.parentKey);
      while (ancestor && !ancestor.nodeName.includes(building)) ancestor = index.get(ancestor.parentKey);
      return [{ id: buildingXref[building], floor: /^(?:[1-4]F|副楼)$/.test(floor) ? floor : null, parentKey: ancestor && ancestor.nodeKey, ref: { entityId: entity.eid, nodeKey: node.nodeKey } }];
    });
  });
}

export function connectCampus(anchors, onPick, { showCameras: showCamerasInitially = true, poiStyles } = {}) {
  const app = getTwinApp();
  const viewer = app.viewer;
  const nodes = nodeData(viewer);
  let disposed = false;
  let poi = [];
  let hidden = [];
  let showCameras = showCamerasInitially;
  let showDevice = false;
  const styles = campusPoiStyles(poiStyles || {});
  const pointKinds = new Map(anchors.map(({ id, kind }) => [`${prefix}${id}`, kind]));
  let queue = Promise.resolve();
  const live = () => !disposed && getTwinApp() === app;
  const off = viewer.events.on("entity.click", (event) => {
    if (!live() || !event) return;
    const identifier = event.entity.toJSON().customId;
    if (event.type === "Poi" && typeof identifier === "string" && identifier.startsWith(prefix)) onPick(identifier.slice(prefix.length), true);
    if (event.type === "Static") {
      const node = nodes.find(({ ref }) => ref.entityId === event.eid && ref.nodeKey === event.nodeKey);
      if (node) onPick(node.id, false);
    }
  });

  function fly(pose) {
    if (!live()) return Promise.resolve();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return viewer.camera.flyTo(pose, reduced ? 0 : 650).catch((error) => {
      if (live() && error.code !== "E_OPERATION_CANCELLED") throw error;
    });
  }

  function filterPoints(kind) {
    queue = queue.catch(() => {}).then(async () => {
      if (!live()) return;
      const points = poi.filter((item) => pointKinds.get(item.toJSON().customId) === kind);
      if (points.length) await viewer.scene.setVisible(points, kind === "camera" ? showCameras : showDevice);
    });
    return queue;
  }

  const ready = (async () => {
    poi = await createPOIs(anchors.map((point) => ({
      location: point.position,
      customId: `${prefix}${point.id}`,
      customData: { kind: point.kind, ...(point.kind === "device" ? { demo: true } : {}) },
      bVisible: point.kind === "building" || (point.kind === "camera" && showCameras),
      label: point.kind === "camera" ? `监控 ${point.id.slice(7)}` : point.name,
      style: styles[point.kind],
    })), { entityName: "XY园区点位", viewer });
    if (!live()) {
      if (getTwinApp() === app && poi.length) await viewer.scene.delete(poi);
      return;
    }
    await filterPoints("camera");
    await filterPoints("device");
  })();

  function applyFloor(id, floor) {
    if (!live()) return;
    if (hidden.length) viewer.hierarchy.setNodeVisible(hidden, true);
    const sameBuilding = nodes.filter((node) => node.id === id);
    const keep = new Set(sameBuilding.filter((node) => node.floor === floor).map(({ ref }) => ref.nodeKey));
    sameBuilding.forEach((node) => {
      if (!keep.has(node.ref.nodeKey)) return;
      let key = node.parentKey;
      while (key && !keep.has(key)) {
        keep.add(key);
        key = sameBuilding.find(({ ref }) => ref.nodeKey === key)?.parentKey;
      }
    });
    hidden = floor ? sameBuilding.filter((node) => node.floor && !keep.has(node.ref.nodeKey)).map(({ ref }) => ref) : [];
    if (hidden.length) viewer.hierarchy.setNodeVisible(hidden, false);
  }

  return {
    ready,
    hasFloor: (id, floor) => nodes.some((node) => node.id === id && node.floor === floor),
    filterCameras(visible) { showCameras = visible; return filterPoints("camera"); },
    filterDevice(visible) { showDevice = visible; return filterPoints("device"); },
    applyFloor,
    setTime(time) { if (live()) viewer.environment.setSkylightTime(time, 0); },
    setWeather(weather) { if (live()) viewer.environment.setSceneWeather(weather, 0); },
    restoreEnvironment() { if (live()) viewer.environment.reset(); },
    focus(point, floor) {
      if (!live()) return Promise.resolve();
      const offset = point.kind === "camera" ? [24, 21, 33] : [39, 43, 65];
      const target = floor ? [point.position[0], point.position[1] - (4 - (parseInt(floor, 10) || 2)) * 4, point.position[2]] : point.position;
      return fly({ id: point.id, name: point.name, position: target.map((value, index) => value + offset[index]), target });
    },
    reset() {
      applyFloor(null, null);
      return live() ? viewer.camera.resetPose(650).catch((error) => { if (error.code !== "E_OPERATION_CANCELLED") return fly(overview); }) : Promise.resolve();
    },
    dispose() {
      const active = live();
      disposed = true;
      off();
      if (!active) return;
      if (poi.length) viewer.scene.delete(poi).catch(() => {});
      if (hidden.length && viewer.getState() === "ready") viewer.hierarchy.setNodeVisible(hidden, true);
    },
  };
}
