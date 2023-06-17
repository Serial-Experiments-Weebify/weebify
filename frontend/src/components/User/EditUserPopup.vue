<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

import { useVuelidate } from '@vuelidate/core';
import {
    email,
    minLength,
    maxLength,
    sameAs,
    helpers,
    requiredIf,
} from '@vuelidate/validators';
import TextInput from '@/components/Forms/TextInput.vue';
import TextareaInput from '@/components/Forms/TextareaInput.vue';
import GetFile from '@/components/Forms/GetFile.vue';
import { useApolloClient } from '@vue/apollo-composable';
import { useNotificationStore } from '@/stores/notifications';
import { useAuthStore } from '@/stores/auth';
import { gql } from '@/_gql';
import { UserRole } from '@/_gql/graphql';

const apollo = useApolloClient();
const notify = useNotificationStore();
const auth = useAuthStore();

const props = withDefaults(
    defineProps<{
        displayName?: string;
        bio?: string;
        email?: string | null;
        role?: UserRole;
        id?: string;
    }>(),
    { displayName: '', bio: '', email: '', role: UserRole.User }
);

const emit = defineEmits<{
    (e: 'updated'): void;
}>();

function emptyAsNull(a: string | null | undefined) {
    if (typeof a !== 'string') return null;
    let trimmed = a?.trim();
    if (trimmed.length == 0) return null;
    return trimmed;
}

const updateUserData = ref({
        displayName: '',
        email: '',
        bio: '',
        password: '',
        password2: '',
        oldPassword: '',
    }),
    updateRole = ref<UserRole>(UserRole.User);

const loading = ref(false);

const editSelf = computed(() => props.id == auth.me?.id),
    extraPerms = computed(
        () => auth.me?.role === UserRole.God || auth.me?.role === UserRole.Admin
    );

//#region Form Validation
const pw = computed(() => updateUserData.value.password);

const needPassword = computed(() => {
    if (!editSelf.value) return false;
    return !![updateUserData.value.email, updateUserData.value.password]
        .map(emptyAsNull) // convert empty strings to null
        .find((x) => x != null); //is there one that isnt null
});

const rules = {
    displayName: {
        minLength: minLength(3),
        maxLength: maxLength(24),
    },
    email: { email },
    bio: {
        maxLength: maxLength(1000),
    },
    password: {
        minLength: minLength(8),
        maxLength: maxLength(64),
    },
    password2: {
        matches: helpers.withMessage('Passwords must match', sameAs(pw)),
    },
    oldPassword: {
        required: requiredIf(() => needPassword.value),
    },
};

const validate = useVuelidate(rules, updateUserData);

const invalid = computed(() => {
    let iv = {} as Record<any, string | undefined>;
    validate.value.$errors.forEach((err) => {
        const m = err.$message;
        if (typeof m === 'string') iv[err.$property] = m;
        else iv[err.$property] = m.value;
    });
    return iv;
});
//#endregion Form Validation

const MODIFY_USER_MUT = gql(`
    mutation modify($m: UpdateUserInput!) {
        updateUser(updateUserInput: $m) {
            id,
            username
        }
    }
`);

async function updateProfile() {
    if (!(await validate.value.$validate())) return;
    loading.value = true;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: MODIFY_USER_MUT,
            variables: {
                m: {
                    id: emptyAsNull(props.id),
                    bio: emptyAsNull(updateUserData.value.bio),
                    displayName: emptyAsNull(updateUserData.value.displayName),
                    password: emptyAsNull(updateUserData.value.password),
                    oldPassword: emptyAsNull(updateUserData.value.oldPassword),
                    email: emptyAsNull(updateUserData.value.email),
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
                `Updated data for ${data?.updateUser.username ?? 'you'}`
            );
            emit('updated');
        }
    } catch (e: any) {
        notify.addNotification('error', e?.toString() ?? 'Unknown error');
    } finally {
        loading.value = false;
    }
}

const pfpLoading = ref(false);
const GET_PFP_TOKEN_MUT = gql(`
    mutation getPfpToken ($id: String) {
        updatePfp(id:$id)
    }
`);

