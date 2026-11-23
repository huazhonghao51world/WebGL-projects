/**
 * 工厂能源管理本地 Mock 数据
 * 用于替代真实接口，供 energyData mixin 使用：
 *   - default          能源总览  GET /api/v1/energy/overview 的 data
 *   - energyPlansMock  调控方案  GET /api/v1/energy/plans 的 data
 */
export default {
    statusLabel: '源荷失衡',
    todayMwh: 18.1,
    todayTrend: '2.1%',
    energyIntensity: 0.42,
    intensityNote: '对标绿线内',
    budgetUsed: 78,
    budgetNote: '关注峰段',
    budgetRemain: 902,
    budgetRemainUnit: 't',
    powerNow: 2.83,
    powerNote: '峰段运行',
    scenePois: [
        { id: 'grid', name: '并网点', type: 'grid', x: 8, y: 45 },
        { id: 'sub', name: '总降压站', type: 'sub', x: 22, y: 48 },
        { id: 'pv1', name: '屋顶光伏', type: 'pv', x: 55, y: 22 },
        { id: 'pv2', name: '车棚光伏', type: 'pv', x: 72, y: 28 },
        { id: 'pv3', name: '地面西站', type: 'pv', x: 18, y: 18 },
        { id: 'storage', name: '储能站', type: 'storage', x: 35, y: 38 },
        { id: 'ws1', name: '加工一车间', type: 'workshop', x: 48, y: 58 },
        { id: 'ws2', name: '加工二车间', type: 'workshop', x: 68, y: 62 },
        { id: 'air', name: '空压站', type: 'aux', x: 38, y: 72 }
    ],
    loadCurve: [
        { id: 1, factoryId: 1, hour: 0, load: 2.05, pv: 0 },
        { id: 2, factoryId: 1, hour: 1, load: 2.26, pv: 0 },
        { id: 3, factoryId: 1, hour: 2, load: 2.46, pv: 0 },
        { id: 4, factoryId: 1, hour: 3, load: 2.63, pv: 0 },
        { id: 5, factoryId: 1, hour: 4, load: 2.77, pv: 0 },
        { id: 6, factoryId: 1, hour: 5, load: 2.86, pv: 0 },
        { id: 7, factoryId: 1, hour: 6, load: 2.9, pv: 0 },
        { id: 8, factoryId: 1, hour: 7, load: 2.89, pv: 0.31 },
        { id: 9, factoryId: 1, hour: 8, load: 2.82, pv: 0.59 },
        { id: 10, factoryId: 1, hour: 9, load: 2.71, pv: 0.8 },
        { id: 11, factoryId: 1, hour: 10, load: 2.56, pv: 0.92 },
        { id: 12, factoryId: 1, hour: 11, load: 2.37, pv: 0.95 },
        { id: 13, factoryId: 1, hour: 12, load: 2.17, pv: 0.86 },
        { id: 14, factoryId: 1, hour: 13, load: 1.96, pv: 0.69 },
        { id: 15, factoryId: 1, hour: 14, load: 1.75, pv: 0.43 },
        { id: 16, factoryId: 1, hour: 15, load: 1.56, pv: 0.13 },
        { id: 17, factoryId: 1, hour: 16, load: 1.41, pv: 0 },
        { id: 18, factoryId: 1, hour: 17, load: 1.29, pv: 0 },
        { id: 19, factoryId: 1, hour: 18, load: 1.22, pv: 0 },
        { id: 20, factoryId: 1, hour: 19, load: 1.2, pv: 0 },
        { id: 21, factoryId: 1, hour: 20, load: 1.23, pv: 0 },
        { id: 22, factoryId: 1, hour: 21, load: 1.32, pv: 0 },
        { id: 23, factoryId: 1, hour: 22, load: 1.45, pv: 0 },
        { id: 24, factoryId: 1, hour: 23, load: 1.62, pv: 0 },
        { id: 25, factoryId: 1, hour: 24, load: 1.81, pv: 0 }
    ],
    energyStructure: [
        { id: 1, factoryId: 1, name: '生产', pct: 42, color: '#2261F0', sort: 1 },
        { id: 2, factoryId: 1, name: '空调', pct: 28, color: '#9BF8FF', sort: 2 },
        { id: 3, factoryId: 1, name: '动力', pct: 22, color: '#FBC32B', sort: 3 },
        { id: 4, factoryId: 1, name: '照明', pct: 8, color: '#94C2FF', sort: 4 }
    ],
    // ===== 异常与风险（统计 + 折线趋势 + 最高关注 + 列表） =====
    topLosses: {
        // 统计数据：顶部徽标总数 + 三项计数
        stats: {
            total: 4,       // 右上角红色徽标：异常总数
            alarm: 3,       // 告警
            highRisk: 1,    // 高风险
            unclosed: 2     // 未闭环
        },
        // 近24h 折线趋势（每 2h 一个采样点，两条序列）
        trend: {
            hours: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
            series: [
                { key: 'alarm', name: '告警', color: '#FBC32B', data: [0, 0, 1, 1, 2, 3, 3, 2, 2, 1, 1, 0, 0] },
                { key: 'highRisk', name: '高风险', color: '#F87171', data: [0, 0, 0, 1, 1, 1, 2, 1, 1, 1, 0, 0, 0] }
            ]
        },
        // 最高关注（列表顶部高亮条，点击查看详情）
        featured: [
            {
                text: '最高关注 · 地面西站光伏异常',
                action: '详情',
                level: 'danger',
                poi: 'pv3',
                lossWindow: {
                    title: '地面西站光伏异常',
                    headerTag: '',
                    headerTag2: '',
                    headerRight: '',
                    size: [270, 480],
                    windowData: [
                        { title: '等级', content: '高风险', flex: 1 },
                        { title: '发生时间', content: '今日 08:42', flex: 1 },
                        { title: '影响', content: '出力受限，市电受入抬升', flex: 1 },
                        { title: '所属设施', content: '场内光伏', flex: 1 },
                        { title: '异常类型', content: '板组/汇流异常', flex: 1 },
                        { title: '估计损失出力', content: '约 0.18 MW', flex: 1 },
                        { title: '建议动作', content: '上报 · 现场巡检', flex: 1 }
                    ]
                }
            }
        ],
        // 编号列表（右侧显示 pct 或 action）
        list: [
            {
                id: 1,
                factoryId: 1,
                text: '加工一车间 · 峰段负荷偏高',
                pct: '12%',
                level: 'warn',
                poi: 'ws1',
                sort: 1,
                lossWindow: {
                    title: '加工一车间 · 峰段负荷偏高',
                    headerTag: '',
                    headerTag2: '',
                    headerRight: '',
                    size: [270, 480],
                    windowData: [
                        { title: '等级', content: '告警', flex: 1 },
                        { title: '发生时间', content: '今日 09:05', flex: 1 },
                        { title: '影响', content: '推高并网峰值与电费', flex: 1 },
                        { title: '所属区域', content: '加工一车间', flex: 1 },
                        { title: '异常类型', content: '峰段负荷偏高', flex: 1 },
                        { title: '相对基线', content: '+12%', flex: 1 },
                        { title: '建议动作', content: '上报 · 调度复核', flex: 1 }
                    ]
                }
            },
            {
                id: 2,
                factoryId: 1,
                text: '空压站 · 泄漏估计损失',
                pct: '8%',
                level: 'warn',
                poi: 'air',
                sort: 2,
                lossWindow: {
                    title: '空压站 · 泄漏估计损失',
                    headerTag: '',
                    headerTag2: '',
                    headerRight: '',
                    size: [270, 480],
                    windowData: [
                        { title: '等级', content: '告警', flex: 1 },
                        { title: '发生时间', content: '昨日 16:20', flex: 1 },
                        { title: '影响', content: '空压电耗虚高，综合能耗偏高', flex: 1 },
                        { title: '所属设施', content: '空压站', flex: 1 },
                        { title: '异常类型', content: '泄漏统计', flex: 1 },
                        { title: '估计损失', content: '约 8%', flex: 1 },
                        { title: '建议动作', content: '上报 · 检修查漏', flex: 1 }
                    ]
                }
            },
            {
                id: 3,
                factoryId: 1,
                text: '并网点 · 峰段承压',
                action: '详情',
                level: 'warn',
                poi: 'grid',
                sort: 3,
                lossWindow: {
                    title: '并网点 · 峰段承压',
                    headerTag: '',
                    headerTag2: '',
                    headerRight: '',
                    size: [270, 480],
                    windowData: [
                        { title: '等级', content: '告警', flex: 1 },
                        { title: '发生时间', content: '今日 09:10', flex: 1 },
                        { title: '影响', content: '接近需量参考，存在越限风险', flex: 1 },
                        { title: '所属设施', content: '并网点 / 厂内变电', flex: 1 },
                        { title: '异常类型', content: '峰段承压', flex: 1 },
                        { title: '状态', content: '并网正常 · 承压', flex: 1 },
                        { title: '建议动作', content: '上报 · 值班值守', flex: 1 }
                    ]
                }
            }
        ]
    },
    carbon: [
        {
            id: 1,
            factoryId: 1,
            priceTier: '峰段',
            priceValue: 1.12,
            costToday: 41735,
            peakShare: 34,
            carbonToday: 126
        }
    ],
    carbonSummaries: [
        { id: 1, factoryId: 1, dayIntensity: 0.42, budgetUsed: 78 }
    ],
    feeds: [
        { id: 1, factoryId: 1, name: '加工一车间', eid: '', pct: 37, poi: 'ws1', drill: true, sort: 1 },
        { id: 2, factoryId: 1, name: '空压站', eid: '', pct: 14, poi: 'air', drill: false, sort: 2 },
        { id: 3, factoryId: 1, name: '加工二车间', eid: '', pct: 25, poi: 'ws2', drill: true, sort: 3 }
    ],
    microgrids: [
        {
            id: 1,
            factoryId: 1,
            pvOutput: 0.62,
            gridInput: 2.90,
            greenRate: 21.8,
            storageSoc: 68,
            gridStatus: '正常',
            storageState: '充电 · 待命削峰',
            storageDisMax: 0.9,
            storageEAvail: 1.2,
            storageMode: '峰段削峰 / 平滑波动',
            pvZones: [
                { id: 1, microgridId: 1, pvId: 'pv3', name: '地面西站', status: 'offline', sort: 1 },
                { id: 2, microgridId: 1, pvId: 'pv1', name: '屋顶一期', status: 'online', sort: 2 },
                { id: 3, microgridId: 1, pvId: 'pv2', name: '车棚阵列', status: 'online', sort: 3 }
            ]
        }
    ],
    alerts: [
        { id: 1, factoryId: 1, text: '地面光伏西站逆变器离线', level: 'danger', poi: 'pv3', sort: 1 },
        { id: 2, factoryId: 1, text: '源荷失衡 · 待验策', level: 'warn', poi: 'grid', sort: 2 },
        { id: 3, factoryId: 1, text: '加工一车间馈线偏高', level: 'warn', poi: 'ws1', sort: 3 }
    ]
}

