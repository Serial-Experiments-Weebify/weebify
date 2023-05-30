import { Model, model, Schema, Document, Types, SchemaTypes } from "mongoose";

export interface IEpisode {
    _id: Types.ObjectId,
    mediaId:  Types.ObjectId
}

export interface IMedia {
    cover: string;
    coverColor: string;
    setCoverToken?: string;
    episodes?: IEpisode[];
    mediaId?: Types. ObjectId;
}

const mediaSchema = new Schema<IMedia>({
    cover: { type: String, required: false },
    coverColor: { type: String, required: true },
    setCoverToken: { type: String, required: false },
    episodes: { type: [{ mediaId: { type: SchemaTypes.ObjectId, required: false } }], required: false },
    mediaId: { type: SchemaTypes.ObjectId, required: false }
});

export type MediaDocument = IMedia & Document;
export const mediaModel: Model<MediaDocument> = model<MediaDocument>(
    "media",
    mediaSchema
);
