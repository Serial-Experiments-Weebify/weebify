import { Field, ObjectType } from '@nestjs/graphql';
import { VideoStatus } from '../enums/videoStatus.enum';
import { WeebifyVideoType } from '../enums/videoType.enum';
import { MediaRef } from './mediaRef';

@ObjectType()
export class AdminVideo {
    @Field({ name: 'id' })
    _id: string;

    @Field()
    job: string;

    @Field()
    status: VideoStatus;

    @Field()
    type: WeebifyVideoType;

    @Field()
    created: Date;

    @Field(() => [MediaRef])
    linkedMedia: MediaRef[];
}
