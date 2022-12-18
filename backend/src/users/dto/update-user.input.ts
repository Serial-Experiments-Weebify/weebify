import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, Length } from 'class-validator';

@InputType()
export class UpdateUserInput {

    @Field(() => String, { description: 'Optional; only allowed if user is admin', nullable: true })
    id?: string;

    @Field(() => String, { nullable: true })
    @Length(3, 24)
    displayName?: string;

    @Length(8, 64)
    @Field(() => String, { nullable: true })
    password?: string;

    @IsOptional()
    @Field(() => String, { nullable: true })
    bio?: string;

    @IsEmail()
    @IsOptional()
    @Field(() => String, { nullable: true })
    email?: string;

    @Length(8, 64)
    @Field(() => String, { nullable: true})
    oldPassword?: string;

}
