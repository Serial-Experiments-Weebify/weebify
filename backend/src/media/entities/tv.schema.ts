import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { EpisodeStatus } from '../enums/episodeStatus.enum';

@Schema({
    _id: false,
})
export class Episode {
    @Prop({
        required: true,
        type: SchemaTypes.ObjectId,
        default: () => new Types.ObjectId(),
    })
    id: Types.ObjectId;

    @Prop({ required: true, type: Number })
    episodeNumber: number;

    @Prop({ required: false, type: String })
    extra?: string;

    @Prop({ required: true, type: String })
    title: string;

    @Prop({ type: SchemaTypes.ObjectId, default: null })
    videoId: Types.ObjectId | null;

    @Prop({ required: true, type: String })
    episodeStatus: EpisodeStatus;
}

export const EpisodeSchema = SchemaFactory.createForClass(Episode);

@Schema({
    _id: false,
})
export class Tv {
    @Prop({ required: true, type: [EpisodeSchema] })
    episodes: Episode[];
}

export const TvSchema = SchemaFactory.createForClass(Tv);
