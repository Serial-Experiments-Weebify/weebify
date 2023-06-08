import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

@Schema()
export class APIKey {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
    owner: User;

    @Prop({ required: true, unique: true })
    key: string;

    @Prop({ required: true, unique: true })
    name: string;
}

export type APIKeyDocument = APIKey & Document;
export const APIKeySchema = SchemaFactory.createForClass(APIKey);
