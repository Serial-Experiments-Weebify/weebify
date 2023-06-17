import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { VideoService } from './video.service';
import { Video } from './dto/video.interface';
import { UseGuards } from '@nestjs/common';
import { AuthOnlyGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles/role.decorator';
import { UserRole } from 'src/users/enums/UserRole.enum';
import { AdminVideo } from './dto/adminVideo.out';
import { VideoStatus } from './enums/videoStatus.enum';

@UseGuards(AuthOnlyGuard)
@Resolver(() => Video)
export class VideoResolver {
    constructor(private readonly videoService: VideoService) {}

    @Roles(UserRole.GOD, UserRole.ADMIN)
    @Query(() => [AdminVideo])
    async videos(
        @Args('unlinkedOnly', { nullable: true, defaultValue: false })
        unlinkedOnly: boolean,
        @Args('status', {
            type: () => VideoStatus,
            nullable: true,
            defaultValue: null,
        })
        status: VideoStatus,
    ) {
        return await this.videoService.listVideos(unlinkedOnly, status);
    }

    @Roles(UserRole.GOD, UserRole.ADMIN)
    @Mutation(() => Boolean)
    async deleteVideo(@Args('vid') vid: string) {
        await this.videoService.deleteVideo(vid);
        return true;
    }
}
