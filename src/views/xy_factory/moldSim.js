// 模温仿真（注塑模具型腔温度 + 冷却水路平衡 + 成型周期）：与“热成像”（设备外表面温度）不同，这里分析的是模具内部的
// 工艺温度场——决定制品顶出温度、收缩翘曲与成型节拍。模型为一维集总传热近似，参数取自 PP/PE 医用注射器典型工艺：
//   · 每个型腔在充填 + 保压阶段被熔体加热到峰值 Tpeak = Tw + (Tmelt − Tw)·k，随后按时间常数 τ 指数冷却到冷却水温 Tw；
//   · 冷却水沿回路吸热升温，越靠近出水口的型腔 Tw 越高；
//   · τ 与回路流量的关系按 Dittus–Boelter（换热系数 ∝ Re^0.8）：τ = τ0 · (Q0 / Q)^0.8；
//   · 制品可顶出条件：平均温度 ≤ 顶出温度，所需冷却时间 tc = τp · ln((Tmelt − Tw) / (Teject − Tw))，τp = 1.6τ。
// 最慢型腔决定整模冷却时间，进而决定成型周期（充填 + 保压 + 冷却 + 开合模顶出）。

export const moldSims = [
  {
    id: "ZSJ-A", name: "注塑机 A（FANUC-13）", part: "5 mL 针筒", resin: "医用 PP", cavities: [4, 8], melt: 230, eject: 75, setTemp: 40,
    phases: { fill: 0.8, pack: 2.6, open: 1.6 }, nominalQ: 12, tau0: 2.75, k: 0.38,
    circuits: [{ id: "L1", name: "定模左回路", flow: 12.4 }, { id: "R1", name: "定模右回路", flow: 12.1 }, { id: "L2", name: "动模左回路", flow: 11.8 }, { id: "R2", name: "动模右回路", flow: 12.2 }],
    note: "四路冷却均衡，型腔温差小，节拍受保压时间限制。",
  },
  {
    id: "ZSJ-B", name: "注塑机 B（FANUC-14）", part: "针帽", resin: "医用 PE", cavities: [6, 8], melt: 210, eject: 65, setTemp: 30,
    phases: { fill: 0.5, pack: 1.6, open: 1.4 }, nominalQ: 10, tau0: 1.9, k: 0.34,
    circuits: [{ id: "L1", name: "定模左回路", flow: 10.2 }, { id: "R1", name: "定模右回路", flow: 9.6 }, { id: "L2", name: "动模左回路", flow: 10.4 }, { id: "R2", name: "动模右回路", flow: 8.1 }],
    note: "动模右回路流量偏低 19%，右下角型腔偏热，针帽口部易缩痕。",
  },
  {
    id: "ZSJ-F17", name: "注塑机 FANUC-17", part: "5 mL 针筒", resin: "医用 PP", cavities: [4, 8], melt: 241, eject: 75, setTemp: 40,
    phases: { fill: 0.8, pack: 2.6, open: 1.6 }, nominalQ: 12, tau0: 2.75, k: 0.38,
    circuits: [{ id: "L1", name: "定模左回路", flow: 12.0 }, { id: "R1", name: "定模右回路", flow: 7.2 }, { id: "L2", name: "动模左回路", flow: 11.6 }, { id: "R2", name: "动模右回路", flow: 6.8 }],
    note: "告警关联：右半模两路流量仅 7 L/min（水垢堵塞），料筒超温 +11 °C，右侧型腔冷却慢，整模节拍被拖长。",
  },
];

const round = (v, n = 1) => Number(v.toFixed(n));

/** 型腔所属回路：左右按列、定 / 动模按行（上半 / 下半）。流向：从模具中缝（内侧）进水、向外侧出水。 */
function circuitOf(sim, r, c) {
  const [rows, cols] = sim.cavities;
  const left = c < cols / 2;
  const top = r < rows / 2;
  const id = `${left ? "L" : "R"}${top ? 1 : 2}`;
  const half = cols / 2;
  const along = left ? (half - 1 - c) / Math.max(1, half - 1) : (c - half) / Math.max(1, half - 1);
  return { id, along };
}

/**
 * 计算整模状态。opts：{ setTemp, flowScale: { L1, R1, … } 流量倍率 }。
 * 返回各型腔参数、各回路进 / 出水温、所需冷却时间、周期与建议。
 */
