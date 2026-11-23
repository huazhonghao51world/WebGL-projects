/**
 * Vue Router 路由配置 - 包含路由守卫
 * 
 * 路由结构:
 * / (根路径)
 * ├── /page_1 (第一个页面模块)
 * │   ├── /page_1/1 (子页面1)
 * │   ├── /page_1/2 (子页面2)
 * │   ├── /page_1/3 (子页面3)
 * │   └── /page_1/4 (子页面4)
 * ├── /page_2 (第二个页面模块)
 * ├── /page_3 (第三个页面模块)
 * └── /page_4 (第四个页面模块)
 * 
 * @author Hua<51world>
 */

import Vue from "vue";
import VueRouter from "vue-router";
import { Message } from 'element-ui';
import store from '@/store'; // 引入 Vuex store

// 注册 Vue Router 插件
Vue.use(VueRouter);

// 解决 Vue Router 重复导航的警告问题
// 重写 push 方法，捕获并忽略重复导航错误
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

/**
 * 路由配置数组
 * 采用嵌套路由结构，支持多级页面导航
 */
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '用户登录',
      requiresAuth: false,
      keepAlive: false,
      showInMenu: false
    }
  },
  {
    path: "/",
    component: () => import("@/views/index.vue"),
    // redirect: "/page_1",
    redirect: "/xy-factory", // 默认进入 XY 工厂；灯塔工厂仍可通过 /page_2/2 访问
    meta: {
      title: '数据可视化大屏',
      requiresAuth: false, // 是否需要认证
      keepAlive: true,     // 是否缓存组件
      showInMenu: false    // 是否在菜单中显示
    },
    children: [
      {
        path: "xy-factory",
        name: "xy-factory",
        component: () => import("@/views/xy_factory/index.vue"),
        meta: { title: "XY工厂", caseKey: "xy", requiresAuth: false },
      },
      /* 单图模式：隐藏 /page_1
      {
        path: "/page_1",
        component: () => import("@/views/page_1/index.vue"),
        redirect: "/page_1/1",
        meta: {
          title: '51集团',
          requiresAuth: false,
          keepAlive: true,
          showInMenu: true,
          icon: 'el-icon-data-line'
        },
        children: [
          {
            path: "1",
            name: "page_1_1",
            component: () => import("@/views/page_1/page_1_1/index.vue"),
            meta: {
              title: '集团-首页',
              requiresAuth: true,
              keepAlive: true,
              showInMenu: true
            }
          }
        ]
      },
      */
      {
        path: "/page_2",
        component: () => import("@/views/page_2/index.vue"),
        redirect: "/page_2/2",
        meta: {
          title: '上海工厂',
          requiresAuth: false,
          keepAlive: true,
          showInMenu: true,
          icon: 'el-icon-pie-chart'
        },
        children: [
          /* 单图模式：隐藏 /page_2/1
          {
            path: "1",
            name: "page_2_1",
            component: () => import("@/views/page_2/page_2_1/index.vue"),
            meta: {
              title: '工厂-综合态势',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          */
          {
            path: "2",
            name: "page_2_2",
            component: () => import("@/views/page_2/page_2_2/index.vue"),
            meta: {
              title: '工厂-智能生产',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          /* 单图模式：隐藏 /page_2/3 ~ /page_2/8 及车间、设备子页
          {
            path: "3",
            name: "page_2_3",
            component: () => import("@/views/page_2/page_2_3/index.vue"),
            meta: {
              title: '工厂-智能仓储',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          }, {
            path: "4",
            name: "page_2_4",
            component: () => import("@/views/page_2/page_2_4/index.vue"),
            meta: {
              title: '工厂-产品管理',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          }, {
            path: "5",
            name: "page_2_5",
            component: () => import("@/views/page_2/page_2_5/index.vue"),
            meta: {
              title: '工厂-设备管理',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          }, {
            path: "6",
            name: "page_2_6",
            component: () => import("@/views/page_2/page_2_6/index.vue"),
            meta: {
              title: '工厂-能源管理',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          }, {
            // gc-wxy 版能源管理页（能力模块），与 page_2_6 并存
            path: "6w",
            name: "page_2_6_w",
            component: () => import("@/views/page_2/page_2_6/index-w.vue"),
            meta: {
              title: '工厂-能源管理(能力模块)',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: false
            }
          }, {
            path: "7",
            name: "page_2_7",
            component: () => import("@/views/page_2/page_2_7/index.vue"),
            meta: {
              title: '工厂-环境管理',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          }, {
            path: "8",
            name: "page_2_8",
            component: () => import("@/views/page_2/page_2_8/index.vue"),
            meta: {
              title: '工厂-应急安防',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "1-workshop",
            name: "page_2_1_workshop",
            component: () => import("@/views/page_2/page_2_1_workshop/index.vue"),
            meta: {
              title: '工厂-综合态势-车间',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "1-device",
            name: "page_2_1_device",
            component: () => import("@/views/page_2/page_2_1_device/index.vue"),
            meta: {
              title: '工厂-综合态势-设备',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "2-workshop",
            name: "page_2_2_workshop",
            component: () => import("@/views/page_2/page_2_2_workshop/index.vue"),
            meta: {
              title: '工厂-智能生产-车间',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "2-device",
            name: "page_2_2_device",
            component: () => import("@/views/page_2/page_2_2_device/index.vue"),
            meta: {
              title: '工厂-智能生产-设备',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "3-workshop",
            name: "page_2_3_workshop",
            component: () => import("@/views/page_2/page_2_3_workshop/index.vue"),
            meta: {
              title: '工厂-智能仓储-车间',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "3-device",
            name: "page_2_3_device",
            component: () => import("@/views/page_2/page_2_3_device/index.vue"),
            meta: {
              title: '工厂-智能仓储-设备',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "4-workshop",
            name: "page_2_4_workshop",
            component: () => import("@/views/page_2/page_2_4_workshop/index.vue"),
            meta: {
              title: '工厂-产品管理-车间',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "4-device",
            name: "page_2_4_device",
            component: () => import("@/views/page_2/page_2_4_device/index.vue"),
            meta: {
              title: '工厂-产品管理-设备',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "5-workshop",
            name: "page_2_5_workshop",
            component: () => import("@/views/page_2/page_2_5_workshop/index.vue"),
            meta: {
              title: '工厂-设备管理-车间',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "5-device",
            name: "page_2_5_device",
            component: () => import("@/views/page_2/page_2_5_device/index.vue"),
            meta: {
              title: '工厂-设备管理-设备',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "6-workshop",
            name: "page_2_6_workshop",
            component: () => import("@/views/page_2/page_2_6_workshop/index.vue"),
            meta: {
              title: '工厂-能源管理-车间',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "6-device",
            name: "page_2_6_device",
            component: () => import("@/views/page_2/page_2_6_device/index.vue"),
            meta: {
              title: '工厂-能源管理-设备',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "7-workshop",
            name: "page_2_7_workshop",
            component: () => import("@/views/page_2/page_2_7_workshop/index.vue"),
            meta: {
              title: '工厂-环境管理-车间',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "7-device",
            name: "page_2_7_device",
            component: () => import("@/views/page_2/page_2_7_device/index.vue"),
            meta: {
              title: '工厂-环境管理-设备',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "8-workshop",
            name: "page_2_8_workshop",
            component: () => import("@/views/page_2/page_2_8_workshop/index.vue"),
            meta: {
              title: '工厂-应急安防-车间',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          },
          {
            path: "8-device",
            name: "page_2_8_device",
            component: () => import("@/views/page_2/page_2_8_device/index.vue"),
            meta: {
              title: '工厂-应急安防-设备',
              requiresAuth: false,
              keepAlive: true,
              showInMenu: true
            }
          }
          */
        ]
      },
    ]
  },
  // wdpWindow 页面路由 - 用于播放 RTSP 视频
  {
    path: '/wdpWindow',
    name: 'wdpWindow',
    component: () => import('@/views/wdpWindow/index.vue'),
    meta: {
      title: 'RTSP视频播放',
      requiresAuth: false,
      keepAlive: false,
      showInMenu: false
    }
  },
  // 404 错误页面
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      requiresAuth: false,
      showInMenu: false
    }
  },
  // 403 权限不足页面
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '权限不足',
      requiresAuth: false,
      showInMenu: false
    }
  },
  // 通配符路由，重定向到404页面
  {
    path: '*',
    redirect: '/404'
  }
];

