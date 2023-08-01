<script setup lang="ts">
import MediaCard from '@/components/Media/MediaCard.vue';
import { useAuthStore } from '@/stores/auth';
import { gql } from '@/_gql';
import { useQuery } from '@vue/apollo-composable';
import { computed } from 'vue';
import MediaBanner from '@/components/Media/MediaBanner.vue';

const auth = useAuthStore();

const greeting = computed(() => {
    let username = auth.me?.displayName ?? auth.me?.username;
    const h = new Date().getHours();
    const timeOfDay =
        h < 4
            ? 'evening'
            : h < 12
            ? 'morning'
            : h < 18
            ? 'afternoon'
            : 'evening';
    if (username) username = ', ' + username;
    else username = '';

    return `Good ${timeOfDay}${username}`;
});

const HOME_QUERY = gql(`
    query Home {
        homeRecomendations {
            random {
                id
                title
                altTitles
                description
                year
                cover
                coverColor
                status
                kind
            }
            airing {
                id
                title
                cover
                coverColor
            }
            recent {
                id
                title
                cover
                coverColor
            }
        }
    }
`);

const { result, error, loading } = useQuery(HOME_QUERY);
</script>

<template>
    <main v-if="!error" class="home">
        <h1 class="greeting">{{ greeting }}</h1>

        <div class="random-picks sane-width">
            <h1>Random pick just for you</h1>
            <div v-if="loading" class="placeholder loading"></div>
            <MediaBanner
                v-for="m in result?.homeRecomendations.random"
                :key="m.id"
                :media="m"
            />
        </div>

        <div class="airing sane-width">
            <h1>Currently airing</h1>
            <div v-if="loading" class="placeholder loading"></div>
            <div v-else class="medialist">
                <RouterLink
                    v-for="m in result?.homeRecomendations.airing"
                    :key="m.id"
                    :to="{ name: 'media', params: { id: m.id } }"
                >
                    <MediaCard :media="m" />
                </RouterLink>
            </div>
        </div>

        <div class="recent sane-width">
            <h1>Recently added</h1>
            <div v-if="loading" class="placeholder loading"></div>
            <div v-else class="medialist">
                <RouterLink
                    v-for="m in result?.homeRecomendations.recent"
                    :key="m.id"
                    :to="{ name: 'media', params: { id: m.id } }"
                >
                    <MediaCard :media="m" />
                </RouterLink>
            </div>
        </div>
    </main>
    <main v-else>
        <h1>Error</h1>
        <pre>{{ error }}</pre>
    </main>
</template>

<style scoped lang="less">
main {
    display: flex;
    flex-direction: column;
    align-items: center;

    h1,
    h2 {
        font-weight: 500;
        text-align: center;
    }
    .greeting {
        font-weight: 300;
    }

    .random-picks,
    .airing,
    .recent {
        width: 100%;
        margin-bottom: 20px;
    }
}

.medialist {
    width: 100%;
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(10em, 1fr));
}

.placeholder {
    aspect-ratio: 2;
    width: 100%;
    border-radius: 10px;
}

.loading {
    background: linear-gradient(45deg, transparent, @c-mirage, transparent);
    background-size: 300% 300%;
    animation: loading-animation 1s ease infinite;

    @keyframes loading-animation {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
}
</style>
