import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/pubuser.entity';

/*
    Basic guards for blocking/allowing access for authenticated users
*/

@Injectable()
export class AuthOnlyGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const user: User | null = ctx.getContext().user || null;
        return !!user;
    }
}

@Injectable()
export class NoAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const user: User | null = ctx.getContext().user || null;
        return !user;
    }
}