export function solveMold(sim, opts = {}) {
  const setTemp = opts.setTemp != null ? opts.setTemp : sim.setTemp;
  const flows = Object.fromEntries(sim.circuits.map((c) => [c.id, c.flow * ((opts.flowScale || {})[c.id] || 1)]));
  const [rows, cols] = sim.cavities;
  const perCircuit = (rows * cols) / sim.circuits.length;
  // 每个型腔每周期向冷却水释放的热量（kJ）≈ 制品质量 × 比热 × 温降；回路温升 ΔT = 热流 / (ṁ·c)。
  const heatPerCavity = 0.0012 * 2.0 * (sim.melt - sim.eject) * 1.6;
  const cycleGuess = sim.phases.fill + sim.phases.pack + 8 + sim.phases.open;
  const rise = (id) => (heatPerCavity * perCircuit / cycleGuess) / ((flows[id] / 60) * 4.18);
  const cavities = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const { id, along } = circuitOf(sim, r, c);
      const tw = setTemp + rise(id) * (0.15 + 0.85 * along);
      const tau = sim.tau0 * (sim.nominalQ / flows[id]) ** 0.8;
      const peak = tw + (sim.melt - tw) * sim.k;
      const cool = 1.6 * tau * Math.log((sim.melt - tw) / Math.max(1, sim.eject - tw));
      cavities.push({ r, c, circuit: id, tw, tau, peak, cool });
    }
  }
  const slowest = cavities.reduce((a, b) => (b.cool > a.cool ? b : a));
  const fastest = cavities.reduce((a, b) => (b.cool < a.cool ? b : a));
  const coolTime = slowest.cool;
  const cycle = sim.phases.fill + sim.phases.pack + coolTime + sim.phases.open;
  const ideal = sim.phases.fill + sim.phases.pack + fastest.cool + sim.phases.open;
  const circuits = sim.circuits.map((c) => {
    const list = cavities.filter((x) => x.circuit === c.id);
    const out = setTemp + rise(c.id);
    // 雷诺数（水，内径 10 mm，40 °C 运动黏度 0.66e-6 m²/s）：≥ 10000 为充分湍流。
    const v = (flows[c.id] / 60000) / (Math.PI * 0.005 ** 2);
    const re = Math.round((v * 0.01) / 0.66e-6);
    return { ...c, flow: round(flows[c.id]), in: round(setTemp), out: round(out), dt: round(out - setTemp, 2), re, turbulent: re >= 10000, cool: round(Math.max(...list.map((x) => x.cool))) };
  });
  const spread = Math.max(...cavities.map((x) => x.peak)) - Math.min(...cavities.map((x) => x.peak));
  const tips = [];
  circuits.filter((c) => !c.turbulent).forEach((c) => tips.push(`${c.name} Re=${c.re.toLocaleString()} 未达湍流，建议流量提升至 ≥ ${round((10000 / c.re) * c.flow)} L/min（清洗水垢 / 检查快接头）`));
  if (spread > 6) tips.push(`型腔峰值温差 ${round(spread)} °C，超过 6 °C 易导致各腔收缩不一致，建议平衡回路流量`);
  if (cycle - ideal > 0.8) tips.push(`最慢型腔拖慢节拍 ${round(cycle - ideal)} s，回路平衡后预计提产 ${round(((cycle - ideal) / cycle) * 100)}%`);
  if (!tips.length) tips.push("冷却均衡、充分湍流，可尝试将模温机设定降低 2–3 °C 进一步缩短冷却时间（注意针筒内壁光洁度）");
  return {
    setTemp, cavities, circuits, coolTime: round(coolTime), cycle: round(cycle), ideal: round(ideal), spread: round(spread),
    slowest, fastest, perHour: Math.round((3600 / cycle) * rows * cols), tips,
  };
}

/** 型腔在周期内 t 秒时的表面温度（°C）。 */
export function cavityTemp(sim, cav, t, cycle) {
  const { fill, pack } = sim.phases;
  const x = ((t % cycle) + cycle) % cycle;
  const packEnd = fill + pack;
  const residual = cav.tw + (cav.peak - cav.tw) * Math.exp(-(cycle - packEnd) / cav.tau);
  if (x <= fill) return residual + (cav.peak - residual) * (1 - Math.exp(-x / (fill * 0.35)));
  if (x <= packEnd) return cav.peak - (cav.peak - cav.tw) * 0.08 * ((x - fill) / pack);
  const start = cav.peak - (cav.peak - cav.tw) * 0.08;
  return cav.tw + (start - cav.tw) * Math.exp(-(x - packEnd) / cav.tau);
}

/** 制品平均温度（用于判断是否可顶出），t 为本周期内时间。 */
export function partTemp(sim, cav, t) {
  const { fill, pack } = sim.phases;
  if (t <= fill + pack) return sim.melt - (sim.melt - cav.peak) * 0.25 * (t / (fill + pack));
  const start = sim.melt - (sim.melt - cav.peak) * 0.25;
  return cav.tw + (start - cav.tw) * Math.exp(-(t - fill - pack) / (1.6 * cav.tau));
}
