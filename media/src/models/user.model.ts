import {
    DocumentType,
    getModelForClass,
    modelOptions,
    prop,
} from '@typegoose/typegoose';
import { SchemaTypes, Types } from 'mongoose';

export enum UserRole {
    GOD = 'GOD',
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR',
    LEGENDARY_MEMBER = 'LEGENDARY_MEMBER',
    USER = 'USER',
}

@modelOptions({ schemaOptions: { _id: false } })
export class Session {
    @prop({
        required: true,
        default: () => new Types.ObjectId(),
        type: SchemaTypes.ObjectId,
    })
    public id!: Types.ObjectId;
}
export type SessionDocument = DocumentType<Session>;
export const SessionSchema = getModelForClass(Session);

class User {
    @prop()
    public pfp: string;

    @prop()
    public pfpToken?: string;

    @prop({ type: String })
    public role: UserRole;

    @prop({ type: [SessionSchema] })
    public sessions: Session[];
}

export type UserDocument = DocumentType<User>;

export const UserModel = getModelForClass(User);
