import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface V1Subtitles {
    name: string;
    lang: string;
    default: boolean;
    file: string;
}

export type V1FontMap = Record<string, string>;

export interface V1Resolution {
    name: string;
    w: number;
    h: number;
}

export interface V1Chapter {
    start: number;
    title: string;
    end: number;
}

@Schema({
    _id: false,
})
export class V1 {
    @Prop({ required: true, type: [Object] })
    subtitles: V1Subtitles[];

    @Prop({ required: true, type: Object })
    fontMap: V1FontMap;

    @Prop({ required: true, type: [Object] })
    resolutions: V1Resolution[];

    @Prop({ required: true, type: [Object] })
    chapters: V1Chapter[];
}

export const V1Schema = SchemaFactory.createForClass(V1);
