import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { MediaKind } from '../enums/mediaKind.enum';
import { MovieSchema } from './movie.schema';
import { TvSchema } from './tv.schema';

@Schema({
    discriminatorKey: 'kind'
})
export class Media {
    @Prop({ required: true, index: 'text', unique: true })
    title: string;

    @Prop({ required: true, index: 'text', type: [String] })
    altTitles: string[];

    @Prop({ required: true, index: 'text' })
    description: string;

    @Prop({ required: true })
    anilistId: string;

    @Prop({ required: true, type: String })
    kind: MediaKind;

}

export type MediaDocument = Media & Document;

export const MediaSchema = SchemaFactory.createForClass(Media);

export const MovieMediaSchema = MediaSchema.discriminator(MediaKind.MOVIE, MovieSchema);
export const TvMediaSchema = MediaSchema.discriminator(MediaKind.TV, TvSchema);

