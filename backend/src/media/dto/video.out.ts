import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class VideoV0 {
    @Field()
    key: string;
}
