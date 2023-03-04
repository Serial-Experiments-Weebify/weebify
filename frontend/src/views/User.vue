<script setup lang="ts">
import RoleIcon from '@/icons/RoleIcon.vue';
import { useQuery } from '@vue/apollo-composable';
import { gql } from '@/_gql/gql';
import { UserRole } from '@/_gql/graphql';
import { computed, ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';

import Popup from '@/components/Popup.vue';
import EditUserPopup from '@/components/User/EditUserPopup.vue';

const auth = useAuthStore();
const props = defineProps<{
    username: string;
}>();

const { loading, result, error, refetch } = useQuery(
    gql(`
    query UserPage($username: String!) {
        user(idOrUsername: $username) {
            id
            username
            displayName
            pfp
            bio
            role
            email
            invitedBy
        }
    }
`),
    {
        username: props.username,
    }
);

const showEdit = ref(false);

const PRIVILEGED_ROLES = [UserRole.God, UserRole.Admin];

const canFollow = computed(() => {
    return !!result?.value?.user.id && result.value.user.id != auth.me?.id;
});

const canEdit = computed(() => {
    if (!result?.value?.user.id) return false;
    if (!auth.me) return false;

    if (result.value.user.id == auth.me?.id) return true; //we can update ourselves

    if (
        PRIVILEGED_ROLES.includes(auth.me.role) &&
        !PRIVILEGED_ROLES.includes(result.value.user.role)
    )
        return true; // admins can update nonadmins

    if (auth.me.role == UserRole.God) return true;

    return false;
});

const displayName = computed(() => {
    return result.value?.user.displayName ?? result.value?.user.username ?? '';
});

const usernameEmail = computed(() => {
    if (!result.value) return '';
    const username = result.value?.user.displayName
        ? result.value?.user.username
        : '';

    const noEmailMessage =
        auth.me?.username == props.username ? ' <No email>' : '';

    const email = result.value?.user.email
        ? `<${result.value?.user.email}>`
        : noEmailMessage;

    return `${username} ${email}`;
});
</script>

<template>
    <main v-if="!error" class="user-view">
        <div class="bg"></div>
        <div class="user sane-width">
            <div class="name">
                <span class="display-name">
                    <div class="text-placeholder">{{ displayName }}</div>
                    <RoleIcon :role="result?.user.role ?? 'USER'" />
                </span>
                <div class="username-email text-placeholder">
                    {{ usernameEmail }}
                </div>
            </div>
            <div class="side">
                <img
                    :src="
                        result?.user.pfp
                            ? `/cdn/pfp/${result.user.pfp}/full.webp`
                            : ''
                    "
                    alt="Profile picture"
                />
                <button class="w-big-button" :disabled="!canFollow">
                    Follow
                </button>
                <button
                    class="w-big-button"
                    :disabled="!canEdit"
                    @click="() => (showEdit = true)"
                >
                    Edit
                </button>
            </div>
            <div class="content">
                <div class="bio">
                    <span class="t"> BIO: </span>
                    <p>{{ result?.user.bio }}</p>
                </div>
            </div>
        </div>
        <Popup title="Edit user" v-model:show="showEdit">
            <EditUserPopup
                :id="result?.user.id"
                :display-name="result?.user.displayName"
                :bio="result?.user.bio"
                :email="result?.user.email"
                :role="result?.user.role"
                @updated="() => refetch()"
            />
        </Popup>
    </main>
    <main v-else></main>
</template>

<style scoped lang="less">
@keyframes Loading {
    0% {
        background-position: 0% 0%;
    }
    100% {
        background-position: 200% 200%;
    }
}
.loading {
    background-image: linear-gradient(
        -45deg,
        #0000,
        fade(@c-mirage, 70%),
        #0000,
        fade(@c-mirage, 70%)
    );
    background-size: 200%;
    animation: Loading 1s linear infinite;
}

.text-placeholder {
    display: inline-block;
    margin-right: 10px;

    &:empty {
        border-radius: 5px;
        min-height: 1em;
        min-width: 10rem;
        background-color: @c-oil;
        background-image: linear-gradient(
            90deg,
            #0000,
            fade(@c-mirage, 70%),
            #0000
        );
        background-size: 200%;
        animation: Loading 1s linear infinite;
        width: 40%;
    }
}

.user-view {
    display: flex;
    justify-content: center;
    align-items: stretch;
    .bg {
        position: absolute;
        background-color: @c-mirage;
        width: 100%;
        height: 300px;
        z-index: -100;
    }
    .user {
        width: 100%;
        height: 700px;
        display: grid;
        gap: 20px;
        grid-template-rows: 300px auto;
        grid-template-columns: 300px 1fr;
        grid-template-areas: 'side name' 'side content';

        .side {
            padding-top: 100px;
            grid-area: side;
            img {
                aspect-ratio: 1;
                border-radius: 50%;
                margin-bottom: 10px;
                background-color: @c-oil;

                text-indent: -100vw;
                overflow: hidden;

                .loading;
            }
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .name {
            grid-area: name;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding-bottom: 10px;

            .display-name {
                margin: 0;
                font-size: 48px;

                & > :deep(svg) {
                    vertical-align: center;
                }
            }

            .username-email {
                margin: 0;
                color: @c-clay;
                font-weight: 500;
            }
        }
        .content {
            grid-area: content;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 20px;

            .bio {
                background-color: @c-mirage;
                padding: 10px;
                padding-top: 5px;
                border-radius: 10px;

                .t {
                    color: @c-cyan;
                    font-weight: 700;
                    font-size: 16px;
                }
                p {
                    font-size: 18px;
                    font-weight: 400;
                    line-height: 1.2rem;
                    margin-bottom: 0;
                }
            }
        }
    }
}
</style>
