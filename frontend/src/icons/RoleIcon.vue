<script setup lang="ts">
const props = defineProps<{
    role: 'USER' | 'LEGENDARY_MEMBER' | 'MODERATOR' | 'ADMIN' | 'GOD';
}>();
</script>

<template>
    <svg
        v-if="props.role == 'GOD'"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        title="God"
    >
        <rect width="32" height="32" rx="16" fill="#8CE6B0" />
        <path
            d="M9 22L4 16L8.99994 10M23 22L28 16L23.0001 10M13.5 23.5L18.5 8.5"
            stroke="#262440"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
    <svg
        v-else-if="props.role == 'ADMIN'"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        title="Admin"
    >
        <rect width="32" height="32" rx="16" fill="#E35E6E" />
        <path
            d="M15.0752 5.24799C15.415 4.42193 16.585 4.42193 16.9248 5.24799L19.3823 11.2217C19.5254 11.5695 19.8515 11.8076 20.2263 11.838L26.6247 12.3566C27.5083 12.4282 27.8687 13.5289 27.1986 14.1093L22.3076 18.3451C22.0263 18.5887 21.9036 18.9684 21.989 19.3306L23.4804 25.6519C23.685 26.5188 22.7396 27.2004 21.9818 26.7324L16.5254 23.363C16.2034 23.1641 15.7966 23.1641 15.4746 23.363L10.0183 26.7324C9.26043 27.2004 8.31503 26.5188 8.51955 25.6519L10.011 19.3306C10.0964 18.9684 9.97369 18.5887 9.69237 18.3451L4.80143 14.1093C4.13133 13.5289 4.49174 12.4282 5.37531 12.3566L11.7737 11.838C12.1485 11.8076 12.4746 11.5695 12.6177 11.2217L15.0752 5.24799Z"
            fill="#FDFEF8"
        />
    </svg>
    <svg
        v-else-if="props.role == 'MODERATOR'"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        title="Moderator"
    >
        <rect width="32" height="32" rx="16" fill="#FFC107" />
        <path
            d="M7.36369 18.8847L2.00439 13.5254L14.0252 1.50458L19.3843 6.86362L14.0417 12.2062L18.9528 16.2269L26.0984 23.3725L23.8723 25.5986L16.7267 18.4529L12.706 13.5419L7.36369 18.8847Z"
            fill="#FDFEF8"
        />
    </svg>
    <svg
        v-else-if="props.role == 'LEGENDARY_MEMBER'"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        title="Legendary Member"
    >
        <rect width="32" height="32" rx="16" fill="#4BBBEF" />
        <path
            d="M9.5 18.939L16 25.439L22.5 18.939M8 13.9395C8 7.43979 16 7.43946 16 13.4395C16 7.43946 24 7.4392 24 13.9395"
            stroke="#262440"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
    <svg
        v-else
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        title="User"
    >
        <rect width="32" height="32" rx="16" fill="#FDFEF8" />
        <path
            d="M10 10C10 12.6674 10 18.9732 10 18.9732C10 22.3017 12.6863 25 16 25C19.3137 25 22 22.3017 22 18.9732V10"
            stroke="#262440"
            stroke-width="3"
            stroke-linecap="round"
        />
    </svg>
</template>
