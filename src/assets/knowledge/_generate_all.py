# -*- coding: utf-8 -*-
"""Generate full lighthouse factory dual-carbon knowledge base + demo chat store."""
from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEMO_JS = ROOT.parent / "demo" / "js" / "knowledgeStore.js"

# Shared demo facts (align rightModules / sim)
FACT = {
    "site": "灯塔2030智能工厂（演示示意厂区）",
    "today_tce": "18.6",
    "today_mwh": "142",
    "fossil_tce": "4.1",
    "meters_online": "128/132",
    "month_tce": "4120",
    "unit_product": "1.28",
    "unit_output": "0.086",
    "unit_va": "0.142",
    "peak_cost_pct": "38",
    "clean_power_pct": "41",
    "power_share": "76",
    "ef_grid": "0.536",
    "ef_version": "2024区域电网平均排放因子·演示版 v1.2",
    "sankey_in": "186",
    "util_pct": "71",
    "conv_loss": "18",
    "dist_loss": "11",
    "eff_now": "71.2",
    "eff_opt": "74.8",
    "month_save_tce": "126",
    "carbon_month_t": "2840",
    "carbon_intensity": "0.68",
    # 电费（与 142 MWh、峰段费用占比约 38% 对齐的演示结算）
    "today_bill_wan": "11.26",
    "today_purchase_mwh": "119.8",
    "today_pv_self_mwh": "21.4",
    "today_energy_charge_wan": "9.44",
    "today_demand_wan": "1.62",
    "today_other_wan": "0.20",
    "today_peak_cost_wan": "4.28",
}


def w(rel: str, text: str) -> Path:
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text.lstrip("\n").rstrip() + "\n", encoding="utf-8")
    return p


def wcsv(rel: str, headers: list[str], rows: list[list]) -> Path:
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    return p


def dump_jsonish(rel: str, obj) -> Path:
    """Write YAML-looking JSON (no PyYAML dependency)."""
    text = json.dumps(obj, ensure_ascii=False, indent=2)
    return w(rel, text)


# ---------- 00_index ----------
def gen_00():
    w(
        "00_index/README.md",
        f"""
# 灯塔2030 · 双碳能源问答资料库

> **性质**：演示示意数据，用于 VerifyLoop Demo 自然语言问答检索。  
> **厂区**：{FACT['site']}  
> **统计日**：演示「今日」快照；月度累计与右栏模块 KPI 对齐。  
> **硬约束**：场内光伏为辅电，≠外购购电；外购主通道止于厂内变电所。

## 目录分区

| 目录 | 用途 |
|---|---|
| 01_site | 厂区对象、分区、拓扑、边界 |
| 02_metering | 计量点台账与数据质量 |
| 03_energy_timeseries | 能耗时序与 KPI 快照 |
| 04_factors_methods | 折标、碳因子、口径方法 |
| 05_assets | 设施/分区专档 |
| 06_flow_balance | 能流桑基与损失 |
| 07_efficiency_benchmark | 强度与对标 |
| 08_strategy_opt | 策略卡与验策交接 |
| 09_budget_forecast | 用能/碳预算 |
| 10_carbon_inventory | 排放核算 |
| 11_product_cfp | 产品碳足迹 |
| 12_supply_chain | 供应链碳 |
| 13_verification | 核查证据 |
| 14_carbon_assets | 配额与履约 |
| 15_alerts_incidents | 异常与上报 |
| 16_org_policy | 目标与制度 |
| 17_glossary | 术语与种子问句 |
| 18_power_pricing | 电价电费：峰谷/阶梯/购电主体/电类型/微电网结算 |
| 19_direct_answers | 直答专档：钱量/状态/名单/参数/对比/差额/验策/边界 |
| 99_manifest | 清单与免责声明 |

引用回答时请带上**统计期**与**口径版本**。问「花了多少钱 / 是否 / 哪些 / 算不算」优先查 `18`/`19`。
""",
    )
    dump_jsonish(
        "00_index/catalog.json",
        {
            "name": "lighthouse2030-kb",
            "version": "1.0.0",
            "disclaimer": "demo-synthetic",
            "root": "knowledge/",
        },
    )
    dump_jsonish(
        "00_index/module_map.json",
        {
            "energy_query": ["03_energy_timeseries", "18_power_pricing", "02_metering", "05_assets"],
            "intensity": ["07_efficiency_benchmark", "04_factors_methods", "03_energy_timeseries"],
            "analysis_reco": ["18_power_pricing", "08_strategy_opt", "03_energy_timeseries", "07_efficiency_benchmark"],
            "benchmark": ["07_efficiency_benchmark", "05_assets"],
            "flow": ["06_flow_balance", "01_site", "05_assets"],
            "balance_opt": ["08_strategy_opt", "06_flow_balance"],
            "budget": ["09_budget_forecast", "10_carbon_inventory"],
            "carbon_account": ["10_carbon_inventory", "04_factors_methods", "05_assets"],
            "product_cfp": ["11_product_cfp", "12_supply_chain"],
            "supply_chain": ["12_supply_chain", "11_product_cfp"],
            "verification": ["13_verification", "04_factors_methods", "02_metering"],
            "carbon_asset": ["14_carbon_assets", "09_budget_forecast"],
            "verify": ["08_strategy_opt", "01_site", "04_factors_methods", "03_energy_timeseries"],
        },
    )
    dump_jsonish(
        "00_index/persona_intents.json",
        {
            "值班": ["查数", "异常", "班次", "设备"],
            "能碳专责": ["口径", "因子", "强度", "预算", "核查"],
            "工艺": ["优化确认", "对产线影响", "参数"],
            "管理": ["结论摘要", "降本降碳", "履约风险", "可验策策略"],
            "审计": ["证据链", "版本", "边界", "可复算"],
        },
    )


# ---------- 01_site ----------
def gen_01():
    w(
        "01_site/site_profile.md",
        f"""
# 厂区概况

- **名称**：{FACT['site']}
- **形态**：沿海山谷灯塔工厂数字孪生；含工艺储罐区、烟囱排放口、自动化生产车间、平库与**立式仓库（高架库 AS/RS）**、蓝拱仓储、装卸车队、山体隧道物流通道、公辅管廊、办公楼。
- **能源结构**：外购电力为主（今日电力折标占比约 {FACT['power_share']}%），辅以天然气/柴油等化石燃料、热力及氢/氨/甲醇示意燃料；场内分布式光伏为**辅电**。
- **双碳定位**：能耗监视 → 强度核算 → 策略推荐 → 能源验策验证 → 碳核算/足迹/核查/履约。
- **今日综合能耗**：{FACT['today_tce']} tce；电力合计 {FACT['today_mwh']} MWh。
""",
    )
    dump_jsonish(
        "01_site/site_objects.json",
        {
            "objects": [
                {"id": "grid", "name": "并网点", "zone": "受电", "role": "外购电入厂关口"},
                {"id": "substation", "name": "厂内变电所", "zone": "动力", "role": "受电枢纽与分配"},
                {"id": "pv", "name": "楼顶/场内光伏", "zone": "可再生", "role": "辅电，非购电"},
                {"id": "storage", "name": "储能站", "zone": "动力", "role": "削峰填谷"},
                {"id": "generator", "name": "备用柴发", "zone": "应急", "role": "顶峰/应急，Scope1"},
                {"id": "air", "name": "空压站", "zone": "动力", "role": "压缩空气，高耗转换"},
                {"id": "cooling", "name": "制冷站", "zone": "动力", "role": "工艺与库区温控"},
                {"id": "workshop", "name": "生产车间", "zone": "生产", "role": "主用电负荷，可移峰"},
                {"id": "warehouse_flat", "name": "平库/拱顶仓储", "zone": "仓储", "role": "成品/原料平库"},
                {"id": "warehouse_vertical", "name": "立式仓库", "zone": "仓储", "role": "AS/RS高架库，重点用电"},
                {"id": "tank_farm", "name": "储罐区", "zone": "工艺公用", "role": "球罐/立罐燃料与介质"},
                {"id": "process", "name": "工艺装置区", "zone": "工艺", "role": "塔器管廊与过程用能"},
                {"id": "stack", "name": "烟囱排放口", "zone": "环保", "role": "Scope1烟气监测点"},
                {"id": "utility", "name": "公辅管廊", "zone": "公辅", "role": "介质分配与损失"},
                {"id": "logistics", "name": "装卸与车队区", "zone": "物流", "role": "运输碳与装卸用电"},
                {"id": "tunnel", "name": "山体隧道通道", "zone": "物流", "role": "进出厂物流通道"},
                {"id": "office", "name": "办公楼", "zone": "管理", "role": "管理用电与碳资产办公视角"},
            ]
        },
    )
    dump_jsonish(
        "01_site/zone_map.json",
        {
            "zones": [
                {"id": "production", "name": "生产", "includes": ["workshop"]},
                {"id": "power", "name": "动力", "includes": ["substation", "air", "cooling", "storage"]},
                {"id": "utility", "name": "公辅", "includes": ["utility", "process", "tank_farm"]},
                {"id": "warehouse", "name": "仓储", "includes": ["warehouse_flat", "warehouse_vertical"]},
                {"id": "logistics", "name": "物流", "includes": ["logistics", "tunnel"]},
                {"id": "office", "name": "办公", "includes": ["office"]},
                {"id": "renewable", "name": "可再生", "includes": ["pv"]},
                {"id": "gate", "name": "受电边界", "includes": ["grid"]},
            ]
        },
    )
    dump_jsonish(
        "01_site/topology_power.json",
        {
            "rules": [
                "外购：grid → substation（禁止把外购主通道画进车间）",
                "光伏辅电：pv → substation",
                "储能：storage → substation；验策成果可表现 substation → grid",
                "柴发：generator → substation",
                "空压：air → workshop（压缩空气服务生产）",
                "馈线示意：substation → workshop / warehouse_vertical / warehouse_flat / air / cooling / office / logistics",
            ],
            "feeders": [
                {"from": "substation", "to": "workshop", "name": "生产馈线"},
                {"from": "substation", "to": "warehouse_vertical", "name": "立式库馈线"},
                {"from": "substation", "to": "warehouse_flat", "name": "平库馈线"},
                {"from": "substation", "to": "air", "name": "空压馈线"},
                {"from": "substation", "to": "cooling", "name": "制冷馈线"},
                {"from": "substation", "to": "office", "name": "办公馈线"},
            ],
        },
    )
    dump_jsonish(
        "01_site/topology_fuel_thermal.json",
        {
            "natural_gas": "门站 → 管廊 → 工艺/锅炉用气点",
            "diesel": "油库/罐区 → 柴发及应急设备",
            "thermal": "热源 → 管廊 → 车间/库区",
            "compressed_air": "空压站 → 干燥分配 → 车间用气点",
            "note": "介质拓扑为演示示意，用于能流与损失对话",
        },
    )
    w(
        "01_site/org_boundary.md",
        """
# 统计与碳核算组织边界

- **能耗统计边界**：厂区红线内用能单位，含生产、动力、公辅、仓储（平库+立式库）、物流辅助、办公。
- **碳核算边界（演示）**：
  - Scope1：燃料燃烧（含柴发）、过程排放（烟囱监测相关示意）
  - Scope2：外购电力（关口表）；场内光伏自用电不计入外购
  - Scope3（局部）：上游供应商物料、下游运输与产品足迹相关数据
- **不含**：生活区社会交通、员工通勤（本演示未纳入）。
""",
    )
    w(
        "01_site/naming_convention.md",
        """
# 编码规则（演示）

| 类型 | 规则 | 示例 |
|---|---|---|
| 计量点 | M-{介质}-{分区}-{序号} | M-EL-WS-001 车间电力 |
| 设备 | E-{系统}-{序号} | E-AIR-003 空压机3# |
| 产品 | P-{系列}-{代号} | P-A-01 产品A |
| 供应商 | S-{类别}-{序号} | S-RAW-012 |
| 策略卡 | S0x_... | S01_peak_shift_workshop |
| 立式库巷道 | ASRS-A/B/... | ASRS-A-01 |
""",
    )


