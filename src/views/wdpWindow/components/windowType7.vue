<template>
  <div class="window-type7" :class="{ 'layout-inline': config.itemLayout === 'inline' }">
    <div class="info-row" v-for="(row, rowIndex) in parsedInfoRows" :key="rowIndex">
      <div 
        class="info-item" 
        v-for="(item, colIndex) in row" 
        :key="colIndex"
        :style="{ flex: `0 0 ${(item.flex || 0.5) * 100}%` }"
      >
        <div class="label">{{ item.title }}：</div>
        <template v-if="item.title === '监控画面'">
          <webRTSP :baseOptions="{ url: item.content, title: item.title, width: '100%', height: '100%' }" class="rtsp-player" />
        </template>
        <div v-else :class="['value-box', valueLevelClass(item)]">{{ item.content }}</div>
      </div>
    </div>

    <!-- 仅 top 损失条目弹窗（风险窗）显示上报按钮；工具栏弹窗不传此标志 -->
    <div v-if="showReportBtn" class="report-row">
      <div class="report-btn" :class="{ done: reported }" @click="onReport">
        <span class="report-icon">⚠</span>
        <span class="report-text">{{ reported ? '已上报' : '上报' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import webRTSP from "@/components/rtsp/index.vue";

export default {
  name: "windowType7",
  components: {
    webRTSP,
  },
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    /** 仅当外部（top 损失弹窗）传入 showReportBtn 时才显示上报按钮 */
    showReportBtn() {
      const v = this.config && this.config.showReportBtn;
      return v === true || v === "true";
    },
    parsedInfoRows() {
      try {
        let infoList = [];
        if (this.config.infoList) {
          infoList = typeof this.config.infoList === 'string' 
            ? JSON.parse(this.config.infoList) 
            : this.config.infoList;
        } else {
          // 兜底默认数据
          infoList = [
            { title: "姓名", content: "张某某" },
            { title: "工号", content: "00103850" },
            { title: "联系方式", content: "138 xxxx xxxx" },
          ];
        }

        // 根据 flex 值分行，累计达到 1 则换行
        const rows = [];
        let currentRow = [];
        let currentFlex = 0;
        for (const item of infoList) {
          const itemFlex = item.flex || 0.5;
          if (currentFlex + itemFlex > 1 && currentRow.length > 0) {
            rows.push(currentRow);
            currentRow = [];
            currentFlex = 0;
          }
          currentRow.push(item);
          currentFlex += itemFlex;
          if (currentFlex >= 1) {
            rows.push(currentRow);
            currentRow = [];
            currentFlex = 0;
          }
        }
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }
        return rows;
      } catch (error) {
        console.error("解析 type7 信息列表失败:", error);
        return [];
      }
    }
  },
  data() {
    return {
      reported: false,
    };
  },
  methods: {
    /** 上报：通知场景引擎（w51_event）并置为已上报态 */
    onReport() {
      if (this.reported) return;
      this.reported = true;
      const jsondata = {
        name: "reportLoss",
        title: this.config && this.config.title,
        headerTag: this.config && this.config.headerTag,
      };
      if (typeof window !== "undefined" && typeof window.w51_event === "function") {
        window.w51_event("EventKey", jsondata);
      }
    },
    // 按“等级”类文字着色：高风险→红，告警/中风险→黄
    valueLevelClass(item) {
      const text = String(item?.content || '').trim();
      if (['高风险', '故障', '异常'].includes(text)) return 'value-danger';
      if (['告警', '中风险'].includes(text)) return 'value-warn';
      return '';
    },
  },
};
</script>

<style lang="scss" scoped>
.window-type7 {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 1.75rem;
  gap: 1.5rem;
  box-sizing: border-box;

  .info-row {
    display: flex;
    justify-content: space-between;
    gap: 1.5rem;
    width: 98.5%;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    min-width: 0;
    width: 100%;

    .label {
      color: #DBF5FF;
      font-size: 2.2rem;
      font-family: var(--font-family-primary-Regular);
    }

    .value-box {
      width: 100%;
      background: linear-gradient(90deg, #467fffb3 0%, #467fff00 106%);
      color: #ffffff;
      padding: 1.15rem 1.8rem;
      font-size: 2.2rem;
      font-family: var(--font-family-primary-Regular);
      border-radius: 2px;
      min-height: 2.8rem;
      display: flex;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &.status-warning {
        background: linear-gradient(90deg, rgba(255, 203, 203, 0.5) 0%, rgba(255, 175, 175, 0) 106%);
      }
      /* 等级文字着色：高风险=红，告警=黄 */
      &.value-danger {
        color: #FF6D6D;
      }
      &.value-warn {
        color: #FFD051;
      }
    }
  }

  /* 行内布局：label 与 value 同一行显示 */
  &.layout-inline {
    gap: 2rem;

    .info-item {
      flex-direction: row;
      align-items: center;
      gap: 0.2rem;

      .label {
        flex: 0 0 35%;
        white-space: nowrap;
      }

      .value-box {
        flex: 1;
        width: auto;
        min-width: 0;
      }
    }
  }

  /* 上报按钮行（仅 top 损失弹窗显示） */
  .report-row {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;

    .report-btn {
      width: 60%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      padding: 1.2rem 0;
      font-size: 4rem;
      color: #ffffff;
      font-family: var(--font-family-primary-Medium);
      background: linear-gradient(90deg, rgba(94, 107, 126, 0.6) 0%, rgba(94, 107, 126, 0.25) 100%);
      border: 1px solid rgba(167, 209, 255, 0.6);
      border-radius: 3px;
      cursor: pointer;
      user-select: none;

      .report-icon {
        color: #ffd051;
        font-size: 3rem;
      }

      .report-text {
        font-size: 2.6rem;
      }

      &:hover {
        background: linear-gradient(90deg, rgba(94, 107, 126, 0.8) 0%, rgba(94, 107, 126, 0.4) 100%);
      }

      &.done {
        color: #0fdacb;
        border-color: rgba(15, 218, 203, 0.6);
        cursor: default;

        .report-icon {
          color: #0fdacb;
        }
      }
    }
  }
}
</style>
