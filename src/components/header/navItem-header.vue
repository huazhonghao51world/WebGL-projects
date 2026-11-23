<style lang="scss" scoped>
.nav-item-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.bgImg {
  position: absolute;
  top: 38%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  aspect-ratio: 122/38;
  object-fit: contain;
}

.right {
  background-size: 100% 100%;
  padding: 7%;
  // width: 69.3%;
  height: 100%;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  span {
    color: var(--color-secondary);
    font-family: var(--font-family-primary-Medium);
    font-size: var(--font-size-16);
  }
  &:hover {
    h2 {
      color: rgba($color: #ffffff, $alpha: 1);
      font-family: var(--font-family-primary-Bold);
    }
    span {
      color: rgba($color: #ffffff, $alpha: 1);
      font-family: var(--font-family-primary-Bold);
      font-size: var(--font-size-16);
    }
  }
  &.active {
    h2 {
      color: rgba($color: #ffffff, $alpha: 1);
      font-family: var(--font-family-primary-Bold);
    }
    span {
      color: rgba($color: #ffffff, $alpha: 1);
      font-family: var(--font-family-primary-Bold);
      font-size: var(--font-size-16);
    }
  }
}
</style>

<template>
  <div class="nav-item-container" @click="navClickEvent(item)">
    <!-- <div :class="`left${item.isActive ? ' active' : ''}`">
            <img :src="item.icon" alt="">
        </div> -->

    <div :class="`right${item.isActive ? ' active' : ''}`">
      <span>{{ item.name }}</span>
    </div>

    <img
      v-if="item.isActive"
      class="bgImg"
      :src="getImgURL(item.id, item.isActive)"
      alt=""
    />
  </div>
</template>

<script>
export default {
  name: "FrontEndNavItem",
  props: {
    item: {
      type: Object,
      default: () => {
        return {
          name: "-",
          id: 1,
          isActive: false,
          path: "",
        };
      },
    },
  },
  data() {
    return {};
  },

  mounted() {},

  methods: {
    navClickEvent(e) {
      this.$emit("jumpNav", e);
    },

    getImgURL(id, isActive) {
      if (!isActive) {
        return "";
      }

      if (id >= 1 && id <= 4) {
        return require(`@images/layout/navItem-bg-active-left.png`);
      } else if (id >= 5 && id <= 8) {
        return require(`@images/layout/navItem-bg-active-right.png`);
      } else {
        return require(`@images/layout/navItem-bg-active-left.png`);
      }
    },
  },
};
</script>
