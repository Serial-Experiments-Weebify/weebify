<script setup lang="ts">
import NewMedia from '@/components/Media/NewMedia.vue';
import Popup from '@/components/Popup.vue';
import { useAuthStore } from '@/stores/auth';
import { computed, ref } from 'vue';
const auth = useAuthStore();

const showNew = ref(false);
</script>

<template>
    <main class="home">
        <h1>Browse media</h1>
        <button class="w-medium-button" @click="() => (showNew = true)">
            Add media
        </button>

        <Popup v-model:show="showNew" title="Add media">
            <NewMedia />
        </Popup>
    </main>
</template>

<style scoped lang="less">
main {
    display: flex;
    flex-direction: column;
    align-items: stretch;

    h1,
    h2 {
        text-align: center;
    }
}
</style>
