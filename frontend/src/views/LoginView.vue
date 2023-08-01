<script setup lang="ts">
import TextInput from '@/components/Forms/TextInput.vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const notify = useNotificationStore();
const router = useRouter();

const username = ref(''),
    password = ref(''),
    loading = ref(false);

async function login() {
    loading.value = true;
    try {
        await authStore.logIn(username.value, password.value);
        notify.addNotification('info', 'Present Day, Present Time...');
        router.replace({ name: 'home' });
    } catch (e: unknown) {
        notify.addNotification('error', e?.toString?.() ?? 'Unknown error');
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <main>
        <form @submit.prevent="login">
            <TextInput
                v-model:value="username"
                type="text"
                name="username"
                label="Username:"
                required
                autocomplete="username"
            />
            <TextInput
                v-model:value="password"
                type="password"
                name="password"
                label="Password:"
                required
                autocomplete="password"
            />
            <input
                class="w-big-button disable-loading"
                :disabled="loading"
                type="submit"
                value="Log In"
            />
            <RouterLink :to="{ name: 'signup' }">Sign up instead</RouterLink>
        </form>
    </main>
</template>

<style scoped lang="less">
main {
    display: grid;
    place-items: center;

    form {
        display: flex;
        flex-direction: column;

        padding: 20px;
        border-radius: 20px;
        background-color: @c-mirage;

        a {
            margin-top: 10px;
            text-align: center;
        }
    }
}

input[type='submit'] {
    border: none;
    outline: none;
    background-color: @c-cyan;
    font-size: 22px;
    padding: 10px;
    border-radius: 1000px;
    color: @c-oil;
    font-weight: 500;

    &:hover {
        background-color: lighten(@c-cyan, 10%);
    }
    &.disable-loading:disabled {
        color: @c-snow;
        background-color: desaturate(@c-cyan, 15%);
        background-image: linear-gradient(
            90deg,
            #0000 40%,
            fade(@c-snow, 50%),
            #0000 60%
        );
        background-size: 220%;
        animation: Loading 1s ease infinite;
    }
}

@keyframes Loading {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

input:focus ~ label {
    color: @c-cyan;
    font-weight: bold;
}
</style>
