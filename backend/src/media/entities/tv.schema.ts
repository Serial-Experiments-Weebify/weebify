import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { EpisodeStatus } from '../enums/episodeStatus.enum';

@Schema()
export class Episode {
    @Prop({ required: true, type: Number })
    episodeNumber: number;

    @Prop({ required: false, type: String })
    extra?: string;

    @Prop({ required: true, type: String })
    title: string;

    @Prop({ required: false, type: Types.ObjectId })
    mediaId?: Types.ObjectId;

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
