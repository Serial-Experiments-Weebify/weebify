<script setup lang="ts">
const props = defineProps<{
    playing: boolean;
}>();
</script>

<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        height="36"
        viewBox="0 -960 960 960"
        width="36"
    >
        <path
            v-if="props.playing"
            d="M555-200v-560h175v560H555Zm-325 0v-560h175v560H230Z"
        />
        <path v-else d="M320-203v-560l440 280-440 280Z" />
    </svg>
</template>
