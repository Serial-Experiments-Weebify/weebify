import { registerEnumType } from '@nestjs/graphql';

export enum WeebifyVideoType {
    V0 = 'V0',
    V1 = 'V1',
}

registerEnumType(WeebifyVideoType, { name: 'WeebifyVideoType' });
