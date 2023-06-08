import { DocumentType, getModelForClass, prop } from "@typegoose/typegoose";

class Media {
    @prop()
    cover?: string;

    @prop()
    coverColor: string;

    @prop()
    setCoverToken?: string;
}

export type MediaDocument = DocumentType<Media>;
export const MediaModel = getModelForClass(Media);
