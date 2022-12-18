import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { User } from '../users/entities/pubuser.entity';
import { LoginInput } from './dto/login.input';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { AuthOnlyGuard, NoAuthGuard } from './auth.guard';
import { UserDocument } from 'src/users/entities/user.entity';

@Resolver()
export class AuthResolver {
    constructor(private readonly auth: AuthService) { }

    @UseGuards(AuthOnlyGuard)
    @Query(() => User, { nullable: true })
    async me(@Context('user') user: UserDocument) {
        return new User(user, true);
    }

    @UseGuards(NoAuthGuard)
    @Mutation(() => String)
    async login(@Args('loginInput') input: LoginInput) {
        return (await this.auth.login(input)).token;
    }
}
