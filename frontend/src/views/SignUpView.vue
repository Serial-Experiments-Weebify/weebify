<script setup lang="ts">
import TextInput from '@/components/Forms/TextInput.vue';
import { useNotificationStore } from '@/stores/notifications';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import {
    email,
    minLength,
    maxLength,
    required,
    sameAs,
    helpers,
} from '@vuelidate/validators';
import { gql } from '@/_gql';
import { useApolloClient } from '@vue/apollo-composable';

const apollo = useApolloClient();
const notify = useNotificationStore();
const router = useRouter();
const loading = ref(false);

const SIGNUP_MUT = gql(`
    mutation signup($r: CreateUserInput!) {
        signUp(createUserInput: $r) {
            id
        }
    }
`);

const form = ref({
    username: '',
    email: '',
    password: '',
    password2: '',
    invite: '',
});
const pw = computed(() => form.value.password);

const username = helpers.withMessage(
    'Must be alphanumeric with single underscores',
    helpers.regex(/^([a-z0-9]_?){1,}[a-z0-9]$/i)
);
const rules = {
    username: {
        required,
        username,
        minLength: minLength(3),
        maxLength: maxLength(32),
    },
    email: { email },
    password: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(64),
    },
    password2: {
        required,
        matches: helpers.withMessage('Passwords must match', sameAs(pw)),
    },
    invite: { required },
};

const validate = useVuelidate(rules, form);
const invalid = computed(() => {
    let iv = {} as Record<any, string | undefined>;
    validate.value.$errors.forEach((err) => {
        const m = err.$message;
        if (typeof m === 'string') iv[err.$property] = m;
        else iv[err.$property] = m.value;
    });
    return iv;
});

async function signup() {
    const valid = await validate.value.$validate();
    if (!valid) return;
    loading.value = true;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: SIGNUP_MUT,
            variables: {
                r: {
                    inviteCode: form.value.invite,
                    password: form.value.password,
                    username: form.value.username,
                    email:
                        form.value.email != '' ? form.value.email : undefined,
                },
            },
        });
        if (errors) {
            notify.addNotification(
                'error',
                errors[0].message ?? 'Unknown error'
            );
        } else {
            notify.addNotification(
                'info',
                `Created new account '${data?.signUp.id}'`
            );
            router.push({ name: 'login' });
        }
    } catch (e: any) {
        notify.addNotification('error', e?.toString() ?? 'Unknown error');
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <main>
        <form @submit.prevent="signup" class="wform">
            <TextInput
                type="text"
                v-model:value="form.username"
                name="username"
                label="Username:"
                required
                :error="invalid.username"
                autocomplete="username"
            />
            <TextInput
                type="text"
                v-model:value="form.email"
                name="email"
                label="Email:"
                :error="invalid.email"
                autocomplete="email"
            />
            <TextInput
                type="password"
                v-model:value="form.password"
                name="password"
                label="Password:"
                required
                :error="invalid.password"
                autocomplete="new-password"
            />
            <TextInput
                type="password"
                v-model:value="form.password2"
                name="password2"
                label="Password (repeat):"
                :error="invalid.password2"
                required
            />
            <TextInput
                type="text"
                v-model:value="form.invite"
                name="invite"
                label="Invite code:"
                :error="invalid.invite"
                required
            />
            <input
                class="w-big-button disable-loading"
                type="submit"
                value="Sign up"
                :disabled="loading"
            />
            <br />
            <RouterLink :to="{ name: 'login' }">Log in instead</RouterLink>
        </form>
    </main>
</template>

<style scoped lang="less">
main {
    display: grid;
    place-items: center;

    form {
        padding: 20px;
        border-radius: 20px;
        background-color: @c-mirage;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}
</style>
