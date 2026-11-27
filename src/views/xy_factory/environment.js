// 场景环境（时间 / 天气）：全局光照由场景组配置包提供（天空贴图、主光、补光、半球光、雾），
// 这里直接在这套光照上调节强度、颜色与雾，不再调用 SDK 的 viewer.environment（它会另建天空并改写已被关闭的平台默认灯光，
// 与场景组光照互相覆盖，造成画面发灰、帧率骤降）。恢复默认即写回首次记录的场景组光照参数。
const WEATHER = {
  Sunny: { clear: 1, fog: 1, fogColor: null, label: "晴天" },
  Cloudy: { clear: 0.72, fog: 1.8, fogColor: "#b8c4d0", label: "多云" },
  Overcast: { clear: 0.42, fog: 3, fogColor: "#a3adb8", label: "阴天" },
  Foggy: { clear: 0.35, fog: 9, fogColor: "#c3c9cf", label: "雾天" },
};

export function createEnvironmentControl(viewer) {
  const host = viewer.extensions;
  const T = host.THREE;
  let base = null;
  let minutes = 720;
  let weather = "Sunny";

  function capture() {
    const scene = host.scene;
    const defaults = new Set(Object.values(host.defaultLights));
    const lights = [];
    scene.traverse((o) => { if (o.isLight && !defaults.has(o) && o.visible) lights.push({ light: o, intensity: o.intensity, color: o.color.clone(), position: o.position.clone(), ground: o.groundColor ? o.groundColor.clone() : null }); });
    const key = lights.filter((l) => l.light.isDirectionalLight).sort((a, b) => b.intensity - a.intensity)[0] || null;
    base = {
      lights, key,
      center: key && key.light.target ? key.light.target.position.clone() : new T.Vector3(),
      fog: scene.fog ? { color: scene.fog.color.clone(), density: scene.fog.density } : null,
      envIntensity: scene.environmentIntensity,
      exposure: host.renderer.toneMappingExposure,
      bgIntensity: scene.backgroundIntensity,
    };
  }

  function apply() {
    if (!base) capture();
    const scene = host.scene;
    const hours = minutes / 60;
    const day = Math.max(0, Math.sin(((hours - 6) / 12) * Math.PI));
    const preset = WEATHER[weather] || WEATHER.Sunny;
    const warm = new T.Color("#ffb070");
    for (const item of base.lights) {
      const { light } = item;
      if (item === base.key) {
        light.intensity = item.intensity * day * preset.clear;
        light.color.copy(item.color).lerp(warm, (1 - day) * 0.6);
        // 太阳方位随时间东升西落（绕场景中心水平旋转），高度随 day 变化。
        const offset = item.position.clone().sub(base.center);
        const r = offset.length();
        const az = Math.atan2(offset.z, offset.x) + ((hours - 12) / 12) * Math.PI * 0.6;
        const el = Math.max(0.12, Math.asin(Math.min(1, offset.y / r)) * (0.35 + 0.65 * day));
        light.position.set(base.center.x + Math.cos(az) * Math.cos(el) * r, base.center.y + Math.sin(el) * r, base.center.z + Math.sin(az) * Math.cos(el) * r);
        light.castShadow = day > 0.05;
      } else {
        light.intensity = item.intensity * (0.25 + 0.75 * day) * (0.6 + 0.4 * preset.clear);
      }
    }
    scene.environmentIntensity = base.envIntensity * (0.2 + 0.8 * day) * (0.7 + 0.3 * preset.clear);
    scene.backgroundIntensity = (base.bgIntensity ?? 1) * (0.15 + 0.85 * day) * (0.75 + 0.25 * preset.clear);
    host.renderer.toneMappingExposure = base.exposure * (0.65 + 0.35 * day);
    if (base.fog && scene.fog) {
      scene.fog.density = base.fog.density * preset.fog;
      scene.fog.color.copy(preset.fogColor ? new T.Color(preset.fogColor) : base.fog.color).multiplyScalar(0.3 + 0.7 * day);
    }
    host.updateShadows();
  }

  return {
    setTime(hhmm) { const [h, m] = String(hhmm).split(":").map(Number); minutes = h * 60 + (m || 0); apply(); },
    setWeather(next) { weather = WEATHER[next] ? next : "Sunny"; apply(); },
    reset() {
      minutes = 720; weather = "Sunny";
      if (!base) return;
      const scene = host.scene;
      for (const item of base.lights) {
        item.light.intensity = item.intensity; item.light.color.copy(item.color); item.light.position.copy(item.position);
        if (item.ground) item.light.groundColor.copy(item.ground);
        if (item === base.key) item.light.castShadow = true;
      }
      scene.environmentIntensity = base.envIntensity;
      if (base.bgIntensity !== undefined) scene.backgroundIntensity = base.bgIntensity;
      host.renderer.toneMappingExposure = base.exposure;
      if (base.fog && scene.fog) { scene.fog.density = base.fog.density; scene.fog.color.copy(base.fog.color); }
      host.updateShadows();
    },
    /** 场景配置包重新应用后（换版）光照对象已更换：丢弃旧记录，下次调节时重新采集。 */
    invalidate() { base = null; minutes = 720; weather = "Sunny"; },
    state: () => ({ time: `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`, weather }),
    weathers: WEATHER,
  };
}
