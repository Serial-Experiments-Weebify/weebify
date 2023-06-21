import { Field, ObjectType } from '@nestjs/graphql';
import { WeebifyVideoType } from '../enums/videoType.enum';

@ObjectType()
export class VideoSubtitle {
    @Field()
    name: string;

    @Field()
    lang: string;

    @Field()
    default: boolean;

    @Field()
    file: string;
}

@ObjectType()
export class VideoResolution {
    @Field()
    name: string;

    @Field()
    w: number;

    @Field()
    h: number;
}

@ObjectType()
export class VideoChapter {
    @Field()
    start: number;

    @Field()
    title: string;

    @Field()
    end: number;
}

@ObjectType()
export class VideoFontRef {
    @Field()
    name: string;

    @Field()
    cdnName: string;
}

@ObjectType()
export class VideoV1 {
    @Field()
    id: string;

    @Field(() => WeebifyVideoType)
    type: WeebifyVideoType;

    @Field()
    created: Date;

    @Field(() => [VideoSubtitle])
    subtitles: VideoSubtitle[];

    @Field(() => [VideoResolution])
    resolutions: VideoResolution[];

    @Field(() => [VideoChapter])
    chapters: VideoChapter[];

    @Field(() => [VideoFontRef])
    fonts: VideoFontRef[];
}
