import { createRouter, createWebHistory } from 'vue-router';

import UserView from '@/views/UserView.vue';
import HomeView from '@/views/HomeView.vue';
import IndexView from '@/views/IndexView.vue';
import LoginView from '@/views/LoginView.vue';
import SignUpView from '@/views/SignUpView.vue';
import SearchView from '@/views/SearchView.vue';
import MediaView from '@/views/MediaView.vue';
import WatchView from '@/views/WatchView.vue';

import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { ADMIN_ROUTES } from './admin';

import { AuthState, type RouterMeta } from './meta';

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
        {
            path: '/w/:id',
            name: 'watch',
            props: true,
            component: WatchView,
            meta: {
                auth: AuthState.LoggedIn,
            },
        },
        ...ADMIN_ROUTES,
    ],
});

router.beforeEach((to) => {
    const authState = useAuthStore().loggedIn;
    const toMeta = to.meta as RouterMeta;

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
