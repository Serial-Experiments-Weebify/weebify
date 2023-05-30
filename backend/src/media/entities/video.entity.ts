import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { WeebifyVideoFormat } from '../enums/videoFormat.enum';
import { V0, V0Schema } from './v0.schema';

@Schema({
    discriminatorKey: 'videoFormat',
})
export class Video {
    @Prop({ type: String })
    videoFormat: WeebifyVideoFormat;
}

export const VideoSchema = SchemaFactory.createForClass(Video);

export const TvMediaSchema = VideoSchema.discriminator(
    WeebifyVideoFormat.V0,
    V0Schema,
);

export type VideoDocument = Video & Document;
export type VideoV0Document = Video & V0 & Document;
