import { ObjectType, Field } from '@nestjs/graphql';
import { EpisodeStatus } from '../enums/episodeStatus.enum';

@ObjectType()
export class Episode {
    @Field()
    episodeNumber: number;
    @Field()
    extra?: string;
    @Field()
    title: string;
    @Field()
    mediaId: string;
    @Field()
    episodeStatus: EpisodeStatus;
}
