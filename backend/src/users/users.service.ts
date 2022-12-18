import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { AnyKeys, Connection, FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { CreateUserInput } from './dto/create-user.input';
import { User, UserDocument } from './entities/user.entity';
import { UserRole } from './enums/UserRole.enum';
import { compare, hash } from 'bcrypt';
import { UpdateUserInput } from './dto/update-user.input';

const DEFAULT_PFP = 'default';

const PASSWORD_HASH_ROUNDS = 10;
const ALLOWED_TO_UPDATE_OTHER = [UserRole.ADMIN, UserRole.GOD];
const MONGO_ID_REGEX = /^[a-f0-9]{24}$/i

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User')
        private userModel: Model<UserDocument>,
        @InjectConnection()
        private connection: Connection,
    ) { }

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

    async updateOther(u: UpdateUserInput, as: UserRole) {
        if (!ALLOWED_TO_UPDATE_OTHER.includes(as)) throw "You cannot update *other* users";

        if (!u.id) throw "Id not provided";

        const them = await this.userModel.findById(u.id);

        if (!them) throw "Invalid ID";

        if (ALLOWED_TO_UPDATE_OTHER.includes(them.role)) {
            if (them.role == as || them.role == UserRole.GOD)
                throw "You cannot update *this* user";
        }

        return await this.trustedUpate(u);
    }

    async updateSelf(u: UpdateUserInput, self: UserDocument) {
        u.id = self._id;
        if (u.password || u.email) {
            if (!u.oldPassword) throw "Missing old password";
            if (!compare(u.oldPassword, self.passwordHash)) {
                throw 'Incorrect password';
            }
        }

        return await this.trustedUpate(u);
    }

    /**
     * Won't do any more checks
     */
    async trustedUpate(u: UpdateUserInput) {
        const $set: AnyKeys<UserDocument> = {};

        if (u.password) {
            $set.passwordHash = await hash(u.password, PASSWORD_HASH_ROUNDS);
        }

        // set fields if present
        u.bio && ($set.bio = u.bio);
        u.email && ($set.email = u.email);
        u.displayName && ($set.displayName = u.displayName);

        return await this.userModel.findByIdAndUpdate(u.id, { $set });
    }

    async findOne(idOrUsername: string) {
        const $or: FilterQuery<UserDocument>[] = [
            { username: idOrUsername }
        ];

        if (MONGO_ID_REGEX.test(idOrUsername))
            $or.push({ _id: idOrUsername });

        return await this.userModel.findOne({ $or });
    }

    async findAll() {
        return await this.userModel.find();
    }

    async deleteAccount(id: string) {
        return await this.userModel.deleteOne({ _id: id });
    }
}
