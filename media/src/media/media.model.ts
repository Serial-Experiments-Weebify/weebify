import { Model, model, Schema, Document } from "mongoose";

export interface IMedia {
    cover: string;
    coverColor: string;
    setCoverToken?: string;
}

const mediaSchema = new Schema<IMedia>({
    cover: { type: String, required: false },
    coverColor: { type: String, required: true },
    setCoverToken: { type: String, required: false },
});

export type MediaDocument = IMedia & Document;
export const media: Model<MediaDocument> = model<MediaDocument>(
    "media",
    mediaSchema
);
