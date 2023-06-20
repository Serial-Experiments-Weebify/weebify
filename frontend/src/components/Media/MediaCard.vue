<script setup lang="ts">
import { computed } from 'vue';
import type { SearchMedia } from '@/types';
import { useURLStore } from '@/stores/url';

const url = useURLStore();

const props = defineProps<{
    media: Pick<SearchMedia, 'cover' | 'coverColor' | 'title'>;
}>();

const imageStyle = computed(() => {
    return {
        background: `url('${url.getCoverURL('full', props.media.cover)}')`,
        backgroundColor: props.media.coverColor ?? '#888',
    };
});
</script>

<template>
    <div class="media" :style="imageStyle">
        <div class="title-container">
            <span class="title">{{ media.title }}</span>
        </div>
        <!-- <div class="status" :class="[media.status.toLowerCase()]"></div> -->
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

.title-container {
    padding: 0.5em;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: fade(@c-oil, 90%);
}

.media .title {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;

    color: @c-snow;
    font-weight: 500;
}

.media > .status {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 15px;
    height: 15px;
    border-radius: 1000px;

    background-color: @c-clay;
    box-shadow: 0 0 4px 2px #000c;

    &.finished {
        background-color: @c-algae;
        box-shadow: 0 0 4px 2px fade(@c-algae, 75%);
    }
    &.airing {
        background-color: @c-mandy;
        box-shadow: 0 0 4px 2px fade(@c-mandy, 75%);
    }
}

.media:hover {
    transition: 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
    box-shadow: 0 0 1rem 1rem #0008;
    z-index: 10;
    transform: scale(1.1);
}
.media:hover .title {
    transition: 0.2s linear;
    color: @c-cyan;
}
</style>
