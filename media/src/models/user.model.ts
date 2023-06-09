import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose';

class User {
    @prop()
    public pfp: string;

    @prop()
    public pfpToken?: string;
}

export type UserDocument = DocumentType<User>;

export const UserModel = getModelForClass(User);
