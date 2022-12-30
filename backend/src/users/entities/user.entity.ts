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

    // used by the media service to authenticate PFP updates
    @Prop({ type: String, required: false })
    pfpToken?: string;

    @Prop({ required: false, default: '' })
    bio: string;

    @Prop({ type: String, default: UserRole.USER, required: true })
    role: UserRole;

    @Prop()
    passwordHash: string;

    @Prop()
    email?: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: false })
    invitedBy?: UserDocument;

    @Prop({ type: [String], default: [] })
    inviteCodes: string[];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
