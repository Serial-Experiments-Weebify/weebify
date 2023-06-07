import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { MeiliSearchModule, MeiliSearchService } from 'nestjs-meilisearch';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: User.name,
                imports: [MeiliSearchModule],
                inject: [MeiliSearchService],
                useFactory(m: MeiliSearchService) {
                    const schema = UserSchema;

                    schema.post('save', async function (_, next) {
                        try {
                            await m.updateDocuments('users', [
                                {
                                    id: this.id,
                                    username: this.username,
                                    displayName: this.displayName,
                                    pfp: this.pfp,
                                    role: this.role,
                                },
                            ]);
                        } catch {
                            console.error(
                                `Update user index failed @ ${this.id}`,
                            );
                        }
                        next();
                    });

                    return schema;
                },
            },
        ]),
    ],
    providers: [UsersResolver, UsersService],
})
export class UsersModule {}
