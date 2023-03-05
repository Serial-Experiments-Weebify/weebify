import { registerEnumType } from '@nestjs/graphql';

export enum EpisodeStatus {
    Upcoming = 'UPCOMING',
    Aired = 'AIRED',
}

registerEnumType(EpisodeStatus, { name: 'EpisodeStatus' });
