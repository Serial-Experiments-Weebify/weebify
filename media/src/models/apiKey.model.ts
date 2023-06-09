import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose';
import { SchemaTypes } from 'mongoose';

export class APIKey {
    @prop({ type: SchemaTypes.ObjectId })
    owner: string;

    @prop()
    key: string;

    @prop()
    name: string;
}

export type APIKeyDocument = DocumentType<APIKey>;
export const APIKeyModel = getModelForClass(APIKey);
