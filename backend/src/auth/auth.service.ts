import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { LoginInput } from './dto/login.input';
import { JwtService } from '@nestjs/jwt';

/*
    Service for handling authentication
*/

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User')
        private userModel: Model<UserDocument>,
        private jwt: JwtService,
    ) {}

    async login(input: LoginInput): Promise<{ user: User; token: string }> {
        const user = await this.userModel.findOne({ username: input.username });
        if (!user) throw 'User does not exist';

        if (!compare(input.password, user.passwordHash)) {
            throw 'Incorrect password';
        }

        const token = this.jwt.sign({ sub: user.id }, { expiresIn: '30d' });

        return { user, token };
    }

    async me(token?: string): Promise<User | null> {
        if (!token) return null;

        const data = this.jwt.decode(token, { json: true }) as { sub: unknown };
        if (typeof data?.sub !== 'string') return null;

        return await this.userModel
            .findById(data.sub)
            .populate('invitedBy')
            .exec();
    }
}
