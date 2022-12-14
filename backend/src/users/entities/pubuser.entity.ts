import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../enums/UserRole.enum';
import { UserDocument } from './user.entity';

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class User {
    constructor(d: UserDocument, showEmail: boolean) {
        this.id = d.id;
        this.username = d.username;
        this.bio = d.bio;
        this.pfp = d.pfp;
        this.role = d.role;
        this.displayName = d.displayName;
        this.invitedBy = d.invitedBy?._id.toString();
        if (showEmail) this.email = d.email;
    }

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

    @Field(() => String, {
        description: 'The user that invited this user',
        nullable: true,
    })
    invitedBy?: string;
}
