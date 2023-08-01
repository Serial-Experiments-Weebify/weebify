import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateUserInput } from './dto/create-user.input';
import { User, UserDocument } from './entities/user.entity';
import { roleCompare, UserRole } from './enums/UserRole.enum';
import { verify, hash } from 'argon2';
import { UpdateUserInput } from './dto/update-user.input';
import { v4 as uuid } from 'uuid';
import { InjectMeiliSearch, MeiliSearchService } from 'nestjs-meilisearch';
import MeiliSearch from 'meilisearch';
import { Types } from 'mongoose';

const DEFAULT_PFP = 'default';

const ALLOWED_TO_UPDATE_OTHER = [UserRole.ADMIN, UserRole.GOD];
const MONGO_ID_REGEX = /^[a-f0-9]{24}$/i;

@Injectable()
export class UsersService {
    private readonly logger = new Logger('User');

    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        @InjectMeiliSearch()
        private meiliSearch: MeiliSearch,

        private m: MeiliSearchService,
    ) {}

    async create(input: CreateUserInput) {
        const u = new this.userModel();

        //find the inviter
        const inviter = await this.userModel.findOne({
            inviteCodes: input.inviteCode,
        });
        if (!inviter)
            throw new UnauthorizedException('Invite code does not exist');

        //setup the new user
        u.displayName = u.username = input.username;
        u.email = input.email;
        u.pfp = DEFAULT_PFP;
        u.bio = '';
        u.role = UserRole.USER;
        u.invitedBy = inviter;
        u.inviteCodes = [];
        u.passwordHash = await hash(input.password);

        try {
            await u.save();
            await inviter.updateOne({
                $pull: { inviteCodes: input.inviteCode },
            });
        } catch (e) {
            this.logger.error({ msg: 'Error creating user', e });
            throw new InternalServerErrorException('Could not create user');
        }

        try {
            await this.m.addDocuments('users', [
                {
                    id: u.id,
                    username: u.username,
                    displayName: u.displayName,
                    pfp: u.pfp,
                    role: u.role,
                },
            ]);
        } catch (e) {
            console.error(`Update user index failed @ ${u.id}`);
        }

        return u;
    }

    async addInvite(uid: string) {
        const invite = uuid();
        await this.userModel.updateOne(
            { _id: uid },
            { $push: { inviteCodes: invite } },
        );
        return invite;
    }

    async updateOther(u: UpdateUserInput, as: UserRole) {
        if (!ALLOWED_TO_UPDATE_OTHER.includes(as))
            throw new ForbiddenException('You cannot update *other* users');

        if (!u.id) throw new BadRequestException('Id not provided');

        const them = await this.userModel.findById(u.id);

        if (!them) throw new BadRequestException('Invalid ID');

        if (ALLOWED_TO_UPDATE_OTHER.includes(them.role)) {
            if (them.role == as || them.role == UserRole.GOD)
                throw new ForbiddenException('You cannot update *this* user');
        }

        return await this.trustedUpate(u);
    }

    async updateSelf(u: UpdateUserInput, self: UserDocument) {
        u.id = self._id;
        if (u.password || u.email) {
            if (!u.oldPassword)
                throw new BadRequestException('Missing old password');
            if (!(await verify(self.passwordHash, u.oldPassword))) {
                throw new UnauthorizedException('Incorrect password');
            }
        }

        return await this.trustedUpate(u);
    }

    /**
     * Won't do any more checks
     */
    async trustedUpate(u: UpdateUserInput) {
        const user = await this.userModel.findById(u.id);
        if (!user) throw new NotFoundException('User does not exist');

        if (u.password) {
            user.passwordHash = await hash(u.password);
        }

        // set fields if present
        if (u.bio) user.bio = u.bio;
        if (u.email) user.email = u.email;
        if (u.displayName) user.displayName = u.displayName;

        await user.save();
        try {
            await this.m.updateDocuments('users', [
                {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    pfp: user.pfp,
                    role: user.role,
                },
            ]);
        } catch (e) {
            console.error(`Update user index failed @ ${user.id}`);
        }

        return user;
    }

    async findOne(idOrUsername: string) {
        const $or: FilterQuery<UserDocument>[] = [{ username: idOrUsername }];

        if (MONGO_ID_REGEX.test(idOrUsername)) $or.push({ _id: idOrUsername });

        return await this.userModel.findOne({ $or });
    }

    async findAll() {
        return await this.userModel.find();
    }

    async deleteAccount(id: string): Promise<{ deletedCount: number }> {
        return await this.userModel.deleteOne({ _id: id });
    }

    async setRole(userId: string, to: UserRole, as: UserRole) {
        if (roleCompare(as, to) <= 0)
            throw new ForbiddenException('You cannot give out this role');

        const u = await this.userModel.findById(userId);
        if (!u) throw new NotFoundException('User does not exist');

        if (roleCompare(as, u.role) <= 0)
            throw new ForbiddenException('You cannot manage this user');

        u.role = to;
        await u.save();
        return true;
    }

    static escapeRegex(string: string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    async createPfpToken(uid: string) {
        const token = uuid();

        await this.userModel.updateOne({ _id: uid }, { pfpToken: token });

        return token;
    }

    async followUser(as: string, target: string) {
        if (as == target)
            throw new BadRequestException('You cannot follow yourself');

        const [me, them] = await Promise.all([
            this.userModel.findById(as, { populate: false }),
            this.userModel.findById(target, { populate: false }),
        ]);

        if (!me || !them) throw new BadRequestException('Invalid UserID(s)');

        if (!me.following.includes(them)) {
            me.following.push(them);
            await me.save();
        }
        return true;
    }

    async unfollowUser(as: string, target: string) {
        await this.userModel.findByIdAndUpdate(as, {
            $pull: { following: new Types.ObjectId(target) },
        });
        return true;
    }

    async findFollowers(id: string) {
        return (
            (await this.userModel.find({
                following: new Types.ObjectId(id),
            })) ?? []
        );
    }

    async findInviter(id: string) {
        const AGR = await this.userModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'invitedBy',
                    foreignField: '_id',
                    as: 'i',
                },
            },
            {
                $project: { invitedBy: { $first: '$i' } },
            },
        ]);

        return AGR?.[0]?.invitedBy;
    }

    async findFollowing(id: string) {
        const f = await this.userModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'following',
                    foreignField: '_id',
                    as: 'following',
                },
            },
            { $project: { following: true } },
        ]);

        return f?.[0]?.following ?? [];
    }

    async rebuildSearch() {
        await this.meiliSearch.deleteIndexIfExists('users');
        const t = await this.meiliSearch.createIndex('users', {
            primaryKey: 'id',
        });

        await this.meiliSearch.waitForTask(t.taskUid);

        const data = await this.userModel.aggregate([
            {
                $project: {
                    _id: false,
                    id: '$_id',
                    username: true,
                    displayName: true,
                    pfp: true,
                    role: true,
                },
            },
        ]);

        const st = await this.meiliSearch
            .index('users')
            .updateDocuments(data, { primaryKey: 'id' });

        await this.meiliSearch.waitForTask(st.taskUid);
        return true;
    }

    async revokeInvite(inviteCode: string, uid?: string) {
        if (uid) {
            const { modifiedCount } = await this.userModel.updateOne(
                { _id: uid },
                {
                    $pull: { inviteCodes: inviteCode },
                },
            );
            if (modifiedCount == 0) throw new NotFoundException();
        } else {
            const { modifiedCount } = await this.userModel.updateMany(
                {},
                {
                    $pull: { inviteCodes: inviteCode },
                },
            );
            if (modifiedCount == 0) throw new NotFoundException();
        }
        return true;
    }
}
