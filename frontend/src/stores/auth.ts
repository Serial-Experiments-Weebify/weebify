import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import {
    useApolloClient,
    useLazyQuery,
    useQuery,
} from '@vue/apollo-composable';
import { gql } from '@/_gql';
import type { User } from '@/_gql/graphql';
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
            invitedBy
        }
    }
`);

export const useAuthStore = defineStore(
    'auth',
    () => {
        const apollo = useApolloClient();

        const loggedIn = ref(false);
        const token = ref('');
        const me = ref<User>();

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

            const user = await apollo.client.query({
                query: ME_QUERY,
            });

            if (user.error || !user.data.me) {
                loggedIn.value = false;
                throw 'Failed to fetch "me"';
            }

            me.value = user.data.me;
        }

        function init() {
            if (loggedIn.value) {
                apollo.client
                    .query({
                        query: ME_QUERY,
                    })
                    .then((user) => {
                        if (user.error || !user.data.me) {
                            throw 'Failed to fetch "me"';
                        }
                        me.value = user.data.me;
                    })
                    .catch(() => {
                        useNotificationStore().addNotification(
                            'error',
                            'Failed to fetch "me"'
                        );
                    });
            }
        }


        return { loggedIn, logOut, logIn, token, me,init };
    },
    {
        persist: {
            paths: ['loggedIn', 'token'],
        },
    }
);