async function setPfp(file: File) {
    pfpLoading.value = true;

    //obtain update token
    const { data, errors } = await apollo.client.mutate({
        mutation: GET_PFP_TOKEN_MUT,
        variables: {
            id: props.id,
        },
    });

    if (errors) {
        notify.addNotification('error', errors[0].message ?? 'Unknown error');
        pfpLoading.value = false;
        return;
    }
    // upload pfp
    const token = data?.updatePfp as string;
    try {
        const fd = new FormData();
        fd.append('pfp', file);
        const f = await fetch('/api/media/pfp', {
            method: 'post',
            headers: {
                authorization: `Bearer ${token}`,
            },
            body: fd,
        });
        if (f.status >= 200 && f.status < 300) {
            notify.addNotification('success', 'Updated profile picture');
            emit('updated');
        } else {
            const r = await f.json();
            notify.addNotification(
                'error',
                r.error ?? 'Error updating profile picture'
            );
        }
    } catch {
        notify.addNotification('error', 'Error updating profile picture');
    } finally {
        pfpLoading.value = false;
    }
}

const roleLoading = ref(false);

const SET_ROLE_MUT = gql(`
    mutation SetRole($id: String!, $role: UserRole!) {
        setRole(id: $id,role: $role)
    }
`);

async function setRole() {
    roleLoading.value = true;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: SET_ROLE_MUT,
            variables: {
                id: props.id ?? '',
                role: updateRole.value,
            },
        });
        if (errors) {
            notify.addNotification(
                'error',
                errors[0].message ?? 'Unknown error'
            );
        }
        if (data?.setRole) {
            notify.addNotification('success', 'Updated role');
            emit('updated');
        }
    } catch (e: any) {
        notify.addNotification('error', e?.toString() ?? 'Unknown error');
    } finally {
        roleLoading.value = false;
    }
}

const inviteLoading = ref(false);
const CREATE_INVITE_MUT = gql(`
    mutation CreateInvite($id: String) {
        generateInviteCode(id: $id)
    }
`);
async function createInvite() {
    inviteLoading.value = false;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: CREATE_INVITE_MUT,
            variables: {
                id: props.id ?? '',
            },
        });
        if (errors) {
            notify.addNotification(
                'error',
                errors[0].message ?? 'Unknown error'
            );
        }
        if (data?.generateInviteCode) {
            notify.addNotification(
                'info',
                `Created invite "${data.generateInviteCode}"`
            );
            emit('updated');
        }
    } catch (e: any) {
        notify.addNotification('error', e?.toString() ?? 'Unknown error');
    } finally {
        inviteLoading.value = false;
    }
}

onMounted(() => {
    updateUserData.value.displayName = props.displayName;
    updateUserData.value.bio = props.bio;
    updateUserData.value.email = props.email ?? '';
    updateUserData.value.password =
        updateUserData.value.password2 =
        updateUserData.value.oldPassword =
            '';
    updateRole.value = props.role;
});
</script>

<template>
    <form class="wform" @submit.prevent="updateProfile">
        <h4>Update Info</h4>
        <TextInput
            v-model:value="updateUserData.displayName"
            name="displayname"
            :error="invalid.displayName"
            type="text"
            label="Display name:"
        />
        <TextInput
            v-model:value="updateUserData.email"
            :error="invalid.email"
            name="email"
            type="email"
            label="E-mail address"
            autocomplete="nope"
        />
        <TextareaInput
            v-model:value="updateUserData.bio"
            :error="invalid.bio"
            name="bio"
            label="Bio:"
        />
        <TextInput
            type="password"
            v-model:value="updateUserData.password"
            :error="invalid.password"
            name="password"
            label="New password:"
            autocomplete="new-password"
        />
        <TextInput
            type="password"
            v-model:value="updateUserData.password2"
            :error="invalid.password2"
            name="password2"
            label="New password (repeat):"
            autocomplete="new-password"
        />
        <TextInput
            type="password"
            v-if="editSelf"
            v-model:value="updateUserData.oldPassword"
            :error="invalid.oldPassword"
            name="cpassword"
            label="Current password"
            autocomplete="nope"
        />
        <button class="w-medium-button">Save</button>
    </form>
    <section>
        <h4>Update profile picture</h4>
        <GetFile
            :enabled="!pfpLoading"
            :formats="['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'jxl']"
            :max-size-mib="8"
            @file="setPfp"
        >
            Images, 10MiB max, 128x128 - 1024x1024
        </GetFile>
    </section>
    <section v-if="!editSelf">
        <h4>Update Role</h4>
        <select v-model="updateRole" :disabled="roleLoading">
            <option value="USER">User</option>
            <option value="LEGENDARY_MEMBER">User+</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
            <option value="GOD">God</option>
        </select>
        <br />
        <br />
        <button class="w-medium-button" @click="setRole">Save</button>
    </section>
    <section v-if="extraPerms">
        <h4>Generate invite code</h4>
        <button
            class="w-medium-button"
            @click="createInvite"
            :disabled="inviteLoading"
        >
            Add invite code
        </button>
    </section>
</template>

<style scoped lang="less"></style>
