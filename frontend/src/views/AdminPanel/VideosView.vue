<script setup lang="ts">
import { gql } from '@/_gql';
import { useQuery } from '@vue/apollo-composable';
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

const { loading, result } = useQuery(
    gql(`
        query AdminVideos {
            videos {
                id
                job
                status
                type
                created
                linkedMedia {
                    mediaId
                    episodeId
                }
            }
        }
    `)
);
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

            <template #item-medialink="{ linkedMedia }">
                <RouterLink v-if="linkedMedia[0]" to="/">Go</RouterLink>
            </template>

            <template #item-btns="item">
                <button
                    class="w-medium-button w-button-red"
                    v-if="item.linkedMedia[0]"
                >
                    Unlink
                </button>
                <button class="w-medium-button w-button-red" v-else>
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
