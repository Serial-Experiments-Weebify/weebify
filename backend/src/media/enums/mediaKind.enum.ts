import { registerEnumType } from '@nestjs/graphql';

export enum MediaKind {
    TV = 'TV',
    MOVIE = 'MOVIE',
}

registerEnumType(MediaKind, { name: 'MediaKind' });
