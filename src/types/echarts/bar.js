import * as echarts from "echarts";
import { countFontsize, fontColor } from "@utils/countFontsize.js";

import {
  defaultGradientColumnOptionData,
  defaultHorizontalColumnOptionData,
  taskStatusColumnData,
  taskStatusColorList,
} from "../defaultData.js";

export const generalBarOption = (
  data,
  name,
  unit,
  orientation,
  color,
  yAxisConfig,
  otherConfig,
) => {
  // 通用柱状图默认示例数据
  const defaultSample = {
    name: "人口数量",
    orientation: "vertical",
    unit: "",
    data: [
      { name: "2021", value: 550 },
      { name: "2022", value: 700 },
      { name: "2023", value: 420 },
      { name: "2024", value: 220 },
      { name: "2025", value: 240 },
    ],
    color: ["rgba(58, 96, 224, 1)", "rgba(96, 185, 255, 1)"],
    yAxisConfig: {
      min: 0,
      max: 1000,
      interval: 200,
    },
  };

  // 如果未传入对应参数，则使用默认示例数据的值
  data = data && data.length ? data : defaultSample.data;
  name = name || defaultSample.name;
  unit = unit || defaultSample.unit;
  orientation = orientation || defaultSample.orientation;
  color = color || defaultSample.color;
  yAxisConfig = yAxisConfig || defaultSample.yAxisConfig;

  // 默认配置项
  const defaultConfig = {
    isWhiteLine: false,    // 是否显示柱子顶部/右侧白色短横线
    barWidth: 12,          // 柱子宽度
    isPercentage: false,   // 是否改为显示百分比
    unitPosition: "right", // 数值轴单位位置 left/middle/right
    isShowXLine: true,     // 是否显示X轴轴线
    isShowYLine: true,     // 是否显示Y轴轴线
    isShowXLabel: true,    // 是否显示X轴标签
    isShowYLabel: true,    // 是否显示Y轴标签
    isMaxColor: true,      // 是否对最大值柱子使用特殊颜色
    maxColor: ['rgba(151, 153, 156, 1)', 'rgba(250, 250, 250, 1)'], // 最大值柱子颜色
    showBarValue: true,    // 是否显示柱子数值
    isShowBackground: true, // 是否显示柱子背景
    barBorderColor: false,  // 柱子边框颜色 true/false/'#ff0000'
  };
  otherConfig = { ...defaultConfig, ...otherConfig };

  // 获取真实的最大值
  const realMax = Math.max(...data.map((item) => item.value));

  // 自动计算美观的最大值
  function niceMax(value) {
    if (value <= 10) return 10;
    if (value <= 20) return 20;
    if (value <= 25) return 25;
    if (value <= 50) return 50;
    if (value <= 100) return 100;
    if (value <= 200) return 200;
    if (value <= 500) return 500;
    if (value <= 1000) return 1000;
    return Math.ceil(value / 1000) * 1000;
  }
  const maxValue = yAxisConfig ? yAxisConfig.max : niceMax(realMax);
  const interval = yAxisConfig?.interval !== undefined
    ? { interval: yAxisConfig.interval }
    : {};

  // 处理渐变色 - 支持两个颜色的数组
  let bottomColor, topColor;
  if (Array.isArray(color) && color.length === 2) {
    bottomColor = color[0];
    topColor = color[1];
  } else {
    bottomColor = `${color}00`;
    topColor = color;
  }

  // 渐变色方向配置
  const gradientDirectionMap = {
    horizontal: [1, 0, 0, 0],
    vertical: [0, 0, 0, 1],
  };
  const gradientDirection = gradientDirectionMap[orientation] || [0, 1, 0, 0];

  // 根据方向配置坐标轴
  let xAxis, yAxis, grid;
  if (orientation === "horizontal") {
    // 水平条形图配置
    grid = {
      left: "3%",
      right: "5%",
      bottom: "0%",
      top: unit ? "15%" : "2%",
      containLabel: true,
    };
    xAxis = {
      type: "value",
      show: true,
      axisLine: {
        show: otherConfig.isShowXLine,
        lineStyle: {
          color: fontColor(0.2),
          width: countFontsize(2),
        },
      },
      axisLabel: {
        show: otherConfig.isShowXLabel,
        color: fontColor(0.8),
        fontSize: countFontsize(24),
        fontFamily: "OPPOSans-M",
        fontWeight: 200,
        formatter: function (value) {
          return otherConfig.isPercentage ? value + '%' : String(value);
        },
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: fontColor(0.2),
          type: "dashed",
        },
      },
      min: 0,
      max: maxValue,
      ...interval,
    };
    yAxis = {
      type: "category",
      data: data.map((item) => item.name),
      show: true,
      name: unit,
      nameTextStyle: {
        color: fontColor(0.6),
        fontSize: countFontsize(24),
        fontFamily: "OPPOSans-M",
        align: otherConfig.unitPosition,
      },
      nameGap: countFontsize(16),
      axisLine: {
        show: otherConfig.isShowYLine,
        color: fontColor(0.2),
      },
      axisLabel: {
        show: otherConfig.isShowYLabel,
        color: fontColor(0.6),
        fontSize: countFontsize(24),
        fontFamily: "OPPOSans-M",
        fontWeight: 200,
        showMaxLabel: true,
        showMinLabel: true,
        margin: countFontsize(15),
        align: "right",
        formatter: function (value) {
          const N = 4;
          const parts = (value || "").toString().match(new RegExp('.{1,' + N + '}', 'g')) || [value];
          return parts.join('\n');
        },
        lineHeight: countFontsize(26),
      },
      axisTick: {
        show: false,
        alignWithLabel: true,
        lineStyle: { color: "#fff" },
      },
    };
  } else {
    // 垂直柱状图配置
    grid = {
      left: "3%",
      right: "2%",
      bottom: "1%",
      top: unit ? "15%" : "5%",
      containLabel: true,
    };
    xAxis = {
      type: "category",
      data: data.map((item) => item.name),
      show: true,
      axisLine: {
        color: fontColor(0.2),
        width: countFontsize(2),
        lineStyle: {
          color: '#A9BBEB',
          width: countFontsize(2),
        },
      },
      axisLabel: {
        show: otherConfig.isShowXLabel,
        color: fontColor(0.8),
        fontSize: countFontsize(19),
        fontFamily: "OPPOSans-M",
        fontWeight: 200,
        interval: 0,
        rotate: 0,
        showMaxLabel: true,
        showMinLabel: true,
        margin: countFontsize(25),
        formatter: function (value) {
          const N = 6;
          const parts = (value || "").toString().match(new RegExp('.{1,' + N + '}', 'g')) || [value];
          return parts.join('\n');
        },
        lineHeight: countFontsize(28),
      },
      axisTick: {
        show: false,
        alignWithLabel: true,
        lineStyle: {
          color: fontColor(0.2),
          width: countFontsize(2),
        },
      },
    };
    yAxis = {
      type: "value",
      show: true,
      name: unit,
      nameGap: Math.floor(countFontsize(22)),
      nameLocation: "end",
      nameTextStyle: {
        color: fontColor(0.8),
        fontSize: countFontsize(24),
        fontFamily: "OPPOSans-M",
        fontWeight: 200,
        align: otherConfig.unitPosition,
      },
      axisLine: {
        show: otherConfig.isShowYLine,
        lineStyle: {
          color: fontColor(0.2),
          width: countFontsize(2),
        },
      },
      axisLabel: {
        show: otherConfig.isShowYLabel,
        color: fontColor(0.8),
        fontSize: countFontsize(22),
        fontFamily: "OPPOSans-M",
        fontWeight: 200,
        formatter: function (value) {
          return otherConfig.isPercentage ? value + '%' : String(value);
        },
      },
      splitLine: {
        lineStyle: {
          color: fontColor(0.2),
          type: "dashed",
        },
      },
      min: 0,
      max: maxValue,
      ...interval,
    };
  }

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "none" },
      formatter: function (params) {
        if (!params || !params.length) return "";
        let tooltip = name + "<br/>";
        params.forEach((item) => {
          if (item.seriesName) {
            tooltip += `<span style="display:inline-block;margin-right:6px;border-radius:50%;width:10px;height:10px;background:${item.color};"></span>${item.axisValueLabel}：${item.data}<br/>`;
          }
        });
        return tooltip;
      },
      backgroundColor: "rgba(0,0,0,0.7)",
      textStyle: { color: "#fff", fontSize: 14 },
    },
    grid: grid,
    xAxis: xAxis,
    yAxis: yAxis,
    series: [
      // 柱顶白色短横线（可选）
      otherConfig.isWhiteLine && {
        name: "",
        type: "pictorialBar",
        symbol: "rect",
        symbolSize: orientation === "horizontal"
          ? [countFontsize(4), countFontsize(30)]
          : [countFontsize(30), countFontsize(4)],
        symbolOffset: orientation === "horizontal"
          ? [0, countFontsize(0)]
          : [countFontsize(16), 0],
        symbolPosition: "end",
        barWidth: countFontsize(16),
        z: 3,
        itemStyle: { normal: { color: color[0] } },
        data: data.map((item) => item.value),
      },
      // 背景条居中版本
      {
        type: "bar",
        barWidth: countFontsize(90),
        // 背景条
        barGap: '-65%',
        data: data.map(() => maxValue),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(...gradientDirection, [
            { offset: 0, color: "rgba(145, 168, 194,0.15)" }, // 顶部颜色
            { offset: 0.5, color: "rgba(145, 168, 194,0.15)" },
            { offset: 1, color: "rgba(145, 168, 194,0.15)" }, // 底部颜色
          ]),
        },
        silent: true,
        z: 1,
      },
      // 主柱状图
      {
        name: name,
        type: "bar",
        barWidth: countFontsize(otherConfig.barWidth || 12),
        showBackground: otherConfig.isShowBackground || false,
        backgroundStyle: { color: "rgba(180, 180, 180, 0.2)" },
        data: data.map((item) => item.value),
        itemStyle: {
          borderColor: otherConfig.barBorderColor
            ? otherConfig.barBorderColor === true ? topColor : otherConfig.barBorderColor
            : 'transparent',
          color: function (params) {
            const val = params && (params.data != null ? params.data : params.value);
            // 最大值使用特殊颜色
            if (orientation === "horizontal") {
              if (otherConfig.isMaxColor && val === realMax) {
                return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                  { offset: 0, color: otherConfig.maxColor[1] || "#FFD700" },
                  { offset: 1, color: otherConfig.maxColor[0] || "#FFD700" },
                ]);
              }
              return new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: topColor },
                { offset: 1, color: bottomColor },
              ]);
            } else {
              if (otherConfig.isMaxColor && val === realMax) {
                return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: otherConfig.maxColor[1] || "#FFD700" },
                  { offset: 1, color: otherConfig.maxColor[0] || "#FFD700" },
                ]);
              }
              return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: topColor },
                { offset: 1, color: bottomColor },
              ]);
            }
          },
        },
        z: 2,
        label: otherConfig.showBarValue
          ? {
            show: true,
            position: orientation === "horizontal" ? "right" : "top",
            color: fontColor(1),
            fontSize: countFontsize(22),
            fontFamily: "OPPOSans-M",
            formatter: function (params) {
              const val = params && (params.data != null ? params.data : params.value);
              return otherConfig.isPercentage ? val + "%" : String(val);
            },
          }
          : { show: false },
      },
    ].filter(Boolean), // 过滤掉 false 值
  };

  return option;
};

