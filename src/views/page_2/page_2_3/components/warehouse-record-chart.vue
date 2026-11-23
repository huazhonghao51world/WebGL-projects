<template>
    <div class="chart-container">
        <echarts-base :option="chartOption" width="100%" ratio="456/235" />
    </div>
</template>

<script>
import echartsBase from "@/components/echarts/index.vue";
import { baseLineOption } from "@/types/echarts/line.js";

export default {
    name: "WarehouseRecordChart",
    components: { echartsBase },
    props: {
        chartData: {
            type: Object,
            required: true
        }
    },
    computed: {
        chartOption() {
            const allValues = this.chartData.yData.flatMap(s => s.data);
            const rawMax = Math.max(...allValues);
            const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
            const dynamicMax = Math.ceil(rawMax / magnitude) * magnitude;
            const yAxisMax = this.chartData.yAxisMax ?? dynamicMax;
            const yAxisInterval = this.chartData.yAxisInterval ?? (yAxisMax / 5);

            const option = baseLineOption(
                this.chartData.xData,
                this.chartData.yData,
                this.chartData.colors || ['#DBA23E', '#0FDACB'],
                "",
                {
                    legendTop: "0%",
                    legendRight: "0%",
                    legendLeft: "auto",
                    legendIcon: "rect",
                    legendItemWidth: 10,
                    legendItemHeight: 10,
                    boundaryGap: false,
                    yAxisMin: 0,
                    yAxisMax,
                    yAxisInterval,
                    isShowXsplitLine: true,
                    isShowArea: true // Activate gradient area
                },
                false
            );

            // hover时的十字指示器/光标
            if (option.tooltip) {
                option.tooltip.axisPointer = {
                    type: 'line',
                    lineStyle: {
                        color: 'rgba(255,255,255,0.3)',
                        type: 'solid'
                    }
                };
            }
            return option;
        }
    }
};
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    margin-bottom: 8px;
    /* Give some spacing to the list below */
}
</style>