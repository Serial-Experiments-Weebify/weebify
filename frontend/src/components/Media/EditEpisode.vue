<script setup lang="ts">
import { ref, onMounted } from 'vue';

import TextInput from '@/components/Forms/TextInput.vue';
import { useApolloClient } from '@vue/apollo-composable';
import { useNotificationStore } from '@/stores/notifications';
import { gql } from '@/_gql';
import { EpisodeStatus, type Episode } from '@/_gql/graphql';
import NumberInput from '../Forms/NumberInput.vue';

const apollo = useApolloClient();
const notify = useNotificationStore();

function emptyAsNull(a: string | null | undefined) {
    if (typeof a !== 'string') return null;
    let trimmed = a?.trim();
    if (trimmed.length == 0) return null;
    return trimmed;
}

const props = defineProps<{
    mId: string;
    episode: Omit<Episode, 'mediaId'>;
}>();

const emit = defineEmits<{
    (e: 'updated'): void;
}>();

const state = ref({
    title: '',
    extra: '',
    episodeN: 1,
    status: EpisodeStatus.Aired,
});

const UPDATE_EPISODE_MUT = gql(`
    mutation UpdateEpisode($mid: String!, $eid: String!, $ep: UpdateEpisode!) {
        updateEpisode(mediaId: $mid, episodeId: $eid, episode: $ep) {
            id
        }
    }
`);

const loading = ref(false);

async function addEpisode() {
    loading.value = true;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: UPDATE_EPISODE_MUT,
            variables: {
                mid: props.mId,
                eid: props.episode.id,
                ep: {
                    episodeNumber: state.value.episodeN,
                    episodeStatus: state.value.status,
                    title: state.value.title,
                    extra: emptyAsNull(state.value.extra),
                },
            },
        });

        if (errors) {
            //show error
            notify.addNotification(
                'error',
                errors[0].message ?? `Unknown error updating episode!`
            );
        } else if (data?.updateEpisode) {
            notify.addNotification('success', `Sucessfully updated episode`);
            emit('updated');
        }
    } catch {
        notify.addNotification('error', `Unknown error updating episode!`);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    state.value.episodeN = props.episode.episodeNumber;
    state.value.extra = props.episode.extra ?? '';
    state.value.status = props.episode.episodeStatus;
    state.value.title = props.episode.title;
});
</script>

<template>
    <form @submit.prevent="addEpisode">
        <NumberInput
            v-model:value="state.episodeN"
            required
            name="year"
            label="Episode:"
            :min="0"
            :max="10000"
            :step="1"
        />

        <TextInput
            type="text"
            name="title"
            required
            v-model:value="state.title"
            label="Title: "
        />

        <h5>Episode Status:</h5>
        <select class="w-select" v-model="state.status" required>
            <option :value="EpisodeStatus.Aired">Aired</option>
            <option :value="EpisodeStatus.Upcoming">Upcoming</option>
        </select>

        <TextInput
            type="text"
            name="anilist-id"
            v-model:value="state.extra"
            label="Extra label:"
        />

        <button class="w-big-button" :disabled="loading">Update</button>
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
