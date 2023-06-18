import { Field, ObjectType } from '@nestjs/graphql';
import { MediaVideoUnion } from 'src/video/dto/video.out';
import { EpisodeStatus } from '../enums/episodeStatus.enum';

@ObjectType()
export class WatchEpisode {
    @Field()
    id: string;

    @Field()
    title: string;

    @Field()
    episodeNumber: number;

    @Field(() => String, { nullable: true })
    extra?: string;

    @Field(() => EpisodeStatus)
    episodeStatus: EpisodeStatus;
}

@ObjectType()
export class Watch {
    @Field()
    title: string;

    @Field(() => MediaVideoUnion, { nullable: true })
    video?: typeof MediaVideoUnion;

    @Field(() => [WatchEpisode], { nullable: true })
    episodes?: WatchEpisode[];

    @Field(() => WatchEpisode, { nullable: true })
    nextEpisode?: WatchEpisode;

    @Field(() => WatchEpisode, { nullable: true })
    previousEpisode?: WatchEpisode;

    @Field(() => WatchEpisode, { nullable: true })
    currentEpisode?: WatchEpisode;
}