# ---------- 02_metering ----------
def gen_02():
    rows = [
        ["M-EL-GATE-001", "电力", "并网点", "关口总表", "1.0", "online"],
        ["M-EL-SUB-001", "电力", "变电所", "主变低压侧", "1.0", "online"],
        ["M-EL-WS-001", "电力", "生产车间", "车间总进线", "1.0", "online"],
        ["M-EL-WS-CRANE", "电力", "生产车间", "天车回路", "1.0", "online"],
        ["M-EL-ASRS-001", "电力", "立式仓库", "高架库总进线", "1.0", "online"],
        ["M-EL-ASRS-STK", "电力", "立式仓库", "堆垛机群", "1.0", "online"],
        ["M-EL-WH-001", "电力", "平库", "平库总进线", "1.0", "online"],
        ["M-EL-AIR-001", "电力", "空压站", "空压总进线", "1.0", "online"],
        ["M-EL-CLG-001", "电力", "制冷站", "制冷总进线", "1.0", "offline"],
        ["M-EL-PV-001", "电力", "光伏", "逆变器汇总", "1.0", "online"],
        ["M-EL-BESS-001", "电力", "储能", "PCS关口", "1.0", "online"],
        ["M-EL-OFF-001", "电力", "办公楼", "办公进线", "1.0", "online"],
        ["M-NG-001", "天然气", "门站", "用气总表", "1.0", "online"],
        ["M-DS-GEN-001", "柴油", "柴发", "油耗计量", "1.0", "online"],
        ["M-TH-001", "热力", "管廊", "热力入口", "1.0", "online"],
        ["M-H2-001", "氢", "罐区", "氢计量示意", "1.0", "offline"],
        ["M-NH3-001", "氨", "罐区", "氨计量示意", "1.0", "offline"],
        ["M-MEOH-001", "甲醇", "罐区", "甲醇计量示意", "1.0", "online"],
        ["M-EL-LOG-001", "电力", "物流区", "装卸用电", "1.0", "online"],
        ["M-EL-UTL-001", "电力", "公辅", "管廊配电", "1.0", "offline"],
    ]
    # pad to feel like 132 points conceptually - add more workshop panels
    for i in range(2, 15):
        rows.append([f"M-EL-WS-{i:03d}", "电力", "生产车间", f"产线配电{i}", "1.0", "online"])
    wcsv(
        "02_metering/meter_registry.csv",
        ["meter_id", "medium", "zone", "name", "ratio", "status"],
        rows,
    )
    dump_jsonish(
        "02_metering/meter_hierarchy.json",
        {
            "root": "M-EL-GATE-001",
            "children": {
                "M-EL-GATE-001": ["M-EL-SUB-001", "M-EL-PV-001"],
                "M-EL-SUB-001": [
                    "M-EL-WS-001",
                    "M-EL-ASRS-001",
                    "M-EL-WH-001",
                    "M-EL-AIR-001",
                    "M-EL-CLG-001",
                    "M-EL-BESS-001",
                    "M-EL-OFF-001",
                    "M-EL-LOG-001",
                    "M-EL-UTL-001",
                ],
                "M-EL-ASRS-001": ["M-EL-ASRS-STK"],
                "M-EL-WS-001": ["M-EL-WS-CRANE"],
            },
        },
    )
    w(
        "02_metering/data_quality.md",
        f"""
# 数据质量规则（演示）

- **在线率目标**：≥97%。当前演示：计量点在线 **{FACT['meters_online']}**。
- **缺测处理**：连续缺测 >15 分钟标黄；>2 小时用上一日同时段估抄并标注「估」。
- **关口优先**：与下级分项不平衡超过 3% 时，以关口为准并生成差异工单。
- **氢/氨点**：示意计量，部分点可能离线，查询时需提示数据完整度。
""",
    )
    wcsv(
        "02_metering/calibration_log.csv",
        ["meter_id", "last_cal_date", "next_due", "result"],
        [
            ["M-EL-GATE-001", "2025-11-02", "2026-11-02", "合格"],
            ["M-EL-ASRS-001", "2025-09-18", "2026-09-18", "合格"],
            ["M-EL-AIR-001", "2025-12-01", "2026-12-01", "合格"],
            ["M-NG-001", "2025-08-20", "2026-08-20", "合格"],
            ["M-EL-CLG-001", "2025-06-12", "2026-06-12", "待复核"],
        ],
    )
    w(
        "02_metering/offline_points_today.md",
        """
# 今日离线计量点（4）

| 点位 | 位置 | 影响 | 建议 |
|---|---|---|---|
| M-EL-CLG-001 | 制冷站总进线 | 制冷分项暂估 | 现场巡检通讯 |
| M-H2-001 | 氢计量 | 氢分项不可用 | 检查变送器 |
| M-NH3-001 | 氨计量 | 氨分项不可用 | 检查变送器 |
| M-EL-UTL-001 | 公辅管廊配电 | 公辅电力暂估 | 检查采集网关 |

对话回答「计量点是否在线」时引用本表。
""",
    )


# ---------- 03_energy ----------
def gen_03():
    wcsv(
        "03_energy_timeseries/daily_by_fuel.csv",
        ["date", "electricity_mwh", "gas_tce", "diesel_tce", "heat_tce", "h2_other_tce", "total_tce"],
        [
            ["2026-08-04", 138, 2.1, 0.9, 0.7, 0.5, 17.9],
            ["2026-08-05", 142, 2.2, 0.95, 0.75, 0.55, 18.6],
            ["2026-08-06", 140, 2.15, 0.92, 0.72, 0.52, 18.2],
        ],
    )
    wcsv(
        "03_energy_timeseries/daily_by_zone.csv",
        ["date", "zone", "electricity_mwh", "share_pct"],
        [
            ["2026-08-05", "生产车间", 58.2, 41],
            ["2026-08-05", "立式仓库", 16.8, 12],
            ["2026-08-05", "空压站", 14.1, 10],
            ["2026-08-05", "平库仓储", 8.4, 6],
            ["2026-08-05", "制冷站", 9.2, 6],
            ["2026-08-05", "变电与线路", 7.5, 5],
            ["2026-08-05", "办公及其他", 12.0, 8],
            ["2026-08-05", "物流装卸", 5.0, 4],
            ["2026-08-05", "公辅工艺", 10.8, 8],
        ],
    )
    wcsv(
        "03_energy_timeseries/monthly_by_fuel.csv",
        ["month", "electricity_tce", "gas_tce", "diesel_tce", "heat_tce", "other_tce", "total_tce"],
        [["2026-07", 2980, 480, 210, 180, 140, 3990], ["2026-08", 3050, 490, 220, 185, 175, 4120]],
    )
    wcsv(
        "03_energy_timeseries/monthly_by_zone.csv",
        ["month", "zone", "tce"],
        [
            ["2026-08", "生产", 1680],
            ["2026-08", "动力", 920],
            ["2026-08", "仓储含立式库", 610],
            ["2026-08", "公辅", 520],
            ["2026-08", "物流办公等", 390],
        ],
    )
    wcsv(
        "03_energy_timeseries/tou_peak_flat_valley.csv",
        ["date", "peak_mwh", "flat_mwh", "valley_mwh", "peak_cost_share_pct"],
        [["2026-08-05", 48, 52, 42, 38], ["2026-08-04", 46, 51, 41, 37]],
    )
    wcsv(
        "03_energy_timeseries/pv_generation_daily.csv",
        ["date", "gen_mwh", "self_consume_mwh", "note"],
        [
            ["2026-08-05", 22.0, 21.4, "辅电入变电所，不计入外购"],
            ["2026-08-04", 20.5, 20.1, "辅电"],
        ],
    )
    wcsv(
        "03_energy_timeseries/storage_dispatch_daily.csv",
        ["date", "charge_mwh", "discharge_mwh", "peak_shave_mw"],
        [["2026-08-05", 8.2, 7.6, 0.85], ["2026-08-04", 7.8, 7.2, 0.78]],
    )
    wcsv(
        "03_energy_timeseries/generator_runtime.csv",
        ["date", "run_hours", "fuel_tce", "peak_mw", "mode"],
        [["2026-08-05", 0.6, 0.12, 0.18, "auto少量顶峰"], ["2026-08-04", 0.0, 0.0, 0.0, "待命"]],
    )
    wcsv(
        "03_energy_timeseries/air_compressor_daily.csv",
        ["date", "kwh", "specific_power", "leak_index", "status"],
        [["2026-08-05", 14100, 0.118, 0.22, "偏高-泄漏可疑"], ["2026-08-04", 13850, 0.116, 0.21, "偏高"]],
    )
    wcsv(
        "03_energy_timeseries/vertical_warehouse_daily.csv",
        ["date", "kwh", "throughput_pallets", "kwh_per_pallet", "avg_temp_c", "stacker_util_pct"],
        [["2026-08-05", 16800, 1260, 13.3, 18.5, 78], ["2026-08-04", 16100, 1180, 13.6, 18.2, 74]],
    )
    wcsv(
        "03_energy_timeseries/workshop_shift_daily.csv",
        ["date", "shift", "mwh", "note"],
        [
            ["2026-08-05", "早班", 22.4, "正常"],
            ["2026-08-05", "中班", 20.1, "正常"],
            ["2026-08-05", "夜班", 15.7, "含部分移峰负荷"],
        ],
    )
    dump_jsonish(
        "03_energy_timeseries/snapshots/today_kpi.json",
        {
            "date": "2026-08-05",
            "total_tce": FACT["today_tce"],
            "electricity_mwh": FACT["today_mwh"],
            "fossil_tce": FACT["fossil_tce"],
            "meters": FACT["meters_online"],
            "fuel_share_pct": {"电力": 76, "天然气": 12, "柴油": 5, "热力": 4, "氢/其他": 3},
            "top_zone_electricity": "生产车间",
            "asrs_mwh": 16.8,
            "pv_mwh": 22.0,
        },
    )
    dump_jsonish(
        "03_energy_timeseries/snapshots/month_kpi.json",
        {
            "month": "2026-08",
            "total_tce": FACT["month_tce"],
            "unit_product_tce_per_t": FACT["unit_product"],
            "unit_output_tce_per_wan": FACT["unit_output"],
            "unit_va_tce_per_wan": FACT["unit_va"],
            "yoy_unit_output_pct": -3.2,
        },
    )
    dump_jsonish(
        "03_energy_timeseries/snapshots/compare_yoy_mom.json",
        {
            "mom_total_tce_pct": 3.3,
            "yoy_unit_product_pct": -8.0,
            "yoy_unit_output_pct": -3.2,
            "yoy_unit_va_pct": -12.0,
            "peak_cost_share_pct": float(FACT["peak_cost_pct"]),
            "clean_power_pct": float(FACT["clean_power_pct"]),
        },
    )


