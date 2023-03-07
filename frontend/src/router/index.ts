import { createRouter, createWebHistory } from 'vue-router';

import UserView from '@/views/User.vue';
import HomeView from '@/views/Home.vue';
import IndexView from '@/views/Index.vue';
import LoginView from '@/views/Login.vue';
import SignUpView from '@/views/SignUp.vue';
import SearchView from '@/views/Search.vue';
import MediaView from '@/views/Media.vue';

import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';

export enum AuthState {
    Any = 'any',
    LoggedIn = 'user',
    LoggedOut = 'anon',
}

export interface RouterMeta {
    auth?: AuthState;
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'index',
            component: IndexView,
            meta: {},
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: {
                auth: AuthState.LoggedOut,
            },
        },
        {
            path: '/signup',
            name: 'signup',
            component: SignUpView,
            meta: {
                auth: AuthState.LoggedOut,
            },
        },
        {
            path: '/user/:username',
            name: 'user',
            component: UserView,
            props: true,
            meta: {
                auth: AuthState.LoggedIn,
            },
        },
        {
            path: '/home',
            name: 'home',
            component: HomeView,
            meta: {
                auth: AuthState.LoggedIn,
            },
        },
        {
            path: '/search',
            name: 'search',
            component: SearchView,
            meta: {
                auth: AuthState.LoggedIn,
            },
        },
        {
            path: '/m/:id',
            name: 'media',
            props: true,
            component: MediaView,
            meta: {
                auth: AuthState.LoggedIn,
            },
        },
    ],
});

router.beforeEach((to) => {
    const authState = useAuthStore().loggedIn;
    const toMeta = to.meta as RouterMeta;

    console.log({ n: to.name, authState, tr: toMeta.auth });

    switch (toMeta.auth ?? AuthState.Any) {
        case AuthState.Any:
            return;
        case AuthState.LoggedIn:
            if (authState) {
                return;
            } else {
                useNotificationStore().addNotification('warn', 'Login first');
                return { name: 'login' };
            }
        case AuthState.LoggedOut:
            if (authState) {
                useNotificationStore().addNotification(
                    'warn',
                    'You are already logged in'
                );
                return { name: 'home' };
            } else {
                return;
            }
    }
});

export default router;
