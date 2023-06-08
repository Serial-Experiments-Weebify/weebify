<script setup lang="ts">
import { gql } from '@/_gql';
import { useNotificationStore } from '@/stores/notifications';
import { useMutation, useQuery } from '@vue/apollo-composable';
import Datatable from 'vue3-easy-data-table';
import type { Header } from 'vue3-easy-data-table';
import WeebifyPopup from '@/components/WeebifyPopup.vue';
import AddKey from '@/components/Admin/AddKey.vue';
import { ref } from 'vue';

const headers: Header[] = [
    {
        text: 'Owner',
        value: 'user',
    },
    {
        text: 'Key name',
        value: 'name',
    },
    {
        text: 'Actions',
        value: 'revoke',
    },
];

function revoke(id: string) {
    deleteKey({ id });
}

const { refetch, loading, onError, result } = useQuery(
    gql(`
        query ApiKeys {
            listAPIKeys {
                name
                id
                owner {
                    username
                }
            }
        }
    `)
);

const {
    mutate: deleteKey,
    onDone,
    onError: onDeleteErr,
} = useMutation(
    gql(`
        mutation DeleteKey($id:String!) {
	        deleteAPIKey(id:$id)
        }
    `)
);

onDone(() => {
    notify.addNotification('info', 'API key deleted!');
    refetch();
});

onDeleteErr((e) => {
    notify.addNotification('error', `Failed to delete API key: ${e.message}`);
});

const notify = useNotificationStore();

onError((e) => {
    notify.addNotification('error', `Failed to fetch API keys: ${e.message}`);
});

const adding = ref(false);
</script>

<template>
    <div>
        <h2>
            API keys
            <button class="w-medium-button" @click="() => (adding = true)">
                Create a new API key
            </button>
        </h2>
        <Datatable
            :headers="headers"
            :items="result?.listAPIKeys ?? []"
            alternating
            :loading="loading"
        >
            <!-- 
                the errors bellow are actually fine, 
                TODO: go annoy Volar devs?
             -->
            <template #item-user="item">
                <RouterLink
                    :to="{
                        name: 'user',
                        params: { username: item.owner.username },
                    }"
                    >{{ item.owner.username }}</RouterLink
                >
            </template>
            <template #item-revoke="{ id }">
                <button
                    @click="()=>revoke(id as string)"
                    class="w-medium-button w-button-red"
                >
                    Revoke
                </button>
            </template>
        </Datatable>
        <WeebifyPopup v-model:show="adding" title="Add key">
            <AddKey
                @updated="
                    () => {
                        refetch();
                        adding = false;
                    }
                "
            />
        </WeebifyPopup>
    </div>
</template>
