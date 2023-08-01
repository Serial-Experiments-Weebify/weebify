<script setup lang="ts">
const props = defineProps<{
    title: string;
    show: boolean;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'update:show', show: boolean): void;
}>();

function close() {
    emit('update:show', false);
    emit('close');
}
</script>

<template>
    <Teleport v-if="props.show" to="#popups">
        <div class="popup-blur">
            <div class="popup sane-width">
                <h3 class="title">{{ props.title }}</h3>
                <button class="close" @click="close">X</button>
                <div class="popup-content">
                    <slot></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped lang="less">
.popup-blur {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    background-color: fade(@c-mirage, 50%);
    backdrop-filter: blur(2px);

    z-index: 150;

    display: grid;
    place-items: center;
}

.popup {
    background-color: @c-oil;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    grid-template-areas: 'title close' 'main main';
    min-width: 300px;
    gap: 5px;

    padding: 10px;
    border-radius: 10px;

    .title {
        grid-area: title;
    }
    .close {
        grid-area: close;
        outline: none;
        border: none;
        background-color: transparent;
        color: @c-mandy;
        cursor: pointer;
        font-weight: bold;

        &:hover {
            color: @c-snow;
        }
        &:focus,
        &:active {
            outline: 1px solid @c-mandy;
        }
    }
    .popup-content {
        padding: 0 10px;
        grid-area: main;
        max-height: 80vh;
        overflow: auto;
        :deep(& > :first-child) {
            margin-top: 0;
        }
    }
}
</style>
