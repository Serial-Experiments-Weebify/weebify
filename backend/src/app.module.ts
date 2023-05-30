import { join } from 'path';

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MediaModule } from './media/media.module';

import { AuthService } from './auth/auth.service';
import { RolesGuard } from './auth/roles/role.guard';
import { authenticateUser } from './auth/auth.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MeiliSearchModule } from 'nestjs-meilisearch';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        MediaModule,
        UsersModule,
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                return { uri: await config.getOrThrow('DATABASE') };
            },
        }),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            imports: [AuthModule],
            inject: [AuthService],
            useFactory: (authService: AuthService) => ({
                async context({ req }) {
                    const user = await authenticateUser(authService, req);
                    return { req, user };
                },
                autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            }),
        }),
        MeiliSearchModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                return {
                    host: config.getOrThrow('SEARCH_HOST'),
                    apiKey: config.getOrThrow('SEARCH_KEY'),
                };
            },
        }),
    ],
    providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
