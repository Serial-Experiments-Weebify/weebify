import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { MediaKind } from '../enums/mediaKind.enum';

@Schema({
    _id: false,
})
export class Movie {
    @Prop({ required: true, type: String })
    mediaId: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
