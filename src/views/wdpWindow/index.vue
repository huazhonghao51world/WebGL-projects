<style lang="scss" scoped>
.wdp-window {
  width: 100%;
  height: auto;
  min-height: max-content;
  box-sizing: border-box;

  /* 九宫格背景图设置 */
  border-style: solid;
  border-width: 0;
  border-image-slice: 29% 10% 10% 10% fill;
  /* 上 右 下 左 */
  border-image-width: 38px 10px 10px 18px;
  /* 固定边框像素 */
  border-image-repeat: stretch;

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4% 6% 6% 6%;

  /* 纯 CSS 面板背景（替代九宫格图片）：深蓝底 + 渐变描边 */
  &.panel-dark {
    background: rgba(12, 21, 43, 0.7);
    box-sizing: border-box;
    border: 1px solid;
    border-image: linear-gradient(180deg, #a7d1ff99 0%, #a7d1ff00 100%) 1;
    border-image-slice: 1;
    border-image-width: 1px;
  }

  .wdp-window-header {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 2.5%;

    .header {
      display: flex;
      align-items: center;

      .header-title {
        font-family: var(--font-family-primary-Bold);
        font-size: 2.6rem;
        color: #fff;
      }

      .header-status {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 92, 87, 0.4);
        margin-left: 0.9rem;

        .font-color-gradient-red {
          padding: 0 1rem;
          font-size: var(--font-size-32);
        }
      }
    }

    .header-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 1rem;

      .status-dot {
        width: 3.4rem;
        height: 3.4rem;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;

        &.status-primary {
          background-color: rgba(15, 218, 203, 0.2);

          .inner-dot {
            background-color: #0FDACB;
            box-shadow: 0 0 4px #0FDACB;
          }
        }

        &.status-warning {
          background-color: rgba(255, 208, 81, 0.2);

          .inner-dot {
            background-color: #FFD051;
            box-shadow: 0 0 4px #FFD051;
          }
        }

        &.status-danger {
          background-color: rgba(255, 109, 109, 0.2);

          .inner-dot {
            background-color: #FF6D6D;
            box-shadow: 0 0 4px #FF6D6D;
          }
        }

        &.status-danger2 {
          background-image: url("~@images/window/danger_icon.png");
          background-size: cover;
          background-position: center;
        }

        .inner-dot {
          width: 1.3rem;
          height: 1.3rem;
          border-radius: 50%;
        }
      }

      .status-text {
        font-size: 3.5rem;
        white-space: nowrap;
        font-family: var(--font-family-primary-Medium);

        &.status-primary {
          color: #0FDACB;
        }

        &.status-warning {
          color: #FFD051;
        }

        &.status-danger {
          color: #FF6D6D;
        }

        &.status-danger2 {
          color: #FFFFFF;
        }
      }
    }

    .header-Tag {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(94, 107, 126, 0.6);
      border-radius: 4px;
      box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.1);
      padding: 0.5rem 1.9rem;
      /* 调整到最右侧时的一些间距或对齐 */
      margin-left: auto;
      // margin-right: 0.1rem; /* 预留给关闭按钮的空间，如果关闭按钮不显示也好看 */
      font-size: 3.51rem;
      color: #9BF8FF;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 30%;
        background-color: rgba(255, 255, 255, 0.8);
      }

      &::before {
        left: 0;
      }

      &::after {
        right: 0;
      }

      .font-color-gradient-blue {
        padding: 0.4rem 1rem;
        font-size: 3.5rem;
        color: #84f2f6;
        font-family: var(--font-family-primary-Medium);
        letter-spacing: 1px;
      }
    }

    .header-Tag2 {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(94, 107, 126, 0.6);
      border-radius: 4px;
      box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.1);
      padding: 0.5rem 1.9rem;
      /* 调整到最右侧时的一些间距或对齐 */
      margin-left: auto;
      // margin-right: 0.1rem; /* 预留给关闭按钮的空间，如果关闭按钮不显示也好看 */
      font-size: 3.51rem;
      color: #9BF8FF;
    }

    .header-close {
      font-size: var(--font-size-40);
      color: #fff;
      cursor: pointer;
    }

    .line {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 6%;
      background-color: rgb(62, 74, 82);
      display: flex;
      justify-content: center;
      align-items: center;

      .line-inner {
        height: 160%;
        width: 0.8%;

        background-color: rgba(192, 220, 231, 1);
      }
    }
  }

  .wdp-window-container {
    margin-top: 2.7%;
    width: 100%;
    /* Removed min-height: 100% and flex: 1 to allow natural height expansion */
    height: auto;
    justify-content: center;
    align-items: center;
  }
}
</style>

