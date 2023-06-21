<script setup lang="ts">
defineProps<{
    fullscreen: boolean;
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
            v-if="fullscreen"
            d="M333-200v-133H200v-60h193v193h-60Zm234 0v-193h193v60H627v133h-60ZM200-567v-60h133v-133h60v193H200Zm367 0v-193h60v133h133v60H567Z"
        />
        <path
            v-else
            d="M200-200v-193h60v133h133v60H200Zm0-367v-193h193v60H260v133h-60Zm367 367v-60h133v-133h60v193H567Zm133-367v-133H567v-60h193v193h-60Z"
        />
    </svg>
</template>