/**
 * 调控方案列表本地 Mock 数据
 * 对应接口：GET /api/v1/energy/plans 的 data 字段
 * 用于替代真实接口，供 energyData mixin 的 loadEnergyPlans 使用
 */
export const energyPlansMock = [
    {
        id: 1,
        planCode: 'A',
        title: '最低碳排',
        recommended: false,
        storagePeakOut: 24,
        storagePeakMw: 0.66,
        airStrategy: 'leak',
        workshopShift: 15,
        gridMode: 'limit',
        buyMode: 'cap',
        effects: [
            { name: '市电峰段', trend: 'down', desc: '回落' },
            { name: '碳排强度', trend: 'down', desc: '下降' },
            { name: '生产', trend: 'neutral', desc: '需确认' }
        ],
        pois: ['storage', 'air', 'sub', 'ws1'],
        // 方案专属（spec §4.3 最低碳排）：点亮光伏/区域框，无新走线（其余由参数驱动）
        scenePoiCodes: ['pv'],
        sceneLineCodes: [],
        simGridDelta: '-0.12 MW',
        simGreenDelta: '+2.1%',
        simPeakDelta: '-4.2%',
        sort: 1
    },
    {
        id: 2,
        planCode: 'B',
        title: '最低成本',
        recommended: true,
        storagePeakOut: 23,
        storagePeakMw: 0.48,
        airStrategy: 'opt',
        workshopShift: 18,
        gridMode: 'limit',
        buyMode: 'cap',
        effects: [
            { name: '峰价购电', trend: 'down', desc: '压降' },
            { name: '并网峰值', trend: 'up', desc: '削平' },
            { name: '交付', trend: 'neutral', desc: '可协调' }
        ],
        pois: ['ws1', 'storage', 'grid', 'pv1', 'pv2'],
        // 方案专属（spec §4.3 最低成本）：光伏在线时额外 pv→workshop（不替代 pv→sub）
        scenePoiCodes: ['pv', 'workshop'],
        sceneLineCodes: ['E7'],
        simGridDelta: '-0.18 MW',
        simGreenDelta: '+3.8%',
        simPeakDelta: '-6.1%',
        sort: 2
    },
    {
        id: 3,
        planCode: 'C',
        title: '最低影响',
        recommended: false,
        storagePeakOut: 18,
        storagePeakMw: 0.78,
        airStrategy: 'secure',
        workshopShift: 8,
        gridMode: 'smooth',
        buyMode: 'normal',
        effects: [
            { name: '产线气压', trend: 'neutral', desc: '保供' },
            { name: '排程扰动', trend: 'neutral', desc: '最小' },
            { name: '成本', trend: 'down', desc: '无产调' }
        ],
        pois: ['pv3', 'grid'],
        // 方案专属（spec §4.3 最低影响）：点亮储能、空压，无强制长走线
        scenePoiCodes: ['storage', 'air'],
        sceneLineCodes: [],
        simGridDelta: '-0.05 MW',
        simGreenDelta: '+1.2%',
        simPeakDelta: '-1.0%',
        sort: 3
    }
]

