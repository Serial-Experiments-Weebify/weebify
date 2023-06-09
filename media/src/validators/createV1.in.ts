import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    Min,
    ValidateNested,
} from 'class-validator';

import { CreateV0 } from './createV0.in';
import { IsStringMap } from './custom/isStringMap';

class CreateV1Subtitles extends CreateV0 {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    lang: string;

    @IsBoolean()
    default: boolean;

    @IsNotEmpty()
    file: string;
}

class CreateV1Resolution {
    @IsNotEmpty()
    name: string;

    @IsInt()
    w: number;

    @IsInt()
    h: number;
}

class CreateV1Chapter {
    @IsNumber()
    @Min(0)
    start: number;

    @IsNumber()
    end: number;

    @IsNotEmpty()
    title: string;
}

class CreateV1Audio {
    @IsNotEmpty()
    lang: string;

    @IsBoolean()
    default: boolean;

    @IsNotEmpty()
    file: string;
}

class CreateV1Video {
    @ValidateNested()
    resolution: CreateV1Resolution;

    @IsNotEmpty()
    file: string;
}

export class CreateV1 extends CreateV0 {
    @ValidateNested({ each: true })
    subtitles: CreateV1Subtitles[];

    @IsStringMap()
    fontMap: Record<string, string>;

    @ValidateNested({ each: true })
    audio: CreateV1Audio[];

    @ValidateNested({ each: true })
    videos: CreateV1Video[];

    @ValidateNested({ each: true })
    chapters: CreateV1Chapter[];
}
