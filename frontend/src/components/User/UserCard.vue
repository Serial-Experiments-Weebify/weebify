<script setup lang="ts">
import { computed } from 'vue';
import type { SearchUser } from '@/types';
import RoleIcon from '@/icons/RoleIcon.vue';

const props = defineProps<{ user: SearchUser }>();

const imageStyle = computed(() => {
    return {
        background: `url('/cdn/weebify/pfp/${props.user.pfp}/tiny.webp')`,
    };
});
</script>

<template>
    <div class="user-card">
        <div class="pfp" :style="imageStyle">
            <RoleIcon class="br-small" :role="props.user.role" />
        </div>
        <div class="data">
            <span class="name"> {{ props.user.displayName }}</span>
            <span class="username"> {{ props.user.username }} </span>
        </div>
    </div>
</template>

<style lang="less" scoped>
.user-card {
    display: flex;
    flex-direction: row;
    aspect-ratio: 4;
    gap: 10px;
    padding: 4px;
    border-radius: 10px;
    transition: background-color @t-subtle ease;

    &:hover {
        background-color: fade(@c-cyan, 70%);
        .pfp {
            transform: scale(110%);
        }
    }

    .pfp {
        position: relative;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-size: cover;
        background-color: @c-oil !important;
        transition: transform @t-subtle ease;

        .br-small {
            position: absolute;
            right: 0;
            bottom: 0;
            width: 24px;
            height: 24px;
        }
    }

    .data {
        span {
            display: block;
            text-decoration: none !important;
            color: @c-snow;
            font-weight: 500;
        }

        .name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 3px;
        }
    }
}
</style>
