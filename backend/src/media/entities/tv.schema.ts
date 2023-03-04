import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { MediaKind } from '../enums/mediaKind.enum';

@Schema({ _id: false })
export class Episode {
    @Prop({ required: true, type: Number })
    episodeNumber: number;

    @Prop({ required: false, type: String })
    extra?: string;

    @Prop({ required: true, type: String })
    title: string;

    @Prop({ required: true, type: String })
    mediaId: string;
}

export const EpisodeSchema = SchemaFactory.createForClass(Episode);

@Schema({
    _id: false,
})
export class Tv {
    @Prop({ required: true, type: [Object] })
    episodes: Episode[];
}

export const TvSchema = SchemaFactory.createForClass(Tv);