<template>
  <div class="wdp-window" :class="{ 'panel-dark': cusConfig.panelStyle === 'dark' }" :style="rootStyle">
    <div class="wdp-window-header">
      <div class="header">
        <div class="header-title">{{ cusConfig.title }}</div>

        <!-- <div v-if="cusConfig.headerStatus" class="header-status">
          <div class="font-color-gradient-red">
            {{ cusConfig.headerStatus }}
          </div>
        </div> -->
      </div>

      <div v-if="cusConfig.headerTag" class="header-Tag">
        <!-- <div class="font-color-gradient-blue"> -->
        {{ cusConfig.headerTag }}
        <!-- </div> -->
      </div>

      <div v-if="cusConfig.headerTag2" class="header-Tag2">
        <!-- <div class="font-color-gradient-blue"> -->
        {{ cusConfig.headerTag2 }}
        <!-- </div> -->
      </div>

      <div v-if="cusConfig.headerRight" class="header-right">
        <div class="status-dot" :class="headerRightClass">
          <div class="inner-dot"></div>
        </div>
        <span class="status-text" :class="headerRightClass">{{ cusConfig.headerRight }}</span>
      </div>


      <!-- 
      <div @click="closeWindow" v-if="isShowCloseBtn" class="header-close">
        <i class="el-icon-close"></i>
      </div> -->


    </div>
    <div class="wdp-window-container">
      <!-- 根据类型渲染不同的视频播放组件 -->
      <component style="width: 100%; height: auto" :is="currentComponent" :config="cusConfig" />
    </div>
  </div>
</template>

<script>
import windowType1 from "./components/windowType1.vue";
import windowType2 from "./components/windowType2.vue";
import windowType3 from "./components/windowType3.vue";
import windowType4 from "./components/windowType4.vue";
import windowType5 from "./components/windowType5.vue";
import windowType6 from "./components/windowType6.vue";
import windowType7 from "./components/windowType7.vue";

