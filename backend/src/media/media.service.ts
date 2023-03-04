import { Injectable } from '@nestjs/common';
import { CreateMediaInput } from './dto/create-media.input';
import { UpdateMediaInput } from './dto/update-media.input';
import { Media, MediaDocument } from './entities/media.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MediaService {
    constructor(
        @InjectModel(Media.name) protected mediaModel: Model<MediaDocument>,
    ) {}

    create(createMediaInput: CreateMediaInput) {
        return 'This action adds a new media';
    }

    findAll() {
        return `This action returns all media`;
    }

    findOne(id: number) {
        return `This action returns a #${id} media`;
    }

    update(id: number, updateMediaInput: UpdateMediaInput) {
        return `This action updates a #${id} media`;
    }

    remove(id: number) {
        return `This action removes a #${id} media`;
    }
}
