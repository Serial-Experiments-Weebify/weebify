import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsNumber,
    Length,
    Matches,
    Min,
    ValidateNested,
    validate,
} from "class-validator";
import { CreateV0 } from "./createV0.in";
import { IsStringMap } from "./custom/isStringMap";
import { plainToClass } from "class-transformer";

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

export class CreateV1 extends CreateV0 {
    @ValidateNested({ each: true })
    subtitles: CreateV1Subtitles[];

    @IsStringMap()
    fontMap: Record<string, string>;

    @ValidateNested({ each: true })
    resolutions: CreateV1Resolution[];

    @ValidateNested({ each: true })
    chapters: CreateV1Chapter[];
}
