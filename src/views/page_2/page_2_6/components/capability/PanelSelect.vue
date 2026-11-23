<template>
    <div class="panel-select" :class="{ 'is-open': open, 'is-primary': primary }">
        <div class="ps-header" @click.stop="toggle">
            <span class="ps-value">{{ value }}</span>
            <i class="ps-arrow"></i>
        </div>
        <transition name="ps-fade">
            <ul v-if="open" class="ps-options">
                <li v-for="(opt, idx) in options" :key="opt" class="ps-option"
                    :class="{ active: opt === value, disabled: isDisabled(idx) }" @click="select(opt, idx)">
                    <span class="ps-option-text">{{ opt }}</span>
                    <!-- 
                    <i v-if="isDisabled(idx)" class="ps-option-ban"></i> -->
                </li>
            </ul>
        </transition>
    </div>
</template>

<script>
import Vue from "vue";

// 同页面内多个 PanelSelect 共用，用于打开一个下拉时关闭其余下拉
// （header 用 click.stop 阻止了冒泡到 document，无法靠 document 点击互相感知）
const panelSelectBus = new Vue();

export default {
    name: "PanelSelect",
    props: {
        value: { type: [String, Number], default: "" },
        options: { type: Array, default: () => [] },
        // primary: 顶部能力模块主切换下拉（更高更醒目）
        primary: { type: Boolean, default: false },
        // lockFirst: 演示态只开放第一项，其余项置灰不可选
        lockFirst: { type: Boolean, default: false },
    },
    data() {
        return { open: false };
    },
    mounted() {
        document.addEventListener("click", this.close);
        panelSelectBus.$on("open", this.closeIfOther);
    },
    beforeDestroy() {
        document.removeEventListener("click", this.close);
        panelSelectBus.$off("open", this.closeIfOther);
    },
    methods: {
        toggle() {
            if (!this.open) panelSelectBus.$emit("open", this);
            this.open = !this.open;
        },
        close() {
            this.open = false;
        },
        closeIfOther(instance) {
            if (instance !== this) this.open = false;
        },
        isDisabled(idx) {
            return this.lockFirst && idx > 0;
        },
        select(opt, idx) {
            if (this.isDisabled(idx)) return;
            this.open = false;
            if (opt !== this.value) this.$emit("input", opt);
        },
    },
};
</script>

<style lang="scss" scoped>
.panel-select {
    position: relative;
    width: 100%;

    &.is-primary .ps-header {
        height: 2rem;

        .ps-value {
            font-size: px2rem(12);
            color: var(--color-primary);
            font-family: var(--font-family-primary-Regular);
        }
    }

    &.is-open .ps-header,
    &:hover .ps-header {
        border-color: #5592ed;
    }

    &.is-open .ps-arrow {
        transform: rotate(180deg);
    }
}

.ps-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 1.8rem;
    padding: 0 0.8rem;
    background: rgba(40, 51, 70, 0.8);
    box-sizing: border-box;
    border: 1px solid rgba(207, 231, 255, 0.2);
    border-radius: px2rem(3);
    cursor: pointer;
    user-select: none;
    transition: border-color 0.2s;
}

.ps-value {
    font-size: px2rem(12);
    color: var(--color-primary);
    font-family: var(--font-family-primary-Regular);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ps-arrow {
    flex-shrink: 0;
    margin-left: 0.4rem;
    width: 0;
    height: 0;
    border-left: 0.35rem solid transparent;
    border-right: 0.35rem solid transparent;
    border-top: 0.4rem solid rgba(160, 190, 230, 0.85);
    transition: transform 0.2s;
}

.ps-options {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 30;
    margin: 0;
    padding: 0.2rem 0;
    list-style: none;
    background: rgba(18, 30, 54, 0.98);
    border: 1px solid rgba(120, 150, 200, 0.4);
    border-radius: px2rem(3);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
}

.ps-option {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    font-size: px2rem(12);
    color: #cbd9ef;
    font-family: var(--font-family-primary-Regular);
    white-space: nowrap;
    transition: all 0.15s;

    &:hover {
        background: rgba(85, 146, 237, 0.25);
        color: #fff;
    }

    /* 当前选中项：仅底色区分，重新展开时一眼可辨 */
    &.active {
        color: #9bf8ff;
        background: rgba(155, 248, 255, 0.16);

        .ps-option-text {
            color: #9bf8ff;
            font-family: var(--font-family-primary-Medium);
        }

        &:hover {
            background: rgba(155, 248, 255, 0.24);
        }
    }

    &.disabled {
        color: rgba(203, 217, 239, 0.35);
        cursor: not-allowed;

        &:hover {
            background: transparent;
            color: rgba(203, 217, 239, 0.35);
        }
    }
    &.disabled .ps-option-text {
        color: rgba(203, 217, 239, 0.35);
    }
}

.ps-option-text {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: px2rem(12);
    color: var(--color-primary);
    font-family: var(--font-family-primary-Regular);

}

/* 禁用标识：⊘ */
.ps-option-ban {
    flex-shrink: 0;
    position: relative;
    width: px2rem(10);
    height: px2rem(10);
    border: 1px solid rgba(203, 217, 239, 0.4);
    border-radius: 50%;

    &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: -1px;
        right: -1px;
        height: 1px;
        background: rgba(203, 217, 239, 0.4);
        transform: rotate(-45deg);
    }
}

.ps-fade-enter-active,
.ps-fade-leave-active {
    transition: opacity 0.15s, transform 0.15s;
}

.ps-fade-enter,
.ps-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
