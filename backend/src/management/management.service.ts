import { Injectable, NotFoundException } from '@nestjs/common';
import { APIKey, APIKeyDocument } from './entities/APIKey.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ManagementService {
    constructor(
        @InjectModel(APIKey.name)
        protected apiKeyModel: Model<APIKeyDocument>,
    ) {}

    public async createAPIKey(friendlyName: string, userId: string) {
        const key = new this.apiKeyModel({
            name: friendlyName,
            key: uuid(),
            owner: userId,
        });

        return await key.save();
    }

    public async deleteAPIKey(id: string) {
        const r = await this.apiKeyModel.findByIdAndDelete(id);
        if (!r) throw new NotFoundException('API key not found');
        return true;
    }

    public async listAPIKeys() {
        return await this.apiKeyModel.find().populate('owner');
    }
}
