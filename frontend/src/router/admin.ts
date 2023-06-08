import AdminPanelView from '@/views/AdminPanelView.vue';
import { AuthState } from './meta';

import ActionsView from '@/views/AdminPanel/ActionsView.vue';
import ApiKeysView from '@/views/AdminPanel/ApiKeysView.vue';
import UsersView from '@/views/AdminPanel/UsersView.vue';
import VideosView from '@/views/AdminPanel/VideosView.vue';

export const children = [
    {
        path: 'actions',
        name: 'admin-actions',
        component: ActionsView,
        meta: {
            friendlyName: 'Actions',
            icon: 'mdi-cog',
        },
    },
    {
        path: 'api-keys',
        name: 'admin-api-keys',
        component: ApiKeysView,
        meta: {
            friendlyName: 'API Keys',
            icon: 'mdi-key',
        },
    },
    {
        path: 'users',
        name: 'admin-users',
        component: UsersView,
        meta: {
            friendlyName: 'Users',
            icon: 'mdi-account',
        },
    },
    {
        path: 'videos',
        name: 'admin-videos',
        component: VideosView,
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
        component: AdminPanelView,
        meta: {
            auth: AuthState.LoggedIn,
        },
        children,
    },
];
