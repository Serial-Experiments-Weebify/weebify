import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { User } from '../users/dto/user.out';
import { LoginInput } from './dto/login.input';
import { AuthService } from './auth.service';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { AuthOnlyGuard, NoAuthGuard } from './auth.guard';
import { UserDocument } from 'src/users/entities/user.entity';
import { Request } from 'express';
import { AuthSession } from './dto/authSession.out';
import { roleCompare } from 'src/users/enums/UserRole.enum';
import { UserRole } from 'src/users/enums/UserRole.enum';
import { ConfigService } from '@nestjs/config';

@Resolver()
export class AuthResolver {
    constructor(
        private readonly auth: AuthService,
        private readonly cfg: ConfigService,
    ) {}

    @UseGuards(AuthOnlyGuard)
    @Query(() => User, { nullable: true })
    async me(@Context('user') user: UserDocument) {
        return user;
    }

    @UseGuards(NoAuthGuard)
    @Mutation(() => AuthSession)
    async loginSession(
        @Args('loginInput') input: LoginInput,
        @Context('req') request: Request,
    ): Promise<AuthSession> {
        const ip = request.ip;
        const userAgent = request.headers['user-agent'] ?? '<unknown>';
        const auth = await this.auth.loginSession(input, ip, userAgent);

        return {
            token: auth.jwt,
            searchKey: auth.searchKey,
            expiresAt: auth.expiration,
        };
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => Boolean)
    async logout(
        @Context('user') user: UserDocument,
        @Context('session') sid: string,
    ) {
        await this.auth.logoutSession(user.id, sid);
        return true;
    }

    @UseGuards(AuthOnlyGuard)
    @Mutation(() => Boolean)
    async revokeSession(
        @Context('user') user: UserDocument,
        @Args('sid') sid: string,
        @Args('user', { nullable: true }) userId?: string,
    ) {
        if (userId && roleCompare(user.role, UserRole.ADMIN) < 0) {
            throw new ForbiddenException(
                "You cannot revoke other user's sessions",
            );
        }

        await this.auth.revokeSession(userId ?? user.id, sid);
        return true;
    }

    @Query(() => String)
    async S3PublicURL() {
        return this.cfg.get<string>('S3_PUBLIC_URL') ?? '/cdn/weebify';
    }
}
