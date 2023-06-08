<script setup lang="ts">
import '@/assets/datatable.less';

import { useRoute } from 'vue-router';
import { children as AdminSubroutes } from '@/router/admin';
import { computed } from 'vue';

const route = useRoute();

const selectedRoute = computed(() => {
    return route.matched[0].name;
});

const hasSubroute = computed(() => {
    return route.matched.length > 1;
});
</script>

<template>
    <main>
        <div class="sane-width manage-container">
            <div class="manage-sidebar">
                <h1>Admin</h1>
                <RouterLink
                    class="route"
                    v-for="rt in AdminSubroutes"
                    :class="{ active: rt.name === selectedRoute }"
                    :key="rt.name"
                    :to="{ name: rt.name }"
                >
                    {{ rt.meta.friendlyName }}
                </RouterLink>
            </div>
            <div class="manage-view" :class="{ empty: !hasSubroute }">
                <router-view v-if="hasSubroute"> </router-view>
                <span class="no-selection" v-else
                    >Select a category from the menu</span
                >
            </div>
        </div>
    </main>
</template>

<style scoped lang="less">
main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: stretch;
    height: 100%;
}

.manage-container {
    margin: 20px;
    display: flex;
    flex: 1;
    flex-direction: row;
    width: 100%;
    gap: 20px;

    .manage-view {
        background-color: @c-mirage;
        padding: 10px;
        border-radius: 10px;
        flex: 1;

        &.empty {
            display: flex;
            align-items: center;
            justify-content: center;
            .no-selection {
                color: @c-oil;
                font-size: 2rem;
                font-weight: bold;
            }
        }
    }
    .manage-sidebar {
        border-radius: 10px;

        background-color: @c-mirage;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        width: 200px;
        height: 100%;

        h1 {
            font-size: 1.5rem;
            margin: 10px;
            text-align: center;
        }

        .route {
            text-decoration: none;
            font-weight: 500;

            color: @c-snow;
            padding: 10px;
            transition: background-color @t-subtle ease, color @t-subtle ease;

            &:hover {
                background-color: fade(@c-cyan, 40%);
            }

            &.router-link-exact-active {
                color: @c-oil;
                background-color: @c-cyan;
            }
        }
    }
}
</style>
