import { ObjectType, Field } from '@nestjs/graphql';
import { MediaPreview } from './media-preview.out';

@ObjectType()
export class HomeRecomendations {
    @Field(() => [MediaPreview])
    random: MediaPreview[];

    @Field(() => [MediaPreview])
    airing: MediaPreview[];

    @Field(() => [MediaPreview])
    recent: MediaPreview[];
}
