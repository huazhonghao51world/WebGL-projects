<!-- src/layout/header.vue -->
<template>
  <div class="header">
    <div class="left">
      <FpsCounter />
      <div class="icon-btn" @click="handleRefresh">
        <img src="@images/header/刷新.png" alt="刷新" />
        <span>刷新</span>
      </div>
      <div v-if="!isXY" class="icon-btn" @click="handleMonitor">
        <img src="@images/header/监控.png" alt="监控" />
        <span>监控</span>
      </div>
      <div class="icon-btn toggle-btn" @click="handleTogglePanel">
        <img class="showAndHide" :src="isPanelHidden
            ? require('@images/header/展开.png')
            : require('@images/header/收起.png')
          " alt="" />
        <span>{{ isPanelHidden ? '展开' : '收起' }}</span>
      </div>
      <div v-if="!isXY" class="icon-btn" @click="handleAlarm">
        <img src="@images/header/告警.png" alt="告警" />
        <span>告警</span>
      </div>

      <div v-if="!isXY" class="icon-btn" @click="handleSignal">
        <img src="@images/header/信号.png" alt="信号" />
        <span>通畅</span>
      </div>
    </div>

    <nav class="case-switch" aria-label="工厂案例">
      <router-link :to="lighthouseLink" :class="{ active: !isXY }" :aria-current="!isXY ? 'page' : null" exact>灯塔工厂</router-link>
      <router-link to="/xy-factory" :class="{ active: isXY }" :aria-current="isXY ? 'page' : null" exact>XY工厂</router-link>
    </nav>

    <div class="center-title">
      <span v-if="subTitle" class="sub-title">{{ subTitle }}</span>
    </div>

    <div class="right">
      <customDate />
      <div class="line"></div>
      <customWeather />
      <div class="line"></div>
      <selections />
      <!-- <button @click="handleCameraInfo">相机信息</button> -->
    </div>
  </div>
</template>
<script>
import NavItem from "@components/header/navItem-header.vue";
import FpsCounter from "@/components/fpsCounter.vue";

import customWeather from "@components/header/setting/weather.vue";
import customDate from "@components/header/setting/date.vue";
import selections from "@components/header/setting/selections.vue";

import { mapState, mapMutations } from "vuex";
import { peekViewer } from "@/utils/twin/app";
import { getCameraPose } from "@/utils/twin/camera";

