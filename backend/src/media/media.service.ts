import { Injectable } from '@nestjs/common';
import { CreateMediaInput } from './dto/create-media.input';
import { UpdateMediaInput } from './dto/update-media.input';
import {
    Media,
    MediaDocument,
    MovieMediaDocument,
    TVMediaDocument,
} from './entities/media.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaKind } from './enums/mediaKind.enum';
import { v4 as uuid } from 'uuid';
import { GraphQLError } from 'graphql';
import { isMongoId } from 'class-validator';

@Injectable()
export class MediaService {
    constructor(
        @InjectModel(Media.name)
        protected mediaModel: Model<MediaDocument>,
        @InjectModel('tvmedia')
        protected tvMediaModel: Model<TVMediaDocument>,
        @InjectModel('moviemedia')
        protected movieMediaModel: Model<MovieMediaDocument>,
    ) {}

    async create(createMediaInput: CreateMediaInput) {
        let m: MediaDocument;
        switch (createMediaInput.kind) {
            case MediaKind.MOVIE: {
                m = new this.movieMediaModel({
                    ...createMediaInput,
                    mediaId: null,
                    coverColor: '#888888',
                });
                break;
            }
            case MediaKind.TV: {
                m = new this.tvMediaModel({
                    ...createMediaInput,
                    episodes: [],
                    coverColor: '#888888',
                });
                break;
            }
        }
        await m.save();
        return m.id as string;
    }

    findAll() {
        return `This action returns all media`;
    }

    async findOne(id: string) {
        return await this.mediaModel.findById(id);
    }

    async update(id: string, updateMediaInput: UpdateMediaInput) {
        if (!isMongoId(id)) throw new GraphQLError('Not a mongo ID');
        return await this.mediaModel.findByIdAndUpdate(id, {
            $set: updateMediaInput,
        });
    }

    async remove(id: string) {
        if (!isMongoId(id)) throw new GraphQLError('Not a mongo ID');
        return await this.mediaModel.findByIdAndDelete(id);
    }

    async updateCover(id: string) {
        if (!isMongoId(id)) throw new GraphQLError('Not a mongo ID');
        const key = uuid();

        const doc = await this.mediaModel.findByIdAndUpdate(id, {
            $set: { setCoverToken: key },
        });

        if (!doc) throw new GraphQLError('Invalid ID');

        return key;
    }
}
