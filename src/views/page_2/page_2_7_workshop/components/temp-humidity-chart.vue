<template>
  <div class="chart-container">
    <echarts-base :option="chartOption" width="100%" ratio="631/320" />
  </div>
</template>

<script>
import echartsBase from "@/components/echarts/index.vue";
import { baseLineOption } from "@/types/echarts/line.js";
import { countFontsize } from "@/utils/countFontsize.js";

export default {
  name: "TempHumidityChart",
  components: { echartsBase },
  props: {
    chartData: {
      type: Object,
      default: () => ({
        xData: ["08:00", "12:00", "16:00", "20:00", "00:00", "04:00"],
        yData: [
          { name: "温度（℃）", data: [20, 16, 18, 22, 17, 21] },
          { name: "湿度（%）", data: [42, 31, 34, 41, 32, 38] }
        ]
      })
    }
  },
  computed: {
    chartOption() {
      const option = baseLineOption(
        this.chartData.xData,
        this.chartData.yData,
        ["#EFB345", "#76A9F9"],
        "",
        {
          legendTop: "0%",
          legendLeft: "0%",
          boundaryGap: false
        },
        false
      );

      if (option.legend) {
        option.legend = [
          {
            data: [this.chartData.yData[0].name],
            left: "0%",
            top: "0%",
            icon: "rect",
            textStyle: {
              fontSize: countFontsize(20)
            },
            itemStyle: {
                color: "#EFB345",
                borderColor: "#EFB3454D",
                borderWidth: countFontsize(12)
            },
            itemWidth: countFontsize(8),
            itemHeight: countFontsize(8)
          },
          {
            data: [this.chartData.yData[1].name],
            right: "0%",
            top: "0%",
            icon: "rect",
            textStyle: {
              fontSize: 
              countFontsize(20)
            },
            itemStyle: {
                color: "#76A9F9",
                borderColor: "#76A9F94D",
                borderWidth: countFontsize(12)
            },
            itemWidth: countFontsize(8),
            itemHeight: countFontsize(8)
          }
        ];
      }

      option.yAxis = [
        {
          type: "value",
          min: 0,
          max: 25,
          interval: 5,
          axisLine: {
            show: true,
            lineStyle: {
              color: "rgba(168, 199, 235, 0.3)",
              width: Math.max(1, countFontsize(2))
            }
          },
          splitLine: {
            show: true,
            lineStyle: { color: "rgba(168, 199, 235, 0.1)", type: "dashed" }
          },
          axisLabel: {
            color: "rgba(219, 245, 255, 0.8)",
            fontSize: countFontsize(24)
          }
        },
        {
          type: "value",
          min: 0,
          max: 50,
          interval: 10,
          axisLine: {
            show: true,
            lineStyle: {
              color: "rgba(168, 199, 235, 0.3)",
              width: Math.max(1, countFontsize(2))
            }
          },
          splitLine: { show: false },
          axisLabel: {
            color: "rgba(219, 245, 255, 0.8)",
            fontSize: countFontsize(24)
          }
        }
      ];

      if (option.series && option.series.length > 1) {
        option.series[0].yAxisIndex = 0;
        option.series[1].yAxisIndex = 1;
      }

      if (option.xAxis) {
        option.xAxis.axisLabel.color = "rgba(219, 245, 255, 0.8)";
        option.xAxis.axisLabel.fontSize = countFontsize(24);
        option.xAxis.axisLine.lineStyle.color = "rgba(168, 199, 235, 0.3)";
        option.xAxis.axisLine.lineStyle.width = Math.max(1, countFontsize(2));
      }

      option.grid = {
        top: "20%",
        left: "5%",
        right: "5%",
        bottom: "5%",
        containLabel: true
      };

      if (option.tooltip) {
        option.tooltip.backgroundColor = "rgba(255, 255, 255, 0.1)";
        option.tooltip.borderColor = "rgba(255, 255, 255, 0.2)";
        option.tooltip.textStyle = {
          color: "#fff"
        };
        option.tooltip.formatter = params => {
          if (!params || !params.length) return "";

          const seriesColorMap = this.chartData.yData.reduce((map, item, index) => {
            map[item.name] = ["#EFB345", "#76A9F9"][index] || item.color || "#DBFDFF";
            return map;
          }, {});

          const timeText = params[0].axisValueLabel || params[0].axisValue || "";
          const rows = params
            .map(item => {
              const color = seriesColorMap[item.seriesName] || "#DBFDFF";
              const value = item.data == null ? "--" : item.data;
              const iconHtml = `<span style="display:inline-block;margin-right:8px;border-radius:0;width:4px;height:4px;background:${color};border:3px solid ${color}4D;background-clip:padding-box;box-sizing:content-box;"></span>`;

              return `<div style="display:flex;justify-content:space-between;align-items:center;min-width:140px;margin:4px 0;">
                <div style="display:flex;align-items:center;">
                  ${iconHtml}
                  <span style="color:#DBFDFF;font-size:12px;">${item.seriesName}</span>
                </div>
                <span style="color:#DBF5FF;font-weight:bold;font-size:16px;margin-left:14px;">${value}</span>
              </div>`;
            })
            .join("");

          return `<div style="color:#fff;font-size:20px;line-height:1;margin-bottom:6px;">${timeText}</div>${rows}`;
        };
        option.tooltip.axisPointer = {
          type: "line",
          lineStyle: {
            color: "rgba(168, 199, 235, 0.5)",
            type: "solid"
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
}
</style>
