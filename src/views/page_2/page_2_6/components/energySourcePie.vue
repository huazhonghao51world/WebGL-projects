<template>
    <!-- 宽屏横向布局容器，高度由父级决定 -->
    <div class="energy-source-pie">
        <echarts-base ref="chart" :option="chartOption" width="100%" :ratio="ratio" />
        <!-- hover 信息条 -->
        <transition name="fade">
            <div v-if="hoverItem" class="hover-bar">
                <span class="bar-name">{{ hoverItem.name }}</span>
                <span class="bar-value">{{ hoverItem.percent }}<span class="bar-unit">%</span></span>
                <span class="bar-label">{{ hoverItem.label }}</span>
            </div>
        </transition>
    </div>
</template>

<script>
import EchartsBase from "@/components/echarts/index.vue";
import { energySourcePieOptionV2 } from "@/types/echarts/pie.js";

export default {
    name: "EnergySourcePie",
    components: { EchartsBase },
    props: {
        data: {
            type: Array,
            default: () => [
                { name: "新能源发电", value: 28 },
                { name: "电网购买", value: 37 },
                { name: "自发电", value: 35 },
            ],
        },
        // 宽屏比例，与实际效果图匹配
        ratio: {
            type: String,
            default: "16/7",
        },
        bgImage: {
            type: String,
            default: null,
        },
        centerIcon: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            colors: [
                "#FFD051", // 新能源发电 - 金黄
                "#2270F1", // 电网购买   - 蓝色
                "#9BF8FF", // 自发电     - 青绿
            ],
            // 每项对应底部信息条的标签文字（可按需定制）
            labelMap: {
                "新能源发电": "新能源",
                "电网购买": "外购电",
                "自发电": "自发电",
            },
            // 当前 hover 的扇区信息，null 时隐藏信息条
            hoverItem: null, // 初始值在 mounted 中赋值
        };
    },
    computed: {
        chartOption() {
            return energySourcePieOptionV2(
                this.data,
                this.colors,
                this.bgImage,
                this.centerIcon
            );
        },
    },
    mounted() {
        // 默认显示第一项
        if (this.data && this.data.length) {
            const total = this.data.reduce((s, d) => s + d.value, 0);
            const first = this.data[1];
            this.hoverItem = {
                name: first.name,
                percent: ((first.value / total) * 100).toFixed(0),
                label: this.labelMap[first.name] || first.name,
            };
        }
        this.$nextTick(() => {
            const chart = this.$refs.chart && this.$refs.chart.getChart();
            if (!chart) return;
            // 监听扇区 hover 进入
            chart.on("mouseover", "series", (params) => {
                const total = this.data.reduce((s, d) => s + d.value, 0);
                const item = this.data.find((d) => d.name === params.name);
                if (!item) return;
                this.hoverItem = {
                    name: params.name,
                    percent: ((item.value / total) * 100).toFixed(0),
                    label: this.labelMap[params.name] || params.name,
                };
            });
            // 监听扇区 hover 离开
            chart.on("mouseout", "series", () => {
                // this.hoverItem = null;
            });
        });
    },
    beforeDestroy() {
        const chart = this.$refs.chart && this.$refs.chart.getChart();
        if (chart) {
            chart.off("mouseover");
            chart.off("mouseout");
        }
    },
};
</script>

<style lang="scss" scoped>
.energy-source-pie {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

// hover 信息条：使用背景图，两端装饰由图片提供
.hover-bar {
    margin-top: 1.2rem;
    width: 72%;
    height: 1.51rem;
    display: flex;
    align-items: center;
    // 背景图拉伸铺满，两端装饰由图片自带
    background-image: url("~@/assets/images/img/info_bg.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    // 左右内边距留出图片两端装饰区域的空间
    padding: 0 1.2rem;
    gap: 0.5rem;
    white-space: nowrap;
    box-sizing: border-box;

    // 左侧：名称文字
    .bar-name {
        font-size: var(--font-size-14);
        color: rgba(255, 255, 255, 0.9);
        font-family: var(--font-family-primary-Regular);
        flex: 1;
    }

    // 右侧：百分比数字（大）
    .bar-value {
        font-size: var(--font-size-16);
        font-weight: bold;
        color: #ffffff;
        font-family: var(--font-family-primary-Bold);

        .bar-unit {
            font-size: var(--font-size-12);
            font-weight: normal;
            color: rgba(255, 255, 255, 0.7);
            margin-left: 0.1rem;
        }
    }

    // 右侧：副标签（小字）
    .bar-label {
        font-size: var(--font-size-12);
        color: rgba(255, 255, 255, 0.7);
        font-family: var(--font-family-primary-Regular);
    }
}

// 淡入淡出过渡
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
