import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MediaKind } from '../enums/mediaKind.enum';
import { MediaStatus } from '../enums/mediaStatus.enum';

@ObjectType()
export class MediaPreview {
    @Field()
    id: string;

    @Field()
    title: string;

    @Field(() => [String])
    altTitles: string[];

    @Field()
    description: string;

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
}
