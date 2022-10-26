import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../enums/UserRole.enum';

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class User {
    @Field(() => String, {
        description: 'The unique id for this user',
        nullable: false,
    })
    id: string;

    @Field(() => String, { description: 'The "handle"', nullable: false })
    username: string;

    @Field(() => String, {
        description: 'The name that is actually displayed',
        nullable: false,
    })
    displayName: string;

    @Field(() => String, { description: 'Profile pic id', nullable: false })
    pfp: string;

    @Field(() => String, {
        description: 'Profile description',
        nullable: false,
    })
    bio: string;

    @Field(() => UserRole, { nullable: false })
    role: UserRole;

    @Field(() => String, {
        description: 'Note: gets returned only for admins and yourself',
        nullable: true,
    })
    email?: string;

    @Field(() => User, {
        description: 'The user that invited this user',
        nullable: true,
    })
    invitedBy?: User;
}
