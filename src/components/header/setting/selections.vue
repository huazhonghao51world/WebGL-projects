<!-- src/components/Layout.vue -->
<template>
  <div class="selections">
    <el-popover
      v-model="isOpenSetting"
      placement="bottom"
      trigger="click"
      :visible-arrow="false"
      popper-class="setting-popover"
    >
      <!-- <setUpSwitch
        :timeOptions="timeOptions"
        :weatherOptions="weatherOptions"
      /> -->
      <setUpSwitch
        :timeOptions="timeOptions"
      />
      <div slot="reference" class="admin-trigger">
        <img src="@images/layout/header-admin.png" alt="" />
        <div>Admin</div>
      </div>
    </el-popover>
    <!-- <span>设置</span> -->

    <el-dialog
      title="搜索"
      :visible.sync="isOpenSearch"
      append-to-body
      :modal="false"
    >
      <searchInput />
    </el-dialog>
  </div>
</template>

<script>
import searchInput from "@components/searchInput.vue";
import setUpSwitch from "@components/setUpSwitch.vue";

export default {
  name: "selections",
  components: {
    searchInput,
    setUpSwitch,
  },
  data() {
    return {
      isOpenSearch: false,
      isOpenTools: false,
      isOpenSetting: false,

      timeOptions: [
        { id: 1, label: "8:30", icon: require("@images/toolIcon/8点.png") },
        { id: 2, label: "10:00", icon: require("@images/toolIcon/10点.png") },
        { id: 3, label: "18:00", icon: require("@images/toolIcon/18点.png") },
        { id: 4, label: "20:00", icon: require("@images/toolIcon/20点.png") },
      ],

      weatherOptions: [
        { id: 1, label: "晴朗", value: "sunny", icon: require("@images/toolIcon/sunny.png") },
        { id: 2, label: "多云", value: "cloudy", icon: require("@images/toolIcon/cloudy.png") },
        { id: 3, label: "下雨", value: "rainy", icon: require("@images/toolIcon/rainy.png") },
        { id: 4, label: "下雪", value: "snowy", icon: require("@images/toolIcon/snowy.png") },
      ],
    };
  },

  mounted() {},

  methods: {
    toggleSetting() {
      this.isOpenSetting = !this.isOpenSetting;
    },
  },
};
</script>

<style lang="scss" scoped>
.selections {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .admin-trigger {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;

    img {
      width: 1.8rem;
      height: 1.8rem;
    }

    div {
      font-size: var(--font-size-12);
      color: var(--color-secondary);
      font-family: var(--font-family-primary-Medium);
    }

    &:hover {
      div {
        color: rgba(238, 248, 253, 1);
      }
    }
  }
}
</style>

<style lang="scss">
.setting-popover {
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 1.5rem !important;
  width: 18rem !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  margin-top: 0.5rem !important;

  .el-popover__title {
    display: none !important;
  }
}
</style>
