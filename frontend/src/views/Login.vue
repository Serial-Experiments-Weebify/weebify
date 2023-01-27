<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { gql } from '@/_gql';
import { useMutation } from '@vue/apollo-composable';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const { mutate: logIn } = useMutation(gql(`
    mutation LogIn($login: LoginInput!) {
        login(loginInput: $login)
    }
`));

const username = ref(''),
    password = ref('');

async function login() {
    try {
        const r = await logIn({
            login: { username: username.value, password: password.value },
        });
        if (r?.data) {
            authStore.logIn(r.data.login);
            router.push('/');
        } else if (r?.errors) {
            console.error(r?.errors);
        }
    } catch (e) {
        console.error(e);
    }
}
</script>

<template>
    <main>
        <form @submit.prevent="login">
            <label for="username">Username:</label>
            <input
                type="text"
                name="username"
                id="username"
                autocomplete="username"
                required
                v-model="username"
            />

            <label for="password">Password:</label>
            <input
                type="password"
                name="password"
                id="password"
                autocomplete="password"
                required
                v-model="password"
            />

            <input type="submit" value="Log in" />
        </form>
    </main>
</template>
