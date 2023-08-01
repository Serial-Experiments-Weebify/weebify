<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { AisPagination } from 'vue-instantsearch/vue3/es';
</script>

<template>
    <ais-pagination :padding="3" class="ws-pag-list">
        <template
            #default="{
                currentRefinement,
                nbPages,
                pages,
                isFirstPage,
                isLastPage,
                refine,
            }"
        >
            <button
                class="ws-pag-btn ws-first"
                :disabled="isFirstPage"
                @click.prevent="() => refine(0)"
            >
                First
            </button>

            <!-- <li v-for="page in pages" :key="page">
                <a
                    :href="createURL(page)"
                    :style="{
                        fontWeight:
                            page === currentRefinement ? 'bold' : 'initial',
                    }"
                    @click.prevent="refine(page)"
                >
                    {{ page + 1 }}
                </a>
            </li> -->

            <button
                v-for="page in pages"
                :key="page"
                class="ws-pag-btn ws-page"
                :class="{ 'ws-page-active': currentRefinement === page }"
                @click="() => refine(page)"
            >
                {{ page + 1 }}
            </button>

            <!-- <li v-if="!isLastPage">
                <a :href="createURL(nbPages)" @click.prevent="refine(nbPages)">
                    ››
                </a>
            </li> -->

            <button
                class="ws-pag-btn ws-last"
                :disabled="isLastPage"
                @click.prevent="() => refine(nbPages)"
            >
                Last
            </button>
        </template>
    </ais-pagination>
</template>

<style lang="less">
.ws-pag-list {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
}

.ws-pag-btn {
    border-width: 0;
    font-size: 16px;
    font-weight: normal;
    padding: auto;
    text-align: center;

    color: @c-snow;
    background-color: @c-oil;
    height: 30px;
    border-radius: 1000px;

    &:not(.ws-page) {
        padding: 0 10px;
    }

    &:not(:disabled) {
        cursor: pointer;
    }

    &:disabled {
        color: @c-clay;
    }
}

.ws-page-active {
    background-color: @c-cyan;
    color: @c-oil;
}

.ws-page {
    aspect-ratio: 1;
}
</style>
