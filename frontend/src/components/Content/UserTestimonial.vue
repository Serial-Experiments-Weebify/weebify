<script lang="ts" setup>
type Side = 'left' | 'right';
const props = defineProps<{
    image: string;
    pfpSide: Side;
    name: string;
}>();
</script>

<template>
    <div
        class="testimonial"
        :style="{ flexDirection: pfpSide == 'left' ? 'row' : 'row-reverse' }"
    >
        <img :src="props.image" :alt="`${props.name}'s profile picture`" />
        <div class="text">
            <p>
                <slot></slot>
            </p>
            <div class="who">- {{ props.name }}</div>
        </div>
    </div>
</template>

<style scoped lang="less">
.testimonial {
    display: flex;
    flex-direction: row;

    img {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid @c-algae;
        flex-shrink: 0;
        margin: 0 10px;
        object-fit: cover;
    }

    .text {
        padding: 10px;
        border-radius: 10px;
        background-color: @c-mirage;
        font-size: 18px;

        p {
            margin: 0;
            line-height: 1.4rem;
        }

        .who {
            margin-top: 7px;
            font-weight: 500;
        }
    }
}
</style>
