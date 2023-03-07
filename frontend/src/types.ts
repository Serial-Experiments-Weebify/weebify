import type { MediaStatus } from '@/_gql/graphql';

export interface SearchMedia {
    id: string;
    title: string;
    altTitles: string[];
    genres: string[];
    kind: string;
    year: number;
    cover: string;
    coverColor: string;
    status: MediaStatus;
    episodes: number;
}
