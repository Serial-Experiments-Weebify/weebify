import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { join } from 'path';
import { authenticateUser } from './auth/auth.middleware';
import { AuthService } from './auth/auth.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles/role.guard';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        MongooseModule.forRoot(
            'mongodb://root:root@localhost:27017/weebify?authMechanism=DEFAULT&authSource=admin',
        ),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            imports: [AuthModule],
            inject: [AuthService],
            useFactory: (authService: AuthService) => ({
                context({ req }) {
                    const user = authenticateUser(authService, req);
                    return { req, user };
                },
                autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            }),
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule {}