/**
 * 左侧工具栏 WDP 工具数据（POI 坐标、相机、围栏、弹窗内容）
 * 供 wdpapi mixin 的 toolData 使用。key 对应工具按钮 toolId（1 空压 / 2 变电 / 3 发电 / 5 光伏 / 6 储能）。
 * 注：Top 异常损失联动的 POI 定位数据已拆分到本文件下方的 lossPoiDataMock。
 */
export const toolDataMock = {
    1: {
        // 空压
        focusCamera: {
            "location": [
                113.72491457230785,
                34.77226249719536,
                345.8833120279607
            ],
            "pitch": -59.05043411254883,
            "yaw": -83.82984924316406,
            "distance": 10
        },
        poiLocation: [[113.72492983464879, 34.77375089202268, 0]],
        poiConfig: {
            customId: ["p2_6_gen_1"],
            entityName: ["空压站"],
        },
        markerConfig: {
            markerNormalUrl: "DT_power.png",
            markerActivateUrl: "DT_power_active.png",
            markerSize: [48, 65],
        },
        entityEids: ["57067"], // TODO待补充（空压站模型实体ID）
        clickDistance: 617,
        clickFocusCameras: [
            {
                "location": [
                    113.72483092568162,
                    34.77295688108866,
                    136.05174279389982
                ],
                "pitch": -50.35072708129883,
                "yaw": -82.02989959716797,
                "distance": 0.1
            },
        ],
        windowConfig: {
            size: [270, 470],
            offset: [24, 40],
        },
        windowTitle: ["空压站(整站)"],
        entityEids: ["57063"], // TODO待补充（变电站模型实体ID）
        rangeLocations: [
            [[113.72478364906854, 34.773714510893676, 15], [113.72494986746145, 34.77363919746432, 15], [113.72507801970032, 34.77381396325011, 15], [113.72491872477956, 34.773894518034595, 15]],
        ], // TODO 待补充（空压站模型实体ID）
        rangeStyle: {
            type: "loop_line",
            fillAreaType: "solid",
            height: 0,
            strokeWeight: 0,
            color: "rgb(38, 70, 212)",
            fillAreaColor: "rgb(38, 70, 212)",
            bBlocked: false,
        },
        windowData: [
            [
                { title: "供气角色", content: "压缩空气动力站", flex: 1 },
                { title: "站装机", content: "450 kW", flex: 1 },
                { title: "在线机组", content: "3 台", flex: 1 },
                { title: "母管压力", content: "0.7 MPa", flex: 1 },
                { title: "站负荷", content: "428 kW", flex: 1 },
                { title: "站比功率", content: "0.118 kwh/m³", flex: 1 },
                { title: "站泄漏指数", content: "0.22", flex: 1 },
                { title: "今日站电", content: "14.1 Mwh", flex: 1 },
                { title: "站运行状态", content: "泄漏可疑", flex: 1 },
            ],
        ],
    },
    2: {
        // 配电室  变电
        focusCamera: {
            "location": [
                113.7253555300291,
                34.77369871947566,
                358.8025154292941
            ],
            "pitch": -62.35017013549805,
            "yaw": -27.279861450195312,
            "distance": 10
        },
        clickFocusCameras: [
            { location: [113.7261009030526, 34.77388103059488, 105.0542623017068], pitch: -58.000396728515625, yaw: -25.47954559326172, distance: 0.1 },
        ],
        poiLocation: [[113.72668666324812, 34.77409658878077, 0]],
        poiConfig: {
            customId: ["p2_6_trans_1"],
            entityName: ["变压器01"],
        },
        markerConfig: {
            markerNormalUrl: "DT_transformer.png",
            markerActivateUrl: "DT_transformer_active.png",
            markerSize: [48, 65],
        },
        clickDistance: 146,
        windowConfig: {
            size: [270, 340],
            offset: [24, 40],
        },
        windowTitle: ["变压器 / 变电所"],
        entityEids: ["57063"], // TODO待补充（变电站模型实体ID）
        rangeLocations: [
            // [[113.72699539794186,34.775115040574022,5],[113.72723381538937,34.77500314461038,5],[113.72689339982109,34.774500646796788,5],[113.72665357126684,34.774609397885619,5]],
        ], // TODO 待补充（空压站模型实体ID）
        // rangeStyle: {
        //     type: "loop_line",
        //     fillAreaType: "solid",
        //     height: 0,
        //     strokeWeight: 0,
        //     color: "f853ffff",
        //     fillAreaColor: "fa3400ff",
        //     bBlocked: false,
        // },
        windowData: [
            [
                { title: "实时角色", content: "受电枢红", flex: 1 },
                { title: "受入上限", content: "18 MW", flex: 1 },
                { title: "主变容量", content: "20 MVA", flex: 1 },
                { title: "电压等级", content: "110 / 10 kV", flex: 1 },
                { title: "受入功率", content: "2.9 MW", flex: 1 },
                { title: "负载率", content: "16%", flex: 1 },
            ]
        ],
    },
    3: {
        // 发电
        focusCamera: {
            "location": [
                113.72480561496725,
                34.773151146837044,
                393.14863276307943
            ],
            "pitch": -50.97265625,
            "yaw": -18.2866153717041,
            "distance": 10
        },
        poiLocation: [[113.72771482948903, 34.77368354016028, 0]],
        poiConfig: {
            customId: ["p2_6_gen_2"],
            entityName: ["发电设施02"],
        },
        markerConfig: {
            markerNormalUrl: "DT_power.png",
            markerActivateUrl: "DT_power_active.png",
            markerSize: [48, 65],
        },
        clickDistance: 617,
        clickFocusCameras: [
            { location: [113.72642902015933, 34.7733537650982, 148.82022111897072], pitch: -42.72347640991211, yaw: -14.986112594604492, distance: 0.1 },
        ],
        entityEids: ["57090", "57091", "57092"], // TODO待补充（发电机模型实体ID）
        windowConfig: {
            size: [270, 380],
            offset: [24, 40],
        },
        windowTitle: ["1# 柴油发电机"],
        rangeLocations: [
            [[113.72737661064981,34.773475519152811,5],[113.72768465011592,34.7733320599298,5],[113.72801254391705,34.773835363321055,5],[113.72772783496472,34.773971677021805,5]],
        ], // TODO待补充（发电机围栏多边形坐标，当前仍为旧光伏区域）
        rangeStyle: {
          type: "loop_line",
          fillAreaType: "solid",
          height: 0,
          strokeWeight: 0,
          color: "rgb(38, 70, 212)",
          fillAreaColor: "rgb(38, 70, 212)",
          bBlocked: false,
        },
        windowData: [
            [
                { title: "运行状态", content: "热备待命", flex: 1 },
                { title: "额定功率", content: "0.6 MW", flex: 1 },
                { title: "实时出力", content: "0.00 MW", flex: 1 },
                { title: "燃油余量", content: "78%", flex: 1 },
                { title: "机油温度", content: "42 °C", flex: 1 },
                { title: "累计运行", content: "1260 h", flex: 1 },
                { title: "燃料", content: "柴油", flex: 1 },
            ]
        ],
    },
    // 光伏（地面西站）
    5: {
        focusCamera: {
            "location": [113.7155914222202, 34.77659469927123, 388.38420332824325],
            "pitch": -55,
            "yaw": -74.09,
            "distance": 10
        },
        poiLocation: [[113.7159599638372, 34.77820780439828, 11.935527986830014]],
        poiConfig: {
            customId: ["p2_6_pv3_loss"],
            entityName: ["地面西站"],
        },
        markerConfig: {
            markerNormalUrl: "DT_power.png",
            markerActivateUrl: "DT_power_active.png",
            markerSize: [48, 65],
        },
        entityEids: ["57088"],
        clickDistance: 617,
        clickFocusCameras: [
            {
                "location": [
                    113.71585364935258,
                    34.777788580657294,
                    73.19268288535329
                ],
                "pitch": -53.222877502441406,
                "yaw": -74.0866928100586,
                "distance": 0.1
            },
        ],
        windowConfig: {
            size: [270, 300],
            offset: [24, 40],
        },
        windowTitle: ["PV-0206"],
        rangeLocations: [
            [[113.71596291362916, 34.77825911015444, 5], [113.71592238953984, 34.77819610403538, 5], [113.71596918055711, 34.7781723456081, 5], [113.71601326495806, 34.77823615360143, 5]],
        ],
        rangeStyle: {
            type: "loop_line",
            fillAreaType: "solid",
            height: 0,
            strokeWeight: 0,
            color: "rgb(38, 70, 212)",
            fillAreaColor: "rgb(38, 70, 212)",
            bBlocked: false,
        },
        windowData: [
            [
                { title: "运行状态", content: "异常停机", flex: 1 },
                { title: "实时出力", content: "0.00 kW", flex: 1 },
                { title: "板温", content: "59 °C", flex: 1 },
                { title: "当日电量", content: "0.4 kWh", flex: 1 },
                { title: "所属组串", content: "S2", flex: 1 },
            ]
        ],
    },
    6: {
        // 储能
        focusCamera: {
            location: [113.72563473801897, 34.77340606472266, 399.5231939337027],
            pitch: -62.20024108886719,
            yaw: -26.83011817932129,
            distance: 10,
        },
        poiLocation: [[113.7273377286769, 34.77386421728069, 0]],
        poiConfig: {
            customId: ["p2_6_storage_1"],
            entityName: ["储能"],
        },
        markerConfig: {
            markerNormalUrl: "DT_power.png",
            markerActivateUrl: "DT_power_active.png",
            markerSize: [48, 65],
        },
        entityEids: ["57067"],
        clickDistance: 617,
        clickFocusCameras: [
            { location: [113.72643826911101, 34.77362142546437, 164.37589021561178], pitch: -58.15035629272461, yaw: -26.230119705200195, distance: 0.1 },
        ],
        windowConfig: {
            size: [270, 470],
            offset: [24, 40],
        },
        windowTitle: ["储能站"],
        rangeLocations: [
            [[113.72693461420347, 34.77366804292068,5],[113.72734268318996, 34.77348007305967,5],[113.7277415979108, 34.774052911761444,5],[113.72732086366584, 34.77425193772517,5]],
        ],
        rangeStyle: {
            type: "loop_line",
            fillAreaType: "none",
            height: 0,
            strokeWeight: 0,
            color: "rgb(38, 70, 212)",
            fillAreaColor: "rgb(38, 70, 212)",
            bBlocked: false,
        },
        windowData: [
            [
                { title: "实时 SOC", content: "68%", flex: 1 },
                { title: "安全下限", content: "20%", flex: 1 },
                { title: "峰放上限", content: "0.90 MW", flex: 1 },
                { title: "可放上限", content: "0.90 MW", flex: 1 },
                { title: "可用容量", content: "1.20 MWh", flex: 1 },
                { title: "SOC", content: "68%", flex: 1 },
                { title: "SOC 下限", content: "20%", flex: 1 },
                { title: "峰放执行", content: "0.67 MW", flex: 1 },
                { title: "运行状态", content: "充电·待命削峰", flex: 1 },
            ]
        ],
    },
}

