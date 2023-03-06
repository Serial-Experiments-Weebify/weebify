import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaResolver } from './media.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, MediaSchema, TVMediaDocument } from './entities/media.entity';
import { TvSchema } from './entities/tv.schema';
import { MediaKind } from './enums/mediaKind.enum';
import { MovieSchema } from './entities/movie.schema';

@Module({
    providers: [MediaResolver, MediaService],
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: Media.name,
                useFactory: () => {
                    const schema = MediaSchema;

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
        ]),
    ],
})
export class MediaModule {}
