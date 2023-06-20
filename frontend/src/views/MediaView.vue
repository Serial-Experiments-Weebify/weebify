<script setup lang="ts">
import WeebifyPopup from '@/components/WeebifyPopup.vue';
import { useAuthStore } from '@/stores/auth';
import { gql } from '@/_gql';
import { UserRole, MediaKind, type Episode } from '@/_gql/graphql';
import { useApolloClient, useQuery } from '@vue/apollo-composable';
import { computed, ref, watch, type ComponentPublicInstance } from 'vue';
import EditMedia from '@/components/Media/EditMedia.vue';
import { useNotificationStore } from '@/stores/notifications';
import { useRouter } from 'vue-router';
import QuickfillEpisodes from '@/components/Media/QuickfillEpisodes.vue';
import AddEpisode from '@/components/Media/AddEpisode.vue';
import EditEpisode from '@/components/Media/EditEpisode.vue';
import { useMousePressed } from '@vueuse/core';
import LinkVideo from '@/components/Media/LinkVideo.vue';
import { useURLStore } from '@/stores/url';

const auth = useAuthStore();
const apollo = useApolloClient();
const notify = useNotificationStore();
const router = useRouter();
const url = useURLStore();

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
    videoId
    episodes {
      id
      episodeNumber
      extra
      title
      episodeStatus
      videoId
    }
  }
}
`);
const props = defineProps<{ id: string }>();

const highlightId = computed(() => router.currentRoute.value.hash.substring(1));
const { pressed: mousePressed } = useMousePressed();

const episodeElements = ref<ComponentPublicInstance[]>();

watch(episodeElements, (els) => {
    if (!els) return;

    els.find((x) =>
        (x.$el as HTMLElement | undefined)?.classList.contains('highlighted')
    )?.$el?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
    });
});

watch(mousePressed, () => {
    if (router.currentRoute.value.hash.startsWith('#'))
        router.replace({ hash: '' });
});

const { loading, result, refetch } = useQuery(MEDIA_QUERY, {
    id: props.id,
});

const media = computed(() => result.value?.mediaById);

const canEdit = computed(
    () => auth.me?.role === UserRole.Admin || auth.me?.role === UserRole.God
);

const bgStyle = computed(() => {
    return {
        backgroundImage: `linear-gradient(to bottom, #14131c00, #14131c), url('${url.getCoverURL(
            'full',
            result.value?.mediaById.cover
        )}')`,
        backgroundColor: result.value?.mediaById.coverColor ?? '#0000',
    };
});

const coverStyle = computed(() => {
    return {
        backgroundImage: `linear-gradient(to bottom, #14131c00, #14131c), url('${url.getCoverURL(
            'full',
            result.value?.mediaById.cover
        )}')`,
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
            notify.addNotification(
                'error',
                errors[0].message ?? `Unknown error removing media!`
            );
        } else if (data?.removeMedia) {
            notify.addNotification('success', `Sucessfully removed media`);
            router.push({ name: 'search' });
        }
    } catch (e) {
        notify.addNotification('error', `Unknown error removing media!`);
        console.error(e);
    } finally {
        loading.value = false;
    }
}

type Ep = Omit<Episode, 'videoId'>;

function showEditEpisode(e: Ep) {
    selectedEpisode.value = e;
    showEpisodeEdit.value = true;
}

function showDeletePrompt(e: Ep) {
    selectedEpisode.value = e;
    showDeleteEpisode.value = true;
}

const DELETE_EPISODE_MUT = gql(`
    mutation deleteEpisode($mid: String!, $eid: String!) {
        removeEpisode(mediaId: $mid, episodeId: $eid)
    }
`);

async function deleteEpisode() {
    deleting.value = true;
    try {
        const { data, errors } = await apollo.client.mutate({
            mutation: DELETE_EPISODE_MUT,
            variables: {
                mid: media.value?.id ?? '',
                eid: selectedEpisode.value?.id ?? '',
            },
        });
        if (errors) {
            notify.addNotification(
                'error',
                errors[0].message ?? `Unknown error removing episode!`
            );
        } else if (data?.removeEpisode) {
            notify.addNotification('success', `Sucessfully removed episode`);
            showDeleteEpisode.value = false;
            refetch();
        }
    } catch {
        notify.addNotification('error', `Unknown error removing episode!`);
    } finally {
        loading.value = false;
    }
}

const showBigDescription = ref(false);
const confirmDelete = ref(false);
const showEdit = ref(false);
const showNewEpisode = ref(false);
const showEpisodeEdit = ref(false);
const showQuickfill = ref(false);
const showDeleteEpisode = ref(false);
const selectedEpisode = ref<Ep | null>(null);
</script>

