import { Field, InputType, Int } from '@nestjs/graphql';
import { MediaKind } from '../enums/mediaKind.enum';
import { MediaStatus } from '../enums/mediaStatus.enum';

@InputType('CreateMediaInput')
export class CreateMediaInput {
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

    @Field(() => MediaStatus)
    status: MediaStatus;
}
