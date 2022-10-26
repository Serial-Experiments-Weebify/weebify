import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/pubuser.entity';
import { UserRole } from 'src/users/enums/UserRole.enum';
import { ROLES_KEY } from './role.decorator';

/*
    Looks for the user in GQL context and checks if the user has any
    of the allowed roles
*/

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!allowedRoles) return true;

        const ctx = GqlExecutionContext.create(context);
        const user: User = (await ctx.getContext().user) ?? null;
        const role = user?.role || UserRole.USER;

        return allowedRoles.includes(role);
    }
}
