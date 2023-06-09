import {
    DocumentType,
    Severity,
    getDiscriminatorModelForClass,
    getModelForClass,
    modelOptions,
    prop,
} from '@typegoose/typegoose';

export enum WeebifyVideoType {
    V0 = 'V0',
    V1 = 'V1',
}

export enum VideoStatus {
    Waiting = 'WAITING',
    OK = 'OK',
    Failed = 'FAILED',
}

@modelOptions({
    schemaOptions: { collection: 'videos', discriminatorKey: 'type' },
})
class Video {
    @prop()
    job: string;

    @prop({ type: String })
    type: WeebifyVideoType;

    @prop({ type: String })
    status: VideoStatus;

    @prop()
    created: Date;

    @prop({ type: [String] })
    uniqueKeys: string[];

    @prop({ type: [String] })
    sharedKeys: string[];
}

class V0 extends Video {
    @prop()
    video: string;
}

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

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
class V1 extends Video {
    @prop({ type: [Object] })
    subtitles: V1Subtitles[];

    @prop({ type: Object })
    fontMap: V1FontMap;

    @prop({ type: [Object] })
    resolutions: V1Resolution[];

    @prop({ type: [Object] })
    chapters: V1Chapter[];
}

export type VideoDocument = DocumentType<Video>;
export type V0Document = DocumentType<V0>;
export type V1Document = DocumentType<V1>;

export const VideoModel = getModelForClass(Video),
    V0Model = getDiscriminatorModelForClass(
        VideoModel,
        V0,
        WeebifyVideoType.V0,
    ),
    V1Model = getDiscriminatorModelForClass(
        VideoModel,
        V1,
        WeebifyVideoType.V1,
    );
