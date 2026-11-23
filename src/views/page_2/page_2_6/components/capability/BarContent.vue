<template>
    <div class="bar-content">
        <div v-if="title" class="bar-title">{{ title }}</div>
        <div class="bar-values">
            <span v-for="(d, idx) in data" :key="d.name + idx" class="bar-value-item">{{ d.value }}</span>
        </div>
        <div class="bar-chart">
            <EchartsBase :option="option" width="100%" height="100%" />
        </div>
    </div>
</template>

<script>
import { safetyRectifyOption } from "@/types/echarts/bar.js";
import EchartsBase from "@/components/echarts/index.vue";

export default {
    name: "BarContent",
    components: { EchartsBase },
    props: {
        title: { type: String, default: "" },
        data: { type: Array, default: () => [] },
    },
    computed: {
        niceMax() {
            const vals = this.data.map((d) => Number(d.value) || 0);
            const realMax = Math.max(1, ...vals);
            // Y轴最大值 = 数据最大值 + 20
            return realMax + 20;
        },
        option() {
            return safetyRectifyOption(this.data, this.niceMax, this.niceMax / 4, "#9bf8ff", {
                hideYAxis: true,
                gridTop: "6%",
                gridBottom: "2%",
                gridLeft: "0%",
                gridRight: "3%",
                xAxisLineColor: "rgba(112, 133, 161, 0.5)",
                xAxisLabelColor: "rgba(188, 197, 201, 0.7)",
                yAxisLineShow: true,
                yAxisLineType: "dashed",
                yAxisLineColor: "rgba(168, 199, 235, 0.25)",
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.bar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding-left: 0.5rem;
}

.bar-title {
    flex-shrink: 0;
    font-size: var(--font-size-12);
    color: var(--color-primary);
    font-family: var(--font-family-primary-Medium); 
}

/* 右内边距 = .bar-chart 的 padding-right + echarts grid 的 right(3%)，使内容区与坐标系内区对齐 */
.bar-values {
    flex-shrink: 0;
    display: flex;
    padding: 0.8rem calc(0rem + 3%) 0 0.5rem;
    box-sizing: border-box;
}

/* 每项等分一个类目宽度并居中，柱子数量变化时自动对齐 */
.bar-value-item {
    flex: 1 1 0;
    min-width: 0;
    text-align: center;
    font-size: px2rem(12);
    color: #9bf8ff;
    font-family: var(--font-family-primary-Medium);
    white-space: nowrap;
}

.bar-chart {
    width: 100%;
    height: 100%;
    flex: 1;
    padding: 0 0.4rem 0 0;
}
</style>
