import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MediaKind } from '../enums/mediaKind.enum';
import { MediaStatus } from '../enums/mediaStatus.enum';
import { Movie, MovieSchema } from './movie.schema';
import { Tv, TvSchema } from './tv.schema';

@Schema({
    discriminatorKey: 'kind',
})
export class Media {
    @Prop({ required: true, index: 'text', unique: true })
    title: string;

    @Prop({ required: true, index: 'text', type: [String] })
    altTitles: string[];

    @Prop({ required: true, index: 'text' })
    description: string;

    @Prop({ required: true, type: [String] })
    genres: string[];

    @Prop({ required: true })
    year: number;

    @Prop({ required: false })
    anilistId?: string;

    @Prop({ required: false })
    cover?: string;

    @Prop({ required: true })
    status: MediaStatus;

    @Prop({ required: true, type: String, default: () => '#888888' })
    coverColor: string;

    @Prop({ required: true, type: String })
    kind: MediaKind;

    @Prop({ required: true, default: () => new Date() })
    dateAdded: Date;

    @Prop({ required: false })
    setCoverToken?: string;
}

export type MediaDocument = Media & Document;
export type TVMediaDocument = Media & Tv & Document;
export type MovieMediaDocument = Media & Movie & Document;

export const MediaSchema = SchemaFactory.createForClass(Media);

export const MovieMediaSchema = MediaSchema.discriminator(
    MediaKind.MOVIE,
    MovieSchema,
);
export const TvMediaSchema = MediaSchema.discriminator(MediaKind.TV, TvSchema);
