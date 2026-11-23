<template>
  <div class="resource-item">
    <div class="side side-left">
      <div class="item-head head-left">
        <img class="head-icon" :src="leftIcon" :alt="leftLabel" />
        <span class="head-label">{{ leftLabel }}</span>
      </div>
      <div class="item-value" :class="{ danger: leftDanger }">
        <span class="num">{{ leftValue }}</span>
        <span class="unit">{{ leftUnit }}</span>
      </div>
    </div>

    <div class="center-node">
      <img class="center-icon" :src="centerIcon" :alt="centerLabel" />
      <div class="center-label">{{ centerLabel }}</div>
    </div>

    <div class="side side-right">
      <div class="item-head head-right">
        <span class="head-label">{{ rightLabel }}</span>
        <img class="head-icon" :src="rightIcon" :alt="rightLabel" />
      </div>
      <div class="item-value value-right" :class="{ danger: rightDanger }">
        <span class="num">{{ rightValue }}</span>
        <span class="unit">{{ rightUnit }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductionResourceItem',
  props: {
    centerLabel: {
      type: String,
      required: true
    },
    centerIcon: {
      type: String,
      required: true
    },
    leftLabel: {
      type: String,
      required: true
    },
    leftIcon: {
      type: String,
      required: true
    },
    leftValue: {
      type: [String, Number],
      required: true
    },
    leftUnit: {
      type: String,
      default: ''
    },
    rightLabel: {
      type: String,
      required: true
    },
    rightIcon: {
      type: String,
      required: true
    },
    rightValue: {
      type: [String, Number],
      required: true
    },
    rightUnit: {
      type: String,
      default: ''
    },
    leftDanger: {
      type: Boolean,
      default: false
    },
    rightDanger: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.resource-item {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 0.62fr 1fr;
  align-items: stretch;
  gap: 0.6rem;
}

.side {
  padding: 0rem 0.45rem 0rem;
  box-sizing: border-box;
  background: rgba(20, 45, 82, 0.45);
  height: 4.02rem;

  &.side-left {
    background-image: url('~@/assets/images/page_2_1/左边背景.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
  }

  &.side-right {
    background-image: url('~@/assets/images/page_2_1/右边背景.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
  }

  .item-head {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    height: 2.01rem;

    .head-icon {
      width: 1.1rem;
      height: 1.1rem;
      object-fit: contain;
    }

    .head-label {
      color: #DBF5FF;
      font-size: var(--font-size-14);
      font-family: var(--font-family-primary-Medium);
      white-space: nowrap;
    }
  }
  .head-left {
    justify-content: flex-start;
    span{
        margin-left: 0.7rem;
    }
  }
  .head-right {
    justify-content: flex-end;
    span{
        margin-right: 0.7rem;
    }
}

  .item-value {
    // margin-top: 0.8rem;
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    height: 2.01rem;
    padding-top: 0.4rem;
    margin-left: 0.5rem;

    .num {
      color: #9BF8FF;
      font-size: var(--font-size-20);
      line-height: 1;
      font-family: var(--font-family-primary-Bold);
    }

    .unit {
      color: #DBF5FF;
      font-size: var(--font-size-12);
      font-family: var(--font-family-primary-Regular);
    }

    &.danger {
      .num {
        color: #ff6b78;
      }
    }
  }

  .value-right {
    justify-content: flex-end;
    margin-left: 0;
    margin-right: 0.5rem;
  }
}

.center-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin: -1rem 0 0 0.4rem;

  .center-icon {
    width: 5rem;
    height: 5rem;
    object-fit: contain;
  }

  .center-label {
    margin-top: -1.2rem;
    color: #9fd4ff;
    font-size: var(--font-size-14);
    font-family: var(--font-family-primary-Medium);
  }
}
</style>