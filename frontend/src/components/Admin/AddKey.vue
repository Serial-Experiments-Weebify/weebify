<script setup lang="ts">
import { ref, onMounted } from 'vue';

import TextInput from '@/components/Forms/TextInput.vue';
import { useApolloClient } from '@vue/apollo-composable';
import { useNotificationStore } from '@/stores/notifications';
import { gql } from '@/_gql';
import { useClipboard } from '@vueuse/core';

const apollo = useApolloClient();
const notify = useNotificationStore();
const { copy } = useClipboard();

const emit = defineEmits<{
    (e: 'updated'): void;
}>();

const state = ref({
    name: '',
});

const CREATE_KEY_MUT = gql(`
    mutation CreateKey($name: String!) {
        createAPIKey(name: $name) {
            id,
            name,
            key
        }
    }
`);

const loading = ref(false);

async function addKey() {
    loading.value = true;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: CREATE_KEY_MUT,
            variables: {
                name: state.value.name,
            },
        });

        if (errors) {
            //show error
            notify.addNotification(
                'error',
                errors[0].message ?? `Unknown error adding the API key!`
            );
        } else if (data?.createAPIKey) {
            copy(data.createAPIKey.key);
            notify.addNotification(
                'warn',
                `Key should be in clipboard, but just in case: ${data.createAPIKey.key} This is the only time you can see it!`
            );

            emit('updated');
        }
    } catch {
        notify.addNotification('error', `Unknown error adding the API key!`);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {});
</script>

<template>
    <form @submit.prevent="addKey">
        <TextInput
            type="text"
            v-model:value="state.name"
            label="Key name"
            name="name"
            required
        />

        <button class="w-big-button" :disabled="loading">Add</button>
    </form>
</template>

<style scoped lang="less">
h5 {
    font-size: 18px;
    line-height: 22px;
    font-weight: 500;
    margin: 0;
}
</style>
