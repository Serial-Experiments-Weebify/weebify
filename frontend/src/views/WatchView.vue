<script lang="ts" setup>
// import { gql } from '@/_gql';
// import { useQuery } from '@vue/apollo-composable';

// const props = defineProps<{ id: string }>();

// // const q
// const { result } = useQuery(
//     gql(`
//         query VideoV0 ($id: String!) {
//             VideoV0(id: $id) {
//                 key
//             }
//         }
//     `),
//     {
//         id: props.id,
//     }
// );
</script>

<template>
    <main>
        I borked it
        <!-- <video
            class="sane-width"
            :src="`/cdn/weebify/media/${result?.VideoV0?.key ?? ''}`"
            controls
        ></video> -->
    </main>
</template>

<style scoped lang="less">
main {
    display: flex;
    justify-content: center;
    align-items: center;
}
video {
    width: 100%;
}
</style>
