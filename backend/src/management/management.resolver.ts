import { Mutation, Resolver, Query, Args, Context } from '@nestjs/graphql';
import { UsersService } from 'src/users/users.service';
import { ManagementService } from './management.service';
import { MediaService } from 'src/media/media.service';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { AuthOnlyGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles/role.decorator';
import { UserRole } from 'src/users/enums/UserRole.enum';
import { APIKey, APIKeyWithKey } from './dto/ApiKey.out';
import { User } from 'src/users/dto/user.out';
import { UserDocument } from 'src/users/entities/user.entity';

@Resolver()
@Roles(UserRole.GOD, UserRole.ADMIN)
export class ManagementResolver {
    constructor(
        private usersService: UsersService,
        private managementService: ManagementService,
        private mediaService: MediaService,
    ) {}

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => Boolean)
    async rebuildUserSearch() {
        return await this.usersService.rebuildSearch();
    }

    @Mutation(() => Boolean)
    async rebuildMediaSearch() {
        return await this.mediaService.rebuildSearch();
    }

    @Query(() => [APIKey])
    async listAPIKeys() {
        return await this.managementService.listAPIKeys();
    }

    @Mutation(() => APIKeyWithKey)
    async createAPIKey(
        @Args('name') friendlyName: string,
        @Context('user') user: UserDocument,
    ) {
        if (friendlyName.length < 3 || friendlyName.length > 32)
            throw new BadRequestException(
                'Name must be between 3 and 32 characters long',
            );

        return await this.managementService.createAPIKey(friendlyName, user.id);
    }

    @Mutation(() => Boolean)
    async deleteAPIKey(@Args('id') id: string) {
        return await this.managementService.deleteAPIKey(id);
    }

    @UseGuards(AuthOnlyGuard)
    @Query(() => [User], { name: 'users' })
    @Roles(UserRole.ADMIN, UserRole.GOD, UserRole.MODERATOR)
    async findAll() {
        const users = await this.usersService.findAll();
        return users;
    }
}
