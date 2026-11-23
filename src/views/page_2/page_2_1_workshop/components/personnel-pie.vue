<template>
    <div class="personnel-pie">
        <echarts-base ref="chart" :option="chartOption" width="100%" :ratio="ratio" />
        <!-- hover 信息条 -->
        <transition name="fade">
            <div v-if="hoverItem" class="hover-bar">
                <span class="bar-name">{{ hoverItem.name }}</span>
                <span class="bar-meta">组长: <span class="leader-val">{{ hoverItem.leader }}</span></span>
                <span class="bar-meta">人数: <span class="count-val">{{ hoverItem.count }} </span><span
                        class="unit">人</span></span>
            </div>
        </transition>
    </div>
</template>

<script>
import EchartsBase from "@/components/echarts/index.vue";
import { energySourcePieOptionV2 } from "@/types/echarts/pie.js";

export default {
    name: "PersonnelPie",
    components: { EchartsBase },
    props: {
        // 分组数据，value 为百分比
        data: {
            type: Array,
            default: () => [
                { name: "一组", value: 10, leader: "张XX", count: 19 },
                { name: "二组", value: 30, leader: "梁XX", count: 56 },
                { name: "三组", value: 25, leader: "王XX", count: 47 },
                { name: "四组", value: 35, leader: "李XX", count: 64 },
            ],
        },
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
            // 各分组颜色：蓝色系为主，与 UI 图一致
            colors: [
                "#94C2FF", // 一组 - 金黄
                "#2270F1", // 二组 - 蓝色
                "#9BF8FF", // 三组 - 青绿
                "#FFD051", // 四组 - 深蓝
            ],
            hoverItem: null,
        };
    },
    computed: {
        // energySourcePieOptionV2 接收 { name, value } 格式
        chartData() {
            return this.data.map((d) => ({ name: d.name, value: d.value }));
        },
        chartOption() {
            return energySourcePieOptionV2(
                this.chartData,
                this.colors,
                this.bgImage,
                this.centerIcon
            );
        },
    },
    mounted() {
        // 默认显示第一项
        if (this.data && this.data.length) {
            const first = this.data[0];
            this.hoverItem = {
                name: first.name,
                leader: first.leader,
                count: first.count,
            };
        }
        this.$nextTick(() => {
            const chart = this.$refs.chart && this.$refs.chart.getChart();
            if (!chart) return;
            chart.on("mouseover", "series", (params) => {
                const item = this.data.find((d) => d.name === params.name);
                if (!item) return;
                this.hoverItem = {
                    name: item.name,
                    leader: item.leader,
                    count: item.count,
                };
            });
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
.personnel-pie {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    //   justify-content: center;
}

// hover 信息条，与 energySourcePie 保持一致的背景图方案
.hover-bar {
    width: 73%;
    height: 1.51rem;
    display: flex;
    align-items: center;
    background-image: url("~@/assets/images/img/info_bg.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    padding: 0 1.2rem;
    gap: 0.8rem;
    white-space: nowrap;
    box-sizing: border-box;

    // 左侧：组名
    .bar-name {
        font-size: var(--font-size-14);
        color: rgba(255, 255, 255, 0.9);
        font-family: var(--font-family-primary-Regular);
        flex: 0 0 auto;
        width: 30%;
        padding-left: 0.7rem;
    }

    // 中间/右侧：组长、人数
    .bar-meta {
        font-size: var(--font-size-12);
        color: rgba(155, 248, 255, 0.8);
        font-family: var(--font-family-primary-Regular);
        flex: 1;
        text-align: center;
        display: flex;
        align-items: center;

        .leader-val {
            font-size: var(--font-size-12);
            color: #ffffff;
            margin-left: 0.2rem;
        }

        .count-val {
            font-size: var(--font-size-16);
            color: #ffffff;
            font-family: var(--font-family-primary-Bold);
            margin-left: 0.2rem;
        }

        .unit {
            font-size: var(--font-size-12);
            color: #A8B7C1;
            margin-left: 0.1rem;
        }
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
