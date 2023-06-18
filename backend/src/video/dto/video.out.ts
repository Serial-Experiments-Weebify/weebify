import { createUnionType } from '@nestjs/graphql';
import { VideoV0 } from './videoV0.out';
import { VideoV1 } from './VideoV1.out';
import { WeebifyVideoType } from '../enums/videoType.enum';

export const MediaVideoUnion = createUnionType({
    name: 'MediaVideo',
    types: () => [VideoV0, VideoV1] as const,
    resolveType: ({ type }: { type: WeebifyVideoType }) => {
        switch (type) {
            case WeebifyVideoType.V0:
                return VideoV0;
            case WeebifyVideoType.V1:
                return VideoV1;
        }
    },
});
