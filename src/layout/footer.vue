<!-- src/layout/footer.vue -->
<template>
    <div class="footer">
        <div class="nav nav-left">
            <NavItem v-for="(item) in navListLeft" :key="item.id" :item="item" @jumpNav="jumpNav"></NavItem>
        </div>
        <div class="nav-center">
            <slot name="title"></slot>
        </div>
        <div class="nav nav-right">
            <NavItem v-for="(item) in navListRight" :key="item.id" :item="item" @jumpNav="jumpNav"></NavItem>
        </div>
    </div>
</template>
<script>

import NavItem from "@components/header/navItem-header.vue"
import Setting from "@components/header/setting/index.vue"
import { mapState } from "vuex";
export default {
    name: 'Footer',
    components: {
        NavItem,
        Setting
    },
    data() {
        return {
            // 单图模式（灯塔工厂）：底部导航只保留「智能生产」，其余菜单暂时隐藏
            navList: [
                {
                    name: "智能生产",
                    id: 2,
                    isActive: true,
                    path: "/page_2/2"
                },
            ],
            /* 单图模式：隐藏的菜单
            navListHidden: [
                {
                    name: "综合态势",
                    id: 1,
                    isActive: true,
                    path: "/page_2/1"
                },
                {
                    name: "智能仓储",
                    id: 3,
                    isActive: false,
                    path: "/page_2/3"
                },
                {
                    name: "产品管理",
                    id: 4,
                    isActive: false,
                    path: "/page_2/4"
                },
                {
                    name: "设备管理",
                    id: 5,
                    isActive: false,
                    path: "/page_2/5"
                },
                {
                    name: "能源管理",
                    id: 6,
                    isActive: false,
                    path: "/page_2/6"
                },
                {
                    name: "环境管理",
                    id: 7,
                    isActive: false,
                    path: "/page_2/7"
                },
                {
                    name: "应急安防",
                    id: 8,
                    isActive: false,
                    path: "/page_2/8"
                }
            ],
            */

            currentNav: {
                id: null
            }
        }
    },

    mounted() {
        //通过当前路由地址匹配当前导航选中状态
        this.updateActiveNav();
    },
    
    watch: {
        '$route'(to, from) {
            this.updateActiveNav();
        }
    },
    computed: {
        ...mapState(["isSceneAlready"]),
        navListLeft() {
            return this.navList.slice(0, 4);
        },
        navListRight() {
            return this.navList.slice(4);
        }
    },

    methods: {
        updateActiveNav() {
            const currentPath = this.$route.path;
            
            this.navList.forEach((item) => {
                if (currentPath === item.path || currentPath.startsWith(item.path + '-')) {
                    item.isActive = true;
                } else {
                    item.isActive = false;
                }
            });
        },

        jumpNav(route) {

            if (!this.currentNav.id || this.currentNav.id !== route.id) {
                this.navList = this.navList.map(item => ({
                    ...item,
                    isActive: item.id === route.id
                }));

                this.$router.push(route.path);

                this.currentNav = route

                if (this.isSceneAlready) {
                    if (route.id == 1) {
                        // addPOI()
                    }
                }
            }
        }
    }

};
</script>

<style lang="scss" scoped>
.footer {
    position: absolute;
    bottom: 40%;
    left: 50%;
    transform: translateX(-50%);
    width: 60.9%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0.5rem;

    .nav {
        color: #B5CAD4;
        font-family: var(--font-family-primary-Regular);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;

        div {
            width: 18%;
            aspect-ratio: 250 / 58;
        }
    }

    .nav-left {
        justify-content: flex-start;
        flex: 1;
        padding-right: 2rem;
    }

    .nav-center {
        min-width: 20%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 3rem;
    }

    .nav-right {
        justify-content: flex-end;
        flex: 1;
        padding-left: 0rem;
    }
}
</style>