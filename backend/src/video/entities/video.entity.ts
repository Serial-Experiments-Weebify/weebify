import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { WeebifyVideoType } from '../enums/videoType.enum';
import { V0, V0Schema } from './v0.schema';
import { VideoStatus } from '../enums/videoStatus.enum';
import { V1Schema } from './v1.schema';

@Schema({
    discriminatorKey: 'type',
})
export class Video {
    @Prop({ required: true })
    job: string;

    @Prop({ type: String, required: true })
    type: WeebifyVideoType;

    @Prop({ type: String, required: true })
    status: VideoStatus;

    @Prop({ required: true })
    created: Date;

    @Prop({ required: true, type: [String] })
    uniqueKeys: string[];

    @Prop({ required: true, type: [String] })
    sharedKeys: string[];
}

export const VideoSchema = SchemaFactory.createForClass(Video);

export const TvMediaSchema = VideoSchema.discriminator(
    WeebifyVideoType.V0,
    V0Schema,
);

export const MovieMediaSchema = VideoSchema.discriminator(
    WeebifyVideoType.V1,
    V1Schema,
);

export type VideoDocument = Video & Document;
export type VideoV0Document = Video & V0 & Document;
