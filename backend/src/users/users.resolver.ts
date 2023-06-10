import {
    Resolver,
    Query,
    Mutation,
    Args,
    Context,
    ResolveField,
    Parent,
} from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './dto/user.out';
import { CreateUserInput } from './dto/create-user.input';
import {
    ForbiddenException,
    NotFoundException,
    UseGuards,
} from '@nestjs/common';
import { AuthOnlyGuard, NoAuthGuard } from 'src/auth/auth.guard';
import { UpdateUserInput } from './dto/update-user.input';
import { Roles } from 'src/auth/roles/role.decorator';
import { roleCompare, UserRole } from './enums/UserRole.enum';
import { UserDocument } from './entities/user.entity';
import { Session } from './dto/session.out';

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @ResolveField(() => String)
    id(@Parent() user: User) {
        return user.id ?? (user as any)._id ?? '';
    }

    @ResolveField(() => String, { nullable: true })
    email(@Parent() oUser: User, @Context('user') user: UserDocument) {
        return roleCompare(user.role, UserRole.ADMIN) >= 0 ? oUser.email : null;
    }

    @UseGuards(AuthOnlyGuard)
    @ResolveField(() => [String], { nullable: true })
    async availableInviteCodes(
        @Context('user') user: UserDocument,
        @Parent() userO: UserDocument,
    ) {
        if (
            user.id != (userO.id ?? (userO as any)._id) &&
            roleCompare(user.role, UserRole.ADMIN) < 0
        ) {
            return null;
        }
        return userO.inviteCodes;
    }

    @UseGuards(NoAuthGuard)
    @Mutation(() => User)
    async signUp(@Args('createUserInput') createUserInput: CreateUserInput) {
        return await this.usersService.create(createUserInput);
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => String)
    @Roles(UserRole.ADMIN, UserRole.GOD, UserRole.MODERATOR)
    async generateInviteCode(
        @Context('user') user: User,
        @Args('id', { nullable: true }) tid?: string,
    ) {
        return await this.usersService.addInvite(tid ?? user.id);
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => User)
    async updateUser(
        @Context('user') user: UserDocument,
        @Args('updateUserInput') input: UpdateUserInput,
    ) {
        if (input.id && input.id != user._id) {
            return await this.usersService.updateOther(input, user.role);
        }
        return await this.usersService.updateSelf(input, user);
    }

    @UseGuards(AuthOnlyGuard)
    @Query(() => User, { name: 'user' })
    async user(
        @Context('user') user: UserDocument,
        @Args('idOrUsername', { type: () => String }) idOrUsername: string,
    ) {
        const u = await this.usersService.findOne(idOrUsername);
        if (!u) throw new NotFoundException('User not found');
        return u;
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => Boolean)
    @Roles(UserRole.GOD)
    async deleteUser(@Args('id', { type: () => String }) id: string) {
        const { deletedCount } = await this.usersService.deleteAccount(id);
        return deletedCount == 1;
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => Boolean)
    @Roles(UserRole.ADMIN, UserRole.GOD)
    async setRole(
        @Context('user') user: UserDocument,
        @Args('id', { type: () => String }) id: string,
        @Args('role', { type: () => UserRole }) role: UserRole,
    ) {
        return await this.usersService.setRole(id, role, user.role);
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => String)
    async updatePfp(
        @Context('user') user: UserDocument,
        @Args('id', { nullable: true }) id?: string,
    ) {
        return await this.usersService.createPfpToken(id ?? user.id);
    }

    @UseGuards(AuthOnlyGuard)
    @ResolveField(() => [User])
    async followers(@Parent() user: User) {
        return await this.usersService.findFollowers(user.id);
    }

    @UseGuards(AuthOnlyGuard)
    @ResolveField(() => [User])
    async following(@Parent() user: User) {
        return await this.usersService.findFollowing(user.id);
    }

    @UseGuards(AuthOnlyGuard)
    @ResolveField(() => User)
    async invitedBy(@Parent() user: User) {
        return await this.usersService.findInviter(user.id);
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => String)
    async follow(
        @Context('user') user: UserDocument,
        @Args('uid', { type: () => String }) uid: string,
    ) {
        await this.usersService.followUser(user.id, uid);
        return uid;
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => String)
    async unfollow(
        @Context('user') user: UserDocument,
        @Args('uid', { type: () => String }) uid: string,
    ) {
        await this.usersService.unfollowUser(user.id, uid);
        return uid;
    }

    @UseGuards(AuthOnlyGuard)
    @Query(() => [String])
    async followed(@Context('user') user: UserDocument) {
        return user.following;
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => Boolean)
    async revokeInvite(
        @Context('user') user: UserDocument,
        @Args('invite') invite: string,
        @Args('user', { nullable: true }) userId?: string,
    ) {
        const isAdmin = roleCompare(user.role, UserRole.MODERATOR) >= 0;

        if (userId != user.id) {
            if (!isAdmin) {
                throw new ForbiddenException(
                    `You can't revoke this user's invites`,
                );
            }

            return this.usersService.revokeInvite(invite, userId);
        }

        if (!isAdmin) {
            return this.usersService.revokeInvite(invite, user.id);
        }

        return this.usersService.revokeInvite(invite);
    }

    @UseGuards(AuthOnlyGuard)
    @ResolveField(() => [Session], {
        nullable: true,
    })
    async sessions(
        @Context('user') user: UserDocument,
        @Parent() userO: UserDocument,
    ) {
        if (user.id != userO.id) {
            // if we're checking someone else's sessions, we need to be an admin
            // and higher than the user we're checking
            if (
                roleCompare(user.role, UserRole.ADMIN) < 0 ||
                roleCompare(user.role, userO.role) <= 0
            ) {
                return null;
            }
        }

        return userO.sessions.map(
            ({
                id,
                expiresAt,
                ipAddress,
                lastAccessed,
                searchKey,
                userAgent,
            }) => ({
                sid: id,
                expiresAt,
                ipAddress,
                lastAccessed,
                searchKey,
                userAgent,
            }),
        );
    }
}