# ---------- 04 factors ----------
def gen_04():
    w(
        "04_factors_methods/method_gbt2589.md",
        f"""
# 综合能源消费量与强度（GB/T 2589 演示口径）

## 综合消费量
各能源品种实物量 × 折标系数后求和，得综合能耗（tce）。  
本月累计演示值：**{FACT['month_tce']} tce**。

## 强度
- **单位产品能耗** = 综合消费量 / 主产品产量 → **{FACT['unit_product']} tce/吨**
- **单位产值能耗** = 综合消费量 / 产值(万元) → **{FACT['unit_output']} tce/万元**（同比 {FACT.get('yoy', '-3.2%')}）
- **单位增加值能耗** = 综合消费量 / 工业增加值(不变价，万元) → **{FACT['unit_va']} tce/万元**

## 等价值 vs 当量值
- **当量值**：按燃料热值折标。
- **等价值**：电力等按火力发电煤耗等价值折标（演示可切换核对）。  
回答强度问题时必须声明当前口径。
""",
    )
    wcsv(
        "04_factors_methods/conversion_factors_table.csv",
        ["fuel", "unit", "factor_tce_per_unit", "basis", "version"],
        [
            ["电力(当量)", "MWh", 0.1229, "当量值", "demo-v1.2"],
            ["电力(等价)", "MWh", 0.3000, "等价值示意", "demo-v1.2"],
            ["天然气", "万Nm3", 13.300, "当量", "demo-v1.2"],
            ["柴油", "t", 1.4571, "当量", "demo-v1.2"],
            ["热力", "GJ", 0.0341, "当量", "demo-v1.2"],
            ["氢", "t", 4.0, "示意", "demo-v1.2"],
            ["氨", "t", 0.9, "示意", "demo-v1.2"],
            ["甲醇", "t", 0.98, "示意", "demo-v1.2"],
        ],
    )
    w(
        "04_factors_methods/electricity_carbon_factor.md",
        f"""
# 外购电力碳因子

- **因子**：{FACT['ef_grid']} tCO2/MWh（演示）
- **版本**：{FACT['ef_version']}
- **适用范围**：关口外购电 Scope2
- **不适用**：场内光伏自发电量（辅电，不按外购因子计 Scope2）
- **柴发**：按燃料排放因子计入 Scope1，不走本因子

问答「为什么是 0.536」：引用本文件版本与适用范围。
""",
    )
    wcsv(
        "04_factors_methods/fuel_carbon_factors.csv",
        ["fuel", "unit", "ef_tco2", "scope", "version"],
        [
            ["天然气", "万Nm3", 21.62, "1", "demo-v1.2"],
            ["柴油", "t", 3.10, "1", "demo-v1.2"],
            ["外购电", "MWh", FACT["ef_grid"], "2", "demo-v1.2"],
        ],
    )
    w(
        "04_factors_methods/scope_boundary.md",
        """
# Scope 边界摘要

| Scope | 内容 | 典型对象 |
|---|---|---|
| 1 | 直接排放 | 柴发、燃料燃烧、过程/烟囱示意 |
| 2 | 间接能源 | 外购电关口 |
| 3 | 价值链（局部） | 供应商数据、运输、产品足迹 |

光伏辅电：减少外购电需求，从而降低 Scope2，但**本身不是外购电力**。
""",
    )
    w(
        "04_factors_methods/pv_assist_vs_purchase.md",
        """
# 场内光伏辅电 ≠ 外购购电

1. **购电**：仅经并网点进入的合同电（市电/售电/专线），路径表达为 并网点→变电所。  
2. **辅电**：场内光伏发电就地经变电所消纳，路径 光伏→变电所。  
3. **结算与碳**：购电走关口电量与区域因子；光伏自用不上购电账单，不按外购电计 Scope2。  
4. **对话禁则**：勿把「光伏发电量」说成「外购绿电」；绿证/绿电声明另见规则文件。
""",
    )
    w(
        "04_factors_methods/green_certificate_rules.md",
        """
# 绿证 / 绿电声明（演示规则）

- 物理绿电：场内光伏自用，计入清洁电力占比的物理部分。
- 绿证：外购侧可配置绿证比例，有额度上限；用于市场声明时须写清边界与证书编号（演示可虚拟）。
- 清洁电力占比演示值约 41% = 物理消纳 + 绿证声明部分。
- 禁止双重计算：同一度电不可同时按「零碳外购」与「未退证」重复声明。
""",
    )
    w(
        "04_factors_methods/allocation_rules.md",
        """
# 分摊规则（演示）

- **产量分摊**：主产品优先；辅产品按产量权重分摊综合能耗（需复核）。
- **仓储分摊**：立式库与平库电耗按吞吐托盘数或存储货位占用分摊到产品物流环节。
- **办公与公辅**：按面积或产值系数分摊到产品（足迹模块使用）。
- **变更**：分摊规则变更需记入 versions_changelog，并重算强度/足迹。
""",
    )
    w(
        "04_factors_methods/versions_changelog.md",
        """
# 口径与因子版本变更

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-01-15 | demo-v1.0 | 初版演示因子 |
| 2026-04-02 | demo-v1.1 | 补充氢氨甲醇示意折标 |
| 2026-07-01 | demo-v1.2 | 外购电因子调整为 0.536；明确光伏辅电口径 |
""",
    )


# ---------- 05 assets ----------
ASSETS = {
    "grid_poi.md": """# 并网点

- **角色**：外购电入厂关口；购电形式可为市电/售电/专线。
- **今日关口相关电力**：计入全厂 142 MWh 中的外购部分。
- **碳**：Scope2 按区域因子 0.536 tCO2/MWh。
- **拓扑**：仅连接至厂内变电所，不直接指向车间。
""",
    "substation.md": """# 厂内变电所

- **角色**：受电枢纽，汇聚外购、光伏辅电、储能、柴发，再馈线分配。
- **关注**：需量、负载率、承压告警（约 85% 阈值示意）。
- **损失**：转换环节主要损失点之一（与空压并列出现在能流分析）。
""",
    "pv_plant.md": """# 光伏（辅电）

- **今日发电**：约 22 MWh；自用约 21.4 MWh。
- **口径**：辅电 → 变电所；不计入外购购电。
- **离线影响**：光伏离线将抬升外购电与 Scope2。
""",
    "storage_bess.md": """# 储能站

- **功能**：削峰填谷、配合平滑/限需量策略。
- **今日**：充电 8.2 MWh / 放电 7.6 MWh；峰值削减约 0.85 MW。
- **可视化阈值**：功率过低时场景可不强调路径。
""",
    "generator_diesel.md": """# 备用柴发

- **模式**：auto / 强制 / 禁用。
- **今日**：自动模式少量顶峰约 0.6 h，油耗折标约 0.12 tce。
- **碳**：Scope1；强制顶峰会显著抬升排放，验策结果层可单独表达。
""",
    "air_compressor_station.md": """# 空压站

- **能效**：比功率约 0.118，泄漏指数 0.22（偏高）。
- **对标**：相对行业先进差距最大的动力站之一。
- **策略**：secure 默认不扰动；opt/leak 可视化空压→车间。
- **建议**：泄漏治理可进入策略卡并转验策。
""",
    "cooling_station.md": """# 制冷站

- **服务**：工艺冷却与库区（含立式库）温控。
- **注意**：总进线计量点今日离线，分项为估抄。
- **能效得分（对标）**：约 71 分（百分制示意）。
""",
    "workshop_production.md": """# 生产车间

- **今日用电**：约 58.2 MWh，全厂电力最高分区。
- **负荷**：产线、天车、电柜；可参与移峰（UI 0–30%，算法有效约≤18%）。
- **班次**：早/中/夜；夜班含部分移峰负荷。
- **强度关联**：单位产品能耗主贡献区。
""",
    "warehouse_flat.md": """# 平库 / 拱顶仓储

- **今日用电**：约 8.4 MWh。
- **功能**：原料/成品平置存放与拣选。
- **足迹**：仓储环节分摊的一部分；与立式库按吞吐规则分摊。
""",
    "warehouse_vertical_asrs.md": f"""# 立式仓库（高架库 AS/RS）

- **定位**：厂内重点仓储用电对象；自动化巷道堆垛机/穿梭系统。
- **今日**：用电约 **16.8 MWh**（全厂电力约 12%）；吞吐 1260 托；**13.3 kWh/托**；堆垛机利用率 78%；库温约 18.5℃。
- **电耗结构**：堆垛机行走提升、输送、库区温湿度控制、照明与控制系统。
- **对比平库**：节地与吞吐效率高，但单位吞吐电耗结构不同，不可与平库简单按面积对比。
- **优化方向**：错峰出入库、谷段预冷却、路径优化降低空驶；可形成策略卡 S05。
- **计量**：M-EL-ASRS-001 / M-EL-ASRS-STK。
- **模块关联**：能耗查询、供应链/产品足迹仓储分摊、能效对标。
""",
    "tank_farm.md": """# 储罐区（球罐 / 立罐）

- **介质**：天然气相关缓冲、柴油、热力介质及氢/氨/甲醇示意储运。
- **能源**：泵机与安全系统用电；燃料库存影响 Scope1 潜在排放。
- **安全**：压力/液位监测；对话可关联泄漏与应急柴发。
""",
    "process_units.md": """# 工艺装置区

- **构成**：塔器、开放钢构、复杂管廊。
- **用能**：工艺电、蒸汽/热、燃料。
- **碳**：与烟囱排放口监测联动（Scope1 示意）。
""",
    "stacks_emission_points.md": """# 烟囱与排放口

- **角色**：烟气与过程排放监测示意点。
- **用途**：碳排放核算超限预警、核查证据中的 CEMs/手工监测记录占位。
- **对话**：可问「排放口是否超限」——见 10_carbon_inventory / 15_alerts。
""",
    "utility_pipe_rack.md": """# 公辅与管廊

- **角色**：电/气/热/压缩空气分配。
- **损失**：管网/分配损失约占能流 11%（演示）。
- **计量**：公辅配电点今日离线，分析时需声明估抄。
""",
    "logistics_fleet_yard.md": """# 装卸与车队区

- **构成**：装卸用电、橙车队运输。
- **碳**：运输属 Scope3 / 产品足迹运输段；清洁运力提升见供应链模块。
- **今日装卸用电**：约 5.0 MWh。
""",
    "tunnel_access.md": """# 山体隧道物流通道

- **角色**：进出厂物流通道与道路衔接。
- **能源**：照明通风等辅助用电（计入物流/公辅）。
- **叙事**：供应链与物流时效，不单独作为购电关口。
""",
    "office_building.md": """# 办公楼

- **角色**：管理办公用电；碳资产管理视角常聚焦于此。
- **能耗**：相对生产/动力较低。
- **模块**：碳资产、制度与履约讨论入口。
""",
}
EQUIP = [
    ["E-AIR-001", "空压机1#", "空压站", "二级边缘", "待观察"],
    ["E-AIR-002", "空压机2#", "空压站", "低于二级", "待改造"],
    ["E-AIR-003", "空压机3#", "空压站", "低于二级", "待改造"],
    ["E-ASRS-STK-01", "堆垛机A1", "立式仓库", "达标", "优化调度"],
    ["E-ASRS-STK-02", "堆垛机A2", "立式仓库", "达标", "优化调度"],
    ["E-WS-CRANE-01", "天车1#", "生产车间", "达标", "正常"],
    ["E-CLG-01", "冷水机组1#", "制冷站", "二级边缘", "待观察"],
    ["E-BESS-PCS", "储能PCS", "储能站", "达标", "正常"],
    ["E-GEN-01", "柴发1#", "应急", "—", "待命"],
    ["E-XFMR-01", "主变", "变电所", "达标", "正常"],
]


def gen_05():
    for name, body in ASSETS.items():
        w(f"05_assets/{name}", body)
    wcsv(
        "05_assets/equipment_list_priority.csv",
        ["equipment_id", "name", "location", "efficiency_class", "action"],
        EQUIP,
    )


