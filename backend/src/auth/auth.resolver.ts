import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { User } from '../users/entities/pubuser.entity';
import { LoginInput } from './dto/login.input';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { AuthOnlyGuard, NoAuthGuard } from './auth.guard';

@Resolver()
export class AuthResolver {
    constructor(private readonly auth: AuthService) {}

    @UseGuards(AuthOnlyGuard)
    @Query(() => User)
    async me(@Context('user') user: User) {
        return user;
    }

    @UseGuards(NoAuthGuard)
    @Mutation(() => String)
    async login(@Args('loginInput') input: LoginInput) {
        return (await this.auth.login(input)).token;
    }
}
