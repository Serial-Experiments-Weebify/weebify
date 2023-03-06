import { InputType, Field, Int } from '@nestjs/graphql';
import { EpisodeStatus } from '../enums/episodeStatus.enum';

@InputType()
export class AddEpisode {
    @Field(() => Int)
    episodeNumber: number;

    @Field(() => String, { nullable: true })
    extra?: string;

    @Field()
    title: string;

    @Field(() => EpisodeStatus)
    episodeStatus: EpisodeStatus;
}
