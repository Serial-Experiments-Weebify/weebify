<script setup lang="ts">
import UserCard from '../User/UserCard.vue';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { AisHits } from 'vue-instantsearch/vue3/es';
</script>

<template>
    <ais-hits>
        <!-- eslint-disable vue/no-unused-vars -->
        <template #default="{ items, sendEvent }">
            <div class="ws-media-hits-list">
                <RouterLink
                    v-for="item in items"
                    :key="item.id"
                    class="rl-no-fucking-text-decoration"
                    :to="{ name: 'user', params: { username: item.username } }"
                >
                    <UserCard :user="item" />
                </RouterLink>
            </div>
        </template>
    </ais-hits>
</template>

<style lang="less">
.ws-media-hits-list {
    list-style: none;
    display: grid;
    grid-gap: 0.5em;
    padding: 30px;
    grid-template-columns: repeat(auto-fill, minmax(14em, 1fr));
}
</style>
