import { Module } from '@nestjs/common';
import { ManagementResolver } from './management.resolver';
import { ManagementService } from './management.service';
import { UsersModule } from 'src/users/users.module';
import { MediaModule } from 'src/media/media.module';
import { MongooseModule } from '@nestjs/mongoose';
import { APIKey, APIKeySchema } from './entities/APIKey.schema';

@Module({
    providers: [ManagementResolver, ManagementService],
    imports: [
        UsersModule,
        MediaModule,
        MongooseModule.forFeature([
            { name: APIKey.name, schema: APIKeySchema },
        ]),
    ],
})
export class ManagementModule {}
