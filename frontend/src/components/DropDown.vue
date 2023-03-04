<script lang="ts" setup>
import { ref } from 'vue';

const popupVisible = ref(false);

function toggle() {
    popupVisible.value = !popupVisible.value;
}
</script>
<template>
    <button @click="toggle" class="dropdown" :class="{ show: popupVisible }">
        <slot></slot>
        <div class="popup">
            <slot name="popup"></slot>
        </div>
    </button>
</template>

<style lang="less" scoped>
.dropdown {
    border: none;
    background-color: transparent;
    border: 2px solid transparent;
    border-bottom: none;
    position: relative;
    padding: 2px 5px;
    transition: all ease @t-subtle;
    box-sizing: content-box;
    cursor: pointer;

    // outline: none;
    .popup {
        padding-top: 5px;
        border-radius: 0 0 10px 10px;
        z-index: 300;
        flex-direction: column;
        opacity: 100%;
        width: 100%;
        position: absolute;
        top: 100%;
        left: -2px;
        box-sizing: content-box;
        border: 2px solid @c-clay;
        border-top: none;
        background-color: @c-oil;
        opacity: 0;
        transition: opacity ease @t-subtle, visibility @t-subtle 0s;
        display: flex;
        visibility: hidden;
        cursor: default;
        outline: none;

        & > :deep(*) {
            margin-left: 5px;
            margin-right: 5px;
        }
    }

    &.show {
        border-radius: 10px 10px 0 0;

        .popup {
            visibility: visible;
            opacity: 1;
        }
        border: 2px solid @c-clay;
        border-bottom: none;
        background-color: @c-oil;
    }
}
</style>
