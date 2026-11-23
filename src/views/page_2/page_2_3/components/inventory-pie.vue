<template>
    <div class="inventory-pie">
        <!-- 左侧：饼图（无引导线、无label） -->
        <div class="pie-wrap">
            <echarts-base :option="chartOption" width="100%" :ratio="ratio" />
        </div>

        <!-- 右侧：自定义图例 -->
        <div class="legend-wrap">
            <div v-for="(item, index) in legendItems" :key="index" class="legend-item">
                <!-- 状态圆点 -->
                <div class="status-dot" :class="item.dotClass">
                    <div class="inner-dot"></div>
                </div>

                <!-- 名称 -->
                <span class="legend-name">{{ item.name }}</span>



                <!-- 数值 -->
                <div class="legend-values">
                    <!-- 横线区域（小矩形 + 横线，flex:1 撑开） -->
                    <div class="legend-line-block">
                        <span class="color-rect" :style="{ backgroundColor: item.color }"></span>
                        <span class="divider-line"></span>
                    </div>

                    <div class="count">
                        <span class="count-num">{{ item.value }}</span>
                        <span class="count-unit">{{ unit }}</span>
                    </div>

                    <div class="pct">
                        <span class="pct-num">{{ item.percent }}</span>
                        <span class="pct-unit">%</span>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
import EchartsBase from "@/components/echarts/index.vue";
import { energySourcePieOptionV2 } from "@/types/echarts/pie.js";

// 状态名称 → dot class 映射（与 deviceMonitorCard 保持一致）
const STATUS_DOT_MAP = {
    充足: "status-primary",
    告警: "status-warning",
    耗尽: "status-danger",
};

export default {
    name: "InventoryPie",
    components: { EchartsBase },
    props: {
        /**
         * 饼图数据，格式：[{ name: '充足', value: 128 }, ...]
         * name 需与 STATUS_DOT_MAP 中的 key 对应，以正确显示状态圆点颜色
         */
        data: {
            type: Array,
            default: () => [
                { name: "充足", value: 128 },
                { name: "告警", value: 36 },
                { name: "耗尽", value: 11 },
            ],
        },
        /** 饼图颜色，与 data 顺序对应 */
        colors: {
            type: Array,
            default: () => ["#0FDACB", "#FFD051", "#FF6D6D"],
        },
        /** 中心背景图路径 */
        bgImage: {
            type: String,
            default: null,
        },
        /** 中心图标路径（可选） */
        centerIcon: {
            type: String,
            default: null,
        },
        /** 图表宽高比，默认 1:1 */
        ratio: {
            type: String,
            default: "1/1",
        },
        /** 数量单位，默认"件" */
        unit: {
            type: String,
            default: "件",
        },
    },
    computed: {
        total() {
            return this.data.reduce((s, d) => s + d.value, 0);
        },
        legendItems() {
            return this.data.map((item, index) => ({
                name: item.name,
                value: item.value,
                percent: this.total > 0 ? Math.round((item.value / this.total) * 100) : 0,
                dotClass: STATUS_DOT_MAP[item.name] || "status-primary",
                color: this.colors[index] || "#4FC3F7",
            }));
        },
        chartOption() {
            return energySourcePieOptionV2(
                this.data,
                this.colors,
                this.bgImage,
                this.centerIcon,
                {
                    showLabel: false,
                    bgRatio: 1,
                }
            );
        },
    },
};
</script>

<style lang="scss" scoped>
.inventory-pie {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* 左侧饼图区域 */
.pie-wrap {
    flex: 0 0 auto;
    width: 45%;
}

/* 右侧图例区域 */
.legend-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    justify-content: center;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

/* ── 状态圆点（与 deviceMonitorCard 保持一致） ── */
.status-dot {
    flex-shrink: 0;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .inner-dot {
        width: 33.4%;
        height: 33.4%;
        border-radius: 50%;
    }

    &.status-primary {
        background-color: rgba(15, 218, 203, 0.2);

        .inner-dot {
            background-color: #0fdacb;
            box-shadow: 0 0 4px #0fdacb;
        }
    }

    &.status-warning {
        background-color: rgba(255, 208, 81, 0.2);

        .inner-dot {
            background-color: #ffd051;
            box-shadow: 0 0 4px #ffd051;
        }
    }

    &.status-danger {
        background-color: rgba(255, 109, 109, 0.2);

        .inner-dot {
            background-color: #ff6d6d;
            box-shadow: 0 0 4px #ff6d6d;
        }
    }

    &.status-info {
        background-color: rgba(153, 153, 153, 0.2);

        .inner-dot {
            background-color: #999999;
            box-shadow: 0 0 4px #999999;
        }
    }
}

/* ── 图例文字 ── */
.legend-name {
    font-size: var(--font-size-14);
    color: #A8B7C1;
    font-family: var(--font-family-primary-Regular);
    flex-shrink: 0;
    white-space: nowrap;
}



/* 数值区 */
.legend-values {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    gap: 0.15rem;
    white-space: nowrap;
    position: relative;
    flex: 1;

    /* 小矩形 + 横线容器，占满剩余空间 */
    .legend-line-block {
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: absolute;
        bottom: -0.1rem;
        left: 0;
        gap: 1px; // 小矩形与横线间距 ~1px

        .color-rect {
            flex-shrink: 0;
            align-self: flex-start;
            width: 6px;
            height: 2px;
            border-radius: 1px;
        }

        .divider-line {
            width: 100%;
            height: 1px;
            background: rgba(255, 255, 255, 0.15);
        }
    }

    .count {
        display: flex;
        align-items: baseline;
        gap: 0.2rem;

        .count-num {
            color: #ffffff;
            font-size: var(--font-size-16);
            font-family: var(--font-family-primary-Bold);
            line-height: 1;
        }

        .count-unit {
            font-size: var(--font-size-12);
            color: #CAD0D8;
            font-family: var(--font-family-primary-Regular);
            margin-right: 0.3rem;
        }

    }

    .pct {
        width: 2.7rem;
        display: flex;
        justify-content: flex-end;
        align-items: baseline;
        gap: 0.2rem;

        .pct-num {
            color: #ffffff;
            font-size: var(--font-size-16);
            font-family: var(--font-family-primary-Bold);
            line-height: 1;
        }

        .pct-unit {
            font-size: var(--font-size-12);
            color: #CAD0D8;
            font-family: var(--font-family-primary-Regular);
        }
    }



}
</style>
