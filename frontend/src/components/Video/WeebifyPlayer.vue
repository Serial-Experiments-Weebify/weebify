<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useFullscreen, useMediaControls } from '@vueuse/core';
import { MediaInfo, MediaPlayer, type MediaPlayerClass } from 'dashjs';
import SeekBar from './SeekBar.vue';
import { secondsToHMS } from './time';

import fallbackFont from '@/assets/fonts/LiberationMono-Regular.woff2?url';
import libassWorkerJS from 'libass-wasm/dist/js/subtitles-octopus-worker.js?url';
import OctopusSubtitles from 'libass-wasm';
import type {
    VideoChapter,
    VideoResolution,
    VideoSubtitle,
} from '@/_gql/graphql';

const props = defineProps<{
    vid: string;
    chapters: VideoChapter[];
    subtitles: VideoSubtitle[];
    resolutions: VideoResolution[];
}>();

const resolutions = ref([] as MediaInfo[]);
const resolutionIndex = ref(-1);

const audioTracks = ref([] as MediaInfo[]);
const audioTrackIndex = ref(-1);

//#region DOM interfacing stuff
const video = ref<HTMLVideoElement>();
const root = ref<HTMLDivElement>();

const { playing, currentTime, duration, buffered, volume } =
    useMediaControls(video);
const {
    isFullscreen,
    enter: goFullscreen,
    exit: goFullscreenent,
} = useFullscreen(root);
//#endregion DOM interfacing stuff

//#region DASH and ASS

const octopus = ref<OctopusSubtitles>();
const dashjs = ref<MediaPlayerClass>();

//#endregion DASH and ASS

//#region Initalization and cleanup
onMounted(() => {
    const p = (dashjs.value = MediaPlayer().create());

    p.initialize(
        video.value,
        `/cdn/weebify/video/${props.vid}/manifest.mpd`,
        false
    );

    p.on('manifestLoaded', () => {
        resolutions.value = p.getTracksFor('video');
        audioTracks.value = p.getTracksFor('audio');
    });

    octopus.value = new OctopusSubtitles({
        video: video.value,
        workerUrl: libassWorkerJS,
        fallbackFont,

        subUrl: '/cdn/weebify/video/6483728efb807a2791634451/English.ass',
        fonts: [
            '/cdn/weebify/fonts/5f6171ac0c5affe21f41ecb2e2e29996-Roboto-Medium.ttf',
        ],
    });

    // subtitles.value.freeTrack();
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
</script>

<template>
    <div class="container" ref="root">
        <video ref="video" />
        <div class="controls-bottom">
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
                <button
                    @click="
                        () =>
                            isFullscreen ? goFullscreenent() : goFullscreen()
                    "
                >
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

    .tc {
        display: flex;
        flex-direction: row;
    }
}
</style>
