<template>
    <div class="quality-pie">
        <echarts-base ref="chart" :option="chartOption" width="100%" :ratio="ratio" />
    </div>
</template>

<script>
import EchartsBase from "@/components/echarts/index.vue";
import { qualityRatePieOption } from "@/types/echarts/pie.js";

export default {
    name: "QualityPie",
    components: { EchartsBase },
    props: {
        data: {
            type: Array,
            default: () => [
                { name: "良品", value: 99.1 },
                { name: "不良", value: 0.9 },
            ],
        },
        ratio: {
            type: String,
            default: "1/1",
        },
        bgImage: {
            type: String,
            default: null,
        },
        centerText: {
            type: String,
            default: "良品率",
        },
    },
    data() {
        return {
            colors: [
                "#5592ED", // 良品 - 蓝色
                "#E5A93B", // 不良 - 金黄
            ],
        };
    },
    computed: {
        chartOption() {
            return qualityRatePieOption(
                this.data,
                this.colors,
                this.bgImage,
                this.centerText
            );
        },
    },
    mounted() {
        this.$nextTick(() => {
            const chart = this.$refs.chart && this.$refs.chart.getChart();
            if (!chart) return;
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
.quality-pie {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