# ---------- 06 flow ----------
def gen_06():
    dump_jsonish(
        "06_flow_balance/sankey_power_today.json",
        {
            "unit": "MWh",
            "input_total": 186,
            "nodes": [
                {"id": "in", "label": "输入", "value": 186},
                {"id": "conv", "label": "转换", "value": 168},
                {"id": "dist", "label": "分配", "value": 152},
                {"id": "use", "label": "利用", "value": 132},
                {"id": "loss", "label": "损失", "value": 54},
            ],
            "stages": {
                "输入": {"电网关口": 164, "厂区光伏": 22},
                "转换": {"变电": 158, "空压": 10},
                "分配利用": {"生产": 78, "立式库": 17, "动力其他": 15, "公辅": 22},
                "损失": {"转换": "18%", "管网分配": "11%"},
            },
        },
    )
    dump_jsonish(
        "06_flow_balance/sankey_thermal.json",
        {"unit": "GJ", "input": 420, "useful": 310, "loss_pct": 26, "note": "热力能流示意"},
    )
    w(
        "06_flow_balance/loss_breakdown.md",
        f"""
# 损失归因（今日电力能流）

- **有效利用**：约 {FACT['util_pct']}%
- **转换损失**：约 {FACT['conv_loss']}% —— 主要在变电与空压转换
- **管网/分配损失**：约 {FACT['dist_loss']}% —— 公辅管廊与分配线路
- **治理优先**：空压泄漏与管网，其次立式库空驶与制冷估抄核实
""",
    )
    w(
        "06_flow_balance/energy_balance_month.md",
        f"""
# 月能量平衡说明（2026-08）

- 综合消费量累计 **{FACT['month_tce']} tce**。
- 电力主导；峰段成本权重偏高。
- 自产绿电经变电入网消纳，不计入外购电力。
- 立式库与车间为电力侧两大可优化负荷。
""",
    )
    w(
        "06_flow_balance/diagrams/power_main_path.md",
        """
# 电力主路径（对话复述用）

1. 外购：并网点 → 厂内变电所  
2. 光伏辅电：光伏 → 厂内变电所  
3. 储能/柴发：各自 → 厂内变电所  
4. 分配：变电所 → 车间 / 立式库 / 平库 / 空压 / 制冷 / 办公 / 物流  
5. 空压服务：空压站 → 车间用气  

损失旁路：转换损失、管网分配损失。
""",
    )


# ---------- 07 benchmark ----------
def gen_07():
    dump_jsonish(
        "07_efficiency_benchmark/intensity_indicators.json",
        {
            "month": "2026-08",
            "total_tce": 4120,
            "unit_product": 1.28,
            "unit_output": 0.086,
            "unit_va": 0.142,
            "vs_baseline_pct": {"unit_product": -8, "unit_output": -14, "unit_va": -12},
            "year_progress_pct": 62,
        },
    )
    wcsv(
        "07_efficiency_benchmark/benchmark_units.csv",
        ["unit", "score", "pass", "note"],
        [
            ["生产车间", 82, "Y", "主工序稳定"],
            ["空压站", 64, "N", "落后"],
            ["制冷站", 71, "Y", "边缘"],
            ["立式仓库", 76, "Y", "可优化调度"],
            ["变配电", 88, "Y", "稳定"],
        ],
    )
    wcsv(
        "07_efficiency_benchmark/benchmark_process.csv",
        ["process", "score", "benchmark"],
        [["加工", 82, "行业先进"], ["空压", 64, "行业先进"], ["制冷", 71, "国标2级"], ["变配", 88, "厂内最优"]],
    )
    wcsv(
        "07_efficiency_benchmark/benchmark_equipment.csv",
        ["equipment", "location", "score", "vs_l2"],
        [
            ["空压机2#", "空压站", 58, "低于2级"],
            ["空压机3#", "空压站", 60, "低于2级"],
            ["堆垛机群", "立式仓库", 79, "达2级"],
            ["冷水机组1#", "制冷站", 70, "边缘"],
            ["天车1#", "车间", 84, "优于2级"],
        ],
    )
    w(
        "07_efficiency_benchmark/gap_to_national_l2.md",
        """
# 相对国标 2 级差距

- **重点设备 ≥2 级占比**：约 72%。
- **落后待改造**：6 台（详见 retrofit_backlog）。
- **空压站**：对标百分制约 64，为主要短板。
- **立式仓库**：整体达 2 级，但 kWh/托仍有下降空间（目标示意 ≤12.5）。
""",
    )
    wcsv(
        "07_efficiency_benchmark/retrofit_backlog.csv",
        ["id", "equipment", "issue", "priority", "owner"],
        [
            ["R1", "空压机2#", "比功率高/泄漏", "高", "动力"],
            ["R2", "空压机3#", "老化效率低", "高", "动力"],
            ["R3", "干燥机旁路", "压损大", "中", "动力"],
            ["R4", "冷水机组1#", "部分负荷效率差", "中", "动力"],
            ["R5", "旧变频风机", "工频运行", "中", "公辅"],
            ["R6", "平库照明回路", "未分时光控", "低", "仓储"],
        ],
    )
    w(
        "07_efficiency_benchmark/shift_tou_monitor.md",
        f"""
# 班次与峰段监测

- 峰段电费占比 **{FACT['peak_cost_pct']}%**（目标 <32%）。
- 车间早班负荷最高；夜班已有部分移峰。
- 立式库峰段仍有出库高峰，适合错峰策略。
""",
    )


# ---------- 08 strategy ----------
STRATEGIES = {
    "S01_peak_shift_workshop.md": """# S01 车间移峰

- **动作**：将可中断/可平移负荷移出峰段，移峰比例示意 0–18% 有效。
- **预期**：降低峰段电费占比；对单位产品能耗影响需核产量。
- **验策**：workshopPct 滑条；场景车间围栏。
- **风险**：需工艺确认节拍。
""",
    "S02_storage_peak_shave.md": """# S02 储能削峰

- **动作**：峰段放电、谷段充电。
- **预期**：削减并网峰值；受 SOC 与功率上限约束。
- **验策**：storageMw；路径储能→变电。
""",
    "S03_air_leak_fix.md": """# S03 空压泄漏治理

- **动作**：查漏、压力优化、切换 opt 策略。
- **预期**：空压用电下降约 8–12%（示意）。
- **验策**：air=opt；场景空压→车间虚线。
""",
    "S04_pv_self_consume.md": """# S04 提高光伏消纳

- **动作**：负荷与光伏出力匹配；避免离线。
- **预期**：降低外购电与 Scope2。
- **口径**：仍是辅电，不是外购绿电。
""",
    "S05_asrs_offpeak.md": """# S05 立式库错峰出入库

- **动作**：非紧急出库改谷段；谷段预冷；减少峰段堆垛机同开。
- **预期**：立式库峰段电力下降 10–15%（示意）；kWh/托趋近 12.5。
- **验策**：可作为负荷侧约束叙述，或与移峰组合。
""",
    "S06_tou_procurement_cap.md": """# S06 峰段限购 / 需量

- **动作**：并网 limit / 峰段 cap / smooth 爬坡。
- **预期**：控制基本电费与购电节奏。
- **注意**：smooth 与 cap 是不同语义层。
""",
    "S07_process_param_opt.md": """# S07 工艺参数优化

- **动作**：大模型给出参数建议，**2 项待工艺确认**。
- **预期**：综合效率 71.2% → 74.8%；月节能约 126 tce。
- **风险**：未确认前不得直接下发。
""",
}


def gen_08():
    for k, v in STRATEGIES.items():
        w(f"08_strategy_opt/strategy_cards/{k}", v)
    w(
        "08_strategy_opt/reco_bundle_month.md",
        f"""
# 本月可落地策略包（3 条）

1. **车间移峰 + 立式库错峰**（S01+S05）——针对峰段电费占比 {FACT['peak_cost_pct']}%  
2. **空压泄漏治理**（S03）——对标短板  
3. **储能削峰**（S02）——配合限需量/平滑  

均可转入「能源验策」做因果仿真。清洁电力占比当前约 {FACT['clean_power_pct']}%。
""",
    )
    dump_jsonish(
        "08_strategy_opt/opt_model_result.json",
        {
            "eff_baseline_pct": 71.2,
            "eff_model_pct": 74.8,
            "month_save_tce": 126,
            "pending_process_confirm": 2,
        },
    )
    dump_jsonish(
        "08_strategy_opt/verify_handoff.json",
        {
            "S01": {"param": "workshopPct", "hint": "移峰比例"},
            "S02": {"param": "storageMw", "hint": "储能功率"},
            "S03": {"param": "air", "values": ["opt", "leak"]},
            "S04": {"param": "pvOnline", "hint": "光伏在线"},
            "S06": {"param": "gridMode/peakBuy", "hint": "limit/smooth/cap"},
        },
    )
    dump_jsonish(
        "08_strategy_opt/what_if_presets.json",
        {
            "pv_offline": "外购与碳上升，辅电通道灰显",
            "gen_force_on": "Scope1 上升，柴发路径强化",
            "shift_18": "峰费下降，需确认产量节拍",
            "asrs_offpeak": "立式库峰段负荷下降",
        },
    )


# ---------- 09-17 ----------
def gen_09():
    dump_jsonish(
        "09_budget_forecast/energy_budget_year.json",
        {"year": 2026, "budget_tce": 52000, "ytd_tce": 32240, "progress_pct": 62, "status": "可控"},
    )
    dump_jsonish(
        "09_budget_forecast/carbon_budget_year.json",
        {"year": 2026, "budget_tco2": 36000, "ytd_tco2": 22100, "progress_pct": 61, "status": "可控偏紧"},
    )
    dump_jsonish(
        "09_budget_forecast/monthly_forecast.json",
        {
            "month": "2026-08",
            "energy_forecast_tce": 4300,
            "carbon_forecast_tco2": 2950,
            "risk": "峰段电费与碳强度若延续将逼近月度警戒线",
        },
    )
    dump_jsonish(
        "09_budget_forecast/alert_thresholds.json",
        {"energy_month_warn_pct": 90, "carbon_month_warn_pct": 88, "peak_cost_share_target_pct": 32},
    )
    w(
        "09_budget_forecast/adjust_playbook.md",
        """
# 预算动态调整

1. 先看滚动预测是否超月度警戒。  
2. 优先调峰段负荷与空压/立式库策略，再考虑预算额度重分配。  
3. 碳预算紧张时限制柴发强制、提高光伏在线与消纳。  
4. 调整需记录原因与审批（演示可虚拟）。
""",
    )


def gen_10():
    dump_jsonish(
        "10_carbon_inventory/inventory_month.json",
        {
            "month": "2026-08",
            "total_tco2": 2840,
            "intensity_tco2_per_tce": 0.68,
            "grid_factor": 0.536,
        },
    )
    wcsv(
        "10_carbon_inventory/by_source.csv",
        ["source", "tco2", "scope"],
        [
            ["外购电", 2105, "2"],
            ["天然气", 420, "1"],
            ["柴油含柴发", 185, "1"],
            ["过程/其他示意", 130, "1"],
        ],
    )
    wcsv(
        "10_carbon_inventory/by_zone.csv",
        ["zone", "tco2"],
        [["生产", 980], ["动力", 760], ["仓储含立式库", 410], ["公辅工艺", 390], ["其他", 300]],
    )
    wcsv(
        "10_carbon_inventory/trend_12m.csv",
        ["month", "tco2"],
        [[f"2025-{m:02d}", 2600 + m * 15] for m in range(9, 13)]
        + [[f"2026-{m:02d}", 2700 + m * 20] for m in range(1, 9)],
    )
    w(
        "10_carbon_inventory/exceedance_alerts.md",
        """
# 超限预警样例

- **月度碳强度**：接近警戒（演示）。
- **排放口示意点**：无当日超标；若 CEMs 缺数则转核查缺口。
- **柴发频繁顶峰**：触发 Scope1 关注。
""",
    )
    w(
        "10_carbon_inventory/accounting_notes.md",
        f"""
# 核算说明

- 外购电因子 {FACT['ef_grid']}（{FACT['ef_version']}）。
- 光伏自用不计 Scope2 外购。
- 柴发按燃料计入 Scope1。
- 本月总量示意 **2840 tCO2**，强度 **0.68 tCO2/tce**。
""",
    )


