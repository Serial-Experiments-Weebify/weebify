import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes, Types } from 'mongoose';

import { UserRole } from '../enums/UserRole.enum';

@Schema()
export class Session {
    @Prop({
        required: true,
        default: () => new Types.ObjectId(),
        type: SchemaTypes.ObjectId,
    })
    public _id!: Types.ObjectId;

    @Prop({ required: true })
    public ipAddress: string;

    @Prop({ required: true })
    public userAgent: string;

    @Prop({ required: true })
    public lastAccessed: Date;

    @Prop({ required: true })
    public expiresAt: Date;

    @Prop({ required: true })
    public searchKey: string;
}
export const SessionSchema = SchemaFactory.createForClass(Session);

@Schema()
export class User {
    @Prop({ required: true, index: 'text', unique: true })
    public username: string;

    @Prop({ required: true, index: 'text' })
    public displayName: string;

    @Prop({ required: true })
    public pfp: string;

    // used by the media service to authenticate PFP updates
    @Prop({ type: String, required: false })
    public pfpToken?: string;

    @Prop({ required: false, default: '' })
    public bio: string;

    @Prop({ type: String, default: UserRole.USER, required: true })
    public role: UserRole;

    @Prop()
    public passwordHash: string;

    @Prop()
    public email?: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: false })
    public invitedBy?: UserDocument;

    @Prop({ type: [String], default: [] })
    public inviteCodes: string[];

    @Prop({
        type: [{ type: SchemaTypes.ObjectId, ref: 'User' }],
        required: true,
        default: [],
    })
    public following: User[];

    @Prop({ type: [SessionSchema], default: [] })
    public sessions: Session[];
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
