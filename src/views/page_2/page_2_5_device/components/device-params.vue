<template>
  <div class="device-params">
    <div class="params-row">
      <div class="param-item">
        <label class="param-label">目标转速(rpm)</label>
        <el-input-number
          v-model="params.targetSpeed"
          :controls="true"
          :min="0"
          :max="10000"
          class="param-input"
        />
      </div>
      
      <div class="param-item">
        <label class="param-label">进给量(mm/rev)</label>
        <el-input-number
          v-model="params.feedRate"
          :controls="true"
          :min="0"
          :max="10"
          :precision="2"
          :step="0.01"
          class="param-input"
        />
      </div>
    </div>

    <div class="params-row">
      <div class="param-item full-width">
        <label class="param-label">冷却液模式</label>
        <el-select
          v-model="params.coolingMode"
          placeholder="请选择冷却液模式"
          class="param-select"
        >
          <el-option label="增强冷却" value="enhanced" />
          <el-option label="标准冷却" value="standard" />
          <el-option label="节能冷却" value="eco" />
          <el-option label="关闭冷却" value="off" />
        </el-select>
      </div>
    </div>

    <div class="params-actions">
      <el-button type="primary" class="action-btn" @click="handleDownload">
        下发参数
      </el-button>
      <el-button class="action-btn" @click="handleReset">
        切换质量预设
      </el-button>
      <el-button class="action-btn emergency" @click="handleEmergency">
        急停
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceParams',
  data() {
    return {
      params: {
        targetSpeed: 1200,
        feedRate: 0.15,
        coolingMode: 'enhanced'
      }
    };
  },
  methods: {
    handleDownload() {
      this.$emit('download', this.params);
      this.$message.success('参数下发成功');
    },
    handleReset() {
      this.$emit('reset');
      this.$message.info('切换质量预设');
    },
    handleEmergency() {
      this.$emit('emergency');
      this.$message.warning('急停已触发');
    }
  }
};
</script>

<style lang="scss" scoped>
.device-params {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.params-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.param-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.full-width {
    flex: 1;
  }
}

.param-label {
  font-size: var(--font-size-12);
  color: rgba(238, 248, 253, 0.8);
  font-family: var(--font-family-primary-Regular);
}

.param-input {
  width: 100%;
  
  ::v-deep .el-input-number {
    width: 100%;
  }

  ::v-deep .el-input__inner {
    background: rgba(0, 16, 30, 0.6);
    border: 1px solid rgba(45, 154, 222, 0.4);
    color: rgba(238, 248, 253, 1);
    font-size: var(--font-size-14);
    height: 36px;
    line-height: 36px;

    &:hover {
      border-color: rgba(45, 154, 222, 0.6);
    }

    &:focus {
      border-color: rgba(45, 154, 222, 0.8);
    }
  }

  ::v-deep .el-input-number__increase,
  ::v-deep .el-input-number__decrease {
    background: rgba(45, 154, 222, 0.2);
    border-left: 1px solid rgba(45, 154, 222, 0.4);
    color: rgba(238, 248, 253, 0.8);

    &:hover {
      background: rgba(45, 154, 222, 0.4);
      color: rgba(238, 248, 253, 1);
    }
  }
}

.param-select {
  width: 100%;

  ::v-deep .el-input__inner {
    background: rgba(0, 16, 30, 0.6);
    border: 1px solid rgba(45, 154, 222, 0.4);
    color: rgba(238, 248, 253, 1);
    font-size: var(--font-size-14);
    height: 36px;
    line-height: 36px;

    &:hover {
      border-color: rgba(45, 154, 222, 0.6);
    }
  }

  ::v-deep .el-input__suffix {
    color: rgba(238, 248, 253, 0.6);
  }
}

.params-actions {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.action-btn {
  flex: 1;
  height: 36px;
  font-size: var(--font-size-14);
  font-family: var(--font-family-primary-Regular);
  background: rgba(45, 154, 222, 0.3);
  border: 1px solid rgba(45, 154, 222, 0.5);
  color: rgba(238, 248, 253, 0.9);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(45, 154, 222, 0.5);
    border-color: rgba(45, 154, 222, 0.8);
    color: rgba(238, 248, 253, 1);
  }

  &.emergency {
    background: rgba(255, 77, 79, 0.3);
    border-color: rgba(255, 77, 79, 0.5);

    &:hover {
      background: rgba(255, 77, 79, 0.5);
      border-color: rgba(255, 77, 79, 0.8);
    }
  }
}

::v-deep .el-button--primary {
  background: rgba(45, 154, 222, 0.5);
  border-color: rgba(45, 154, 222, 0.8);

  &:hover {
    background: rgba(45, 154, 222, 0.7);
    border-color: rgba(45, 154, 222, 1);
  }
}
</style>
