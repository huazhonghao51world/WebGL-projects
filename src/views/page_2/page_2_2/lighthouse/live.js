/**
 * 产线实时数据模拟（演示用）：1 s 一帧，生成设备四态、温度、功率、告警，并保留 2 h 历史用于回放。
 * 对接真实系统时只需替换本文件的 tick / history 数据源，页面与三维调用不变。
 */
const DRIVEN_KINDS = ["equipment.", "energy.", "hvac.", "radiation.", "logistics."];
const ALARM_TEXT = {
  "equipment.cnc": ["主轴温度过高", "刀具磨损超限", "冷却液压力低"],
  "equipment.robot": ["关节扭矩异常", "抓取失败"],
  "equipment.laser-welder": ["激光功率波动", "保护气压力低"],
  "equipment.xray": ["射线管电压异常", "检测图像丢帧"],
  "energy.air-compressor": ["排气温度过高", "油分压差高"],
  "energy.chiller": ["冷凝压力高"],
  default: ["通讯中断", "运行参数越限"],
};
const AREA_NAME = { "line-a": "加工产线", "energy-station": "能源站", hvac: "屋面暖通", logistics: "物流转运", asrs: "立体仓库", safety: "安全设施", site: "厂区", energy: "能源站", roof: "屋面暖通", warehouse: "立体仓库" };

export const HISTORY_SECONDS = 2 * 3600;
export const HISTORY_STEP = 60;

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function drivenDevices(devices) {
  return devices.filter((item) => DRIVEN_KINDS.some((prefix) => item.kind.startsWith(prefix)));
}
export function areaName(area) {
  return AREA_NAME[area] || area;
}

export function createLive(devices) {
  const list = drivenDevices(devices);
  const now = Date.now();
  const metrics = {};
  for (const item of list) {
    metrics[item.id] = {
      id: item.id,
      status: Math.random() < 0.12 ? "idle" : "running",
      speed: 1,
      temperature: +rand(32, 48).toFixed(1),
      power: +(item.power ? item.power * rand(0.5, 0.85) : rand(2, 12)).toFixed(1),
      runtime: Math.round(rand(600, 6000)),
      oee: +rand(0.78, 0.94).toFixed(3),
    };
  }

  // 2 h 合成历史：每分钟一帧。同一份场景脚本同时生成历史帧、事件流与告警中心的预置告警，保证回放终点与实时状态一致。
  const scenario = SCENARIO.filter((entry) => list.some((item) => item.id === entry.id));
  const history = buildHistory(list, scenario, now);

  let alarmSeq = 1;
  // 告警节奏：全厂平均约 10 分钟一条、两条之间至少间隔 5 分钟，约 1/4 为紧急（会停机），其余为预警。
  const ALARM_MEAN_SECONDS = 600;
  const ALARM_MIN_GAP_SECONDS = 300;
  let quietSeconds = 120; // 开场 2 分钟内不出新告警，首屏只看预置告警
  return {
    metrics,
    history,
    /** 推进一帧，返回本帧新产生的告警（全厂级低频，由页面决定是否下发到三维）。 */
    tick() {
      const raised = [];
      for (const item of list) {
        const value = metrics[item.id];
        if (value.status === "running") {
          value.runtime += 1;
          value.temperature = +Math.min(78, Math.max(28, value.temperature + rand(-0.4, 0.45))).toFixed(1);
          value.power = +Math.max(0.5, value.power + rand(-0.3, 0.3)).toFixed(1);
        } else {
          value.temperature = +Math.max(26, value.temperature - 0.15).toFixed(1);
        }
        if (value.status === "idle" && Math.random() < 0.02) value.status = "running";
      }
      quietSeconds -= 1;
      if (quietSeconds <= 0 && Math.random() < 1 / (ALARM_MEAN_SECONDS - ALARM_MIN_GAP_SECONDS)) {
        const running = list.filter((item) => metrics[item.id].status === "running");
        if (running.length) {
          raised.push(this.makeAlarm(pick(running), Math.random() < 0.25 ? "critical" : "warning"));
          quietSeconds = ALARM_MIN_GAP_SECONDS;
        }
      }
      return raised;
    },
    makeAlarm(item, level = "critical", message) {
      const text = message || pick(ALARM_TEXT[item.kind] || ALARM_TEXT.default);
      if (level === "critical") metrics[item.id].status = "fault";
      return {
        id: `ALM-${String(alarmSeq++).padStart(4, "0")}`,
        deviceId: item.id,
        deviceName: item.name,
        area: item.area,
        kind: item.kind.split(".")[0],
        level,
        message: text,
        time: Date.now(),
        state: "open",
      };
    },
    /** 预置告警：来自同一份场景脚本（已恢复的为已关闭，未恢复的为待处置）。 */
    seedAlarms() {
      return scenario
        .filter((entry) => entry.level)
        .map((entry) => {
          const item = list.find((device) => device.id === entry.id);
          const alarm = { ...this.makeAlarm(item, "warning", entry.message), level: entry.level, time: now - entry.from * 60000 };
          alarm.state = entry.to == null ? "open" : "closed";
          return alarm;
        });
    },
    /** 以当前时刻为终点重建 2 h 历史（回放打开时调用，保证时间轴与实时衔接）。 */
    rebuildHistory() {
      return buildHistory(list, scenario, Date.now(), metrics);
    },
  };
}

