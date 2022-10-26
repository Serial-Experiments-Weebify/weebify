import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
    @Field(() => String, { nullable: true })
    password?: string;

    @Field(() => String, { nullable: true })
    inviteCode?: string;

    @Field(() => String, { nullable: true })
    displayName?: string;

    @Field(() => String, { nullable: true })
    bio?: string;

    @Field(() => String, { nullable: true })
    email?: string;
}