const toRgba = (color, alpha = 1) => {
  // supports hex (#RRGGBB / #RGB) and rgb/rgba strings.
  if (typeof color !== 'string') return color;
  const hexMatch = color.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const intVal = parseInt(hex, 16);
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  const rgbMatch = color.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map((p) => p.trim());
    return `rgba(${parts[0]},${parts[1]},${parts[2]},${alpha})`;
  }

  return color;
};

export const safetyRectifyOption = (
  chartData = [],
  max = 5,
  interval = 1,
  color = "#568AFF",
  {
    hideYAxis = false,
    gridTop = "12%",
    gridBottom = "5%",
    gridLeft = "5%",
    gridRight = "5%",
    bgBarWidth,
    xAxisLineColor = "rgba(168, 199, 235, 0.45)",
    xAxisLabelColor = "rgba(219,245,255,0.9)",
    yAxisLineShow = !hideYAxis,
    yAxisLineType = "solid",
    yAxisLineColor = "rgba(168, 199, 235, 0.45)",
  } = {},
) => {
  const xData = chartData.map((i) => i.name);
  const yData = chartData.map((i) => i.value);
  const color20 = toRgba(color, 0.2);
  const bgWidth = bgBarWidth || countFontsize(88);

  return {
    backgroundColor: "transparent",
    grid: {
      left: gridLeft,
      right: gridRight,
      top: gridTop,
      bottom: gridBottom,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xData,
      axisLine: {
        lineStyle: {
          color: xAxisLineColor,
          width: countFontsize(4),
        },
      },
      axisTick: {
        show: false,
        alignWithLabel: true,
      },
      axisLabel: {
        color: xAxisLabelColor,
        fontSize: countFontsize(22),
        fontFamily: "OPPOSans-M",
        padding: [0, 0, 0, countFontsize(22)],
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max,
      interval,
      axisLine: {
        show: yAxisLineShow,
        lineStyle: {
          color: yAxisLineColor,
          type: yAxisLineType,
          width: countFontsize(4),
        },
      },
      axisTick: { show: false },
      axisLabel: {
        show: !hideYAxis,
        color: "rgba(219,245,255,0.8)",
        fontSize: countFontsize(24),
        fontFamily: "OPPOSans-M",
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(150, 188, 235, 0.24)",
          type: "dashed",
          width: countFontsize(2),
        },
      },
    },
    series: [
      {
        type: "bar",
        barWidth: bgWidth,
        barAlign: "center",
        barGap: "-67%",
        barCategoryGap: "0%",
        data: xData.map(() => max),
        itemStyle: {
          color: "rgba(145,168,194,0.18)",
        },
        z: 1,
        silent: true,
      },
      {
        type: "bar",
        barWidth: countFontsize(30),
        barAlign: "center",
        barCategoryGap: "0%",
        data: yData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color20 },
            { offset: 1, color: color },
          ]),
        },
        z: 3,
      },
      {
        type: "pictorialBar",
        symbol: "rect",
        symbolSize: [countFontsize(30), countFontsize(6)],
        symbolPosition: "end",
        symbolOffset: [countFontsize(15), 0],
        itemStyle: { color: color },
        data: yData,
        z: 4,
      },
    ],
  };
};

