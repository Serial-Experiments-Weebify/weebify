import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './entities/video.entity';
import { V0Schema } from './entities/v0.schema';
import { WeebifyVideoType } from './enums/videoType.enum';
import { V1Schema } from './entities/v1.schema';
import { VideoResolver } from './video.resolver';
import { VideoService } from './video.service';
import { MediaModule } from 'src/media/media.module';

@Module({
    imports: [
        forwardRef(() => MediaModule),
        MongooseModule.forFeatureAsync([
            {
                name: Video.name,
                useFactory() {
                    return VideoSchema;
                },
                discriminators: [
                    {
                        name: 'VideoV0',
                        schema: V0Schema,
                        value: WeebifyVideoType.V0,
                    },
                    {
                        name: 'VideoV1',
                        schema: V1Schema,
                        value: WeebifyVideoType.V1,
                    },
                ],
            },
        ]),
    ],
    providers: [VideoService, VideoResolver],
    exports: [VideoService],
})
export class VideoModule {}
