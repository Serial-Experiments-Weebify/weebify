import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({
    _id: false,
})
export class Movie {
    @Prop({ type: SchemaTypes.ObjectId, default: null })
    videoId: Types.ObjectId | null;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
