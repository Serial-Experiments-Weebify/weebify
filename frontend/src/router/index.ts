import { createRouter, createWebHistory } from 'vue-router';

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
            component: () => import('@/views/IndexView.vue'),
            meta: {},
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue'),
            meta: {
                auth: AuthState.LoggedOut,
            },
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('@/views/SignUpView.vue'),
            meta: {
                auth: AuthState.LoggedOut,
            },
        },
        {
            path: '/user/:username',
            name: 'user',
            component: () => import('@/views/UserView.vue'),
            props: true,
            meta: {
                auth: AuthState.LoggedIn,
            },
        },
        {
            path: '/home',
            name: 'home',
            component: () => import('@/views/HomeView.vue'),
            meta: {
                auth: AuthState.LoggedIn,
            },
        },
        {
            path: '/search',
            name: 'search',
            component: () => import('@/views/SearchView.vue'),
            meta: {
                auth: AuthState.LoggedIn,
            },
        },
        {
            path: '/m/:id',
            name: 'media',
            props: true,
            component: () => import('@/views/MediaView.vue'),
            meta: {
                auth: AuthState.LoggedIn,
            },
        },
        {
            path: '/w/:mid/:eid?',
            name: 'watch',
            props: true,
            component: () => import('@/views/WatchView.vue'),
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
