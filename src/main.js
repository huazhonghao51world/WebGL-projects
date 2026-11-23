import 'core-js/stable';
import 'regenerator-runtime/runtime';
import router from './router';
import store from './store';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'; 
import Vue from 'vue';
import App from './App.vue';
import debounce from './directives/clickDebounce'
import RouteParamsKeeper from "./utils/routeParamsKeeper"

Vue.use(debounce)
Vue.use(ElementUI);
// 跨路由保留的 URL 参数：三维平台地址 / 交付码 / AI 助手后端
Vue.use(RouteParamsKeeper, {
  params: ['serverUrl', 'deliveryCode', 'agentHostUrl'],
  router: router
});
Vue.prototype.$axios = axios;

/**
 * 三维弹窗（#/wdpWindow，twinSDK Window 覆盖物的 iframe）回传通道：
 * 原 UE 云渲染注入全局 w51_event(key, json) → 场景 OnWebJSEvent；twinSDK 改为 postMessage 给父页面，
 * 由 layout/scene.vue 转发为 emitter "windowEvent"。弹窗组件代码无需改动。
 */
if (typeof window.w51_event !== 'function') {
  window.w51_event = (key, jsondata) => {
    if (window.parent === window) return;
    const payload = typeof jsondata === 'string' ? JSON.parse(jsondata) : { ...jsondata };
    window.parent.postMessage({ source: 'twin-window', key, ...payload }, window.location.origin);
  };
}

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});

