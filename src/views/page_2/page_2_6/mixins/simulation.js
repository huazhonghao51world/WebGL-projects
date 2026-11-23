import { runEnergySimulationAPI } from '@/utils/api/page_2_6'

/**
 * 孪生仿真 SSE mixin
 *
 * 状态机：
 *   idle  ──runSimulation()──▶ running
 *   running ──onSimulateResult──▶ 有 result，hasResult=true，dirty=false
 *   running ──onAnswerStart──▶ aiAnswering=true
 *   running ──onAnswer──▶ 累积 aiContent
 *   running ──onDone/onError──▶ idle，running=false
 *
 * 修改任何参数后调用 markSimDirty()，UI 据此判断 “需要重新仿真”
 *
 * 暴露：
 *  - data: simState（统一只暴露一个对象，避免命名污染）
 *  - methods: runSimulation / cancelSimulation / markSimDirty / approveSimulation / resetSimulation
 */
export default {
    data() {
        return {
            simState: {
                /** 是否正在跑仿真 / 流式 AI 回答 */
                running: false,
                /** 参数已变更，需要重新跑仿真 */
                dirty: true,
                /** 是否已得到一份有效仿真结果 */
                hasResult: false,
                /** simulate_result 数据（result 字段内容） */
                result: null,
                /** AI 流式输出中 */
                aiAnswering: false,
                /** AI 累积文本内容 */
                aiContent: '',
                /** 错误信息 */
                error: null,
                /** 仿真快照 ID（用于审批引用） */
                lastSnapshot: null,
                /** 已提交审批信息 */
                approvalDone: null
            }
        }
    },
    beforeDestroy() {
        this._cleanupAborter()
    },
    methods: {
        _cleanupAborter() {
            if (this._simAborter) {
                try {
                    this._simAborter.abort()
                } catch (e) {
                    // ignore
                }
                this._simAborter = null
            }
        },

        /**
         * 标记参数已变更，需要重新仿真
         */
        markSimDirty() {
            this.simState.dirty = true
        },

        /**
         * 重置仿真状态（不取消正在进行的请求，仅清空展示数据）
         */
        resetSimulation() {
            this.simState.hasResult = false
            this.simState.result = null
            this.simState.aiContent = ''
            this.simState.aiAnswering = false
            this.simState.error = null
            this.simState.lastSnapshot = null
            this.simState.dirty = true
        },

        /**
         * 运行孪生仿真
         * @param {Object} body 请求体（factoryId/planId/pois/storagePeakOut/...）
         */
        runSimulation(body) {
            // 取消之前可能正在进行的请求
            this._cleanupAborter()

            // 状态初始化
            this.simState.running = true
            this.simState.error = null
            this.simState.aiContent = ''
            this.simState.aiAnswering = false

            this._simAborter = runEnergySimulationAPI(body, {
                onSimulateResult: (payload) => {
                    // 接口示例：{ tool, result, timestamp }
                    const result = (payload && payload.result) || payload || null
                    this.simState.result = result
                    this.simState.hasResult = !!(result && result.success !== false)
                    this.simState.dirty = false

                    // 场景目标状态色联动（有利=绿，告警=琥珀）—— 仅在“呈现配置影响”开启时联动
                    if (this.sceneImpactVisible && typeof this.applySimulationImprovementToScene === 'function') {
                        this.applySimulationImprovementToScene((result && result.improvement) || {})
                    }

                    if (result && result.simId !== undefined && result.simId !== null) {
                        this.simState.lastSnapshot = `SIM-${result.simId}`
                    } else {
                        // 兜底：用时间戳生成快照号
                        this.simState.lastSnapshot = 'SIM-' + Date.now().toString(36).slice(-5).toUpperCase()
                    }
                },
                onAnswerStart: () => {
                    this.simState.aiAnswering = true
                    this.simState.aiContent = ''
                },
                onAnswer: (content) => {
                    if (typeof content === 'string' && content) {
                        this.simState.aiContent += content
                    }
                },
                onDone: () => {
                    this.simState.aiAnswering = false
                    this.simState.running = false
                    this._simAborter = null
                },
                onError: (msg) => {
                    this.simState.error = msg || '仿真失败'
                    this.simState.running = false
                    this.simState.aiAnswering = false
                    this._simAborter = null
                }
            })
        },

        /**
         * 取消进行中的仿真
         */
        cancelSimulation() {
            this._cleanupAborter()
            this.simState.running = false
            this.simState.aiAnswering = false
        },

        /**
         * 提交审批（只在 hasResult && !dirty 时生效）
         * @param {String} planTitle 方案标题
         * @returns {Boolean} 是否提交成功
         */
        approveSimulation(planTitle) {
            if (!this.simState.hasResult || this.simState.dirty || this.simState.running) {
                return false
            }
            this.simState.approvalDone = {
                plan: planTitle || '',
                snapshot: this.simState.lastSnapshot,
                at: new Date().toLocaleTimeString('zh-CN', { hour12: false })
            }
            return true
        }
    }
}
