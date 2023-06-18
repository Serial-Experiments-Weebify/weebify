import { Field, ObjectType } from '@nestjs/graphql';
import { WeebifyVideoType } from '../enums/videoType.enum';

@ObjectType()
export class VideoV0 {
    @Field()
    id: string;

    @Field(() => WeebifyVideoType)
    type: WeebifyVideoType;

    @Field()
    created: Date;

    @Field()
    video: string;
}
