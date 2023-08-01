<script setup lang="ts">
import { reactive, ref } from 'vue';

import { useApolloClient } from '@vue/apollo-composable';
import { useNotificationStore } from '@/stores/notifications';
import { gql } from '@/_gql';
import { EpisodeStatus } from '@/_gql/graphql';
import NumberInput from '../Forms/NumberInput.vue';

const apollo = useApolloClient();
const notify = useNotificationStore();

const props = defineProps<{
    id: string;
}>();

const emit = defineEmits<{
    (e: 'updated'): void;
}>();

const state = reactive({
    nEpisodes: 12,
    status: EpisodeStatus.Aired,
});

const QUICK_FILL_MUT = gql(`
    mutation QuickFill($mid: String!, $count: Int!, $status: EpisodeStatus!) {
        quickFill(mediaId: $mid, count: $count, status: $status) {
            id
        }
    }
`);

const loading = ref(false);

async function createMedia() {
    loading.value = true;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: QUICK_FILL_MUT,
            variables: {
                mid: props.id,
                count: state.nEpisodes,
                status: state.status,
            },
        });

        if (errors) {
            //show error
            notify.addNotification(
                'error',
                errors[0].message ?? `Unknown error quickfilling episodes`
            );
        } else if (data?.quickFill.id) {
            notify.addNotification(
                'info',
                `Sucessfully created ${state.nEpisodes} episodes`
            );
            emit('updated');
        }
    } catch {
        notify.addNotification('error', `Unknown error quickfilling episodes`);
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <form @submit.prevent="createMedia">
        <NumberInput
            v-model:value="state.nEpisodes"
            required
            name="year"
            label="Number of episodes:"
            :min="0"
            :max="10000"
            :step="1"
        />

        <h5>Episode Status:</h5>
        <select v-model="state.status" class="w-select" required>
            <option :value="EpisodeStatus.Aired">Aired</option>
            <option :value="EpisodeStatus.Upcoming">Upcoming</option>
        </select>
        <p class="alert">Note: Quickfill will clear all existing episodes.</p>
        <button class="w-big-button" :disabled="loading">Fill</button>
    </form>
</template>

<style scoped lang="less">
h5 {
    font-size: 18px;
    line-height: 22px;
    font-weight: 500;
    margin: 0;
}
p.alert {
    border: 2px solid @c-mandy;
    background-color: fade(@c-mandy, 50%);
    padding: 10px;
    border-radius: 10px;
    font-weight: 500;
}
</style>
