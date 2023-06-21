import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { MeiliSearchModule, MeiliSearchService } from 'nestjs-meilisearch';

@Module({
    providers: [UsersResolver, UsersService],
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: User.name,
                imports: [MeiliSearchModule],
                inject: [MeiliSearchService],
                useFactory() {
                    const schema = UserSchema;
                    return schema;
                },
            },
        ]),
    ],
    exports: [UsersService],
})
export class UsersModule {}
