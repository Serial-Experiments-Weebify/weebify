<script lang="ts" setup>
import StatusIcon from '@/icons/StatusIcon.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';

type NotifStatus = 'info' | 'warn' | 'error' | 'success';

const props = defineProps<{
    type: NotifStatus;
    text: string;
    duration: number;
}>();

const emit = defineEmits<{
    (e: 'done'): void;
}>();

const type2title: Record<NotifStatus, string> = {
    error: 'Error',
    warn: 'Warning',
    info: 'Info',
    success: 'Success',
};

let run = false;
let lastTime = Date.now();
const alive = ref(0);

function start() {
    run = true;
    lastTime = Date.now();
    window.requestAnimationFrame(update);
}

function stop() {
    run = false;
}

function update() {
    let now = Date.now();
    alive.value += now - lastTime;
    lastTime = now;
    if (alive.value > props.duration) {
        emit('done');
    }
    if (run) window.requestAnimationFrame(update);
}

onMounted(start);
onBeforeUnmount(stop);
</script>

<template>
    <div
        class="notification"
        :class="props.type"
        @mouseenter="stop"
        @mouseleave="start"
    >
        <StatusIcon class="icon" :type="props.type" />
        <p>
            <b>{{ type2title[props.type] }}</b>
            <br />
            {{ props.text }}
        </p>
        <div
            class="life"
            v-if="duration > alive"
            :style="{ width: `${((duration - alive) / duration) * 100}%` }"
        ></div>
    </div>
</template>

<style scoped lang="less">
.notification {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: @c-oil;
    border-radius: 5px;
    position: relative;
    overflow: hidden;
    padding: 5px;
    .icon {
        flex-shrink: 0;
    }

    p {
        b {
            font-weight: 600;
        }
        margin: 5px 0;
    }

    .life {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 5px;

        background-color: #0004;
    }

    &:hover {
        background-image: linear-gradient(#fff2, #fff2);
    }

    &.error {
        background-color: @c-mandy;
    }
    &.warn {
        background-color: @c-yellow;
    }
    &.info {
        background-color: @c-cyan;
    }

    &.success {
        background-color: @c-algae;
    }
}
</style>
