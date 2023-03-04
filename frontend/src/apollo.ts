import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
} from '@apollo/client/core';

import { setContext } from '@apollo/client/link/context';
import { useAuthStore } from './stores/auth';

const http = createHttpLink({
    uri: '/graphql',
});

const link = setContext((_, { headers }) => {
    const auth = useAuthStore();
    const newHeaders: Record<string, string> = {};

    if (auth.loggedIn) {
        newHeaders['authorization'] = `Bearer ${auth.token}`;
    }
    return {
        headers: {
            ...headers,
            ...newHeaders,
        },
    };
}).concat(http);

const cache = new InMemoryCache();

export const apolloClient = new ApolloClient({
    cache,
    link,
});
