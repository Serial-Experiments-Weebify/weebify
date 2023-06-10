import { Service, Inject } from 'typedi';
import { ConfigService } from './config.service';
import { S3Service } from './s3.service';
import { CreateV0 } from '../validators/createV0.in';
import {
    V0Model,
    V1Model,
    VideoModel,
    VideoStatus,
    WeebifyVideoType,
} from '../models/video.model';
import { CreateV1 } from '../validators/createV1.in';

const GET_UNIQUE_VIDEO_KEYS = [
    {
        $group: {
            _id: null,
            keys: {
                $push: { $concatArrays: ['$sharedKeys', '$uniqueKeys'] },
            },
        },
    },
    {
        $project: {
            keys: {
                $reduce: {
                    input: '$keys',
                    initialValue: [],
                    in: {
                        $concatArrays: [
                            '$$value',
                            {
                                $filter: {
                                    input: '$$this',
                                    as: 'x',
                                    cond: { $not: { $in: ['$$x', '$$value'] } },
                                },
                            },
                        ],
                    },
                },
            },
        },
    },
];

@Service()
export class VideoService {
    constructor(
        @Inject() private cfg: ConfigService,
        @Inject() private s3: S3Service,
    ) {}

    public async createV0(args: CreateV0) {
        const m = new V0Model({
            job: args.job,

            type: WeebifyVideoType.V0,
            status: VideoStatus.Waiting,

            created: new Date(),

            sharedKeys: [],
            uniqueKeys: [],
            video: '',
        });

        const id = m._id.toHexString();

        const fullpath = `video/${id}/${args.job}.mp4`;

        m.video = fullpath;
        m.uniqueKeys.push(fullpath);

        const key = await this.s3.presign(this.cfg.vars.S3_BUCKET, fullpath);
        await m.save();

        return { key, id };
    }

    public async createV1(args: CreateV1) {
        const m = new V1Model({
            job: args.job,

            type: WeebifyVideoType.V1,
            status: VideoStatus.Waiting,

            created: new Date(),

            chapters: args.chapters,
            subtitles: args.subtitles,

            fontMap: args.fontMap,

            resolutions: args.videos.map((v) => v.resolution),
        });

        const id = m._id.toHexString();

        const basePath = `video/${id}`;

        const uniqueFiles = [
            // [local src, s3 dest]

            // fallback video
            ['out/fallback.mp4', `${basePath}/fallback.mp4`],
            // DASH manifest
            ['out/manifest.mpd', `${basePath}/manifest.mpd`],

            ...args.videos.map((v) => [
                `out/${v.file}`,
                `${basePath}/${v.file}`,
            ]),

            ...args.audio.map((a) => [
                `out/${a.file}`,
                `${basePath}/${a.file}`,
            ]),

            ...args.subtitles.map((s) => [
                `out/${s.file}`,
                `${basePath}/${s.file}`,
            ]),
        ];
        m.uniqueKeys = uniqueFiles.map(([, dest]) => dest);

        const sharedFiles = [
            // [local src, s3 dest]
            ...Object.entries(args.fontMap).map(([, filename]) => [
                `fonts/${filename}`,
                `fonts/${filename}`,
            ]),
        ];
        m.sharedKeys = sharedFiles.map(([, dest]) => dest);

        const missingSharedFiles = await this.s3.missingFiles(
            this.cfg.vars.S3_BUCKET,
            sharedFiles.map(([, dest]) => dest),
        );

        const keysToSign = [
            ...uniqueFiles,
            ...sharedFiles.filter(([, dest]) =>
                missingSharedFiles.includes(dest),
            ),
        ];

        const keys = await Promise.all(
            keysToSign.map(async ([src, dest]) => {
                const key = await this.s3.presign(
                    this.cfg.vars.S3_BUCKET,
                    dest,
                );
                return { src, key };
            }),
        );

        await m.save();

        return { keys, id };
    }

    public async verify(id: string) {
        const m = await VideoModel.findById(id);

        if (!m) {
            return null;
        }

        const { sharedKeys, uniqueKeys } = m;

        const missing = await this.s3.missingFiles(this.cfg.vars.S3_BUCKET, [
            ...sharedKeys,
            ...uniqueKeys,
        ]);

        if (missing.length > 0) {
            m.status = VideoStatus.Failed;
            await m.save();
        } else {
            m.status = VideoStatus.OK;
            await m.save();
        }

        return { status: m.status, missingFiles: missing };
    }

    private async getAllReferencedKeys() {
        const [{ keys }] = (await VideoModel.aggregate(
            GET_UNIQUE_VIDEO_KEYS,
        )) as { keys: string[] }[];

        return keys;
    }

    public async clean(dryrun = true): Promise<string[]> {
        const allKeys = new Set(
            (
                await Promise.all([
                    this.s3.listKeys(this.cfg.vars.S3_BUCKET, 'video'),
                    this.s3.listKeys(this.cfg.vars.S3_BUCKET, 'fonts'),
                ])
            ).flat(),
        );

        const referencedKeys = await this.getAllReferencedKeys();
        referencedKeys.forEach((k) => allKeys.delete(k));

        // get all keys that were not referenced
        const keysToDelete = [...allKeys];

        if (!dryrun) {
            await this.s3.massDelete(this.cfg.vars.S3_BUCKET, keysToDelete);
        }

        return keysToDelete;
    }
}
