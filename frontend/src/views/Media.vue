<script setup lang="ts">
import Popup from '@/components/Popup.vue';
import { useAuthStore } from '@/stores/auth';
import { gql } from '@/_gql';
import { UserRole, MediaKind } from '@/_gql/graphql';
import { useApolloClient, useQuery } from '@vue/apollo-composable';
import { computed, ref } from 'vue';
import EditMedia from '@/components/Media/EditMedia.vue';
import { useNotificationStore } from '@/stores/notifications';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const apollo = useApolloClient();
const notify = useNotificationStore();
const router = useRouter();

const MEDIA_QUERY = gql(`
query MediaPage($id: String!) {
  mediaById(id: $id) {
    id,
    title
	altTitles
    description
    anilistId
    genres
    kind
    year
    cover
    coverColor
    status
    episodes {
      episodeNumber
      extra
      title
      episodeStatus
    }
  }
}
`);
const props = defineProps<{ id: string }>();

const { loading, result, error, refetch } = useQuery(MEDIA_QUERY, {
    id: props.id,
});

const media = computed(() => result.value?.mediaById);

const canEdit = computed(
    () => auth.me?.role === UserRole.Admin || auth.me?.role === UserRole.God
);

const bgStyle = computed(() => {
    return {
        background: `linear-gradient(to bottom, #14131c00, #14131c), url('/cdn/cover/${result.value?.mediaById.cover}/full.webp')`,
        backgroundColor: result.value?.mediaById.coverColor ?? '#0000',
    };
});

const coverStyle = computed(() => {
    return {
        background: `url('/cdn/cover/${result.value?.mediaById.cover}/full.webp')`,
        backgroundColor: result.value?.mediaById.coverColor ?? '#888',
    };
});

const deleting = ref(false);
const DELETE_MEDIA_MUT = gql(`
    mutation DeleteMedia($id:String!) {
        removeMedia(id:$id)
    }
`);

async function deleteMedia() {
    deleting.value = true;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: DELETE_MEDIA_MUT,
            variables: {
                id: media.value?.id ?? '',
            },
        });
        if (errors) {
            //show error
            notify.addNotification(
                'error',
                errors[0].message ?? `Unknow error removing media!`
            );
        } else if (data?.removeMedia) {
            notify.addNotification('info', `Sucessfully removed media`);
            router.push({ name: 'browse' });
        }
    } catch {
        notify.addNotification('error', `Unknow error removing media!`);
    } finally {
        loading.value = false;
    }
}

const showBigDescription = ref(false);
const confirmDelete = ref(false);
const showEdit = ref(false);
</script>

<template>
    <main class="detailed-view">
        <Popup :title="media?.title ?? ''" v-model:show="showBigDescription">
            <p>
                {{ media?.description }}
            </p>
        </Popup>
        <Popup title="Edit media" v-model:show="showEdit">
            <EditMedia
                @updated="() => refetch()"
                :id="media?.id ?? ''"
                :current-data="media"
            />
        </Popup>
        <Popup title="Confirmation" v-model:show="confirmDelete">
            <p>Are you sure you want to delete this media?</p>
            <button
                class="w-big-button w-button-green mr10"
                :disabled="deleting"
                @click="deleteMedia"
            >
                Yes
            </button>
            <button
                class="w-big-button w-button-red"
                :disabled="deleting"
                @click="() => (confirmDelete = false)"
            >
                No
            </button>
        </Popup>

        <div class="bg" :style="bgStyle"></div>
        <div class="top">
            <div class="cover" :style="coverStyle"></div>
            <div class="metadata">
                <div class="buttons">
                    <span
                        class="status"
                        :class="media?.status?.toLowerCase() ?? 'loading'"
                        >{{ media?.status }}</span
                    >
                    <div style="flex: 1"></div>
                    <template v-if="canEdit">
                        <button
                            class="w-medium-button"
                            @click="() => (showEdit = true)"
                        >
                            Edit
                        </button>
                        <button
                            class="w-medium-button w-button-red"
                            @click="() => (confirmDelete = true)"
                        >
                            Delete
                        </button>
                    </template>
                    <a
                        v-if="media?.anilistId"
                        :href="`https://anilist.co/anime/${media?.anilistId}`"
                        class="anilist"
                    >
                        <img
                            src="@/assets/icons/anilist.svg"
                            alt="View on AniList"
                        />
                    </a>
                </div>
                <h2 class="alt-title" v-for="title in media?.altTitles">
                    {{ title }}
                </h2>
                <h1>{{ media?.title }} ({{ media?.year }})</h1>
                <div class="tags">
                    <span
                        class="tag"
                        v-for="(tag, index) in media?.genres"
                        :key="index"
                        >{{ tag }}</span
                    >
                </div>
                <p
                    class="description"
                    @click="() => (showBigDescription = true)"
                >
                    {{ media?.description }}
                </p>
            </div>
        </div>

        <div class="episodes" v-if="media?.kind === MediaKind.Tv">
            <div class="season">
                <!-- <episode
                    v-for="(ep, index) in season.episodes"
                    :key="index"
                    :season="ep.season"
                    :episode="ep.episode"
                    :extra="ep.extraName"
                    :title="ep.title ?? cleanTitle"
                    :length="ep.length"
                    :progress="ep.progress"
                /> -->
            </div>
        </div>

        <div class="movie" v-if="media?.kind === MediaKind.Tv"></div>
    </main>
