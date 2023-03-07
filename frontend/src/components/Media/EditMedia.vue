<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';

import TextInput from '@/components/Forms/TextInput.vue';
import TextareaInput from '@/components/Forms/TextareaInput.vue';
import GetFile from '@/components/Forms/GetFile.vue';
import { useApolloClient } from '@vue/apollo-composable';
import { useNotificationStore } from '@/stores/notifications';
import { useAuthStore } from '@/stores/auth';
import { gql } from '@/_gql';
import { MediaKind, MediaStatus, type MediaPageQuery } from '@/_gql/graphql';
import StringListEditorVue from '@/components/Forms/StringListEditor.vue';
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
    id: string;
    currentData: MediaPageQuery['mediaById'] | undefined;
}>();

const emit = defineEmits<{
    (e: 'updated'): void;
}>();

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

const UPDATE_MEDIA_MUT = gql(`
    mutation updateMedia($id: String!, $umi: UpdateMediaInput!) {
        updateMedia(id: $id, updateMediaInput: $umi)
    }
`);

const loading = ref(false);

async function updateMedia() {
    loading.value = true;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: UPDATE_MEDIA_MUT,
            variables: {
                id: props.id,
                umi: {
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
        } else if (data?.updateMedia) {
            emit('updated');
            notify.addNotification(
                'info',
                `Sucessfully updated ${state.value.title}`
            );
        }
    } catch {
        notify.addNotification('error', `Unknow error creating media!`);
    } finally {
        loading.value = false;
    }
}

const coverLoading = ref(false);
const UPDATE_COVER_MUT = gql(`
    mutation UpdateMediaCover($id: String!) {
        updateMediaCover(id: $id)
    }
`);

async function setCover(file: File) {
    coverLoading.value = true;

    //obtain update token
    const { data, errors } = await apollo.client.mutate({
        mutation: UPDATE_COVER_MUT,
        variables: {
            id: props.id,
        },
    });

    if (errors) {
        notify.addNotification('error', errors[0].message ?? 'Unknown error');
        coverLoading.value = false;
        return;
    }
    // upload pfp
    const token = data?.updateMediaCover as string;
    try {
        const fd = new FormData();
        fd.append('cover', file);
        const f = await fetch('/api/media/cover', {
            method: 'post',
            headers: {
                authorization: `Bearer ${token}`,
            },
            body: fd,
        });
        if (f.status >= 200 && f.status < 300) {
            notify.addNotification('info', 'Updated media cover');
            emit('updated');
        } else {
            const r = await f.json();
            notify.addNotification(
                'error',
                r.error ?? 'Error updating media cover'
            );
        }
    } catch {
        notify.addNotification('error', 'Error updating media cover');
    } finally {
        coverLoading.value = false;
    }
}

function copyArray(a: string[]) {
    return a.map((x) => x);
}

onMounted(() => {
    state.value = {
        altTitles: copyArray(props.currentData?.altTitles ?? []),
        anilistId: props.currentData?.anilistId ?? '',
        description: props.currentData?.description ?? '',
        genres: copyArray(props.currentData?.genres ?? []),
        kind: props.currentData?.kind ?? MediaKind.Tv,
        status: props.currentData?.status ?? MediaStatus.Finished,
        title: props.currentData?.title ?? '',
        year: props.currentData?.year ?? 1999,
    };
});
</script>

<template>
    <section>
        <h5>Set cover image</h5>
        <GetFile
            :enabled="!coverLoading"
            :max-size-mib="20"
            :formats="['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'jxl']"
            @file="setCover"
        >
            Images, 20MiB max. You know what you're doing.
        </GetFile>
    </section>
    <form @submit.prevent="updateMedia">
        <TextInput
            type="text"
            name="title"
            required
            v-model:value="state.title"
            label="Title: "
        />

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

        <button class="w-big-button" :disabled="loading">Apply</button>
    </form>
</template>

<style scoped lang="less">
section {
    margin-bottom: 10px;
}
h5 {
    font-size: 18px;
    line-height: 22px;
    font-weight: 500;
    margin: 0;
}
</style>
