<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications';
import { ref, computed } from 'vue';

const fileInputElement = ref<HTMLInputElement | null>(null);

const props = defineProps<{
    formats: string[];
    maxSizeMib: number;
    enabled: boolean;
}>();

const emit = defineEmits<{
    (e: 'file', f: File): void;
}>();

const accept = computed(() => props.formats.join(', '));
const fileText = ref<string | null>();

const notify = useNotificationStore();

function checkFile(file: File) {
    const ext = file.name.split('.').pop() ?? 'invalid';
    if (!props.formats.includes(ext))
        return notify.addNotification('error', 'Wrong file format');

    if (file.size > props.maxSizeMib * (1 << 20))
        return notify.addNotification('error', 'File too large');

    return true;
}

function gotFile() {
    let file = fileInputElement.value?.files?.item(0);

    if (!file || !checkFile(file)) {
        fileText.value = null;
    } else {
        fileText.value = `${file.name} (${(file.size / (1 << 20)).toFixed(
            2
        )} MiB)`;
        emit('file', file);
    }
}
</script>

<template>
    <div class="file-drop" :class="{ disabled: !enabled }">
        <span class="bt"> Drop a file or click here </span>
        <span class="st" v-if="!fileText">
            <slot></slot>
        </span>
        <span class="st" v-else>
            {{ fileText }}
        </span>
        <input
            ref="fileInputElement"
            type="file"
            title=""
            :accept="accept"
            :disabled="!enabled"
            @input="gotFile"
        />
    </div>
</template>

<style lang="less" scoped>
.file-drop {
    display: block;
    color: @c-clay;
    border: @c-clay dashed 2px;
    border-radius: 10px;
    cursor: pointer;
    position: relative;

    &:not(.disabled):hover {
        transition: @t-subtle ease;
        color: @c-cyan;
        border-color: @c-cyan;
    }

    &.disabled {
        opacity: 0.7;
    }

    span {
        margin: 20px;
    }
    .bt {
        display: block;
        font-size: 22px;
        font-weight: bold;
    }

    .st {
        display: block;
        font-size: 16px;
    }

    input {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;

        cursor: pointer;
    }
}
</style>
