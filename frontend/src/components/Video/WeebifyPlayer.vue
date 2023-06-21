<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
    useFullscreen,
    useMediaControls,
    useMouseInElement,
    useTimeoutFn,
} from '@vueuse/core';
import {
    MediaInfo,
    MediaPlayer,
    type Bitrate,
    type MediaPlayerClass,
    type MediaType,
} from 'dashjs';
import type {
    VideoChapter,
    VideoFontRef,
    VideoResolution,
    VideoSubtitle,
} from '@/_gql/graphql';

import fallbackFont from '@/assets/fonts/LiberationMono-Regular.woff2?url';
import libassWorkerJS from 'libass-wasm/dist/js/subtitles-octopus-worker.js?url';
import OctopusSubtitles from 'libass-wasm';

import { secondsToHMS } from './time';

import { useURLStore } from '@/stores/url';

import SeekBar from './SeekBar.vue';
import PlayPauseIcon from './Icons/PlayPauseIcon.vue';
import FullscreenIcon from './Icons/FullscreenIcon.vue';
import SettingsIcon from './Icons/SettingsIcon.vue';

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
const root = ref<HTMLDivElement>();
const video = ref<HTMLVideoElement>();
const controls = ref<HTMLDivElement>();

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

//#region change stream/track/subs
function setAudioTrack(at: MediaInfo) {
    dashjs.value?.setCurrentTrack(at);
}

function setRes(index: number) {
    dashjs.value?.setQualityFor('video', index, true);
}

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
//#endregion change stream/track

const mouseMoved = ref(false);

const { isOutside } = useMouseInElement(controls);

const { x: mx, y: my, isOutside: outsidePlayer } = useMouseInElement(root);

const { stop, start } = useTimeoutFn(() => {
    mouseMoved.value = false;
}, 2000);

watch([mx, my], () => {
    if (outsidePlayer.value) return;
    mouseMoved.value = true;
    stop();
    start();
});

const showControls = computed(
    () =>
        !playing.value ||
        showSettings.value ||
        !isOutside.value ||
        mouseMoved.value
);
</script>

<template>
    <div
        tabindex="0"
        class="container"
        @keydown.capture.space="playing = !playing"
        @keydown.capture.k="playing = !playing"
        @keydown.capture.f="isFullscreen ? fsExit() : fsEnter()"
        @keydown.capture.left="currentTime -= 5"
        @keydown.capture.j="currentTime -= 5"
        @ketdown.capture.right="currentTime += 5"
        @keydown.capture.l="currentTime += 5"
        ref="root"
        :class="{ hide: !showControls }"
    >
        <video ref="video" @click="playing = !playing" />
        <div class="controls-bottom" ref="controls">
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
                :chapters="props.chapters"
            />

            <!-- Buttons -->
            <div class="tc">
                <button @click="playing = !playing">
                    <PlayPauseIcon :playing="playing" />
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
                    <SettingsIcon />
                </button>

                <button @click="() => (isFullscreen ? fsExit() : fsEnter())">
                    <FullscreenIcon :fullscreen="isFullscreen" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;

    :deep(svg) {
        transition: all 0.2s ease-in-out;

        fill: lighten(@c-mandy, 30%);
        filter: drop-shadow(1px 1px 10px @c-oil);
    }

    :deep(&:hover > svg) {
        fill: lighten(@c-mandy, 5%) !important;
        transform: scale(1.2);
    }
}
.container {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: black;

    &.hide {
        cursor: none;

        .controls-bottom {
            opacity: 0;
            transform: translateY(100%);
        }
    }
}

video {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.controls-bottom {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.2s ease, transform 0.2s ease;

    padding-top: 32px;

    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    flex-direction: column;
    align-items: stretch;

    gap: 5px;

    background-image: linear-gradient(to top, #0008, transparent);

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
        align-items: center;
        flex-direction: row;
        gap: 5px;
        padding: 0 10px;
        height: 40px;
    }
}
</style>
