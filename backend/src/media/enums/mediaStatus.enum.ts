import { registerEnumType } from '@nestjs/graphql';

export enum MediaStatus {
    Upcoming = 'UPCOMING',
    Airing = 'AIRING',
    Finished = 'FINISHED',
}

registerEnumType(MediaStatus, { name: 'MediaStatus' });
