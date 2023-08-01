<script setup lang="ts">
import { gql } from '@/_gql';
import { useNotificationStore } from '@/stores/notifications';
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import { computed, ref } from 'vue';
import WeebifyPopup from '../WeebifyPopup.vue';

const props = defineProps<{
    mediaId: string;
    episodeId?: string | null;
    videoId?: string | null;
}>();

const notify = useNotificationStore();

const {
    result: videos,
    loading: videosLoading,
    load: fetchVideos,
    refetch: refetchVideos,
} = useLazyQuery(
    gql(`
        query LinkVideos {
            videos(unlinkedOnly: true, status: OK) {
                id
                job
                type
                created
            }
        }
    `)
);

const sortedVideos = computed(() =>
    (videos.value?.videos ?? [])
        .map(({ id, job, type, created }) => ({
            id,
            job,
            type,
            created: new Date(created),
        }))
        .sort((a, b) => b.created.valueOf() - a.created.valueOf())
);

const {
    loading: unlinking,
    onDone: onUnlinked,
    onError: onUnlinkError,
    mutate: unlink,
} = useMutation(
    gql(`
        mutation unlink($mid: String!, $eid: String) {
            unlinkVideoFromMedia(mid: $mid, eid: $eid)
        }
    `),
    {
        refetchQueries: ['MediaPage'],
        variables: {
            mid: props.mediaId,
            eid: props.episodeId ?? null,
        },
    }
);

const {
    onDone: onLinked,
    onError: onLinkError,
    mutate: link,
} = useMutation(
    gql(`
        mutation link($mid: String!, $eid: String, $vid: String!) {
            linkVideoToMedia(mid: $mid, eid:$eid, vid: $vid)
        }
    `),
    {
        refetchQueries: ['MediaPage'],
    }
);

onUnlinked(() => {
    notify.addNotification('success', 'Video unlinked');
});
onLinked(() => {
    notify.addNotification('success', 'Video linked');
});

onLinkError((e) => {
    notify.addNotification('error', 'Failed to link video');
    console.error(e);
});

onUnlinkError((e) => {
    notify.addNotification('error', 'Failed to unlink video');
    console.error(e);
});

const editing = ref(false);

function edit() {
    refetchVideos();
    fetchVideos();
    editing.value = true;
}
</script>

<template>
    <WeebifyPopup v-model:show="editing" title="Link video">
        <div v-if="videosLoading">Loading...</div>
        <div class="videos">
            <div
                v-for="v in sortedVideos"
                :key="v.id"
                class="video"
                @click="
                    () =>
                        (editing = false) ||
                        link({
                            mid: props.mediaId,
                            eid: props.episodeId ?? null,
                            vid: v.id,
                        })
                "
            >
                <div class="main">
                    <span class="type" :class="v.type">{{ v.type }}</span
                    >&nbsp;-&nbsp;<span class="title">{{ v.job }}</span>
                </div>
                <div class="created">{{ v.created.toLocaleString() }}</div>
            </div>
        </div>
    </WeebifyPopup>

    <button
        v-if="!props.videoId"
        class="w-medium-button w-button-green"
        @click="edit"
    >
        Link video
    </button>
    <button
        v-else
        class="w-medium-button w-button-yellow disable-loading"
        :disabled="unlinking"
        @click="() => unlink()"
    >
        Unlink Video
    </button>
</template>

<style lang="less" scoped>
.videos {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .video {
        padding: 0.5rem;
        cursor: pointer;
        border-radius: 5px;

        &:hover {
            background-color: @c-mirage;
        }

        .main {
            font-weight: bold;
            line-height: 2;
            .type {
                &.V0 {
                    color: @c-cyan;
                }
                &.V1 {
                    color: @c-algae;
                }
            }

            .title {
                color: @c-snow;
            }
        }
    }
}
</style>