/**
 * Top 异常损失 POI 定位数据（点击“异常与风险”条目时联动定位）
 * 与左侧工具栏的 toolDataMock 分离；key = topLosses[].poi。
 * 说明：弹窗内容由 topLosses[].lossWindow 覆盖，这里只需提供定位相关字段
 *      （相机 / POI 坐标 / 描边实体 / 围栏）。
 */
export const lossPoiDataMock = {
    // 加工一车间 → 配电柜01
    ws1: {
        focusCamera: {
            location: [113.72233268229859, 34.77674325825544, 139.45814352144183],
            pitch: -60.79972839355469,
            yaw: -160.48678588867188,
            distance: 0,
        },
        poiLocation: [[113.72185280222837, 34.77631860550303, 2.5259354410957524]],
        poiConfig: {
            customId: ["p2_6_loss_ws1"],
            entityName: ["配电柜01"],
        },
        markerConfig: {
            markerNormalUrl: "DT_cabinet.png",
            markerActivateUrl: "DT_cabinet_active.png",
            markerSize: [48, 65],
        },
        entityEids: ["56939"],
        clickDistance: 126,
        clickFocusCameras: [
            { location: [113.72194150669135, 34.77644238544541, 17.66425362664689], pitch: -41.29993438720703, yaw: 116.41252136230469, distance: 0.1 },
        ],
        windowConfig: {
            size: [190, 144],
            offset: [24, 40],
        },
    },
    // 空压站
    air: {
        focusCamera: {
            location: [113.72200, 34.77800, 380],
            pitch: -55,
            yaw: -134.38,
            distance: 10,
        },
        poiLocation: [[113.72041620130084, 34.779499298087806, 12.608822581351244]],
        poiConfig: {
            customId: ["p2_6_loss_air"],
            entityName: ["空压站"],
        },
        markerConfig: {
            markerNormalUrl: "DT_power.png",
            markerActivateUrl: "DT_power_active.png",
            markerSize: [48, 65],
        },
        entityEids: ["57067"],
        clickDistance: 617,
        clickFocusCameras: [
            { location: [113.72105034315165, 34.778864489682334, 73.19268288535329], pitch: -33.72257995605469, yaw: -134.38638305664062, distance: 0.1 },
        ],
        windowConfig: {
            size: [190, 144],
            offset: [24, 40],
        },
    },
    // 地面西站（光伏异常）
    pv3: {
        focusCamera: {
            location: [113.71585364935258, 34.777788580657294, 73.19268288535329],
            pitch: -55,
            yaw: -74.09,
            distance: 10,
        },
        poiLocation: [[113.7159599638372, 34.77820780439828, 11.935527986830014]],
        poiConfig: {
            customId: ["p2_6_loss_pv3"],
            entityName: ["地面西站"],
        },
        markerConfig: {
            markerNormalUrl: "DT_power.png",
            markerActivateUrl: "DT_power_active.png",
            markerSize: [48, 65],
        },
        clickDistance: 617,
        clickFocusCameras: [
            { location: [113.71585364935258, 34.777788580657294, 73.19268288535329], pitch: -53.222877502441406, yaw: -74.0866928100586, distance: 0.1 },
        ],
        windowConfig: {
            size: [190, 144],
            offset: [24, 40],
        },
        rangeLocations: [
            [[113.71596291362916, 34.77825911015444, 9.580964490030695], [113.71592238953984, 34.77819610403538, 9.580964490030695], [113.71596918055711, 34.7781723456081, 9.580964490030697], [113.71601326495806, 34.77823615360143, 9.580964490030697]],
        ],
        rangeStyle: {
            type: "loop_line",
            fillAreaType: "solid",
            height: 0,
            strokeWeight: 0,
            color: "f853ffff",
            fillAreaColor: "fa3400ff",
            bBlocked: false,
        },
    },
    // 并网点 / 厂内变电 → 变压器01
    grid: {
        focusCamera: {
            location: [113.72369656780063, 34.77373296647845, 385.38016397664984],
            pitch: -50.9727783203125,
            yaw: -18.286428451538086,
            distance: 10,
        },
        poiLocation: [[113.72665539925733, 34.77396697892957, 6.035388423839118]],
        poiConfig: {
            customId: ["p2_6_loss_grid"],
            entityName: ["变压器01"],
        },
        markerConfig: {
            markerNormalUrl: "DT_transformer.png",
            markerActivateUrl: "DT_transformer_active.png",
            markerSize: [48, 65],
        },
        entityEids: ["57063"],
        clickDistance: 146,
        clickFocusCameras: [
            { location: [113.72583907673638, 34.77386421865383, 68.3978063771974], pitch: -35.97329330444336, yaw: -12.736247062683105, distance: 0.1 },
        ],
        windowConfig: {
            size: [190, 144],
            offset: [24, 40],
        },
    },
}

