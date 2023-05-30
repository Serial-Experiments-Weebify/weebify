<script setup lang="ts">
import MediaList from '@/components/Search/MediaList.vue';
import SearchPagination from '@/components/Search/SearchPagination.vue';
import SearchBox from '@/components/Search/SearchBox.vue';
import UserList from '@/components/Search/UserList.vue';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { ref } from 'vue';

const url = new URL(document.location.toString());
url.search = '';
url.hash = '';
url.pathname = '/api/search';

const searchClient = instantMeiliSearch(url.toString(), undefined, {
    finitePagination: true,
});

enum SearchType {
    Media,
    User,
}

const mode = ref(SearchType.Media);
</script>

<template>
    <main>
        <div class="sane-width search-container">
            <ais-instant-search
                :search-client="searchClient"
                index-name="media"
            >
                <ais-configure :hits-per-page.camel="30" />

                <div class="center search-bar">
                    <SearchBox />
                </div>

                <div class="mode-selector center">
                    <input
                        type="radio"
                        :value="SearchType.Media"
                        v-model="mode"
                        id="smode-media"
                    />
                    <label class="search-cat" for="smode-media"> Media </label>

                    <input
                        type="radio"
                        :value="SearchType.User"
                        v-model="mode"
                        id="smode-user"
                    />
                    <label class="search-cat" for="smode-user"> Users </label>
                </div>

                <template v-if="mode == SearchType.Media">
                    <MediaList />
                    <SearchPagination />
                </template>

                <ais-index
                    :search-client="searchClient"
                    index-name="users"
                    v-else
                >
                    <UserList />
                    <SearchPagination />
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
        padding: 10px 0;
        border-radius: 20px;

        .search-bar {
            margin-bottom: 30px;
            padding: 0 30%;
            & > * {
                flex: 1;
            }
        }
        .center {
            display: flex;
            flex-direction: row;
            justify-content: center;
        }
        .mode-selector {
            gap: 20px;

            label {
                font-weight: bold;
                font-size: 28px;
                cursor: pointer;

                &:hover {
                    color: lighten(@c-cyan, 20%);
                }
            }

            :checked + label {
                color: @c-cyan;
            }

            input {
                display: none;
            }
        }
    }
}
</style>
