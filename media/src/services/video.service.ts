import { Service, Inject } from "typedi";
import { ConfigService } from "./config.service";
import { S3Service } from "./s3.service";
import { CreateV0 } from "../validators/createV0.in";
import { V0Model, VideoStatus, WeebifyVideoType } from "../models/video.model";

@Service()
export class VideoService {
    constructor(
        @Inject() private cfg: ConfigService,
        @Inject() private s3: S3Service
    ) {}

    public async createV0(args: CreateV0) {
        const m = new V0Model({
            job: args.job,

            type: WeebifyVideoType.V0,
            status: VideoStatus.Waiting,

            created: new Date(),

            sharedKeys: [],
            uniqueKeys: [],
            video: "",
        });

        const id = m._id.toHexString();

        const fullpath = `video/${id}/${args.job}.mp4`;

        m.video = fullpath;
        m.uniqueKeys.push(fullpath);

        const key = await this.s3.presign(this.cfg.vars.S3_BUCKET, fullpath);
        await m.save();

        return { key, id };
    }
}