<template>
    <main class="detailed-view">
        <!-- Description popup -->
        <WeebifyPopup
            :title="media?.title ?? ''"
            v-model:show="showBigDescription"
        >
            <p>
                {{ media?.description }}
            </p>
        </WeebifyPopup>

        <!-- Edit popup -->
        <WeebifyPopup title="Edit media" v-model:show="showEdit">
            <EditMedia
                @updated="() => refetch()"
                :id="media?.id ?? ''"
                :current-data="media"
            />
        </WeebifyPopup>

        <!-- Delete Popup -->
        <WeebifyPopup title="Confirmation" v-model:show="confirmDelete">
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
        </WeebifyPopup>

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
                <h2
                    class="alt-title"
                    v-for="(title, i) in media?.altTitles"
                    :key="i"
                >
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

        <!-- TV -->
        <div class="media-list" v-if="media?.kind === MediaKind.Tv">
            <div class="episode-buttons" v-if="canEdit">
                <span>Episode tools: </span>
                <button
                    class="w-medium-button"
                    @click="() => (showNewEpisode = true)"
                >
                    Add Episode
                </button>
                <WeebifyPopup title="Add episode" v-model:show="showNewEpisode">
                    <AddEpisode
                        :mId="media.id"
                        @updated="
                            () => {
                                refetch();
                                showNewEpisode = false;
                            }
                        "
                    />
                </WeebifyPopup>
                <button
                    class="w-medium-button w-button-green"
                    @click="() => (showQuickfill = true)"
                >
                    Quickfill
                </button>

                <WeebifyPopup title="Quickfill" v-model:show="showQuickfill">
                    <QuickfillEpisodes
                        :id="media.id"
                        @updated="
                            () => {
                                showQuickfill = false;
                                refetch();
                            }
                        "
                    />
                </WeebifyPopup>
            </div>
            <div class="episodes">
                <WeebifyPopup
                    v-model:show="showEpisodeEdit"
                    title="Edit episode"
                >
                    <EditEpisode
                        :mId="media.id"
                        :episode="selectedEpisode!"
                        @updated="
                            () => {
                                refetch();
                                showEpisodeEdit = false;
                            }
                        "
                    />
                </WeebifyPopup>

                <WeebifyPopup
                    title="Confirm delete"
                    v-model:show="showDeleteEpisode"
                >
                    <p>
                        Are you sure you want to delete <br />
                        Episode {{ selectedEpisode?.episodeNumber
                        }}{{ selectedEpisode?.extra ?? '' }} -
                        {{ selectedEpisode?.title }} ?
                    </p>
                    <button
                        class="w-big-button w-button-green mr10"
                        :disabled="deleting"
                        @click="deleteEpisode"
                    >
                        Yes
                    </button>
                    <button
                        class="w-big-button w-button-red"
                        :disabled="deleting"
                        @click="() => (showDeleteEpisode = false)"
                    >
                        No
                    </button>
                </WeebifyPopup>
                <RouterLink
                    v-for="episode in media.episodes"
                    :key="episode.id"
                    :to="{
                        name: 'watch',
                        params: { mid: media.id, eid: episode.id },
                    }"
                    ref="episodeElements"
                    class="episode"
                    :class="{
                        disabled: !episode.videoId,
                        highlighted: episode.id == highlightId,
                    }"
                >
                    <span
                        class="status"
                        :class="episode.episodeStatus.toLowerCase()"
                    >
                        {{ episode.episodeStatus }}
                    </span>
                    <span
                        >Episode {{ episode.episodeNumber
                        }}{{ episode.extra ?? '' }} - {{ episode.title }}</span
                    >
                    <div style="flex: 1"></div>
                    <div
                        class="episode-edit"
                        v-if="canEdit"
                        @click.prevent.stop
                    >
                        <LinkVideo
                            :media-id="media.id"
                            :episode-id="episode.id"
                            :video-id="episode.videoId"
                        />
                        <button
                            class="w-medium-button w-button-blue"
                            @click="() => showEditEpisode(episode)"
                        >
                            Edit
                        </button>
                        <button
                            class="w-medium-button w-button-red"
                            @click="() => showDeletePrompt(episode)"
                        >
                            Delete
                        </button>
                    </div>
                </RouterLink>
            </div>
        </div>

        <!-- Movie -->
        <div
            class="media-list movie-play"
            v-else-if="media?.kind === MediaKind.Movie"
        >
            <div class="movie-edit" v-if="canEdit">
                <LinkVideo :media-id="media.id" :video-id="media.videoId" />
            </div>
            <RouterLink
                :to="{ name: 'watch', params: { mid: media.id } }"
                class="w-huge-button"
            >
                Play
            </RouterLink>
        </div>
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
        background-image: linear-gradient(to bottom, #14131c00, #14131c),
            url('../assets/images/coverDefault.webp');
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
        flex: 1;
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
.media-list {
    max-width: 150vh;
    width: calc(100% - 100px);
    margin-bottom: 2rem;
    padding-top: 3em;
    padding: 1rem;
    margin: 1rem;
    border-radius: 1em;
    background-color: @c-mirage;
    display: flex;
    flex-direction: column;

    a {
        display: block;
        width: fit-content;
        margin: 10px;
    }

    .episode-buttons {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
        span {
            font-weight: bold;
        }
        margin-bottom: 10px;
    }
    .episodes {
        display: flex;
        flex-direction: column;
        gap: 5px;

        .episode {
            text-decoration: none;
            color: @c-snow;
            display: flex;
            gap: 10px;
            margin: 0;
            flex-direction: row;
            align-items: center;
            padding: 5px;
            border-radius: 5px;
            width: 100%;
            box-sizing: border-box;

            &.disabled {
                color: @c-clay;
            }

            &.highlighted {
                animation: episode-hl 1s ease infinite;
            }

            .status {
                background-color: gray;
                padding: 0.2rem 0.4rem;
                border-radius: 5px;
                font-weight: 500;
                color: @c-oil;

                &.aired {
                    background-color: @c-algae;
                }

                &.upcoming {
                    background-color: @c-cyan;
                }
            }

            &:hover {
                background-color: fade(@c-cyan, 70%) !important;
            }

            &.disabled:hover {
                background-color: fade(@c-clay, 20%) !important;
            }

            &:nth-child(odd) {
                background-color: fade(@c-oil, 50%);
            }

            .episode-edit {
                display: flex;
                gap: 10px;
                margin: 0;
                flex-direction: row;
                align-items: center;
            }
        }
    }
}

.movie-play {
    display: flex;
    flex-direction: row;
    align-items: center;
    .movie-edit {
        flex: 1;
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

@keyframes episode-hl {
    0% {
        outline: 2px solid transparent;
    }

    50% {
        outline: 2px solid @c-mandy;
    }

    100% {
        outline: 2px solid transparent;
    }
}
</style>
