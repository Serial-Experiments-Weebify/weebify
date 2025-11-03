<script setup lang="ts">
import { ref, computed } from 'vue';

import { useApolloClient } from '@vue/apollo-composable';
import { useNotificationStore } from '@/stores/notifications';
import platform from 'platform';
import { gql } from '@/_gql';

const { client } = useApolloClient();
const notify = useNotificationStore();

const props = defineProps<{
    sessions: {
        sid: string;
        expiresAt: string;
        ipAddress: string;
        lastAccessed: string;
        userAgent: string;
    }[];
    user?: string;
}>();

const removing = ref('');

const MUT_REVOKE_SESSION = gql(`
    mutation RevokeSession($uid:String, $sid:String!) {
	    revokeSession(user:$uid, sid:$sid)
    }
`);

async function remove(sid: string) {
    try {
        removing.value = sid;

        const { errors } = await client.mutate({
            mutation: MUT_REVOKE_SESSION,
            variables: {
                uid: props.user,
                sid,
            },
            refetchQueries: ['UserPage'],
        });

        if (errors) {
            notify.addNotification(
                'error',
                errors[0].message ?? 'Unknown error'
            );
        }
    } catch (e: unknown) {
        notify.addNotification(
            'error',
            (e as object).toString() ?? 'Unknown error'
        );
    } finally {
        removing.value = '';
    }
}

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

function formatUA(ua: string) {
    const p = platform.parse(ua);
    let o = `${p.name ?? 'Unknown'}`;
    if (p.version) o += ` ${p.version}`;
    if (p.os?.family) o += ` on ${p.os?.family}`;
    if (p.os?.version) o += ` ${p.os?.version}`;

    return o;
}

const sortedSessions = computed(() => {
    const sessions = props.sessions.map((s) => ({
        ...s,
        lastAccessed: new Date(s.lastAccessed),
        expiresAt: new Date(s.expiresAt),
    }));

    sessions.sort(
        (b, a) => a.lastAccessed.valueOf() - b.lastAccessed.valueOf()
    );

    return sessions;
});
</script>

<template>
    <section class="sessions">
        <div
            v-for="session in sortedSessions"
            :key="session.sid"
            class="session"
        >
            <span class="sid">
                {{ session.sid }}
                <button
                    class="w-base-button w-button-red disable-loading"
                    :disabled="removing === session.sid"
                    @click="() => remove(session.sid)"
                >
                    Revoke
                </button>
            </span>
            <span class="access">
                <span class="bold">Last access: </span>
                {{ relativeTime(session.lastAccessed) }}
            </span>
            <span class="ip">
                <span class="bold">IP: </span>
                {{ session.ipAddress }}
            </span>
            <span class="ua">
                <span class="bold">User agent: </span>
                {{ formatUA(session.userAgent) }}
            </span>

            <span class="expires">
                <span class="bold">Expires: </span>
                {{ relativeTime(session.expiresAt) }}
            </span>
        </div>
    </section>
</template>

<style scoped lang="less">
.sessions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 70vh;
    overflow-y: scroll;
}

.sid {
    color: @c-cyan;
    button {
        float: right;
    }
}
.bold,
.sid {
    font-weight: bold;
}

.session {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;

    border: 1px solid @c-mirage;
}
</style>
