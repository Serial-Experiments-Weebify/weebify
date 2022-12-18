import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/pubuser.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UseGuards } from '@nestjs/common';
import { AuthOnlyGuard, NoAuthGuard } from 'src/auth/auth.guard';
import { UpdateUserInput } from './dto/update-user.input';
import { Roles } from 'src/auth/roles/role.decorator';
import { UserRole } from './enums/UserRole.enum';
import { UserDocument } from './entities/user.entity';

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(NoAuthGuard)
    @Mutation(() => User)
    async signUp(
        @Args('createUserInput') createUserInput: CreateUserInput,
    ) {
        return await this.usersService.create(createUserInput);
    }



    @UseGuards(AuthOnlyGuard)
    @Query(() => [User], { name: 'users' })
    @Roles(UserRole.ADMIN, UserRole.GOD, UserRole.MODERATOR)
    async findAll() {
        const users = (await this.usersService.findAll()).map((u) => new User(u, true));
        return users;
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => String)
    @Roles(UserRole.ADMIN, UserRole.GOD, UserRole.MODERATOR)
    async generateInviteCode(
        @Context('user') user: User,
        @Args('id', { nullable: true }) tid: string,
    ) {
        return await this.usersService.addInvite(tid ?? user.id);
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => User)
    async updateUser(
        @Context('user') user: UserDocument,
        @Args('updateUserInput') input: UpdateUserInput
    ) {
        if (input.id && input.id != user._id) {
            return await this.usersService.updateOther(input, user.role);
        }
        return await this.usersService.updateSelf(input, user);
    }

    @UseGuards(AuthOnlyGuard)
    @Query(() => User, { name: 'user' })
    async user(@Args('idOrUsername', { type: () => String }) idOrUsername: string) {
        const u = await this.usersService.findOne(idOrUsername);
        if (!u) throw "User not found";
        return new User(u, false);
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => Boolean)
    @Roles(UserRole.GOD)
    async deleteUser(@Args('id', { type: () => String }) id: string) {
        const { deletedCount } = await (this.usersService.deleteAccount(id));
        return deletedCount == 1;
    }
}
