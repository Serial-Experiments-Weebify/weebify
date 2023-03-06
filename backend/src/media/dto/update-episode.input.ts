import { InputType, PartialType } from '@nestjs/graphql';
import { AddEpisode } from './add-episode.input';

@InputType()
export class UpdateEpisode extends PartialType<AddEpisode>(AddEpisode) {}
