import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MediaService } from './media.service';
import { Roles } from 'src/auth/roles/role.decorator';
import { AuthOnlyGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserRole } from 'src/users/enums/UserRole.enum';

import { Media } from './dto/media.out';
import { Episode } from './dto/episode.out';
import { AddEpisode } from './dto/add-episode.input';
import { UpdateEpisode } from './dto/update-episode.input';
import { UpdateMediaInput } from './dto/update-media.input';
import { CreateMediaInput } from './dto/create-media.input';
import { EpisodeStatus } from './enums/episodeStatus.enum';

@UseGuards(AuthOnlyGuard)
@Resolver(() => Media)
export class MediaResolver {
    constructor(private readonly mediaService: MediaService) {}

    @Mutation(() => String)
    @Roles(UserRole.GOD, UserRole.ADMIN)
    async createMedia(
        @Args('createMediaInput') createMediaInput: CreateMediaInput,
    ) {
        return await this.mediaService.create(createMediaInput);
    }

    @Mutation(() => String)
    @Roles(UserRole.GOD, UserRole.ADMIN)
    async updateMedia(
        @Args('id') id: string,
        @Args('updateMediaInput') updateMediaInput: UpdateMediaInput,
    ) {
        await this.mediaService.update(id, updateMediaInput);
        return id;
    }

    @Mutation(() => String)
    @Roles(UserRole.GOD, UserRole.ADMIN)
    async updateMediaCover(@Args('id') id: string) {
        return await this.mediaService.updateCover(id);
    }

    @Mutation(() => Boolean)
    @Roles(UserRole.GOD, UserRole.ADMIN)
    async removeMedia(@Args('id', { type: () => String }) id: string) {
        await this.mediaService.remove(id);
        return true;
    }

    @Query(() => Media, { name: 'mediaById' })
    async findOne(@Args('id', { type: () => String }) id: string) {
        return await this.mediaService.findOne(id);
    }

    @Query(() => [Media], { name: 'media' })
    findAll() {
        return this.mediaService.findAll();
    }

    @Mutation(() => Media)
    @Roles(UserRole.GOD, UserRole.ADMIN)
    async addEpisode(
        @Args('mediaId', { type: () => String }) mediaId: string,
        @Args('episode', { type: () => AddEpisode }) episode: AddEpisode,
    ) {
        return await this.mediaService.addEpisode(mediaId, episode);
    }

    @Mutation(() => Media)
    @Roles(UserRole.GOD, UserRole.ADMIN)
    async quickFill(
        @Args('mediaId', { type: () => String }) mediaId: string,
        @Args('count', { type: () => Int }) count: number,
        @Args('status', { type: () => EpisodeStatus }) status: EpisodeStatus,
    ) {
        return await this.mediaService.quickFill(mediaId, count, status);
    }

    @Mutation(() => Boolean)
    @Roles(UserRole.GOD, UserRole.ADMIN)
    async removeEpisode(
        @Args('mediaId', { type: () => String }) mediaId: string,
        @Args('episodeId', { type: () => String }) episodeId: string,
    ) {
        return await this.mediaService.removeEpisode(mediaId, episodeId);
    }

    @Mutation(() => Episode)
    @Roles(UserRole.GOD, UserRole.ADMIN)
    async updateEpisode(
        @Args('mediaId', { type: () => String }) mediaId: string,
        @Args('episodeId', { type: () => String }) episodeId: string,
        @Args('episode', { type: () => UpdateEpisode }) episode: UpdateEpisode,
    ) {
        return await this.mediaService.updateEpisode(
            mediaId,
            episodeId,
            episode,
        );
    }

    @Mutation(() => Boolean)
    @Roles(UserRole.GOD, UserRole.ADMIN)
    async rebuildMediaSearch() {
        return await this.mediaService.rebuildSearch();
    }
}