def gen_11():
    dump_jsonish("11_product_cfp/product_list.json", {"products": [{"id": "P-A-01", "name": "产品A"}, {"id": "P-B-01", "name": "产品B"}]})
    dump_jsonish(
        "11_product_cfp/cfp_product_a.json",
        {
            "product": "P-A-01",
            "kgco2e_per_unit": 12.6,
            "breakdown_pct": {"原料": 34, "制造": 38, "仓储物流": 12, "运输": 10, "使用回收": 6},
            "warehouse_note": "仓储含立式库电耗分摊",
        },
    )
    dump_jsonish(
        "11_product_cfp/cfp_product_b.json",
        {"product": "P-B-01", "kgco2e_per_unit": 9.8, "breakdown_pct": {"原料": 40, "制造": 35, "仓储物流": 10, "运输": 9, "使用回收": 6}},
    )
    wcsv(
        "11_product_cfp/data_gaps.csv",
        ["item", "severity", "severity"],
        [["上游原材料二级数据", "高", "催供应商"], ["使用阶段实测", "中", "问卷补齐"], ["回收率", "中", "行业缺省"]],
    )
    w(
        "11_product_cfp/warehouse_allocation.md",
        """
# 仓储环节分摊（含立式库）

- 立式库与平库电耗按**托盘吞吐**或**货位占用小时**分摊到产品。
- 产品A 仓储物流约占足迹 12%，其中立式库贡献高于平库。
- 降低制造+仓储碳：工艺节电 + 立式库错峰与路径优化。
""",
    )
    w(
        "11_product_cfp/label_readiness.md",
        """
# 碳标签 / 认证准备度

- 产品A：数据缺口主要在上游，制造与仓储可核算。
- 需补齐：供应商活动数据、运输清洁度证明、因子版本声明。
""",
    )


def gen_12():
    wcsv(
        "12_supply_chain/supplier_carbon_status.csv",
        ["supplier_id", "name", "status", "last_update"],
        [
            ["S-RAW-001", "原料甲", "已提交", "2026-07-20"],
            ["S-RAW-008", "原料乙", "逾期", "2026-05-02"],
            ["S-PKG-003", "包材丙", "草稿", "2026-07-28"],
            ["S-LOG-002", "承运丁", "已提交", "2026-08-01"],
        ],
    )
    w(
        "12_supply_chain/chase_list.md",
        """
# 催数清单

1. S-RAW-008 原料乙 — 逾期未报活动数据  
2. S-PKG-003 包材丙 — 仅草稿，缺电耗与运输段  
3. 部分二级供应商仍未建档  

优先保障产品A足迹闭环。
""",
    )
    w(
        "12_supply_chain/downstream_delivery.md",
        """
# 下游足迹结果交付

- 向客户提供产品碳足迹摘要 PDF/JSON（演示）。
- 注明因子版本、边界、仓储含立式库分摊方法。
""",
    )
    dump_jsonish(
        "12_supply_chain/transport_modes.json",
        {"road_diesel_pct": 62, "road_ev_or_lng_pct": 28, "other_pct": 10, "clean_target_pct": 40},
    )
    w(
        "12_supply_chain/clean_transport_actions.md",
        """
# 清洁运输提升

- 提高 EV/LNG 承运占比至 40% 目标。
- 合并装载降低空驶；隧道通道时效优化减少怠速。
- 与车队区碳强度指标联动。
""",
    )


def gen_13():
    wcsv(
        "13_verification/evidence_checklist.csv",
        ["item", "status", "owner"],
        [
            ["关口电表原始记录", "齐", "计量"],
            ["折标与碳因子版本说明", "齐", "能碳"],
            ["柴发运行与油耗", "齐", "动力"],
            ["立式库分项电量", "齐", "仓储"],
            ["制冷站总表（离线）", "缺", "动力"],
            ["供应商活动数据抽查", "缺", "采购"],
        ],
    )
    w(
        "13_verification/missing_materials.md",
        """
# 核查材料缺口

1. 制冷站总进线离线期间的替代证明与估抄说明  
2. 供应商 S-RAW-008 活动数据  
3. 排放口手工比对记录（本月）  
""",
    )
    w(
        "13_verification/factor_version_statement.md",
        f"""
# 因子版本如何写入报告

报告应写明：外购电力排放因子 **{FACT['ef_grid']} tCO2/MWh**，版本 **{FACT['ef_version']}**；折标系数表 demo-v1.2；光伏按辅电不计入外购 Scope2。
""",
    )
    dump_jsonish(
        "13_verification/traceability_map.json",
        {
            "path": [
                "计量点原始值",
                "采集系统",
                "能耗快照/月报",
                "折标与碳核算",
                "核查报告草稿",
            ]
        },
    )
    w(
        "13_verification/report_draft_outline.md",
        """
# 核查说明草稿提纲

1. 组织边界与报告期  
2. 活动数据来源与计量点在线率  
3. 因子与折标版本  
4. Scope1/2 结果与强度  
5. 数据缺口与不确定性  
6. 改进计划（空压、立式库错峰等）  
""",
    )


def gen_14():
    dump_jsonish(
        "14_carbon_assets/allowance_ledger.json",
        {"year": 2026, "allowance_t": 30000, "used_t": 22100, "remaining_t": 7900},
    )
    dump_jsonish(
        "14_carbon_assets/ccer_status.json",
        {"holdings_t": 1200, "status": "可抵销部分示意", "expiry_note": "关注履约期"},
    )
    w(
        "14_carbon_assets/compliance_forecast.md",
        """
# 履约缺口预测

- 若排放按当前滚动预测，年末配额剩余偏紧。
- CCER 可部分对冲，但需按规则清缴顺序使用。
- 建议：控 Scope2（移峰、光伏消纳、限柴发）+ 配额使用预警。
""",
    )
    w(
        "14_carbon_assets/surrender_order.md",
        """
# 清缴顺序建议（演示）

1. 优先使用将到期的 CCER（如有）  
2. 再使用配额  
3. 保留安全余量应对查定调整  
""",
    )
    w(
        "14_carbon_assets/usage_alerts.md",
        """
# 使用 / 到期预警

- 配额进度 61%（与碳预算进度接近）。
- CCER 持有 1200 t，需在履约窗口前确认可用性。
""",
    )


def gen_15():
    dump_jsonish(
        "15_alerts_incidents/active_alerts.json",
        {
            "alerts": [
                {"id": "A1", "level": "warn", "object": "空压站", "msg": "泄漏指数偏高，能效落后", "cta": "上报/转策略"},
                {"id": "A2", "level": "info", "object": "计量", "msg": "4 个计量点离线", "cta": "巡检"},
                {"id": "A3", "level": "warn", "object": "峰段电费", "msg": "峰段电费占比 38%>32% 目标", "cta": "策略包"},
            ]
        },
    )
    wcsv(
        "15_alerts_incidents/incident_history.csv",
        ["date", "id", "object", "result"],
        [["2026-07-18", "H1", "柴发", "误强制已关闭"], ["2026-07-02", "H2", "光伏", "通讯闪断已恢复"]],
    )
    w(
        "15_alerts_incidents/root_cause_notes.md",
        f"""
# 典型归因

- **峰段电费高**：峰段电量与电价权重高；车间与立式库峰段负荷叠加；目标 <32%，当前 {FACT['peak_cost_pct']}%。
- **空压落后**：泄漏与设备老化，对标 64 分。
- **强度**：总体同比改善，但辅产品分摊需复核。
""",
    )
    w(
        "15_alerts_incidents/escalate_report_template.md",
        """
# 上报模板

- 异常对象 / 级别 / 发现时间  
- 现象与影响（能耗/碳/安全）  
- 已采取措施  
- 需支持事项  
- 是否转能源验策验证  
""",
    )


def gen_16():
    w(
        "16_org_policy/dual_carbon_targets.md",
        """
# 双碳目标（演示）

- 2026：强度持续下降，清洁电力占比提升。  
- 峰段电费占比压到 32% 以下。  
- 重点设备 2 级达标率提升，空压短板销项。  
""",
    )
    w(
        "16_org_policy/energy_saving_kpi.md",
        """
# 节能考核指标

- 单位产品/产值/增加值能耗  
- 用能单位达标率、设备 2 级占比  
- 峰段电费占比、光伏消纳率  
- 立式库 kWh/托  
""",
    )
    w(
        "16_org_policy/management_system_summary.md",
        """
# 能源 / 碳管理制度摘要

- 计量器具周期检定、数据质量责任制。  
- 策略变更与验策验证闭环。  
- 核查材料归集与因子版本受控。  
""",
    )
    w(
        "16_org_policy/disclosure_notes.md",
        """
# 对外披露注意

- 分清辅电与外购、绿证与物理绿电。  
- 注明示意/实测、因子版本与边界。  
- 避免未退证重复声明。  
""",
    )


def gen_17():
    w(
        "17_glossary/glossary.md",
        """
# 术语表

| 术语 | 含义 |
|---|---|
| tce | 吨标准煤 |
| 辅电 | 场内发电就地消纳，非外购 |
| 移峰 | 负荷峰段平移 |
| AS/RS | 自动立体库系统（立式仓库） |
| Scope1/2/3 | 温室气体核算范围 |
| 验策 | 能源策略因果仿真验证 |
| 等价值/当量值 | 折标两种口径 |
| 电度电费 | 按电量×分时/合同电价计的费用 |
| 基本电费/需量 | 按最大需量或容量计的固定部分 |
| 微电网内部电价 | 厂内分摊考核价，不等于对外账单 |
| 售电/专线 | 不同购电主体的市场化合同 |
""",
    )
    dump_jsonish(
        "17_glossary/faq_seeds_by_intent.json",
        {
            "查数": ["今天哪个区域用电最高？", "立式库今天用了多少电？", "今天电费花了多少？", "对比昨天柴油与天然气"],
            "电费电价": ["今天电费花了多少？", "峰平谷电价分别多少？", "市电和售电哪家便宜？", "阶梯电价到哪一档了？", "微电网内部怎么结算？"],
            "口径": ["解释单位增加值能耗怎么算", "电力折标用了什么系数", "为什么因子是0.536"],
            "归因": ["为什么峰段电费偏高", "空压站为什么落后", "损失主要在哪"],
            "策略": ["给我三条可落地的用能策略", "立式库如何错峰", "哪些建议可以去做验策"],
            "碳": ["本月碳排放多少", "产品A足迹怎么构成", "会不会履约缺口"],
            "核查": ["缺哪些核查材料", "因子版本如何写进报告"],
        },
    )
    w(
        "17_glossary/answer_snippets/intensity_calc.md",
        f"""
单位增加值能耗 = 综合能源消费量 / 工业增加值(不变价，万元)。本月示意 **{FACT['unit_va']} tce/万元**。计算前确认等价值或当量值口径。
""",
    )
    w(
        "17_glossary/answer_snippets/peak_cost_why.md",
        f"""
峰段电费占比约 **{FACT['peak_cost_pct']}%**（目标<32%），因峰段电价高且车间、立式库出库等负荷叠在峰段。建议 S01+S05+S02。
""",
    )
    w(
        "17_glossary/answer_snippets/asrs_energy_profile.md",
        """
立式仓库今日约 16.8 MWh、13.3 kWh/托，堆垛机利用率 78%。电耗来自堆垛提升行走、输送、库温控制。优化：错峰出入库、谷段预冷、减少空驶。
""",
    )
    w(
        "17_glossary/answer_snippets/today_bill.md",
        f"""
# 今日电费一句话

今天电费合计约 **{FACT['today_bill_wan']} 万元**（演示结算日）。其中电度电费约 {FACT['today_energy_charge_wan']} 万、基本电费（需量日摊）约 {FACT['today_demand_wan']} 万、力调/绿证等约 {FACT['today_other_wan']} 万。外购结算电量约 {FACT['today_purchase_mwh']} MWh，光伏自用约 {FACT['today_pv_self_mwh']} MWh 未计入购电账单。峰段费用约 {FACT['today_peak_cost_wan']} 万，占电费约 38%。
""",
    )


