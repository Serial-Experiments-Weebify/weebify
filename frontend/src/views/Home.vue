<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
const auth = useAuthStore();

const greeting = computed(() => {
    let username = auth.me?.displayName ?? auth.me?.username;
    const h = new Date().getHours();
    const timeOfDay =
        h < 4
            ? 'evening'
            : h < 12
            ? 'morning'
            : h < 18
            ? 'afternoon'
            : 'evening';
    if (username) username = ', ' + username;
    else username = '';

    return `Good ${timeOfDay}${username}`;
});
</script>

<template>
    <main class="home">
        <h1>{{ greeting }}</h1>
        <h2>tuki suggestioni?</h2>
    </main>
</template>

<style scoped lang="less">
main {
    display: flex;
    flex-direction: column;
    align-items: stretch;

    h1,
    h2 {
        text-align: center;
    }
}
</style>
