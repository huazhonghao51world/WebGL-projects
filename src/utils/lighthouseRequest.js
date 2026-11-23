import axios from 'axios'
import { Message } from 'element-ui'
import { debounce } from 'throttle-debounce'

/**
 * 灯塔中台接口专用 axios 实例
 * - baseURL 来自 .env 中的 VUE_APP_LIGHTHOUSE_API
 * - 与 src/utils/request.js 中的 mock 实例完全隔离，避免相互影响
 * - 业务约定：成功响应 { code: 200, message, data }，code !== 200 视为业务失败
 */

const errorMessage = debounce(500, (message, type = 'error') => {
    Message({
        message,
        duration: 2500,
        type
    })
})

const service = axios.create({
    baseURL: process.env.VUE_APP_LIGHTHOUSE_API,
    timeout: 60000
})

// request 拦截器
service.interceptors.request.use(
    (config) => {
        config.headers = config.headers || {}
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json;charset=UTF-8'
        }
        return config
    },
    (error) => Promise.reject(error)
)

// response 拦截器
service.interceptors.response.use(
    (response) => {
        const res = response.data

        // blob 等特殊响应直接放行
        if (response.config.responseType === 'blob') {
            return response
        }

        // 业务约定：code === 200 成功
        if (res && typeof res === 'object' && 'code' in res) {
            if (res.code === 200) {
                return res
            }
            errorMessage(res.message || '请求失败')
            return Promise.reject(res)
        }

        // 没有 code 字段，按原始数据返回
        return res
    },
    (error) => {
        if (error.response) {
            const status = error.response.status
            if (status === 500) {
                errorMessage('网络错误，请稍后重试')
            } else if (status === 401) {
                errorMessage('登录已过期，请重新登录')
            } else if (error.response.data && error.response.data.message) {
                errorMessage(error.response.data.message)
            } else {
                errorMessage(`请求失败 (HTTP ${status})`)
            }
        } else {
            errorMessage('网络异常：' + (error.message || '未知错误'))
        }
        return Promise.reject(error)
    }
)

export default service

// 暴露 baseURL 供 SSE 等不走 axios 的请求使用
export const lighthouseBaseURL = process.env.VUE_APP_LIGHTHOUSE_API
