<script setup lang="ts">
import { computed } from 'vue';
import type { SearchMedia } from '@/types';
import { MediaKind } from '@/_gql/graphql';

const props = defineProps<{ media: SearchMedia }>();

const imageStyle = computed(() => {
    return {
        background: `url('/cdn/cover/${props.media.cover}/thumb.webp')`,
        backgroundColor: props.media.coverColor ?? '#888',
    };
});

function gotoMedia() {}
</script>

<template>
    <div class="media" :style="imageStyle" @click="gotoMedia">
        <span class="title">{{ media.title }}</span>
        <span class="se-number" v-if="media.kind == MediaKind.Tv">{{
            media.episodes
        }}</span>
    </div>
</template>

<style lang="less" scoped>
.media {
    aspect-ratio: 0.66;
    min-height: 100px;
    position: relative;
    overflow: hidden;
    display: flex;
    border-radius: 0.5em;
    background-size: cover !important;
    display: flex;
}
.media > .title {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;

    padding: 0.5em;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #000c;
    text-overflow: ellipsis;
    color: @c-snow;
    font-weight: 500;
}

.media > .se-number {
    padding: 0.5em;
    position: absolute;
    top: 0;
    right: 0;
    border-bottom-left-radius: 1em;
    background-color: #000c;
    /* backdrop-filter: blur(4px); */
    color: @c-snow;
    border: 2px solid @c-cyan;
    border-top: none;
    border-right: none;
}

.media:hover {
    transition: 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
    box-shadow: 0 0 1rem 1rem #0008;
    z-index: 10;
    transform: scale(1.3);
}
.media:hover > .title {
    transition: 0.2s linear;
    color: @c-cyan;
}
</style>
