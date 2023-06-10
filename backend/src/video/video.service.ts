import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video } from './entities/video.entity';
import { Model } from 'mongoose';

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
    ) {}

    async listVideos() {
        // Types? What are those?
        return await this.videoModel.aggregate(VIDEOS_JOIN_LINKED_MEDIA);
    }
}
