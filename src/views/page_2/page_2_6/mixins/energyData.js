import energyOverviewMock, { energyPlansMock, energySceneMock } from './MockData'

/**
 * 能源管理数据加载 mixin
 *
 * 暴露：
 *  - data: energyOverview / energyPlans / energyScene / energyLoading / energyError
 *  - methods: loadEnergyOverview / loadEnergyPlans / loadEnergyScene / refreshEnergyData
 */
export default {
    data() {
        return {
            // 能源管理总览（GET /api/v1/energy/overview 的 data）
            energyOverview: null,
            // 调控方案列表（GET /api/v1/energy/plans 的 data）
            energyPlans: [],
            // 场景数据（GET /api/v1/energy/scene 的 data）
            energyScene: null,
            // loading 状态
            energyLoading: {
                overview: false,
                plans: false,
                scene: false
            },
            // 错误信息
            energyError: {
                overview: null,
                plans: null,
                scene: null
            }
        }
    },
    methods: {
        /**
         * 通用加载封装：统一处理 loading / error / 赋值
         * @param {String} key      资源键（overview / plans / scene）
         * @param {Function} loader 返回 Promise<数据> 的加载函数
         * @param {String} field    要写入的 data 字段名
         * @param {*} fallback      失败时返回值
         * @param {String} errMsg   默认错误提示
         */
        async _loadEnergyResource(key, loader, field, fallback, errMsg) {
            this.energyLoading[key] = true
            this.energyError[key] = null
            try {
                this[field] = await loader()
                return this[field]
            } catch (err) {
                this.energyError[key] = (err && (err.message || err.msg)) || errMsg
                console.error(`[energyData] load ${key} failed:`, err)
                return fallback
            } finally {
                this.energyLoading[key] = false
            }
        },

        /** 加载能源总览数据（当前使用本地 mock，不请求接口） */
        loadEnergyOverview() {
            return this._loadEnergyResource(
                'overview',
                () => energyOverviewMock,
                'energyOverview',
                null,
                '加载能源总览失败'
            )
        },

        /** 加载调控方案列表（当前使用本地 mock，不请求接口） */
        loadEnergyPlans() {
            return this._loadEnergyResource(
                'plans',
                () => energyPlansMock,
                'energyPlans',
                [],
                '加载方案列表失败'
            )
        },

        /** 加载场景联动数据（当前使用本地 mock，不请求接口） */
        loadEnergyScene() {
            return this._loadEnergyResource(
                'scene',
                () => energySceneMock,
                'energyScene',
                null,
                '加载场景数据失败'
            )
        },

        /** 一次性刷新所有能源数据 */
        async refreshEnergyData(params) {
            await Promise.all([
                this.loadEnergyOverview(params),
                this.loadEnergyPlans(params),
                this.loadEnergyScene(params)
            ])
        }
    }
}
