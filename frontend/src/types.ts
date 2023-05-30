import type { MediaStatus, UserRole } from '@/_gql/graphql';

export interface SearchMedia {
    id: string;
    title: string;
    altTitles: string[];
    genres: string[];
    kind: string;
    year: number;
    cover?: string | null | undefined;
    coverColor: string;
    description: string;
    status: MediaStatus;
    episodes: number;
}

export interface SearchUser {
    id: string;
    displayName: string;
    username: string;
    pfp: string;
    role: UserRole;
}
