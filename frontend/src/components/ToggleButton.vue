<script setup lang="ts">
const props = defineProps<{ value: boolean }>();
const emits = defineEmits<{ (e: 'update:value', value: boolean): void }>();

const toggle = () => {
    emits('update:value', !props.value);
};
</script>

<template>
    <button
        class="toggle-button"
        :class="props.value ? 'on' : 'off'"
        @click="toggle"
    >
        <div class="thing"></div>
    </button>
</template>

<style scoped lang="less">
.toggle-button.on {
    background-color: @c-algae;
    .thing {
        transform: translate(24px, 0);
    }
}

.toggle-button.off {
    background-color: @c-mandy;
    .thing {
        transform: translate(4px, 0);
    }
}

.toggle-button {
    vertical-align: middle;
    display: inline-block;
    background-color: @c-mandy;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 0;

    width: 48px;
    height: 24px;
    border-radius: 12px;
    transition: background-color @t-subtle ease;
    box-shadow: inset 0 0 5px fade(@c-oil, 50%);

    .thing {
        transition: transform @t-subtle ease;
        width: 16px;
        height: 16px;
        border-radius: 8px;
        background-color: @c-snow;
        box-shadow: 0 0 5px fade(@c-oil, 50%);
    }
}
</style>
