<script setup lang="ts">
import { ref } from 'vue';
import { useClipboard } from '@vueuse/core';
import { useApolloClient } from '@vue/apollo-composable';
import { gql } from '@/_gql';
import { useNotificationStore } from '@/stores/notifications';

const props = defineProps<{
    inviteCode: string;
    canRemove: boolean;
    user?: string;
}>();

const emit = defineEmits<{
    (e: 'removed'): void;
}>();

const { copy, copied } = useClipboard({
    source: props.inviteCode,
});

const removing = ref(false);

const { client } = useApolloClient();
const notify = useNotificationStore();

const MUT_REVOKE_INVITE = gql(`
    mutation RevokeInvite($invite: String!, $user: String) {
        revokeInvite(invite: $invite, user:$user)
    }
`);

async function remove() {
    try {
        removing.value = true;

        const { errors } = await client.mutate({
            mutation: MUT_REVOKE_INVITE,
            variables: {
                invite: props.inviteCode,
                user: props.user,
            },
            refetchQueries: ['UserPage'],
        });
        if (errors) {
            notify.addNotification(
                'error',
                errors[0].message ?? 'Unknown error'
            );
        } else {
            emit('removed');
        }
    } catch (e: unknown) {
        notify.addNotification(
            'error',
            (e as object).toString() ?? 'Unknown error'
        );
    } finally {
        removing.value = false;
    }
}
</script>

<template>
    <div class="invite-code" :class="{ copied }">
        <span class="code" title="Click to copy" @click="() => copy()">{{
            props.inviteCode
        }}</span>
        <button
            v-if="canRemove"
            class="remove w-medium-button w-button-red disable-loading"
            :disabled="removing"
            @click="remove"
        >
            Remove
        </button>
    </div>
</template>

<style scoped lang="less">
.invite-code {
    margin: 10px;
    background-color: @c-oil;
    border-radius: 100px;
    display: flex;
    flex-direction: row;
    align-items: center;

    .code {
        &:not(:hover) {
            filter: blur(3px);
        }
    }

    .code {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
        margin-right: 5px;
        font-family: monospace;
        padding: 0 5px;
        color: @c-snow;
        filter: none;
        transition: filter @t-subtle ease;
        cursor: pointer;
    }

    &.copied {
        transition: box-shadow @t-stupid ease;
        box-shadow: 0 0 5px 2px @c-algae;
    }
}
</style>
