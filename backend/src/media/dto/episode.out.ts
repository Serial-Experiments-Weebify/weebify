import { ObjectType, Field } from '@nestjs/graphql';
import { EpisodeStatus } from '../enums/episodeStatus.enum';

@ObjectType()
export class Episode {
    @Field()
    id: string;

    @Field()
    episodeNumber: number;

    @Field(() => String, { nullable: true })
    extra?: string;

    @Field()
    title: string;

    @Field(() => String, { nullable: true })
    videoId?: string;

    @Field(() => EpisodeStatus)
    episodeStatus: EpisodeStatus;
}
