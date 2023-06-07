import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Session {
    @Field(() => String)
    sid: string;

    @Field(() => String)
    ipAddress: string;

    @Field(() => String)
    userAgent: string;

    @Field(() => Date)
    lastAccessed: Date;

    @Field(() => Date)
    expiresAt: Date;
}
