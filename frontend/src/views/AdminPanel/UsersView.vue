<script setup lang="ts">
import { gql } from '@/_gql';
import { useQuery } from '@vue/apollo-composable';
import { computed } from 'vue';
import Datatable from 'vue3-easy-data-table';
import type { Header } from 'vue3-easy-data-table';

// in miliseconds
const units = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000,
};

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function relativeTime(d1: Date | string) {
    if (typeof d1 === 'string') d1 = new Date(d1);
    const elapsed = d1.valueOf() - Date.now();

    const [unit, ms] = Object.entries(units).find(
        ([, ms]) => Math.abs(elapsed) > ms
    ) ?? ['second', 1000];

    return rtf.format(
        Math.round(elapsed / ms),
        unit as Intl.RelativeTimeFormatUnit
    );
}

const headers: Header[] = [
    {
        text: 'PFP',
        value: 'pfp',
        width: 64,
    },
    {
        text: 'Username',
        value: 'username',
    },
    {
        text: 'Invited by',
        value: 'invite',
    },
    {
        text: 'Role',
        value: 'role',
    },
    {
        text: 'Email',
        value: 'email',
    },
    {
        text: 'Last action',
        value: 'lastAction',
    },
];

const { loading, result } = useQuery(
    gql(`
        query AllUsers {
            users {
                id
                username
                displayName
                pfp
                role
                email
                sessions {
                    lastAccessed
                }
                invitedBy {
                    username
                }
            }
        }
    `)
);

const users = computed(() => {
    const og = result.value?.users ?? [];

    return og.map((x) => {
        const s = x.sessions ?? [];

        const lastAction = s
            .map((y) => new Date(y.lastAccessed))
            .sort((a, b) => b.valueOf() - a.valueOf())[0];

        return {
            id: x.id,
            username: x.username,
            pfp: x.pfp,
            role: x.role,
            email: x.email,
            invitedBy: x.invitedBy?.username,
            lastAction: lastAction
                ? relativeTime(lastAction)
                : 'No active sessions',
        };
    });
});
</script>

<template>
    <div>
        <h1>Users</h1>
        <Datatable
            :headers="headers"
            :items="users"
            :loading="loading"
            alternating
        >
            <template #item-pfp="{ pfp }">
                <img
                    :src="`/cdn/weebify/pfp/${pfp}/tiny.webp`"
                    alt=""
                    class="pfp"
                />
            </template>
            <template #item-username="{ username }">
                <RouterLink
                    :to="{
                        name: 'user',
                        params: { username: username },
                    }"
                >
                    {{ username }}
                </RouterLink>
            </template>
            <template #item-invite="{ invitedBy }">
                <RouterLink
                    v-if="invitedBy"
                    :to="{
                        name: 'user',
                        params: { username: invitedBy },
                    }"
                >
                    {{ invitedBy }}
                </RouterLink>
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
</style>
