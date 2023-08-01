<script setup lang="ts">
import { gql } from '@/_gql';
import { useNotificationStore } from '@/stores/notifications';
import { useApolloClient, useQuery } from '@vue/apollo-composable';
import Datatable from 'vue3-easy-data-table';
import type { Header } from 'vue3-easy-data-table';

const headers: Header[] = [
    {
        text: 'Jobname',
        value: 'job',
        sortable: true,
    },
    {
        text: 'Status',
        value: 'status',
        sortable: true,
    },
    {
        text: 'Type',
        value: 'type',
        sortable: true,
    },
    {
        text: 'created',
        value: 'created',
        sortable: true,
    },
    {
        text: 'Media',
        value: 'medialink',
    },
    {
        text: 'Actions',
        value: 'btns',
    },
];

const { loading, result, refetch } = useQuery(
    gql(`
        query AdminVideos {
            videos {
                id
                job
                status
                type
                created
                media {
                    mediaId
                    episodeId
                }
            }
        }
    `)
);

const client = useApolloClient().client;
const notify = useNotificationStore();

const DELETE_VIDEO_MUT = gql(`
        mutation DeleteVideo($vid: String!) {
            deleteVideo(vid: $vid)
        }
`);

const UNLINK_VIDEO_MUT = gql(`
        mutation UnlinkVideo($mid: String!, $eid: String) {
            unlinkVideoFromMedia(mid: $mid, eid: $eid)
        }
`);

async function deleteVideo(id: string) {
    try {
        const { data, errors } = await client.mutate({
            mutation: DELETE_VIDEO_MUT,
            variables: {
                vid: id,
            },
        });

        if (data?.deleteVideo)
            notify.addNotification('success', 'Deleted video');
        else throw errors;

        refetch();
    } catch (e) {
        notify.addNotification('error', 'Failed to delete video');
        console.error(e);
    }
}

async function unlinkVideo(mid: string, eid?: string) {
    try {
        const { data, errors } = await client.mutate({
            mutation: UNLINK_VIDEO_MUT,
            variables: {
                mid,
                eid,
            },
        });

        if (data?.unlinkVideoFromMedia)
            notify.addNotification('success', 'Unlinked video');
        else throw errors;

        refetch();
    } catch (e) {
        notify.addNotification('error', 'Failed to delete video');
        console.error(e);
    }
}
</script>

<template>
    <div>
        <h1>Videos</h1>
        <Datatable
            :headers="headers"
            :items="result?.videos ?? []"
            :loading="loading"
            alternating
        >
            <template #item-status="{ status }">
                <span class="status" :class="status">{{ status }}</span>
            </template>

            <template #item-medialink="{ media }">
                <RouterLink
                    v-if="media[0]"
                    :to="{
                        name: 'media',
                        params: {
                            id: media[0].mediaId,
                        },
                        hash: media[0].episodeId
                            ? `#${media[0].episodeId}`
                            : undefined,
                    }"
                    >Go</RouterLink
                >
            </template>

            <template #item-btns="item">
                <button
                    v-if="item.media[0]"
                    class="w-medium-button w-button-red"
                    @click="
                        () =>
                            unlinkVideo(
                                item.media[0].mediaId,
                                item.media[0].episodeId
                            )
                    "
                >
                    Unlink
                </button>
                <button
                    v-else
                    class="w-medium-button w-button-red"
                    @click="() => deleteVideo(item.id)"
                >
                    Delete
                </button>
            </template>
        </Datatable>
    </div>
</template>

<style lang="less" scoped>
.pfp {
    width: 48px;
    height: 48px;
    text-indent: -100px;
    margin: 5px;
    border-radius: 50%;
    background-color: @c-clay;
}
.status {
    text-align: center;
    font-weight: bold;

    &.OK {
        color: @c-algae;
    }
    &.ERROR {
        color: @c-mandy;
    }
    &.WAITING {
        color: @c-yellow;
    }
}
</style>
