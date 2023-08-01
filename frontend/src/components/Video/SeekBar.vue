<script setup lang="ts">
import { computed, ref } from 'vue';
import { secondsToHMS } from './time';
import type { VideoChapter } from '@/_gql/graphql';

const seekbar = ref<HTMLDivElement>();

const props = defineProps<{
    currentTime: number;
    duration: number;
    buffered: [number, number][];
    chapters: VideoChapter[];
}>();

const cursorStyle = computed(() => ({
    left: `${(props.currentTime / props.duration) * 100}%`,
}));

const bufferedSections = computed(() =>
    props.buffered.map(([start, end]) => ({
        left: `${(start / props.duration) * 100}%`,
        width: `${((end - start) / props.duration) * 100}%`,
    }))
);

const chapterSections = computed(() =>
    props.chapters.map(({ start, end, title }) => ({
        style: {
            left: `${(start / props.duration) * 100}%`,
            width: `${((end - start) / props.duration) * 100}%`,
        },
        title,
    }))
);

const mx = ref(0);
const ew = ref(100);

const emit = defineEmits<{
    (e: 'update:currentTime', value: number): void;
}>();

const hoverTime = computed(() => {
    return secondsToHMS((mx.value / ew.value) * props.duration);
});

function cursorPositon(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const w = (ew.value = rect.width);
    const x = (mx.value = e.clientX - rect.left);

    if (!(e.buttons & 1)) return;

    const clampedTime = Math.max(
        0,
        Math.min((x / w) * props.duration, props.duration)
    );

    emit('update:currentTime', clampedTime);
}
</script>

<template>
    <div
        ref="seekbar"
        class="seekbar"
        @mousedown="cursorPositon"
        @mousemove="cursorPositon"
    >
        <div
            v-for="(section, i) in bufferedSections"
            :key="i"
            class="buffer-section"
            :style="section"
        ></div>
        <div
            v-for="(ch, i) in chapterSections"
            :key="i"
            class="chapter"
            :style="ch.style"
        >
            <span>{{ ch.title }}</span>
        </div>
        <div class="cursor" :style="cursorStyle"></div>
        <div class="time-popup" :style="{ left: `${mx}px` }">
            {{ hoverTime }}
        </div>
    </div>
</template>

<style scoped lang="less">
.seekbar {
    position: relative;
    height: 10px;
    background-color: #333;
}

.buffer-section {
    position: absolute;
    top: 0;
    bottom: 0;
    pointer-events: none;
    background-color: fade(@c-algae, 20%);
}

.chapter {
    z-index: 100;
    position: absolute;
    top: 0;
    bottom: 0;
    pointer-events: auto;

    border-left: 1px solid @c-snow;
    border-right: 1px solid @c-snow;

    &:hover > span {
        opacity: 1;
    }

    span {
        font-size: 12px;
        word-break: break-all;

        opacity: 0;
        transition: opacity 0.2s ease;
        color: @c-snow;
        background-color: #0008;
        border-radius: 3px;

        position: absolute;
        left: 0;
        right: 0;
        bottom: 500%;
        text-align: center;
    }
}

.cursor {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    transform: translateX(-50%);

    background-color: red;
    cursor: pointer;
    &:hover {
        top: -2px;
        bottom: -2px;
    }

    z-index: 10;
}

.seekbar:hover .time-popup:not(:hover) {
    opacity: 1;
    top: -30px;
    pointer-events: none;
    user-select: none;
}

.time-popup {
    position: absolute;
    top: 0px;
    opacity: 0;
    left: 0;
    transform: translateX(-50%);
    padding: 4px 8px;
    border-radius: 4px;
    background-color: #3338;
    color: white;
    font-size: 12px;
    font-weight: bold;
    z-index: 10;
    transition: opacity 0.2s ease, top 0.2s ease;
    pointer-events: none;
    user-select: none;
}
</style>
