import { ObjectType } from '@nestjs/graphql';
import { VideoStatus } from '../enums/videoStatus.enum';
import { WeebifyVideoType } from '../enums/videoType.enum';
import { Video } from './video.interface';

@ObjectType({ implements: () => Video })
export class VideoV1 implements Video {
    id: string;
    job: string;
    status: VideoStatus;
    type: WeebifyVideoType;
    created: Date;
}
