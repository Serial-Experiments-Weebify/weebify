<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications';
import { computed, ref } from 'vue';
import WeebifyPopup from '../WeebifyPopup.vue';
import { useAuthStore } from '@/stores/auth';

const notify = useNotificationStore();
const auth = useAuthStore();

const busy = ref(false);
const showConfirm = ref(false);
const filesToDelete = ref<string[]>([]);

async function dryRun() {
    try {
        filesToDelete.value = [];
        busy.value = true;

        const response = await fetch('/api/media/video/clean', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        });

        const json = await response.json();
        if (response.status != 200) throw new Error();

        filesToDelete.value = json.keys;

        if (filesToDelete.value.length == 0) {
            notify.addNotification('info', 'No files to delete');
        } else {
            showConfirm.value = true;
        }
    } catch (e) {
        console.error(e);
        notify.addNotification('error', 'Failed to clean videos');
    } finally {
        busy.value = false;
    }
}

const deleting = ref(false);

async function deleteFiles() {
    try {
        deleting.value = true;

        const response = await fetch('/api/media/video/clean/delete', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        });

        const json = await response.json();
        if (response.status != 200) throw new Error();

        const deleted = (json.keys as string[]).length;

        notify.addNotification('success', `Deleted ${deleted} files`);
    } catch {
        notify.addNotification('error', 'Failed to delete videos');
    } finally {
        deleting.value = false;
        showConfirm.value = false;
    }
}

const niceDeleteList = computed(() => {
    return filesToDelete.value.join('\n');
});
</script>

<template>
    <section>
        <h3>Clean Media</h3>
        <p class="desc">Removes all S3 objects for deleted videos.</p>
        <button
            class="w-big-button w-button-red btn-load-overlay"
            :disabled="busy"
            @click="dryRun"
        >
            Clean
        </button>

        <WeebifyPopup v-model:show="showConfirm" title="Confirm delete">
            <pre class="arr">{{ niceDeleteList }}</pre>

            <button
                class="w-medium-button w-button-red btn-load-overlay fr"
                :disabled="deleting"
                @click="deleteFiles"
            >
                Delete
            </button>
        </WeebifyPopup>
    </section>
</template>

<style lang="less" scoped>
button {
    float: right;
}

pre.arr {
    overflow: auto;
    max-width: 50vh;
    max-height: 50vh;

    color: @c-mandy;
    background-color: @c-mirage;
    border: 1px solid @c-clay;
    padding: 10px;
    border-radius: 10px;
}
</style>
