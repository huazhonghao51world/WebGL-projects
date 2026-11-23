import { getViewer, peekViewer } from "./app";
import { handleTwinError, STATUS } from "@/utils/statusEnum";

/** 按类型删除覆盖物（如 ["Poi", "Window"]） */
export async function deleteTypes(types) {
  const viewer = peekViewer();
  if (!viewer || viewer.getState() !== "ready") return 0;
  try {
    return await viewer.scene.clearByTypes(types);
  } catch (error) {
    handleTwinError(error, STATUS.ENTITY_DELETE);
    return 0;
  }
}

/** 删除实体对象数组 */
export async function deleteObjs(objs) {
  if (!objs || !objs.length) return 0;
  try {
    return await getViewer().scene.delete(objs);
  } catch (error) {
    handleTwinError(error, STATUS.ENTITY_DELETE);
    return 0;
  }
}

/** 按 eid 删除 */
export async function clearByEids(eids) {
  try {
    return await getViewer().scene.clearByEids(eids.map(String));
  } catch (error) {
    handleTwinError(error, STATUS.ENTITY_DELETE);
    return 0;
  }
}
