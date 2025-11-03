<script setup lang="ts">
import RoleIcon from '@/icons/RoleIcon.vue';
import { useApolloClient, useQuery } from '@vue/apollo-composable';
import { gql } from '@/_gql/gql';
import { UserRole } from '@/_gql/graphql';
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

import WeebifyPopup from '@/components/WeebifyPopup.vue';
import EditUserPopup from '@/components/User/EditUserPopup.vue';
import RevokeSessionsPopup from '@/components/User/RevokeSessionsPopup.vue';
import { useNotificationStore } from '@/stores/notifications';
import UserCard from '@/components/User/UserCard.vue';
import InviteCode from '@/components/User/InviteCode.vue';
import { useURLStore } from '@/stores/url';

const url = useURLStore();
const auth = useAuthStore();
const notify = useNotificationStore();

const props = defineProps<{
    username: string;
}>();

const client = useApolloClient();

const { result, error, refetch } = useQuery(
    gql(`
    query UserPage($username: String!) {
        user(idOrUsername: $username) {
            id
            username
            displayName
            pfp
            bio
            role
            email,
            availableInviteCodes,
            following{
                id
                role
                username
                displayName
                pfp
            }
            followers {
                id
                role
                username
                displayName
                pfp
            }
            sessions {
                sid
                expiresAt
                ipAddress
                lastAccessed
                userAgent
            }
        }
    }
`),
    () => ({
        username: props.username,
    })
);

const showEdit = ref(false),
    showSessions = ref(false);

const PRIVILEGED_ROLES = [UserRole.God, UserRole.Admin];

const isCurrentUser = computed(() => {
    return !!result?.value?.user.id && result.value.user.id == auth.me?.id;
});

const following = computed(() => {
    return auth.followedIds?.includes(result?.value?.user.id ?? '');
});

const followLoading = ref(false);

const FOLLOW_MUT = gql(`
mutation FollowUser($id: String!) {
  follow(uid:$id)
}
`);

const UNFOLLOW_MUT = gql(`
mutation UnfollowUser($id: String!) {
  unfollow(uid:$id)
}
`);

const FOLLOW_MUT_MAP = {
    0: UNFOLLOW_MUT,
    1: FOLLOW_MUT,
};

async function updateFollow(v: boolean) {
    followLoading.value = true;

    try {
        const id = result?.value?.user.id;
        if (!id) {
            throw 'Invalid ID';
        }
        const { errors } = await client.client.mutate({
            mutation: FOLLOW_MUT_MAP[v ? 1 : 0],
            variables: {
                id,
            },
        });

        if (errors) {
            notify.addNotification(
                'error',
                errors[0].message ?? 'Unknown error'
            );
        } else {
            auth.updateFollow(id, v);
            refetch();
        }
    } catch (e: unknown) {
        notify.addNotification(
            'error',
            (e as object).toString() ?? 'Unknown error'
        );
        console.error(e);
    } finally {
        followLoading.value = false;
    }
}

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
                    :src="url.getPfpURL('full', result?.user.pfp)"
                    alt="Profile picture"
                />
                <button
                    class="w-big-button"
                    :class="{ 'btn-loading': followLoading }"
                    :disabled="isCurrentUser || followLoading"
                    @click="() => updateFollow(!following)"
                >
                    {{ following ? 'Unfollow' : 'Follow' }}
                </button>

                <button
                    class="w-big-button"
                    :disabled="!canEdit"
                    @click="() => (showEdit = true)"
                >
                    Edit
                </button>

                <button
                    class="w-big-button"
                    :disabled="!(canEdit && result?.user.sessions)"
                    @click="() => (showSessions = true)"
                >
                    Sessions
                </button>
            </div>
            <div class="content">
                <div class="bio">
                    <span class="t"> BIO: </span>
                    <p>{{ result?.user.bio }}</p>
                </div>
                <div class="bio">
                    <span class="t"> Activity: </span><br />
                    No recent activity...
                </div>
                <div class="bio">
                    <span class="t"> Followers: </span>
                    <div class="ulist scroll">
                        <RouterLink
                            v-for="u in result?.user.followers ?? []"
                            :key="u.username"
                            class="rl-no-fucking-text-decoration"
                            :to="{
                                name: 'user',
                                params: { username: u.username },
                            }"
                        >
                            <UserCard :user="u" />
                        </RouterLink>
                    </div>
                </div>
                <div class="bio">
                    <span class="t"> Following: </span>
                    <div class="ulist scroll">
                        <RouterLink
                            v-for="u in result?.user.following ?? []"
                            :key="u.username"
                            class="rl-no-fucking-text-decoration"
                            :to="{
                                name: 'user',
                                params: { username: u.username },
                            }"
                        >
                            <UserCard :user="u" />
                        </RouterLink>
                    </div>
                </div>
                <div v-if="result?.user.availableInviteCodes" class="bio">
                    <span class="t">Invite codes:</span>
                    <div class="invites scroll">
                        <InviteCode
                            v-for="code in result!.user.availableInviteCodes"
                            :key="code"
                            :invite-code="code"
                            :user="result!.user.id"
                            :can-remove="canEdit"
                        />
                    </div>
                </div>
            </div>
        </div>
        <WeebifyPopup v-model:show="showEdit" title="Edit user">
            <EditUserPopup
                :id="result?.user.id"
                :display-name="result?.user.displayName"
                :bio="result?.user.bio"
                :email="result?.user.email"
                :role="result?.user.role"
                @updated="() => refetch()"
            />
        </WeebifyPopup>

        <WeebifyPopup v-model:show="showSessions" title="Manage sessions">
            <RevokeSessionsPopup
                :sessions="result?.user.sessions ?? []"
                :user="result?.user.id"
            />
        </WeebifyPopup>
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

.ulist {
    list-style: none;
    height: fit-content;
    display: grid;
    grid-gap: 0.5em;
    padding: 30px;
    grid-template-columns: repeat(auto-fill, minmax(14em, 1fr));
}

.invites {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(26em, 1fr));
}

.scroll {
    max-height: 30vh;
    overflow-y: auto;
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
            margin-bottom: 10px;

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
