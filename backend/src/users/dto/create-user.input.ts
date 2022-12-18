import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, Length, Matches } from 'class-validator';

@InputType()
export class CreateUserInput {
    @Length(3, 32)
    @Matches(/^([a-z0-9]_?){1,}[a-z0-9]$/m)
    @Field(() => String, { nullable: false })
    username: string;

    @Length(8, 64)
    @Field(() => String, { nullable: false })
    password: string;

    @IsEmail()
    @IsOptional()
    @Field(() => String, { nullable: true })
    email: string;

    @Field(() => String, { nullable: false })
    inviteCode: string;
}
