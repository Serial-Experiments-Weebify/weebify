import { AuthState } from './meta';

export const children = [
    {
        path: 'actions',
        name: 'admin-actions',
        component: import('@/views/AdminPanel/ActionsView.vue'),
        meta: {
            friendlyName: 'Actions',
            icon: 'mdi-cog',
        },
    },
    {
        path: 'api-keys',
        name: 'admin-api-keys',
        component: import('@/views/AdminPanel/ApiKeysView.vue'),
        meta: {
            friendlyName: 'API Keys',
            icon: 'mdi-key',
        },
    },
    {
        path: 'users',
        name: 'admin-users',
        component: import('@/views/AdminPanel/UsersView.vue'),
        meta: {
            friendlyName: 'Users',
            icon: 'mdi-account',
        },
    },
    {
        path: 'videos',
        name: 'admin-videos',
        component: import('@/views/AdminPanel/VideosView.vue'),
        meta: {
            friendlyName: 'Videos',
            icon: 'mdi-video',
        },
    },
];

export const ADMIN_ROUTES = [
    {
        path: '/manage/',
        name: 'admin',
        component: import('@/views/AdminPanelView.vue'),
        meta: {
            auth: AuthState.LoggedIn,
        },
        children,
    },
];