/**
 * 场景脚本（分钟 = 距今多少分钟）：level 为告警（critical 期间设备故障），status 为非告警的状态段（如计划停机）。
 * to 为 null 表示持续至今。
 */
const SCENARIO = [
  { id: "XR-01", level: "warning", message: "检测图像丢帧", from: 104, to: 97 },
  { id: "CNC-02", level: "critical", message: "主轴温度过高", from: 82, to: 66 },
  { id: "AC-01", level: "warning", message: "排气温度偏高", from: 52, to: null },
  { id: "AC-02", status: "stopped", message: "计划停机保养", from: 48, to: 22 },
  { id: "RB-01", level: "warning", message: "关节扭矩异常", from: 31, to: null },
];

function buildHistory(list, scenario, now, live) {
  const frames = [];
  const events = [];
  const total = HISTORY_SECONDS / HISTORY_STEP;
  for (let index = 0; index <= total; index++) {
    const ago = total - index; // 分钟
    const frame = { index, time: now - ago * HISTORY_STEP * 1000, states: {}, temps: {}, alarms: [] };
    for (const item of list) {
      let status = "running";
      const seed = [...item.id].reduce((sum, ch, k) => sum + ch.charCodeAt(0) * (k * 13 + 7), 0);
      if ((index + seed) % 47 < 3) status = "idle";
      let heat = 0;
      for (const entry of scenario) {
        if (entry.id !== item.id || ago > entry.from || (entry.to != null && ago <= entry.to)) continue;
        if (entry.status) status = entry.status;
        if (entry.level === "critical") { status = "fault"; heat = Math.min(1, (entry.from - ago) / 6); }
        if (entry.level) frame.alarms.push({ id: item.id, level: entry.level, message: entry.message });
      }
      // 终点帧与实时数据对齐
      if (ago === 0 && live && live[item.id]) status = live[item.id].status;
      const base = 38 + (seed % 9);
      const temp = status === "running" ? base + Math.sin((index + seed) / 9) * 3 : base - 6;
      frame.temps[item.id] = +(temp + heat * 34).toFixed(1);
      frame.states[item.id] = status;
    }
    frames.push(frame);
  }
  // 事件流：状态切换 + 告警产生 / 解除
  for (let index = 1; index < frames.length; index++) {
    const prev = frames[index - 1];
    const cur = frames[index];
    for (const alarm of cur.alarms) if (!prev.alarms.some((a) => a.id === alarm.id)) events.push({ index, time: cur.time, id: alarm.id, kind: alarm.level, text: `${alarm.level === "critical" ? "紧急告警" : "预警"}：${alarm.message}` });
    for (const alarm of prev.alarms) if (!cur.alarms.some((a) => a.id === alarm.id)) events.push({ index, time: cur.time, id: alarm.id, kind: "clear", text: `告警解除：${alarm.message}` });
    for (const entry of scenario.filter((e) => e.status)) {
      if (prev.states[entry.id] !== entry.status && cur.states[entry.id] === entry.status) events.push({ index, time: cur.time, id: entry.id, kind: "stopped", text: entry.message });
      if (prev.states[entry.id] === entry.status && cur.states[entry.id] !== entry.status) events.push({ index, time: cur.time, id: entry.id, kind: "clear", text: `${entry.message}结束，恢复运行` });
    }
  }
  return { frames, events };
}
