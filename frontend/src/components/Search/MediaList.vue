<script setup lang="ts">
import MediaCard from '@/components/Media/MediaCard.vue';
</script>

<template>
    <ais-hits>
        <!-- eslint-disable vue/no-unused-vars -->
        <template v-slot="{ items, sendEvent }">
            <div class="ws-media-hits-list">
                <RouterLink
                    v-for="item in items"
                    :key="item.id"
                    :to="{ name: 'media', params: { id: item.id } }"
                >
                    <MediaCard :media="item" />
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
    grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));
}
</style>
