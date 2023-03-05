import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MediaService } from './media.service';
import { Media } from './dto/media.out';
import { CreateMediaInput } from './dto/create-media.input';
import { UpdateMediaInput } from './dto/update-media.input';
import { AuthOnlyGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/roles/role.decorator';
import { UserRole } from 'src/users/enums/UserRole.enum';

@Resolver(() => Media)
export class MediaResolver {
    constructor(private readonly mediaService: MediaService) {}

    @UseGuards(AuthOnlyGuard)
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

    @UseGuards(AuthOnlyGuard)
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
    findOne(@Args('id', { type: () => String }) id: string) {
        return this.mediaService.findOne(id);
    }

    @Query(() => [Media], { name: 'media' })
    findAll() {
        return this.mediaService.findAll();
    }
}
