import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

import * as Pub from './pubuser.entity';
import { UserRole } from '../enums/UserRole.enum';

@Schema()
export class User {
    @Prop({ required: true, index: 'text', unique: true })
    username: string;

    @Prop({ required: true, index: 'text' })
    displayName: string;

    @Prop({ required: true })
    pfp: string;

    @Prop({ required: false, default: '' })
    bio: string;

    @Prop({ type: String, default: UserRole.USER, required: true })
    role: UserRole;

    @Prop()
    passwordHash: string;

    @Prop()
    email?: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: false })
    invitedBy?: User;

    @Prop({ type: [String], default: [] })
    inviteCodes: string[];

    public toGql(showEmail: boolean): Pub.User {
        const u: Pub.User = {
            //@ts-ignore
            id: this._id as string,
            username: this.username,
            bio: this.bio,
            pfp: this.pfp,
            role: this.role,
            displayName: this.displayName,
            invitedBy: this.invitedBy?.toGql(showEmail),
        };
        if (showEmail) u.email = this.email;

        return u;
    }
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
