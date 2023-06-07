import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { verify } from 'argon2';
import { Model } from 'mongoose';
import { User, UserDocument, Session } from 'src/users/entities/user.entity';
import { LoginInput } from './dto/login.input';
import { JwtService } from '@nestjs/jwt';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import MeiliSearch from 'meilisearch';
import { HttpAdapterHost } from '@nestjs/core';
import { Application } from 'express';

// 30 days
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
    /**
     * Keeps track of which users sessions are currently being updated.
     */
    private updating = new Set<string>();

    constructor(
        @InjectModel('User')
        private userModel: Model<UserDocument>,

        @InjectModel('Session')
        private sessionModel: Model<Session>,

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

        const session = new this.sessionModel();
        const expiration = new Date(Date.now() + SESSION_DURATION);
        const key = await this.meiliSearch.createKey({
            name: `Search key for ${user.username}`,
            description: `Session: ${session._id}`,
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
            { uid: user.id, sid: session._id },
            { expiresIn: SESSION_DURATION },
        );

        return { user, jwt, expiration, searchKey: key.key };
    }

    async logoutSession(uid: string, sid: string) {
        const user = await this.userModel.findById(uid);
        if (!user) return;

        user.sessions = user.sessions.filter((s) => !s._id.equals(sid));

        await user.save();
    }

    async matchToken(
        token?: string,
    ): Promise<{ user: UserDocument | null; session: string | null }> {
        if (!token) return { user: null, session: null };

        const data = this.jwt.decode(token, { json: true }) as {
            uid: unknown;
            sid: unknown;
        };

        if (typeof data?.uid !== 'string' || typeof data?.sid !== 'string')
            return { user: null, session: null };

        const user = await this.userModel.findOne({
            _id: data.uid,
            sessions: { $elemMatch: { _id: data.sid } },
        });

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
                    'sessions._id': sid,
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
            sessions: { $elemMatch: { _id: sid } },
        });

        if (!userWithSession)
            throw new NotFoundException("User or session doesn't exist");

        //remove session at index 1
        const sessionIndex = userWithSession.sessions.findIndex((s) =>
            s._id.equals(sid),
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
