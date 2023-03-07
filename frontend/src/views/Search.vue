<script setup lang="ts">
import MediaCard from '@/components/Media/MediaCard.vue';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';

const url = new URL(document.location.toString());
url.search = '';
url.hash = '';
url.pathname = '/api/search';

const searchClient = instantMeiliSearch(url.toString());
</script>

<template>
    <main>
        <div class="sane-width search-container">
            <ais-instant-search
                :search-client="searchClient"
                index-name="media"
            >
                <ais-search-box
                    placeholder="Search"
                    submit-title="Search"
                    reset-title="Reset"
                    :autofocus="true"
                    :show-loading-indicator="true"
                >
                </ais-search-box>

                <ais-stats>
                    <template v-slot="{ nbHits }">
                        <h2>Media ({{ nbHits }})</h2>
                    </template>
                </ais-stats>

                <ais-hits
                    :class-names="{
                        'ais-Hits': 'media-hits',
                        'ais-Hits-list': 'media-hits-list',
                        'ais-Hits-item': 'media-hit',
                    }"
                >
                    <template v-slot:item="{ item }">
                        <RouterLink
                            :to="{ name: 'media', params: { id: item.id } }"
                        >
                            <MediaCard :media="item" />
                        </RouterLink>
                    </template>
                </ais-hits>

                <ais-pagination />
                <ais-stats />

                <ais-index :search-client="searchClient" index-name="users">
                    <ais-stats>
                        <template v-slot="{ nbHits }">
                            <h2>Users ({{ nbHits }})</h2>
                        </template>
                    </ais-stats>

                    <ais-hits>
                        <template v-slot:item="{ item }">
                            <h2>{{ item.displayName }}</h2>
                        </template>
                    </ais-hits>

                    <ais-pagination />
                    <ais-stats />
                </ais-index>
            </ais-instant-search>
        </div>
    </main>
</template>

<style scoped lang="less">
main {
    display: flex;
    flex-direction: column;
    align-items: center;
    .search-container {
        width: 100%;
        margin-top: 20px;
        background-color: @c-mirage;
    }
}
</style>

<style lang="less">
.media-hits-list {
    list-style: none;
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));
}
</style>
