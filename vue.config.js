
const { codeInspectorPlugin } = require('code-inspector-plugin');
const path = require('path');
module.exports = {
    outputDir: process.env.VUE_APP_OUT_DIR || "dist",
    assetsDir: "static",
    productionSourceMap: false,
    transpileDependencies: ['vue-jsmpeg-player'],
    // 公共路径
    publicPath: "./",
    devServer: {
        // 配置服务器
        port: process.env.VUE_APP_RUN_PORT || 3688,
        host: "0.0.0.0",
        open: process.env.NODE_ENV === "development",
        https: false,
        overlay: {
            warnings: false,
            errors: true,
        },
        disableHostCheck: true,
        // 视频网关同源代理（与交付服务器 tools/deploy/xy-server.js 一致）。
        proxy: {
            '/xy-video/webrtc': { target: 'http://127.0.0.1:8889', pathRewrite: { '^/xy-video/webrtc': '' }, changeOrigin: true },
            '/xy-video/hls': { target: 'http://127.0.0.1:8888', pathRewrite: { '^/xy-video/hls': '' }, changeOrigin: true,
                // MediaMTX 首次请求会 302 到绝对路径 /camN/index.m3u8?cookieCheck=1 并下发 Secure Cookie：
                // 需把跳转补回代理前缀，并去掉 Secure（http 页面下浏览器会丢弃 Secure Cookie，导致 manifestParsingError）。
                onProxyRes(proxyRes) {
                    const loc = proxyRes.headers.location;
                    if (loc && loc.startsWith('/')) proxyRes.headers.location = '/xy-video/hls' + loc;
                    const sc = proxyRes.headers['set-cookie'];
                    if (sc) proxyRes.headers['set-cookie'] = sc.map((c) => c.replace(/;\s*Secure/gi, '').replace(/;\s*Partitioned/gi, '').replace(/SameSite=None/gi, 'SameSite=Lax'));
                } },
        },
    },
    lintOnSave: false,
    configureWebpack: {
        plugins: [
            codeInspectorPlugin({
                bundler: 'webpack',
            }),
        ],
        // output: {
        //     filename: "[name].js"
        // },
        optimization: {
            splitChunks: false
        }
    },

    css: {
        loaderOptions: {
            scss: {
                additionalData: `@import "~@css/_functions.scss";`,
            },
        },
    },

    chainWebpack: (config) => {
        // 双碳问答资料库的 md/csv 需要按纯文本引入，供能碳助手检索
        config.module
            .rule('knowledge-text')
            .test(/\.(md|csv)$/)
            .include.add(path.resolve(__dirname, './src/assets/knowledge')).end()
            .use('raw-loader')
            .loader('raw-loader');

        config.resolve.alias
            .set('@src', path.resolve(__dirname, './src'))
            .set('@assets', path.resolve(__dirname, './src/assets'))
            .set('@images', path.resolve(__dirname, './src/assets/images'))
            .set('@css', path.resolve(__dirname, './src/assets/css'))
            .set('@view', path.resolve(__dirname, './src/views'))
            .set('@', path.resolve(__dirname, './src'))
            .set('@components', path.resolve(__dirname, './src/components'))
            .set('@layout', path.resolve(__dirname, './src/layout/index.vue'))
            .set('@utils', path.resolve(__dirname, './src/utils'))
            .set('@utilsApi', path.resolve(__dirname, './src/utils/api'))
            .set('@utilsTwin', path.resolve(__dirname, './src/utils/twin'))
            .set('@mixin', path.resolve(__dirname, './src/mixins'))
            .set('@wdpImg', path.resolve(__dirname, '../wdp_img'))
            ;
    }
}
