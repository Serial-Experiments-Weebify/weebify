<script setup lang="ts">
import RebuildSearch from '@/components/Admin/RebuildSearch.vue';
</script>

<template>
    <div class="actions">
        <h2>Actions</h2>
        <div class="actions-list">
            <RebuildSearch index="user" />
            <RebuildSearch index="media" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.actions-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 10px;
    section {
        text-align: center;
        display: flex;
        flex-direction: column;
        background-color: @c-oil;
        padding: 10px;
        border-radius: 10px;
    }
}
</style>
