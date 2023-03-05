<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
    list: string[];
}>();

const emit = defineEmits<{
    (e: 'update:list', n: string[]): void;
}>();

const internalList = ref<string[]>([]);

internalList.value = props.list;

watch(props, (n) => {
    internalList.value = n.list;
});

function add(e: KeyboardEvent) {
    const inputEl = e.target as HTMLInputElement;
    internalList.value.push(inputEl.value);
    inputEl.value = '';
    emit('update:list', internalList.value);
}

function rm(index: number) {
    internalList.value.splice(index, 1);
    emit('update:list', internalList.value);
}
</script>

<template>
    <div class="string-list-editor">
        <div class="list">
            <div class="item" v-for="(item, index) in internalList">
                <input type="text" v-model="internalList[index]" />
                <button type="button" class="reset" @click="() => rm(index)">
                    x
                </button>
            </div>
        </div>
        <input
            class="add"
            type="text"
            placeholder="Add"
            @keypress.enter.prevent="add"
        />
    </div>
</template>

<style scoped lang="less">
.string-list-editor {
    max-height: 150px;
    height: 150px;
    display: flex;
    flex-direction: column;
    border: solid 2px @c-mirage;
    border-radius: 10px;
    margin-bottom: 10px;

    .list {
        flex: 1;
        overflow-y: scroll;
    }
    .add {
        border: none;
        border-top: 2px solid @c-mirage;
        padding: 4px 10px;
        background-color: transparent;
        color: @c-snow;
        font-size: 16px;

        &:focus {
            outline: none;
        }
    }
}

.item {
    display: flex;
    flex-direction: row;
    border: 2px solid transparent;
    height: 24px;
    align-items: stretch;
    border-radius: 5px;

    &:hover {
        background-color: fade(@c-mirage, 20%);
    }

    &:focus-within {
        background-color: fade(@c-mirage, 70%);
        border-color: @c-cyan;
    }

    input[type='text'] {
        flex: 1;
        background-color: transparent;
        border: 0;
        color: @c-snow;
        font-size: 16px;

        &:focus {
            outline: none;
        }
    }

    button {
        color: @c-mandy;
        aspect-ratio: 1;

        &:hover,
        &:focus {
            background-color: @c-mandy;
            outline: none;
            color: @c-mirage;
            border-radius: 3px;
        }
    }
}
</style>