def gen_18():
    """电价 / 电费 / 购电主体 / 电类型 / 微电网结算"""
    w(
        "18_power_pricing/README.md",
        f"""
# 电力价格与电费结算资料

本目录回答「花了多少钱、什么电价、峰谷/阶梯、哪家合同、微电网内部怎么算」类问题。

- **今日电费合计（演示）**：约 **{FACT['today_bill_wan']} 万元**
- **外购结算电量**：约 {FACT['today_purchase_mwh']} MWh（厂内用电含光伏自用时，自用部分不进购电账单）
- **光伏自用**：约 {FACT['today_pv_self_mwh']} MWh（辅电，节约外购）
- **峰段费用占比**：约 38%（与面板一致）

文件说明见各专档；数值为示意，可与电量快照交叉核对。
""",
    )

    dump_jsonish(
        "18_power_pricing/tariff_tou.json",
        {
            "name": "分时电价（峰平谷）",
            "unit": "元/kWh",
            "timezone": "本地",
            "periods": {
                "peak": {"hours": "10:00-12:00,14:00-19:00", "price": 1.1858, "label": "峰段"},
                "flat": {"hours": "08:00-10:00,12:00-14:00,19:00-23:00", "price": 0.7421, "label": "平段"},
                "valley": {"hours": "23:00-08:00", "price": 0.3856, "label": "谷段"},
            },
            "note": "默认市电目录分时；售电/专线另见 supplier_offers",
        },
    )

    dump_jsonish(
        "18_power_pricing/tariff_tiered_monthly.json",
        {
            "name": "月度电量阶梯（大工业示意）",
            "basis": "当月关口外购合计 MWh",
            "tiers": [
                {"upto_mwh": 3000, "adder_yuan_per_kwh": 0.0, "desc": "基准档，不加价"},
                {"upto_mwh": 4500, "adder_yuan_per_kwh": 0.03, "desc": "超额档 +0.03 元/kWh"},
                {"upto_mwh": None, "adder_yuan_per_kwh": 0.08, "desc": "高耗档 +0.08 元/kWh"},
            ],
            "month_progress_mwh": 2680,
            "current_tier": 1,
            "note": "本月进度约 2680 MWh，仍在基准档；若冲到 3000 以上，超出部分叠加阶梯加价。",
        },
    )

    dump_jsonish(
        "18_power_pricing/supplier_offers.json",
        {
            "name": "不同购电主体 / 厂家电价差异",
            "answer_zh": "今天买的电来自三处：市电（电网零售）约 55%，售电公司A套餐约 30%，发电企业B专线约 15%。",
            "active_mix": [
                {"source": "utility_retail", "label": "市电（电网零售）", "share_pct": 55, "role": "保底+目录分时"},
                {"source": "retailer_A", "label": "售电公司A套餐", "share_pct": 30, "role": "市场化套餐"},
                {"source": "direct_line_B", "label": "发电企业B专线", "share_pct": 15, "role": "直购专线"},
            ],
            "offers": [
                {
                    "id": "utility_retail",
                    "peak": 1.1858,
                    "flat": 0.7421,
                    "valley": 0.3856,
                    "service_fee": 0.0,
                    "remark": "目录电价，含政府性基金及附加（演示已并入单价）",
                },
                {
                    "id": "retailer_A",
                    "peak": 1.12,
                    "flat": 0.71,
                    "valley": 0.40,
                    "service_fee": 0.02,
                    "remark": "峰段更优，谷段略贵；另收撮合服务费 0.02 元/kWh",
                },
                {
                    "id": "direct_line_B",
                    "contract_avg": 0.68,
                    "peak": 0.92,
                    "flat": 0.66,
                    "valley": 0.48,
                    "service_fee": 0.0,
                    "remark": "专线直购，综合价低，谷段优势弱；需稳定负荷曲线",
                },
            ],
            "compare_hint": "同为峰段一度电：市电1.1858、售电A约1.14（含服务费）、专线B约0.92。对话问「哪家更便宜」按此时段对比。",
        },
    )

    dump_jsonish(
        "18_power_pricing/power_type_prices.json",
        {
            "name": "不同电力类型价格差异",
            "types": [
                {
                    "type": "grid_brown",
                    "label": "常规外购电（含燃煤标杆成分）",
                    "settlement": "关口分时",
                    "ref_price_peak": 1.1858,
                    "carbon_note": "按区域因子计 Scope2",
                },
                {
                    "type": "green_certificate_bundle",
                    "label": "外购电+绿证捆绑",
                    "settlement": "电能量价+绿证溢价",
                    "energy_price_flat": 0.7421,
                    "cert_premium": 0.035,
                    "remark": "声明绿电时电能量与证书分开计量，禁止双重计算",
                },
                {
                    "type": "pv_assist_onsite",
                    "label": "场内光伏辅电",
                    "settlement": "不进外购账单",
                    "avoided_cost_ref": 0.7421,
                    "remark": "自用节约按平段机会成本估算；≠外购绿电",
                },
                {
                    "type": "storage_arbitrage",
                    "label": "储能峰放谷充",
                    "charge_valley": 0.3856,
                    "discharge_peak_value": 1.1858,
                    "roundtrip_eff": 0.9,
                    "remark": "价差套利受效率与需量约束",
                },
                {
                    "type": "diesel_backup",
                    "label": "柴发顶峰电",
                    "variable_cost_yuan_per_kwh": 2.1,
                    "remark": "远高于市电峰段，仅应急/策略强制；另计 Scope1 碳成本",
                },
            ],
        },
    )

    dump_jsonish(
        "18_power_pricing/demand_capacity_charge.json",
        {
            "name": "基本电费 / 需量电费",
            "method": "最大需量",
            "price_yuan_per_kw_month": 40,
            "billing_demand_mw": 12.5,
            "month_demand_charge_wan": 50.0,
            "today_accrual_wan": 1.62,
            "note": "日摊≈月基本电费/当月天数；削峰可降低计费需量从而降基本电费。",
        },
    )

    dump_jsonish(
        "18_power_pricing/microgrid_internal_tariff.json",
        {
            "name": "厂内微电网内部结算电价",
            "hub": "厂内变电所为内部结算枢纽",
            "internal_tou": {"peak": 0.95, "flat": 0.65, "valley": 0.35},
            "pv_feed_in_internal": 0.42,
            "storage_charge_credit": 0.35,
            "storage_discharge_debit_peak": 0.95,
            "wheeling_loss_pct": 2.5,
            "participants": [
                "生产车间",
                "立式仓库",
                "平库",
                "空压站",
                "制冷站",
                "办公楼",
                "光伏账户",
                "储能账户",
            ],
            "rules": [
                "外购电先到并网点再入变电，内部按馈线结算到用能单元",
                "光伏辅电按内部上网价记入可再生账户，用电方按内部分时付费",
                "微电网内部价用于考核与成本分摊，不等于对电网结算账单",
                "线损 2.5% 由用电方按电量分摊",
            ],
        },
    )

    dump_jsonish(
        "18_power_pricing/snapshots/today_cost.json",
        {
            "date": "2026-08-05",
            "total_bill_wan": 11.26,
            "total_bill_yuan": 112600,
            "purchase_mwh": 119.8,
            "site_load_mwh": 142.0,
            "pv_self_mwh": 21.4,
            "pv_avoided_cost_wan": 1.59,
            "breakdown_wan": {
                "energy_tou": 9.44,
                "demand_basic": 1.62,
                "reactive_and_misc": 0.12,
                "green_cert_alloc": 0.08,
            },
            "tou_mwh": {"peak": 40.5, "flat": 44.2, "valley": 35.1},
            "tou_cost_wan": {"peak": 4.28, "flat": 3.48, "valley": 1.68},
            "peak_cost_share_pct": 38.0,
            "blended_energy_price_yuan_per_kwh": 0.788,
            "by_supplier_wan": {"utility_retail": 6.42, "retailer_A": 3.21, "direct_line_B": 1.63},
            "answer_zh": "今天电费合计约11.26万元。外购结算约119.8兆瓦时，光伏自用约21.4兆瓦时不进购电账单。电度电费约9.44万、基本电费日摊约1.62万、其他约0.2万。峰段费用约4.28万，占38%。",
        },
    )

    dump_jsonish(
        "18_power_pricing/snapshots/yesterday_cost.json",
        {
            "date": "2026-08-04",
            "total_bill_wan": 10.85,
            "purchase_mwh": 116.2,
            "peak_cost_share_pct": 37.0,
            "delta_vs_today_wan": 0.41,
        },
    )

    dump_jsonish(
        "18_power_pricing/snapshots/month_cost.json",
        {
            "month": "2026-08",
            "answer_zh": "本月电费累计约 98.6 万元（月累计），外购约 2680 MWh；全月预测约 128 万元。",
            "mtd_bill_wan": 98.6,
            "mtd_purchase_mwh": 2680,
            "forecast_month_bill_wan": 128.0,
            "tier_status": "仍在基准阶梯档",
            "demand_charge_mtd_wan": 16.2,
        },
    )

    dump_jsonish(
        "18_power_pricing/snapshots/year_cost.json",
        {
            "year": 2026,
            "as_of": "2026-08-05",
            "answer_zh": "今年截至目前外购电费累计约 1860 万元（年累计），外购电量约 2.15 万 MWh；全年预测约 3180 万元。",
            "ytd_bill_wan": 1860,
            "ytd_purchase_mwh": 21500,
            "forecast_year_bill_wan": 3180,
            "note": "演示年累计，含市电/售电/专线结算电费，不含光伏自用机会成本。",
        },
    )

    wcsv(
        "18_power_pricing/daily_cost.csv",
        [
            "date",
            "purchase_mwh",
            "peak_mwh",
            "flat_mwh",
            "valley_mwh",
            "energy_wan",
            "demand_wan",
            "other_wan",
            "total_wan",
            "peak_share_pct",
        ],
        [
            ["2026-08-03", 114.5, 38.2, 43.0, 33.3, 8.95, 1.61, 0.18, 10.74, 36.5],
            ["2026-08-04", 116.2, 39.0, 43.5, 33.7, 9.12, 1.61, 0.12, 10.85, 37.0],
            ["2026-08-05", 119.8, 40.5, 44.2, 35.1, 9.44, 1.62, 0.20, 11.26, 38.0],
        ],
    )

    wcsv(
        "18_power_pricing/zone_cost_today.csv",
        ["zone", "mwh", "internal_settle_wan", "share_of_energy_pct", "note"],
        [
            ["生产车间", 58.2, 4.35, 38.6, "内部微电网分时结算"],
            ["立式仓库", 16.8, 1.26, 11.2, "含库温与堆垛"],
            ["空压站", 14.1, 1.08, 9.6, "转换损耗高"],
            ["平库仓储", 8.4, 0.58, 5.1, ""],
            ["制冷站", 9.2, 0.69, 6.1, "计量部分估抄"],
            ["其他动力公辅办公物流", 34.3, 2.48, 22.0, "含线损分摊"],
        ],
    )

    w(
        "18_power_pricing/billing_rules.md",
        f"""
# 电费账单构成与计算规则（演示）

## 1. 总公式（对电网/售电结算）

**今日电费** ≈ 电度电费（分时×电量，并按购电主体混合） + 基本电费（需量日摊） + 力调与杂费 + 绿证分摊。

今日示意合计：**{FACT['today_bill_wan']} 万元**。

## 2. 电量口径

- **厂内用电**：{FACT['today_mwh']} MWh（含光伏供电部分）
- **光伏自用**：{FACT['today_pv_self_mwh']} MWh → **不计入外购电费**
- **外购结算**：约 {FACT['today_purchase_mwh']} MWh = 用电 − 光伏自用（示意，忽略极少上网）

## 3. 峰平谷

按 `tariff_tou.json` 分时电价；峰段费用约 {FACT['today_peak_cost_wan']} 万，占电费约 **38%**。

## 4. 阶梯

按月累计外购电量阶梯加价，见 `tariff_tiered_monthly.json`。本月尚未跨出基准档。

## 5. 购电主体混合

市电 55% + 售电A 30% + 专线B 15%，电度电费按主体分时价加权，见 `supplier_offers.json` 与今日 `by_supplier_wan`。

## 6. 电类型

常规外购 / 绿证捆绑 / 光伏辅电 / 储能价差 / 柴发边际成本，见 `power_type_prices.json`。

## 7. 微电网内部

对内考核用 `microgrid_internal_tariff.json`，**不等于**外部账单；用于车间、立式库等成本分摊对话。

## 8. 对话要点

问「今天电费花了多少」→ 先报 **{FACT['today_bill_wan']} 万元**，再拆电度/基本/峰段/光伏未计购电。  
问「怎么办」再转到策略，勿颠倒。
""",
    )

    w(
        "18_power_pricing/faq_cost.md",
        f"""
# 电费常见问法（口述答案）

## 今天电费花了多少？
约 **{FACT['today_bill_wan']} 万元**。外购约 {FACT['today_purchase_mwh']} MWh；光伏自用约 {FACT['today_pv_self_mwh']} MWh 没进购电账单。电度约 {FACT['today_energy_charge_wan']} 万，基本电费日摊约 {FACT['today_demand_wan']} 万，其他约 {FACT['today_other_wan']} 万。峰段大约 {FACT['today_peak_cost_wan']} 万，占 38%。

## 为什么峰段贵？
峰段电价约 1.1858 元/kWh，远高于谷段 0.3856；今天峰段电量约 40.5 MWh，费用约 4.28 万。车间和立式库出库若叠在峰段，会推高占比。

## 市电、售电、专线差在哪？
峰段一度电大致：市电 1.19、售电A（含服务费）约 1.14、专线B 约 0.92。专线综合低但谷段不一定更优，还要看负荷能否匹配合约。

## 阶梯会不会加价？
本月外购进度约 2680 MWh，还在基准档；超过 3000 MWh 后超出部分开始加 0.03 元/kWh。

## 微电网内部价是账单吗？
不是。内部峰 0.95 / 平 0.65 / 谷 0.35 用于厂内成本分摊与考核；对外仍按关口与合同结算。

## 光伏省了多少钱？
今日自用约 21.4 MWh，按平段机会成本约 0.74 元/kWh 估算，大约节约 **1.59 万元** 外购电费（示意）。
""",
    )


