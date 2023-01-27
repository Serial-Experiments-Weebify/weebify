import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaResolver } from './media.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaSchema } from './entities/media.entity';
import { TvSchema } from './entities/tv.schema';
import { MediaKind } from './enums/mediaKind.enum';
import { MovieSchema } from './entities/movie.schema';

@Module({
  providers: [MediaResolver, MediaService],
  imports: [
    MongooseModule.forFeature([{
      name: 'media', schema: MediaSchema, discriminators: [
        { name: 'tvmedia', schema: TvSchema, value: MediaKind.TV },
        { name: 'moviemedia', schema: MovieSchema, value: MediaKind.MOVIE }
      ]
    }])]
})
export class MediaModule { }
