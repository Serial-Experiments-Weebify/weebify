import { Field, InputType } from '@nestjs/graphql';
import { Length, Matches } from 'class-validator';

@InputType()
export class LoginInput {
    @Length(3, 32)
    @Matches(/^([a-z0-9]_?){1,}[a-z0-9]$/m)
    @Field(() => String, { nullable: false })
    username: string;

    @Length(8, 64)
    @Field(() => String, { nullable: false })
    password: string;
}