export default {
  name: "Header",
  components: {
    FpsCounter,
    NavItem,
    customWeather,
    customDate,
    selections,
  },
  data() {
    return {
      logoText: "练秋湖智慧管理平台",
      subTitle: "",

      navList: [
        {
          name: "综合安防",
          id: 1,
          isActive: true,
          path: "/page_1",
          // bgImg: require('@images/nav/icon_1.png')
        },
        {
          name: "便捷通行",
          id: 2,
          isActive: false,
          path: "/page_2",
          // bgImg: require('@images/nav/icon_2.png')
        },
        {
          name: "能效管理",
          id: 3,
          isActive: false,
          path: "/page_3",
          // bgImg: require('@images/nav/icon_3.png')
        },
        {
          name: "设施管理",
          id: 4,
          isActive: false,
          path: "/page_4",
          // bgImg: require('@images/nav/icon_4.png')
        },

        {
          name: "综合态势",
          id: 5,
          isActive: true,
          path: "/page_5",
          // bgImg: require('@images/nav/icon_1.png')
        },
        {
          name: "环境空间",
          id: 6,
          isActive: false,
          path: "/page_6",
          // bgImg: require('@images/nav/icon_2.png')
        },
        {
          name: "资产管理",
          id: 7,
          isActive: false,
          path: "/page_7",
          // bgImg: require('@images/nav/icon_3.png')
        },
        {
          name: "办公会议",
          id: 8,
          isActive: false,
          path: "/page_8",
          // bgImg: require('@images/nav/icon_4.png')
        },
        {
          name: "网络体验",
          id: 9,
          isActive: false,
          path: "/page_9",
          // bgImg: require('@images/nav/icon_4.png')
        },
      ],

      currentNav: {
        id: null,
      },

      // 隐藏前记录每个 Window 对象的原始可见状态
      windowVisibilityCache: [],
    };
  },

  mounted() {
    //通过当前路由地址匹配当前导航选中状态
    const matchedRoutes = this.$route.matched;
    if (matchedRoutes.length > 1) {
      const firstLevelRouteName = matchedRoutes[1].path;
      this.navList.forEach((e) => {
        e.path === firstLevelRouteName
          ? (e.isActive = true)
          : (e.isActive = false);
      });
    }
    this.updateSubTitle();
  },

  watch: {
    $route() {
      this.updateSubTitle();
    },
    isXY() { this.windowVisibilityCache = []; },
  },
  computed: {
    ...mapState(["isSceneAlready", "isPanelHidden"]),
    isXY() { return this.$route.meta.caseKey === "xy"; },
    lighthouseLink() { return { path: "/page_2/2", query: this.lighthouseQuery }; },
  },
  created() {
    this.lighthouseQuery = this.isXY ? {} : { ...this.$route.query };
  },

  methods: {
    ...mapMutations(["togglePanelHidden"]),
    handleCameraInfo() {
      console.log("Camera Info:", getCameraPose());
    },
    updateSubTitle() {
      const path = this.$route.path;

      if (this.isXY) {
        this.subTitle = "新耀工厂 · 园区数字孪生";
      } else if (path.startsWith("/page_1")) {
        this.subTitle = "51集团";
      } else if (path.startsWith("/page_2/4")) {
        this.subTitle = "51集团";
      } else if (path.startsWith("/page_2")) {
        if (path.includes("-device") || path.includes("-workshop")) {
          this.subTitle = "51集团-上海工厂-机加工车间";
        } else {
          this.subTitle = "51集团-上海工厂";
        }
      } else {
        this.subTitle = "";
      }
    },

    jumpNav(route) {
      if (!this.currentNav.id || this.currentNav.id !== route.id) {
        this.navList = this.navList.map((item) => ({
          ...item,
          isActive: item.id === route.id,
        }));

        this.$router.push(route.path);

        this.currentNav = route;
        // [twin 待实现] 原 wdpapi 调用：切到集团首页（id=1）时 addPOI（原代码未传参，实际不生效）
      }
    },

    // 隐藏面板时同时隐藏三维弹窗（Window 覆盖物）；恢复时只显示隐藏前可见的那些
    async handleTogglePanel() {
      this.togglePanelHidden();
      const hidden = this.isPanelHidden;
      const viewer = peekViewer();
      if (!viewer || viewer.getState() !== "ready") return;
      try {
        const windows = viewer.scene.getByTypes(["Window"]);
        if (hidden) {
          // 只缓存 eid（不得缓存实体对象到 data，否则 Vue 会深度改造 three.js 场景图）
          this.windowVisibilityCache = windows.filter((win) => win.toJSON().bVisible !== false).map((win) => win.eid);
          if (windows.length) await viewer.scene.setVisible(windows, false);
        } else {
          const visible = viewer.scene.getByEids(this.windowVisibilityCache);
          if (visible.length) await viewer.scene.setVisible(visible, true);
          this.windowVisibilityCache = [];
        }
      } catch (e) {
        console.warn("场景弹窗显隐失败:", e);
      }
    },

    handleMonitor() {
      console.log("监控按钮点击");
    },

    handleAlarm() {
      console.log("告警按钮点击");
    },

    handleRefresh() {
      console.log("刷新按钮点击");
      location.reload();
    },

    handleSignal() {
      console.log("信号按钮点击");
    },
  },
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 1% 0.8% 2% 1.7%;

  background-image: url(~@images/layout/top.png);
  background-size: 100% 100%;

  .case-switch {
    position: fixed;
    top: clamp(8px, 1.6vw, 30px);
    left: 21%;
    display: flex;
    gap: 6px;
    white-space: nowrap;

    a {
      padding: 5px 10px;
      border: 1px solid #335370;
      border-radius: 4px;
      background: #102238;
      color: #e0ecf7;
      font-size: clamp(11px, .75vw, 15px);
      text-decoration: none;
    }

    a:hover, a.active { border-color: #69d6fa; color: #a4eaff; }
    a:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
  }

  @media (max-width: 760px) {
    .case-switch { left: 4px; top: 6px; }
    .case-switch a { padding: 3px 6px; }
  }

  .logo {
    width: 18%;
    font-family: var(--font-family-primary-Medium);
    background: linear-gradient(180deg, #ffffff 37%, #2d9ade 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
  }

  .center-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 52%;

    .sub-title {
      opacity: 0.7;
      font-size: var(--font-size-16);
      color: #fff;
      font-family: var(--font-family-primary-Regular);
    }
  }

  .right {
    width: 14.5%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toggle-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      img {
        width: 1.5rem;
        height: 1.5rem;
      }
    }

    .line {
      width: 0.1rem;
      height: 1rem;
      background-color: var(--box-content-line);
    }
  }

  .left {
    width: 17%;
    // background-color: rgb(156, 156, 156); 
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.3rem;

    .icon-btn {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;


      img {
        width: 1rem;
        height: 1rem;
        object-fit: contain;
      }

      span {
        margin-top: 0.1rem;
        font-size: var(--font-size-12);
        font-family: var(--font-family-primary-Regular);
        color: var(--color-secondary);
      }

      &:hover {
        transform: scale(1.1);
        filter: brightness(1.2);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .toggle-btn {
      img {
        width: 1.3rem;
        height: 1.3rem;
        margin-top: -0.23rem;
      }
    }

    .line {
      width: 0.2rem;
      height: 4rem;
      background-color: var(--box-content-line);
    }
  }
}
</style>
