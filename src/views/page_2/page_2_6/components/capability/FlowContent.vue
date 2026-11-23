<template>
    <div class="flow-content">
        <div v-if="title" class="title">{{ title }}</div>

        <!-- 顶部能流关系 -->
        <div class="flow-top">
            <div v-for="(m, idx) in topRow" :key="'t' + idx" class="flow-top-item">
                <div class="flow-top-label">
                    {{ m.label }}
                </div>

                <div class="flow-top-badge">
                    <span class="flow-top-value">
                        {{ m.value }}
                    </span>
                </div>

                <!-- 模块之间的箭头 -->
                <img v-if="idx < topRow.length - 1" :src="arrowIcon" class="flow-top-arrow" alt="" />
            </div>
        </div>

        <!-- 下方指标 -->
        <div class="flow-groups">

            <div v-for="(g, gi) in groups" :key="'g' + gi" class="flow-group">

                <!-- 左右标题 -->
                <div class="flow-group-header">

                    <div class="flow-group-header-item">
                        <img :src="headerIcon" class="flow-group-icon" alt="" />
                        <span>{{ g.header.left }}</span>
                    </div>

                    <div class="flow-group-header-item">
                        <img :src="headerIcon" class="flow-group-icon" alt="" />
                        <span>{{ g.header.right }}</span>
                    </div>

                </div>

                <!-- 左右数据 -->
                <div v-for="(row, ri) in g.rows" :key="'r' + ri" class="flow-grid-row">

                    <!-- 左列 -->
                    <div class="flow-col">
                        <div v-for="(it, li) in row.left" :key="'l' + li" class="flow-metric">
                            <span class="flow-metric-label">
                                {{ it.label }}
                            </span>

                            <span class="flip-group">
                                <span v-for="(ch, ci) in chars(it.value)" :key="ci" class="flip-cell">
                                    {{ ch }}
                                </span>
                            </span>
                        </div>
                    </div>

                    <!-- 右列 -->
                    <div class="flow-col">
                        <div v-for="(it, li) in row.right" :key="'ri' + li" class="flow-metric">
                            <span class="flow-metric-label">
                                {{ it.label }}
                            </span>

                            <span class="flip-group">
                                <span v-for="(ch, ci) in chars(it.value)" :key="ci" class="flip-cell">
                                    {{ ch }}
                                </span>
                            </span>
                        </div>
                    </div>

                </div>

            </div>

        </div>

    </div>
</template>

<script>
import headerIcon from "@/assets/images/ui_material/page_2_6/right-能力模块/能流分析/input-header-icon.png";
import arrowIcon from "@/assets/images/ui_material/page_2_6/right-能力模块/能流分析/jiantou.png";

export default {
    name: "FlowContent",

    props: {
        title: {
            type: String,
            default: "",
        },

        topRow: {
            type: Array,
            default: () => [],
        },

        groups: {
            type: Array,
            default: () => [],
        },
    },

    data() {
        return {
            headerIcon,
            arrowIcon,
        };
    },

    methods: {
        chars(val) {
            return String(val).split("");
        },
    },
};
</script>

<style lang="scss" scoped>
.flow-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.title {
    flex-shrink: 0;
    font-size: var(--font-size-12);
    color: var(--color-primary);
    font-family: var(--font-family-primary-Medium);
}



/* =========================
   顶部能流
   ========================= */

.flow-top {
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0.8rem 0.15rem 0 0.15rem;
    gap: 1.8rem;

}

.flow-top-item {
    padding: 0.7rem 0rem 0.2rem 0rem;
    position: relative;
    flex: 1;
    width: px2rem(39);
    height: px2rem(64);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: url("~@/assets/images/ui_material/page_2_6/right-能力模块/能流分析/Electric-power-energy-balance-BG.png") no-repeat;
    background-size: 100% 100%;
    gap: 0.8rem;
}

.flow-top-label {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: px2rem(13);
    line-height: 1;
    color: var(--color-primary);
    font-family: var(--font-family-primary-Regular);
    white-space: nowrap;
}

.flow-top-badge {
    width: 2.2rem;
    height: 2rem;

    display: flex;
    align-items: center;
    justify-content: center;

    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;

    box-sizing: border-box;
}

.flow-top-value {
    font-size: px2rem(14);
    line-height: 1;
    color: #9bf8ff;
    font-family: var(--font-family-primary-Bold);
}


/* 箭头 */
.flow-top-arrow {
    position: absolute;
    right: -1rem;
    bottom: 1.6rem;
    transform: translateX(50%);
    width: px2rem(12);
    height: px2rem(12);

    object-fit: contain;

    pointer-events: none;
}


/* =========================
   下方数据
   ========================= */

.flow-groups {
    width: 100%;

    display: flex;
    flex-direction: column;

    margin-top: 1.25rem;
    gap: 1rem;
}


/* 每一个左右组合 */
.flow-group {
    width: 100%;

    display: flex;
    flex-direction: column;

    gap: 0.5rem;
}


/* 左右标题 */
.flow-group-header {
    width: 100%;
    display: grid;
    /* 与 .flow-grid-row 同列宽：左列够宽放下「生产 动力」同排，右列两组左边缘对齐 */
    grid-template-columns: 1.6fr 1fr;
    column-gap: 1.2rem;
}

.flow-group-header-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(185, 203, 230, 0.55);

    span {
        white-space: nowrap;
        font-family: var(--font-family-primary-Regular);
        font-size: px2rem(14);
        line-height: 1;
    }
}

.flow-group-header-item:nth-child(2) {
    padding-left: 0.15rem;
}

.flow-group-icon {
    width: px2rem(6);
    height: px2rem(15);
    flex-shrink: 0;
}


/* =========================
   数据行
   ========================= */

.flow-grid-row {
    width: 100%;
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    column-gap: 1.2rem;
}


/* 左右列：同一 row 内多个指标横向并排（如"生产 动力"同一行） */
.flow-col {
    min-width: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    row-gap: 0.5rem;
    column-gap: 0.6rem;
}


/* 单条数据 */
.flow-metric {
    min-height: 1.45rem;

    display: flex;
    align-items: center;

    gap: 0.4rem;

    white-space: nowrap;
}


/* 名称 */
.flow-metric-label {
    flex-shrink: 0;
    font-size: px2rem(13);
    line-height: 1;

    color: #b9cbe6;
    font-family: var(--font-family-primary-Regular);
}


/* =========================
   数字格
   ========================= */

.flip-group {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    flex-shrink: 0;
}

.flip-cell {
    width: px2rem(20);
    height: px2rem(30);
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    box-sizing: border-box;

    background: rgba(35, 95, 240, 0.2);
    border: 1px solid rgba(90, 150, 250, 0.42);
    border-radius: px2rem(2);

    font-size: px2rem(16);
    line-height: 1;

    color: #ffffff;
    font-family: var(--font-family-primary-Bold);
}
</style>