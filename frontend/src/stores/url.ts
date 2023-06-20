import { ref } from 'vue';
import { gql } from '@/_gql';
import { defineStore } from 'pinia';
import { useApolloClient } from '@vue/apollo-composable';

import defaultPfpUrl from '@/assets/images/pfpDefault.webp?url';
import defaultCoverUrl from '@/assets/images/coverDefault.webp?url';

const S3_PUB_QUERY = gql(`
        query S3Pub {
            S3PublicURL
        }
    `);

type PfpSize = 'tiny' | 'mid' | 'full';

type CoverSize = 'thumb' | 'full';

export const useURLStore = defineStore('url', () => {
    const s3PublicURL = ref('/cdn/weebify');

    const { client } = useApolloClient();

    async function loadS3PublicURL() {
        try {
            const { data } = await client.query({ query: S3_PUB_QUERY });
            s3PublicURL.value = data.S3PublicURL;
            console.log('Loaded S3 public URL', s3PublicURL.value);
        } catch (e) {
            console.error('Error loading S3 public URL', e);
        }
    }

    loadS3PublicURL();

    function getPfpURL(size: PfpSize, id?: string) {
        if (!id) return defaultPfpUrl;
        if (id === 'default') return defaultPfpUrl;

        return `${s3PublicURL.value}/pfp/${id}/${size}.webp`;
    }

    function getCoverURL(size: CoverSize, id: string | null | undefined) {
        if (!id) return defaultCoverUrl;
        if (id === 'default') return defaultCoverUrl;

        return `${s3PublicURL.value}/cover/${id}/${size}.webp`;
    }

    function getManifestURL() {}

    function getSubtitleURL() {}

    function getFontURL() {}

    return {
        s3PublicURL,

        getPfpURL,
        getCoverURL,
        getManifestURL,
        getSubtitleURL,
        getFontURL,
    };
});
