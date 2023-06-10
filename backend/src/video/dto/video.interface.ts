import { InterfaceType, Field } from '@nestjs/graphql';
import { VideoStatus } from '../enums/videoStatus.enum';
import { WeebifyVideoType } from '../enums/videoType.enum';
import { VideoV0 } from './videoV0.out';
import { VideoV1 } from './VideoV1.out';

@InterfaceType({
    resolveType: (value: Video) => {
        switch (value.type) {
            case WeebifyVideoType.V0:
                return VideoV0;
            case WeebifyVideoType.V1:
                return VideoV1;
        }
    },
})
export abstract class Video {
    @Field()
    id: string;

    @Field()
    job: string;

    @Field()
    status: VideoStatus;

    @Field()
    type: WeebifyVideoType;

    @Field()
    created: Date;
}
