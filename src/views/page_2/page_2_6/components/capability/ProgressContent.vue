<template>
    <div class="progress-content">
        <div v-if="title" class="progress-title">{{ title }}</div>
        <!-- 单一 grid 容器：chip 列宽由本组件内所有 label 中最长的一个自动撑开，无需固定宽度 -->
        <div class="progress-grid">
            <div v-for="(item, idx) in data" :key="idx" class="progress-row">
                <span class="progress-chip-header">{{ item.header }}</span>
                <span class="progress-chip">{{ item.label }}</span>
                <div class="progress-track">
                    <div class="progress-fill" :style="{ width: item.percent + '%' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ProgressContent",
    props: {
        title: { type: String, default: "" },
        data: { type: Array, default: () => [] },
    },
};
</script>

<style lang="scss" scoped>
.progress-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.8rem;
    height: 100%;
    width: 100%;
    padding: 0.2rem 0;
    box-sizing: border-box;
}

.progress-title {
    flex-shrink: 0;
    font-size: px2rem(12);
    color: var(--color-primary);
    font-family: var(--font-family-primary-Medium);
}

.progress-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: 0.6rem;
    row-gap: 0.5rem;
    width: 100%;
}

.progress-chip-header {
    align-self: center;
    font-size: px2rem(12);
    color: var(--color-primary);
    font-family: var(--font-family-primary-Regular);
}

.progress-chip {
    grid-column: 2;
    align-self: center;
    justify-self: stretch;
    text-align: center;
    padding: 0.1rem 0.2rem;
    font-size: px2rem(12);
    color: #9BF8FF;
    font-family: var(--font-family-primary-Regular);
    background: rgba(155, 248, 255, 0.2);
    border-radius: px2rem(3);
    letter-spacing: 0em;
    white-space: nowrap;
}

.progress-track {
    grid-column: 1 / -1;
    width: 100%;
    height: 0.5rem;
    background: rgba(60, 80, 120, 0.35);
    border-radius: px2rem(4);
    overflow: hidden;

    /* 组间距（0.8rem）= 行内间距（row-gap 0.2rem）+ 此处补差（0.6rem） */
    &:not(:last-child) {
        margin-bottom: 0.6rem;
    }
}

.progress-fill {
    height: 100%;
    border-radius: px2rem(50);
    background: #2261F0;
    transition: width 0.6s ease;
}

/* wrapper for v-for that should not affect grid layout */
.progress-row {
    display: contents;
}
</style>
