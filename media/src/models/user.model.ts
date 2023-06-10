import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose';

export enum UserRole {
    GOD = 'GOD',
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR',
    LEGENDARY_MEMBER = 'LEGENDARY_MEMBER',
    USER = 'USER',
}

class User {
    @prop()
    public pfp: string;

    @prop()
    public pfpToken?: string;

    @prop({ type: String })
    public role: UserRole;
}

export type UserDocument = DocumentType<User>;

export const UserModel = getModelForClass(User);
