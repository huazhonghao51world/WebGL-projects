<template>
    <div class="capability-panel">
        <div class="cap-top">
            <!-- 能力模块切换下拉 -->
            <PanelSelect v-if="!hideModuleSelect" class="cap-primary" :value="module.name" :options="moduleNames" primary
                @input="onModuleChange" />

            <!-- 子模块标题 + 内容（复用公共 SecBox） -->
            <SecBox class="cap-subtitle">
                <template v-slot:header>
                    <span class="cap-subtitle-text">{{ module.name }}</span>
                </template>

                <!-- 筛选下拉 -->
                <div class="cap-filters">
                    <div v-for="f in module.filters" :key="f.key" class="cap-filter-item" :class="{ full: f.full }">
                        <span class="cap-filter-label">{{ f.label }}</span>
                        <PanelSelect v-model="filterValues[f.key]" :options="f.options" lock-first />
                    </div>
                </div>

                <!-- KPI 指标（复用公共 DataCard） -->
                <div class="cap-kpis" :style="{ '--cap-kpi-gap': kpiGap, '--cap-kpi-padding-left': kpiPaddingLeft }">
                    <DataCard v-for="(kpi, idx) in module.kpis" :key="idx" :iconPath="kpi.icon" :value="kpi.value"
                        :unit="kpi.unit" :label="kpi.label" :valueFirst="true" :splitSlash="true"
                        class="cap-kpi-card" />
                </div>

                <!-- 动态内容区 -->
                <div class="cap-content" :class="{ 'cap-content--bar': module.content.type === 'bar' }">
                    <BarContent v-if="module.content.type === 'bar'" :title="module.content.title"
                        :data="module.content.data" />
                    <ProgressContent v-else-if="module.content.type === 'progress'" :title="module.content.title"
                        :data="module.content.data" />
                    <SegmentContent v-else-if="module.content.type === 'segment'" :title="module.content.title" :data="module.content.data" />
                    <FlowContent v-else-if="module.content.type === 'flow'" :title="module.content.title" :top-row="module.content.topRow"
                        :groups="module.content.groups" />
                </div>
            </SecBox>
        </div>

        <!-- 能碳助手（内嵌于能力模块内） -->
        <div class="cap-assistant">
            <div class="cap-assistant-header">
                <img :src="icons.header" alt="能碳助手" />
                <span>能碳助手</span>
            </div>
            <div class="cap-assistant-body">
                <CarbonAssistant :greeting="module.assistant.greeting" :module-id="module.id" :ai-icon="icons.ai"
                    :person-icon="icons.person" />
            </div>
        </div>
    </div>
</template>

<script>
import PanelSelect from "./PanelSelect.vue";
import SecBox from "@/components/secBox.vue";
import DataCard from "@/components/card/data-card.vue";
import BarContent from "./BarContent.vue";
import ProgressContent from "./ProgressContent.vue";
import SegmentContent from "./SegmentContent.vue";
import FlowContent from "./FlowContent.vue";
import CarbonAssistant from "./CarbonAssistant.vue";

export default {
    name: "CapabilityPanel",
    components: {
        PanelSelect,
        SecBox,
        DataCard,
        BarContent,
        ProgressContent,
        SegmentContent,
        FlowContent,
        CarbonAssistant,
    },
    props: {
        modules: { type: Array, default: () => [] },
        value: { type: String, default: "" },
        icons: { type: Object, default: () => ({}) },
        // 由外部页面接管模块切换时隐藏内置下拉，避免出现两个模块选择器
        hideModuleSelect: { type: Boolean, default: false },
    },
    data() {
        return {
            filterValues: {},
        };
    },
    computed: {
        moduleNames() {
            return this.modules.map((m) => m.name);
        },
        module() {
            return this.modules.find((m) => m.id === this.value) || this.modules[0];
        },
        kpiGap() {
            const gap = this.module.kpiGap;
            return gap !== undefined ? gap : "0.8rem";
        },
        kpiPaddingLeft() {
            const paddingLeft = this.module.kpiPaddingLeft;
            return paddingLeft !== undefined ? paddingLeft : "0.5rem";
        },
    },
    watch: {
        module: {
            immediate: true,
            handler(m) {
                if (!m) return;
                const vals = {};
                m.filters.forEach((f) => {
                    vals[f.key] = f.options[0];
                });
                this.filterValues = vals;
            },
        },
    },
    methods: {
        onModuleChange(name) {
            const target = this.modules.find((m) => m.name === name);
            if (target) this.$emit("input", target.id);
        },
    },
};
</script>

<style lang="scss" scoped>
.capability-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    min-height: 0;
    gap: 1.5rem;
}

.cap-top {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    padding: 0.1rem 0 0 0rem;
}

.cap-primary {
    flex-shrink: 0;
}

.cap-subtitle {
    flex: 0 0 auto;
    padding-top: 1.3rem;

    // SecBox 内部默认 flex:1;overflow:auto 是给受限高度场景用的滚动兜底；
    // flex-basis:0% 在父级为 hug 高度时会让子级失去自然内容高度依据，这里改成按内容展示
    :deep(.sec-box-content) {
        flex: 0 0 auto;
        overflow: visible;
    }

    .cap-subtitle-text {
        font-size: var(--font-size-14);
        color: var(--color-primary);
        font-family: var(--font-family-primary-Bold); 
    }
}

.cap-filters {
    flex-shrink: 0;
    padding-top: 0.4rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 0.8rem;

    .cap-filter-item {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        width: calc(50% - 0.4rem);

        &.full {
            width: 100%;
        }
    }

    .cap-filter-label {
        font-size: px2rem(12);
        color: #DBF5FF;
        letter-spacing: 0em;
        font-family: var(--font-family-primary-Regular);
    }
}

.cap-kpis {
    flex-shrink: 0;
    padding-top: 1.2rem;
    padding-left: var(--cap-kpi-padding-left, 0.5rem);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.3rem 0.1rem;

    :deep(.cap-kpi-card) {
        gap: var(--cap-kpi-gap, 0.8rem);

        img {
            width: 3rem;
            height: 3rem;
            object-fit: contain;
        }
    }
}

.cap-content {
    padding: 0.8rem 0rem 0rem 0rem;

    // 只有柱状图需要固定高度：祖先链（.cap-top/.cap-subtitle/sec-box-content）都改成了 hug 内容高度，
    // echarts 的 height:100% 无法级联拿到像素高度，必须显式给出高度；
    // 其他内容类型（progress/segment/flow）不需要，按自身内容高度 hug 即可
    &.cap-content--bar {
        height: px2rem(170);
    }
}

.cap-assistant {
    flex: 1;
    min-height: 0;
    padding: 0.7rem 0.7rem 0.8rem;
    margin-bottom:0.6rem;
    border: px2rem(1) solid rgba(120, 150, 200, 0.3);
    border-radius: px2rem(6);
    background: rgba(18, 30, 54, 0.5);
    display: flex;
    flex-direction: column;
}

.cap-assistant-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.5rem;

    img {
        width: 1.3rem;
        height: 1.3rem;
        object-fit: contain;
    }

    span {
        font-size: px2rem(14);
        color: #9bf8ff;
        letter-spacing: 0px;
        font-family: var(--font-family-primary-Medium);
    }
}

.cap-assistant-body {
    flex: 1;
    min-height: 0;
}
</style>
