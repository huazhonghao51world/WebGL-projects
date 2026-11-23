<!-- src/components/Layout.vue -->
<template>
  <transition :name="`slide-${position}`">
    <div
      class="box"
      v-if="isShow"
      :style="{ 'margin-bottom': footerBoxStyle['margin-bottom'] || '13%' }"
    >
      <div class="header-container">
        <header class="box-header">
          <!-- 头部内容 -->
          <slot name="header"></slot>
        </header>

        <header class="box-header-en">
          <!-- 头部副标题内容 -->
          <slot name="header-en"></slot>
        </header>

        <header class="box-header-right">
          <!-- 头部右侧内容 -->
          <slot name="header-right"></slot>
        </header>
      </div>

      <main class="box-main">
        <!-- 主内容区域 -->
        <div class="box-tag" v-if="tag !== ''">
          <span class="tag">{{ tag }}</span>
        </div>

        <slot></slot>
      </main>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    tag: {
      type: String,
      default: "",
    },

    delayTime: {
      type: Number,
      default: 0,
    },
    position: {
      type: String,
      default: "",
    },
    footerBoxStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  name: "box",

  data() {
    return {
      isShow: false,
    };
  },

  mounted() {
    setTimeout(() => {
      this.isShow = true;
    }, this.delayTime);
  },
};
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
  margin-bottom: 14%; 

  .header-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    position: relative;

    .box-header {
      width: 100%;
      margin: 0;
      background-image: url(~@images/layout/box-header.png);
      background-size: 100% 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 1.5% 0;
      padding-left: 6%;
      margin-bottom: 1%;
    }

    // .box-header-en {
    // }

    .box-header-right {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 70%;
    }
  }
}

.box-main {
  border-style: solid; 
  background: rgba(12, 21, 43, 0.5);
  box-sizing: border-box;
  border: 1px solid rgba(167, 209, 255, 0.1991);
  border-radius: px2rem(2);

  padding: 2.2%;
  position: relative;
  height: 100%;
  box-sizing: border-box;

  .box-tag {
    position: absolute;
    top: -1px;
    right: -1px;
    background: var(--box-tag-background);
    border: var(--box-tag-border);
    padding: 2% 4.5%;
  }
}

.line {
  width: 100%;
  height: 1px;
  background-color: var(--box-content-line);
  opacity: 1;
  margin-top: 1.5%;
  margin-bottom: 1.5%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .icon {
    width: 3px;
    height: 3px;
    background-color: var(--box-content-icon-color);
  }
}

.box-main-content {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 100%;
}

//动画过渡
// 定义从左到右的动画
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter {
  transform: translateX(-100%);
}

.slide-left-enter-to {
  transform: translateX(0);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter {
  transform: translateX(100%);
}

.slide-right-enter-to {
  transform: translateX(0);
}
</style>
