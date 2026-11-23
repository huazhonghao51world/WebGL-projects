<template>
    <div class="chart-container">
        <echarts-base :option="chartOption" width="100%" ratio="372/166" />
    </div>
</template>

<script>
import echartsBase from "@/components/echarts/index.vue";
import { baseLineOption } from "@/types/echarts/line.js";

export default {
    name: "FaultTrendChart",
    components: { echartsBase },
    props: {
        chartData: {
            type: Object,
            required: true
        }
    },
    computed: {
        chartOption() {
            const option = baseLineOption(
                this.chartData.xData,
                this.chartData.yData,
                ['#EFB345'], // Colors matching the UI design: Yellow-ish
                "",
                {
                    legendTop: "0%",
                    legendRight: "0%",
                    legendLeft: "auto",
                    legendIcon: "rect",
                    legendItemWidth: 10,
                    legendItemHeight: 10,
                    boundaryGap: true,
                    yAxisMin: 0,
                    yAxisMax: 25,
                    yAxisInterval: 5,
                    isShowXsplitLine: true,
                    isShowArea: true // Activate gradient area
                },
                false
            );

            if (option.tooltip) {
                option.tooltip.axisPointer = {
                    type: 'line',
                    lineStyle: {
                        color: 'rgba(255,255,255,0.3)',
                        type: 'solid'
                    }
                };
                
                // 自定义 tooltip 样式
                option.tooltip.formatter = function (params) {
                    if (!params || !params.length) return "";
                    let item = params[0];
                    return `<div style="padding: 2px;">
                        <div style="font-size:14px; color:#fff; display: flex; align-items: center; justify-content: space-between;">
                            <span style="color: #cad0d8; font-size: 14px;">故障次数</span>
                            <span style="color: #EFB345; background-color: rgba(239, 179, 69, 0.2); border: 1px solid rgba(239, 179, 69, 0.5); border-radius: 4px; padding: 2px 6px; font-size: 12px; margin-left: 8px;">中风险</span>
                        </div>
                        <div style="font-size: 28px; color: #fff; font-weight: bold; margin-top: 8px; font-family: 'DIN Alternate', sans-serif;">${item.data}</div>
                    </div>`;
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
}
</style>
