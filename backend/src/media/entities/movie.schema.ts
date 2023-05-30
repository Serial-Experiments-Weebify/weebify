import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
    _id: false,
})
export class Movie {
    @Prop({ required: false, type: Types.ObjectId })
    mediaId?: Types.ObjectId;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
