import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MediaKind } from '../enums/mediaKind.enum';
import { MediaStatus } from '../enums/mediaStatus.enum';
import { Episode } from './episode.out';

@ObjectType()
export class Media {
    @Field()
    id: string;

    @Field()
    title: string;

    @Field(() => [String])
    altTitles: string[];

    @Field()
    description: string;

    @Field(() => String, { nullable: true })
    anilistId?: string;

    @Field(() => [String])
    genres: string[];

    @Field(() => MediaKind)
    kind: MediaKind;

    @Field(() => Int)
    year: number;

    @Field(() => String, { nullable: true })
    cover?: string;

    @Field()
    coverColor: string;

    @Field(() => MediaStatus)
    status: MediaStatus;

    @Field(() => [Episode], { nullable: true })
    episodes?: Episode[];

    @Field(() => String, { nullable: true })
    mediaId?: string;
}
