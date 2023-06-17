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
import { VideoStatus } from './enums/videoStatus.enum';

const VIDEOS_JOIN_LINKED_MEDIA = [
    {
        $lookup: {
            from: 'media',
            as: 'media',
            let: {
                cvideoId: '$_id',
            },
            pipeline: [
                {
                    $project: {
                        arr: {
                            $concatArrays: [
                                {
                                    $cond: {
                                        if: {
                                            $eq: ['$kind', 'TV'],
                                        },
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
                                                    eid: '$$episode.id',
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
                {
                    $unwind: {
                        path: '$arr',
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: '$arr',
                    },
                },
                {
                    $match: {
                        $expr: {
                            $eq: ['$videoId', '$$cvideoId'],
                        },
                    },
                },
            ],
        },
    },
];

function filter(unlinkedOnly = false, stat: VideoStatus | null = null) {
    const $match: Record<string, any> = {};

    if (stat) {
        $match.status = stat;
    }

    if (unlinkedOnly) {
        $match.media = [];
    }

    return { $match };
}

@Injectable()
export class VideoService {
    constructor(
        @InjectModel(Video.name)
        protected videoModel: Model<Video>,

        @Inject(forwardRef(() => MediaService))
        protected mediaService: MediaService,
    ) {}

    async listVideos(
        unlinkedOnly = false,
        statusOnly: VideoStatus | null = null,
    ) {
        // Types? What are those?
        if (unlinkedOnly) {
            return await this.videoModel.aggregate([
                ...VIDEOS_JOIN_LINKED_MEDIA,
                filter(unlinkedOnly, statusOnly),
            ]);
        }
        return await this.videoModel.aggregate(VIDEOS_JOIN_LINKED_MEDIA, {});
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
