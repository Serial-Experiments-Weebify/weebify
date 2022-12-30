import { Model, model, Schema, Document } from "mongoose";

export interface IUser {
    pfp: string;
    pfpToken?: string;
}

const userSchema = new Schema<IUser>({
    pfp: { type: String, required: true },
    pfpToken: { type: String, required: false },
});

export type UserDocument = IUser & Document;
export const users: Model<UserDocument> = model<UserDocument>('user', userSchema);