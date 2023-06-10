import { registerEnumType } from '@nestjs/graphql';

export enum VideoStatus {
    Waiting = 'WAITING',
    OK = 'OK',
    Failed = 'FAILED',
}

registerEnumType(VideoStatus, { name: 'VideoStatus' });
