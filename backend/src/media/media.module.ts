import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaResolver } from './media.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema, TVMediaDocument } from './entities/media.entity';
import { TvSchema } from './entities/tv.schema';
import { MediaKind } from './enums/mediaKind.enum';
import { MovieSchema } from './entities/movie.schema';
import { MeiliSearchModule, MeiliSearchService } from 'nestjs-meilisearch';
import { Video, VideoSchema } from './entities/video.entity';
import { V0Schema } from './entities/v0.schema';
import { WeebifyVideoType } from './enums/videoType.enum';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { V1Schema } from './entities/v1.schema';

@Module({
    providers: [MediaResolver, MediaService],
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                return {
                    secret: config.getOrThrow('MEDIA_JWT_KEY'),
                };
            },
        }),
        MongooseModule.forFeatureAsync([
            {
                name: Media.name,
                imports: [MeiliSearchModule],
                inject: [MeiliSearchService],
                useFactory(m: MeiliSearchService) {
                    const schema = MediaSchema;

                    schema.post('save', async function (_, next) {
                        try {
                            await m.updateDocuments('media', [
                                {
                                    id: this.id,
                                    title: this.title,
                                    altTitles: this.altTitles,
                                    genres: this.genres,
                                    kind: this.kind,
                                    year: this.year,
                                    cover: this.cover,
                                    coverColor: this.coverColor,
                                    status: this.status,
                                    episodes:
                                        (this as TVMediaDocument).episodes
                                            ?.length ?? 0,
                                },
                            ]);
                        } catch {
                            console.error(
                                `Update media index failed @ ${this.id}`,
                            );
                        }
                        next();
                    });

                    // sort episodes on save
                    schema.pre('save', function (next) {
                        if (this.kind == MediaKind.TV) {
                            const that = this as TVMediaDocument;
                            if (that.episodes) {
                                that.episodes = that.episodes.sort((a, b) => {
                                    const ediff =
                                        a.episodeNumber - b.episodeNumber;
                                    if (ediff !== 0) return ediff;

                                    if (a.extra && !b.extra) {
                                        return 1;
                                    } else if (b.extra && !a.extra) {
                                        return -1;
                                    } else if (!a.extra && !b.extra) {
                                        return 0;
                                    } else if (a.extra && b.extra) {
                                        return a.extra.localeCompare(b.extra);
                                    }
                                    return 0;
                                });
                            }
                        }
                        next();
                    });

                    return schema;
                },
                discriminators: [
                    { name: 'tvmedia', schema: TvSchema, value: MediaKind.TV },
                    {
                        name: 'moviemedia',
                        schema: MovieSchema,
                        value: MediaKind.MOVIE,
                    },
                ],
            },
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
    exports: [MediaService],
})
export class MediaModule {}
