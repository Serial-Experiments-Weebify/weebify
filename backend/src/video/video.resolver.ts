import { Query, Resolver } from '@nestjs/graphql';
import { VideoService } from './video.service';
import { Video } from './dto/video.interface';
import { UseGuards } from '@nestjs/common';
import { AuthOnlyGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles/role.decorator';
import { UserRole } from 'src/users/enums/UserRole.enum';
import { AdminVideo } from './dto/adminVideo.out';

@UseGuards(AuthOnlyGuard)
@Resolver(() => Video)
export class VideoResolver {
    constructor(private readonly videoService: VideoService) {}

    @Roles(UserRole.GOD, UserRole.ADMIN)
    @Query(() => [AdminVideo])
    async videos() {
        return await this.videoService.listVideos();
    }
}
