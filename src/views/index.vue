<template>
  <Layout :class="{ 'xy-viewport': caseKey === 'xy' }" :header="caseKey !== 'xy'" :main="true" :scene="true" :rightTools="false">
    <template v-slot:header>
      <div class="content-header">
        <Header></Header>
      </div>
    </template>

    <router-view></router-view>

    <template v-slot:scene>
      <div class="content-scene">
        <Scene :case-key="caseKey"></Scene>
      </div>

    </template>

    <!-- 场景 AI 助手（twinSDK）：自然语言 → 大模型编排 → 调度三维场景 -->
    <AgentChat v-if="!vendorOffline && caseKey !== 'xy'" />

    <!--  右侧工具栏 -->
    <template v-slot:aside-right-tools>
      <div class="right-tools">
        <!-- 相机信息 -->
        <button class="tool-btn" @click="handleCameraInfo">相机信息</button>
        <textarea v-if="cameraInfo" class="info-output" readonly v-model="cameraInfo" @focus="$event.target.select()" />

        <!-- 设置时间 -->
        <div class="time-row">
          <input
            v-model="timeInput"
            class="time-input"
            placeholder="HH:mm"
            maxlength="5"
          />
          <button class="tool-btn" @click="handleSetTime">设置时间</button>
        </div>
        <span v-if="timeResult" class="time-result">{{ timeResult }}</span>
      </div>
    </template>
  </Layout>
</template>

<script>
import { mapState } from "vuex";
import Layout from "@/layout/index.vue";
import Header from "@/layout/header.vue";
import Footer from "@/layout/footer.vue";
import Scene from "@/layout/scene.vue";
import AgentChat from "@/components/agentChat.vue";

import { getCameraPose } from "@/utils/twin/camera";
import { setSceneTime } from "@/utils/twin/tool";

export default {
  name: "FrontEndIndex",
  components: {
    Layout,
    Header,
    Scene,
    Footer,
    AgentChat,
  },

  data() {
    return {
      vendorOffline: process.env.VUE_APP_VENDOR_OFFLINE === 'true',
      cameraInfo: null,
      timeInput: "",
      timeResult: "",
    };
  },

  computed: {
    ...mapState(["isShowScene"]),
    caseKey() { return this.$route.meta.caseKey || "lighthouse"; },
  },
  beforeRouteUpdate(to, from, next) {
    if (to.meta.caseKey !== from.meta.caseKey) this.$store.commit("isSceneAlready", false);
    next();
  },
  methods: {
    // 相机位姿（twinSDK：本地坐标 米 / Y 轴向上），可直接用于 flyToPose
    handleCameraInfo() {
      const pose = getCameraPose();
      this.cameraInfo = pose ? JSON.stringify(pose, null, 2) : "场景尚未就绪";
    },
    handleSetTime() {
      const val = this.timeInput.trim();
      if (!/^\d{1,2}:\d{2}$/.test(val)) {
        this.timeResult = "格式错误，请输入 HH:mm";
        return;
      }
      this.timeResult = setSceneTime(val, 1.5) ? `已设置时间: ${val}` : "设置失败：场景尚未就绪";
    },
  },
};
</script>

<style scoped>
.xy-viewport { position: fixed; width: 100vw; height: 100vh; overflow: hidden; }

.right-tools {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.tool-btn {
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.info-output {
  max-width: 260px;
  height: 120px;
  overflow: auto;
  background: rgba(0, 0, 0, 0.6);
  color: #9bf8ff;
  font-size: 11px;
  padding: 6px;
  border-radius: 4px;
  margin: 0;
  white-space: pre;
  word-break: break-all;
  resize: none;
  border: 1px solid rgba(155, 248, 255, 0.3);
  outline: none;
  font-family: monospace;
  line-height: 1.5;
  cursor: text;
}

.time-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.time-input {
  width: 60px;
  padding: 3px 6px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: 1px solid rgba(155, 248, 255, 0.4);
  border-radius: 3px;
  outline: none;
}

.time-result {
  font-size: 11px;
  color: #9bf8ff;
}
</style>
