import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthSession {
    @Field(() => String)
    token: string;

    @Field(() => String)
    searchKey: string;

    @Field(() => Date)
    expiresAt: Date;
}