def gen_19():
    """直答专档：钱/量、状态、名单、参数、对比、差额、验策边界、算不算"""
    w(
        "19_direct_answers/README.md",
        """
# 直答专档（防意图漂移）

用户要「一个数 / 是否 / 名单 / 单价 / 对比 / 差额 / 能不能验 / 算不算」时，优先本目录。  
**先结论，后三行拆解**；不要先跳策略科普。
""",
    )

    # --- 1 钱/量 ---
    dump_jsonish(
        "19_direct_answers/quantity_money/today_energy_mix.json",
        {
            "date": "2026-08-05",
            "answer_zh": "今天能耗结构（折标占比）：电力约 76%，天然气约 12%，柴油约 5%，热力约 4%，氢/其他约 3%。用电分区上，生产车间最高约 41%，立式仓库约 12%，空压站约 10%。",
            "fuel_share_pct": {"电力": 76, "天然气": 12, "柴油": 5, "热力": 4, "氢/其他": 3},
            "zone_elec_share_pct": {"生产车间": 41, "立式仓库": 12, "空压站": 10},
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/today_purchase_mwh.json",
        {
            "date": "2026-08-05",
            "answer_zh": "今天买电（外购结算）约 119.8 MWh。厂内用电约 142 MWh，其中光伏自用约 21.4 MWh 不算外购。",
            "purchase_mwh": 119.8,
            "site_load_mwh": 142.0,
            "pv_self_mwh": 21.4,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/today_purchase_source.json",
        {
            "date": "2026-08-05",
            "answer_zh": "今天买的电来自三处：市电（电网零售）约 55%，售电公司A套餐约 30%，发电企业B专线约 15%。光伏自用不算外购购电。",
            "mix": [
                {"label": "市电（电网零售）", "share_pct": 55},
                {"label": "售电公司A套餐", "share_pct": 30},
                {"label": "发电企业B专线", "share_pct": 15},
            ],
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/today_elec_bill.json",
        {
            "date": "2026-08-05",
            "answer_zh": "今天外购电费约 11.26 万元（电度约 9.44 万、基本电费日摊约 1.62 万、其他约 0.2 万）。",
            "total_bill_wan": 11.26,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/month_elec_bill.json",
        {
            "month": "2026-08",
            "answer_zh": "本月外购电费累计约 98.6 万元，外购约 2680 MWh；全月预测约 128 万元。",
            "mtd_bill_wan": 98.6,
            "mtd_purchase_mwh": 2680,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/year_elec_bill.json",
        {
            "year": 2026,
            "as_of": "2026-08-05",
            "answer_zh": "今年截至目前买电（外购电费）累计约 1860 万元；外购电量约 2.15 万 MWh。全年预测约 3180 万元。",
            "ytd_bill_wan": 1860,
            "ytd_purchase_mwh": 21500,
            "forecast_year_bill_wan": 3180,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/month_purchase_mwh.json",
        {
            "month": "2026-08",
            "answer_zh": "本月外购结算电量累计约 2680 MWh。",
            "mtd_purchase_mwh": 2680,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/year_purchase_mwh.json",
        {
            "year": 2026,
            "as_of": "2026-08-05",
            "answer_zh": "今年截至目前外购结算电量累计约 2.15 万 MWh（约 21500 MWh）。",
            "ytd_purchase_mwh": 21500,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/today_energy_cost_all.json",
        {
            "date": "2026-08-05",
            "answer_zh": "今天综合能源费用约 13.85 万元：电费 11.26 万、天然气约 1.92 万、柴油约 0.48 万、热力约 0.19 万。",
            "electricity_wan": 11.26,
            "gas_wan": 1.92,
            "diesel_wan": 0.48,
            "heat_wan": 0.19,
            "total_wan": 13.85,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/today_gas_heat.json",
        {
            "answer_zh": "今日天然气费用约 1.92 万元（折标约 2.2 tce）；热力约 0.19 万元。",
            "gas_tce": 2.2,
            "heat_tce": 0.75,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/zone_rank_cost_today.json",
        {
            "answer_zh": "今天内部结算电费最高的是生产车间约 4.35 万，其次立式仓库约 1.26 万、空压站约 1.08 万。",
            "rank": [
                {"zone": "生产车间", "wan": 4.35},
                {"zone": "立式仓库", "wan": 1.26},
                {"zone": "空压站", "wan": 1.08},
            ],
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/zone_rank_kwh_today.json",
        {
            "answer_zh": "今天用电量最高的是生产车间约 58.2 MWh，其次立式仓库 16.8 MWh、空压站 14.1 MWh。",
            "rank": [
                {"zone": "生产车间", "mwh": 58.2},
                {"zone": "立式仓库", "mwh": 16.8},
                {"zone": "空压站", "mwh": 14.1},
            ],
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/carbon_month_number.json",
        {
            "answer_zh": "本月碳排放总量约 2840 tCO2，强度约 0.68 tCO2/tce；外购电因子 0.536。",
            "total_tco2": 2840,
            "intensity": 0.68,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/allowance_remaining.json",
        {
            "answer_zh": "碳配额剩余约 7900 t，CCER 持有约 1200 t；按滚动预测年末偏紧，但尚未出现确定履约缺口。",
            "remaining_t": 7900,
            "ccer_t": 1200,
            "gap_now": False,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/product_cfp_number.json",
        {
            "answer_zh": "产品A 单位足迹约 12.6 kgCO2e，产品B 约 9.8 kgCO2e；产品A 制造约占 38%，仓储物流约 12%。",
            "A": 12.6,
            "B": 9.8,
        },
    )
    dump_jsonish(
        "19_direct_answers/quantity_money/asrs_today_number.json",
        {
            "answer_zh": "立式仓库今天用电约 16.8 MWh，约 13.3 kWh/托，吞吐 1260 托；内部结算电费约 1.26 万元。",
        },
    )

    # --- 2 状态 ---
    dump_jsonish(
        "19_direct_answers/status/meters_online.json",
        {
            "answer_zh": "计量点当前 128/132 在线。离线 4 个：制冷总进线、氢、氨、公辅管廊配电。",
            "online": "128/132",
            "ok": False,
        },
    )
    dump_jsonish(
        "19_direct_answers/status/budget_traffic_light.json",
        {
            "answer_zh": "用能预算年进度约 62%，状态可控；碳预算约 61%，可控偏紧。本月滚动预测有逼近警戒线的风险，但尚未判定「已超预算」。",
            "energy": "green_watch",
            "carbon": "yellow",
            "exceeded": False,
        },
    )
    dump_jsonish(
        "19_direct_answers/status/tier_status.json",
        {
            "answer_zh": "本月外购电量进度约 2680 MWh，仍在阶梯基准档，还没触发加价。",
            "tier": 1,
            "crossed": False,
        },
    )
    dump_jsonish(
        "19_direct_answers/status/compliance_gap.json",
        {
            "answer_zh": "当前没有确定的履约缺口；配额仍有约 7900 t 剩余。风险是年末偏紧，需控 Scope2 并关注 CCER 可用性。",
            "has_gap": False,
        },
    )
    dump_jsonish(
        "19_direct_answers/status/pv_online.json",
        {
            "answer_zh": "场内光伏当前在线，今日发电约 22 MWh、自用约 21.4 MWh，按辅电消纳。",
            "online": True,
        },
    )
    dump_jsonish(
        "19_direct_answers/status/active_alerts.json",
        {
            "answer_zh": "当前有 3 条关注：空压泄漏偏高（警告）、4 个计量点离线（提示）、峰段电费占比 38%>32% 目标（警告）。",
            "count": 3,
        },
    )

    # --- 3 名单 ---
    w(
        "19_direct_answers/lists/retrofit_six.md",
        """
# 待改造设备名单（6 台）

1. 空压机2# — 比功率高/泄漏 — 高优先级  
2. 空压机3# — 老化效率低 — 高  
3. 干燥机旁路 — 压损大 — 中  
4. 冷水机组1# — 部分负荷效率差 — 中  
5. 旧变频风机 — 工频运行 — 中  
6. 平库照明回路 — 未分时光控 — 低  

问「待改造有哪些」直接念名单，不要先讲对标方法论。
""",
    )
    w(
        "19_direct_answers/lists/supplier_chase.md",
        """
# 供应商催数名单

1. S-RAW-008 原料乙 — 逾期未报  
2. S-PKG-003 包材丙 — 仅草稿，缺电耗与运输段  
3. 部分二级供应商未建档（次优先）
""",
    )
    w(
        "19_direct_answers/lists/verification_missing.md",
        """
# 核查材料缺口名单

1. 制冷站总进线离线期间的替代证明与估抄说明  
2. 供应商 S-RAW-008 活动数据  
3. 排放口本月手工比对记录  
""",
    )
    w(
        "19_direct_answers/lists/offline_meters.md",
        """
# 今日离线计量点名单

1. M-EL-CLG-001 制冷站总进线  
2. M-H2-001 氢计量  
3. M-NH3-001 氨计量  
4. M-EL-UTL-001 公辅管廊配电  
""",
    )
    w(
        "19_direct_answers/lists/top_zones.md",
        """
# 今日用电 Top3

1. 生产车间 58.2 MWh  
2. 立式仓库 16.8 MWh  
3. 空压站 14.1 MWh  
""",
    )

    # --- 4 参数一行 ---
    w(
        "19_direct_answers/params/one_liners.md",
        f"""
# 参数直答（一行）

- **外购电碳因子**：{FACT['ef_grid']} tCO2/MWh，版本 {FACT['ef_version']}，只用于关口外购 Scope2。  
- **电力折标（当量）**：0.1229 tce/MWh；等价值示意 0.3000 tce/MWh（demo-v1.2）。  
- **峰/平/谷电价**：1.1858 / 0.7421 / 0.3856 元/kWh（市电目录分时）。  
- **微电网内部分时**：峰 0.95 / 平 0.65 / 谷 0.35 元/kWh（考核价，非对外账单）。  
- **绿证溢价示意**：约 +0.035 元/kWh（捆绑声明时）。  
- **单位增加值能耗**：本月 {FACT['unit_va']} tce/万元。  
- **单位产品能耗**：{FACT['unit_product']} tce/吨。  
""",
    )

    # --- 5 对比 ---
    dump_jsonish(
        "19_direct_answers/compare/bill_today_vs_yesterday.json",
        {
            "answer_zh": "今天电费约 11.26 万，昨天约 10.85 万，多花约 0.41 万；峰段费用占比 38% 对 37%。",
            "today": 11.26,
            "yesterday": 10.85,
            "delta": 0.41,
        },
    )
    dump_jsonish(
        "19_direct_answers/compare/supplier_peak_price.json",
        {
            "answer_zh": "峰段一度电：市电约 1.19 元，售电A含服务费约 1.14 元，专线B约 0.92 元；专线峰段最便宜，但要看能否吃满合约。",
        },
    )
    dump_jsonish(
        "19_direct_answers/compare/product_ab_cfp.json",
        {
            "answer_zh": "产品A 约 12.6 kgCO2e/件，产品B 约 9.8；A 比 B 高约 2.8，主要差在制造与仓储分摊。",
        },
    )
    dump_jsonish(
        "19_direct_answers/compare/intensity_yoy.json",
        {
            "answer_zh": "强度同比：单位产品约 -8%，单位产值约 -3.2%，单位增加值约 -12%；综合能耗环比约 +3.3%。",
        },
    )

    # --- 6 差额 ---
    dump_jsonish(
        "19_direct_answers/delta/pv_saved_money.json",
        {
            "answer_zh": "今日光伏自用约 21.4 MWh，按平段机会成本估算，大约少花外购电费 1.59 万元。",
            "saved_wan": 1.59,
        },
    )
    dump_jsonish(
        "19_direct_answers/delta/diesel_extra_cost.json",
        {
            "answer_zh": "今日柴发少量顶峰约 0.6 小时，燃油折标约 0.12 tce；按柴发边际电成本约 2.1 元/kWh 估算，顶峰电远贵于市电峰段，额外成本约 0.08～0.12 万元量级（示意）。",
        },
    )
    dump_jsonish(
        "19_direct_answers/delta/air_leak_waste.json",
        {
            "answer_zh": "空压泄漏指数约 0.22 偏高；相对 opt 工况，今日空压电费大约多亏 0.08～0.12 万元（示意），并拖累能效对标得分。",
        },
    )

    # --- 7 验策可转 ---
    w(
        "19_direct_answers/verify/handoff_shortlist.md",
        """
# 哪些能转入能源验策（短名单）

| 策略 | 能否验策 | 映射 | 备注 |
|---|---|---|---|
| 车间移峰 S01 | 能 | workshopPct | 注意工艺节拍 |
| 储能削峰 S02 | 能 | storageMw | 受 SOC 限制 |
| 空压 opt/leak S03 | 能 | air | — |
| 光伏在线/消纳 S04 | 能 | pvOnline | 辅电口径 |
| 立式库错峰 S05 | 部分 | 负荷叙述/与移峰组合 | 无独立滑条时并入负荷侧 |
| 峰段限购/需量/平滑 S06 | 能 | gridMode/peakBuy | smooth 与 cap 勿合并 |
| 工艺参数优化 S07 | 暂缓 | — | 2 项待工艺确认，确认前不直下发 |

问「哪些可以去做验策」：念「能」的几条即可。
""",
    )

    # --- 8 边界判定：只保留短结论（长文说明不进对话） ---
    dump_jsonish(
        "19_direct_answers/boundary/conclusions.json",
        {
            "items": [
                {
                    "keys": ["光伏", "购电", "辅电", "算不算购电"],
                    "answer_zh": "不算购电。场内光伏按辅电消纳，不进外购结算电量。",
                },
                {
                    "keys": ["绿证", "清洁电力"],
                    "answer_zh": "绿证可以计入清洁电力声明部分，但要和物理绿电分开，不能重复算。",
                },
                {
                    "keys": ["微电网", "内部", "账单"],
                    "answer_zh": "微电网内部电价不是对外电费账单，只用于厂内考核分摊。",
                },
                {
                    "keys": ["办公", "边界", "核算"],
                    "answer_zh": "办公楼在红线内，计入能耗和碳核算边界，但通常不是用电大户。",
                },
                {
                    "keys": ["柴发", "scope", "哪边"],
                    "answer_zh": "柴发顶峰算 Scope1 燃料排放，不算外购电 Scope2。",
                },
                {
                    "keys": ["立式", "仓储", "生产"],
                    "answer_zh": "立式仓库用电算仓储分区，产品足迹里进仓储物流分摊。",
                },
            ]
        },
    )
    # 长文判定卡仅供后台/人工查阅，对话默认不引用
    w(
        "19_direct_answers/boundary/_internal_judgement_notes.md",
        """
# 边界判定内部说明（不对用户朗读）

详细口径见 04_factors_methods 与本文件历史版本。对话只使用 boundary/conclusions.json 的短结论。
""",
    )

    # 总索引：意图 → 文件
    dump_jsonish(
        "19_direct_answers/intent_index.json",
        {
            "多少钱_综合能源费": "quantity_money/today_energy_cost_all.json",
            "买了多少电": "quantity_money/today_purchase_mwh.json",
            "买的哪里的电": "quantity_money/today_purchase_source.json",
            "购电来源": "quantity_money/today_purchase_source.json",
            "今天电费": "quantity_money/today_elec_bill.json",
            "本月电费": "quantity_money/month_elec_bill.json",
            "今年买电多少钱": "quantity_money/year_elec_bill.json",
            "今年电费": "quantity_money/year_elec_bill.json",
            "能耗比例": "quantity_money/today_energy_mix.json",
            "能耗结构": "quantity_money/today_energy_mix.json",
            "电费": "见 18_power_pricing/snapshots/today_cost.json",
            "谁最耗电": "quantity_money/zone_rank_kwh_today.json",
            "谁最贵": "quantity_money/zone_rank_cost_today.json",
            "计量在线吗": "status/meters_online.json",
            "超预算吗": "status/budget_traffic_light.json",
            "履约缺口吗": "status/compliance_gap.json",
            "待改造哪些": "lists/retrofit_six.md",
            "因子多少": "params/one_liners.md",
            "今天比昨天": "compare/bill_today_vs_yesterday.json",
            "光伏省多少": "delta/pv_saved_money.json",
            "哪些验策": "verify/handoff_shortlist.md",
            "光伏算购电吗": "boundary/conclusions.json",
        },
    )


def gen_99(all_files: list[str]):
    w(
        "99_manifest/DATA_DISCLAIMER.md",
        """
# 数据免责声明

本目录全部为 **VerifyLoop / 灯塔2030 Demo 示意数据**，用于自然语言问答与界面演示，不作为真实计量、核算、披露或履约依据。
""",
    )
    wcsv(
        "99_manifest/file_manifest.csv",
        ["path", "type"],
        [[f, Path(f).suffix] for f in all_files],
    )
    dump_jsonish(
        "99_manifest/sync_with_demo.json",
        {
            "align": [
                "today 18.6 tce / 142 MWh",
                "month 4120 tce intensity",
                "peak 38% clean 41%",
                "ef 0.536",
                "sankey 186 MWh",
                "pv assist not purchase",
                "today bill 11.26 wan",
                "direct answers pack v19",
            ]
        },
    )
    w(
        "99_manifest/changelog.md",
        """
# 资料库变更

| 版本 | 日期 | 说明 |
|---|---|---|
| 1.0.0 | 2026-08-06 | 首版全量示意资料库，供对话框检索 |
| 1.1.0 | 2026-08-06 | 增补 18 电价电费与 19 直答专档 |
""",
    )


def collect_chunks() -> list[dict]:
    chunks = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        if path.name.startswith("_"):
            continue
        if path.suffix.lower() not in {".md", ".json", ".csv"}:
            continue
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8-sig", errors="ignore")
        # split md by headings for better retrieval
        if path.suffix.lower() == ".md" and "\n# " in "\n" + text:
            parts = re.split(r"\n(?=# )", text)
            for i, part in enumerate(parts):
                part = part.strip()
                if len(part) < 40:
                    continue
                title = part.splitlines()[0].lstrip("# ").strip()
                chunks.append(
                    {
                        "id": f"{rel}#{i}",
                        "path": rel,
                        "title": title,
                        "modules": guess_modules(rel),
                        "text": part[:4000],
                    }
                )
        else:
            chunks.append(
                {
                    "id": rel,
                    "path": rel,
                    "title": path.stem,
                    "modules": guess_modules(rel),
                    "text": text[:4000],
                }
            )
    return chunks


def guess_modules(rel: str) -> list[str]:
    mapping = [
        ("03_energy", ["energy_query", "intensity", "analysis_reco"]),
        ("02_metering", ["energy_query", "verification"]),
        ("04_factors", ["intensity", "carbon_account", "verification", "verify"]),
        ("05_assets", ["energy_query", "benchmark", "flow", "carbon_account"]),
        ("06_flow", ["flow", "balance_opt"]),
        ("07_efficiency", ["intensity", "benchmark", "analysis_reco"]),
        ("08_strategy", ["analysis_reco", "balance_opt", "verify"]),
        ("09_budget", ["budget"]),
        ("10_carbon", ["carbon_account", "budget"]),
        ("11_product", ["product_cfp"]),
        ("12_supply", ["supply_chain", "product_cfp"]),
        ("13_verification", ["verification"]),
        ("14_carbon_assets", ["carbon_asset"]),
        ("15_alerts", ["energy_query", "analysis_reco", "verify"]),
        ("16_org", ["carbon_asset", "budget"]),
        ("17_glossary", ["energy_query", "intensity", "analysis_reco", "verify"]),
        ("18_power", ["energy_query", "analysis_reco", "budget", "verify"]),
        ("19_direct", ["energy_query", "intensity", "analysis_reco", "benchmark", "budget", "carbon_account", "product_cfp", "supply_chain", "verification", "carbon_asset", "verify", "flow", "balance_opt"]),
        ("01_site", ["flow", "verify", "energy_query"]),
    ]
    mods = []
    for key, ms in mapping:
        if key in rel:
            mods.extend(ms)
    return sorted(set(mods)) or ["energy_query"]


def write_store(chunks: list[dict]):
    DEMO_JS.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(chunks, ensure_ascii=False)
    DEMO_JS.write_text(
        "/* Auto-generated from knowledge/ — do not edit by hand */\n"
        f"export const KNOWLEDGE_CHUNKS = {payload};\n",
        encoding="utf-8",
    )


def main():
    gens = [
        gen_00,
        gen_01,
        gen_02,
        gen_03,
        gen_04,
        gen_05,
        gen_06,
        gen_07,
        gen_08,
        gen_09,
        gen_10,
        gen_11,
        gen_12,
        gen_13,
        gen_14,
        gen_15,
        gen_16,
        gen_17,
        gen_18,
        gen_19,
    ]
    for g in gens:
        g()

    all_files = sorted(
        p.relative_to(ROOT).as_posix()
        for p in ROOT.rglob("*")
        if p.is_file() and not p.name.startswith("_")
    )
    gen_99(all_files)
    all_files = sorted(
        p.relative_to(ROOT).as_posix()
        for p in ROOT.rglob("*")
        if p.is_file() and not p.name.startswith("_")
    )
    dump_jsonish(
        "00_index/catalog.json",
        {
            "name": "lighthouse2030-kb",
            "version": "1.0.0",
            "disclaimer": "demo-synthetic",
            "file_count": len(all_files),
            "files": all_files,
        },
    )

    chunks = collect_chunks()
    write_store(chunks)
    print(f"files={len(all_files)} chunks={len(chunks)} store={DEMO_JS}")


if __name__ == "__main__":
    main()