export const MultiBarOption = (
  data,
  colors,
  name,
  orientation = "vertical",
  yAxisConfig = {},
  isNeedLegend = true,
  isDefault = false,
  legendIconSize = 5,
  gridConfig = {}, // 新增grid配置参数
) => {
  // 默认数据设置
  if (isDefault) {
    const defaultData = taskStatusColumnData();
    const defaultColors = taskStatusColorList();
    return MultiBarOption(
      defaultData.data,
      defaultColors,
      defaultData.text,
      defaultData.orientation,
      defaultData.yAxis,
      false,
      legendIconSize,
      gridConfig,
    );
  }

  console.log(data, "1111111111111111111111");

  // 提取分类名称和日期数据
  const categoryNames = [
    ...new Set(data.flatMap((item) => item.values.map((v) => v.name))),
  ];
  const dates = data.map((item) => item.date);

  // 创建数据映射函数
  const createSeriesData = (category) =>
    data.map((item) => {
      const found = item.values.find((v) => v.name === category);
      return found ? found.value : 0;
    });

  // 通用样式配置
  const commonStyles = {
    axisLabel: {
      color: fontColor(0.8),
      fontSize: countFontsize(22),
      fontFamily: "OPPOSans-M",
      margin: countFontsize(20),
    },
    axisLine: {
      lineStyle: { color: "rgba(255, 255, 255, 0.2)", width: 2 },
    },
    splitLine: {
      lineStyle: {
        color: "rgba(255, 255, 255, 0.2)",
        type: "dashed",
      },
    },
  };

  // 构造主要柱状图系列
  const mainSeries = categoryNames.map((category, index) => ({
    name: category,
    type: "bar",
    barWidth: countFontsize(10),
    barGap: "120%",
    showBackground: true,
    backgroundStyle: {
      color: "rgba(180, 180, 180, 0.2)",
    },
    data: createSeriesData(category),
    itemStyle: {
      color: colors[index % colors.length],
    },
  }));

  // 构造装饰系列
  const decorativeSeries = categoryNames.map((category, index) => ({
    name: "",
    type: "pictorialBar",
    barGap: "120%",
    symbol: "rect",
    symbolSize:
      orientation === "horizontal"
        ? [countFontsize(3), countFontsize(14)]
        : [countFontsize(14), countFontsize(3)],
    symbolOffset: orientation === "horizontal" ? [countFontsize(2), 0] : [0, 0],
    symbolPosition: "end",
    tooltip: { show: false },
    z: 3,
    itemStyle: {
      color: "rgba(255, 255, 255, 1)",
    },
    data: createSeriesData(category),
    barCategoryGap: "80%",
    barWidth: countFontsize(10),
  }));

  // 坐标轴配置
  const isHorizontal = orientation === "horizontal";
  const valueAxisConfig = {
    type: "value",
    show: true,
    ...commonStyles,
    axisLine: { show: !isHorizontal, ...commonStyles.axisLine },
    min: 0,
    max: yAxisConfig?.max || 800,
    interval: yAxisConfig?.interval || 200,
  };

  const categoryAxisConfig = {
    type: "category",
    data: dates,
    show: true,
    margin: countFontsize(6),
    axisLine: {
      color: "rgba(255, 255, 255, 0.2)",
      width: countFontsize(2),
    },
    axisLabel: {
      ...commonStyles.axisLabel,
      fontWeight: isHorizontal ? 400 : 200,
      interval: isHorizontal ? undefined : 0,
    },
    axisTick: { show: false },
  };

  const [xAxis, yAxis] = isHorizontal
    ? [valueAxisConfig, categoryAxisConfig]
    : [categoryAxisConfig, valueAxisConfig];

  // 默认grid配置
  const defaultGridConfig = {
    left: countFontsize(12),
    right: countFontsize(40),
    bottom: countFontsize(3),
    top: isNeedLegend ? countFontsize(60) : countFontsize(20),
    containLabel: true,
  };

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      axisPointer: { type: "none" },
      formatter: function (param) {
        if (!param) return "";
        let tooltip = param.seriesName + "<br/>";
        tooltip += `<span style="display:inline-block;margin-right:6px;border-radius:50%;width:10px;height:10px;background:${param.color};"></span>${param.name}：${param.data}<br/>`;
        return tooltip;
      },
      backgroundColor: "rgba(0,0,0,0.7)",
      textStyle: {
        color: "#fff",
        fontSize: 14,
        fontFamily: "OPPOSans-M",
      },
    },
    grid: {
      ...defaultGridConfig,
      ...gridConfig, // 合并用户自定义的grid配置
    },
    legend: {
      show: isNeedLegend,
      data: categoryNames.map((name, index) => ({
        name: name,
        itemStyle: {
          color: colors[index % colors.length],
          borderColor: `${colors[index % colors.length]}60`,
          borderWidth: countFontsize(8),
          borderType: "solid",
        },
      })),
      selectedMode: false,
      icon: "circle",
      right: countFontsize(20),
      itemWidth: countFontsize(legendIconSize),
      itemHeight: countFontsize(legendIconSize),
      itemGap: countFontsize(30),
      symbolKeepAspect: true,
      formatter: function (name) {
        const item = data.find((d) => d.name === name);
        return `{name|${name}}`;
      },
      textStyle: {
        color: fontColor(0.8),
        fontSize: countFontsize(22),
        fontFamily: "OPPOSans-M",
        rich: {
          name: {
            fontSize: countFontsize(22),
            fontFamily: "OPPOSans-M",
            color: fontColor(0.8),
            padding: [0, 0, 0, countFontsize(1)],
          },
        },
        padding: [countFontsize(3), 0, 0, countFontsize(4)],
      },
    },
    xAxis,
    yAxis,
    series: [...mainSeries, ...decorativeSeries],
  };
};

