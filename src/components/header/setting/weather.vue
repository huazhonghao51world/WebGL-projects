<!-- src/components/Layout.vue -->
<template>
    <div class="weather">
        <img src="@images/layout/header-weather.png" alt="">
        <div class="weather-info">
            <span>25℃</span>
            <span class="temperature">晴</span>
        </div>
    </div>
</template>

<script>

// import navItem from "@components/header/navItem.vue"

export default {
    name: 'weather',
    components: {

    },
    data() {
        return {

        }
    },

    mounted() {

    },

    methods: {


    }

};
</script>

<style lang="scss" scoped>
.weather {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.3rem;

    img {
        width: 1.5rem;
        height: 1.5rem;
        // margin-right: 5%;
    }

    .weather-info {
        display: flex;
        justify-content: center;
        align-items: center;

        span {
            font-size: var(--font-size-12);
            font-family: var(--font-family-primary-Medium);
            margin-left: 0.3rem;
            color: var(--color-secondary);

        }
    }


    .temperature {
        font-size: var(--font-size-16);
        font-family: var(--font-family-primary-Bold);
        color: var(--color-primary);
        letter-spacing: 0.25em;
    }

    span {
        color: var(--color-desc);
    }
}
</style>