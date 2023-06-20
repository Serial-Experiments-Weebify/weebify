import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useApolloClient } from '@vue/apollo-composable';
import { gql } from '@/_gql';
import { type User, UserRole } from '@/_gql/graphql';
import { useNotificationStore } from './notifications';

const LOG_IN_SESSION_MUTATION = gql(`
    mutation LogInSession($username: String!, $password: String!) {
        loginSession(loginInput: { username: $username, password: $password }) {
            token,
            searchKey,
            expiresAt
        }
    }
`);

const ME_QUERY = gql(`
    query AuthMe {
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

const LOG_OUT_MUTATION = gql(`
    mutation LogOut {
	    logout
    }
`);

type AuthUser = Omit<
    User,
    'followers' | 'following' | 'availableInviteCodes' | 'sessions'
>;

export const useAuthStore = defineStore(
    'auth',
    () => {
        const apollo = useApolloClient();

        const loggedIn = ref(false);
        const token = ref('');
        const searchKey = ref('');
        const expiration = ref(new Date(0));
        const me = ref<AuthUser>();
        const followedIds = ref<string[]>();

        function localLogOut() {
            apollo.client.clearStore();

            loggedIn.value = false;
            token.value = '';
            searchKey.value = '';
            expiration.value = new Date(0);
            me.value = undefined;
            followedIds.value = undefined;
        }

        async function fullLogOut() {
            try {
                await apollo.client.mutate({
                    mutation: LOG_OUT_MUTATION,
                });
            } catch (e) {
                console.error(e);
            } finally {
                localLogOut();
            }
        }

        async function logIn(username: string, password: string) {
            if (loggedIn.value) throw 'Cannot log in while logged in';

            const response = await apollo.client.mutate({
                mutation: LOG_IN_SESSION_MUTATION,
                variables: { username, password },
            });

            if (response.errors) throw response.errors[0].message;
            //it worked
            if (!response.data?.loginSession.token) throw 'No token';
            loggedIn.value = true;

            token.value = response.data!.loginSession.token;
            searchKey.value = response.data!.loginSession.searchKey;
            expiration.value = new Date(response.data!.loginSession.expiresAt);

            const q = await apollo.client.query({
                query: ME_QUERY,
            });

            if (q.error || !q.data.me) {
                loggedIn.value = false;
                throw 'Failed to fetch "me"';
            }

            me.value = q.data.me;
            followedIds.value = q.data.followed.map((x) => x);
        }

        async function init() {
            if (typeof expiration.value === 'string') {
                // the persist plugin doesn't recreate Date objects
                expiration.value = new Date(expiration.value);
            }

            if (loggedIn.value) {
                console.log([
                    {
                        0: 'auth init',
                        state: loggedIn.value,
                        token: token.value,
                        searchKey: searchKey.value,
                        expiration: expiration.value,
                    },
                ]);

                try {
                    const { data, error } = await apollo.client.query({
                        query: ME_QUERY,
                    });

                    if (error) {
                        throw error;
                    } else if (!data.me) {
                        throw { epic: 'fail' };
                    }

                    me.value = data.me;
                    followedIds.value = data.followed;
                } catch (e) {
                    console.error(e);

                    useNotificationStore().addNotification(
                        'error',
                        'Invalid session, try refreshing the page'
                    );

                    localLogOut();
                }
            }
        }

        function updateFollow(id: string, value: boolean) {
            if (!followedIds.value) return;

            if (value && !followedIds.value.includes(id)) {
                followedIds.value = [...followedIds.value, id];
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
            logOut: fullLogOut,
            logIn,
            token,
            searchKey,
            expiration,
            me,
            init,
            followedIds,
            updateFollow,
            isAdmin,
        };
    },
    {
        persist: {
            paths: ['loggedIn', 'token', 'searchKey', 'expiration'],
        },
    }
);
