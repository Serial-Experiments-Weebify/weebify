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
import { ManagementModule } from './management/management.module';
import { VideoModule } from './video/video.module';
import dockerSecrets from './config/docker-secrets';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [
            dockerSecrets({
                'DATABASE': 'mongoConnection',
                'AUTH_JWT_KEY': 'authJwtKey',
                'SEARCH_KEY': 'searchKey',
            })
        ] }),

        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                const uri = await config
                    .getOrThrow('DATABASE')
                    .replace(/(^\"|\"$)/g, ''); // WHY IS THIS NEEDED???

                return { uri };
            },
        }),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            imports: [AuthModule],
            inject: [AuthService],
            useFactory: (authService: AuthService) => ({
                async context({ req }: { req: any }) {
                    const { session, user } = await authenticateUser(
                        authService,
                        req,
                    );
                    return { req, user, session };
                },
                autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
                graphiql: true,
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
        AuthModule,
        MediaModule,
        UsersModule,
        ManagementModule,
        VideoModule,
    ],
    providers: [{ provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
