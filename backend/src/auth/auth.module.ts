import { Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthResolver } from './auth.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, SessionSchema } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

/*
    Authentication and authorization module
*/

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            async useFactory(config: ConfigService) {
                return {
                    secret: config.getOrThrow('AUTH_JWT_KEY'),
                };
            },
        }),
    ],
    exports: [AuthService, AuthResolver],
    providers: [AuthResolver, UsersService, AuthService],
})
export class AuthModule {}
