import { Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthResolver } from './auth.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

/*
    Authentication and authorization module
    TODO: add refresh tokens and 2FA?
*/

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        JwtModule.register({ secret: 'REPLACEME' }), //TODO: replaceme
    ],
    exports: [AuthService, AuthResolver],
    providers: [AuthResolver, UsersService, AuthService],
})
export class AuthModule {}
