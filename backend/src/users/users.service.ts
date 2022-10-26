import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { CreateUserInput } from './dto/create-user.input';
import { UserDocument } from './entities/user.entity';
import { UserRole } from './enums/UserRole.enum';
import { hash } from 'bcrypt';

const DEFAULT_PFP = 'default';

const PASSWORD_HASH_ROUNDS = 10;
@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User')
        private userModel: Model<UserDocument>,
        @InjectConnection()
        private connection: Connection,
    ) {}

    /*
        TODO: USE TRANSACTION
         mongo needs to be started as a replica set
         couldnt figure out how to do it in docker
    */
    async create(input: CreateUserInput) {
        const u = new this.userModel();

        //find the inviter
        const inviter = await this.userModel.findOne({
            inviteCodes: input.inviteCode,
        });
        if (!inviter) throw 'Invite code does not exist';

        //setup the new user
        u.displayName = u.username = input.username;
        u.email = input.email;
        u.pfp = DEFAULT_PFP;
        u.bio = '';
        u.role = UserRole.USER;
        u.invitedBy = inviter;
        u.inviteCodes = [];
        u.passwordHash = await hash(input.password, PASSWORD_HASH_ROUNDS);

        try {
            await u.save();
            await inviter.updateOne({
                $pull: { inviteCodes: input.inviteCode },
            });
        } catch (e) {
            throw e;
        }
        return u;
    }

    async addInvite(uid: string) {
        const invite = new Types.ObjectId().toString();
        await this.userModel.updateOne(
            { _id: uid },
            { $push: { inviteCodes: invite } },
        );
        return invite;
    }

    async findAll() {
        return await this.userModel.find();
    }
}
