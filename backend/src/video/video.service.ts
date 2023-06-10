import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
    forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video } from './entities/video.entity';
import { Model } from 'mongoose';
import { MediaService } from 'src/media/media.service';

const VIDEOS_JOIN_LINKED_MEDIA = [
    {
        $lookup: {
            from: 'media',
            localField: '_id',
            foreignField: 'videoId',
            pipeline: [
                {
                    $match: {
                        $or: [
                            { videoId: { $ne: null } },
                            {
                                episodes: {
                                    $elemMatch: { videoId: { $ne: null } },
                                },
                            },
                        ],
                    },
                },
                {
                    $project: {
                        arr: {
                            $concatArrays: [
                                {
                                    $cond: {
                                        if: { $gt: ['$videoId', null] },
                                        then: [
                                            {
                                                mid: '$_id',
                                                eid: null,
                                                videoId: '$videoId',
                                            },
                                        ],
                                        else: [],
                                    },
                                },
                                {
                                    $cond: {
                                        if: { $eq: ['$kind', 'TV'] },
                                        then: {
                                            $map: {
                                                input: {
                                                    $filter: {
                                                        input: '$episodes',
                                                        cond: {
                                                            $gt: [
                                                                '$$this.videoId',
                                                                null,
                                                            ],
                                                        },
                                                    },
                                                },
                                                as: 'episode',
                                                in: {
                                                    mid: '$_id',
                                                    eid: '$$episode._id',
                                                    videoId:
                                                        '$$episode.videoId',
                                                },
                                            },
                                        },
                                        else: [],
                                    },
                                },
                            ],
                        },
                    },
                },
                { $unwind: { path: '$arr' } },
                { $replaceRoot: { newRoot: '$arr' } },
            ],
            as: 'linkedMedia',
        },
    },
];

@Injectable()
export class VideoService {
    constructor(
        @InjectModel(Video.name)
        protected videoModel: Model<Video>,

        @Inject(forwardRef(() => MediaService))
        protected mediaService: MediaService,
    ) {}

    async listVideos() {
        // Types? What are those?
        return await this.videoModel.aggregate(VIDEOS_JOIN_LINKED_MEDIA);
    }

    async deleteVideo(id: string) {
        const r = await this.mediaService.getMediaForVideo(id);

        if (r) {
            throw new BadRequestException('Video is linked to media');
        }

        const v = await this.videoModel.findByIdAndDelete(id);

        if (!v) {
            throw new NotFoundException('Video not found');
        }

        return true;
    }

    async getVideo(id: string) {
        const v = await this.videoModel.findById(id);

        if (!v) {
            throw new NotFoundException('Video not found');
        }
        return v;
    }
}
