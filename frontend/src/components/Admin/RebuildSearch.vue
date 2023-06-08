<script setup lang="ts">
import { gql } from '@/_gql';
import { useNotificationStore } from '@/stores/notifications';
import type { TypedDocumentNode } from '@apollo/client';
import { useApolloClient } from '@vue/apollo-composable';
import { ref } from 'vue';

type TIndex = 'user' | 'media';
type Nothing = Record<any, never>;

const props = defineProps<{
    index: TIndex;
}>();

const REBUILD_MUTS: Record<TIndex, TypedDocumentNode<any, Nothing>> = {
    user: gql(`
        mutation RebuildUserSearch {
            rebuildUserSearch
        }
    `),
    media: gql(`
        mutation RebuildMediaSearch {
            rebuildMediaSearch
        }
    `),
};

const client = useApolloClient().client;
const notify = useNotificationStore();

const busy = ref(false);

async function rebuild() {
    try {
        busy.value = true;

        const { errors } = await client.mutate({
            mutation: REBUILD_MUTS[props.index],
        });

        if (errors) {
            throw new Error(errors[0].message);
        }

        notify.addNotification(
            'info',
            `Successfully rebuilt ${props.index} index`
        );
    } catch {
        notify.addNotification('error', 'Failed to rebuild search index');
    } finally {
        busy.value = false;
    }
}
</script>

<template>
    <section>
        <h3>Rebuild {{ props.index }} search</h3>
        <p class="desc">
            Recreates and indexes the {{ props.index }} index in MeiliSearch
        </p>
        <button
            class="w-big-button w-button-red btn-load-overlay"
            :disabled="busy"
            @click="rebuild"
        >
            Rebuild
        </button>
    </section>
</template>
