import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    _id: false,
})
export class V0 {
    @Prop({ required: true })
    video: string;
}

export const V0Schema = SchemaFactory.createForClass(V0);
