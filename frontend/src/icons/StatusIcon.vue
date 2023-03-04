<script setup lang="ts">
const props = defineProps<{
    type: 'info' | 'warn' | 'error';
}>();
</script>

<template>
    <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        v-if="type == 'info'"
    >
        <circle cx="24" cy="24" r="17" stroke="#14131C" stroke-width="2" />
        <path
            d="M21.5 20H24V32.5H26.5M23.5 15H24.5V16H23.5V15Z"
            stroke="#14131C"
            stroke-width="2"
        />
    </svg>
    <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        v-else-if="type == 'warn'"
    >
        <path
            d="M24 18V29.5M23.5 32.5H24.5V33.5H23.5V32.5Z"
            stroke="#14131C"
            stroke-width="2"
        />
        <path
            d="M41.195 35.5292L26.6147 9.60867C25.4678 7.56971 22.5322 7.56973 21.3853 9.60868L6.80497 35.5292C5.68007 37.529 7.12521 40 9.41969 40H38.5803C40.8748 40 42.3199 37.529 41.195 35.5292Z"
            stroke="#14131C"
            stroke-width="2"
        />
    </svg>
    <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        v-else
    >
        <path d="M17 17L31 31M31 17L17 31" stroke="#14131C" stroke-width="2" />
        <path
            d="M30.2132 7L17.7868 7C17.2564 7 16.7477 7.21071 16.3726 7.58579L7.58579 16.3726C7.21071 16.7477 7 17.2564 7 17.7868L7 30.2132C7 30.7436 7.21071 31.2523 7.58579 31.6274L16.3726 40.4142C16.7477 40.7893 17.2564 41 17.7868 41H30.2132C30.7436 41 31.2523 40.7893 31.6274 40.4142L40.4142 31.6274C40.7893 31.2523 41 30.7436 41 30.2132L41 17.7868C41 17.2564 40.7893 16.7477 40.4142 16.3726L31.6274 7.58579C31.2523 7.21071 30.7436 7 30.2132 7Z"
            stroke="#14131C"
            stroke-width="2"
        />
    </svg>
</template>
