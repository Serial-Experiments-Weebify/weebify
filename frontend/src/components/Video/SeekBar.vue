<script setup lang="ts">
import { useMouse } from '@vueuse/core';
import { computed, ref } from 'vue';
import { secondsToHMS } from './time';

const seekbar = ref<HTMLDivElement>();

const props = defineProps<{
    currentTime: number;
    duration: number;
    buffered: [number, number][];
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
            class="buffer-section"
            v-for="(section, i) in bufferedSections"
            :key="i"
            :style="section"
        ></div>
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