</template>

<style lang="less" scoped>
@blur-size: 5px;

.mr10 {
    margin-right: 10px;
}
.detailed-view {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    min-height: 100vh;
    background: linear-gradient(
        to bottom,
        #26244000 90%,
        fade(@c-mirage, 50%) 100%
    );
    padding-top: 4em;
    height: fit-content;

    > * {
        align-self: center;
    }
    .bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50vh;
        background: linear-gradient(to bottom, #14131c00, #14131c),
            /* hi */ url('../assets/cover.jpg');
        background-size: cover !important;
        background-position: center !important;
        filter: blur(@blur-size);
        z-index: -10;
    }
    .top {
        margin-top: 16px;
        width: min(97vw, 150vh);
        display: flex;
        flex-direction: row;
        gap: 2em;
    }
    .cover {
        display: block;
        align-self: center;
        object-fit: cover;
        max-width: 20vw;
        height: 70%;
        width: 100vw;
        aspect-ratio: 2/3;
        border-radius: 1em;
        background-color: gray;
        box-shadow: @c-mirage 0 0 10px;
        background-size: cover !important;
    }
    .metadata {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: 0.5em;
        h1 {
            text-shadow: #000f 0 0 @blur-size;
            margin: 0;
            font-size: 4em;
            font-weight: 300;
        }

        .buttons {
            display: flex;
            flex-direction: row;
            gap: 10px;
            align-items: center;

            .anilist {
                cursor: pointer;
                opacity: 80%;
                & > img {
                    height: 32px;
                }
                &:hover {
                    transition: @t-subtle opacity ease;
                    opacity: 100%;
                    filter: drop-shadow(0 0 5px @c-cyan);
                }
            }

            .status {
                background-color: gray;
                padding: 0.2rem 0.4rem;
                border-radius: 5px;
                font-weight: 500;

                &.finished {
                    background-color: @c-algae;
                    color: @c-oil;
                }

                &.airing {
                    background-color: @c-mandy;
                }

                &.upcoming {
                    background-color: @c-cyan;
                }
            }
        }

        .alt-title {
            text-shadow: #000f 0 0 @blur-size;
            margin: 0;
            font-size: 2em;
            font-weight: 300;
        }
        .tags {
            display: flex;
            flex-direction: row;
            font-size: 0.8em;
            font-weight: bold;
            gap: 0.5em;
            flex-wrap: wrap;

            .tag {
                background-color: darken(@c-cyan, 10%);
                padding: 0.3em 0.5em;
                border-radius: 1em;
                white-space: nowrap;
            }
        }

        .description {
            line-height: 1.5em;

            //clamp lines
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;

            //gradient
            background: linear-gradient(@c-snow 60%, @c-clay 90%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;

            cursor: pointer;

            &:hover {
                background: linear-gradient(
                    @c-cyan 60%,
                    fade(@c-cyan, 70%) 90%
                );
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        }
    }
}
.episodes {
    max-width: 150vh;
    width: 100%;
    display: grid;
    grid-gap: 3em;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    margin-bottom: 2rem;
    padding-top: 3em;
    padding: 1rem;
    margin: 1rem;
    .season {
        padding: 1em;
        border-radius: 1em;
        background-color: @c-mirage;
    }
}

@media only screen and (max-width: 50em) {
    .top {
        flex-direction: column !important;
        align-items: center;
    }
    .metadata {
        text-align: center;
    }
    .tags {
        justify-content: center;
    }
}
</style>
