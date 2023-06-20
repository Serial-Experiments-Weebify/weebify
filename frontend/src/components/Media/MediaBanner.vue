<script setup lang="ts">
import { computed } from 'vue';
import type { SearchMedia } from '@/types';
import { useURLStore } from '@/stores/url';

const url = useURLStore();

const props = defineProps<{
    media: Pick<
        SearchMedia,
        'cover' | 'coverColor' | 'title' | 'id' | 'description'
    >;
}>();

const imageStyle = computed(() => {
    return {
        backgroundImage: ` url('${url.getCoverURL(
            'full',
            props.media.cover
        )}')`,
        backgroundColor: props.media.coverColor ?? '#888',
    };
});
</script>

<template>
    <div class="banner">
        <div class="content">
            <div class="cover" :style="imageStyle"></div>
            <div class="meta">
                <h1>{{ props.media.title }}</h1>
                <p>{{ props.media.description }}</p>
                <RouterLink
                    :to="{ name: 'media', params: { id: props.media.id } }"
                    class="watch w-huge-button"
                    >Watch</RouterLink
                >
            </div>
        </div>

        <div class="bg-layer" :style="imageStyle">
            <div class="l2"></div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.banner {
    width: 100%;
    aspect-ratio: 2;
    max-height: 50vh;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    background-color: @c-mirage;
}

.bg-layer {
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover !important;

    filter: blur(20px);
    .l2 {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        position: absolute;

        background-image: radial-gradient(
            ellipse at center,
            fade(@c-mirage, 0%) 40%,
            fade(@c-mirage, 100%) 80%
        );
    }
}

.content {
    z-index: 20;
    position: absolute;

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    padding: 20px;
    gap: 20px;

    display: flex;
    flex-direction: row;

    .cover {
        height: 100%;
        background-size: cover !important;
        border-radius: 10px;
        aspect-ratio: 2/3;
        box-shadow: @c-oil 0 0 10px;
    }
    .meta {
        display: flex;
        flex-direction: column;
        flex: 1;

        h1 {
            font-size: 36px;
            margin: 24px 0 12px 0;
            text-shadow: 0 0 4px @c-oil;
        }

        p {
            flex: 1;

            max-width: 1000px;

            font-size: 18px;
            font-weight: 500;
            text-shadow: 0 0 4px @c-oil;
        }
        .watch {
            width: fit-content;
            align-self: flex-end;
        }
    }
}
</style>
