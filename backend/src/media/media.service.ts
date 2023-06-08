import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateMediaInput } from './dto/create-media.input';
import { UpdateMediaInput } from './dto/update-media.input';
import {
    Media,
    MediaDocument,
    MovieMediaDocument,
    TVMediaDocument,
} from './entities/media.entity';
import { Document, FilterQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaKind } from './enums/mediaKind.enum';
import { v4 as uuid } from 'uuid';
import { isMongoId } from 'class-validator';
import { AddEpisode } from './dto/add-episode.input';
import { Episode } from './entities/tv.schema';
import { UpdateEpisode } from './dto/update-episode.input';
import { EpisodeStatus } from './enums/episodeStatus.enum';
import MeiliSearch from 'meilisearch';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import { MediaStatus } from './enums/mediaStatus.enum';
import { JwtService } from '@nestjs/jwt';
import { VideoV0Document } from './entities/video.entity';

@Injectable()
export class MediaService {
    constructor(
        @InjectModel(Media.name)
        protected mediaModel: Model<MediaDocument>,

        @InjectModel('tvmedia')
        protected tvMediaModel: Model<TVMediaDocument>,

        @InjectModel('moviemedia')
        protected movieMediaModel: Model<MovieMediaDocument>,

        @InjectModel('VideoV0')
        protected v0Model: Model<VideoV0Document>,

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        @InjectMeiliSearch()
        protected meiliSearch: MeiliSearch,

        protected jwt: JwtService,
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
        if (!isMongoId(id)) throw new BadRequestException('Not a mongo ID');
        const m = await this.mediaModel.findById(id);
        if (!m) throw new NotFoundException('Media not founbd');

        m.set(updateMediaInput);

        await m.save();
        return m;
    }

    async remove(id: string) {
        if (!isMongoId(id)) throw new BadRequestException('Not a mongo ID');

        await this.mediaModel.findByIdAndDelete(id);

        try {
            const mi = await this.meiliSearch.getIndex('media');
            mi.deleteDocument(id);
        } catch (e) {
            console.log(`Failed to delete ${id} from search`);
        }

        return;
    }

    async updateCover(id: string) {
        if (!isMongoId(id)) throw new BadRequestException('Not a mongo ID');
        const key = uuid();

        const doc = await this.mediaModel.findByIdAndUpdate(id, {
            $set: { setCoverToken: key },
        });

        if (!doc) throw new NotFoundException('Media not found');

        return key;
    }

    async addEpisode(mId: string, ep: AddEpisode) {
        if (!isMongoId(mId)) throw new BadRequestException('Not a mongo ID');

        const episode = new Episode();
        episode.extra = ep.extra;
        episode.title = ep.title;
        episode.episodeNumber = ep.episodeNumber;
        episode.episodeStatus = ep.episodeStatus;
        const m = await this.tvMediaModel.findById(mId);
        if (!m) throw new NotFoundException('Media not found');
        if (m.episodes) {
            m.episodes.push(episode);
        } else {
            m.episodes = [episode];
        }

        await m.save();
        return m;
    }

    async quickFill(mId: string, count: number, status: EpisodeStatus) {
        if (!isMongoId(mId)) throw new BadRequestException('Not a mongo ID');
        if (count < 1) throw new BadRequestException('Count must be atleast 1');

        const m = await this.tvMediaModel.findById(mId);
        if (!m) throw new NotFoundException('Media not found');
        m.episodes = [];

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
        if (!isMongoId(mId)) throw new BadRequestException('Not a mongo ID');
        if (!isMongoId(eId)) throw new BadRequestException('Not a mongo ID');

        const m = await this.tvMediaModel.findById(mId);
        if (!m) throw new NotFoundException('Media not found');
        if (!m.episodes) throw new NotFoundException('Episode not found');
        const e = m.episodes.find((x) => eId == (x as Episode & Document).id);
        if (!e) throw new NotFoundException('Episode not found');

        Object.assign(e, ep);

        await m.save();
        return m;
    }

    async removeEpisode(mId: string, eId: string) {
        if (!isMongoId(mId)) throw new BadRequestException('Not a mongo ID');
        if (!isMongoId(eId)) throw new BadRequestException('Not a mongo ID');

        const m = await this.tvMediaModel.findById(mId);
        if (!m) throw new NotFoundException('Media not found');
        if (!m.episodes) throw new NotFoundException('Episode not found');
        m.episodes = m.episodes.filter(
            (x) => (x as Episode & Document).id != eId,
        );

        await m.save();
        return true;
    }

    async getRecent(limit: number) {
        return await this.mediaModel.find({}, null, {
            sort: { dateAdded: -1 },
            limit,
        });
    }

    async getAiring(limit: number) {
        return await this.mediaModel.find(
            {
                status: MediaStatus.Airing,
            },
            null,
            {
                sort: { dateAdded: -1 },
                limit,
            },
        );
    }

    async getRandom(n: number) {
        return await this.mediaModel.aggregate([
            { $sample: { size: n } },
            { $addFields: { id: '$_id' } },
            { $unset: ['_id', 'episodes'] },
        ]);
    }

    async getVideoUploadToken(mid: string, eid?: string) {
        const f: FilterQuery<MediaDocument> = { id: mid };
        if (eid) {
            f['kind'] = MediaKind.TV;
            f['episodes._id'] = eid;
        }
        const a = await this.mediaModel.find(f);

        if (!a) {
            throw new NotFoundException('Media/Episode does not exist');
        }

        return this.jwt.sign(
            {
                kind: eid ? MediaKind.TV : MediaKind.MOVIE,
                mid,
                eid,
            },
            { expiresIn: '5m' },
        );
    }

    async resolveV0(id: string) {
        return await this.v0Model.findById(id);
    }

    async rebuildSearch() {
        await this.meiliSearch.deleteIndexIfExists('media');

        const t = await this.meiliSearch.createIndex('media', {
            primaryKey: 'id',
        });

        await this.meiliSearch.waitForTask(t.taskUid);

        const data = await this.mediaModel.aggregate([
            {
                $project: {
                    _id: false,
                    id: '$_id',
                    title: true,
                    altTitles: true,
                    genres: true,
                    year: true,
                    kind: true,
                    cover: true,
                    coverColor: true,
                    status: true,
                    episodes: {
                        $size: {
                            $ifNull: ['$episodes', []],
                        },
                    },
                },
            },
        ]);

        const st = await this.meiliSearch
            .index('media')
            .addDocuments(data, { primaryKey: 'id' });

        await this.meiliSearch.waitForTask(st.taskUid);

        return true;
    }
}
