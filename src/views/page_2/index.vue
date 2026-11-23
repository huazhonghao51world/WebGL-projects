<template>
    <div class="page-2-container">
        <router-view></router-view>
        <div class="content-footer">
            <Footer></Footer>
        </div>
        <div v-if="showBackButton" class="back-button" :class="{ 'back-button--hidden': isPanelHidden }" @click="goBack">
            <img src="@images/back_icon.png" alt="返回" />
            <span>返回上一级</span>
        </div>
    </div>
</template>

<script>
import Footer from "@/layout/footer.vue";
import Layout from "@/layout/index.vue";
import { mapState } from "vuex";

export default {
    name: 'Page2Container',
    components: {
        Layout,
        Footer,
    },

    data() {
        return {

        };
    },

    computed: {
        ...mapState(['isPanelHidden']),
        showBackButton() {
            // 单图模式：/page_2/2 是首页，没有上一级可返回
            if (this.$route.path === '/page_2/2') return false;
            const path = this.$route.path;
            return path.includes('-device') || path.includes('-workshop') || 
                   (path.startsWith('/page_2/') && path !== '/page_2' && !path.includes('-'));
        }
    },

    mounted() {

    },

    methods: {
        goBack() {
            const path = this.$route.path;
            const from = this.$route.query.from;
            
            if (path.includes('-device')) {
                if (from === 'factory') {
                    const factoryPath = path.replace('-device', '');
                    this.$router.push(factoryPath);
                } else {
                    const workshopPath = path.replace('-device', '-workshop');
                    this.$router.push(workshopPath);
                }
            }
            else if (path.includes('-workshop')) {
                const pageNumber = path.match(/\/page_2\/(\d+)-workshop/)[1];
                this.$router.push(`/page_2/${pageNumber}`);
            }
            else if (path.startsWith('/page_2/') && !path.includes('-')) {
                this.$router.push('/page_1/1');
            }
        }
    },
};
</script>

<style lang="scss" scoped>
.page-2-container {
    width: 100%;
    height: 100%;
    position: relative;
}

.content-footer {
    position: absolute;
    top: 4.5%;
    width: 100%;
    z-index: 2;
}

.back-button {
    position: absolute;
    top: 7%;
    left: 21.5%;
    display: flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.5rem 0.8rem;
    background-image: url('~@/assets/images/back.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    border: none;
    cursor: pointer;
    z-index: 10;
    transition: transform 0.4s ease, opacity 0.4s ease;
    min-width: 114px;
    height: 32px;

    &.back-button--hidden {
        transform: translateX(-110%);
        opacity: 0;
        pointer-events: none;
    }

    img {
        width: 0.8rem;
        height: 0.8rem;
    }

    span {
        font-size: var(--font-size-14);
        color: rgba(246, 255, 255, 1);
        font-family: var(--font-family-primary-Regular);
    }

    &:hover {
        background-image: url('~@/assets/images/back_active.png');

        span {
            color: rgba(238, 248, 253, 1);
        }
    }

    &:active {
        transform: scale(0.98);
    }
}
</style>