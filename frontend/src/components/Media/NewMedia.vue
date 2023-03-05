<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';

import TextInput from '@/components/Forms/TextInput.vue';
import TextareaInput from '@/components/Forms/TextareaInput.vue';
import GetFile from '@/components/Forms/GetFile.vue';
import { useApolloClient } from '@vue/apollo-composable';
import { useNotificationStore } from '@/stores/notifications';
import { useAuthStore } from '@/stores/auth';
import { gql } from '@/_gql';
import { MediaKind, MediaStatus } from '@/_gql/graphql';
import StringListEditorVue from '@/components/Forms/StringListEditor.vue';
import NumberInput from '../Forms/NumberInput.vue';
import { useRouter } from 'vue-router';

const apollo = useApolloClient();
const notify = useNotificationStore();
const router = useRouter();

function emptyAsNull(a: string | null | undefined) {
    if (typeof a !== 'string') return null;
    let trimmed = a?.trim();
    if (trimmed.length == 0) return null;
    return trimmed;
}

const state = ref({
    title: '',
    description: '',
    anilistId: '',
    genres: [] as string[],
    kind: MediaKind.Tv,
    year: new Date().getFullYear(),
    status: MediaStatus.Finished,
    altTitles: [] as string[],
});

const CREATE_MEDIA_MUT = gql(`
    mutation CreateMedia($cmi: CreateMediaInput!) {
        createMedia(createMediaInput: $cmi)
    }
`);

const loading = ref(false);

async function createMedia() {
    loading.value = true;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: CREATE_MEDIA_MUT,
            variables: {
                cmi: {
                    kind: state.value.kind,
                    title: state.value.title,
                    altTitles: state.value.altTitles,
                    year: state.value.year,
                    description: state.value.description,
                    status: state.value.status,
                    anilistId: emptyAsNull(state.value.anilistId),
                    genres: state.value.genres,
                },
            },
        });

        if (errors) {
            //show error
            notify.addNotification(
                'error',
                errors[0].message ?? `Unknow error creating media!`
            );
        } else if (data?.createMedia) {
            notify.addNotification(
                'info',
                `Sucessfully created ${state.value.title}`
            );
            const id = data?.createMedia as string;
            router.push({ name: 'media', params: { id } });
        }
    } catch {
        notify.addNotification('error', `Unknow error creating media!`);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {});
</script>

<template>
    <form @submit.prevent="createMedia">
        <TextInput
            type="text"
            name="title"
            required
            v-model:value="state.title"
            label="Title: "
        />

        <h5>Media kind:</h5>
        <select class="w-select" v-model="state.kind" required>
            <option :value="MediaKind.Tv">TV (Episodes)</option>
            <option :value="MediaKind.Movie">Movie (Single)</option>
        </select>

        <h5>Media status:</h5>
        <select class="w-select" v-model="state.status" required>
            <option :value="MediaStatus.Upcoming">Upcoming</option>
            <option :value="MediaStatus.Airing">Airing</option>
            <option :value="MediaStatus.Finished">Finished</option>
        </select>

        <NumberInput
            v-model:value="state.year"
            required
            name="year"
            label="Year of release:"
            :min="1970"
            :max="2050"
            :step="1"
        />

        <h5>Alt titles:</h5>
        <StringListEditorVue v-model:list="state.altTitles" />
        <TextareaInput
            name="Description"
            v-model:value="state.description"
            required
            label="Description: "
        />
        <TextInput
            type="text"
            name="anilist-id"
            v-model:value="state.anilistId"
            label="Anilist ID:"
        />
        <h5>Genres:</h5>
        <StringListEditorVue v-model:list="state.genres" />

        <button class="w-big-button" :disabled="loading">Create</button>
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
