import { Model, model, Schema, Document } from "mongoose";

export enum WeebifyVideoFormat {
    V0 = 'V0',
    V1 = 'V1',
}

export interface IVideo {
    videoFormat: WeebifyVideoFormat;
}

const videoSchema = new Schema<IVideo>({
    videoFormat: { type: String, required: false },
},
    { discriminatorKey: 'videoFormat' }
);

export type VideoDocument = IVideo & Document;
export const media: Model<VideoDocument> = model<VideoDocument>(
    "video",
    videoSchema,
);

export interface IV0 {
    key: string;
}

const v0Schema = new Schema<IV0>({
    key: { type: String, required: true }
},);

export type VideoV0Document = IVideo & IV0 & Document;

export const videoV0Model: Model<VideoV0Document> = media.discriminator('V0', v0Schema, WeebifyVideoFormat.V0) as any;
