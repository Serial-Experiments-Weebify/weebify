import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MediaRef {
    @Field({ name: 'mediaId' })
    mid: string;

    @Field({ name: 'episodeId', nullable: true })
    eid: string;
}
