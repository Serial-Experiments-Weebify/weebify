import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    _id: false,
})
export class Movie {
    @Prop({ required: false, type: String })
    mediaId?: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
