<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';

import { UserRole } from '@/_gql/graphql';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';

import UserIcon from '@/icons/UserIcon.vue';
import SearchIcon from '@/icons/SearchIcon.vue';
import AddIcon from '@/icons/AddIcon.vue';
import HomeIcon from '@/icons/HomeIcon.vue';
import LogOutIcon from '@/icons/LogOutIcon.vue';

import WeebifyPopup from '@/components/WeebifyPopup.vue';
import DropDown from '@/components/DropDown.vue';
import NewMedia from '@/components/Media/NewMedia.vue';
import WeebifyNotification from '@/components/Notifications/WeebifyNotification.vue';
import AdminIcon from './icons/AdminIcon.vue';

const auth = useAuthStore();
auth.init();
const notif = useNotificationStore();
const router = useRouter();
const showNew = ref(false);

function logout() {
    auth.logOut();
    router.push({ name: 'index' });
}

const canEdit = computed(
    () => auth.me?.role === UserRole.Admin || auth.me?.role === UserRole.God
);
</script>

<template>
    <div id="notifications">
        <transition-group name="notif-list">
            <WeebifyNotification
                v-for="n in notif.notifications"
                :key="n.id"
                :type="n.type"
                :text="n.message"
                :duration="n.time"
                @done="
                    () => {
                        notif.removeNotification(n.id);
                    }
                "
            />
        </transition-group>
    </div>
    <nav class="blur">
        <RouterLink to="/" id="logo">
            <img src="@/assets/icons/logo.svg" alt="logo" />
            Weebify
        </RouterLink>
        <div :style="{ flex: 1 /* spacer */ }"></div>

        <button
            class="reset nav-icon-link"
            v-if="auth.loggedIn && canEdit"
            @click="() => (showNew = true)"
        >
            <AddIcon />
        </button>

        <RouterLink
            class="nav-icon-link"
            to="/search"
            v-if="auth.loggedIn && canEdit"
        >
            <SearchIcon class="transition-stroke" />
        </RouterLink>

        <RouterLink class="nav-icon-link" to="/login" v-if="!auth.loggedIn">
            <UserIcon class="transition-stroke" />
            Log in
        </RouterLink>
        <DropDown v-else-if="auth.me">
            <template #default>
                <div class="nav-icon-link">
                    <!-- TODO: fix CDN -->
                    <img
                        :src="`/cdn/pfp/${auth.me.pfp}/tiny.webp`"
                        alt="Profile picture"
                    />
                    {{ auth.me.username }}
                </div>
            </template>

            <template #popup>
                <RouterLink to="/home" class="nav-icon-link">
                    <HomeIcon class="transition-stroke" />
                    Home
                </RouterLink>
                <RouterLink
                    :to="{
                        name: 'user',
                        params: { username: auth.me.username },
                    }"
                    class="nav-icon-link"
                >
                    <UserIcon class="transition-stroke" />
                    Profile
                </RouterLink>
                <RouterLink
                    :to="{
                        name: 'user',
                        params: { username: auth.me.username },
                    }"
                    v-if="auth.isAdmin"
                    class="nav-icon-link"
                >
                    <AdminIcon class="transition-stroke" />
                    Admin
                </RouterLink>
                <a href="#" class="nav-icon-link" @click.prevent="logout">
                    <LogOutIcon class="transition-stroke" />
                    Logout
                </a>
            </template>
        </DropDown>
    </nav>
    <router-view :style="{ flex: 1 }" />
    <WeebifyPopup v-model:show="showNew" title="Add media">
        <NewMedia />
    </WeebifyPopup>
</template>

<style lang="less">
#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;

    #notifications {
        z-index: 200;
        position: fixed;
        top: 0;
        right: 0;

        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 10px;
        width: 300px;
    }

    nav {
        z-index: 100;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 64px;
        padding: 0 12px;

        display: flex;
        flex-direction: row;
        align-items: center;
        user-select: none;

        #logo {
            font-size: 32px;
            font-weight: 400;
            color: @c-snow;
            text-decoration: none;
            line-height: 48px;

            img {
                vertical-align: middle;
                display: inline-block;
                height: 48px;
            }
        }

        .nav-icon-link {
            display: flex;
            color: @c-snow;
            text-decoration: none;
            font-weight: 500;
            align-items: center;
            transition: color @t-subtle ease;
            font-size: 14px;
            cursor: pointer;

            img {
                width: 48px;
                height: 48px;
                object-fit: cover;
                border-radius: 50%;
                margin-right: 10px;
                outline: 2px solid #0000;
                transition: outline ease @t-subtle;
            }

            &:hover {
                color: @c-cyan;

                svg {
                    stroke: @c-cyan;
                }

                img {
                    outline: 2px solid @c-cyan;
                }
            }
        }

        &.solid {
            background-color: @c-mirage;
        }

        &.transparent {
            background-color: transparent;
        }

        &.blur {
            background-color: fade(@c-mirage, 75%);
            backdrop-filter: blur(5px);
        }
    }

    main {
        padding-top: 64px;
    }
}

.fade-enter-active,
.fade-leave-active {
    top: 0;
    transition: opacity 0.2s ease;
    position: absolute;
}

.fade-enter-from,
.fade-leave-to {
    top: 0;
    position: absolute;
    opacity: 0;
}

.notif-list-move,
.notif-list-enter-active,
.notif-list-leave-active {
    transition: all 0.5s ease;
}

.notif-list-enter-from {
    opacity: 0;
    transform: translateY(300px);
}

.notif-list-leave-to {
    opacity: 0;
    transform: translatex(300px);
}

.notif-list-leave-active {
    position: absolute;
}
</style>
