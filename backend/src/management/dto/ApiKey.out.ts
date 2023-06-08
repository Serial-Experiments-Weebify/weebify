import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/dto/user.out';

@ObjectType()
export class APIKey {
    @Field(() => String)
    public id: string;

    @Field()
    public name: string;

    @Field(() => User)
    public owner: User;
}

@ObjectType()
export class APIKeyWithKey extends APIKey {
    @Field()
    public key: string;
}
