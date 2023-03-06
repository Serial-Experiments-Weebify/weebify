import { Injectable } from '@nestjs/common';
import { CreateMediaInput } from './dto/create-media.input';
import { UpdateMediaInput } from './dto/update-media.input';
import {
    Media,
    MediaDocument,
    MovieMediaDocument,
    TVMediaDocument,
} from './entities/media.entity';
import { Document } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaKind } from './enums/mediaKind.enum';
import { v4 as uuid } from 'uuid';
import { GraphQLError } from 'graphql';
import { isMongoId } from 'class-validator';
import { AddEpisode } from './dto/add-episode.input';
import { Episode } from './entities/tv.schema';
import { UpdateEpisode } from './dto/update-episode.input';
import { EpisodeStatus } from './enums/episodeStatus.enum';

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

    async addEpisode(mId: string, ep: AddEpisode) {
        if (!isMongoId(mId)) throw new GraphQLError('Not a mongo ID');

        const episode = new Episode();
        episode.extra = ep.extra;
        episode.title = ep.title;
        episode.episodeNumber = ep.episodeNumber;
        episode.episodeStatus = ep.episodeStatus;
        const m = await this.tvMediaModel.findById(mId);
        if (!m) throw new GraphQLError('Media not found');
        if (m.episodes) {
            m.episodes.push(episode);
        } else {
            m.episodes = [episode];
        }

        await m.save();
        return m;
    }

    async quickFill(mId: string, count: number, status: EpisodeStatus) {
        if (!isMongoId(mId)) throw new GraphQLError('Not a mongo ID');
        if (count < 1) throw new GraphQLError('Count must be atleast 1');

        const m = await this.tvMediaModel.findById(mId);
        if (!m) throw new GraphQLError('Media not found');
        if (!m.episodes) m.episodes = [];

        for (let i = 1; i <= count; i++) {
            const e = new Episode();
            e.title = m.title;
            e.episodeNumber = i;
            e.episodeStatus = status;

            m.episodes.push(e);
        }

        await m?.save();
        return m;
    }

    async updateEpisode(mId: string, eId: string, ep: UpdateEpisode) {
        if (!isMongoId(mId)) throw new GraphQLError('Not a mongo ID');
        if (!isMongoId(eId)) throw new GraphQLError('Not a mongo ID');

        const m = await this.tvMediaModel.findById(mId);
        if (!m) throw new GraphQLError('Media not found');
        if (!m.episodes) throw new GraphQLError('Episode not found');
        const e = m.episodes.find((x) => eId == (x as Episode & Document).id);
        if (!e) throw new GraphQLError('Episode not found');

        Object.assign(e, ep);

        await m.save();
        return m;
    }

    async removeEpisode(mId: string, eId: string) {
        if (!isMongoId(mId)) throw new GraphQLError('Not a mongo ID');
        if (!isMongoId(eId)) throw new GraphQLError('Not a mongo ID');

        const m = await this.tvMediaModel.findById(mId);
        if (!m) throw new GraphQLError('Media not found');
        if (!m.episodes) throw new GraphQLError('Episode not found');
        m.episodes = m.episodes.filter(
            (x) => (x as Episode & Document).id != eId,
        );

        await m.save();
        return true;
    }
}
