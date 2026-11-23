
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
