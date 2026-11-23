import { getViewer, peekViewer } from "./app";
import { handleTwinError, STATUS } from "@/utils/statusEnum";

/**
 * 天气：Sunny / Cloudy / PartlyCloudy / Overcast / LightRain / ModerateRain / HeavyRain /
 *       LightSnow / ModerateSnow / HeavySnow / Foggy / Sand / Haze
 * @param {number} durationSeconds 过渡时长（秒）
 */
export function setSceneWeather(weather, durationSeconds = 3) {
  const viewer = peekViewer();
  if (!viewer || viewer.getState() !== "ready") return false;
  try {
    viewer.environment.setSceneWeather(weather, durationSeconds);
    return true;
  } catch (error) {
    handleTwinError(error, STATUS.ENV_SET);
    return false;
  }
}

/** 光照时间 "HH:mm" */
export function setSceneTime(time, durationSeconds = 3) {
  const viewer = peekViewer();
  if (!viewer || viewer.getState() !== "ready") return false;
  try {
    viewer.environment.setSkylightTime(time, durationSeconds);
    return true;
  } catch (error) {
    handleTwinError(error, STATUS.ENV_SET);
    return false;
  }
}

/**
 * 取点：start=true 进入取点模式（左键点击模型表面 / 地面），start=false 退出并返回点列表
 * @param {"surface"|"ground"} coordZRef
 */
export function pickPoint(start = false, coordZRef = "surface") {
  const viewer = getViewer();
  if (start) {
    viewer.tools.startPickPoint({ coordinateShow: true, iconShow: true, coordZRef });
    return [];
  }
  return viewer.tools.endPickPoint();
}

/** 当前已取的点（不退出取点模式） */
export function getPoints() {
  return getViewer().tools.getPickedPoints();
}