export default {
  name: "WdpWindow",
  components: {
    windowType1,
    windowType2,
    windowType3,
    windowType4,
    windowType5,
    windowType6,
    windowType7
  },
  data() {
    return {
      windowType: "type1", // 默认类型
      cusConfig: {
        title: "",
        width: "100%",
        height: "100%",
      }, // 将在initializeWindow中动态填充
      bgType: "bg1", // 背景类型，默认 bg1
      isShowCloseBtn: true, // 是否显示关闭按钮，默认显示
      originalStyles: null, // 保存原始根元素样式
    };
  },
  computed: {
    headerRightClass() {
      switch (this.cusConfig.headerRight) {
        case '运行': case '合格': case '入库': case '已完成': case '充足':
          return 'status-primary';
        case '待机': case '返工': case '告警': case '加工中': case '出库': case '中风险':
          return 'status-warning';
        case '故障': case '不合格': case '耗尽': case '缺货': case '异常': case '高风险':
          return 'status-danger';
        case '违章': case '电气隐患':
          return 'status-danger2';
        default:
          return 'status-primary';
      }
    },
    // 根据类型动态选择组件
    currentComponent() {
      const typeMap = {
        type1: "windowType1",
        type2: "windowType2",
        type3: "windowType3",
        type4: "windowType4",
        type5: "windowType5",
        type6: "windowType6",
        // 灯塔项目window
        type7: "windowType7",
      };
      return typeMap[this.windowType] || "windowType7";
    },
    // 传递给子组件的属性
    componentProps() {
      return {
        ...this.$route.query, // 将 URL 查询参数传递给子组件
      };
    },
    // 根据 bgType 动态映射背景图
    backgroundImage() {
      const bgMap = {
        bg1: require('@/assets/images/window/bg1.png'),
        bg2: require('@/assets/images/window/bg2.png'),
        bg3: require('@/assets/images/window/bg3.png'),
        bg4: require('@/assets/images/window/bg4.png'),
        bg5_1: require('@/assets/images/window/bg5_1.png'),
        bg5_2: require('@/assets/images/window/bg5_2.png'),
        // 灯塔项目window图片
        bg_190_102: require('@/assets/images/window/bg_190_102.png'),
        bg_190_144: require('@/assets/images/window/bg_190_144.png'),
        bg_red_190_144: require('@/assets/images/window/bg_red_190_144.png'),
        // bg_190_222: require('@/assets/images/window/bg_190_222.png'),
        // bg_190_246: require('@/assets/images/window/bg_190_246.png'),
        // bg_red_190_144: require('@/assets/images/window/bg_red_190_144.png'),
      };
      const bgImage = bgMap[this.bgType] || bgMap['bg_190_102'];
      console.error(bgImage);
      return `url(${bgImage})`;
    },
    // 根元素样式：panel-dark 用纯 CSS 面板背景，其余用九宫格图片
    rootStyle() {
      if (this.cusConfig.panelStyle === 'dark') return {};
      return { borderImageSource: this.backgroundImage };
    },
  },
  mounted() {
    this.initializeWindow();
    this.setRootElementStyles();
  },
  beforeDestroy() {
    this.resetRootElementStyles();
  },
  methods: {
    closeWindow() {
      const jsondata = {
        name: "closeThePage",
        data: 10000,
        msg: "你好！",
        p_eid: this.cusConfig.p_eid || null,
      };

      w51_event("EventKey", jsondata);
    },

    /**
     * 设置根元素 html 的样式
     */
    setRootElementStyles() {
      const htmlElement = document.documentElement;

      // 保存原始样式
      this.originalStyles = {
        htmlWidth: htmlElement.style.width,
        htmlHeight: htmlElement.style.height,
        htmlOverflow: htmlElement.style.overflow,
        htmlBackgroundColor: htmlElement.style.backgroundColor,
        htmlFontSize: htmlElement.style.fontSize,
        bodyWidth: document.body.style.width,
        bodyHeight: document.body.style.height,
        bodyPadding: document.body.style.padding,
        bodyBackgroundColor: document.body.style.backgroundColor,
      };
      // 设置新样式
      htmlElement.style.width = this.cusConfig.width;
      // 在 3D 弹窗(通常是 iframe 挂载)场景下，不要限制死 height
      htmlElement.style.height = "max-content";
      htmlElement.style.fontSize = "1.8vw"; // 禁止滚动
      htmlElement.style.overflow = "hidden";
      htmlElement.style.backgroundColor = "transparent";

      // 设置body样式
      document.body.style.width = "100%";
      document.body.style.height = "max-content"; // 使用 max-content 保证能被子元素撑开
      document.body.style.padding = "0";
      document.body.style.margin = "0"; // 确保没有默认 margin 影响计算
      document.body.style.backgroundColor = "transparent";

      // 独立预览模式：整屏浏览器打开时锁定宽度与根字号，避免 1.8vw 被放大
      if (this.$route.query.preview) {
        const previewWidth = Number(this.$route.query.previewWidth) || 420;
        htmlElement.style.width = previewWidth + "px";
        // 复现真实弹窗比例：字号 = 宽度 * 1.8%（与 1.8vw 等效）
        htmlElement.style.fontSize = previewWidth * 0.018 + "px";
        htmlElement.style.margin = "40px auto";
        htmlElement.style.backgroundColor = "#0b1020";
        document.body.style.width = previewWidth + "px";
        document.body.style.margin = "40px auto";
        document.body.style.backgroundColor = "#0b1020";
      }
    },

    /**
     * 重置根元素 html 的样式
     */
    resetRootElementStyles() {
      if (this.originalStyles) {
        const htmlElement = document.documentElement;

        // 恢复原始样式
        htmlElement.style.width = this.originalStyles.width;
        htmlElement.style.height = this.originalStyles.height;
        htmlElement.style.overflow = this.originalStyles.overflow;
        htmlElement.style.backgroundColor = this.originalStyles.backgroundColor;
        htmlElement.style.fontSize = this.originalStyles.fontSize;

        document.body.style.width = this.originalStyles.bodyWidth;
        document.body.style.height = this.originalStyles.bodyHeight;
        document.body.style.padding = this.originalStyles.bodyPadding;
        document.body.style.backgroundColor =
          this.originalStyles.bodyBackgroundColor;

        console.log("已重置根元素样式");
      }
    },

    /**
     * 初始化窗口配置
     */
    initializeWindow() {
      // 从 URL 查询参数获取配置
      const query = this.$route.query;

      // 设置窗口类型
      if (
        query.type
      ) {
        this.windowType = query.type;
      }

      if (query.bgType) {
        this.bgType = query.bgType;
      }

      if (query.isShowCloseBtn !== undefined) {
        this.isShowCloseBtn = query.isShowCloseBtn === "true";
      }

      // if (query.headerTag) {
      //   this.cusConfig.headerTag = query.headerTag;
      // }

      // if (query.infoList) {
      //   this.cusConfig.infoList = query.infoList;
      // }

      // 动态遍历所有query参数到cusConfig中
      this.cusConfig = {
        ...query
      };


      console.log("初始化配置:", this.cusConfig);
      console.log("背景类型:", this.bgType);
    },
  },
};
</script>