export const stackBarOption = (data = [], colorList) => {
  // 默认颜色列表
  colorList = colorList || [
    "#2195e0",
    "#86e0ed",
    "#dbf5ff",
    "#fec551",
    "#ff5c57",
  ];

  // 提取x轴分类数据
  const categories = data.map((item) => item.date);

  // 提取系列名称
  const seriesNames =
    data.length > 0
      ? [...new Set(data[0].values.map((v) => v.name))]
      : ["系列1", "系列2", "系列3", "系列4", "系列5"];

  // 构建每个系列的数据
  const mainSeries = seriesNames.map((name, index) => {
    const seriesData = data.map((item) => {
      const match = item.values.find((v) => v.name === name);
      return match ? match.value : 0;
    });

    return {
      name: name,
      type: "bar",
      stack: "Ad",
      barWidth: countFontsize(14),
      data: seriesData,
      showBackground: true,
      backgroundStyle: {
        color: "rgba(180, 180, 180, 0.05)",
      },
      itemStyle: {
        color: colorList[index % colorList.length],
        opacity: 0.7, // 使颜色变浅
      },
      emphasis: {
        focus: "series",
      },
    };
  });

  // 计算每个类别（x轴）的总和，用于绘制装饰线
  const totalData = categories.map((_, dateIndex) => {
    return seriesNames.reduce((sum, name) => {
      const item = data[dateIndex];
      if (!item) return sum;
      const match = item.values.find((v) => v.name === name);
      return sum + (match ? match.value : 0);
    }, 0);
  });

  // 只创建一个装饰线系列，显示在堆叠柱的顶部
  const decorativeSeries = [
    {
      name: "",
      type: "pictorialBar",
      barGap: "120%",
      symbol: "rect",
      symbolSize: [countFontsize(20), countFontsize(3)],
      symbolOffset: [0, 0],
      symbolPosition: "end",
      tooltip: { show: false },
      z: 3,
      itemStyle: {
        color: "rgba(255, 255, 255, 1)",
      },
      data: totalData,
      barCategoryGap: "80%",
      barWidth: countFontsize(10),
    },
  ];

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: seriesNames.map((item, index) => {
        return {
          name: item,
          itemStyle: {
            color: colorList[index % colorList.length],
            borderColor: `${colorList[index % colorList.length]}60`,
            borderWidth: countFontsize(10),
            borderType: "solid",
          },
        };
      }),
      selectedMode: false,
      icon: "circle",
      right: countFontsize(15),
      itemWidth: countFontsize(10),
      itemHeight: countFontsize(10),
      textStyle: {
        fontSize: countFontsize(22),
        fontFamily: "OPPOSans-M",
        color: fontColor(0.8),
      },
    },
    grid: {
      left: "2%",
      right: "4%",
      top: "19%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: categories,
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: "#505a60",
            width: 2,
          },
        },
        axisLabel: {
          fontSize: countFontsize(20),
          fontFamily: "OPPOSans-M",
          color: fontColor(0.8),
          interval: 0, // 添加这一行，强制显示所有标签
          rotate: 0, // 可以根据需要调整旋转角度，如果标签重叠
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          fontSize: countFontsize(20),
          fontFamily: "OPPOSans-M",
          color: fontColor(0.8),
        },
        axisLine: {
          show: true,
          lineStyle: {
            type: "solid",
            color: "#505a60",
            width: 2,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            color: "#505a60",
          },
        },
      },
    ],
    series: [...mainSeries, ...decorativeSeries],
  };
};
