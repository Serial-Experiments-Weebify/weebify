import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useApolloClient } from '@vue/apollo-composable';
import { gql } from '@/_gql';
import { type User, UserRole } from '@/_gql/graphql';
import { useNotificationStore } from './notifications';

const LOG_IN_MUTATION = gql(`
    mutation LogIn2($username: String!, $password: String!) {
        login(loginInput: { username: $username, password: $password })
    }
`);

const ME_QUERY = gql(`
    query Me2 {
        me {
            id
            username
            displayName
            pfp
            bio
            role
            email
        }
        followed
    }
`);

type AuthUser = Omit<User, 'followers' | 'following' | 'availableInviteCodes'>;

export const useAuthStore = defineStore(
    'auth',
    () => {
        const apollo = useApolloClient();

        const loggedIn = ref(false);
        const token = ref('');
        const me = ref<AuthUser>();
        const followedIds = ref<string[]>();

        function logOut() {
            apollo.client.clearStore();
            loggedIn.value = false;
            token.value = '';
        }

        async function logIn(username: string, password: string) {
            if (loggedIn.value) throw 'bruh';

            const response = await apollo.client.mutate({
                mutation: LOG_IN_MUTATION,
                variables: { username, password },
            });

            if (response.errors) throw response.errors[0].message;
            //it worked
            if (!response.data?.login) throw 'No token';
            loggedIn.value = true;
            token.value = response.data?.login;

            const q = await apollo.client.query({
                query: ME_QUERY,
            });

            if (q.error || !q.data.me) {
                loggedIn.value = false;
                throw 'Failed to fetch "me"';
            }

            me.value = q.data.me;
            followedIds.value = q.data.followed;
        }

        function init() {
            if (loggedIn.value) {
                apollo.client
                    .query({
                        query: ME_QUERY,
                    })
                    .then((q) => {
                        if (q.error || !q.data.me) {
                            throw 'Failed to fetch "me"';
                        }
                        me.value = q.data.me;
                        followedIds.value = q.data.followed;
                    })
                    .catch(() => {
                        useNotificationStore().addNotification(
                            'error',
                            'Failed to fetch "me"'
                        );
                    });
            }
        }

        function updateFollow(id: string, value: boolean) {
            if (!followedIds.value) return;

            if (value && !followedIds.value.includes(id)) {
                followedIds.value.push(id);
            }

            if (!value) {
                followedIds.value = followedIds.value.filter((x) => x != id);
            }
        }

        const isAdmin = computed(() => {
            return (
                me.value?.role == UserRole.Admin ||
                me.value?.role == UserRole.God
            );
        });

        return {
            loggedIn,
            logOut,
            logIn,
            token,
            me,
            init,
            followedIds,
            updateFollow,
            isAdmin,
        };
    },
    {
        persist: {
            paths: ['loggedIn', 'token'],
        },
    }
);
