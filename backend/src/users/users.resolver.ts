import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/pubuser.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UseGuards } from '@nestjs/common';
import { AuthOnlyGuard, NoAuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles/role.decorator';
import { UserRole } from './enums/UserRole.enum';

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @UseGuards(NoAuthGuard)
    @Mutation(() => User)
    async createUser(
        @Args('createUserInput') createUserInput: CreateUserInput,
    ) {
        console.log({ createUserInput });
        return await this.usersService.create(createUserInput);
    }

    @UseGuards(AuthOnlyGuard)
    @Query(() => [User], { name: 'users' })
    @Roles(UserRole.ADMIN)
    async findAll() {
        return (await this.usersService.findAll()).map((u) => u.toGql(true));
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => String)
    @Roles(UserRole.ADMIN)
    async generateInviteCode(
        @Context('user') user: User,
        @Args('id', { nullable: true }) tid: string,
    ) {
        return await this.usersService.addInvite(tid ?? user.id);
    }

    // @Query(() => User, { name: 'user' })
    // findOne(@Args('id', { type: () => Int }) id: number) {
    //   return this.usersService.findOne(id);
    // }

    // @Mutation(() => User)
    // updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    //   return this.usersService.update(updateUserInput.id, updateUserInput);
    // }

    // @Mutation(() => User)
    // removeUser(@Args('id', { type: () => Int }) id: number) {
    //   return this.usersService.remove(id);
    // }
}
