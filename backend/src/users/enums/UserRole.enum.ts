import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
    GOD = 'GOD',
    ADMIN = 'ADMIN',
    MODERATOR = 'MODERATOR',
    /*
        I can't trust him, he's up to something
        He's up to something (He's up to something)
        I can't touch them if I don't love them
        If I don't love them
        Ooh, I became a */ LEGENDARY_MEMBER = 'LEGENDARY_MEMBER',
    USER = 'USER',
}

const ROLE_WEIGHT: Record<UserRole, number> = {
    [UserRole.GOD]: 1000,
    [UserRole.ADMIN]: 100,
    [UserRole.MODERATOR]: 50,
    [UserRole.LEGENDARY_MEMBER]: 10,
    [UserRole.USER]: 1,
};

export function roleCompare(a: UserRole, b: UserRole) {
    return ROLE_WEIGHT[a] - ROLE_WEIGHT[b];
}

registerEnumType(UserRole, { name: 'UserRole' });
