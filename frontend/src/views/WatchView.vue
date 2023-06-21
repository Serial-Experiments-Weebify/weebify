<script lang="ts" setup>
import { gql } from '@/_gql';
import { WeebifyVideoType, type VideoV0, type VideoV1 } from '@/_gql/graphql';
import ToggleButton from '@/components/ToggleButton.vue';
import router from '@/router';
import { useQuery } from '@vue/apollo-composable';
import { computed, ref, watch } from 'vue';
import WeebifyVideo from '@/components/Video/WeebifyPlayer.vue';
import { useURLStore } from '@/stores/url';

const url = useURLStore();

const props = defineProps<{ mid: string; eid?: string }>();

const { result, loading, error, refetch } = useQuery(
    gql(`
        query Watch($mid: String!, $eid:String) {
                watch(mid:$mid, eid:$eid) {
                    title,
                    episodes {
            	    	id
                        title
                        episodeStatus
                        episodeNumber
                        extra
                    }
                    nextEpisode {
            	    	id
                        title
                        episodeStatus
                        episodeNumber
                        extra
                    }
                    previousEpisode {
            	    	id
                        title
                        episodeStatus
                        episodeNumber
                        extra
                    }
                    currentEpisode {
            	    	id
                        title
                        episodeStatus
                        episodeNumber
                        extra
                    }
                    video {
                        ...on VideoV0 {
                            type
                            video
                        }
                        ... on VideoV1 {
                            id
                            type
                            created
                            fonts {
                                name
                                cdnName
                            }
                            subtitles {
                                default
                                name
                                lang
                                file
                            }
                            resolutions {
                                name
                                w
                                h
                            }
                            chapters {
                                start	
                            	end
                                title
                            }
                        }
                    }
                }
                mediaById(id:$mid) {
                    cover
                    coverColor
                }
            }
    `),
    () => ({
        mid: props.mid,
        eid: props.eid,
    })
);

watch(props, () => {
    refetch();
});

const hasEpisodes = computed(() => !!props.eid);

const bgStyle = computed(() => {
    return {
        backgroundImage: `linear-gradient(to bottom, #14131c00, #14131c), url('${url.getCoverURL(
            'full',
            result.value?.mediaById.cover
        )}')`,
        backgroundColor: result.value?.mediaById.coverColor ?? '#0000',
    };
});

function nextEp() {
    router.replace({
        name: 'watch',
        params: {
            mid: props.mid,
            eid: result.value?.watch.nextEpisode?.id,
        },
    });
}

function prevEp() {
    router.replace({
        name: 'watch',
        params: {
            mid: props.mid,
            eid: result.value?.watch.previousEpisode?.id,
        },
    });
}

const useFallback = ref(false);
</script>

<template>
    <main>
        <div class="bg" :style="bgStyle"></div>

        <pre v-if="loading">Loading...</pre>
        <pre v-else-if="error">{{ error }}</pre>

        <div v-else class="watch sane-width">
            <div class="header">
                <button
                    class="arrow-button prev"
                    :disabled="!result?.watch.previousEpisode"
                    v-if="hasEpisodes"
                    @click="prevEp"
                >
                    <svg
                        width="32"
                        height="35"
                        viewBox="0 0 64 70"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M44 3L20 35L44 67"
                            stroke-width="6"
                            stroke-linecap="round"
                        />
                    </svg>
                </button>

                <div class="title" v-if="hasEpisodes">
                    <h2>
                        {{ result?.watch.title }} - Episode
                        {{ result?.watch.currentEpisode?.episodeNumber
                        }}{{ result?.watch.currentEpisode?.extra ?? '' }}
                    </h2>
                    <h1>
                        {{ result?.watch.currentEpisode?.title }}
                    </h1>
                </div>
                <div class="title" v-else>
                    <h1>
                        {{ result?.watch.title }}
                    </h1>
                </div>

                <button
                    class="arrow-button next"
                    :disabled="!result?.watch.nextEpisode"
                    v-if="hasEpisodes"
                    @click="nextEp"
                >
                    <svg
                        width="32"
                        height="35"
                        viewBox="0 0 64 70"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M20 3L44 35L20 67"
                            stroke-width="6"
                            stroke-linecap="round"
                        />
                    </svg>
                </button>
            </div>
            <div class="horizontal">
                <div class="viewer">
                    <div class="video-container">
                        <div v-if="!result?.watch.video" class="novideo">
                            <span> No video available </span>
                        </div>
                        <video
                            v-else-if="
                                result.watch.video.type == WeebifyVideoType.V0
                            "
                            class="video-v0"
                            :src="`/cdn/weebify/${(result.watch.video as VideoV0).video}`"
                            controls
                        ></video>
                        <video
                            v-else-if="useFallback"
                            class="video-v0"
                            :src="`/cdn/weebify/video/${(result.watch.video as VideoV1).id}/fallback.mp4`"
                            controls
                        ></video>
                        <WeebifyVideo
                            v-else
                            :vid="(result?.watch.video as VideoV1).id"
                            :chapters="(result?.watch.video as VideoV1).chapters"
                            :resolutions="(result?.watch.video as VideoV1).resolutions"
                            :subtitles="(result?.watch.video as VideoV1).subtitles"
                            :fonts="(result?.watch.video as VideoV1).fonts"
                        />
                    </div>
                    <div class="player-settings">
                        Use fallback player:
                        <ToggleButton v-model:value="useFallback" />
                        <div class="note">(Maximizes compatibility)</div>
                    </div>
                </div>
                <div class="ep-wrap">
                    <div class="episodes" v-if="hasEpisodes">
                        <RouterLink
                            v-for="ep in result?.watch.episodes ?? []"
                            :key="ep.id"
                            :to="{
                                name: 'watch',
                                params: {
                                    mid: props.mid,
                                    eid: ep.id,
                                },
                            }"
                            exact-active-class="active"
                            class="episode"
                        >
                            <span class="ep-number">
                                <span
                                    class="status"
                                    :class="ep.episodeStatus"
                                ></span>
                                Episode {{ ep.episodeNumber
                                }}{{ ep.extra ?? '' }}
                            </span>

                            <div>
                                {{ ep.title }}
                            </div>
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped lang="less">
.arrow-button {
    background-color: transparent;
    border: none;
    outline: none;
    cursor: pointer;

    svg {
        stroke: @c-clay;
        transition: stroke @t-subtle ease;
    }

    &:disabled {
        svg {
            stroke: @c-mirage;
        }
        cursor: not-allowed;
    }

    &:not(:disabled):hover svg {
        stroke: @c-cyan;
    }
}

