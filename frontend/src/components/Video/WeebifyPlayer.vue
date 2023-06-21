<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useFullscreen, useMediaControls } from '@vueuse/core';
import {
    MediaInfo,
    MediaPlayer,
    type Bitrate,
    type MediaPlayerClass,
    type MediaType,
} from 'dashjs';
import SeekBar from './SeekBar.vue';
import { secondsToHMS } from './time';

import { useURLStore } from '@/stores/url';

import fallbackFont from '@/assets/fonts/LiberationMono-Regular.woff2?url';
import libassWorkerJS from 'libass-wasm/dist/js/subtitles-octopus-worker.js?url';
import OctopusSubtitles from 'libass-wasm';

import type {
    VideoChapter,
    VideoFontRef,
    VideoResolution,
    VideoSubtitle,
} from '@/_gql/graphql';

const url = useURLStore();

const props = defineProps<{
    vid: string;
    chapters: VideoChapter[];
    subtitles: VideoSubtitle[];
    resolutions: VideoResolution[];
    fonts: VideoFontRef[];
}>();

const resolutions = ref([] as Bitrate[]);
const resolutionIndex = ref(0);

const audioTracks = ref([] as MediaInfo[]);
const audioTrackIndex = ref(0);

const selectedSubtitles = ref(-1);

const showSettings = ref(false);

//#region DOM interfacing stuff
const video = ref<HTMLVideoElement>();
const root = ref<HTMLDivElement>();

const { playing, currentTime, duration, buffered, volume } =
    useMediaControls(video);
const { isFullscreen, enter: fsEnter, exit: fsExit } = useFullscreen(root);
//#endregion DOM interfacing stuff

//#region DASH and ASS

const octopus = ref<OctopusSubtitles>();
const dashjs = ref<MediaPlayerClass>();

//#endregion DASH and ASS

//#region Initalization and cleanup
onMounted(() => {
    selectedSubtitles.value = props.subtitles.findIndex((x) => x.default);

    const p = (dashjs.value = MediaPlayer().create());

    p.on(MediaPlayer.events.CAN_PLAY, () => {
        // query resolutions and tracks on load
        resolutions.value = p.getTracksFor('video')[0].bitrateList ?? [];
        audioTracks.value = p.getTracksFor('audio');
    });

    p.on(MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e) => {
        // when quality switches, update state
        if (e.mediaType === 'video') {
            resolutionIndex.value = e.newQuality;
        }
    });

    p.on(MediaPlayer.events.TRACK_CHANGE_RENDERED, (e) => {
        // when audio language switches, update state
        const type = (e as any).mediaType as MediaType;
        const newMedia = (e as any).newMediaInfo as MediaInfo;

        if (type == 'audio' && typeof newMedia.index === 'number') {
            audioTrackIndex.value = newMedia.index;
        }
    });

    p.initialize(
        video.value,
        url.getManifestURL(props.vid), //`/cdn/weebify/video/${}/manifest.mpd`
        false
    );

    setSubs(selectedSubtitles.value);
});

// destroy all
onBeforeUnmount(() => {
    if (dashjs.value) {
        dashjs.value.destroy();
        dashjs.value = undefined;
    }

    if (octopus.value) {
        octopus.value.dispose();
        octopus.value = undefined;
    }
});
//#endregion Initalization and cleanup

//#region change stream/track
function setAudioTrack(at: MediaInfo) {
    dashjs.value?.setCurrentTrack(at);
}

function setRes(index: number) {
    dashjs.value?.setQualityFor('video', index, true);
}
//#endregion change stream/track

function setSubs(index: number) {
    console.log([
        'weebifyPlayer',
        'setSubs',
        { from: selectedSubtitles.value, to: index },
    ]);

    selectedSubtitles.value = index;

    if (index == -1 && octopus.value) {
        octopus.value.dispose();
        octopus.value = undefined;
        return;
    }

    const ns = props.subtitles[index];
    if (!ns) return;

    if (octopus.value) {
        octopus.value.setTrackByUrl(url.getSubtitleURL(props.vid, ns.file));
        return;
    }

    const availableFonts: Record<string, string> = {};

    for (const f of props.fonts) {
        availableFonts[f.name] = url.getFontURL(f.cdnName);
    }

    octopus.value = new OctopusSubtitles({
        video: video.value,
        workerUrl: libassWorkerJS,
        fallbackFont,

        subUrl: url.getSubtitleURL(props.vid, ns.file),
        fonts: props.fonts.map((x) => url.getFontURL(x.cdnName)),
        // availableFonts,
    });
}
</script>

<template>
    <div class="container" ref="root">
        <video ref="video" />
        <div class="controls-bottom">
            <div class="settings" v-if="showSettings">
                <div class="resolutions">
                    <span class="st">Video</span>
                    <span
                        v-for="(r, i) in resolutions"
                        :key="r.id"
                        class="res"
                        :class="{ active: i == resolutionIndex }"
                        @click="setRes(i)"
                        >{{ r.width }}x{{ r.height }}</span
                    >
                </div>

                <div class="audio">
                    <span class="st">Audio</span>

                    <span
                        v-for="a in audioTracks"
                        :key="a.id"
                        class="aud"
                        :class="{ active: a.index == audioTrackIndex }"
                        @click="setAudioTrack(a)"
                    >
                        {{ a.lang }}
                    </span>
                </div>

                <div class="subs">
                    <span class="st">Subtitles</span>
                    <span
                        v-for="(s, i) in props.subtitles"
                        :key="s.file"
                        class="sub"
                        :class="{ active: i == selectedSubtitles }"
                        @click="setSubs(i)"
                    >
                        {{ s.name ?? s.lang }}
                    </span>
                </div>
            </div>

            <!-- Seekbar -->
            <SeekBar
                v-model:currentTime="currentTime"
                :duration="duration"
                :buffered="buffered"
            />

            <!-- Buttons -->
            <div class="tc">
                <button @click="playing = !playing">
                    {{ playing ? 'Pause' : 'Play' }}
                </button>

                <span>
                    {{ secondsToHMS(currentTime) }} /
                    {{ secondsToHMS(duration) }}
                </span>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model="volume"
                />
                <div style="flex: 1"></div>

                <button @click="() => (showSettings = !showSettings)">
                    {{ showSettings ? 'Hide' : 'Show' }} Settings
                </button>

                <button @click="() => (isFullscreen ? fsExit() : fsEnter())">
                    {{ isFullscreen ? "Fullscreenn't" : 'Fullscreen' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
.container {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: black;
}

video {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.controls-bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    flex-direction: column;
    align-items: stretch;

    .settings {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: stretch;

        position: absolute;
        top: -170px;
        right: 0;
        width: 300px;
        height: 150px;
        padding: 10px;

        background-color: #0008;

        .st {
            font-weight: bold;
            color: @c-mandy;
        }

        .resolutions,
        .audio,
        .subs {
            flex: 1 1 auto;

            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: start;
            overflow-y: auto;
            overflow-x: none;
        }

        .res,
        .aud,
        .sub {
            cursor: pointer;
            color: white;
            font-size: 12px;

            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &.active {
                color: @c-cyan !important;
            }

            &:hover {
                color: lighten(@c-cyan, 10%);
            }
        }
    }

    .tc {
        display: flex;
        flex-direction: row;
    }
}
</style>
