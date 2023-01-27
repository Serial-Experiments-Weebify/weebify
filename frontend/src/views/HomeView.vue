<script setup lang="ts">
import { gql } from '@/_gql';
import { useQuery } from '@vue/apollo-composable';
import { RouterLink } from 'vue-router';


const { result } = useQuery(
    gql(`query Who {
            me {
                id
                username
                displayName
                pfp
                bio
                role
                email
                invitedBy
            }
        }`),
);
</script>

<template>
    <main>
        <h1>the weebs walk amogus</h1>
        <RouterLink to="/lgoin">Join em</RouterLink>
        <h2>Trenutno si:</h2>
        <pre>
      {{ result }}
    </pre>
    </main>
</template>