/**
 * 场景联动本地 Mock 数据
 * 对应接口：GET /api/v1/energy/scene 的 data 字段
 * 用于替代真实接口，供 energyData mixin 的 loadEnergyScene 使用
 *   - lines: 方案迁徙线（抛物线）坐标字典，键 E1~E5
 *   - pois:  场景 POI 区域围栏坐标字典
 */
export const energySceneMock = {
    // 场景坐标点位表：key 为设施名，value 为对应坐标
    points: {
        sub: [113.72668666324812, 34.77409658878077, 0], // 变电所
        grid: [113.72400671636828, 34.78005828853806, 0], // 并网点, 杆塔
        generator: [113.72771482948903, 34.77368354016028, 0], // 柴发，发电室
        workshop: [113.72163106382004, 34.7770981011073, 0], // 生产车间
        pv: [113.71620685241508, 34.77842107087473, 0], // 光伏
        storage: [113.72730035338041, 34.7738117328425, 0], // 储能
        air: [113.72492983464879, 34.77375089202268, 0], // 空压
    },
    // 方案迁徙线：value 为 points 中的点位 key 序列
    lines: {
        E1: ['sub', 'grid'], // 并网点 → 变电所 
        E2: ['workshop', 'sub'],  //  变电所 → 车间
        E3: ['sub', 'pv'], // 光伏 → 变电所
        E4: ['sub', 'storage'], // 变电所 → 储能
        E5: ['storage', 'sub'], // 储能 → 变电所
        E6: ['air', 'workshop'], // 空压 → 车间
        E7: ['pv', 'workshop'], // 光伏 → 车间（方案B 光荷协同）
        E8: ['generator', 'sub'], // 柴发 → 变电所（顶峰）
    },
    pois: {
        grid: [
            [113.7238552985886, 34.779978287127896],
            [113.72415178854986, 34.77995308331831],
            [113.72416417112306, 34.78020472889759],
            [113.72384339800512, 34.78020284352095],
        ],
        pv: [
            [113.71570832161866, 34.77808156229303],
            [113.71611986012527, 34.777898260200324],
            [113.7166702302544, 34.778725961498836],
            [113.71626731929103, 34.77891787189919],
        ],
        storage: [
            [113.72693009047609,34.773665703491368],
            [113.72735010656761,34.773465944695062],
            [113.72773420699373,34.77405331608464],
            [113.72731714041934,34.774245512019291],
        ],
        sub: [
            [113.72625353929679,34.774057035203647],
            [113.72682891476205,34.773776705190961],
            [113.72711382538735,34.774157895231475],
            [113.72652829862901,34.774453877083907],
        ],
        workshop: [
            [113.71971498459304, 34.77720345784089],
            [113.72043857467813, 34.77825011386585],
            [113.72359665073962, 34.77688621297515],
            [113.72294681069108, 34.77575690884758],
        ],
        pv : [
            [113.71593951074516,34.778022413328685],
            [113.7159819383388,34.778081326563353],
            [113.71614068244888,34.77800590433133],
            [113.71661752723308,34.778706277637937],
            [113.71629547831878,34.778855480446012],
            [113.71577166387388,34.778096337562374],
        ],
        air: [
            [113.72478251220357,34.773733761650334],
            [113.72501024572941,34.773621859792001],
            [113.72526010818967,34.773969674047734],
            [113.72503831093144,34.774083787681825]
        ],
        generator: [
            [113.72739935375817,34.773499837369229],
            [113.72770707476802,34.77336444605686],
            [113.7279979176472,34.773811502845852],
            [113.72768763254284,34.773948938470369]
        ],
    },
}