// 创建路由实例
const router = new VueRouter({
  mode: "hash",
  routes,
});

/**
 * 检查用户是否有访问权限
 * @param {Array} requiredRoles 需要的角色权限
 * @param {Array} userRoles 用户拥有的角色
 * @returns {Boolean} 是否有权限
 */
function hasPermission(requiredRoles, userRoles) {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * 获取用户认证状态
 * @returns {Boolean} 是否已认证
 */
function isAuthenticated() {
  // 这里可以检查 token、session 等
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
}

/**
 * 获取用户角色
 * @returns {Array} 用户角色数组
 */
function getUserRoles() {
  // 从 store 或 localStorage 获取用户角色
  const userInfo = store.getters.userInfo || JSON.parse(localStorage.getItem('userInfo') || '{}');
  return userInfo.roles || ['guest'];
}

/**
 * 全局前置守卫
 * 在路由跳转前进行权限验证、登录检查等
 */
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', from.path, '->', to.path);

  // 已登录访问登录页时，直接进入首页。
  if (to.path === '/login' && isAuthenticated()) {
    next('/xy-factory');
    return;
  }

  // 设置页面标题
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} - 数据可视化大屏`;
  }

  // 显示加载状态
  if (store.state.loading !== undefined) {
    store.commit('setLoading', true);
  }

  console.log('路由元信息:', to.meta, '用户认证状态:', isAuthenticated(), '用户角色:', getUserRoles());
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!isAuthenticated()) {
      // Message.warning('请先登录');
      next({ path: '/login', query: { ...to.query } });
      return;
    }
    if (to.meta.roles && to.meta.roles.length > 0) {
      const userRoles = getUserRoles();
      if (!hasPermission(to.meta.roles, userRoles)) {
        Message.error('权限不足，无法访问该页面');
        next('/403'); // 跳转到权限不足页面
        return;
      }
    }
  }

  // 记录访问日志
  console.log(`用户访问页面: ${to.path}, 时间: ${new Date().toLocaleString()}`);

  // 继续路由跳转
  next();
});

/**
 * 全局后置守卫
 * 在路由跳转完成后执行，用于隐藏加载状态、记录访问统计等
 */
router.afterEach((to, from) => {
  // 隐藏加载状态
  if (store.state.loading !== undefined) {
    store.commit('setLoading', false);
  }

  // 记录页面访问统计
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.path
    });
  }

  // 滚动到页面顶部
  window.scrollTo(0, 0);

  console.log('路由跳转完成:', to.path);
});

/**
 * 路由错误处理
 * 捕获路由过程中的错误
 */
router.onError((error) => {
  console.error('路由错误:', error);
  Message.error('页面加载失败，请刷新重试');

  // 隐藏加载状态
  if (store.state.loading !== undefined) {
    store.commit('setLoading', false);
  }
});

/**
 * 路由实例方法扩展
 */

/**
 * 安全的路由跳转方法
 * @param {String|Object} location 跳转位置
 * @param {Function} onComplete 成功回调
 * @param {Function} onAbort 失败回调
 */
router.safePush = function (location, onComplete, onAbort) {
  return this.push(location, onComplete, onAbort).catch(err => {
    if (err.name !== 'NavigationDuplicated') {
      console.error('路由跳转失败:', err);
      Message.error('页面跳转失败');
    }
  });
};

/**
 * 检查当前路由是否匹配
 * @param {String} path 路径
 * @returns {Boolean} 是否匹配
 */
router.isCurrentRoute = function (path) {
  return this.currentRoute.path === path;
};

/**
 * 获取面包屑导航数据
 * @returns {Array} 面包屑数组
 */
router.getBreadcrumb = function () {
  const matched = this.currentRoute.matched;
  return matched.filter(item => item.meta && item.meta.title).map(item => ({
    title: item.meta.title,
    path: item.path
  }));
};

export default router;
