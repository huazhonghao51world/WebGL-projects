<template>
    <div class="segment-content">
        <div v-if="title" class="segment-title">
            {{ title }}
        </div>

        <div class="segment-bar">
            <div v-for="(seg, idx) in data" :key="idx" class="segment-part" :style="{
                flex: seg.value,
                background: seg.color
            }"></div>
        </div>

        <div class="segment-legend">
            <div v-for="(seg, idx) in data" :key="idx" class="legend-item">
                <span class="legend-dots" :style="{
                    '--legend-color': seg.color
                }">
                    <i class="legend-square" :style="{
                        background: seg.color
                    }"></i>
                </span>

                <span class="legend-text">
                    {{ seg.name }} {{ seg.value }}%
                </span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "SegmentContent",

    props: {
        title: {
            type: String,
            default: "",
        },

        data: {
            type: Array,
            default: () => [],
        },
    },
};
</script>

<style lang="scss" scoped>
.segment-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    height: 100%;
}

/* =========================
 * 分段条
 * ========================= */

.segment-bar {
    display: flex;

    width: 100%;
    height: 0.5rem;

    gap: var(--seg-gap, 0.25rem);

    background: rgba(60, 80, 120, 0.35);

    border-radius: px2rem(4);

    overflow: hidden;
}

.segment-part {
    height: 100%;
    transition: flex 0.6s ease;
}

/* =========================
 * 图例
 * ========================= */

/* 列间距由剩余空间自动分配：图例数量/文字长度变化时都尽量排成一行 */
.segment-legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.4rem 0.2rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.2rem;
}

/*
 * 图例颜色容器
 *
 * 外层：
 * 和里面的小方块使用同一个颜色，
 * 但是降低透明度。
 */
.legend-dots {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: px2rem(10);
    height: px2rem(10);

    padding: 0;

    /*
     * 外层使用当前图例颜色，
     * 只降低透明度。
     */
    background: color-mix(in srgb,
            var(--legend-color) 30%,
            transparent);
    box-sizing: border-box;
    flex-shrink: 0;
}

/*
 * 中间的小色块
 *
 * 使用 seg.color 原色
 */
.legend-square {
    position: absolute;
    left: 50%;
    top: 50%;
    width: px2rem(4);
    height: px2rem(4);
    background: var(--legend-color);
    box-shadow: 0 0 0 px2rem(1) rgba(0, 0, 0, 0.04) inset;
    transform: translate(-50%, -50%);
}

/* =========================
 * 图例文字
 * ========================= */

.legend-text { 
    color: #DBF5FF;
    letter-spacing: 0px;
    font-family: var(--font-family-primary-Regular);
    font-size: px2rem(12);
    white-space: nowrap;
}

/* =========================
 * 标题
 * ========================= */

.segment-title {
    padding-bottom: 0.2rem;
    color: var(--color-primary);
    font-family: var(--font-family-primary-Medium);
    font-size: px2rem(12);
}
</style>