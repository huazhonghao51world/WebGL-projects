<template>
  <div class="data-card" :class="{ 'is-small-font': isSmallFont }">
    <img :src="iconSrc" :alt="label" />
    <div class="data-card-content" :class="{ 'is-value-first': valueFirst }">
      <div class="data-card-label">
        {{ label }}
      </div>
      <div class="data-card-value">
        <span class="value-number" :style="valueStyle">
          <template v-if="splitSlash && String(value).includes('/')">
            <span>{{ String(value).split('/')[0] }}</span><span>/</span><span class="value-num-strong">{{ String(value).split('/').slice(1).join('/') }}</span>
          </template>
          <template v-else>{{ value }}</template>
        </span>
        <span class="value-unit">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DataCard",
  props: {
    icon: {
      type: String,
      required: "",
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    valueFontSize: {
      type: String,
      default: "16",
    },
    unit: {
      type: String,
      default: "",
    },
    iconPath: {
      type: String,
      default: "",
    },
    valueFirst: {
      type: Boolean,
      default: false,
    },
    isSmallFont: {
      type: Boolean,
      default: false,
    },
    splitSlash: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    iconSrc() {
      if (this.iconPath) {
        return this.iconPath;
      }
      return require(`@/assets/images/page_1_1/${this.icon}.png`);
    },
    valueStyle() {
      return {
        fontSize: `--font-size-${this.valueFontSize}`,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.data-card {
  display: flex;
  // flex: 1;
  align-items: center;
  gap: 0.5rem; 
  transition: all 0.3s ease;
}

.data-card-icon {
  flex-shrink: 0;
  width: 2.8rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(45, 154, 222, 0.2);
  border-radius: 50%;

  img {
    width: 60%;
    height: 60%;
    object-fit: contain;
  }
}

.data-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &.is-value-first {
    .data-card-label {
      order: 2;
    }

    .data-card-value {
      order: 1;
    }
  }
}

.data-card.is-small-font {
  gap: 0.2rem;
  .value-number {
    font-size: var(--font-size-16);
  }

  .data-card-label,
  .value-unit {
    font-size: var(--font-size-12); 
    white-space: nowrap;
  }
}

.data-card-label {
  font-size: var(--font-size-14);
  color: #dbf5ff;
  font-family: var(--font-family-primary-Regular);
}

.data-card-value {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;

  .value-number {
    font-size: var(--font-size-20);
    color: rgba(155, 248, 255, 1);
    font-family: var(--font-family-primary-Bold);
    text-shadow: 0 0 10px rgba(45, 154, 222, 0.6);

    > span:not(.value-num-strong) {
      color: rgba(155, 248, 255, 1);
    }

    > span.value-num-strong {
      color: #ffffff;
    }
  }

  .value-unit {
    font-size: var(--font-size-14);
    color: #dbf5ff;
    font-family: var(--font-family-primary-Regular);
    letter-spacing: 0px;
  }
}
</style>
