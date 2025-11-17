import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { verify } from 'argon2';
import { Model } from 'mongoose';
import { User, UserDocument, Session } from 'src/users/entities/user.entity';
import { Types } from 'mongoose';
import { LoginInput } from './dto/login.input';
import { JwtService } from '@nestjs/jwt';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import { type MeiliSearch } from 'meilisearch';
import { HttpAdapterHost } from '@nestjs/core';
import { Application } from 'express';

// 30 days
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

type WeebfiyJWT = {
    uid: string | any;
    sid: string | any;
};

@Injectable()
export class AuthService {
    /**
     * Keeps track of which users sessions are currently being updated.
     */
    private updating = new Set<string>();

    constructor(
        @InjectModel('User')
        private userModel: Model<UserDocument>,

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        @InjectMeiliSearch()
        private meiliSearch: MeiliSearch,

        private jwt: JwtService,

        private adapterHost: HttpAdapterHost,
    ) {
        //! WARNING make sure to set up the proxy to overwrite X-Forwarded-For, X-Forwarded-Host, and X-Forwarded-Proto headers
        adapterHost.httpAdapter
            .getInstance<Application>()
            .set('trust proxy', true);
    }

    async loginSession(
        input: LoginInput,
        ip: string,
        agent: string,
    ): Promise<{
        user: User;
        searchKey: string;
        jwt: string;
        expiration: Date;
    }> {
        const user = await this.userModel.findOne({ username: input.username });

        if (!user) {
            throw new UnauthorizedException('Incorrect password or username.');
        }
        if (!(await verify(user.passwordHash, input.password))) {
            throw new UnauthorizedException('Incorrect password or username.');
        }

        const session = new Session();
        if (!session.id) {
            console.error('Session ID not set!!!');
            session.id = new Types.ObjectId();
        }
        const expiration = new Date(Date.now() + SESSION_DURATION);
        const key = await this.meiliSearch.createKey({
            name: `Search key for ${user.username}`,
            description: `Session: ${session.id}`,
            expiresAt: expiration,
            actions: ['search'],
            indexes: ['*'],
        });

        session.expiresAt = expiration;
        session.ipAddress = ip;
        session.userAgent = agent;
        session.lastAccessed = new Date();
        session.searchKey = key.key;

        user.sessions.push(session);
        await user.save();

        const jwt = this.jwt.sign(
            { uid: user.id, sid: session.id },
            { expiresIn: SESSION_DURATION / 1000 },
        );

        return { user, jwt, expiration, searchKey: key.key };
    }

    async logoutSession(uid: string, sid: string) {
        const user = await this.userModel.findById(uid);
        if (!user) return;

        user.sessions = user.sessions.filter((s) => !s.id.equals(sid));

        await user.save();
    }

    async matchToken(
        token?: string,
    ): Promise<{ user: UserDocument | null; session: string | null }> {
        if (!token) return { user: null, session: null };

        const data = await this.jwt.verifyAsync<WeebfiyJWT>(token);

        console.log('Matching token', { data });

        if (typeof data?.uid !== 'string' || typeof data?.sid !== 'string')
            return { user: null, session: null };

        const q = {
            _id: new Types.ObjectId(data.uid),
            sessions: { $elemMatch: { id: new Types.ObjectId(data.sid) } },
        };
        console.log(q);
        const user = await this.userModel.findOne(q);

        if (!user) {
            return { user: null, session: null };
        }

        return { user, session: data.sid };
    }

    async updateSession(uid: string, sid: string, ip: string, agent: string) {
        if (this.updating.has(sid)) return; // prevents multiple updates when 2 requests come in at the same time
        this.updating.add(sid);

        try {
            await this.userModel.findOneAndUpdate(
                {
                    _id: uid,
                    'sessions.id': sid,
                },
                {
                    'sessions.$.ipAddress': ip,
                    'sessions.$.userAgent': agent,
                    'sessions.$.lastAccessed': new Date(),
                },
            );
        } catch {
            console.log(`Failed to update session ${sid} for user ${uid}`);
        } finally {
            this.updating.delete(sid);
        }
    }

    async revokeSession(uid: string, sid: string) {
        const userWithSession = await this.userModel.findOne({
            _id: uid,
            sessions: { $elemMatch: { id: sid } },
        });

        if (!userWithSession)
            throw new NotFoundException("User or session doesn't exist");

        //remove session at index 1
        const sessionIndex = userWithSession.sessions.findIndex((s) =>
            s.id.equals(sid),
        );
        const session = userWithSession.sessions.splice(sessionIndex, 1)[0];

        try {
            await this.meiliSearch.deleteKey(session.searchKey);
        } catch {
            console.log(
                `Failed to delete search key ${session.searchKey} for session ${sid} for user ${uid}`,
            );
        }

        await userWithSession.save();
    }
}