main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    .bg {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom, #14131c00, #14131c),
            url('../assets/cover.jpg');
        background-size: cover !important;
        background-position: center !important;
        filter: blur(5px);
        z-index: -10;
    }

    .watch {
        width: 100%;
        display: flex;
        gap: 10px;
        flex-direction: column;
        align-items: stretch;

        .header {
            background-color: @c-oil;
            display: flex;
            flex-direction: row;
            border-radius: 10px;

            .title {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                text-align: center;
                padding: 0.5rem;
                gap: 0.5rem;

                h2 {
                    font-weight: bold;
                    font-size: 1.5rem;
                    margin: 0;
                }
                h1 {
                    margin: 0;
                    font-weight: normal;
                    font-size: 2rem;
                }
            }
        }
        .horizontal {
            flex: 1;
            display: flex;
            flex-direction: row;
            gap: 1rem;

            .viewer {
                gap: 1rem;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: stretch;
                padding: 1rem;
                background-color: @c-oil;
                border-radius: 10px;
                overflow: hidden;

                .note {
                    margin-top: 0.2rem;
                    font-size: 0.8rem;
                    color: @c-clay;
                }
            }

            .ep-wrap {
                position: relative;
                border-radius: 10px;
                width: 300px;
                background-color: @c-oil;
                overflow: hidden;
            }

            .episodes {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;

                overflow-y: scroll;

                display: flex;
                flex-direction: column;

                .episode {
                    display: block;

                    color: @c-snow;
                    text-decoration: none;

                    padding: 0.5rem 0.5rem;

                    transition: background-color @t-subtle ease;

                    &.active {
                        background-color: fade(@c-mandy, 60%);
                    }

                    &.active:hover {
                        background-color: color-mix(
                            in hsl shorter hue,
                            fade(@c-cyan, 80%),
                            fade(@c-mandy, 80%)
                        );
                    }

                    &:hover {
                        background-color: fade(@c-cyan, 50%);
                    }

                    .ep-number {
                        font-weight: bold;
                    }

                    .status {
                        background-color: @c-cyan;
                        display: inline-block;
                        width: 0.8rem;
                        aspect-ratio: 1;
                        border-radius: 50%;

                        &.Aired {
                            background-color: @c-algae;
                        }
                    }
                }
            }
        }
    }
}

.video-container {
    width: 100%;
    background-color: black;
    aspect-ratio: 16/9;

    position: relative;
    overflow: hidden;
    border-radius: 3px;

    :deep(& > *) {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
    }
}

.novideo {
    display: flex;
    justify-content: center;
    align-items: center;
    color: @c-mandy;
    text-align: center;
    vertical-align: middle;
    max-height: 100%;

    span {
        font-size: 2rem;
        font-weight: bold;
    }
}

.video-v0 {
    object-fit: contain;
    outline: none;
}
</style>
